
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/utils/supabase';
import { resendVerificationEmail } from '@/utils/auth';
import { useTranslation } from 'react-i18next';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const email = params.email as string;
  const name = params.name as string;
  const flow = params.flow as 'create' | 'join';
  const familyId = params.familyId as string;

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  }, []);

  const handleCodeChange = (text: string, index: number) => {
    // Only allow numbers
    if (text && !/^\d+$/.test(text)) {
      return;
    }

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all digits are entered
    if (text && index === 5 && newCode.every(digit => digit !== '')) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (verificationCode?: string) => {
    const codeToVerify = verificationCode || code.join('');
    
    if (codeToVerify.length !== 6) {
      Alert.alert(t('common.error'), t('auth.verifyEmail.fillCompleteCode'));
      return;
    }

    setLoading(true);
    try {
      console.log('Verifying OTP code...');
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: codeToVerify,
        type: 'signup',
      });

      if (error) {
        console.error('Verification error:', error);
        
        // Provide more specific error messages
        if (error.message.includes('expired')) {
          Alert.alert(
            t('common.error'), 
            'De verificatiecode is verlopen. Vraag een nieuwe code aan.',
            [
              {
                text: 'Nieuwe code aanvragen',
                onPress: handleResendCode,
              },
              {
                text: 'Annuleren',
                style: 'cancel',
              },
            ]
          );
        } else if (error.message.includes('invalid') || error.message.includes('Token')) {
          Alert.alert(t('common.error'), 'De ingevoerde code is onjuist. Controleer de code en probeer het opnieuw.');
        } else {
          Alert.alert(t('common.error'), error.message || t('auth.verifyEmail.invalidCode'));
        }
        
        setLoading(false);
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        return;
      }

      if (data.session) {
        // Email verified successfully
        console.log('✅ Email verified successfully, redirecting...');
        setLoading(false);
        
        if (flow === 'create') {
          // Continue to create family flow - redirect to setup-family
          router.replace({
            pathname: '/(auth)/setup-family',
            params: { name, verified: 'true' },
          });
        } else if (flow === 'join') {
          // Continue to join family flow - redirect to complete-join
          router.replace({
            pathname: '/(auth)/complete-join',
            params: { name, familyId, verified: 'true' },
          });
        }
      } else {
        console.error('Verification succeeded but no session returned');
        Alert.alert(t('common.error'), 'Er ging iets mis bij de verificatie. Probeer het opnieuw.');
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      Alert.alert(t('common.error'), 'Er ging iets mis. Probeer het opnieuw.');
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    try {
      console.log('Resending verification code...');
      const result = await resendVerificationEmail(email);

      if (result.success) {
        Alert.alert(
          t('auth.verifyEmail.codeSent'), 
          'Een nieuwe verificatiecode is verstuurd naar je e-mailadres. Controleer ook je spam-map als je de e-mail niet ziet.'
        );
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        console.error('Resend failed:', result.error);
        
        // Show specific error message
        if (result.error && result.error.includes('e-mailprovider')) {
          Alert.alert(
            'E-mail probleem',
            result.error + '\n\nMogelijke oplossingen:\n\n1. Controleer je spam/ongewenste e-mail map\n2. Voeg noreply@mail.app.supabase.io toe aan je contacten\n3. Neem contact op met support@flowfam.nl voor hulp',
            [
              {
                text: 'Probeer opnieuw',
                onPress: handleResendCode,
              },
              {
                text: 'Contact opnemen',
                onPress: () => {
                  // You could open email client here
                  Alert.alert('Contact', 'Stuur een e-mail naar support@flowfam.nl');
                },
              },
              {
                text: 'Sluiten',
                style: 'cancel',
              },
            ]
          );
        } else {
          Alert.alert(t('common.error'), result.error || 'Kon geen nieuwe code versturen. Probeer het later opnieuw.');
        }
      }
    } catch (error: any) {
      console.error('Resend error:', error);
      Alert.alert(t('common.error'), 'Er ging iets mis. Probeer het later opnieuw.');
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <IconSymbol
          ios_icon_name="chevron.left"
          android_material_icon_name="arrow-back"
          size={24}
          color={colors.text}
        />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <IconSymbol
            ios_icon_name="envelope.fill"
            android_material_icon_name="email"
            size={60}
            color={colors.accent}
          />
        </View>

        <Text style={styles.title}>{t('auth.verifyEmail.title')}</Text>
        <Text style={styles.subtitle}>
          We hebben een 6-cijferige code verstuurd naar:{'\n'}
          <Text style={styles.email}>{email}</Text>
        </Text>

        <View style={styles.infoBox}>
          <IconSymbol
            ios_icon_name="info.circle.fill"
            android_material_icon_name="info"
            size={20}
            color={colors.accent}
          />
          <Text style={styles.infoText}>
            Controleer ook je spam/ongewenste e-mail map als je de code niet ziet.
          </Text>
        </View>

        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <React.Fragment key={index}>
              <TextInput
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={[
                  styles.codeInput,
                  digit && styles.codeInputFilled,
                ]}
                value={digit}
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                editable={!loading}
              />
            </React.Fragment>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton, (loading || code.some(digit => !digit)) && styles.buttonDisabled]}
          onPress={() => handleVerify()}
          disabled={loading || code.some(digit => !digit)}
        >
          {loading ? (
            <ActivityIndicator color={colors.card} />
          ) : (
            <Text style={styles.primaryButtonText}>{t('auth.verifyEmail.verify')}</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('auth.verifyEmail.noCodeReceived')}</Text>
          <TouchableOpacity
            onPress={handleResendCode}
            disabled={resending}
            style={styles.resendButton}
          >
            {resending ? (
              <ActivityIndicator size="small" color={colors.accent} />
            ) : (
              <Text style={[styles.footerLink, resending && styles.footerLinkDisabled]}>
                {t('auth.verifyEmail.resendCode')}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.helpContainer}>
          <Text style={styles.helpText}>
            Problemen met het ontvangen van de code?
          </Text>
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                'Hulp nodig?',
                'Mogelijke oplossingen:\n\n1. Controleer je spam/ongewenste e-mail map\n2. Voeg noreply@mail.app.supabase.io toe aan je contacten\n3. Wacht een paar minuten en probeer opnieuw\n4. Neem contact op met support@flowfam.nl',
                [
                  {
                    text: 'Contact opnemen',
                    onPress: () => {
                      Alert.alert('Contact', 'Stuur een e-mail naar support@flowfam.nl met je e-mailadres en een beschrijving van het probleem.');
                    },
                  },
                  {
                    text: 'Sluiten',
                    style: 'cancel',
                  },
                ]
              );
            }}
          >
            <Text style={styles.helpLink}>Klik hier voor hulp</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
    padding: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 60,
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.accent + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 15,
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 20,
    fontFamily: 'Nunito_400Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  email: {
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.accent + '10',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 30,
    width: '100%',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    fontFamily: 'Nunito_400Regular',
    lineHeight: 18,
  },
  codeContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 40,
  },
  codeInput: {
    width: 50,
    height: 60,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.textSecondary + '20',
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    fontFamily: 'Poppins_700Bold',
  },
  codeInputFilled: {
    borderColor: colors.accent,
    backgroundColor: colors.accent + '10',
  },
  button: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
  },
  primaryButton: {
    backgroundColor: colors.accent,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.card,
    fontFamily: 'Poppins_600SemiBold',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
    gap: 10,
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  resendButton: {
    minHeight: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerLink: {
    fontSize: 14,
    color: colors.accent,
    fontFamily: 'Poppins_600SemiBold',
    textDecorationLine: 'underline',
  },
  footerLinkDisabled: {
    opacity: 0.5,
  },
  helpContainer: {
    marginTop: 30,
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  helpText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
    textAlign: 'center',
  },
  helpLink: {
    fontSize: 13,
    color: colors.accent,
    fontFamily: 'Poppins_600SemiBold',
    textDecorationLine: 'underline',
  },
});

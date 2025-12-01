
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/utils/supabase';

export default function VerifyEmailScreen() {
  const router = useRouter();
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
      Alert.alert('Fout', 'Vul de volledige 6-cijferige code in');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: codeToVerify,
        type: 'signup',
      });

      if (error) {
        console.error('Verification error:', error);
        Alert.alert('Fout', 'Ongeldige verificatiecode. Probeer het opnieuw.');
        setLoading(false);
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        return;
      }

      if (data.session) {
        // Email verified successfully
        setLoading(false);
        
        if (flow === 'create') {
          // Continue to create family flow
          router.replace({
            pathname: '/(auth)/setup-family',
            params: { name, verified: 'true' },
          });
        } else if (flow === 'join') {
          // Continue to join family flow
          router.replace({
            pathname: '/(auth)/complete-join',
            params: { name, familyId, verified: 'true' },
          });
        }
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      Alert.alert('Fout', 'Er ging iets mis bij het verifiëren. Probeer het opnieuw.');
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: 'https://natively.dev/email-confirmed',
        },
      });

      if (error) {
        console.error('Resend error:', error);
        Alert.alert('Fout', 'Kon geen nieuwe code versturen. Probeer het later opnieuw.');
      } else {
        Alert.alert('Verstuurd!', 'We hebben een nieuwe verificatiecode naar je e-mail gestuurd.');
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error: any) {
      console.error('Resend error:', error);
      Alert.alert('Fout', 'Er ging iets mis. Probeer het later opnieuw.');
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

        <Text style={styles.title}>Verifieer je e-mail</Text>
        <Text style={styles.subtitle}>
          We hebben een 6-cijferige verificatiecode gestuurd naar{'\n'}
          <Text style={styles.email}>{email}</Text>
        </Text>

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
            <Text style={styles.primaryButtonText}>Verifiëren</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Geen code ontvangen?</Text>
          <TouchableOpacity
            onPress={handleResendCode}
            disabled={resending}
          >
            <Text style={[styles.footerLink, resending && styles.footerLinkDisabled]}>
              {resending ? 'Versturen...' : 'Code opnieuw versturen'}
            </Text>
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
    marginBottom: 40,
    fontFamily: 'Nunito_400Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  email: {
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
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
  footerLink: {
    fontSize: 14,
    color: colors.accent,
    fontFamily: 'Poppins_600SemiBold',
    textDecorationLine: 'underline',
  },
  footerLinkDisabled: {
    opacity: 0.5,
  },
});

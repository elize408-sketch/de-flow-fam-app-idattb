
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/utils/supabase';
import { resendVerificationEmail, getCurrentSession } from '@/utils/auth';
import { useTranslation } from 'react-i18next';
import { userHasFamily } from '@/utils/familyService';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const email = params.email as string;
  const name = params.name as string;
  const flow = params.flow as 'create' | 'join';
  const familyId = params.familyId as string;

  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    // Set up auth state listener to detect when email is confirmed
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      if (event === 'SIGNED_IN' && session) {
        console.log('✅ User signed in after email confirmation');
        await handleEmailConfirmed(session.user.id);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [flow, familyId, name]);

  const handleEmailConfirmed = async (userId: string) => {
    console.log('=== handleEmailConfirmed START ===');
    console.log('User ID:', userId);
    console.log('Flow:', flow);
    
    try {
      if (flow === 'create') {
        // User is creating a new family - redirect to setup-family
        console.log('Redirecting to setup-family...');
        router.replace({
          pathname: '/(auth)/setup-family',
          params: { name, verified: 'true' },
        });
      } else if (flow === 'join') {
        // User is joining an existing family - redirect to complete-join
        console.log('Redirecting to complete-join...');
        router.replace({
          pathname: '/(auth)/complete-join',
          params: { name, familyId, verified: 'true' },
        });
      } else {
        // No specific flow - check if user has family
        console.log('No specific flow - checking family status...');
        const hasFamily = await userHasFamily(userId);
        
        if (hasFamily) {
          console.log('User has family - redirecting to home...');
          router.replace('/(tabs)/(home)');
        } else {
          console.log('User has no family - redirecting to setup-family...');
          router.replace('/(auth)/setup-family');
        }
      }
    } catch (error) {
      console.error('Error handling email confirmation:', error);
      Alert.alert(t('common.error'), 'Er ging iets mis. Probeer opnieuw in te loggen.');
      router.replace('/(auth)/welcome');
    }
    
    console.log('=== handleEmailConfirmed END ===');
  };

  const handleCheckVerification = async () => {
    setChecking(true);
    try {
      console.log('Checking if email is verified...');
      
      // Get current session
      const session = await getCurrentSession();
      
      if (session && session.user) {
        console.log('✅ Session found - email is verified');
        await handleEmailConfirmed(session.user.id);
      } else {
        console.log('❌ No session found - email not verified yet');
        Alert.alert(
          'E-mail nog niet bevestigd',
          'Je e-mail is nog niet bevestigd. Klik op de link in de e-mail die we je hebben gestuurd.\n\nControleer ook je spam-map als je de e-mail niet ziet.',
          [
            {
              text: 'Nieuwe e-mail versturen',
              onPress: handleResendEmail,
            },
            {
              text: 'OK',
              style: 'cancel',
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('Check verification error:', error);
      Alert.alert(t('common.error'), 'Er ging iets mis. Probeer het opnieuw.');
    } finally {
      setChecking(false);
    }
  };

  const handleResendEmail = async () => {
    setResending(true);
    try {
      console.log('Resending verification email...');
      const result = await resendVerificationEmail(email);

      if (result.success) {
        Alert.alert(
          'E-mail verstuurd', 
          'Een nieuwe bevestigingsmail is verstuurd naar je e-mailadres. Controleer ook je spam-map als je de e-mail niet ziet.'
        );
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
                onPress: handleResendEmail,
              },
              {
                text: 'Contact opnemen',
                onPress: () => {
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
          Alert.alert(t('common.error'), result.error || 'Kon geen nieuwe e-mail versturen. Probeer het later opnieuw.');
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

        <Text style={styles.title}>Bevestig je e-mailadres</Text>
        <Text style={styles.subtitle}>
          We hebben een bevestigingsmail gestuurd naar:{'\n'}
          <Text style={styles.email}>{email}</Text>
        </Text>

        <View style={styles.instructionsBox}>
          <View style={styles.instructionStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.instructionText}>
              Open je e-mail inbox en zoek naar de bevestigingsmail van Flow Fam
            </Text>
          </View>

          <View style={styles.instructionStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.instructionText}>
              Klik op de bevestigingslink in de e-mail
            </Text>
          </View>

          <View style={styles.instructionStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.instructionText}>
              Je wordt automatisch doorgestuurd naar de app
            </Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <IconSymbol
            ios_icon_name="info.circle.fill"
            android_material_icon_name="info"
            size={20}
            color={colors.accent}
          />
          <Text style={styles.infoText}>
            Controleer ook je spam/ongewenste e-mail map als je de e-mail niet ziet.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton, checking && styles.buttonDisabled]}
          onPress={handleCheckVerification}
          disabled={checking}
        >
          {checking ? (
            <ActivityIndicator color={colors.card} />
          ) : (
            <React.Fragment>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={20}
                color={colors.card}
              />
              <Text style={styles.primaryButtonText}>Ik heb mijn e-mail bevestigd</Text>
            </React.Fragment>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Geen e-mail ontvangen?</Text>
          <TouchableOpacity
            onPress={handleResendEmail}
            disabled={resending}
            style={styles.resendButton}
          >
            {resending ? (
              <ActivityIndicator size="small" color={colors.accent} />
            ) : (
              <Text style={[styles.footerLink, resending && styles.footerLinkDisabled]}>
                Verstuur opnieuw
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.helpContainer}>
          <Text style={styles.helpText}>
            Problemen met het ontvangen van de e-mail?
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
    marginBottom: 30,
    fontFamily: 'Nunito_400Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  email: {
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
  },
  instructionsBox: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    gap: 16,
    boxShadow: `0px 2px 8px ${colors.shadow}`,
    elevation: 2,
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.card,
    fontFamily: 'Poppins_700Bold',
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    fontFamily: 'Nunito_400Regular',
    lineHeight: 20,
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

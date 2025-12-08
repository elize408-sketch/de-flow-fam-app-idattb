
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { signInWithEmail, signInWithApple, signInWithGoogle } from '@/utils/auth';
import { userHasFamily } from '@/utils/familyService';
import { useTranslation } from 'react-i18next';

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [step, setStep] = useState<'auth' | 'email'>('auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSuccess = async (userId: string) => {
    console.log('=== handleLoginSuccess START ===');
    console.log('User ID:', userId);
    console.log('Timestamp:', new Date().toISOString());
    
    try {
      // Check if user has a family
      console.log('[1/3] Checking if user has family...');
      const hasFamily = await userHasFamily(userId);
      console.log('[2/3] userHasFamily result:', hasFamily);
      
      if (!hasFamily) {
        console.log('[3/3] User has NO family - redirecting to setup-family');
        console.log('Navigation target: /(auth)/setup-family');
        
        // Clear loading state BEFORE navigation
        setLoading(false);
        
        // Use setTimeout to ensure state is cleared before navigation
        setTimeout(() => {
          console.log('Executing navigation to setup-family...');
          router.replace('/(auth)/setup-family');
          console.log('Navigation command sent');
        }, 100);
        
        return;
      }

      // User has family - navigate to home
      console.log('[3/3] User HAS family - redirecting to home');
      console.log('Navigation target: /(tabs)/(home)');
      
      // Clear loading state BEFORE navigation
      setLoading(false);
      
      // Use setTimeout to ensure state is cleared before navigation
      setTimeout(() => {
        console.log('Executing navigation to home...');
        router.replace('/(tabs)/(home)');
        console.log('Navigation command sent');
      }, 100);
      
    } catch (error) {
      console.error('=== handleLoginSuccess ERROR ===');
      console.error('Error details:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      // Always clear loading state on error
      setLoading(false);
      
      Alert.alert(
        t('common.error'), 
        'Er ging iets mis bij het controleren van je gezin. Probeer het opnieuw.'
      );
    } finally {
      console.log('=== handleLoginSuccess END ===');
      console.log('Loading state should be false now');
    }
  };

  const handleAppleSignIn = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert(t('auth.login.appleNotAvailable'), t('auth.login.appleOnlyIOS'));
      return;
    }

    console.log('=== Apple Sign-In START ===');
    setLoading(true);
    console.log('Loading state set to TRUE');
    
    try {
      console.log('[1/4] Calling signInWithApple...');
      const result = await signInWithApple();
      console.log('[2/4] Apple sign-in result:', { success: result.success, hasUser: !!result.user, hasError: !!result.error });
      
      if (!result.success) {
        console.error('[3/4] Apple sign-in FAILED:', result.error);
        Alert.alert(t('common.error'), result.error || 'Er ging iets mis bij het inloggen');
        setLoading(false);
        console.log('Loading state set to FALSE (error)');
        return;
      }

      if (!result.user || !result.user.id) {
        console.error('[3/4] Apple sign-in succeeded but NO USER returned');
        Alert.alert(t('common.error'), 'Er ging iets mis bij het inloggen');
        setLoading(false);
        console.log('Loading state set to FALSE (no user)');
        return;
      }

      console.log('[3/4] Apple sign-in successful, user ID:', result.user.id);
      console.log('[4/4] Calling handleLoginSuccess...');
      await handleLoginSuccess(result.user.id);
      
    } catch (error: any) {
      console.error('=== Apple Sign-In ERROR ===');
      console.error('Error:', error);
      setLoading(false);
      console.log('Loading state set to FALSE (exception)');
      Alert.alert(t('common.error'), 'Er ging iets mis bij het inloggen met Apple');
    }
  };

  const handleGoogleSignIn = async () => {
    console.log('=== Google Sign-In START ===');
    setLoading(true);
    console.log('Loading state set to TRUE');
    
    try {
      console.log('[1/4] Calling signInWithGoogle...');
      const result = await signInWithGoogle();
      console.log('[2/4] Google sign-in result:', { success: result.success, hasUser: !!result.user, hasError: !!result.error });
      
      if (!result.success) {
        console.error('[3/4] Google sign-in FAILED:', result.error);
        Alert.alert(t('common.error'), result.error || 'Er ging iets mis bij het inloggen');
        setLoading(false);
        console.log('Loading state set to FALSE (error)');
        return;
      }

      if (!result.user || !result.user.id) {
        console.error('[3/4] Google sign-in succeeded but NO USER returned');
        Alert.alert(t('common.error'), 'Er ging iets mis bij het inloggen');
        setLoading(false);
        console.log('Loading state set to FALSE (no user)');
        return;
      }

      console.log('[3/4] Google sign-in successful, user ID:', result.user.id);
      console.log('[4/4] Calling handleLoginSuccess...');
      await handleLoginSuccess(result.user.id);
      
    } catch (error: any) {
      console.error('=== Google Sign-In ERROR ===');
      console.error('Error:', error);
      setLoading(false);
      console.log('Loading state set to FALSE (exception)');
      Alert.alert(t('common.error'), 'Er ging iets mis bij het inloggen met Google');
    }
  };

  const handleEmailSignIn = async () => {
    if (!email.trim()) {
      Alert.alert(t('common.error'), t('auth.login.fillEmail'));
      return;
    }
    if (!password.trim()) {
      Alert.alert(t('common.error'), t('auth.login.fillPassword'));
      return;
    }

    console.log('=== Email Sign-In START ===');
    console.log('Email:', email);
    setLoading(true);
    console.log('Loading state set to TRUE');
    
    try {
      console.log('[1/5] Calling signInWithEmail...');
      const result = await signInWithEmail(email, password);
      console.log('[2/5] Email sign-in result:', { 
        success: result.success, 
        hasUser: !!result.user, 
        hasSession: !!result.session,
        hasError: !!result.error,
        requiresVerification: result.requiresVerification 
      });
      
      if (!result.success) {
        console.error('[3/5] Email sign-in FAILED:', result.error);
        
        // Check if email verification is required
        if (result.requiresVerification) {
          console.log('[3/5] Email verification required');
          Alert.alert(
            'E-mail niet bevestigd',
            'Je e-mailadres is nog niet bevestigd. Controleer je inbox voor de bevestigingsmail.\n\nAls je de e-mail niet hebt ontvangen, neem dan contact op met support@flowfam.nl.',
            [
              {
                text: 'Contact opnemen',
                onPress: () => {
                  Alert.alert(
                    'Contact Support',
                    'Stuur een e-mail naar support@flowfam.nl met je e-mailadres (' + email + ') en we helpen je verder!'
                  );
                },
              },
              {
                text: 'Sluiten',
                style: 'cancel',
              },
            ]
          );
        } else {
          Alert.alert(t('common.error'), result.error || 'Er ging iets mis bij het inloggen');
        }
        
        setLoading(false);
        console.log('Loading state set to FALSE (error)');
        return;
      }

      // Check if we have user and session
      if (!result.user || !result.user.id) {
        console.error('[3/5] Sign-in succeeded but NO USER returned');
        Alert.alert(t('common.error'), 'Er ging iets mis bij het inloggen. Probeer het opnieuw.');
        setLoading(false);
        console.log('Loading state set to FALSE (no user)');
        return;
      }

      if (!result.session) {
        console.error('[4/5] Sign-in succeeded but NO SESSION returned');
        Alert.alert(t('common.error'), 'Er ging iets mis bij het inloggen. Probeer het opnieuw.');
        setLoading(false);
        console.log('Loading state set to FALSE (no session)');
        return;
      }

      console.log('[3/5] Email sign-in successful, user ID:', result.user.id);
      console.log('[4/5] Session exists:', !!result.session);
      console.log('[5/5] Calling handleLoginSuccess...');
      await handleLoginSuccess(result.user.id);
      
    } catch (error: any) {
      console.error('=== Email Sign-In ERROR ===');
      console.error('Error:', error);
      setLoading(false);
      console.log('Loading state set to FALSE (exception)');
      Alert.alert(t('common.error'), 'Er ging iets mis bij het inloggen. Probeer het opnieuw.');
    }
  };

  if (step === 'email') {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (!loading) {
              console.log('Back button pressed - returning to auth selection');
              setStep('auth');
            } else {
              console.log('Back button pressed but loading is true - ignoring');
            }
          }}
          disabled={loading}
        >
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow-back"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title}>{t('auth.login.withEmail')}</Text>
          <Text style={styles.subtitle}>{t('auth.login.fillDetails')}</Text>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('common.email')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('auth.login.emailPlaceholder')}
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('common.password')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('auth.login.passwordPlaceholder')}
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, styles.orangeButton, loading && styles.buttonDisabled]}
              onPress={handleEmailSignIn}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={colors.card} />
              ) : (
                <Text style={styles.orangeButtonText}>{t('common.login')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          if (!loading) {
            console.log('Back button pressed - going back');
            router.back();
          } else {
            console.log('Back button pressed but loading is true - ignoring');
          }
        }}
        disabled={loading}
      >
        <IconSymbol
          ios_icon_name="chevron.left"
          android_material_icon_name="arrow-back"
          size={24}
          color={colors.text}
        />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>{t('auth.login.title')}</Text>
        <Text style={styles.subtitle}>{t('auth.login.subtitle')}</Text>

        <View style={styles.authButtons}>
          {Platform.OS === 'ios' && (
            <TouchableOpacity
              style={[styles.button, styles.orangeButton, loading && styles.buttonDisabled]}
              onPress={handleAppleSignIn}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={colors.card} />
              ) : (
                <React.Fragment>
                  <IconSymbol
                    ios_icon_name="apple.logo"
                    android_material_icon_name="apple"
                    size={20}
                    color={colors.card}
                  />
                  <Text style={styles.orangeButtonText}>{t('auth.login.withApple')}</Text>
                </React.Fragment>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, styles.orangeButton, loading && styles.buttonDisabled]}
            onPress={handleGoogleSignIn}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.card} />
            ) : (
              <React.Fragment>
                <IconSymbol
                  ios_icon_name="globe"
                  android_material_icon_name="language"
                  size={20}
                  color={colors.card}
                />
                <Text style={styles.orangeButtonText}>{t('auth.login.withGoogle')}</Text>
              </React.Fragment>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.orangeButton, loading && styles.buttonDisabled]}
            onPress={() => {
              console.log('Email login button pressed');
              setStep('email');
            }}
            disabled={loading}
            activeOpacity={0.8}
          >
            <IconSymbol
              ios_icon_name="envelope.fill"
              android_material_icon_name="email"
              size={20}
              color={colors.card}
            />
            <Text style={styles.orangeButtonText}>{t('auth.login.withEmail')}</Text>
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
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
    fontFamily: 'Poppins_700Bold',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 40,
    fontFamily: 'Nunito_400Regular',
  },
  authButtons: {
    gap: 15,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
    boxShadow: '0px 4px 12px rgba(245, 166, 35, 0.25)',
    elevation: 4,
  },
  orangeButton: {
    backgroundColor: colors.vibrantOrange,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  orangeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.card,
    fontFamily: 'Poppins_600SemiBold',
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    fontFamily: 'Nunito_400Regular',
    borderWidth: 1,
    borderColor: colors.textSecondary + '20',
  },
});

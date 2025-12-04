
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { signUpWithEmail, signInWithEmail, signInWithApple, signInWithGoogle } from '@/utils/auth';
import { joinFamily, addFamilyMember } from '@/utils/familyService';
import { useTranslation } from 'react-i18next';

export default function JoinFamilyScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [step, setStep] = useState<'code' | 'auth' | 'email-signup' | 'email-signin'>('code');
  const [familyCode, setFamilyCode] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [familyId, setFamilyId] = useState<string | null>(null);

  const handleCodeSubmit = async () => {
    if (!familyCode.trim()) {
      Alert.alert(t('common.error'), 'Vul de gezinscode in');
      return;
    }
    if (!name.trim()) {
      Alert.alert(t('common.error'), 'Vul je naam in');
      return;
    }

    setLoading(true);
    try {
      const result = await joinFamily(familyCode);
      
      if (!result.success || !result.family) {
        Alert.alert(t('common.error'), result.error || t('auth.joinFamily.invalidCode'));
        setLoading(false);
        return;
      }

      setFamilyId(result.family.id);
      setLoading(false);
      setStep('auth');
    } catch (error: any) {
      console.error('Join family error:', error);
      Alert.alert(t('common.error'), 'Er ging iets mis bij het valideren van de code');
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert(t('auth.login.appleNotAvailable'), t('auth.login.appleOnlyIOS'));
      return;
    }

    setLoading(true);
    try {
      const result = await signInWithApple();
      
      if (!result.success) {
        Alert.alert(t('common.error'), result.error || 'Er ging iets mis bij het inloggen');
        setLoading(false);
        return;
      }

      await addToFamilyAndNavigate(result.user.id);
    } catch (error: any) {
      console.error('Apple sign in error:', error);
      Alert.alert(t('common.error'), 'Er ging iets mis bij het inloggen met Apple');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      
      if (!result.success) {
        Alert.alert(t('common.error'), result.error || 'Er ging iets mis bij het inloggen');
        setLoading(false);
        return;
      }

      await addToFamilyAndNavigate(result.user.id);
    } catch (error: any) {
      console.error('Google sign in error:', error);
      Alert.alert(t('common.error'), 'Er ging iets mis bij het inloggen met Google');
      setLoading(false);
    }
  };

  const handleEmailSignUp = async () => {
    if (!email.trim()) {
      Alert.alert(t('common.error'), 'Vul je e-mailadres in');
      return;
    }
    if (!password.trim() || password.length < 6) {
      Alert.alert(t('common.error'), t('auth.createFamily.passwordMinLength'));
      return;
    }

    setLoading(true);
    try {
      const result = await signUpWithEmail(email, password, name);
      
      if (!result.success) {
        Alert.alert(t('common.error'), result.error || 'Er ging iets mis bij het aanmelden');
        setLoading(false);
        return;
      }

      // Check if email verification is required
      if (result.requiresVerification) {
        // Email confirmation required - redirect to verification
        setLoading(false);
        router.push({
          pathname: '/(auth)/verify-email',
          params: { email, name, flow: 'join', familyId },
        });
        return;
      }

      // User is authenticated (auto-confirm is enabled in Supabase)
      if (result.user) {
        console.log('User authenticated, joining family...');
        await addToFamilyAndNavigate(result.user.id);
      }
    } catch (error: any) {
      console.error('Email sign up error:', error);
      Alert.alert(t('common.error'), 'Er ging iets mis bij het aanmelden');
      setLoading(false);
    }
  };

  const handleEmailSignIn = async () => {
    if (!email.trim()) {
      Alert.alert(t('common.error'), 'Vul je e-mailadres in');
      return;
    }
    if (!password.trim()) {
      Alert.alert(t('common.error'), 'Vul je wachtwoord in');
      return;
    }

    setLoading(true);
    try {
      const result = await signInWithEmail(email, password);
      
      if (!result.success) {
        Alert.alert(t('common.error'), result.error || 'Er ging iets mis bij het inloggen');
        setLoading(false);
        return;
      }

      await addToFamilyAndNavigate(result.user.id);
    } catch (error: any) {
      console.error('Email sign in error:', error);
      Alert.alert(t('common.error'), 'Er ging iets mis bij het inloggen');
      setLoading(false);
    }
  };

  const addToFamilyAndNavigate = async (userId: string) => {
    if (!familyId) {
      Alert.alert(t('common.error'), 'Geen gezin geselecteerd');
      setLoading(false);
      return;
    }

    try {
      // Add user as parent (always parent role - second parent joining)
      const memberResult = await addFamilyMember(
        familyId,
        userId,
        name,
        'parent',
        colors.accent
      );

      if (!memberResult.success) {
        Alert.alert(t('common.error'), memberResult.error || 'Kon je niet toevoegen aan het gezin');
        setLoading(false);
        return;
      }

      setLoading(false);
      
      Alert.alert(
        t('auth.joinFamily.welcome'),
        t('auth.joinFamily.welcomeMessage'),
        [
          {
            text: t('common.ok'),
            onPress: () => {
              router.replace('/(tabs)/(home)');
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Add to family error:', error);
      Alert.alert(t('common.error'), 'Er ging iets mis bij het toevoegen aan het gezin');
      setLoading(false);
    }
  };

  if (step === 'code') {
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
          <Text style={styles.title}>{t('auth.joinFamily.title')}</Text>
          <Text style={styles.subtitle}>{t('auth.joinFamily.subtitle')}</Text>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Gezinscode</Text>
              <TextInput
                style={[styles.input, styles.codeInput]}
                placeholder={t('auth.joinFamily.familyCodePlaceholder')}
                placeholderTextColor={colors.textSecondary}
                value={familyCode}
                onChangeText={(text) => setFamilyCode(text.toUpperCase())}
                autoCapitalize="characters"
                maxLength={6}
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('common.name')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('auth.joinFamily.namePlaceholder')}
                placeholderTextColor={colors.textSecondary}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleCodeSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.card} />
              ) : (
                <Text style={styles.primaryButtonText}>{t('auth.joinFamily.continue')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (step === 'email-signup') {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setStep('auth')}
        >
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow-back"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title}>{t('auth.joinFamily.registerWithEmail')}</Text>
          <Text style={styles.subtitle}>{t('auth.joinFamily.createNewAccount')}</Text>

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
                placeholder="Minimaal 6 tekens"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleEmailSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.card} />
              ) : (
                <Text style={styles.primaryButtonText}>{t('common.register')}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => setStep('email-signin')}
            >
              <Text style={styles.switchButtonText}>
                {t('auth.joinFamily.haveAccount')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (step === 'email-signin') {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setStep('auth')}
        >
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow-back"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title}>{t('auth.joinFamily.loginWithEmail')}</Text>
          <Text style={styles.subtitle}>{t('auth.joinFamily.loginExistingAccount')}</Text>

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
              style={[styles.button, styles.primaryButton]}
              onPress={handleEmailSignIn}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.card} />
              ) : (
                <Text style={styles.primaryButtonText}>{t('common.login')}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => setStep('email-signup')}
            >
              <Text style={styles.switchButtonText}>
                {t('auth.joinFamily.noAccount')}
              </Text>
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
        onPress={() => setStep('code')}
      >
        <IconSymbol
          ios_icon_name="chevron.left"
          android_material_icon_name="arrow-back"
          size={24}
          color={colors.text}
        />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>{t('common.login')}</Text>
        <Text style={styles.subtitle}>{t('auth.createFamily.subtitle')}</Text>

        <View style={styles.authButtons}>
          {Platform.OS === 'ios' && (
            <TouchableOpacity
              style={[styles.button, styles.appleButton]}
              onPress={handleAppleSignIn}
              disabled={loading}
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
                  <Text style={styles.appleButtonText}>{t('auth.login.withApple')}</Text>
                </React.Fragment>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, styles.googleButton]}
            onPress={handleGoogleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <React.Fragment>
                <Text style={styles.googleIcon}>G</Text>
                <Text style={styles.googleButtonText}>{t('auth.login.withGoogle')}</Text>
              </React.Fragment>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.emailButton]}
            onPress={() => setStep('email-signup')}
            disabled={loading}
          >
            <IconSymbol
              ios_icon_name="envelope.fill"
              android_material_icon_name="email"
              size={20}
              color={colors.card}
            />
            <Text style={styles.emailButtonText}>{t('auth.createFamily.registerWithEmail')}</Text>
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
  codeInput: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 4,
    fontFamily: 'Poppins_700Bold',
  },
  authButtons: {
    gap: 15,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    marginTop: 10,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.card,
    fontFamily: 'Poppins_600SemiBold',
  },
  appleButton: {
    backgroundColor: '#000',
  },
  appleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.card,
    fontFamily: 'Poppins_600SemiBold',
  },
  googleButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.textSecondary + '40',
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4285F4',
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
  },
  emailButton: {
    backgroundColor: colors.accent,
  },
  emailButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.card,
    fontFamily: 'Poppins_600SemiBold',
  },
  switchButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  switchButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
    textDecorationLine: 'underline',
  },
});

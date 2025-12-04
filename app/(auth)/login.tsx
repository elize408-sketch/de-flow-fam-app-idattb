
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
    try {
      console.log('Login successful, checking family membership...');
      
      // Check if user has a family
      const hasFamily = await userHasFamily(userId);
      console.log('User has family:', hasFamily);
      
      if (!hasFamily) {
        Alert.alert(
          t('auth.login.noFamilyFound'),
          t('auth.login.noFamilyMessage'),
          [
            {
              text: t('common.ok'),
              onPress: () => {
                setLoading(false);
                router.replace('/(auth)/welcome');
              },
            },
          ]
        );
        return;
      }

      // Navigate to home
      console.log('Navigating to home...');
      setLoading(false);
      router.replace('/(tabs)/(home)');
    } catch (error) {
      console.error('Login success handler error:', error);
      Alert.alert(t('common.error'), 'Er ging iets mis bij het inloggen');
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

      await handleLoginSuccess(result.user.id);
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

      await handleLoginSuccess(result.user.id);
    } catch (error: any) {
      console.error('Google sign in error:', error);
      Alert.alert(t('common.error'), 'Er ging iets mis bij het inloggen met Google');
      setLoading(false);
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

    setLoading(true);
    try {
      console.log('Starting email sign-in...');
      const result = await signInWithEmail(email, password);
      
      if (!result.success) {
        Alert.alert(t('common.error'), result.error || 'Er ging iets mis bij het inloggen');
        setLoading(false);
        return;
      }

      console.log('Email sign-in successful');
      await handleLoginSuccess(result.user.id);
    } catch (error: any) {
      console.error('Email sign in error:', error);
      Alert.alert(t('common.error'), 'Er ging iets mis bij het inloggen');
      setLoading(false);
    }
  };

  if (step === 'email') {
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
              style={[styles.button, styles.orangeButton]}
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
        <Text style={styles.title}>{t('auth.login.title')}</Text>
        <Text style={styles.subtitle}>{t('auth.login.subtitle')}</Text>

        <View style={styles.authButtons}>
          {Platform.OS === 'ios' && (
            <TouchableOpacity
              style={[styles.button, styles.orangeButton]}
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
            style={[styles.button, styles.orangeButton]}
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
            style={[styles.button, styles.orangeButton]}
            onPress={() => setStep('email')}
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

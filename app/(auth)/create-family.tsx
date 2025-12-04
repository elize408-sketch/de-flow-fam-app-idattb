
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { signUpWithEmail, signInWithApple, signInWithGoogle } from '@/utils/auth';
import { createFamily, addFamilyMember } from '@/utils/familyService';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/utils/supabase';

export default function CreateFamilyScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [step, setStep] = useState<'auth' | 'email'>('auth');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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

      // Create family and add user as parent (always parent role)
      await createFamilyAndNavigate(result.user.id, result.user.user_metadata?.full_name || 'Ouder');
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

      // Create family and add user as parent (always parent role)
      await createFamilyAndNavigate(result.user.id, result.user.user_metadata?.name || 'Ouder');
    } catch (error: any) {
      console.error('Google sign in error:', error);
      Alert.alert(t('common.error'), 'Er ging iets mis bij het inloggen met Google');
      setLoading(false);
    }
  };

  const handleEmailSignUp = async () => {
    if (!name.trim()) {
      Alert.alert(t('common.error'), 'Vul je naam in');
      return;
    }
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
      console.log('Starting email signup...');
      const result = await signUpWithEmail(email, password, name);
      
      if (!result.success) {
        console.error('Signup failed:', result.error);
        
        // Check if it's an email sending error
        if (result.error && (result.error.includes('bevestigingsmail') || result.error.includes('server'))) {
          // Email sending failed - offer workaround
          Alert.alert(
            'E-mail probleem',
            result.error + '\n\nWil je doorgaan zonder e-mailbevestiging? (Tijdelijke oplossing)',
            [
              {
                text: 'Annuleren',
                style: 'cancel',
                onPress: () => setLoading(false),
              },
              {
                text: 'Doorgaan',
                onPress: async () => {
                  // Try to sign in directly (in case auto-confirm is enabled)
                  console.log('Attempting direct sign-in...');
                  const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                  });
                  
                  if (!error && data.session) {
                    console.log('Direct sign-in successful');
                    await createFamilyAndNavigate(data.user.id, name);
                  } else {
                    console.error('Direct sign-in failed:', error);
                    Alert.alert(
                      t('common.error'),
                      'Kon niet inloggen. Neem contact op met support@flowfam.nl voor hulp.'
                    );
                    setLoading(false);
                  }
                },
              },
            ]
          );
          return;
        }
        
        Alert.alert(t('common.error'), result.error || 'Er ging iets mis bij het aanmelden');
        setLoading(false);
        return;
      }

      console.log('Sign up result:', { 
        hasUser: !!result.user, 
        hasSession: !!result.session, 
        requiresVerification: result.requiresVerification 
      });

      // Check if email verification is required
      if (result.requiresVerification) {
        // Email confirmation required - redirect to verification
        setLoading(false);
        router.push({
          pathname: '/(auth)/verify-email',
          params: { email, name, flow: 'create' },
        });
        return;
      }

      // User is authenticated (auto-confirm is enabled in Supabase)
      if (result.user) {
        console.log('User authenticated, creating family...');
        await createFamilyAndNavigate(result.user.id, name);
      } else {
        // This shouldn't happen, but handle it gracefully
        Alert.alert(t('common.error'), 'Er ging iets mis bij het aanmelden');
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Email sign up error:', error);
      Alert.alert(t('common.error'), 'Er ging iets mis bij het aanmelden');
      setLoading(false);
    }
  };

  const createFamilyAndNavigate = async (userId: string, userName: string) => {
    try {
      console.log('Creating family for user:', userId);
      
      // Create family
      const familyResult = await createFamily();
      
      if (!familyResult.success || !familyResult.family) {
        console.error('Failed to create family:', familyResult.error);
        Alert.alert(t('common.error'), familyResult.error || 'Kon geen gezin aanmaken');
        setLoading(false);
        return;
      }

      console.log('Family created:', familyResult.family.id);

      // Add user as parent (always parent role - first parent)
      const memberResult = await addFamilyMember(
        familyResult.family.id,
        userId,
        userName,
        'parent',
        colors.accent
      );

      if (!memberResult.success) {
        console.error('Failed to add family member:', memberResult.error);
        Alert.alert(t('common.error'), memberResult.error || 'Kon je niet toevoegen aan het gezin');
        setLoading(false);
        return;
      }

      console.log('Family member added successfully');
      
      // Show family code and navigate
      Alert.alert(
        t('auth.createFamily.familyCreated'),
        t('auth.createFamily.familyCodeMessage', { code: familyResult.family.family_code }),
        [
          {
            text: t('common.ok'),
            onPress: () => {
              // Navigate to home screen
              console.log('Navigating to home...');
              setLoading(false);
              // Use replace to prevent going back to auth screens
              router.replace('/(tabs)/(home)');
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Create family error:', error);
      Alert.alert(t('common.error'), 'Er ging iets mis bij het aanmaken van het gezin');
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
          <Text style={styles.title}>{t('auth.createFamily.registerWithEmail')}</Text>
          <Text style={styles.subtitle}>{t('auth.createFamily.fillDetails')}</Text>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('common.name')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('auth.createFamily.namePlaceholder')}
                placeholderTextColor={colors.textSecondary}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                editable={!loading}
              />
            </View>

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
              style={[styles.button, styles.orangeButton]}
              onPress={handleEmailSignUp}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={colors.card} />
              ) : (
                <Text style={styles.orangeButtonText}>{t('auth.createFamily.createFamily')}</Text>
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
        <Text style={styles.title}>{t('auth.createFamily.title')}</Text>
        <Text style={styles.subtitle}>{t('auth.createFamily.subtitle')}</Text>

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
            <Text style={styles.orangeButtonText}>{t('auth.createFamily.registerWithEmail')}</Text>
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

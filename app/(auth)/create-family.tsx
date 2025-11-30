
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { signUpWithEmail, signInWithApple, signInWithGoogle } from '@/utils/auth';
import { createFamily, addFamilyMember } from '@/utils/familyService';
import * as AppleAuthentication from 'expo-apple-authentication';

export default function CreateFamilyScreen() {
  const router = useRouter();
  const [step, setStep] = useState<'auth' | 'email'>('auth');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAppleSignIn = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('Niet beschikbaar', 'Apple Sign-In is alleen beschikbaar op iOS');
      return;
    }

    setLoading(true);
    try {
      const result = await signInWithApple();
      
      if (!result.success) {
        Alert.alert('Fout', result.error || 'Er ging iets mis bij het inloggen');
        setLoading(false);
        return;
      }

      // Create family and add user as parent
      await createFamilyAndNavigate(result.user.id, result.user.user_metadata?.full_name || 'Ouder');
    } catch (error: any) {
      console.error('Apple sign in error:', error);
      Alert.alert('Fout', 'Er ging iets mis bij het inloggen met Apple');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      
      if (!result.success) {
        Alert.alert('Fout', result.error || 'Er ging iets mis bij het inloggen');
        setLoading(false);
        return;
      }

      // Create family and add user as parent
      await createFamilyAndNavigate(result.user.id, result.user.user_metadata?.name || 'Ouder');
    } catch (error: any) {
      console.error('Google sign in error:', error);
      Alert.alert('Fout', 'Er ging iets mis bij het inloggen met Google');
      setLoading(false);
    }
  };

  const handleEmailSignUp = async () => {
    if (!name.trim()) {
      Alert.alert('Fout', 'Vul je naam in');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Fout', 'Vul je e-mailadres in');
      return;
    }
    if (!password.trim() || password.length < 6) {
      Alert.alert('Fout', 'Wachtwoord moet minimaal 6 tekens zijn');
      return;
    }

    setLoading(true);
    try {
      const result = await signUpWithEmail(email, password, name);
      
      if (!result.success) {
        Alert.alert('Fout', result.error || 'Er ging iets mis bij het aanmelden');
        setLoading(false);
        return;
      }

      if (!result.session) {
        // Email confirmation required
        setLoading(false);
        return;
      }

      // Create family and add user as parent
      await createFamilyAndNavigate(result.user.id, name);
    } catch (error: any) {
      console.error('Email sign up error:', error);
      Alert.alert('Fout', 'Er ging iets mis bij het aanmelden');
      setLoading(false);
    }
  };

  const createFamilyAndNavigate = async (userId: string, userName: string) => {
    try {
      // Create family
      const familyResult = await createFamily();
      
      if (!familyResult.success || !familyResult.family) {
        Alert.alert('Fout', familyResult.error || 'Kon geen gezin aanmaken');
        setLoading(false);
        return;
      }

      // Add user as parent
      const memberResult = await addFamilyMember(
        familyResult.family.id,
        userId,
        userName,
        'parent',
        colors.accent
      );

      if (!memberResult.success) {
        Alert.alert('Fout', memberResult.error || 'Kon je niet toevoegen aan het gezin');
        setLoading(false);
        return;
      }

      setLoading(false);
      
      // Show family code
      Alert.alert(
        'Gezin aangemaakt! 🎉',
        `Je gezinscode is: ${familyResult.family.family_code}\n\nDeel deze code met andere gezinsleden zodat zij kunnen deelnemen.`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to settings to set up family members
              router.replace('/(tabs)/profile');
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Create family error:', error);
      Alert.alert('Fout', 'Er ging iets mis bij het aanmaken van het gezin');
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
          <Text style={styles.title}>Registreer met e-mail</Text>
          <Text style={styles.subtitle}>Vul je gegevens in om te beginnen</Text>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Naam</Text>
              <TextInput
                style={styles.input}
                placeholder="Je naam"
                placeholderTextColor={colors.textSecondary}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>E-mail</Text>
              <TextInput
                style={styles.input}
                placeholder="je@email.com"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Wachtwoord</Text>
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
                <Text style={styles.primaryButtonText}>Gezin aanmaken</Text>
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
        <Text style={styles.title}>Nieuw gezin starten</Text>
        <Text style={styles.subtitle}>Kies hoe je wilt inloggen</Text>

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
                <>
                  <IconSymbol
                    ios_icon_name="apple.logo"
                    android_material_icon_name="apple"
                    size={20}
                    color={colors.card}
                  />
                  <Text style={styles.appleButtonText}>Doorgaan met Apple</Text>
                </>
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
              <>
                <Text style={styles.googleIcon}>G</Text>
                <Text style={styles.googleButtonText}>Doorgaan met Google</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.emailButton]}
            onPress={() => setStep('email')}
            disabled={loading}
          >
            <IconSymbol
              ios_icon_name="envelope.fill"
              android_material_icon_name="email"
              size={20}
              color={colors.card}
            />
            <Text style={styles.emailButtonText}>Registreer met e-mail</Text>
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
    borderRadius: 12,
    gap: 10,
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
});

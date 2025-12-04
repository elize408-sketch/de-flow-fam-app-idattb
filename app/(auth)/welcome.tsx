
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '@/components/LanguageSelector';

const LANGUAGE_SELECTED_KEY = '@flow_fam_language_selected';

export default function WelcomeScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [languageSelected, setLanguageSelected] = useState(false);

  useEffect(() => {
    checkLanguageSelection();
  }, []);

  const checkLanguageSelection = async () => {
    const selected = await AsyncStorage.getItem(LANGUAGE_SELECTED_KEY);
    setLanguageSelected(!!selected);
  };

  const handleLanguageSelect = async (languageCode: string) => {
    await i18n.changeLanguage(languageCode);
    await AsyncStorage.setItem(LANGUAGE_SELECTED_KEY, 'true');
    setLanguageSelected(true);
    setShowLanguageSelector(false);
  };

  const handleCreateFamily = () => {
    router.push('/(auth)/create-family');
  };

  const handleJoinFamily = () => {
    router.push('/(auth)/join-family');
  };

  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  const handleAddFamilyMembers = () => {
    router.push('/(auth)/add-family-members');
  };

  if (!languageSelected) {
    return (
      <View style={styles.container}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoEmoji}>👨‍👩‍👧‍👦</Text>
              <Text style={styles.logoText}>Flow Fam</Text>
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.title}>{t('welcome.title')}</Text>
              <Text style={styles.subtitle}>{t('welcome.subtitle')}</Text>
            </View>

            <TouchableOpacity
              style={styles.languageButton}
              onPress={() => setShowLanguageSelector(true)}
            >
              <Text style={styles.languageButtonText}>🌍 {t('language.change')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <LanguageSelector
          visible={showLanguageSelector}
          onClose={() => setShowLanguageSelector(false)}
          onSelectLanguage={handleLanguageSelect}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>👨‍👩‍👧‍👦</Text>
            <Text style={styles.logoText}>Flow Fam</Text>
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.title}>{t('welcome.title')}</Text>
            <Text style={styles.subtitle}>{t('welcome.subtitle')}</Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleCreateFamily}>
              <Text style={styles.primaryButtonText}>{t('welcome.startNewFamily')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleJoinFamily}>
              <Text style={styles.secondaryButtonText}>{t('welcome.haveFamilyCode')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.textButton} onPress={handleLogin}>
              <Text style={styles.textButtonText}>{t('welcome.alreadyHaveAccount')}</Text>
            </TouchableOpacity>

            {/* Development/Design Mode Button */}
            <View style={styles.devSection}>
              <View style={styles.divider} />
              <Text style={styles.devLabel}>🎨 Design Mode</Text>
              <TouchableOpacity style={styles.devButton} onPress={handleAddFamilyMembers}>
                <Text style={styles.devButtonText}>Gezinsleden toevoegen →</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.languageChangeButton}
            onPress={() => setShowLanguageSelector(true)}
          >
            <Text style={styles.languageChangeText}>🌍 {t('language.change')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <LanguageSelector
        visible={showLanguageSelector}
        onClose={() => setShowLanguageSelector(false)}
        onSelectLanguage={handleLanguageSelect}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  logoText: {
    fontSize: 42,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Poppins_700Bold',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'Poppins_700Bold',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Nunito_400Regular',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 16,
  },
  primaryButton: {
    backgroundColor: colors.warmOrange,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
  },
  secondaryButton: {
    backgroundColor: colors.beige,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
  },
  textButton: {
    padding: 12,
    alignItems: 'center',
  },
  textButtonText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontFamily: 'Nunito_600SemiBold',
    textDecorationLine: 'underline',
  },
  languageButton: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    width: '100%',
    maxWidth: 400,
  },
  languageButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
  },
  languageChangeButton: {
    marginTop: 32,
    padding: 12,
  },
  languageChangeText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  devSection: {
    marginTop: 24,
    width: '100%',
    alignItems: 'center',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.card,
    marginBottom: 16,
  },
  devLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Nunito_600SemiBold',
    marginBottom: 12,
  },
  devButton: {
    backgroundColor: colors.vibrantPink,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '100%',
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  devButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
  },
});

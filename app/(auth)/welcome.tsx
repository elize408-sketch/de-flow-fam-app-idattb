
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/styles/commonStyles';
import { changeLanguage, getAvailableLanguages } from '@/utils/i18n';
import { getLocales } from 'expo-localization';

const LANGUAGE_SELECTED_KEY = '@flow_fam_language_selected';

export default function WelcomeScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const availableLanguages = getAvailableLanguages();

  useEffect(() => {
    // Auto-detect device language and pre-select it
    const detectLanguage = async () => {
      const locales = getLocales();
      if (locales && locales.length > 0) {
        const deviceLang = locales[0].languageCode || 'en';
        // Check if device language is supported
        const supportedLang = availableLanguages.find(lang => lang.code === deviceLang);
        if (supportedLang) {
          setSelectedLanguage(deviceLang);
          await changeLanguage(deviceLang);
        } else {
          // Default to English if device language not supported
          setSelectedLanguage('en');
          await changeLanguage('en');
        }
      } else {
        setSelectedLanguage('en');
        await changeLanguage('en');
      }
    };
    
    detectLanguage();
  }, []);

  const handleLanguageSelect = async (languageCode: string) => {
    setSelectedLanguage(languageCode);
    await changeLanguage(languageCode);
  };

  const handleContinue = async () => {
    if (selectedLanguage) {
      // Mark that language has been selected
      await AsyncStorage.setItem(LANGUAGE_SELECTED_KEY, 'true');
      // Continue to create or join family
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo/Icon */}
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/a3876905-0be2-4827-bf7c-0b05f4f36aff.jpeg')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>{t('welcome.title')}</Text>
          <Text style={styles.subtitle}>{t('welcome.subtitle')}</Text>
        </View>

        {/* Language Selection */}
        <View style={styles.languageSection}>
          <Text style={styles.languageTitle}>
            {t('language.subtitle')}
          </Text>
          
          <View style={styles.languageGrid}>
            {availableLanguages.map((language, index) => (
              <React.Fragment key={index}>
                <TouchableOpacity
                  style={[
                    styles.languageCard,
                    selectedLanguage === language.code && styles.languageCardActive,
                  ]}
                  onPress={() => handleLanguageSelect(language.code)}
                >
                  <Text style={styles.languageFlag}>{language.flag}</Text>
                  <Text style={[
                    styles.languageText,
                    selectedLanguage === language.code && styles.languageTextActive,
                  ]}>
                    {language.nativeName}
                  </Text>
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Main buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={async () => {
              await handleContinue();
              router.push('/(auth)/create-family');
            }}
          >
            <Text style={styles.primaryButtonText}>{t('welcome.startNewFamily')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={async () => {
              await handleContinue();
              router.push('/(auth)/join-family');
            }}
          >
            <Text style={styles.secondaryButtonText}>{t('welcome.haveFamilyCode')}</Text>
          </TouchableOpacity>
        </View>

        {/* Login link */}
        <TouchableOpacity
          style={styles.loginLink}
          onPress={async () => {
            await handleContinue();
            router.push('/(auth)/login');
          }}
        >
          <Text style={styles.loginLinkText}>
            {t('welcome.alreadyHaveAccount')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 48 : 60,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0D1A2D',
    marginBottom: 8,
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
    textAlign: 'center',
  },
  languageSection: {
    width: '100%',
    marginBottom: 30,
  },
  languageTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
    marginBottom: 20,
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  languageCard: {
    width: '30%',
    minWidth: 100,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    boxShadow: `0px 2px 8px ${colors.shadow}`,
    elevation: 2,
  },
  languageCardActive: {
    borderColor: colors.vibrantOrange,
    backgroundColor: colors.primary,
  },
  languageFlag: {
    fontSize: 32,
    marginBottom: 8,
  },
  languageText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
  },
  languageTextActive: {
    color: colors.vibrantOrange,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 20,
  },
  button: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: colors.vibrantOrange,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.card,
    fontFamily: 'Poppins_600SemiBold',
  },
  secondaryButton: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.vibrantOrange,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.vibrantOrange,
    fontFamily: 'Poppins_600SemiBold',
  },
  loginLink: {
    alignSelf: 'center',
    paddingVertical: 10,
  },
  loginLinkText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
    textDecorationLine: 'underline',
  },
});

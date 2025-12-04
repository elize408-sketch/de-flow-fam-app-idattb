
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
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
          // Default to Dutch if device language not supported
          setSelectedLanguage('nl');
          await changeLanguage('nl');
        }
      } else {
        setSelectedLanguage('nl');
        await changeLanguage('nl');
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
      <View style={styles.content}>
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
            Kies je taal / Choose your language
          </Text>
          
          <View style={styles.languageButtons}>
            {availableLanguages.map((language, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.languageButton,
                  selectedLanguage === language.code && styles.languageButtonActive,
                ]}
                onPress={() => handleLanguageSelect(language.code)}
              >
                <Text style={styles.languageFlag}>{language.flag}</Text>
                <Text style={[
                  styles.languageText,
                  selectedLanguage === language.code && styles.languageTextActive,
                ]}>
                  {language.name}
                </Text>
              </TouchableOpacity>
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0D1A2D',
    marginBottom: 10,
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
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
    marginBottom: 16,
  },
  languageButtons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  languageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    boxShadow: `0px 2px 8px ${colors.shadow}`,
    elevation: 2,
  },
  languageButtonActive: {
    borderColor: colors.vibrantOrange,
    backgroundColor: colors.primary,
  },
  languageFlag: {
    fontSize: 28,
    marginRight: 8,
  },
  languageText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
  },
  languageTextActive: {
    color: colors.vibrantOrange,
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  button: {
    width: '100%',
    paddingVertical: 18,
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
    marginTop: 30,
    paddingVertical: 10,
  },
  loginLinkText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
    textDecorationLine: 'underline',
  },
});


import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import nl from '../locales/nl.json';
import en from '../locales/en.json';

const LANGUAGE_STORAGE_KEY = '@flow_fam_language';

// Get device language
const getDeviceLanguage = () => {
  const deviceLanguage = Localization.locale.split('-')[0]; // Get 'nl' from 'nl-NL'
  return deviceLanguage;
};

// Get stored language or device language
const getInitialLanguage = async () => {
  try {
    const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (storedLanguage) {
      return storedLanguage;
    }
    return getDeviceLanguage();
  } catch (error) {
    console.error('Error getting stored language:', error);
    return getDeviceLanguage();
  }
};

// Initialize i18n
const initI18n = async () => {
  const initialLanguage = await getInitialLanguage();

  i18n
    .use(initReactI18next)
    .init({
      compatibilityJSON: 'v3',
      resources: {
        nl: { translation: nl },
        en: { translation: en },
      },
      lng: initialLanguage,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
    });
};

// Change language and store preference
export const changeLanguage = async (language: string) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    await i18n.changeLanguage(language);
  } catch (error) {
    console.error('Error changing language:', error);
  }
};

// Get current language
export const getCurrentLanguage = () => {
  return i18n.language;
};

// Get available languages
export const getAvailableLanguages = () => {
  return [
    { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
  ];
};

initI18n();

export default i18n;


import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Platform, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/styles/commonStyles';
import { changeLanguage, getAvailableLanguages, getCurrentLanguage } from '@/utils/i18n';
import { getLocales } from 'expo-localization';
import { IconSymbol } from '@/components/IconSymbol';

const LANGUAGE_SELECTED_KEY = '@flow_fam_language_selected';

export default function WelcomeScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
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
    setDropdownVisible(false);
  };

  const handleContinue = async () => {
    if (selectedLanguage) {
      // Mark that language has been selected
      await AsyncStorage.setItem(LANGUAGE_SELECTED_KEY, 'true');
      // Continue to create or join family
    }
  };

  const getSelectedLanguageData = () => {
    return availableLanguages.find(lang => lang.code === selectedLanguage) || availableLanguages[0];
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

        {/* Language Dropdown */}
        <View style={styles.languageSection}>
          <Text style={styles.languageTitle}>
            {t('language.subtitle')}
          </Text>
          
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setDropdownVisible(true)}
          >
            <View style={styles.dropdownContent}>
              <Text style={styles.dropdownFlag}>{getSelectedLanguageData().flag}</Text>
              <Text style={styles.dropdownText}>{getSelectedLanguageData().nativeName}</Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.down"
              android_material_icon_name="arrow-drop-down"
              size={24}
              color={colors.darkBrown}
            />
          </TouchableOpacity>
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

        {/* Design Mode Button */}
        <TouchableOpacity
          style={styles.designModeButton}
          onPress={async () => {
            await handleContinue();
            router.push('/(auth)/add-family-members');
          }}
        >
          <IconSymbol
            ios_icon_name="paintbrush.fill"
            android_material_icon_name="palette"
            size={20}
            color={colors.warmOrange}
          />
          <Text style={styles.designModeButtonText}>
            🎨 Design Mode: Gezinsleden toevoegen
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Language Dropdown Modal */}
      <Modal
        visible={dropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDropdownVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('language.title')}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setDropdownVisible(false)}
              >
                <IconSymbol
                  ios_icon_name="xmark.circle.fill"
                  android_material_icon_name="cancel"
                  size={28}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.languageScrollView}
              contentContainerStyle={styles.languageList}
              showsVerticalScrollIndicator={true}
            >
              {availableLanguages.map((language, index) => {
                const isSelected = selectedLanguage === language.code;
                return (
                  <React.Fragment key={index}>
                    <TouchableOpacity
                      style={[
                        styles.languageOption,
                        isSelected && styles.languageOptionActive,
                      ]}
                      onPress={() => handleLanguageSelect(language.code)}
                    >
                      <Text style={styles.languageOptionFlag}>{language.flag}</Text>
                      <Text style={styles.languageOptionText}>{language.nativeName}</Text>
                      {isSelected && (
                        <IconSymbol
                          ios_icon_name="checkmark.circle.fill"
                          android_material_icon_name="check-circle"
                          size={24}
                          color={colors.warmOrange}
                        />
                      )}
                    </TouchableOpacity>
                  </React.Fragment>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    color: colors.darkBrown,
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
    color: colors.darkBrown,
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
    marginBottom: 16,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.warmOrange,
    boxShadow: `0px 2px 8px ${colors.shadow}`,
    elevation: 2,
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dropdownFlag: {
    fontSize: 28,
    marginRight: 12,
  },
  dropdownText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.darkBrown,
    fontFamily: 'Poppins_600SemiBold',
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
    backgroundColor: colors.warmOrange,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
  },
  secondaryButton: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.warmOrange,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.warmOrange,
    fontFamily: 'Poppins_600SemiBold',
  },
  loginLink: {
    alignSelf: 'center',
    paddingVertical: 10,
    marginBottom: 20,
  },
  loginLinkText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
    textDecorationLine: 'underline',
  },
  designModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: colors.warmOrange + '15',
    borderWidth: 2,
    borderColor: colors.warmOrange,
    borderStyle: 'dashed',
  },
  designModeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.warmOrange,
    fontFamily: 'Poppins_600SemiBold',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(76, 59, 52, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '70%',
    boxShadow: `0px 8px 32px ${colors.shadow}`,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.beige,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.darkBrown,
    fontFamily: 'Poppins_700Bold',
  },
  closeButton: {
    padding: 4,
  },
  languageScrollView: {
    maxHeight: 500,
  },
  languageList: {
    padding: 16,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  languageOptionActive: {
    borderColor: colors.warmOrange,
    backgroundColor: colors.softCream,
  },
  languageOptionFlag: {
    fontSize: 28,
    marginRight: 16,
  },
  languageOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkBrown,
    fontFamily: 'Poppins_600SemiBold',
    flex: 1,
  },
});

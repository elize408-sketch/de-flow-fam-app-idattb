
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { changeLanguage, getAvailableLanguages, getCurrentLanguage } from '@/utils/i18n';

interface LanguageSelectorProps {
  visible: boolean;
  onClose: () => void;
}

export default function LanguageSelector({ visible, onClose }: LanguageSelectorProps) {
  const { t } = useTranslation();
  const currentLanguage = getCurrentLanguage();
  const availableLanguages = getAvailableLanguages();

  const handleLanguageChange = async (languageCode: string) => {
    await changeLanguage(languageCode);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{t('language.title')}</Text>
          <Text style={styles.modalSubtitle}>{t('language.subtitle')}</Text>

          <View style={styles.languageList}>
            {availableLanguages.map((language, index) => {
              const isSelected = currentLanguage === language.code;
              return (
                <React.Fragment key={index}>
                  <TouchableOpacity
                    style={[
                      styles.languageOption,
                      isSelected && styles.languageOptionActive,
                    ]}
                    onPress={() => handleLanguageChange(language.code)}
                  >
                    <Text style={styles.languageFlag}>{language.flag}</Text>
                    <Text style={styles.languageName}>{language.name}</Text>
                    {isSelected && (
                      <IconSymbol
                        ios_icon_name="checkmark"
                        android_material_icon_name="check"
                        size={24}
                        color={colors.vibrantGreen}
                      />
                    )}
                  </TouchableOpacity>
                </React.Fragment>
              );
            })}
          </View>

          <TouchableOpacity
            style={[styles.modalButton, styles.modalButtonCancel]}
            onPress={onClose}
          >
            <Text style={styles.modalButtonText}>{t('common.close')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    boxShadow: `0px 8px 24px ${colors.shadow}`,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'Poppins_700Bold',
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Nunito_400Regular',
  },
  languageList: {
    marginBottom: 20,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  languageOptionActive: {
    borderColor: colors.vibrantGreen,
    backgroundColor: colors.primary,
  },
  languageFlag: {
    fontSize: 32,
    marginRight: 15,
  },
  languageName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
  },
  modalButton: {
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: colors.background,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
  },
});

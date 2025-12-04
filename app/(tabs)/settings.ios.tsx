
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Modal,
  Alert,
  Image,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: { ios: string; android: string };
  type: 'navigation' | 'toggle' | 'info';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

export default function SettingsScreen() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | undefined>(undefined);
  const [language, setLanguage] = useState('Nederlands');
  const [avatarColor, setAvatarColor] = useState('#F28F45');

  const handlePickPhoto = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Toestemming vereist', 'Je moet toegang geven tot je foto&apos;s');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfilePhoto(result.assets[0].uri);
    }
  };

  const handleSaveProfile = () => {
    if (!profileName.trim()) {
      Alert.alert('Fout', 'Vul een naam in');
      return;
    }

    // TODO: Save profile changes
    Alert.alert('Gelukt!', 'Profiel bijgewerkt');
    setShowEditProfileModal(false);
  };

  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          id: 'profile',
          title: 'Profiel bewerken',
          subtitle: 'Naam, foto en voorkeuren',
          icon: { ios: 'person.circle.fill', android: 'account-circle' },
          type: 'navigation' as const,
          onPress: () => setShowEditProfileModal(true),
        },
        {
          id: 'family',
          title: 'Gezinsinstellingen',
          subtitle: 'Beheer gezinsleden',
          icon: { ios: 'person.2.fill', android: 'people' },
          type: 'navigation' as const,
          onPress: () => console.log('Navigate to family settings'),
        },
      ],
    },
    {
      title: 'Notificaties',
      items: [
        {
          id: 'notifications',
          title: 'Push notificaties',
          subtitle: 'Ontvang meldingen',
          icon: { ios: 'bell.fill', android: 'notifications' },
          type: 'toggle' as const,
          value: notificationsEnabled,
          onToggle: setNotificationsEnabled,
        },
        {
          id: 'sound',
          title: 'Geluid',
          subtitle: 'Geluid bij notificaties',
          icon: { ios: 'speaker.wave.2.fill', android: 'volume-up' },
          type: 'toggle' as const,
          value: soundEnabled,
          onToggle: setSoundEnabled,
        },
      ],
    },
    {
      title: 'App',
      items: [
        {
          id: 'language',
          title: 'Taal',
          subtitle: 'Nederlands',
          icon: { ios: 'globe', android: 'language' },
          type: 'navigation' as const,
          onPress: () => console.log('Navigate to language settings'),
        },
      ],
    },
    {
      title: 'Informatie',
      items: [
        {
          id: 'help',
          title: 'Help & Support',
          icon: { ios: 'questionmark.circle.fill', android: 'help' },
          type: 'navigation' as const,
          onPress: () => console.log('Navigate to help'),
        },
        {
          id: 'privacy',
          title: 'Privacy',
          icon: { ios: 'lock.fill', android: 'lock' },
          type: 'navigation' as const,
          onPress: () => console.log('Navigate to privacy'),
        },
        {
          id: 'about',
          title: 'Over Flow Fam',
          subtitle: 'Versie 1.0.0',
          icon: { ios: 'info.circle.fill', android: 'info' },
          type: 'info' as const,
        },
      ],
    },
  ];

  const renderSettingItem = (item: SettingItem, index: number) => {
    return (
      <React.Fragment key={index}>
        <TouchableOpacity
          style={styles.settingItem}
          onPress={item.onPress}
          activeOpacity={item.type === 'info' ? 1 : 0.7}
          disabled={item.type === 'info'}
        >
          <View style={styles.settingIconContainer}>
            <IconSymbol
              ios_icon_name={item.icon.ios}
              android_material_icon_name={item.icon.android as any}
              size={24}
              color={colors.vibrantOrange}
            />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>{item.title}</Text>
            {item.subtitle && (
              <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
            )}
          </View>
          {item.type === 'toggle' && (
            <Switch
              value={item.value}
              onValueChange={item.onToggle}
              trackColor={{ false: '#D1D1D6', true: colors.vibrantOrange + '80' }}
              thumbColor={item.value ? colors.vibrantOrange : '#F4F3F4'}
              ios_backgroundColor="#D1D1D6"
            />
          )}
          {item.type === 'navigation' && (
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={20}
              color={colors.text + '40'}
            />
          )}
        </TouchableOpacity>
      </React.Fragment>
    );
  };

  const colorOptions = [
    '#F28F45', // Orange
    '#FF6B9D', // Pink
    '#4A90E2', // Blue
    '#7ED321', // Green
    '#9013FE', // Purple
    '#50E3C2', // Teal
    '#FF3B30', // Red
    '#CBA85B', // Gold
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Instellingen</Text>
        </View>

        {/* Settings List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {settingsSections.map((section, sectionIndex) => (
            <React.Fragment key={sectionIndex}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <View style={styles.sectionContent}>
                  {section.items.map((item, itemIndex) => renderSettingItem(item, itemIndex))}
                </View>
              </View>
            </React.Fragment>
          ))}

          {/* Logout Button */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => console.log('Logout')}
            activeOpacity={0.7}
          >
            <IconSymbol
              ios_icon_name="arrow.right.square.fill"
              android_material_icon_name="logout"
              size={24}
              color="#FF3B30"
            />
            <Text style={styles.logoutText}>Uitloggen</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditProfileModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditProfileModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Profiel bewerken</Text>

              {/* Profile Photo */}
              <TouchableOpacity style={styles.photoButton} onPress={handlePickPhoto}>
                {profilePhoto ? (
                  <Image source={{ uri: profilePhoto }} style={styles.photoPreview} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <IconSymbol
                      ios_icon_name="camera"
                      android_material_icon_name="camera-alt"
                      size={32}
                      color={colors.textSecondary}
                    />
                    <Text style={styles.photoPlaceholderText}>Profielfoto uploaden</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Name */}
              <Text style={styles.inputLabel}>Naam wijzigen</Text>
              <TextInput
                style={styles.input}
                placeholder="Naam"
                placeholderTextColor={colors.textSecondary}
                value={profileName}
                onChangeText={setProfileName}
              />

              {/* Avatar Color */}
              <Text style={styles.inputLabel}>Avatar kleur</Text>
              <View style={styles.colorSelector}>
                {colorOptions.map((color, index) => (
                  <React.Fragment key={index}>
                    <TouchableOpacity
                      style={[
                        styles.colorOption,
                        { backgroundColor: color },
                        avatarColor === color && styles.colorOptionActive,
                      ]}
                      onPress={() => setAvatarColor(color)}
                    >
                      {avatarColor === color && (
                        <IconSymbol
                          ios_icon_name="checkmark"
                          android_material_icon_name="check"
                          size={20}
                          color="#FFFFFF"
                        />
                      )}
                    </TouchableOpacity>
                  </React.Fragment>
                ))}
              </View>

              {/* Language */}
              <Text style={styles.inputLabel}>Taal</Text>
              <View style={styles.languageSelector}>
                {['Nederlands', 'English'].map((lang, index) => (
                  <React.Fragment key={index}>
                    <TouchableOpacity
                      style={[
                        styles.languageOption,
                        language === lang && styles.languageOptionActive,
                      ]}
                      onPress={() => setLanguage(lang)}
                    >
                      <Text
                        style={[
                          styles.languageOptionText,
                          language === lang && styles.languageOptionTextActive,
                        ]}
                      >
                        {lang}
                      </Text>
                    </TouchableOpacity>
                  </React.Fragment>
                ))}
              </View>

              {/* Notifications Preference */}
              <View style={styles.preferenceRow}>
                <Text style={styles.preferenceLabel}>Notificaties</Text>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: '#D1D1D6', true: colors.vibrantOrange + '80' }}
                  thumbColor={notificationsEnabled ? colors.vibrantOrange : '#F4F3F4'}
                  ios_backgroundColor="#D1D1D6"
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => setShowEditProfileModal(false)}
                >
                  <Text style={styles.modalButtonText}>Annuleren</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonConfirm]}
                  onPress={handleSaveProfile}
                >
                  <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>Opslaan</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Poppins_700Bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text + '80',
    fontFamily: 'Poppins_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.vibrantOrange + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: colors.text + '80',
    fontFamily: 'Poppins_400Regular',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
    fontFamily: 'Poppins_600SemiBold',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
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
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Poppins_700Bold',
  },
  photoButton: {
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  photoPreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: colors.background,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.secondary,
    borderStyle: 'dashed',
  },
  photoPlaceholderText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'Nunito_400Regular',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
    fontFamily: 'Poppins_600SemiBold',
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    color: colors.text,
    marginBottom: 20,
    fontFamily: 'Nunito_400Regular',
  },
  colorSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorOptionActive: {
    borderColor: colors.text,
  },
  languageSelector: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  languageOption: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  languageOptionActive: {
    borderColor: colors.vibrantOrange,
    backgroundColor: colors.vibrantOrange + '20',
  },
  languageOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    fontFamily: 'Poppins_600SemiBold',
  },
  languageOptionTextActive: {
    color: colors.text,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  preferenceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: colors.background,
  },
  modalButtonConfirm: {
    backgroundColor: colors.vibrantOrange,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
  },
  modalButtonTextConfirm: {
    color: colors.card,
  },
});

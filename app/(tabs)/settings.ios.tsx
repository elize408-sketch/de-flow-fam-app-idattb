
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
import { useFamily } from '@/contexts/FamilyContext';
import { signOut } from '@/utils/auth';
import { supabase } from '@/utils/supabase';

const AVAILABLE_COLORS = [
  { name: 'Blush Roze', value: '#F5D9CF' },
  { name: 'Salie Groen', value: '#C8D3C0' },
  { name: 'Terracotta', value: '#D5A093' },
  { name: 'Goud', value: '#CBA85B' },
  { name: 'Licht Blauw', value: '#A8C5DD' },
  { name: 'Lavendel', value: '#C5B9CD' },
  { name: 'Perzik', value: '#F4C2A8' },
  { name: 'Mint', value: '#B8E0D2' },
  { name: 'Koraal', value: '#E8A598' },
  { name: 'Lemon', value: '#F7E7A1' },
];

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
  const { 
    currentUser,
    familyCode,
    shareFamilyInvite,
    familyMembers,
    addFamilyMember,
    updateFamilyMember,
    deleteFamilyMember,
    currentFamily,
  } = useFamily();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showEditMemberModal, setShowEditMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [profileName, setProfileName] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | undefined>(undefined);
  const [language, setLanguage] = useState('Nederlands');
  const [avatarColor, setAvatarColor] = useState('#F28F45');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'parent' | 'child'>('child');
  const [newMemberColor, setNewMemberColor] = useState(AVAILABLE_COLORS[0].value);
  const [newMemberPhoto, setNewMemberPhoto] = useState<string | null>(null);
  const [designMode, setDesignMode] = useState<'parent' | 'child'>(currentUser?.role || 'child');

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

    Alert.alert('Gelukt!', 'Profiel bijgewerkt');
    setShowEditProfileModal(false);
  };

  const handleModeSwitch = (mode: 'parent' | 'child') => {
    setDesignMode(mode);
    Alert.alert(
      'Modus gewijzigd',
      `Je bekijkt nu de app in ${mode === 'parent' ? 'ouder' : 'kind'} modus (alleen voor design doeleinden)`,
      [{ text: 'OK' }]
    );
  };

  const handlePickImage = async () => {
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
      setNewMemberPhoto(result.assets[0].uri);
    }
  };

  const handleAddMember = async () => {
    if (!newMemberName.trim()) {
      Alert.alert('Fout', 'Vul een naam in');
      return;
    }

    if (!currentFamily) {
      Alert.alert('Fout', 'Geen gezin gevonden');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('family_members')
        .insert([{
          family_id: currentFamily.id,
          user_id: null,
          name: newMemberName.trim(),
          role: newMemberRole,
          color: newMemberColor,
          photo_uri: newMemberPhoto,
          coins: 0,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding family member:', error);
        Alert.alert('Fout', 'Kon gezinslid niet toevoegen');
        return;
      }

      addFamilyMember({
        id: data.id,
        userId: data.user_id,
        name: data.name,
        role: data.role,
        color: data.color || '#CBA85B',
        photoUri: data.photo_uri,
        coins: data.coins || 0,
      });

      setNewMemberName('');
      setNewMemberRole('child');
      setNewMemberColor(AVAILABLE_COLORS[0].value);
      setNewMemberPhoto(null);
      setShowAddMemberModal(false);
      Alert.alert('Gelukt!', `${newMemberName} is toegevoegd aan het gezin`);
    } catch (error: any) {
      console.error('Error adding member:', error);
      Alert.alert('Fout', 'Er ging iets mis bij het toevoegen van het gezinslid');
    }
  };

  const openEditMemberModal = (member: any) => {
    setEditingMember(member);
    setNewMemberName(member.name);
    setNewMemberRole(member.role);
    setNewMemberColor(member.color);
    setNewMemberPhoto(member.photoUri || null);
    setShowEditMemberModal(true);
  };

  const handleEditMember = async () => {
    if (!newMemberName.trim()) {
      Alert.alert('Fout', 'Vul een naam in');
      return;
    }

    if (!currentFamily) {
      Alert.alert('Fout', 'Geen gezin gevonden');
      return;
    }

    try {
      const { error } = await supabase
        .from('family_members')
        .update({
          name: newMemberName.trim(),
          color: newMemberColor,
          photo_uri: newMemberPhoto,
        })
        .eq('id', editingMember.id)
        .eq('family_id', currentFamily.id);

      if (error) {
        console.error('Error updating family member:', error);
        Alert.alert('Fout', 'Kon gezinslid niet bijwerken');
        return;
      }

      updateFamilyMember(editingMember.id, {
        name: newMemberName.trim(),
        color: newMemberColor,
        photoUri: newMemberPhoto || undefined,
      });

      setEditingMember(null);
      setNewMemberName('');
      setNewMemberRole('child');
      setNewMemberColor(AVAILABLE_COLORS[0].value);
      setNewMemberPhoto(null);
      setShowEditMemberModal(false);
      Alert.alert('Gelukt!', 'Gezinslid bijgewerkt');
    } catch (error: any) {
      console.error('Error updating member:', error);
      Alert.alert('Fout', 'Er ging iets mis bij het bijwerken van het gezinslid');
    }
  };

  const handleDeleteMember = (memberId: string, memberName: string) => {
    Alert.alert(
      'Weet je het zeker?',
      `Wil je ${memberName} verwijderen uit het gezin?`,
      [
        { 
          text: 'Annuleren', 
          style: 'cancel' 
        },
        {
          text: 'Verwijderen',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteFamilyMember(memberId);
              Alert.alert('Gelukt!', `${memberName} is verwijderd uit het gezin`);
            } catch (error) {
              console.error('Error deleting member:', error);
              Alert.alert('Fout', 'Kon gezinslid niet verwijderen');
            }
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Uitloggen',
      'Weet je zeker dat je wilt uitloggen?',
      [
        {
          text: 'Annuleren',
          style: 'cancel',
        },
        {
          text: 'Uitloggen',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/(auth)/welcome');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Fout', 'Er ging iets mis bij het uitloggen');
            }
          },
        },
      ]
    );
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
    '#F28F45',
    '#FF6B9D',
    '#4A90E2',
    '#7ED321',
    '#9013FE',
    '#50E3C2',
    '#FF3B30',
    '#CBA85B',
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
          {/* Mode Switcher */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Design Modus</Text>
            <View style={styles.sectionContent}>
              <View style={styles.modeSwitcher}>
                <TouchableOpacity
                  style={[
                    styles.modeButton,
                    designMode === 'parent' && styles.modeButtonActive,
                  ]}
                  onPress={() => handleModeSwitch('parent')}
                >
                  <Text
                    style={[
                      styles.modeButtonText,
                      designMode === 'parent' && styles.modeButtonTextActive,
                    ]}
                  >
                    Ouder
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modeButton,
                    designMode === 'child' && styles.modeButtonActive,
                  ]}
                  onPress={() => handleModeSwitch('child')}
                >
                  <Text
                    style={[
                      styles.modeButtonText,
                      designMode === 'child' && styles.modeButtonTextActive,
                    ]}
                  >
                    Kind
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Family Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gezin</Text>
            <View style={styles.sectionContent}>
              {/* Invitation Code */}
              <TouchableOpacity
                style={styles.settingItem}
                onPress={shareFamilyInvite}
              >
                <View style={styles.settingIconContainer}>
                  <IconSymbol
                    ios_icon_name="square.and.arrow.up"
                    android_material_icon_name="share"
                    size={24}
                    color={colors.vibrantOrange}
                  />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>Uitnodigingscode</Text>
                  {familyCode && (
                    <Text style={styles.settingSubtitle}>Code: {familyCode}</Text>
                  )}
                </View>
                <IconSymbol
                  ios_icon_name="chevron.right"
                  android_material_icon_name="chevron-right"
                  size={20}
                  color={colors.text + '40'}
                />
              </TouchableOpacity>

              {/* Family Members */}
              <View style={styles.familyMembersSection}>
                <View style={styles.familyMembersHeader}>
                  <Text style={styles.familyMembersTitle}>Gezinsleden</Text>
                  <TouchableOpacity
                    style={styles.addMemberButton}
                    onPress={() => setShowAddMemberModal(true)}
                  >
                    <IconSymbol
                      ios_icon_name="plus.circle.fill"
                      android_material_icon_name="add-circle"
                      size={28}
                      color={colors.vibrantOrange}
                    />
                  </TouchableOpacity>
                </View>

                {familyMembers.map((member, index) => (
                  <React.Fragment key={index}>
                    <View style={styles.memberRow}>
                      <View style={[styles.memberAvatar, { backgroundColor: member.color }]}>
                        {member.photoUri ? (
                          <Image source={{ uri: member.photoUri }} style={styles.memberPhoto} />
                        ) : (
                          <Text style={styles.memberAvatarText}>{member.name.charAt(0)}</Text>
                        )}
                      </View>
                      <View style={styles.memberInfo}>
                        <Text style={styles.memberName}>{member.name}</Text>
                        <Text style={styles.memberRole}>
                          {member.role === 'parent' ? 'Ouder' : 'Kind'}
                        </Text>
                      </View>
                      <View style={styles.memberActions}>
                        <TouchableOpacity
                          style={styles.editIconButton}
                          onPress={() => openEditMemberModal(member)}
                        >
                          <IconSymbol
                            ios_icon_name="pencil"
                            android_material_icon_name="edit"
                            size={20}
                            color={colors.vibrantOrange}
                          />
                        </TouchableOpacity>
                        {member.role === 'child' && (
                          <TouchableOpacity
                            style={styles.deleteIconButton}
                            onPress={() => handleDeleteMember(member.id, member.name)}
                          >
                            <IconSymbol
                              ios_icon_name="trash"
                              android_material_icon_name="delete"
                              size={20}
                              color="#E74C3C"
                            />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                    {index < familyMembers.length - 1 && <View style={styles.memberDivider} />}
                  </React.Fragment>
                ))}
              </View>
            </View>
          </View>

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
            onPress={handleLogout}
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

              <Text style={styles.inputLabel}>Naam wijzigen</Text>
              <TextInput
                style={styles.input}
                placeholder="Naam"
                placeholderTextColor={colors.textSecondary}
                value={profileName}
                onChangeText={setProfileName}
              />

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

      {/* Add Member Modal */}
      <Modal
        visible={showAddMemberModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddMemberModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Gezinslid toevoegen</Text>

              <TouchableOpacity style={styles.photoButton} onPress={handlePickImage}>
                {newMemberPhoto ? (
                  <Image source={{ uri: newMemberPhoto }} style={styles.photoPreview} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <IconSymbol
                      ios_icon_name="camera"
                      android_material_icon_name="camera-alt"
                      size={32}
                      color={colors.textSecondary}
                    />
                    <Text style={styles.photoPlaceholderText}>Foto uploaden</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TextInput
                style={styles.input}
                placeholder="Naam"
                placeholderTextColor={colors.textSecondary}
                value={newMemberName}
                onChangeText={setNewMemberName}
              />

              <Text style={styles.inputLabel}>Kies een kleur</Text>
              <View style={styles.colorSelector}>
                {AVAILABLE_COLORS.map((colorOption, index) => (
                  <React.Fragment key={index}>
                    <TouchableOpacity
                      style={[
                        styles.colorOption,
                        { backgroundColor: colorOption.value },
                        newMemberColor === colorOption.value && styles.colorOptionActive,
                      ]}
                      onPress={() => setNewMemberColor(colorOption.value)}
                    >
                      {newMemberColor === colorOption.value && (
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

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => {
                    setShowAddMemberModal(false);
                    setNewMemberName('');
                    setNewMemberRole('child');
                    setNewMemberColor(AVAILABLE_COLORS[0].value);
                    setNewMemberPhoto(null);
                  }}
                >
                  <Text style={styles.modalButtonText}>Annuleren</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonConfirm]}
                  onPress={handleAddMember}
                >
                  <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>Toevoegen</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Edit Member Modal */}
      <Modal
        visible={showEditMemberModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditMemberModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Gezinslid bewerken</Text>

              <TouchableOpacity style={styles.photoButton} onPress={handlePickImage}>
                {newMemberPhoto ? (
                  <Image source={{ uri: newMemberPhoto }} style={styles.photoPreview} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <IconSymbol
                      ios_icon_name="camera"
                      android_material_icon_name="camera-alt"
                      size={32}
                      color={colors.textSecondary}
                    />
                    <Text style={styles.photoPlaceholderText}>Foto uploaden</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TextInput
                style={styles.input}
                placeholder="Naam"
                placeholderTextColor={colors.textSecondary}
                value={newMemberName}
                onChangeText={setNewMemberName}
              />

              <Text style={styles.inputLabel}>Kies een kleur</Text>
              <View style={styles.colorSelector}>
                {AVAILABLE_COLORS.map((colorOption, index) => (
                  <React.Fragment key={index}>
                    <TouchableOpacity
                      style={[
                        styles.colorOption,
                        { backgroundColor: colorOption.value },
                        newMemberColor === colorOption.value && styles.colorOptionActive,
                      ]}
                      onPress={() => setNewMemberColor(colorOption.value)}
                    >
                      {newMemberColor === colorOption.value && (
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

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => {
                    setShowEditMemberModal(false);
                    setEditingMember(null);
                    setNewMemberName('');
                    setNewMemberRole('child');
                    setNewMemberColor(AVAILABLE_COLORS[0].value);
                    setNewMemberPhoto(null);
                  }}
                >
                  <Text style={styles.modalButtonText}>Annuleren</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonConfirm]}
                  onPress={handleEditMember}
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
  modeSwitcher: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  modeButton: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modeButtonActive: {
    borderColor: colors.vibrantOrange,
    backgroundColor: colors.vibrantOrange + '20',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    fontFamily: 'Poppins_600SemiBold',
  },
  modeButtonTextActive: {
    color: colors.text,
  },
  familyMembersSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  familyMembersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  familyMembersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
  },
  addMemberButton: {
    padding: 4,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  memberPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  memberAvatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.card,
    fontFamily: 'Poppins_700Bold',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
    fontFamily: 'Poppins_600SemiBold',
  },
  memberRole: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  memberActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editIconButton: {
    padding: 8,
  },
  deleteIconButton: {
    padding: 8,
  },
  memberDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 8,
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

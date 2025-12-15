
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
  TextInput,
  Image,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { useRouter } from 'expo-router';
import { useFamily } from '@/contexts/FamilyContext';
import { signOut } from '@/utils/auth';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '@/components/LanguageSelector';
import * as ImagePicker from 'expo-image-picker';
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

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { 
    currentUser, 
    familyCode, 
    shareFamilyInvite, 
    reloadCurrentUser,
    familyMembers,
    addFamilyMember,
    updateFamilyMember,
    deleteFamilyMember,
    currentFamily,
    setCurrentUser,
  } = useFamily();
  const [refreshing, setRefreshing] = useState(false);
  const [languageSelectorVisible, setLanguageSelectorVisible] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showEditMemberModal, setShowEditMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'parent' | 'child'>('child');
  const [newMemberColor, setNewMemberColor] = useState(AVAILABLE_COLORS[0].value);
  const [newMemberPhoto, setNewMemberPhoto] = useState<string | null>(null);

  // Get children only (filter out parents)
  const children = familyMembers.filter(member => member.role === 'child');

  const handleLogout = async () => {
    Alert.alert(
      t('common.logout'),
      t('settings.logoutConfirm'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.logout'),
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/(auth)/welcome');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert(t('common.error'), t('settings.logoutError'));
            }
          },
        },
      ]
    );
  };

  const handleRefreshData = async () => {
    setRefreshing(true);
    try {
      await reloadCurrentUser();
      Alert.alert(t('common.success'), t('settings.dataRefreshed'));
    } catch (error) {
      console.error('Refresh error:', error);
      Alert.alert(t('common.error'), t('settings.refreshError'));
    } finally {
      setRefreshing(false);
    }
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert(t('profile.permissionRequired'), t('profile.photoPermissionMessage'));
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
      Alert.alert(t('common.error'), t('profile.fillName'));
      return;
    }

    try {
      // Step 1: Get authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log('Add child - User ID:', user?.id);
      
      if (userError || !user) {
        console.error('Add child - User error:', userError);
        Alert.alert(t('common.error'), 'Could not get user.');
        return;
      }

      // Step 2: Fetch family_id from database
      const { data: membership, error: membershipError } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      console.log('Add child - Membership:', membership);
      console.log('Add child - Membership error:', membershipError);

      // Step 3: Check if family_id exists
      if (membershipError || !membership?.family_id) {
        console.error('Add child - No family found for user:', user.id);
        Alert.alert(t('common.error'), t('settings.noFamily'));
        return;
      }

      const family_id = membership.family_id;
      console.log('Add child - Family ID:', family_id);

      // Step 4: Insert child
      const insertPayload = {
        family_id,
        user_id: null,
        name: newMemberName.trim(),
        role: 'child',
        color: newMemberColor,
        photo_uri: newMemberPhoto,
        coins: 0,
      };
      console.log('Add child - Insert payload:', insertPayload);

      const { data, error: insertError } = await supabase
        .from('family_members')
        .insert([insertPayload])
        .select()
        .single();

      if (insertError) {
        console.error('Add child - Insert error:', insertError.message);
        Alert.alert(t('common.error'), t('settings.couldNotAddMember'));
        return;
      }

      console.log('Add child - Insert success:', data);

      // Step 5: Update local state
      addFamilyMember({
        id: data.id,
        userId: data.user_id,
        name: data.name,
        role: data.role,
        color: data.color || '#CBA85B',
        photoUri: data.photo_uri,
        coins: data.coins || 0,
      });

      // Reload family context
      await reloadCurrentUser();

      // Close modal and reset form
      setNewMemberName('');
      setNewMemberRole('child');
      setNewMemberColor(AVAILABLE_COLORS[0].value);
      setNewMemberPhoto(null);
      setShowAddMemberModal(false);
      
      Alert.alert(t('common.success'), t('profile.memberAdded', { name: newMemberName }));
    } catch (error: any) {
      console.error('Add child - Error:', error);
      Alert.alert(t('common.error'), t('settings.errorAddingMember'));
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
      Alert.alert(t('common.error'), t('profile.fillName'));
      return;
    }

    if (!currentFamily) {
      Alert.alert(t('common.error'), t('settings.noFamily'));
      return;
    }

    try {
      // Update role if it's the current user
      const isCurrentUser = editingMember.id === currentUser?.id;
      const updateData: any = {
        name: newMemberName.trim(),
        color: newMemberColor,
        photo_uri: newMemberPhoto,
      };

      // Only allow role update for current user
      if (isCurrentUser) {
        updateData.role = newMemberRole;
      }

      const { error } = await supabase
        .from('family_members')
        .update(updateData)
        .eq('id', editingMember.id)
        .eq('family_id', currentFamily.id);

      if (error) {
        console.error('Error updating family member:', error);
        Alert.alert(t('common.error'), t('settings.couldNotUpdateMember'));
        return;
      }

      const updates: any = {
        name: newMemberName.trim(),
        color: newMemberColor,
        photoUri: newMemberPhoto || undefined,
      };

      if (isCurrentUser) {
        updates.role = newMemberRole;
      }

      updateFamilyMember(editingMember.id, updates);

      // If updating current user, update the current user state
      if (isCurrentUser) {
        const updatedUser = { ...currentUser, ...updates };
        setCurrentUser(updatedUser);
        await reloadCurrentUser();
      }

      setEditingMember(null);
      setNewMemberName('');
      setNewMemberRole('child');
      setNewMemberColor(AVAILABLE_COLORS[0].value);
      setNewMemberPhoto(null);
      setShowEditMemberModal(false);
      Alert.alert(t('common.success'), t('profile.memberUpdated'));
    } catch (error: any) {
      console.error('Error updating member:', error);
      Alert.alert(t('common.error'), t('settings.errorUpdatingMember'));
    }
  };

  const handleDeleteMember = (memberId: string, memberName: string) => {
    Alert.alert(
      t('profile.areYouSure'),
      t('settings.deleteMemberConfirm', { name: memberName }),
      [
        { 
          text: t('common.cancel'), 
          style: 'cancel' 
        },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteFamilyMember(memberId);
              Alert.alert(t('common.success'), t('profile.memberDeleted', { name: memberName }));
            } catch (error) {
              console.error('Error deleting member:', error);
              Alert.alert(t('common.error'), t('settings.couldNotDeleteMember'));
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('common.settings')}</Text>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* User Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('settings.account')}</Text>
            <View style={styles.card}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('common.name')}</Text>
                <Text style={styles.infoValue}>{currentUser?.name || t('settings.notSet')}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('settings.role')}</Text>
                <Text style={styles.infoValue}>
                  {currentUser?.role === 'parent' ? t('settings.parent') : t('settings.child')}
                </Text>
              </View>
            </View>
          </View>

          {/* Family Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('settings.family')}</Text>
            <View style={styles.card}>
              {/* Invitation Code */}
              <TouchableOpacity
                style={styles.settingRow}
                onPress={shareFamilyInvite}
              >
                <View style={styles.settingLeft}>
                  <IconSymbol
                    ios_icon_name="square.and.arrow.up"
                    android_material_icon_name="share"
                    size={24}
                    color={colors.vibrantOrange}
                  />
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingText}>{t('settings.shareInvitationCode')}</Text>
                    {familyCode && (
                      <Text style={styles.settingSubtext}>{t('settings.code')}: {familyCode}</Text>
                    )}
                  </View>
                </View>
                <IconSymbol
                  ios_icon_name="chevron.right"
                  android_material_icon_name="chevron-right"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>

              <View style={styles.divider} />

              {/* Children Management */}
              <View style={styles.familyMembersSection}>
                <View style={styles.familyMembersHeader}>
                  <Text style={styles.familyMembersTitle}>{t('settings.children')}</Text>
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

                {children.length === 0 ? (
                  <Text style={styles.emptyText}>{t('settings.noChildren')}</Text>
                ) : (
                  children.map((member, index) => (
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
                            {member.role === 'parent' ? t('settings.parent') : t('settings.child')}
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
                        </View>
                      </View>
                      {index < children.length - 1 && <View style={styles.divider} />}
                    </React.Fragment>
                  ))
                )}
              </View>
            </View>
          </View>

          {/* App Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('settings.appSettings')}</Text>
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.settingRow}
                onPress={() => setLanguageSelectorVisible(true)}
              >
                <View style={styles.settingLeft}>
                  <IconSymbol
                    ios_icon_name="globe"
                    android_material_icon_name="language"
                    size={24}
                    color={colors.vibrantOrange}
                  />
                  <Text style={styles.settingText}>{t('settings.changeLanguage')}</Text>
                </View>
                <IconSymbol
                  ios_icon_name="chevron.right"
                  android_material_icon_name="chevron-right"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity
                style={styles.settingRow}
                onPress={handleRefreshData}
                disabled={refreshing}
              >
                <View style={styles.settingLeft}>
                  <IconSymbol
                    ios_icon_name="arrow.clockwise"
                    android_material_icon_name="refresh"
                    size={24}
                    color={colors.vibrantOrange}
                  />
                  <Text style={styles.settingText}>
                    {refreshing ? t('settings.refreshing') : t('settings.refreshData')}
                  </Text>
                </View>
                <IconSymbol
                  ios_icon_name="chevron.right"
                  android_material_icon_name="chevron-right"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity
                style={styles.settingRow}
                onPress={handleLogout}
              >
                <View style={styles.settingLeft}>
                  <IconSymbol
                    ios_icon_name="rectangle.portrait.and.arrow.right"
                    android_material_icon_name="logout"
                    size={24}
                    color="#E74C3C"
                  />
                  <Text style={[styles.settingText, styles.logoutText]}>{t('common.logout')}</Text>
                </View>
                <IconSymbol
                  ios_icon_name="chevron.right"
                  android_material_icon_name="chevron-right"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Debug Info */}
          {__DEV__ && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Debug Info</Text>
              <View style={styles.card}>
                <Text style={styles.debugText}>
                  User ID: {currentUser?.id || 'None'}
                </Text>
                <Text style={styles.debugText}>
                  User Role: {currentUser?.role || 'None'}
                </Text>
                <Text style={styles.debugText}>
                  Family Code: {familyCode || 'None'}
                </Text>
                <Text style={styles.debugText}>
                  Children Count: {children.length}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Language Selector Modal */}
      <LanguageSelector
        visible={languageSelectorVisible}
        onClose={() => setLanguageSelectorVisible(false)}
      />

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
              <Text style={styles.modalTitle}>{t('settings.addChild')}</Text>

              <TouchableOpacity style={styles.photoPickerButton} onPress={handlePickImage}>
                {newMemberPhoto ? (
                  <Image source={{ uri: newMemberPhoto }} style={styles.photoPreview} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <View style={styles.cameraIconCircle}>
                      <IconSymbol
                        ios_icon_name="camera.fill"
                        android_material_icon_name="camera-alt"
                        size={40}
                        color={colors.card}
                      />
                    </View>
                  </View>
                )}
              </TouchableOpacity>

              <TextInput
                style={styles.input}
                placeholder={t('common.name')}
                placeholderTextColor={colors.textSecondary}
                value={newMemberName}
                onChangeText={setNewMemberName}
              />

              <Text style={styles.inputLabel}>{t('settings.chooseColor')}</Text>
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
                        <View style={styles.colorCheckmark}>
                          <IconSymbol
                            ios_icon_name="checkmark"
                            android_material_icon_name="check"
                            size={20}
                            color={colors.card}
                          />
                        </View>
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
                  <Text style={styles.modalButtonText}>{t('common.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonConfirm]}
                  onPress={handleAddMember}
                >
                  <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>{t('common.add')}</Text>
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
              <Text style={styles.modalTitle}>{t('settings.editFamilyMember')}</Text>

              <TouchableOpacity style={styles.photoPickerButton} onPress={handlePickImage}>
                {newMemberPhoto ? (
                  <Image source={{ uri: newMemberPhoto }} style={styles.photoPreview} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <View style={styles.cameraIconCircle}>
                      <IconSymbol
                        ios_icon_name="camera.fill"
                        android_material_icon_name="camera-alt"
                        size={40}
                        color={colors.card}
                      />
                    </View>
                  </View>
                )}
              </TouchableOpacity>

              <TextInput
                style={styles.input}
                placeholder={t('common.name')}
                placeholderTextColor={colors.textSecondary}
                value={newMemberName}
                onChangeText={setNewMemberName}
              />

              {editingMember?.id === currentUser?.id && (
                <>
                  <Text style={styles.inputLabel}>{t('settings.role')}</Text>
                  <View style={styles.roleSelector}>
                    <TouchableOpacity
                      style={[styles.roleButton, newMemberRole === 'parent' && styles.roleButtonActive]}
                      onPress={() => setNewMemberRole('parent')}
                    >
                      <Text style={[styles.roleButtonText, newMemberRole === 'parent' && styles.roleButtonTextActive]}>
                        {t('settings.parent')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.roleButton, newMemberRole === 'child' && styles.roleButtonActive]}
                      onPress={() => setNewMemberRole('child')}
                    >
                      <Text style={[styles.roleButtonText, newMemberRole === 'child' && styles.roleButtonTextActive]}>
                        {t('settings.child')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              <Text style={styles.inputLabel}>{t('settings.chooseColor')}</Text>
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
                        <View style={styles.colorCheckmark}>
                          <IconSymbol
                            ios_icon_name="checkmark"
                            android_material_icon_name="check"
                            size={20}
                            color={colors.card}
                          />
                        </View>
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
                  <Text style={styles.modalButtonText}>{t('common.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonConfirm]}
                  onPress={handleEditMember}
                >
                  <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>{t('common.save')}</Text>
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
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 48 : 12,
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
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Poppins_700Bold',
    marginBottom: 8,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
  },
  infoValue: {
    fontSize: 16,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  familyMembersSection: {
    marginTop: 8,
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
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
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
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
  },
  settingSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
    marginTop: 2,
  },
  logoutText: {
    color: '#E74C3C',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 8,
  },
  debugText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
    marginBottom: 4,
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
  photoPickerButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  photoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  cameraIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.vibrantOrange,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    color: colors.text,
    marginBottom: 15,
    fontFamily: 'Nunito_400Regular',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
    fontFamily: 'Poppins_600SemiBold',
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  roleButton: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  roleButtonActive: {
    borderColor: colors.vibrantOrange,
    backgroundColor: colors.primary,
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    fontFamily: 'Poppins_600SemiBold',
  },
  roleButtonTextActive: {
    color: colors.text,
  },
  colorSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
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
  colorCheckmark: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
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

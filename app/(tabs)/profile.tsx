
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useFamily } from '@/contexts/FamilyContext';
import IconPicker from '@/components/IconPicker';
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

export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { 
    familyMembers, 
    addFamilyMember, 
    updateFamilyMember, 
    deleteFamilyMember,
    currentUser, 
    setCurrentUser, 
    tasks, 
    deleteTask, 
    updateTask, 
    appointments, 
    addAppointment, 
    updateAppointment, 
    deleteAppointment,
    shareFamilyInvite,
    familyCode,
  } = useFamily();
  
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showEditMemberModal, setShowEditMemberModal] = useState(false);
  const [showManageChildTasksModal, setShowManageChildTasksModal] = useState(false);
  const [showManageChildPlanningModal, setShowManageChildPlanningModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [showAddAppointmentModal, setShowAddAppointmentModal] = useState(false);
  const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'parent' | 'child'>('child');
  const [newMemberColor, setNewMemberColor] = useState(AVAILABLE_COLORS[0].value);
  const [newMemberPhoto, setNewMemberPhoto] = useState<string | null>(null);
  const [editTaskName, setEditTaskName] = useState('');
  const [editTaskCoins, setEditTaskCoins] = useState('');
  const [editTaskIcon, setEditTaskIcon] = useState('check');
  const [editTaskRepeat, setEditTaskRepeat] = useState<'daily' | 'weekly' | 'monthly' | 'none'>('none');
  const [selectedChildForPlanning, setSelectedChildForPlanning] = useState<string>('');
  const [newAppointmentTitle, setNewAppointmentTitle] = useState('');
  const [newAppointmentDate, setNewAppointmentDate] = useState(new Date());
  const [newAppointmentTime, setNewAppointmentTime] = useState('09:00');
  const [newAppointmentRepeat, setNewAppointmentRepeat] = useState<'daily' | 'weekly' | 'monthly' | 'none'>('none');
  const [validationErrors, setValidationErrors] = useState<{[key: string]: boolean}>({});

  const isParent = currentUser?.role === 'parent';

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

  const handlePickMemberPhoto = async (memberId: string) => {
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
      updateFamilyMember(memberId, { photoUri: result.assets[0].uri });
      Alert.alert(t('profile.success'), t('profile.memberUpdated'));
    }
  };

  const handleAddMember = () => {
    if (!newMemberName.trim()) {
      Alert.alert(t('common.error'), t('profile.fillName'));
      return;
    }

    addFamilyMember({
      name: newMemberName.trim(),
      role: newMemberRole,
      coins: 0,
      color: newMemberColor,
      photoUri: newMemberPhoto || undefined,
    });

    setNewMemberName('');
    setNewMemberRole('child');
    setNewMemberColor(AVAILABLE_COLORS[0].value);
    setNewMemberPhoto(null);
    setShowAddMemberModal(false);
    Alert.alert(t('common.success'), t('profile.memberAdded', { name: newMemberName }));
  };

  const openEditMemberModal = (member: any) => {
    setEditingMember(member);
    setNewMemberName(member.name);
    setNewMemberRole(member.role);
    setNewMemberColor(member.color);
    setNewMemberPhoto(member.photoUri || null);
    setShowEditMemberModal(true);
  };

  const handleEditMember = () => {
    if (!newMemberName.trim()) {
      Alert.alert(t('common.error'), t('profile.fillName'));
      return;
    }

    updateFamilyMember(editingMember.id, {
      name: newMemberName.trim(),
      role: newMemberRole,
      color: newMemberColor,
      photoUri: newMemberPhoto || undefined,
    });

    setEditingMember(null);
    setNewMemberName('');
    setNewMemberRole('child');
    setNewMemberColor(AVAILABLE_COLORS[0].value);
    setNewMemberPhoto(null);
    setShowEditMemberModal(false);
    Alert.alert(t('common.success'), t('profile.memberUpdated'));
  };

  const handleDeleteMember = (memberId: string, memberName: string) => {
    Alert.alert(
      t('profile.areYouSure'),
      t('profile.deleteMember'),
      [
        { 
          text: t('common.cancel'), 
          style: 'cancel' 
        },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            deleteFamilyMember(memberId);
            Alert.alert(t('common.success'), t('profile.memberDeleted', { name: memberName }));
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('profile.deleteAccount'),
      t('profile.deleteAccountConfirm'),
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
              // Sign out the user
              const { error } = await supabase.auth.signOut();
              if (error) {
                console.error('Sign out error:', error);
                Alert.alert(t('common.error'), t('profile.errorDeleting'));
                return;
              }
              
              // Navigate to welcome screen
              Alert.alert(
                t('common.success'), 
                t('profile.dataDeleted'),
                [
                  {
                    text: t('common.ok'),
                    onPress: () => router.replace('/(auth)/welcome')
                  }
                ]
              );
            } catch (error) {
              console.error('Delete account error:', error);
              Alert.alert(t('common.error'), t('profile.errorDeleting'));
            }
          },
        },
      ]
    );
  };

  const handleDeleteAllData = () => {
    Alert.alert(
      t('profile.deleteAllData'),
      t('profile.deleteAllDataConfirm'),
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
              // Clear all local storage
              const AsyncStorage = await import('@react-native-async-storage/async-storage');
              await AsyncStorage.default.clear();
              
              // Sign out the user
              const { error } = await supabase.auth.signOut();
              if (error) {
                console.error('Sign out error:', error);
                Alert.alert(t('common.error'), t('profile.errorDeletingData'));
                return;
              }
              
              // Navigate to welcome screen
              Alert.alert(
                t('common.success'), 
                t('profile.dataDeleted'),
                [
                  {
                    text: t('common.ok'),
                    onPress: () => router.replace('/(auth)/welcome')
                  }
                ]
              );
            } catch (error) {
              console.error('Delete all data error:', error);
              Alert.alert(t('common.error'), t('profile.errorDeletingData'));
            }
          },
        },
      ]
    );
  };

  const handleDeleteTask = (taskId: string, taskName: string) => {
    Alert.alert(
      t('common.delete') + ' ' + t('tasks.title').toLowerCase(),
      t('tasks.deleteTaskConfirm', { name: taskName }),
      [
        { 
          text: t('common.cancel'), 
          style: 'cancel' 
        },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            deleteTask(taskId);
            Alert.alert(t('common.success'), t('profile.taskDeleted'));
          },
        },
      ]
    );
  };

  const openEditTaskModal = (task: any) => {
    setEditingTask(task);
    setEditTaskName(task.name);
    setEditTaskCoins(task.coins.toString());
    setEditTaskIcon(task.icon);
    setEditTaskRepeat(task.repeatType || 'none');
    setShowEditTaskModal(true);
  };

  const handleEditTask = () => {
    const errors: {[key: string]: boolean} = {};

    if (!editTaskName.trim()) {
      errors.taskName = true;
    }

    const coins = parseInt(editTaskCoins);
    if (isNaN(coins) || coins < 0) {
      errors.taskCoins = true;
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      Alert.alert(t('common.error'), t('profile.fillAllFieldsCorrectly'));
      return;
    }

    setValidationErrors({});

    updateTask(editingTask.id, {
      name: editTaskName.trim(),
      coins: coins,
      icon: editTaskIcon,
      repeatType: editTaskRepeat,
    });

    setEditingTask(null);
    setEditTaskName('');
    setEditTaskCoins('');
    setEditTaskIcon('check');
    setEditTaskRepeat('none');
    setShowEditTaskModal(false);
    Alert.alert(t('common.success'), t('profile.taskUpdated'));
  };

  const handleAddAppointment = () => {
    if (!newAppointmentTitle.trim()) {
      Alert.alert(t('common.error'), t('profile.fillTitle'));
      return;
    }

    if (!selectedChildForPlanning) {
      Alert.alert(t('common.error'), t('profile.selectChild'));
      return;
    }

    const child = children.find(c => c.id === selectedChildForPlanning);
    
    addAppointment({
      title: newAppointmentTitle.trim(),
      date: newAppointmentDate,
      time: newAppointmentTime,
      assignedTo: [selectedChildForPlanning],
      color: child?.color || colors.accent,
      repeatType: newAppointmentRepeat,
    });

    setNewAppointmentTitle('');
    setNewAppointmentDate(new Date());
    setNewAppointmentTime('09:00');
    setNewAppointmentRepeat('none');
    Alert.alert(t('common.success'), t('profile.appointmentAdded'));
  };

  const handleDeleteAppointment = (appointmentId: string, title: string) => {
    Alert.alert(
      t('common.delete') + ' ' + t('agenda.title').toLowerCase(),
      t('profile.deleteAppointmentConfirm'),
      [
        { 
          text: t('common.cancel'), 
          style: 'cancel' 
        },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            deleteAppointment(appointmentId);
            Alert.alert(t('common.success'), t('profile.appointmentDeleted'));
          },
        },
      ]
    );
  };

  const handleShareInvite = async () => {
    try {
      await shareFamilyInvite();
    } catch (error) {
      console.error('Error sharing invite:', error);
      Alert.alert(t('common.error'), t('profile.errorSharing'));
    }
  };

  const children = familyMembers.filter(m => m.role === 'child');
  const childTasks = tasks.filter(t => children.some(c => c.id === t.assignedTo));
  const childAppointments = appointments.filter(apt => 
    apt.assignedTo.some(id => children.some(c => c.id === id))
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.push('/(tabs)/(home)')}
        >
          <IconSymbol
            ios_icon_name="house"
            android_material_icon_name="home"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        
        <View style={styles.header}>
          <Text style={styles.title}>{t('profile.title')}</Text>
        </View>
        
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.subtitle}>{t('profile.subtitle')}</Text>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('profile.familyMembers')}</Text>
            {isParent && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowAddMemberModal(true)}
              >
                <IconSymbol
                  ios_icon_name="plus"
                  android_material_icon_name="add"
                  size={24}
                  color={colors.card}
                />
              </TouchableOpacity>
            )}
          </View>

          {familyMembers.map((member, index) => (
            <React.Fragment key={index}>
              <View style={styles.memberCard}>
                <TouchableOpacity
                  style={[styles.memberAvatar, { backgroundColor: member.color }]}
                  onPress={() => isParent && handlePickMemberPhoto(member.id)}
                >
                  {member.photoUri ? (
                    <Image source={{ uri: member.photoUri }} style={styles.memberPhoto} />
                  ) : (
                    <Text style={styles.memberAvatarText}>{member.name.charAt(0)}</Text>
                  )}
                  {isParent && (
                    <View style={styles.cameraIconOverlay}>
                      <IconSymbol
                        ios_icon_name="camera"
                        android_material_icon_name="camera-alt"
                        size={16}
                        color={colors.card}
                      />
                    </View>
                  )}
                </TouchableOpacity>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberRole}>
                    {member.role === 'parent' ? t('home.parent') : t('home.child')}
                  </Text>
                </View>
                {member.role === 'child' && (
                  <View style={styles.coinsContainer}>
                    <Text style={styles.coinsText}>{member.coins}</Text>
                    <Text style={styles.coinEmoji}>🪙</Text>
                  </View>
                )}
                {isParent && (
                  <View style={styles.memberActions}>
                    <TouchableOpacity
                      style={styles.editMemberButton}
                      onPress={() => openEditMemberModal(member)}
                    >
                      <IconSymbol
                        ios_icon_name="pencil"
                        android_material_icon_name="edit"
                        size={20}
                        color={colors.card}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteMemberButton}
                      onPress={() => handleDeleteMember(member.id, member.name)}
                    >
                      <IconSymbol
                        ios_icon_name="trash"
                        android_material_icon_name="delete"
                        size={20}
                        color={colors.card}
                      />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </React.Fragment>
          ))}
        </View>

        {isParent && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('profile.invitePartner')}</Text>
              <TouchableOpacity
                style={styles.inviteButton}
                onPress={handleShareInvite}
              >
                <IconSymbol
                  ios_icon_name="person-add"
                  android_material_icon_name="person-add"
                  size={24}
                  color={colors.card}
                />
                <Text style={styles.inviteButtonText}>{t('profile.invitePartnerButton')}</Text>
              </TouchableOpacity>
              {familyCode && (
                <View style={styles.codeCard}>
                  <Text style={styles.codeLabel}>{t('profile.yourFamilyCode')}</Text>
                  <Text style={styles.codeText}>{familyCode}</Text>
                  <Text style={styles.codeHint}>{t('profile.shareCodeHint')}</Text>
                </View>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('profile.manageChildren')}</Text>
              
              <TouchableOpacity
                style={styles.manageButton}
                onPress={() => setShowManageChildTasksModal(true)}
              >
                <IconSymbol
                  ios_icon_name="list-bullet"
                  android_material_icon_name="list"
                  size={24}
                  color={colors.card}
                />
                <Text style={styles.manageButtonText}>{t('profile.manageChildTasks')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.manageButton, { backgroundColor: colors.vibrantOrange }]}
                onPress={() => setShowManageChildPlanningModal(true)}
              >
                <IconSymbol
                  ios_icon_name="calendar"
                  android_material_icon_name="calendar-today"
                  size={24}
                  color={colors.card}
                />
                <Text style={styles.manageButtonText}>{t('profile.manageChildPlanning')}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Profile Switcher Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.switchProfile')}</Text>
          <TouchableOpacity
            style={styles.profileSwitcherButton}
            onPress={() => setShowProfileSwitcher(true)}
          >
            <View style={[styles.currentUserAvatar, { backgroundColor: currentUser?.color || colors.accent }]}>
              {currentUser?.photoUri ? (
                <Image source={{ uri: currentUser.photoUri }} style={styles.currentUserPhoto} />
              ) : (
                <Text style={styles.currentUserAvatarText}>{currentUser?.name.charAt(0)}</Text>
              )}
            </View>
            <View style={styles.currentUserInfo}>
              <Text style={styles.currentUserName}>{currentUser?.name}</Text>
              <Text style={styles.currentUserRole}>
                {currentUser?.role === 'parent' ? t('home.parent') : t('home.child')}
              </Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={24}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Language Selector Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('language.title')}</Text>
          <TouchableOpacity
            style={styles.profileSwitcherButton}
            onPress={() => setShowLanguageSelector(true)}
          >
            <View style={styles.languageIcon}>
              <IconSymbol
                ios_icon_name="globe"
                android_material_icon_name="language"
                size={24}
                color={colors.accent}
              />
            </View>
            <View style={styles.currentUserInfo}>
              <Text style={styles.currentUserName}>{t('language.change')}</Text>
              <Text style={styles.currentUserRole}>{t('language.current')}</Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={24}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* App Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.appInfo')}</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>{t('profile.appName')}</Text>
            <Text style={styles.infoSubtext}>{t('profile.version')}</Text>
            <Text style={styles.infoNote}>{t('profile.appNote')}</Text>
          </View>
        </View>

        {/* Delete Account Section - Only for parents */}
        {isParent && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('profile.accountManagement')}</Text>
            
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteAccount}
            >
              <IconSymbol
                ios_icon_name="trash"
                android_material_icon_name="delete"
                size={20}
                color={colors.card}
              />
              <Text style={styles.deleteButtonText}>{t('profile.deleteAccount')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.deleteButton, { marginTop: 10 }]}
              onPress={handleDeleteAllData}
            >
              <IconSymbol
                ios_icon_name="trash"
                android_material_icon_name="delete-forever"
                size={20}
                color={colors.card}
              />
              <Text style={styles.deleteButtonText}>{t('profile.deleteAllData')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Language Selector Modal */}
      <LanguageSelector
        visible={showLanguageSelector}
        onClose={() => setShowLanguageSelector(false)}
      />

      {/* Profile Switcher Modal */}
      <Modal
        visible={showProfileSwitcher}
        transparent
        animationType="slide"
        onRequestClose={() => setShowProfileSwitcher(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.profileSwitcherModal}>
            <Text style={styles.modalTitle}>{t('profile.switchProfile')}</Text>
            <Text style={styles.profileSwitcherSubtitle}>{t('profile.switchProfileSubtitle')}</Text>
            
            {familyMembers.map((member, index) => (
              <React.Fragment key={index}>
                <TouchableOpacity
                  style={[
                    styles.profileOption,
                    currentUser?.id === member.id && styles.profileOptionActive
                  ]}
                  onPress={() => {
                    setCurrentUser(member);
                    setShowProfileSwitcher(false);
                    router.push('/(tabs)/(home)');
                  }}
                >
                  <View style={[styles.profileOptionAvatar, { backgroundColor: member.color || colors.accent }]}>
                    {member.photoUri ? (
                      <Image source={{ uri: member.photoUri }} style={styles.profileOptionPhoto} />
                    ) : (
                      <Text style={styles.profileOptionAvatarText}>{member.name.charAt(0)}</Text>
                    )}
                  </View>
                  <View style={styles.profileOptionInfo}>
                    <Text style={styles.profileOptionName}>{member.name}</Text>
                    <Text style={styles.profileOptionRole}>
                      {member.role === 'parent' ? t('home.parent') : t('home.child')}
                    </Text>
                  </View>
                  {currentUser?.id === member.id && (
                    <IconSymbol
                      ios_icon_name="checkmark"
                      android_material_icon_name="check"
                      size={24}
                      color={colors.vibrantGreen}
                    />
                  )}
                </TouchableOpacity>
              </React.Fragment>
            ))}

            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonCancel, { marginTop: 20 }]}
              onPress={() => setShowProfileSwitcher(false)}
            >
              <Text style={styles.modalButtonText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
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
              <Text style={styles.modalTitle}>{t('profile.addMember')}</Text>

              <TouchableOpacity style={styles.photoPickerButton} onPress={handlePickImage}>
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
                    <Text style={styles.photoPlaceholderText}>{t('profile.addPhoto')}</Text>
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

              <Text style={styles.inputLabel}>{t('profile.role')}</Text>
              <View style={styles.roleSelector}>
                <TouchableOpacity
                  style={[styles.roleButton, newMemberRole === 'child' && styles.roleButtonActive]}
                  onPress={() => setNewMemberRole('child')}
                >
                  <Text style={[styles.roleButtonText, newMemberRole === 'child' && styles.roleButtonTextActive]}>
                    {t('home.child')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.roleButton, newMemberRole === 'parent' && styles.roleButtonActive]}
                  onPress={() => setNewMemberRole('parent')}
                >
                  <Text style={[styles.roleButtonText, newMemberRole === 'parent' && styles.roleButtonTextActive]}>
                    {t('home.parent')}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>{t('profile.chooseColor')}</Text>
              <Text style={styles.colorHint}>{t('profile.colorHint')}</Text>
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

              <View style={styles.previewCard}>
                <Text style={styles.previewLabel}>{t('profile.preview')}</Text>
                <View style={[styles.previewAvatar, { backgroundColor: newMemberColor }]}>
                  {newMemberPhoto ? (
                    <Image source={{ uri: newMemberPhoto }} style={styles.previewPhoto} />
                  ) : (
                    <Text style={styles.previewAvatarText}>
                      {newMemberName ? newMemberName.charAt(0).toUpperCase() : '?'}
                    </Text>
                  )}
                </View>
                <Text style={styles.previewName}>{newMemberName || t('common.name')}</Text>
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
              <Text style={styles.modalTitle}>{t('profile.editMember')}</Text>

              <TouchableOpacity style={styles.photoPickerButton} onPress={handlePickImage}>
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
                    <Text style={styles.photoPlaceholderText}>{t('profile.addPhoto')}</Text>
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

              <Text style={styles.inputLabel}>{t('profile.role')}</Text>
              <View style={styles.roleSelector}>
                <TouchableOpacity
                  style={[styles.roleButton, newMemberRole === 'child' && styles.roleButtonActive]}
                  onPress={() => setNewMemberRole('child')}
                >
                  <Text style={[styles.roleButtonText, newMemberRole === 'child' && styles.roleButtonTextActive]}>
                    {t('home.child')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.roleButton, newMemberRole === 'parent' && styles.roleButtonActive]}
                  onPress={() => setNewMemberRole('parent')}
                >
                  <Text style={[styles.roleButtonText, newMemberRole === 'parent' && styles.roleButtonTextActive]}>
                    {t('home.parent')}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>{t('profile.chooseColor')}</Text>
              <Text style={styles.colorHint}>{t('profile.colorHint')}</Text>
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

              <View style={styles.previewCard}>
                <Text style={styles.previewLabel}>{t('profile.preview')}</Text>
                <View style={[styles.previewAvatar, { backgroundColor: newMemberColor }]}>
                  {newMemberPhoto ? (
                    <Image source={{ uri: newMemberPhoto }} style={styles.previewPhoto} />
                  ) : (
                    <Text style={styles.previewAvatarText}>
                      {newMemberName ? newMemberName.charAt(0).toUpperCase() : '?'}
                    </Text>
                  )}
                </View>
                <Text style={styles.previewName}>{newMemberName || t('common.name')}</Text>
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

      {/* Manage Child Tasks Modal */}
      <Modal
        visible={showManageChildTasksModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowManageChildTasksModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('profile.manageChildTasks')}</Text>
            
            <ScrollView style={styles.tasksList}>
              {childTasks.length === 0 ? (
                <View style={styles.emptyTasks}>
                  <Text style={styles.emptyTasksText}>{t('profile.noTasks')}</Text>
                </View>
              ) : (
                childTasks.map((task, index) => {
                  const assignedChild = children.find(c => c.id === task.assignedTo);
                  return (
                    <React.Fragment key={index}>
                      <View style={styles.taskManageCard}>
                        <View style={styles.taskManageInfo}>
                          <Text style={styles.taskManageName}>{task.name}</Text>
                          <Text style={styles.taskManageMeta}>
                            {assignedChild?.name} • {task.coins}🪙
                            {task.repeatType && task.repeatType !== 'none' && (
                              <Text> • 🔄 {
                                task.repeatType === 'daily' ? t('tasks.daily') :
                                task.repeatType === 'weekly' ? t('tasks.weekly') :
                                task.repeatType === 'monthly' ? t('tasks.monthly') : ''
                              }</Text>
                            )}
                          </Text>
                        </View>
                        <View style={styles.taskActions}>
                          <TouchableOpacity
                            style={styles.editTaskButton}
                            onPress={() => {
                              setShowManageChildTasksModal(false);
                              openEditTaskModal(task);
                            }}
                          >
                            <IconSymbol
                              ios_icon_name="pencil"
                              android_material_icon_name="edit"
                              size={20}
                              color={colors.card}
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.deleteTaskButton}
                            onPress={() => handleDeleteTask(task.id, task.name)}
                          >
                            <IconSymbol
                              ios_icon_name="trash"
                              android_material_icon_name="delete"
                              size={20}
                              color={colors.card}
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </React.Fragment>
                  );
                })
              )}
            </ScrollView>

            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonConfirm, { marginTop: 20 }]}
              onPress={() => setShowManageChildTasksModal(false)}
            >
              <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>{t('common.close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Manage Child Planning Modal */}
      <Modal
        visible={showManageChildPlanningModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowManageChildPlanningModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{t('profile.manageChildPlanning')}</Text>
              
              <Text style={styles.inputLabel}>{t('profile.selectChild')}</Text>
              <View style={styles.childSelector}>
                {children.map((child, index) => (
                  <React.Fragment key={index}>
                    <TouchableOpacity
                      style={[
                        styles.childOption,
                        selectedChildForPlanning === child.id && styles.childOptionActive,
                      ]}
                      onPress={() => setSelectedChildForPlanning(child.id)}
                    >
                      <View style={[styles.childOptionAvatar, { backgroundColor: child.color }]}>
                        {child.photoUri ? (
                          <Image source={{ uri: child.photoUri }} style={styles.childOptionPhoto} />
                        ) : (
                          <Text style={styles.childOptionAvatarText}>{child.name.charAt(0)}</Text>
                        )}
                      </View>
                      <Text style={styles.childOptionName}>{child.name}</Text>
                    </TouchableOpacity>
                  </React.Fragment>
                ))}
              </View>

              {selectedChildForPlanning && (
                <>
                  <View style={styles.divider} />
                  
                  <Text style={styles.sectionSubtitle}>{t('profile.addAppointments')}</Text>
                  
                  <TextInput
                    style={styles.input}
                    placeholder={t('profile.appointmentTitle')}
                    placeholderTextColor={colors.textSecondary}
                    value={newAppointmentTitle}
                    onChangeText={setNewAppointmentTitle}
                  />

                  <TextInput
                    style={styles.input}
                    placeholder={t('profile.timePlaceholder')}
                    placeholderTextColor={colors.textSecondary}
                    value={newAppointmentTime}
                    onChangeText={setNewAppointmentTime}
                  />

                  <Text style={styles.inputLabel}>{t('profile.repeat')}</Text>
                  <View style={styles.repeatSelector}>
                    {[
                      { value: 'none', label: t('profile.repeatNone') },
                      { value: 'daily', label: t('profile.repeatDaily') },
                      { value: 'weekly', label: t('profile.repeatWeekly') },
                      { value: 'monthly', label: t('profile.repeatMonthly') },
                    ].map((option, index) => (
                      <React.Fragment key={index}>
                        <TouchableOpacity
                          style={[
                            styles.repeatOption,
                            newAppointmentRepeat === option.value && styles.repeatOptionActive,
                          ]}
                          onPress={() => setNewAppointmentRepeat(option.value as any)}
                        >
                          <Text
                            style={[
                              styles.repeatOptionText,
                              newAppointmentRepeat === option.value && styles.repeatOptionTextActive,
                            ]}
                          >
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      </React.Fragment>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={[styles.addAppointmentButton]}
                    onPress={handleAddAppointment}
                  >
                    <IconSymbol
                      ios_icon_name="plus"
                      android_material_icon_name="add"
                      size={20}
                      color={colors.card}
                    />
                    <Text style={styles.addAppointmentButtonText}>{t('profile.addAppointment')}</Text>
                  </TouchableOpacity>

                  <Text style={styles.sectionSubtitle}>{t('profile.currentAppointments')}</Text>
                  
                  <ScrollView style={styles.appointmentsList}>
                    {childAppointments.filter(apt => apt.assignedTo.includes(selectedChildForPlanning)).length === 0 ? (
                      <View style={styles.emptyTasks}>
                        <Text style={styles.emptyTasksText}>{t('profile.noAppointments')}</Text>
                      </View>
                    ) : (
                      childAppointments
                        .filter(apt => apt.assignedTo.includes(selectedChildForPlanning))
                        .map((apt, index) => (
                          <React.Fragment key={index}>
                            <View style={styles.appointmentCard}>
                              <View style={styles.appointmentInfo}>
                                <Text style={styles.appointmentTitle}>{apt.title}</Text>
                                <Text style={styles.appointmentMeta}>
                                  {apt.time} • {apt.date.toLocaleDateString('nl-NL')}
                                  {apt.repeatType !== 'none' && (
                                    <Text> • 🔄 {
                                      apt.repeatType === 'daily' ? t('profile.repeatDaily') :
                                      apt.repeatType === 'weekly' ? t('profile.repeatWeekly') :
                                      apt.repeatType === 'monthly' ? t('profile.repeatMonthly') : ''
                                    }</Text>
                                  )}
                                </Text>
                              </View>
                              <TouchableOpacity
                                style={styles.deleteTaskButton}
                                onPress={() => handleDeleteAppointment(apt.id, apt.title)}
                              >
                                <IconSymbol
                                  ios_icon_name="trash"
                                  android_material_icon_name="delete"
                                  size={20}
                                  color={colors.card}
                                />
                              </TouchableOpacity>
                            </View>
                          </React.Fragment>
                        ))
                    )}
                  </ScrollView>
                </>
              )}

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel, { marginTop: 20 }]}
                onPress={() => {
                  setShowManageChildPlanningModal(false);
                  setSelectedChildForPlanning('');
                  setNewAppointmentTitle('');
                  setNewAppointmentTime('09:00');
                  setNewAppointmentRepeat('none');
                }}
              >
                <Text style={styles.modalButtonText}>{t('common.close')}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        visible={showEditTaskModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditTaskModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{t('tasks.editTask')}</Text>

              <TextInput
                style={[
                  styles.input,
                  validationErrors.taskName && styles.inputError
                ]}
                placeholder={t('tasks.taskName')}
                placeholderTextColor={validationErrors.taskName ? '#E74C3C' : colors.textSecondary}
                value={editTaskName}
                onChangeText={(text) => {
                  setEditTaskName(text);
                  if (validationErrors.taskName && text.trim()) {
                    setValidationErrors(prev => ({ ...prev, taskName: false }));
                  }
                }}
              />

              <TextInput
                style={[
                  styles.input,
                  validationErrors.taskCoins && styles.inputError
                ]}
                placeholder={t('rewards.coins', { count: 0 })}
                placeholderTextColor={validationErrors.taskCoins ? '#E74C3C' : colors.textSecondary}
                value={editTaskCoins}
                onChangeText={(text) => {
                  setEditTaskCoins(text);
                  if (validationErrors.taskCoins && text.trim()) {
                    setValidationErrors(prev => ({ ...prev, taskCoins: false }));
                  }
                }}
                keyboardType="numeric"
              />

              <IconPicker
                selectedIcon={editTaskIcon}
                onSelectIcon={setEditTaskIcon}
                type="task"
                taskName={editTaskName}
              />

              <Text style={styles.inputLabel}>{t('profile.repeat')}</Text>
              <View style={styles.repeatSelector}>
                {[
                  { value: 'none', label: t('profile.repeatNone') },
                  { value: 'daily', label: t('profile.repeatDaily') },
                  { value: 'weekly', label: t('profile.repeatWeekly') },
                  { value: 'monthly', label: t('profile.repeatMonthly') },
                ].map((option, index) => (
                  <React.Fragment key={index}>
                    <TouchableOpacity
                      style={[
                        styles.repeatOption,
                        editTaskRepeat === option.value && styles.repeatOptionActive,
                      ]}
                      onPress={() => setEditTaskRepeat(option.value as any)}
                    >
                      <Text
                        style={[
                          styles.repeatOptionText,
                          editTaskRepeat === option.value && styles.repeatOptionTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  </React.Fragment>
                ))}
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => {
                    setShowEditTaskModal(false);
                    setEditingTask(null);
                    setEditTaskName('');
                    setEditTaskCoins('');
                    setEditTaskIcon('check');
                    setEditTaskRepeat('none');
                    setValidationErrors({});
                  }}
                >
                  <Text style={styles.modalButtonText}>{t('common.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonConfirm]}
                  onPress={handleEditTask}
                >
                  <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>{t('common.save')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: `0px 2px 8px ${colors.shadow}`,
    elevation: 2,
  },
  header: {
    flex: 1,
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 140,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 5,
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Nunito_400Regular',
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 15,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 10,
    marginTop: 10,
  },
  addButton: {
    backgroundColor: colors.accent,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    overflow: 'hidden',
    position: 'relative',
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
  cameraIconOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.accent,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    fontFamily: 'Poppins_600SemiBold',
  },
  memberRole: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.highlight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
  },
  coinsText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.card,
    marginRight: 5,
    fontFamily: 'Poppins_700Bold',
  },
  coinEmoji: {
    fontSize: 16,
  },
  memberActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editMemberButton: {
    backgroundColor: colors.vibrantOrange,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteMemberButton: {
    backgroundColor: '#E74C3C',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inviteButton: {
    backgroundColor: colors.vibrantGreen,
    borderRadius: 20,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
    marginBottom: 15,
  },
  inviteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.card,
    marginLeft: 10,
    fontFamily: 'Poppins_600SemiBold',
  },
  codeCard: {
    backgroundColor: colors.card,
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  codeLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    fontFamily: 'Nunito_400Regular',
  },
  codeText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.accent,
    letterSpacing: 4,
    fontFamily: 'Poppins_700Bold',
    marginBottom: 8,
  },
  codeHint: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontFamily: 'Nunito_400Regular',
  },
  manageButton: {
    backgroundColor: colors.secondary,
    borderRadius: 20,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
    marginBottom: 12,
  },
  manageButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.card,
    marginLeft: 10,
    fontFamily: 'Poppins_600SemiBold',
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  infoText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 5,
    fontFamily: 'Poppins_600SemiBold',
  },
  infoSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 10,
    fontFamily: 'Nunito_400Regular',
  },
  infoNote: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: 'Nunito_400Regular',
  },
  deleteButton: {
    backgroundColor: '#E74C3C',
    borderRadius: 20,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.card,
    marginLeft: 10,
    fontFamily: 'Poppins_600SemiBold',
  },
  profileSwitcherButton: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  currentUserAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    overflow: 'hidden',
  },
  currentUserPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  currentUserAvatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.card,
    fontFamily: 'Poppins_700Bold',
  },
  languageIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  currentUserInfo: {
    flex: 1,
  },
  currentUserName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    fontFamily: 'Poppins_600SemiBold',
  },
  currentUserRole: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
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
    maxHeight: '80%',
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
  profileSwitcherModal: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    boxShadow: `0px 8px 24px ${colors.shadow}`,
    elevation: 5,
  },
  profileSwitcherSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Nunito_400Regular',
  },
  profileOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  profileOptionActive: {
    borderColor: colors.vibrantGreen,
    backgroundColor: colors.primary,
  },
  profileOptionAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    overflow: 'hidden',
  },
  profileOptionPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  profileOptionAvatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.card,
    fontFamily: 'Poppins_700Bold',
  },
  profileOptionInfo: {
    flex: 1,
  },
  profileOptionName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
    fontFamily: 'Poppins_600SemiBold',
  },
  profileOptionRole: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
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
  },
  photoPlaceholderText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 5,
    fontFamily: 'Nunito_400Regular',
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
  inputError: {
    borderColor: '#E74C3C',
    backgroundColor: '#FFE5E5',
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
    marginBottom: 20,
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
    borderColor: colors.accent,
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
  colorHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 10,
    fontFamily: 'Nunito_400Regular',
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
  previewCard: {
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 10,
    fontFamily: 'Poppins_600SemiBold',
  },
  previewAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  previewPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  previewAvatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.card,
    fontFamily: 'Poppins_700Bold',
  },
  previewName: {
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
    backgroundColor: colors.accent,
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
  tasksList: {
    maxHeight: 400,
  },
  emptyTasks: {
    padding: 20,
    alignItems: 'center',
  },
  emptyTasksText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  taskManageCard: {
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  taskManageInfo: {
    flex: 1,
  },
  taskManageName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    fontFamily: 'Poppins_600SemiBold',
  },
  taskManageMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  taskActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editTaskButton: {
    backgroundColor: colors.vibrantOrange,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteTaskButton: {
    backgroundColor: '#E74C3C',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  repeatSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  repeatOption: {
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 12,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  repeatOptionActive: {
    borderColor: colors.accent,
    backgroundColor: colors.primary,
  },
  repeatOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    fontFamily: 'Poppins_600SemiBold',
  },
  repeatOptionTextActive: {
    color: colors.text,
  },
  childSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  childOption: {
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 10,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  childOptionActive: {
    borderColor: colors.vibrantOrange,
    backgroundColor: colors.primary,
  },
  childOptionAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    overflow: 'hidden',
  },
  childOptionPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  childOptionAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.card,
    fontFamily: 'Poppins_700Bold',
  },
  childOptionName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
  },
  divider: {
    height: 1,
    backgroundColor: colors.textSecondary,
    opacity: 0.2,
    marginVertical: 20,
  },
  addAppointmentButton: {
    backgroundColor: colors.vibrantOrange,
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  addAppointmentButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.card,
    marginLeft: 10,
    fontFamily: 'Poppins_600SemiBold',
  },
  appointmentsList: {
    maxHeight: 200,
  },
  appointmentCard: {
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    fontFamily: 'Poppins_600SemiBold',
  },
  appointmentMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
});

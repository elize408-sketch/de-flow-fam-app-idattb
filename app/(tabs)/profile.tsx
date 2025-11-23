
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, Image } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useFamily } from '@/contexts/FamilyContext';
import * as ImagePicker from 'expo-image-picker';

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
  const { familyMembers, addFamilyMember, updateFamilyMember, currentUser, tasks, deleteTask } = useFamily();
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showManageChildTasksModal, setShowManageChildTasksModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'parent' | 'child'>('child');
  const [newMemberColor, setNewMemberColor] = useState(AVAILABLE_COLORS[0].value);
  const [newMemberPhoto, setNewMemberPhoto] = useState<string | null>(null);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  const isParent = currentUser?.role === 'parent';

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Toestemming vereist', 'Je moet toegang geven tot je foto\'s om een profielfoto te kunnen toevoegen.');
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
      Alert.alert('Toestemming vereist', 'Je moet toegang geven tot je foto\'s om een profielfoto te kunnen toevoegen.');
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
      Alert.alert('Gelukt!', 'Profielfoto bijgewerkt');
    }
  };

  const handleAddMember = () => {
    if (!newMemberName.trim()) {
      Alert.alert('Fout', 'Vul een naam in');
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
    Alert.alert('Gelukt!', `${newMemberName} is toegevoegd aan het gezin`);
  };

  const handleDeleteTask = (taskId: string, taskName: string) => {
    Alert.alert(
      'Taak verwijderen',
      `Weet je zeker dat je "${taskName}" wilt verwijderen?`,
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Verwijderen',
          style: 'destructive',
          onPress: () => {
            deleteTask(taskId);
            Alert.alert('Gelukt!', 'Taak verwijderd');
          },
        },
      ]
    );
  };

  const children = familyMembers.filter(m => m.role === 'child');
  const childTasks = tasks.filter(t => children.some(c => c.id === t.assignedTo));

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Instellingen</Text>
          <Text style={styles.subtitle}>Beheer je gezin</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Gezinsleden</Text>
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
                    {member.role === 'parent' ? '👨‍👩‍👧‍👦 Ouder' : '👶 Kind'}
                  </Text>
                </View>
                {member.role === 'child' && (
                  <View style={styles.coinsContainer}>
                    <Text style={styles.coinsText}>{member.coins}</Text>
                    <Text style={styles.coinEmoji}>🪙</Text>
                  </View>
                )}
              </View>
            </React.Fragment>
          ))}
        </View>

        {isParent && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.manageTasksButton}
              onPress={() => setShowManageChildTasksModal(true)}
            >
              <IconSymbol
                ios_icon_name="list-bullet"
                android_material_icon_name="list"
                size={24}
                color={colors.card}
              />
              <Text style={styles.manageTasksButtonText}>Taken van kinderen beheren</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App informatie</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>Flow Fam App</Text>
            <Text style={styles.infoSubtext}>Versie 1.0.0</Text>
            <Text style={styles.infoNote}>
              💡 Deze app kan door beide ouders geïnstalleerd worden op hun eigen telefoon voor gezamenlijk gebruik.
            </Text>
          </View>
        </View>
      </ScrollView>

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
              <Text style={styles.modalTitle}>Nieuw gezinslid toevoegen</Text>

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
                    <Text style={styles.photoPlaceholderText}>Foto toevoegen</Text>
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

              <Text style={styles.inputLabel}>Rol:</Text>
              <View style={styles.roleSelector}>
                <TouchableOpacity
                  style={[styles.roleButton, newMemberRole === 'child' && styles.roleButtonActive]}
                  onPress={() => setNewMemberRole('child')}
                >
                  <Text style={[styles.roleButtonText, newMemberRole === 'child' && styles.roleButtonTextActive]}>
                    👶 Kind
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.roleButton, newMemberRole === 'parent' && styles.roleButtonActive]}
                  onPress={() => setNewMemberRole('parent')}
                >
                  <Text style={[styles.roleButtonText, newMemberRole === 'parent' && styles.roleButtonTextActive]}>
                    👨‍👩‍👧‍👦 Ouder
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Kies een kleur:</Text>
              <Text style={styles.colorHint}>Deze kleur wordt gebruikt in de agenda voor afspraken</Text>
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
                <Text style={styles.previewLabel}>Voorbeeld:</Text>
                <View style={[styles.previewAvatar, { backgroundColor: newMemberColor }]}>
                  {newMemberPhoto ? (
                    <Image source={{ uri: newMemberPhoto }} style={styles.previewPhoto} />
                  ) : (
                    <Text style={styles.previewAvatarText}>
                      {newMemberName ? newMemberName.charAt(0).toUpperCase() : '?'}
                    </Text>
                  )}
                </View>
                <Text style={styles.previewName}>{newMemberName || 'Naam'}</Text>
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

      {/* Manage Child Tasks Modal */}
      <Modal
        visible={showManageChildTasksModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowManageChildTasksModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Taken van kinderen beheren</Text>
            
            <ScrollView style={styles.tasksList}>
              {childTasks.length === 0 ? (
                <View style={styles.emptyTasks}>
                  <Text style={styles.emptyTasksText}>Nog geen taken voor kinderen</Text>
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
                          </Text>
                        </View>
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
                    </React.Fragment>
                  );
                })
              )}
            </ScrollView>

            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonConfirm, { marginTop: 20 }]}
              onPress={() => setShowManageChildTasksModal(false)}
            >
              <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>Sluiten</Text>
            </TouchableOpacity>
          </View>
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
  contentContainer: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Poppins_700Bold',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 5,
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
  manageTasksButton: {
    backgroundColor: colors.secondary,
    borderRadius: 20,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  manageTasksButtonText: {
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
  deleteTaskButton: {
    backgroundColor: '#E74C3C',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});


import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useFamily } from '@/contexts/FamilyContext';
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

export default function FamilySettingsScreen() {
  const router = useRouter();
  const { 
    familyMembers, 
    addFamilyMember, 
    updateFamilyMember, 
    deleteFamilyMember,
    currentUser,
    currentFamily,
  } = useFamily();

  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showEditMemberModal, setShowEditMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'parent' | 'child'>('child');
  const [newMemberColor, setNewMemberColor] = useState(AVAILABLE_COLORS[0].value);
  const [newMemberPhoto, setNewMemberPhoto] = useState<string | null>(null);

  const isParent = currentUser?.role === 'parent';

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
      // Add to Supabase
      const { data, error } = await supabase
        .from('family_members')
        .insert([{
          family_id: currentFamily.id,
          user_id: null, // Children don't have user accounts
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

      // Add to local state
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
      // Update in Supabase
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

      // Update local state
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

  const handlePickMemberPhoto = async (memberId: string) => {
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
      if (!currentFamily) {
        Alert.alert('Fout', 'Geen gezin gevonden');
        return;
      }

      try {
        // Update in Supabase
        const { error } = await supabase
          .from('family_members')
          .update({ photo_uri: result.assets[0].uri })
          .eq('id', memberId)
          .eq('family_id', currentFamily.id);

        if (error) {
          console.error('Error updating photo:', error);
          Alert.alert('Fout', 'Kon foto niet bijwerken');
          return;
        }

        // Update local state
        updateFamilyMember(memberId, { photoUri: result.assets[0].uri });
        Alert.alert('Gelukt!', 'Foto bijgewerkt');
      } catch (error: any) {
        console.error('Error updating photo:', error);
        Alert.alert('Fout', 'Er ging iets mis bij het bijwerken van de foto');
      }
    }
  };

  if (!isParent) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <IconSymbol
                ios_icon_name="chevron.left"
                android_material_icon_name="arrow-back"
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Gezinsinstellingen</Text>
          </View>

          <View style={styles.noAccessContainer}>
            <IconSymbol
              ios_icon_name="lock.fill"
              android_material_icon_name="lock"
              size={64}
              color={colors.textSecondary}
            />
            <Text style={styles.noAccessTitle}>Geen toegang</Text>
            <Text style={styles.noAccessText}>
              Alleen ouders kunnen gezinsinstellingen beheren
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="arrow-back"
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Gezinsinstellingen</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddMemberModal(true)}
          >
            <IconSymbol
              ios_icon_name="plus"
              android_material_icon_name="add"
              size={24}
              color={colors.vibrantOrange}
            />
          </TouchableOpacity>
        </View>

        {/* Family Members List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Gezinsleden</Text>
          <Text style={styles.sectionSubtitle}>
            Beheer alle gezinsleden en hun gegevens
          </Text>

          {familyMembers.map((member, index) => (
            <React.Fragment key={index}>
              <View style={styles.memberCard}>
                <TouchableOpacity
                  style={[styles.memberAvatar, { backgroundColor: member.color }]}
                  onPress={() => handlePickMemberPhoto(member.id)}
                >
                  {member.photoUri ? (
                    <Image source={{ uri: member.photoUri }} style={styles.memberPhoto} />
                  ) : (
                    <Text style={styles.memberAvatarText}>{member.name.charAt(0)}</Text>
                  )}
                  <View style={styles.cameraIconOverlay}>
                    <IconSymbol
                      ios_icon_name="camera"
                      android_material_icon_name="camera-alt"
                      size={16}
                      color={colors.card}
                    />
                  </View>
                </TouchableOpacity>

                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberRole}>
                    {member.role === 'parent' ? 'Ouder' : 'Kind'}
                  </Text>
                  {member.role === 'child' && (
                    <View style={styles.coinsContainer}>
                      <Text style={styles.coinsText}>{member.coins}</Text>
                      <Text style={styles.coinEmoji}>🪙</Text>
                    </View>
                  )}
                </View>

                <View style={styles.memberActions}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => openEditMemberModal(member)}
                  >
                    <IconSymbol
                      ios_icon_name="pencil"
                      android_material_icon_name="edit"
                      size={20}
                      color={colors.card}
                    />
                  </TouchableOpacity>
                  {member.role === 'child' && (
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteMember(member.id, member.name)}
                    >
                      <IconSymbol
                        ios_icon_name="trash"
                        android_material_icon_name="delete"
                        size={20}
                        color={colors.card}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </React.Fragment>
          ))}

          <View style={styles.infoBox}>
            <IconSymbol
              ios_icon_name="info.circle.fill"
              android_material_icon_name="info"
              size={24}
              color={colors.vibrantOrange}
            />
            <Text style={styles.infoText}>
              Ouders kunnen alleen worden toegevoegd via de uitnodigingscode. 
              Kinderen kunnen hier worden toegevoegd en beheerd.
            </Text>
          </View>
        </ScrollView>
      </View>

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

              <Text style={styles.inputLabel}>Rol</Text>
              <View style={styles.roleSelector}>
                <TouchableOpacity
                  style={[styles.roleButton, newMemberRole === 'child' && styles.roleButtonActive]}
                  onPress={() => setNewMemberRole('child')}
                >
                  <Text style={[styles.roleButtonText, newMemberRole === 'child' && styles.roleButtonTextActive]}>
                    Kind
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.roleHint}>
                Opmerking: Ouders kunnen alleen worden toegevoegd via de uitnodigingscode.
              </Text>

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
                <Text style={styles.previewLabel}>Voorbeeld</Text>
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
                <Text style={styles.previewLabel}>Voorbeeld</Text>
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
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 48 : 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Poppins_700Bold',
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Poppins_700Bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
    marginBottom: 20,
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
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    overflow: 'hidden',
    position: 'relative',
  },
  memberPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  memberAvatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.card,
    fontFamily: 'Poppins_700Bold',
  },
  cameraIconOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.vibrantOrange,
    width: 24,
    height: 24,
    borderRadius: 12,
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
    marginBottom: 4,
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  coinsText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.highlight,
    marginRight: 4,
    fontFamily: 'Poppins_700Bold',
  },
  coinEmoji: {
    fontSize: 14,
  },
  memberActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: colors.vibrantOrange,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#E74C3C',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoBox: {
    backgroundColor: colors.primary,
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.vibrantOrange,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    fontFamily: 'Nunito_400Regular',
    lineHeight: 20,
    marginLeft: 12,
  },
  noAccessContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noAccessTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Poppins_700Bold',
    marginTop: 20,
    marginBottom: 10,
  },
  noAccessText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
    textAlign: 'center',
    lineHeight: 24,
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
    marginBottom: 10,
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
  roleHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 15,
    fontFamily: 'Nunito_400Regular',
    fontStyle: 'italic',
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

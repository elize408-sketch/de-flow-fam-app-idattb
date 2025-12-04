
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import { IconSymbol } from '@/components/IconSymbol';

interface FamilyMember {
  id: string;
  name: string;
  role: 'parent' | 'child';
  color: string;
  photo?: string;
  age?: number;
}

const AVAILABLE_COLORS = [
  colors.vibrantPink,
  colors.vibrantBlue,
  colors.vibrantGreen,
  colors.vibrantOrange,
  colors.vibrantPurple,
  colors.vibrantTeal,
  colors.beige,
  colors.warmOrange,
];

export default function AddFamilyMembersScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [currentName, setCurrentName] = useState('');
  const [currentRole, setCurrentRole] = useState<'parent' | 'child'>('parent');
  const [currentColor, setCurrentColor] = useState(AVAILABLE_COLORS[0]);
  const [currentPhoto, setCurrentPhoto] = useState<string | undefined>(undefined);
  const [currentAge, setCurrentAge] = useState('');

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert(
        t('profile.permissionRequired'),
        t('profile.photoPermissionMessage')
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setCurrentPhoto(result.assets[0].uri);
    }
  };

  const addMember = () => {
    if (!currentName.trim()) {
      Alert.alert(t('common.error'), t('profile.fillName'));
      return;
    }

    const newMember: FamilyMember = {
      id: Date.now().toString(),
      name: currentName.trim(),
      role: currentRole,
      color: currentColor,
      photo: currentPhoto,
      age: currentAge ? parseInt(currentAge) : undefined,
    };

    setMembers([...members, newMember]);
    
    // Reset form
    setCurrentName('');
    setCurrentRole('parent');
    setCurrentColor(AVAILABLE_COLORS[members.length % AVAILABLE_COLORS.length]);
    setCurrentPhoto(undefined);
    setCurrentAge('');

    Alert.alert(t('common.success'), `${newMember.name} ${t('profile.memberAdded')}`);
  };

  const removeMember = (id: string) => {
    const member = members.find(m => m.id === id);
    if (!member) return;

    Alert.alert(
      t('profile.areYouSure'),
      t('profile.deleteMember'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            setMembers(members.filter(m => m.id !== id));
            Alert.alert(t('common.success'), t('profile.memberDeleted', { name: member.name }));
          },
        },
      ]
    );
  };

  const finishSetup = () => {
    if (members.length === 0) {
      Alert.alert(t('common.error'), 'Voeg minimaal één gezinslid toe');
      return;
    }

    Alert.alert(
      t('common.success'),
      `Je hebt ${members.length} gezinslid${members.length > 1 ? 'en' : ''} toegevoegd!\n\nIn de echte app worden deze nu opgeslagen in de database.`,
      [
        {
          text: t('common.ok'),
          onPress: () => {
            // In production, this would save to database
            // For now, just show the members
            console.log('Family members to save:', members);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Gezinsleden toevoegen</Text>
          <Text style={styles.subtitle}>
            Voeg alle gezinsleden toe met hun naam, foto en rol
          </Text>
        </View>

        {/* Current Members List */}
        {members.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Toegevoegde gezinsleden ({members.length})
            </Text>
            {members.map((member) => (
              <View key={member.id} style={styles.memberCard}>
                <View style={styles.memberInfo}>
                  {member.photo ? (
                    <Image source={{ uri: member.photo }} style={styles.memberPhoto} />
                  ) : (
                    <View style={[styles.memberPhotoPlaceholder, { backgroundColor: member.color }]}>
                      <Text style={styles.memberInitial}>
                        {member.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={styles.memberDetails}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Text style={styles.memberRole}>
                      {member.role === 'parent' ? '👨‍👩‍👧‍👦 Ouder' : '👶 Kind'}
                      {member.age && ` • ${member.age} ${t('common.years')}`}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => removeMember(member.id)}
                  style={styles.deleteButton}
                >
                  <IconSymbol
                    ios_icon_name="trash.fill"
                    android_material_icon_name="delete"
                    size={20}
                    color={colors.vibrantRed}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Add New Member Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nieuw gezinslid toevoegen</Text>

          {/* Photo Picker */}
          <TouchableOpacity style={styles.photoPickerButton} onPress={pickImage}>
            {currentPhoto ? (
              <Image source={{ uri: currentPhoto }} style={styles.photoPreview} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <IconSymbol
                  ios_icon_name="camera.fill"
                  android_material_icon_name="photo_camera"
                  size={32}
                  color={colors.textSecondary}
                />
                <Text style={styles.photoPlaceholderText}>{t('profile.addPhoto')}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('common.name')} *</Text>
            <TextInput
              style={styles.input}
              placeholder="Bijv. Emma, Lucas, Papa, Mama"
              placeholderTextColor={colors.textSecondary}
              value={currentName}
              onChangeText={setCurrentName}
            />
          </View>

          {/* Role Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('profile.role')} *</Text>
            <View style={styles.roleButtons}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  currentRole === 'parent' && styles.roleButtonActive,
                ]}
                onPress={() => setCurrentRole('parent')}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    currentRole === 'parent' && styles.roleButtonTextActive,
                  ]}
                >
                  👨‍👩‍👧‍👦 Ouder
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  currentRole === 'child' && styles.roleButtonActive,
                ]}
                onPress={() => setCurrentRole('child')}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    currentRole === 'child' && styles.roleButtonTextActive,
                  ]}
                >
                  👶 Kind
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Age Input (for children) */}
          {currentRole === 'child' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Leeftijd (optioneel)</Text>
              <TextInput
                style={styles.input}
                placeholder="Bijv. 5"
                placeholderTextColor={colors.textSecondary}
                value={currentAge}
                onChangeText={setCurrentAge}
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>
          )}

          {/* Color Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('profile.chooseColor')}</Text>
            <Text style={styles.colorHint}>{t('profile.colorHint')}</Text>
            <View style={styles.colorGrid}>
              {AVAILABLE_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    currentColor === color && styles.colorOptionSelected,
                  ]}
                  onPress={() => setCurrentColor(color)}
                >
                  {currentColor === color && (
                    <IconSymbol
                      ios_icon_name="checkmark"
                      android_material_icon_name="check"
                      size={20}
                      color="#FFFFFF"
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Preview */}
          <View style={styles.previewSection}>
            <Text style={styles.label}>{t('profile.preview')}</Text>
            <View style={styles.previewCard}>
              {currentPhoto ? (
                <Image source={{ uri: currentPhoto }} style={styles.previewPhoto} />
              ) : (
                <View style={[styles.previewPhotoPlaceholder, { backgroundColor: currentColor }]}>
                  <Text style={styles.previewInitial}>
                    {currentName ? currentName.charAt(0).toUpperCase() : '?'}
                  </Text>
                </View>
              )}
              <View style={styles.previewDetails}>
                <Text style={styles.previewName}>
                  {currentName || 'Naam'}
                </Text>
                <Text style={styles.previewRole}>
                  {currentRole === 'parent' ? '👨‍👩‍👧‍👦 Ouder' : '👶 Kind'}
                  {currentAge && ` • ${currentAge} ${t('common.years')}`}
                </Text>
              </View>
            </View>
          </View>

          {/* Add Button */}
          <TouchableOpacity style={styles.addButton} onPress={addMember}>
            <IconSymbol
              ios_icon_name="plus.circle.fill"
              android_material_icon_name="add_circle"
              size={24}
              color="#FFFFFF"
            />
            <Text style={styles.addButtonText}>Gezinslid toevoegen</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom spacing for safe area */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Fixed Bottom Button */}
      {members.length > 0 && (
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.finishButton} onPress={finishSetup}>
            <Text style={styles.finishButtonText}>
              Klaar ({members.length} gezinslid{members.length > 1 ? 'en' : ''})
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
    paddingTop: 60,
    paddingBottom: 20,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Poppins_700Bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
    lineHeight: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 16,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    boxShadow: `0px 2px 8px ${colors.shadow}`,
    elevation: 2,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberPhoto: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  memberPhotoPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberInitial: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 4,
  },
  memberRole: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  deleteButton: {
    padding: 8,
  },
  photoPickerButton: {
    alignSelf: 'center',
    marginBottom: 24,
  },
  photoPreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.textSecondary,
    borderStyle: 'dashed',
  },
  photoPlaceholderText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 8,
  },
  colorHint: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
    marginBottom: 12,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    fontFamily: 'Nunito_400Regular',
    borderWidth: 1,
    borderColor: colors.card,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.card,
  },
  roleButtonActive: {
    backgroundColor: colors.softCream,
    borderColor: colors.warmOrange,
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    fontFamily: 'Poppins_600SemiBold',
  },
  roleButtonTextActive: {
    color: colors.warmOrange,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: colors.text,
  },
  previewSection: {
    marginBottom: 24,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.softCream,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.warmOrange,
  },
  previewPhoto: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  previewPhotoPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewInitial: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
  },
  previewDetails: {
    flex: 1,
  },
  previewName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 4,
  },
  previewRole: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  addButton: {
    backgroundColor: colors.warmOrange,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: colors.card,
    boxShadow: `0px -4px 12px ${colors.shadow}`,
    elevation: 8,
  },
  finishButton: {
    backgroundColor: colors.vibrantPink,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  finishButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
  },
});

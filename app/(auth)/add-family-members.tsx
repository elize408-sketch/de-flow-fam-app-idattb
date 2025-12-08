
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';

interface FamilyMember {
  id: string;
  name: string;
  role: 'parent' | 'child';
  color: string;
  photoUri?: string;
}

const AVAILABLE_COLORS = [
  colors.warmOrange,
  colors.blushPink,
  colors.sageGreen,
  colors.terracotta,
  colors.gold,
  '#FF6B9D',
  '#4ECDC4',
  '#95E1D3',
  '#F38181',
  '#AA96DA',
];

export default function AddFamilyMembersScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [currentName, setCurrentName] = useState('');
  const [currentRole, setCurrentRole] = useState<'parent' | 'child'>('parent');
  const [currentColor, setCurrentColor] = useState(AVAILABLE_COLORS[0]);
  const [currentPhoto, setCurrentPhoto] = useState<string | undefined>();

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        t('common.error'),
        'We hebben toestemming nodig om toegang te krijgen tot je foto\'s'
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
      Alert.alert(t('common.error'), 'Vul een naam in');
      return;
    }

    const newMember: FamilyMember = {
      id: Date.now().toString(),
      name: currentName.trim(),
      role: currentRole,
      color: currentColor,
      photoUri: currentPhoto,
    };

    setMembers([...members, newMember]);
    
    // Reset form
    setCurrentName('');
    setCurrentRole('parent');
    setCurrentColor(AVAILABLE_COLORS[members.length % AVAILABLE_COLORS.length]);
    setCurrentPhoto(undefined);
  };

  const removeMember = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
  };

  const handleContinue = () => {
    if (members.length === 0) {
      Alert.alert(t('common.error'), 'Voeg minimaal één gezinslid toe');
      return;
    }

    // Log the family members for debugging
    console.log('Family members added:', members);
    
    // Navigate to the homepage
    router.replace('/(tabs)/(home)');
  };

  return (
    <View style={styles.container}>
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

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Gezinsleden toevoegen</Text>
          <Text style={styles.subtitle}>
            Voeg alle gezinsleden toe die de app gaan gebruiken
          </Text>
        </View>

        {/* Add Member Form */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Nieuw gezinslid</Text>

          {/* Photo Picker */}
          <View style={styles.photoSection}>
            <TouchableOpacity
              style={styles.photoButton}
              onPress={pickImage}
            >
              {currentPhoto ? (
                <Image source={{ uri: currentPhoto }} style={styles.photoPreview} />
              ) : (
                <View style={[styles.photoPlaceholder, { backgroundColor: currentColor + '20' }]}>
                  <IconSymbol
                    ios_icon_name="camera.fill"
                    android_material_icon_name="photo-camera"
                    size={32}
                    color={currentColor}
                  />
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.photoLabel}>Foto toevoegen</Text>
          </View>

          {/* Name Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Naam</Text>
            <TextInput
              style={styles.input}
              placeholder="Bijv. Emma, Papa, Oma..."
              placeholderTextColor={colors.textSecondary}
              value={currentName}
              onChangeText={setCurrentName}
              autoCapitalize="words"
            />
          </View>

          {/* Role Selection */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Rol</Text>
            <View style={styles.roleButtons}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  currentRole === 'parent' && styles.roleButtonActive,
                ]}
                onPress={() => setCurrentRole('parent')}
              >
                <IconSymbol
                  ios_icon_name="person.fill"
                  android_material_icon_name="person"
                  size={20}
                  color={currentRole === 'parent' ? colors.card : colors.text}
                />
                <Text
                  style={[
                    styles.roleButtonText,
                    currentRole === 'parent' && styles.roleButtonTextActive,
                  ]}
                >
                  Ouder
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleButton,
                  currentRole === 'child' && styles.roleButtonActive,
                ]}
                onPress={() => setCurrentRole('child')}
              >
                <IconSymbol
                  ios_icon_name="figure.child"
                  android_material_icon_name="child-care"
                  size={20}
                  color={currentRole === 'child' ? colors.card : colors.text}
                />
                <Text
                  style={[
                    styles.roleButtonText,
                    currentRole === 'child' && styles.roleButtonTextActive,
                  ]}
                >
                  Kind
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Color Selection */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Kleur</Text>
            <View style={styles.colorGrid}>
              {AVAILABLE_COLORS.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    currentColor === color && styles.colorOptionActive,
                  ]}
                  onPress={() => setCurrentColor(color)}
                >
                  {currentColor === color && (
                    <IconSymbol
                      ios_icon_name="checkmark"
                      android_material_icon_name="check"
                      size={20}
                      color={colors.card}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Add Button */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={addMember}
          >
            <IconSymbol
              ios_icon_name="plus.circle.fill"
              android_material_icon_name="add-circle"
              size={24}
              color={colors.card}
            />
            <Text style={styles.addButtonText}>Gezinslid toevoegen</Text>
          </TouchableOpacity>
        </View>

        {/* Members List */}
        {members.length > 0 && (
          <View style={styles.membersSection}>
            <Text style={styles.sectionTitle}>
              Gezinsleden ({members.length})
            </Text>
            {members.map((member, index) => (
              <View key={index} style={styles.memberCard}>
                <View style={styles.memberInfo}>
                  {member.photoUri ? (
                    <Image source={{ uri: member.photoUri }} style={styles.memberPhoto} />
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
                      {member.role === 'parent' ? 'Ouder' : 'Kind'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeMember(member.id)}
                >
                  <IconSymbol
                    ios_icon_name="trash.fill"
                    android_material_icon_name="delete"
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Continue Button */}
        {members.length > 0 && (
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>Doorgaan</Text>
            <IconSymbol
              ios_icon_name="arrow.right"
              android_material_icon_name="arrow-forward"
              size={20}
              color={colors.card}
            />
          </TouchableOpacity>
        )}

        {/* Bottom spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 48 : 60,
    left: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: colors.card,
    borderRadius: 12,
    boxShadow: `0px 2px 8px ${colors.shadow}`,
    elevation: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 88 : 100,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    fontFamily: 'Poppins_700Bold',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  formSection: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    boxShadow: `0px 2px 8px ${colors.shadow}`,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
    fontFamily: 'Poppins_700Bold',
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  photoButton: {
    marginBottom: 8,
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.warmOrange,
    borderStyle: 'dashed',
  },
  photoPreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.warmOrange,
  },
  photoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    fontFamily: 'Poppins_600SemiBold',
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    fontFamily: 'Nunito_400Regular',
    borderWidth: 1,
    borderColor: colors.textSecondary + '20',
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.textSecondary + '20',
  },
  roleButtonActive: {
    backgroundColor: colors.warmOrange,
    borderColor: colors.warmOrange,
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
  },
  roleButtonTextActive: {
    color: colors.card,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionActive: {
    borderColor: colors.darkBrown,
    borderWidth: 3,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.warmOrange,
    paddingVertical: 16,
    borderRadius: 12,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.card,
    fontFamily: 'Poppins_600SemiBold',
  },
  membersSection: {
    marginBottom: 20,
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
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  memberPhotoPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberInitial: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.card,
    fontFamily: 'Poppins_700Bold',
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 2,
  },
  memberRole: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  removeButton: {
    padding: 8,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.warmOrange,
    paddingVertical: 18,
    borderRadius: 16,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 4,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.card,
    fontFamily: 'Poppins_700Bold',
  },
});

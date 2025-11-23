
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useFamily } from '@/contexts/FamilyContext';

export default function ProfileScreen() {
  const { familyMembers, addFamilyMember, currentUser } = useFamily();
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'parent' | 'child'>('child');

  const handleAddMember = () => {
    if (!newMemberName.trim()) {
      Alert.alert('Fout', 'Vul een naam in');
      return;
    }

    const colors_list = ['#F5D9CF', '#C8D3C0', '#D5A093', '#CBA85B'];
    const randomColor = colors_list[Math.floor(Math.random() * colors_list.length)];

    addFamilyMember({
      name: newMemberName.trim(),
      role: newMemberRole,
      coins: 0,
      color: randomColor,
    });

    setNewMemberName('');
    setNewMemberRole('child');
    setShowAddMemberModal(false);
    Alert.alert('Gelukt!', `${newMemberName} is toegevoegd aan het gezin`);
  };

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
          </View>

          {familyMembers.map((member, index) => (
            <React.Fragment key={index}>
              <View style={styles.memberCard}>
                <View style={[styles.memberAvatar, { backgroundColor: member.color || colors.accent }]}>
                  <Text style={styles.memberAvatarText}>{member.name.charAt(0)}</Text>
                </View>
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App informatie</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>Flow Fam App</Text>
            <Text style={styles.infoSubtext}>Versie 1.0.0</Text>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showAddMemberModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddMemberModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nieuw gezinslid toevoegen</Text>

            <TextInput
              style={styles.input}
              placeholder="Naam"
              placeholderTextColor={colors.textSecondary}
              value={newMemberName}
              onChangeText={setNewMemberName}
            />

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

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowAddMemberModal(false);
                  setNewMemberName('');
                  setNewMemberRole('child');
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
    fontFamily: 'Nunito_400Regular',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
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
  input: {
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    color: colors.text,
    marginBottom: 15,
    fontFamily: 'Nunito_400Regular',
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
});

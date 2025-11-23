
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useFamily } from '@/contexts/FamilyContext';

export default function HomeScreen() {
  const router = useRouter();
  const { familyMembers, selectedMember, setSelectedMember } = useFamily();
  const [showMemberPicker, setShowMemberPicker] = useState(false);

  const displayMember = selectedMember || familyMembers[0];

  const navigationItems = [
    { title: 'Taken', icon: 'check-circle', route: '/(tabs)/tasks', color: colors.primary },
    { title: 'Agenda', icon: 'calendar-today', route: '/(tabs)/agenda', color: colors.secondary },
    { title: 'Huishouden', icon: 'home', route: '/(tabs)/household', color: colors.accent },
    { title: 'Maaltijden', icon: 'restaurant', route: '/(tabs)/meals', color: colors.highlight },
    { title: 'Beloningen', icon: 'star', route: '/(tabs)/rewards', color: colors.primary },
    { title: 'Financiën', icon: 'account-balance-wallet', route: '/(tabs)/finances', color: colors.secondary },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Flow Fam</Text>
          <Text style={styles.subtitle}>Welkom bij jullie gezinsapp</Text>
        </View>

        <TouchableOpacity 
          style={styles.memberSelector}
          onPress={() => setShowMemberPicker(true)}
        >
          <View style={styles.memberSelectorContent}>
            <View style={[styles.memberAvatar, { backgroundColor: displayMember.color || colors.accent }]}>
              <Text style={styles.memberAvatarText}>{displayMember.name.charAt(0)}</Text>
            </View>
            <Text style={styles.memberSelectorName}>{displayMember.name}</Text>
            <IconSymbol 
              ios_icon_name="chevron.down" 
              android_material_icon_name="arrow-drop-down" 
              size={24} 
              color={colors.text} 
            />
          </View>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Snelle navigatie</Text>
          <View style={styles.navigationGrid}>
            {navigationItems.map((item, index) => (
              <React.Fragment key={index}>
                <TouchableOpacity
                  style={[styles.navCard, { backgroundColor: item.color }]}
                  onPress={() => router.push(item.route as any)}
                >
                  <IconSymbol
                    ios_icon_name={item.icon}
                    android_material_icon_name={item.icon}
                    size={32}
                    color={colors.text}
                  />
                  <Text style={styles.navCardText}>{item.title}</Text>
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showMemberPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMemberPicker(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMemberPicker(false)}
        >
          <View style={styles.memberPickerModal}>
            <Text style={styles.modalTitle}>Kies gezinslid</Text>
            {familyMembers.map((member, index) => (
              <React.Fragment key={index}>
                <TouchableOpacity
                  style={styles.memberOption}
                  onPress={() => {
                    setSelectedMember(member);
                    setShowMemberPicker(false);
                  }}
                >
                  <View style={[styles.memberOptionAvatar, { backgroundColor: member.color || colors.accent }]}>
                    <Text style={styles.memberOptionAvatarText}>{member.name.charAt(0)}</Text>
                  </View>
                  <Text style={styles.memberOptionName}>{member.name}</Text>
                  {displayMember.id === member.id && (
                    <IconSymbol 
                      ios_icon_name="checkmark" 
                      android_material_icon_name="check" 
                      size={24} 
                      color={colors.accent} 
                    />
                  )}
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
        </TouchableOpacity>
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
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
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
  memberSelector: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 15,
    marginBottom: 30,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  memberSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
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
  memberSelectorName: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 15,
    fontFamily: 'Poppins_600SemiBold',
  },
  navigationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  navCard: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: 20,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  navCardText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 10,
    textAlign: 'center',
    fontFamily: 'Poppins_600SemiBold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  memberPickerModal: {
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
  memberOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    backgroundColor: colors.background,
  },
  memberOptionAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  memberOptionAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.card,
    fontFamily: 'Poppins_700Bold',
  },
  memberOptionName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
  },
});

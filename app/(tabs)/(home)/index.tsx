
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useFamily } from '@/contexts/FamilyContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  const router = useRouter();
  const { familyMembers } = useFamily();

  const children = familyMembers.filter(member => member.role === 'child');

  const navigationItems = [
    { title: 'Taken', icon: 'check-circle', route: '/(tabs)/tasks', color: colors.primary },
    { title: 'Agenda', icon: 'calendar-today', route: '/(tabs)/agenda', color: colors.secondary },
    { title: 'Huishouden', icon: 'home', route: '/(tabs)/household', color: colors.accent },
    { title: 'Maaltijden', icon: 'restaurant', route: '/(tabs)/meals', color: colors.highlight },
    { title: 'Beloningen', icon: 'star', route: '/(tabs)/rewards', color: colors.primary },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Flow Fam</Text>
        <Text style={styles.subtitle}>Welkom bij jullie gezinsapp</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Gezinsleden</Text>
        <View style={styles.membersContainer}>
          {children.map((member, index) => (
            <React.Fragment key={index}>
              <TouchableOpacity
                style={styles.memberCard}
                onPress={() => router.push(`/(tabs)/child/${member.id}`)}
              >
                <View style={styles.avatarContainer}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{member.name.charAt(0)}</Text>
                  </View>
                </View>
                <Text style={styles.memberName}>{member.name}</Text>
                <View style={styles.coinsContainer}>
                  <Text style={styles.coinsText}>{member.coins}</Text>
                  <Text style={styles.coinEmoji}>🪙</Text>
                </View>
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>
      </View>

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
  membersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  memberCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    width: '47%',
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  avatarContainer: {
    marginBottom: 10,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.card,
    fontFamily: 'Poppins_700Bold',
  },
  memberName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    fontFamily: 'Poppins_600SemiBold',
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
});


import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useFamily } from '@/contexts/FamilyContext';

export default function RewardsScreen() {
  const { rewards, familyMembers, redeemReward } = useFamily();

  const children = familyMembers.filter(m => m.role === 'child');

  const handleRedeemReward = (childId: string, rewardId: string) => {
    const child = familyMembers.find(m => m.id === childId);
    const reward = rewards.find(r => r.id === rewardId);

    if (!child || !reward) return;

    if (child.coins < reward.cost) {
      Alert.alert(
        'Niet genoeg muntjes',
        `${child.name} heeft nog ${reward.cost - child.coins} muntjes nodig voor deze beloning.`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Beloning inwisselen?',
      `Wil je ${reward.name} inwisselen voor ${reward.cost} muntjes?`,
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Ja, inwisselen',
          onPress: () => {
            redeemReward(childId, rewardId);
            Alert.alert('Gelukt! 🎉', `${child.name} heeft ${reward.name} verdiend!`);
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Beloningswinkel</Text>
        <Text style={styles.subtitle}>Wissel muntjes in voor leuke beloningen</Text>
      </View>

      {children.map((child, childIndex) => (
        <React.Fragment key={childIndex}>
          <View style={styles.childSection}>
            <View style={styles.childHeader}>
              <View style={[styles.childAvatar, { backgroundColor: child.color || colors.accent }]}>
                <Text style={styles.childAvatarText}>{child.name.charAt(0)}</Text>
              </View>
              <View style={styles.childInfo}>
                <Text style={styles.childName}>{child.name}</Text>
                <View style={styles.coinsContainer}>
                  <Text style={styles.coinsText}>{child.coins}</Text>
                  <Text style={styles.coinEmoji}>🪙</Text>
                </View>
              </View>
            </View>

            <View style={styles.rewardsGrid}>
              {rewards.map((reward, rewardIndex) => {
                const canAfford = child.coins >= reward.cost;
                return (
                  <React.Fragment key={rewardIndex}>
                    <TouchableOpacity
                      style={[styles.rewardCard, !canAfford && styles.rewardCardDisabled]}
                      onPress={() => handleRedeemReward(child.id, reward.id)}
                      disabled={!canAfford}
                    >
                      <View style={[styles.rewardIcon, !canAfford && styles.rewardIconDisabled]}>
                        <IconSymbol
                          ios_icon_name={reward.icon}
                          android_material_icon_name={reward.icon}
                          size={32}
                          color={canAfford ? colors.text : colors.textSecondary}
                        />
                      </View>
                      <Text style={[styles.rewardName, !canAfford && styles.rewardNameDisabled]}>
                        {reward.name}
                      </Text>
                      <Text style={styles.rewardDescription}>{reward.description}</Text>
                      <View style={[styles.rewardCost, !canAfford && styles.rewardCostDisabled]}>
                        <Text style={styles.rewardCostText}>{reward.cost}</Text>
                        <Text style={styles.rewardCostEmoji}>🪙</Text>
                      </View>
                    </TouchableOpacity>
                  </React.Fragment>
                );
              })}
            </View>
          </View>
        </React.Fragment>
      ))}
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
    textAlign: 'center',
    fontFamily: 'Nunito_400Regular',
  },
  childSection: {
    marginBottom: 30,
  },
  childHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: colors.card,
    padding: 15,
    borderRadius: 20,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  childAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  childAvatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.card,
    fontFamily: 'Poppins_700Bold',
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 5,
    fontFamily: 'Poppins_600SemiBold',
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinsText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.highlight,
    marginRight: 5,
    fontFamily: 'Poppins_700Bold',
  },
  coinEmoji: {
    fontSize: 16,
  },
  rewardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  rewardCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 15,
    width: '47%',
    alignItems: 'center',
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  rewardCardDisabled: {
    opacity: 0.5,
  },
  rewardIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  rewardIconDisabled: {
    backgroundColor: colors.textSecondary,
  },
  rewardName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 5,
    fontFamily: 'Poppins_600SemiBold',
  },
  rewardNameDisabled: {
    color: colors.textSecondary,
  },
  rewardDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'Nunito_400Regular',
  },
  rewardCost: {
    backgroundColor: colors.highlight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardCostDisabled: {
    backgroundColor: colors.textSecondary,
  },
  rewardCostText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.card,
    marginRight: 5,
    fontFamily: 'Poppins_700Bold',
  },
  rewardCostEmoji: {
    fontSize: 16,
  },
});

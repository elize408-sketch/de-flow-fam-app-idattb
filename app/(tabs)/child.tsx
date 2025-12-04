
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { useFamily } from '@/contexts/FamilyContext';

export default function ChildScreen() {
  const router = useRouter();
  const { familyMembers } = useFamily();

  const children = familyMembers.filter(m => m.role === 'child');

  const handleChildPress = (childId: string) => {
    router.push(`/(tabs)/child-dashboard?childId=${childId}` as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Kinderen</Text>
        </View>

        {/* Children List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {children.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Geen kinderen toegevoegd</Text>
              <Text style={styles.emptySubtext}>
                Voeg kinderen toe via het profiel scherm
              </Text>
            </View>
          ) : (
            children.map((child, index) => (
              <React.Fragment key={index}>
                <TouchableOpacity
                  style={styles.childCard}
                  onPress={() => handleChildPress(child.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.childAvatar, { backgroundColor: child.color }]}>
                    {child.photoUri ? (
                      <Image source={{ uri: child.photoUri }} style={styles.childPhoto} />
                    ) : (
                      <Text style={styles.childAvatarText}>{child.name.charAt(0)}</Text>
                    )}
                  </View>
                  <View style={styles.childInfo}>
                    <Text style={styles.childName}>{child.name}</Text>
                    <View style={styles.coinsContainer}>
                      <Text style={styles.coinsText}>{child.coins}</Text>
                      <Text style={styles.coinEmoji}>🪙</Text>
                    </View>
                  </View>
                  <View style={styles.chevronContainer}>
                    <Text style={styles.chevron}>›</Text>
                  </View>
                </TouchableOpacity>
              </React.Fragment>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    fontFamily: 'Poppins_600SemiBold',
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    fontFamily: 'Poppins_400Regular',
  },
  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  childAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  childPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  childAvatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    fontFamily: 'Poppins_600SemiBold',
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinsText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.highlight,
    marginRight: 4,
    fontFamily: 'Poppins_600SemiBold',
  },
  coinEmoji: {
    fontSize: 16,
  },
  chevronContainer: {
    marginLeft: 12,
  },
  chevron: {
    fontSize: 32,
    color: colors.textSecondary + '40',
    fontWeight: '300',
  },
});


import React from 'react';
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
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { useFamily } from '@/contexts/FamilyContext';
import { useTranslation } from 'react-i18next';

export default function ChildrenScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { familyMembers } = useFamily();

  // Filter only children
  const children = familyMembers.filter(member => member.role === 'child');

  const handleChildPress = (childId: string) => {
    router.push(`/(tabs)/child-dashboard?childId=${childId}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('children.title')}</Text>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {children.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol
                ios_icon_name="figure.child"
                android_material_icon_name="child-care"
                size={64}
                color={colors.text + '40'}
              />
              <Text style={styles.emptyText}>{t('children.noChildren')}</Text>
              <Text style={styles.emptySubtext}>{t('children.addChildrenHint')}</Text>
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
                    <View style={styles.childCoins}>
                      <Text style={styles.childCoinsText}>{child.coins}</Text>
                      <Text style={styles.childCoinEmoji}>🪙</Text>
                    </View>
                  </View>
                  <IconSymbol
                    ios_icon_name="chevron.right"
                    android_material_icon_name="chevron-right"
                    size={24}
                    color={colors.textSecondary}
                  />
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
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
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
    marginTop: 16,
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
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
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
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  childPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
  },
  childAvatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    fontFamily: 'Poppins_600SemiBold',
  },
  childCoins: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  childCoinsText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.highlight,
    marginRight: 4,
    fontFamily: 'Poppins_600SemiBold',
  },
  childCoinEmoji: {
    fontSize: 16,
  },
});


import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { useRouter } from 'expo-router';
import { useFamily } from '@/contexts/FamilyContext';
import { signOut } from '@/utils/auth';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '@/components/LanguageSelector';

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { currentUser, familyCode, shareFamilyInvite, reloadCurrentUser } = useFamily();
  const [refreshing, setRefreshing] = useState(false);
  const [languageSelectorVisible, setLanguageSelectorVisible] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      t('common.logout'),
      t('settings.logoutConfirm'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.logout'),
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/(auth)/welcome');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert(t('common.error'), t('settings.logoutError'));
            }
          },
        },
      ]
    );
  };

  const handleRefreshData = async () => {
    setRefreshing(true);
    try {
      await reloadCurrentUser();
      Alert.alert(t('common.success'), t('settings.dataRefreshed'));
    } catch (error) {
      console.error('Refresh error:', error);
      Alert.alert(t('common.error'), t('settings.refreshError'));
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('common.settings')}</Text>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* User Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('settings.account')}</Text>
            <View style={styles.card}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('common.name')}</Text>
                <Text style={styles.infoValue}>{currentUser?.name || t('settings.notSet')}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('settings.role')}</Text>
                <Text style={styles.infoValue}>
                  {currentUser?.role === 'parent' ? t('settings.parent') : t('settings.child')}
                </Text>
              </View>
            </View>
          </View>

          {/* Family Settings */}
          {currentUser?.role === 'parent' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('settings.family')}</Text>
              <View style={styles.card}>
                <TouchableOpacity
                  style={styles.settingRow}
                  onPress={() => router.push('/(tabs)/family-settings')}
                >
                  <View style={styles.settingLeft}>
                    <IconSymbol
                      ios_icon_name="person.3.fill"
                      android_material_icon_name="group"
                      size={24}
                      color={colors.vibrantOrange}
                    />
                    <Text style={styles.settingText}>{t('settings.manageFamilyMembers')}</Text>
                  </View>
                  <IconSymbol
                    ios_icon_name="chevron.right"
                    android_material_icon_name="chevron-right"
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity
                  style={styles.settingRow}
                  onPress={shareFamilyInvite}
                >
                  <View style={styles.settingLeft}>
                    <IconSymbol
                      ios_icon_name="square.and.arrow.up"
                      android_material_icon_name="share"
                      size={24}
                      color={colors.vibrantOrange}
                    />
                    <View style={styles.settingTextContainer}>
                      <Text style={styles.settingText}>{t('settings.shareFamilyCode')}</Text>
                      {familyCode && (
                        <Text style={styles.settingSubtext}>{t('settings.code')}: {familyCode}</Text>
                      )}
                    </View>
                  </View>
                  <IconSymbol
                    ios_icon_name="chevron.right"
                    android_material_icon_name="chevron-right"
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* App Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('settings.appSettings')}</Text>
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.settingRow}
                onPress={() => setLanguageSelectorVisible(true)}
              >
                <View style={styles.settingLeft}>
                  <IconSymbol
                    ios_icon_name="globe"
                    android_material_icon_name="language"
                    size={24}
                    color={colors.vibrantOrange}
                  />
                  <Text style={styles.settingText}>{t('settings.changeLanguage')}</Text>
                </View>
                <IconSymbol
                  ios_icon_name="chevron.right"
                  android_material_icon_name="chevron-right"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity
                style={styles.settingRow}
                onPress={handleRefreshData}
                disabled={refreshing}
              >
                <View style={styles.settingLeft}>
                  <IconSymbol
                    ios_icon_name="arrow.clockwise"
                    android_material_icon_name="refresh"
                    size={24}
                    color={colors.vibrantOrange}
                  />
                  <Text style={styles.settingText}>
                    {refreshing ? t('settings.refreshing') : t('settings.refreshData')}
                  </Text>
                </View>
                <IconSymbol
                  ios_icon_name="chevron.right"
                  android_material_icon_name="chevron-right"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity
                style={styles.settingRow}
                onPress={handleLogout}
              >
                <View style={styles.settingLeft}>
                  <IconSymbol
                    ios_icon_name="rectangle.portrait.and.arrow.right"
                    android_material_icon_name="logout"
                    size={24}
                    color="#E74C3C"
                  />
                  <Text style={[styles.settingText, styles.logoutText]}>{t('common.logout')}</Text>
                </View>
                <IconSymbol
                  ios_icon_name="chevron.right"
                  android_material_icon_name="chevron-right"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Debug Info */}
          {__DEV__ && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Debug Info</Text>
              <View style={styles.card}>
                <Text style={styles.debugText}>
                  User ID: {currentUser?.id || 'None'}
                </Text>
                <Text style={styles.debugText}>
                  User Role: {currentUser?.role || 'None'}
                </Text>
                <Text style={styles.debugText}>
                  Family Code: {familyCode || 'None'}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Language Selector Modal */}
      <LanguageSelector
        visible={languageSelectorVisible}
        onClose={() => setLanguageSelectorVisible(false)}
      />
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Poppins_700Bold',
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
  },
  infoValue: {
    fontSize: 16,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
  },
  settingSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
    marginTop: 2,
  },
  logoutText: {
    color: '#E74C3C',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 8,
  },
  debugText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
    marginBottom: 4,
  },
});

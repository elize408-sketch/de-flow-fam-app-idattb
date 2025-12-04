
import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
  Switch,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { useRouter } from 'expo-router';

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: { ios: string; android: string };
  type: 'navigation' | 'toggle' | 'info';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

export default function SettingsScreen() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [soundEnabled, setSoundEnabled] = React.useState(true);

  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          id: 'profile',
          title: 'Profiel bewerken',
          subtitle: 'Naam, foto en voorkeuren',
          icon: { ios: 'person.circle.fill', android: 'account-circle' },
          type: 'navigation' as const,
          onPress: () => router.push('/(tabs)/profile'),
        },
        {
          id: 'family',
          title: 'Gezinsinstellingen',
          subtitle: 'Beheer gezinsleden',
          icon: { ios: 'person.2.fill', android: 'people' },
          type: 'navigation' as const,
          onPress: () => console.log('Navigate to family settings'),
        },
      ],
    },
    {
      title: 'Notificaties',
      items: [
        {
          id: 'notifications',
          title: 'Push notificaties',
          subtitle: 'Ontvang meldingen',
          icon: { ios: 'bell.fill', android: 'notifications' },
          type: 'toggle' as const,
          value: notificationsEnabled,
          onToggle: setNotificationsEnabled,
        },
        {
          id: 'sound',
          title: 'Geluid',
          subtitle: 'Geluid bij notificaties',
          icon: { ios: 'speaker.wave.2.fill', android: 'volume-up' },
          type: 'toggle' as const,
          value: soundEnabled,
          onToggle: setSoundEnabled,
        },
      ],
    },
    {
      title: 'App',
      items: [
        {
          id: 'language',
          title: 'Taal',
          subtitle: 'Nederlands',
          icon: { ios: 'globe', android: 'language' },
          type: 'navigation' as const,
          onPress: () => console.log('Navigate to language settings'),
        },
        {
          id: 'theme',
          title: 'Thema',
          subtitle: 'Licht',
          icon: { ios: 'paintbrush.fill', android: 'palette' },
          type: 'navigation' as const,
          onPress: () => console.log('Navigate to theme settings'),
        },
      ],
    },
    {
      title: 'Informatie',
      items: [
        {
          id: 'help',
          title: 'Help & Support',
          icon: { ios: 'questionmark.circle.fill', android: 'help' },
          type: 'navigation' as const,
          onPress: () => console.log('Navigate to help'),
        },
        {
          id: 'privacy',
          title: 'Privacy',
          icon: { ios: 'lock.fill', android: 'lock' },
          type: 'navigation' as const,
          onPress: () => console.log('Navigate to privacy'),
        },
        {
          id: 'about',
          title: 'Over Flow Fam',
          subtitle: 'Versie 1.0.0',
          icon: { ios: 'info.circle.fill', android: 'info' },
          type: 'info' as const,
        },
      ],
    },
  ];

  const renderSettingItem = (item: SettingItem, index: number) => {
    return (
      <React.Fragment key={index}>
        <TouchableOpacity
          style={styles.settingItem}
          onPress={item.onPress}
          activeOpacity={item.type === 'info' ? 1 : 0.7}
          disabled={item.type === 'info'}
        >
          <View style={styles.settingIconContainer}>
            <IconSymbol
              ios_icon_name={item.icon.ios}
              android_material_icon_name={item.icon.android as any}
              size={24}
              color={colors.vibrantOrange}
            />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>{item.title}</Text>
            {item.subtitle && (
              <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
            )}
          </View>
          {item.type === 'toggle' && (
            <Switch
              value={item.value}
              onValueChange={item.onToggle}
              trackColor={{ false: '#D1D1D6', true: colors.vibrantOrange + '80' }}
              thumbColor={item.value ? colors.vibrantOrange : '#F4F3F4'}
              ios_backgroundColor="#D1D1D6"
            />
          )}
          {item.type === 'navigation' && (
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={20}
              color={colors.text + '40'}
            />
          )}
        </TouchableOpacity>
      </React.Fragment>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Instellingen</Text>
        </View>

        {/* Settings List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {settingsSections.map((section, sectionIndex) => (
            <React.Fragment key={sectionIndex}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <View style={styles.sectionContent}>
                  {section.items.map((item, itemIndex) => renderSettingItem(item, itemIndex))}
                </View>
              </View>
            </React.Fragment>
          ))}

          {/* Logout Button */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => console.log('Logout')}
            activeOpacity={0.7}
          >
            <IconSymbol
              ios_icon_name="arrow.right.square.fill"
              android_material_icon_name="logout"
              size={24}
              color="#FF3B30"
            />
            <Text style={styles.logoutText}>Uitloggen</Text>
          </TouchableOpacity>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text + '80',
    fontFamily: 'Poppins_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.vibrantOrange + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: colors.text + '80',
    fontFamily: 'Poppins_400Regular',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
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
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
    fontFamily: 'Poppins_600SemiBold',
    marginLeft: 8,
  },
});

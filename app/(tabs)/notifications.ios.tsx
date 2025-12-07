
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { useTranslation } from 'react-i18next';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'task' | 'reminder' | 'family' | 'reward';
}

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: t('notifications.newTaskAssigned'),
      message: t('notifications.newTaskMessage'),
      time: t('notifications.minutesAgo', { count: 10 }),
      read: false,
      type: 'task',
    },
    {
      id: '2',
      title: t('notifications.reminder'),
      message: t('notifications.reminderMessage'),
      time: t('notifications.hoursAgo', { count: 1 }),
      read: false,
      type: 'reminder',
    },
    {
      id: '3',
      title: t('notifications.rewardEarned'),
      message: t('notifications.rewardMessage', { count: 10 }),
      time: t('notifications.hoursAgo', { count: 2 }),
      read: true,
      type: 'reward',
    },
    {
      id: '4',
      title: t('notifications.familyUpdate'),
      message: t('notifications.familyUpdateMessage'),
      time: t('common.yesterday'),
      read: true,
      type: 'family',
    },
  ]);

  const getIconForType = (type: Notification['type']) => {
    switch (type) {
      case 'task':
        return { ios: 'checkmark.circle.fill', android: 'check-circle' };
      case 'reminder':
        return { ios: 'bell.fill', android: 'notifications' };
      case 'reward':
        return { ios: 'star.fill', android: 'star' };
      case 'family':
        return { ios: 'person.2.fill', android: 'people' };
      default:
        return { ios: 'bell.fill', android: 'notifications' };
    }
  };

  const getColorForType = (type: Notification['type']) => {
    switch (type) {
      case 'task':
        return '#4CAF50';
      case 'reminder':
        return '#FF8A65';
      case 'reward':
        return '#FFB74D';
      case 'family':
        return '#3A8DFF';
      default:
        return colors.vibrantOrange;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('notifications.title')}</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        {/* Notifications List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {notifications.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol
                ios_icon_name="bell.slash.fill"
                android_material_icon_name="notifications-off"
                size={64}
                color={colors.text + '40'}
              />
              <Text style={styles.emptyText}>{t('notifications.noNotifications')}</Text>
            </View>
          ) : (
            notifications.map((notification, index) => {
              const icon = getIconForType(notification.type);
              const iconColor = getColorForType(notification.type);

              return (
                <React.Fragment key={index}>
                  <TouchableOpacity
                    style={[
                      styles.notificationCard,
                      !notification.read && styles.notificationCardUnread,
                    ]}
                    onPress={() => markAsRead(notification.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
                      <IconSymbol
                        ios_icon_name={icon.ios}
                        android_material_icon_name={icon.android as any}
                        size={24}
                        color={iconColor}
                      />
                    </View>
                    <View style={styles.notificationContent}>
                      <View style={styles.notificationHeader}>
                        <Text style={styles.notificationTitle}>{notification.title}</Text>
                        {!notification.read && <View style={styles.unreadDot} />}
                      </View>
                      <Text style={styles.notificationMessage}>{notification.message}</Text>
                      <Text style={styles.notificationTime}>{notification.time}</Text>
                    </View>
                  </TouchableOpacity>
                </React.Fragment>
              );
            })
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
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
  badge: {
    backgroundColor: colors.vibrantOrange,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
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
    fontSize: 16,
    color: colors.text + '60',
    marginTop: 16,
    fontFamily: 'Poppins_400Regular',
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  notificationCardUnread: {
    borderLeftWidth: 4,
    borderLeftColor: colors.vibrantOrange,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.vibrantOrange,
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    color: colors.text + 'CC',
    fontFamily: 'Poppins_400Regular',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: colors.text + '80',
    fontFamily: 'Poppins_400Regular',
  },
});

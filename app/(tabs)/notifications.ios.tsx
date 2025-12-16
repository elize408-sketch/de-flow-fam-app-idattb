
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
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
  const { t, ready } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Wait for translations to be ready before populating notifications
  useEffect(() => {
    if (ready) {
      console.log('Translations ready, populating notifications');
      setNotifications([
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
    }
  }, [ready, t]);

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

  const deleteNotification = (id: string) => {
    Alert.alert(
      t('common.delete'),
      t('notifications.deleteConfirm'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            console.log('Deleting notification:', id);
            setNotifications(prev => prev.filter(notif => notif.id !== id));
          },
        },
      ]
    );
  };

  const clearAllNotifications = () => {
    Alert.alert(
      t('notifications.clearAll'),
      t('notifications.clearAllConfirm'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('notifications.clearAll'),
          style: 'destructive',
          onPress: () => {
            console.log('Clearing all notifications');
            setNotifications([]);
          },
        },
      ]
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Show loading state while translations are loading
  if (!ready) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>...</Text>
          </View>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>{t('common.loading')}</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>{t('notifications.title')}</Text>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
          {notifications.length > 0 && (
            <TouchableOpacity
              onPress={clearAllNotifications}
              style={styles.clearAllButton}
              activeOpacity={0.7}
            >
              <IconSymbol
                ios_icon_name="trash.fill"
                android_material_icon_name="delete"
                size={24}
                color={colors.vibrantOrange}
              />
            </TouchableOpacity>
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
                  <View
                    style={[
                      styles.notificationCard,
                      !notification.read && styles.notificationCardUnread,
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.notificationContent}
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
                      <View style={styles.notificationTextContent}>
                        <View style={styles.notificationHeader}>
                          <Text style={styles.notificationTitle}>{notification.title}</Text>
                          {!notification.read && <View style={styles.unreadDot} />}
                        </View>
                        <Text style={styles.notificationMessage}>{notification.message}</Text>
                        <Text style={styles.notificationTime}>{notification.time}</Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => deleteNotification(notification.id)}
                      style={styles.deleteButton}
                      activeOpacity={0.7}
                    >
                      <IconSymbol
                        ios_icon_name="trash"
                        android_material_icon_name="delete"
                        size={20}
                        color={colors.text + '60'}
                      />
                    </TouchableOpacity>
                  </View>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  clearAllButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontFamily: 'Poppins_400Regular',
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
    alignItems: 'center',
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
  notificationContent: {
    flex: 1,
    flexDirection: 'row',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationTextContent: {
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
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
});

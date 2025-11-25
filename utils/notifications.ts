
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const NOTIFICATION_SETTINGS_KEY = '@flow_fam_notification_settings';

export interface NotificationSettings {
  dailyOverview: boolean;
  appointmentReminders: boolean;
  taskReminders: boolean;
  mealReminders: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  dailyOverview: true,
  appointmentReminders: true,
  taskReminders: true,
  mealReminders: true,
};

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return true;
}

export async function loadNotificationSettings(): Promise<NotificationSettings> {
  try {
    const data = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading notification settings:', error);
  }
  return DEFAULT_SETTINGS;
}

export async function saveNotificationSettings(settings: NotificationSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving notification settings:', error);
  }
}

export async function scheduleDailyOverviewNotification(
  appointmentsCount: number,
  tasksCount: number,
  dinnerName: string | null
): Promise<void> {
  const settings = await loadNotificationSettings();
  if (!settings.dailyOverview) return;

  // Cancel existing daily overview notifications
  const existingNotifications = await Notifications.getAllScheduledNotificationsAsync();
  for (const notif of existingNotifications) {
    if (notif.content.data?.type === 'dailyOverview') {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }

  // Schedule new notification for 8:00 AM
  const trigger = {
    hour: 8,
    minute: 0,
    repeats: true,
  };

  const dinnerText = dinnerName ? `diner: ${dinnerName}` : 'nog geen diner gepland';
  const body = `Vandaag: ${appointmentsCount} afspraken, ${tasksCount} taken, ${dinnerText}.`;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Jouw dag in Flow Fam 💛',
      body,
      data: { type: 'dailyOverview' },
    },
    trigger,
  });
}

export async function scheduleAppointmentReminder(
  appointmentId: string,
  title: string,
  date: Date,
  time: string
): Promise<void> {
  const settings = await loadNotificationSettings();
  if (!settings.appointmentReminders) return;

  // Parse time
  const [hours, minutes] = time.split(':').map(Number);
  
  // Create notification date (30 minutes before)
  const notificationDate = new Date(date);
  notificationDate.setHours(hours, minutes - 30, 0, 0);

  // Don't schedule if in the past
  if (notificationDate < new Date()) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Afspraak binnenkort',
      body: `${title} begint over 30 minuten`,
      data: { type: 'appointment', appointmentId },
    },
    trigger: notificationDate,
  });
}

export async function scheduleTaskReminder(
  taskId: string,
  taskName: string,
  time?: string
): Promise<void> {
  const settings = await loadNotificationSettings();
  if (!settings.taskReminders) return;

  if (time) {
    // Schedule at specific time
    const [hours, minutes] = time.split(':').map(Number);
    const trigger = {
      hour: hours,
      minute: minutes,
      repeats: true,
    };

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Taak herinnering',
        body: taskName,
        data: { type: 'task', taskId },
      },
      trigger,
    });
  } else {
    // Schedule at 9:00 AM for tasks without time
    const trigger = {
      hour: 9,
      minute: 0,
      repeats: true,
    };

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Taken voor vandaag',
        body: 'Je hebt taken gepland voor vandaag.',
        data: { type: 'task' },
      },
      trigger,
    });
  }
}

export async function scheduleMealReminder(): Promise<void> {
  const settings = await loadNotificationSettings();
  if (!settings.mealReminders) return;

  // Cancel existing meal reminders
  const existingNotifications = await Notifications.getAllScheduledNotificationsAsync();
  for (const notif of existingNotifications) {
    if (notif.content.data?.type === 'meal') {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }

  // Schedule for 2:00 PM daily
  const trigger = {
    hour: 14,
    minute: 0,
    repeats: true,
  };

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Diner planning',
      body: 'Heb je al gekozen wat jullie vanavond eten?',
      data: { type: 'meal' },
    },
    trigger,
  });
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function cancelNotificationsByType(type: string): Promise<void> {
  const existingNotifications = await Notifications.getAllScheduledNotificationsAsync();
  for (const notif of existingNotifications) {
    if (notif.content.data?.type === type) {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }
}

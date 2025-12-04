
import React, { useMemo } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { useFamily } from '@/contexts/FamilyContext';

export default function ChildDashboardScreen() {
  const router = useRouter();
  const { childId } = useLocalSearchParams<{ childId: string }>();
  const { familyMembers, tasks, appointments, completeTask } = useFamily();

  const child = familyMembers.find(m => m.id === childId);

  // Get today's date
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filter tasks for this child that are due today
  const todayTasks = useMemo(() => {
    return tasks.filter(task => {
      if (task.assignedTo !== childId) return false;
      if (task.completed) return false;

      // Check if task is due today
      if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate.getTime() === today.getTime();
      }

      // Include recurring tasks
      if (task.repeatType !== 'none') {
        return true;
      }

      return false;
    });
  }, [tasks, childId, today]);

  // Filter appointments for this child that are today
  const todayAppointments = useMemo(() => {
    return appointments.filter(apt => {
      if (!apt.assignedTo.includes(childId)) return false;

      const aptDate = new Date(apt.date);
      aptDate.setHours(0, 0, 0, 0);

      return aptDate.getTime() === today.getTime();
    }).sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, childId, today]);

  if (!child) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.errorText}>Kind niet gevonden</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleTaskComplete = (taskId: string, coins: number) => {
    completeTask(taskId);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="arrow-back"
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={[styles.headerAvatar, { backgroundColor: child.color }]}>
              {child.photoUri ? (
                <Image source={{ uri: child.photoUri }} style={styles.headerPhoto} />
              ) : (
                <Text style={styles.headerAvatarText}>{child.name.charAt(0)}</Text>
              )}
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>{child.name}</Text>
              <View style={styles.headerCoins}>
                <Text style={styles.headerCoinsText}>{child.coins}</Text>
                <Text style={styles.headerCoinEmoji}>🪙</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Today's Tasks */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Taken voor vandaag</Text>
            {todayTasks.length === 0 ? (
              <View style={styles.emptySection}>
                <Text style={styles.emptySectionText}>Geen taken voor vandaag</Text>
              </View>
            ) : (
              todayTasks.map((task, index) => (
                <React.Fragment key={index}>
                  <View style={styles.taskCard}>
                    <TouchableOpacity
                      style={styles.checkbox}
                      onPress={() => handleTaskComplete(task.id, task.coins)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.checkboxInner, { borderColor: child.color }]}>
                        {task.completed && (
                          <IconSymbol
                            ios_icon_name="checkmark"
                            android_material_icon_name="check"
                            size={16}
                            color={child.color}
                          />
                        )}
                      </View>
                    </TouchableOpacity>
                    <View style={[styles.taskIcon, { backgroundColor: child.color + '20' }]}>
                      <IconSymbol
                        ios_icon_name={task.icon}
                        android_material_icon_name={task.icon as any}
                        size={24}
                        color={child.color}
                      />
                    </View>
                    <View style={styles.taskInfo}>
                      <Text style={styles.taskName}>{task.name}</Text>
                      {task.time && (
                        <Text style={styles.taskTime}>🕐 {task.time}</Text>
                      )}
                    </View>
                    {task.coins > 0 && (
                      <View style={styles.taskCoins}>
                        <Text style={styles.taskCoinsText}>{task.coins}</Text>
                        <Text style={styles.taskCoinEmoji}>🪙</Text>
                      </View>
                    )}
                  </View>
                </React.Fragment>
              ))
            )}
          </View>

          {/* Today's Calendar */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📅 Planning voor vandaag</Text>
            {todayAppointments.length === 0 ? (
              <View style={styles.emptySection}>
                <Text style={styles.emptySectionText}>Geen afspraken voor vandaag</Text>
              </View>
            ) : (
              todayAppointments.map((apt, index) => (
                <React.Fragment key={index}>
                  <View style={[styles.appointmentCard, { borderLeftColor: apt.color }]}>
                    <View style={styles.appointmentTime}>
                      <Text style={styles.appointmentTimeText}>{apt.time}</Text>
                      {apt.endTime && (
                        <Text style={styles.appointmentEndTime}>- {apt.endTime}</Text>
                      )}
                    </View>
                    <View style={styles.appointmentInfo}>
                      <Text style={styles.appointmentTitle}>{apt.title}</Text>
                      {apt.location && (
                        <Text style={styles.appointmentLocation}>📍 {apt.location}</Text>
                      )}
                    </View>
                  </View>
                </React.Fragment>
              ))
            )}
          </View>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  headerPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
  },
  headerAvatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
    fontFamily: 'Poppins_700Bold',
  },
  headerCoins: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerCoinsText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.highlight,
    marginRight: 4,
    fontFamily: 'Poppins_600SemiBold',
  },
  headerCoinEmoji: {
    fontSize: 18,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
    fontFamily: 'Poppins_400Regular',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    fontFamily: 'Poppins_700Bold',
  },
  emptySection: {
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  emptySectionText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Poppins_400Regular',
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
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
  checkbox: {
    marginRight: 12,
  },
  checkboxInner: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taskInfo: {
    flex: 1,
  },
  taskName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
    fontFamily: 'Poppins_600SemiBold',
  },
  taskTime: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Poppins_400Regular',
  },
  taskCoins: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.highlight + '20',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 8,
  },
  taskCoinsText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.highlight,
    marginRight: 2,
    fontFamily: 'Poppins_600SemiBold',
  },
  taskCoinEmoji: {
    fontSize: 14,
  },
  appointmentCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
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
  appointmentTime: {
    marginRight: 16,
    minWidth: 60,
  },
  appointmentTimeText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Poppins_700Bold',
  },
  appointmentEndTime: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Poppins_400Regular',
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    fontFamily: 'Poppins_600SemiBold',
  },
  appointmentLocation: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Poppins_400Regular',
  },
});

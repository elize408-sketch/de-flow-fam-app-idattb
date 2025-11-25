
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useFamily } from '@/contexts/FamilyContext';

export default function TodayScreen() {
  const router = useRouter();
  const { 
    appointments, 
    tasks, 
    meals, 
    budgetPots,
    getTotalIncome,
    getTotalFixedExpenses,
    familyMembers,
    currentUser,
  } = useFamily();

  // Get today's date
  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  // Get today's appointments
  const todayAppointments = useMemo(() => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      aptDate.setHours(0, 0, 0, 0);
      return aptDate.getTime() === today.getTime();
    }).sort((a, b) => {
      const timeA = a.time.split(':').map(Number);
      const timeB = b.time.split(':').map(Number);
      return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
    });
  }, [appointments, today]);

  // Get today's tasks
  const todayTasks = useMemo(() => {
    const dayOfWeek = today.getDay();
    const dayOfMonth = today.getDate();

    return tasks.filter(task => {
      if (task.completed) return false;

      // One-time tasks
      if (task.repeatType === 'none' && task.dueDate) {
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate.getTime() === today.getTime();
      }

      // Recurring tasks
      if (task.repeatType === 'daily') return true;
      if (task.repeatType === 'weekly' && dayOfWeek === 1) return true; // Monday
      if (task.repeatType === 'monthly' && dayOfMonth === 1) return true;

      return false;
    });
  }, [tasks, today]);

  // Get today's dinner
  const todayDinner = useMemo(() => {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayKey = dayNames[today.getDay()];
    
    // This would need to be implemented with week planning state
    // For now, return null as placeholder
    return null;
  }, [today]);

  // Get budget info
  const budgetInfo = useMemo(() => {
    const totalIncome = getTotalIncome();
    const totalFixed = getTotalFixedExpenses();
    const totalVariableSpent = budgetPots.reduce((sum, pot) => sum + pot.spent, 0);
    const remaining = totalIncome - totalFixed - totalVariableSpent;

    const groceriesPot = budgetPots.find(pot => 
      pot.name.toLowerCase().includes('boodschappen')
    );

    return {
      remaining,
      groceriesPot,
    };
  }, [getTotalIncome, getTotalFixedExpenses, budgetPots]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Vandaag</Text>
          <Text style={styles.subtitle}>Jouw gezinsoverzicht voor vandaag</Text>
        </View>

        {/* Afspraken vandaag */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/(tabs)/agenda')}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <IconSymbol
                ios_icon_name="calendar"
                android_material_icon_name="event"
                size={24}
                color={colors.vibrantBlue}
              />
              <Text style={styles.cardTitle}>Afspraken vandaag</Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron_right"
              size={20}
              color={colors.textSecondary}
            />
          </View>

          {todayAppointments.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>🎉</Text>
              <Text style={styles.emptyText}>Geen afspraken vandaag</Text>
            </View>
          ) : (
            <View style={styles.cardContent}>
              {todayAppointments.slice(0, 3).map((apt, index) => {
                const assignedMembers = familyMembers.filter(m => apt.assignedTo.includes(m.id));
                return (
                  <React.Fragment key={index}>
                    <View style={styles.appointmentItem}>
                      <View style={styles.appointmentTime}>
                        <Text style={styles.timeText}>{apt.time}</Text>
                      </View>
                      <View style={styles.appointmentInfo}>
                        <Text style={styles.appointmentTitle}>{apt.title}</Text>
                        <Text style={styles.appointmentMembers}>
                          {assignedMembers.map(m => m.name).join(', ')}
                        </Text>
                      </View>
                    </View>
                  </React.Fragment>
                );
              })}
              {todayAppointments.length > 3 && (
                <Text style={styles.moreText}>
                  +{todayAppointments.length - 3} meer
                </Text>
              )}
            </View>
          )}
        </TouchableOpacity>

        {/* Taken vandaag */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/(tabs)/tasks')}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <IconSymbol
                ios_icon_name="checkmark.circle"
                android_material_icon_name="check_circle"
                size={24}
                color={colors.vibrantGreen}
              />
              <Text style={styles.cardTitle}>Taken vandaag</Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron_right"
              size={20}
              color={colors.textSecondary}
            />
          </View>

          {todayTasks.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>✨</Text>
              <Text style={styles.emptyText}>Geen taken vandaag</Text>
            </View>
          ) : (
            <View style={styles.cardContent}>
              {todayTasks.slice(0, 3).map((task, index) => {
                const assignedMember = familyMembers.find(m => m.id === task.assignedTo);
                return (
                  <React.Fragment key={index}>
                    <View style={styles.taskItem}>
                      <View style={styles.taskIcon}>
                        <IconSymbol
                          ios_icon_name={task.icon}
                          android_material_icon_name={task.icon as any}
                          size={20}
                          color={colors.accent}
                        />
                      </View>
                      <View style={styles.taskInfo}>
                        <Text style={styles.taskTitle}>{task.name}</Text>
                        {assignedMember && (
                          <Text style={styles.taskMember}>{assignedMember.name}</Text>
                        )}
                      </View>
                      {task.completed ? (
                        <IconSymbol
                          ios_icon_name="checkmark.circle.fill"
                          android_material_icon_name="check_circle"
                          size={24}
                          color={colors.vibrantGreen}
                        />
                      ) : (
                        <View style={styles.taskCheckbox} />
                      )}
                    </View>
                  </React.Fragment>
                );
              })}
              {todayTasks.length > 3 && (
                <Text style={styles.moreText}>
                  +{todayTasks.length - 3} meer
                </Text>
              )}
            </View>
          )}
        </TouchableOpacity>

        {/* Diner vandaag */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/(tabs)/meals')}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <IconSymbol
                ios_icon_name="fork.knife"
                android_material_icon_name="restaurant"
                size={24}
                color={colors.vibrantPink}
              />
              <Text style={styles.cardTitle}>Diner vandaag</Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron_right"
              size={20}
              color={colors.textSecondary}
            />
          </View>

          {!todayDinner ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>🍽️</Text>
              <Text style={styles.emptyText}>Nog geen diner gepland</Text>
            </View>
          ) : (
            <View style={styles.cardContent}>
              <Text style={styles.dinnerName}>{todayDinner}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Budget */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/(tabs)/finances')}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <IconSymbol
                ios_icon_name="eurosign.circle"
                android_material_icon_name="euro"
                size={24}
                color={colors.vibrantOrange}
              />
              <Text style={styles.cardTitle}>Budget</Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron_right"
              size={20}
              color={colors.textSecondary}
            />
          </View>

          <View style={styles.cardContent}>
            <View style={styles.budgetRow}>
              <Text style={styles.budgetLabel}>Over deze maand:</Text>
              <Text style={[
                styles.budgetAmount,
                budgetInfo.remaining >= 0 ? styles.positiveAmount : styles.negativeAmount
              ]}>
                €{budgetInfo.remaining.toFixed(2)}
              </Text>
            </View>

            {budgetInfo.groceriesPot && (
              <View style={styles.budgetRow}>
                <Text style={styles.budgetLabel}>Boodschappen:</Text>
                <Text style={styles.budgetAmount}>
                  €{budgetInfo.groceriesPot.spent.toFixed(2)} / €{budgetInfo.groceriesPot.budget.toFixed(2)}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
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
    paddingBottom: 140,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Poppins_700Bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Poppins_700Bold',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  cardContent: {
    gap: 12,
  },
  appointmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
  },
  appointmentTime: {
    backgroundColor: colors.vibrantBlue,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 12,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.card,
    fontFamily: 'Poppins_700Bold',
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 2,
  },
  appointmentMembers: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
  },
  taskIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 2,
  },
  taskMember: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  taskCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  dinnerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
    paddingVertical: 10,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  budgetLabel: {
    fontSize: 14,
    color: colors.text,
    fontFamily: 'Nunito_400Regular',
  },
  budgetAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Poppins_700Bold',
  },
  positiveAmount: {
    color: '#4CAF50',
  },
  negativeAmount: {
    color: '#F44336',
  },
  moreText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
    textAlign: 'center',
    marginTop: 5,
  },
});

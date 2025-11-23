
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useFamily } from '@/contexts/FamilyContext';
import TaskCompletionAnimation from '@/components/TaskCompletionAnimation';

export default function TasksScreen() {
  const { tasks, familyMembers, completeTask } = useFamily();
  const [showAnimation, setShowAnimation] = useState(false);
  const [completedTaskCoins, setCompletedTaskCoins] = useState(0);

  const handleCompleteTask = (taskId: string, coins: number) => {
    setCompletedTaskCoins(coins);
    setShowAnimation(true);
    completeTask(taskId);
  };

  const getChildName = (childId: string) => {
    const child = familyMembers.find(m => m.id === childId);
    return child?.name || 'Onbekend';
  };

  const groupedTasks = familyMembers
    .filter(m => m.role === 'child')
    .map(child => ({
      child,
      tasks: tasks.filter(t => t.assignedTo === child.id),
    }));

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Taken</Text>
          <Text style={styles.subtitle}>Overzicht van alle taken</Text>
        </View>

        {groupedTasks.map((group, groupIndex) => (
          <React.Fragment key={groupIndex}>
            <View style={styles.childSection}>
              <View style={styles.childHeader}>
                <View style={styles.childAvatar}>
                  <Text style={styles.childAvatarText}>{group.child.name.charAt(0)}</Text>
                </View>
                <View style={styles.childInfo}>
                  <Text style={styles.childName}>{group.child.name}</Text>
                  <View style={styles.coinsContainer}>
                    <Text style={styles.coinsText}>{group.child.coins}</Text>
                    <Text style={styles.coinEmoji}>🪙</Text>
                  </View>
                </View>
              </View>

              {group.tasks.map((task, taskIndex) => (
                <React.Fragment key={taskIndex}>
                  <TouchableOpacity
                    style={[styles.taskCard, task.completed && styles.taskCardCompleted]}
                    onPress={() => !task.completed && handleCompleteTask(task.id, task.coins)}
                    disabled={task.completed}
                  >
                    <View style={styles.taskIcon}>
                      <IconSymbol
                        ios_icon_name={task.icon}
                        android_material_icon_name={task.icon}
                        size={28}
                        color={task.completed ? colors.textSecondary : colors.accent}
                      />
                    </View>
                    <View style={styles.taskInfo}>
                      <Text style={[styles.taskName, task.completed && styles.taskNameCompleted]}>
                        {task.name}
                      </Text>
                      <View style={styles.taskMeta}>
                        <Text style={styles.taskMetaText}>
                          {task.repeatType === 'daily' ? '🔄 Dagelijks' : '📅 Eenmalig'}
                        </Text>
                        <Text style={styles.taskMetaText}>
                          ✅ {task.completedCount}x voltooid
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.taskCoins, task.completed && styles.taskCoinsCompleted]}>
                      <Text style={styles.taskCoinsText}>{task.coins}</Text>
                      <Text style={styles.taskCoinEmoji}>🪙</Text>
                    </View>
                  </TouchableOpacity>
                </React.Fragment>
              ))}
            </View>
          </React.Fragment>
        ))}
      </ScrollView>

      <TaskCompletionAnimation
        visible={showAnimation}
        coins={completedTaskCoins}
        onComplete={() => setShowAnimation(false)}
      />
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
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Poppins_700Bold',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 5,
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
    backgroundColor: colors.accent,
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
  taskCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  taskCardCompleted: {
    opacity: 0.6,
    backgroundColor: colors.secondary,
  },
  taskIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  taskInfo: {
    flex: 1,
  },
  taskName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 5,
    fontFamily: 'Poppins_600SemiBold',
  },
  taskNameCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  taskMeta: {
    flexDirection: 'row',
    gap: 10,
  },
  taskMetaText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  taskCoins: {
    backgroundColor: colors.highlight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskCoinsCompleted: {
    backgroundColor: colors.textSecondary,
  },
  taskCoinsText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.card,
    marginRight: 5,
    fontFamily: 'Poppins_700Bold',
  },
  taskCoinEmoji: {
    fontSize: 16,
  },
});

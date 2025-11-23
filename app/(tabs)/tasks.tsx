
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useFamily } from '@/contexts/FamilyContext';
import TaskCompletionAnimation from '@/components/TaskCompletionAnimation';
import IconPicker from '@/components/IconPicker';
import WeatherWidget from '@/components/WeatherWidget';

export default function TasksScreen() {
  const { tasks, familyMembers, completeTask, addTask, currentUser } = useFamily();
  const [showAnimation, setShowAnimation] = useState(false);
  const [completedTaskCoins, setCompletedTaskCoins] = useState(0);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskCoins, setNewTaskCoins] = useState('2');
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState('');
  const [newTaskRepeatType, setNewTaskRepeatType] = useState<'daily' | 'weekly' | 'monthly' | 'none'>('daily');
  const [newTaskIcon, setNewTaskIcon] = useState('check');

  const isParent = currentUser?.role === 'parent';
  const children = familyMembers.filter(m => m.role === 'child');

  // Filter tasks: children see only their own, parents see only their own
  const visibleTasks = tasks.filter(t => t.assignedTo === currentUser?.id);

  const handleCompleteTask = (taskId: string, coins: number) => {
    setCompletedTaskCoins(coins);
    setShowAnimation(true);
    completeTask(taskId);
  };

  const handleAddTask = () => {
    if (!newTaskName.trim()) {
      Alert.alert('Fout', 'Vul een taaknaam in');
      return;
    }

    if (!newTaskAssignedTo) {
      Alert.alert('Fout', 'Selecteer een kind');
      return;
    }

    const coins = parseInt(newTaskCoins) || 0;

    addTask({
      name: newTaskName.trim(),
      icon: newTaskIcon,
      coins,
      assignedTo: newTaskAssignedTo,
      completed: false,
      repeatType: newTaskRepeatType,
      createdBy: currentUser?.id,
    });

    setNewTaskName('');
    setNewTaskCoins('2');
    setNewTaskAssignedTo('');
    setNewTaskRepeatType('daily');
    setNewTaskIcon('check');
    setShowAddTaskModal(false);
    Alert.alert('Gelukt!', 'Taak toegevoegd');
  };

  // If child, show only their tasks with weather widget
  if (!isParent && currentUser) {
    const myTasks = visibleTasks;
    
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Mijn Taken</Text>
            <Text style={styles.subtitle}>Verdien muntjes door taken te voltooien!</Text>
          </View>

          {/* Weather Widget for Children */}
          <WeatherWidget />

          <View style={styles.coinsCard}>
            <Text style={styles.coinsEmoji}>🪙</Text>
            <View>
              <Text style={styles.coinsLabel}>Mijn muntjes</Text>
              <Text style={styles.coinsAmount}>{currentUser.coins}</Text>
            </View>
          </View>

          {myTasks.length === 0 ? (
            <View style={styles.emptyTasks}>
              <Text style={styles.emptyTasksEmoji}>✨</Text>
              <Text style={styles.emptyTasksText}>Nog geen taken</Text>
            </View>
          ) : (
            myTasks.map((task, taskIndex) => (
              <React.Fragment key={taskIndex}>
                <TouchableOpacity
                  style={[styles.taskCard, task.completed && styles.taskCardCompleted]}
                  onPress={() => !task.completed && handleCompleteTask(task.id, task.coins)}
                  disabled={task.completed}
                >
                  <View style={styles.taskIcon}>
                    <IconSymbol
                      ios_icon_name={task.icon}
                      android_material_icon_name={task.icon as any}
                      size={32}
                      color={task.completed ? colors.textSecondary : colors.accent}
                    />
                  </View>
                  <View style={styles.taskInfo}>
                    <Text style={[styles.taskName, task.completed && styles.taskNameCompleted]}>
                      {task.name}
                    </Text>
                    <View style={styles.taskMeta}>
                      <Text style={styles.taskMetaText}>
                        {task.repeatType === 'daily' && '🔄 Dagelijks'}
                        {task.repeatType === 'weekly' && '📅 Wekelijks'}
                        {task.repeatType === 'monthly' && '📆 Maandelijks'}
                        {task.repeatType === 'none' && '📌 Eenmalig'}
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
            ))
          )}
        </ScrollView>

        <TaskCompletionAnimation
          visible={showAnimation}
          coins={completedTaskCoins}
          onComplete={() => setShowAnimation(false)}
        />
      </View>
    );
  }

  // Parent view - show all children's tasks grouped
  const groupedTasks = children.map(child => ({
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

        {isParent && (
          <TouchableOpacity
            style={styles.addTaskButton}
            onPress={() => setShowAddTaskModal(true)}
          >
            <IconSymbol
              ios_icon_name="plus"
              android_material_icon_name="add"
              size={24}
              color={colors.card}
            />
            <Text style={styles.addTaskButtonText}>Nieuwe taak toevoegen</Text>
          </TouchableOpacity>
        )}

        {groupedTasks.map((group, groupIndex) => (
          <React.Fragment key={groupIndex}>
            <View style={styles.childSection}>
              <View style={styles.childHeader}>
                <View style={[styles.childAvatar, { backgroundColor: group.child.color || colors.accent }]}>
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

              {group.tasks.length === 0 ? (
                <View style={styles.emptyTasks}>
                  <Text style={styles.emptyTasksText}>Nog geen taken</Text>
                </View>
              ) : (
                group.tasks.map((task, taskIndex) => (
                  <React.Fragment key={taskIndex}>
                    <TouchableOpacity
                      style={[styles.taskCard, task.completed && styles.taskCardCompleted]}
                      onPress={() => !task.completed && handleCompleteTask(task.id, task.coins)}
                      disabled={task.completed}
                    >
                      <View style={styles.taskIcon}>
                        <IconSymbol
                          ios_icon_name={task.icon}
                          android_material_icon_name={task.icon as any}
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
                            {task.repeatType === 'daily' && '🔄 Dagelijks'}
                            {task.repeatType === 'weekly' && '📅 Wekelijks'}
                            {task.repeatType === 'monthly' && '📆 Maandelijks'}
                            {task.repeatType === 'none' && '📌 Eenmalig'}
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
                ))
              )}
            </View>
          </React.Fragment>
        ))}
      </ScrollView>

      <TaskCompletionAnimation
        visible={showAnimation}
        coins={completedTaskCoins}
        onComplete={() => setShowAnimation(false)}
      />

      {/* Add Task Modal */}
      <Modal
        visible={showAddTaskModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddTaskModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Nieuwe taak toevoegen</Text>

              <TextInput
                style={styles.input}
                placeholder="Taaknaam"
                placeholderTextColor={colors.textSecondary}
                value={newTaskName}
                onChangeText={setNewTaskName}
              />

              <IconPicker
                selectedIcon={newTaskIcon}
                onSelectIcon={setNewTaskIcon}
                type="task"
                taskName={newTaskName}
              />

              <TextInput
                style={styles.input}
                placeholder="Aantal muntjes"
                placeholderTextColor={colors.textSecondary}
                value={newTaskCoins}
                onChangeText={setNewTaskCoins}
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Toewijzen aan:</Text>
              <View style={styles.childSelector}>
                {children.map((child, index) => (
                  <React.Fragment key={index}>
                    <TouchableOpacity
                      style={[
                        styles.childOption,
                        newTaskAssignedTo === child.id && styles.childOptionActive,
                      ]}
                      onPress={() => setNewTaskAssignedTo(child.id)}
                    >
                      <View style={[styles.childOptionAvatar, { backgroundColor: child.color || colors.accent }]}>
                        <Text style={styles.childOptionAvatarText}>{child.name.charAt(0)}</Text>
                      </View>
                      <Text style={styles.childOptionName}>{child.name}</Text>
                    </TouchableOpacity>
                  </React.Fragment>
                ))}
              </View>

              <Text style={styles.inputLabel}>Herhaling:</Text>
              <View style={styles.repeatSelector}>
                {[
                  { value: 'daily', label: 'Dagelijks' },
                  { value: 'weekly', label: 'Wekelijks' },
                  { value: 'monthly', label: 'Maandelijks' },
                  { value: 'none', label: 'Eenmalig' },
                ].map((option, index) => (
                  <React.Fragment key={index}>
                    <TouchableOpacity
                      style={[
                        styles.repeatOption,
                        newTaskRepeatType === option.value && styles.repeatOptionActive,
                      ]}
                      onPress={() => setNewTaskRepeatType(option.value as any)}
                    >
                      <Text
                        style={[
                          styles.repeatOptionText,
                          newTaskRepeatType === option.value && styles.repeatOptionTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  </React.Fragment>
                ))}
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => {
                    setShowAddTaskModal(false);
                    setNewTaskName('');
                    setNewTaskCoins('2');
                    setNewTaskAssignedTo('');
                    setNewTaskRepeatType('daily');
                    setNewTaskIcon('check');
                  }}
                >
                  <Text style={styles.modalButtonText}>Annuleren</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonConfirm]}
                  onPress={handleAddTask}
                >
                  <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>Toevoegen</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
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
    marginBottom: 20,
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
  coinsCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  coinsEmoji: {
    fontSize: 48,
    marginRight: 15,
  },
  coinsLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 5,
    fontFamily: 'Nunito_400Regular',
  },
  coinsAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.highlight,
    fontFamily: 'Poppins_700Bold',
  },
  addTaskButton: {
    backgroundColor: colors.accent,
    borderRadius: 20,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  addTaskButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.card,
    marginLeft: 10,
    fontFamily: 'Poppins_600SemiBold',
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
  emptyTasks: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  emptyTasksEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  emptyTasksText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    boxShadow: `0px 8px 24px ${colors.shadow}`,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Poppins_700Bold',
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    color: colors.text,
    marginBottom: 15,
    fontFamily: 'Nunito_400Regular',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
    fontFamily: 'Poppins_600SemiBold',
  },
  childSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  childOption: {
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 10,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  childOptionActive: {
    borderColor: colors.accent,
    backgroundColor: colors.primary,
  },
  childOptionAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  childOptionAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.card,
    fontFamily: 'Poppins_700Bold',
  },
  childOptionName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
  },
  repeatSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  repeatOption: {
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 12,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  repeatOptionActive: {
    borderColor: colors.accent,
    backgroundColor: colors.primary,
  },
  repeatOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    fontFamily: 'Poppins_600SemiBold',
  },
  repeatOptionTextActive: {
    color: colors.text,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: colors.background,
  },
  modalButtonConfirm: {
    backgroundColor: colors.accent,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
  },
  modalButtonTextConfirm: {
    color: colors.card,
  },
});

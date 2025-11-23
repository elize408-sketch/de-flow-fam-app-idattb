
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, Image } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useFamily } from '@/contexts/FamilyContext';
import TaskCompletionAnimation from '@/components/TaskCompletionAnimation';
import IconPicker from '@/components/IconPicker';

export default function TasksScreen() {
  const { 
    tasks, 
    householdTasks,
    familyMembers, 
    completeTask, 
    addTask, 
    addHouseholdTask,
    updateHouseholdTask,
    deleteHouseholdTask,
    currentUser 
  } = useFamily();
  const [showAnimation, setShowAnimation] = useState(false);
  const [completedTaskCoins, setCompletedTaskCoins] = useState(0);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAddHouseholdModal, setShowAddHouseholdModal] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskCoins, setNewTaskCoins] = useState('2');
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState('');
  const [newTaskRepeatType, setNewTaskRepeatType] = useState<'daily' | 'weekly' | 'monthly' | 'none'>('daily');
  const [newTaskIcon, setNewTaskIcon] = useState('check');
  const [taskType, setTaskType] = useState<'personal' | 'household'>('personal');

  const isParent = currentUser?.role === 'parent';

  // Filter tasks: everyone sees only their own tasks
  const visibleTasks = tasks.filter(t => t.assignedTo === currentUser?.id);
  const visibleHouseholdTasks = householdTasks.filter(t => t.assignedTo === currentUser?.id);

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
      Alert.alert('Fout', 'Selecteer een gezinslid');
      return;
    }

    const coins = parseInt(newTaskCoins) || 0;

    if (taskType === 'household') {
      addHouseholdTask({
        name: newTaskName.trim(),
        assignedTo: newTaskAssignedTo,
        completed: false,
        repeatType: newTaskRepeatType,
        icon: newTaskIcon,
      });
    } else {
      addTask({
        name: newTaskName.trim(),
        icon: newTaskIcon,
        coins,
        assignedTo: newTaskAssignedTo,
        completed: false,
        repeatType: newTaskRepeatType,
        createdBy: currentUser?.id,
      });
    }

    setNewTaskName('');
    setNewTaskCoins('2');
    setNewTaskAssignedTo('');
    setNewTaskRepeatType('daily');
    setNewTaskIcon('check');
    setShowAddTaskModal(false);
    Alert.alert('Gelukt!', 'Taak toegevoegd');
  };

  const toggleHouseholdTask = (taskId: string, currentStatus: boolean) => {
    updateHouseholdTask(taskId, { completed: !currentStatus });
  };

  const handleDeleteHouseholdTask = (taskId: string, taskName: string) => {
    Alert.alert(
      'Verwijderen?',
      `Weet je zeker dat je "${taskName}" wilt verwijderen?`,
      [
        { text: 'Annuleren', style: 'cancel' },
        { text: 'Verwijderen', onPress: () => deleteHouseholdTask(taskId), style: 'destructive' },
      ]
    );
  };

  // If child, show only their tasks
  if (!isParent && currentUser) {
    const myTasks = visibleTasks;
    const myHouseholdTasks = visibleHouseholdTasks;
    
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Mijn Taken</Text>
            <Text style={styles.subtitle}>Verdien muntjes door taken te voltooien!</Text>
          </View>

          <View style={styles.coinsCard}>
            <Text style={styles.coinsEmoji}>🪙</Text>
            <View>
              <Text style={styles.coinsLabel}>Mijn muntjes</Text>
              <Text style={styles.coinsAmount}>{currentUser.coins}</Text>
            </View>
          </View>

          {/* Personal tasks with coins */}
          {myTasks.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>✅ Persoonlijke taken</Text>
              {myTasks.map((task, taskIndex) => (
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
              ))}
            </View>
          )}

          {/* Household tasks */}
          {myHouseholdTasks.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🏠 Huishoudelijke taken</Text>
              {myHouseholdTasks.map((task, taskIndex) => (
                <React.Fragment key={taskIndex}>
                  <View style={[styles.taskCard, task.completed && styles.taskCardCompleted]}>
                    <TouchableOpacity
                      style={styles.checkbox}
                      onPress={() => toggleHouseholdTask(task.id, task.completed)}
                    >
                      <View style={[styles.checkboxInner, task.completed && styles.checkboxChecked]}>
                        {task.completed && (
                          <IconSymbol
                            ios_icon_name="checkmark"
                            android_material_icon_name="check"
                            size={16}
                            color={colors.card}
                          />
                        )}
                      </View>
                    </TouchableOpacity>
                    <View style={styles.taskInfo}>
                      <Text style={[styles.taskName, task.completed && styles.taskNameCompleted]}>
                        {task.name}
                      </Text>
                      {task.repeatType && task.repeatType !== 'none' && (
                        <Text style={styles.taskMetaText}>
                          🔄 {task.repeatType === 'daily' && 'Dagelijks'}
                          {task.repeatType === 'weekly' && 'Wekelijks'}
                          {task.repeatType === 'monthly' && 'Maandelijks'}
                        </Text>
                      )}
                    </View>
                  </View>
                </React.Fragment>
              ))}
            </View>
          )}

          {myTasks.length === 0 && myHouseholdTasks.length === 0 && (
            <View style={styles.emptyTasks}>
              <Text style={styles.emptyTasksEmoji}>✨</Text>
              <Text style={styles.emptyTasksText}>Nog geen taken</Text>
            </View>
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

  // Parent view - show their own tasks and household tasks
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Taken</Text>
          <Text style={styles.subtitle}>Beheer persoonlijke en huishoudelijke taken</Text>
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

        {/* Personal tasks */}
        {visibleTasks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✅ Persoonlijke taken</Text>
            {visibleTasks.map((task, taskIndex) => (
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
            ))}
          </View>
        )}

        {/* Household tasks */}
        {visibleHouseholdTasks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏠 Huishoudelijke taken</Text>
            {visibleHouseholdTasks.map((task, taskIndex) => (
              <React.Fragment key={taskIndex}>
                <View style={[styles.taskCard, task.completed && styles.taskCardCompleted]}>
                  <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => toggleHouseholdTask(task.id, task.completed)}
                  >
                    <View style={[styles.checkboxInner, task.completed && styles.checkboxChecked]}>
                      {task.completed && (
                        <IconSymbol
                          ios_icon_name="checkmark"
                          android_material_icon_name="check"
                          size={16}
                          color={colors.card}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                  <View style={styles.taskInfo}>
                    <Text style={[styles.taskName, task.completed && styles.taskNameCompleted]}>
                      {task.name}
                    </Text>
                    {task.repeatType && task.repeatType !== 'none' && (
                      <Text style={styles.taskMetaText}>
                        🔄 {task.repeatType === 'daily' && 'Dagelijks'}
                        {task.repeatType === 'weekly' && 'Wekelijks'}
                        {task.repeatType === 'monthly' && 'Maandelijks'}
                      </Text>
                    )}
                  </View>
                  {isParent && (
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteHouseholdTask(task.id, task.name)}
                    >
                      <IconSymbol
                        ios_icon_name="trash"
                        android_material_icon_name="delete"
                        size={20}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </React.Fragment>
            ))}
          </View>
        )}

        {visibleTasks.length === 0 && visibleHouseholdTasks.length === 0 && (
          <View style={styles.emptyTasks}>
            <Text style={styles.emptyTasksEmoji}>✨</Text>
            <Text style={styles.emptyTasksText}>Nog geen taken</Text>
          </View>
        )}
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

              <Text style={styles.inputLabel}>Type taak:</Text>
              <View style={styles.taskTypeSelector}>
                <TouchableOpacity
                  style={[styles.taskTypeButton, taskType === 'personal' && styles.taskTypeButtonActive]}
                  onPress={() => setTaskType('personal')}
                >
                  <Text style={[styles.taskTypeButtonText, taskType === 'personal' && styles.taskTypeButtonTextActive]}>
                    ✅ Persoonlijk (met muntjes)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.taskTypeButton, taskType === 'household' && styles.taskTypeButtonActive]}
                  onPress={() => setTaskType('household')}
                >
                  <Text style={[styles.taskTypeButtonText, taskType === 'household' && styles.taskTypeButtonTextActive]}>
                    🏠 Huishoudelijk
                  </Text>
                </TouchableOpacity>
              </View>

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
                type={taskType === 'household' ? 'household' : 'task'}
                taskName={newTaskName}
              />

              {taskType === 'personal' && (
                <TextInput
                  style={styles.input}
                  placeholder="Aantal muntjes"
                  placeholderTextColor={colors.textSecondary}
                  value={newTaskCoins}
                  onChangeText={setNewTaskCoins}
                  keyboardType="numeric"
                />
              )}

              <Text style={styles.inputLabel}>Toewijzen aan:</Text>
              <View style={styles.memberSelector}>
                {familyMembers.map((member, index) => (
                  <React.Fragment key={index}>
                    <TouchableOpacity
                      style={[
                        styles.memberOption,
                        newTaskAssignedTo === member.id && styles.memberOptionActive,
                      ]}
                      onPress={() => setNewTaskAssignedTo(member.id)}
                    >
                      <View style={[styles.memberOptionAvatar, { backgroundColor: member.color || colors.accent }]}>
                        {member.photoUri ? (
                          <Image source={{ uri: member.photoUri }} style={styles.memberOptionPhoto} />
                        ) : (
                          <Text style={styles.memberOptionAvatarText}>{member.name.charAt(0)}</Text>
                        )}
                      </View>
                      <Text style={styles.memberOptionName}>{member.name}</Text>
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
                    setTaskType('personal');
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
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 15,
    fontFamily: 'Poppins_600SemiBold',
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
  checkbox: {
    marginRight: 15,
  },
  checkboxInner: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.accent,
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
  deleteButton: {
    padding: 10,
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
  taskTypeSelector: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  taskTypeButton: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  taskTypeButtonActive: {
    borderColor: colors.accent,
    backgroundColor: colors.primary,
  },
  taskTypeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
  },
  taskTypeButtonTextActive: {
    color: colors.text,
  },
  memberSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  memberOption: {
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 10,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  memberOptionActive: {
    borderColor: colors.accent,
    backgroundColor: colors.primary,
  },
  memberOptionAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    overflow: 'hidden',
  },
  memberOptionPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  memberOptionAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.card,
    fontFamily: 'Poppins_700Bold',
  },
  memberOptionName: {
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

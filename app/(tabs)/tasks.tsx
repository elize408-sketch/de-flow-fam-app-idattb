
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useFamily } from '@/contexts/FamilyContext';
import TaskCompletionAnimation from '@/components/TaskCompletionAnimation';
import IconPicker from '@/components/IconPicker';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function TasksScreen() {
  const router = useRouter();
  const { 
    tasks, 
    householdTasks,
    familyMembers, 
    completeTask, 
    addTask, 
    currentUser 
  } = useFamily();
  
  const [showAnimation, setShowAnimation] = useState(false);
  const [completedTaskCoins, setCompletedTaskCoins] = useState(0);
  const [showCoinsInAnimation, setShowCoinsInAnimation] = useState(true);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [taskMode, setTaskMode] = useState<'one-time' | 'recurring' | null>(null);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState('');
  const [newTaskRepeatType, setNewTaskRepeatType] = useState<'daily' | 'weekly' | 'monthly' | 'none'>('none');
  const [newTaskIcon, setNewTaskIcon] = useState('checkmark-circle');
  const [newTaskTime, setNewTaskTime] = useState('');
  const [newTaskDate, setNewTaskDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: boolean}>({});

  const isParent = currentUser?.role === 'parent';

  // Helper functions for date comparison
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isTomorrow = (date: Date) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date.getDate() === tomorrow.getDate() &&
           date.getMonth() === tomorrow.getMonth() &&
           date.getFullYear() === tomorrow.getFullYear();
  };

  const isThisWeek = (date: Date) => {
    const today = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(today.getDate() + 7);
    return date > today && date <= weekFromNow;
  };

  const shouldShowRecurringTaskToday = (task: Task) => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    if (task.repeatType === 'daily') return true;
    if (task.repeatType === 'weekly' && dayOfWeek === 1) return true; // Monday
    if (task.repeatType === 'monthly' && today.getDate() === 1) return true;
    
    return false;
  };

  // Categorize tasks
  const categorizedTasks = useMemo(() => {
    const userTasks = tasks.filter(t => t.assignedTo === currentUser?.id);
    
    const todayTasks: Task[] = [];
    const recurringTasks: { daily: Task[], weekly: Task[], monthly: Task[] } = {
      daily: [],
      weekly: [],
      monthly: []
    };
    const upcomingTasks: { tomorrow: Task[], thisWeek: Task[], later: Task[] } = {
      tomorrow: [],
      thisWeek: [],
      later: []
    };

    userTasks.forEach(task => {
      // Recurring tasks
      if (task.repeatType !== 'none') {
        // Add to today if it should show today
        if (shouldShowRecurringTaskToday(task)) {
          todayTasks.push(task);
        }
        
        // Also add to recurring section
        if (task.repeatType === 'daily') {
          recurringTasks.daily.push(task);
        } else if (task.repeatType === 'weekly') {
          recurringTasks.weekly.push(task);
        } else if (task.repeatType === 'monthly') {
          recurringTasks.monthly.push(task);
        }
      } else {
        // One-time tasks
        if (task.dueDate) {
          const dueDate = new Date(task.dueDate);
          
          if (isToday(dueDate)) {
            todayTasks.push(task);
          } else if (isTomorrow(dueDate)) {
            upcomingTasks.tomorrow.push(task);
          } else if (isThisWeek(dueDate)) {
            upcomingTasks.thisWeek.push(task);
          } else {
            upcomingTasks.later.push(task);
          }
        } else {
          // No due date, add to today
          todayTasks.push(task);
        }
      }
    });

    return { todayTasks, recurringTasks, upcomingTasks };
  }, [tasks, currentUser]);

  const handleCompleteTask = (taskId: string, coins: number) => {
    setCompletedTaskCoins(coins);
    setShowCoinsInAnimation(!isParent && coins > 0);
    setShowAnimation(true);
    completeTask(taskId);
  };

  const handleAddRecurringTaskToToday = (task: Task) => {
    // Create a one-time instance of this recurring task for today
    addTask({
      name: `${task.name} (vandaag)`,
      icon: task.icon,
      coins: task.coins,
      assignedTo: task.assignedTo,
      completed: false,
      repeatType: 'none',
      dueDate: new Date(),
      time: task.time,
      createdBy: currentUser?.id,
    });
    Alert.alert('Toegevoegd!', 'Taak is toegevoegd aan vandaag');
  };

  const handleAddTask = () => {
    const errors: {[key: string]: boolean} = {};

    if (!newTaskName.trim()) {
      errors.taskName = true;
    }

    if (!newTaskAssignedTo) {
      errors.assignedTo = true;
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      Alert.alert('Fout', 'Vul alle verplichte velden in');
      return;
    }

    setValidationErrors({});

    addTask({
      name: newTaskName.trim(),
      icon: newTaskIcon,
      coins: 0,
      assignedTo: newTaskAssignedTo,
      completed: false,
      repeatType: taskMode === 'recurring' ? newTaskRepeatType : 'none',
      dueDate: taskMode === 'one-time' ? newTaskDate : undefined,
      time: newTaskTime || undefined,
      createdBy: currentUser?.id,
    });

    // Reset form
    setNewTaskName('');
    setNewTaskAssignedTo('');
    setNewTaskRepeatType('none');
    setNewTaskIcon('checkmark-circle');
    setNewTaskTime('');
    setNewTaskDate(new Date());
    setTaskMode(null);
    setShowAddTaskModal(false);
    Alert.alert('Gelukt!', 'Taak toegevoegd');
  };

  const renderTaskCard = (task: Task, showExecuteButton: boolean = false) => {
    const assignedMember = familyMembers.find(m => m.id === task.assignedTo);
    
    return (
      <View key={task.id} style={[styles.taskCard, task.completed && styles.taskCardCompleted]}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => !task.completed && handleCompleteTask(task.id, task.coins)}
          disabled={task.completed}
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
          {task.time && (
            <Text style={styles.taskTime}>🕐 {task.time}</Text>
          )}
        </View>

        {assignedMember && (
          <View style={[styles.taskAvatar, { backgroundColor: assignedMember.color || colors.accent }]}>
            {assignedMember.photoUri ? (
              <Image source={{ uri: assignedMember.photoUri }} style={styles.taskAvatarPhoto} />
            ) : (
              <Text style={styles.taskAvatarText}>{assignedMember.name.charAt(0)}</Text>
            )}
          </View>
        )}

        {showExecuteButton && !task.completed && (
          <TouchableOpacity
            style={styles.executeButton}
            onPress={() => handleAddRecurringTaskToToday(task)}
          >
            <Text style={styles.executeButtonText}>Vandaag uitvoeren</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderRecurringTaskCard = (task: Task, frequency: string) => {
    const assignedMember = familyMembers.find(m => m.id === task.assignedTo);
    
    return (
      <View key={task.id} style={styles.recurringTaskCard}>
        <View style={styles.recurringTaskIcon}>
          <IconSymbol
            ios_icon_name={task.icon}
            android_material_icon_name={task.icon as any}
            size={24}
            color={colors.accent}
          />
        </View>

        <View style={styles.recurringTaskInfo}>
          <Text style={styles.recurringTaskFrequency}>{frequency}</Text>
          <Text style={styles.recurringTaskName}>{task.name}</Text>
          {task.time && (
            <Text style={styles.recurringTaskTime}>🕐 {task.time}</Text>
          )}
        </View>

        {assignedMember && (
          <View style={[styles.recurringTaskAvatar, { backgroundColor: assignedMember.color || colors.accent }]}>
            {assignedMember.photoUri ? (
              <Image source={{ uri: assignedMember.photoUri }} style={styles.recurringTaskAvatarPhoto} />
            ) : (
              <Text style={styles.recurringTaskAvatarText}>{assignedMember.name.charAt(0)}</Text>
            )}
          </View>
        )}

        <TouchableOpacity
          style={styles.addTodayButton}
          onPress={() => handleAddRecurringTaskToToday(task)}
        >
          <IconSymbol
            ios_icon_name="plus.circle.fill"
            android_material_icon_name="add_circle"
            size={20}
            color={colors.accent}
          />
          <Text style={styles.addTodayButtonText}>Vandaag</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.push('/(tabs)/(home)')}
        >
          <IconSymbol
            ios_icon_name="house"
            android_material_icon_name="home"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Taken</Text>
        </View>
        
        {isParent && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddTaskModal(true)}
          >
            <IconSymbol
              ios_icon_name="plus"
              android_material_icon_name="add"
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
        )}
        {!isParent && <View style={styles.placeholder} />}
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Vandaag Block */}
        <View style={styles.block}>
          <Text style={styles.blockTitle}>📅 Vandaag</Text>
          {categorizedTasks.todayTasks.length > 0 ? (
            categorizedTasks.todayTasks.map(task => renderTaskCard(task))
          ) : (
            <View style={styles.emptyBlock}>
              <Text style={styles.emptyBlockText}>Geen taken voor vandaag</Text>
            </View>
          )}
        </View>

        {/* Herhalingstaken Block */}
        <View style={styles.block}>
          <Text style={styles.blockTitle}>🔄 Herhalingstaken</Text>
          
          {categorizedTasks.recurringTasks.daily.length > 0 && (
            <View style={styles.subSection}>
              <Text style={styles.subSectionTitle}>Dagelijks</Text>
              {categorizedTasks.recurringTasks.daily.map(task => 
                renderRecurringTaskCard(task, 'Dagelijks')
              )}
            </View>
          )}

          {categorizedTasks.recurringTasks.weekly.length > 0 && (
            <View style={styles.subSection}>
              <Text style={styles.subSectionTitle}>Wekelijks</Text>
              {categorizedTasks.recurringTasks.weekly.map(task => 
                renderRecurringTaskCard(task, 'Wekelijks')
              )}
            </View>
          )}

          {categorizedTasks.recurringTasks.monthly.length > 0 && (
            <View style={styles.subSection}>
              <Text style={styles.subSectionTitle}>Maandelijks</Text>
              {categorizedTasks.recurringTasks.monthly.map(task => 
                renderRecurringTaskCard(task, 'Maandelijks')
              )}
            </View>
          )}

          {categorizedTasks.recurringTasks.daily.length === 0 &&
           categorizedTasks.recurringTasks.weekly.length === 0 &&
           categorizedTasks.recurringTasks.monthly.length === 0 && (
            <View style={styles.emptyBlock}>
              <Text style={styles.emptyBlockText}>Geen herhalingstaken</Text>
            </View>
          )}
        </View>

        {/* Komende taken Block */}
        <View style={styles.block}>
          <Text style={styles.blockTitle}>📆 Komende taken</Text>
          
          {categorizedTasks.upcomingTasks.tomorrow.length > 0 && (
            <View style={styles.subSection}>
              <Text style={styles.subSectionTitle}>Morgen</Text>
              {categorizedTasks.upcomingTasks.tomorrow.map(task => renderTaskCard(task))}
            </View>
          )}

          {categorizedTasks.upcomingTasks.thisWeek.length > 0 && (
            <View style={styles.subSection}>
              <Text style={styles.subSectionTitle}>Deze week</Text>
              {categorizedTasks.upcomingTasks.thisWeek.map(task => renderTaskCard(task))}
            </View>
          )}

          {categorizedTasks.upcomingTasks.later.length > 0 && (
            <View style={styles.subSection}>
              <Text style={styles.subSectionTitle}>Later</Text>
              {categorizedTasks.upcomingTasks.later.map(task => renderTaskCard(task))}
            </View>
          )}

          {categorizedTasks.upcomingTasks.tomorrow.length === 0 &&
           categorizedTasks.upcomingTasks.thisWeek.length === 0 &&
           categorizedTasks.upcomingTasks.later.length === 0 && (
            <View style={styles.emptyBlock}>
              <Text style={styles.emptyBlockText}>Geen komende taken</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <TaskCompletionAnimation
        visible={showAnimation}
        coins={completedTaskCoins}
        onComplete={() => setShowAnimation(false)}
        showCoins={showCoinsInAnimation}
      />

      {/* Add Task Modal */}
      <Modal
        visible={showAddTaskModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowAddTaskModal(false);
          setTaskMode(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalBackButton}
                onPress={() => {
                  if (taskMode) {
                    setTaskMode(null);
                  } else {
                    setShowAddTaskModal(false);
                    setNewTaskName('');
                    setNewTaskAssignedTo('');
                    setNewTaskRepeatType('none');
                    setNewTaskIcon('checkmark-circle');
                    setNewTaskTime('');
                    setNewTaskDate(new Date());
                    setValidationErrors({});
                  }
                }}
              >
                <IconSymbol
                  ios_icon_name="chevron.left"
                  android_material_icon_name="arrow_back"
                  size={24}
                  color={colors.text}
                />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {!taskMode ? 'Type taak kiezen' : 'Nieuwe taak toevoegen'}
              </Text>
              <View style={styles.placeholder} />
            </View>

            <ScrollView contentContainerStyle={styles.modalScrollContent}>
              {!taskMode ? (
                // Step 1: Choose task type
                <View style={styles.taskTypeSelection}>
                  <TouchableOpacity
                    style={styles.taskTypeCard}
                    onPress={() => setTaskMode('one-time')}
                  >
                    <IconSymbol
                      ios_icon_name="calendar"
                      android_material_icon_name="event"
                      size={48}
                      color={colors.accent}
                    />
                    <Text style={styles.taskTypeCardTitle}>Eenmalige taak</Text>
                    <Text style={styles.taskTypeCardDescription}>
                      Voor taken met een specifieke datum
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.taskTypeCard}
                    onPress={() => setTaskMode('recurring')}
                  >
                    <IconSymbol
                      ios_icon_name="arrow.clockwise"
                      android_material_icon_name="refresh"
                      size={48}
                      color={colors.accent}
                    />
                    <Text style={styles.taskTypeCardTitle}>Herhalende taak</Text>
                    <Text style={styles.taskTypeCardDescription}>
                      Voor dagelijkse, wekelijkse of maandelijkse taken
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                // Step 2: Task details
                <View style={styles.taskForm}>
                  <TextInput
                    style={[
                      styles.input,
                      validationErrors.taskName && styles.inputError
                    ]}
                    placeholder="Taaknaam *"
                    placeholderTextColor={validationErrors.taskName ? '#E74C3C' : colors.textSecondary}
                    value={newTaskName}
                    onChangeText={(text) => {
                      setNewTaskName(text);
                      if (validationErrors.taskName && text.trim()) {
                        setValidationErrors(prev => ({ ...prev, taskName: false }));
                      }
                    }}
                  />

                  <IconPicker
                    selectedIcon={newTaskIcon}
                    onSelectIcon={setNewTaskIcon}
                    type="task"
                    taskName={newTaskName}
                  />

                  <Text style={styles.inputLabel}>Toewijzen aan: *</Text>
                  <View style={styles.memberSelector}>
                    {familyMembers.map((member, index) => (
                      <React.Fragment key={index}>
                        <TouchableOpacity
                          style={[
                            styles.memberOption,
                            newTaskAssignedTo === member.id && styles.memberOptionActive,
                            validationErrors.assignedTo && !newTaskAssignedTo && styles.memberOptionError,
                          ]}
                          onPress={() => {
                            setNewTaskAssignedTo(member.id);
                            if (validationErrors.assignedTo) {
                              setValidationErrors(prev => ({ ...prev, assignedTo: false }));
                            }
                          }}
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

                  {taskMode === 'one-time' && (
                    <>
                      <Text style={styles.inputLabel}>Datum:</Text>
                      <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => setShowDatePicker(true)}
                      >
                        <IconSymbol
                          ios_icon_name="calendar"
                          android_material_icon_name="event"
                          size={20}
                          color={colors.text}
                        />
                        <Text style={styles.dateButtonText}>
                          {newTaskDate.toLocaleDateString('nl-NL', { 
                            weekday: 'short', 
                            day: 'numeric', 
                            month: 'short' 
                          })}
                        </Text>
                      </TouchableOpacity>

                      {showDatePicker && (
                        <DateTimePicker
                          value={newTaskDate}
                          mode="date"
                          display="default"
                          onChange={(event, selectedDate) => {
                            setShowDatePicker(false);
                            if (selectedDate) {
                              setNewTaskDate(selectedDate);
                            }
                          }}
                        />
                      )}
                    </>
                  )}

                  {taskMode === 'recurring' && (
                    <>
                      <Text style={styles.inputLabel}>Herhaling:</Text>
                      <View style={styles.repeatSelector}>
                        {[
                          { value: 'daily', label: 'Dagelijks', icon: 'sun.max' },
                          { value: 'weekly', label: 'Wekelijks', icon: 'calendar' },
                          { value: 'monthly', label: 'Maandelijks', icon: 'calendar.badge.clock' },
                        ].map((option, index) => (
                          <React.Fragment key={index}>
                            <TouchableOpacity
                              style={[
                                styles.repeatOption,
                                newTaskRepeatType === option.value && styles.repeatOptionActive,
                              ]}
                              onPress={() => setNewTaskRepeatType(option.value as any)}
                            >
                              <IconSymbol
                                ios_icon_name={option.icon}
                                android_material_icon_name="event_repeat"
                                size={24}
                                color={newTaskRepeatType === option.value ? colors.accent : colors.textSecondary}
                              />
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
                    </>
                  )}

                  <Text style={styles.inputLabel}>Tijd (optioneel):</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="bijv. 09:00"
                    placeholderTextColor={colors.textSecondary}
                    value={newTaskTime}
                    onChangeText={setNewTaskTime}
                  />

                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleAddTask}
                  >
                    <Text style={styles.submitButtonText}>Taak toevoegen</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: `0px 2px 8px ${colors.shadow}`,
    elevation: 2,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: `0px 2px 8px ${colors.shadow}`,
    elevation: 2,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  block: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  blockTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 15,
    fontFamily: 'Poppins_700Bold',
  },
  subSection: {
    marginTop: 15,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 10,
    fontFamily: 'Poppins_600SemiBold',
  },
  emptyBlock: {
    padding: 20,
    alignItems: 'center',
  },
  emptyBlockText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  taskCard: {
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  taskCardCompleted: {
    opacity: 0.5,
  },
  checkbox: {
    marginRight: 12,
  },
  checkboxInner: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.accent,
  },
  taskIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
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
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 2,
  },
  taskNameCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  taskTime: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  taskAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    overflow: 'hidden',
  },
  taskAvatarPhoto: {
    width: '100%',
    height: '100%',
  },
  taskAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.card,
    fontFamily: 'Poppins_700Bold',
  },
  executeButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 8,
  },
  executeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.card,
    fontFamily: 'Poppins_600SemiBold',
  },
  recurringTaskCard: {
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  recurringTaskIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recurringTaskInfo: {
    flex: 1,
  },
  recurringTaskFrequency: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 2,
  },
  recurringTaskName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 2,
  },
  recurringTaskTime: {
    fontSize: 11,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  recurringTaskAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    overflow: 'hidden',
  },
  recurringTaskAvatarPhoto: {
    width: '100%',
    height: '100%',
  },
  recurringTaskAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.card,
    fontFamily: 'Poppins_700Bold',
  },
  addTodayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 8,
  },
  addTodayButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.accent,
    fontFamily: 'Poppins_600SemiBold',
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: '90%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  modalBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
    flex: 1,
  },
  modalScrollContent: {
    padding: 20,
  },
  taskTypeSelection: {
    gap: 15,
  },
  taskTypeCard: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  taskTypeCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Poppins_700Bold',
    marginTop: 15,
    marginBottom: 5,
  },
  taskTypeCardDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
    textAlign: 'center',
  },
  taskForm: {
    gap: 15,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    color: colors.text,
    fontFamily: 'Nunito_400Regular',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: '#E74C3C',
    backgroundColor: '#FFE5E5',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
  },
  memberSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
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
  memberOptionError: {
    borderColor: '#E74C3C',
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
  dateButton: {
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dateButtonText: {
    fontSize: 16,
    color: colors.text,
    fontFamily: 'Nunito_400Regular',
  },
  repeatSelector: {
    gap: 10,
  },
  repeatOption: {
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  repeatOptionActive: {
    borderColor: colors.accent,
    backgroundColor: colors.primary,
  },
  repeatOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    fontFamily: 'Poppins_600SemiBold',
  },
  repeatOptionTextActive: {
    color: colors.text,
  },
  submitButton: {
    backgroundColor: colors.accent,
    borderRadius: 15,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.card,
    fontFamily: 'Poppins_700Bold',
  },
});

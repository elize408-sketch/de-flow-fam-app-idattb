
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useFamily } from '@/contexts/FamilyContext';
import IconPicker from '@/components/IconPicker';
import { useModuleTheme, ModuleName } from '@/contexts/ThemeContext';
import ModuleHeader from '@/components/ModuleHeader';
import TaskCompletionAnimation from '@/components/TaskCompletionAnimation';

export default function TasksScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { setModule, accentColor } = useModuleTheme();
  const { 
    tasks, 
    addTask, 
    completeTask, 
    familyMembers, 
    currentUser,
  } = useFamily();

  // Set module theme on mount
  useEffect(() => {
    setModule('tasks' as ModuleName);
  }, [setModule]);

  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskCoins, setNewTaskCoins] = useState('');
  const [newTaskIcon, setNewTaskIcon] = useState('check');
  const [newTaskRepeat, setNewTaskRepeat] = useState<'daily' | 'weekly' | 'monthly' | 'none'>('none');
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);
  const [completedTaskName, setCompletedTaskName] = useState('');
  const [validationErrors, setValidationErrors] = useState<{[key: string]: boolean}>({});

  const isParent = currentUser?.role === 'parent';
  const children = familyMembers.filter(m => m.role === 'child');

  // Filter tasks based on user role
  const visibleTasks = isParent 
    ? tasks 
    : tasks.filter(t => t.assignedTo === currentUser?.id);

  const handleAddTask = () => {
    const errors: {[key: string]: boolean} = {};

    if (!newTaskName.trim()) {
      errors.taskName = true;
    }

    const coins = parseInt(newTaskCoins);
    if (isNaN(coins) || coins < 0) {
      errors.taskCoins = true;
    }

    if (!selectedChild) {
      errors.selectedChild = true;
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      Alert.alert(t('common.error'), t('tasks.fillAllFields'));
      return;
    }

    setValidationErrors({});

    addTask({
      name: newTaskName.trim(),
      icon: newTaskIcon,
      coins: coins,
      assignedTo: selectedChild,
      completed: false,
      repeatType: newTaskRepeat,
      createdBy: currentUser?.id,
    });

    setNewTaskName('');
    setNewTaskCoins('');
    setNewTaskIcon('check');
    setNewTaskRepeat('none');
    setSelectedChild('');
    setShowAddTaskModal(false);
    Alert.alert(t('common.success'), t('tasks.taskAdded'));
  };

  const handleCompleteTask = (taskId: string, taskName: string) => {
    completeTask(taskId);
    setCompletedTaskName(taskName);
    setShowCompletionAnimation(true);
  };

  return (
    <View style={styles.container}>
      <ModuleHeader
        title={t('tasks.title')}
        subtitle={t('tasks.subtitle')}
        showAddButton={isParent}
        onAddPress={() => setShowAddTaskModal(true)}
      />

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {visibleTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol
              ios_icon_name="checkmark.circle"
              android_material_icon_name="check-circle"
              size={64}
              color={colors.textSecondary}
            />
            <Text style={styles.emptyStateTitle}>
              {isParent ? t('tasks.noTasksParent') : t('tasks.noTasksChild')}
            </Text>
            <Text style={styles.emptyStateText}>
              {isParent ? t('tasks.addFirstTask') : t('tasks.waitForTasks')}
            </Text>
          </View>
        ) : (
          visibleTasks.map((task, index) => {
            const assignedChild = children.find(c => c.id === task.assignedTo);
            return (
              <React.Fragment key={index}>
                <View style={styles.taskCard}>
                  <View style={[styles.taskIconContainer, { backgroundColor: accentColor + '20' }]}>
                    <IconSymbol
                      ios_icon_name={task.icon}
                      android_material_icon_name={task.icon}
                      size={32}
                      color={accentColor}
                    />
                  </View>
                  <View style={styles.taskInfo}>
                    <Text style={styles.taskName}>{task.name}</Text>
                    {isParent && assignedChild && (
                      <Text style={styles.taskAssignee}>
                        {t('tasks.assignedTo')}: {assignedChild.name}
                      </Text>
                    )}
                    <View style={styles.taskMeta}>
                      <View style={styles.coinsContainer}>
                        <Text style={styles.coinsText}>{task.coins}</Text>
                        <Text style={styles.coinEmoji}>🪙</Text>
                      </View>
                      {task.repeatType !== 'none' && (
                        <View style={styles.repeatBadge}>
                          <IconSymbol
                            ios_icon_name="arrow.clockwise"
                            android_material_icon_name="refresh"
                            size={14}
                            color={colors.textSecondary}
                          />
                          <Text style={styles.repeatText}>
                            {task.repeatType === 'daily' && t('tasks.daily')}
                            {task.repeatType === 'weekly' && t('tasks.weekly')}
                            {task.repeatType === 'monthly' && t('tasks.monthly')}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                  {!task.completed && (
                    <TouchableOpacity
                      style={[styles.completeButton, { backgroundColor: accentColor }]}
                      onPress={() => handleCompleteTask(task.id, task.name)}
                    >
                      <IconSymbol
                        ios_icon_name="checkmark"
                        android_material_icon_name="check"
                        size={24}
                        color={colors.card}
                      />
                    </TouchableOpacity>
                  )}
                  {task.completed && (
                    <View style={styles.completedBadge}>
                      <IconSymbol
                        ios_icon_name="checkmark.circle.fill"
                        android_material_icon_name="check-circle"
                        size={32}
                        color={colors.vibrantGreen}
                      />
                    </View>
                  )}
                </View>
              </React.Fragment>
            );
          })
        )}
      </ScrollView>

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
              <Text style={styles.modalTitle}>{t('tasks.addTask')}</Text>

              <TextInput
                style={[
                  styles.input,
                  validationErrors.taskName && styles.inputError
                ]}
                placeholder={t('tasks.taskName')}
                placeholderTextColor={validationErrors.taskName ? '#E74C3C' : colors.textSecondary}
                value={newTaskName}
                onChangeText={(text) => {
                  setNewTaskName(text);
                  if (validationErrors.taskName && text.trim()) {
                    setValidationErrors(prev => ({ ...prev, taskName: false }));
                  }
                }}
              />

              <TextInput
                style={[
                  styles.input,
                  validationErrors.taskCoins && styles.inputError
                ]}
                placeholder={t('rewards.coins', { count: 0 })}
                placeholderTextColor={validationErrors.taskCoins ? '#E74C3C' : colors.textSecondary}
                value={newTaskCoins}
                onChangeText={(text) => {
                  setNewTaskCoins(text);
                  if (validationErrors.taskCoins && text.trim()) {
                    setValidationErrors(prev => ({ ...prev, taskCoins: false }));
                  }
                }}
                keyboardType="numeric"
              />

              <IconPicker
                selectedIcon={newTaskIcon}
                onSelectIcon={setNewTaskIcon}
                type="task"
                taskName={newTaskName}
              />

              <Text style={styles.inputLabel}>{t('tasks.assignTo')}</Text>
              <View style={[
                styles.childSelector,
                validationErrors.selectedChild && styles.childSelectorError
              ]}>
                {children.map((child, index) => (
                  <React.Fragment key={index}>
                    <TouchableOpacity
                      style={[
                        styles.childOption,
                        selectedChild === child.id && styles.childOptionActive,
                      ]}
                      onPress={() => {
                        setSelectedChild(child.id);
                        if (validationErrors.selectedChild) {
                          setValidationErrors(prev => ({ ...prev, selectedChild: false }));
                        }
                      }}
                    >
                      <View style={[styles.childAvatar, { backgroundColor: child.color }]}>
                        <Text style={styles.childAvatarText}>{child.name.charAt(0)}</Text>
                      </View>
                      <Text style={styles.childName}>{child.name}</Text>
                    </TouchableOpacity>
                  </React.Fragment>
                ))}
              </View>

              <Text style={styles.inputLabel}>{t('tasks.repeat')}</Text>
              <View style={styles.repeatSelector}>
                {[
                  { value: 'none', label: t('tasks.repeatNone') },
                  { value: 'daily', label: t('tasks.repeatDaily') },
                  { value: 'weekly', label: t('tasks.repeatWeekly') },
                  { value: 'monthly', label: t('tasks.repeatMonthly') },
                ].map((option, index) => (
                  <React.Fragment key={index}>
                    <TouchableOpacity
                      style={[
                        styles.repeatOption,
                        newTaskRepeat === option.value && styles.repeatOptionActive,
                      ]}
                      onPress={() => setNewTaskRepeat(option.value as any)}
                    >
                      <Text
                        style={[
                          styles.repeatOptionText,
                          newTaskRepeat === option.value && styles.repeatOptionTextActive,
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
                    setNewTaskCoins('');
                    setNewTaskIcon('check');
                    setNewTaskRepeat('none');
                    setSelectedChild('');
                    setValidationErrors({});
                  }}
                >
                  <Text style={styles.modalButtonText}>{t('common.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonConfirm, { backgroundColor: accentColor }]}
                  onPress={handleAddTask}
                >
                  <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>{t('common.add')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Task Completion Animation */}
      <TaskCompletionAnimation
        visible={showCompletionAnimation}
        taskName={completedTaskName}
        onComplete={() => setShowCompletionAnimation(false)}
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
    paddingHorizontal: 20,
    paddingBottom: 140,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 20,
    marginBottom: 10,
    fontFamily: 'Poppins_700Bold',
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
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
  taskIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  taskInfo: {
    flex: 1,
  },
  taskName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    fontFamily: 'Poppins_600SemiBold',
  },
  taskAssignee: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
    fontFamily: 'Nunito_400Regular',
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.highlight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  coinsText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.card,
    marginRight: 4,
    fontFamily: 'Poppins_700Bold',
  },
  coinEmoji: {
    fontSize: 14,
  },
  repeatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  repeatText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  completeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  completedBadge: {
    marginLeft: 10,
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
    marginBottom: 10,
    fontFamily: 'Poppins_600SemiBold',
  },
  childSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  childSelectorError: {
    borderWidth: 2,
    borderColor: '#E74C3C',
    borderRadius: 15,
    padding: 10,
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
    borderColor: colors.vibrantOrange,
    backgroundColor: colors.primary,
  },
  childAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  childAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.card,
    fontFamily: 'Poppins_700Bold',
  },
  childName: {
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

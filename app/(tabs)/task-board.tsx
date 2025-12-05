
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useFamily } from '@/contexts/FamilyContext';
import ModuleHeader from '@/components/ModuleHeader';
import { supabase } from '@/utils/supabase';
import { TaskBoardItem } from '@/types/schedule';
import IconPicker from '@/components/IconPicker';
import TaskCompletionAnimation from '@/components/TaskCompletionAnimation';
import * as Haptics from 'expo-haptics';

const STATUS_COLUMNS = [
  { id: 'todo', title: 'Te Doen', color: '#FFB84D', icon: 'list' },
  { id: 'in_progress', title: 'Bezig', color: '#4A90E2', icon: 'play' },
  { id: 'done', title: 'Klaar', color: '#7ED321', icon: 'check' },
];

export default function TaskBoardScreen() {
  const { t } = useTranslation();
  const { familyMembers, currentUser, currentFamily, updateFamilyMember } = useFamily();
  const [tasks, setTasks] = useState<TaskBoardItem[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);
  const [completedPoints, setCompletedPoints] = useState(0);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: 'check',
    points: '10',
    repeatType: 'none' as TaskBoardItem['repeatType'],
  });

  const isParent = currentUser?.role === 'parent';
  const children = familyMembers.filter(m => m.role === 'child');

  // Set first child as selected by default
  useEffect(() => {
    if (children.length > 0 && !selectedChild) {
      setSelectedChild(children[0].id);
    }
  }, [children, selectedChild]);

  const loadTasks = useCallback(async () => {
    if (!currentFamily) return;

    try {
      const { data, error } = await supabase
        .from('task_board_items')
        .select('*')
        .eq('family_id', currentFamily.id)
        .order('order_index');

      if (error) throw error;

      if (data) {
        const formattedTasks: TaskBoardItem[] = data.map(t => ({
          id: t.id,
          familyId: t.family_id,
          childId: t.child_id,
          title: t.title,
          description: t.description,
          icon: t.icon,
          points: t.points,
          status: t.status,
          repeatType: t.repeat_type,
          orderIndex: t.order_index,
          completedAt: t.completed_at ? new Date(t.completed_at) : undefined,
          createdBy: t.created_by,
          createdAt: new Date(t.created_at),
          updatedAt: new Date(t.updated_at),
        }));
        setTasks(formattedTasks);
      }
    } catch (error) {
      console.error('Error loading task board items:', error);
      Alert.alert('Fout', 'Kon takenbord niet laden');
    }
  }, [currentFamily]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleAddTask = async () => {
    if (!formData.title.trim() || !selectedChild || !currentFamily || !currentUser) {
      Alert.alert('Fout', 'Vul alle verplichte velden in');
      return;
    }

    const points = parseInt(formData.points);
    if (isNaN(points) || points < 0) {
      Alert.alert('Fout', 'Vul een geldig aantal punten in');
      return;
    }

    try {
      const { error } = await supabase
        .from('task_board_items')
        .insert([{
          family_id: currentFamily.id,
          child_id: selectedChild,
          title: formData.title,
          description: formData.description || null,
          icon: formData.icon,
          points: points,
          status: 'todo',
          repeat_type: formData.repeatType,
          order_index: tasks.filter(t => t.childId === selectedChild && t.status === 'todo').length,
          created_by: currentUser.id,
        }]);

      if (error) throw error;

      Alert.alert('Succes', 'Taak toegevoegd');
      setShowAddModal(false);
      resetForm();
      loadTasks();
    } catch (error) {
      console.error('Error adding task:', error);
      Alert.alert('Fout', 'Kon taak niet toevoegen');
    }
  };

  const handleMoveTask = async (taskId: string, newStatus: TaskBoardItem['status']) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Trigger haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const updates: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      // If moving to done, award points and record completion
      if (newStatus === 'done' && task.status !== 'done') {
        updates.completed_at = new Date().toISOString();

        // Award points to child
        const child = familyMembers.find(m => m.id === task.childId);
        if (child) {
          const newCoins = child.coins + task.points;
          
          // Update family member coins
          const { error: memberError } = await supabase
            .from('family_members')
            .update({ coins: newCoins })
            .eq('id', child.id);

          if (memberError) throw memberError;

          // Update local state
          updateFamilyMember(child.id, { coins: newCoins });

          // Record points transaction
          await supabase
            .from('points_transactions')
            .insert([{
              family_id: currentFamily?.id,
              child_id: child.id,
              points: task.points,
              transaction_type: 'task_completed',
              description: `Taak voltooid: ${task.title}`,
              related_task_id: task.id,
              created_by: currentUser?.id,
            }]);

          // Show completion animation
          setCompletedPoints(task.points);
          setShowCompletionAnimation(true);
        }
      }

      const { error } = await supabase
        .from('task_board_items')
        .update(updates)
        .eq('id', taskId);

      if (error) throw error;

      loadTasks();
    } catch (error) {
      console.error('Error moving task:', error);
      Alert.alert('Fout', 'Kon taak niet verplaatsen');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    Alert.alert(
      'Verwijderen',
      'Weet je zeker dat je deze taak wilt verwijderen?',
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Verwijderen',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('task_board_items')
                .delete()
                .eq('id', taskId);

              if (error) throw error;

              loadTasks();
            } catch (error) {
              console.error('Error deleting task:', error);
              Alert.alert('Fout', 'Kon taak niet verwijderen');
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      icon: 'check',
      points: '10',
      repeatType: 'none',
    });
  };

  const getTasksForColumn = (status: TaskBoardItem['status']) => {
    return tasks
      .filter(t => t.childId === selectedChild && t.status === status)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  };

  const renderTaskCard = (task: TaskBoardItem) => {
    const child = children.find(c => c.id === task.childId);
    
    return (
      <View style={[styles.taskCard, { borderLeftColor: child?.color || colors.primary }]}>
        <View style={styles.taskCardHeader}>
          <View style={[styles.taskCardIcon, { backgroundColor: (child?.color || colors.primary) + '20' }]}>
            <IconSymbol
              ios_icon_name={task.icon}
              android_material_icon_name={task.icon}
              size={24}
              color={child?.color || colors.primary}
            />
          </View>
          <View style={styles.taskCardContent}>
            <Text style={styles.taskCardTitle}>{task.title}</Text>
            {task.description && (
              <Text style={styles.taskCardDescription}>{task.description}</Text>
            )}
          </View>
          {isParent && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteTask(task.id)}
            >
              <IconSymbol
                ios_icon_name="trash"
                android_material_icon_name="delete"
                size={18}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.taskCardFooter}>
          <View style={styles.pointsBadge}>
            <Text style={styles.pointsText}>{task.points}</Text>
            <Text style={styles.pointsEmoji}>⭐</Text>
          </View>
          {task.repeatType !== 'none' && (
            <View style={styles.repeatBadge}>
              <IconSymbol
                ios_icon_name="arrow.clockwise"
                android_material_icon_name="refresh"
                size={12}
                color={colors.textSecondary}
              />
              <Text style={styles.repeatText}>
                {task.repeatType === 'daily' ? 'Dagelijks' : 'Wekelijks'}
              </Text>
            </View>
          )}
        </View>
        {/* Move buttons */}
        <View style={styles.moveButtons}>
          {task.status !== 'todo' && (
            <TouchableOpacity
              style={[styles.moveButton, styles.moveButtonLeft]}
              onPress={() => {
                const newStatus = task.status === 'done' ? 'in_progress' : 'todo';
                handleMoveTask(task.id, newStatus);
              }}
            >
              <IconSymbol
                ios_icon_name="chevron.left"
                android_material_icon_name="chevron-left"
                size={16}
                color={colors.card}
              />
            </TouchableOpacity>
          )}
          {task.status !== 'done' && (
            <TouchableOpacity
              style={[styles.moveButton, styles.moveButtonRight]}
              onPress={() => {
                const newStatus = task.status === 'todo' ? 'in_progress' : 'done';
                handleMoveTask(task.id, newStatus);
              }}
            >
              <IconSymbol
                ios_icon_name="chevron.right"
                android_material_icon_name="chevron-right"
                size={16}
                color={colors.card}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ModuleHeader
        title="Takenbord"
        subtitle="Versleep taken om voortgang bij te houden"
        showAddButton={isParent}
        onAddPress={() => setShowAddModal(true)}
        backgroundColor={colors.background}
      />

      {/* Child Selector */}
      <View style={styles.childSelector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {children.map((child, index) => (
            <React.Fragment key={index}>
              <TouchableOpacity
                style={[
                  styles.childChip,
                  selectedChild === child.id && styles.childChipActive,
                  selectedChild === child.id && { backgroundColor: child.color }
                ]}
                onPress={() => setSelectedChild(child.id)}
              >
                <Text style={[
                  styles.childChipText,
                  selectedChild === child.id && styles.childChipTextActive
                ]}>
                  {child.name}
                </Text>
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </ScrollView>
      </View>

      {/* Task Board Columns */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.boardContainer}>
        {STATUS_COLUMNS.map((column, columnIndex) => {
          const columnTasks = getTasksForColumn(column.id as TaskBoardItem['status']);
          return (
            <React.Fragment key={columnIndex}>
              <View style={styles.column}>
                <View style={[styles.columnHeader, { backgroundColor: column.color }]}>
                  <IconSymbol
                    ios_icon_name={column.icon}
                    android_material_icon_name={column.icon}
                    size={20}
                    color={colors.card}
                  />
                  <Text style={styles.columnTitle}>{column.title}</Text>
                  <View style={styles.columnBadge}>
                    <Text style={styles.columnBadgeText}>{columnTasks.length}</Text>
                  </View>
                </View>
                <ScrollView style={styles.columnContent} showsVerticalScrollIndicator={false}>
                  {columnTasks.length === 0 ? (
                    <View style={styles.emptyColumn}>
                      <Text style={styles.emptyColumnText}>Geen taken</Text>
                    </View>
                  ) : (
                    columnTasks.map((task, taskIndex) => (
                      <React.Fragment key={taskIndex}>
                        {renderTaskCard(task)}
                      </React.Fragment>
                    ))
                  )}
                </ScrollView>
              </View>
            </React.Fragment>
          );
        })}
      </ScrollView>

      {/* Add Task Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Taak toevoegen</Text>

              <TextInput
                style={styles.input}
                placeholder="Taaknaam *"
                placeholderTextColor={colors.textSecondary}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Beschrijving (optioneel)"
                placeholderTextColor={colors.textSecondary}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                multiline
                numberOfLines={3}
              />

              <TextInput
                style={styles.input}
                placeholder="Punten *"
                placeholderTextColor={colors.textSecondary}
                value={formData.points}
                onChangeText={(text) => setFormData({ ...formData, points: text })}
                keyboardType="numeric"
              />

              <IconPicker
                selectedIcon={formData.icon}
                onSelectIcon={(icon) => setFormData({ ...formData, icon })}
                type="task"
              />

              <Text style={styles.inputLabel}>Herhaling</Text>
              <View style={styles.repeatSelector}>
                {[
                  { value: 'none', label: 'Geen' },
                  { value: 'daily', label: 'Dagelijks' },
                  { value: 'weekly', label: 'Wekelijks' },
                ].map((option, index) => (
                  <React.Fragment key={index}>
                    <TouchableOpacity
                      style={[
                        styles.repeatOption,
                        formData.repeatType === option.value && styles.repeatOptionActive
                      ]}
                      onPress={() => setFormData({ ...formData, repeatType: option.value as any })}
                    >
                      <Text style={[
                        styles.repeatOptionText,
                        formData.repeatType === option.value && styles.repeatOptionTextActive
                      ]}>
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
                    setShowAddModal(false);
                    resetForm();
                  }}
                >
                  <Text style={styles.modalButtonText}>Annuleren</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonConfirm]}
                  onPress={handleAddTask}
                >
                  <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>
                    Toevoegen
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Task Completion Animation */}
      <TaskCompletionAnimation
        visible={showCompletionAnimation}
        coins={completedPoints}
        onComplete={() => setShowCompletionAnimation(false)}
        showCoins={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  childSelector: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  childChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.card,
    marginRight: 10,
  },
  childChipActive: {
    backgroundColor: colors.primary,
  },
  childChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
  },
  childChipTextActive: {
    color: colors.card,
  },
  boardContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  column: {
    width: 280,
    marginHorizontal: 10,
    marginBottom: 120,
  },
  columnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    gap: 8,
  },
  columnTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: colors.card,
    fontFamily: 'Poppins_700Bold',
  },
  columnBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  columnBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.card,
    fontFamily: 'Poppins_700Bold',
  },
  columnContent: {
    flex: 1,
  },
  emptyColumn: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  emptyColumnText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  taskCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  taskCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  taskCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taskCardContent: {
    flex: 1,
  },
  taskCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    fontFamily: 'Poppins_600SemiBold',
  },
  taskCardDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  deleteButton: {
    padding: 4,
  },
  taskCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.highlight + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.highlight,
    marginRight: 4,
    fontFamily: 'Poppins_700Bold',
  },
  pointsEmoji: {
    fontSize: 12,
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
    fontSize: 10,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  moveButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  moveButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moveButtonLeft: {
    backgroundColor: colors.textSecondary,
  },
  moveButtonRight: {
    backgroundColor: colors.primary,
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    fontFamily: 'Poppins_600SemiBold',
  },
  repeatSelector: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  repeatOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 15,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  repeatOptionActive: {
    backgroundColor: colors.primary,
  },
  repeatOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
  },
  repeatOptionTextActive: {
    color: colors.card,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
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
    backgroundColor: colors.primary,
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

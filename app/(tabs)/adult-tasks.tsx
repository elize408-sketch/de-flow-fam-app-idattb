
import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { AdultTask } from '@/types/family';
import { supabase } from '@/utils/supabase';
import { randomUUID } from 'expo-crypto';
import DateTimePicker from '@react-native-community/datetimepicker';

interface TimeSlot {
  hour: number;
  minute: number;
}

const TASK_ICONS = [
  { name: 'briefcase', label: 'Work' },
  { name: 'car', label: 'Transport' },
  { name: 'cart', label: 'Shopping' },
  { name: 'home', label: 'Home' },
  { name: 'restaurant', label: 'Food' },
  { name: 'fitness', label: 'Exercise' },
  { name: 'bed', label: 'Rest' },
  { name: 'phone', label: 'Call' },
  { name: 'mail', label: 'Email' },
  { name: 'calendar', label: 'Meeting' },
  { name: 'medical', label: 'Health' },
  { name: 'school', label: 'Education' },
];

export default function AdultTasksScreen() {
  const { t } = useTranslation();
  const { familyMembers, currentUser, currentFamily } = useFamily();

  const [adultTasks, setAdultTasks] = useState<AdultTask[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [taskName, setTaskName] = useState('');
  const [taskIcon, setTaskIcon] = useState('briefcase');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [selectedAdults, setSelectedAdults] = useState<string[]>([]);
  const [repeatType, setRepeatType] = useState<'none' | 'daily' | 'weekdays' | 'weekly' | 'monthly' | 'custom'>('none');
  const [customDays, setCustomDays] = useState<string[]>([]);
  const [taskNotes, setTaskNotes] = useState('');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  // Get adult family members only
  const adults = useMemo(
    () => familyMembers.filter((m) => m.role === 'parent'),
    [familyMembers]
  );

  // Load adult tasks from database
  const loadAdultTasks = useCallback(async () => {
    if (!currentFamily) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*, task_assignments(family_member_id)')
        .eq('family_id', currentFamily.id)
        .eq('is_adult_task', true)
        .gte('due_date', new Date(selectedDate.setHours(0, 0, 0, 0)).toISOString())
        .lt('due_date', new Date(selectedDate.setHours(23, 59, 59, 999)).toISOString());

      if (error) throw error;

      const formatted: AdultTask[] = data.map((task: any) => ({
        id: task.id,
        name: task.name,
        icon: task.icon,
        dueDate: new Date(task.due_date),
        startTime: task.time || '09:00',
        endTime: task.end_time || undefined,
        durationMinutes: task.duration_minutes || undefined,
        assignedTo: task.task_assignments?.map((a: any) => a.family_member_id) || [],
        completed: task.completed,
        repeatType: task.repeat_type as any,
        customDays: task.custom_days || undefined,
        createdBy: task.created_by || undefined,
        notes: task.notes || undefined,
      }));

      setAdultTasks(formatted);
    } catch (error) {
      console.error('Error loading adult tasks:', error);
      Alert.alert(t('common.error'), 'Could not load tasks');
    } finally {
      setLoading(false);
    }
  }, [currentFamily, selectedDate, t]);

  useEffect(() => {
    loadAdultTasks();
  }, [loadAdultTasks]);

  // Filter tasks based on selected adult
  const filteredTasks = useMemo(() => {
    if (selectedFilter === 'all') return adultTasks;
    return adultTasks.filter((task) => task.assignedTo.includes(selectedFilter));
  }, [adultTasks, selectedFilter]);

  // Sort tasks by start time
  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      const timeA = a.startTime.split(':').map(Number);
      const timeB = b.startTime.split(':').map(Number);
      return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
    });
  }, [filteredTasks]);

  // Detect overlapping tasks
  const overlappingTasks = useMemo(() => {
    const overlaps: string[] = [];
    for (let i = 0; i < sortedTasks.length - 1; i++) {
      const current = sortedTasks[i];
      const next = sortedTasks[i + 1];

      if (!current.endTime) continue;

      const currentEnd = current.endTime.split(':').map(Number);
      const nextStart = next.startTime.split(':').map(Number);

      const currentEndMinutes = currentEnd[0] * 60 + currentEnd[1];
      const nextStartMinutes = nextStart[0] * 60 + nextStart[1];

      if (currentEndMinutes > nextStartMinutes) {
        overlaps.push(current.id, next.id);
      }
    }
    return overlaps;
  }, [sortedTasks]);

  // Calculate current time indicator position
  const getCurrentTimePosition = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return (hours * 60 + minutes) / (24 * 60);
  };

  const handleAddTask = async () => {
    if (!taskName.trim()) {
      Alert.alert(t('common.error'), 'Please enter a task name');
      return;
    }

    if (selectedAdults.length === 0) {
      Alert.alert(t('common.error'), 'Please assign at least one adult');
      return;
    }

    if (!currentFamily || !currentUser) return;

    try {
      // Calculate duration
      const startMinutes = startTime.split(':').map(Number);
      const endMinutes = endTime.split(':').map(Number);
      const duration =
        endMinutes[0] * 60 + endMinutes[1] - (startMinutes[0] * 60 + startMinutes[1]);

      const taskId = randomUUID();

      // Insert task
      const { error: taskError } = await supabase.from('tasks').insert({
        id: taskId,
        family_id: currentFamily.id,
        name: taskName.trim(),
        icon: taskIcon,
        coins: 0,
        completed: false,
        repeat_type: repeatType,
        custom_days: customDays.length > 0 ? customDays : null,
        due_date: selectedDate.toISOString(),
        time: startTime,
        end_time: endTime,
        duration_minutes: duration,
        is_adult_task: true,
        created_by: currentUser.id,
        notes: taskNotes.trim() || null,
      });

      if (taskError) throw taskError;

      // Insert task assignments
      const assignments = selectedAdults.map((memberId) => ({
        task_id: taskId,
        family_member_id: memberId,
      }));

      const { error: assignError } = await supabase
        .from('task_assignments')
        .insert(assignments);

      if (assignError) throw assignError;

      Alert.alert(t('common.success'), 'Task added successfully');
      resetForm();
      setShowAddModal(false);
      loadAdultTasks();
    } catch (error) {
      console.error('Error adding task:', error);
      Alert.alert(t('common.error'), 'Could not add task');
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: true })
        .eq('id', taskId);

      if (error) throw error;

      setAdultTasks((prev) =>
        prev.map((task) => (task.id === taskId ? { ...task, completed: true } : task))
      );
    } catch (error) {
      console.error('Error completing task:', error);
      Alert.alert(t('common.error'), 'Could not complete task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    Alert.alert(
      t('common.delete'),
      'Are you sure you want to delete this task?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.from('tasks').delete().eq('id', taskId);

              if (error) throw error;

              setAdultTasks((prev) => prev.filter((task) => task.id !== taskId));
              Alert.alert(t('common.success'), 'Task deleted');
            } catch (error) {
              console.error('Error deleting task:', error);
              Alert.alert(t('common.error'), 'Could not delete task');
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setTaskName('');
    setTaskIcon('briefcase');
    setStartTime('09:00');
    setEndTime('10:00');
    setSelectedAdults([]);
    setRepeatType('none');
    setCustomDays([]);
    setTaskNotes('');
  };

  const toggleAdultSelection = (memberId: string) => {
    setSelectedAdults((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const toggleCustomDay = (day: string) => {
    setCustomDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const formatTime = (time: string) => {
    return time;
  };

  const calculateDuration = (start: string, end: string) => {
    const startMinutes = start.split(':').map(Number);
    const endMinutes = end.split(':').map(Number);
    const duration =
      endMinutes[0] * 60 + endMinutes[1] - (startMinutes[0] * 60 + startMinutes[1]);
    return duration;
  };

  const renderTimelineHours = () => {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      hours.push(
        <View key={i} style={styles.timelineHour}>
          <Text style={styles.timelineHourText}>
            {i.toString().padStart(2, '0')}:00
          </Text>
          <View style={styles.timelineHourLine} />
        </View>
      );
    }
    return hours;
  };

  const getTaskPosition = (task: AdultTask) => {
    const startMinutes = task.startTime.split(':').map(Number);
    const startPos = (startMinutes[0] * 60 + startMinutes[1]) / (24 * 60);

    let height = 60;
    if (task.endTime) {
      const duration = calculateDuration(task.startTime, task.endTime);
      height = (duration / (24 * 60)) * 100 * 24 * 60;
    }

    return {
      top: `${startPos * 100}%`,
      height: Math.max(height, 60),
    };
  };

  const renderTask = (task: AdultTask) => {
    const position = getTaskPosition(task);
    const isOverlapping = overlappingTasks.includes(task.id);
    const assignedMembers = adults.filter((a) => task.assignedTo.includes(a.id));

    return (
      <TouchableOpacity
        key={task.id}
        style={[
          styles.taskCard,
          { top: position.top, height: position.height },
          task.completed && styles.taskCardCompleted,
          isOverlapping && styles.taskCardOverlapping,
        ]}
        onLongPress={() => handleDeleteTask(task.id)}
      >
        <View style={styles.taskCardHeader}>
          <View style={styles.taskIconContainer}>
            <IconSymbol
              ios_icon_name={task.icon}
              android_material_icon_name={task.icon}
              size={20}
              color={task.completed ? colors.textSecondary : colors.accent}
            />
          </View>
          <View style={styles.taskCardInfo}>
            <Text
              style={[
                styles.taskCardTitle,
                task.completed && styles.taskCardTitleCompleted,
              ]}
              numberOfLines={1}
            >
              {task.name}
            </Text>
            <Text style={styles.taskCardTime}>
              {task.startTime}
              {task.endTime && ` - ${task.endTime}`}
              {task.durationMinutes && ` (${task.durationMinutes} min)`}
            </Text>
          </View>
          {!task.completed && (
            <TouchableOpacity
              style={styles.taskCompleteButton}
              onPress={() => handleCompleteTask(task.id)}
            >
              <IconSymbol
                ios_icon_name="checkmark"
                android_material_icon_name="check"
                size={16}
                color={colors.card}
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.taskCardFooter}>
          <View style={styles.taskAssignees}>
            {assignedMembers.map((member, index) => (
              <View
                key={index}
                style={[styles.assigneeAvatar, { backgroundColor: member.color }]}
              >
                <Text style={styles.assigneeAvatarText}>
                  {member.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            ))}
          </View>
          {task.repeatType !== 'none' && (
            <View style={styles.repeatIndicator}>
              <IconSymbol
                ios_icon_name="arrow.clockwise"
                android_material_icon_name="refresh"
                size={12}
                color={colors.textSecondary}
              />
            </View>
          )}
        </View>

        {isOverlapping && (
          <View style={styles.overlapWarning}>
            <IconSymbol
              ios_icon_name="exclamationmark.triangle"
              android_material_icon_name="warning"
              size={12}
              color={colors.vibrantOrange}
            />
            <Text style={styles.overlapWarningText}>Overlap</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Adult Tasks</Text>
          <Text style={styles.headerSubtitle}>Timeline-based planning</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <IconSymbol
            ios_icon_name="plus"
            android_material_icon_name="add"
            size={24}
            color={colors.card}
          />
        </TouchableOpacity>
      </View>

      {/* Date selector */}
      <View style={styles.dateSelector}>
        <TouchableOpacity
          onPress={() => {
            const newDate = new Date(selectedDate);
            newDate.setDate(newDate.getDate() - 1);
            setSelectedDate(newDate);
          }}
        >
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="chevron-left"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={styles.dateText}>
          {selectedDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          })}
        </Text>
        <TouchableOpacity
          onPress={() => {
            const newDate = new Date(selectedDate);
            newDate.setDate(newDate.getDate() + 1);
            setSelectedDate(newDate);
          }}
        >
          <IconSymbol
            ios_icon_name="chevron.right"
            android_material_icon_name="chevron-right"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.todayButton}
          onPress={() => setSelectedDate(new Date())}
        >
          <Text style={styles.todayButtonText}>Today</Text>
        </TouchableOpacity>
      </View>

      {/* Adult filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        <TouchableOpacity
          style={[
            styles.filterChip,
            selectedFilter === 'all' && styles.filterChipActive,
          ]}
          onPress={() => setSelectedFilter('all')}
        >
          <Text
            style={[
              styles.filterChipText,
              selectedFilter === 'all' && styles.filterChipTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        {adults.map((adult) => (
          <TouchableOpacity
            key={adult.id}
            style={[
              styles.filterChip,
              selectedFilter === adult.id && styles.filterChipActive,
            ]}
            onPress={() => setSelectedFilter(adult.id)}
          >
            <View
              style={[styles.filterChipDot, { backgroundColor: adult.color }]}
            />
            <Text
              style={[
                styles.filterChipText,
                selectedFilter === adult.id && styles.filterChipTextActive,
              ]}
            >
              {adult.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Timeline */}
      <ScrollView style={styles.timeline} showsVerticalScrollIndicator={false}>
        <View style={styles.timelineContainer}>
          {/* Hour markers */}
          <View style={styles.timelineHours}>{renderTimelineHours()}</View>

          {/* Tasks */}
          <View style={styles.timelineTasks}>
            {sortedTasks.map((task) => renderTask(task))}

            {/* Current time indicator */}
            {selectedDate.toDateString() === new Date().toDateString() && (
              <View
                style={[
                  styles.currentTimeIndicator,
                  { top: `${getCurrentTimePosition() * 100}%` },
                ]}
              >
                <View style={styles.currentTimeDot} />
                <View style={styles.currentTimeLine} />
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Add Task Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Add Adult Task</Text>

              {/* Task Name */}
              <Text style={styles.inputLabel}>Task Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Morning workout, Team meeting"
                placeholderTextColor={colors.textSecondary}
                value={taskName}
                onChangeText={setTaskName}
              />

              {/* Icon Picker */}
              <Text style={styles.inputLabel}>Icon</Text>
              <TouchableOpacity
                style={styles.iconPickerButton}
                onPress={() => setShowIconPicker(!showIconPicker)}
              >
                <IconSymbol
                  ios_icon_name={taskIcon}
                  android_material_icon_name={taskIcon}
                  size={24}
                  color={colors.accent}
                />
                <Text style={styles.iconPickerButtonText}>Choose icon</Text>
              </TouchableOpacity>

              {showIconPicker && (
                <View style={styles.iconGrid}>
                  {TASK_ICONS.map((icon) => (
                    <TouchableOpacity
                      key={icon.name}
                      style={[
                        styles.iconOption,
                        taskIcon === icon.name && styles.iconOptionActive,
                      ]}
                      onPress={() => {
                        setTaskIcon(icon.name);
                        setShowIconPicker(false);
                      }}
                    >
                      <IconSymbol
                        ios_icon_name={icon.name}
                        android_material_icon_name={icon.name}
                        size={24}
                        color={
                          taskIcon === icon.name ? colors.accent : colors.text
                        }
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Time Selection */}
              <View style={styles.timeRow}>
                <View style={styles.timeColumn}>
                  <Text style={styles.inputLabel}>Start Time *</Text>
                  <TouchableOpacity
                    style={styles.timeInput}
                    onPress={() => setShowStartTimePicker(true)}
                  >
                    <Text style={styles.timeInputText}>{startTime}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.timeColumn}>
                  <Text style={styles.inputLabel}>End Time</Text>
                  <TouchableOpacity
                    style={styles.timeInput}
                    onPress={() => setShowEndTimePicker(true)}
                  >
                    <Text style={styles.timeInputText}>{endTime}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Assign to Adults */}
              <Text style={styles.inputLabel}>Assign to *</Text>
              <View style={styles.adultSelector}>
                {adults.map((adult) => (
                  <TouchableOpacity
                    key={adult.id}
                    style={[
                      styles.adultOption,
                      selectedAdults.includes(adult.id) &&
                        styles.adultOptionActive,
                    ]}
                    onPress={() => toggleAdultSelection(adult.id)}
                  >
                    <View
                      style={[
                        styles.adultAvatar,
                        { backgroundColor: adult.color },
                      ]}
                    >
                      <Text style={styles.adultAvatarText}>
                        {adult.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.adultName}>{adult.name}</Text>
                    {selectedAdults.includes(adult.id) && (
                      <IconSymbol
                        ios_icon_name="checkmark"
                        android_material_icon_name="check"
                        size={16}
                        color={colors.accent}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Repeat Type */}
              <Text style={styles.inputLabel}>Repeat</Text>
              <View style={styles.repeatSelector}>
                {[
                  { value: 'none', label: 'None' },
                  { value: 'daily', label: 'Daily' },
                  { value: 'weekdays', label: 'Weekdays' },
                  { value: 'weekly', label: 'Weekly' },
                  { value: 'custom', label: 'Custom' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.repeatOption,
                      repeatType === option.value && styles.repeatOptionActive,
                    ]}
                    onPress={() => setRepeatType(option.value as any)}
                  >
                    <Text
                      style={[
                        styles.repeatOptionText,
                        repeatType === option.value &&
                          styles.repeatOptionTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Custom Days */}
              {repeatType === 'custom' && (
                <>
                  <Text style={styles.inputLabel}>Select Days</Text>
                  <View style={styles.customDaysSelector}>
                    {weekDays.map((day) => (
                      <TouchableOpacity
                        key={day}
                        style={[
                          styles.dayOption,
                          customDays.includes(day) && styles.dayOptionActive,
                        ]}
                        onPress={() => toggleCustomDay(day)}
                      >
                        <Text
                          style={[
                            styles.dayOptionText,
                            customDays.includes(day) &&
                              styles.dayOptionTextActive,
                          ]}
                        >
                          {day.substring(0, 3)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              {/* Notes */}
              <Text style={styles.inputLabel}>Notes (optional)</Text>
              <TextInput
                style={[styles.input, styles.notesInput]}
                placeholder="Add any additional notes..."
                placeholderTextColor={colors.textSecondary}
                value={taskNotes}
                onChangeText={setTaskNotes}
                multiline
                numberOfLines={3}
              />

              {/* Buttons */}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => {
                    resetForm();
                    setShowAddModal(false);
                  }}
                >
                  <Text style={styles.modalButtonText}>{t('common.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonConfirm]}
                  onPress={handleAddTask}
                >
                  <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>
                    {t('common.add')}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Time Pickers */}
      {showStartTimePicker && Platform.OS !== 'web' && (
        <DateTimePicker
          value={new Date(`2000-01-01T${startTime}:00`)}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={(event, date) => {
            setShowStartTimePicker(false);
            if (date) {
              const hours = date.getHours().toString().padStart(2, '0');
              const minutes = date.getMinutes().toString().padStart(2, '0');
              setStartTime(`${hours}:${minutes}`);
            }
          }}
        />
      )}

      {showEndTimePicker && Platform.OS !== 'web' && (
        <DateTimePicker
          value={new Date(`2000-01-01T${endTime}:00`)}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={(event, date) => {
            setShowEndTimePicker(false);
            if (date) {
              const hours = date.getHours().toString().padStart(2, '0');
              const minutes = date.getMinutes().toString().padStart(2, '0');
              setEndTime(`${hours}:${minutes}`);
            }
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.card,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Poppins_700Bold',
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.card,
    gap: 16,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
    minWidth: 150,
    textAlign: 'center',
  },
  todayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  todayButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.card,
    fontFamily: 'Poppins_600SemiBold',
  },
  filterContainer: {
    backgroundColor: colors.card,
    paddingBottom: 16,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.background,
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: colors.accent,
  },
  filterChipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
  },
  filterChipTextActive: {
    color: colors.card,
  },
  timeline: {
    flex: 1,
  },
  timelineContainer: {
    flexDirection: 'row',
    minHeight: 24 * 60,
    paddingBottom: 100,
  },
  timelineHours: {
    width: 60,
    paddingTop: 8,
  },
  timelineHour: {
    height: 60,
    position: 'relative',
  },
  timelineHourText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
    position: 'absolute',
    top: -8,
    right: 8,
  },
  timelineHourLine: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    height: 1,
    backgroundColor: colors.shadow,
  },
  timelineTasks: {
    flex: 1,
    position: 'relative',
    paddingHorizontal: 12,
  },
  taskCard: {
    position: 'absolute',
    left: 12,
    right: 12,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
    boxShadow: `0px 2px 8px ${colors.shadow}`,
    elevation: 2,
  },
  taskCardCompleted: {
    opacity: 0.6,
    borderLeftColor: colors.vibrantGreen,
  },
  taskCardOverlapping: {
    borderColor: colors.vibrantOrange,
    borderWidth: 2,
  },
  taskCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  taskCardInfo: {
    flex: 1,
  },
  taskCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 2,
  },
  taskCardTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  taskCardTime: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  taskCompleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.vibrantGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskAssignees: {
    flexDirection: 'row',
    gap: 4,
  },
  assigneeAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  assigneeAvatarText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.card,
    fontFamily: 'Poppins_700Bold',
  },
  repeatIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlapWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.shadow,
    gap: 4,
  },
  overlapWarningText: {
    fontSize: 11,
    color: colors.vibrantOrange,
    fontFamily: 'Nunito_400Regular',
  },
  currentTimeIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 100,
  },
  currentTimeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.vibrantRed,
  },
  currentTimeLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.vibrantRed,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
    fontFamily: 'Poppins_700Bold',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 12,
    fontFamily: 'Poppins_600SemiBold',
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: colors.text,
    fontFamily: 'Nunito_400Regular',
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  iconPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  iconPickerButtonText: {
    fontSize: 16,
    color: colors.text,
    fontFamily: 'Nunito_400Regular',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconOptionActive: {
    backgroundColor: colors.primary,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timeColumn: {
    flex: 1,
  },
  timeInput: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  timeInputText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
  },
  adultSelector: {
    gap: 8,
  },
  adultOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  adultOptionActive: {
    backgroundColor: colors.primary,
  },
  adultAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adultAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.card,
    fontFamily: 'Poppins_700Bold',
  },
  adultName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
  },
  repeatSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  repeatOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  repeatOptionActive: {
    backgroundColor: colors.accent,
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
  customDaysSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  dayOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  dayOptionActive: {
    backgroundColor: colors.accent,
  },
  dayOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
  },
  dayOptionTextActive: {
    color: colors.card,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
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


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
import { SchoolSchedule, DayOfWeek } from '@/types/schedule';
import DateTimePicker from '@react-native-community/datetimepicker';
import IconPicker from '@/components/IconPicker';

const DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Maandag',
  tuesday: 'Dinsdag',
  wednesday: 'Woensdag',
  thursday: 'Donderdag',
  friday: 'Vrijdag',
  saturday: 'Zaterdag',
  sunday: 'Zondag',
};

const EVENT_TYPES = [
  { value: 'regular', label: 'Regulier', icon: 'book' },
  { value: 'special', label: 'Speciaal', icon: 'star' },
  { value: 'trip', label: 'Schoolreisje', icon: 'bus' },
  { value: 'holiday', label: 'Vakantie', icon: 'beach' },
  { value: 'early_dismissal', label: 'Vroeg uit', icon: 'clock' },
  { value: 'parent_evening', label: 'Ouderavond', icon: 'people' },
  { value: 'class_photo', label: 'Klassenfoto', icon: 'camera' },
  { value: 'study_day', label: 'Studiedag', icon: 'school' },
];

export default function SchoolScheduleScreen() {
  const { t } = useTranslation();
  const { familyMembers, currentUser, currentFamily } = useFamily();
  const [schedules, setSchedules] = useState<SchoolSchedule[]>([]);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('monday');
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  
  // Form state
  const [formData, setFormData] = useState({
    subject: '',
    startTime: new Date(),
    endTime: new Date(),
    location: '',
    icon: 'book',
    color: '#4A90E2',
    eventType: 'regular' as SchoolSchedule['eventType'],
    notes: '',
    notificationEnabled: true,
  });
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const isParent = currentUser?.role === 'parent';
  const children = familyMembers.filter(m => m.role === 'child');

  // Set first child as selected by default
  useEffect(() => {
    if (children.length > 0 && !selectedChild) {
      setSelectedChild(children[0].id);
    }
  }, [children, selectedChild]);

  const loadSchedules = useCallback(async () => {
    if (!currentFamily) return;

    try {
      const { data, error } = await supabase
        .from('school_schedules')
        .select('*')
        .eq('family_id', currentFamily.id)
        .order('start_time');

      if (error) throw error;

      if (data) {
        const formattedSchedules: SchoolSchedule[] = data.map(s => ({
          id: s.id,
          familyId: s.family_id,
          childId: s.child_id,
          subject: s.subject,
          dayOfWeek: s.day_of_week as DayOfWeek,
          startTime: s.start_time,
          endTime: s.end_time,
          location: s.location,
          icon: s.icon,
          color: s.color,
          isRecurring: s.is_recurring,
          eventType: s.event_type,
          notes: s.notes,
          notificationEnabled: s.notification_enabled,
          notificationTime: s.notification_time,
          createdAt: new Date(s.created_at),
          updatedAt: new Date(s.updated_at),
        }));
        setSchedules(formattedSchedules);
      }
    } catch (error) {
      console.error('Error loading school schedules:', error);
      Alert.alert('Fout', 'Kon schoolrooster niet laden');
    }
  }, [currentFamily]);

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  const handleAddSchedule = async () => {
    if (!formData.subject.trim() || !selectedChild || !currentFamily) {
      Alert.alert('Fout', 'Vul alle verplichte velden in');
      return;
    }

    try {
      const { error } = await supabase
        .from('school_schedules')
        .insert([{
          family_id: currentFamily.id,
          child_id: selectedChild,
          subject: formData.subject,
          day_of_week: selectedDay,
          start_time: formData.startTime.toTimeString().slice(0, 5),
          end_time: formData.endTime.toTimeString().slice(0, 5),
          location: formData.location || null,
          icon: formData.icon,
          color: formData.color,
          is_recurring: true,
          event_type: formData.eventType,
          notes: formData.notes || null,
          notification_enabled: formData.notificationEnabled,
        }]);

      if (error) throw error;

      Alert.alert('Succes', 'Roosteritem toegevoegd');
      setShowAddModal(false);
      resetForm();
      loadSchedules();
    } catch (error) {
      console.error('Error adding schedule:', error);
      Alert.alert('Fout', 'Kon roosteritem niet toevoegen');
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    Alert.alert(
      'Verwijderen',
      'Weet je zeker dat je dit roosteritem wilt verwijderen?',
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Verwijderen',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('school_schedules')
                .delete()
                .eq('id', scheduleId);

              if (error) throw error;

              loadSchedules();
            } catch (error) {
              console.error('Error deleting schedule:', error);
              Alert.alert('Fout', 'Kon roosteritem niet verwijderen');
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      subject: '',
      startTime: new Date(),
      endTime: new Date(),
      location: '',
      icon: 'book',
      color: '#4A90E2',
      eventType: 'regular',
      notes: '',
      notificationEnabled: true,
    });
  };

  const getSchedulesForDay = (day: DayOfWeek, childId: string) => {
    return schedules
      .filter(s => s.dayOfWeek === day && s.childId === childId)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const renderCalendarView = () => {
    const child = children.find(c => c.id === selectedChild);
    if (!child) return null;

    return (
      <View style={styles.calendarContainer}>
        {DAYS.map((day, dayIndex) => {
          const daySchedules = getSchedulesForDay(day, selectedChild);
          return (
            <React.Fragment key={dayIndex}>
              <View style={styles.dayColumn}>
                <View style={[
                  styles.dayHeader,
                  selectedDay === day && styles.dayHeaderActive
                ]}>
                  <Text style={[
                    styles.dayHeaderText,
                    selectedDay === day && styles.dayHeaderTextActive
                  ]}>
                    {DAY_LABELS[day].slice(0, 2)}
                  </Text>
                </View>
                <ScrollView style={styles.daySchedules}>
                  {daySchedules.length === 0 ? (
                    <View style={styles.emptyDay}>
                      <Text style={styles.emptyDayText}>-</Text>
                    </View>
                  ) : (
                    daySchedules.map((schedule, scheduleIndex) => (
                      <React.Fragment key={scheduleIndex}>
                        <TouchableOpacity
                          style={[styles.scheduleItem, { borderLeftColor: schedule.color }]}
                          onLongPress={() => isParent && handleDeleteSchedule(schedule.id)}
                        >
                          <View style={[styles.scheduleIcon, { backgroundColor: schedule.color + '20' }]}>
                            <IconSymbol
                              ios_icon_name={schedule.icon}
                              android_material_icon_name={schedule.icon}
                              size={16}
                              color={schedule.color}
                            />
                          </View>
                          <Text style={styles.scheduleTime}>
                            {schedule.startTime}
                          </Text>
                          <Text style={styles.scheduleSubject} numberOfLines={1}>
                            {schedule.subject}
                          </Text>
                        </TouchableOpacity>
                      </React.Fragment>
                    ))
                  )}
                </ScrollView>
              </View>
            </React.Fragment>
          );
        })}
      </View>
    );
  };

  const renderListView = () => {
    const child = children.find(c => c.id === selectedChild);
    if (!child) return null;

    const daySchedules = getSchedulesForDay(selectedDay, selectedChild);

    return (
      <ScrollView style={styles.listContainer}>
        {daySchedules.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol
              ios_icon_name="calendar"
              android_material_icon_name="calendar-today"
              size={64}
              color={colors.textSecondary}
            />
            <Text style={styles.emptyStateText}>
              Geen roosteritems voor {DAY_LABELS[selectedDay]}
            </Text>
          </View>
        ) : (
          daySchedules.map((schedule, index) => (
            <React.Fragment key={index}>
              <TouchableOpacity
                style={[styles.listItem, { borderLeftColor: schedule.color }]}
                onLongPress={() => isParent && handleDeleteSchedule(schedule.id)}
              >
                <View style={[styles.listItemIcon, { backgroundColor: schedule.color + '20' }]}>
                  <IconSymbol
                    ios_icon_name={schedule.icon}
                    android_material_icon_name={schedule.icon}
                    size={32}
                    color={schedule.color}
                  />
                </View>
                <View style={styles.listItemContent}>
                  <Text style={styles.listItemTitle}>{schedule.subject}</Text>
                  <Text style={styles.listItemTime}>
                    {schedule.startTime} - {schedule.endTime}
                  </Text>
                  {schedule.location && (
                    <Text style={styles.listItemLocation}>📍 {schedule.location}</Text>
                  )}
                  {schedule.notes && (
                    <Text style={styles.listItemNotes}>{schedule.notes}</Text>
                  )}
                </View>
                {schedule.eventType !== 'regular' && (
                  <View style={styles.eventTypeBadge}>
                    <Text style={styles.eventTypeBadgeText}>
                      {EVENT_TYPES.find(t => t.value === schedule.eventType)?.label}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </React.Fragment>
          ))
        )}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <ModuleHeader
        title="Schoolrooster"
        subtitle="Weekplanning voor kinderen"
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

      {/* View Mode Toggle */}
      <View style={styles.viewModeToggle}>
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === 'calendar' && styles.viewModeButtonActive]}
          onPress={() => setViewMode('calendar')}
        >
          <IconSymbol
            ios_icon_name="calendar"
            android_material_icon_name="calendar-month"
            size={20}
            color={viewMode === 'calendar' ? colors.card : colors.text}
          />
          <Text style={[
            styles.viewModeButtonText,
            viewMode === 'calendar' && styles.viewModeButtonTextActive
          ]}>
            Week
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === 'list' && styles.viewModeButtonActive]}
          onPress={() => setViewMode('list')}
        >
          <IconSymbol
            ios_icon_name="list.bullet"
            android_material_icon_name="list"
            size={20}
            color={viewMode === 'list' ? colors.card : colors.text}
          />
          <Text style={[
            styles.viewModeButtonText,
            viewMode === 'list' && styles.viewModeButtonTextActive
          ]}>
            Lijst
          </Text>
        </TouchableOpacity>
      </View>

      {/* Day Selector for List View */}
      {viewMode === 'list' && (
        <View style={styles.daySelector}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {DAYS.map((day, index) => (
              <React.Fragment key={index}>
                <TouchableOpacity
                  style={[
                    styles.dayChip,
                    selectedDay === day && styles.dayChipActive
                  ]}
                  onPress={() => setSelectedDay(day)}
                >
                  <Text style={[
                    styles.dayChipText,
                    selectedDay === day && styles.dayChipTextActive
                  ]}>
                    {DAY_LABELS[day]}
                  </Text>
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Content */}
      {viewMode === 'calendar' ? renderCalendarView() : renderListView()}

      {/* Add Schedule Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Roosteritem toevoegen</Text>

              <TextInput
                style={styles.input}
                placeholder="Vak/Activiteit *"
                placeholderTextColor={colors.textSecondary}
                value={formData.subject}
                onChangeText={(text) => setFormData({ ...formData, subject: text })}
              />

              <Text style={styles.inputLabel}>Dag</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayPickerScroll}>
                {DAYS.map((day, index) => (
                  <React.Fragment key={index}>
                    <TouchableOpacity
                      style={[
                        styles.dayPickerOption,
                        selectedDay === day && styles.dayPickerOptionActive
                      ]}
                      onPress={() => setSelectedDay(day)}
                    >
                      <Text style={[
                        styles.dayPickerOptionText,
                        selectedDay === day && styles.dayPickerOptionTextActive
                      ]}>
                        {DAY_LABELS[day]}
                      </Text>
                    </TouchableOpacity>
                  </React.Fragment>
                ))}
              </ScrollView>

              <Text style={styles.inputLabel}>Starttijd</Text>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowStartTimePicker(true)}
              >
                <Text style={styles.timeButtonText}>
                  {formData.startTime.toTimeString().slice(0, 5)}
                </Text>
              </TouchableOpacity>

              {showStartTimePicker && (
                <DateTimePicker
                  value={formData.startTime}
                  mode="time"
                  is24Hour={true}
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowStartTimePicker(Platform.OS === 'ios');
                    if (selectedDate) {
                      setFormData({ ...formData, startTime: selectedDate });
                    }
                  }}
                />
              )}

              <Text style={styles.inputLabel}>Eindtijd</Text>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowEndTimePicker(true)}
              >
                <Text style={styles.timeButtonText}>
                  {formData.endTime.toTimeString().slice(0, 5)}
                </Text>
              </TouchableOpacity>

              {showEndTimePicker && (
                <DateTimePicker
                  value={formData.endTime}
                  mode="time"
                  is24Hour={true}
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowEndTimePicker(Platform.OS === 'ios');
                    if (selectedDate) {
                      setFormData({ ...formData, endTime: selectedDate });
                    }
                  }}
                />
              )}

              <TextInput
                style={styles.input}
                placeholder="Locatie (optioneel)"
                placeholderTextColor={colors.textSecondary}
                value={formData.location}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
              />

              <Text style={styles.inputLabel}>Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.eventTypeScroll}>
                {EVENT_TYPES.map((type, index) => (
                  <React.Fragment key={index}>
                    <TouchableOpacity
                      style={[
                        styles.eventTypeOption,
                        formData.eventType === type.value && styles.eventTypeOptionActive
                      ]}
                      onPress={() => setFormData({ ...formData, eventType: type.value as any })}
                    >
                      <IconSymbol
                        ios_icon_name={type.icon}
                        android_material_icon_name={type.icon}
                        size={20}
                        color={formData.eventType === type.value ? colors.card : colors.text}
                      />
                      <Text style={[
                        styles.eventTypeOptionText,
                        formData.eventType === type.value && styles.eventTypeOptionTextActive
                      ]}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  </React.Fragment>
                ))}
              </ScrollView>

              <IconPicker
                selectedIcon={formData.icon}
                onSelectIcon={(icon) => setFormData({ ...formData, icon })}
                type="schedule"
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Notities (optioneel)"
                placeholderTextColor={colors.textSecondary}
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                multiline
                numberOfLines={3}
              />

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
                  onPress={handleAddSchedule}
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
  viewModeToggle: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
  },
  viewModeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 15,
    backgroundColor: colors.card,
    gap: 8,
  },
  viewModeButtonActive: {
    backgroundColor: colors.primary,
  },
  viewModeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
  },
  viewModeButtonTextActive: {
    color: colors.card,
  },
  daySelector: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  dayChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 15,
    backgroundColor: colors.card,
    marginRight: 8,
  },
  dayChipActive: {
    backgroundColor: colors.primary,
  },
  dayChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
  },
  dayChipTextActive: {
    color: colors.card,
  },
  calendarContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  dayColumn: {
    flex: 1,
    marginHorizontal: 2,
  },
  dayHeader: {
    backgroundColor: colors.card,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 8,
    alignItems: 'center',
  },
  dayHeaderActive: {
    backgroundColor: colors.primary,
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Poppins_700Bold',
  },
  dayHeaderTextActive: {
    color: colors.card,
  },
  daySchedules: {
    flex: 1,
  },
  emptyDay: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyDayText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  scheduleItem: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
    borderLeftWidth: 3,
  },
  scheduleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  scheduleTime: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 2,
  },
  scheduleSubject: {
    fontSize: 9,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 140,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'Nunito_400Regular',
  },
  listItem: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  listItemIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    fontFamily: 'Poppins_600SemiBold',
  },
  listItemTime: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
    fontFamily: 'Nunito_400Regular',
  },
  listItemLocation: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
    fontFamily: 'Nunito_400Regular',
  },
  listItemNotes: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    fontFamily: 'Nunito_400Regular',
  },
  eventTypeBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  eventTypeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.card,
    fontFamily: 'Poppins_600SemiBold',
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
  dayPickerScroll: {
    marginBottom: 15,
  },
  dayPickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 15,
    backgroundColor: colors.background,
    marginRight: 8,
  },
  dayPickerOptionActive: {
    backgroundColor: colors.primary,
  },
  dayPickerOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
  },
  dayPickerOptionTextActive: {
    color: colors.card,
  },
  timeButton: {
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  timeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
  },
  eventTypeScroll: {
    marginBottom: 15,
  },
  eventTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    backgroundColor: colors.background,
    marginRight: 8,
    gap: 6,
  },
  eventTypeOptionActive: {
    backgroundColor: colors.primary,
  },
  eventTypeOptionText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
  },
  eventTypeOptionTextActive: {
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

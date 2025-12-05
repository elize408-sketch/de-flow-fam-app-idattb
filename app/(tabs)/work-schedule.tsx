
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
import { WorkSchedule, DayOfWeek } from '@/types/schedule';
import DateTimePicker from '@react-native-community/datetimepicker';

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

const SHIFT_LABELS = [
  { value: 'morning', label: 'Ochtend', color: '#FFB84D' },
  { value: 'afternoon', label: 'Middag', color: '#4A90E2' },
  { value: 'evening', label: 'Avond', color: '#9B59B6' },
  { value: 'night', label: 'Nacht', color: '#34495E' },
  { value: 'custom', label: 'Aangepast', color: '#34C759' },
];

export default function WorkScheduleScreen() {
  const { t } = useTranslation();
  const { familyMembers, currentUser, currentFamily } = useFamily();
  const [schedules, setSchedules] = useState<WorkSchedule[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    dayOfWeek: 'monday' as DayOfWeek,
    startTime: new Date(),
    endTime: new Date(),
    shiftLabel: 'morning' as WorkSchedule['shiftLabel'],
    customLabel: '',
    notes: '',
  });
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const isParent = currentUser?.role === 'parent';
  const parents = familyMembers.filter(m => m.role === 'parent');

  const loadSchedules = useCallback(async () => {
    if (!currentFamily) return;

    try {
      const { data, error } = await supabase
        .from('work_schedules')
        .select('*')
        .eq('family_id', currentFamily.id)
        .order('start_time');

      if (error) throw error;

      if (data) {
        const formattedSchedules: WorkSchedule[] = data.map(s => ({
          id: s.id,
          familyId: s.family_id,
          parentId: s.parent_id,
          dayOfWeek: s.day_of_week as DayOfWeek,
          startTime: s.start_time,
          endTime: s.end_time,
          shiftLabel: s.shift_label,
          customLabel: s.custom_label,
          isRecurring: s.is_recurring,
          color: s.color,
          notes: s.notes,
          createdAt: new Date(s.created_at),
          updatedAt: new Date(s.updated_at),
        }));
        setSchedules(formattedSchedules);
      }
    } catch (error) {
      console.error('Error loading work schedules:', error);
      Alert.alert('Fout', 'Kon werkrooster niet laden');
    }
  }, [currentFamily]);

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  const handleAddSchedule = async () => {
    if (!currentUser || !currentFamily) {
      Alert.alert('Fout', 'Geen gebruiker of gezin gevonden');
      return;
    }

    if (formData.shiftLabel === 'custom' && !formData.customLabel.trim()) {
      Alert.alert('Fout', 'Vul een aangepaste label in');
      return;
    }

    try {
      const shiftConfig = SHIFT_LABELS.find(s => s.value === formData.shiftLabel);
      
      const { error } = await supabase
        .from('work_schedules')
        .insert([{
          family_id: currentFamily.id,
          parent_id: currentUser.id,
          day_of_week: formData.dayOfWeek,
          start_time: formData.startTime.toTimeString().slice(0, 5),
          end_time: formData.endTime.toTimeString().slice(0, 5),
          shift_label: formData.shiftLabel,
          custom_label: formData.shiftLabel === 'custom' ? formData.customLabel : null,
          is_recurring: true,
          color: shiftConfig?.color || '#34C759',
          notes: formData.notes || null,
        }]);

      if (error) throw error;

      Alert.alert('Succes', 'Werkdienst toegevoegd');
      setShowAddModal(false);
      resetForm();
      loadSchedules();
    } catch (error) {
      console.error('Error adding work schedule:', error);
      Alert.alert('Fout', 'Kon werkdienst niet toevoegen');
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    Alert.alert(
      'Verwijderen',
      'Weet je zeker dat je deze werkdienst wilt verwijderen?',
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Verwijderen',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('work_schedules')
                .delete()
                .eq('id', scheduleId);

              if (error) throw error;

              loadSchedules();
            } catch (error) {
              console.error('Error deleting work schedule:', error);
              Alert.alert('Fout', 'Kon werkdienst niet verwijderen');
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      dayOfWeek: 'monday',
      startTime: new Date(),
      endTime: new Date(),
      shiftLabel: 'morning',
      customLabel: '',
      notes: '',
    });
  };

  const getSchedulesForDay = (day: DayOfWeek) => {
    return schedules
      .filter(s => s.dayOfWeek === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const getShiftLabel = (schedule: WorkSchedule) => {
    if (schedule.shiftLabel === 'custom' && schedule.customLabel) {
      return schedule.customLabel;
    }
    return SHIFT_LABELS.find(s => s.value === schedule.shiftLabel)?.label || schedule.shiftLabel;
  };

  return (
    <View style={styles.container}>
      <ModuleHeader
        title="Werkrooster"
        subtitle="Diensten voor ouders"
        showAddButton={isParent}
        onAddPress={() => setShowAddModal(true)}
        backgroundColor={colors.background}
      />

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {DAYS.map((day, dayIndex) => {
          const daySchedules = getSchedulesForDay(day);
          return (
            <React.Fragment key={dayIndex}>
              <View style={styles.daySection}>
                <Text style={styles.dayTitle}>{DAY_LABELS[day]}</Text>
                {daySchedules.length === 0 ? (
                  <View style={styles.emptyDay}>
                    <Text style={styles.emptyDayText}>Geen diensten</Text>
                  </View>
                ) : (
                  daySchedules.map((schedule, scheduleIndex) => {
                    const parent = parents.find(p => p.id === schedule.parentId);
                    return (
                      <React.Fragment key={scheduleIndex}>
                        <TouchableOpacity
                          style={[styles.scheduleCard, { borderLeftColor: schedule.color }]}
                          onLongPress={() => isParent && handleDeleteSchedule(schedule.id)}
                        >
                          <View style={[styles.scheduleIcon, { backgroundColor: schedule.color + '20' }]}>
                            <IconSymbol
                              ios_icon_name="briefcase"
                              android_material_icon_name="work"
                              size={24}
                              color={schedule.color}
                            />
                          </View>
                          <View style={styles.scheduleContent}>
                            <Text style={styles.scheduleName}>{parent?.name || 'Onbekend'}</Text>
                            <Text style={styles.scheduleShift}>{getShiftLabel(schedule)}</Text>
                            <Text style={styles.scheduleTime}>
                              {schedule.startTime} - {schedule.endTime}
                            </Text>
                            {schedule.notes && (
                              <Text style={styles.scheduleNotes}>{schedule.notes}</Text>
                            )}
                          </View>
                        </TouchableOpacity>
                      </React.Fragment>
                    );
                  })
                )}
              </View>
            </React.Fragment>
          );
        })}
      </ScrollView>

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
              <Text style={styles.modalTitle}>Werkdienst toevoegen</Text>

              <Text style={styles.inputLabel}>Dag</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayPickerScroll}>
                {DAYS.map((day, index) => (
                  <React.Fragment key={index}>
                    <TouchableOpacity
                      style={[
                        styles.dayPickerOption,
                        formData.dayOfWeek === day && styles.dayPickerOptionActive
                      ]}
                      onPress={() => setFormData({ ...formData, dayOfWeek: day })}
                    >
                      <Text style={[
                        styles.dayPickerOptionText,
                        formData.dayOfWeek === day && styles.dayPickerOptionTextActive
                      ]}>
                        {DAY_LABELS[day]}
                      </Text>
                    </TouchableOpacity>
                  </React.Fragment>
                ))}
              </ScrollView>

              <Text style={styles.inputLabel}>Dienst</Text>
              <View style={styles.shiftSelector}>
                {SHIFT_LABELS.map((shift, index) => (
                  <React.Fragment key={index}>
                    <TouchableOpacity
                      style={[
                        styles.shiftOption,
                        formData.shiftLabel === shift.value && styles.shiftOptionActive,
                        formData.shiftLabel === shift.value && { backgroundColor: shift.color }
                      ]}
                      onPress={() => setFormData({ ...formData, shiftLabel: shift.value as any })}
                    >
                      <Text style={[
                        styles.shiftOptionText,
                        formData.shiftLabel === shift.value && styles.shiftOptionTextActive
                      ]}>
                        {shift.label}
                      </Text>
                    </TouchableOpacity>
                  </React.Fragment>
                ))}
              </View>

              {formData.shiftLabel === 'custom' && (
                <TextInput
                  style={styles.input}
                  placeholder="Aangepaste label *"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.customLabel}
                  onChangeText={(text) => setFormData({ ...formData, customLabel: text })}
                />
              )}

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
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 140,
  },
  daySection: {
    marginBottom: 24,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    fontFamily: 'Poppins_700Bold',
  },
  emptyDay: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  emptyDayText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  scheduleCard: {
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
  scheduleIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  scheduleContent: {
    flex: 1,
  },
  scheduleName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    fontFamily: 'Poppins_600SemiBold',
  },
  scheduleShift: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
    fontFamily: 'Nunito_400Regular',
  },
  scheduleTime: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  scheduleNotes: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
    fontFamily: 'Nunito_400Regular',
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
  shiftSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 15,
  },
  shiftOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 15,
    backgroundColor: colors.background,
    minWidth: '30%',
    alignItems: 'center',
  },
  shiftOptionActive: {
    backgroundColor: colors.primary,
  },
  shiftOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
  },
  shiftOptionTextActive: {
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

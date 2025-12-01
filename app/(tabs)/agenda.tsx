
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { Ionicons } from '@expo/vector-icons';
import { useFamily } from '@/contexts/FamilyContext';
import { useTranslation } from 'react-i18next';
import { useModuleTheme, ModuleName } from '@/contexts/ThemeContext';
import ModuleHeader from '@/components/ModuleHeader';
import ThemedButton from '@/components/ThemedButton';

export default function AgendaScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { appointments, familyMembers, addAppointment, deleteAppointment } = useFamily();
  const { setModule, accentColor } = useModuleTheme();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAppointmentTitle, setNewAppointmentTitle] = useState('');
  const [newAppointmentDate, setNewAppointmentDate] = useState(new Date());
  const [newAppointmentTime, setNewAppointmentTime] = useState('10:00');
  const [newAppointmentEndTime, setNewAppointmentEndTime] = useState('');
  const [newAppointmentAssignedTo, setNewAppointmentAssignedTo] = useState<string[]>([]);
  const [newAppointmentRepeat, setNewAppointmentRepeat] = useState<'daily' | 'weekly' | 'monthly' | 'none'>('none');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // Set module theme on mount
  useEffect(() => {
    setModule('agenda' as ModuleName);
  }, [setModule]);

  const toggleMemberSelection = (memberId: string) => {
    setNewAppointmentAssignedTo(prev => {
      if (prev.includes(memberId)) {
        return prev.filter(id => id !== memberId);
      } else {
        return [...prev, memberId];
      }
    });
  };

  const handleAddAppointment = () => {
    if (!newAppointmentTitle.trim()) {
      Alert.alert(t('common.error'), t('agenda.fillTitle'));
      return;
    }

    if (newAppointmentAssignedTo.length === 0) {
      Alert.alert(t('common.error'), t('agenda.selectMember'));
      return;
    }

    const firstMember = familyMembers.find(m => m.id === newAppointmentAssignedTo[0]);
    const appointmentColor = firstMember?.color || colors.accent;

    addAppointment({
      title: newAppointmentTitle.trim(),
      date: newAppointmentDate,
      time: newAppointmentTime,
      endTime: newAppointmentEndTime.trim() || undefined,
      assignedTo: newAppointmentAssignedTo,
      color: appointmentColor,
      repeatType: newAppointmentRepeat,
    });

    // Reset form and close modal
    setNewAppointmentTitle('');
    setNewAppointmentDate(new Date());
    setNewAppointmentTime('10:00');
    setNewAppointmentEndTime('');
    setNewAppointmentAssignedTo([]);
    setNewAppointmentRepeat('none');
    setShowAddModal(false);
    
    Alert.alert(t('common.success'), t('agenda.appointmentAdded'));
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return (
        aptDate.getDate() === date.getDate() &&
        aptDate.getMonth() === date.getMonth() &&
        aptDate.getFullYear() === date.getFullYear()
      );
    }).sort((a, b) => a.time.localeCompare(b.time));
  };

  const monthNames = [
    t('agenda.months.january'),
    t('agenda.months.february'),
    t('agenda.months.march'),
    t('agenda.months.april'),
    t('agenda.months.may'),
    t('agenda.months.june'),
    t('agenda.months.july'),
    t('agenda.months.august'),
    t('agenda.months.september'),
    t('agenda.months.october'),
    t('agenda.months.november'),
    t('agenda.months.december'),
  ];

  const dayNames = [
    t('agenda.days.monday'),
    t('agenda.days.tuesday'),
    t('agenda.days.wednesday'),
    t('agenda.days.thursday'),
    t('agenda.days.friday'),
    t('agenda.days.saturday'),
    t('agenda.days.sunday'),
  ];

  const changeMonth = (direction: 'prev' | 'next') => {
    if (direction === 'next') {
      if (selectedMonth === 11) {
        setSelectedMonth(0);
        setSelectedYear(selectedYear + 1);
      } else {
        setSelectedMonth(selectedMonth + 1);
      }
    } else {
      if (selectedMonth === 0) {
        setSelectedMonth(11);
        setSelectedYear(selectedYear - 1);
      } else {
        setSelectedMonth(selectedMonth - 1);
      }
    }
  };

  const renderMonthCalendar = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay();
    // Convert Sunday (0) to 7 for Monday-first week
    const firstDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(
        <View key={`empty-${i}`} style={styles.dayCell} />
      );
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedYear, selectedMonth, day);
      date.setHours(0, 0, 0, 0);
      const dayAppointments = getAppointmentsForDate(date);
      const isToday = date.getTime() === today.getTime();

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayCell,
            styles.dayCellActive,
            isToday && [styles.dayCellToday, { borderColor: accentColor }],
          ]}
          onPress={() => {
            setSelectedDay(date);
          }}
        >
          <Text style={[styles.dayNumber, isToday && [styles.dayNumberToday, { color: accentColor }]]}>
            {day}
          </Text>
          <View style={styles.appointmentsContainer}>
            {dayAppointments.slice(0, 3).map((apt, index) => (
              <React.Fragment key={index}>
                <View
                  style={[
                    styles.appointmentLabel,
                    { backgroundColor: apt.color },
                  ]}
                >
                  <Text style={styles.appointmentLabelText} numberOfLines={1}>
                    {apt.time} {apt.title}
                  </Text>
                </View>
              </React.Fragment>
            ))}
            {dayAppointments.length > 3 && (
              <Text style={styles.moreAppointments}>
                +{dayAppointments.length - 3}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      );
    }

    return days;
  };

  const renderDatePicker = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay();
    const days = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <View key={`empty-${i}`} style={styles.calendarDay} />
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedYear, selectedMonth, day);
      const isSelected = 
        newAppointmentDate.getDate() === day &&
        newAppointmentDate.getMonth() === selectedMonth &&
        newAppointmentDate.getFullYear() === selectedYear;

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.calendarDay,
            styles.calendarDayActive,
            isSelected && [styles.calendarDaySelected, { backgroundColor: accentColor }]
          ]}
          onPress={() => {
            setNewAppointmentDate(date);
            setShowDatePicker(false);
          }}
        >
          <Text style={[
            styles.calendarDayText,
            isSelected && styles.calendarDayTextSelected
          ]}>
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    return days;
  };

  return (
    <View style={styles.container}>
      <ModuleHeader
        title={t('agenda.title')}
        subtitle={t('agenda.subtitle')}
      />

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <ThemedButton
          title={t('agenda.addAppointment')}
          onPress={() => setShowAddModal(true)}
          icon="plus"
          androidIcon="add"
          style={styles.addButton}
        />

        {/* Monthly Calendar View */}
        <View style={styles.monthlyCalendar}>
          <View style={styles.monthHeader}>
            <TouchableOpacity onPress={() => changeMonth('prev')} style={styles.monthNavButton}>
              <Ionicons name="chevron-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.monthTitle}>
              {monthNames[selectedMonth]} {selectedYear}
            </Text>
            <TouchableOpacity onPress={() => changeMonth('next')} style={styles.monthNavButton}>
              <Ionicons name="chevron-forward" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.weekDaysHeader}>
            {dayNames.map((day, index) => (
              <React.Fragment key={index}>
                <View style={styles.weekDayCell}>
                  <Text style={styles.weekDayText}>{day}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>

          <View style={styles.monthGrid}>
            {renderMonthCalendar()}
          </View>
        </View>
      </ScrollView>

      {/* Day Detail Modal */}
      {selectedDay && (
        <Modal
          visible={true}
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedDay(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.dayDetailModal}>
              <View style={styles.dayDetailHeader}>
                <TouchableOpacity
                  style={styles.modalBackButton}
                  onPress={() => setSelectedDay(null)}
                >
                  <Ionicons name="chevron-back" size={26} color="#333" />
                </TouchableOpacity>
                <Text style={styles.dayDetailTitle}>
                  {selectedDay.toLocaleDateString('nl-NL', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </Text>
                <View style={styles.modalHeaderSpacer} />
              </View>

              <ScrollView style={styles.dayDetailContent}>
                {getAppointmentsForDate(selectedDay).length === 0 ? (
                  <View style={styles.noAppointments}>
                    <Text style={styles.noAppointmentsText}>
                      {t('home.noAppointmentsToday')}
                    </Text>
                  </View>
                ) : (
                  getAppointmentsForDate(selectedDay).map((apt, index) => {
                    const members = familyMembers.filter(m => apt.assignedTo.includes(m.id));
                    return (
                      <React.Fragment key={index}>
                        <TouchableOpacity
                          style={[styles.appointmentCard, { borderLeftColor: apt.color }]}
                          onPress={() => {
                            Alert.alert(
                              apt.title,
                              `${apt.time}${apt.endTime ? ` - ${apt.endTime}` : ''}\n\n${members.map(m => m.name).join(', ')}`,
                              [
                                { text: t('common.close'), style: 'cancel' },
                                {
                                  text: t('common.delete'),
                                  style: 'destructive',
                                  onPress: () => {
                                    Alert.alert(
                                      t('agenda.deleteConfirm'),
                                      t('agenda.deleteMessage', { title: apt.title }),
                                      [
                                        { text: t('common.cancel'), style: 'cancel' },
                                        { 
                                          text: t('common.delete'), 
                                          onPress: () => {
                                            deleteAppointment(apt.id);
                                            setSelectedDay(null);
                                          }, 
                                          style: 'destructive' 
                                        },
                                      ]
                                    );
                                  },
                                },
                              ]
                            );
                          }}
                        >
                          <View style={styles.appointmentCardContent}>
                            <Text style={styles.appointmentCardTime}>
                              {apt.time}{apt.endTime ? ` - ${apt.endTime}` : ''}
                            </Text>
                            <Text style={styles.appointmentCardTitle}>{apt.title}</Text>
                            <View style={styles.appointmentCardMembers}>
                              {members.map((member, mIndex) => (
                                <React.Fragment key={mIndex}>
                                  <View style={[styles.memberBadge, { backgroundColor: member.color }]}>
                                    <Text style={styles.memberBadgeText}>{member.name.charAt(0)}</Text>
                                  </View>
                                </React.Fragment>
                              ))}
                              <Text style={styles.memberNames}>
                                {members.map(m => m.name).join(', ')}
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      </React.Fragment>
                    );
                  })
                )}
              </ScrollView>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedDay(null)}
              >
                <Text style={styles.closeButtonText}>{t('common.close')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Add Appointment Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  style={styles.modalBackButton}
                  onPress={() => {
                    setShowAddModal(false);
                    setNewAppointmentTitle('');
                    setNewAppointmentDate(new Date());
                    setNewAppointmentTime('10:00');
                    setNewAppointmentEndTime('');
                    setNewAppointmentAssignedTo([]);
                    setNewAppointmentRepeat('none');
                  }}
                >
                  <Ionicons name="chevron-back" size={26} color="#333" />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>{t('agenda.newAppointment')}</Text>
                <View style={styles.modalHeaderSpacer} />
              </View>

              <TextInput
                style={styles.input}
                placeholder={t('agenda.titlePlaceholder')}
                placeholderTextColor={colors.textSecondary}
                value={newAppointmentTitle}
                onChangeText={setNewAppointmentTitle}
              />

              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => {
                  setSelectedMonth(newAppointmentDate.getMonth());
                  setSelectedYear(newAppointmentDate.getFullYear());
                  setShowDatePicker(true);
                }}
              >
                <Ionicons name="calendar-outline" size={22} color="#333" />
                <Text style={styles.dateButtonText}>
                  {newAppointmentDate.toLocaleDateString('nl-NL')}
                </Text>
              </TouchableOpacity>

              <View style={styles.timeInputContainer}>
                <Ionicons name="time-outline" size={22} color="#333" />
                <TextInput
                  style={styles.timeInput}
                  placeholder={t('agenda.startTime')}
                  placeholderTextColor={colors.textSecondary}
                  value={newAppointmentTime}
                  onChangeText={setNewAppointmentTime}
                />
              </View>

              <Text style={styles.inputLabel}>{t('agenda.endTime')}</Text>
              <View style={styles.timeInputContainer}>
                <Ionicons name="time-outline" size={22} color="#333" />
                <TextInput
                  style={styles.timeInput}
                  placeholder={t('agenda.endTimePlaceholder')}
                  placeholderTextColor={colors.textSecondary}
                  value={newAppointmentEndTime}
                  onChangeText={setNewAppointmentEndTime}
                />
              </View>

              <Text style={styles.inputLabel}>{t('agenda.forWho')}</Text>
              <View style={styles.memberSelector}>
                {familyMembers.map((member, index) => (
                  <React.Fragment key={index}>
                    <TouchableOpacity
                      style={[
                        styles.memberOption,
                        newAppointmentAssignedTo.includes(member.id) && [styles.memberOptionActive, { borderColor: accentColor }],
                      ]}
                      onPress={() => toggleMemberSelection(member.id)}
                    >
                      <View style={[styles.memberAvatar, { backgroundColor: member.color || colors.accent }]}>
                        <Text style={styles.memberAvatarText}>{member.name.charAt(0)}</Text>
                      </View>
                      <Text style={styles.memberName}>{member.name}</Text>
                      {newAppointmentAssignedTo.includes(member.id) && (
                        <View style={[styles.checkmark, { backgroundColor: accentColor }]}>
                          <Ionicons name="checkmark" size={16} color={colors.card} />
                        </View>
                      )}
                    </TouchableOpacity>
                  </React.Fragment>
                ))}
              </View>

              <Text style={styles.inputLabel}>{t('profile.repeat')}</Text>
              <View style={styles.repeatSelector}>
                {[
                  { value: 'none', label: t('profile.repeatNone') },
                  { value: 'daily', label: t('profile.repeatDaily') },
                  { value: 'weekly', label: t('profile.repeatWeekly') },
                  { value: 'monthly', label: t('profile.repeatMonthly') },
                ].map((option, index) => (
                  <React.Fragment key={index}>
                    <TouchableOpacity
                      style={[
                        styles.repeatOption,
                        newAppointmentRepeat === option.value && [styles.repeatOptionActive, { borderColor: accentColor, backgroundColor: accentColor + '20' }],
                      ]}
                      onPress={() => setNewAppointmentRepeat(option.value as any)}
                    >
                      <Text
                        style={[
                          styles.repeatOptionText,
                          newAppointmentRepeat === option.value && styles.repeatOptionTextActive,
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
                    setShowAddModal(false);
                    setNewAppointmentTitle('');
                    setNewAppointmentDate(new Date());
                    setNewAppointmentTime('10:00');
                    setNewAppointmentEndTime('');
                    setNewAppointmentAssignedTo([]);
                    setNewAppointmentRepeat('none');
                  }}
                >
                  <Text style={styles.modalButtonText}>{t('common.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonConfirm, { backgroundColor: accentColor }]}
                  onPress={handleAddAppointment}
                >
                  <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>
                    {t('common.add')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Calendar Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <TouchableOpacity 
          style={styles.calendarOverlay}
          activeOpacity={1}
          onPress={() => setShowDatePicker(false)}
        >
          <View style={styles.calendarModal} onStartShouldSetResponder={() => true}>
            <View style={styles.calendarPickerHeader}>
              <TouchableOpacity
                style={styles.calendarBackButton}
                onPress={() => setShowDatePicker(false)}
              >
                <Ionicons name="chevron-back" size={26} color="#333" />
              </TouchableOpacity>
              <Text style={styles.calendarPickerTitle}>{t('agenda.selectDate')}</Text>
              <View style={styles.calendarHeaderSpacer} />
            </View>

            <View style={styles.calendarMonthNav}>
              <TouchableOpacity onPress={() => {
                if (selectedMonth === 0) {
                  setSelectedMonth(11);
                  setSelectedYear(selectedYear - 1);
                } else {
                  setSelectedMonth(selectedMonth - 1);
                }
              }} style={styles.calendarNavButton}>
                <Ionicons name="chevron-back" size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.calendarMonthYear}>
                {monthNames[selectedMonth]} {selectedYear}
              </Text>
              <TouchableOpacity onPress={() => {
                if (selectedMonth === 11) {
                  setSelectedMonth(0);
                  setSelectedYear(selectedYear + 1);
                } else {
                  setSelectedMonth(selectedMonth + 1);
                }
              }} style={styles.calendarNavButton}>
                <Ionicons name="chevron-forward" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.calendarWeekDays}>
              {['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'].map((day, index) => (
                <React.Fragment key={index}>
                  <Text style={styles.calendarWeekDay}>{day}</Text>
                </React.Fragment>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {renderDatePicker()}
            </View>

            <TouchableOpacity
              style={styles.calendarCloseButton}
              onPress={() => setShowDatePicker(false)}
            >
              <Text style={styles.calendarCloseButtonText}>{t('common.close')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
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
    paddingBottom: 40,
  },
  addButton: {
    marginBottom: 20,
  },
  monthlyCalendar: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 15,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  monthNavButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Poppins_700Bold',
  },
  weekDaysHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    fontFamily: 'Poppins_600SemiBold',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 0.75,
    padding: 4,
    borderWidth: 0.5,
    borderColor: colors.textSecondary + '20',
  },
  dayCellActive: {
    backgroundColor: colors.background,
  },
  dayCellToday: {
    backgroundColor: colors.primary,
    borderWidth: 2,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 2,
  },
  dayNumberToday: {
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
  },
  appointmentsContainer: {
    flex: 1,
    gap: 2,
  },
  appointmentLabel: {
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginBottom: 2,
  },
  appointmentLabelText: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.card,
    fontFamily: 'Poppins_600SemiBold',
  },
  moreAppointments: {
    fontSize: 8,
    fontWeight: '600',
    color: colors.textSecondary,
    fontFamily: 'Poppins_600SemiBold',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  dayDetailModal: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
    boxShadow: `0px 8px 24px ${colors.shadow}`,
    elevation: 5,
  },
  dayDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dayDetailTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
    flex: 1,
  },
  dayDetailContent: {
    maxHeight: 400,
  },
  noAppointments: {
    padding: 40,
    alignItems: 'center',
  },
  noAppointmentsText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  appointmentCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  appointmentCardContent: {
    gap: 8,
  },
  appointmentCardTime: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.accent,
    fontFamily: 'Poppins_700Bold',
  },
  appointmentCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
  },
  appointmentCardMembers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.card,
    fontFamily: 'Poppins_700Bold',
  },
  memberNames: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  closeButton: {
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginTop: 15,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
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
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
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
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
    flex: 1,
  },
  modalHeaderSpacer: {
    width: 40,
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
  dateButton: {
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dateButtonText: {
    fontSize: 16,
    color: colors.text,
    fontFamily: 'Nunito_400Regular',
    flex: 1,
  },
  timeInputContainer: {
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timeInput: {
    fontSize: 16,
    color: colors.text,
    fontFamily: 'Nunito_400Regular',
    flex: 1,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
    fontFamily: 'Poppins_600SemiBold',
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
    minWidth: 70,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  memberOptionActive: {
    backgroundColor: colors.primary,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  memberAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.card,
    fontFamily: 'Poppins_700Bold',
  },
  memberName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
  },
  checkmark: {
    position: 'absolute',
    top: 5,
    right: 5,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
  calendarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  calendarModal: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 350,
    boxShadow: `0px 8px 24px ${colors.shadow}`,
    elevation: 5,
  },
  calendarPickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  calendarBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarPickerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
    flex: 1,
  },
  calendarHeaderSpacer: {
    width: 40,
  },
  calendarMonthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarNavButton: {
    padding: 8,
  },
  calendarMonthYear: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Poppins_700Bold',
  },
  calendarWeekDays: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  calendarWeekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    fontFamily: 'Poppins_600SemiBold',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  calendarDayActive: {
    borderRadius: 8,
  },
  calendarDaySelected: {
  },
  calendarDayText: {
    fontSize: 14,
    color: colors.text,
    fontFamily: 'Nunito_400Regular',
  },
  calendarDayTextSelected: {
    color: colors.card,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
  },
  calendarCloseButton: {
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
  },
  calendarCloseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
  },
});

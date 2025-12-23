
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { Ionicons } from '@expo/vector-icons';
import { useFamily } from '@/contexts/FamilyContext';
import { useTranslation } from 'react-i18next';
import { useModuleTheme, ModuleName } from '@/contexts/ThemeContext';
import ModuleHeader from '@/components/ModuleHeader';
import { Appointment } from '@/types/family';

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
  const [newAppointmentRepeat, setNewAppointmentRepeat] =
    useState<'daily' | 'weekly' | 'monthly' | 'none'>('none');
  const [newAppointmentEndDate, setNewAppointmentEndDate] = useState<Date | null>(null);
  const [newAppointmentWeekdays, setNewAppointmentWeekdays] = useState<string[]>([]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedMemberFilters, setSelectedMemberFilters] = useState<string[]>([]);

  useEffect(() => {
    setModule('agenda' as ModuleName);
  }, [setModule]);

  const isUuid = (value: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

  const doesRepeatMatchDate = (appointment: Appointment, date: Date): boolean => {
    const aptDate = new Date(appointment.date);

    if (appointment.endDate) {
      const endDate = new Date(appointment.endDate);
      endDate.setHours(23, 59, 59, 999);
      if (date > endDate) return false;
    }

    if (appointment.repeatType === 'daily') {
      return date >= aptDate;
    } else if (appointment.repeatType === 'weekly') {
      if (date < aptDate) return false;

      if (appointment.weekdays && appointment.weekdays.length > 0) {
        const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        const currentDay = dayNames[date.getDay()];
        return appointment.weekdays.includes(currentDay);
      }

      return date.getDay() === aptDate.getDay();
    } else if (appointment.repeatType === 'monthly') {
      if (date < aptDate) return false;
      return date.getDate() === aptDate.getDate();
    } else {
      return (
        date.getDate() === aptDate.getDate() &&
        date.getMonth() === aptDate.getMonth() &&
        date.getFullYear() === aptDate.getFullYear()
      );
    }
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments
      .filter((apt) => doesRepeatMatchDate(apt, date))
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  const upcomingAppointments = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const upcoming: { date: Date; appointment: Appointment }[] = [];

    for (let d = new Date(today); d <= thirtyDaysFromNow; d.setDate(d.getDate() + 1)) {
      const dayAppointments = getAppointmentsForDate(new Date(d));
      dayAppointments.forEach((apt) => {
        if (selectedMemberFilters.length > 0) {
          const hasMatchingMember = apt.assignedTo.some((memberId) =>
            selectedMemberFilters.includes(memberId)
          );
          if (!hasMatchingMember) return;
        }
        upcoming.push({ date: new Date(d), appointment: apt });
      });
    }

    return upcoming.sort((a, b) => {
      const dateCompare = a.date.getTime() - b.date.getTime();
      if (dateCompare !== 0) return dateCompare;
      return a.appointment.time.localeCompare(b.appointment.time);
    });
  }, [appointments, selectedMemberFilters, getAppointmentsForDate]);

  const toggleMemberSelection = (memberId: string) => {
    setNewAppointmentAssignedTo((prev) => (prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]));
  };

  const toggleMemberFilter = (memberId: string) => {
    setSelectedMemberFilters((prev) => (prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]));
  };

  const toggleWeekday = (day: string) => {
    setNewAppointmentWeekdays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
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

    if (newAppointmentRepeat === 'weekly' && newAppointmentWeekdays.length === 0) {
      Alert.alert(t('common.error'), 'Selecteer minimaal één dag voor wekelijkse herhaling');
      return;
    }

    const firstMember = familyMembers.find((m) => m.id === newAppointmentAssignedTo[0]);
    const appointmentColor = firstMember?.color || colors.accent;

    addAppointment({
      title: newAppointmentTitle.trim(),
      date: newAppointmentDate,
      time: newAppointmentTime,
      endTime: newAppointmentEndTime.trim() || undefined,
      assignedTo: newAppointmentAssignedTo,
      color: appointmentColor,
      repeatType: newAppointmentRepeat,
      endDate: newAppointmentEndDate || undefined,
      weekdays: newAppointmentRepeat === 'weekly' ? newAppointmentWeekdays : undefined,
    });

    setNewAppointmentTitle('');
    setNewAppointmentDate(new Date());
    setNewAppointmentTime('10:00');
    setNewAppointmentEndTime('');
    setNewAppointmentAssignedTo([]);
    setNewAppointmentRepeat('none');
    setNewAppointmentEndDate(null);
    setNewAppointmentWeekdays([]);
    setShowAddModal(false);

    Alert.alert(t('common.success'), t('agenda.appointmentAdded'));
  };

  const handleDeleteAppointment = async (appointmentId: string, isRecurring: boolean) => {
    if (!appointmentId || !isUuid(String(appointmentId))) {
      Alert.alert(
        t('common.error'),
        `Kan afspraak niet verwijderen: id is geen UUID (${String(appointmentId)}). \n\nFix dit in useFamily/addAppointment (Supabase id).`
      );
      return;
    }

    if (isRecurring) {
      Alert.alert(t('agenda.deleteConfirm'), t('agenda.deleteRecurringOptions'), [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('agenda.deleteOnlyThis'),
          style: 'destructive',
          onPress: () => {
            Alert.alert(t('agenda.confirmDeleteSingle'), t('agenda.confirmDeleteSingleMessage'), [
              { text: t('common.cancel'), style: 'cancel' },
              {
                text: t('common.delete'),
                style: 'destructive',
                onPress: async () => {
                  try {
                    await deleteAppointment(appointmentId, false);
                    setSelectedDay(null);
                    Alert.alert(t('common.success'), t('agenda.appointmentDeleted'));
                  } catch (error) {
                    Alert.alert(t('common.error'), 'Kon afspraak niet verwijderen');
                  }
                },
              },
            ]);
          },
        },
        {
          text: t('agenda.deleteEntireSeries'),
          style: 'destructive',
          onPress: () => {
            Alert.alert(t('agenda.confirmDeleteSeries'), t('agenda.confirmDeleteSeriesMessage'), [
              { text: t('common.cancel'), style: 'cancel' },
              {
                text: t('common.delete'),
                style: 'destructive',
                onPress: async () => {
                  try {
                    await deleteAppointment(appointmentId, true);
                    setSelectedDay(null);
                    Alert.alert(t('common.success'), t('agenda.seriesDeleted'));
                  } catch (error) {
                    Alert.alert(t('common.error'), 'Kon afspraak niet verwijderen');
                  }
                },
              },
            ]);
          },
        },
      ]);
    } else {
      Alert.alert(t('agenda.deleteConfirm'), t('agenda.deleteMessage'), [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAppointment(appointmentId, false);
              setSelectedDay(null);
              Alert.alert(t('common.success'), t('agenda.appointmentDeleted'));
            } catch (error) {
              Alert.alert(t('common.error'), 'Kon afspraak niet verwijderen');
            }
          },
        },
      ]);
    }
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

  const weekdayShortNames = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];
  const weekdayValues = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

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

  const goToToday = () => {
    const today = new Date();
    setSelectedMonth(today.getMonth());
    setSelectedYear(today.getFullYear());
  };

  const renderMonthCalendar = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay();
    const firstDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < firstDayIndex; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedYear, selectedMonth, day);
      date.setHours(0, 0, 0, 0);

      let dayAppointments = getAppointmentsForDate(date);

      if (selectedMemberFilters.length > 0) {
        dayAppointments = dayAppointments.filter((apt) =>
          apt.assignedTo.some((memberId) => selectedMemberFilters.includes(memberId))
        );
      }

      const isToday = date.getTime() === today.getTime();

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayCell,
            styles.dayCellActive,
            isToday && styles.dayCellToday,
          ]}
          onPress={() => setSelectedDay(date)}
          activeOpacity={0.8}
          hitSlop={6}
        >
          <Text style={[styles.dayNumber, isToday && styles.dayNumberToday]}>
            {day}
          </Text>

          <View style={styles.eventsContainer}>
            {dayAppointments.slice(0, 2).map((apt, index) => (
              <View key={index} style={[styles.eventDot, { backgroundColor: apt.color }]} />
            ))}
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
      days.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
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
            isSelected && [styles.calendarDaySelected, { backgroundColor: accentColor }],
          ]}
          onPress={() => {
            setNewAppointmentDate(date);
            setShowDatePicker(false);
          }}
          activeOpacity={0.85}
          hitSlop={8}
        >
          <Text style={[styles.calendarDayText, isSelected && styles.calendarDayTextSelected]}>{day}</Text>
        </TouchableOpacity>
      );
    }

    return days;
  };

  const renderEndDatePicker = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay();
    const days = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedYear, selectedMonth, day);
      const isSelected =
        !!newAppointmentEndDate &&
        newAppointmentEndDate.getDate() === day &&
        newAppointmentEndDate.getMonth() === selectedMonth &&
        newAppointmentEndDate.getFullYear() === selectedYear;

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.calendarDay,
            styles.calendarDayActive,
            isSelected && [styles.calendarDaySelected, { backgroundColor: accentColor }],
          ]}
          onPress={() => {
            setNewAppointmentEndDate(date);
            setShowEndDatePicker(false);
          }}
          activeOpacity={0.85}
          hitSlop={8}
        >
          <Text style={[styles.calendarDayText, isSelected && styles.calendarDayTextSelected]}>{day}</Text>
        </TouchableOpacity>
      );
    }

    return days;
  };

  return (
    <View style={styles.container}>
      <ModuleHeader title={t('agenda.title')} subtitle={t('agenda.subtitle')} backgroundColor="#FFFFFF" />

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Family Member Filter Pills */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>FILTER BY FAMILY</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollView}>
            <TouchableOpacity
              style={[
                styles.filterPill,
                selectedMemberFilters.length === 0 && styles.filterPillActive,
              ]}
              onPress={() => setSelectedMemberFilters([])}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.filterPillText,
                selectedMemberFilters.length === 0 && styles.filterPillTextActive,
              ]}>
                All
              </Text>
            </TouchableOpacity>

            {familyMembers.map((member, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.filterPill,
                  selectedMemberFilters.includes(member.id) && styles.filterPillActive,
                ]}
                onPress={() => toggleMemberFilter(member.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.memberDot, { backgroundColor: member.color }]} />
                <Text style={[
                  styles.filterPillText,
                  selectedMemberFilters.includes(member.id) && styles.filterPillTextActive,
                ]}>
                  {member.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Calendar */}
        <View style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity
              onPress={() => changeMonth('prev')}
              style={styles.navButton}
              hitSlop={12}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={24} color={colors.text} />
            </TouchableOpacity>

            <View style={styles.monthTitleContainer}>
              <Text style={styles.monthTitle}>
                {monthNames[selectedMonth].toUpperCase()} {selectedYear}
              </Text>
              <TouchableOpacity
                onPress={goToToday}
                style={styles.todayButton}
                activeOpacity={0.8}
              >
                <Text style={styles.todayButtonText}>TODAY</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => changeMonth('next')}
              style={styles.navButton}
              hitSlop={12}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-forward" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.weekDaysHeader}>
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day, index) => (
              <View key={index} style={styles.weekDayCell}>
                <Text style={styles.weekDayText}>{day}</Text>
              </View>
            ))}
          </View>

          <View style={styles.monthGrid}>{renderMonthCalendar()}</View>
        </View>

        {/* Upcoming Events */}
        <View style={styles.upcomingSection}>
          <Text style={styles.upcomingTitle}>ALLEEN MIJN AFSPRAKEN</Text>
          {upcomingAppointments.length === 0 ? (
            <View style={styles.emptyUpcoming}>
              <Text style={styles.emptyUpcomingText}>Geen komende afspraken</Text>
            </View>
          ) : (
            upcomingAppointments.slice(0, 5).map((item, index) => {
              const members = familyMembers.filter((m) => item.appointment.assignedTo.includes(m.id));
              const isRecurring = item.appointment.repeatType && item.appointment.repeatType !== 'none';

              return (
                <View key={index} style={styles.upcomingCard}>
                  <View style={styles.upcomingCardLeft}>
                    <Text style={styles.upcomingCardDay}>
                      {item.date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
                    </Text>
                    <Text style={styles.upcomingCardDate}>{item.date.getDate()}</Text>
                  </View>

                  <View style={styles.upcomingCardContent}>
                    <Text style={styles.upcomingCardTitle}>{item.appointment.title}</Text>
                    <View style={styles.upcomingCardMeta}>
                      <Text style={styles.upcomingCardTime}>
                        {item.appointment.time}
                        {item.appointment.endTime ? ` - ${item.appointment.endTime}` : ''}
                      </Text>
                      {isRecurring && (
                        <View style={styles.repeatBadge}>
                          <Ionicons name="repeat" size={12} color={colors.textSecondary} />
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={styles.upcomingCardRight}>
                    {members.map((member, mIndex) => (
                      <View key={mIndex} style={[styles.memberBadge, { backgroundColor: member.color }]} />
                    ))}
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={[styles.floatingButton, { backgroundColor: colors.warmOrange }]}
        onPress={() => setShowAddModal(true)}
        activeOpacity={0.9}
      >
        <Ionicons name="add" size={32} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Day Detail Modal */}
      {selectedDay && (
        <Modal visible={true} transparent animationType="slide" onRequestClose={() => setSelectedDay(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.dayDetailModal}>
              <View style={styles.dayDetailHeader}>
                <TouchableOpacity style={styles.modalBackButton} onPress={() => setSelectedDay(null)} hitSlop={12}>
                  <Ionicons name="chevron-back" size={26} color="#333" />
                </TouchableOpacity>

                <Text style={styles.dayDetailTitle}>
                  {selectedDay.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}
                </Text>

                <View style={styles.modalHeaderSpacer} />
              </View>

              <ScrollView style={styles.dayDetailContent}>
                {getAppointmentsForDate(selectedDay).length === 0 ? (
                  <View style={styles.noAppointments}>
                    <Text style={styles.noAppointmentsText}>{t('home.noAppointmentsToday')}</Text>
                  </View>
                ) : (
                  getAppointmentsForDate(selectedDay).map((apt, index) => {
                    const members = familyMembers.filter((m) => apt.assignedTo.includes(m.id));
                    const isRecurring = apt.repeatType && apt.repeatType !== 'none';

                    return (
                      <View key={index} style={[styles.appointmentCard, { borderLeftColor: apt.color }]}>
                        <View style={styles.appointmentCardContent}>
                          <View style={styles.appointmentCardHeader}>
                            <Text style={styles.appointmentCardTime}>
                              {apt.time}
                              {apt.endTime ? ` - ${apt.endTime}` : ''}
                            </Text>

                            {isRecurring && (
                              <View style={styles.repeatBadge}>
                                <Ionicons name="repeat" size={14} color={colors.textSecondary} />
                                <Text style={styles.repeatBadgeText}>{t('agenda.repeats')}</Text>
                              </View>
                            )}
                          </View>

                          <Text style={styles.appointmentCardTitle}>{apt.title}</Text>

                          <View style={styles.appointmentCardMembers}>
                            {members.map((member, mIndex) => (
                              <View key={mIndex} style={[styles.memberBadgeSmall, { backgroundColor: member.color }]}>
                                <Text style={styles.memberBadgeText}>{member.name.charAt(0)}</Text>
                              </View>
                            ))}
                            <Text style={styles.memberNames}>{members.map((m) => m.name).join(', ')}</Text>
                          </View>

                          <View style={styles.deleteButtonsContainer}>
                            <TouchableOpacity
                              style={styles.deleteButton}
                              onPress={() => handleDeleteAppointment(String((apt as any).id), !!isRecurring)}
                              activeOpacity={0.8}
                              hitSlop={8}
                            >
                              <Ionicons name="trash-outline" size={18} color="#fff" />
                              <Text style={styles.deleteButtonText}>
                                {isRecurring ? t('agenda.deleteOptions') : t('common.delete')}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    );
                  })
                )}
              </ScrollView>

              <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedDay(null)} activeOpacity={0.8}>
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
                    setNewAppointmentEndDate(null);
                    setNewAppointmentWeekdays([]);
                  }}
                  hitSlop={12}
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
                activeOpacity={0.85}
                hitSlop={8}
              >
                <Ionicons name="calendar-outline" size={22} color="#333" />
                <Text style={styles.dateButtonText}>{newAppointmentDate.toLocaleDateString('nl-NL')}</Text>
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
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.memberOption,
                      newAppointmentAssignedTo.includes(member.id) && [
                        styles.memberOptionActive,
                        { borderColor: accentColor },
                      ],
                    ]}
                    onPress={() => toggleMemberSelection(member.id)}
                    activeOpacity={0.85}
                    hitSlop={6}
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
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.repeatOption,
                      newAppointmentRepeat === option.value && [
                        styles.repeatOptionActive,
                        { borderColor: accentColor, backgroundColor: accentColor + '20' },
                      ],
                    ]}
                    onPress={() => setNewAppointmentRepeat(option.value as any)}
                    activeOpacity={0.85}
                    hitSlop={6}
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
                ))}
              </View>

              {newAppointmentRepeat === 'weekly' && (
                <>
                  <Text style={styles.inputLabel}>Selecteer dagen:</Text>
                  <View style={styles.weekdaySelector}>
                    {weekdayShortNames.map((day, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.weekdayButton,
                          newAppointmentWeekdays.includes(weekdayValues[index]) && [
                            styles.weekdayButtonActive,
                            { backgroundColor: accentColor },
                          ],
                        ]}
                        onPress={() => toggleWeekday(weekdayValues[index])}
                        activeOpacity={0.85}
                        hitSlop={6}
                      >
                        <Text
                          style={[
                            styles.weekdayButtonText,
                            newAppointmentWeekdays.includes(weekdayValues[index]) && styles.weekdayButtonTextActive,
                          ]}
                        >
                          {day}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              {newAppointmentRepeat !== 'none' && (
                <>
                  <Text style={styles.inputLabel}>Einddatum (optioneel):</Text>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => {
                      setSelectedMonth(newAppointmentEndDate?.getMonth() || new Date().getMonth());
                      setSelectedYear(newAppointmentEndDate?.getFullYear() || new Date().getFullYear());
                      setShowEndDatePicker(true);
                    }}
                    activeOpacity={0.85}
                    hitSlop={8}
                  >
                    <Ionicons name="calendar-outline" size={22} color="#333" />
                    <Text style={styles.dateButtonText}>
                      {newAppointmentEndDate ? newAppointmentEndDate.toLocaleDateString('nl-NL') : 'Geen einddatum'}
                    </Text>
                  </TouchableOpacity>

                  {newAppointmentEndDate && (
                    <TouchableOpacity style={styles.clearEndDateButton} onPress={() => setNewAppointmentEndDate(null)} activeOpacity={0.85}>
                      <Text style={styles.clearEndDateText}>Einddatum wissen</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}

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
                    setNewAppointmentEndDate(null);
                    setNewAppointmentWeekdays([]);
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.modalButtonText}>{t('common.cancel')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonConfirm, { backgroundColor: accentColor }]}
                  onPress={handleAddAppointment}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>{t('common.add')}</Text>
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
        <Pressable style={styles.calendarOverlay} onPress={() => setShowDatePicker(false)}>
          <Pressable style={styles.calendarModal} onPress={() => {}}>
            <View style={styles.calendarPickerHeader}>
              <TouchableOpacity style={styles.calendarBackButton} onPress={() => setShowDatePicker(false)} hitSlop={12}>
                <Ionicons name="chevron-back" size={26} color="#333" />
              </TouchableOpacity>
              <Text style={styles.calendarPickerTitle}>{t('agenda.selectDate')}</Text>
              <View style={styles.calendarHeaderSpacer} />
            </View>

            <View style={styles.calendarMonthNav}>
              <TouchableOpacity
                onPress={() => {
                  if (selectedMonth === 0) {
                    setSelectedMonth(11);
                    setSelectedYear(selectedYear - 1);
                  } else {
                    setSelectedMonth(selectedMonth - 1);
                  }
                }}
                style={styles.calendarNavButton}
                hitSlop={12}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-back" size={24} color={colors.text} />
              </TouchableOpacity>

              <Text style={styles.calendarMonthYear}>
                {monthNames[selectedMonth]} {selectedYear}
              </Text>

              <TouchableOpacity
                onPress={() => {
                  if (selectedMonth === 11) {
                    setSelectedMonth(0);
                    setSelectedYear(selectedYear + 1);
                  } else {
                    setSelectedMonth(selectedMonth + 1);
                  }
                }}
                style={styles.calendarNavButton}
                hitSlop={12}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-forward" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.calendarWeekDays}>
              {['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'].map((day, index) => (
                <Text key={index} style={styles.calendarWeekDay}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>{renderDatePicker()}</View>

            <TouchableOpacity style={styles.calendarCloseButton} onPress={() => setShowDatePicker(false)} activeOpacity={0.85}>
              <Text style={styles.calendarCloseButtonText}>{t('common.close')}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* End Date Picker Modal */}
      <Modal
        visible={showEndDatePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEndDatePicker(false)}
      >
        <Pressable style={styles.calendarOverlay} onPress={() => setShowEndDatePicker(false)}>
          <Pressable style={styles.calendarModal} onPress={() => {}}>
            <View style={styles.calendarPickerHeader}>
              <TouchableOpacity style={styles.calendarBackButton} onPress={() => setShowEndDatePicker(false)} hitSlop={12}>
                <Ionicons name="chevron-back" size={26} color="#333" />
              </TouchableOpacity>
              <Text style={styles.calendarPickerTitle}>Selecteer einddatum</Text>
              <View style={styles.calendarHeaderSpacer} />
            </View>

            <View style={styles.calendarMonthNav}>
              <TouchableOpacity
                onPress={() => {
                  if (selectedMonth === 0) {
                    setSelectedMonth(11);
                    setSelectedYear(selectedYear - 1);
                  } else {
                    setSelectedMonth(selectedMonth - 1);
                  }
                }}
                style={styles.calendarNavButton}
                hitSlop={12}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-back" size={24} color={colors.text} />
              </TouchableOpacity>

              <Text style={styles.calendarMonthYear}>
                {monthNames[selectedMonth]} {selectedYear}
              </Text>

              <TouchableOpacity
                onPress={() => {
                  if (selectedMonth === 11) {
                    setSelectedMonth(0);
                    setSelectedYear(selectedYear + 1);
                  } else {
                    setSelectedMonth(selectedMonth + 1);
                  }
                }}
                style={styles.calendarNavButton}
                hitSlop={12}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-forward" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.calendarWeekDays}>
              {['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'].map((day, index) => (
                <Text key={index} style={styles.calendarWeekDay}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>{renderEndDatePicker()}</View>

            <TouchableOpacity style={styles.calendarCloseButton} onPress={() => setShowEndDatePicker(false)} activeOpacity={0.85}>
              <Text style={styles.calendarCloseButtonText}>{t('common.close')}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F6F1' },
  contentContainer: { paddingHorizontal: 20, paddingBottom: 100 },

  // Filter Section (Screenshot 1 style)
  filterSection: {
    marginBottom: 20,
    marginTop: 10,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 12,
    letterSpacing: 0.5,
    fontFamily: 'Poppins_600SemiBold',
  },
  filterScrollView: {
    flexDirection: 'row',
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    gap: 8,
  },
  filterPillActive: {
    backgroundColor: colors.warmOrange,
    borderColor: colors.warmOrange,
  },
  filterPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  memberDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  // Calendar Card (Screenshot 1 style)
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthTitleContainer: {
    alignItems: 'center',
    gap: 4,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Poppins_700Bold',
    letterSpacing: 0.5,
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  todayButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
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
    fontSize: 11,
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
    aspectRatio: 1,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  dayCellActive: {
    borderRadius: 12,
  },
  dayCellToday: {
    backgroundColor: '#FFF4E6',
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 4,
  },
  dayNumberToday: {
    color: colors.warmOrange,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
  },
  eventsContainer: {
    flexDirection: 'row',
    gap: 3,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  eventDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  // Upcoming Section (Screenshot 1 style)
  upcomingSection: {
    marginBottom: 20,
  },
  upcomingTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 12,
    letterSpacing: 0.5,
    fontFamily: 'Poppins_600SemiBold',
  },
  emptyUpcoming: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
  },
  emptyUpcomingText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  upcomingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  upcomingCardLeft: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 50,
  },
  upcomingCardDay: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 2,
  },
  upcomingCardDate: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Poppins_700Bold',
  },
  upcomingCardContent: {
    flex: 1,
  },
  upcomingCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 4,
  },
  upcomingCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  upcomingCardTime: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  repeatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.textSecondary + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  repeatBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
    fontFamily: 'Poppins_600SemiBold',
  },
  upcomingCardRight: {
    flexDirection: 'row',
    gap: 4,
    marginLeft: 12,
  },
  memberBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Floating Button (Screenshot 1 style)
  floatingButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
    elevation: 5,
  },

  // Modal Styles
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
    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)',
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
    gap: 10,
  },
  appointmentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  memberBadgeSmall: {
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

  deleteButtonsContainer: {
    marginTop: 8,
    gap: 8,
  },
  deleteButton: {
    backgroundColor: '#E74C3C',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Poppins_600SemiBold',
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
    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)',
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
  repeatOptionActive: {},
  repeatOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    fontFamily: 'Poppins_600SemiBold',
  },
  repeatOptionTextActive: {
    color: colors.text,
  },

  weekdaySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  weekdayButton: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    minWidth: 45,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  weekdayButtonActive: {},
  weekdayButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    fontFamily: 'Poppins_600SemiBold',
  },
  weekdayButtonTextActive: {
    color: colors.card,
  },

  clearEndDateButton: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  clearEndDateText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    fontFamily: 'Poppins_600SemiBold',
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
  modalButtonConfirm: {},
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
    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)',
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
  calendarDaySelected: {},
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

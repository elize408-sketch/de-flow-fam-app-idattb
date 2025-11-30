
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { Ionicons } from '@expo/vector-icons';
import { useFamily } from '@/contexts/FamilyContext';

export default function AgendaScreen() {
  const router = useRouter();
  const { appointments, familyMembers, addAppointment, deleteAppointment } = useFamily();
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
  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart(new Date()));

  function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  }

  function getWeekDays(startDate: Date): Date[] {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  }

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
      Alert.alert('Fout', 'Vul een titel in');
      return;
    }

    if (newAppointmentAssignedTo.length === 0) {
      Alert.alert('Fout', 'Selecteer minimaal één gezinslid');
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
    
    Alert.alert('Gelukt!', 'Afspraak toegevoegd');
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

  const monthNames = ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'];
  const dayNames = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];

  const changeWeek = (direction: 'prev' | 'next') => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeekStart(newStart);
  };

  const renderCalendar = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();
    const days = [];

    for (let i = 0; i < firstDay; i++) {
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
            isSelected && styles.calendarDaySelected
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

  const weekDays = getWeekDays(currentWeekStart);
  const weekEnd = new Date(currentWeekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.headerRow}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.push('/(tabs)/(home)')}
          >
            <Ionicons name="chevron-back" size={26} color="#333" />
          </TouchableOpacity>
          
          <View style={styles.header}>
            <Text style={styles.title}>Agenda</Text>
            <Text style={styles.subtitle}>Gezinsafspraken en planning</Text>
          </View>
          
          <View style={styles.placeholder} />
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={24} color={colors.card} />
          <Text style={styles.addButtonText}>Afspraak toevoegen</Text>
        </TouchableOpacity>

        {/* Weekly Calendar View */}
        <View style={styles.weeklyCalendar}>
          <View style={styles.weekHeader}>
            <TouchableOpacity onPress={() => changeWeek('prev')} style={styles.weekNavButton}>
              <Ionicons name="chevron-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.weekTitle}>
              {currentWeekStart.getDate()} {monthNames[currentWeekStart.getMonth()]} - {weekEnd.getDate()} {monthNames[weekEnd.getMonth()]} {weekEnd.getFullYear()}
            </Text>
            <TouchableOpacity onPress={() => changeWeek('next')} style={styles.weekNavButton}>
              <Ionicons name="chevron-forward" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.weekGrid}>
            {weekDays.map((day, index) => {
              const dayAppointments = getAppointmentsForDate(day);
              const isToday = 
                day.getDate() === new Date().getDate() &&
                day.getMonth() === new Date().getMonth() &&
                day.getFullYear() === new Date().getFullYear();

              return (
                <React.Fragment key={index}>
                  <View style={[styles.dayColumn, isToday && styles.dayColumnToday]}>
                    <View style={styles.dayHeader}>
                      <Text style={[styles.dayName, isToday && styles.dayNameToday]}>{dayNames[index]}</Text>
                      <Text style={[styles.dayNumber, isToday && styles.dayNumberToday]}>{day.getDate()}</Text>
                    </View>
                    
                    <ScrollView style={styles.dayAppointments} showsVerticalScrollIndicator={false}>
                      {dayAppointments.length === 0 ? (
                        <View style={styles.emptyDay}>
                          <Text style={styles.emptyDayText}>-</Text>
                        </View>
                      ) : (
                        dayAppointments.map((apt, aptIndex) => {
                          const members = familyMembers.filter(m => apt.assignedTo.includes(m.id));
                          return (
                            <React.Fragment key={aptIndex}>
                              <TouchableOpacity
                                style={[styles.appointmentBlock, { backgroundColor: apt.color }]}
                                onPress={() => {
                                  Alert.alert(
                                    apt.title,
                                    `${apt.time}${apt.endTime ? ` - ${apt.endTime}` : ''}\n\n${members.map(m => m.name).join(', ')}`,
                                    [
                                      { text: 'Sluiten', style: 'cancel' },
                                      {
                                        text: 'Verwijderen',
                                        style: 'destructive',
                                        onPress: () => {
                                          Alert.alert(
                                            'Verwijderen?',
                                            'Weet je zeker dat je deze afspraak wilt verwijderen?',
                                            [
                                              { text: 'Annuleren', style: 'cancel' },
                                              { text: 'Verwijderen', onPress: () => deleteAppointment(apt.id), style: 'destructive' },
                                            ]
                                          );
                                        },
                                      },
                                    ]
                                  );
                                }}
                              >
                                <Text style={styles.appointmentTime}>{apt.time}</Text>
                                <Text style={styles.appointmentTitle} numberOfLines={2}>{apt.title}</Text>
                                <View style={styles.appointmentMembers}>
                                  {members.slice(0, 2).map((member, mIndex) => (
                                    <React.Fragment key={mIndex}>
                                      <View style={[styles.memberDot, { backgroundColor: member.color }]}>
                                        <Text style={styles.memberDotText}>{member.name.charAt(0)}</Text>
                                      </View>
                                    </React.Fragment>
                                  ))}
                                  {members.length > 2 && (
                                    <Text style={styles.moreMembers}>+{members.length - 2}</Text>
                                  )}
                                </View>
                              </TouchableOpacity>
                            </React.Fragment>
                          );
                        })
                      )}
                    </ScrollView>
                  </View>
                </React.Fragment>
              );
            })}
          </View>
        </View>
      </ScrollView>

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
                <Text style={styles.modalTitle}>Nieuwe afspraak</Text>
                <View style={styles.modalHeaderSpacer} />
              </View>

              <TextInput
                style={styles.input}
                placeholder="Titel"
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
                  placeholder="Starttijd (bijv. 10:00)"
                  placeholderTextColor={colors.textSecondary}
                  value={newAppointmentTime}
                  onChangeText={setNewAppointmentTime}
                />
              </View>

              <Text style={styles.inputLabel}>Eindtijd (optioneel)</Text>
              <View style={styles.timeInputContainer}>
                <Ionicons name="time-outline" size={22} color="#333" />
                <TextInput
                  style={styles.timeInput}
                  placeholder="bijv. 11:30"
                  placeholderTextColor={colors.textSecondary}
                  value={newAppointmentEndTime}
                  onChangeText={setNewAppointmentEndTime}
                />
              </View>

              <Text style={styles.inputLabel}>Voor wie: (meerdere mogelijk)</Text>
              <View style={styles.memberSelector}>
                {familyMembers.map((member, index) => (
                  <React.Fragment key={index}>
                    <TouchableOpacity
                      style={[
                        styles.memberOption,
                        newAppointmentAssignedTo.includes(member.id) && styles.memberOptionActive,
                      ]}
                      onPress={() => toggleMemberSelection(member.id)}
                    >
                      <View style={[styles.memberAvatar, { backgroundColor: member.color || colors.accent }]}>
                        <Text style={styles.memberAvatarText}>{member.name.charAt(0)}</Text>
                      </View>
                      <Text style={styles.memberName}>{member.name}</Text>
                      {newAppointmentAssignedTo.includes(member.id) && (
                        <View style={styles.checkmark}>
                          <Ionicons name="checkmark" size={16} color={colors.accent} />
                        </View>
                      )}
                    </TouchableOpacity>
                  </React.Fragment>
                ))}
              </View>

              <Text style={styles.inputLabel}>Herhaling:</Text>
              <View style={styles.repeatSelector}>
                {[
                  { value: 'none', label: 'Geen' },
                  { value: 'daily', label: 'Dagelijks' },
                  { value: 'weekly', label: 'Wekelijks' },
                  { value: 'monthly', label: 'Maandelijks' },
                ].map((option, index) => (
                  <React.Fragment key={index}>
                    <TouchableOpacity
                      style={[
                        styles.repeatOption,
                        newAppointmentRepeat === option.value && styles.repeatOptionActive,
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
                  <Text style={styles.modalButtonText}>Annuleren</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonConfirm]}
                  onPress={handleAddAppointment}
                >
                  <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>Toevoegen</Text>
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
              <Text style={styles.calendarPickerTitle}>Selecteer datum</Text>
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
              {renderCalendar()}
            </View>

            <TouchableOpacity
              style={styles.calendarCloseButton}
              onPress={() => setShowDatePicker(false)}
            >
              <Text style={styles.calendarCloseButtonText}>Sluiten</Text>
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
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
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
  header: {
    alignItems: 'center',
    flex: 1,
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
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 5,
    fontFamily: 'Nunito_400Regular',
    textAlign: 'center',
  },
  addButton: {
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
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.card,
    marginLeft: 10,
    fontFamily: 'Poppins_600SemiBold',
  },
  weeklyCalendar: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 15,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  weekNavButton: {
    padding: 8,
  },
  weekTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
  },
  weekGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  dayColumn: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 300,
  },
  dayColumnToday: {
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  dayHeader: {
    padding: 8,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.textSecondary + '20',
  },
  dayName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    fontFamily: 'Poppins_600SemiBold',
  },
  dayNameToday: {
    color: colors.accent,
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Poppins_700Bold',
  },
  dayNumberToday: {
    color: colors.accent,
  },
  dayAppointments: {
    flex: 1,
    padding: 4,
  },
  emptyDay: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyDayText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  appointmentBlock: {
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
    minHeight: 60,
  },
  appointmentTime: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.card,
    fontFamily: 'Poppins_700Bold',
    marginBottom: 2,
  },
  appointmentTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.card,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 4,
  },
  appointmentMembers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  memberDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.card,
  },
  memberDotText: {
    fontSize: 8,
    fontWeight: '700',
    color: colors.card,
    fontFamily: 'Poppins_700Bold',
  },
  moreMembers: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.card,
    fontFamily: 'Poppins_600SemiBold',
    marginLeft: 2,
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
    borderColor: colors.accent,
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
    backgroundColor: colors.card,
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
    backgroundColor: colors.accent,
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


import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
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
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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

    setNewAppointmentTitle('');
    setNewAppointmentDate(new Date());
    setNewAppointmentTime('10:00');
    setNewAppointmentEndTime('');
    setNewAppointmentAssignedTo([]);
    setNewAppointmentRepeat('none');
    setShowAddModal(false);
    Alert.alert('Gelukt!', 'Afspraak toegevoegd');
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getAppointmentsForDate = (date: Date | null) => {
    if (!date) return [];
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return (
        aptDate.getDate() === date.getDate() &&
        aptDate.getMonth() === date.getMonth() &&
        aptDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const monthNames = ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'];
  const dayNames = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'];

  const changeMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (selectedMonth === 0) {
        setSelectedMonth(11);
        setSelectedYear(selectedYear - 1);
      } else {
        setSelectedMonth(selectedMonth - 1);
      }
    } else {
      if (selectedMonth === 11) {
        setSelectedMonth(0);
        setSelectedYear(selectedYear + 1);
      } else {
        setSelectedMonth(selectedMonth + 1);
      }
    }
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

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
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
          <IconSymbol
            ios_icon_name="plus"
            android_material_icon_name="add"
            size={24}
            color={colors.card}
          />
          <Text style={styles.addButtonText}>Afspraak toevoegen</Text>
        </TouchableOpacity>

        <View style={styles.calendarContainer}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity
              onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              style={styles.arrowButton}
            >
              <Image
                source={require('@/assets/images/a48502d9-8f03-4c17-acd5-23b19ef0a828.png')}
                style={styles.arrowIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <Text style={styles.calendarTitle}>
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </Text>
            <TouchableOpacity
              onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              style={styles.arrowButton}
            >
              <Image
                source={require('@/assets/images/d8776866-a3f0-4d6b-a35e-b1f98b27eaee.png')}
                style={styles.arrowIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.dayNamesRow}>
            {dayNames.map((day, index) => (
              <React.Fragment key={index}>
                <Text style={styles.dayName}>{day}</Text>
              </React.Fragment>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {getDaysInMonth(currentMonth).map((day, index) => {
              const dayAppointments = getAppointmentsForDate(day);
              const isToday = day && 
                day.getDate() === new Date().getDate() &&
                day.getMonth() === new Date().getMonth() &&
                day.getFullYear() === new Date().getFullYear();

              return (
                <React.Fragment key={index}>
                  <View style={[styles.dayCell, isToday && styles.dayCellToday]}>
                    {day && (
                      <>
                        <Text style={[styles.dayNumber, isToday && styles.dayNumberToday]}>
                          {day.getDate()}
                        </Text>
                        {dayAppointments.length > 0 && (
                          <View style={styles.appointmentDots}>
                            {dayAppointments.slice(0, 3).map((apt, aptIndex) => (
                              <React.Fragment key={aptIndex}>
                                <View style={[styles.appointmentDot, { backgroundColor: apt.color }]} />
                              </React.Fragment>
                            ))}
                          </View>
                        )}
                      </>
                    )}
                  </View>
                </React.Fragment>
              );
            })}
          </View>
        </View>

        <View style={styles.appointmentsList}>
          <Text style={styles.sectionTitle}>Aankomende afspraken</Text>
          {appointments.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>📅</Text>
              <Text style={styles.emptyStateText}>Nog geen afspraken</Text>
            </View>
          ) : (
            appointments
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((appointment, index) => {
                const members = familyMembers.filter(m => appointment.assignedTo.includes(m.id));
                return (
                  <React.Fragment key={index}>
                    <View style={[styles.appointmentCard, { borderLeftColor: appointment.color, borderLeftWidth: 4 }]}>
                      <View style={styles.appointmentInfo}>
                        <Text style={styles.appointmentTitle}>{appointment.title}</Text>
                        <Text style={styles.appointmentMeta}>
                          📅 {new Date(appointment.date).toLocaleDateString('nl-NL')} om {appointment.time}
                          {appointment.endTime && ` - ${appointment.endTime}`}
                        </Text>
                        <View style={styles.membersRow}>
                          <Text style={styles.appointmentMeta}>👥 </Text>
                          {members.map((member, mIndex) => (
                            <React.Fragment key={mIndex}>
                              <View style={[styles.memberBadge, { backgroundColor: member.color }]}>
                                <Text style={styles.memberBadgeText}>{member.name.charAt(0)}</Text>
                              </View>
                            </React.Fragment>
                          ))}
                          <Text style={styles.appointmentMeta}> {members.map(m => m.name).join(', ')}</Text>
                        </View>
                        {appointment.repeatType !== 'none' && (
                          <Text style={styles.appointmentMeta}>
                            🔄 {appointment.repeatType === 'daily' && 'Dagelijks'}
                            {appointment.repeatType === 'weekly' && 'Wekelijks'}
                            {appointment.repeatType === 'monthly' && 'Maandelijks'}
                          </Text>
                        )}
                      </View>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => {
                          Alert.alert(
                            'Verwijderen?',
                            'Weet je zeker dat je deze afspraak wilt verwijderen?',
                            [
                              { text: 'Annuleren', style: 'cancel' },
                              { text: 'Verwijderen', onPress: () => deleteAppointment(appointment.id), style: 'destructive' },
                            ]
                          );
                        }}
                      >
                        <IconSymbol
                          ios_icon_name="trash"
                          android_material_icon_name="delete"
                          size={20}
                          color={colors.textSecondary}
                        />
                      </TouchableOpacity>
                    </View>
                  </React.Fragment>
                );
              })
          )}
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
              <Text style={styles.modalTitle}>Nieuwe afspraak</Text>

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
                <Text style={styles.dateButtonText}>
                  📅 {newAppointmentDate.toLocaleDateString('nl-NL')}
                </Text>
                <IconSymbol
                  ios_icon_name="chevron.down"
                  android_material_icon_name="expand_more"
                  size={20}
                  color={colors.text}
                />
              </TouchableOpacity>

              <TextInput
                style={styles.input}
                placeholder="Starttijd (bijv. 10:00)"
                placeholderTextColor={colors.textSecondary}
                value={newAppointmentTime}
                onChangeText={setNewAppointmentTime}
              />

              <TextInput
                style={styles.input}
                placeholder="Eindtijd (optioneel, bijv. 11:30)"
                placeholderTextColor={colors.textSecondary}
                value={newAppointmentEndTime}
                onChangeText={setNewAppointmentEndTime}
              />

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
                          <IconSymbol
                            ios_icon_name="checkmark"
                            android_material_icon_name="check"
                            size={16}
                            color={colors.accent}
                          />
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
              <TouchableOpacity onPress={() => changeMonth('prev')} style={styles.calendarNavButton}>
                <Image
                  source={require('@/assets/images/a48502d9-8f03-4c17-acd5-23b19ef0a828.png')}
                  style={styles.arrowIconSmall}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <Text style={styles.calendarMonthYear}>
                {monthNames[selectedMonth]} {selectedYear}
              </Text>
              <TouchableOpacity onPress={() => changeMonth('next')} style={styles.calendarNavButton}>
                <Image
                  source={require('@/assets/images/d8776866-a3f0-4d6b-a35e-b1f98b27eaee.png')}
                  style={styles.arrowIconSmall}
                  resizeMode="contain"
                />
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
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Poppins_700Bold',
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
  calendarContainer: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
  },
  arrowButton: {
    padding: 8,
  },
  arrowIcon: {
    width: 24,
    height: 24,
    tintColor: colors.text,
  },
  arrowIconSmall: {
    width: 20,
    height: 20,
    tintColor: colors.text,
  },
  dayNamesRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  dayName: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    fontFamily: 'Poppins_600SemiBold',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellToday: {
    backgroundColor: colors.primary,
    borderRadius: 10,
  },
  dayNumber: {
    fontSize: 14,
    color: colors.text,
    fontFamily: 'Nunito_400Regular',
  },
  dayNumberToday: {
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
  },
  appointmentDots: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
  },
  appointmentDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  appointmentsList: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 15,
    fontFamily: 'Poppins_600SemiBold',
  },
  emptyState: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  emptyStateEmoji: {
    fontSize: 60,
    marginBottom: 15,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  appointmentCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 5,
    fontFamily: 'Poppins_600SemiBold',
  },
  appointmentMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
    fontFamily: 'Nunito_400Regular',
  },
  membersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    flexWrap: 'wrap',
  },
  memberBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  memberBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.card,
    fontFamily: 'Poppins_700Bold',
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
  dateButton: {
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 16,
    color: colors.text,
    fontFamily: 'Nunito_400Regular',
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

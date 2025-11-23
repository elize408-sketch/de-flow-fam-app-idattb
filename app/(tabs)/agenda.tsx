
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useFamily } from '@/contexts/FamilyContext';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AgendaScreen() {
  const { appointments, familyMembers, addAppointment, deleteAppointment } = useFamily();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAppointmentTitle, setNewAppointmentTitle] = useState('');
  const [newAppointmentDate, setNewAppointmentDate] = useState(new Date());
  const [newAppointmentTime, setNewAppointmentTime] = useState('10:00');
  const [newAppointmentAssignedTo, setNewAppointmentAssignedTo] = useState('');
  const [newAppointmentRepeat, setNewAppointmentRepeat] = useState<'daily' | 'weekly' | 'monthly' | 'none'>('none');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const handleAddAppointment = () => {
    if (!newAppointmentTitle.trim()) {
      Alert.alert('Fout', 'Vul een titel in');
      return;
    }

    if (!newAppointmentAssignedTo) {
      Alert.alert('Fout', 'Selecteer een gezinslid');
      return;
    }

    const member = familyMembers.find(m => m.id === newAppointmentAssignedTo);

    addAppointment({
      title: newAppointmentTitle.trim(),
      date: newAppointmentDate,
      time: newAppointmentTime,
      assignedTo: newAppointmentAssignedTo,
      color: member?.color || colors.accent,
      repeatType: newAppointmentRepeat,
    });

    setNewAppointmentTitle('');
    setNewAppointmentDate(new Date());
    setNewAppointmentTime('10:00');
    setNewAppointmentAssignedTo('');
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

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Agenda</Text>
          <Text style={styles.subtitle}>Gezinsafspraken en planning</Text>
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
            >
              <IconSymbol
                ios_icon_name="chevron.left"
                android_material_icon_name="chevron-left"
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>
            <Text style={styles.calendarTitle}>
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </Text>
            <TouchableOpacity
              onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            >
              <IconSymbol
                ios_icon_name="chevron.right"
                android_material_icon_name="chevron-right"
                size={24}
                color={colors.text}
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
                const member = familyMembers.find(m => m.id === appointment.assignedTo);
                return (
                  <React.Fragment key={index}>
                    <View style={[styles.appointmentCard, { borderLeftColor: appointment.color, borderLeftWidth: 4 }]}>
                      <View style={styles.appointmentInfo}>
                        <Text style={styles.appointmentTitle}>{appointment.title}</Text>
                        <Text style={styles.appointmentMeta}>
                          📅 {new Date(appointment.date).toLocaleDateString('nl-NL')} om {appointment.time}
                        </Text>
                        <Text style={styles.appointmentMeta}>
                          👤 {member?.name || 'Onbekend'}
                        </Text>
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
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                📅 {newAppointmentDate.toLocaleDateString('nl-NL')}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={newAppointmentDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setNewAppointmentDate(selectedDate);
                  }
                }}
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="Tijd (bijv. 10:00)"
              placeholderTextColor={colors.textSecondary}
              value={newAppointmentTime}
              onChangeText={setNewAppointmentTime}
            />

            <Text style={styles.inputLabel}>Voor wie:</Text>
            <View style={styles.memberSelector}>
              {familyMembers.map((member, index) => (
                <React.Fragment key={index}>
                  <TouchableOpacity
                    style={[
                      styles.memberOption,
                      newAppointmentAssignedTo === member.id && styles.memberOptionActive,
                    ]}
                    onPress={() => setNewAppointmentAssignedTo(member.id)}
                  >
                    <View style={[styles.memberAvatar, { backgroundColor: member.color || colors.accent }]}>
                      <Text style={styles.memberAvatarText}>{member.name.charAt(0)}</Text>
                    </View>
                    <Text style={styles.memberName}>{member.name}</Text>
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
                onPress={() => setShowAddModal(false)}
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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Poppins_700Bold',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 5,
    fontFamily: 'Nunito_400Regular',
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
  deleteButton: {
    padding: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
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
});

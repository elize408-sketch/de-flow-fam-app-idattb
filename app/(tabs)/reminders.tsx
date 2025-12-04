
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useFamily } from '@/contexts/FamilyContext';
import * as ImagePicker from 'expo-image-picker';
import * as MailComposer from 'expo-mail-composer';
import { useModuleTheme, ModuleName } from '@/contexts/ThemeContext';
import ModuleHeader from '@/components/ModuleHeader';
import ThemedButton from '@/components/ThemedButton';

export default function RemindersScreen() {
  const router = useRouter();
  const { setModule, accentColor } = useModuleTheme();
  const { reminders, addReminder, updateReminder, deleteReminder, currentUser, familyMembers } = useFamily();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReminderTitle, setNewReminderTitle] = useState('');
  const [newReminderDescription, setNewReminderDescription] = useState('');
  const [newReminderDate, setNewReminderDate] = useState(new Date());
  const [newReminderTime, setNewReminderTime] = useState('10:00');
  const [newReminderAssignedTo, setNewReminderAssignedTo] = useState<string[]>([]);
  const [newReminderPhoto, setNewReminderPhoto] = useState<string | undefined>(undefined);
  const [showCalendarPicker, setShowCalendarPicker] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const isParent = currentUser?.role === 'parent';

  // Set module theme on mount (this is the Fotoboek/memories module)
  useEffect(() => {
    setModule('memories' as ModuleName);
  }, [setModule]);

  const handlePickPhoto = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Toestemming vereist', 'Je moet toegang geven tot je foto&apos;s om een foto te kunnen toevoegen');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets[0]) {
      setNewReminderPhoto(result.assets[0].uri);
    }
  };

  const toggleMemberSelection = (memberId: string) => {
    setNewReminderAssignedTo(prev => {
      if (prev.includes(memberId)) {
        return prev.filter(id => id !== memberId);
      } else {
        return [...prev, memberId];
      }
    });
  };

  const handleAddReminder = () => {
    if (!newReminderTitle.trim()) {
      Alert.alert('Fout', 'Vul een titel in');
      return;
    }

    if (newReminderAssignedTo.length === 0) {
      Alert.alert('Fout', 'Selecteer minimaal één gezinslid');
      return;
    }

    addReminder({
      title: newReminderTitle.trim(),
      description: newReminderDescription.trim(),
      date: newReminderDate,
      time: newReminderTime,
      assignedTo: newReminderAssignedTo,
      completed: false,
      createdBy: currentUser?.id || '',
      photoUri: newReminderPhoto,
    });

    setNewReminderTitle('');
    setNewReminderDescription('');
    setNewReminderDate(new Date());
    setNewReminderTime('10:00');
    setNewReminderAssignedTo([]);
    setNewReminderPhoto(undefined);
    setShowAddModal(false);
    Alert.alert('Gelukt!', 'Herinnering toegevoegd');
  };

  const toggleReminderComplete = (reminderId: string, currentStatus: boolean) => {
    updateReminder(reminderId, { completed: !currentStatus });
  };

  const handleOrderPhotoBook = async () => {
    try {
      const isAvailable = await MailComposer.isAvailableAsync();
      
      if (!isAvailable) {
        Alert.alert(
          'E-mail niet beschikbaar',
          'Je apparaat ondersteunt geen e-mail. Stuur handmatig een e-mail naar info@flowfam.nl met het onderwerp "fotoboek bestellen".'
        );
        return;
      }

      const childReminders = reminders.filter(r => 
        r.photoUri && 
        (isParent ? true : r.assignedTo.includes(currentUser?.id || ''))
      );

      if (childReminders.length === 0) {
        Alert.alert('Geen foto&apos;s', 'Er zijn nog geen foto&apos;s toegevoegd aan herinneringen');
        return;
      }

      const sortedReminders = [...childReminders].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      let emailBody = `Beste Flow Fam,\n\nIk wil graag een fotoboek bestellen met de volgende informatie:\n\n`;
      emailBody += `Aantal foto's: ${sortedReminders.length}\n`;
      emailBody += `Maximaal toegestaan: 75 foto's\n\n`;
      emailBody += `FOTO OVERZICHT (op volgorde van datum):\n\n`;

      sortedReminders.forEach((reminder, index) => {
        emailBody += `${index + 1}. ${reminder.title}\n`;
        emailBody += `   Datum: ${new Date(reminder.date).toLocaleDateString('nl-NL')}\n`;
        if (reminder.description) {
          emailBody += `   Beschrijving: ${reminder.description}\n`;
        }
        emailBody += `   Foto: ${reminder.photoUri}\n\n`;
      });

      emailBody += `\nMet vriendelijke groet,\n${currentUser?.name || 'Flow Fam gebruiker'}`;

      await MailComposer.composeAsync({
        recipients: ['info@flowfam.nl'],
        subject: 'Fotoboek bestellen',
        body: emailBody,
        isHtml: false,
      });

    } catch (error) {
      console.error('Error composing email:', error);
      Alert.alert('Fout', 'Er ging iets mis bij het opstellen van de e-mail');
    }
  };

  const myReminders = isParent 
    ? reminders 
    : reminders.filter(r => r.assignedTo.includes(currentUser?.id || ''));
    
  const activeReminders = myReminders.filter(r => !r.completed);
  const completedReminders = myReminders.filter(r => r.completed);

  const photoCount = myReminders.filter(r => r.photoUri).length;
  const maxPhotos = 75;

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const monthNames = [
    'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
    'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'
  ];

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(
        <View key={`empty-${i}`} style={styles.calendarDay} />
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedYear, selectedMonth, day);
      const isSelected = 
        newReminderDate.getDate() === day &&
        newReminderDate.getMonth() === selectedMonth &&
        newReminderDate.getFullYear() === selectedYear;

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.calendarDay,
            styles.calendarDayActive,
            isSelected && styles.calendarDaySelected
          ]}
          onPress={() => {
            setNewReminderDate(date);
            setShowCalendarPicker(false);
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

  return (
    <View style={styles.container}>
      <ModuleHeader
        title="Fotoboek"
        subtitle="Bewaar jullie mooiste momenten"
      />

      <ScrollView contentContainerStyle={styles.contentContainer}>

        {isParent && (
          <View style={styles.photoBookCard}>
            <View style={styles.photoBookHeader}>
              <Text style={styles.photoBookTitle}>📸 Fotoboek</Text>
              <Text style={styles.photoBookCount}>
                {photoCount} / {maxPhotos} foto&apos;s
              </Text>
            </View>
            <Text style={styles.photoBookNote}>
              💡 Maximaal {maxPhotos} foto&apos;s per fotoboek
            </Text>
            {photoCount > 0 && (
              <TouchableOpacity
                style={[styles.orderButton, { backgroundColor: accentColor }]}
                onPress={handleOrderPhotoBook}
              >
                <IconSymbol
                  ios_icon_name="envelope"
                  android_material_icon_name="email"
                  size={20}
                  color={colors.card}
                />
                <Text style={styles.orderButtonText}>Bestel Fotoboek</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <ThemedButton
          title="Herinnering toevoegen"
          onPress={() => setShowAddModal(true)}
          icon="plus"
          androidIcon="add"
          style={styles.addButton}
        />

        {activeReminders.length === 0 && completedReminders.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>🔔</Text>
            <Text style={styles.emptyStateText}>Nog geen herinneringen</Text>
            <Text style={styles.emptyStateSubtext}>Voeg je eerste herinnering toe!</Text>
          </View>
        ) : (
          <>
            {activeReminders.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Actief ({activeReminders.length})</Text>
                {activeReminders.map((reminder, index) => {
                  const members = familyMembers.filter(m => reminder.assignedTo.includes(m.id));
                  return (
                    <React.Fragment key={index}>
                      <View style={styles.reminderCard}>
                        <TouchableOpacity
                          style={styles.checkbox}
                          onPress={() => toggleReminderComplete(reminder.id, reminder.completed)}
                        >
                          <View style={styles.checkboxInner}>
                            {reminder.completed && (
                              <IconSymbol
                                ios_icon_name="checkmark"
                                android_material_icon_name="check"
                                size={16}
                                color={colors.card}
                              />
                            )}
                          </View>
                        </TouchableOpacity>

                        <View style={styles.reminderInfo}>
                          {reminder.photoUri && (
                            <Image source={{ uri: reminder.photoUri }} style={styles.reminderPhoto} />
                          )}
                          <Text style={styles.reminderTitle}>{reminder.title}</Text>
                          {reminder.description && (
                            <Text style={styles.reminderDescription}>{reminder.description}</Text>
                          )}
                          <Text style={styles.reminderMeta}>
                            📅 {new Date(reminder.date).toLocaleDateString('nl-NL')} om {reminder.time}
                          </Text>
                          <View style={styles.membersRow}>
                            <Text style={styles.reminderMeta}>👥 </Text>
                            {members.map((member, mIndex) => (
                              <React.Fragment key={mIndex}>
                                <View style={[styles.memberBadge, { backgroundColor: member.color }]}>
                                  {member.photoUri ? (
                                    <Image source={{ uri: member.photoUri }} style={styles.memberBadgePhoto} />
                                  ) : (
                                    <Text style={styles.memberBadgeText}>{member.name.charAt(0)}</Text>
                                  )}
                                </View>
                              </React.Fragment>
                            ))}
                          </View>
                        </View>

                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => {
                            Alert.alert(
                              'Verwijderen?',
                              `Weet je zeker dat je "${reminder.title}" wilt verwijderen?`,
                              [
                                { text: 'Annuleren', style: 'cancel' },
                                { text: 'Verwijderen', onPress: () => deleteReminder(reminder.id), style: 'destructive' },
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
                })}
              </View>
            )}

            {completedReminders.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Voltooid ({completedReminders.length})</Text>
                {completedReminders.map((reminder, index) => {
                  const members = familyMembers.filter(m => reminder.assignedTo.includes(m.id));
                  return (
                    <React.Fragment key={index}>
                      <View style={[styles.reminderCard, styles.reminderCardCompleted]}>
                        <TouchableOpacity
                          style={styles.checkbox}
                          onPress={() => toggleReminderComplete(reminder.id, reminder.completed)}
                        >
                          <View style={[styles.checkboxInner, styles.checkboxChecked]}>
                            <IconSymbol
                              ios_icon_name="checkmark"
                              android_material_icon_name="check"
                              size={16}
                              color={colors.card}
                            />
                          </View>
                        </TouchableOpacity>

                        <View style={styles.reminderInfo}>
                          {reminder.photoUri && (
                            <Image source={{ uri: reminder.photoUri }} style={styles.reminderPhoto} />
                          )}
                          <Text style={[styles.reminderTitle, styles.reminderTitleCompleted]}>{reminder.title}</Text>
                          {reminder.description && (
                            <Text style={styles.reminderDescription}>{reminder.description}</Text>
                          )}
                          <Text style={styles.reminderMeta}>
                            📅 {new Date(reminder.date).toLocaleDateString('nl-NL')} om {reminder.time}
                          </Text>
                        </View>

                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => deleteReminder(reminder.id)}
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
                })}
              </View>
            )}
          </>
        )}
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
              <Text style={styles.modalTitle}>Nieuwe herinnering</Text>

              <TextInput
                style={styles.input}
                placeholder="Titel"
                placeholderTextColor={colors.textSecondary}
                value={newReminderTitle}
                onChangeText={setNewReminderTitle}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Beschrijving (optioneel)"
                placeholderTextColor={colors.textSecondary}
                value={newReminderDescription}
                onChangeText={setNewReminderDescription}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              <TouchableOpacity style={styles.photoButton} onPress={handlePickPhoto}>
                {newReminderPhoto ? (
                  <Image source={{ uri: newReminderPhoto }} style={styles.photoPreview} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <IconSymbol
                      ios_icon_name="camera"
                      android_material_icon_name="camera-alt"
                      size={32}
                      color={colors.textSecondary}
                    />
                    <Text style={styles.photoPlaceholderText}>Foto toevoegen (optioneel)</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => {
                  setSelectedMonth(newReminderDate.getMonth());
                  setSelectedYear(newReminderDate.getFullYear());
                  setShowCalendarPicker(true);
                }}
              >
                <Text style={styles.dateButtonText}>
                  📅 {newReminderDate.toLocaleDateString('nl-NL')}
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
                placeholder="Tijd (bijv. 10:00)"
                placeholderTextColor={colors.textSecondary}
                value={newReminderTime}
                onChangeText={setNewReminderTime}
              />

              <Text style={styles.inputLabel}>Voor wie: (meerdere mogelijk)</Text>
              <View style={styles.memberSelector}>
                {familyMembers.map((member, index) => (
                  <React.Fragment key={index}>
                    <TouchableOpacity
                      style={[
                        styles.memberOption,
                        newReminderAssignedTo.includes(member.id) && styles.memberOptionActive,
                      ]}
                      onPress={() => toggleMemberSelection(member.id)}
                    >
                      <View style={[styles.memberAvatar, { backgroundColor: member.color || colors.accent }]}>
                        {member.photoUri ? (
                          <Image source={{ uri: member.photoUri }} style={styles.memberAvatarPhoto} />
                        ) : (
                          <Text style={styles.memberAvatarText}>{member.name.charAt(0)}</Text>
                        )}
                      </View>
                      <Text style={styles.memberName}>{member.name}</Text>
                      {newReminderAssignedTo.includes(member.id) && (
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

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => {
                    setShowAddModal(false);
                    setNewReminderTitle('');
                    setNewReminderDescription('');
                    setNewReminderDate(new Date());
                    setNewReminderTime('10:00');
                    setNewReminderAssignedTo([]);
                    setNewReminderPhoto(undefined);
                  }}
                >
                  <Text style={styles.modalButtonText}>Annuleren</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonConfirm, { backgroundColor: accentColor }]}
                  onPress={handleAddReminder}
                >
                  <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>Toevoegen</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <Modal
        visible={showCalendarPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCalendarPicker(false)}
      >
        <TouchableOpacity 
          style={styles.calendarOverlay}
          activeOpacity={1}
          onPress={() => setShowCalendarPicker(false)}
        >
          <View style={styles.calendarModal} onStartShouldSetResponder={() => true}>
            <View style={styles.calendarHeader}>
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
              onPress={() => setShowCalendarPicker(false)}
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
    paddingHorizontal: 20,
    paddingBottom: 140,
  },
  photoBookCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  photoBookHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  photoBookTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Poppins_700Bold',
  },
  photoBookCount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
    fontFamily: 'Poppins_600SemiBold',
  },
  photoBookNote: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 15,
    fontFamily: 'Nunito_400Regular',
  },
  orderButton: {
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.card,
    marginLeft: 10,
    fontFamily: 'Poppins_600SemiBold',
  },
  addButton: {
    marginBottom: 20,
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
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 5,
    fontFamily: 'Poppins_700Bold',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 15,
    fontFamily: 'Poppins_600SemiBold',
  },
  reminderCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  reminderCardCompleted: {
    opacity: 0.6,
  },
  checkbox: {
    marginRight: 15,
  },
  checkboxInner: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
  },
  reminderInfo: {
    flex: 1,
  },
  reminderPhoto: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    fontFamily: 'Poppins_600SemiBold',
  },
  reminderTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  reminderDescription: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
    fontFamily: 'Nunito_400Regular',
  },
  reminderMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
    fontFamily: 'Nunito_400Regular',
  },
  membersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  memberBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
    overflow: 'hidden',
  },
  memberBadgePhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
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
  textArea: {
    minHeight: 80,
  },
  photoButton: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  photoPreview: {
    width: '100%',
    height: 200,
    borderRadius: 15,
  },
  photoPlaceholder: {
    width: '100%',
    height: 150,
    backgroundColor: colors.background,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.secondary,
    borderStyle: 'dashed',
  },
  photoPlaceholderText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 10,
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
    overflow: 'hidden',
  },
  memberAvatarPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
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
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarNavButton: {
    padding: 8,
  },
  arrowIconSmall: {
    width: 20,
    height: 20,
    tintColor: colors.text,
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

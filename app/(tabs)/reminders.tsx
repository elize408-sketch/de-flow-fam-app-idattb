
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useFamily } from '@/contexts/FamilyContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';

export default function RemindersScreen() {
  const router = useRouter();
  const { reminders, addReminder, updateReminder, deleteReminder, currentUser, familyMembers } = useFamily();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReminderTitle, setNewReminderTitle] = useState('');
  const [newReminderDescription, setNewReminderDescription] = useState('');
  const [newReminderDate, setNewReminderDate] = useState(new Date());
  const [newReminderTime, setNewReminderTime] = useState('10:00');
  const [newReminderAssignedTo, setNewReminderAssignedTo] = useState<string[]>([]);
  const [newReminderPhoto, setNewReminderPhoto] = useState<string | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const isParent = currentUser?.role === 'parent';

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

  // Filter reminders based on user role
  // Parents see ALL reminders from all family members
  // Children see only their own reminders
  const myReminders = isParent 
    ? reminders 
    : reminders.filter(r => r.assignedTo.includes(currentUser?.id || ''));
    
  const activeReminders = myReminders.filter(r => !r.completed);
  const completedReminders = myReminders.filter(r => r.completed);

  const photoCount = reminders.filter(r => r.photoUri).length;
  const maxPhotos = 75;

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
            <Text style={styles.title}>🔔 Herinneringen</Text>
            <Text style={styles.subtitle}>
              {isParent ? 'Alle gezinsherinneringen' : 'Vergeet niets meer'}
            </Text>
          </View>
          
          <View style={styles.placeholder} />
        </View>

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
                style={styles.orderButton}
                onPress={() => {
                  Alert.alert(
                    'Fotoboek bestellen',
                    'Je wordt doorgestuurd naar de Flow Fam webshop om je fotoboek te bestellen.',
                    [
                      { text: 'Annuleren', style: 'cancel' },
                      { 
                        text: 'Naar webshop', 
                        onPress: () => {
                          // In a real app, this would open the webshop
                          Alert.alert('Info', 'Webshop: www.flowfam.nl');
                        }
                      },
                    ]
                  );
                }}
              >
                <IconSymbol
                  ios_icon_name="cart"
                  android_material_icon_name="shopping-cart"
                  size={20}
                  color={colors.card}
                />
                <Text style={styles.orderButtonText}>Bestel Fotoboek</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

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
          <Text style={styles.addButtonText}>Herinnering toevoegen</Text>
        </TouchableOpacity>

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

      {/* Add Reminder Modal */}
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
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  📅 {newReminderDate.toLocaleDateString('nl-NL')}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={newReminderDate}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      setNewReminderDate(selectedDate);
                    }
                  }}
                />
              )}

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
                  style={[styles.modalButton, styles.modalButtonConfirm]}
                  onPress={handleAddReminder}
                >
                  <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>Toevoegen</Text>
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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 140,
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
    backgroundColor: colors.vibrantOrange,
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
    backgroundColor: colors.vibrantPurple,
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
    borderColor: colors.vibrantPurple,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.vibrantPurple,
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
    backgroundColor: colors.vibrantPurple,
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

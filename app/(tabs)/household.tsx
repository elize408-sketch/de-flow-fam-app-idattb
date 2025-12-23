
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useFamily } from '@/contexts/FamilyContext';
import IconPicker from '@/components/IconPicker';

export default function HouseholdScreen() {
  const { householdTasks, familyMembers, addHouseholdTask, updateHouseholdTask, deleteHouseholdTask } = useFamily();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState('');
  const [newTaskRepeat, setNewTaskRepeat] = useState<'daily' | 'weekly' | 'monthly' | 'none'>('weekly');
  const [newTaskIcon, setNewTaskIcon] = useState('home');

  const handleAddTask = () => {
    if (!newTaskName.trim()) {
      Alert.alert('Fout', 'Vul een taaknaam in');
      return;
    }

    if (!newTaskAssignedTo) {
      Alert.alert('Fout', 'Selecteer een gezinslid');
      return;
    }

    addHouseholdTask({
      name: newTaskName.trim(),
      assignedTo: newTaskAssignedTo,
      completed: false,
      repeatType: newTaskRepeat,
      icon: newTaskIcon,
    });

    setNewTaskName('');
    setNewTaskAssignedTo('');
    setNewTaskRepeat('weekly');
    setNewTaskIcon('home');
    setShowAddModal(false);
    Alert.alert('Gelukt!', 'Huishoudelijke taak toegevoegd');
  };

  const toggleTaskCompletion = (taskId: string, currentStatus: boolean) => {
    updateHouseholdTask(taskId, { completed: !currentStatus });
  };

  const groupedTasks = familyMembers.map(member => ({
    member,
    tasks: householdTasks.filter(t => t.assignedTo === member.id),
  }));

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Huishouden</Text>
            <Text style={styles.subtitle}>Overzicht van alle huishoudelijke taken</Text>
          </View>
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
          <Text style={styles.addButtonText}>Taak toevoegen</Text>
        </TouchableOpacity>

        {householdTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>🏠</Text>
            <Text style={styles.emptyStateText}>Nog geen huishoudelijke taken</Text>
            <Text style={styles.emptyStateSubtext}>Voeg je eerste taak toe!</Text>
          </View>
        ) : (
          groupedTasks.map((group, groupIndex) => {
            if (group.tasks.length === 0) return null;
            return (
              <React.Fragment key={groupIndex}>
                <View style={styles.memberSection}>
                  <View style={styles.memberHeader}>
                    <View style={[styles.memberAvatar, { backgroundColor: group.member.color || colors.accent }]}>
                      <Text style={styles.memberAvatarText}>{group.member.name.charAt(0)}</Text>
                    </View>
                    <Text style={styles.memberName}>{group.member.name}</Text>
                  </View>

                  {group.tasks.map((task, taskIndex) => (
                    <React.Fragment key={taskIndex}>
                      <View style={[styles.taskCard, task.completed && styles.taskCardCompleted]}>
                        <TouchableOpacity
                          style={styles.checkbox}
                          onPress={() => toggleTaskCompletion(task.id, task.completed)}
                        >
                          <View style={[styles.checkboxInner, task.completed && styles.checkboxChecked]}>
                            {task.completed && (
                              <IconSymbol
                                ios_icon_name="checkmark"
                                android_material_icon_name="check"
                                size={16}
                                color={colors.card}
                              />
                            )}
                          </View>
                        </TouchableOpacity>

                        {task.icon && (
                          <View style={styles.taskIconContainer}>
                            <IconSymbol
                              ios_icon_name={task.icon}
                              android_material_icon_name={task.icon as any}
                              size={24}
                              color={colors.accent}
                            />
                          </View>
                        )}

                        <View style={styles.taskInfo}>
                          <Text style={[styles.taskName, task.completed && styles.taskNameCompleted]}>
                            {task.name}
                          </Text>
                          {task.repeatType && task.repeatType !== 'none' && (
                            <Text style={styles.taskMeta}>
                              🔄 {task.repeatType === 'daily' && 'Dagelijks'}
                              {task.repeatType === 'weekly' && 'Wekelijks'}
                              {task.repeatType === 'monthly' && 'Maandelijks'}
                            </Text>
                          )}
                        </View>

                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => {
                            Alert.alert(
                              'Verwijderen?',
                              `Weet je zeker dat je "${task.name}" wilt verwijderen?`,
                              [
                                { text: 'Annuleren', style: 'cancel' },
                                { text: 'Verwijderen', onPress: () => deleteHouseholdTask(task.id), style: 'destructive' },
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
                  ))}
                </View>
              </React.Fragment>
            );
          })
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
              <Text style={styles.modalTitle}>Nieuwe huishoudelijke taak</Text>

              <TextInput
                style={styles.input}
                placeholder="Taaknaam (bijv. Stofzuigen, Dweilen)"
                placeholderTextColor={colors.textSecondary}
                value={newTaskName}
                onChangeText={setNewTaskName}
              />

              <IconPicker
                selectedIcon={newTaskIcon}
                onSelectIcon={setNewTaskIcon}
                type="household"
                taskName={newTaskName}
              />

              <Text style={styles.inputLabel}>Toewijzen aan:</Text>
              <View style={styles.memberSelector}>
                {familyMembers.map((member, index) => (
                  <React.Fragment key={index}>
                    <TouchableOpacity
                      style={[
                        styles.memberOption,
                        newTaskAssignedTo === member.id && styles.memberOptionActive,
                      ]}
                      onPress={() => setNewTaskAssignedTo(member.id)}
                    >
                      <View style={[styles.memberOptionAvatar, { backgroundColor: member.color || colors.accent }]}>
                        <Text style={styles.memberOptionAvatarText}>{member.name.charAt(0)}</Text>
                      </View>
                      <Text style={styles.memberOptionName}>{member.name}</Text>
                    </TouchableOpacity>
                  </React.Fragment>
                ))}
              </View>

              <Text style={styles.inputLabel}>Herhaling:</Text>
              <View style={styles.repeatSelector}>
                {[
                  { value: 'daily', label: 'Dagelijks' },
                  { value: 'weekly', label: 'Wekelijks' },
                  { value: 'monthly', label: 'Maandelijks' },
                  { value: 'none', label: 'Eenmalig' },
                ].map((option, index) => (
                  <React.Fragment key={index}>
                    <TouchableOpacity
                      style={[
                        styles.repeatOption,
                        newTaskRepeat === option.value && styles.repeatOptionActive,
                      ]}
                      onPress={() => setNewTaskRepeat(option.value as any)}
                    >
                      <Text
                        style={[
                          styles.repeatOptionText,
                          newTaskRepeat === option.value && styles.repeatOptionTextActive,
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
                    setNewTaskName('');
                    setNewTaskAssignedTo('');
                    setNewTaskRepeat('weekly');
                    setNewTaskIcon('home');
                  }}
                >
                  <Text style={styles.modalButtonText}>Annuleren</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonConfirm]}
                  onPress={handleAddTask}
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
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Poppins_700Bold',
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    fontFamily: 'Nunito_400Regular',
    textAlign: 'left',
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
  memberSection: {
    marginBottom: 30,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: colors.card,
    padding: 15,
    borderRadius: 20,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  memberAvatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.card,
    fontFamily: 'Poppins_700Bold',
  },
  memberName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
  },
  taskCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  taskCardCompleted: {
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
    borderColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.accent,
  },
  taskIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taskInfo: {
    flex: 1,
  },
  taskName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    fontFamily: 'Poppins_600SemiBold',
  },
  taskNameCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  taskMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
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
  memberOptionAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  memberOptionAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.card,
    fontFamily: 'Poppins_700Bold',
  },
  memberOptionName: {
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

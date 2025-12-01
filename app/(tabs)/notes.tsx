
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useFamily } from '@/contexts/FamilyContext';
import { useModuleTheme, ModuleName } from '@/contexts/ThemeContext';
import ModuleHeader from '@/components/ModuleHeader';
import ThemedButton from '@/components/ThemedButton';

export default function NotesScreen() {
  const router = useRouter();
  const { setModule, accentColor } = useModuleTheme();
  const { familyNotes, addFamilyNote, updateFamilyNote, deleteFamilyNote, currentUser, familyMembers } = useFamily();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [selectedViewers, setSelectedViewers] = useState<string[]>([]);

  // Set module theme on mount
  useEffect(() => {
    setModule('notes' as ModuleName);
  }, [setModule]);

  const handleAddNote = () => {
    if (!newNoteTitle.trim()) {
      Alert.alert('Fout', 'Vul een titel in');
      return;
    }

    if (selectedViewers.length === 0) {
      Alert.alert('Fout', 'Selecteer minimaal één gezinslid die deze notitie mag zien');
      return;
    }

    addFamilyNote({
      title: newNoteTitle.trim(),
      content: newNoteContent.trim(),
      createdBy: currentUser?.id || '',
      sharedWith: selectedViewers,
    });

    setNewNoteTitle('');
    setNewNoteContent('');
    setSelectedViewers([]);
    setShowAddModal(false);
    Alert.alert('Gelukt!', 'Notitie toegevoegd');
  };

  const handleEditNote = () => {
    if (!editingNote) return;

    if (!newNoteTitle.trim()) {
      Alert.alert('Fout', 'Vul een titel in');
      return;
    }

    if (selectedViewers.length === 0) {
      Alert.alert('Fout', 'Selecteer minimaal één gezinslid die deze notitie mag zien');
      return;
    }

    updateFamilyNote(editingNote.id, {
      title: newNoteTitle.trim(),
      content: newNoteContent.trim(),
      sharedWith: selectedViewers,
    });

    setNewNoteTitle('');
    setNewNoteContent('');
    setSelectedViewers([]);
    setEditingNote(null);
    setShowEditModal(false);
    Alert.alert('Gelukt!', 'Notitie bijgewerkt');
  };

  const openEditModal = (note: any) => {
    setEditingNote(note);
    setNewNoteTitle(note.title);
    setNewNoteContent(note.content);
    setSelectedViewers(note.sharedWith || []);
    setShowEditModal(true);
  };

  const handleDeleteNote = async (noteId: string, noteTitle: string) => {
    Alert.alert(
      'Verwijderen?',
      `Weet je zeker dat je "${noteTitle}" wilt verwijderen?`,
      [
        { text: 'Annuleren', style: 'cancel' },
        { 
          text: 'Verwijderen', 
          onPress: async () => {
            try {
              await deleteFamilyNote(noteId);
              Alert.alert('Verwijderd', 'Notitie is verwijderd');
            } catch (error) {
              console.error('Error deleting note:', error);
              Alert.alert('Fout', 'Kon notitie niet verwijderen');
            }
          }, 
          style: 'destructive' 
        },
      ]
    );
  };

  const toggleViewerSelection = (memberId: string) => {
    setSelectedViewers(prev => {
      if (prev.includes(memberId)) {
        return prev.filter(id => id !== memberId);
      } else {
        return [...prev, memberId];
      }
    });
  };

  // Filter notes that the current user can see
  const visibleNotes = familyNotes.filter(note => 
    note.createdBy === currentUser?.id || 
    (note.sharedWith && note.sharedWith.includes(currentUser?.id || ''))
  );

  return (
    <View style={styles.container}>
      <ModuleHeader
        title="Notities"
        subtitle="Deel belangrijke informatie"
      />

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <ThemedButton
          title="Notitie toevoegen"
          onPress={() => setShowAddModal(true)}
          icon="plus"
          androidIcon="add"
          style={styles.addButton}
        />

        {visibleNotes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>📝</Text>
            <Text style={styles.emptyStateText}>Nog geen notities</Text>
            <Text style={styles.emptyStateSubtext}>Voeg je eerste notitie toe!</Text>
          </View>
        ) : (
          visibleNotes.map((note, index) => {
            const creator = familyMembers.find(m => m.id === note.createdBy);
            const sharedWithMembers = familyMembers.filter(m => note.sharedWith?.includes(m.id));
            const canEdit = note.createdBy === currentUser?.id;
            
            return (
              <React.Fragment key={index}>
                <View style={styles.noteCard}>
                  <View style={styles.noteHeader}>
                    <Text style={styles.noteTitle}>{note.title}</Text>
                    {canEdit && (
                      <View style={styles.noteActions}>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => openEditModal(note)}
                        >
                          <IconSymbol
                            ios_icon_name="pencil"
                            android_material_icon_name="edit"
                            size={20}
                            color={accentColor}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleDeleteNote(note.id, note.title)}
                        >
                          <IconSymbol
                            ios_icon_name="trash"
                            android_material_icon_name="delete"
                            size={20}
                            color="#E74C3C"
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                  {note.content && (
                    <Text style={styles.noteContent}>{note.content}</Text>
                  )}
                  <View style={styles.noteMeta}>
                    <Text style={styles.noteMetaText}>
                      Door {creator?.name || 'Onbekend'} • {new Date(note.createdAt).toLocaleDateString('nl-NL')}
                    </Text>
                    {sharedWithMembers.length > 0 && (
                      <View style={styles.sharedWithContainer}>
                        <Text style={styles.sharedWithLabel}>👥 Gedeeld met: </Text>
                        <View style={styles.sharedWithAvatars}>
                          {sharedWithMembers.map((member, mIndex) => (
                            <React.Fragment key={mIndex}>
                              <View style={[styles.sharedAvatar, { backgroundColor: member.color }]}>
                                {member.photoUri ? (
                                  <Image source={{ uri: member.photoUri }} style={styles.sharedAvatarPhoto} />
                                ) : (
                                  <Text style={styles.sharedAvatarText}>{member.name.charAt(0)}</Text>
                                )}
                              </View>
                            </React.Fragment>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              </React.Fragment>
            );
          })
        )}
      </ScrollView>

      {/* Add Note Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Nieuwe notitie</Text>

              <TextInput
                style={styles.input}
                placeholder="Titel"
                placeholderTextColor={colors.textSecondary}
                value={newNoteTitle}
                onChangeText={setNewNoteTitle}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Inhoud (optioneel)"
                placeholderTextColor={colors.textSecondary}
                value={newNoteContent}
                onChangeText={setNewNoteContent}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <Text style={styles.inputLabel}>Wie mag deze notitie zien?</Text>
              <View style={styles.memberSelector}>
                {familyMembers.map((member, index) => (
                  <React.Fragment key={index}>
                    <TouchableOpacity
                      style={[
                        styles.memberOption,
                        selectedViewers.includes(member.id) && styles.memberOptionActive,
                      ]}
                      onPress={() => toggleViewerSelection(member.id)}
                    >
                      <View style={[styles.memberAvatar, { backgroundColor: member.color || colors.accent }]}>
                        {member.photoUri ? (
                          <Image source={{ uri: member.photoUri }} style={styles.memberAvatarPhoto} />
                        ) : (
                          <Text style={styles.memberAvatarText}>{member.name.charAt(0)}</Text>
                        )}
                      </View>
                      <Text style={styles.memberName}>{member.name}</Text>
                      {selectedViewers.includes(member.id) && (
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
                    setNewNoteTitle('');
                    setNewNoteContent('');
                    setSelectedViewers([]);
                  }}
                >
                  <Text style={styles.modalButtonText}>Annuleren</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonConfirm, { backgroundColor: accentColor }]}
                  onPress={handleAddNote}
                >
                  <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>Toevoegen</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Edit Note Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Notitie bewerken</Text>

              <TextInput
                style={styles.input}
                placeholder="Titel"
                placeholderTextColor={colors.textSecondary}
                value={newNoteTitle}
                onChangeText={setNewNoteTitle}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Inhoud (optioneel)"
                placeholderTextColor={colors.textSecondary}
                value={newNoteContent}
                onChangeText={setNewNoteContent}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <Text style={styles.inputLabel}>Wie mag deze notitie zien?</Text>
              <View style={styles.memberSelector}>
                {familyMembers.map((member, index) => (
                  <React.Fragment key={index}>
                    <TouchableOpacity
                      style={[
                        styles.memberOption,
                        selectedViewers.includes(member.id) && styles.memberOptionActive,
                      ]}
                      onPress={() => toggleViewerSelection(member.id)}
                    >
                      <View style={[styles.memberAvatar, { backgroundColor: member.color || colors.accent }]}>
                        {member.photoUri ? (
                          <Image source={{ uri: member.photoUri }} style={styles.memberAvatarPhoto} />
                        ) : (
                          <Text style={styles.memberAvatarText}>{member.name.charAt(0)}</Text>
                        )}
                      </View>
                      <Text style={styles.memberName}>{member.name}</Text>
                      {selectedViewers.includes(member.id) && (
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
                    setShowEditModal(false);
                    setEditingNote(null);
                    setNewNoteTitle('');
                    setNewNoteContent('');
                    setSelectedViewers([]);
                  }}
                >
                  <Text style={styles.modalButtonText}>Annuleren</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonConfirm, { backgroundColor: accentColor }]}
                  onPress={handleEditNote}
                >
                  <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>Opslaan</Text>
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
  noteCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  noteTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Poppins_700Bold',
    marginRight: 10,
  },
  noteActions: {
    flexDirection: 'row',
    gap: 5,
  },
  actionButton: {
    padding: 5,
  },
  noteContent: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 10,
    fontFamily: 'Nunito_400Regular',
  },
  noteMeta: {
    borderTopWidth: 1,
    borderTopColor: colors.background,
    paddingTop: 10,
  },
  noteMetaText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
    marginBottom: 8,
  },
  sharedWithContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  sharedWithLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  sharedWithAvatars: {
    flexDirection: 'row',
    gap: 4,
  },
  sharedAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  sharedAvatarPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  sharedAvatarText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.card,
    fontFamily: 'Poppins_700Bold',
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
    minHeight: 100,
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
});

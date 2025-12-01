
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, Image, Linking } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useFamily } from '@/contexts/FamilyContext';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as MailComposer from 'expo-mail-composer';
import { Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType, HeadingLevel } from 'docx';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import { useModuleTheme, ModuleName } from '@/contexts/ThemeContext';
import ModuleHeader from '@/components/ModuleHeader';
import ThemedButton from '@/components/ThemedButton';

export default function MemoriesScreen() {
  const { setModule, accentColor } = useModuleTheme();
  const { memories, addMemory, deleteMemory, familyMembers } = useFamily();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPhoto, setNewPhoto] = useState<string | undefined>(undefined);
  const [newDate, setNewDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newAssignedTo, setNewAssignedTo] = useState<string>('');
  const [selectedMemory, setSelectedMemory] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPhotoBookModal, setShowPhotoBookModal] = useState(false);
  const [selectedMemberForPhotoBook, setSelectedMemberForPhotoBook] = useState<string>('');

  // Set module theme on mount
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
      setNewPhoto(result.assets[0].uri);
    }
  };

  const handleAddMemory = () => {
    if (!newTitle.trim()) {
      Alert.alert('Fout', 'Vul een titel in');
      return;
    }

    if (!newPhoto) {
      Alert.alert('Fout', 'Voeg een foto toe');
      return;
    }

    addMemory({
      title: newTitle.trim(),
      description: newDescription.trim(),
      photos: [newPhoto],
      date: newDate,
      createdBy: newAssignedTo || '',
    });

    setNewTitle('');
    setNewDescription('');
    setNewPhoto(undefined);
    setNewDate(new Date());
    setNewAssignedTo('');
    setShowAddModal(false);
    Alert.alert('Gelukt!', 'Herinnering toegevoegd');
  };

  const handleOrderPhotoBook = async () => {
    if (!selectedMemberForPhotoBook) {
      Alert.alert('Fout', 'Selecteer een gezinslid voor het fotoboek');
      return;
    }

    const memberMemories = memories.filter(m => m.createdBy === selectedMemberForPhotoBook);
    
    if (memberMemories.length === 0) {
      Alert.alert('Geen herinneringen', 'Er zijn nog geen herinneringen voor dit gezinslid');
      return;
    }

    if (memberMemories.length > 75) {
      Alert.alert('Te veel foto&apos;s', `Je hebt ${memberMemories.length} foto's, maar het maximum is 75 foto's per fotoboek`);
      return;
    }

    const member = familyMembers.find(m => m.id === selectedMemberForPhotoBook);
    const memberName = member?.name || 'Onbekend';

    try {
      // Create document sections
      const docSections = [];

      // Title
      docSections.push(
        new Paragraph({
          text: `Fotoboek van ${memberName}`,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        })
      );

      // Add each memory
      for (let i = 0; i < memberMemories.length; i++) {
        const memory = memberMemories[i];
        const date = new Date(memory.date).toLocaleDateString('nl-NL', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        // Memory title
        docSections.push(
          new Paragraph({
            text: `${i + 1}. ${memory.title}`,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 },
          })
        );

        // Date
        docSections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Datum: ${date}`,
                italics: true,
              }),
            ],
            spacing: { after: 200 },
          })
        );

        // Description
        if (memory.description) {
          docSections.push(
            new Paragraph({
              text: memory.description,
              spacing: { after: 200 },
            })
          );
        }

        // Add photos
        if (memory.photos && memory.photos.length > 0) {
          for (const photoUri of memory.photos) {
            try {
              // Read image as base64
              const base64 = await FileSystem.readAsStringAsync(photoUri, {
                encoding: FileSystem.EncodingType.Base64,
              });

              docSections.push(
                new Paragraph({
                  children: [
                    new ImageRun({
                      data: Uint8Array.from(atob(base64), c => c.charCodeAt(0)),
                      transformation: {
                        width: 400,
                        height: 300,
                      },
                    }),
                  ],
                  spacing: { after: 300 },
                })
              );
            } catch (error) {
              console.error('Error adding photo to document:', error);
            }
          }
        }

        // Separator
        docSections.push(
          new Paragraph({
            text: '-------------------',
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
          })
        );
      }

      // Create document
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: docSections,
          },
        ],
      });

      // Generate document
      const buffer = await Packer.toBlob(doc);
      
      // Save to file system
      const fileName = `Fotoboek_${memberName}_${Date.now()}.docx`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(buffer);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        const base64 = base64data.split(',')[1];
        
        await FileSystem.writeAsStringAsync(fileUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Check if mail composer is available
        const isAvailable = await MailComposer.isAvailableAsync();
        
        if (isAvailable) {
          // Send via mail composer
          await MailComposer.composeAsync({
            recipients: ['info@flowfam.nl'],
            subject: `Fotoboek Bestelling - Fotoboek van ${memberName}`,
            body: `Beste Flow Fam team,\n\nHierbij stuur ik mijn fotoboek bestelling.\n\nTitel: Fotoboek van ${memberName}\nAantal herinneringen: ${memberMemories.length}\n\nMet vriendelijke groet,\nEen Flow Fam gebruiker`,
            attachments: [fileUri],
          });

          setShowPhotoBookModal(false);
          setSelectedMemberForPhotoBook('');
          Alert.alert('Je fotoboek is verstuurd! We gaan het voor je maken 💛');
        } else {
          // Fallback: share the file
          await Sharing.shareAsync(fileUri, {
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            dialogTitle: 'Deel je fotoboek',
          });

          setShowPhotoBookModal(false);
          setSelectedMemberForPhotoBook('');
          Alert.alert(
            'Fotoboek gegenereerd',
            'Je fotoboek is gegenereerd. Stuur het bestand naar info@flowfam.nl om je bestelling te plaatsen.',
            [{ text: 'OK' }]
          );
        }
      };
    } catch (error) {
      console.error('Error creating photobook:', error);
      Alert.alert('Fout', 'Er ging iets mis bij het maken van het fotoboek. Probeer het later opnieuw.');
    }
  };

  const memoriesByYear = memories.reduce((acc: any, memory) => {
    const year = new Date(memory.date).getFullYear();
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(memory);
    return acc;
  }, {});

  const years = Object.keys(memoriesByYear).sort((a, b) => parseInt(b) - parseInt(a));

  return (
    <View style={styles.container}>
      <ModuleHeader
        title="Fotoboek"
        subtitle="Alle gezinsherinneringen"
      />

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: accentColor, flex: 2 }]}
            onPress={() => setShowAddModal(true)}
          >
            <IconSymbol
              ios_icon_name="plus"
              android_material_icon_name="add"
              size={24}
              color={colors.card}
            />
            <Text style={styles.actionButtonText}>Herinnering toevoegen</Text>
          </TouchableOpacity>

          {memories.length > 0 && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.highlight }]}
              onPress={() => setShowPhotoBookModal(true)}
            >
              <IconSymbol
                ios_icon_name="book"
                android_material_icon_name="menu-book"
                size={24}
                color={colors.card}
              />
              <Text style={styles.actionButtonText}>Bestel fotoboek</Text>
            </TouchableOpacity>
          )}
        </View>

        {memories.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>📸</Text>
            <Text style={styles.emptyStateText}>Nog geen herinneringen</Text>
            <Text style={styles.emptyStateSubtext}>
              Begin met het vastleggen van jullie mooie momenten!
            </Text>
          </View>
        ) : (
          years.map((year, yearIndex) => (
            <React.Fragment key={yearIndex}>
              <View style={styles.yearSection}>
                <Text style={styles.yearTitle}>{year}</Text>
                <View style={styles.memoriesGrid}>
                  {memoriesByYear[year].map((memory: any, memoryIndex: number) => {
                    const assignedMember = memory.createdBy 
                      ? familyMembers.find(m => m.id === memory.createdBy)
                      : null;
                    
                    return (
                      <React.Fragment key={memoryIndex}>
                        <TouchableOpacity
                          style={styles.memoryCard}
                          onPress={() => {
                            setSelectedMemory(memory);
                            setShowDetailModal(true);
                          }}
                        >
                          <Image source={{ uri: memory.photos[0] }} style={styles.memoryImage} />
                          <View style={styles.memoryOverlay}>
                            {assignedMember && (
                              <View style={styles.memoryBadge}>
                                <Text style={styles.memoryBadgeText}>{assignedMember.name}</Text>
                              </View>
                            )}
                            <Text style={styles.memoryTitle} numberOfLines={2}>
                              {memory.title}
                            </Text>
                            <Text style={styles.memoryDate}>
                              {new Date(memory.date).toLocaleDateString('nl-NL', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      </React.Fragment>
                    );
                  })}
                </View>
              </View>
            </React.Fragment>
          ))
        )}
      </ScrollView>

      {/* Add Memory Modal */}
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
                    setNewTitle('');
                    setNewDescription('');
                    setNewPhoto(undefined);
                    setNewDate(new Date());
                    setNewAssignedTo('');
                  }}
                >
                  <Ionicons name="chevron-back" size={26} color="#333" />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Nieuwe herinnering</Text>
                <View style={styles.modalHeaderSpacer} />
              </View>

              <TextInput
                style={styles.input}
                placeholder="Titel"
                placeholderTextColor={colors.textSecondary}
                value={newTitle}
                onChangeText={setNewTitle}
              />

              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <IconSymbol
                  ios_icon_name="calendar"
                  android_material_icon_name="calendar-today"
                  size={20}
                  color={colors.text}
                />
                <Text style={styles.dateButtonText}>
                  {newDate.toLocaleDateString('nl-NL', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={newDate}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      setNewDate(selectedDate);
                    }
                  }}
                />
              )}

              <Text style={styles.inputLabel}>Toewijzen aan:</Text>
              <View style={styles.assignSelector}>
                <TouchableOpacity
                  style={[
                    styles.assignOption,
                    newAssignedTo === '' && styles.assignOptionActive,
                  ]}
                  onPress={() => setNewAssignedTo('')}
                >
                  <Text style={[
                    styles.assignOptionText,
                    newAssignedTo === '' && styles.assignOptionTextActive,
                  ]}>
                    👨‍👩‍👧‍👦 Gezin
                  </Text>
                </TouchableOpacity>
                {familyMembers.map((member, index) => (
                  <React.Fragment key={index}>
                    <TouchableOpacity
                      style={[
                        styles.assignOption,
                        newAssignedTo === member.id && styles.assignOptionActive,
                      ]}
                      onPress={() => setNewAssignedTo(member.id)}
                    >
                      <View style={[styles.assignAvatar, { backgroundColor: member.color || colors.accent }]}>
                        <Text style={styles.assignAvatarText}>{member.name.charAt(0)}</Text>
                      </View>
                      <Text style={[
                        styles.assignOptionText,
                        newAssignedTo === member.id && styles.assignOptionTextActive,
                      ]}>
                        {member.name}
                      </Text>
                    </TouchableOpacity>
                  </React.Fragment>
                ))}
              </View>

              <TouchableOpacity style={styles.photoButton} onPress={handlePickPhoto}>
                {newPhoto ? (
                  <Image source={{ uri: newPhoto }} style={styles.photoPreview} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <IconSymbol
                      ios_icon_name="camera"
                      android_material_icon_name="camera-alt"
                      size={32}
                      color={colors.textSecondary}
                    />
                    <Text style={styles.photoPlaceholderText}>Foto toevoegen</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Beschrijving (optioneel)"
                placeholderTextColor={colors.textSecondary}
                value={newDescription}
                onChangeText={setNewDescription}
                multiline
                numberOfLines={4}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => {
                    setShowAddModal(false);
                    setNewTitle('');
                    setNewDescription('');
                    setNewPhoto(undefined);
                    setNewDate(new Date());
                    setNewAssignedTo('');
                  }}
                >
                  <Text style={styles.modalButtonText}>Annuleren</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonConfirm, { backgroundColor: accentColor }]}
                  onPress={handleAddMemory}
                >
                  <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>Toevoegen</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Photo Book Order Modal */}
      <Modal
        visible={showPhotoBookModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPhotoBookModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  style={styles.modalBackButton}
                  onPress={() => {
                    setShowPhotoBookModal(false);
                    setSelectedMemberForPhotoBook('');
                  }}
                >
                  <Ionicons name="chevron-back" size={26} color="#333" />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Fotoboek bestellen</Text>
                <View style={styles.modalHeaderSpacer} />
              </View>

              <Text style={styles.modalSubtitle}>
                Selecteer voor wie het fotoboek is
              </Text>

              <View style={styles.memberSelector}>
                {familyMembers.map((member, index) => {
                  const memberMemories = memories.filter(m => m.createdBy === member.id);
                  return (
                    <React.Fragment key={index}>
                      <TouchableOpacity
                        style={[
                          styles.photoBookMemberOption,
                          selectedMemberForPhotoBook === member.id && styles.photoBookMemberOptionActive,
                        ]}
                        onPress={() => setSelectedMemberForPhotoBook(member.id)}
                      >
                        <View style={[styles.photoBookMemberAvatar, { backgroundColor: member.color || colors.accent }]}>
                          <Text style={styles.photoBookMemberAvatarText}>{member.name.charAt(0)}</Text>
                        </View>
                        <Text style={styles.photoBookMemberName}>{member.name}</Text>
                        <Text style={styles.photoBookMemberCount}>
                          {memberMemories.length} foto{memberMemories.length !== 1 ? '&apos;s' : ''}
                        </Text>
                      </TouchableOpacity>
                    </React.Fragment>
                  );
                })}
              </View>

              {selectedMemberForPhotoBook && (
                <View style={styles.orderSummary}>
                  <Text style={styles.orderSummaryText}>
                    📚 {memories.filter(m => m.createdBy === selectedMemberForPhotoBook).length} herinneringen
                  </Text>
                  <Text style={styles.orderSummaryNote}>
                    💡 Maximaal 75 foto&apos;s per fotoboek
                  </Text>
                </View>
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => {
                    setShowPhotoBookModal(false);
                    setSelectedMemberForPhotoBook('');
                  }}
                >
                  <Text style={styles.modalButtonText}>Annuleren</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonConfirm, { backgroundColor: accentColor }]}
                  onPress={handleOrderPhotoBook}
                  disabled={!selectedMemberForPhotoBook}
                >
                  <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>Bestellen</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Memory Detail Modal */}
      <Modal
        visible={showDetailModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.detailModalOverlay}>
          <TouchableOpacity
            style={styles.detailModalClose}
            onPress={() => setShowDetailModal(false)}
          >
            <IconSymbol
              ios_icon_name="xmark"
              android_material_icon_name="close"
              size={28}
              color={colors.card}
            />
          </TouchableOpacity>

          {selectedMemory && (
            <ScrollView contentContainerStyle={styles.detailModalContent}>
              <Image source={{ uri: selectedMemory.photos[0] }} style={styles.detailImage} />
              <View style={styles.detailInfo}>
                <Text style={styles.detailTitle}>{selectedMemory.title}</Text>
                <Text style={styles.detailDate}>
                  {new Date(selectedMemory.date).toLocaleDateString('nl-NL', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
                {selectedMemory.createdBy && (
                  <Text style={styles.detailAssigned}>
                    Voor: {familyMembers.find(m => m.id === selectedMemory.createdBy)?.name || 'Onbekend'}
                  </Text>
                )}
                {selectedMemory.description && (
                  <Text style={styles.detailDescription}>{selectedMemory.description}</Text>
                )}

                <TouchableOpacity
                  style={styles.deleteMemoryButton}
                  onPress={() => {
                    Alert.alert(
                      'Verwijderen?',
                      'Weet je zeker dat je deze herinnering wilt verwijderen?',
                      [
                        { text: 'Annuleren', style: 'cancel' },
                        {
                          text: 'Verwijderen',
                          onPress: () => {
                            deleteMemory(selectedMemory.id);
                            setShowDetailModal(false);
                          },
                          style: 'destructive',
                        },
                      ]
                    );
                  }}
                >
                  <IconSymbol
                    ios_icon_name="trash"
                    android_material_icon_name="delete"
                    size={20}
                    color={colors.card}
                  />
                  <Text style={styles.deleteMemoryButtonText}>Verwijderen</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
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
    paddingBottom: 120,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 30,
  },
  actionButton: {
    flex: 1,
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.card,
    marginLeft: 8,
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
    textAlign: 'center',
    fontFamily: 'Nunito_400Regular',
  },
  yearSection: {
    marginBottom: 30,
  },
  yearTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 15,
    fontFamily: 'Poppins_700Bold',
  },
  memoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  memoryCard: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: colors.card,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  memoryImage: {
    width: '100%',
    height: '100%',
  },
  memoryOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 10,
  },
  memoryBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  memoryBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.card,
    fontFamily: 'Poppins_600SemiBold',
  },
  memoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.card,
    marginBottom: 4,
    fontFamily: 'Poppins_600SemiBold',
  },
  memoryDate: {
    fontSize: 12,
    color: colors.card,
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
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Nunito_400Regular',
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
    textAlignVertical: 'top',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
    fontFamily: 'Poppins_600SemiBold',
  },
  dateButton: {
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  dateButtonText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 10,
    fontFamily: 'Nunito_400Regular',
  },
  assignSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 15,
  },
  assignOption: {
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: '45%',
  },
  assignOptionActive: {
    borderColor: colors.accent,
    backgroundColor: colors.primary,
  },
  assignAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  assignAvatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.card,
    fontFamily: 'Poppins_700Bold',
  },
  assignOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    fontFamily: 'Poppins_600SemiBold',
  },
  assignOptionTextActive: {
    color: colors.text,
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
    height: 200,
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
  memberSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  photoBookMemberOption: {
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    minWidth: '45%',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  photoBookMemberOptionActive: {
    borderColor: colors.accent,
    backgroundColor: colors.primary,
  },
  photoBookMemberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  photoBookMemberAvatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.card,
    fontFamily: 'Poppins_700Bold',
  },
  photoBookMemberName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 5,
    fontFamily: 'Poppins_600SemiBold',
  },
  photoBookMemberCount: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  orderSummary: {
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  orderSummaryText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 5,
    fontFamily: 'Nunito_400Regular',
  },
  orderSummaryNote: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 5,
    fontFamily: 'Nunito_400Regular',
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
  detailModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  detailModalClose: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailModalContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingTop: 100,
  },
  detailImage: {
    width: '100%',
    height: 400,
    resizeMode: 'contain',
  },
  detailInfo: {
    padding: 20,
  },
  detailTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.card,
    marginBottom: 10,
    fontFamily: 'Poppins_700Bold',
  },
  detailDate: {
    fontSize: 16,
    color: colors.secondary,
    marginBottom: 10,
    fontFamily: 'Nunito_400Regular',
  },
  detailAssigned: {
    fontSize: 14,
    color: colors.accent,
    marginBottom: 20,
    fontFamily: 'Nunito_400Regular',
  },
  detailDescription: {
    fontSize: 16,
    color: colors.card,
    lineHeight: 24,
    marginBottom: 30,
    fontFamily: 'Nunito_400Regular',
  },
  deleteMemoryButton: {
    backgroundColor: '#F44336',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteMemoryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.card,
    marginLeft: 10,
    fontFamily: 'Poppins_600SemiBold',
  },
});

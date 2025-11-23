
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, Image, Linking } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useFamily } from '@/contexts/FamilyContext';
import * as ImagePicker from 'expo-image-picker';

export default function MemoriesScreen() {
  const { memories, addMemory, deleteMemory } = useFamily();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPhoto, setNewPhoto] = useState<string | undefined>(undefined);
  const [selectedMemory, setSelectedMemory] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

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
      photoUri: newPhoto,
      date: new Date(),
      tags: [],
    });

    setNewTitle('');
    setNewDescription('');
    setNewPhoto(undefined);
    setShowAddModal(false);
    Alert.alert('Gelukt!', 'Herinnering toegevoegd');
  };

  const handleOrderPhotoBook = () => {
    Alert.alert(
      'Fotoboek bestellen',
      'Deze functie maakt automatisch een fotoboek van al je herinneringen. Wil je doorgaan naar de bestelservice?',
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Bestellen',
          onPress: () => {
            Alert.alert(
              'Fotoboek service',
              'In de volledige versie van de app wordt hier een link naar een fotoboek service zoals Polarsteps getoond. Voor nu kun je je herinneringen handmatig exporteren.',
              [{ text: 'OK' }]
            );
          },
        },
      ]
    );
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
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Herinneringen</Text>
          <Text style={styles.subtitle}>Jouw gezinsblog</Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.accent, flex: 2 }]}
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
              onPress={handleOrderPhotoBook}
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
                  {memoriesByYear[year].map((memory: any, memoryIndex: number) => (
                    <React.Fragment key={memoryIndex}>
                      <TouchableOpacity
                        style={styles.memoryCard}
                        onPress={() => {
                          setSelectedMemory(memory);
                          setShowDetailModal(true);
                        }}
                      >
                        <Image source={{ uri: memory.photoUri }} style={styles.memoryImage} />
                        <View style={styles.memoryOverlay}>
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
                  ))}
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
              <Text style={styles.modalTitle}>Nieuwe herinnering</Text>

              <TextInput
                style={styles.input}
                placeholder="Titel"
                placeholderTextColor={colors.textSecondary}
                value={newTitle}
                onChangeText={setNewTitle}
              />

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
                  }}
                >
                  <Text style={styles.modalButtonText}>Annuleren</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonConfirm]}
                  onPress={handleAddMemory}
                >
                  <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>Toevoegen</Text>
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
              <Image source={{ uri: selectedMemory.photoUri }} style={styles.detailImage} />
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
    textAlignVertical: 'top',
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


import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { Ionicons } from '@expo/vector-icons';
import { useFamily } from '@/contexts/FamilyContext';
import { useModuleTheme, ModuleName } from '@/contexts/ThemeContext';
import ModuleHeader from '@/components/ModuleHeader';
import ThemedButton from '@/components/ThemedButton';
import { supabase } from '@/utils/supabase';

interface Contact {
  id: string;
  family_id: string;
  created_by: string;
  name: string;
  category: string | null;
  phone: string | null;
  email: string | null;
  note: string | null;
  created_at: string;
}

const CATEGORY_OPTIONS = [
  { value: 'huisarts', label: '🏥 Huisarts', color: '#E74C3C' },
  { value: 'school', label: '🏫 School', color: '#3498DB' },
  { value: 'oppas', label: '👶 Oppas', color: '#9B59B6' },
  { value: 'familie', label: '👨‍👩‍👧‍👦 Familie', color: '#E67E22' },
  { value: 'werk', label: '💼 Werk', color: '#2ECC71' },
  { value: 'overig', label: '📌 Overig', color: '#95A5A6' },
];

export default function ContactbookScreen() {
  const router = useRouter();
  const { setModule, accentColor } = useModuleTheme();
  const { currentFamily, currentUser } = useFamily();
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');

  // Set module theme on mount
  useEffect(() => {
    setModule('contactbook' as ModuleName);
  }, [setModule]);

  // Load contacts from Supabase
  const loadContacts = useCallback(async () => {
    if (!currentFamily) {
      console.log('No current family, skipping contacts load');
      setLoading(false);
      return;
    }
    
    try {
      console.log('Loading contacts for family:', currentFamily.id);
      const { data, error } = await supabase
        .from('family_contacts')
        .select('*')
        .eq('family_id', currentFamily.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading contacts:', error);
        Alert.alert('Fout', 'Kon contacten niet laden');
        return;
      }

      if (data) {
        setContacts(data);
        console.log('Loaded contacts:', data.length);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
      Alert.alert('Fout', 'Er ging iets mis bij het laden van contacten');
    } finally {
      setLoading(false);
    }
  }, [currentFamily]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const resetForm = () => {
    setName('');
    setCategory(null);
    setPhone('');
    setEmail('');
    setNote('');
    setEditingContact(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleOpenEditModal = (contact: Contact) => {
    setEditingContact(contact);
    setName(contact.name);
    setCategory(contact.category);
    setPhone(contact.phone || '');
    setEmail(contact.email || '');
    setNote(contact.note || '');
    setShowAddModal(true);
  };

  const handleSaveContact = async () => {
    if (!name.trim()) {
      Alert.alert('Fout', 'Vul een naam in');
      return;
    }

    if (!currentFamily || !currentUser) {
      Alert.alert('Fout', 'Geen gezin of gebruiker gevonden');
      return;
    }

    try {
      if (editingContact) {
        // Update existing contact
        const { error } = await supabase
          .from('family_contacts')
          .update({
            name: name.trim(),
            category,
            phone: phone.trim() || null,
            email: email.trim() || null,
            note: note.trim() || null,
          })
          .eq('id', editingContact.id)
          .eq('family_id', currentFamily.id);

        if (error) {
          console.error('Error updating contact:', error);
          Alert.alert('Fout', `Kon contact niet bijwerken: ${error.message}`);
          return;
        }

        Alert.alert('Gelukt!', 'Contact bijgewerkt');
      } else {
        // Create new contact
        const { error } = await supabase
          .from('family_contacts')
          .insert([{
            family_id: currentFamily.id,
            created_by: currentUser.userId!,
            name: name.trim(),
            category,
            phone: phone.trim() || null,
            email: email.trim() || null,
            note: note.trim() || null,
          }]);

        if (error) {
          console.error('Error adding contact:', error);
          Alert.alert('Fout', `Kon contact niet toevoegen: ${error.message}`);
          return;
        }

        Alert.alert('Gelukt!', 'Contact toegevoegd');
      }

      setShowAddModal(false);
      resetForm();
      loadContacts();
    } catch (error: any) {
      console.error('Error saving contact:', error);
      Alert.alert('Fout', 'Er ging iets mis bij het opslaan van het contact');
    }
  };

  const handleDeleteContact = async (contact: Contact) => {
    Alert.alert(
      'Verwijderen?',
      `Weet je zeker dat je "${contact.name}" wilt verwijderen?`,
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Verwijderen',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('family_contacts')
                .delete()
                .eq('id', contact.id)
                .eq('family_id', currentFamily!.id);

              if (error) {
                console.error('Error deleting contact:', error);
                Alert.alert('Fout', `Kon contact niet verwijderen: ${error.message}`);
                return;
              }

              Alert.alert('Gelukt!', 'Contact verwijderd');
              loadContacts();
            } catch (error: any) {
              console.error('Error deleting contact:', error);
              Alert.alert('Fout', 'Er ging iets mis bij het verwijderen van het contact');
            }
          },
        },
      ]
    );
  };

  const getCategoryColor = (categoryValue: string | null) => {
    const cat = CATEGORY_OPTIONS.find(c => c.value === categoryValue);
    return cat?.color || colors.textSecondary;
  };

  const getCategoryLabel = (categoryValue: string | null) => {
    const cat = CATEGORY_OPTIONS.find(c => c.value === categoryValue);
    return cat?.label || '📌 Overig';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ModuleHeader
          title="Contactboek"
          subtitle="Belangrijke contacten"
          backgroundColor="#FFFFFF"
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Laden...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ModuleHeader
        title="Contactboek"
        subtitle="Belangrijke contacten"
        backgroundColor="#FFFFFF"
      />

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <ThemedButton
          title="Contact toevoegen"
          onPress={handleOpenAddModal}
          icon="plus"
          androidIcon="add"
          style={styles.addButton}
        />

        {contacts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>📇</Text>
            <Text style={styles.emptyStateText}>Nog geen contacten</Text>
            <Text style={styles.emptyStateSubtext}>Voeg het eerste contact toe!</Text>
          </View>
        ) : (
          <View style={styles.contactsList}>
            {contacts.map((contact, index) => (
              <React.Fragment key={index}>
                <View style={[styles.contactCard, { borderLeftColor: getCategoryColor(contact.category) }]}>
                  <View style={styles.contactHeader}>
                    <View style={styles.contactTitleRow}>
                      <Text style={styles.contactName}>{contact.name}</Text>
                      {contact.category && (
                        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(contact.category) + '20' }]}>
                          <Text style={[styles.categoryBadgeText, { color: getCategoryColor(contact.category) }]}>
                            {getCategoryLabel(contact.category)}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {contact.phone && (
                    <View style={styles.contactInfoRow}>
                      <Ionicons name="call-outline" size={18} color={colors.textSecondary} />
                      <Text style={styles.contactInfoText}>{contact.phone}</Text>
                    </View>
                  )}

                  {contact.email && (
                    <View style={styles.contactInfoRow}>
                      <Ionicons name="mail-outline" size={18} color={colors.textSecondary} />
                      <Text style={styles.contactInfoText}>{contact.email}</Text>
                    </View>
                  )}

                  {contact.note && (
                    <View style={styles.contactInfoRow}>
                      <Ionicons name="document-text-outline" size={18} color={colors.textSecondary} />
                      <Text style={styles.contactInfoText}>{contact.note}</Text>
                    </View>
                  )}

                  <View style={styles.contactActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.editButton]}
                      onPress={() => handleOpenEditModal(contact)}
                    >
                      <Ionicons name="pencil-outline" size={18} color="#fff" />
                      <Text style={styles.actionButtonText}>Bewerken</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDeleteContact(contact)}
                    >
                      <Ionicons name="trash-outline" size={18} color="#fff" />
                      <Text style={styles.actionButtonText}>Verwijderen</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </React.Fragment>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add/Edit Contact Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <TouchableOpacity 
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => {
              setShowAddModal(false);
              resetForm();
            }}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalBackButton}
                onPress={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
              >
                <Ionicons name="chevron-back" size={26} color="#333" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {editingContact ? 'Contact bewerken' : 'Nieuw contact'}
              </Text>
              <View style={styles.modalHeaderSpacer} />
            </View>

            <ScrollView 
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalScrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.inputLabel}>Naam *</Text>
              <TextInput
                style={styles.input}
                placeholder="Naam"
                placeholderTextColor={colors.textSecondary}
                value={name}
                onChangeText={setName}
                autoFocus={false}
              />

              <Text style={styles.inputLabel}>Categorie</Text>
              <View style={styles.categorySelector}>
                {CATEGORY_OPTIONS.map((cat, index) => (
                  <React.Fragment key={index}>
                    <TouchableOpacity
                      style={[
                        styles.categoryOption,
                        category === cat.value && [styles.categoryOptionActive, { backgroundColor: cat.color + '20', borderColor: cat.color }],
                      ]}
                      onPress={() => setCategory(cat.value)}
                    >
                      <Text style={[
                        styles.categoryOptionText,
                        category === cat.value && { color: cat.color }
                      ]}>
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  </React.Fragment>
                ))}
              </View>

              <Text style={styles.inputLabel}>Telefoonnummer</Text>
              <TextInput
                style={styles.input}
                placeholder="06 12345678"
                placeholderTextColor={colors.textSecondary}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />

              <Text style={styles.inputLabel}>E-mail</Text>
              <TextInput
                style={styles.input}
                placeholder="email@voorbeeld.nl"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Notitie</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Extra informatie..."
                placeholderTextColor={colors.textSecondary}
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={4}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                >
                  <Text style={styles.modalButtonText}>Annuleren</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonConfirm, { backgroundColor: accentColor }]}
                  onPress={handleSaveContact}
                >
                  <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>
                    {editingContact ? 'Bijwerken' : 'Toevoegen'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
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
    textAlign: 'center',
  },
  contactsList: {
    gap: 15,
  },
  contactCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    borderLeftWidth: 4,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  contactHeader: {
    marginBottom: 15,
  },
  contactTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
  },
  contactName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Poppins_700Bold',
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
  },
  contactInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  contactInfoText: {
    fontSize: 15,
    color: colors.text,
    fontFamily: 'Nunito_400Regular',
    flex: 1,
  },
  contactActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  editButton: {
    backgroundColor: '#3498DB',
  },
  deleteButton: {
    backgroundColor: '#E74C3C',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Poppins_600SemiBold',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
    boxShadow: `0px -4px 24px ${colors.shadow}`,
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
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
    flex: 1,
  },
  modalHeaderSpacer: {
    width: 40,
  },
  modalScrollView: {
    maxHeight: 600,
  },
  modalScrollContent: {
    paddingBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    fontFamily: 'Poppins_600SemiBold',
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
  categorySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  categoryOption: {
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryOptionActive: {
  },
  categoryOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    fontFamily: 'Poppins_600SemiBold',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
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

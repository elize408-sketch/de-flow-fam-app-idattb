
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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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
        Alert.alert(t('common.error'), t('contactbook.couldNotLoad'));
        return;
      }

      if (data) {
        setContacts(data);
        console.log('Loaded contacts:', data.length);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
      Alert.alert(t('common.error'), t('contactbook.errorLoading'));
    } finally {
      setLoading(false);
    }
  }, [currentFamily, t]);

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
      Alert.alert(t('common.error'), t('contactbook.fillName'));
      return;
    }

    if (!currentFamily || !currentUser) {
      Alert.alert(t('common.error'), t('contactbook.noFamilyOrUser'));
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
          Alert.alert(t('common.error'), `${t('contactbook.couldNotUpdate')}: ${error.message}`);
          return;
        }

        Alert.alert(t('common.success'), t('contactbook.contactUpdated'));
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
          Alert.alert(t('common.error'), `${t('contactbook.couldNotAdd')}: ${error.message}`);
          return;
        }

        Alert.alert(t('common.success'), t('contactbook.contactAdded'));
      }

      setShowAddModal(false);
      resetForm();
      loadContacts();
    } catch (error: any) {
      console.error('Error saving contact:', error);
      Alert.alert(t('common.error'), t('contactbook.errorSaving'));
    }
  };

  const handleDeleteContact = async (contact: Contact) => {
    Alert.alert(
      t('contactbook.deleteConfirm'),
      t('contactbook.deleteMessage', { name: contact.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
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
                Alert.alert(t('common.error'), `${t('contactbook.couldNotDelete')}: ${error.message}`);
                return;
              }

              Alert.alert(t('common.success'), t('contactbook.contactDeleted'));
              loadContacts();
            } catch (error: any) {
              console.error('Error deleting contact:', error);
              Alert.alert(t('common.error'), t('contactbook.errorDeleting'));
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
          title={t('contactbook.title')}
          subtitle={t('contactbook.subtitle')}
          backgroundColor="#FFFFFF"
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ModuleHeader
        title={t('contactbook.title')}
        subtitle={t('contactbook.subtitle')}
        backgroundColor="#FFFFFF"
      />

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <ThemedButton
          title={t('contactbook.addContact')}
          onPress={handleOpenAddModal}
          icon="plus"
          androidIcon="add"
          style={[styles.addButton, { backgroundColor: colors.warmOrange }]}
        />

        {contacts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>{t('contactbook.noContacts')}</Text>
            <Text style={styles.emptyStateSubtext}>{t('contactbook.addFirstContact')}</Text>
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
                      <Text style={styles.actionButtonText}>{t('common.edit')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDeleteContact(contact)}
                    >
                      <Ionicons name="trash-outline" size={18} color="#fff" />
                      <Text style={styles.actionButtonText}>{t('common.delete')}</Text>
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
                {editingContact ? t('contactbook.editContact') : t('contactbook.newContact')}
              </Text>
              <View style={styles.modalHeaderSpacer} />
            </View>

            <ScrollView 
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalScrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.inputLabel}>{t('contactbook.nameLabel')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('contactbook.namePlaceholder')}
                placeholderTextColor={colors.textSecondary}
                value={name}
                onChangeText={setName}
                autoFocus={false}
              />

              <Text style={styles.inputLabel}>{t('contactbook.categoryLabel')}</Text>
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

              <Text style={styles.inputLabel}>{t('contactbook.phoneLabel')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('contactbook.phonePlaceholder')}
                placeholderTextColor={colors.textSecondary}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />

              <Text style={styles.inputLabel}>{t('contactbook.emailLabel')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('contactbook.emailPlaceholder')}
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>{t('contactbook.noteLabel')}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={t('contactbook.notePlaceholder')}
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
                  <Text style={styles.modalButtonText}>{t('common.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonConfirm, { backgroundColor: colors.warmOrange }]}
                  onPress={handleSaveContact}
                >
                  <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>
                    {editingContact ? t('common.save') : t('common.add')}
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
    paddingTop: 20,
    paddingBottom: 140,
  },
  addButton: {
    marginBottom: 20,
  },
  emptyState: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
    minHeight: 300,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 16,
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


import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useFamily } from '@/contexts/FamilyContext';
import * as DocumentPicker from 'expo-document-picker';
import { supabase } from '@/utils/supabase';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

interface DocumentPermission {
  family_member_id: string;
  can_view: boolean;
  can_download: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

interface Document {
  id: string;
  title: string;
  description: string;
  file_path: string;
  file_type: string;
  file_size: number;
  upload_date: string;
  uploaded_by: string;
  document_permissions: DocumentPermission[];
}

export default function DocumentsScreen() {
  const router = useRouter();
  const { familyMembers, currentUser, currentFamily } = useFamily();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<{
    [key: string]: {
      can_view: boolean;
      can_download: boolean;
      can_edit: boolean;
      can_delete: boolean;
    };
  }>({});

  // Only show parents
  const parents = familyMembers.filter(m => m.role === 'parent');

  useEffect(() => {
    if (currentUser?.role === 'parent') {
      loadDocuments();
    }
  }, [currentUser]);

  const loadDocuments = async () => {
    if (!currentFamily) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          document_permissions (
            family_member_id,
            can_view,
            can_download,
            can_edit,
            can_delete
          )
        `)
        .eq('family_id', currentFamily.id)
        .order('upload_date', { ascending: false });

      if (error) {
        console.error('Load documents error:', error);
        setLoading(false);
        return;
      }

      setDocuments(data || []);
    } catch (error) {
      console.error('Load documents error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFile(file);
        setTitle(file.name.replace(/\.[^/.]+$/, '')); // Remove extension
        
        // Initialize permissions - all parents can view by default
        const initialPermissions: any = {};
        parents.forEach(parent => {
          initialPermissions[parent.id] = {
            can_view: true,
            can_download: false,
            can_edit: false,
            can_delete: false,
          };
        });
        setSelectedPermissions(initialPermissions);
        
        setUploadModalVisible(true);
      }
    } catch (error) {
      console.error('Pick document error:', error);
      Alert.alert('Fout', 'Kon document niet selecteren');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !title.trim() || !currentUser || !currentFamily) {
      Alert.alert('Fout', 'Vul alle velden in');
      return;
    }

    setUploading(true);
    try {
      // Read file as base64
      const base64 = await FileSystem.readAsStringAsync(selectedFile.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert base64 to ArrayBuffer
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);

      // Upload to Supabase Storage
      const fileName = `${currentUser.userId}/${Date.now()}_${selectedFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('family-documents')
        .upload(fileName, byteArray, {
          contentType: selectedFile.mimeType,
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        Alert.alert('Fout', 'Kon document niet uploaden: ' + uploadError.message);
        setUploading(false);
        return;
      }

      // Create document record
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .insert({
          family_id: currentFamily.id,
          uploaded_by: currentUser.userId,
          title: title.trim(),
          description: description.trim(),
          file_path: fileName,
          file_type: selectedFile.mimeType,
          file_size: selectedFile.size,
        })
        .select()
        .single();

      if (docError) {
        console.error('Create document error:', docError);
        Alert.alert('Fout', 'Kon document niet opslaan: ' + docError.message);
        setUploading(false);
        return;
      }

      // Create permissions
      const permissionsToInsert = Object.entries(selectedPermissions)
        .filter(([_, perms]) => perms.can_view) // Only insert permissions for members who can view
        .map(([memberId, perms]) => ({
          document_id: docData.id,
          family_member_id: memberId,
          ...perms,
        }));

      if (permissionsToInsert.length > 0) {
        const { error: permsError } = await supabase
          .from('document_permissions')
          .insert(permissionsToInsert);

        if (permsError) {
          console.error('Create permissions error:', permsError);
        }
      }

      setUploading(false);
      setUploadModalVisible(false);
      setSelectedFile(null);
      setTitle('');
      setDescription('');
      setSelectedPermissions({});
      
      Alert.alert('Gelukt!', 'Document is geüpload');
      loadDocuments();
    } catch (error: any) {
      console.error('Upload error:', error);
      Alert.alert('Fout', 'Er ging iets mis bij het uploaden: ' + error.message);
      setUploading(false);
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      // Check permission
      const myPermission = doc.document_permissions.find(
        p => p.family_member_id === currentUser?.id
      );
      if (!myPermission?.can_download && doc.uploaded_by !== currentUser?.userId) {
        Alert.alert('Geen toegang', 'Je hebt geen toestemming om dit document te downloaden');
        return;
      }

      // Download from Supabase Storage
      const { data, error } = await supabase.storage
        .from('family-documents')
        .download(doc.file_path);

      if (error) {
        console.error('Download error:', error);
        Alert.alert('Fout', 'Kon document niet downloaden: ' + error.message);
        return;
      }

      // Save to device
      const fileUri = `${FileSystem.documentDirectory}${doc.title}`;
      const reader = new FileReader();
      reader.readAsDataURL(data);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        const base64 = base64data.split(',')[1];
        
        await FileSystem.writeAsStringAsync(fileUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Share the file
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri);
        } else {
          Alert.alert('Gelukt', 'Document is gedownload');
        }
      };
    } catch (error: any) {
      console.error('Download error:', error);
      Alert.alert('Fout', 'Er ging iets mis bij het downloaden: ' + error.message);
    }
  };

  const handleDelete = async (doc: Document) => {
    // Check permission
    const myPermission = doc.document_permissions.find(
      p => p.family_member_id === currentUser?.id
    );
    if (!myPermission?.can_delete && doc.uploaded_by !== currentUser?.userId) {
      Alert.alert('Geen toegang', 'Je hebt geen toestemming om dit document te verwijderen');
      return;
    }

    Alert.alert(
      'Document verwijderen',
      'Weet je zeker dat je dit document wilt verwijderen?',
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Verwijderen',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete from storage
              await supabase.storage
                .from('family-documents')
                .remove([doc.file_path]);

              // Delete from database (permissions will be deleted automatically via cascade)
              const { error } = await supabase
                .from('documents')
                .delete()
                .eq('id', doc.id);

              if (error) {
                console.error('Delete error:', error);
                Alert.alert('Fout', 'Kon document niet verwijderen: ' + error.message);
                return;
              }

              Alert.alert('Gelukt', 'Document is verwijderd');
              loadDocuments();
            } catch (error: any) {
              console.error('Delete error:', error);
              Alert.alert('Fout', 'Er ging iets mis bij het verwijderen: ' + error.message);
            }
          },
        },
      ]
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (currentUser?.role !== 'parent') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="arrow-back"
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Documenten</Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🔒</Text>
          <Text style={styles.emptyText}>
            Deze functie is alleen beschikbaar voor ouders
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow-back"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Documenten</Text>
        <TouchableOpacity onPress={handlePickDocument} style={styles.addButton}>
          <IconSymbol
            ios_icon_name="plus"
            android_material_icon_name="add"
            size={24}
            color={colors.accent}
          />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : documents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📄</Text>
          <Text style={styles.emptyText}>Nog geen documenten</Text>
          <TouchableOpacity style={styles.emptyButton} onPress={handlePickDocument}>
            <Text style={styles.emptyButtonText}>Document toevoegen</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {documents.map((doc, index) => {
            const myPermission = doc.document_permissions.find(
              p => p.family_member_id === currentUser?.id
            );
            const canView = myPermission?.can_view || doc.uploaded_by === currentUser?.userId;
            const canDownload = myPermission?.can_download || doc.uploaded_by === currentUser?.userId;
            const canDelete = myPermission?.can_delete || doc.uploaded_by === currentUser?.userId;

            if (!canView) return null;

            return (
              <React.Fragment key={index}>
                <View style={styles.documentCard}>
                  <View style={styles.documentHeader}>
                    <View style={styles.documentIcon}>
                      <IconSymbol
                        ios_icon_name={doc.file_type.includes('pdf') ? 'doc.fill' : 'photo.fill'}
                        android_material_icon_name={doc.file_type.includes('pdf') ? 'description' : 'image'}
                        size={24}
                        color={colors.accent}
                      />
                    </View>
                    <View style={styles.documentInfo}>
                      <Text style={styles.documentTitle}>{doc.title}</Text>
                      {doc.description ? (
                        <Text style={styles.documentDescription}>{doc.description}</Text>
                      ) : null}
                      <View style={styles.documentMeta}>
                        <Text style={styles.documentMetaText}>
                          {formatDate(doc.upload_date)} • {formatFileSize(doc.file_size)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.documentActions}>
                    {canDownload && (
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDownload(doc)}
                      >
                        <IconSymbol
                          ios_icon_name="arrow.down.circle"
                          android_material_icon_name="download"
                          size={20}
                          color={colors.accent}
                        />
                        <Text style={styles.actionButtonText}>Download</Text>
                      </TouchableOpacity>
                    )}
                    {canDelete && (
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDelete(doc)}
                      >
                        <IconSymbol
                          ios_icon_name="trash"
                          android_material_icon_name="delete"
                          size={20}
                          color={colors.vibrantRed}
                        />
                        <Text style={[styles.actionButtonText, { color: colors.vibrantRed }]}>
                          Verwijder
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.permissionsInfo}>
                    <Text style={styles.permissionsLabel}>Zichtbaar voor:</Text>
                    <View style={styles.permissionsList}>
                      {doc.document_permissions
                        .filter(p => p.can_view)
                        .map((perm, idx) => {
                          const member = familyMembers.find(m => m.id === perm.family_member_id);
                          return member ? (
                            <React.Fragment key={idx}>
                              <View style={[styles.permissionBadge, { backgroundColor: member.color }]}>
                                <Text style={styles.permissionBadgeText}>
                                  {member.name.charAt(0)}
                                </Text>
                              </View>
                            </React.Fragment>
                          ) : null;
                        })}
                    </View>
                  </View>
                </View>
              </React.Fragment>
            );
          })}
        </ScrollView>
      )}

      {/* Upload Modal */}
      <Modal
        visible={uploadModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => !uploading && setUploadModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Document uploaden</Text>
              <TouchableOpacity
                onPress={() => !uploading && setUploadModalVisible(false)}
                disabled={uploading}
              >
                <IconSymbol
                  ios_icon_name="xmark"
                  android_material_icon_name="close"
                  size={24}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Titel *</Text>
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Documentnaam"
                  placeholderTextColor={colors.textSecondary}
                  editable={!uploading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Beschrijving</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Optionele beschrijving"
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={3}
                  editable={!uploading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Rechten per ouder</Text>
                {parents.map((parent, index) => (
                  <React.Fragment key={index}>
                    <View style={styles.permissionRow}>
                      <Text style={styles.permissionName}>{parent.name}</Text>
                      <View style={styles.permissionToggles}>
                        <TouchableOpacity
                          style={[
                            styles.permissionToggle,
                            selectedPermissions[parent.id]?.can_view && styles.permissionToggleActive,
                          ]}
                          onPress={() => {
                            setSelectedPermissions(prev => ({
                              ...prev,
                              [parent.id]: {
                                ...prev[parent.id],
                                can_view: !prev[parent.id]?.can_view,
                              },
                            }));
                          }}
                          disabled={uploading}
                        >
                          <IconSymbol
                            ios_icon_name="eye"
                            android_material_icon_name="visibility"
                            size={16}
                            color={selectedPermissions[parent.id]?.can_view ? colors.card : colors.textSecondary}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.permissionToggle,
                            selectedPermissions[parent.id]?.can_download && styles.permissionToggleActive,
                          ]}
                          onPress={() => {
                            setSelectedPermissions(prev => ({
                              ...prev,
                              [parent.id]: {
                                ...prev[parent.id],
                                can_download: !prev[parent.id]?.can_download,
                              },
                            }));
                          }}
                          disabled={uploading}
                        >
                          <IconSymbol
                            ios_icon_name="arrow.down"
                            android_material_icon_name="download"
                            size={16}
                            color={selectedPermissions[parent.id]?.can_download ? colors.card : colors.textSecondary}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.permissionToggle,
                            selectedPermissions[parent.id]?.can_delete && styles.permissionToggleActive,
                          ]}
                          onPress={() => {
                            setSelectedPermissions(prev => ({
                              ...prev,
                              [parent.id]: {
                                ...prev[parent.id],
                                can_delete: !prev[parent.id]?.can_delete,
                              },
                            }));
                          }}
                          disabled={uploading}
                        >
                          <IconSymbol
                            ios_icon_name="trash"
                            android_material_icon_name="delete"
                            size={16}
                            color={selectedPermissions[parent.id]?.can_delete ? colors.card : colors.textSecondary}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </React.Fragment>
                ))}
                <Text style={styles.permissionHint}>
                  👁️ Bekijken • ⬇️ Downloaden • 🗑️ Verwijderen
                </Text>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
              onPress={handleUpload}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator color={colors.card} />
              ) : (
                <Text style={styles.uploadButtonText}>Uploaden</Text>
              )}
            </TouchableOpacity>
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
    paddingTop: Platform.OS === 'android' ? 48 : 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Poppins_700Bold',
  },
  headerRight: {
    width: 40,
  },
  addButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Poppins_600SemiBold',
  },
  emptyButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.card,
    fontFamily: 'Poppins_600SemiBold',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  documentCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    boxShadow: `0px 2px 8px ${colors.shadow}`,
    elevation: 2,
  },
  documentHeader: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  documentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    fontFamily: 'Poppins_600SemiBold',
  },
  documentDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
    fontFamily: 'Nunito_400Regular',
  },
  documentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentMetaText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  documentActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
    fontFamily: 'Poppins_600SemiBold',
  },
  permissionsInfo: {
    borderTopWidth: 1,
    borderTopColor: colors.textSecondary + '20',
    paddingTop: 12,
  },
  permissionsLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
    fontFamily: 'Nunito_400Regular',
  },
  permissionsList: {
    flexDirection: 'row',
    gap: 8,
  },
  permissionBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.card,
    fontFamily: 'Poppins_700Bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Poppins_700Bold',
  },
  modalScroll: {
    maxHeight: 400,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    fontFamily: 'Poppins_600SemiBold',
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    fontFamily: 'Nunito_400Regular',
    borderWidth: 1,
    borderColor: colors.textSecondary + '20',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  permissionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.textSecondary + '10',
  },
  permissionName: {
    fontSize: 16,
    color: colors.text,
    fontFamily: 'Nunito_400Regular',
  },
  permissionToggles: {
    flexDirection: 'row',
    gap: 8,
  },
  permissionToggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionToggleActive: {
    backgroundColor: colors.accent,
  },
  permissionHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    fontFamily: 'Nunito_400Regular',
  },
  uploadButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  uploadButtonDisabled: {
    opacity: 0.5,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.card,
    fontFamily: 'Poppins_600SemiBold',
  },
});

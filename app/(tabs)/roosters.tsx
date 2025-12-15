
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { Ionicons } from '@expo/vector-icons';
import { useFamily } from '@/contexts/FamilyContext';
import { useTranslation } from 'react-i18next';
import { useModuleTheme, ModuleName } from '@/contexts/ThemeContext';
import ModuleHeader from '@/components/ModuleHeader';
import ThemedButton from '@/components/ThemedButton';
import { supabase } from '@/utils/supabase';
import { Schedule, ScheduleItem, ScheduleWithItems } from '@/types/schedule';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function RoostersScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { familyMembers, currentFamily, currentUser, addAppointment } = useFamily();
  const { setModule, accentColor } = useModuleTheme();
  
  const [schedules, setSchedules] = useState<ScheduleWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleWithItems | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'school' | 'work' | 'sport' | 'other'>('school');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [scheduleItems, setScheduleItems] = useState<Omit<ScheduleItem, 'id' | 'schedule_id' | 'created_at'>[]>([]);

  // Set module theme on mount
  useEffect(() => {
    setModule('agenda' as ModuleName);
  }, [setModule]);

  // Load schedules
  const loadSchedules = useCallback(async () => {
    if (!currentFamily) {
      console.log('No current family, skipping schedules load');
      setLoading(false);
      return;
    }

    try {
      console.log('Loading schedules for family:', currentFamily.id);
      
      // Load schedules
      const { data: schedulesData, error: schedulesError } = await supabase
        .from('schedules')
        .select('*')
        .eq('family_id', currentFamily.id)
        .order('created_at', { ascending: false });

      if (schedulesError) {
        console.error('Error loading schedules:', schedulesError);
        Alert.alert('Fout', 'Kon roosters niet laden');
        setLoading(false);
        return;
      }

      if (schedulesData) {
        // Load schedule items for each schedule
        const schedulesWithItems: ScheduleWithItems[] = await Promise.all(
          schedulesData.map(async (schedule) => {
            const { data: itemsData, error: itemsError } = await supabase
              .from('schedule_items')
              .select('*')
              .eq('schedule_id', schedule.id)
              .order('day_of_week', { ascending: true });

            if (itemsError) {
              console.error('Error loading schedule items:', itemsError);
              return { ...schedule, items: [] };
            }

            return { ...schedule, items: itemsData || [] };
          })
        );

        setSchedules(schedulesWithItems);
        console.log('Loaded schedules:', schedulesWithItems.length);
      }
    } catch (error) {
      console.error('Error loading schedules:', error);
      Alert.alert('Fout', 'Er ging iets mis bij het laden van roosters');
    } finally {
      setLoading(false);
    }
  }, [currentFamily]);

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  const resetForm = () => {
    setTitle('');
    setType('school');
    setSelectedMemberId('');
    setStartDate(new Date());
    setEndDate(null);
    setScheduleItems([]);
    setEditingSchedule(null);
  };

  const handleAddScheduleItem = () => {
    setScheduleItems([
      ...scheduleItems,
      {
        day_of_week: 1,
        start_time: '09:00',
        end_time: '17:00',
        location: null,
        note: null,
        color: null,
      },
    ]);
  };

  const handleUpdateScheduleItem = (index: number, updates: Partial<Omit<ScheduleItem, 'id' | 'schedule_id' | 'created_at'>>) => {
    const newItems = [...scheduleItems];
    newItems[index] = { ...newItems[index], ...updates };
    setScheduleItems(newItems);
  };

  const handleRemoveScheduleItem = (index: number) => {
    setScheduleItems(scheduleItems.filter((_, i) => i !== index));
  };

  const handleSaveSchedule = async () => {
    if (!title.trim()) {
      Alert.alert('Fout', 'Vul een titel in');
      return;
    }

    if (!selectedMemberId) {
      Alert.alert('Fout', 'Selecteer een gezinslid');
      return;
    }

    if (scheduleItems.length === 0) {
      Alert.alert('Fout', 'Voeg minimaal één roosterregel toe');
      return;
    }

    if (!currentFamily || !currentUser) {
      Alert.alert('Fout', 'Geen gezin gevonden');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Fout', 'Niet ingelogd');
        return;
      }

      if (editingSchedule) {
        // Update existing schedule
        const { error: updateError } = await supabase
          .from('schedules')
          .update({
            title: title.trim(),
            type,
            member_id: selectedMemberId,
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate ? endDate.toISOString().split('T')[0] : null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingSchedule.id);

        if (updateError) {
          console.error('Error updating schedule:', updateError);
          Alert.alert('Fout', 'Kon rooster niet bijwerken');
          return;
        }

        // Delete old schedule items
        const { error: deleteItemsError } = await supabase
          .from('schedule_items')
          .delete()
          .eq('schedule_id', editingSchedule.id);

        if (deleteItemsError) {
          console.error('Error deleting schedule items:', deleteItemsError);
        }

        // Insert new schedule items
        const itemsToInsert = scheduleItems.map(item => ({
          schedule_id: editingSchedule.id,
          ...item,
        }));

        const { error: insertItemsError } = await supabase
          .from('schedule_items')
          .insert(itemsToInsert);

        if (insertItemsError) {
          console.error('Error inserting schedule items:', insertItemsError);
          Alert.alert('Fout', 'Kon roosterregels niet opslaan');
          return;
        }

        Alert.alert('Succes', 'Rooster bijgewerkt');
      } else {
        // Create new schedule
        const { data: scheduleData, error: scheduleError } = await supabase
          .from('schedules')
          .insert([{
            family_id: currentFamily.id,
            member_id: selectedMemberId,
            title: title.trim(),
            type,
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate ? endDate.toISOString().split('T')[0] : null,
            created_by: user.id,
          }])
          .select()
          .single();

        if (scheduleError || !scheduleData) {
          console.error('Error creating schedule:', scheduleError);
          Alert.alert('Fout', 'Kon rooster niet aanmaken');
          return;
        }

        // Insert schedule items
        const itemsToInsert = scheduleItems.map(item => ({
          schedule_id: scheduleData.id,
          ...item,
        }));

        const { error: itemsError } = await supabase
          .from('schedule_items')
          .insert(itemsToInsert);

        if (itemsError) {
          console.error('Error inserting schedule items:', itemsError);
          Alert.alert('Fout', 'Kon roosterregels niet opslaan');
          return;
        }

        Alert.alert('Succes', 'Rooster toegevoegd');
      }

      resetForm();
      setShowAddModal(false);
      setShowEditModal(false);
      loadSchedules();
    } catch (error) {
      console.error('Error saving schedule:', error);
      Alert.alert('Fout', 'Er ging iets mis bij het opslaan');
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    Alert.alert(
      'Rooster verwijderen',
      'Weet je zeker dat je dit rooster wilt verwijderen?',
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Verwijderen',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('schedules')
                .delete()
                .eq('id', scheduleId);

              if (error) {
                console.error('Error deleting schedule:', error);
                Alert.alert('Fout', 'Kon rooster niet verwijderen');
                return;
              }

              Alert.alert('Succes', 'Rooster verwijderd');
              loadSchedules();
            } catch (error) {
              console.error('Error deleting schedule:', error);
              Alert.alert('Fout', 'Er ging iets mis bij het verwijderen');
            }
          },
        },
      ]
    );
  };

  const handleAddToAgenda = async (schedule: ScheduleWithItems) => {
    if (!currentFamily) {
      Alert.alert('Fout', 'Geen gezin gevonden');
      return;
    }

    try {
      const member = familyMembers.find(m => m.id === schedule.member_id);
      if (!member) {
        Alert.alert('Fout', 'Gezinslid niet gevonden');
        return;
      }

      // Calculate end date (8 weeks from start or schedule end date)
      const scheduleStartDate = new Date(schedule.start_date);
      const scheduleEndDate = schedule.end_date ? new Date(schedule.end_date) : null;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const startFrom = scheduleStartDate > today ? scheduleStartDate : today;
      const eightWeeksFromNow = new Date(startFrom);
      eightWeeksFromNow.setDate(eightWeeksFromNow.getDate() + 56); // 8 weeks
      
      const endAt = scheduleEndDate && scheduleEndDate < eightWeeksFromNow ? scheduleEndDate : eightWeeksFromNow;

      let eventsCreated = 0;

      // Generate events for each schedule item
      for (const item of schedule.items) {
        // Generate events for the next 8 weeks (or until end date)
        const currentDate = new Date(startFrom);
        
        while (currentDate <= endAt) {
          // Check if current day matches the schedule item's day
          const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
          const scheduleDayOfWeek = item.day_of_week; // 1 = Monday, 7 = Sunday
          
          // Convert schedule day to JS day (1-7 to 1-7 where 1=Monday, 7=Sunday)
          const jsDay = dayOfWeek === 0 ? 7 : dayOfWeek;
          
          if (jsDay === scheduleDayOfWeek) {
            // Create appointment
            addAppointment({
              title: `${schedule.title}`,
              date: new Date(currentDate),
              time: item.start_time,
              endTime: item.end_time,
              assignedTo: [schedule.member_id],
              color: item.color || member.color,
              repeatType: 'none',
              location: item.location || undefined,
              notes: item.note || undefined,
            });
            
            eventsCreated++;
          }
          
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }

      Alert.alert(
        'Succes',
        `Rooster toegevoegd aan agenda ✅\n${eventsCreated} afspraken aangemaakt`
      );
    } catch (error) {
      console.error('Error adding to agenda:', error);
      Alert.alert('Fout', 'Er ging iets mis bij het toevoegen aan de agenda');
    }
  };

  const handleEditSchedule = (schedule: ScheduleWithItems) => {
    setEditingSchedule(schedule);
    setTitle(schedule.title);
    setType(schedule.type);
    setSelectedMemberId(schedule.member_id);
    setStartDate(new Date(schedule.start_date));
    setEndDate(schedule.end_date ? new Date(schedule.end_date) : null);
    setScheduleItems(schedule.items.map(item => ({
      day_of_week: item.day_of_week,
      start_time: item.start_time,
      end_time: item.end_time,
      location: item.location,
      note: item.note,
      color: item.color,
    })));
    setShowEditModal(true);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'school': return 'School';
      case 'work': return 'Werk';
      case 'sport': return 'Sport';
      case 'other': return 'Overig';
      default: return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'school': return 'school-outline';
      case 'work': return 'briefcase-outline';
      case 'sport': return 'football-outline';
      case 'other': return 'calendar-outline';
      default: return 'calendar-outline';
    }
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];
    return days[dayOfWeek - 1] || '';
  };

  const renderScheduleForm = () => (
    <ScrollView style={styles.formContainer}>
      <Text style={styles.inputLabel}>Titel</Text>
      <TextInput
        style={styles.input}
        placeholder="Bijv. Schoolrooster Emma"
        placeholderTextColor={colors.textSecondary}
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.inputLabel}>Type</Text>
      <View style={styles.typeSelector}>
        {[
          { value: 'school', label: 'School', icon: 'school-outline' },
          { value: 'work', label: 'Werk', icon: 'briefcase-outline' },
          { value: 'sport', label: 'Sport', icon: 'football-outline' },
          { value: 'other', label: 'Overig', icon: 'calendar-outline' },
        ].map((option, index) => (
          <React.Fragment key={index}>
            <TouchableOpacity
              style={[
                styles.typeOption,
                type === option.value && [styles.typeOptionActive, { borderColor: accentColor }],
              ]}
              onPress={() => setType(option.value as any)}
            >
              <Ionicons
                name={option.icon as any}
                size={24}
                color={type === option.value ? accentColor : colors.textSecondary}
              />
              <Text
                style={[
                  styles.typeOptionText,
                  type === option.value && styles.typeOptionTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          </React.Fragment>
        ))}
      </View>

      <Text style={styles.inputLabel}>Gezinslid</Text>
      <View style={styles.memberSelector}>
        {familyMembers.map((member, index) => (
          <React.Fragment key={index}>
            <TouchableOpacity
              style={[
                styles.memberOption,
                selectedMemberId === member.id && [styles.memberOptionActive, { borderColor: accentColor }],
              ]}
              onPress={() => setSelectedMemberId(member.id)}
            >
              <View style={[styles.memberAvatar, { backgroundColor: member.color }]}>
                <Text style={styles.memberAvatarText}>{member.name.charAt(0)}</Text>
              </View>
              <Text style={styles.memberName}>{member.name}</Text>
            </TouchableOpacity>
          </React.Fragment>
        ))}
      </View>

      <Text style={styles.inputLabel}>Startdatum</Text>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowStartDatePicker(true)}
      >
        <Ionicons name="calendar-outline" size={22} color={colors.text} />
        <Text style={styles.dateButtonText}>
          {startDate.toLocaleDateString('nl-NL')}
        </Text>
      </TouchableOpacity>

      <Text style={styles.inputLabel}>Einddatum (optioneel)</Text>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowEndDatePicker(true)}
      >
        <Ionicons name="calendar-outline" size={22} color={colors.text} />
        <Text style={styles.dateButtonText}>
          {endDate ? endDate.toLocaleDateString('nl-NL') : 'Doorlopend'}
        </Text>
      </TouchableOpacity>
      {endDate && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => setEndDate(null)}
        >
          <Text style={styles.clearButtonText}>Einddatum wissen</Text>
        </TouchableOpacity>
      )}

      <View style={styles.scheduleItemsHeader}>
        <Text style={styles.inputLabel}>Roosterregels</Text>
        <TouchableOpacity
          style={[styles.addItemButton, { backgroundColor: accentColor }]}
          onPress={handleAddScheduleItem}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addItemButtonText}>Regel toevoegen</Text>
        </TouchableOpacity>
      </View>

      {scheduleItems.map((item, index) => (
        <React.Fragment key={index}>
          <View style={styles.scheduleItemCard}>
            <View style={styles.scheduleItemHeader}>
              <Text style={styles.scheduleItemTitle}>Regel {index + 1}</Text>
              <TouchableOpacity
                style={styles.removeItemButton}
                onPress={() => handleRemoveScheduleItem(index)}
              >
                <Ionicons name="trash-outline" size={20} color="#E74C3C" />
              </TouchableOpacity>
            </View>

            <Text style={styles.itemLabel}>Dag</Text>
            <View style={styles.daySelector}>
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <React.Fragment key={day}>
                  <TouchableOpacity
                    style={[
                      styles.dayButton,
                      item.day_of_week === day && [styles.dayButtonActive, { backgroundColor: accentColor }],
                    ]}
                    onPress={() => handleUpdateScheduleItem(index, { day_of_week: day })}
                  >
                    <Text
                      style={[
                        styles.dayButtonText,
                        item.day_of_week === day && styles.dayButtonTextActive,
                      ]}
                    >
                      {getDayName(day)}
                    </Text>
                  </TouchableOpacity>
                </React.Fragment>
              ))}
            </View>

            <Text style={styles.itemLabel}>Starttijd</Text>
            <TextInput
              style={styles.timeInput}
              placeholder="09:00"
              placeholderTextColor={colors.textSecondary}
              value={item.start_time}
              onChangeText={(text) => handleUpdateScheduleItem(index, { start_time: text })}
            />

            <Text style={styles.itemLabel}>Eindtijd</Text>
            <TextInput
              style={styles.timeInput}
              placeholder="17:00"
              placeholderTextColor={colors.textSecondary}
              value={item.end_time}
              onChangeText={(text) => handleUpdateScheduleItem(index, { end_time: text })}
            />

            <Text style={styles.itemLabel}>Locatie (optioneel)</Text>
            <TextInput
              style={styles.input}
              placeholder="Bijv. School, Sporthal"
              placeholderTextColor={colors.textSecondary}
              value={item.location || ''}
              onChangeText={(text) => handleUpdateScheduleItem(index, { location: text || null })}
            />

            <Text style={styles.itemLabel}>Notitie (optioneel)</Text>
            <TextInput
              style={styles.input}
              placeholder="Extra informatie"
              placeholderTextColor={colors.textSecondary}
              value={item.note || ''}
              onChangeText={(text) => handleUpdateScheduleItem(index, { note: text || null })}
              multiline
            />
          </View>
        </React.Fragment>
      ))}

      <View style={styles.modalButtons}>
        <TouchableOpacity
          style={[styles.modalButton, styles.modalButtonCancel]}
          onPress={() => {
            resetForm();
            setShowAddModal(false);
            setShowEditModal(false);
          }}
        >
          <Text style={styles.modalButtonText}>Annuleren</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modalButton, styles.modalButtonConfirm, { backgroundColor: accentColor }]}
          onPress={handleSaveSchedule}
        >
          <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>
            {editingSchedule ? 'Bijwerken' : 'Opslaan'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ModuleHeader
          title="Roosters"
          subtitle="Beheer gezinsroosters"
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
        title="Roosters"
        subtitle="Beheer gezinsroosters"
        backgroundColor="#FFFFFF"
      />

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <ThemedButton
          title="Rooster toevoegen"
          onPress={() => {
            resetForm();
            setShowAddModal(true);
          }}
          icon="plus"
          androidIcon="add"
          style={styles.addButton}
        />

        {schedules.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyStateTitle}>Nog geen roosters</Text>
            <Text style={styles.emptyStateText}>
              Voeg je eerste rooster toe om te beginnen
            </Text>
          </View>
        ) : (
          schedules.map((schedule, index) => {
            const member = familyMembers.find(m => m.id === schedule.member_id);
            
            return (
              <React.Fragment key={index}>
                <View style={[styles.scheduleCard, { borderLeftColor: member?.color || colors.accent }]}>
                  <View style={styles.scheduleCardHeader}>
                    <View style={styles.scheduleCardTitleRow}>
                      <Ionicons
                        name={getTypeIcon(schedule.type) as any}
                        size={24}
                        color={member?.color || colors.accent}
                      />
                      <Text style={styles.scheduleCardTitle}>{schedule.title}</Text>
                    </View>
                    <View style={styles.scheduleCardBadge}>
                      <Text style={styles.scheduleCardBadgeText}>{getTypeLabel(schedule.type)}</Text>
                    </View>
                  </View>

                  <View style={styles.scheduleCardMember}>
                    <View style={[styles.memberBadge, { backgroundColor: member?.color || colors.accent }]}>
                      <Text style={styles.memberBadgeText}>{member?.name.charAt(0) || '?'}</Text>
                    </View>
                    <Text style={styles.memberNameText}>{member?.name || 'Onbekend'}</Text>
                  </View>

                  <View style={styles.scheduleCardPeriod}>
                    <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                    <Text style={styles.scheduleCardPeriodText}>
                      {new Date(schedule.start_date).toLocaleDateString('nl-NL')}
                      {schedule.end_date
                        ? ` - ${new Date(schedule.end_date).toLocaleDateString('nl-NL')}`
                        : ' - Doorlopend'}
                    </Text>
                  </View>

                  <View style={styles.scheduleCardItems}>
                    <Text style={styles.scheduleCardItemsTitle}>
                      {schedule.items.length} roosterregel{schedule.items.length !== 1 ? 's' : ''}
                    </Text>
                    {schedule.items.slice(0, 3).map((item, itemIndex) => (
                      <React.Fragment key={itemIndex}>
                        <View style={styles.scheduleItemPreview}>
                          <Text style={styles.scheduleItemPreviewDay}>{getDayName(item.day_of_week)}</Text>
                          <Text style={styles.scheduleItemPreviewTime}>
                            {item.start_time} - {item.end_time}
                          </Text>
                        </View>
                      </React.Fragment>
                    ))}
                    {schedule.items.length > 3 && (
                      <Text style={styles.scheduleItemsMore}>
                        +{schedule.items.length - 3} meer
                      </Text>
                    )}
                  </View>

                  <View style={styles.scheduleCardActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleEditSchedule(schedule)}
                    >
                      <Ionicons name="create-outline" size={20} color={colors.text} />
                      <Text style={styles.actionButtonText}>Bewerken</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDeleteSchedule(schedule.id)}
                    >
                      <Ionicons name="trash-outline" size={20} color="#E74C3C" />
                      <Text style={[styles.actionButtonText, { color: '#E74C3C' }]}>Verwijderen</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.actionButtonPrimary, { backgroundColor: accentColor }]}
                      onPress={() => handleAddToAgenda(schedule)}
                    >
                      <Ionicons name="add-circle-outline" size={20} color="#fff" />
                      <Text style={[styles.actionButtonText, { color: '#fff' }]}>Naar agenda</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </React.Fragment>
            );
          })
        )}
      </ScrollView>

      {/* Add Schedule Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          resetForm();
          setShowAddModal(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalBackButton}
                onPress={() => {
                  resetForm();
                  setShowAddModal(false);
                }}
              >
                <Ionicons name="chevron-back" size={26} color="#333" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Nieuw rooster</Text>
              <View style={styles.modalHeaderSpacer} />
            </View>
            {renderScheduleForm()}
          </View>
        </View>
      </Modal>

      {/* Edit Schedule Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          resetForm();
          setShowEditModal(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalBackButton}
                onPress={() => {
                  resetForm();
                  setShowEditModal(false);
                }}
              >
                <Ionicons name="chevron-back" size={26} color="#333" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Rooster bewerken</Text>
              <View style={styles.modalHeaderSpacer} />
            </View>
            {renderScheduleForm()}
          </View>
        </View>
      </Modal>

      {/* Date Pickers */}
      {showStartDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowStartDatePicker(Platform.OS === 'ios');
            if (selectedDate) {
              setStartDate(selectedDate);
            }
          }}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowEndDatePicker(Platform.OS === 'ios');
            if (selectedDate) {
              setEndDate(selectedDate);
            }
          }}
        />
      )}
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
  addButton: {
    marginBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 20,
    marginBottom: 8,
    fontFamily: 'Poppins_700Bold',
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    fontFamily: 'Nunito_400Regular',
  },
  scheduleCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  scheduleCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scheduleCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  scheduleCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Poppins_700Bold',
    flex: 1,
  },
  scheduleCardBadge: {
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  scheduleCardBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    fontFamily: 'Poppins_600SemiBold',
  },
  scheduleCardMember: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  memberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'Poppins_700Bold',
  },
  memberNameText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
  },
  scheduleCardPeriod: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  scheduleCardPeriodText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  scheduleCardItems: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  scheduleCardItemsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    fontFamily: 'Poppins_600SemiBold',
  },
  scheduleItemPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  scheduleItemPreviewDay: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
  },
  scheduleItemPreviewTime: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  scheduleItemsMore: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
    fontFamily: 'Nunito_400Regular',
  },
  scheduleCardActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  actionButtonPrimary: {
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
    paddingHorizontal: 20,
    maxHeight: '90%',
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
  formContainer: {
    flex: 1,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
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
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  typeOption: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeOptionActive: {
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    fontFamily: 'Poppins_600SemiBold',
  },
  typeOptionTextActive: {
    color: colors.text,
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
    color: '#fff',
    fontFamily: 'Poppins_700Bold',
  },
  memberName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
  },
  dateButton: {
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dateButtonText: {
    fontSize: 16,
    color: colors.text,
    fontFamily: 'Nunito_400Regular',
    flex: 1,
  },
  clearButton: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    fontFamily: 'Poppins_600SemiBold',
  },
  scheduleItemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  addItemButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Poppins_600SemiBold',
  },
  scheduleItemCard: {
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  scheduleItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  scheduleItemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Poppins_700Bold',
  },
  removeItemButton: {
    padding: 8,
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    fontFamily: 'Poppins_600SemiBold',
  },
  daySelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 15,
  },
  dayButton: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dayButtonActive: {
  },
  dayButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    fontFamily: 'Poppins_600SemiBold',
  },
  dayButtonTextActive: {
    color: '#fff',
  },
  timeInput: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: 15,
    fontFamily: 'Nunito_400Regular',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
    marginBottom: 20,
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
    color: '#fff',
  },
});

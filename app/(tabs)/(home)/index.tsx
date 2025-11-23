
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useFamily } from '@/contexts/FamilyContext';
import WeatherWidget from '@/components/WeatherWidget';

export default function HomeScreen() {
  const router = useRouter();
  const { familyMembers, currentUser, setCurrentUser, tasks, appointments, shoppingList, familyNotes } = useFamily();
  const [showMemberPicker, setShowMemberPicker] = useState(!currentUser);

  // If no user selected, force selection
  if (!currentUser) {
    return (
      <View style={styles.container}>
        <View style={styles.selectionContainer}>
          <Text style={styles.selectionEmoji}>👋</Text>
          <Text style={styles.selectionTitle}>Welkom bij Flow Fam!</Text>
          <Text style={styles.selectionSubtitle}>Wie ben jij?</Text>
          
          <View style={styles.memberGrid}>
            {familyMembers.map((member, index) => (
              <React.Fragment key={index}>
                <TouchableOpacity
                  style={[styles.memberCard, { backgroundColor: member.color || colors.accent }]}
                  onPress={() => {
                    setCurrentUser(member);
                    setShowMemberPicker(false);
                  }}
                >
                  <View style={styles.memberCardAvatar}>
                    {member.photoUri ? (
                      <Image source={{ uri: member.photoUri }} style={styles.memberCardPhoto} />
                    ) : (
                      <Text style={styles.memberCardAvatarText}>{member.name.charAt(0)}</Text>
                    )}
                  </View>
                  <Text style={styles.memberCardName}>{member.name}</Text>
                  <Text style={styles.memberCardRole}>
                    {member.role === 'parent' ? '👨‍👩‍👧‍👦 Ouder' : '👶 Kind'}
                  </Text>
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
        </View>
      </View>
    );
  }

  const isParent = currentUser.role === 'parent';
  const memberColor = currentUser.color || colors.accent;

  // Get today's date
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Parent view - show their own tasks, appointments, shopping, and notes
  if (isParent) {
    const myTasks = tasks.filter(t => t.assignedTo === currentUser.id && !t.completed);
    const myAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      aptDate.setHours(0, 0, 0, 0);
      return apt.assignedTo.includes(currentUser.id) && aptDate.getTime() === today.getTime();
    });
    const activeShoppingItems = shoppingList.filter(item => !item.completed).slice(0, 5);
    const recentNotes = familyNotes.slice(0, 3);

    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Flow Fam</Text>
            <Text style={styles.tagline}>Rust, overzicht en liefde in één gezinsapp</Text>
          </View>

          <TouchableOpacity 
            style={[styles.memberSelector, { borderColor: memberColor }]}
            onPress={() => setShowMemberPicker(true)}
          >
            <View style={styles.memberSelectorContent}>
              <View style={[styles.memberAvatar, { backgroundColor: memberColor }]}>
                {currentUser.photoUri ? (
                  <Image source={{ uri: currentUser.photoUri }} style={styles.memberAvatarPhoto} />
                ) : (
                  <Text style={styles.memberAvatarText}>{currentUser.name.charAt(0)}</Text>
                )}
              </View>
              <Text style={styles.memberSelectorName}>{currentUser.name}</Text>
              <IconSymbol 
                ios_icon_name="chevron.down" 
                android_material_icon_name="arrow-drop-down" 
                size={24} 
                color={colors.text} 
              />
            </View>
          </TouchableOpacity>

          {/* Weather Widget */}
          <WeatherWidget />

          {/* My appointments today */}
          {myAppointments.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📅 Mijn afspraken vandaag</Text>
              {myAppointments.map((apt, index) => (
                <React.Fragment key={index}>
                  <View style={[styles.appointmentCard, { borderLeftColor: memberColor }]}>
                    <Text style={styles.appointmentTime}>{apt.time}{apt.endTime ? ` - ${apt.endTime}` : ''}</Text>
                    <Text style={styles.appointmentTitle}>{apt.title}</Text>
                  </View>
                </React.Fragment>
              ))}
            </View>
          )}

          {/* My tasks */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✅ Mijn taken</Text>
            {myTasks.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyEmoji}>✨</Text>
                <Text style={styles.emptyText}>Wat goed! Je hebt al je taken afgerond!</Text>
              </View>
            ) : (
              myTasks.map((task, index) => (
                <React.Fragment key={index}>
                  <TouchableOpacity
                    style={styles.taskCard}
                    onPress={() => router.push('/(tabs)/tasks')}
                  >
                    <View style={[styles.taskIcon, { backgroundColor: memberColor }]}>
                      <IconSymbol
                        ios_icon_name={task.icon}
                        android_material_icon_name={task.icon as any}
                        size={24}
                        color={colors.card}
                      />
                    </View>
                    <Text style={styles.taskName}>{task.name}</Text>
                    <View style={[styles.taskCoins, { backgroundColor: memberColor }]}>
                      <Text style={styles.taskCoinsText}>{task.coins}🪙</Text>
                    </View>
                  </TouchableOpacity>
                </React.Fragment>
              ))
            )}
          </View>

          {/* Shopping list preview */}
          {activeShoppingItems.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>🛒 Boodschappen</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/shopping')}>
                  <Text style={styles.seeAllText}>Alles →</Text>
                </TouchableOpacity>
              </View>
              {activeShoppingItems.map((item, index) => (
                <React.Fragment key={index}>
                  <View style={styles.quickItem}>
                    <Text style={styles.quickItemText}>• {item.name}</Text>
                  </View>
                </React.Fragment>
              ))}
            </View>
          )}

          {/* Notes preview */}
          {recentNotes.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>📝 Notities</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/notes')}>
                  <Text style={styles.seeAllText}>Alles →</Text>
                </TouchableOpacity>
              </View>
              {recentNotes.map((note, index) => (
                <React.Fragment key={index}>
                  <TouchableOpacity
                    style={styles.notePreviewCard}
                    onPress={() => router.push('/(tabs)/notes')}
                  >
                    <Text style={styles.notePreviewTitle}>{note.title}</Text>
                    {note.content && (
                      <Text style={styles.notePreviewContent} numberOfLines={2}>
                        {note.content}
                      </Text>
                    )}
                  </TouchableOpacity>
                </React.Fragment>
              ))}
            </View>
          )}
        </ScrollView>

        <Modal
          visible={showMemberPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowMemberPicker(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowMemberPicker(false)}
          >
            <View style={styles.memberPickerModal}>
              <Text style={styles.modalTitle}>Wissel van profiel</Text>
              {familyMembers.map((member, index) => (
                <React.Fragment key={index}>
                  <TouchableOpacity
                    style={styles.memberOption}
                    onPress={() => {
                      setCurrentUser(member);
                      setShowMemberPicker(false);
                    }}
                  >
                    <View style={[styles.memberOptionAvatar, { backgroundColor: member.color || colors.accent }]}>
                      {member.photoUri ? (
                        <Image source={{ uri: member.photoUri }} style={styles.memberOptionPhoto} />
                      ) : (
                        <Text style={styles.memberOptionAvatarText}>{member.name.charAt(0)}</Text>
                      )}
                    </View>
                    <View style={styles.memberOptionInfo}>
                      <Text style={styles.memberOptionName}>{member.name}</Text>
                      <Text style={styles.memberOptionRole}>
                        {member.role === 'parent' ? '👨‍👩‍👧‍👦 Ouder' : '👶 Kind'}
                      </Text>
                    </View>
                    {currentUser.id === member.id && (
                      <IconSymbol 
                        ios_icon_name="checkmark" 
                        android_material_icon_name="check" 
                        size={24} 
                        color={colors.accent} 
                      />
                    )}
                  </TouchableOpacity>
                </React.Fragment>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  }

  // Child view - show their own tasks and appointments for the day
  const myTasks = tasks.filter(t => t.assignedTo === currentUser.id && !t.completed);
  const myAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date);
    aptDate.setHours(0, 0, 0, 0);
    return apt.assignedTo.includes(currentUser.id) && aptDate.getTime() === today.getTime();
  });

  // Combine tasks and appointments into a daily overview
  const dailyOverview = [
    ...myAppointments.map(apt => ({
      type: 'appointment' as const,
      time: apt.time,
      endTime: apt.endTime,
      title: apt.title,
      icon: 'event',
    })),
    ...myTasks.map(task => ({
      type: 'task' as const,
      title: task.name,
      icon: task.icon,
      coins: task.coins,
    })),
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Hallo {currentUser.name}! 👋</Text>
          <Text style={styles.subtitle}>Wat ga je vandaag doen?</Text>
        </View>

        <TouchableOpacity 
          style={[styles.memberSelector, { borderColor: memberColor }]}
          onPress={() => setShowMemberPicker(true)}
        >
          <View style={styles.memberSelectorContent}>
            <View style={[styles.memberAvatar, { backgroundColor: memberColor }]}>
              {currentUser.photoUri ? (
                <Image source={{ uri: currentUser.photoUri }} style={styles.memberAvatarPhoto} />
              ) : (
                <Text style={styles.memberAvatarText}>{currentUser.name.charAt(0)}</Text>
              )}
            </View>
            <Text style={styles.memberSelectorName}>{currentUser.name}</Text>
            <IconSymbol 
              ios_icon_name="chevron.down" 
              android_material_icon_name="arrow-drop-down" 
              size={24} 
              color={colors.text} 
            />
          </View>
        </TouchableOpacity>

        {/* Weather Widget for children */}
        <WeatherWidget />

        {/* Coins display */}
        <View style={[styles.coinsCard, { borderColor: memberColor }]}>
          <Text style={styles.coinsEmoji}>🪙</Text>
          <View>
            <Text style={styles.coinsLabel}>Mijn muntjes</Text>
            <Text style={[styles.coinsAmount, { color: memberColor }]}>{currentUser.coins}</Text>
          </View>
        </View>

        {/* Daily overview - What's happening today */}
        {dailyOverview.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Wat staat mij vandaag te wachten?</Text>
            <View style={styles.dailyOverviewCard}>
              {dailyOverview.map((item, index) => (
                <React.Fragment key={index}>
                  <View style={styles.dailyOverviewItem}>
                    <View style={[styles.dailyOverviewIcon, { backgroundColor: memberColor }]}>
                      {item.type === 'appointment' ? (
                        <IconSymbol
                          ios_icon_name="calendar"
                          android_material_icon_name="event"
                          size={20}
                          color={colors.card}
                        />
                      ) : (
                        <Image
                          source={require('@/assets/images/37e069f3-3725-4165-ba07-912d50e9b6e8.png')}
                          style={[
                            styles.dailyOverviewCustomIcon,
                            { tintColor: colors.card }
                          ]}
                          resizeMode="contain"
                        />
                      )}
                    </View>
                    <View style={styles.dailyOverviewContent}>
                      {item.type === 'appointment' && item.time && (
                        <Text style={styles.dailyOverviewTime}>
                          {item.time}{item.endTime ? ` - ${item.endTime}` : ''}
                        </Text>
                      )}
                      <Text style={styles.dailyOverviewTitle}>{item.title}</Text>
                      {item.type === 'task' && item.coins && (
                        <Text style={styles.dailyOverviewCoins}>🪙 {item.coins} muntjes</Text>
                      )}
                    </View>
                  </View>
                  {index < dailyOverview.length - 1 && <View style={styles.dailyOverviewDivider} />}
                </React.Fragment>
              ))}
            </View>
          </View>
        )}

        {/* Today's appointments */}
        {myAppointments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📅 Mijn afspraken vandaag</Text>
            {myAppointments.map((apt, index) => (
              <React.Fragment key={index}>
                <View style={[styles.appointmentCard, { borderLeftColor: memberColor }]}>
                  <Text style={styles.appointmentTime}>{apt.time}{apt.endTime ? ` - ${apt.endTime}` : ''}</Text>
                  <Text style={styles.appointmentTitle}>{apt.title}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        )}

        {/* My tasks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✅ Mijn taken</Text>
          {myTasks.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>✨</Text>
              <Text style={styles.emptyText}>Wat goed! Je hebt al je taken afgerond!</Text>
            </View>
          ) : (
            myTasks.map((task, index) => (
              <React.Fragment key={index}>
                <TouchableOpacity
                  style={styles.taskCard}
                  onPress={() => router.push('/(tabs)/tasks')}
                >
                  <View style={[styles.taskIcon, { backgroundColor: memberColor }]}>
                    {task.icon === 'brush' ? (
                      <Image
                        source={require('@/assets/images/37e069f3-3725-4165-ba07-912d50e9b6e8.png')}
                        style={[
                          styles.taskCustomIcon,
                          { tintColor: colors.card }
                        ]}
                        resizeMode="contain"
                      />
                    ) : (
                      <IconSymbol
                        ios_icon_name={task.icon}
                        android_material_icon_name={task.icon as any}
                        size={24}
                        color={colors.card}
                      />
                    )}
                  </View>
                  <Text style={styles.taskName}>{task.name}</Text>
                  <View style={[styles.taskCoins, { backgroundColor: memberColor }]}>
                    <Text style={styles.taskCoinsText}>{task.coins}🪙</Text>
                  </View>
                </TouchableOpacity>
              </React.Fragment>
            ))
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showMemberPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMemberPicker(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMemberPicker(false)}
        >
          <View style={styles.memberPickerModal}>
            <Text style={styles.modalTitle}>Wissel van profiel</Text>
            {familyMembers.map((member, index) => (
              <React.Fragment key={index}>
                <TouchableOpacity
                  style={styles.memberOption}
                  onPress={() => {
                    setCurrentUser(member);
                    setShowMemberPicker(false);
                  }}
                >
                  <View style={[styles.memberOptionAvatar, { backgroundColor: member.color || colors.accent }]}>
                    {member.photoUri ? (
                      <Image source={{ uri: member.photoUri }} style={styles.memberOptionPhoto} />
                    ) : (
                      <Text style={styles.memberOptionAvatarText}>{member.name.charAt(0)}</Text>
                    )}
                  </View>
                  <View style={styles.memberOptionInfo}>
                    <Text style={styles.memberOptionName}>{member.name}</Text>
                    <Text style={styles.memberOptionRole}>
                      {member.role === 'parent' ? '👨‍👩‍👧‍👦 Ouder' : '👶 Kind'}
                    </Text>
                  </View>
                  {currentUser.id === member.id && (
                    <IconSymbol 
                      ios_icon_name="checkmark" 
                      android_material_icon_name="check" 
                      size={24} 
                      color={colors.accent} 
                    />
                  )}
                </TouchableOpacity>
              </React.Fragment>
            ))}
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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 140,
  },
  selectionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  selectionEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  selectionTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
    fontFamily: 'Poppins_700Bold',
  },
  selectionSubtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 40,
    fontFamily: 'Nunito_400Regular',
  },
  memberGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    justifyContent: 'center',
  },
  memberCard: {
    width: 150,
    aspectRatio: 1,
    borderRadius: 20,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  memberCardAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    overflow: 'hidden',
  },
  memberCardPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  memberCardAvatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.card,
    fontFamily: 'Poppins_700Bold',
  },
  memberCardName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.card,
    marginBottom: 5,
    fontFamily: 'Poppins_700Bold',
  },
  memberCardRole: {
    fontSize: 14,
    color: colors.card,
    fontFamily: 'Nunito_400Regular',
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
  tagline: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 5,
    fontStyle: 'italic',
    fontFamily: 'Nunito_400Regular',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 5,
    fontFamily: 'Nunito_400Regular',
  },
  memberSelector: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
    borderWidth: 2,
  },
  memberSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    overflow: 'hidden',
  },
  memberAvatarPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  memberAvatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.card,
    fontFamily: 'Poppins_700Bold',
  },
  memberSelectorName: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
  },
  coinsCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
    borderWidth: 2,
  },
  coinsEmoji: {
    fontSize: 48,
    marginRight: 15,
  },
  coinsLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 5,
    fontFamily: 'Nunito_400Regular',
  },
  coinsAmount: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 15,
    fontFamily: 'Poppins_600SemiBold',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.vibrantOrange,
    fontFamily: 'Poppins_600SemiBold',
  },
  dailyOverviewCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  dailyOverviewItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  dailyOverviewIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  dailyOverviewCustomIcon: {
    width: 20,
    height: 20,
  },
  dailyOverviewContent: {
    flex: 1,
  },
  dailyOverviewTime: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accent,
    marginBottom: 4,
    fontFamily: 'Poppins_700Bold',
  },
  dailyOverviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    fontFamily: 'Poppins_600SemiBold',
  },
  dailyOverviewCoins: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  dailyOverviewDivider: {
    height: 1,
    backgroundColor: colors.background,
    marginVertical: 8,
  },
  appointmentCard: {
    backgroundColor: colors.card,
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  appointmentTime: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.accent,
    marginBottom: 5,
    fontFamily: 'Poppins_700Bold',
  },
  appointmentTitle: {
    fontSize: 16,
    color: colors.text,
    fontFamily: 'Nunito_400Regular',
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
    textAlign: 'center',
  },
  taskCard: {
    backgroundColor: colors.card,
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  taskIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  taskCustomIcon: {
    width: 24,
    height: 24,
  },
  taskName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
  },
  taskCoins: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  taskCoinsText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.card,
    fontFamily: 'Poppins_700Bold',
  },
  quickItem: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    boxShadow: `0px 2px 8px ${colors.shadow}`,
    elevation: 2,
  },
  quickItemText: {
    fontSize: 14,
    color: colors.text,
    fontFamily: 'Nunito_400Regular',
  },
  notePreviewCard: {
    backgroundColor: colors.card,
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  notePreviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 5,
    fontFamily: 'Poppins_600SemiBold',
  },
  notePreviewContent: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  memberPickerModal: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
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
  memberOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    backgroundColor: colors.background,
  },
  memberOptionAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    overflow: 'hidden',
  },
  memberOptionPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  memberOptionAvatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.card,
    fontFamily: 'Poppins_700Bold',
  },
  memberOptionInfo: {
    flex: 1,
  },
  memberOptionName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
    fontFamily: 'Poppins_600SemiBold',
  },
  memberOptionRole: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
});

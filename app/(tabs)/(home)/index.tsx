
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useFamily } from '@/contexts/FamilyContext';

const { width: screenWidth } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { familyMembers, currentUser, setCurrentUser, tasks, appointments } = useFamily();
  const [showMemberPicker, setShowMemberPicker] = useState(!currentUser);
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

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

  // Get today's tasks (max 2 for slider)
  const myTasks = tasks.filter(t => t.assignedTo === currentUser.id && !t.completed);
  const todayTasks = myTasks.slice(0, 2);
  const totalTasksCount = myTasks.length;

  // Get today's appointments
  const myAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date);
    aptDate.setHours(0, 0, 0, 0);
    return apt.assignedTo.includes(currentUser.id) && aptDate.getTime() === today.getTime();
  });

  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentSlide(index);
  };

  // Menu sections to display below slider - NEW ORDER: Agenda, Taken, Boodschappen, Financiën, Herinneringen, Maaltijden
  const menuSections = [
    { icon: 'calendar-today', label: 'Agenda', route: '/(tabs)/agenda', color: colors.vibrantBlue },
    { icon: 'check-circle', label: 'Taken', route: '/(tabs)/tasks', color: colors.vibrantGreen },
    { icon: 'list', label: 'Boodschappen', route: '/(tabs)/shopping', color: colors.vibrantOrange },
    { icon: 'custom-euro', label: 'Financiën', route: '/(tabs)/finances', color: colors.vibrantGreen },
    { icon: 'notifications', label: 'Herinneringen', route: '/(tabs)/reminders', color: colors.vibrantPurple },
    { icon: 'restaurant', label: 'Maaltijden', route: '/(tabs)/meals', color: colors.vibrantPink },
    { icon: 'folder', label: 'Notities', route: '/(tabs)/notes', color: colors.vibrantPurple },
    { icon: 'shopping-bag', label: 'Shop', route: '/(tabs)/shop', color: colors.vibrantTeal },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Header with user name on left, Flow Fam in center, settings on right */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.userNameButton}
            onPress={() => setShowMemberPicker(true)}
          >
            <View style={[styles.smallAvatar, { backgroundColor: memberColor }]}>
              {currentUser.photoUri ? (
                <Image source={{ uri: currentUser.photoUri }} style={styles.smallAvatarPhoto} />
              ) : (
                <Text style={styles.smallAvatarText}>{currentUser.name.charAt(0)}</Text>
              )}
            </View>
            <Text style={styles.userName}>{currentUser.name}</Text>
            <IconSymbol 
              ios_icon_name="chevron.down" 
              android_material_icon_name="arrow_drop_down" 
              size={20} 
              color={colors.text} 
            />
          </TouchableOpacity>

          <View style={styles.centerHeader}>
            <Text style={styles.title}>Flow Fam</Text>
            <Text style={styles.tagline}>Rust, overzicht en liefde</Text>
          </View>

          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <IconSymbol 
              ios_icon_name="gear" 
              android_material_icon_name="settings" 
              size={24} 
              color={colors.text} 
            />
          </TouchableOpacity>
        </View>

        {/* Slider with 2 slides */}
        <View style={styles.sliderContainer}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            style={styles.slider}
          >
            {/* Slide 1: Tasks */}
            <View style={[styles.slide, { width: screenWidth - 40 }]}>
              <View style={styles.slideCard}>
                <View style={styles.slideHeader}>
                  <Text style={styles.slideTitle}>✅ Taken vandaag</Text>
                  <View style={styles.taskBadge}>
                    <Text style={styles.taskBadgeText}>{totalTasksCount}</Text>
                  </View>
                </View>
                
                {todayTasks.length === 0 ? (
                  <View style={styles.emptySlide}>
                    <Text style={styles.emptyEmoji}>✨</Text>
                    <Text style={styles.emptyText}>Geen taken voor vandaag!</Text>
                  </View>
                ) : (
                  <>
                    {todayTasks.map((task, index) => (
                      <React.Fragment key={index}>
                        <View style={styles.taskItem}>
                          <View style={[styles.taskIcon, { backgroundColor: memberColor }]}>
                            {task.icon === 'brush' ? (
                              <Image
                                source={require('@/assets/images/37e069f3-3725-4165-ba07-912d50e9b6e8.png')}
                                style={[styles.taskCustomIcon, { tintColor: colors.card }]}
                                resizeMode="contain"
                              />
                            ) : (
                              <IconSymbol
                                ios_icon_name={task.icon}
                                android_material_icon_name={task.icon as any}
                                size={20}
                                color={colors.card}
                              />
                            )}
                          </View>
                          <Text style={styles.taskItemName}>{task.name}</Text>
                          <View style={[styles.taskCoins, { backgroundColor: memberColor }]}>
                            <Text style={styles.taskCoinsText}>{task.coins}🪙</Text>
                          </View>
                        </View>
                      </React.Fragment>
                    ))}
                    
                    <TouchableOpacity
                      style={[styles.slideButton, { backgroundColor: memberColor }]}
                      onPress={() => router.push('/(tabs)/tasks')}
                    >
                      <Text style={styles.slideButtonText}>Zie de rest van je taken</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>

            {/* Slide 2: Agenda */}
            <View style={[styles.slide, { width: screenWidth - 40 }]}>
              <View style={styles.slideCard}>
                <View style={styles.slideHeader}>
                  <Text style={styles.slideTitle}>📅 Agenda vandaag</Text>
                  <View style={styles.taskBadge}>
                    <Text style={styles.taskBadgeText}>{myAppointments.length}</Text>
                  </View>
                </View>
                
                {myAppointments.length === 0 ? (
                  <View style={styles.emptySlide}>
                    <Text style={styles.emptyEmoji}>📅</Text>
                    <Text style={styles.emptyText}>Geen afspraken vandaag!</Text>
                  </View>
                ) : (
                  <>
                    <Text style={styles.appointmentSummary}>
                      Je hebt {myAppointments.length} afspraak{myAppointments.length !== 1 ? 'en' : ''} vandaag
                    </Text>
                    
                    {myAppointments.slice(0, 2).map((apt, index) => (
                      <React.Fragment key={index}>
                        <View style={[styles.appointmentItem, { borderLeftColor: memberColor }]}>
                          <Text style={styles.appointmentTime}>{apt.time}</Text>
                          <Text style={styles.appointmentTitle}>{apt.title}</Text>
                        </View>
                      </React.Fragment>
                    ))}
                    
                    <TouchableOpacity
                      style={[styles.slideButton, { backgroundColor: memberColor }]}
                      onPress={() => router.push('/(tabs)/agenda')}
                    >
                      <Text style={styles.slideButtonText}>Ga naar agenda</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </ScrollView>

          {/* Slide indicators */}
          <View style={styles.slideIndicators}>
            {[0, 1].map((index) => (
              <React.Fragment key={index}>
                <View
                  style={[
                    styles.slideIndicator,
                    currentSlide === index && styles.slideIndicatorActive,
                  ]}
                />
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Menu sections below slider */}
        <View style={styles.menuGrid}>
          {menuSections.map((section, index) => (
            <React.Fragment key={index}>
              <TouchableOpacity
                style={styles.menuCard}
                onPress={() => router.push(section.route as any)}
              >
                <View style={[styles.menuIcon, { backgroundColor: section.color }]}>
                  {section.icon === 'custom-euro' ? (
                    <Image
                      source={require('@/assets/images/ef024723-5af7-4fad-8bd5-12b97c4294d7.png')}
                      style={[styles.menuCustomIcon, { tintColor: colors.card }]}
                      resizeMode="contain"
                    />
                  ) : (
                    <IconSymbol
                      ios_icon_name={section.icon}
                      android_material_icon_name={section.icon as any}
                      size={28}
                      color={colors.card}
                    />
                  )}
                </View>
                <Text style={styles.menuLabel}>{section.label}</Text>
              </TouchableOpacity>
            </React.Fragment>
          ))}
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
    paddingBottom: 40,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  userNameButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  smallAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    overflow: 'hidden',
  },
  smallAvatarPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  smallAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.card,
    fontFamily: 'Poppins_700Bold',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
  },
  centerHeader: {
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: -1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Poppins_700Bold',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 10,
    color: colors.textSecondary,
    fontStyle: 'italic',
    fontFamily: 'Nunito_400Regular',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: `0px 2px 8px ${colors.shadow}`,
    elevation: 2,
  },
  sliderContainer: {
    marginBottom: 30,
  },
  slider: {
    marginBottom: 15,
  },
  slide: {
    paddingHorizontal: 10,
  },
  slideCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
    minHeight: 200,
  },
  slideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  slideTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Poppins_700Bold',
  },
  taskBadge: {
    backgroundColor: colors.vibrantOrange,
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 30,
    alignItems: 'center',
  },
  taskBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.card,
    fontFamily: 'Poppins_700Bold',
  },
  emptySlide: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  taskIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taskCustomIcon: {
    width: 20,
    height: 20,
  },
  taskItemName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
  },
  taskCoins: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  taskCoinsText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.card,
    fontFamily: 'Poppins_700Bold',
  },
  appointmentSummary: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 15,
    fontFamily: 'Nunito_400Regular',
  },
  appointmentItem: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  appointmentTime: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accent,
    marginBottom: 4,
    fontFamily: 'Poppins_700Bold',
  },
  appointmentTitle: {
    fontSize: 14,
    color: colors.text,
    fontFamily: 'Nunito_400Regular',
  },
  slideButton: {
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  slideButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.card,
    fontFamily: 'Poppins_600SemiBold',
  },
  slideIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  slideIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textSecondary,
    opacity: 0.3,
  },
  slideIndicatorActive: {
    backgroundColor: colors.vibrantOrange,
    opacity: 1,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    justifyContent: 'space-between',
  },
  menuCard: {
    width: '47%',
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
    minHeight: 120,
    justifyContent: 'center',
  },
  menuIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuCustomIcon: {
    width: 28,
    height: 28,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    fontFamily: 'Poppins_600SemiBold',
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

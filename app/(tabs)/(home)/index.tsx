
import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  ScrollView,
  Platform,
  Text,
  Animated,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { colors } from "@/styles/commonStyles";
import { useFamily } from "@/contexts/FamilyContext";
import { supabase } from "@/utils/supabase";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SLIDER_WIDTH = SCREEN_WIDTH - 40; // Account for padding

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Goedemorgen";
  if (hour < 18) return "Goedemiddag";
  return "Goedenavond";
}

interface DashboardCardProps {
  title: string;
  icon: string;
  subtitle: string;
  route: string;
  backgroundColor: string;
}

function DashboardCard({
  title,
  icon,
  subtitle,
  route,
  backgroundColor,
}: DashboardCardProps) {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePress = () => {
    console.log("Card pressed, navigating to:", route);
    try {
      router.push(route as any);
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  return (
    <Animated.View 
      style={[styles.cardWrapper, { transform: [{ scale: scaleAnim }] }]}
    >
      <TouchableOpacity
        style={[styles.card, { backgroundColor }]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`${title} - ${subtitle}`}
      >
        <MaterialCommunityIcons
          name={icon as any}
          size={28}
          color="#F08A48"
          style={styles.cardIcon}
        />
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle}>
          {subtitle}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

interface Task {
  id: string;
  name: string;
  completed: boolean;
  due_date: string;
  time?: string;
}

interface Appointment {
  id: string;
  title: string;
  date: string;
  time: string;
}

export default function HomeScreen() {
  const { t } = useTranslation();
  const { currentUser, family } = useFamily();
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  // Extract first name from user profile, fallback to empty string
  const firstName = currentUser?.name?.split(" ")[0]?.trim() || "";
  const greeting = getGreeting();

  // Build greeting text with personalization
  const greetingText = firstName ? `${greeting}, ${firstName}!` : `${greeting}!`;

  // Fetch today's appointments and tasks
  useEffect(() => {
    async function fetchTodayData() {
      if (!family?.id) {
        console.log("No family ID found");
        setLoading(false);
        return;
      }

      try {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

        console.log("Fetching today's data for family:", family.id);
        console.log("Date range:", startOfDay.toISOString(), "to", endOfDay.toISOString());

        // Fetch today's appointments
        const { data: appointments, error: appointmentsError } = await supabase
          .from("appointments")
          .select("*")
          .eq("family_id", family.id)
          .gte("date", startOfDay.toISOString())
          .lte("date", endOfDay.toISOString())
          .order("time", { ascending: true });

        if (appointmentsError) {
          console.error("Error fetching appointments:", appointmentsError);
        } else {
          console.log("Appointments found:", appointments?.length || 0);
          setTodayAppointments(appointments || []);
        }

        // Fetch today's open tasks (adult tasks)
        const { data: tasks, error: tasksError } = await supabase
          .from("tasks")
          .select("*")
          .eq("family_id", family.id)
          .eq("is_adult_task", true)
          .eq("completed", false)
          .gte("due_date", startOfDay.toISOString())
          .lte("due_date", endOfDay.toISOString())
          .order("time", { ascending: true });

        if (tasksError) {
          console.error("Error fetching tasks:", tasksError);
        } else {
          console.log("Tasks found:", tasks?.length || 0);
          setTodayTasks(tasks || []);
        }
      } catch (error) {
        console.error("Error fetching today's data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTodayData();
  }, [family?.id]);

  // Handle scroll event to update current slide
  const handleScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / SLIDER_WIDTH);
    setCurrentSlide(slideIndex);
  };

  // Get first appointment for preview
  const firstAppointment = todayAppointments.length > 0 ? todayAppointments[0] : null;
  
  // Get first task for preview
  const firstTask = todayTasks.length > 0 ? todayTasks[0] : null;

  // Dashboard cards with new warm beige color
  const dashboardCards = [
    {
      title: t("home.menu.agenda"),
      icon: "calendar-month-outline",
      subtitle: `${todayAppointments.length} ${todayAppointments.length === 1 ? 'afspraak' : 'afspraken'}`,
      route: "/(tabs)/agenda",
      backgroundColor: "#F3EEE8",
    },
    {
      title: "Taken",
      icon: "calendar-check-outline",
      subtitle: `${todayTasks.length} ${todayTasks.length === 1 ? 'taak' : 'taken'}`,
      route: "/(tabs)/adult-tasks",
      backgroundColor: "#F3EEE8",
    },
    {
      title: t("home.menu.shopping"),
      icon: "cart-outline",
      subtitle: "Boodschappenlijst",
      route: "/(tabs)/shopping",
      backgroundColor: "#F3EEE8",
    },
    {
      title: t("home.menu.finances"),
      icon: "currency-eur",
      subtitle: "Financieel overzicht",
      route: "/(tabs)/finances",
      backgroundColor: "#F3EEE8",
    },
    {
      title: t("home.menu.contactbook"),
      icon: "book-outline",
      subtitle: "Contacten & verjaardagen",
      route: "/(tabs)/contactbook",
      backgroundColor: "#F3EEE8",
    },
    {
      title: t("home.menu.photobook"),
      icon: "camera-outline",
      subtitle: "Foto's & herinneringen",
      route: "/(tabs)/memories",
      backgroundColor: "#F3EEE8",
    },
  ];

  return (
    <View style={styles.wrapper}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Welcome Header */}
          <View style={styles.headerSection}>
            <Text style={styles.greetingText}>{greetingText}</Text>
          </View>

          {/* Daily Dashboard Slider */}
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
              {/* Slide 1: Appointments */}
              <View style={[styles.slide, { width: SLIDER_WIDTH }]}>
                <View style={styles.slideContent}>
                  <Text style={styles.slideNumber}>{todayAppointments.length}</Text>
                  <Text style={styles.slideLabel}>
                    {todayAppointments.length === 1 ? 'Afspraak vandaag' : 'Afspraken vandaag'}
                  </Text>
                  {firstAppointment && (
                    <View style={styles.previewContainer}>
                      <Text style={styles.previewText} numberOfLines={1}>
                        {firstAppointment.time && `${firstAppointment.time} • `}{firstAppointment.title}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Slide 2: Tasks */}
              <View style={[styles.slide, { width: SLIDER_WIDTH }]}>
                <View style={styles.slideContent}>
                  <Text style={styles.slideNumber}>{todayTasks.length}</Text>
                  <Text style={styles.slideLabel}>
                    {todayTasks.length === 1 ? 'Taak vandaag' : 'Taken vandaag'}
                  </Text>
                  {firstTask && (
                    <View style={styles.previewContainer}>
                      <Text style={styles.previewText} numberOfLines={1}>
                        {firstTask.time && `${firstTask.time} • `}{firstTask.name}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </ScrollView>

            {/* Pagination Dots */}
            <View style={styles.pagination}>
              <View style={[styles.dot, currentSlide === 0 && styles.activeDot]} />
              <View style={[styles.dot, currentSlide === 1 && styles.activeDot]} />
            </View>
          </View>

          {/* Dashboard Grid */}
          <View style={styles.gridContainer}>
            {dashboardCards.map((card, index) => (
              <React.Fragment key={index}>
                <DashboardCard
                  title={card.title}
                  icon={card.icon}
                  subtitle={card.subtitle}
                  route={card.route}
                  backgroundColor={card.backgroundColor}
                />
              </React.Fragment>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 48 : 12,
    paddingBottom: 120,
  },
  headerSection: {
    marginBottom: 16,
    marginTop: 20,
  },
  greetingText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#3B2F2A",
    fontFamily: "Poppins_700Bold",
  },
  sliderContainer: {
    marginBottom: 24,
  },
  slider: {
    width: SLIDER_WIDTH,
  },
  slide: {
    borderRadius: 20,
    backgroundColor: "#F3EEE8",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#E6DED6",
  },
  slideContent: {
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  slideNumber: {
    fontSize: 40,
    fontWeight: "700",
    color: "#F08A48",
    fontFamily: "Poppins_700Bold",
    marginBottom: 4,
    alignSelf: "flex-start",
  },
  slideLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3B2F2A",
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  previewContainer: {
    width: "100%",
    marginTop: 4,
  },
  previewText: {
    fontSize: 13,
    color: "#8C817A",
    fontFamily: "Nunito_400Regular",
    alignSelf: "flex-start",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E6DED6",
  },
  activeDot: {
    backgroundColor: "#F08A48",
    width: 24,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  cardWrapper: {
    width: "48%",
  },
  card: {
    borderRadius: 20,
    padding: 14,
    minHeight: 130,
    justifyContent: "flex-start",
    borderWidth: 1,
    borderColor: "#E6DED6",
  },
  cardIcon: {
    marginTop: 0,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Poppins_700Bold",
    marginBottom: 6,
    color: "#3B2F2A",
  },
  cardSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "Nunito_400Regular",
    color: "#8C817A",
    marginBottom: 0,
  },
});

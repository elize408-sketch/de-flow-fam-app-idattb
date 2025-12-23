
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

const DAILY_MESSAGES = [
  "Elke dag is een nieuwe kans.",
  "Rust en overzicht voor vandaag.",
  "Samen houden we het overzichtelijk.",
  "Je hoeft niet alles tegelijk.",
  "Kleine stappen zijn ook vooruitgang.",
  "Vandaag mag licht zijn.",
  "Je doet het goed.",
  "Alles op zijn tijd.",
];

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SLIDER_WIDTH = SCREEN_WIDTH - 40; // Account for padding

function getDailyMessage(): string {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return DAILY_MESSAGES[dayOfYear % DAILY_MESSAGES.length];
}

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
      pointerEvents="box-none"
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
          color="#3A2F2A"
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
  title: string;
  completed: boolean;
  due_date: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { currentUser, family } = useFamily();
  const [todayAppointments, setTodayAppointments] = useState(0);
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  // Extract first name from user profile, fallback to empty string
  const firstName = currentUser?.name?.split(" ")[0]?.trim() || "";
  const greeting = getGreeting();
  const dailyMessage = getDailyMessage();

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
          .lte("date", endOfDay.toISOString());

        if (appointmentsError) {
          console.error("Error fetching appointments:", appointmentsError);
        } else {
          console.log("Appointments found:", appointments?.length || 0);
          setTodayAppointments(appointments?.length || 0);
        }

        // Fetch today's open tasks (adult tasks)
        const { data: tasks, error: tasksError } = await supabase
          .from("tasks")
          .select("*")
          .eq("family_id", family.id)
          .eq("is_adult_task", true)
          .eq("completed", false)
          .gte("due_date", startOfDay.toISOString())
          .lte("due_date", endOfDay.toISOString());

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

  // Dashboard cards with subtle beige tones
  const dashboardCards = [
    {
      title: t("home.menu.agenda"),
      icon: "calendar-month-outline",
      subtitle: `${todayAppointments} ${todayAppointments === 1 ? 'afspraak' : 'afspraken'}`,
      route: "/agenda",
      backgroundColor: "#EFE5DC", // Agenda beige
    },
    {
      title: "Taken",
      icon: "calendar-check-outline",
      subtitle: `${todayTasks.length} ${todayTasks.length === 1 ? 'taak' : 'taken'}`,
      route: "/adult-tasks",
      backgroundColor: "#EEE9E2", // Taken beige
    },
    {
      title: t("home.menu.shopping"),
      icon: "cart-outline",
      subtitle: "Boodschappenlijst",
      route: "/shopping",
      backgroundColor: "#F1E7DA", // Boodschappen beige
    },
    {
      title: t("home.menu.finances"),
      icon: "currency-eur",
      subtitle: "Financieel overzicht",
      route: "/finances",
      backgroundColor: "#D8C8BC", // Financiën beige (geen rood)
    },
    {
      title: t("home.menu.contactbook"),
      icon: "book-outline",
      subtitle: "Contacten & verjaardagen",
      route: "/contactbook",
      backgroundColor: "#E9D3C6", // Contactboek beige
    },
    {
      title: t("home.menu.photobook"),
      icon: "camera-outline",
      subtitle: "Foto's & herinneringen",
      route: "/memories",
      backgroundColor: "#E6DDD4", // Fotoboek beige
    },
  ];

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Welcome Header */}
          <View style={styles.headerSection}>
            <Text style={styles.greetingText}>{greetingText}</Text>
            <Text style={styles.dailyMessage}>{dailyMessage}</Text>
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
                  <MaterialCommunityIcons
                    name="calendar-month"
                    size={40}
                    color="#3A2F2A"
                    style={styles.slideIcon}
                  />
                  <Text style={styles.slideNumber}>{todayAppointments}</Text>
                  <Text style={styles.slideLabel}>
                    {todayAppointments === 1 ? 'Afspraak vandaag' : 'Afspraken vandaag'}
                  </Text>
                </View>
              </View>

              {/* Slide 2: Tasks */}
              <View style={[styles.slide, { width: SLIDER_WIDTH }]}>
                <View style={styles.slideContent}>
                  <MaterialCommunityIcons
                    name="clipboard-check-outline"
                    size={40}
                    color="#3A2F2A"
                    style={styles.slideIcon}
                  />
                  <Text style={styles.slideNumber}>{todayTasks.length}</Text>
                  <Text style={styles.slideLabel}>
                    {todayTasks.length === 1 ? 'Taak vandaag' : 'Taken vandaag'}
                  </Text>
                  {todayTasks.length > 0 && (
                    <View style={styles.tasksList}>
                      {todayTasks.slice(0, 3).map((task, index) => (
                        <Text key={index} style={styles.taskItem}>
                          • {task.title}
                        </Text>
                      ))}
                      {todayTasks.length > 3 && (
                        <Text style={styles.taskItem}>
                          + {todayTasks.length - 3} meer
                        </Text>
                      )}
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
          <View style={styles.gridContainer} pointerEvents="box-none">
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
    backgroundColor: "#FFFFFF", // White background
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
    marginBottom: 20,
    marginTop: 24,
  },
  greetingText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#3A2F2A", // Titel/icoon kleur
    fontFamily: "Poppins_700Bold",
    marginBottom: 8,
  },
  dailyMessage: {
    fontSize: 16,
    lineHeight: 24,
    color: "#7A6F67", // Subtekst kleur
    fontFamily: "Nunito_400Regular",
  },
  sliderContainer: {
    marginBottom: 32,
  },
  slider: {
    width: SLIDER_WIDTH,
  },
  slide: {
    borderRadius: 20,
    backgroundColor: "#F9F6F1",
    padding: 24,
    borderWidth: 1,
    borderColor: "#E2D6CC",
    ...Platform.select({
      ios: {
        shadowColor: "#3A2F2A",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: "0px 2px 12px rgba(58, 47, 42, 0.08)",
      },
    }),
  },
  slideContent: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 160,
  },
  slideIcon: {
    marginBottom: 12,
  },
  slideNumber: {
    fontSize: 48,
    fontWeight: "700",
    color: "#3A2F2A",
    fontFamily: "Poppins_700Bold",
    marginBottom: 8,
  },
  slideLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#3A2F2A",
    fontFamily: "Poppins_600SemiBold",
    textAlign: "center",
  },
  tasksList: {
    marginTop: 16,
    width: "100%",
    paddingHorizontal: 20,
  },
  taskItem: {
    fontSize: 14,
    color: "#7A6F67",
    fontFamily: "Nunito_400Regular",
    marginBottom: 6,
    textAlign: "left",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E2D6CC",
  },
  activeDot: {
    backgroundColor: "#3A2F2A",
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
    padding: 16,
    minHeight: 140,
    justifyContent: "flex-start",
    borderWidth: 1,
    borderColor: "#E2D6CC", // Subtiele border voor luxe look
    ...Platform.select({
      ios: {
        shadowColor: "#3A2F2A",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: "0px 2px 12px rgba(58, 47, 42, 0.08)",
      },
    }),
  },
  cardIcon: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Poppins_700Bold",
    marginBottom: 6,
    color: "#3A2F2A", // Titel kleur
  },
  cardSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "Nunito_400Regular",
    color: "#7A6F67", // Subtekst kleur
  },
});

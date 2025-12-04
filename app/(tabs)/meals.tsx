
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, Animated, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useFamily } from '@/contexts/FamilyContext';
import CheckmarkAnimation from '@/components/CheckmarkAnimation';
import * as ImagePicker from 'expo-image-picker';
import * as Calendar from 'expo-calendar';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ingredient, IngredientCategory } from '@/types/family';
import { categorizeIngredient, parseIngredient } from '@/utils/ingredientCategories';
import { useModuleTheme, ModuleName } from '@/contexts/ThemeContext';
import ModuleHeader from '@/components/ModuleHeader';
import ThemedButton from '@/components/ThemedButton';

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Maandag' },
  { key: 'tuesday', label: 'Dinsdag' },
  { key: 'wednesday', label: 'Woensdag' },
  { key: 'thursday', label: 'Donderdag' },
  { key: 'friday', label: 'Vrijdag' },
  { key: 'saturday', label: 'Zaterdag' },
  { key: 'sunday', label: 'Zondag' },
];

export default function MealsScreen() {
  const router = useRouter();
  const { setModule, accentColor } = useModuleTheme();
  const { 
    meals, 
    addMeal, 
    updateMeal, 
    deleteMeal, 
    addRecipeIngredientsToShoppingList,
    weekPlanningServings,
    setWeekPlanningServings,
  } = useFamily();
  
  // Set module theme on mount - use light blue color
  useEffect(() => {
    setModule('meals' as ModuleName);
  }, [setModule]);
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [showSpinnerModal, setShowSpinnerModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showCheckmarkAnimation, setShowCheckmarkAnimation] = useState(false);
  const [selectedMealForDetail, setSelectedMealForDetail] = useState<any>(null);
  const [selectedMealForEdit, setSelectedMealForEdit] = useState<any>(null);
  const [selectedMealForPlan, setSelectedMealForPlan] = useState<any>(null);
  const [newMealName, setNewMealName] = useState('');
  const [newMealIngredients, setNewMealIngredients] = useState('');
  const [newMealInstructions, setNewMealInstructions] = useState('');
  const [newMealPhoto, setNewMealPhoto] = useState<string | undefined>(undefined);
  const [aiIngredients, setAiIngredients] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [spinValue] = useState(new Animated.Value(0));
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [planDate, setPlanDate] = useState(new Date());
  const [planTime, setPlanTime] = useState('18:00');
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Week planning state
  const [weekPlanning, setWeekPlanning] = useState<{ [key: string]: any }>({});
  const [showRecipeSelector, setShowRecipeSelector] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>('');
  
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Load week planning on mount
  useEffect(() => {
    loadWeekPlanning();
  }, []);

  const loadWeekPlanning = async () => {
    // TODO: Load from Supabase when user authentication is implemented
    // For now, use local state
    console.log('Loading week planning...');
  };

  const handleSelectRecipeForDay = (day: string) => {
    setSelectedDay(day);
    setShowRecipeSelector(true);
  };

  const handleAssignRecipeToDay = (recipe: any) => {
    setWeekPlanning(prev => ({
      ...prev,
      [selectedDay]: recipe,
    }));
    setShowRecipeSelector(false);
    setSelectedDay('');
    
    // TODO: Save to Supabase when user authentication is implemented
    console.log(`Assigned ${recipe.name} to ${selectedDay}`);
    Alert.alert('Gelukt!', `${recipe.name} is toegevoegd aan ${DAYS_OF_WEEK.find(d => d.key === selectedDay)?.label}`);
  };

  const handleRemoveRecipeFromDay = (day: string) => {
    Alert.alert(
      'Verwijderen?',
      'Weet je zeker dat je dit recept wilt verwijderen uit de weekplanning?',
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Verwijderen',
          onPress: () => {
            setWeekPlanning(prev => {
              const newPlanning = { ...prev };
              delete newPlanning[day];
              return newPlanning;
            });
            Alert.alert('Verwijderd', 'Recept is verwijderd uit de weekplanning');
          },
          style: 'destructive',
        },
      ]
    );
  };

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
      setNewMealPhoto(result.assets[0].uri);
    }
  };

  const handleAddMeal = () => {
    if (!newMealName.trim()) {
      Alert.alert('Fout', 'Vul een naam in voor het recept');
      return;
    }

    // Parse ingredients
    const ingredientLines = newMealIngredients
      .split('\n')
      .filter(i => i.trim())
      .map(i => i.trim());

    const ingredients: Ingredient[] = ingredientLines.map(line => {
      const parsed = parseIngredient(line);
      const category = categorizeIngredient(parsed.name);
      return {
        name: parsed.name,
        quantity: parsed.quantity,
        unit: parsed.unit,
        category,
      };
    });

    addMeal({
      name: newMealName.trim(),
      type: 'dinner',
      ingredients,
      instructions: newMealInstructions.trim(),
      prepTime: 30,
      servings: 2,
      baseServings: 2,
      photoUri: newMealPhoto,
    });

    setNewMealName('');
    setNewMealIngredients('');
    setNewMealInstructions('');
    setNewMealPhoto(undefined);
    setShowAddMealModal(false);
    Alert.alert('Gelukt!', 'Recept toegevoegd');
  };

  const handleUpdateMeal = () => {
    if (!selectedMealForEdit || !newMealName.trim()) {
      Alert.alert('Fout', 'Vul een naam in voor het recept');
      return;
    }

    // Parse ingredients
    const ingredientLines = newMealIngredients
      .split('\n')
      .filter(i => i.trim())
      .map(i => i.trim());

    const ingredients: Ingredient[] = ingredientLines.map(line => {
      const parsed = parseIngredient(line);
      const category = categorizeIngredient(parsed.name);
      return {
        name: parsed.name,
        quantity: parsed.quantity,
        unit: parsed.unit,
        category,
      };
    });

    updateMeal(selectedMealForEdit.id, {
      name: newMealName.trim(),
      ingredients,
      instructions: newMealInstructions.trim(),
      photoUri: newMealPhoto,
    });

    setNewMealName('');
    setNewMealIngredients('');
    setNewMealInstructions('');
    setNewMealPhoto(undefined);
    setSelectedMealForEdit(null);
    setShowEditModal(false);
    Alert.alert('Gelukt!', 'Recept bijgewerkt');
  };

  const openEditModal = (meal: any) => {
    setSelectedMealForEdit(meal);
    setNewMealName(meal.name);
    
    // Convert ingredients back to text format
    if (meal.ingredients && Array.isArray(meal.ingredients)) {
      const ingredientText = meal.ingredients
        .map((ing: Ingredient) => `${ing.quantity} ${ing.unit} ${ing.name}`)
        .join('\n');
      setNewMealIngredients(ingredientText);
    } else {
      setNewMealIngredients('');
    }
    
    setNewMealInstructions(meal.instructions || '');
    setNewMealPhoto(meal.photoUri);
    setShowEditModal(true);
  };

  const openDetailModal = (meal: any) => {
    setSelectedMealForDetail(meal);
    setShowDetailModal(true);
  };

  const handleAddIngredientsToShoppingList = async (meal: any) => {
    if (!meal.ingredients || meal.ingredients.length === 0) {
      Alert.alert('Geen ingrediënten', 'Dit recept heeft geen ingrediënten');
      return;
    }

    try {
      const result = await addRecipeIngredientsToShoppingList(meal);
      
      if (result.skipped.length > 0) {
        Alert.alert(
          'Ingrediënten toegevoegd',
          `${result.added} ingrediënten toegevoegd.\n\nSommige ingrediënten stonden al in je voorraadkast:\n${result.skipped.join(', ')}`,
          [{ text: 'OK' }]
        );
      } else {
        setShowCheckmarkAnimation(true);
        setTimeout(() => {
          Alert.alert('Gelukt!', 'Ingrediënten toegevoegd aan je boodschappenlijst!');
        }, 1500);
      }
    } catch (error) {
      console.error('Error adding ingredients:', error);
      Alert.alert('Fout', 'Er ging iets mis bij het toevoegen van ingrediënten');
    }
  };

  const handlePlanInAgenda = async (meal: any) => {
    setSelectedMealForPlan(meal);
    setShowPlanModal(true);
  };

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 1.15,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const confirmPlanInAgenda = async () => {
    if (!selectedMealForPlan) return;

    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Toestemming vereist',
          'Je moet toegang geven tot je agenda om maaltijden te kunnen plannen',
          [{ text: 'OK' }]
        );
        return;
      }

      const defaultCalendar = await Calendar.getDefaultCalendarAsync();
      
      if (!defaultCalendar) {
        Alert.alert('Fout', 'Geen standaard agenda gevonden');
        return;
      }

      const startDate = new Date(planDate);
      const [hours, minutes] = planTime.split(':');
      startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      const endDate = new Date(startDate);
      endDate.setHours(startDate.getHours() + 1);

      const eventId = await Calendar.createEventAsync(defaultCalendar.id, {
        title: `🍽️ ${selectedMealForPlan.name}`,
        startDate,
        endDate,
        notes: selectedMealForPlan.instructions || 'Maaltijd gepland vanuit Flow Fam',
        timeZone: 'Europe/Amsterdam',
      });

      console.log('Event created with ID:', eventId);
      
      animateButton();
      
      setShowPlanModal(false);
      setSelectedMealForPlan(null);
      setPlanDate(new Date());
      setPlanTime('18:00');
      
      Alert.alert('Gelukt!', `${selectedMealForPlan.name} is toegevoegd aan je agenda`);
    } catch (error) {
      console.error('Error creating calendar event:', error);
      Alert.alert('Fout', 'Er ging iets mis bij het toevoegen aan de agenda');
    }
  };

  const spinWheel = () => {
    if (meals.length === 0) {
      Alert.alert('Geen recepten', 'Voeg eerst recepten toe om het rad te kunnen draaien');
      return;
    }

    setIsSpinning(true);
    spinValue.setValue(0);

    Animated.timing(spinValue, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: true,
    }).start(() => {
      const randomIndex = Math.floor(Math.random() * meals.length);
      setSelectedMeal(meals[randomIndex]);
      setIsSpinning(false);
    });
  };

  const generateAISuggestion = () => {
    if (!aiIngredients.trim()) {
      Alert.alert('Fout', 'Vul ingrediënten in');
      return;
    }

    const ingredients = aiIngredients.split(',').map(i => i.trim());
    const suggestions = [
      `Pasta met ${ingredients[0] || 'groenten'} en ${ingredients[1] || 'kaas'}`,
      `Roerbak met ${ingredients[0] || 'kip'} en ${ingredients[1] || 'rijst'}`,
      `Salade met ${ingredients[0] || 'tomaat'} en ${ingredients[1] || 'komkommer'}`,
      `Soep van ${ingredients[0] || 'pompoen'} met ${ingredients[1] || 'room'}`,
    ];

    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    setAiSuggestion(randomSuggestion);
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '1440deg'],
  });

  return (
    <View style={styles.container}>
      <ModuleHeader
        title="Maaltijden"
        subtitle="Recepten en maaltijdplanning"
      />

      <ScrollView contentContainerStyle={styles.contentContainer}>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: accentColor }]}
            onPress={() => setShowAddMealModal(true)}
          >
            <IconSymbol
              ios_icon_name="plus"
              android_material_icon_name="add"
              size={24}
              color={colors.card}
            />
            <Text style={[styles.actionButtonText, { color: colors.card }]}>Recept toevoegen</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.secondary }]}
            onPress={() => setShowSpinnerModal(true)}
          >
            <IconSymbol
              ios_icon_name="arrow-clockwise"
              android_material_icon_name="refresh"
              size={24}
              color={colors.text}
            />
            <Text style={styles.actionButtonText}>Maaltijd rad</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => setShowAIModal(true)}
          >
            <IconSymbol
              ios_icon_name="sparkles"
              android_material_icon_name="auto-awesome"
              size={24}
              color={colors.text}
            />
            <Text style={styles.actionButtonText}>AI Suggestie</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mijn recepten ({meals.length})</Text>
          {meals.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>🍽️</Text>
              <Text style={styles.emptyStateText}>Nog geen recepten</Text>
              <Text style={styles.emptyStateSubtext}>Voeg je eerste recept toe!</Text>
            </View>
          ) : (
            meals.map((meal, index) => (
              <React.Fragment key={index}>
                <TouchableOpacity 
                  style={styles.mealCard}
                  onPress={() => openDetailModal(meal)}
                >
                  {meal.photoUri ? (
                    <Image source={{ uri: meal.photoUri }} style={styles.mealPhoto} />
                  ) : (
                    <View style={styles.mealIcon}>
                      <Text style={styles.mealIconEmoji}>🍽️</Text>
                    </View>
                  )}
                  <View style={styles.mealInfo}>
                    <Text style={styles.mealName}>{meal.name}</Text>
                    {meal.ingredients && (
                      <Text style={styles.mealMeta}>
                        {meal.ingredients.length} ingrediënten
                      </Text>
                    )}
                    {meal.prepTime && (
                      <Text style={styles.mealMeta}>⏱️ {meal.prepTime} min</Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      Alert.alert(
                        'Verwijderen?',
                        `Weet je zeker dat je ${meal.name} wilt verwijderen?`,
                        [
                          { text: 'Annuleren', style: 'cancel' },
                          { 
                            text: 'Verwijderen', 
                            onPress: () => {
                              deleteMeal(meal.id);
                              Alert.alert('Verwijderd', 'Recept is verwijderd');
                            }, 
                            style: 'destructive' 
                          },
                        ]
                      );
                    }}
                  >
                    <IconSymbol
                      ios_icon_name="trash"
                      android_material_icon_name="delete"
                      size={20}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              </React.Fragment>
            ))
          )}
        </View>

        {/* Servings Stepper Section */}
        <View style={styles.section}>
          <View style={styles.servingsCard}>
            <Text style={styles.servingsTitle}>Voor hoeveel personen kook je deze week?</Text>
            <View style={styles.stepperContainer}>
              <TouchableOpacity
                style={[styles.stepperButton, weekPlanningServings <= 1 && styles.stepperButtonDisabled]}
                onPress={() => {
                  if (weekPlanningServings > 1) {
                    setWeekPlanningServings(weekPlanningServings - 1);
                  }
                }}
                disabled={weekPlanningServings <= 1}
              >
                <IconSymbol
                  ios_icon_name="minus"
                  android_material_icon_name="remove"
                  size={24}
                  color={weekPlanningServings <= 1 ? colors.textSecondary : colors.text}
                />
              </TouchableOpacity>
              
              <View style={styles.servingsDisplay}>
                <Text style={styles.servingsNumber}>{weekPlanningServings}</Text>
                <Text style={styles.servingsLabel}>
                  {weekPlanningServings === 1 ? 'persoon' : 'personen'}
                </Text>
              </View>
              
              <TouchableOpacity
                style={[styles.stepperButton, weekPlanningServings >= 10 && styles.stepperButtonDisabled]}
                onPress={() => {
                  if (weekPlanningServings < 10) {
                    setWeekPlanningServings(weekPlanningServings + 1);
                  }
                }}
                disabled={weekPlanningServings >= 10}
              >
                <IconSymbol
                  ios_icon_name="plus"
                  android_material_icon_name="add"
                  size={24}
                  color={weekPlanningServings >= 10 ? colors.textSecondary : colors.text}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Week Planning Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekplanning – Diner</Text>
          {DAYS_OF_WEEK.map((day, index) => {
            const assignedRecipe = weekPlanning[day.key];
            return (
              <React.Fragment key={index}>
                <View style={styles.dayCard}>
                  <View style={styles.dayCardHeader}>
                    <Text style={styles.dayCardTitle}>{day.label}</Text>
                    <Text style={styles.dayCardSubtitle}>Diner:</Text>
                  </View>
                  
                  {assignedRecipe ? (
                    <View style={styles.assignedRecipeContainer}>
                      <TouchableOpacity
                        style={styles.assignedRecipe}
                        onPress={() => openDetailModal(assignedRecipe)}
                      >
                        {assignedRecipe.photoUri ? (
                          <Image source={{ uri: assignedRecipe.photoUri }} style={styles.assignedRecipePhoto} />
                        ) : (
                          <View style={styles.assignedRecipeIcon}>
                            <Text style={styles.assignedRecipeIconEmoji}>🍽️</Text>
                          </View>
                        )}
                        <View style={styles.assignedRecipeInfo}>
                          <Text style={styles.assignedRecipeName}>{assignedRecipe.name}</Text>
                          {assignedRecipe.prepTime && (
                            <Text style={styles.assignedRecipeMeta}>⏱️ {assignedRecipe.prepTime} min</Text>
                          )}
                        </View>
                      </TouchableOpacity>
                      
                      <View style={styles.recipeActions}>
                        <TouchableOpacity
                          style={[styles.addIngredientsButton, { borderColor: accentColor }]}
                          onPress={() => handleAddIngredientsToShoppingList(assignedRecipe)}
                        >
                          <IconSymbol
                            ios_icon_name="cart-badge-plus"
                            android_material_icon_name="add-shopping-cart"
                            size={20}
                            color={accentColor}
                          />
                          <Text style={[styles.addIngredientsButtonText, { color: accentColor }]}>
                            Voeg ingrediënten toe aan boodschappenlijstje
                          </Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                          style={styles.removeRecipeButton}
                          onPress={() => handleRemoveRecipeFromDay(day.key)}
                        >
                          <IconSymbol
                            ios_icon_name="xmark-circle"
                            android_material_icon_name="cancel"
                            size={24}
                            color={colors.textSecondary}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.selectRecipeButton}
                      onPress={() => handleSelectRecipeForDay(day.key)}
                    >
                      <IconSymbol
                        ios_icon_name="plus-circle"
                        android_material_icon_name="add-circle"
                        size={20}
                        color={colors.accent}
                      />
                      <Text style={styles.selectRecipeButtonText}>Kies recept</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </React.Fragment>
            );
          })}
        </View>
      </ScrollView>

      <CheckmarkAnimation
        visible={showCheckmarkAnimation}
        onComplete={() => setShowCheckmarkAnimation(false)}
      />

      {/* Recipe Selector Modal */}
      <Modal
        visible={showRecipeSelector}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRecipeSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Kies een recept</Text>
            <Text style={styles.modalSubtitle}>
              Voor {DAYS_OF_WEEK.find(d => d.key === selectedDay)?.label}
            </Text>

            <ScrollView style={styles.recipeList}>
              {meals.length === 0 ? (
                <View style={styles.emptyRecipeList}>
                  <Text style={styles.emptyRecipeListText}>Geen recepten beschikbaar</Text>
                  <Text style={styles.emptyRecipeListSubtext}>Voeg eerst recepten toe</Text>
                </View>
              ) : (
                meals.map((meal, index) => (
                  <React.Fragment key={index}>
                    <TouchableOpacity
                      style={styles.recipeListItem}
                      onPress={() => handleAssignRecipeToDay(meal)}
                    >
                      {meal.photoUri ? (
                        <Image source={{ uri: meal.photoUri }} style={styles.recipeListPhoto} />
                      ) : (
                        <View style={styles.recipeListIcon}>
                          <Text style={styles.recipeListIconEmoji}>🍽️</Text>
                        </View>
                      )}
                      <View style={styles.recipeListInfo}>
                        <Text style={styles.recipeListName}>{meal.name}</Text>
                        {meal.prepTime && (
                          <Text style={styles.recipeListMeta}>⏱️ {meal.prepTime} min</Text>
                        )}
                      </View>
                      <IconSymbol
                        ios_icon_name="chevron-right"
                        android_material_icon_name="chevron-right"
                        size={20}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </React.Fragment>
                ))
              )}
            </ScrollView>

            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonCancel]}
              onPress={() => {
                setShowRecipeSelector(false);
                setSelectedDay('');
              }}
            >
              <Text style={styles.modalButtonText}>Annuleren</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Recipe Detail Modal */}
      <Modal
        visible={showDetailModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              {selectedMealForDetail && (
                <>
                  {selectedMealForDetail.photoUri ? (
                    <Image 
                      source={{ uri: selectedMealForDetail.photoUri }} 
                      style={styles.detailPhoto} 
                    />
                  ) : (
                    <View style={styles.detailPhotoPlaceholder}>
                      <Text style={styles.detailPhotoEmoji}>🍽️</Text>
                    </View>
                  )}
                  
                  <Text style={styles.detailTitle}>{selectedMealForDetail.name}</Text>
                  
                  {selectedMealForDetail.ingredients && selectedMealForDetail.ingredients.length > 0 && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Ingrediënten:</Text>
                      {selectedMealForDetail.ingredients.map((ingredient: Ingredient, idx: number) => (
                        <React.Fragment key={idx}>
                          <Text style={styles.detailIngredient}>
                            • {ingredient.quantity} {ingredient.unit} {ingredient.name}
                          </Text>
                        </React.Fragment>
                      ))}
                    </View>
                  )}
                  
                  {selectedMealForDetail.instructions && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Bereidingswijze:</Text>
                      <Text style={styles.detailInstructions}>{selectedMealForDetail.instructions}</Text>
                    </View>
                  )}
                  
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonConfirm, { marginBottom: 10, backgroundColor: accentColor }]}
                    onPress={() => {
                      handleAddIngredientsToShoppingList(selectedMealForDetail);
                      setShowDetailModal(false);
                    }}
                  >
                    <IconSymbol
                      ios_icon_name="cart"
                      android_material_icon_name="shopping-cart"
                      size={20}
                      color={colors.card}
                    />
                    <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm, { marginLeft: 8 }]}>
                      Ingrediënten toevoegen aan boodschappenlijst
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonConfirm, { marginBottom: 10, backgroundColor: colors.vibrantPurple }]}
                    onPress={() => {
                      setShowDetailModal(false);
                      handlePlanInAgenda(selectedMealForDetail);
                    }}
                  >
                    <IconSymbol
                      ios_icon_name="calendar"
                      android_material_icon_name="event"
                      size={20}
                      color={colors.card}
                    />
                    <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm, { marginLeft: 8 }]}>
                      Plan in mijn agenda
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, { marginBottom: 10, backgroundColor: accentColor }]}
                    onPress={() => {
                      setShowDetailModal(false);
                      openEditModal(selectedMealForDetail);
                    }}
                  >
                    <IconSymbol
                      ios_icon_name="pencil"
                      android_material_icon_name="edit"
                      size={20}
                      color={colors.card}
                    />
                    <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm, { marginLeft: 8 }]}>
                      Recept wijzigen
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonCancel]}
                    onPress={() => setShowDetailModal(false)}
                  >
                    <Text style={styles.modalButtonText}>Sluiten</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Plan in Agenda Modal */}
      <Modal
        visible={showPlanModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPlanModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Plan in agenda</Text>
            {selectedMealForPlan && (
              <Text style={styles.planMealName}>{selectedMealForPlan.name}</Text>
            )}

            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                📅 {planDate.toLocaleDateString('nl-NL')}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={planDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setPlanDate(selectedDate);
                  }
                }}
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="Tijd (bijv. 18:00)"
              placeholderTextColor={colors.textSecondary}
              value={planTime}
              onChangeText={setPlanTime}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowPlanModal(false);
                  setSelectedMealForPlan(null);
                  setPlanDate(new Date());
                  setPlanTime('18:00');
                }}
              >
                <Text style={styles.modalButtonText}>Annuleren</Text>
              </TouchableOpacity>
              <Animated.View style={{ flex: 1, transform: [{ scale: buttonScale }] }}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonConfirm, { backgroundColor: accentColor }]}
                  onPress={confirmPlanInAgenda}
                >
                  <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>Toevoegen</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Meal Modal */}
      <Modal
        visible={showAddMealModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddMealModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Nieuw recept toevoegen</Text>

              <TextInput
                style={styles.input}
                placeholder="Naam van het recept"
                placeholderTextColor={colors.textSecondary}
                value={newMealName}
                onChangeText={setNewMealName}
              />

              <TouchableOpacity style={styles.photoButton} onPress={handlePickPhoto}>
                {newMealPhoto ? (
                  <Image source={{ uri: newMealPhoto }} style={styles.photoPreview} />
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
                placeholder="Ingrediënten (bijv: 200 gram pasta, 2 st tomaten)"
                placeholderTextColor={colors.textSecondary}
                value={newMealIngredients}
                onChangeText={setNewMealIngredients}
                multiline
                numberOfLines={4}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Bereidingswijze"
                placeholderTextColor={colors.textSecondary}
                value={newMealInstructions}
                onChangeText={setNewMealInstructions}
                multiline
                numberOfLines={4}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => {
                    setShowAddMealModal(false);
                    setNewMealName('');
                    setNewMealIngredients('');
                    setNewMealInstructions('');
                    setNewMealPhoto(undefined);
                  }}
                >
                  <Text style={styles.modalButtonText}>Annuleren</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonConfirm, { backgroundColor: accentColor }]}
                  onPress={handleAddMeal}
                >
                  <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>Toevoegen</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Edit Meal Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Recept wijzigen</Text>

              <TextInput
                style={styles.input}
                placeholder="Naam van het recept"
                placeholderTextColor={colors.textSecondary}
                value={newMealName}
                onChangeText={setNewMealName}
              />

              <TouchableOpacity style={styles.photoButton} onPress={handlePickPhoto}>
                {newMealPhoto ? (
                  <Image source={{ uri: newMealPhoto }} style={styles.photoPreview} />
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
                placeholder="Ingrediënten (bijv: 200 gram pasta, 2 st tomaten)"
                placeholderTextColor={colors.textSecondary}
                value={newMealIngredients}
                onChangeText={setNewMealIngredients}
                multiline
                numberOfLines={4}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Bereidingswijze"
                placeholderTextColor={colors.textSecondary}
                value={newMealInstructions}
                onChangeText={setNewMealInstructions}
                multiline
                numberOfLines={4}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => {
                    setShowEditModal(false);
                    setSelectedMealForEdit(null);
                    setNewMealName('');
                    setNewMealIngredients('');
                    setNewMealInstructions('');
                    setNewMealPhoto(undefined);
                  }}
                >
                  <Text style={styles.modalButtonText}>Annuleren</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonConfirm, { backgroundColor: accentColor }]}
                  onPress={handleUpdateMeal}
                >
                  <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>Opslaan</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Spinner Modal */}
      <Modal
        visible={showSpinnerModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowSpinnerModal(false);
          setSelectedMeal(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.spinnerModal}>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => {
                setShowSpinnerModal(false);
                setSelectedMeal(null);
                router.push('/(tabs)/(home)');
              }}
            >
              <IconSymbol
                ios_icon_name="xmark"
                android_material_icon_name="close"
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Maaltijd rad</Text>
            <Text style={styles.spinnerSubtitle}>Draai aan het rad voor een willekeurig recept!</Text>

            <Animated.View style={[styles.wheel, { transform: [{ rotate: spin }] }]}>
              {selectedMeal && selectedMeal.photoUri ? (
                <Image source={{ uri: selectedMeal.photoUri }} style={styles.wheelPhoto} />
              ) : (
                <View style={styles.wheelInner}>
                  <Text style={styles.wheelEmoji}>🍽️</Text>
                </View>
              )}
            </Animated.View>

            {selectedMeal && !isSpinning && (
              <View style={styles.selectedMealContainer}>
                <Text style={styles.selectedMealLabel}>Vandaag eten we:</Text>
                <Text style={styles.selectedMealName}>{selectedMeal.name}</Text>
                
                <TouchableOpacity
                  style={[styles.spinButton, { backgroundColor: colors.vibrantOrange, marginTop: 15 }]}
                  onPress={() => {
                    handleAddIngredientsToShoppingList(selectedMeal);
                  }}
                >
                  <Text style={styles.spinButtonText}>Ingrediënten toevoegen aan boodschappenlijst</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.spinButton, { backgroundColor: colors.vibrantPurple, marginTop: 10 }]}
                  onPress={() => {
                    setShowSpinnerModal(false);
                    handlePlanInAgenda(selectedMeal);
                  }}
                >
                  <Text style={styles.spinButtonText}>Plan in mijn agenda</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={[styles.spinButton, { backgroundColor: accentColor }, isSpinning && styles.spinButtonDisabled]}
              onPress={spinWheel}
              disabled={isSpinning}
            >
              <Text style={styles.spinButtonText}>
                {isSpinning ? 'Aan het draaien...' : 'Draai het rad!'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowSpinnerModal(false);
                setSelectedMeal(null);
                router.push('/(tabs)/(home)');
              }}
            >
              <Text style={styles.closeButtonText}>Terug naar home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* AI Suggestion Modal */}
      <Modal
        visible={showAIModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAIModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>AI Maaltijd Suggestie</Text>
            <Text style={styles.aiSubtitle}>Voer je beschikbare ingrediënten in (gescheiden door komma&apos;s)</Text>

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Bijv: kip, rijst, paprika, ui"
              placeholderTextColor={colors.textSecondary}
              value={aiIngredients}
              onChangeText={setAiIngredients}
              multiline
              numberOfLines={3}
            />

            {aiSuggestion && (
              <View style={styles.suggestionContainer}>
                <Text style={styles.suggestionLabel}>✨ Suggestie:</Text>
                <Text style={styles.suggestionText}>{aiSuggestion}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonConfirm, { marginBottom: 10, backgroundColor: accentColor }]}
              onPress={generateAISuggestion}
            >
              <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>
                Genereer suggestie
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonCancel]}
              onPress={() => {
                setShowAIModal(false);
                setAiIngredients('');
                setAiSuggestion('');
              }}
            >
              <Text style={styles.modalButtonText}>Sluiten</Text>
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
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 30,
  },
  actionButton: {
    flex: 1,
    minWidth: '30%',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginTop: 5,
    textAlign: 'center',
    fontFamily: 'Poppins_600SemiBold',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 15,
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
    fontFamily: 'Nunito_400Regular',
  },
  mealCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  mealPhoto: {
    width: 60,
    height: 60,
    borderRadius: 15,
    marginRight: 15,
  },
  mealIcon: {
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  mealIconEmoji: {
    fontSize: 32,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    fontFamily: 'Poppins_600SemiBold',
  },
  mealMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  deleteButton: {
    padding: 10,
  },
  servingsCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
    marginBottom: 15,
  },
  servingsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Poppins_600SemiBold',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  stepperButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: `0px 2px 8px ${colors.shadow}`,
    elevation: 2,
  },
  stepperButtonDisabled: {
    opacity: 0.4,
  },
  servingsDisplay: {
    alignItems: 'center',
    minWidth: 100,
  },
  servingsNumber: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Poppins_700Bold',
  },
  servingsLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  dayCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 15,
    marginBottom: 12,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  dayCardHeader: {
    marginBottom: 10,
  },
  dayCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    fontFamily: 'Poppins_600SemiBold',
  },
  dayCardSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  selectRecipeButton: {
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.accent,
    borderStyle: 'dashed',
  },
  selectRecipeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
    marginLeft: 8,
    fontFamily: 'Poppins_600SemiBold',
  },
  assignedRecipeContainer: {
    gap: 10,
  },
  assignedRecipe: {
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  assignedRecipePhoto: {
    width: 50,
    height: 50,
    borderRadius: 12,
    marginRight: 12,
  },
  assignedRecipeIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  assignedRecipeIconEmoji: {
    fontSize: 24,
  },
  assignedRecipeInfo: {
    flex: 1,
  },
  assignedRecipeName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
    fontFamily: 'Poppins_600SemiBold',
  },
  assignedRecipeMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  recipeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addIngredientsButton: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.vibrantOrange,
  },
  addIngredientsButtonText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: colors.vibrantOrange,
    fontFamily: 'Poppins_600SemiBold',
  },
  removeRecipeButton: {
    padding: 10,
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
    marginBottom: 15,
    textAlign: 'center',
    fontFamily: 'Poppins_700Bold',
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 15,
    fontFamily: 'Nunito_400Regular',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
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
    flexDirection: 'row',
    justifyContent: 'center',
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
  recipeList: {
    maxHeight: 400,
    marginBottom: 15,
  },
  emptyRecipeList: {
    padding: 40,
    alignItems: 'center',
  },
  emptyRecipeListText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 5,
    fontFamily: 'Poppins_600SemiBold',
  },
  emptyRecipeListSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  recipeListItem: {
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  recipeListPhoto: {
    width: 50,
    height: 50,
    borderRadius: 12,
    marginRight: 12,
  },
  recipeListIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recipeListIconEmoji: {
    fontSize: 24,
  },
  recipeListInfo: {
    flex: 1,
  },
  recipeListName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
    fontFamily: 'Poppins_600SemiBold',
  },
  recipeListMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  spinnerModal: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 30,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    alignItems: 'center',
    boxShadow: `0px 8px 24px ${colors.shadow}`,
    elevation: 5,
  },
  spinnerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: 'Nunito_400Regular',
  },
  wheel: {
    width: 200,
    height: 200,
    marginBottom: 30,
  },
  wheelInner: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 8,
    borderColor: colors.accent,
  },
  wheelPhoto: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 8,
    borderColor: colors.accent,
  },
  wheelEmoji: {
    fontSize: 80,
  },
  selectedMealContainer: {
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  selectedMealLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 5,
    fontFamily: 'Nunito_400Regular',
  },
  selectedMealName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    fontFamily: 'Poppins_700Bold',
  },
  spinButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15,
  },
  spinButtonDisabled: {
    opacity: 0.5,
  },
  spinButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.card,
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
  },
  closeButton: {
    padding: 10,
  },
  closeButtonText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  aiSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 15,
    fontFamily: 'Nunito_400Regular',
  },
  suggestionContainer: {
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  suggestionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    fontFamily: 'Poppins_600SemiBold',
  },
  suggestionText: {
    fontSize: 16,
    color: colors.text,
    fontFamily: 'Nunito_400Regular',
  },
  detailPhoto: {
    width: '100%',
    height: 250,
    borderRadius: 15,
    marginBottom: 20,
  },
  detailPhotoPlaceholder: {
    width: '100%',
    height: 250,
    borderRadius: 15,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  detailPhotoEmoji: {
    fontSize: 100,
  },
  detailTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Poppins_700Bold',
  },
  detailSection: {
    marginBottom: 20,
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
    fontFamily: 'Poppins_600SemiBold',
  },
  detailIngredient: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 5,
    fontFamily: 'Nunito_400Regular',
  },
  detailInstructions: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    fontFamily: 'Nunito_400Regular',
  },
  dateButton: {
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  dateButtonText: {
    fontSize: 16,
    color: colors.text,
    fontFamily: 'Nunito_400Regular',
  },
  planMealName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Poppins_600SemiBold',
  },
});


import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, Animated } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useFamily } from '@/contexts/FamilyContext';

export default function MealsScreen() {
  const { meals, addMeal, deleteMeal } = useFamily();
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [showSpinnerModal, setShowSpinnerModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [newMealName, setNewMealName] = useState('');
  const [newMealIngredients, setNewMealIngredients] = useState('');
  const [newMealInstructions, setNewMealInstructions] = useState('');
  const [aiIngredients, setAiIngredients] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [spinValue] = useState(new Animated.Value(0));
  const [selectedMeal, setSelectedMeal] = useState<string>('');
  const [isSpinning, setIsSpinning] = useState(false);

  const handleAddMeal = () => {
    if (!newMealName.trim()) {
      Alert.alert('Fout', 'Vul een naam in voor het recept');
      return;
    }

    const ingredients = newMealIngredients
      .split('\n')
      .filter(i => i.trim())
      .map(i => i.trim());

    addMeal({
      name: newMealName.trim(),
      type: 'dinner',
      ingredients,
      instructions: newMealInstructions.trim(),
      prepTime: 30,
      servings: 4,
    });

    setNewMealName('');
    setNewMealIngredients('');
    setNewMealInstructions('');
    setShowAddMealModal(false);
    Alert.alert('Gelukt!', 'Recept toegevoegd');
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
      setSelectedMeal(meals[randomIndex].name);
      setIsSpinning(false);
    });
  };

  const generateAISuggestion = () => {
    if (!aiIngredients.trim()) {
      Alert.alert('Fout', 'Vul ingrediënten in');
      return;
    }

    // Simulate AI suggestion (in real app, this would call an AI API)
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
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Maaltijden</Text>
          <Text style={styles.subtitle}>Recepten en maaltijdplanning</Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => setShowAddMealModal(true)}
          >
            <IconSymbol
              ios_icon_name="plus"
              android_material_icon_name="add"
              size={24}
              color={colors.text}
            />
            <Text style={styles.actionButtonText}>Recept toevoegen</Text>
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
            style={[styles.actionButton, { backgroundColor: colors.accent }]}
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
                <View style={styles.mealCard}>
                  <View style={styles.mealIcon}>
                    <Text style={styles.mealIconEmoji}>🍽️</Text>
                  </View>
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
                    onPress={() => {
                      Alert.alert(
                        'Verwijderen?',
                        `Weet je zeker dat je ${meal.name} wilt verwijderen?`,
                        [
                          { text: 'Annuleren', style: 'cancel' },
                          { text: 'Verwijderen', onPress: () => deleteMeal(meal.id), style: 'destructive' },
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
                </View>
              </React.Fragment>
            ))
          )}
        </View>
      </ScrollView>

      {/* Add Meal Modal */}
      <Modal
        visible={showAddMealModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddMealModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nieuw recept toevoegen</Text>

            <TextInput
              style={styles.input}
              placeholder="Naam van het recept"
              placeholderTextColor={colors.textSecondary}
              value={newMealName}
              onChangeText={setNewMealName}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ingrediënten (één per regel)"
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
                }}
              >
                <Text style={styles.modalButtonText}>Annuleren</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleAddMeal}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>Toevoegen</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Spinner Modal */}
      <Modal
        visible={showSpinnerModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSpinnerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.spinnerModal}>
            <Text style={styles.modalTitle}>Maaltijd rad</Text>
            <Text style={styles.spinnerSubtitle}>Draai aan het rad voor een willekeurig recept!</Text>

            <Animated.View style={[styles.wheel, { transform: [{ rotate: spin }] }]}>
              <View style={styles.wheelInner}>
                <Text style={styles.wheelEmoji}>🍽️</Text>
              </View>
            </Animated.View>

            {selectedMeal && !isSpinning && (
              <View style={styles.selectedMealContainer}>
                <Text style={styles.selectedMealLabel}>Vandaag eten we:</Text>
                <Text style={styles.selectedMealName}>{selectedMeal}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.spinButton, isSpinning && styles.spinButtonDisabled]}
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
                setSelectedMeal('');
              }}
            >
              <Text style={styles.closeButtonText}>Sluiten</Text>
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
              style={[styles.modalButton, styles.modalButtonConfirm, { marginBottom: 10 }]}
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
  mealIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  mealIconEmoji: {
    fontSize: 24,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
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
    marginBottom: 15,
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
  spinnerModal: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 30,
    width: '100%',
    maxWidth: 400,
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
    fontSize: 18,
    fontWeight: '700',
    color: colors.card,
    fontFamily: 'Poppins_700Bold',
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
});

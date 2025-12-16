
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useFamily } from '@/contexts/FamilyContext';
import { parseIngredient, categorizeIngredient } from '@/utils/ingredientCategories';
import { useModuleTheme } from '@/contexts/ThemeContext';

export default function AddItemScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const activeTab = (params.tab as 'shopping' | 'pantry') || 'shopping';
  
  const { accentColor } = useModuleTheme();
  const { 
    addShoppingItem, 
    addPantryItem,
    currentUser,
  } = useFamily();
  
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('');

  const handleAddItem = () => {
    if (!newItemName.trim()) {
      Alert.alert('Fout', 'Vul een item in');
      return;
    }

    const parsed = parseIngredient(`${newItemQuantity} ${newItemUnit} ${newItemName}`.trim());
    const category = categorizeIngredient(parsed.name);

    if (activeTab === 'shopping') {
      addShoppingItem({
        name: parsed.name,
        quantity: parsed.quantity,
        unit: parsed.unit,
        category,
        completed: false,
        addedBy: currentUser?.id || '',
      });
      Alert.alert('Gelukt!', 'Item toegevoegd aan boodschappenlijst');
    } else {
      addPantryItem({
        name: parsed.name,
        quantity: parsed.quantity,
        unit: parsed.unit,
        category,
      });
      Alert.alert('Gelukt!', 'Item toegevoegd aan voorraadkast');
    }

    router.back();
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol
            ios_icon_name="xmark"
            android_material_icon_name="close"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {activeTab === 'shopping' ? 'Nieuw boodschappen item' : 'Nieuw voorraad item'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <TextInput
          style={styles.input}
          placeholder="Naam (bijv. Melk, Brood, Eieren)"
          placeholderTextColor={colors.textSecondary}
          value={newItemName}
          onChangeText={setNewItemName}
          autoFocus={true}
        />

        <View style={styles.quantityRow}>
          <TextInput
            style={[styles.input, styles.quantityInput]}
            placeholder="Aantal"
            placeholderTextColor={colors.textSecondary}
            value={newItemQuantity}
            onChangeText={setNewItemQuantity}
            keyboardType="numeric"
          />
          
          <TextInput
            style={[styles.input, styles.unitInput]}
            placeholder="Eenheid"
            placeholderTextColor={colors.textSecondary}
            value={newItemUnit}
            onChangeText={setNewItemUnit}
          />
        </View>

        <Text style={styles.helperText}>
          Bijvoorbeeld: 1 liter, 500 gram, 2 stuks
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.buttonCancel]}
            onPress={() => router.back()}
          >
            <Text style={styles.buttonText}>Annuleren</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonConfirm, { backgroundColor: accentColor }]}
            onPress={handleAddItem}
          >
            <Text style={[styles.buttonText, styles.buttonTextConfirm]}>Toevoegen</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
    flex: 1,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
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
  quantityRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 0,
  },
  quantityInput: {
    flex: 1,
  },
  unitInput: {
    flex: 1,
  },
  helperText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 30,
    fontFamily: 'Nunito_400Regular',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  buttonCancel: {
    backgroundColor: colors.background,
  },
  buttonConfirm: {
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
  },
  buttonTextConfirm: {
    color: colors.card,
  },
});

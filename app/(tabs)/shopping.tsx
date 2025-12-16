
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useFamily } from '@/contexts/FamilyContext';
import { ShoppingItem, PantryItem, IngredientCategory } from '@/types/family';
import { CATEGORY_ORDER, CATEGORY_LABELS } from '@/utils/ingredientCategories';
import { generateShoppingListPDF } from '@/utils/pdfGenerator';
import { useModuleTheme, ModuleName } from '@/contexts/ThemeContext';
import ModuleHeader from '@/components/ModuleHeader';
import ThemedButton from '@/components/ThemedButton';

type TabType = 'shopping' | 'pantry';

export default function ShoppingScreen() {
  const router = useRouter();
  const { setModule, accentColor } = useModuleTheme();
  const { 
    shoppingList, 
    toggleShoppingItem, 
    deleteShoppingItem,
    pantryItems,
    deletePantryItem,
    shareShoppingListText,
  } = useFamily();
  
  const [activeTab, setActiveTab] = useState<TabType>('shopping');

  // Set module theme on mount
  useEffect(() => {
    setModule('shopping' as ModuleName);
  }, [setModule]);

  const handleExportPDF = async () => {
    try {
      const activeItems = shoppingList.filter(item => !item.completed);
      if (activeItems.length === 0) {
        Alert.alert('Geen items', 'Je boodschappenlijst is leeg');
        return;
      }
      
      await generateShoppingListPDF(activeItems);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      Alert.alert('Fout', 'Er ging iets mis bij het exporteren van de PDF');
    }
  };

  const handleShareText = async () => {
    try {
      const activeItems = shoppingList.filter(item => !item.completed);
      if (activeItems.length === 0) {
        Alert.alert('Geen items', 'Je boodschappenlijst is leeg');
        return;
      }
      
      await shareShoppingListText();
    } catch (error) {
      console.error('Error sharing text:', error);
      Alert.alert('Fout', 'Er ging iets mis bij het delen van de lijst');
    }
  };

  const handleDeleteItem = async (itemId: string, itemName: string, isShoppingItem: boolean) => {
    Alert.alert(
      'Verwijderen?',
      `Weet je zeker dat je "${itemName}" wilt verwijderen?`,
      [
        { text: 'Annuleren', style: 'cancel' },
        { 
          text: 'Verwijderen', 
          onPress: async () => {
            try {
              if (isShoppingItem) {
                await deleteShoppingItem(itemId);
              } else {
                await deletePantryItem(itemId);
              }
              Alert.alert('Gelukt!', 'Item verwijderd');
            } catch (error) {
              Alert.alert('Fout', 'Kon item niet verwijderen');
            }
          }, 
          style: 'destructive' 
        },
      ]
    );
  };

  // Group items by category
  const groupItemsByCategory = (items: (ShoppingItem | PantryItem)[]) => {
    const grouped: { [key in IngredientCategory]?: (ShoppingItem | PantryItem)[] } = {};
    
    items.forEach(item => {
      const category = item.category || 'overig';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category]!.push(item);
    });
    
    return grouped;
  };

  const activeItems = shoppingList.filter(item => !item.completed);
  const completedItems = shoppingList.filter(item => item.completed);
  const groupedActiveItems = groupItemsByCategory(activeItems);
  const groupedPantryItems = groupItemsByCategory(pantryItems);

  return (
    <View style={styles.container}>
      <ModuleHeader
        title="Boodschappen"
        subtitle="Gezamenlijke boodschappenlijst"
        backgroundColor="#FFFFFF"
      />

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'shopping' && [styles.tabActive, { backgroundColor: accentColor }]]}
            onPress={() => setActiveTab('shopping')}
          >
            <Text style={[styles.tabText, activeTab === 'shopping' && styles.tabTextActive]}>
              Boodschappenlijst
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'pantry' && [styles.tabActive, { backgroundColor: accentColor }]]}
            onPress={() => setActiveTab('pantry')}
          >
            <Text style={[styles.tabText, activeTab === 'pantry' && styles.tabTextActive]}>
              Voorraadkast
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'shopping' && (
          <>
            {/* Export/Share Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.vibrantPurple }]}
                onPress={handleExportPDF}
              >
                <Text style={styles.actionButtonText}>Exporteer als PDF</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.vibrantBlue }]}
                onPress={handleShareText}
              >
                <Text style={styles.actionButtonText}>Deel lijst</Text>
              </TouchableOpacity>
            </View>

            <ThemedButton
              title="Item toevoegen"
              onPress={() => router.push('/(tabs)/shopping/add-item?tab=shopping')}
              icon="plus"
              androidIcon="add"
              style={styles.addButton}
            />

            {shoppingList.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateEmoji}>🛒</Text>
                <Text style={styles.emptyStateText}>Nog geen items</Text>
                <Text style={styles.emptyStateSubtext}>Voeg je eerste item toe!</Text>
              </View>
            ) : (
              <>
                {activeItems.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Te kopen ({activeItems.length})</Text>
                    
                    {CATEGORY_ORDER.map((category, catIndex) => {
                      const categoryItems = groupedActiveItems[category];
                      if (!categoryItems || categoryItems.length === 0) return null;
                      
                      return (
                        <React.Fragment key={catIndex}>
                          <View style={styles.categorySection}>
                            <Text style={styles.categoryTitle}>{CATEGORY_LABELS[category]}</Text>
                            {categoryItems.map((item, index) => (
                              <React.Fragment key={index}>
                                <View style={styles.itemCard}>
                                  <TouchableOpacity
                                    style={styles.checkbox}
                                    onPress={() => toggleShoppingItem(item.id)}
                                  >
                                    <View style={[styles.checkboxInner, { borderColor: accentColor }]}>
                                      {(item as ShoppingItem).completed && (
                                        <IconSymbol
                                          ios_icon_name="checkmark"
                                          android_material_icon_name="check"
                                          size={16}
                                          color={colors.card}
                                        />
                                      )}
                                    </View>
                                  </TouchableOpacity>

                                  <View style={styles.itemInfo}>
                                    <Text style={styles.itemName}>
                                      {item.quantity && item.unit ? `${item.quantity} ${item.unit} ` : ''}
                                      {item.name}
                                    </Text>
                                  </View>

                                  <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => handleDeleteItem(item.id, item.name, true)}
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
                            ))}
                          </View>
                        </React.Fragment>
                      );
                    })}
                  </View>
                )}

                {completedItems.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Gekocht ({completedItems.length})</Text>
                    {completedItems.map((item, index) => (
                      <React.Fragment key={index}>
                        <View style={[styles.itemCard, styles.itemCardCompleted]}>
                          <TouchableOpacity
                            style={styles.checkbox}
                            onPress={() => toggleShoppingItem(item.id)}
                          >
                            <View style={[styles.checkboxInner, styles.checkboxChecked, { backgroundColor: accentColor, borderColor: accentColor }]}>
                              <IconSymbol
                                ios_icon_name="checkmark"
                                android_material_icon_name="check"
                                size={16}
                                color={colors.card}
                              />
                            </View>
                          </TouchableOpacity>

                          <View style={styles.itemInfo}>
                            <Text style={[styles.itemName, styles.itemNameCompleted]}>
                              {item.quantity && item.unit ? `${item.quantity} ${item.unit} ` : ''}
                              {item.name}
                            </Text>
                          </View>

                          <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => handleDeleteItem(item.id, item.name, true)}
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
                    ))}
                  </View>
                )}
              </>
            )}
          </>
        )}

        {activeTab === 'pantry' && (
          <>
            <ThemedButton
              title="Item toevoegen"
              onPress={() => router.push('/(tabs)/shopping/add-item?tab=pantry')}
              icon="plus"
              androidIcon="add"
              style={styles.addButton}
            />

            {pantryItems.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateEmoji}>🏺</Text>
                <Text style={styles.emptyStateText}>Nog geen items</Text>
                <Text style={styles.emptyStateSubtext}>Voeg je eerste item toe aan de voorraadkast!</Text>
              </View>
            ) : (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Voorraad ({pantryItems.length})</Text>
                
                {CATEGORY_ORDER.map((category, catIndex) => {
                  const categoryItems = groupedPantryItems[category];
                  if (!categoryItems || categoryItems.length === 0) return null;
                  
                  return (
                    <React.Fragment key={catIndex}>
                      <View style={styles.categorySection}>
                        <Text style={styles.categoryTitle}>{CATEGORY_LABELS[category]}</Text>
                        {categoryItems.map((item, index) => (
                          <React.Fragment key={index}>
                            <View style={styles.itemCard}>
                              <View style={styles.itemInfo}>
                                <Text style={styles.itemName}>
                                  {item.quantity} {item.unit} {item.name}
                                </Text>
                              </View>

                              <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() => handleDeleteItem(item.id, item.name, false)}
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
                        ))}
                      </View>
                    </React.Fragment>
                  );
                })}
              </View>
            )}
          </>
        )}
      </ScrollView>
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
    paddingBottom: 140,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 5,
    marginBottom: 20,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 15,
  },
  tabActive: {
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
  },
  tabTextActive: {
    color: colors.card,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    padding: 12,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.card,
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
  },
  addButton: {
    marginBottom: 20,
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
    textAlign: 'center',
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
  categorySection: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
    marginBottom: 10,
    fontFamily: 'Poppins_600SemiBold',
  },
  itemCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  itemCardCompleted: {
    opacity: 0.6,
  },
  checkbox: {
    marginRight: 15,
  },
  checkboxInner: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
  },
  itemNameCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  deleteButton: {
    padding: 10,
  },
});

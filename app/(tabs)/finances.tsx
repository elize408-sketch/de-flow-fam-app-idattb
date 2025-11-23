
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useFamily } from '@/contexts/FamilyContext';
import * as ImagePicker from 'expo-image-picker';

export default function FinancesScreen() {
  const {
    incomes,
    expenses,
    receipts,
    addIncome,
    addExpense,
    addReceipt,
    deleteIncome,
    deleteExpense,
    getTotalIncome,
    getTotalFixedExpenses,
    getTotalVariableExpenses,
    getRemainingBudget,
  } = useFamily();

  const [showAddIncomeModal, setShowAddIncomeModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showScanReceiptModal, setShowScanReceiptModal] = useState(false);
  const [newIncomeName, setNewIncomeName] = useState('');
  const [newIncomeAmount, setNewIncomeAmount] = useState('');
  const [newIncomeType, setNewIncomeType] = useState<'salary' | 'partner' | 'benefits' | 'other'>('salary');
  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpenseCategory, setNewExpenseCategory] = useState<'fixed' | 'variable'>('fixed');
  const [newExpenseRecurring, setNewExpenseRecurring] = useState(true);
  const [receiptAmount, setReceiptAmount] = useState('');

  const isFirstTime = incomes.length === 0 && expenses.length === 0;

  const handleAddIncome = () => {
    if (!newIncomeName.trim() || !newIncomeAmount.trim()) {
      Alert.alert('Fout', 'Vul alle velden in');
      return;
    }

    const amount = parseFloat(newIncomeAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Fout', 'Vul een geldig bedrag in');
      return;
    }

    addIncome({
      name: newIncomeName.trim(),
      amount,
      type: newIncomeType,
    });

    setNewIncomeName('');
    setNewIncomeAmount('');
    setNewIncomeType('salary');
    setShowAddIncomeModal(false);
    Alert.alert('Gelukt!', 'Inkomen toegevoegd');
  };

  const handleAddExpense = () => {
    if (!newExpenseName.trim() || !newExpenseAmount.trim()) {
      Alert.alert('Fout', 'Vul alle velden in');
      return;
    }

    const amount = parseFloat(newExpenseAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Fout', 'Vul een geldig bedrag in');
      return;
    }

    addExpense({
      name: newExpenseName.trim(),
      amount,
      category: newExpenseCategory,
      date: new Date(),
      paid: false,
      recurring: newExpenseRecurring,
    });

    setNewExpenseName('');
    setNewExpenseAmount('');
    setNewExpenseCategory('fixed');
    setNewExpenseRecurring(true);
    setShowAddExpenseModal(false);
    Alert.alert('Gelukt!', 'Uitgave toegevoegd');
  };

  const handleScanReceipt = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Toestemming vereist', 'Je moet toegang geven tot je foto&apos;s om bonnetjes te kunnen uploaden');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const amount = parseFloat(receiptAmount);
      if (isNaN(amount) || amount <= 0) {
        Alert.alert('Fout', 'Vul eerst een geldig bedrag in');
        return;
      }

      addReceipt({
        imageUri: result.assets[0].uri,
        amount,
        date: new Date(),
        category: 'Boodschappen',
      });

      setReceiptAmount('');
      setShowScanReceiptModal(false);
      Alert.alert('Gelukt!', `Bonnetje van €${amount.toFixed(2)} toegevoegd`);
    }
  };

  const totalIncome = getTotalIncome();
  const totalFixed = getTotalFixedExpenses();
  const totalVariable = getTotalVariableExpenses();
  const remaining = getRemainingBudget();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Financiën</Text>
          <Text style={styles.subtitle}>Beheer je gezinsbudget</Text>
        </View>

        {isFirstTime && (
          <View style={styles.welcomeCard}>
            <Text style={styles.welcomeEmoji}>💰</Text>
            <Text style={styles.welcomeTitle}>Welkom bij Financiën!</Text>
            <Text style={styles.welcomeText}>
              Begin met het toevoegen van je inkomsten en vaste lasten om je budget te beheren.
            </Text>
          </View>
        )}

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>💵 Totaal inkomen</Text>
            <Text style={[styles.summaryAmount, styles.incomeAmount]}>€{totalIncome.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>🏠 Vaste lasten</Text>
            <Text style={[styles.summaryAmount, styles.expenseAmount]}>-€{totalFixed.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>🛒 Variabele lasten</Text>
            <Text style={[styles.summaryAmount, styles.expenseAmount]}>-€{totalVariable.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabelBold}>💰 Resterend budget</Text>
            <Text style={[styles.summaryAmountBold, remaining >= 0 ? styles.positiveAmount : styles.negativeAmount]}>
              €{remaining.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => setShowAddIncomeModal(true)}
          >
            <IconSymbol
              ios_icon_name="plus"
              android_material_icon_name="add"
              size={20}
              color={colors.text}
            />
            <Text style={styles.actionButtonText}>Inkomen</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.secondary }]}
            onPress={() => setShowAddExpenseModal(true)}
          >
            <IconSymbol
              ios_icon_name="plus"
              android_material_icon_name="add"
              size={20}
              color={colors.text}
            />
            <Text style={styles.actionButtonText}>Uitgave</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.accent }]}
            onPress={() => setShowScanReceiptModal(true)}
          >
            <IconSymbol
              ios_icon_name="camera"
              android_material_icon_name="camera-alt"
              size={20}
              color={colors.text}
            />
            <Text style={styles.actionButtonText}>Bonnetje</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Inkomsten</Text>
          {incomes.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Nog geen inkomsten toegevoegd</Text>
            </View>
          ) : (
            incomes.map((income, index) => (
              <React.Fragment key={index}>
                <View style={styles.itemCard}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{income.name}</Text>
                    <Text style={styles.itemMeta}>
                      {income.type === 'salary' && '💼 Salaris'}
                      {income.type === 'partner' && '👥 Partner'}
                      {income.type === 'benefits' && '🎁 Toeslagen'}
                      {income.type === 'other' && '📌 Overig'}
                    </Text>
                  </View>
                  <Text style={[styles.itemAmount, styles.incomeAmount]}>€{income.amount.toFixed(2)}</Text>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => {
                      Alert.alert(
                        'Verwijderen?',
                        `Weet je zeker dat je ${income.name} wilt verwijderen?`,
                        [
                          { text: 'Annuleren', style: 'cancel' },
                          { text: 'Verwijderen', onPress: () => deleteIncome(income.id), style: 'destructive' },
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Uitgaven</Text>
          {expenses.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Nog geen uitgaven toegevoegd</Text>
            </View>
          ) : (
            expenses.map((expense, index) => (
              <React.Fragment key={index}>
                <View style={styles.itemCard}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{expense.name}</Text>
                    <Text style={styles.itemMeta}>
                      {expense.category === 'fixed' ? '🏠 Vast' : '🛒 Variabel'}
                      {expense.recurring && ' • 🔄 Terugkerend'}
                    </Text>
                  </View>
                  <Text style={[styles.itemAmount, styles.expenseAmount]}>€{expense.amount.toFixed(2)}</Text>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => {
                      Alert.alert(
                        'Verwijderen?',
                        `Weet je zeker dat je ${expense.name} wilt verwijderen?`,
                        [
                          { text: 'Annuleren', style: 'cancel' },
                          { text: 'Verwijderen', onPress: () => deleteExpense(expense.id), style: 'destructive' },
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

        {receipts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bonnetjes ({receipts.length})</Text>
            <View style={styles.receiptsGrid}>
              {receipts.map((receipt, index) => (
                <React.Fragment key={index}>
                  <View style={styles.receiptCard}>
                    <Text style={styles.receiptEmoji}>🧾</Text>
                    <Text style={styles.receiptAmount}>€{receipt.amount.toFixed(2)}</Text>
                    <Text style={styles.receiptDate}>
                      {new Date(receipt.date).toLocaleDateString('nl-NL')}
                    </Text>
                  </View>
                </React.Fragment>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Add Income Modal */}
      <Modal
        visible={showAddIncomeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddIncomeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Inkomen toevoegen</Text>

            <TextInput
              style={styles.input}
              placeholder="Naam (bijv. Salaris)"
              placeholderTextColor={colors.textSecondary}
              value={newIncomeName}
              onChangeText={setNewIncomeName}
            />

            <TextInput
              style={styles.input}
              placeholder="Bedrag per maand"
              placeholderTextColor={colors.textSecondary}
              value={newIncomeAmount}
              onChangeText={setNewIncomeAmount}
              keyboardType="decimal-pad"
            />

            <Text style={styles.inputLabel}>Type:</Text>
            <View style={styles.typeSelector}>
              {[
                { value: 'salary', label: '💼 Salaris' },
                { value: 'partner', label: '👥 Partner' },
                { value: 'benefits', label: '🎁 Toeslagen' },
                { value: 'other', label: '📌 Overig' },
              ].map((option, index) => (
                <React.Fragment key={index}>
                  <TouchableOpacity
                    style={[
                      styles.typeOption,
                      newIncomeType === option.value && styles.typeOptionActive,
                    ]}
                    onPress={() => setNewIncomeType(option.value as any)}
                  >
                    <Text
                      style={[
                        styles.typeOptionText,
                        newIncomeType === option.value && styles.typeOptionTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                </React.Fragment>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowAddIncomeModal(false);
                  setNewIncomeName('');
                  setNewIncomeAmount('');
                  setNewIncomeType('salary');
                }}
              >
                <Text style={styles.modalButtonText}>Annuleren</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleAddIncome}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>Toevoegen</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Expense Modal */}
      <Modal
        visible={showAddExpenseModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddExpenseModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Uitgave toevoegen</Text>

            <TextInput
              style={styles.input}
              placeholder="Naam (bijv. Huur)"
              placeholderTextColor={colors.textSecondary}
              value={newExpenseName}
              onChangeText={setNewExpenseName}
            />

            <TextInput
              style={styles.input}
              placeholder="Bedrag"
              placeholderTextColor={colors.textSecondary}
              value={newExpenseAmount}
              onChangeText={setNewExpenseAmount}
              keyboardType="decimal-pad"
            />

            <Text style={styles.inputLabel}>Categorie:</Text>
            <View style={styles.categorySelector}>
              <TouchableOpacity
                style={[
                  styles.categoryOption,
                  newExpenseCategory === 'fixed' && styles.categoryOptionActive,
                ]}
                onPress={() => setNewExpenseCategory('fixed')}
              >
                <Text
                  style={[
                    styles.categoryOptionText,
                    newExpenseCategory === 'fixed' && styles.categoryOptionTextActive,
                  ]}
                >
                  🏠 Vaste lasten
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.categoryOption,
                  newExpenseCategory === 'variable' && styles.categoryOptionActive,
                ]}
                onPress={() => setNewExpenseCategory('variable')}
              >
                <Text
                  style={[
                    styles.categoryOptionText,
                    newExpenseCategory === 'variable' && styles.categoryOptionTextActive,
                  ]}
                >
                  🛒 Variabele lasten
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setNewExpenseRecurring(!newExpenseRecurring)}
            >
              <View style={[styles.checkbox, newExpenseRecurring && styles.checkboxChecked]}>
                {newExpenseRecurring && (
                  <IconSymbol
                    ios_icon_name="checkmark"
                    android_material_icon_name="check"
                    size={16}
                    color={colors.card}
                  />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Terugkerende uitgave</Text>
            </TouchableOpacity>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowAddExpenseModal(false);
                  setNewExpenseName('');
                  setNewExpenseAmount('');
                  setNewExpenseCategory('fixed');
                  setNewExpenseRecurring(true);
                }}
              >
                <Text style={styles.modalButtonText}>Annuleren</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleAddExpense}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>Toevoegen</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Scan Receipt Modal */}
      <Modal
        visible={showScanReceiptModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowScanReceiptModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Bonnetje uploaden</Text>
            <Text style={styles.modalSubtitle}>
              Upload een foto van je bonnetje en vul het bedrag in
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Bedrag (bijv. 45.50)"
              placeholderTextColor={colors.textSecondary}
              value={receiptAmount}
              onChangeText={setReceiptAmount}
              keyboardType="decimal-pad"
            />

            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonConfirm, { marginBottom: 10 }]}
              onPress={handleScanReceipt}
            >
              <IconSymbol
                ios_icon_name="camera"
                android_material_icon_name="camera-alt"
                size={20}
                color={colors.card}
              />
              <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm, { marginLeft: 10 }]}>
                Foto selecteren
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonCancel]}
              onPress={() => {
                setShowScanReceiptModal(false);
                setReceiptAmount('');
              }}
            >
              <Text style={styles.modalButtonText}>Annuleren</Text>
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
  welcomeCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  welcomeEmoji: {
    fontSize: 60,
    marginBottom: 15,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
    fontFamily: 'Poppins_700Bold',
  },
  welcomeText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'Nunito_400Regular',
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: colors.text,
    fontFamily: 'Nunito_400Regular',
  },
  summaryLabelBold: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Poppins_700Bold',
  },
  summaryAmount: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
  },
  summaryAmountBold: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
  },
  incomeAmount: {
    color: '#4CAF50',
  },
  expenseAmount: {
    color: '#F44336',
  },
  positiveAmount: {
    color: '#4CAF50',
  },
  negativeAmount: {
    color: '#F44336',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.background,
    marginVertical: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
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
    padding: 30,
    alignItems: 'center',
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
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
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    fontFamily: 'Poppins_600SemiBold',
  },
  itemMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  itemAmount: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 10,
    fontFamily: 'Poppins_700Bold',
  },
  deleteButton: {
    padding: 10,
  },
  receiptsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  receiptCard: {
    backgroundColor: colors.card,
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    minWidth: 100,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  receiptEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  receiptAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
    fontFamily: 'Poppins_700Bold',
  },
  receiptDate: {
    fontSize: 10,
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
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'Poppins_700Bold',
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Nunito_400Regular',
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
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
    fontFamily: 'Poppins_600SemiBold',
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  typeOption: {
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 12,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeOptionActive: {
    borderColor: colors.accent,
    backgroundColor: colors.primary,
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
  categorySelector: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  categoryOption: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryOptionActive: {
    borderColor: colors.accent,
    backgroundColor: colors.primary,
  },
  categoryOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    fontFamily: 'Poppins_600SemiBold',
  },
  categoryOptionTextActive: {
    color: colors.text,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: colors.accent,
  },
  checkboxLabel: {
    fontSize: 16,
    color: colors.text,
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
});

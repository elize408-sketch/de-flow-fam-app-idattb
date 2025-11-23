
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useFamily } from '@/contexts/FamilyContext';
import * as ImagePicker from 'expo-image-picker';
import Slider from '@react-native-community/slider';

export default function FinancesScreen() {
  const {
    incomes,
    expenses,
    receipts,
    savingsPots,
    financePasscode,
    currentUser,
    setFinancePasscode,
    addIncome,
    addExpense,
    addReceipt,
    deleteIncome,
    deleteExpense,
    addSavingsPot,
    updateSavingsPot,
    deleteSavingsPot,
    getTotalIncome,
    getTotalFixedExpenses,
    getTotalVariableExpenses,
    getRemainingBudget,
  } = useFamily();

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [showSetPasscodeModal, setShowSetPasscodeModal] = useState(false);
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [showAddIncomeModal, setShowAddIncomeModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showScanReceiptModal, setShowScanReceiptModal] = useState(false);
  const [showAddPotModal, setShowAddPotModal] = useState(false);
  const [showPotDetailsModal, setShowPotDetailsModal] = useState(false);
  const [selectedPot, setSelectedPot] = useState<any>(null);
  const [yearsToView, setYearsToView] = useState(1);
  const [newIncomeName, setNewIncomeName] = useState('');
  const [newIncomeAmount, setNewIncomeAmount] = useState('');
  const [newIncomeType, setNewIncomeType] = useState<'salary' | 'partner' | 'benefits' | 'other'>('salary');
  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpenseCategory, setNewExpenseCategory] = useState<'fixed' | 'variable'>('fixed');
  const [newExpenseRecurring, setNewExpenseRecurring] = useState(true);
  const [receiptAmount, setReceiptAmount] = useState('');
  const [newPotName, setNewPotName] = useState('');
  const [newPotGoal, setNewPotGoal] = useState('');
  const [newPotMonthly, setNewPotMonthly] = useState('');
  const [newPotIcon, setNewPotIcon] = useState('💰');

  const isParent = currentUser?.role === 'parent';

  // Check if user needs to set or enter passcode
  if (!isParent) {
    return (
      <View style={styles.container}>
        <View style={styles.lockedContainer}>
          <Text style={styles.lockedEmoji}>🔒</Text>
          <Text style={styles.lockedTitle}>Alleen voor ouders</Text>
          <Text style={styles.lockedText}>
            Financiën zijn alleen toegankelijk voor ouders
          </Text>
        </View>
      </View>
    );
  }

  if (!financePasscode) {
    return (
      <View style={styles.container}>
        <View style={styles.setupContainer}>
          <Text style={styles.setupEmoji}>🔐</Text>
          <Text style={styles.setupTitle}>Beveilig je financiën</Text>
          <Text style={styles.setupText}>
            Stel een pincode in om je financiële gegevens te beschermen
          </Text>
          <TouchableOpacity
            style={styles.setupButton}
            onPress={() => setShowSetPasscodeModal(true)}
          >
            <Text style={styles.setupButtonText}>Pincode instellen</Text>
          </TouchableOpacity>
        </View>

        <Modal
          visible={showSetPasscodeModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowSetPasscodeModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Pincode instellen</Text>
              <Text style={styles.modalSubtitle}>Kies een 4-cijferige pincode</Text>

              <TextInput
                style={styles.passcodeInput}
                placeholder="Pincode"
                placeholderTextColor={colors.textSecondary}
                value={newPasscode}
                onChangeText={setNewPasscode}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
              />

              <TextInput
                style={styles.passcodeInput}
                placeholder="Bevestig pincode"
                placeholderTextColor={colors.textSecondary}
                value={confirmPasscode}
                onChangeText={setConfirmPasscode}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => {
                    setShowSetPasscodeModal(false);
                    setNewPasscode('');
                    setConfirmPasscode('');
                  }}
                >
                  <Text style={styles.modalButtonText}>Annuleren</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonConfirm]}
                  onPress={() => {
                    if (newPasscode.length !== 4) {
                      Alert.alert('Fout', 'Pincode moet 4 cijfers zijn');
                      return;
                    }
                    if (newPasscode !== confirmPasscode) {
                      Alert.alert('Fout', 'Pincodes komen niet overeen');
                      return;
                    }
                    setFinancePasscode(newPasscode);
                    setIsUnlocked(true);
                    setShowSetPasscodeModal(false);
                    setNewPasscode('');
                    setConfirmPasscode('');
                    Alert.alert('Gelukt!', 'Pincode ingesteld');
                  }}
                >
                  <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>Instellen</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  if (!isUnlocked) {
    return (
      <View style={styles.container}>
        <View style={styles.unlockContainer}>
          <Text style={styles.unlockEmoji}>🔒</Text>
          <Text style={styles.unlockTitle}>Voer je pincode in</Text>
          <TextInput
            style={styles.passcodeInput}
            placeholder="••••"
            placeholderTextColor={colors.textSecondary}
            value={passcodeInput}
            onChangeText={setPasscodeInput}
            keyboardType="numeric"
            maxLength={4}
            secureTextEntry
          />
          <TouchableOpacity
            style={styles.unlockButton}
            onPress={() => {
              if (passcodeInput === financePasscode) {
                setIsUnlocked(true);
                setPasscodeInput('');
              } else {
                Alert.alert('Fout', 'Onjuiste pincode');
                setPasscodeInput('');
              }
            }}
          >
            <Text style={styles.unlockButtonText}>Ontgrendelen</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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

  const handleAddPot = () => {
    if (!newPotName.trim() || !newPotGoal.trim() || !newPotMonthly.trim()) {
      Alert.alert('Fout', 'Vul alle velden in');
      return;
    }

    const goal = parseFloat(newPotGoal);
    const monthly = parseFloat(newPotMonthly);

    if (isNaN(goal) || goal <= 0 || isNaN(monthly) || monthly <= 0) {
      Alert.alert('Fout', 'Vul geldige bedragen in');
      return;
    }

    addSavingsPot({
      name: newPotName.trim(),
      goalAmount: goal,
      currentAmount: 0,
      monthlyDeposit: monthly,
      color: colors.accent,
      icon: newPotIcon,
    });

    setNewPotName('');
    setNewPotGoal('');
    setNewPotMonthly('');
    setNewPotIcon('💰');
    setShowAddPotModal(false);
    Alert.alert('Gelukt!', 'Spaarpotje aangemaakt');
  };

  const calculateFutureValue = (pot: any, years: number) => {
    return pot.currentAmount + (pot.monthlyDeposit * 12 * years);
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

        {/* Savings Pots Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Spaarpotjes</Text>
            <TouchableOpacity onPress={() => setShowAddPotModal(true)}>
              <IconSymbol
                ios_icon_name="plus"
                android_material_icon_name="add"
                size={24}
                color={colors.accent}
              />
            </TouchableOpacity>
          </View>

          {savingsPots.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Nog geen spaarpotjes aangemaakt</Text>
            </View>
          ) : (
            savingsPots.map((pot, index) => {
              const progress = (pot.currentAmount / pot.goalAmount) * 100;
              return (
                <React.Fragment key={index}>
                  <TouchableOpacity
                    style={styles.potCard}
                    onPress={() => {
                      setSelectedPot(pot);
                      setYearsToView(1);
                      setShowPotDetailsModal(true);
                    }}
                  >
                    <Text style={styles.potIcon}>{pot.icon}</Text>
                    <View style={styles.potInfo}>
                      <Text style={styles.potName}>{pot.name}</Text>
                      <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]} />
                      </View>
                      <Text style={styles.potAmount}>
                        €{pot.currentAmount.toFixed(2)} / €{pot.goalAmount.toFixed(2)}
                      </Text>
                      <Text style={styles.potMeta}>
                        €{pot.monthlyDeposit.toFixed(2)} per maand
                      </Text>
                    </View>
                  </TouchableOpacity>
                </React.Fragment>
              );
            })
          )}
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

      {/* Modals continue in next part due to length... */}
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

      {/* Add Savings Pot Modal */}
      <Modal
        visible={showAddPotModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddPotModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Spaarpotje aanmaken</Text>

            <TextInput
              style={styles.input}
              placeholder="Naam (bijv. Vakantie)"
              placeholderTextColor={colors.textSecondary}
              value={newPotName}
              onChangeText={setNewPotName}
            />

            <TextInput
              style={styles.input}
              placeholder="Spaardoel (€)"
              placeholderTextColor={colors.textSecondary}
              value={newPotGoal}
              onChangeText={setNewPotGoal}
              keyboardType="decimal-pad"
            />

            <TextInput
              style={styles.input}
              placeholder="Maandelijks bedrag (€)"
              placeholderTextColor={colors.textSecondary}
              value={newPotMonthly}
              onChangeText={setNewPotMonthly}
              keyboardType="decimal-pad"
            />

            <Text style={styles.inputLabel}>Kies een icoon:</Text>
            <View style={styles.iconSelector}>
              {['💰', '🏖️', '🏠', '🚗', '🎓', '🎁', '✈️', '🏥'].map((icon, index) => (
                <React.Fragment key={index}>
                  <TouchableOpacity
                    style={[
                      styles.iconOption,
                      newPotIcon === icon && styles.iconOptionActive,
                    ]}
                    onPress={() => setNewPotIcon(icon)}
                  >
                    <Text style={styles.iconOptionEmoji}>{icon}</Text>
                  </TouchableOpacity>
                </React.Fragment>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowAddPotModal(false);
                  setNewPotName('');
                  setNewPotGoal('');
                  setNewPotMonthly('');
                  setNewPotIcon('💰');
                }}
              >
                <Text style={styles.modalButtonText}>Annuleren</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleAddPot}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>Aanmaken</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Pot Details Modal */}
      <Modal
        visible={showPotDetailsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPotDetailsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              {selectedPot && (
                <>
                  <Text style={styles.potDetailIcon}>{selectedPot.icon}</Text>
                  <Text style={styles.modalTitle}>{selectedPot.name}</Text>
                  
                  <View style={styles.potDetailCard}>
                    <Text style={styles.potDetailLabel}>Huidig saldo</Text>
                    <Text style={styles.potDetailAmount}>€{selectedPot.currentAmount.toFixed(2)}</Text>
                  </View>

                  <View style={styles.potDetailCard}>
                    <Text style={styles.potDetailLabel}>Spaardoel</Text>
                    <Text style={styles.potDetailAmount}>€{selectedPot.goalAmount.toFixed(2)}</Text>
                  </View>

                  <View style={styles.potDetailCard}>
                    <Text style={styles.potDetailLabel}>Maandelijks bedrag</Text>
                    <Text style={styles.potDetailAmount}>€{selectedPot.monthlyDeposit.toFixed(2)}</Text>
                  </View>

                  <View style={styles.sliderContainer}>
                    <Text style={styles.sliderLabel}>
                      Bekijk spaarsaldo over {yearsToView} {yearsToView === 1 ? 'jaar' : 'jaar'}
                    </Text>
                    <Slider
                      style={styles.slider}
                      minimumValue={1}
                      maximumValue={30}
                      step={1}
                      value={yearsToView}
                      onValueChange={setYearsToView}
                      minimumTrackTintColor={colors.accent}
                      maximumTrackTintColor={colors.secondary}
                      thumbTintColor={colors.accent}
                    />
                    <View style={styles.sliderLabels}>
                      <Text style={styles.sliderLabelText}>1 jaar</Text>
                      <Text style={styles.sliderLabelText}>30 jaar</Text>
                    </View>
                  </View>

                  <View style={styles.projectionCard}>
                    <Text style={styles.projectionLabel}>
                      Spaarsaldo na {yearsToView} {yearsToView === 1 ? 'jaar' : 'jaar'}:
                    </Text>
                    <Text style={styles.projectionAmount}>
                      €{calculateFutureValue(selectedPot, yearsToView).toFixed(2)}
                    </Text>
                    <Text style={styles.projectionMeta}>
                      {calculateFutureValue(selectedPot, yearsToView) >= selectedPot.goalAmount
                        ? '✅ Doel bereikt!'
                        : `Nog €${(selectedPot.goalAmount - calculateFutureValue(selectedPot, yearsToView)).toFixed(2)} te gaan`}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonCancel]}
                    onPress={() => setShowPotDetailsModal(false)}
                  >
                    <Text style={styles.modalButtonText}>Sluiten</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </ScrollView>
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
  lockedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  lockedEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  lockedTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'Poppins_700Bold',
  },
  lockedText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Nunito_400Regular',
  },
  setupContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  setupEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  setupTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'Poppins_700Bold',
  },
  setupText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
    fontFamily: 'Nunito_400Regular',
  },
  setupButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  setupButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.card,
    fontFamily: 'Poppins_700Bold',
  },
  unlockContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  unlockEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  unlockTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 30,
    textAlign: 'center',
    fontFamily: 'Poppins_700Bold',
  },
  passcodeInput: {
    backgroundColor: colors.card,
    borderRadius: 15,
    padding: 20,
    fontSize: 24,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
    width: 200,
    fontFamily: 'Poppins_700Bold',
    letterSpacing: 10,
  },
  unlockButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
  },
  unlockButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.card,
    fontFamily: 'Poppins_700Bold',
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
  potCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  potIcon: {
    fontSize: 40,
    marginRight: 15,
  },
  potInfo: {
    flex: 1,
  },
  potName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    fontFamily: 'Poppins_600SemiBold',
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 4,
  },
  potAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    fontFamily: 'Poppins_600SemiBold',
  },
  potMeta: {
    fontSize: 12,
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
  iconSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  iconOption: {
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconOptionActive: {
    borderColor: colors.accent,
    backgroundColor: colors.primary,
  },
  iconOptionEmoji: {
    fontSize: 32,
  },
  potDetailIcon: {
    fontSize: 60,
    textAlign: 'center',
    marginBottom: 10,
  },
  potDetailCard: {
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  potDetailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 5,
    fontFamily: 'Nunito_400Regular',
  },
  potDetailAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Poppins_700Bold',
  },
  sliderContainer: {
    marginVertical: 20,
  },
  sliderLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'Poppins_600SemiBold',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabelText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  projectionCard: {
    backgroundColor: colors.primary,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  projectionLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 10,
    fontFamily: 'Nunito_400Regular',
  },
  projectionAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
    fontFamily: 'Poppins_700Bold',
  },
  projectionMeta: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
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

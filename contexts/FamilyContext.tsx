
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FamilyMember, Task, Reward, Appointment, HouseholdTask, Expense, Income, Receipt, Meal, SavingsPot, Memory, ShoppingItem, FamilyNote, Reminder, DailyScheduleItem, Notification, PantryItem, Ingredient, IngredientCategory, BudgetPot } from '@/types/family';
import { initialFamilyMembers, initialTasks, initialRewards } from '@/data/familyData';
import { savePantryItems, loadPantryItems, saveWeekPlanningServings, loadWeekPlanningServings, saveCurrentUserId, loadCurrentUserId, saveFamilyMembers, loadFamilyMembers, saveFamilyCode, loadFamilyCode } from '@/utils/localStorage';
import { categorizeIngredient, parseIngredient, shouldNotScale } from '@/utils/ingredientCategories';
import { Alert, Share } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FamilyContextType {
  familyMembers: FamilyMember[];
  tasks: Task[];
  rewards: Reward[];
  appointments: Appointment[];
  householdTasks: HouseholdTask[];
  expenses: Expense[];
  incomes: Income[];
  receipts: Receipt[];
  meals: Meal[];
  savingsPots: SavingsPot[];
  memories: Memory[];
  shoppingList: ShoppingItem[];
  pantryItems: PantryItem[];
  familyNotes: FamilyNote[];
  reminders: Reminder[];
  dailySchedule: DailyScheduleItem[];
  notifications: Notification[];
  budgetPots: BudgetPot[];
  financeResetDay: number | null;
  financeLastResetDate: Date | null;
  financePreviousMonthLeftover: number | null;
  selectedMember: FamilyMember | null;
  currentUser: FamilyMember | null;
  financePasscode: string | null;
  financeOnboardingComplete: boolean;
  weekPlanningServings: number;
  familyCode: string | null;
  setSelectedMember: (member: FamilyMember | null) => void;
  setCurrentUser: (user: FamilyMember | null) => void;
  setFinancePasscode: (passcode: string) => void;
  setFinanceOnboardingComplete: (complete: boolean) => void;
  setWeekPlanningServings: (servings: number) => void;
  setFinanceResetDay: (day: number) => void;
  checkAndPerformMonthlyReset: () => void;
  addFamilyMember: (member: Omit<FamilyMember, 'id'>) => void;
  updateFamilyMember: (memberId: string, updates: Partial<FamilyMember>) => void;
  deleteFamilyMember: (memberId: string) => void;
  completeTask: (taskId: string) => void;
  addCoins: (memberId: string, amount: number) => void;
  redeemReward: (memberId: string, rewardId: string) => void;
  addTask: (task: Omit<Task, 'id' | 'completedCount'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  addAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  updateAppointment: (appointmentId: string, updates: Partial<Appointment>) => void;
  deleteAppointment: (appointmentId: string) => void;
  addHouseholdTask: (task: Omit<HouseholdTask, 'id'>) => void;
  updateHouseholdTask: (taskId: string, updates: Partial<HouseholdTask>) => void;
  deleteHouseholdTask: (taskId: string) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (expenseId: string, updates: Partial<Expense>) => void;
  deleteExpense: (expenseId: string) => void;
  addIncome: (income: Omit<Income, 'id'>) => void;
  updateIncome: (incomeId: string, updates: Partial<Income>) => void;
  deleteIncome: (incomeId: string) => void;
  addReceipt: (receipt: Omit<Receipt, 'id'>) => void;
  addMeal: (meal: Omit<Meal, 'id'>) => void;
  updateMeal: (mealId: string, updates: Partial<Meal>) => void;
  deleteMeal: (mealId: string) => void;
  addSavingsPot: (pot: Omit<SavingsPot, 'id'>) => void;
  updateSavingsPot: (potId: string, updates: Partial<SavingsPot>) => void;
  deleteSavingsPot: (potId: string) => void;
  addBudgetPot: (pot: Omit<BudgetPot, 'id'>) => void;
  updateBudgetPot: (potId: string, updates: Partial<BudgetPot>) => void;
  deleteBudgetPot: (potId: string) => void;
  addMemory: (memory: Omit<Memory, 'id'>) => void;
  updateMemory: (memoryId: string, updates: Partial<Memory>) => void;
  deleteMemory: (memoryId: string) => void;
  addShoppingItem: (item: Omit<ShoppingItem, 'id' | 'addedAt'>) => void;
  toggleShoppingItem: (itemId: string) => void;
  deleteShoppingItem: (itemId: string) => void;
  addPantryItem: (item: Omit<PantryItem, 'id' | 'addedAt'>) => void;
  updatePantryItem: (itemId: string, updates: Partial<PantryItem>) => void;
  deletePantryItem: (itemId: string) => void;
  addFamilyNote: (note: Omit<FamilyNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateFamilyNote: (noteId: string, updates: Partial<FamilyNote>) => void;
  deleteFamilyNote: (noteId: string) => void;
  addReminder: (reminder: Omit<Reminder, 'id'>) => void;
  updateReminder: (reminderId: string, updates: Partial<Reminder>) => void;
  deleteReminder: (reminderId: string) => void;
  addDailyScheduleItem: (item: Omit<DailyScheduleItem, 'id'>) => void;
  updateDailyScheduleItem: (itemId: string, updates: Partial<DailyScheduleItem>) => void;
  deleteDailyScheduleItem: (itemId: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationRead: (notificationId: string) => void;
  getTotalIncome: () => number;
  getTotalFixedExpenses: () => number;
  getTotalVariableExpenses: () => number;
  getRemainingBudget: () => number;
  getMonthlyOverview: () => { income: number; fixed: number; variable: number; remaining: number };
  addIngredientsToShoppingList: (ingredients: string[]) => void;
  addRecipeIngredientsToShoppingList: (meal: Meal) => Promise<{ added: number; skipped: string[] }>;
  shareShoppingListText: () => Promise<void>;
  generateFamilyInviteCode: () => Promise<string>;
  shareFamilyInvite: () => Promise<void>;
  getVisibleFamilyMembers: () => FamilyMember[];
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

const BUDGET_POTS_KEY = '@flow_fam_budget_pots';
const FINANCE_RESET_DAY_KEY = '@flow_fam_finance_reset_day';
const FINANCE_LAST_RESET_DATE_KEY = '@flow_fam_finance_last_reset_date';
const FINANCE_PREVIOUS_MONTH_LEFTOVER_KEY = '@flow_fam_finance_previous_month_leftover';

export function FamilyProvider({ children }: { children: ReactNode }) {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(initialFamilyMembers);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [rewards] = useState<Reward[]>(initialRewards);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [householdTasks, setHouseholdTasks] = useState<HouseholdTask[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [savingsPots, setSavingsPots] = useState<SavingsPot[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [familyNotes, setFamilyNotes] = useState<FamilyNote[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [dailySchedule, setDailySchedule] = useState<DailyScheduleItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [budgetPots, setBudgetPots] = useState<BudgetPot[]>([]);
  const [financeResetDay, setFinanceResetDayState] = useState<number | null>(null);
  const [financeLastResetDate, setFinanceLastResetDate] = useState<Date | null>(null);
  const [financePreviousMonthLeftover, setFinancePreviousMonthLeftover] = useState<number | null>(null);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [currentUser, setCurrentUserState] = useState<FamilyMember | null>(null);
  const [financePasscode, setFinancePasscode] = useState<string | null>(null);
  const [financeOnboardingComplete, setFinanceOnboardingComplete] = useState(false);
  const [weekPlanningServings, setWeekPlanningServingsState] = useState(2);
  const [familyCode, setFamilyCode] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Load family members
      const loadedMembers = await loadFamilyMembers();
      if (loadedMembers.length > 0) {
        setFamilyMembers(loadedMembers);
      }

      // Load current user
      const userId = await loadCurrentUserId();
      if (userId && loadedMembers.length > 0) {
        const user = loadedMembers.find(m => m.id === userId);
        if (user) {
          setCurrentUserState(user);
        }
      }

      // Load family code
      const code = await loadFamilyCode();
      if (code) {
        setFamilyCode(code);
      }

      // Load other data
      const items = await loadPantryItems();
      setPantryItems(items);
      
      const servings = await loadWeekPlanningServings();
      setWeekPlanningServingsState(servings);
      
      await loadBudgetPots();
      await loadFinanceResetDay();
      await loadFinanceLastResetDate();
      await loadFinancePreviousMonthLeftover();
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  // Save family members whenever they change
  useEffect(() => {
    saveFamilyMembers(familyMembers);
  }, [familyMembers]);

  // Save current user whenever it changes
  useEffect(() => {
    if (currentUser) {
      saveCurrentUserId(currentUser.id);
    }
  }, [currentUser]);

  // Save family code whenever it changes
  useEffect(() => {
    if (familyCode) {
      saveFamilyCode(familyCode);
    }
  }, [familyCode]);

  // Save data whenever they change
  useEffect(() => {
    savePantryItems(pantryItems);
  }, [pantryItems]);

  useEffect(() => {
    saveBudgetPots(budgetPots);
  }, [budgetPots]);

  useEffect(() => {
    if (financeResetDay !== null) {
      saveFinanceResetDay(financeResetDay);
    }
  }, [financeResetDay]);

  useEffect(() => {
    if (financeLastResetDate !== null) {
      saveFinanceLastResetDate(financeLastResetDate);
    }
  }, [financeLastResetDate]);

  useEffect(() => {
    if (financePreviousMonthLeftover !== null) {
      saveFinancePreviousMonthLeftover(financePreviousMonthLeftover);
    }
  }, [financePreviousMonthLeftover]);

  const loadBudgetPots = async () => {
    try {
      const data = await AsyncStorage.getItem(BUDGET_POTS_KEY);
      if (data) {
        setBudgetPots(JSON.parse(data));
      }
    } catch (error) {
      console.error('Error loading budget pots:', error);
    }
  };

  const saveBudgetPots = async (pots: BudgetPot[]) => {
    try {
      await AsyncStorage.setItem(BUDGET_POTS_KEY, JSON.stringify(pots));
    } catch (error) {
      console.error('Error saving budget pots:', error);
    }
  };

  const loadFinanceResetDay = async () => {
    try {
      const data = await AsyncStorage.getItem(FINANCE_RESET_DAY_KEY);
      if (data) {
        setFinanceResetDayState(parseInt(data, 10));
      }
    } catch (error) {
      console.error('Error loading finance reset day:', error);
    }
  };

  const saveFinanceResetDay = async (day: number) => {
    try {
      await AsyncStorage.setItem(FINANCE_RESET_DAY_KEY, day.toString());
    } catch (error) {
      console.error('Error saving finance reset day:', error);
    }
  };

  const loadFinanceLastResetDate = async () => {
    try {
      const data = await AsyncStorage.getItem(FINANCE_LAST_RESET_DATE_KEY);
      if (data) {
        setFinanceLastResetDate(new Date(data));
      }
    } catch (error) {
      console.error('Error loading finance last reset date:', error);
    }
  };

  const saveFinanceLastResetDate = async (date: Date) => {
    try {
      await AsyncStorage.setItem(FINANCE_LAST_RESET_DATE_KEY, date.toISOString());
    } catch (error) {
      console.error('Error saving finance last reset date:', error);
    }
  };

  const loadFinancePreviousMonthLeftover = async () => {
    try {
      const data = await AsyncStorage.getItem(FINANCE_PREVIOUS_MONTH_LEFTOVER_KEY);
      if (data) {
        setFinancePreviousMonthLeftover(parseFloat(data));
      }
    } catch (error) {
      console.error('Error loading finance previous month leftover:', error);
    }
  };

  const saveFinancePreviousMonthLeftover = async (amount: number) => {
    try {
      await AsyncStorage.setItem(FINANCE_PREVIOUS_MONTH_LEFTOVER_KEY, amount.toString());
    } catch (error) {
      console.error('Error saving finance previous month leftover:', error);
    }
  };

  const setWeekPlanningServings = (servings: number) => {
    setWeekPlanningServingsState(servings);
    saveWeekPlanningServings(servings);
  };

  const setCurrentUser = (user: FamilyMember | null) => {
    setCurrentUserState(user);
  };

  const setFinanceResetDay = (day: number) => {
    setFinanceResetDayState(day);
    // Initialize last reset date to today if not set
    if (!financeLastResetDate) {
      setFinanceLastResetDate(new Date());
    }
  };

  const checkAndPerformMonthlyReset = () => {
    if (financeResetDay === null) return;

    const today = new Date();
    const currentDay = today.getDate();

    // If we haven't reset yet, initialize
    if (!financeLastResetDate) {
      setFinanceLastResetDate(today);
      return;
    }

    // Check if we've passed the reset day since last reset
    const lastReset = new Date(financeLastResetDate);
    const daysSinceLastReset = Math.floor((today.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24));

    // If it's been at least a month and we've passed the reset day
    if (daysSinceLastReset >= 28 && currentDay >= financeResetDay) {
      // Calculate previous month leftover
      const totalIncome = getTotalIncome();
      const totalFixed = getTotalFixedExpenses();
      const totalVariableSpent = budgetPots.reduce((sum, pot) => sum + pot.spent, 0);
      const leftover = totalIncome - totalFixed - totalVariableSpent;

      // Save leftover
      setFinancePreviousMonthLeftover(leftover);

      // Reset all budget pots
      setBudgetPots(prev => prev.map(pot => ({ ...pot, spent: 0 })));

      // Update last reset date
      setFinanceLastResetDate(today);

      console.log('Monthly reset performed:', {
        leftover,
        date: today.toISOString(),
      });
    }
  };

  const addFamilyMember = (member: Omit<FamilyMember, 'id'>) => {
    const newMember: FamilyMember = {
      ...member,
      id: Date.now().toString(),
    };
    setFamilyMembers(prev => [...prev, newMember]);
  };

  const updateFamilyMember = (memberId: string, updates: Partial<FamilyMember>) => {
    setFamilyMembers(prev =>
      prev.map(member =>
        member.id === memberId ? { ...member, ...updates } : member
      )
    );
    
    // Update current user if it's the one being updated
    if (currentUser?.id === memberId) {
      setCurrentUserState(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const deleteFamilyMember = (memberId: string) => {
    setFamilyMembers(prev => prev.filter(member => member.id !== memberId));
    
    // If deleting current user, clear current user
    if (currentUser?.id === memberId) {
      setCurrentUserState(null);
    }
  };

  const completeTask = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === taskId && !task.completed) {
          addCoins(task.assignedTo, task.coins);
          return {
            ...task,
            completed: true,
            completedCount: task.completedCount + 1,
          };
        }
        return task;
      })
    );
  };

  const addCoins = (memberId: string, amount: number) => {
    setFamilyMembers(prevMembers =>
      prevMembers.map(member =>
        member.id === memberId
          ? { ...member, coins: member.coins + amount }
          : member
      )
    );
  };

  const redeemReward = (memberId: string, rewardId: string) => {
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward) return;

    const member = familyMembers.find(m => m.id === memberId);
    if (!member || member.coins < reward.cost) return;

    setFamilyMembers(prevMembers =>
      prevMembers.map(m =>
        m.id === memberId
          ? { ...m, coins: m.coins - reward.cost }
          : m
      )
    );
  };

  const addTask = (task: Omit<Task, 'id' | 'completedCount'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      completedCount: 0,
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
    
    addNotification({
      type: 'task',
      title: 'Nieuwe taak toegevoegd',
      message: `${task.name} is toegevoegd`,
      createdBy: currentUser?.id || '',
    });
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };

  const addAppointment = (appointment: Omit<Appointment, 'id'>) => {
    const newAppointment: Appointment = {
      ...appointment,
      id: Date.now().toString(),
    };
    setAppointments(prev => [...prev, newAppointment]);
    
    addNotification({
      type: 'appointment',
      title: 'Nieuwe afspraak',
      message: `${appointment.title} is toegevoegd`,
      createdBy: currentUser?.id || '',
    });
  };

  const updateAppointment = (appointmentId: string, updates: Partial<Appointment>) => {
    setAppointments(prev =>
      prev.map(apt => (apt.id === appointmentId ? { ...apt, ...updates } : apt))
    );
  };

  const deleteAppointment = (appointmentId: string) => {
    setAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
  };

  const addHouseholdTask = (task: Omit<HouseholdTask, 'id'>) => {
    const newTask: HouseholdTask = {
      ...task,
      id: Date.now().toString(),
    };
    setHouseholdTasks(prev => [...prev, newTask]);
  };

  const updateHouseholdTask = (taskId: string, updates: Partial<HouseholdTask>) => {
    setHouseholdTasks(prev =>
      prev.map(task => (task.id === taskId ? { ...task, ...updates } : task))
    );
  };

  const deleteHouseholdTask = (taskId: string) => {
    setHouseholdTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
    };
    setExpenses(prev => [...prev, newExpense]);
    
    addNotification({
      type: 'finance',
      title: 'Nieuwe uitgave',
      message: `${expense.name} - €${expense.amount.toFixed(2)}`,
      createdBy: currentUser?.id || '',
    });
  };

  const updateExpense = (expenseId: string, updates: Partial<Expense>) => {
    setExpenses(prev =>
      prev.map(exp => (exp.id === expenseId ? { ...exp, ...updates } : exp))
    );
  };

  const deleteExpense = (expenseId: string) => {
    setExpenses(prev => prev.filter(exp => exp.id !== expenseId));
  };

  const addIncome = (income: Omit<Income, 'id'>) => {
    const newIncome: Income = {
      ...income,
      id: Date.now().toString(),
    };
    setIncomes(prev => [...prev, newIncome]);
    
    addNotification({
      type: 'finance',
      title: 'Nieuw inkomen',
      message: `${income.name} - €${income.amount.toFixed(2)}`,
      createdBy: currentUser?.id || '',
    });
  };

  const updateIncome = (incomeId: string, updates: Partial<Income>) => {
    setIncomes(prev =>
      prev.map(inc => (inc.id === incomeId ? { ...inc, ...updates } : inc))
    );
  };

  const deleteIncome = (incomeId: string) => {
    setIncomes(prev => prev.filter(inc => inc.id !== incomeId));
  };

  const addReceipt = (receipt: Omit<Receipt, 'id'>) => {
    const newReceipt: Receipt = {
      ...receipt,
      id: Date.now().toString(),
    };
    setReceipts(prev => [...prev, newReceipt]);
    
    addExpense({
      name: receipt.category || 'Bonnetje',
      amount: receipt.amount,
      category: 'variable',
      variableCategory: (receipt.category?.toLowerCase() as any) || 'overig',
      date: receipt.date,
      paid: true,
      recurring: false,
    });
  };

  const addMeal = (meal: Omit<Meal, 'id'>) => {
    const newMeal: Meal = {
      ...meal,
      id: Date.now().toString(),
      baseServings: meal.servings || 2,
    };
    setMeals(prev => [...prev, newMeal]);
  };

  const updateMeal = (mealId: string, updates: Partial<Meal>) => {
    setMeals(prev =>
      prev.map(meal => (meal.id === mealId ? { ...meal, ...updates } : meal))
    );
  };

  const deleteMeal = (mealId: string) => {
    setMeals(prev => prev.filter(meal => meal.id !== mealId));
  };

  const addSavingsPot = (pot: Omit<SavingsPot, 'id'>) => {
    const newPot: SavingsPot = {
      ...pot,
      id: Date.now().toString(),
    };
    setSavingsPots(prev => [...prev, newPot]);
  };

  const updateSavingsPot = (potId: string, updates: Partial<SavingsPot>) => {
    setSavingsPots(prev =>
      prev.map(pot => (pot.id === potId ? { ...pot, ...updates } : pot))
    );
  };

  const deleteSavingsPot = (potId: string) => {
    setSavingsPots(prev => prev.filter(pot => pot.id !== potId));
  };

  const addBudgetPot = (pot: Omit<BudgetPot, 'id'>) => {
    const newPot: BudgetPot = {
      ...pot,
      id: Date.now().toString(),
    };
    setBudgetPots(prev => [...prev, newPot]);
  };

  const updateBudgetPot = (potId: string, updates: Partial<BudgetPot>) => {
    setBudgetPots(prev =>
      prev.map(pot => (pot.id === potId ? { ...pot, ...updates } : pot))
    );
  };

  const deleteBudgetPot = (potId: string) => {
    setBudgetPots(prev => prev.filter(pot => pot.id !== potId));
  };

  const addMemory = (memory: Omit<Memory, 'id'>) => {
    const newMemory: Memory = {
      ...memory,
      id: Date.now().toString(),
    };
    setMemories(prev => [newMemory, ...prev]);
  };

  const updateMemory = (memoryId: string, updates: Partial<Memory>) => {
    setMemories(prev =>
      prev.map(memory => (memory.id === memoryId ? { ...memory, ...updates } : memory))
    );
  };

  const deleteMemory = (memoryId: string) => {
    setMemories(prev => prev.filter(memory => memory.id !== memoryId));
  };

  const addShoppingItem = (item: Omit<ShoppingItem, 'id' | 'addedAt'>) => {
    const newItem: ShoppingItem = {
      ...item,
      id: Date.now().toString(),
      addedAt: new Date(),
    };
    setShoppingList(prev => [...prev, newItem]);
    
    addNotification({
      type: 'shopping',
      title: 'Nieuw boodschappenlijstje item',
      message: `${item.name} is toegevoegd`,
      createdBy: currentUser?.id || '',
    });
  };

  const toggleShoppingItem = (itemId: string) => {
    setShoppingList(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const deleteShoppingItem = (itemId: string) => {
    setShoppingList(prev => prev.filter(item => item.id !== itemId));
  };

  const addPantryItem = (item: Omit<PantryItem, 'id' | 'addedAt'>) => {
    const newItem: PantryItem = {
      ...item,
      id: Date.now().toString(),
      addedAt: new Date(),
    };
    setPantryItems(prev => [...prev, newItem]);
  };

  const updatePantryItem = (itemId: string, updates: Partial<PantryItem>) => {
    setPantryItems(prev =>
      prev.map(item => (item.id === itemId ? { ...item, ...updates } : item))
    );
  };

  const deletePantryItem = (itemId: string) => {
    setPantryItems(prev => prev.filter(item => item.id !== itemId));
  };

  const addFamilyNote = (note: Omit<FamilyNote, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: FamilyNote = {
      ...note,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setFamilyNotes(prev => [newNote, ...prev]);
    
    addNotification({
      type: 'note',
      title: 'Nieuwe notitie',
      message: `${note.title} is toegevoegd`,
      createdBy: currentUser?.id || '',
    });
  };

  const updateFamilyNote = (noteId: string, updates: Partial<FamilyNote>) => {
    setFamilyNotes(prev =>
      prev.map(note =>
        note.id === noteId ? { ...note, ...updates, updatedAt: new Date() } : note
      )
    );
  };

  const deleteFamilyNote = (noteId: string) => {
    setFamilyNotes(prev => prev.filter(note => note.id !== noteId));
  };

  const addReminder = (reminder: Omit<Reminder, 'id'>) => {
    const newReminder: Reminder = {
      ...reminder,
      id: Date.now().toString(),
    };
    setReminders(prev => [...prev, newReminder]);
  };

  const updateReminder = (reminderId: string, updates: Partial<Reminder>) => {
    setReminders(prev =>
      prev.map(reminder =>
        reminder.id === reminderId ? { ...reminder, ...updates } : reminder
      )
    );
  };

  const deleteReminder = (reminderId: string) => {
    setReminders(prev => prev.filter(reminder => reminder.id !== reminderId));
  };

  const addDailyScheduleItem = (item: Omit<DailyScheduleItem, 'id'>) => {
    const newItem: DailyScheduleItem = {
      ...item,
      id: Date.now().toString(),
    };
    setDailySchedule(prev => [...prev, newItem]);
  };

  const updateDailyScheduleItem = (itemId: string, updates: Partial<DailyScheduleItem>) => {
    setDailySchedule(prev =>
      prev.map(item => (item.id === itemId ? { ...item, ...updates } : item))
    );
  };

  const deleteDailyScheduleItem = (itemId: string) => {
    setDailySchedule(prev => prev.filter(item => item.id !== itemId));
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markNotificationRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const getTotalIncome = () => {
    return incomes.reduce((sum, income) => sum + income.amount, 0);
  };

  const getTotalFixedExpenses = () => {
    return expenses
      .filter(exp => exp.category === 'fixed')
      .reduce((sum, exp) => sum + exp.amount, 0);
  };

  const getTotalVariableExpenses = () => {
    return expenses
      .filter(exp => exp.category === 'variable')
      .reduce((sum, exp) => sum + exp.amount, 0);
  };

  const getRemainingBudget = () => {
    return getTotalIncome() - getTotalFixedExpenses() - getTotalVariableExpenses();
  };

  const getMonthlyOverview = () => {
    const income = getTotalIncome();
    const fixed = getTotalFixedExpenses();
    const variable = getTotalVariableExpenses();
    const remaining = income - fixed - variable;
    
    return { income, fixed, variable, remaining };
  };

  const addIngredientsToShoppingList = (ingredients: string[]) => {
    ingredients.forEach(ingredient => {
      addShoppingItem({
        name: ingredient,
        completed: false,
        addedBy: currentUser?.id || '',
      });
    });
  };

  const addRecipeIngredientsToShoppingList = async (meal: Meal): Promise<{ added: number; skipped: string[] }> => {
    if (!meal.ingredients || meal.ingredients.length === 0) {
      return { added: 0, skipped: [] };
    }

    const skippedItems: string[] = [];
    let addedCount = 0;

    // Create a map of pantry items for quick lookup (case-insensitive)
    const pantryMap = new Map<string, PantryItem>();
    pantryItems.forEach(item => {
      pantryMap.set(item.name.toLowerCase(), item);
    });

    // Process each ingredient
    for (const ingredient of meal.ingredients) {
      // Check if ingredient is in pantry
      if (pantryMap.has(ingredient.name.toLowerCase())) {
        skippedItems.push(ingredient.name);
        continue;
      }

      // Scale ingredient based on weekPlanningServings
      let scaledQuantity = ingredient.quantity;
      const baseServings = meal.baseServings || 2;
      
      // Only scale if it's a numeric ingredient (not textual like "snufje")
      if (!shouldNotScale(`${ingredient.quantity} ${ingredient.unit} ${ingredient.name}`)) {
        scaledQuantity = ingredient.quantity * (weekPlanningServings / baseServings);
      }

      // Check if item already exists in shopping list
      const existingItem = shoppingList.find(
        item => item.name.toLowerCase() === ingredient.name.toLowerCase() &&
                item.unit === ingredient.unit &&
                item.category === ingredient.category
      );

      if (existingItem) {
        // Merge quantities
        const newQuantity = (existingItem.quantity || 0) + scaledQuantity;
        setShoppingList(prev =>
          prev.map(item =>
            item.id === existingItem.id
              ? { ...item, quantity: newQuantity }
              : item
          )
        );
      } else {
        // Add new item
        addShoppingItem({
          name: ingredient.name,
          quantity: scaledQuantity,
          unit: ingredient.unit,
          category: ingredient.category,
          completed: false,
          addedBy: currentUser?.id || '',
        });
      }
      
      addedCount++;
    }

    return { added: addedCount, skipped: skippedItems };
  };

  const shareShoppingListText = async () => {
    try {
      const { generateShoppingListText } = await import('@/utils/pdfGenerator');
      const text = generateShoppingListText(shoppingList.filter(item => !item.completed));
      
      await Share.share({
        message: text,
        title: 'Flow Fam Boodschappenlijst',
      });
    } catch (error) {
      console.error('Error sharing shopping list:', error);
      Alert.alert('Fout', 'Er ging iets mis bij het delen van de boodschappenlijst');
    }
  };

  const generateFamilyInviteCode = async (): Promise<string> => {
    // Generate a unique 6-character code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setFamilyCode(code);
    return code;
  };

  const shareFamilyInvite = async () => {
    try {
      let code = familyCode;
      if (!code) {
        code = await generateFamilyInviteCode();
      }

      const message = `👨‍👩‍👧‍👦 Je bent uitgenodigd om deel te nemen aan ons gezin in Flow Fam!\n\nGebruik deze code om je aan te sluiten: ${code}\n\nDownload de app en voer de code in tijdens het instellen.`;

      await Share.share({
        message,
        title: 'Flow Fam Uitnodiging',
      });
    } catch (error) {
      console.error('Error sharing family invite:', error);
      Alert.alert('Fout', 'Er ging iets mis bij het delen van de uitnodiging');
    }
  };

  const getVisibleFamilyMembers = (): FamilyMember[] => {
    if (!currentUser) return familyMembers;
    
    // Parents see all members
    if (currentUser.role === 'parent') {
      return familyMembers;
    }
    
    // Children only see themselves
    return familyMembers.filter(m => m.id === currentUser.id);
  };

  return (
    <FamilyContext.Provider
      value={{
        familyMembers,
        tasks,
        rewards,
        appointments,
        householdTasks,
        expenses,
        incomes,
        receipts,
        meals,
        savingsPots,
        memories,
        shoppingList,
        pantryItems,
        familyNotes,
        reminders,
        dailySchedule,
        notifications,
        budgetPots,
        financeResetDay,
        financeLastResetDate,
        financePreviousMonthLeftover,
        selectedMember,
        currentUser,
        financePasscode,
        financeOnboardingComplete,
        weekPlanningServings,
        familyCode,
        setSelectedMember,
        setCurrentUser,
        setFinancePasscode,
        setFinanceOnboardingComplete,
        setWeekPlanningServings,
        setFinanceResetDay,
        checkAndPerformMonthlyReset,
        addFamilyMember,
        updateFamilyMember,
        deleteFamilyMember,
        completeTask,
        addCoins,
        redeemReward,
        addTask,
        updateTask,
        deleteTask,
        addAppointment,
        updateAppointment,
        deleteAppointment,
        addHouseholdTask,
        updateHouseholdTask,
        deleteHouseholdTask,
        addExpense,
        updateExpense,
        deleteExpense,
        addIncome,
        updateIncome,
        deleteIncome,
        addReceipt,
        addMeal,
        updateMeal,
        deleteMeal,
        addSavingsPot,
        updateSavingsPot,
        deleteSavingsPot,
        addBudgetPot,
        updateBudgetPot,
        deleteBudgetPot,
        addMemory,
        updateMemory,
        deleteMemory,
        addShoppingItem,
        toggleShoppingItem,
        deleteShoppingItem,
        addPantryItem,
        updatePantryItem,
        deletePantryItem,
        addFamilyNote,
        updateFamilyNote,
        deleteFamilyNote,
        addReminder,
        updateReminder,
        deleteReminder,
        addDailyScheduleItem,
        updateDailyScheduleItem,
        deleteDailyScheduleItem,
        addNotification,
        markNotificationRead,
        getTotalIncome,
        getTotalFixedExpenses,
        getTotalVariableExpenses,
        getRemainingBudget,
        getMonthlyOverview,
        addIngredientsToShoppingList,
        addRecipeIngredientsToShoppingList,
        shareShoppingListText,
        generateFamilyInviteCode,
        shareFamilyInvite,
        getVisibleFamilyMembers,
      }}
    >
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamily() {
  const context = useContext(FamilyContext);
  if (context === undefined) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return context;
}

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import {
  FamilyMember,
  Task,
  Reward,
  Appointment,
  HouseholdTask,
  Expense,
  Income,
  Receipt,
  Meal,
  SavingsPot,
  Memory,
  ShoppingItem,
  FamilyNote,
  Reminder,
  DailyScheduleItem,
  Notification,
  PantryItem,
  IngredientCategory,
  BudgetPot,
} from '@/types/family';
import { initialRewards } from '@/data/familyData';
import {
  savePantryItems,
  loadPantryItems,
  saveWeekPlanningServings,
  loadWeekPlanningServings,
  saveCurrentUserId,
  saveFamilyMembers,
  saveFamilyCode,
  loadFamilyCode,
} from '@/utils/localStorage';
import { shouldNotScale } from '@/utils/ingredientCategories';
import { Alert, Share } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/utils/supabase';
import { getCurrentUser } from '@/utils/auth';
import { randomUUID } from 'expo-crypto';

interface Family {
  id: string;
  family_code: string;
}

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
  currentFamily: Family | null;
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
  deleteFamilyMember: (memberId: string) => Promise<void>;

  completeTask: (taskId: string) => void;
  addCoins: (memberId: string, amount: number) => void;
  redeemReward: (memberId: string, rewardId: string) => void;

  addTask: (task: Omit<Task, 'id' | 'completedCount'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => Promise<void>;

  addAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  updateAppointment: (appointmentId: string, updates: Partial<Appointment>) => void;
  deleteAppointment: (appointmentId: string, deleteSeries?: boolean) => Promise<void>;

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
  deleteShoppingItem: (itemId: string) => Promise<void>;

  addPantryItem: (item: Omit<PantryItem, 'id' | 'addedAt'>) => void;
  updatePantryItem: (itemId: string, updates: Partial<PantryItem>) => void;
  deletePantryItem: (itemId: string) => Promise<void>;

  addFamilyNote: (note: Omit<FamilyNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateFamilyNote: (noteId: string, updates: Partial<FamilyNote>) => void;
  deleteFamilyNote: (noteId: string) => Promise<void>;

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
  addRecipeIngredientsToShoppingList: (
    meal: Meal
  ) => Promise<{ added: number; skipped: string[] }>;
  shareShoppingListText: () => Promise<void>;

  generateFamilyInviteCode: () => Promise<string>;
  shareFamilyInvite: () => Promise<void>;
  getVisibleFamilyMembers: () => FamilyMember[];

  loadAppointmentsFromDB: () => Promise<void>;
  loadTasksFromDB: () => Promise<void>;
  loadShoppingItemsFromDB: () => Promise<void>;
  loadPantryItemsFromDB: () => Promise<void>;
  loadNotesFromDB: () => Promise<void>;
  reloadCurrentUser: () => Promise<void>;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

const BUDGET_POTS_KEY = '@flow_fam_budget_pots';
const FINANCE_RESET_DAY_KEY = '@flow_fam_finance_reset_day';
const FINANCE_LAST_RESET_DATE_KEY = '@flow_fam_finance_last_reset_date';
const FINANCE_PREVIOUS_MONTH_LEFTOVER_KEY = '@flow_fam_finance_previous_month_leftover';

export function FamilyProvider({ children }: { children: ReactNode }) {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
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
  const [currentFamily, setCurrentFamily] = useState<Family | null>(null);
  const [financePasscode, setFinancePasscode] = useState<string | null>(null);
  const [financeOnboardingComplete, setFinanceOnboardingComplete] = useState(false);
  const [weekPlanningServings, setWeekPlanningServingsState] = useState(2);
  const [familyCode, setFamilyCode] = useState<string | null>(null);

  const loadAppointmentsFromDB = useCallback(async () => {
    if (!currentFamily) return;

    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('family_id', currentFamily.id);

    if (error) {
      console.error('Error loading appointments:', error);
      return;
    }

    if (data) {
      const formatted: Appointment[] = data.map((apt: any) => ({
        id: apt.id,
        title: apt.title,
        date: new Date(apt.date),
        time: apt.time,
        endTime: apt.end_time || undefined,
        assignedTo: apt.assigned_to || [],
        color: apt.color,
        repeatType: apt.repeat_type as any,
        weekdays: apt.weekdays || undefined,
        endDate: apt.end_date ? new Date(apt.end_date) : undefined,
        location: apt.location || undefined,
        notes: apt.notes || undefined,
        ...(apt.series_id ? ({ seriesId: apt.series_id } as any) : {}),
      }));
      setAppointments(formatted);
    }
  }, [currentFamily]);

  const loadTasksFromDB = useCallback(async () => {
    if (!currentFamily) return;

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('family_id', currentFamily.id);

    if (error) {
      console.error('Error loading tasks:', error);
      return;
    }

    if (data) {
      const formatted: Task[] = data.map((task: any) => ({
        id: task.id,
        name: task.name,
        icon: task.icon,
        coins: task.coins,
        assignedTo: task.assigned_to || '',
        completed: task.completed,
        repeatType: task.repeat_type as any,
        completedCount: task.completed_count,
        dueDate: task.due_date ? new Date(task.due_date) : undefined,
        time: task.time || undefined,
        createdBy: task.created_by || undefined,
      }));
      setTasks(formatted);
    }
  }, [currentFamily]);

  const loadShoppingItemsFromDB = useCallback(async () => {
    if (!currentFamily) return;

    const { data, error } = await supabase
      .from('shopping_items')
      .select('*')
      .eq('family_id', currentFamily.id);

    if (error) {
      console.error('Error loading shopping items:', error);
      return;
    }

    if (data) {
      const formatted: ShoppingItem[] = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity ? parseFloat(item.quantity) : undefined,
        unit: item.unit || undefined,
        category: item.category as IngredientCategory || undefined,
        completed: item.completed,
        addedBy: item.added_by || '',
        addedAt: new Date(item.added_at),
      }));
      setShoppingList(formatted);
    }
  }, [currentFamily]);

  const loadPantryItemsFromDB = useCallback(async () => {
    if (!currentFamily) return;

    const { data, error } = await supabase
      .from('pantry_items')
      .select('*')
      .eq('family_id', currentFamily.id);

    if (error) {
      console.error('Error loading pantry items:', error);
      return;
    }

    if (data) {
      const formatted: PantryItem[] = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        quantity: parseFloat(item.quantity),
        unit: item.unit,
        category: item.category as IngredientCategory,
        addedAt: new Date(item.added_at),
      }));
      setPantryItems(formatted);
    }
  }, [currentFamily]);

  const loadNotesFromDB = useCallback(async () => {
    if (!currentFamily) return;

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('family_id', currentFamily.id);

    if (error) {
      console.error('Error loading notes:', error);
      return;
    }

    if (data) {
      const formatted: FamilyNote[] = data.map((note: any) => ({
        id: note.id,
        title: note.title,
        content: note.content,
        createdBy: note.created_by,
        sharedWith: note.shared_with || [],
        createdAt: new Date(note.created_at),
        updatedAt: new Date(note.updated_at),
      }));
      setFamilyNotes(formatted);
    }
  }, [currentFamily]);

  const reloadCurrentUser = useCallback(async () => {
    try {
      const authUser = await getCurrentUser();
      if (!authUser) {
        setCurrentUserState(null);
        return;
      }

      const { data: familyMemberData, error: familyMemberError } = await supabase
        .from('family_members')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      if (familyMemberError) {
        setCurrentUserState(null);
        return;
      }

      const member: FamilyMember = {
        id: familyMemberData.id,
        userId: familyMemberData.user_id,
        name: familyMemberData.name,
        role: familyMemberData.role,
        color: familyMemberData.color || '#CBA85B',
        photoUri: familyMemberData.photo_uri,
        coins: familyMemberData.coins || 0,
      };
      setCurrentUserState(member);

      const { data: familyData, error: familyError } = await supabase
        .from('families')
        .select('*')
        .eq('id', familyMemberData.family_id)
        .single();

      if (familyError) return;

      setCurrentFamily(familyData);
      setFamilyCode(familyData.family_code);

      const { data: allMembersData } = await supabase
        .from('family_members')
        .select('*')
        .eq('family_id', familyData.id);

      if (allMembersData) {
        const members: FamilyMember[] = allMembersData.map((m: any) => ({
          id: m.id,
          userId: m.user_id,
          name: m.name,
          role: m.role,
          color: m.color || '#CBA85B',
          photoUri: m.photo_uri,
          coins: m.coins || 0,
        }));
        setFamilyMembers(members);
        saveFamilyMembers(members);
      }
    } catch (e) {
      console.error('Error reloading current user:', e);
    }
  }, []);

  const loadInitialData = useCallback(async () => {
    try {
      await reloadCurrentUser();

      const items = await loadPantryItems();
      setPantryItems(items);

      const servings = await loadWeekPlanningServings();
      setWeekPlanningServingsState(servings);

      const savedFamilyCode = await loadFamilyCode();
      if (savedFamilyCode) setFamilyCode(savedFamilyCode);

      const bp = await AsyncStorage.getItem(BUDGET_POTS_KEY);
      if (bp) setBudgetPots(JSON.parse(bp));

      const frd = await AsyncStorage.getItem(FINANCE_RESET_DAY_KEY);
      if (frd) setFinanceResetDayState(parseInt(frd, 10));

      const lrd = await AsyncStorage.getItem(FINANCE_LAST_RESET_DATE_KEY);
      if (lrd) setFinanceLastResetDate(new Date(lrd));

      const prev = await AsyncStorage.getItem(FINANCE_PREVIOUS_MONTH_LEFTOVER_KEY);
      if (prev) setFinancePreviousMonthLeftover(parseFloat(prev));
    } catch (e) {
      console.error('Error loading initial data:', e);
    }
  }, [reloadCurrentUser]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    if (currentFamily) {
      loadAppointmentsFromDB();
      loadTasksFromDB();
      loadShoppingItemsFromDB();
      loadPantryItemsFromDB();
      loadNotesFromDB();
    }
  }, [
    currentFamily,
    loadAppointmentsFromDB,
    loadTasksFromDB,
    loadShoppingItemsFromDB,
    loadPantryItemsFromDB,
    loadNotesFromDB,
  ]);

  useEffect(() => {
    if (familyMembers.length > 0) saveFamilyMembers(familyMembers);
  }, [familyMembers]);

  useEffect(() => {
    if (currentUser) saveCurrentUserId(currentUser.id);
  }, [currentUser]);

  useEffect(() => {
    if (familyCode) saveFamilyCode(familyCode);
  }, [familyCode]);

  useEffect(() => {
    savePantryItems(pantryItems);
  }, [pantryItems]);

  useEffect(() => {
    AsyncStorage.setItem(BUDGET_POTS_KEY, JSON.stringify(budgetPots)).catch(console.error);
  }, [budgetPots]);

  useEffect(() => {
    if (financeResetDay !== null) {
      AsyncStorage.setItem(FINANCE_RESET_DAY_KEY, financeResetDay.toString()).catch(console.error);
    }
  }, [financeResetDay]);

  useEffect(() => {
    if (financeLastResetDate) {
      AsyncStorage.setItem(FINANCE_LAST_RESET_DATE_KEY, financeLastResetDate.toISOString()).catch(console.error);
    }
  }, [financeLastResetDate]);

  useEffect(() => {
    if (financePreviousMonthLeftover !== null) {
      AsyncStorage.setItem(FINANCE_PREVIOUS_MONTH_LEFTOVER_KEY, financePreviousMonthLeftover.toString()).catch(console.error);
    }
  }, [financePreviousMonthLeftover]);

  const setWeekPlanningServings = (servings: number) => {
    setWeekPlanningServingsState(servings);
    saveWeekPlanningServings(servings);
  };

  const setCurrentUser = (user: FamilyMember | null) => setCurrentUserState(user);

  const setFinanceResetDay = (day: number) => {
    setFinanceResetDayState(day);
    if (!financeLastResetDate) setFinanceLastResetDate(new Date());
  };

  const checkAndPerformMonthlyReset = () => {
    if (financeResetDay === null) return;

    const today = new Date();
    const currentDay = today.getDate();

    if (!financeLastResetDate) {
      setFinanceLastResetDate(today);
      return;
    }

    const lastReset = new Date(financeLastResetDate);
    const daysSinceLastReset = Math.floor((today.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceLastReset >= 28 && currentDay >= financeResetDay) {
      const totalIncome = getTotalIncome();
      const totalFixed = getTotalFixedExpenses();
      const totalVariableSpent = budgetPots.reduce((sum, pot) => sum + pot.spent, 0);
      const leftover = totalIncome - totalFixed - totalVariableSpent;

      setFinancePreviousMonthLeftover(leftover);
      setBudgetPots(prev => prev.map(pot => ({ ...pot, spent: 0 })));
      setFinanceLastResetDate(today);
    }
  };

  const addFamilyMember = (member: Omit<FamilyMember, 'id'>) => {
    const newMember: FamilyMember = { ...member, id: randomUUID() };
    setFamilyMembers(prev => [...prev, newMember]);
  };

  const updateFamilyMember = (memberId: string, updates: Partial<FamilyMember>) => {
    setFamilyMembers(prev => prev.map(m => (m.id === memberId ? { ...m, ...updates } : m)));
    if (currentUser?.id === memberId) setCurrentUserState(prev => (prev ? { ...prev, ...updates } : null));
  };

  const deleteFamilyMember = async (memberId: string) => {
    if (currentFamily) {
      const { error } = await supabase.from('family_members').delete().eq('id', memberId);
      if (error) throw error;
    }
    setFamilyMembers(prev => prev.filter(m => m.id !== memberId));
    if (currentUser?.id === memberId) setCurrentUserState(null);
  };

  const completeTask = (taskId: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId && !t.completed) {
          addCoins(t.assignedTo, t.coins);
          return { ...t, completed: true, completedCount: t.completedCount + 1 };
        }
        return t;
      })
    );
  };

  const addCoins = (memberId: string, amount: number) => {
    setFamilyMembers(prev => prev.map(m => (m.id === memberId ? { ...m, coins: m.coins + amount } : m)));
  };

  const redeemReward = (memberId: string, rewardId: string) => {
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward) return;
    const member = familyMembers.find(m => m.id === memberId);
    if (!member || member.coins < reward.cost) return;
    setFamilyMembers(prev => prev.map(m => (m.id === memberId ? { ...m, coins: m.coins - reward.cost } : m)));
  };

  const addTask = (task: Omit<Task, 'id' | 'completedCount'>) => {
    const newTask: Task = { ...task, id: randomUUID(), completedCount: 0 };
    setTasks(prev => [...prev, newTask]);

    if (currentFamily) {
      supabase.from('tasks').insert([{
        id: newTask.id,
        family_id: currentFamily.id,
        name: newTask.name,
        icon: newTask.icon,
        coins: newTask.coins,
        assigned_to: newTask.assignedTo,
        completed: newTask.completed,
        repeat_type: newTask.repeatType,
        completed_count: newTask.completedCount,
        due_date: newTask.dueDate?.toISOString(),
        time: newTask.time,
        created_by: newTask.createdBy,
      }]).then(({ error }) => {
        if (error) console.error('Error adding task to DB:', error);
      });
    }

    addNotification({
      type: 'task',
      title: 'Nieuwe taak toegevoegd',
      message: `${task.name} is toegevoegd`,
      createdBy: currentUser?.id || '',
    });
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, ...updates } : t)));
  };

  const deleteTask = async (taskId: string) => {
    if (currentFamily) {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId).eq('family_id', currentFamily.id);
      if (error) throw error;
    }
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  // ✅ FIX: herhaal-afspraken krijgen seriesId, en opslaan is "optimistic safe"
  const addAppointment = (appointment: Omit<Appointment, 'id'>) => {
    const seriesId =
      appointment.repeatType && appointment.repeatType !== 'none'
        ? randomUUID()
        : null;

    const optimisticId = randomUUID();

    const optimistic: Appointment = {
      ...(appointment as any),
      id: optimisticId,
      ...(seriesId ? ({ seriesId } as any) : {}),
    };

    setAppointments(prev => [...prev, optimistic]);

    (async () => {
      try {
        if (!currentFamily) return;

        const { data, error } = await supabase
          .from('appointments')
          .insert([{
            family_id: currentFamily.id,
            title: appointment.title,
            date: appointment.date.toISOString(),
            time: appointment.time,
            end_time: appointment.endTime ?? null,
            assigned_to: appointment.assignedTo,
            color: appointment.color,
            repeat_type: appointment.repeatType,
            weekdays: (appointment as any).weekdays ?? null,
            end_date: (appointment as any).endDate?.toISOString() ?? null,
            location: (appointment as any).location ?? null,
            notes: (appointment as any).notes ?? null,
            series_id: seriesId,
          }])
          .select('*')
          .single();

        if (error) {
          console.error('Error adding appointment to DB:', error);
          setAppointments(prev => prev.filter(a => a.id !== optimisticId));
          Alert.alert('Fout', `Kon afspraak niet opslaan: ${error.message}`);
          return;
        }

        const real: Appointment = {
          id: data.id,
          title: data.title,
          date: new Date(data.date),
          time: data.time,
          endTime: data.end_time || undefined,
          assignedTo: data.assigned_to || [],
          color: data.color,
          repeatType: data.repeat_type as any,
          weekdays: data.weekdays || undefined,
          endDate: data.end_date ? new Date(data.end_date) : undefined,
          location: data.location || undefined,
          notes: data.notes || undefined,
          ...(data.series_id ? ({ seriesId: data.series_id } as any) : {}),
        };

        setAppointments(prev => prev.map(a => (a.id === optimisticId ? real : a)));

        addNotification({
          type: 'appointment',
          title: 'Nieuwe afspraak',
          message: `${appointment.title} is toegevoegd`,
          createdBy: currentUser?.id || '',
        });
      } catch (e: any) {
        console.error(e);
        setAppointments(prev => prev.filter(a => a.id !== optimisticId));
        Alert.alert('Fout', 'Er ging iets mis bij het opslaan van de afspraak.');
      }
    })();
  };

  const updateAppointment = (appointmentId: string, updates: Partial<Appointment>) => {
    setAppointments(prev => prev.map(a => (a.id === appointmentId ? { ...a, ...updates } : a)));
  };

  // ✅ FIX: deleteSeries verwijdert nu op series_id (DB + local)
  const deleteAppointment = async (appointmentId: string, deleteSeries: boolean = false) => {
    const toDelete = appointments.find(a => a.id === appointmentId) as any;
    const seriesId = toDelete?.seriesId;

    try {
      if (currentFamily) {
        if (deleteSeries && seriesId) {
          const { error } = await supabase
            .from('appointments')
            .delete()
            .eq('family_id', currentFamily.id)
            .eq('series_id', seriesId);

          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('appointments')
            .delete()
            .eq('id', appointmentId)
            .eq('family_id', currentFamily.id);

          if (error) throw error;
        }
      }

      if (deleteSeries && seriesId) {
        setAppointments(prev => prev.filter(a => (a as any).seriesId !== seriesId));
      } else {
        setAppointments(prev => prev.filter(a => a.id !== appointmentId));
      }
    } catch (error: any) {
      console.error('Error deleting appointment:', error);
      Alert.alert('Fout', `Kon afspraak niet verwijderen: ${error.message}`);
      throw error;
    }
  };

  const addHouseholdTask = (task: Omit<HouseholdTask, 'id'>) => {
    setHouseholdTasks(prev => [...prev, { ...task, id: randomUUID() }]);
  };
  const updateHouseholdTask = (taskId: string, updates: Partial<HouseholdTask>) => {
    setHouseholdTasks(prev => prev.map(t => (t.id === taskId ? { ...t, ...updates } : t)));
  };
  const deleteHouseholdTask = (taskId: string) => setHouseholdTasks(prev => prev.filter(t => t.id !== taskId));

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    setExpenses(prev => [...prev, { ...expense, id: randomUUID() }]);
    addNotification({
      type: 'finance',
      title: 'Nieuwe uitgave',
      message: `${expense.name} - €${expense.amount.toFixed(2)}`,
      createdBy: currentUser?.id || '',
    });
  };
  const updateExpense = (expenseId: string, updates: Partial<Expense>) => {
    setExpenses(prev => prev.map(e => (e.id === expenseId ? { ...e, ...updates } : e)));
  };
  const deleteExpense = (expenseId: string) => setExpenses(prev => prev.filter(e => e.id !== expenseId));

  const addIncome = (income: Omit<Income, 'id'>) => {
    setIncomes(prev => [...prev, { ...income, id: randomUUID() }]);
    addNotification({
      type: 'finance',
      title: 'Nieuw inkomen',
      message: `${income.name} - €${income.amount.toFixed(2)}`,
      createdBy: currentUser?.id || '',
    });
  };
  const updateIncome = (incomeId: string, updates: Partial<Income>) => {
    setIncomes(prev => prev.map(i => (i.id === incomeId ? { ...i, ...updates } : i)));
  };
  const deleteIncome = (incomeId: string) => setIncomes(prev => prev.filter(i => i.id !== incomeId));

  const addReceipt = (receipt: Omit<Receipt, 'id'>) => {
    setReceipts(prev => [...prev, { ...receipt, id: randomUUID() }]);
    addExpense({
      name: (receipt as any).category || 'Bonnetje',
      amount: receipt.amount,
      category: 'variable',
      variableCategory: ((receipt as any).category?.toLowerCase() as any) || 'overig',
      date: receipt.date,
      paid: true,
      recurring: false,
    } as any);
  };

  const addMeal = (meal: Omit<Meal, 'id'>) => {
    setMeals(prev => [...prev, { ...meal, id: randomUUID(), baseServings: (meal as any).servings || 2 }]);
  };
  const updateMeal = (mealId: string, updates: Partial<Meal>) => {
    setMeals(prev => prev.map(m => (m.id === mealId ? { ...m, ...updates } : m)));
  };
  const deleteMeal = (mealId: string) => setMeals(prev => prev.filter(m => m.id !== mealId));

  const addSavingsPot = (pot: Omit<SavingsPot, 'id'>) => setSavingsPots(prev => [...prev, { ...pot, id: randomUUID() }]);
  const updateSavingsPot = (potId: string, updates: Partial<SavingsPot>) =>
    setSavingsPots(prev => prev.map(p => (p.id === potId ? { ...p, ...updates } : p)));
  const deleteSavingsPot = (potId: string) => setSavingsPots(prev => prev.filter(p => p.id !== potId));

  const addBudgetPot = (pot: Omit<BudgetPot, 'id'>) => setBudgetPots(prev => [...prev, { ...pot, id: randomUUID() }]);
  const updateBudgetPot = (potId: string, updates: Partial<BudgetPot>) =>
    setBudgetPots(prev => prev.map(p => (p.id === potId ? { ...p, ...updates } : p)));
  const deleteBudgetPot = (potId: string) => setBudgetPots(prev => prev.filter(p => p.id !== potId));

  const addMemory = (memory: Omit<Memory, 'id'>) => setMemories(prev => [{ ...memory, id: randomUUID() }, ...prev]);
  const updateMemory = (memoryId: string, updates: Partial<Memory>) =>
    setMemories(prev => prev.map(m => (m.id === memoryId ? { ...m, ...updates } : m)));
  const deleteMemory = (memoryId: string) => setMemories(prev => prev.filter(m => m.id !== memoryId));

  const addShoppingItem = (item: Omit<ShoppingItem, 'id' | 'addedAt'>) => {
    const newItem: ShoppingItem = { ...item, id: randomUUID(), addedAt: new Date() };
    setShoppingList(prev => [...prev, newItem]);

    if (currentFamily) {
      supabase.from('shopping_items').insert([{
        id: newItem.id,
        family_id: currentFamily.id,
        name: newItem.name,
        quantity: (newItem as any).quantity,
        unit: (newItem as any).unit,
        category: (newItem as any).category,
        completed: newItem.completed,
        added_by: (newItem as any).addedBy,
        added_at: newItem.addedAt.toISOString(),
      }]).then(({ error }) => {
        if (error) console.error('Error adding shopping item to DB:', error);
      });
    }

    addNotification({
      type: 'shopping',
      title: 'Nieuw boodschappenlijstje item',
      message: `${item.name} is toegevoegd`,
      createdBy: currentUser?.id || '',
    });
  };

  const toggleShoppingItem = (itemId: string) => {
    setShoppingList(prev => prev.map(i => (i.id === itemId ? { ...i, completed: !i.completed } : i)));

    if (currentFamily) {
      const item = shoppingList.find(i => i.id === itemId);
      if (item) {
        supabase.from('shopping_items')
          .update({ completed: !item.completed })
          .eq('id', itemId)
          .eq('family_id', currentFamily.id)
          .then(({ error }) => {
            if (error) console.error('Error updating shopping item in DB:', error);
          });
      }
    }
  };

  const deleteShoppingItem = async (itemId: string) => {
    if (currentFamily) {
      const { error } = await supabase.from('shopping_items').delete().eq('id', itemId).eq('family_id', currentFamily.id);
      if (error) throw error;
    }
    setShoppingList(prev => prev.filter(i => i.id !== itemId));
  };

  const addPantryItem = (item: Omit<PantryItem, 'id' | 'addedAt'>) => {
    const newItem: PantryItem = { ...item, id: randomUUID(), addedAt: new Date() };
    setPantryItems(prev => [...prev, newItem]);

    if (currentFamily) {
      supabase.from('pantry_items').insert([{
        id: newItem.id,
        family_id: currentFamily.id,
        name: newItem.name,
        quantity: (newItem as any).quantity,
        unit: (newItem as any).unit,
        category: (newItem as any).category,
        added_at: newItem.addedAt.toISOString(),
      }]).then(({ error }) => {
        if (error) console.error('Error adding pantry item to DB:', error);
      });
    }
  };

  const updatePantryItem = (itemId: string, updates: Partial<PantryItem>) => {
    setPantryItems(prev => prev.map(i => (i.id === itemId ? { ...i, ...updates } : i)));
  };
  const deletePantryItem = async (itemId: string) => {
    if (currentFamily) {
      const { error } = await supabase.from('pantry_items').delete().eq('id', itemId).eq('family_id', currentFamily.id);
      if (error) throw error;
    }
    setPantryItems(prev => prev.filter(i => i.id !== itemId));
  };

  const addFamilyNote = (note: Omit<FamilyNote, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: FamilyNote = { ...note, id: randomUUID(), createdAt: new Date(), updatedAt: new Date() };
    setFamilyNotes(prev => [newNote, ...prev]);

    if (currentFamily) {
      supabase.from('notes').insert([{
        id: newNote.id,
        family_id: currentFamily.id,
        title: newNote.title,
        content: newNote.content,
        created_by: newNote.createdBy,
        shared_with: newNote.sharedWith,
        created_at: newNote.createdAt.toISOString(),
        updated_at: newNote.updatedAt.toISOString(),
      }]).then(({ error }) => {
        if (error) console.error('Error adding note to DB:', error);
      });
    }

    addNotification({
      type: 'note',
      title: 'Nieuwe notitie',
      message: `${note.title} is toegevoegd`,
      createdBy: currentUser?.id || '',
    });
  };

  const updateFamilyNote = (noteId: string, updates: Partial<FamilyNote>) => {
    setFamilyNotes(prev => prev.map(n => (n.id === noteId ? { ...n, ...updates, updatedAt: new Date() } : n)));

    if (currentFamily) {
      supabase.from('notes')
        .update({
          title: updates.title,
          content: updates.content,
          shared_with: (updates as any).sharedWith,
          updated_at: new Date().toISOString(),
        })
        .eq('id', noteId)
        .eq('family_id', currentFamily.id)
        .then(({ error }) => {
          if (error) console.error('Error updating note in DB:', error);
        });
    }
  };

  const deleteFamilyNote = async (noteId: string) => {
    if (currentFamily) {
      const { error } = await supabase.from('notes').delete().eq('id', noteId).eq('family_id', currentFamily.id);
      if (error) throw error;
    }
    setFamilyNotes(prev => prev.filter(n => n.id !== noteId));
  };

  const addReminder = (reminder: Omit<Reminder, 'id'>) => setReminders(prev => [...prev, { ...reminder, id: randomUUID() }]);
  const updateReminder = (reminderId: string, updates: Partial<Reminder>) =>
    setReminders(prev => prev.map(r => (r.id === reminderId ? { ...r, ...updates } : r)));
  const deleteReminder = (reminderId: string) => setReminders(prev => prev.filter(r => r.id !== reminderId));

  const addDailyScheduleItem = (item: Omit<DailyScheduleItem, 'id'>) =>
    setDailySchedule(prev => [...prev, { ...item, id: randomUUID() }]);
  const updateDailyScheduleItem = (itemId: string, updates: Partial<DailyScheduleItem>) =>
    setDailySchedule(prev => prev.map(i => (i.id === itemId ? { ...i, ...updates } : i)));
  const deleteDailyScheduleItem = (itemId: string) => setDailySchedule(prev => prev.filter(i => i.id !== itemId));

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newN: Notification = { ...notification, id: randomUUID(), createdAt: new Date(), read: false };
    setNotifications(prev => [newN, ...prev]);
  };
  const markNotificationRead = (notificationId: string) =>
    setNotifications(prev => prev.map(n => (n.id === notificationId ? { ...n, read: true } : n)));

  const getTotalIncome = () => incomes.reduce((sum, income) => sum + income.amount, 0);
  const getTotalFixedExpenses = () => expenses.filter(e => e.category === 'fixed').reduce((sum, e) => sum + e.amount, 0);
  const getTotalVariableExpenses = () => expenses.filter(e => e.category === 'variable').reduce((sum, e) => sum + e.amount, 0);
  const getRemainingBudget = () => getTotalIncome() - getTotalFixedExpenses() - getTotalVariableExpenses();
  const getMonthlyOverview = () => {
    const income = getTotalIncome();
    const fixed = getTotalFixedExpenses();
    const variable = getTotalVariableExpenses();
    return { income, fixed, variable, remaining: income - fixed - variable };
  };

  const addIngredientsToShoppingList = (ingredients: string[]) => {
    ingredients.forEach(name => addShoppingItem({ name, completed: false, addedBy: currentUser?.id || '' } as any));
  };

  const addRecipeIngredientsToShoppingList = async (meal: Meal) => {
    if (!(meal as any).ingredients || (meal as any).ingredients.length === 0) return { added: 0, skipped: [] as string[] };

    const skipped: string[] = [];
    let added = 0;

    const pantryMap = new Map<string, PantryItem>();
    pantryItems.forEach(item => pantryMap.set(item.name.toLowerCase(), item));

    for (const ing of (meal as any).ingredients) {
      if (pantryMap.has(ing.name.toLowerCase())) {
        skipped.push(ing.name);
        continue;
      }

      let scaledQty = ing.quantity;
      const baseServings = (meal as any).baseServings || 2;

      if (!shouldNotScale(`${ing.quantity} ${ing.unit} ${ing.name}`)) {
        scaledQty = ing.quantity * (weekPlanningServings / baseServings);
      }

      const existing = shoppingList.find(
        i =>
          i.name.toLowerCase() === ing.name.toLowerCase() &&
          (i as any).unit === ing.unit &&
          (i as any).category === ing.category
      );

      if (existing) {
        const newQty = ((existing as any).quantity || 0) + scaledQty;
        setShoppingList(prev => prev.map(i => (i.id === existing.id ? ({ ...i, quantity: newQty } as any) : i)));
      } else {
        addShoppingItem({
          name: ing.name,
          quantity: scaledQty,
          unit: ing.unit,
          category: ing.category,
          completed: false,
          addedBy: currentUser?.id || '',
        } as any);
      }
      added++;
    }

    return { added, skipped };
  };

  const shareShoppingListText = async () => {
    try {
      const { generateShoppingListText } = await import('@/utils/pdfGenerator');
      const text = generateShoppingListText(shoppingList.filter(i => !i.completed));

      await Share.share({ message: text, title: 'Flow Fam Boodschappenlijst' });
    } catch (e) {
      console.error(e);
      Alert.alert('Fout', 'Er ging iets mis bij het delen van de boodschappenlijst');
    }
  };

  const generateFamilyInviteCode = async () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setFamilyCode(code);
    return code;
  };

  const shareFamilyInvite = async () => {
    try {
      let code = familyCode;
      if (!code) code = await generateFamilyInviteCode();

      const message =
        `👨‍👩‍👧‍👦 Je bent uitgenodigd om deel te nemen aan ons gezin in Flow Fam!\n\n` +
        `Gebruik deze code om je aan te sluiten: ${code}\n\n` +
        `Download de app en voer de code in tijdens het instellen.`;

      await Share.share({ message, title: 'Flow Fam Uitnodiging' });
    } catch (e) {
      console.error(e);
      Alert.alert('Fout', 'Er ging iets mis bij het delen van de uitnodiging');
    }
  };

  const getVisibleFamilyMembers = () => {
    if (!currentUser) return familyMembers;
    if (currentUser.role === 'parent') return familyMembers;
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
        currentFamily,
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
        loadAppointmentsFromDB,
        loadTasksFromDB,
        loadShoppingItemsFromDB,
        loadPantryItemsFromDB,
        loadNotesFromDB,
        reloadCurrentUser,
      }}
    >
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamily() {
  const context = useContext(FamilyContext);
  if (!context) throw new Error('useFamily must be used within a FamilyProvider');
  return context;
}

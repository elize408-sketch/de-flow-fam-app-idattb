
export interface FamilyMember {
  id: string;
  userId: string;
  name: string;
  role: 'parent' | 'child';
  color: string;
  photoUri?: string;
  coins: number;
}

export interface Task {
  id: string;
  name: string;
  icon: string;
  coins: number;
  assignedTo: string;
  completed: boolean;
  repeatType: 'daily' | 'weekly' | 'monthly' | 'none';
  completedCount: number;
  dueDate?: Date;
  time?: string;
  createdBy?: string;
}

export interface Reward {
  id: string;
  name: string;
  cost: number;
  icon: string;
}

export interface Appointment {
  id: string;
  title: string;
  date: Date;
  time: string;
  endTime?: string;
  assignedTo: string[];
  color: string;
  repeatType?: 'none' | 'daily' | 'weekly' | 'monthly';
  weekdays?: string[];
  endDate?: Date;
  location?: string;
  notes?: string;
}

export interface HouseholdTask {
  id: string;
  name: string;
  assignedTo: string;
  completed: boolean;
  dueDate?: Date;
  repeatType?: 'daily' | 'weekly' | 'monthly' | 'none';
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: 'fixed' | 'variable';
  variableCategory?: 'boodschappen' | 'kleding' | 'vervoer' | 'entertainment' | 'overig';
  date: Date;
  paid: boolean;
  recurring: boolean;
  recurringPeriod?: 'weekly' | 'monthly' | 'yearly';
}

export interface Income {
  id: string;
  name: string;
  amount: number;
  date: Date;
  recurring: boolean;
  recurringPeriod?: 'weekly' | 'monthly' | 'yearly';
}

export interface Receipt {
  id: string;
  imageUri: string;
  amount: number;
  category?: string;
  date: Date;
}

export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  category: IngredientCategory;
}

export type IngredientCategory = 
  | 'groenten'
  | 'fruit'
  | 'vlees'
  | 'vis'
  | 'zuivel'
  | 'brood'
  | 'granen'
  | 'kruiden'
  | 'sauzen'
  | 'overig';

export interface Meal {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner';
  day?: string;
  ingredients?: Ingredient[];
  instructions?: string;
  imageUri?: string;
  servings?: number;
  baseServings?: number;
}

export interface SavingsPot {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  color: string;
  icon: string;
}

export interface BudgetPot {
  id: string;
  name: string;
  budgetAmount: number;
  spent: number;
  color: string;
  icon: string;
}

export interface Memory {
  id: string;
  title: string;
  description?: string;
  date: Date;
  photos: string[];
  participants: string[];
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity?: number;
  unit?: string;
  category?: IngredientCategory;
  completed: boolean;
  addedBy: string;
  addedAt: Date;
}

export interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: IngredientCategory;
  addedAt: Date;
}

export interface FamilyNote {
  id: string;
  title: string;
  content: string;
  createdBy: string;
  sharedWith: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  assignedTo: string[];
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface DailyScheduleItem {
  id: string;
  time: string;
  title: string;
  description?: string;
  assignedTo: string[];
  days: string[];
}

export interface Notification {
  id: string;
  type: 'task' | 'appointment' | 'finance' | 'shopping' | 'note';
  title: string;
  message: string;
  createdAt: Date;
  read: boolean;
  createdBy: string;
}

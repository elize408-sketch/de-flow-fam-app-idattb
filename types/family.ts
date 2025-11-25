
export interface FamilyMember {
  id: string;
  name: string;
  role: 'parent' | 'child';
  avatar?: string;
  coins: number;
  color: string;
}

export interface Task {
  id: string;
  name: string;
  icon: string;
  coins: number;
  assignedTo: string;
  completed: boolean;
  recurring: 'daily' | 'weekly' | 'monthly' | 'none';
  completedCount: number;
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
  assignedTo: string[];
  color: string;
  recurring: 'none' | 'daily' | 'weekly' | 'monthly';
  location?: string;
  notes?: string;
}

export interface HouseholdTask {
  id: string;
  name: string;
  assignedTo: string;
  completed: boolean;
  dueDate?: Date;
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
  recurringFrequency?: 'weekly' | 'monthly' | 'yearly';
}

export interface Income {
  id: string;
  name: string;
  amount: number;
  date: Date;
  recurring: boolean;
  recurringFrequency?: 'weekly' | 'monthly' | 'yearly';
}

export interface Receipt {
  id: string;
  imageUri: string;
  amount: number;
  date: Date;
  category?: string;
}

export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  category: IngredientCategory;
}

export type IngredientCategory = 
  | 'groente'
  | 'fruit'
  | 'zuivel'
  | 'vlees_vis'
  | 'droge_voorraad'
  | 'koelkast'
  | 'diepvries'
  | 'overig';

export interface Meal {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner';
  ingredients?: Ingredient[];
  instructions?: string;
  prepTime?: number;
  servings?: number;
  baseServings?: number;
  photoUri?: string;
}

export interface SavingsPot {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  color: string;
  icon: string;
}

export interface Memory {
  id: string;
  title: string;
  description?: string;
  date: Date;
  photos: string[];
  createdBy: string;
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
  createdAt: Date;
  updatedAt: Date;
  color?: string;
}

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  date: Date;
  time: string;
  assignedTo: string[];
  completed: boolean;
}

export interface DailyScheduleItem {
  id: string;
  time: string;
  activity: string;
  assignedTo: string[];
  recurring: boolean;
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

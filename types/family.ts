
export interface FamilyMember {
  id: string;
  name: string;
  role: 'parent' | 'child';
  avatar?: string;
  photoUri?: string;
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
  repeatType?: 'daily' | 'weekly' | 'monthly' | 'none' | 'weekdays';
  weekdays?: number[];
  completedCount: number;
  createdBy?: string;
}

export interface Reward {
  id: string;
  name: string;
  icon: string;
  cost: number;
  description: string;
}

export interface Appointment {
  id: string;
  title: string;
  date: Date;
  time: string;
  endTime?: string;
  assignedTo: string[];
  color: string;
  repeatType?: 'daily' | 'weekly' | 'monthly' | 'none' | 'weekdays';
  weekdays?: number[];
  description?: string;
}

export interface HouseholdTask {
  id: string;
  name: string;
  assignedTo: string;
  completed: boolean;
  dueDate?: Date;
  repeatType?: 'daily' | 'weekly' | 'monthly' | 'none';
  icon?: string;
  notes?: string;
  type?: 'regular' | 'repair';
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: 'fixed' | 'variable';
  variableCategory?: 'boodschappen' | 'benzine' | 'kleding' | 'entertainment' | 'overig';
  date: Date;
  paid: boolean;
  recurring?: boolean;
}

export interface Income {
  id: string;
  name: string;
  amount: number;
  type: 'salary' | 'partner' | 'benefits' | 'other';
  resetDate?: number;
}

export interface Receipt {
  id: string;
  imageUri: string;
  amount: number;
  date: Date;
  category: string;
}

export interface Meal {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner';
  date?: Date;
  recipe?: string;
  ingredients?: string[];
  instructions?: string;
  prepTime?: number;
  servings?: number;
  photoUri?: string;
}

export interface SavingsPot {
  id: string;
  name: string;
  goalAmount: number;
  currentAmount: number;
  monthlyDeposit: number;
  color: string;
  icon: string;
  targetDate?: Date;
  photoUri?: string;
}

export interface Memory {
  id: string;
  title: string;
  description: string;
  photoUri: string;
  date: Date;
  tags?: string[];
  assignedTo?: string;
}

export interface PhotoBookOrder {
  size: 'small' | 'medium' | 'large';
  price: number;
  memories: Memory[];
}

export interface ShoppingItem {
  id: string;
  name: string;
  completed: boolean;
  addedBy: string;
  addedAt: Date;
}

export interface FamilyNote {
  id: string;
  title: string;
  content: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  sharedWith?: string[];
}

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  date: Date;
  time: string;
  assignedTo: string[];
  completed: boolean;
  createdBy: string;
}

export interface DailyScheduleItem {
  id: string;
  childId: string;
  icon: string;
  label: string;
  time?: string;
  date: Date;
}

export interface Notification {
  id: string;
  type: 'task' | 'shopping' | 'note' | 'appointment' | 'finance';
  title: string;
  message: string;
  createdBy: string;
  createdAt: Date;
  read: boolean;
}

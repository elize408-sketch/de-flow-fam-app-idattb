
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
  repeatType?: 'daily' | 'weekly' | 'monthly' | 'none';
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
  assignedTo: string[];
  color: string;
  repeatType?: 'daily' | 'weekly' | 'monthly' | 'none';
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

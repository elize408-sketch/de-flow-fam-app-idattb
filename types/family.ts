
export interface FamilyMember {
  id: string;
  name: string;
  role: 'parent' | 'child';
  avatar?: string;
  coins: number;
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
  assignedTo: string;
  color: string;
  repeatType?: 'daily' | 'weekly' | 'monthly' | 'none';
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
  category: string;
  date: Date;
  paid: boolean;
}

export interface Meal {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner';
  date: Date;
  recipe?: string;
  ingredients?: string[];
}

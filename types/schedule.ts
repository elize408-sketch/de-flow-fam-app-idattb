
export interface SchoolSchedule {
  id: string;
  familyId: string;
  childId: string;
  subject: string;
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  startTime: string;
  endTime: string;
  location?: string;
  icon: string;
  color: string;
  isRecurring: boolean;
  eventType: 'regular' | 'special' | 'trip' | 'holiday' | 'early_dismissal' | 'parent_evening' | 'class_photo' | 'study_day';
  notes?: string;
  notificationEnabled: boolean;
  notificationTime?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkSchedule {
  id: string;
  familyId: string;
  parentId: string;
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  startTime: string;
  endTime: string;
  shiftLabel: 'morning' | 'afternoon' | 'evening' | 'night' | 'custom';
  customLabel?: string;
  isRecurring: boolean;
  color: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskBoardItem {
  id: string;
  familyId: string;
  childId: string;
  title: string;
  description?: string;
  icon: string;
  points: number;
  status: 'todo' | 'in_progress' | 'done';
  repeatType: 'none' | 'daily' | 'weekly';
  orderIndex: number;
  completedAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RewardGoal {
  id: string;
  familyId: string;
  childId: string;
  title: string;
  description?: string;
  icon: string;
  pointsRequired: number;
  isActive: boolean;
  isCompleted: boolean;
  completedAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PointsTransaction {
  id: string;
  familyId: string;
  childId: string;
  points: number;
  transactionType: 'earned' | 'spent' | 'bonus' | 'penalty' | 'reward_redeemed' | 'task_completed';
  description: string;
  relatedTaskId?: string;
  relatedRewardId?: string;
  createdBy: string;
  createdAt: Date;
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

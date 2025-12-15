
export interface Schedule {
  id: string;
  family_id: string;
  member_id: string;
  title: string;
  type: 'school' | 'work' | 'sport' | 'other';
  start_date: string;
  end_date: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ScheduleItem {
  id: string;
  schedule_id: string;
  day_of_week: number; // 1-7 (Monday-Sunday)
  start_time: string;
  end_time: string;
  location: string | null;
  note: string | null;
  color: string | null;
  created_at: string;
}

export interface ScheduleWithItems extends Schedule {
  items: ScheduleItem[];
}

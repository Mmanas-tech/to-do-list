export type Priority = 'high' | 'medium' | 'low';

export type Category = 'work' | 'personal' | 'health' | 'shopping' | 'other';

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly';

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  reminderTime: string | null; // ISO string for the reminder datetime
  priority: Priority;
  category: Category;
  tags: string[];
  completed: boolean;
  createdAt: string;
  completedAt: string | null;
  recurrence: RecurrenceType;
  lastNotified: string | null; // Track when last notified to prevent spam
}

export type FilterType = 'all' | 'active' | 'completed' | 'today' | 'upcoming';

export interface TaskFilters {
  type: FilterType;
  priority: Priority | 'all';
  category: Category | 'all';
  searchQuery: string;
}

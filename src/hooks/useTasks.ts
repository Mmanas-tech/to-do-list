import { useState, useEffect, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { addDays, addWeeks, addMonths } from 'date-fns';
import { Task, TaskFilters, RecurrenceType } from '@/types/task';

const STORAGE_KEY = 'todo-tasks';

const defaultFilters: TaskFilters = {
  type: 'all',
  priority: 'all',
  category: 'all',
  searchQuery: '',
};

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const [filters, setFilters] = useState<TaskFilters>(defaultFilters);
  const [history, setHistory] = useState<Task[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const saveToHistory = useCallback((newTasks: Task[]) => {
    setHistory(prev => [...prev.slice(0, historyIndex + 1), newTasks]);
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const addTask = useCallback((taskData: Omit<Task, 'id' | 'completed' | 'createdAt' | 'completedAt' | 'lastNotified'>) => {
    const newTask: Task = {
      ...taskData,
      id: uuidv4(),
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null,
      lastNotified: null,
    };
    const newTasks = [...tasks, newTask];
    setTasks(newTasks);
    saveToHistory(newTasks);
    return newTask;
  }, [tasks, saveToHistory]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    const newTasks = tasks.map(task =>
      task.id === id ? { ...task, ...updates } : task
    );
    setTasks(newTasks);
    saveToHistory(newTasks);
  }, [tasks, saveToHistory]);

  const deleteTask = useCallback((id: string) => {
    const newTasks = tasks.filter(task => task.id !== id);
    setTasks(newTasks);
    saveToHistory(newTasks);
  }, [tasks, saveToHistory]);

  const createRecurringTask = useCallback((task: Task): Task | null => {
    if (task.recurrence === 'none' || !task.dueDate) return null;

    const dueDate = new Date(task.dueDate);
    let newDueDate: Date;
    let newReminderTime: Date | null = null;

    switch (task.recurrence) {
      case 'daily':
        newDueDate = addDays(dueDate, 1);
        break;
      case 'weekly':
        newDueDate = addWeeks(dueDate, 1);
        break;
      case 'monthly':
        newDueDate = addMonths(dueDate, 1);
        break;
      default:
        return null;
    }

    if (task.reminderTime) {
      const reminderDate = new Date(task.reminderTime);
      const timeDiff = dueDate.getTime() - reminderDate.getTime();
      newReminderTime = new Date(newDueDate.getTime() - timeDiff);
    }

    return {
      ...task,
      id: uuidv4(),
      completed: false,
      completedAt: null,
      createdAt: new Date().toISOString(),
      dueDate: newDueDate.toISOString(),
      reminderTime: newReminderTime?.toISOString() || task.reminderTime,
      lastNotified: null,
    };
  }, []);

  const toggleComplete = useCallback((id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    let newTasks = tasks.map(t =>
      t.id === id
        ? {
            ...t,
            completed: !t.completed,
            completedAt: !t.completed ? new Date().toISOString() : null,
          }
        : t
    );

    // If completing a recurring task, create the next occurrence
    if (!task.completed && task.recurrence !== 'none') {
      const newRecurringTask = createRecurringTask(task);
      if (newRecurringTask) {
        newTasks = [...newTasks, newRecurringTask];
      }
    }

    setTasks(newTasks);
    saveToHistory(newTasks);
  }, [tasks, saveToHistory, createRecurringTask]);

  const markTaskNotified = useCallback((id: string) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, lastNotified: new Date().toISOString() } : task
    ));
  }, []);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setTasks(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setTasks(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const taskDate = task.dueDate ? new Date(task.dueDate) : null;
      
      if (filters.type === 'active' && task.completed) return false;
      if (filters.type === 'completed' && !task.completed) return false;
      if (filters.type === 'today') {
        if (!taskDate) return false;
        const taskDay = new Date(taskDate);
        taskDay.setHours(0, 0, 0, 0);
        if (taskDay.getTime() !== today.getTime()) return false;
      }
      if (filters.type === 'upcoming') {
        if (!taskDate || taskDate <= today || task.completed) return false;
      }

      if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
      if (filters.category !== 'all' && task.category !== filters.category) return false;

      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDescription = task.description.toLowerCase().includes(query);
        const matchesTags = task.tags.some(tag => tag.toLowerCase().includes(query));
        if (!matchesTitle && !matchesDescription && !matchesTags) return false;
      }

      return true;
    }).sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [tasks, filters]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const highPriority = tasks.filter(t => t.priority === 'high' && !t.completed).length;
    const mediumPriority = tasks.filter(t => t.priority === 'medium' && !t.completed).length;
    const lowPriority = tasks.filter(t => t.priority === 'low' && !t.completed).length;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const overdue = tasks.filter(t => {
      if (t.completed || !t.dueDate) return false;
      return new Date(t.dueDate) < today;
    }).length;

    const dueToday = tasks.filter(t => {
      if (t.completed || !t.dueDate) return false;
      const taskDate = new Date(t.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === today.getTime();
    }).length;

    const recurring = tasks.filter(t => t.recurrence !== 'none' && !t.completed).length;

    return {
      total,
      completed,
      pending,
      highPriority,
      mediumPriority,
      lowPriority,
      overdue,
      dueToday,
      recurring,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [tasks]);

  return {
    tasks: filteredTasks,
    allTasks: tasks,
    filters,
    setFilters,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
    markTaskNotified,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    stats,
  };
}

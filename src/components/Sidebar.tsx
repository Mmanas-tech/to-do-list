import { motion } from 'framer-motion';
import { 
  ListTodo, 
  CheckCircle2, 
  Clock, 
  Calendar,
  CalendarDays,
  Briefcase,
  Home,
  Heart,
  ShoppingCart,
  MoreHorizontal,
  BarChart3,
  Filter
} from 'lucide-react';
import { TaskFilters, FilterType, Priority, Category } from '@/types/task';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface SidebarProps {
  filters: TaskFilters;
  onFilterChange: (filters: TaskFilters) => void;
  stats: {
    total: number;
    completed: number;
    pending: number;
    dueToday: number;
    overdue: number;
  };
  showAnalytics: boolean;
  onToggleAnalytics: () => void;
}

const filterTypes: { value: FilterType; label: string; icon: React.ReactNode }[] = [
  { value: 'all', label: 'All Tasks', icon: <ListTodo className="h-4 w-4" /> },
  { value: 'active', label: 'Active', icon: <Clock className="h-4 w-4" /> },
  { value: 'completed', label: 'Completed', icon: <CheckCircle2 className="h-4 w-4" /> },
  { value: 'today', label: 'Today', icon: <Calendar className="h-4 w-4" /> },
  { value: 'upcoming', label: 'Upcoming', icon: <CalendarDays className="h-4 w-4" /> },
];

const priorities: { value: Priority | 'all'; label: string; color: string }[] = [
  { value: 'all', label: 'All Priorities', color: 'bg-muted' },
  { value: 'high', label: 'High', color: 'bg-priority-high' },
  { value: 'medium', label: 'Medium', color: 'bg-priority-medium' },
  { value: 'low', label: 'Low', color: 'bg-priority-low' },
];

const categories: { value: Category | 'all'; label: string; icon: React.ReactNode }[] = [
  { value: 'all', label: 'All Categories', icon: <Filter className="h-4 w-4" /> },
  { value: 'work', label: 'Work', icon: <Briefcase className="h-4 w-4" /> },
  { value: 'personal', label: 'Personal', icon: <Home className="h-4 w-4" /> },
  { value: 'health', label: 'Health', icon: <Heart className="h-4 w-4" /> },
  { value: 'shopping', label: 'Shopping', icon: <ShoppingCart className="h-4 w-4" /> },
  { value: 'other', label: 'Other', icon: <MoreHorizontal className="h-4 w-4" /> },
];

export function Sidebar({ filters, onFilterChange, stats, showAnalytics, onToggleAnalytics }: SidebarProps) {
  return (
    <aside className="w-64 h-full bg-sidebar border-r border-sidebar-border p-4 flex flex-col">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-sidebar-foreground flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
          </div>
          TaskFlow
        </h1>
      </div>

      {/* Analytics toggle */}
      <Button
        variant={showAnalytics ? "default" : "ghost"}
        className="w-full justify-start mb-4"
        onClick={onToggleAnalytics}
      >
        <BarChart3 className="h-4 w-4 mr-2" />
        Analytics
      </Button>

      <Separator className="mb-4" />

      {/* Filter by type */}
      <div className="space-y-1 mb-6">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-2">
          View
        </p>
        {filterTypes.map(type => (
          <button
            key={type.value}
            onClick={() => onFilterChange({ ...filters, type: type.value })}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              filters.type === type.value
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            )}
          >
            {type.icon}
            <span>{type.label}</span>
            {type.value === 'today' && stats.dueToday > 0 && (
              <span className="ml-auto text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                {stats.dueToday}
              </span>
            )}
            {type.value === 'active' && stats.overdue > 0 && (
              <span className="ml-auto text-xs bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded-full">
                {stats.overdue}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filter by priority */}
      <div className="space-y-1 mb-6">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-2">
          Priority
        </p>
        {priorities.map(p => (
          <button
            key={p.value}
            onClick={() => onFilterChange({ ...filters, priority: p.value })}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              filters.priority === p.value
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            )}
          >
            <div className={cn("h-3 w-3 rounded-full", p.color)} />
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      {/* Filter by category */}
      <div className="space-y-1 flex-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-2">
          Category
        </p>
        {categories.map(c => (
          <button
            key={c.value}
            onClick={() => onFilterChange({ ...filters, category: c.value })}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              filters.category === c.value
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            )}
          >
            {c.icon}
            <span>{c.label}</span>
          </button>
        ))}
      </div>

      {/* Stats summary */}
      <div className="mt-auto pt-4 border-t border-sidebar-border">
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="bg-sidebar-accent/50 rounded-lg p-2">
            <p className="text-lg font-bold text-sidebar-foreground">{stats.completed}</p>
            <p className="text-xs text-muted-foreground">Done</p>
          </div>
          <div className="bg-sidebar-accent/50 rounded-lg p-2">
            <p className="text-lg font-bold text-sidebar-foreground">{stats.pending}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

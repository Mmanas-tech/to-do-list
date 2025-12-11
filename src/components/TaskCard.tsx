import { motion } from 'framer-motion';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { Check, Calendar, Tag, Trash2, Edit2, Clock, Bell, Repeat } from 'lucide-react';
import { Task, Priority, Category, RecurrenceType } from '@/types/task';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  high: { label: 'High', className: 'bg-priority-high/10 text-priority-high border-priority-high/20' },
  medium: { label: 'Medium', className: 'bg-priority-medium/10 text-priority-medium border-priority-medium/20' },
  low: { label: 'Low', className: 'bg-priority-low/10 text-priority-low border-priority-low/20' },
};

const categoryConfig: Record<Category, { label: string; emoji: string }> = {
  work: { label: 'Work', emoji: '💼' },
  personal: { label: 'Personal', emoji: '🏠' },
  health: { label: 'Health', emoji: '💪' },
  shopping: { label: 'Shopping', emoji: '🛒' },
  other: { label: 'Other', emoji: '📌' },
};

const recurrenceLabels: Record<RecurrenceType, string> = {
  none: '',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

function formatDueDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  return format(date, 'MMM d');
}

function formatReminderTime(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isToday(date)) return `Today ${format(date, 'h:mm a')}`;
  if (isTomorrow(date)) return `Tomorrow ${format(date, 'h:mm a')}`;
  return format(date, 'MMM d, h:mm a');
}

export function TaskCard({ task, onToggle, onEdit, onDelete }: TaskCardProps) {
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && !task.completed;
  const priority = priorityConfig[task.priority];
  const category = categoryConfig[task.category];
  const hasReminder = !!task.reminderTime;
  const isRecurring = task.recurrence !== 'none';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
      className={cn(
        "group relative rounded-lg border bg-card p-4 shadow-task transition-all duration-200",
        "hover:shadow-task-hover hover:border-primary/20",
        task.completed && "opacity-60"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(task.id)}
          className={cn(
            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200",
            task.completed
              ? "border-primary bg-primary"
              : "border-muted-foreground/30 hover:border-primary"
          )}
        >
          {task.completed && (
            <Check className="h-3 w-3 text-primary-foreground animate-check" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={cn(
                "font-medium text-card-foreground transition-all",
                task.completed && "line-through text-muted-foreground"
              )}
            >
              {task.title}
            </h3>
            
            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onEdit(task)}
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={() => onDelete(task.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {task.description && (
            <p className={cn(
              "mt-1 text-sm text-muted-foreground line-clamp-2",
              task.completed && "line-through"
            )}>
              {task.description}
            </p>
          )}

          {/* Meta */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={priority.className}>
              {priority.label}
            </Badge>
            
            <Badge variant="secondary" className="gap-1">
              <span>{category.emoji}</span>
              {category.label}
            </Badge>

            {task.dueDate && (
              <Badge 
                variant="outline" 
                className={cn(
                  "gap-1",
                  isOverdue && "bg-destructive/10 text-destructive border-destructive/20"
                )}
              >
                <Calendar className="h-3 w-3" />
                {formatDueDate(task.dueDate)}
              </Badge>
            )}

            {hasReminder && (
              <Badge variant="outline" className="gap-1 bg-primary/10 text-primary border-primary/20">
                <Bell className="h-3 w-3" />
                {formatReminderTime(task.reminderTime)}
              </Badge>
            )}

            {isRecurring && (
              <Badge variant="outline" className="gap-1 bg-accent text-accent-foreground">
                <Repeat className="h-3 w-3" />
                {recurrenceLabels[task.recurrence]}
              </Badge>
            )}

            {task.tags.length > 0 && (
              <div className="flex items-center gap-1">
                <Tag className="h-3 w-3 text-muted-foreground" />
                {task.tags.slice(0, 2).map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {task.tags.length > 2 && (
                  <span className="text-xs text-muted-foreground">
                    +{task.tags.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Priority indicator line */}
      <div 
        className={cn(
          "absolute left-0 top-4 bottom-4 w-1 rounded-r",
          task.priority === 'high' && "bg-priority-high",
          task.priority === 'medium' && "bg-priority-medium",
          task.priority === 'low' && "bg-priority-low",
          task.completed && "opacity-30"
        )}
      />
    </motion.div>
  );
}

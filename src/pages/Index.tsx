import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Search, Undo2, Redo2, Menu, X, Bell, BellOff } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useNotifications } from '@/hooks/useNotifications';
import { Task } from '@/types/task';
import { Sidebar } from '@/components/Sidebar';
import { TaskList } from '@/components/TaskList';
import { TaskForm } from '@/components/TaskForm';
import { Analytics } from '@/components/Analytics';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const Index = () => {
  const {
    tasks,
    allTasks,
    filters,
    setFilters,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
    markTaskNotified,
    undo,
    redo,
    canUndo,
    canRedo,
    stats,
  } = useTasks();

  const { requestPermission, hasPermission } = useNotifications(
    allTasks,
    markTaskNotified
  );

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();

  const handleAddTask = (taskData: Omit<Task, 'id' | 'completed' | 'createdAt' | 'completedAt' | 'lastNotified'>) => {
    addTask(taskData);
    toast({
      title: "Task created",
      description: taskData.reminderTime 
        ? "Your task has been added with a reminder." 
        : "Your new task has been added.",
    });
  };

  const handleEditTask = (taskData: Omit<Task, 'id' | 'completed' | 'createdAt' | 'completedAt' | 'lastNotified'>) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
      setEditingTask(null);
      toast({
        title: "Task updated",
        description: "Your changes have been saved.",
      });
    }
  };

  const handleDeleteTask = (id: string) => {
    deleteTask(id);
    toast({
      title: "Task deleted",
      description: "The task has been removed.",
      variant: "destructive",
    });
  };

  const handleToggleComplete = (id: string) => {
    toggleComplete(id);
    const task = tasks.find(t => t.id === id);
    if (task && !task.completed) {
      toast({
        title: task.recurrence !== 'none' ? "Task completed! Next one created." : "Task completed!",
        description: task.recurrence !== 'none' 
          ? `A new ${task.recurrence} task has been scheduled.`
          : "Great job! Keep up the momentum.",
      });
    }
  };

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      toast({
        title: "Notifications enabled",
        description: "You'll receive reminders for your tasks.",
      });
    } else {
      toast({
        title: "Notifications blocked",
        description: "Please enable notifications in your browser settings.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 lg:relative lg:z-0 transform transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <Sidebar
          filters={filters}
          onFilterChange={setFilters}
          stats={stats}
          showAnalytics={showAnalytics}
          onToggleAnalytics={() => setShowAnalytics(!showAnalytics)}
        />
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm px-4 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={filters.searchQuery}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                className="pl-10"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {!hasPermission && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleEnableNotifications}
                  title="Enable notifications"
                >
                  <BellOff className="h-4 w-4" />
                </Button>
              )}
              {hasPermission && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-primary"
                  title="Notifications enabled"
                >
                  <Bell className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={undo}
                disabled={!canUndo}
                title="Undo"
              >
                <Undo2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={redo}
                disabled={!canRedo}
                title="Redo"
              >
                <Redo2 className="h-4 w-4" />
              </Button>
              <Button onClick={() => setShowForm(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Task</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          <AnimatePresence mode="wait">
            {showAnalytics ? (
              <Analytics key="analytics" stats={stats} tasks={allTasks} />
            ) : (
              <motion.div
                key="tasks"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-foreground">
                    {filters.type === 'all' && 'All Tasks'}
                    {filters.type === 'active' && 'Active Tasks'}
                    {filters.type === 'completed' && 'Completed Tasks'}
                    {filters.type === 'today' && "Today's Tasks"}
                    {filters.type === 'upcoming' && 'Upcoming Tasks'}
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    {tasks.length} task{tasks.length !== 1 ? 's' : ''}
                    {filters.priority !== 'all' && ` • ${filters.priority} priority`}
                    {filters.category !== 'all' && ` • ${filters.category}`}
                  </p>
                </div>

                <TaskList
                  tasks={tasks}
                  onToggle={handleToggleComplete}
                  onEdit={(task) => {
                    setEditingTask(task);
                    setShowForm(true);
                  }}
                  onDelete={handleDeleteTask}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Task Form Modal */}
      <TaskForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingTask(null);
        }}
        onSubmit={editingTask ? handleEditTask : handleAddTask}
        editTask={editingTask}
      />
    </div>
  );
};

export default Index;

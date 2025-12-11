import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  Target,
  Flame,
  BarChart3,
  Repeat
} from 'lucide-react';
import { Task } from '@/types/task';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface AnalyticsProps {
  stats: {
    total: number;
    completed: number;
    pending: number;
    highPriority: number;
    mediumPriority: number;
    lowPriority: number;
    overdue: number;
    dueToday: number;
    recurring: number;
    completionRate: number;
  };
  tasks: Task[];
}

export function Analytics({ stats, tasks }: AnalyticsProps) {
  // Calculate streak (consecutive days with completed tasks)
  const calculateStreak = () => {
    const completedDates = tasks
      .filter(t => t.completedAt)
      .map(t => new Date(t.completedAt!).toDateString())
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < completedDates.length; i++) {
      const date = new Date(completedDates[i]);
      const diff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (diff === streak || diff === streak + 1) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const streak = calculateStreak();

  const statCards = [
    {
      title: 'Total Tasks',
      value: stats.total,
      icon: <Target className="h-5 w-5" />,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: <CheckCircle2 className="h-5 w-5" />,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: <Clock className="h-5 w-5" />,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Overdue',
      value: stats.overdue,
      icon: <AlertTriangle className="h-5 w-5" />,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${stat.bgColor} ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Progress, Streak, and Recurring */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{stats.completionRate}%</span>
                <span className="text-sm text-muted-foreground">
                  {stats.completed}/{stats.total}
                </span>
              </div>
              <Progress value={stats.completionRate} className="h-3" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Flame className="h-5 w-5 text-warning" />
              Productivity Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold text-warning">{streak}</div>
              <div>
                <p className="font-medium">Day{streak !== 1 ? 's' : ''}</p>
                <p className="text-sm text-muted-foreground">
                  Keep it up!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Repeat className="h-5 w-5 text-primary" />
              Recurring Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold text-primary">{stats.recurring}</div>
              <div>
                <p className="font-medium">Active</p>
                <p className="text-sm text-muted-foreground">
                  Auto-scheduled
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Priority Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Priority Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-24 text-sm font-medium">High</div>
              <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                <div 
                  className="bg-priority-high h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.pending > 0 ? (stats.highPriority / stats.pending) * 100 : 0}%` }}
                />
              </div>
              <div className="w-8 text-right text-sm">{stats.highPriority}</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-24 text-sm font-medium">Medium</div>
              <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                <div 
                  className="bg-priority-medium h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.pending > 0 ? (stats.mediumPriority / stats.pending) * 100 : 0}%` }}
                />
              </div>
              <div className="w-8 text-right text-sm">{stats.mediumPriority}</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-24 text-sm font-medium">Low</div>
              <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                <div 
                  className="bg-priority-low h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.pending > 0 ? (stats.lowPriority / stats.pending) * 100 : 0}%` }}
                />
              </div>
              <div className="w-8 text-right text-sm">{stats.lowPriority}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

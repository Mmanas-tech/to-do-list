import { useEffect, useCallback, useRef } from 'react';
import { Task } from '@/types/task';
import { useToast } from '@/hooks/use-toast';

// Alarm sound using Web Audio API
const playAlarmSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  const playBeep = (frequency: number, startTime: number, duration: number) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  };

  // Play a pleasant alarm pattern
  const now = audioContext.currentTime;
  playBeep(880, now, 0.15);
  playBeep(880, now + 0.2, 0.15);
  playBeep(1100, now + 0.5, 0.3);
};

export function useNotifications(
  tasks: Task[],
  onTaskNotified: (taskId: string) => void
) {
  const { toast } = useToast();
  const notifiedRef = useRef<Set<string>>(new Set());

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const showNotification = useCallback((task: Task) => {
    // Play alarm sound
    playAlarmSound();

    // Show toast notification
    toast({
      title: `⏰ Reminder: ${task.title}`,
      description: task.description || 'Your task is due now!',
      duration: 10000,
    });

    // Show browser notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(`⏰ Task Reminder`, {
        body: task.title + (task.description ? `\n${task.description}` : ''),
        icon: '/favicon.ico',
        tag: task.id,
        requireInteraction: true,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  }, [toast]);

  // Check for due reminders every 10 seconds
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      
      tasks.forEach(task => {
        if (
          task.reminderTime &&
          !task.completed &&
          !notifiedRef.current.has(task.id)
        ) {
          const reminderDate = new Date(task.reminderTime);
          const timeDiff = reminderDate.getTime() - now.getTime();
          
          // Trigger if within 30 seconds of reminder time
          if (timeDiff <= 30000 && timeDiff > -60000) {
            notifiedRef.current.add(task.id);
            showNotification(task);
            onTaskNotified(task.id);
          }
        }
      });
    };

    // Initial check
    checkReminders();

    // Set up interval
    const interval = setInterval(checkReminders, 10000);

    return () => clearInterval(interval);
  }, [tasks, showNotification, onTaskNotified]);

  const requestPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }, []);

  return {
    requestPermission,
    hasPermission: 'Notification' in window && Notification.permission === 'granted',
  };
}

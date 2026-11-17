import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { LearningMap, Day } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Calculate total tasks, completed tasks, and overall progress for a learning map
export function getMapStats(map: LearningMap) {
  let totalTasks = 0;
  let completedTasks = 0;
  let totalDays = 0;
  let completedDays = 0;

  map.weeks.forEach((week) => {
    week.days.forEach((day) => {
      totalDays++;
      if (day.status === 'completed') {
        completedDays++;
      }
      day.tasks.forEach((task) => {
        totalTasks++;
        if (task.status === 'done') {
          completedTasks++;
        }
      });
    });
  });

  const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const dayProgress = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

  // Determine current active milestone or week
  let currentMilestone = 'Completed';
  for (const week of map.weeks) {
    const hasUnfinished = week.days.some((d) => d.status !== 'completed');
    if (hasUnfinished) {
      currentMilestone = `Week ${week.weekNumber} · ${week.title}`;
      break;
    }
  }

  return {
    totalTasks,
    completedTasks,
    totalDays,
    completedDays,
    taskProgress,
    dayProgress,
    currentMilestone,
  };
}

// Format minutes into clean human-readable string (e.g. 180 min -> "3h", 90 min -> "1h 30m")
export function formatMinutes(minutes: number): string {
  if (!minutes || minutes <= 0) return '0m';
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  if (hours === 0) return `${remaining}m`;
  if (remaining === 0) return `${hours}h`;
  return `${hours}h ${remaining}m`;
}

// Calculate streak and activity over last 30 days
export function calculateLearningStreak(
  maps: LearningMap[],
  journalDates: string[]
): { streak: number; totalActiveDays: number; activityData: { date: string; count: number; dayName: string }[] } {
  const activityMap = new Map<string, number>();

  // Collect from map tasks and days
  maps.forEach((map) => {
    map.weeks.forEach((week) => {
      week.days.forEach((day) => {
        if (day.completedAt) {
          const date = day.completedAt.split('T')[0];
          activityMap.set(date, (activityMap.get(date) || 0) + 2);
        }
        day.tasks.forEach((task) => {
          if (task.completedAt) {
            const date = task.completedAt.split('T')[0];
            activityMap.set(date, (activityMap.get(date) || 0) + 1);
          }
        });
      });
    });
  });

  // Collect from journals
  journalDates.forEach((date) => {
    activityMap.set(date, (activityMap.get(date) || 0) + 2);
  });

  // Calculate 30-day activity array
  const activityData: { date: string; count: number; dayName: string }[] = [];
  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const count = activityMap.get(dateStr) || 0;
    activityData.push({
      date: dateStr,
      count,
      dayName: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
    });
  }

  // Calculate current streak
  let streak = 0;
  let checkDate = new Date(now);
  const todayStr = checkDate.toISOString().split('T')[0];

  // If today had activity, start counting from today; otherwise from yesterday
  if ((activityMap.get(todayStr) || 0) > 0) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  } else {
    // Check if yesterday had activity
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yestStr = yesterday.toISOString().split('T')[0];
    if ((activityMap.get(yestStr) || 0) > 0) {
      checkDate = yesterday;
    }
  }

  while (true) {
    const curStr = checkDate.toISOString().split('T')[0];
    if ((activityMap.get(curStr) || 0) > 0) {
      if (curStr !== todayStr) streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return {
    streak,
    totalActiveDays: activityMap.size,
    activityData,
  };
}

// Time of day greeting
export function getTimeGreeting(): { greeting: string; quote: string } {
  const hour = new Date().getHours();
  let greeting = 'Good morning';
  if (hour >= 12 && hour < 17) {
    greeting = 'Good afternoon';
  } else if (hour >= 17) {
    greeting = 'Good evening';
  }

  const quotes = [
    'Consistency compounds faster than intensity.',
    'Small steps daily lead to monumental mastery.',
    'Build things that outlast the tutorial.',
    'The best way to understand an agent is to build one.',
    'Focus on the reps. The breakthrough follows.',
  ];
  const quote = quotes[Math.floor(Math.random() * quotes.length)];

  return { greeting, quote };
}

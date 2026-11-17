const fs = require('fs');
const { z } = require('zod');

// Replicate schema logic from src/lib/schema.ts
const DayTaskSchema = z.object({
  id: z.string().default(() => `task-${Date.now()}`),
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional().default(''),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  status: z.enum(['todo', 'in-progress', 'done']).default('todo'),
  repositoryUrl: z.string().optional().default(''),
  dueDate: z.string().optional(),
  completedAt: z.string().nullable().optional().default(null),
});

const DaySchema = z.object({
  id: z.string(),
  dayNumber: z.number().int().positive(),
  title: z.string().min(1, 'Day title is required'),
  description: z.string().default(''),
  objectives: z.array(z.string()).default([]),
  topics: z.array(z.string()).default([]),
  repositoryUrl: z.string().optional().default(''),
  estimatedMinutes: z.number().int().default(180),
  status: z.enum(['pending', 'in-progress', 'completed']).default('pending'),
  tasks: z.array(DayTaskSchema).default([]),
  notes: z.string().optional().default(''),
  completedAt: z.string().nullable().optional().default(null),
  timeSpentMinutes: z.number().optional().default(0),
});

const WeekSchema = z.object({
  id: z.string(),
  weekNumber: z.number().int().positive(),
  title: z.string().min(1, 'Week title is required'),
  description: z.string().default(''),
  deliverable: z.string().default(''),
  objective: z.string().optional().default(''),
  topics: z.array(z.string()).optional().default([]),
  reviewChecklist: z.array(z.string()).optional().default([]),
  days: z.array(DaySchema).default([]),
});

const LearningMapSchema = z.object({
  schemaVersion: z.string().default('1.0'),
  id: z.string().min(1, 'ID is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().default(''),
  category: z.string().default('General'),
  status: z.enum(['not-started', 'active', 'paused', 'completed']).default('active'),
  startDate: z.string().nullable().optional().default(null),
  targetDate: z.string().nullable().optional().default(null),
  dailyCommitmentMinutes: z.number().int().default(180),
  repositoryUrl: z.string().optional().default(''),
  icon: z.string().optional().default('Compass'),
  accentColor: z.string().optional().default('#6366f1'),
  weeks: z.array(WeekSchema).default([]),
  createdAt: z.string().default(() => new Date().toISOString()),
  updatedAt: z.string().default(() => new Date().toISOString()),
});

console.log('--- TEST 1: Validate Seed Data ---');
const rawSeed = fs.readFileSync('data/ai-engineering-90-days.json', 'utf8');
const parsedSeed = JSON.parse(rawSeed);
const seedResult = LearningMapSchema.safeParse(parsedSeed);

if (seedResult.success) {
  console.log('✓ Seed data is 100% valid according to Zod schema!');
  console.log(`  Weeks: ${seedResult.data.weeks.length}`);
  const totalDays = seedResult.data.weeks.reduce((acc, w) => acc + w.days.length, 0);
  const totalTasks = seedResult.data.weeks.reduce((acc, w) => acc + w.days.reduce((da, d) => da + d.tasks.length, 0), 0);
  console.log(`  Days: ${totalDays}`);
  console.log(`  Tasks: ${totalTasks}`);
  if (totalDays !== 90) throw new Error(`Expected 90 days, got ${totalDays}`);
} else {
  console.error('✗ Seed data validation failed:', seedResult.error);
  process.exit(1);
}

console.log('\n--- TEST 2: Validate Invalid JSON Rejection ---');
const invalidData = {
  id: '',
  title: '',
  weeks: 'not-an-array',
};
const invalidResult = LearningMapSchema.safeParse(invalidData);
if (!invalidResult.success) {
  console.log('✓ Invalid JSON correctly caught by Zod schema:');
  console.log('  Issues caught:', invalidResult.error.issues.length);
} else {
  console.error('✗ Invalid JSON was unexpectedly accepted!');
  process.exit(1);
}

console.log('\n--- TEST 3: Smart Import & Progress Preservation Simulation ---');
// Existing state with completed day 1 and custom notes
const existingMap = JSON.parse(JSON.stringify(seedResult.data));
existingMap.weeks[0].days[0].status = 'completed';
existingMap.weeks[0].days[0].notes = 'Completed my first LLM API call with streaming. Key insight: temperature 0.2 is best for structured extraction.';
existingMap.weeks[0].days[0].tasks[0].status = 'done';
existingMap.weeks[0].days[0].tasks[0].completedAt = new Date().toISOString();

// Incoming updated roadmap (e.g. from upstream with updated descriptions)
const incomingMap = JSON.parse(JSON.stringify(seedResult.data));
incomingMap.weeks[0].days[0].description = 'Updated description for day 1 from author.';
// But incoming has pending status and empty notes
incomingMap.weeks[0].days[0].status = 'pending';
incomingMap.weeks[0].days[0].notes = '';
incomingMap.weeks[0].days[0].tasks[0].status = 'todo';

// Run merge logic (identical to src/lib/db.ts importLearningMap)
const existingDaysMap = new Map();
existingMap.weeks.forEach((w) => {
  w.days.forEach((d) => {
    existingDaysMap.set(d.id, d);
    existingDaysMap.set(`day-${d.dayNumber}`, d);
  });
});

incomingMap.weeks.forEach((w) => {
  w.days.forEach((d) => {
    const prev = existingDaysMap.get(d.id) || existingDaysMap.get(`day-${d.dayNumber}`);
    if (prev) {
      if (prev.notes && !d.notes) d.notes = prev.notes;
      if (prev.status === 'completed') {
        d.status = 'completed';
        d.completedAt = prev.completedAt;
      }
      const prevTaskMap = new Map(prev.tasks.map((t) => [t.id, t]));
      d.tasks.forEach((t) => {
        const prevT = prevTaskMap.get(t.id) || prev.tasks.find((pt) => pt.title === t.title);
        if (prevT) {
          t.status = prevT.status;
          t.completedAt = prevT.completedAt;
        }
      });
    }
  });
});

if (
  incomingMap.weeks[0].days[0].status === 'completed' &&
  incomingMap.weeks[0].days[0].notes.includes('Completed my first LLM API call') &&
  incomingMap.weeks[0].days[0].tasks[0].status === 'done'
) {
  console.log('✓ Smart merge preserved completed status, completed tasks, and user notes perfectly!');
} else {
  console.error('✗ User state was lost during merge!');
  process.exit(1);
}

console.log('\n--- ALL VERIFICATION TESTS PASSED ---');

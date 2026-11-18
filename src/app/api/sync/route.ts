import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDatabase } from '@/lib/mongodb';
import { LearningMap, JournalEntry, StandaloneTodo } from '@/types';

// POST /api/sync - Bidirectional synchronization between local Dexie and MongoDB
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    const body = await req.json();
    const clientMaps: LearningMap[] = body.maps || [];
    const clientJournals: JournalEntry[] = body.journals || [];
    const clientTodos: StandaloneTodo[] = body.todos || [];
    const clientSettings = body.settings || null;

    const mapsCol = db.collection('learning_maps');
    const journalsCol = db.collection('journals');
    const todosCol = db.collection('todos');
    const settingsCol = db.collection('settings');

    // Ensure collections exist in MongoDB
    const existing = (await db.listCollections().toArray()).map((c) => c.name);
    if (!existing.includes('settings')) await db.createCollection('settings');
    if (!existing.includes('journals')) await db.createCollection('journals');
    if (!existing.includes('todos')) await db.createCollection('todos');

    // 1. Upsert local maps to cloud
    for (const map of clientMaps) {
      await mapsCol.updateOne(
        { id: map.id, userEmail: session.user.email },
        {
          $set: {
            ...map,
            userEmail: session.user.email,
            updatedAt: map.updatedAt || new Date().toISOString(),
          },
        },
        { upsert: true }
      );
    }

    // 2. Upsert local journals to cloud
    for (const journal of clientJournals) {
      await journalsCol.updateOne(
        { id: journal.id, userEmail: session.user.email },
        {
          $set: {
            ...journal,
            userEmail: session.user.email,
          },
        },
        { upsert: true }
      );
    }

    // 3. Upsert local todos to cloud
    for (const todo of clientTodos) {
      await todosCol.updateOne(
        { id: todo.id, userEmail: session.user.email },
        {
          $set: {
            ...todo,
            userEmail: session.user.email,
          },
        },
        { upsert: true }
      );
    }

    // 4. Upsert settings if provided
    if (clientSettings) {
      await settingsCol.updateOne(
        { userEmail: session.user.email },
        {
          $set: {
            ...clientSettings,
            userEmail: session.user.email,
            updatedAt: new Date().toISOString(),
          },
        },
        { upsert: true }
      );
    }

    // 5. Read full updated cloud state for user
    const cloudMaps = await mapsCol.find({ userEmail: session.user.email }).toArray();
    const cloudJournals = await journalsCol.find({ userEmail: session.user.email }).toArray();
    const cloudTodos = await todosCol.find({ userEmail: session.user.email }).toArray();
    const cloudSettings = await settingsCol.findOne({ userEmail: session.user.email });

    return NextResponse.json({
      success: true,
      syncedAt: new Date().toISOString(),
      maps: cloudMaps,
      journals: cloudJournals,
      todos: cloudTodos,
      settings: cloudSettings,
    });
  } catch (error) {
    console.error('ProgressOS: Error during sync:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDatabase } from '@/lib/mongodb';
import { LearningMap, JournalEntry, StandaloneTodo } from '@/types';
import { getDefaultLearningMaps } from '@/lib/server-defaults';

// GET /api/sync - Retrieve all cloud data for the authenticated user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    const mapsCol = db.collection('learning_maps');
    const SEVEN_DAYS_AGO = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    await mapsCol.deleteMany({
      userEmail: session.user.email,
      isDeleted: true,
      deletedAt: { $lt: SEVEN_DAYS_AGO },
    });

    let rawMaps = await mapsCol.find({ userEmail: session.user.email }).toArray();

    // If user has no maps in MongoDB, seed default maps directly into DB and pull from it
    if (rawMaps.length === 0) {
      const defaultMaps = await getDefaultLearningMaps();
      const now = new Date().toISOString();
      for (const map of defaultMaps) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
        const { _id, ...cleanMap } = map as any;
        await mapsCol.updateOne(
          { id: map.id, userEmail: session.user.email },
          {
            $set: {
              ...cleanMap,
              userEmail: session.user.email,
              updatedAt: now,
            },
            $setOnInsert: {
              createdAt: map.createdAt || now,
            },
          },
          { upsert: true }
        );
      }

      rawMaps = await mapsCol.find({ userEmail: session.user.email }).toArray();
    }
    const rawJournals = await db.collection('journals').find({ userEmail: session.user.email }).toArray();
    const rawTodos = await db.collection('todos').find({ userEmail: session.user.email }).toArray();
    const rawSettings = await db.collection('settings').findOne({ userEmail: session.user.email });

    const maps = rawMaps.map(({ _id, ...rest }) => rest);
    const journals = rawJournals.map(({ _id, ...rest }) => rest);
    const todos = rawTodos.map(({ _id, ...rest }) => rest);
    const settings = rawSettings ? (({ _id, ...rest }) => rest)(rawSettings) : null;

    return NextResponse.json({
      success: true,
      maps,
      journals,
      todos,
      settings,
    });
  } catch (error) {
    console.error('ProgressOS: Error fetching cloud data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

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

    // 1. Sync local maps to cloud (upsert and delete permanently removed maps)
    if (Array.isArray(body.maps)) {
      const clientMapIds = clientMaps.map((m) => m.id).filter(Boolean);
      await mapsCol.deleteMany({
        userEmail: session.user.email,
        id: { $nin: clientMapIds },
      });

      for (const map of clientMaps) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
        const { _id, ...cleanMap } = map as any;
        await mapsCol.updateOne(
          { id: map.id, userEmail: session.user.email },
          {
            $set: {
              ...cleanMap,
              userEmail: session.user.email,
              updatedAt: map.updatedAt || new Date().toISOString(),
            },
          },
          { upsert: true }
        );
      }
    }

    // 2. Sync local journals to cloud (upsert and delete removed journals)
    if (Array.isArray(body.journals)) {
      const clientJournalIds = clientJournals.map((j) => j.id).filter(Boolean);
      await journalsCol.deleteMany({
        userEmail: session.user.email,
        id: { $nin: clientJournalIds },
      });

      for (const journal of clientJournals) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
        const { _id, ...cleanJournal } = journal as any;
        await journalsCol.updateOne(
          { id: journal.id, userEmail: session.user.email },
          {
            $set: {
              ...cleanJournal,
              userEmail: session.user.email,
            },
          },
          { upsert: true }
        );
      }
    }

    // 3. Sync local todos to cloud (upsert and delete removed todos)
    if (Array.isArray(body.todos)) {
      const clientTodoIds = clientTodos.map((t) => t.id).filter(Boolean);
      await todosCol.deleteMany({
        userEmail: session.user.email,
        id: { $nin: clientTodoIds },
      });

      for (const todo of clientTodos) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
        const { _id, ...cleanTodo } = todo as any;
        await todosCol.updateOne(
          { id: todo.id, userEmail: session.user.email },
          {
            $set: {
              ...cleanTodo,
              userEmail: session.user.email,
            },
          },
          { upsert: true }
        );
      }
    }

    // 4. Upsert settings if provided (strip immutable _id)
    if (clientSettings) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
      const { _id, ...cleanSettings } = clientSettings as any;
      await settingsCol.updateOne(
        { userEmail: session.user.email },
        {
          $set: {
            ...cleanSettings,
            userEmail: session.user.email,
            updatedAt: new Date().toISOString(),
          },
        },
        { upsert: true }
      );
    }

    // 5. Purge any maps deleted over 7 days ago
    const SEVEN_DAYS_AGO = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    await mapsCol.deleteMany({
      userEmail: session.user.email,
      isDeleted: true,
      deletedAt: { $lt: SEVEN_DAYS_AGO },
    });

    // 6. Read full updated cloud state for user (strip _id)
    const rawCloudMaps = await mapsCol.find({ userEmail: session.user.email }).toArray();
    const rawCloudJournals = await journalsCol.find({ userEmail: session.user.email }).toArray();
    const rawCloudTodos = await todosCol.find({ userEmail: session.user.email }).toArray();
    const rawCloudSettings = await settingsCol.findOne({ userEmail: session.user.email });

    const cloudMaps = rawCloudMaps.map(({ _id, ...rest }) => rest);
    const cloudJournals = rawCloudJournals.map(({ _id, ...rest }) => rest);
    const cloudTodos = rawCloudTodos.map(({ _id, ...rest }) => rest);
    const cloudSettings = rawCloudSettings ? (({ _id, ...rest }) => rest)(rawCloudSettings) : null;

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

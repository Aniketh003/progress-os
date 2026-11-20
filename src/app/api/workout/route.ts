import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDatabase } from '@/lib/mongodb';
import { validateWorkoutPlan } from '@/lib/workout';
import { getDefaultWorkoutPlan } from '@/lib/server-defaults';

// GET /api/workout - Get the workout plan for the current user (pulled directly from DB)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ success: true, plan: null });
    }

    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ success: true, plan: null });
    }

    const workoutCol = db.collection('workout_plans');
    let doc = await workoutCol.findOne({
      userEmail: session.user.email,
    });

    // If no plan in DB yet for this user, seed default plan directly into DB and pull from it
    if (!doc || !doc.plan) {
      const defaultPlan = await getDefaultWorkoutPlan();
      if (defaultPlan) {
        const now = new Date().toISOString();
        await workoutCol.updateOne(
          { userEmail: session.user.email },
          {
            $set: {
              userEmail: session.user.email,
              plan: defaultPlan,
              updatedAt: now,
            },
          },
          { upsert: true }
        );

        doc = await workoutCol.findOne({
          userEmail: session.user.email,
        });
      }
    }

    if (!doc || !doc.plan) {
      return NextResponse.json({ success: true, plan: null });
    }

    return NextResponse.json({
      success: true,
      plan: doc.plan,
      updatedAt: doc.updatedAt,
      source: 'mongodb',
    });
  } catch (error) {
    console.error('ProgressOS: Error fetching workout plan:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST /api/workout - Save/update the workout plan for the current user
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();

    const validation = validateWorkoutPlan(body);
    if (!validation.success || !validation.data) {
      return NextResponse.json(
        { error: validation.error || 'Invalid workout plan' },
        { status: 400 }
      );
    }

    const plan = validation.data;

    if (session?.user?.email) {
      const db = await getDatabase();
      if (db) {
        await db.collection('workout_plans').updateOne(
          { userEmail: session.user.email },
          {
            $set: {
              userEmail: session.user.email,
              plan,
              updatedAt: new Date().toISOString(),
            },
          },
          { upsert: true }
        );
      }
    }

    return NextResponse.json({
      success: true,
      plan,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('ProgressOS: Error saving workout plan:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE /api/workout - Reset workout plan for current user
export async function DELETE() {
  try {
    const session = await auth();
    if (session?.user?.email) {
      const db = await getDatabase();
      if (db) {
        await db.collection('workout_plans').deleteOne({
          userEmail: session.user.email,
        });
      }
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('ProgressOS: Error deleting workout plan:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

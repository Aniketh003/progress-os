import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDatabase } from '@/lib/mongodb';
import { LearningMap } from '@/types';

// GET /api/maps - Fetch maps owned by the current user
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

    const rawMaps = await db
      .collection('learning_maps')
      .find({ userEmail: session.user.email })
      .sort({ updatedAt: -1 })
      .toArray();

    const maps = rawMaps.map(({ _id, ...rest }) => rest);

    return NextResponse.json({ maps });
  } catch (error) {
    console.error('ProgressOS: Error fetching maps:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/maps - Save or update a map for the current user
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

    const mapData: LearningMap = await req.json();
    if (!mapData || !mapData.id || !mapData.title) {
      return NextResponse.json({ error: 'Invalid map data' }, { status: 400 });
    }

    const mapsCol = db.collection('learning_maps');
    const now = new Date().toISOString();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    const { _id, ...cleanMapData } = mapData as any;

    await mapsCol.updateOne(
      { id: mapData.id, userEmail: session.user.email },
      {
        $set: {
          ...cleanMapData,
          userEmail: session.user.email,
          updatedAt: now,
        },
        $setOnInsert: {
          createdAt: mapData.createdAt || now,
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true, id: mapData.id });
  } catch (error) {
    console.error('ProgressOS: Error saving map:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/maps?id=... - Delete a map for the current user
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    const { searchParams } = new URL(req.url);
    const mapId = searchParams.get('id');
    if (!mapId) {
      return NextResponse.json({ error: 'Missing map ID' }, { status: 400 });
    }

    await db.collection('learning_maps').deleteOne({
      id: mapId,
      userEmail: session.user.email,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('ProgressOS: Error deleting map:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

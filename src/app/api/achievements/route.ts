import { NextResponse } from 'next/server';
import { db } from '@/lib/store/db-adapter';
import { DEMO_USER_ID } from '@/lib/store/seed-data';

export async function GET() {
  try {
    const achievements = await db.getAchievements(DEMO_USER_ID);
    return NextResponse.json({ success: true, achievements });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.title || !body.description || !body.date) {
      return NextResponse.json({ success: false, error: 'Title, description, and date are required' }, { status: 400 });
    }
    const achievement = await db.addAchievement(DEMO_USER_ID, body);
    return NextResponse.json({ success: true, achievement });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Achievement ID is required' }, { status: 400 });
    }
    await db.deleteAchievement(DEMO_USER_ID, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { db } from '@/lib/store/db-adapter';
import { DEMO_USER_ID } from '@/lib/store/seed-data';

export async function GET() {
  try {
    const experiences = await db.getExperiences(DEMO_USER_ID);
    return NextResponse.json({ success: true, experiences });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.company || !body.role || !body.start_date) {
      return NextResponse.json({ success: false, error: 'Company, role, and start_date are required' }, { status: 400 });
    }
    const experience = await db.addExperience(DEMO_USER_ID, body);
    return NextResponse.json({ success: true, experience });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Experience ID is required' }, { status: 400 });
    }
    const updated = await db.updateExperience(DEMO_USER_ID, id, updates);
    return NextResponse.json({ success: true, experience: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Experience ID is required' }, { status: 400 });
    }
    await db.deleteExperience(DEMO_USER_ID, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

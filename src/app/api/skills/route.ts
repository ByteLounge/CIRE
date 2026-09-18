import { NextResponse } from 'next/server';
import { db } from '@/lib/store/db-adapter';
import { DEMO_USER_ID } from '@/lib/store/seed-data';

export async function GET() {
  try {
    const skills = await db.getSkills(DEMO_USER_ID);
    return NextResponse.json({ success: true, skills });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.category) {
      return NextResponse.json({ success: false, error: 'Name and category are required' }, { status: 400 });
    }
    const skill = await db.addSkill(DEMO_USER_ID, body);
    return NextResponse.json({ success: true, skill });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Skill ID is required' }, { status: 400 });
    }
    await db.deleteSkill(DEMO_USER_ID, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

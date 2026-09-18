import { NextResponse } from 'next/server';
import { db } from '@/lib/store/db-adapter';
import { DEMO_USER_ID } from '@/lib/store/seed-data';

export async function GET() {
  try {
    const education = await db.getEducation(DEMO_USER_ID);
    return NextResponse.json({ success: true, education });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.institution || !body.degree || !body.field_of_study) {
      return NextResponse.json({ success: false, error: 'Institution, degree, and field of study are required' }, { status: 400 });
    }
    const edu = await db.addEducation(DEMO_USER_ID, body);
    return NextResponse.json({ success: true, education: edu });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Education ID is required' }, { status: 400 });
    }
    await db.deleteEducation(DEMO_USER_ID, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

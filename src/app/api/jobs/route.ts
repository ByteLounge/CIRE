import { NextResponse } from 'next/server';
import { db } from '@/lib/store/db-adapter';
import { DEMO_USER_ID } from '@/lib/store/seed-data';

export async function GET() {
  try {
    const jobs = await db.getJobs(DEMO_USER_ID);
    return NextResponse.json({ success: true, jobs });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.company || !body.role || !body.job_description) {
      return NextResponse.json({ success: false, error: 'Company, role, and description are required' }, { status: 400 });
    }
    const job = await db.saveJob(DEMO_USER_ID, body);
    return NextResponse.json({ success: true, job });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Job ID is required' }, { status: 400 });
    }
    await db.deleteJob(DEMO_USER_ID, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

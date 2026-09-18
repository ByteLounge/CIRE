import { NextResponse } from 'next/server';
import { db } from '@/lib/store/db-adapter';
import { DEMO_USER_ID } from '@/lib/store/seed-data';

export async function GET() {
  try {
    const repos = await db.getRepositories(DEMO_USER_ID);
    return NextResponse.json({ success: true, repositories: repos });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { repoId, selected } = body;
    if (!repoId) {
      return NextResponse.json({ success: false, error: 'Repository ID is required' }, { status: 400 });
    }
    const updated = await db.updateRepository(DEMO_USER_ID, repoId, {
      selected_for_analysis: Boolean(selected),
    });
    return NextResponse.json({ success: true, repository: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

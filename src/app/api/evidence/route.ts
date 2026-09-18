import { NextResponse } from 'next/server';
import { db } from '@/lib/store/db-adapter';
import { DEMO_USER_ID } from '@/lib/store/seed-data';

export async function GET() {
  try {
    const evidence = await db.getEvidence(DEMO_USER_ID);
    return NextResponse.json({ success: true, evidence });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.title || !body.claim || !body.type || !body.source_type) {
      return NextResponse.json({ success: false, error: 'Title, claim, type, and source_type are required' }, { status: 400 });
    }
    const item = await db.addEvidence(DEMO_USER_ID, {
      ...body,
      skills: body.skills || [],
      confidence: body.confidence ?? 1.0,
      verification_status: body.verification_status || 'USER_ADDED',
    });
    return NextResponse.json({ success: true, evidence: item });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, verification_status, ...updates } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Evidence ID is required' }, { status: 400 });
    }
    const updated = await db.updateEvidence(DEMO_USER_ID, id, {
      ...updates,
      ...(verification_status ? { 
        verification_status, 
        verified_at: verification_status === 'VERIFIED' ? new Date().toISOString() : null 
      } : {})
    });
    return NextResponse.json({ success: true, evidence: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Evidence ID is required' }, { status: 400 });
    }
    await db.deleteEvidence(DEMO_USER_ID, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

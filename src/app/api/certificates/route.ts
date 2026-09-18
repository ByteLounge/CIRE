import { NextResponse } from 'next/server';
import { db } from '@/lib/store/db-adapter';
import { DEMO_USER_ID } from '@/lib/store/seed-data';

export async function GET() {
  try {
    const certificates = await db.getCertificates(DEMO_USER_ID);
    return NextResponse.json({ success: true, certificates });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.issuer || !body.issue_date) {
      return NextResponse.json({ success: false, error: 'Name, issuer, and issue_date are required' }, { status: 400 });
    }
    const cert = await db.addCertificate(DEMO_USER_ID, body);
    return NextResponse.json({ success: true, certificate: cert });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Certificate ID is required' }, { status: 400 });
    }
    await db.deleteCertificate(DEMO_USER_ID, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

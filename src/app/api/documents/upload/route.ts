import { NextResponse } from 'next/server';
import { db } from '@/lib/store/db-adapter';
import { DEMO_USER_ID } from '@/lib/store/seed-data';
import { getAIProvider } from '@/lib/ai';
import { CostTracker } from '@/lib/ai/cost-tracker';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const documentType = (formData.get('type') as string) || 'resume'; // 'resume' | 'certificate'

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // Check size limit: 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'File exceeds 10MB limit' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');

    // Check Cache for identical document hash
    const cached = CostTracker.getCached(hash);
    if (cached) {
      return NextResponse.json({
        success: true,
        isCached: true,
        extracted: cached,
        fileName: file.name,
      });
    }

    // Extract text based on file type
    let extractedText = '';
    const name = file.name.toLowerCase();

    if (name.endsWith('.txt')) {
      extractedText = buffer.toString('utf-8');
    } else if (name.endsWith('.docx')) {
      try {
        const mammoth = await import('mammoth');
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value;
      } catch {
        extractedText = buffer.toString('utf-8').slice(0, 1500);
      }
    } else if (name.endsWith('.pdf')) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfParse = require('pdf-parse');
        const pdfData = await pdfParse(buffer);
        extractedText = pdfData.text;
      } catch {
        extractedText = `Extracted textual content from PDF: ${file.name}`;
      }
    } else {
      // Images or scanned certificates
      extractedText = `Certificate: ${file.name.replace(/\.[^/.]+$/, '')} issued to candidate for technical competence.`;
    }

    // Check Quota
    const quota = await CostTracker.verifyQuota(DEMO_USER_ID, 'document_extraction');
    if (!quota.allowed) {
      return NextResponse.json({ success: false, error: quota.reason }, { status: 429 });
    }

    const ai = getAIProvider();
    const startTime = Date.now();
    const extractedData = await ai.extractDocument(extractedText, documentType);
    const latency = Date.now() - startTime;

    await CostTracker.recordRun({
      userId: DEMO_USER_ID,
      operation: 'document_extraction',
      provider: ai.name,
      model: 'default',
      latencyMs: latency,
    });

    // Cache the extracted structure
    CostTracker.setCached(hash, extractedData, 86400);

    return NextResponse.json({
      success: true,
      fileName: file.name,
      hash,
      extractedText: extractedText.slice(0, 400),
      extractedData,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

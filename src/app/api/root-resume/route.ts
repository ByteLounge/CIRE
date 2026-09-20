import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

function extractPdfText(filePath: string): string {
  try {
    const escaped = filePath.replace(/\\/g, '\\\\');
    const cmd = `node -e "const { PDFParse } = require('pdf-parse'); const fs = require('fs'); const p = new PDFParse({ data: fs.readFileSync('${escaped}') }); p.getText().then(t => process.stdout.write(t.text)).catch(e => { console.error(e); process.exit(1); })"`;
    const output = execSync(cmd, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
    return output;
  } catch (err) {
    console.error('Child process PDF extraction failed:', err);
    return '';
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedFile = searchParams.get('file');

    const cwd = process.cwd();
    const files = fs.readdirSync(cwd);

    // Look for all resume files in root directory
    const allResumeFiles = files.filter(f => 
      /resume|template|cv/i.test(f) && /\.(docx|pdf|txt|md)$/i.test(f)
    );

    if (allResumeFiles.length === 0) {
      return NextResponse.json({
        success: true,
        found: false,
        message: 'No resume file found in root directory. Please place your resume (.docx or .pdf) in the project root.',
      });
    }

    // Sort to prioritize .docx files (like Yash_Sanikop_Resume_Microsoft_SWE_Intern.docx), then newest mtime
    allResumeFiles.sort((a, b) => {
      const isDocxA = a.toLowerCase().endsWith('.docx');
      const isDocxB = b.toLowerCase().endsWith('.docx');
      if (isDocxA && !isDocxB) return -1;
      if (!isDocxA && isDocxB) return 1;
      const mtimeA = fs.statSync(path.join(cwd, a)).mtimeMs;
      const mtimeB = fs.statSync(path.join(cwd, b)).mtimeMs;
      return mtimeB - mtimeA;
    });

    const resumeFileName = requestedFile && allResumeFiles.includes(requestedFile)
      ? requestedFile
      : allResumeFiles[0];

    const filePath = path.join(cwd, resumeFileName);
    const stats = fs.statSync(filePath);
    let rawText = '';

    if (resumeFileName.toLowerCase().endsWith('.docx')) {
      try {
        const mammoth = await import('mammoth');
        const buffer = fs.readFileSync(filePath);
        const res = await mammoth.extractRawText({ buffer });
        rawText = res.value || '';
      } catch (docxErr) {
        console.warn('DOCX parsing error:', docxErr);
      }
    } else if (resumeFileName.toLowerCase().endsWith('.pdf')) {
      rawText = extractPdfText(filePath);
    } else {
      rawText = fs.readFileSync(filePath, 'utf-8');
    }

    // Extract template structure heuristics
    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
    const candidateName = lines[0] || 'YASH SATISH SANIKOP';
    const contactLine = lines[1] || '';

    // Identify sections
    const knownSections = ['SUMMARY', 'EDUCATION', 'TECHNICAL SKILLS', 'EXPERIENCE', 'PROJECTS', 'CERTIFICATIONS', 'ACHIEVEMENTS'];
    const detectedSections = knownSections.filter(sec => 
      rawText.toUpperCase().includes(sec)
    );

    return NextResponse.json({
      success: true,
      found: true,
      fileName: resumeFileName,
      allFiles: allResumeFiles,
      filePath,
      fileSizeBytes: stats.size,
      lastModified: stats.mtime.toISOString(),
      rawText,
      template: {
        candidateName,
        contactLine,
        detectedSections,
        order: detectedSections.length > 0 ? detectedSections : knownSections,
        fontFamily: 'Calibri',
        marginsDxa: 576, // 0.4 inch ATS margins
        tabStopRight: 11088,
        styleNotes: 'Microsoft SWE Intern ATS template (Calibri, 0.4in margins, single-column, 11088 right tab stop, 1-page fit).',
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const cwd = process.cwd();
    const savePath = path.join(cwd, file.name);
    const arrayBuffer = await file.arrayBuffer();
    fs.writeFileSync(savePath, Buffer.from(arrayBuffer));

    return NextResponse.json({
      success: true,
      message: `Successfully saved ${file.name} to root directory as template.`,
      fileName: file.name,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

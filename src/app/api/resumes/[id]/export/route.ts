import { NextResponse } from 'next/server';
import { db } from '@/lib/store/db-adapter';
import { DEMO_USER_ID } from '@/lib/store/seed-data';
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  AlignmentType,
  BorderStyle
} from 'docx';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const version = await db.getResumeVersionById(id, DEMO_USER_ID);
    if (!version) {
      return NextResponse.json({ success: false, error: 'Resume version not found' }, { status: 404 });
    }

    const { resume_data } = version;

    // Build ATS Compliant DOCX Document
    const docChildren: Paragraph[] = [
      // Name
      new Paragraph({
        text: resume_data.contact.name,
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
      // Contact Info
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: [
              resume_data.contact.email,
              resume_data.contact.phone,
              resume_data.contact.location,
              resume_data.contact.linkedin,
              resume_data.contact.github,
            ].filter(Boolean).join(' | '),
            size: 19,
          }),
        ],
      }),
    ];

    // Summary Section
    if (resume_data.summary) {
      docChildren.push(
        new Paragraph({
          text: 'PROFESSIONAL SUMMARY',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
          border: { bottom: { color: 'CCCCCC', space: 1, style: BorderStyle.SINGLE, size: 6 } },
        }),
        new Paragraph({
          text: resume_data.summary,
          spacing: { after: 200 },
        })
      );
    }

    // Technical Skills
    if (resume_data.skills?.length) {
      docChildren.push(
        new Paragraph({
          text: 'TECHNICAL SKILLS',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
          border: { bottom: { color: 'CCCCCC', space: 1, style: BorderStyle.SINGLE, size: 6 } },
        })
      );
      for (const skillCat of resume_data.skills) {
        docChildren.push(
          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({ text: `${skillCat.category}: `, bold: true }),
              new TextRun({ text: skillCat.items.join(', ') }),
            ],
          })
        );
      }
    }

    // Professional Experience
    if (resume_data.experience?.length) {
      docChildren.push(
        new Paragraph({
          text: 'PROFESSIONAL EXPERIENCE',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
          border: { bottom: { color: 'CCCCCC', space: 1, style: BorderStyle.SINGLE, size: 6 } },
        })
      );

      for (const exp of resume_data.experience) {
        docChildren.push(
          new Paragraph({
            spacing: { before: 120, after: 40 },
            children: [
              new TextRun({ text: `${exp.role} — ${exp.company}`, bold: true }),
              new TextRun({ text: `\t${exp.dates}`, italics: true }),
            ],
          })
        );
        for (const bullet of exp.bullets) {
          docChildren.push(
            new Paragraph({
              text: bullet.text,
              bullet: { level: 0 },
              spacing: { after: 60 },
            })
          );
        }
      }
    }

    // Technical Projects
    if (resume_data.projects?.length) {
      docChildren.push(
        new Paragraph({
          text: 'TECHNICAL PROJECTS',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
          border: { bottom: { color: 'CCCCCC', space: 1, style: BorderStyle.SINGLE, size: 6 } },
        })
      );

      for (const proj of resume_data.projects) {
        docChildren.push(
          new Paragraph({
            spacing: { before: 120, after: 40 },
            children: [
              new TextRun({ text: proj.title, bold: true }),
              new TextRun({ text: ` | Technologies: ${proj.technologies.join(', ')}`, italics: true }),
            ],
          })
        );
        for (const bullet of proj.bullets) {
          docChildren.push(
            new Paragraph({
              text: bullet.text,
              bullet: { level: 0 },
              spacing: { after: 60 },
            })
          );
        }
      }
    }

    // Education
    if (resume_data.education?.length) {
      docChildren.push(
        new Paragraph({
          text: 'EDUCATION',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
          border: { bottom: { color: 'CCCCCC', space: 1, style: BorderStyle.SINGLE, size: 6 } },
        })
      );
      for (const edu of resume_data.education) {
        docChildren.push(
          new Paragraph({
            spacing: { before: 100, after: 40 },
            children: [
              new TextRun({ text: `${edu.institution}`, bold: true }),
              new TextRun({ text: `\t${edu.dates}`, italics: true }),
            ],
          }),
          new Paragraph({
            text: `${edu.degree}${edu.gpa ? ` | GPA: ${edu.gpa}` : ''}`,
            spacing: { after: 60 },
          })
        );
      }
    }

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 720, // 0.5 inch
                right: 720,
                bottom: 720,
                left: 720,
              },
            },
          },
          children: docChildren,
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    const sanitizedTitle = (version.version_name || 'Resume').replace(/[^a-zA-Z0-9_-]/g, '_');

    return new Response(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${sanitizedTitle}.docx"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

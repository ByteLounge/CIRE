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
  BorderStyle,
  TabStopType,
  Tab
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

    const FONT_NAME = 'Calibri';

    // Build ATS Compliant DOCX Document strictly following Yash_Sanikop_Resume_Microsoft_SWE_Intern.docx
    const docChildren: Paragraph[] = [
      // Name
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 },
        children: [
          new TextRun({
            text: resume_data.contact.name.toUpperCase(),
            bold: true,
            font: FONT_NAME,
            size: 32, // 16pt
          }),
        ],
      }),
      // Contact Info
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [
          new TextRun({
            text: [
              resume_data.contact.location,
              resume_data.contact.phone,
              resume_data.contact.email,
              resume_data.contact.github ? resume_data.contact.github.replace('https://', '') : '',
              resume_data.contact.linkedin ? resume_data.contact.linkedin.replace('https://', '') : '',
              resume_data.contact.portfolio ? resume_data.contact.portfolio.replace('https://', '') : '',
            ].filter(Boolean).join('  |  '),
            font: FONT_NAME,
            size: 17, // 8.5pt
          }),
        ],
      }),
    ];

    // 1. SUMMARY
    if (resume_data.summary) {
      docChildren.push(
        new Paragraph({
          spacing: { before: 100, after: 40 },
          border: { bottom: { color: '000000', space: 1, style: BorderStyle.SINGLE, size: 6 } },
          children: [
            new TextRun({
              text: 'SUMMARY',
              bold: true,
              font: FONT_NAME,
              size: 18, // 9pt
            }),
          ],
        }),
        new Paragraph({
          spacing: { after: 40 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: resume_data.summary,
              font: FONT_NAME,
              size: 17, // 8.5pt
            }),
          ],
        })
      );
    }

    // 2. EDUCATION
    if (resume_data.education?.length) {
      docChildren.push(
        new Paragraph({
          spacing: { before: 100, after: 40 },
          border: { bottom: { color: '000000', space: 1, style: BorderStyle.SINGLE, size: 6 } },
          children: [
            new TextRun({
              text: 'EDUCATION',
              bold: true,
              font: FONT_NAME,
              size: 18,
            }),
          ],
        })
      );

      for (const edu of resume_data.education) {
        docChildren.push(
          new Paragraph({
            tabStops: [{ type: TabStopType.RIGHT, position: 11088 }],
            spacing: { before: 60, after: 0 },
            children: [
              new TextRun({
                text: `${edu.degree}, ${edu.institution}`,
                bold: true,
                font: FONT_NAME,
                size: 17,
              }),
              new TextRun({
                children: [new Tab(), edu.dates],
                italics: true,
                font: FONT_NAME,
                size: 17,
              }),
            ],
          })
        );
        if (edu.gpa) {
          docChildren.push(
            new Paragraph({
              spacing: { after: 60 },
              children: [
                new TextRun({
                  text: `CGPA: ${edu.gpa}`,
                  italics: true,
                  font: FONT_NAME,
                  size: 17,
                }),
              ],
            })
          );
        }
      }
    }

    // 3. TECHNICAL SKILLS
    if (resume_data.skills?.length) {
      docChildren.push(
        new Paragraph({
          spacing: { before: 100, after: 40 },
          border: { bottom: { color: '000000', space: 1, style: BorderStyle.SINGLE, size: 6 } },
          children: [
            new TextRun({
              text: 'TECHNICAL SKILLS',
              bold: true,
              font: FONT_NAME,
              size: 18,
            }),
          ],
        })
      );

      for (const skillCat of resume_data.skills) {
        docChildren.push(
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: `${skillCat.category}: `,
                bold: true,
                font: FONT_NAME,
                size: 17,
              }),
              new TextRun({
                text: skillCat.items.join(', '),
                font: FONT_NAME,
                size: 17,
              }),
            ],
          })
        );
      }
    }

    // 4. EXPERIENCE
    if (resume_data.experience?.length) {
      docChildren.push(
        new Paragraph({
          spacing: { before: 100, after: 40 },
          border: { bottom: { color: '000000', space: 1, style: BorderStyle.SINGLE, size: 6 } },
          children: [
            new TextRun({
              text: 'EXPERIENCE',
              bold: true,
              font: FONT_NAME,
              size: 18,
            }),
          ],
        })
      );

      for (const exp of resume_data.experience) {
        const rightText = [exp.dates, exp.location].filter(Boolean).join(' | ');
        docChildren.push(
          new Paragraph({
            tabStops: [{ type: TabStopType.RIGHT, position: 11088 }],
            spacing: { before: 60, after: 20 },
            children: [
              new TextRun({
                text: `${exp.role}, ${exp.company}`,
                bold: true,
                font: FONT_NAME,
                size: 17,
              }),
              new TextRun({
                children: [new Tab(), rightText],
                italics: true,
                font: FONT_NAME,
                size: 17,
              }),
            ],
          })
        );

        for (const bullet of exp.bullets) {
          docChildren.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { after: 20 },
              children: [
                new TextRun({
                  text: bullet.text,
                  font: FONT_NAME,
                  size: 17,
                }),
              ],
            })
          );
        }
      }
    }

    // 5. PROJECTS
    if (resume_data.projects?.length) {
      docChildren.push(
        new Paragraph({
          spacing: { before: 100, after: 40 },
          border: { bottom: { color: '000000', space: 1, style: BorderStyle.SINGLE, size: 6 } },
          children: [
            new TextRun({
              text: 'PROJECTS',
              bold: true,
              font: FONT_NAME,
              size: 18,
            }),
          ],
        })
      );

      for (const proj of resume_data.projects) {
        docChildren.push(
          new Paragraph({
            tabStops: [{ type: TabStopType.RIGHT, position: 11088 }],
            spacing: { before: 60, after: 20 },
            children: [
              new TextRun({
                text: proj.title,
                bold: true,
                font: FONT_NAME,
                size: 17,
              }),
              new TextRun({
                children: [new Tab(), proj.technologies.join(', ')],
                italics: true,
                font: FONT_NAME,
                size: 17,
              }),
            ],
          })
        );

        for (const bullet of proj.bullets) {
          docChildren.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { after: 20 },
              children: [
                new TextRun({
                  text: bullet.text,
                  font: FONT_NAME,
                  size: 17,
                }),
              ],
            })
          );
        }

        if (proj.link) {
          docChildren.push(
            new Paragraph({
              spacing: { after: 40 },
              children: [
                new TextRun({
                  text: proj.link.replace('https://', ''),
                  font: FONT_NAME,
                  size: 16,
                  color: '333333',
                }),
              ],
            })
          );
        }
      }
    }

    // 6. CERTIFICATIONS
    if (resume_data.certificates?.length) {
      docChildren.push(
        new Paragraph({
          spacing: { before: 100, after: 40 },
          border: { bottom: { color: '000000', space: 1, style: BorderStyle.SINGLE, size: 6 } },
          children: [
            new TextRun({
              text: 'CERTIFICATIONS',
              bold: true,
              font: FONT_NAME,
              size: 18,
            }),
          ],
        }),
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({
              text: resume_data.certificates.map(c => `${c.name}${c.issuer ? ` (${c.issuer})` : ''}`).join('  |  '),
              font: FONT_NAME,
              size: 17,
            }),
          ],
        })
      );
    }

    const doc = new Document({
      styles: {
        default: {
          document: {
            run: {
              font: FONT_NAME,
              size: 17,
            },
            paragraph: {
              spacing: { line: 240 },
            },
          },
        },
      },
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 576,    // Exactly 0.4 in (matches template)
                bottom: 576,
                left: 576,
                right: 576,
              },
            },
          },
          children: docChildren,
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    const sanitizedTitle = (version.version_name || 'Resume')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .toLowerCase();

    return new NextResponse(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${sanitizedTitle}.docx"`,
      },
    });
  } catch (error) {
    console.error('DOCX Export error:', error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

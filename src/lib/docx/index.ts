import { Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, AlignmentType, WidthType } from 'docx';

/**
 * Decodes base64 data URLs into binary Uint8Arrays for embedding inside word documents.
 */
function decodeBase64(base64Str: string): Uint8Array {
  const base64Data = base64Str.split(',')[1] || base64Str;
  const binaryString = window.atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Generates and downloads a beautifully formatted, compliant Microsoft Word (.docx) document
 * matching the template structures of DocuAI.
 */
export async function generateDocx(
  type: 'certificate' | 'offer-letter' | 'internship-letter',
  formData: Record<string, any>,
  verificationCode: string,
  filename: string
): Promise<string> {
  const childrenElements: any[] = [];

  // 1. Brand Logo Embed Block (Optional)
  if (formData.logoFile) {
    try {
      const logoBytes = decodeBase64(formData.logoFile);
      childrenElements.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
          children: [
            new ImageRun({
              data: logoBytes,
              transformation: {
                width: 80,
                height: 80,
              },
            } as any),
          ],
        })
      );
    } catch (e) {
      console.warn('Could not render logo in DOCX:', e);
    }
  }

  // 2. Section Builder matching Selected Document Type
  if (type === 'certificate') {
    childrenElements.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: 'CERTIFICATE OF ACCOMPLISHMENT',
            bold: true,
            size: 28,
            color: '1E1B4B', // Deep indigo
            font: 'Georgia',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        children: [
          new TextRun({
            text: `ISSUED BY: ${formData.organization.toUpperCase()}`,
            bold: true,
            size: 16,
            color: 'D97706', // Gold accent
            font: 'Arial',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: 'This certified credential is proudly awarded to',
            italics: true,
            size: 20,
            font: 'Georgia',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        children: [
          new TextRun({
            text: formData.recipientName,
            bold: true,
            size: 36,
            color: '1E1B4B',
            font: 'Georgia',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        children: [
          new TextRun({
            text: formData.body,
            size: 22,
            font: 'Arial',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        children: [
          new TextRun({
            text: `Issuer Address: ${formData.orgAddress || ''}`,
            size: 14,
            color: '6B7280',
            font: 'Arial',
          }),
        ],
      })
    );
  } else if (type === 'offer-letter') {
    childrenElements.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { after: 100 },
        children: [
          new TextRun({
            text: 'STRICTLY CONFIDENTIAL · SERVICE AGREEMENT',
            bold: true,
            size: 14,
            color: '6366F1',
            font: 'Courier New',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { after: 300 },
        children: [
          new TextRun({
            text: 'OFFER OF EMPLOYMENT SUMMARY',
            bold: true,
            size: 24,
            color: '0F172A',
            font: 'Arial',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: `Dear ${formData.recipientName},`,
            bold: true,
            size: 22,
            font: 'Arial',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { after: 300 },
        children: [
          new TextRun({
            text: formData.body,
            size: 20,
            font: 'Arial',
          }),
        ],
      })
    );

    // Position Details Grid
    childrenElements.push(
      new Paragraph({
        spacing: { before: 200, after: 100 },
        children: [
          new TextRun({
            text: 'Summary of Key Employment Terms:',
            bold: true,
            size: 16,
            font: 'Arial',
          }),
        ],
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Job Position Title', bold: true, font: 'Arial', size: 18 })] })] }),
              new TableCell({ width: { size: 70, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: formData.jobTitle || '', font: 'Arial', size: 18 })] })] }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Division / Team', bold: true, font: 'Arial', size: 18 })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: formData.department || '', font: 'Arial', size: 18 })] })] }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Annual Base Salary', bold: true, font: 'Arial', size: 18 })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: formData.salary || '', font: 'Arial', size: 18 })] })] }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Proposed Start Date', bold: true, font: 'Arial', size: 18 })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: formData.joiningDate || '', font: 'Arial', size: 18 })] })] }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Work Location / Layout', bold: true, font: 'Arial', size: 18 })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: formData.workLocation || '', font: 'Arial', size: 18 })] })] }),
            ],
          }),
        ],
      }),
      new Paragraph({ spacing: { before: 200 } }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Covenants & Agreements: ', bold: true, size: 14, font: 'Arial' }),
          new TextRun({ text: formData.customTerms || 'N/A', italics: true, size: 14, font: 'Arial' }),
        ],
      })
    );
  } else {
    // Internship letter
    childrenElements.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { after: 100 },
        children: [
          new TextRun({
            text: 'SERVICE COMPLETION & PERFORMANCE CERTIFICATION',
            bold: true,
            size: 14,
            color: '0D9488',
            font: 'Courier New',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { after: 300 },
        children: [
          new TextRun({
            text: `Dear ${formData.recipientName},`,
            bold: true,
            size: 22,
            font: 'Arial',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { after: 300 },
        children: [
          new TextRun({
            text: `This document certifies that student ${formData.recipientName} from ${formData.collegeInstitution || 'Academic Institution'} has successfully completed their assigned technical training curriculum with our team.`,
            size: 20,
            font: 'Arial',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { after: 300 },
        children: [
          new TextRun({
            text: formData.body,
            size: 20,
            font: 'Arial',
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 200, after: 100 },
        children: [
          new TextRun({
            text: 'Summary of Internship Records:',
            bold: true,
            size: 16,
            font: 'Arial',
          }),
        ],
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Completed Role', bold: true, font: 'Arial', size: 18 })] })] }),
              new TableCell({ width: { size: 70, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: formData.internRole || '', font: 'Arial', size: 18 })] })] }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Duration Timeline', bold: true, font: 'Arial', size: 18 })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${formData.issueDate} to ${formData.endDate}`, font: 'Arial', size: 18 })] })] }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Issuing Organization', bold: true, font: 'Arial', size: 18 })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: formData.organization || '', font: 'Arial', size: 18 })] })] }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Program Coordinator', bold: true, font: 'Arial', size: 18 })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${formData.signatoryName} (${formData.signatoryTitle})`, font: 'Arial', size: 18 })] })] }),
            ],
          }),
        ],
      })
    );
  }

  // 3. Authorized Signature & Date block
  childrenElements.push(new Paragraph({ spacing: { before: 400 } }));

  if (formData.sigFile) {
    try {
      const sigBytes = decodeBase64(formData.sigFile);
      childrenElements.push(
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { after: 100 },
          children: [
            new ImageRun({
              data: sigBytes,
              transformation: {
                width: 140,
                height: 40,
              },
            } as any),
          ],
        })
      );
    } catch (e) {
      console.warn('Could not embed signature in DOCX:', e);
    }
  }

  childrenElements.push(
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 50 },
      children: [
        new TextRun({
          text: `Authorized Signatory: ${formData.signatoryName}`,
          bold: true,
          size: 16,
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 400 },
      children: [
        new TextRun({
          text: `${formData.signatoryTitle} · ${formData.organization}`,
          size: 14,
          color: '4B5563',
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 100 },
      children: [
        new TextRun({
          text: '---------------------------------------------------------',
          color: 'E5E7EB',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `VERIFICATION CODE: ${verificationCode}`,
          bold: true,
          size: 16,
          color: '4F46E5',
          font: 'Courier New',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'This document contains security checksum assets. Validate authentic credentials anytime via our secure verification portal.',
          size: 12,
          color: '9CA3AF',
          font: 'Arial',
        }),
      ],
    })
  );

  // 4. Document Assembly
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: childrenElements,
      },
    ],
  });

  try {
    const blob = await Packer.toBlob(doc);
    const downloadUrl = URL.createObjectURL(blob);
    const element = document.createElement('a');
    element.href = downloadUrl;
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(downloadUrl);

    // Convert blob to base64 data URI string for storage synchronization
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    return base64;
  } catch (err) {
    console.error('Failed to pack and download word file:', err);
    throw err;
  }
}

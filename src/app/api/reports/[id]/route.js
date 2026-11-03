import { NextResponse } from 'next/server';
const fs = require('fs');
const path = require('path');
const { db } = require('@/lib/db');
const { generatePdfReport } = require('@/reports/pdf-generator');

// GET /api/reports/[id] - Stream or download generated PDF
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const audit = await db.audit.findUnique({ where: { id } });

    if (!audit) {
      return NextResponse.json({ success: false, error: 'Audit record not found' }, { status: 404 });
    }

    const fileName = `seo-audit-${id}.pdf`;
    const searchPaths = [
      path.join('/tmp', 'reports', fileName),
      path.join(process.cwd(), 'public', 'reports', fileName)
    ];

    let foundPath = searchPaths.find((p) => fs.existsSync(p));

    if (!foundPath) {
      try {
        const client = audit.clientId ? await db.client.findUnique({ where: { id: audit.clientId } }) : null;
        await generatePdfReport(audit, client);
        foundPath = searchPaths.find((p) => fs.existsSync(p));
      } catch (genErr) {
        console.warn('PDF generation on demand failed:', genErr.message);
      }
    }

    if (!foundPath || !fs.existsSync(foundPath)) {
      return NextResponse.json({ success: false, error: 'PDF report not generated yet' }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(foundPath);

    return new Response(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': fileBuffer.length.toString()
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

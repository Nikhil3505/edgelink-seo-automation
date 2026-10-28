import { NextResponse } from 'next/server';
const fs = require('fs');
const path = require('path');
const { db } = require('@/lib/db');

// GET /api/reports/[id] - Stream or download generated PDF
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const audit = await db.audit.findUnique({ where: { id } });

    if (!audit) {
      return NextResponse.json({ success: false, error: 'Audit record not found' }, { status: 404 });
    }

    const fileName = `seo-audit-${id}.pdf`;
    const filePath = path.join(process.cwd(), 'public', 'reports', fileName);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ success: false, error: 'PDF report not generated yet' }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);

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

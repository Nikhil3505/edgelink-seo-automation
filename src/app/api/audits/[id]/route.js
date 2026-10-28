import { NextResponse } from 'next/server';
const { db } = require('@/lib/db');

// GET /api/audits/[id] - Polling & status endpoint for real-time progress
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const audit = await db.audit.findUnique({
      where: { id }
    });

    if (!audit) {
      return NextResponse.json({ success: false, error: 'Audit not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: audit });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

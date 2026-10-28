import { NextResponse } from 'next/server';
const { db } = require('@/lib/db');
const { enqueueAuditJob } = require('@/queue/queue');

// GET /api/audits - List audits
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const where = clientId ? { clientId } : {};
    const audits = await db.audit.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, count: audits.length, data: audits });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/audits - Trigger new audit (Section 3.2 TRIGGER: manual admin click / monthly cron)
export async function POST(request) {
  try {
    const body = await request.json();
    let { url, clientId, businessType = 'Dental Clinic', city = 'Pune', state = 'Maharashtra' } = body;

    if (!url) {
      return NextResponse.json({ success: false, error: 'URL is required' }, { status: 400 });
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    // If client wasn't provided, see if one exists or create a default client
    if (!clientId) {
      const clients = await db.client.findMany();
      if (clients && clients.length > 0) {
        clientId = clients[0].id;
      } else {
        const newClient = await db.client.create({
          data: {
            name: 'Smile Dental Clinic Pune',
            websiteUrl: url,
            businessType,
            city,
            state,
            country: 'India',
            phone: '+919876543210'
          }
        });
        clientId = newClient.id;
      }
    }

    // 1. Create Audit in DB
    const audit = await db.audit.create({
      data: {
        clientId,
        url,
        status: 'QUEUED',
        progress: 0,
        currentStep: 'Audit Job Enqueued in BullMQ'
      }
    });

    // 2. Enqueue into BullMQ (seo-audit-jobs)
    const queueResult = await enqueueAuditJob({
      auditId: audit.id,
      clientId,
      url,
      businessType,
      city,
      state
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Audit job triggered successfully',
        auditId: audit.id,
        bullJobId: queueResult.jobId,
        queue: queueResult.queue,
        mode: queueResult.mode
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('API Error /api/audits:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

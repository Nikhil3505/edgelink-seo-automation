import { NextResponse } from 'next/server';
const { db } = require('@/lib/db');
const { enqueueAuditJob } = require('@/queue/queue');

/**
 * External Cron Endpoint (Section 2.1 & 4.1)
 * Triggered by cron-job.org or scheduled ping to run monthly SEO audits
 */
export async function GET(request) {
  try {
    const clients = await db.client.findMany();
    if (!clients || clients.length === 0) {
      return NextResponse.json({ success: true, message: 'No clients configured for cron audit' });
    }

    const scheduled = [];
    for (const client of clients) {
      const audit = await db.audit.create({
        data: {
          clientId: client.id,
          url: client.websiteUrl,
          status: 'QUEUED',
          progress: 0,
          currentStep: 'Triggered by Monthly External Cron (cron-job.org)'
        }
      });

      await enqueueAuditJob({
        auditId: audit.id,
        clientId: client.id,
        url: client.websiteUrl,
        businessType: client.businessType,
        city: client.city,
        state: client.state
      });

      scheduled.push({ auditId: audit.id, client: client.name, url: client.websiteUrl });
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      triggeredBy: 'cron-job.org',
      scheduledCount: scheduled.length,
      jobs: scheduled
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  return GET(request);
}

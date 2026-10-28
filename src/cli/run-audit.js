// End-to-end audit test script
require('dotenv').config();
const { processAuditJob } = require('../queue/worker');
const { db } = require('../lib/db');

async function testPipeline() {
  console.log('--- TESTING FULL AUDIT PIPELINE ---');

  // 1. Create client
  const client = await db.client.create({
    data: {
      name: 'Smile Dental Clinic Pune',
      websiteUrl: 'https://example-dental-clinic.com',
      businessType: 'Dental Clinic',
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India',
      phone: '+919876543210',
      email: 'contact@example-dental-clinic.com'
    }
  });

  // 2. Create audit record
  const audit = await db.audit.create({
    data: {
      clientId: client.id,
      url: client.websiteUrl,
      status: 'QUEUED',
      progress: 0
    }
  });

  console.log(`Created Audit #${audit.id} for Client: ${client.name}`);

  // 3. Process job
  const result = await processAuditJob({
    auditId: audit.id,
    clientId: client.id,
    url: client.websiteUrl,
    businessType: client.businessType,
    city: client.city,
    state: client.state
  });

  console.log('PIPELINE RESULT:', result);
  const finalAudit = await db.audit.findUnique({ where: { id: audit.id } });
  console.log('FINAL AUDIT IN DB:');
  console.log('Status:', finalAudit.status);
  console.log('Overall Score:', finalAudit.overallScore);
  console.log('Score Breakdown:', finalAudit.scoreBreakdown);
  console.log('PDF Path:', finalAudit.pdfPath);
  console.log('WhatsApp Status:', finalAudit.whatsappStatus);
  console.log('Executive Summary:', finalAudit.executiveSummary);
}

testPipeline().catch(console.error);

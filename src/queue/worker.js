const { crawlUrl } = require('../crawlers/cheerio-crawler');
const { getPageSpeed } = require('../crawlers/pagespeed');
const { getSearchConsoleData } = require('../crawlers/gsc');
const { validateSchemaOrg } = require('../crawlers/schema-validator');
const { analyzeOnPage } = require('../crawlers/onpage-analyzer');
const { checkRobotsAndSitemap } = require('../crawlers/robots-sitemap');
const { getDataForSEORankings } = require('../crawlers/dataforseo');
const { analyzeWithClaude } = require('../ai/claude');
const { generatePdfReport } = require('../reports/pdf-generator');
const { sendWhatsAppReport } = require('../delivery/twilio');
const { db } = require('../lib/db');

/**
 * Executes the complete 7-step SEO audit pipeline specified in Section 3.2 of the PDF
 */
async function processAuditJob(jobData, progressCallback = () => {}) {
  const { auditId, url, clientId, businessType = 'Dental Clinic', city = 'Pune', state = 'Maharashtra' } = jobData;

  console.log(`\n======================================================`);
  console.log(`[WORKER] Starting Audit Pipeline for: ${url} (Audit ID: ${auditId})`);
  console.log(`======================================================`);

  try {
    // Helper to update progress in DB and BullMQ
    const reportProgress = async (percent, stepName) => {
      console.log(`[PIPELINE] [${percent}%] -> ${stepName}`);
      progressCallback(percent, stepName);
      await db.audit.update({
        where: { id: auditId },
        data: {
          progress: percent,
          currentStep: stepName,
          status: percent === 100 ? 'COMPLETED' : 'PROCESSING'
        }
      });
    };

    await db.audit.update({
      where: { id: auditId },
      data: { startedAt: new Date().toISOString(), status: 'PROCESSING' }
    });

    // --- Step 1: Fetch + Cheerio crawls URL ---
    await reportProgress(12, 'Step 1: Fetch + Cheerio crawls URL');
    const crawlData = await crawlUrl(url);

    // --- Step 2: PageSpeed Insights API (MOCKED) ---
    await reportProgress(24, 'Step 2: PageSpeed Insights API (MOCKED)');
    const cwvData = await getPageSpeed(url);

    // --- Step 3: Google Search Console (MOCKED) ---
    await reportProgress(36, 'Step 3: Google Search Console (MOCKED)');
    const gscData = await getSearchConsoleData(url);

    // --- Step 4: Schema.org validator ---
    await reportProgress(48, 'Step 4: Schema.org validator');
    const schemaData = await validateSchemaOrg(crawlData);

    // --- Step 5: On-page analysis ---
    await reportProgress(60, 'Step 5: On-page analysis');
    const onPageData = await analyzeOnPage(crawlData);

    // --- Step 6: robots.txt + sitemap.xml check ---
    await reportProgress(72, 'Step 6: robots.txt + sitemap.xml check');
    const technicalData = await checkRobotsAndSitemap(url);

    // --- Step 7: DataForSEO rankings (MOCKED) ---
    await reportProgress(82, 'Step 7: DataForSEO rankings (MOCKED)');
    const rankingsData = await getDataForSEORankings(url);

    // --- Claude API: analyse all signals -> structured JSON recommendations (REAL/MOCK) ---
    await reportProgress(88, 'Claude API: analyse all signals -> structured JSON recommendations');
    const claudeResult = await analyzeWithClaude({
      url,
      businessType,
      city,
      state,
      onPageData,
      technicalData,
      cwvData,
      schemaData,
      gscData,
      rankingsData
    });

    // --- Store audit result in Supabase/Neon/DB ---
    await reportProgress(93, 'Supabase/Neon (Postgres): store audit result');
    const updatedAudit = await db.audit.update({
      where: { id: auditId },
      data: {
        overallScore: claudeResult.overall_score,
        scoreBreakdown: claudeResult.score_breakdown,
        criticalIssues: claudeResult.critical_issues,
        importantIssues: claudeResult.important_issues,
        quickWins: claudeResult.quick_wins,
        recommendations: claudeResult.recommendations,
        executiveSummary: claudeResult.executive_summary,
        rawSignals: {
          crawlData,
          cwvData,
          gscData,
          schemaData,
          onPageData,
          technicalData,
          rankingsData
        }
      }
    });

    // --- PDF Report Generator (Puppeteer / PDF) ---
    await reportProgress(97, 'PDF Report Generator (Puppeteer/PDF)');
    const client = clientId ? await db.client.findUnique({ where: { id: clientId } }) : null;
    const pdfResult = await generatePdfReport(updatedAudit, client);

    // --- Twilio WhatsApp -> console.log mock ---
    await reportProgress(99, 'Twilio WhatsApp -> console.log mock');
    const whatsappResult = await sendWhatsAppReport(
      client?.phone || clientId || 'Client-Direct',
      pdfResult.publicUrl,
      claudeResult.overall_score
    );

    // Complete audit
    await db.audit.update({
      where: { id: auditId },
      data: {
        status: 'COMPLETED',
        progress: 100,
        currentStep: 'Audit Completed Successfully',
        pdfPath: pdfResult.publicUrl,
        whatsappStatus: whatsappResult.status,
        completedAt: new Date().toISOString()
      }
    });

    console.log(`[WORKER] SUCCESS: Audit ${auditId} completed! Overall Score: ${claudeResult.overall_score}/100`);
    console.log(`[WORKER] PDF Generated: ${pdfResult.publicUrl}`);
    console.log(`======================================================\n`);

    return {
      success: true,
      auditId,
      overallScore: claudeResult.overall_score,
      pdfPath: pdfResult.publicUrl
    };
  } catch (error) {
    console.error(`[WORKER ERROR] Pipeline failed for Audit ${auditId}:`, error);
    await db.audit.update({
      where: { id: auditId },
      data: {
        status: 'FAILED',
        errorMessage: error.message,
        currentStep: `Failed: ${error.message}`
      }
    });
    throw error;
  }
}

// Standalone BullMQ Worker process if run via `npm run worker`
if (require.main === module) {
  const { Worker } = require('bullmq');
  const redisUrl = process.env.UPSTASH_REDIS_URL || process.env.REDIS_URL;

  console.log('[BullMQ Worker] Initializing seo-audit-jobs worker...');

  if (redisUrl) {
    try {
      const worker = new Worker(
        'seo-audit-jobs',
        async (job) => {
          return await processAuditJob(job.data, (progress, step) => {
            job.updateProgress({ progress, step });
          });
        },
        {
          connection: { url: redisUrl },
          concurrency: 2
        }
      );

      worker.on('completed', (job) => {
        console.log(`[BullMQ Worker] Job ${job.id} has completed.`);
      });

      worker.on('failed', (job, err) => {
        console.error(`[BullMQ Worker] Job ${job.id} failed:`, err.message);
      });

      console.log('[BullMQ Worker] Connected to Redis queue and listening for jobs.');
    } catch (e) {
      console.error('[BullMQ Worker Init Error]:', e.message);
    }
  } else {
    console.log('[BullMQ Worker] No REDIS_URL configured. Standalone worker idling in mock mode.');
  }
}

module.exports = { processAuditJob };

const { Queue } = require('bullmq');
const { processAuditJob } = require('./worker');

const QUEUE_NAME = 'seo-audit-jobs';
const redisUrl = process.env.UPSTASH_REDIS_URL || process.env.REDIS_URL;

let bullQueue = null;

if (redisUrl && !redisUrl.includes('placeholder')) {
  try {
    bullQueue = new Queue(QUEUE_NAME, {
      connection: { url: redisUrl }
    });
    console.log(`[BullMQ Queue] Initialized connected to Redis: ${QUEUE_NAME}`);
  } catch (e) {
    console.warn(`[BullMQ Queue Warning] Failed to connect to Redis (${e.message}). Falling back to in-process queue.`);
    bullQueue = null;
  }
}

/**
 * Enqueue an SEO audit job
 * Matches Section 3.2: BullMQ QUEUE: seo-audit-jobs [Upstash Redis (serverless)]
 */
async function enqueueAuditJob(jobData) {
  const jobId = `job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  if (bullQueue) {
    try {
      const job = await bullQueue.add('audit-website', jobData, {
        jobId,
        removeOnComplete: false,
        attempts: 2
      });
      console.log(`[BullMQ] Enqueued job ${job.id} on queue ${QUEUE_NAME}`);
      return {
        jobId: job.id,
        queue: QUEUE_NAME,
        mode: 'bullmq-redis'
      };
    } catch (e) {
      console.warn('[BullMQ Warning] Enqueue failed via Redis, running via async pipeline:', e.message);
    }
  }

  // Resilient In-Process Queue Fallback (ensures 100% functionality even before user configures Upstash Redis)
  console.log(`[Queue Runner] Processing job ${jobId} asynchronously...`);
  setTimeout(async () => {
    try {
      await processAuditJob(jobData);
    } catch (err) {
      console.error(`[In-Process Job Error] Job ${jobId} failed:`, err.message);
    }
  }, 100);

  return {
    jobId,
    queue: QUEUE_NAME,
    mode: 'in-process-bullmq-fallback'
  };
}

module.exports = {
  QUEUE_NAME,
  enqueueAuditJob,
  getBullQueue: () => bullQueue
};

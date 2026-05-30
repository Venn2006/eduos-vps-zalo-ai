import { Worker } from "bullmq";
import IORedis from "ioredis";
import { logger } from "@eduos/logger";
import { QueueNames } from "@eduos/shared";

const redisConnection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

logger.info("Initializing BullMQ Workers...");

const queues = [
  QueueNames.ZALO_OUTBOX,
  QueueNames.ZALO_INBOUND,
  QueueNames.FACEBOOK_INBOUND,
  QueueNames.SCHEDULED_TASKS,
  QueueNames.AI_PROCESSING
];

const workers: Worker[] = [];

for (const queue of queues) {
  const worker = new Worker(queue, async job => {
    logger.info(`Processing job ${job.id} from queue ${queue}`, { data: job.data });
    // TODO: Implement real job processing
  }, { connection: redisConnection });
  
  worker.on("completed", job => {
    logger.info(`Job ${job.id} completed in ${queue}`);
  });
  
  worker.on("failed", (job, err) => {
    logger.error(`Job ${job?.id} failed in ${queue}`, { error: err.message });
  });

  workers.push(worker);
  logger.info(`Initialized worker for queue: ${queue}`);
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, closing workers...");
  await Promise.all(workers.map(w => w.close()));
  process.exit(0);
});

import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';
import { SentinelProcessor, type JobHandler } from 'nestjs-sentinel';

interface ExampleJobData {
  message?: string;
}

/**
 * Example processor that only writes to the log; copy it to create your own.
 */
@SentinelProcessor('default')
export class ExampleProcessor implements JobHandler<ExampleJobData> {
  private readonly logger = new Logger(ExampleProcessor.name);

  handle(job: Job<ExampleJobData>): Promise<void> {
    this.logger.log(job.data.message ?? `Job ${job.id} executed`);

    return Promise.resolve();
  }
}

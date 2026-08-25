import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { SentinelModule } from 'nestjs-sentinel';
import queueConfig from '@/config/QueueConfig';
import { ProcessorsModule } from '@/queue/processors/processors.module';

@Module({
  imports: [SentinelModule.forRoot(queueConfig(true)), ProcessorsModule],
})
class WorkerBootstrapModule {}

/**
 * Process that consumes the queues, separate from the API, which only enqueues jobs.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(WorkerBootstrapModule);

  app.enableShutdownHooks();
}

void bootstrap();

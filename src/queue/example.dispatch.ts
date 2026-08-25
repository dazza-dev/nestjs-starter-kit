import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { Logger, Module } from '@nestjs/common';
import { QueueRegistry, SentinelModule } from 'nestjs-sentinel';
import queueConfig from '@/config/QueueConfig';

@Module({ imports: [SentinelModule.forRoot(queueConfig(false))] })
class DispatchModule {}

/**
 * Queues an example job (copy it and delete it) with `npx tsx src/queue/example.dispatch.ts`.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(DispatchModule, {
    logger: ['log', 'warn', 'error'],
  });

  const message = process.argv[2] ?? 'hello';

  await app.get(QueueRegistry).dispatch('default', 'example', { message });

  new Logger('ExampleDispatch').log('Job queued.');

  await app.close();
}

void bootstrap();

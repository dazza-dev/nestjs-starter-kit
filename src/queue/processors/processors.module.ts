import { Module } from '@nestjs/common';
import { ExampleProcessor } from '@/queue/processors/example.processor';

/**
 * What the worker process loads; the API must never import it.
 */
@Module({
  providers: [ExampleProcessor],
})
export class ProcessorsModule {}

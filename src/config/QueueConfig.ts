import { basicAuth, type SentinelOptions } from 'nestjs-sentinel';

/**
 * Configuration for the queues, supervisors and panel.
 */
export default (worker: boolean): SentinelOptions => ({
  name: process.env.APP_NAME || 'NestJS Starter',

  connection: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT ?? 6379),
    password:
      process.env.REDIS_PASSWORD && process.env.REDIS_PASSWORD !== 'null'
        ? process.env.REDIS_PASSWORD
        : undefined,
    db: Number(process.env.REDIS_DB ?? 0),
  },

  // Distinguishes the process that consumes jobs from the one that only queues them.
  worker,

  // A long job must not delay the short ones, so they run in separate supervisors.
  supervisors: {
    'supervisor-fast': {
      queues: ['default', 'mail', 'notifications'],
      concurrency: 5,
    },
    'supervisor-heavy': {
      queues: ['reports'],
      concurrency: 1,
      timeoutSeconds: 300,
    },
  },

  // Concurrency is per queue, not per supervisor: add them up when sizing the DB pool.
  environments: {
    production: {
      'supervisor-fast': { concurrency: 10 },
    },
  },

  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: 500,
    removeOnFail: 5000,
  },

  // A stuck job holds a concurrency slot forever.
  timeoutSeconds: 60,

  // Keeps noisy jobs out of the completed list, while failures stay visible.
  silenced: [],
  silencedTags: [],

  // Retention by age, in minutes, alongside removeOnComplete, which caps by count.
  trim: { completed: 60, failed: 60 * 24 * 7 },

  // Warns when a queue builds up a backlog; the project decides how to notify.
  waits: { default: 60 },

  metrics: {
    // Shorter than the 300s default so the charts fill up while testing.
    snapshotIntervalSeconds: 60,
  },

  board: {
    path: '/sentinel',
    title: process.env.APP_NAME || 'NestJS Starter',
    auth: basicAuth({
      username: process.env.SENTINEL_USER ?? '',
      password: process.env.SENTINEL_PASSWORD ?? '',
    }),
  },
});

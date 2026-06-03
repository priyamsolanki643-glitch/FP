import Redis from 'ioredis';
import { env } from './env';

// Initialize Redis client (used for caching and state lock mechanism)
export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableOfflineQueue: false,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

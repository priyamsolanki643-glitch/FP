import { z } from 'zod';
import * as dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000'),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_KEY: z.string(),
  REDIS_URL: z.string().url(),
  AI_PROVIDER_KEY: z.string(),
  SYSTEM_REALISM_MODE: z.enum(['BRUTAL_EXPLICIT', 'SAFE']).default('BRUTAL_EXPLICIT'),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.warn("⚠️ Warning: Environment variables missing or invalid. Using defaults for safe startup.", parsed.error.format());
}

export const env = parsed.success ? parsed.data : {
  PORT: process.env.PORT || '8000',
  SUPABASE_URL: process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY || 'placeholder',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  AI_PROVIDER_KEY: process.env.AI_PROVIDER_KEY || '',
  SYSTEM_REALISM_MODE: 'BRUTAL_EXPLICIT' as const,
};

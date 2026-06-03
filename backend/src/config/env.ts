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

export const env = envSchema.parse(process.env);

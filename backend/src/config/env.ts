/**
 * FP-OS :: Environment Configuration
 * Reads directly from process.env with safe fallbacks.
 * Server starts regardless of missing vars.
 */

export const env = {
  PORT: process.env.PORT || '8080',
  AI_PROVIDER_KEY: process.env.AI_PROVIDER_KEY || '',
  SYSTEM_REALISM_MODE: (process.env.SYSTEM_REALISM_MODE as 'BRUTAL_EXPLICIT' | 'SAFE') || 'BRUTAL_EXPLICIT',
};

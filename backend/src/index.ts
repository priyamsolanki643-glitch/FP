import './utils/env';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { interactionRoutes } from './routes/interaction.routes';
import { authRoutes } from './routes/auth.routes';
import { threadRoutes } from './routes/thread.routes';
import { DbService } from './services/db.service';
import { VectorService } from './services/vector.service';
import { WebSocketService } from './services/websocket.service';
import { requireIdempotency } from './middleware/idempotency.middleware';

const app = new Hono();

// Global crash handlers to prevent Cloud Run from failing health checks
process.on('uncaughtException', (err) => {
  console.error('CRITICAL UNCAUGHT EXCEPTION:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('CRITICAL UNHANDLED REJECTION:', reason);
});

// Enable CORS for all routes so Vercel frontend can connect
app.use('*', cors());
app.use('*', requireIdempotency);

// Global Error Handler to intercept LLM Quota / 429 Errors
app.onError((err: any, c) => {
  console.error('Global Route Error:', err);
  const msg: string = err.message || '';
  return c.json({ success: false, message: `Something went wrong: ${msg}` }, 503);
});


app.get('/', (c) => c.text('FP-OS Core Runtime Active'));
app.get('/health', (c) => c.json({ status: 'ok' }));

// Mount specific domains
app.route('/api/v1/interaction', interactionRoutes);
app.route('/api/v1/auth', authRoutes);
app.route('/api/v1/threads', threadRoutes);

// Cloud Run sets PORT env var to 8080 — always read directly from process.env
const PORT = process.env.PORT || 8080;

console.log(`Starting FP-OS Backend...`);

// Initialize database, vector storage & seeding
DbService.init().catch(console.error);
VectorService.init().catch(console.error);

const server = serve({
  fetch: app.fetch,
  port: Number(PORT),
  hostname: '0.0.0.0'
}, () => {
  console.log(`Server running on port ${PORT}`);
});

// Attach WebSocket Server
WebSocketService.init(server);




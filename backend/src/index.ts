import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { interactionRoutes } from './routes/interaction.routes';
import { DbService } from './services/db.service';

const app = new Hono();

// Enable CORS for all routes so Vercel frontend can connect
app.use('*', cors());

app.get('/', (c) => c.text('FP-OS Core Runtime Active'));
app.get('/health', (c) => c.json({ status: 'ok' }));

// Mount specific domains
app.route('/api/v1/interaction', interactionRoutes);

// Cloud Run sets PORT env var to 8080 — always read directly from process.env
const port = parseInt(process.env.PORT || '8080', 10);

console.log(`Starting FP-OS Backend on port ${port}...`);

// Initialize database & seeding
DbService.init().catch(console.error);

serve({
  fetch: app.fetch,
  port,
  hostname: '0.0.0.0'
});


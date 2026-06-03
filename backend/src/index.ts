import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { env } from './config/env';
import { interactionRoutes } from './routes/interaction.routes';

const app = new Hono();

// Enable CORS for all routes so Vercel frontend can connect
app.use('*', cors());

app.get('/', (c) => c.text('FP-OS Core Runtime Active'));

// Mount specific domains
app.route('/api/v1/interaction', interactionRoutes);

const port = parseInt(env.PORT);

console.log(`Starting FP-OS Backend on port ${port}...`);

serve({
  fetch: app.fetch,
  port
});

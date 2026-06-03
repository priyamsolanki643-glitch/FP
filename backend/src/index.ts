import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { env } from './config/env';
import { interactionRoutes } from './routes/interaction.routes';

const app = new Hono();

app.get('/', (c) => c.text('FP-OS Core Runtime Active'));

// Mount specific domains
app.route('/api/v1/interaction', interactionRoutes);

const port = parseInt(env.PORT);

console.log(`Starting FP-OS Backend on port ${port}...`);

serve({
  fetch: app.fetch,
  port
});

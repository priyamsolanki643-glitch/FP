import { MiddlewareHandler } from 'hono';
import { DbService } from '../services/db.service';

export const requireAuth: MiddlewareHandler<{ Variables: { userId: string; userLanguage: string; userName: string } }> = async (c, next) => {
  const authHeader = c.req.header('Authorization');
  const anonId = c.req.header('X-Anonymous-Id');
  if (anonId && (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.includes('undefined'))) {
    c.set('userId', `anon_${anonId}`);
    c.set('userLanguage', 'English');
    c.set('userGender', 'Unknown');
    await next();
    return;
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Access denied: missing authentication token.' }, 401);
  }

  const token = authHeader.slice(7).trim();

  if (!token || token === 'undefined' || token === 'null') {
    return c.json({ error: 'Access denied: token is literal undefined or null.' }, 401);
  }

  try {
    if (!DbService.supabase) {
      return c.json({ error: 'Access denied: DbService.supabase is not initialized. Check SUPABASE_URL and KEY in backend env.' }, 500);
    }

    const { data: { user }, error } = await DbService.supabase.auth.getUser(token);

    if (error) {
      console.error('Supabase Auth Error:', error);
      return c.json({ error: `Access denied: Supabase error: ${error.message}` }, 401);
    }

    if (!user) {
      return c.json({ error: 'Access denied: user not found for this token.' }, 401);
    }

    c.set('userId', user.id);
    
    // Extract language and gender from Supabase user_metadata if it exists
    const language = user.user_metadata?.preferred_language || 'Hinglish';
    const gender = user.user_metadata?.gender || 'Unknown';
    c.set('userLanguage', language);
    // Extract user's display name for AI personalization
    const userName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || '';
    c.set('userName', userName);
    c.set('userGender', gender);
    
    await next();
  } catch (error: any) {
    console.error('Auth Exception:', error);
    return c.json({ error: `Access denied: exception: ${error?.message || String(error)}` }, 401);
  }
};

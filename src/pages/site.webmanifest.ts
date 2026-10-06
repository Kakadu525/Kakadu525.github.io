import type { APIRoute } from 'astro';
import { webManifest } from '../lib/icons';

export const GET: APIRoute = () =>
  new Response(JSON.stringify(webManifest(), null, 2), { headers: { 'Content-Type': 'application/manifest+json' } });

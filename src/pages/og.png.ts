import type { APIRoute } from 'astro';
import { homeCard, renderOgPng } from '../lib/og';

export const GET: APIRoute = async () =>
  new Response(new Uint8Array(await renderOgPng(homeCard)), { headers: { 'Content-Type': 'image/png' } });

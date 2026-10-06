import type { APIRoute } from 'astro';
import { ICONS, renderIconPng, type IconSpec } from '../../lib/icons';

export function getStaticPaths() {
  return ICONS.map((icon) => ({ params: { icon: icon.name }, props: { icon } }));
}

export const GET: APIRoute<{ icon: IconSpec }> = async ({ props }) =>
  new Response(new Uint8Array(await renderIconPng(props.icon)), { headers: { 'Content-Type': 'image/png' } });

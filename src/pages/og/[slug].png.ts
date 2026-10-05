import type { APIRoute } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import { projectCard, renderOgPng } from '../../lib/og';

export async function getStaticPaths() {
  const projects = await getCollection('projects');
  return projects.map((project) => ({ params: { slug: project.id }, props: { project } }));
}

export const GET: APIRoute<{ project: CollectionEntry<'projects'> }> = async ({ props }) => {
  const { project } = props;
  const png = await renderOgPng(projectCard({ id: project.id, ...project.data }));
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};

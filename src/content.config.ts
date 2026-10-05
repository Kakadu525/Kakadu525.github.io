import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      order: z.number().int(),
      featured: z.boolean().default(false),
      label: z.enum(['repo', 'bot', 'tool']),
      conf: z.number().min(0.5).max(1),
      summary: z.string(),
      tag: z.string(),
      badge: z.string().optional(),
      stack: z.array(z.string()).min(1),
      year: z.number().int(),
      repo: z.url().optional(),
      links: z.array(z.object({ label: z.string(), href: z.url() })).default([]),
      preview: z.enum(['scorer', 'toolbox', 'wallet', 'mm', 'clicks']),
      screenshot: z.object({ src: image(), alt: z.string() }).optional(),
      // GIF лежит в public/: оптимизатор Astro превратил бы анимацию в статичную картинку.
      animation: z
        .object({ src: z.string().startsWith('/'), alt: z.string(), width: z.number(), height: z.number() })
        .optional(),
      features: z.array(z.string()).default([]),
    }),
});

export const collections = { projects };

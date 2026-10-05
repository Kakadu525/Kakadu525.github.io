import { XMLParser } from 'fast-xml-parser';

// Файл импортирует напрямую Node 24 из scripts/fetch-habr.mjs, поэтому здесь только стираемый
// синтаксис TypeScript и нет относительных импортов.

export interface Article {
  id: string;
  title: string;
  url: string;
  date: string;
  hubs: string[];
  readingMinutes: number | null;
}

export type FeedItem = Omit<Article, 'readingMinutes'>;

// Хабр кладёт в <category> сначала хабы, потом теги. Первые два почти всегда хабы.
const HUBS_SHOWN = 2;

interface RawItem {
  title?: unknown;
  guid?: unknown;
  pubDate?: unknown;
  category?: unknown[];
}

export function parseHabrRss(xml: string): FeedItem[] {
  const parser = new XMLParser({
    ignoreAttributes: true,
    parseTagValue: false,
    isArray: (name) => name === 'item' || name === 'category',
  });
  const doc = parser.parse(xml);
  const items: RawItem[] = doc?.rss?.channel?.item ?? [];

  return items.map((item) => {
    const guid = String(item.guid ?? '').trim();
    const id = guid.match(/\/articles\/(\d+)\/?$/)?.[1];
    if (!id) throw new Error(`habr rss: в guid нет id статьи: "${guid}"`);

    const pubDate = String(item.pubDate ?? '').trim();
    const ms = Date.parse(pubDate);
    if (Number.isNaN(ms)) throw new Error(`habr rss: не разобрать pubDate "${pubDate}" у статьи ${id}`);

    return {
      id,
      title: String(item.title ?? '').trim(),
      url: `https://habr.com/ru/articles/${id}/`,
      date: new Date(ms).toISOString(),
      hubs: (item.category ?? []).slice(0, HUBS_SHOWN).map((c) => String(c).trim()),
    };
  });
}

export function parseReadingTime(html: string): number | null {
  const match = html.match(/reading-time__label"[^>]*>\s*(\d+)\s*мин/);
  return match ? Number(match[1]) : null;
}

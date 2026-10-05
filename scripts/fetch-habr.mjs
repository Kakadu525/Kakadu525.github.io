// Забирает статьи из RSS Хабра в src/data/articles.json.
// Ошибка сети не валит сборку: остаётся прошлый закоммиченный файл, и сайт собирается со старым списком.
import { writeFile } from 'node:fs/promises';
import { parseHabrRss, parseReadingTime } from '../src/lib/habr.ts';

const FEED = 'https://habr.com/ru/rss/users/MedSurg/publications/articles/?fl=ru';
const OUT = new URL('../src/data/articles.json', import.meta.url);
const HEADERS = { 'user-agent': 'kakadu525-site/1.0 (+https://kakadu525.github.io/)' };

async function get(url) {
  const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`${url} ответил HTTP ${res.status}`);
  return res.text();
}

try {
  const items = parseHabrRss(await get(FEED));
  if (items.length === 0) throw new Error('лента пустая, проверь ник в FEED');

  const articles = [];
  for (const item of items) {
    let readingMinutes = null;
    try {
      readingMinutes = parseReadingTime(await get(item.url));
    } catch (err) {
      console.warn(`habr: нет времени чтения для ${item.url}: ${err.message}`);
    }
    articles.push({ ...item, readingMinutes });
  }

  await writeFile(OUT, `${JSON.stringify(articles, null, 2)}\n`);
  console.log(`habr: сохранено статей: ${articles.length}`);
} catch (err) {
  console.warn(`habr: статьи не обновлены, остаётся прошлый articles.json. Причина: ${err.message}`);
}

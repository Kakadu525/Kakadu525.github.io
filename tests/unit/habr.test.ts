import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseHabrRss, parseReadingTime } from '../../src/lib/habr';

const rss = readFileSync(new URL('../fixtures/habr-rss.xml', import.meta.url), 'utf8');

describe('parseHabrRss', () => {
  const items = parseHabrRss(rss);

  it('находит обе статьи в порядке ленты', () => {
    expect(items.map((i) => i.id)).toEqual(['1089530', '1088564']);
  });

  it('берёт чистый url из guid без utm-меток', () => {
    expect(items[0].url).toBe('https://habr.com/ru/articles/1089530/');
  });

  it('сохраняет заголовок с кавычками-ёлочками', () => {
    expect(items[0].title).toBe('Первый иск за «сбежавших» ИИ-агентов: кто отвечает, если агент сам взломал чужую систему');
  });

  it('переводит pubDate в ISO', () => {
    expect(items[1].date).toBe('2026-09-30T12:31:16.000Z');
  });

  it('оставляет два первых хаба', () => {
    expect(items[1].hubs).toEqual(['Python', 'Тестирование IT-систем']);
  });

  it('пустая лента даёт пустой список', () => {
    expect(parseHabrRss('<rss><channel><title>x</title></channel></rss>')).toEqual([]);
  });

  it('падает с понятной ошибкой, если в guid нет id', () => {
    const broken = rss.replace('https://habr.com/ru/articles/1089530/</guid>', 'https://habr.com/ru/news/</guid>');
    expect(() => parseHabrRss(broken)).toThrow('в guid нет id статьи');
  });

  it('падает с понятной ошибкой на кривой дате', () => {
    const broken = rss.replace('Fri, 02 Oct 2026 09:24:41 GMT', 'вчера');
    expect(() => parseHabrRss(broken)).toThrow('не разобрать pubDate "вчера"');
  });
});

describe('parseReadingTime', () => {
  it('находит время чтения в разметке Хабра', () => {
    expect(parseReadingTime('<span class="tm-article-reading-time__label">7 мин</span>')).toBe(7);
  });
  it('терпит дополнительные атрибуты', () => {
    expect(parseReadingTime('<span class="tm-article-reading-time__label" data-v-03448ddf>12 мин</span>')).toBe(12);
  });
  it('возвращает null, если метки нет', () => {
    expect(parseReadingTime('<html></html>')).toBeNull();
  });
});

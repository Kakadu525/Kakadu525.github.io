import { describe, expect, it } from 'vitest';
import { formatAgo, formatClock, formatRuDate, pluralRu } from '../../src/lib/format';

describe('formatClock', () => {
  it('ноль', () => expect(formatClock(0)).toBe('00:00:00'));
  it('секунды отбрасывают миллисекунды', () => expect(formatClock(59_999)).toBe('00:00:59'));
  it('часы, минуты, секунды', () => expect(formatClock((2 * 3600 + 3 * 60 + 4) * 1000)).toBe('02:03:04'));
  it('отрицательное время считается нулём', () => expect(formatClock(-5000)).toBe('00:00:00'));
});

describe('formatRuDate', () => {
  it('форматирует дату публикации', () => {
    expect(formatRuDate('2026-10-02T09:24:41.000Z')).toBe('2 окт 2026');
  });
  it('считает день по Москве, а не по UTC', () => {
    expect(formatRuDate('2026-09-30T22:30:00.000Z')).toBe('1 окт 2026');
  });
  it('май в родительном падеже', () => {
    expect(formatRuDate('2026-05-09T10:00:00.000Z')).toBe('9 мая 2026');
  });
  it('падает на мусоре с понятной ошибкой', () => {
    expect(() => formatRuDate('вчера')).toThrow('formatRuDate: не дата "вчера"');
  });
});

describe('pluralRu', () => {
  const forms = ['статья', 'статьи', 'статей'] as const;
  it.each([
    [1, 'статья'], [2, 'статьи'], [4, 'статьи'], [5, 'статей'], [11, 'статей'],
    [12, 'статей'], [14, 'статей'], [21, 'статья'], [22, 'статьи'], [25, 'статей'],
    [0, 'статей'], [111, 'статей'], [101, 'статья'],
  ])('%i → %s', (n, expected) => {
    expect(pluralRu(n, forms)).toBe(expected);
  });
});

describe('formatAgo', () => {
  const now = Date.parse('2026-10-05T12:00:00Z');
  const minutes = (m: number) => now - m * 60_000;
  it('меньше минуты', () => expect(formatAgo(minutes(0.5), now)).toBe('только что'));
  it('минуты', () => expect(formatAgo(minutes(42), now)).toBe('42 мин назад'));
  it('часы', () => expect(formatAgo(minutes(125), now)).toBe('2 ч назад'));
  it('дни', () => expect(formatAgo(minutes(60 * 50), now)).toBe('2 дн назад'));
  it('время из будущего считается как «только что»', () => {
    expect(formatAgo(now + 60_000, now)).toBe('только что');
  });
});

const MONTHS = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
// Хабр отдаёт время в GMT, а читатели в основном живут по Москве: статья в 01:30 МСК
// должна показываться следующим днём.
const MOSCOW_OFFSET_MS = 3 * 60 * 60 * 1000;

export function formatRuDate(iso: string): string {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) throw new Error(`formatRuDate: не дата "${iso}"`);
  const d = new Date(ms + MOSCOW_OFFSET_MS);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function pluralRu(n: number, forms: readonly [string, string, string]): string {
  const lastTwo = Math.abs(n) % 100;
  const last = lastTwo % 10;
  if (lastTwo > 10 && lastTwo < 20) return forms[2];
  if (last === 1) return forms[0];
  if (last >= 2 && last <= 4) return forms[1];
  return forms[2];
}

export function formatAgo(fromMs: number, nowMs: number): string {
  const minutes = Math.floor(Math.max(0, nowMs - fromMs) / 60_000);
  if (minutes < 1) return 'только что';
  if (minutes < 60) return `${minutes} мин назад`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ч назад`;
  return `${Math.floor(hours / 24)} дн назад`;
}

export function formatClock(ms: number): string {
  const total = Math.floor(Math.max(0, ms) / 1000);
  const two = (n: number) => String(n).padStart(2, '0');
  return `${two(Math.floor(total / 3600))}:${two(Math.floor(total / 60) % 60)}:${two(total % 60)}`;
}

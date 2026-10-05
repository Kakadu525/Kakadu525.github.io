import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { woffToSfnt } from '../../src/lib/woff';

const woffPath = join(process.cwd(), 'node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-cyrillic-400-normal.woff');

describe('woffToSfnt', () => {
  const woff = readFileSync(woffPath);
  const sfnt = woffToSfnt(woff);

  it('собирает TrueType с той же сигнатурой и числом таблиц', () => {
    expect(sfnt.readUInt32BE(0)).toBe(woff.readUInt32BE(4));
    expect(sfnt.readUInt16BE(4)).toBe(woff.readUInt16BE(12));
  });

  it('размер совпадает с totalSfntSize из заголовка WOFF', () => {
    expect(sfnt.length).toBe(woff.readUInt32BE(16));
  });

  it('таблицы лежат по смещениям, кратным 4, и не вылезают за конец файла', () => {
    const numTables = sfnt.readUInt16BE(4);
    for (let i = 0; i < numTables; i++) {
      const record = 12 + i * 16;
      const offset = sfnt.readUInt32BE(record + 8);
      const length = sfnt.readUInt32BE(record + 12);
      expect(offset % 4).toBe(0);
      expect(offset + length).toBeLessThanOrEqual(sfnt.length);
    }
  });

  it('отказывается от файлов, которые не WOFF 1.0', () => {
    expect(() => woffToSfnt(Buffer.from('wOF2....'))).toThrow('woffToSfnt: файл не WOFF 1.0');
  });
});

import { inflateSync } from 'node:zlib';

// Распаковывает WOFF 1.0 в обычный TrueType. Satori умеет читать WOFF сам, но делает это через
// fflate, а у нужной ему версии есть уязвимость, и с исправленной версией шрифты не читаются.
// Формат: https://www.w3.org/TR/WOFF/
const WOFF_HEADER = 44;
const WOFF_ENTRY = 20;
const SFNT_HEADER = 12;
const SFNT_ENTRY = 16;

const align4 = (n: number) => (n + 3) & ~3;

export function woffToSfnt(woff: Buffer): Buffer {
  if (woff.length < WOFF_HEADER || woff.toString('ascii', 0, 4) !== 'wOFF') {
    throw new Error('woffToSfnt: файл не WOFF 1.0');
  }
  const flavor = woff.readUInt32BE(4);
  const numTables = woff.readUInt16BE(12);

  const tables = Array.from({ length: numTables }, (_, i) => {
    const entry = WOFF_HEADER + i * WOFF_ENTRY;
    const offset = woff.readUInt32BE(entry + 4);
    const compLength = woff.readUInt32BE(entry + 8);
    const origLength = woff.readUInt32BE(entry + 12);
    const raw = woff.subarray(offset, offset + compLength);
    // Таблица сжата, только если сжатая версия вышла короче исходной.
    const data = compLength < origLength ? inflateSync(raw) : raw;
    if (data.length !== origLength) {
      throw new Error(`woffToSfnt: таблица ${woff.toString('ascii', entry, entry + 4)} распаковалась в ${data.length} байт вместо ${origLength}`);
    }
    return { tag: woff.subarray(entry, entry + 4), checksum: woff.readUInt32BE(entry + 16), data };
  });

  const dataStart = SFNT_HEADER + numTables * SFNT_ENTRY;
  const size = tables.reduce((end, t) => end + align4(t.data.length), dataStart);
  const out = Buffer.alloc(size);

  const entrySelector = Math.floor(Math.log2(numTables));
  const searchRange = 2 ** entrySelector * SFNT_ENTRY;
  out.writeUInt32BE(flavor, 0);
  out.writeUInt16BE(numTables, 4);
  out.writeUInt16BE(searchRange, 6);
  out.writeUInt16BE(entrySelector, 8);
  out.writeUInt16BE(numTables * SFNT_ENTRY - searchRange, 10);

  let offset = dataStart;
  tables.forEach((table, i) => {
    const record = SFNT_HEADER + i * SFNT_ENTRY;
    table.tag.copy(out, record);
    out.writeUInt32BE(table.checksum, record + 4);
    out.writeUInt32BE(offset, record + 8);
    out.writeUInt32BE(table.data.length, record + 12);
    table.data.copy(out, offset);
    offset += align4(table.data.length);
  });
  return out;
}

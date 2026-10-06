import { describe, expect, it } from 'vitest';
import { ICONS, iconSvg, renderIconPng, webManifest } from '../../src/lib/icons';

const pngSize = (png: Buffer) => [png.readUInt32BE(16), png.readUInt32BE(20)];

describe('iconSvg', () => {
  it('квадратный SVG с тёмным фоном', () => {
    const svg = iconSvg();
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('viewBox="0 0 512 512"');
    expect(svg).toContain('fill="#0b0f08"');
  });

  it('maskable-версия сжимает рисунок в безопасную зону, обычная нет', () => {
    expect(iconSvg({ maskable: true })).toMatch(/scale\(0\.\d+\)/);
    expect(iconSvg()).not.toContain('scale(');
  });
});

describe('renderIconPng', () => {
  it.each(ICONS.map((icon) => [icon.name, icon.size]))('%s: PNG %ix%i', async (name, size) => {
    const icon = ICONS.find((i) => i.name === name)!;
    expect(pngSize(await renderIconPng(icon))).toEqual([size, size]);
  });
});

describe('webManifest', () => {
  const manifest = webManifest();

  it('описывает сайт на русском и стартует с главной', () => {
    expect(manifest.lang).toBe('ru');
    expect(manifest.start_url).toBe('/');
    expect(manifest.background_color).toBe('#0b0f08');
  });

  it('содержит иконки 192, 512 и отдельную maskable', () => {
    const sizes = manifest.icons.map((i) => `${i.sizes}:${i.purpose}`);
    expect(sizes).toEqual(expect.arrayContaining(['192x192:any', '512x512:any', '512x512:maskable']));
    for (const icon of manifest.icons) expect(icon.src).toMatch(/^\/icons\/[a-z0-9-]+\.png$/);
  });
});

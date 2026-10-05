import type { TrackSpec } from './detector';

export const VIEW_W = 624;
export const VIEW_H = 240;
export const MOUSE_RANGE = 10;

// Геометрия подобрана так, чтобы рамки и подписи не пересекались при любом положении мыши.
// Тест tests/unit/scene.test.ts это проверяет; при правке координат сначала запусти его.
export const DESK_SCENE: readonly TrackSpec[] = [
  { cls: 'potted plant', x: 22, y: 104, w: 58, h: 96, conf: 0.71, flaky: true },
  { cls: 'laptop', x: 88, y: 124, w: 156, h: 75, conf: 0.95 },
  { cls: 'tv', x: 258, y: 22, w: 184, h: 149, conf: 0.97 },
  { cls: 'keyboard', x: 278, y: 178, w: 155, h: 21, conf: 0.93, labelBelow: true },
  { cls: 'mouse', x: 450, y: 181, w: 24, h: 18, conf: 0.86, labelBelow: true, moving: true, flaky: true },
  { cls: 'cup', x: 497, y: 148, w: 52, h: 48, conf: 0.9 },
  { cls: 'book', x: 555, y: 158, w: 62, h: 41, conf: 0.6, labelBelow: true, flaky: true },
];

// Две синусоиды с разными периодами дают движение без заметного цикла. Сумма амплитуд равна MOUSE_RANGE.
export function mouseOffset(tMs: number): number {
  return 7 * Math.sin(tMs / 650) + 3 * Math.sin(tMs / 230);
}

const CODE_INDENT = [0, 1, 2, 2, 1, 3, 0, 1, 2, 1, 0, 2, 3, 1, 0];
const CODE_WIDTH = [60, 90, 40, 110, 70, 30, 80, 55, 95, 45, 65, 85, 35, 75, 50];
const CODE_LINE_STEP = 7;
export const CODE_LOOP_PX = CODE_WIDTH.length * CODE_LINE_STEP;

export function codeLinesSvg(): string {
  let svg = '';
  for (let copy = 0; copy < 2; copy++) {
    CODE_WIDTH.forEach((width, i) => {
      const indent = CODE_INDENT[i] * 9;
      const y = 36 + (copy * CODE_WIDTH.length + i) * CODE_LINE_STEP;
      const fill = i % 4 === 1 ? '#4f7a22' : '#24361a';
      svg += `<rect x="${272 + indent}" y="${y}" width="${Math.min(width, 150 - indent)}" height="3" fill="${fill}"/>`;
    });
  }
  return svg;
}

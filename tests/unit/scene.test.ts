import { describe, expect, it } from 'vitest';
import { CONF_ABOVE, JITTER, LABEL_CHAR_WIDTH, baseBox, labelRect, type TrackSpec } from '../../src/lib/detector';
import { DESK_SCENE, MOUSE_RANGE, VIEW_H, VIEW_W, codeLinesSvg, mouseOffset } from '../../src/lib/scene';

type Rect = { x: number; y: number; w: number; h: number; owner: string };
const MIN_GAP = 2;

// Самая широкая область, которую объект может занять за всё время: дрожание по всем сторонам
// плюс ход мыши для подвижных объектов. Ширина подписи берётся для максимальной уверенности.
function envelopes(spec: TrackSpec): Rect[] {
  const travel = spec.moving ? MOUSE_RANGE : 0;
  const box = {
    x: spec.x - travel - JITTER,
    y: spec.y - JITTER,
    w: spec.w + 2 * travel + 3 * JITTER,
    h: spec.h + 3 * JITTER,
    owner: spec.cls,
  };
  const label = labelRect({ ...baseBox(spec), conf: Math.min(1, spec.conf + CONF_ABOVE) }, LABEL_CHAR_WIDTH);
  const labelEnv = {
    x: label.x - travel - JITTER,
    y: label.y - (spec.labelBelow ? 2 * JITTER : JITTER),
    w: label.w + 2 * travel + 2 * JITTER,
    h: label.h + (spec.labelBelow ? 4 * JITTER : 2 * JITTER),
    owner: spec.cls,
  };
  return [box, labelEnv];
}

const gapBetween = (a: Rect, b: Rect) =>
  Math.max(b.x - (a.x + a.w), a.x - (b.x + b.w), b.y - (a.y + a.h), a.y - (b.y + b.h));

describe('DESK_SCENE', () => {
  const rects = DESK_SCENE.flatMap(envelopes);

  it('рамки и подписи разных объектов не пересекаются ни при каком положении мыши', () => {
    for (let i = 0; i < rects.length; i++) {
      for (let j = i + 1; j < rects.length; j++) {
        const [a, b] = [rects[i], rects[j]];
        if (a.owner === b.owner) continue;
        expect(gapBetween(a, b), `${a.owner} и ${b.owner}`).toBeGreaterThanOrEqual(MIN_GAP);
      }
    }
  });

  it('всё помещается во viewBox', () => {
    for (const r of rects) {
      expect(r.x, r.owner).toBeGreaterThanOrEqual(0);
      expect(r.y, r.owner).toBeGreaterThanOrEqual(0);
      expect(r.x + r.w, r.owner).toBeLessThanOrEqual(VIEW_W);
      expect(r.y + r.h, r.owner).toBeLessThanOrEqual(VIEW_H);
    }
  });

  it('классы из словаря COCO', () => {
    expect(DESK_SCENE.map((s) => s.cls)).toEqual(['potted plant', 'laptop', 'tv', 'keyboard', 'mouse', 'cup', 'book']);
  });
});

describe('mouseOffset', () => {
  it('не выходит за MOUSE_RANGE', () => {
    for (let t = 0; t < 60_000; t += 7) {
      expect(Math.abs(mouseOffset(t))).toBeLessThanOrEqual(MOUSE_RANGE);
    }
  });
});

describe('codeLinesSvg', () => {
  it('рисует две одинаковые копии строк для бесшовной прокрутки', () => {
    const rects = codeLinesSvg().match(/<rect /g) ?? [];
    expect(rects.length).toBe(30);
  });
});

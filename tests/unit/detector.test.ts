import { describe, expect, it } from 'vitest';
import {
  ACCENT, ACCENT_DIM, CONF_ABOVE, CONF_BELOW, JITTER, LABEL_GAP, LABEL_HEIGHT,
  baseBox, boxesToSvg, createTracks, labelRect, labelText, stepTrack,
  type Rng, type TrackSpec,
} from '../../src/lib/detector';

// Детерминированный генератор, чтобы тесты не зависели от Math.random.
function mulberry32(seed: number): Rng {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const constant = (v: number): Rng => () => v;

const cup: TrackSpec = { cls: 'cup', x: 100, y: 50, w: 40, h: 30, conf: 0.9 };

describe('stepTrack', () => {
  it('уверенность не выходит из коридора за 2000 кадров', () => {
    const rng = mulberry32(1);
    let [track] = createTracks([cup]);
    for (let i = 0; i < 2000; i++) {
      track = stepTrack(track, rng).next;
      expect(track.conf).toBeGreaterThanOrEqual(cup.conf - CONF_BELOW - 1e-9);
      expect(track.conf).toBeLessThanOrEqual(cup.conf + CONF_ABOVE + 1e-9);
    }
  });

  it('дрожание рамки не больше JITTER', () => {
    const rng = mulberry32(2);
    let [track] = createTracks([cup]);
    for (let i = 0; i < 500; i++) {
      const { next, box } = stepTrack(track, rng);
      track = next;
      expect(box).not.toBeNull();
      expect(Math.abs(box!.x - cup.x)).toBeLessThanOrEqual(JITTER);
      expect(Math.abs(box!.y - cup.y)).toBeLessThanOrEqual(JITTER);
      expect(Math.abs(box!.w - cup.w)).toBeLessThanOrEqual(JITTER);
      expect(Math.abs(box!.h - cup.h)).toBeLessThanOrEqual(JITTER);
    }
  });

  it('стабильный объект не пропадает никогда', () => {
    let [track] = createTracks([cup]);
    for (let i = 0; i < 50; i++) {
      const step = stepTrack(track, constant(0));
      expect(step.box).not.toBeNull();
      track = step.next;
    }
  });

  it('нестабильный объект пропадает, когда выпадает малая вероятность', () => {
    const [track] = createTracks([{ ...cup, flaky: true }]);
    const step = stepTrack(track, constant(0));
    expect(step.box).toBeNull();
    expect(step.next.hiddenFrames).toBe(2);
  });

  it('нестабильный объект виден, пока вероятность не выпала', () => {
    let [track] = createTracks([{ ...cup, flaky: true }]);
    for (let i = 0; i < 50; i++) {
      const step = stepTrack(track, constant(0.99));
      expect(step.box).not.toBeNull();
      track = step.next;
    }
  });

  it('скрытый объект возвращается после отсчёта кадров', () => {
    const track = { spec: { ...cup, flaky: true }, conf: 0.9, hiddenFrames: 1 };
    const hidden = stepTrack(track, constant(0.99));
    expect(hidden.box).toBeNull();
    expect(stepTrack(hidden.next, constant(0.99)).box).not.toBeNull();
  });

  it('смещение мыши двигает только подвижные объекты', () => {
    const [still, moving] = createTracks([cup, { ...cup, moving: true }]);
    const mid = constant(0.5);
    expect(stepTrack(still, mid, 8).box!.x).toBe(cup.x);
    expect(stepTrack(moving, mid, 8).box!.x).toBe(cup.x + 8);
  });
});

describe('подписи и SVG', () => {
  it('текст подписи: класс и уверенность с двумя знаками', () => {
    expect(labelText({ ...baseBox(cup), conf: 0.9 })).toBe('cup 0.90');
  });

  it('подпись сверху стоит вплотную над рамкой', () => {
    const r = labelRect(baseBox(cup), 10);
    expect(r).toEqual({ x: cup.x - 0.75, y: cup.y - LABEL_HEIGHT, w: 'cup 0.90'.length * 10 + 8, h: LABEL_HEIGHT });
  });

  it('подпись снизу стоит на LABEL_GAP ниже рамки', () => {
    const r = labelRect(baseBox({ ...cup, labelBelow: true }));
    expect(r.y).toBe(cup.y + cup.h + LABEL_GAP);
  });

  it('уверенная рамка яркая, неуверенная тусклая', () => {
    const svg = boxesToSvg([baseBox(cup), { ...baseBox(cup), conf: 0.6 }]);
    expect(svg).toContain(`stroke="${ACCENT}"`);
    expect(svg).toContain(`stroke="${ACCENT_DIM}"`);
    expect(svg).toContain('>cup 0.90</text>');
    expect(svg).toContain('>cup 0.60</text>');
  });

  it('пустой список даёт пустую строку', () => {
    expect(boxesToSvg([])).toBe('');
  });
});

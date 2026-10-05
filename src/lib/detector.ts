export interface TrackSpec {
  cls: string;
  x: number;
  y: number;
  w: number;
  h: number;
  conf: number;
  labelBelow?: boolean;
  moving?: boolean;
  flaky?: boolean;
}

export interface TrackState {
  spec: TrackSpec;
  conf: number;
  hiddenFrames: number;
}

export interface Box {
  cls: string;
  conf: number;
  x: number;
  y: number;
  w: number;
  h: number;
  labelBelow: boolean;
}

export type Rng = () => number;

export const LABEL_HEIGHT = 15;
// Подпись снизу отодвинута от рамки, чтобы не касаться рамок соседних предметов на столе.
export const LABEL_GAP = 4;
// Ширина символа JetBrains Mono 11px с запасом. В браузере ширина меряется заново.
export const LABEL_CHAR_WIDTH = 6.7;
export const JITTER = 1.1;
export const CONF_BELOW = 0.04;
export const CONF_ABOVE = 0.03;
const CONF_STEP = 0.025;
export const DIM_BELOW = 0.8;
// Цвета дублируют токены --accent и --accent-dim: атрибуты SVG не понимают var().
export const ACCENT = '#9fef00';
export const ACCENT_DIM = '#7d9c32';

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const fmt = (n: number) => n.toFixed(1);

export function createTracks(specs: readonly TrackSpec[]): TrackState[] {
  return specs.map((spec) => ({ spec, conf: spec.conf, hiddenFrames: 0 }));
}

export function baseBox(spec: TrackSpec): Box {
  return { cls: spec.cls, conf: spec.conf, x: spec.x, y: spec.y, w: spec.w, h: spec.h, labelBelow: Boolean(spec.labelBelow) };
}

export function stepTrack(track: TrackState, rng: Rng, offsetX = 0): { next: TrackState; box: Box | null } {
  const { spec } = track;
  const conf = clamp(track.conf + (rng() - 0.5) * CONF_STEP, spec.conf - CONF_BELOW, spec.conf + CONF_ABOVE);

  let hiddenFrames = track.hiddenFrames;
  if (spec.flaky && hiddenFrames <= 0) {
    // Совсем неуверенные объекты теряются чаще, как у настоящего детектора около порога.
    const dropChance = spec.conf < 0.7 ? 0.03 : 0.012;
    if (rng() < dropChance) hiddenFrames = 3 + Math.floor(rng() * 7);
  }
  if (hiddenFrames > 0) {
    return { next: { spec, conf, hiddenFrames: hiddenFrames - 1 }, box: null };
  }

  const jitter = () => (rng() - 0.5) * 2 * JITTER;
  const box: Box = {
    cls: spec.cls,
    conf,
    x: spec.x + (spec.moving ? offsetX : 0) + jitter(),
    y: spec.y + jitter(),
    w: spec.w + jitter(),
    h: spec.h + jitter(),
    labelBelow: Boolean(spec.labelBelow),
  };
  return { next: { spec, conf, hiddenFrames: 0 }, box };
}

export function labelText(box: Box): string {
  return `${box.cls} ${box.conf.toFixed(2)}`;
}

export function labelRect(box: Box, charWidth = LABEL_CHAR_WIDTH) {
  return {
    x: box.x - 0.75,
    y: box.labelBelow ? box.y + box.h + LABEL_GAP : box.y - LABEL_HEIGHT,
    w: labelText(box).length * charWidth + 8,
    h: LABEL_HEIGHT,
  };
}

export function boxesToSvg(boxes: readonly Box[], charWidth = LABEL_CHAR_WIDTH): string {
  return boxes
    .map((box) => {
      const color = box.conf >= DIM_BELOW ? ACCENT : ACCENT_DIM;
      const label = labelRect(box, charWidth);
      return (
        `<rect x="${fmt(box.x)}" y="${fmt(box.y)}" width="${fmt(box.w)}" height="${fmt(box.h)}" fill="none" stroke="${color}" stroke-width="1.5"/>` +
        `<rect x="${fmt(label.x)}" y="${fmt(label.y)}" width="${fmt(label.w)}" height="${label.h}" fill="${color}"/>` +
        `<text class="det-label" x="${fmt(box.x + 3.5)}" y="${fmt(label.y + 11)}">${labelText(box)}</text>`
      );
    })
    .join('');
}

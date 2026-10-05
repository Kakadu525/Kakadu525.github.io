import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import satori from 'satori';
import sharp from 'sharp';
import { site } from '../data/site';
import { woffToSfnt } from './woff';

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;
const HOST = 'kakadu525.github.io';
const MAX_CHIPS = 5;

// Цвета дублируют токены из global.css: satori не читает CSS-переменные.
const C = {
  bg: '#0b0f08',
  line: '#1c2617',
  lineStrong: '#2a3a1f',
  corner: '#34482a',
  bright: '#f2f7ee',
  body: '#a9b8a0',
  faint: '#5f6d57',
  accent: '#9fef00',
  onAccent: '#0b0f08',
  danger: '#ff6b5e',
};

export interface OgCard {
  label: string;
  conf: number;
  title: string;
  status?: string;
  lead?: string;
  text: string;
  chips: readonly string[];
  path: string;
}

export interface OgNode {
  type: string;
  props: { style?: Record<string, string | number>; children?: OgNode | string | (OgNode | string)[] };
}

const el = (style: Record<string, string | number>, children?: OgNode['props']['children']): OgNode => ({
  type: 'div',
  props: { style: { display: 'flex', ...style }, children },
});

export const homeCard: OgCard = {
  label: 'person',
  conf: 0.99,
  title: site.name,
  status: site.status,
  lead: 'C++ и Python разработчик',
  text: 'Десктоп на WinAPI, бэкенды на FastAPI, инструменты для проверки кода от нейросетей.',
  chips: site.stack,
  path: '/',
};

export function projectCard(project: {
  id: string;
  label: string;
  conf: number;
  title: string;
  summary: string;
  stack: readonly string[];
}): OgCard {
  return {
    label: project.label,
    conf: project.conf,
    title: project.title,
    text: project.summary,
    chips: project.stack,
    path: `/projects/${project.id}/`,
  };
}

// В подмножествах шрифта нет знака ●, поэтому точка рисуется кругом.
const dot = (color: string): OgNode => el({ width: 12, height: 12, borderRadius: 6, backgroundColor: color });

function corner(position: Record<string, number>, sides: string[]): OgNode {
  const borders = Object.fromEntries(sides.map((side) => [`border${side}`, `3px solid ${C.corner}`]));
  return el({ position: 'absolute', width: 40, height: 40, ...position, ...borders });
}

export function ogTree(card: OgCard): OgNode {
  const isHome = card.path === '/';
  const address = isHome ? HOST : `${HOST}${card.path.replace(/\/$/, '')}`;

  return el(
    {
      width: OG_WIDTH, height: OG_HEIGHT, position: 'relative', flexDirection: 'column',
      padding: '56px 72px', backgroundColor: C.bg, fontFamily: 'JetBrains Mono', color: C.body,
    },
    [
      corner({ top: 24, left: 24 }, ['Top', 'Left']),
      corner({ top: 24, right: 24 }, ['Top', 'Right']),
      corner({ bottom: 24, left: 24 }, ['Bottom', 'Left']),
      corner({ bottom: 24, right: 24 }, ['Bottom', 'Right']),

      el({ justifyContent: 'space-between', fontSize: 22, color: C.faint }, [
        el({ alignItems: 'center', gap: 14 }, [dot(C.danger), el({ color: C.danger }, 'rec'), address]),
        'cam0 · min conf 0.50',
      ]),

      el({ flex: 1, flexDirection: 'column', justifyContent: 'center' }, [
        el({ alignItems: 'flex-end', gap: 28, marginBottom: 32 }, [
          el({ position: 'relative', marginTop: 40, padding: '14px 32px', border: `4px solid ${C.accent}` }, [
            el(
              { position: 'absolute', top: -42, left: -4, padding: '4px 12px', backgroundColor: C.accent, color: C.onAccent, fontSize: 24 },
              `${card.label} ${card.conf.toFixed(2)}`,
            ),
            el({ fontSize: isHome ? 96 : 68, fontWeight: 500, color: C.bright, lineHeight: 1.1 }, card.title),
          ]),
          ...(card.status
            ? [el({ alignItems: 'center', gap: 12, marginBottom: 6, padding: '8px 16px', border: `2px solid ${C.lineStrong}`, color: C.accent, fontSize: 24 }, [dot(C.accent), card.status])]
            : []),
        ]),
        ...(card.lead ? [el({ marginBottom: 14, fontSize: 36, color: C.bright }, `> ${card.lead}`)] : []),
        el({ maxWidth: 1000, fontSize: isHome ? 28 : 30, lineHeight: 1.5 }, card.text),
      ]),

      el(
        { flexWrap: 'wrap', gap: 12 },
        card.chips.slice(0, MAX_CHIPS).map((chip) =>
          el({ padding: '6px 14px', border: `2px solid ${C.lineStrong}`, color: C.accent, fontSize: 22 }, chip),
        ),
      ),
    ],
  );
}

type FontSpec = { name: string; data: Buffer; weight: 400 | 500; style: 'normal' };
type Subset = 'latin' | 'cyrillic';
const fontCache = new Map<Subset, Promise<FontSpec[]>>();

// fontsource раздаёт латиницу и кириллицу отдельными файлами. Satori держит по одному шрифту
// на имя, поэтому кириллица регистрируется под своим именем и подхватывается как запасной шрифт
// для знаков, которых нет в латинском подмножестве.
const FONT_NAMES: Record<Subset, string> = { latin: 'JetBrains Mono', cyrillic: 'JetBrains Mono Cyrillic' };
function loadSubset(subset: Subset): Promise<FontSpec[]> {
  const cached = fontCache.get(subset);
  if (cached) return cached;
  const dir = join(process.cwd(), 'node_modules/@fontsource/jetbrains-mono/files');
  const fonts = Promise.all(
    ([400, 500] as const).map(async (weight): Promise<FontSpec> => ({
      name: FONT_NAMES[subset],
      data: woffToSfnt(await readFile(join(dir, `jetbrains-mono-${subset}-${weight}-normal.woff`))),
      weight,
      style: 'normal',
    })),
  );
  fontCache.set(subset, fonts);
  return fonts;
}

export async function renderOgSvg(card: OgCard): Promise<string> {
  // satori ждёт ReactNode, а дерево здесь собрано из простых объектов того же вида.
  return satori(ogTree(card) as unknown as Parameters<typeof satori>[0], {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts: (await Promise.all([loadSubset('latin'), loadSubset('cyrillic')])).flat(),
  });
}

export async function renderOgPng(card: OgCard): Promise<Buffer> {
  return sharp(Buffer.from(await renderOgSvg(card))).png().toBuffer();
}

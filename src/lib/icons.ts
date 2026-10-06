import sharp from 'sharp';

export interface IconSpec {
  name: string;
  size: number;
  maskable: boolean;
}

export const ICONS: readonly IconSpec[] = [
  { name: 'icon-32', size: 32, maskable: false },
  { name: 'apple-touch-icon', size: 180, maskable: false },
  { name: 'icon-192', size: 192, maskable: false },
  { name: 'icon-512', size: 512, maskable: false },
  { name: 'icon-maskable-512', size: 512, maskable: true },
];

const BG = '#0b0f08';
const ACCENT = '#9fef00';
const CORNER = '#4a6236';
// Android обрезает maskable-иконку кругом диаметром 80% стороны. Рисунок сжимается так,
// чтобы даже уголки видоискателя попали внутрь круга.
const MASKABLE_SCALE = 0.56;

// Рисунок в координатах 512×512: уголки видоискателя, рамка детекции с плашкой подписи
// и курсор «_» из логотипа. Уголки отстоят от края на 96: так их не съедает скругление iOS.
const ARTWORK = [
  `<path d="M96 192V96h96M320 96h96v96M416 320v96h-96M192 416H96v-96" fill="none" stroke="${CORNER}" stroke-width="20"/>`,
  `<rect x="176" y="212" width="160" height="140" fill="none" stroke="${ACCENT}" stroke-width="22"/>`,
  `<rect x="165" y="152" width="150" height="60" fill="${ACCENT}"/>`,
  // Тёмные полосы внутри плашки читаются как текст подписи «person 0.99».
  `<rect x="183" y="174" width="58" height="16" fill="${BG}"/><rect x="253" y="174" width="44" height="16" fill="${BG}"/>`,
  `<rect x="208" y="300" width="48" height="20" fill="${ACCENT}"/>`,
].join('');

export function iconSvg({ maskable = false }: { maskable?: boolean } = {}): string {
  const offset = (512 * (1 - MASKABLE_SCALE)) / 2;
  const art = maskable ? `<g transform="translate(${offset} ${offset}) scale(${MASKABLE_SCALE})">${ARTWORK}</g>` : ARTWORK;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="${BG}"/>${art}</svg>`;
}

export function renderIconPng(icon: IconSpec): Promise<Buffer> {
  return sharp(Buffer.from(iconSvg({ maskable: icon.maskable })))
    .resize(icon.size, icon.size)
    .png()
    .toBuffer();
}

export function webManifest() {
  const icon = (name: string, purpose: 'any' | 'maskable') => {
    const spec = ICONS.find((i) => i.name === name);
    if (!spec) throw new Error(`webManifest: нет иконки ${name} в ICONS`);
    return { src: `/icons/${name}.png`, sizes: `${spec.size}x${spec.size}`, type: 'image/png', purpose };
  };
  return {
    name: 'Дмитрий · kakadu525',
    short_name: 'kakadu525',
    description: 'Проекты, статьи на Хабре и контакты.',
    lang: 'ru',
    start_url: '/',
    display: 'standalone',
    background_color: BG,
    theme_color: BG,
    icons: [icon('icon-192', 'any'), icon('icon-512', 'any'), icon('icon-maskable-512', 'maskable')],
  };
}

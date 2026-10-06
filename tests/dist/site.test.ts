import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { describe, expect, it } from 'vitest';

const DIST = join(process.cwd(), 'dist');
const SITE_HOST = 'kakadu525.github.io';
const FORBIDDEN = ['minecraft', 'deadlock', 'вконтакте', 'vk.com', 'steam-code-bot'];
const TEXT_EXT = new Set(['.html', '.js', '.css', '.json', '.xml', '.txt', '.svg']);

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const read = (path: string) => readFileSync(path, 'utf8');
const htmlFiles = () => walk(DIST).filter((p) => p.endsWith('.html'));

// Заголовки статей с Хабра пишет автор, и тире в них допустимо, поэтому вырезаем их до проверки.
function visibleText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<([a-z]+)[^>]*data-external[^>]*>[\s\S]*?<\/\1>/g, ' ')
    .replace(/<[^>]+>/g, ' ');
}

describe('dist', () => {
  it('собран index.html', () => {
    expect(existsSync(join(DIST, 'index.html'))).toBe(true);
  });

  it('язык и заголовок главной', () => {
    const html = read(join(DIST, 'index.html'));
    expect(html).toContain('<html lang="ru"');
    expect(html).toContain('<title>Дмитрий · C++ и Python разработчик</title>');
  });

  it('нигде нет запрещённых слов', () => {
    for (const file of walk(DIST).filter((p) => TEXT_EXT.has(extname(p)))) {
      const content = read(file).toLowerCase();
      for (const word of FORBIDDEN) {
        expect(content.includes(word), `${word} найдено в ${file}`).toBe(false);
      }
    }
  });

  it('в видимом тексте нет длинных и средних тире', () => {
    for (const file of htmlFiles()) {
      const text = visibleText(read(file));
      const match = text.match(/.{0,30}[—–].{0,30}/);
      expect(match, `тире в ${file}: "${match?.[0]}"`).toBeNull();
    }
  });

  it('главная: имя, статус, сцена со всеми объектами, счётчики', () => {
    const html = read(join(DIST, 'index.html'));
    expect(html).toContain('>Дмитрий</h1>');
    expect(html).toContain('в поиске интересных предложений');
    for (const cls of ['potted plant', 'laptop', 'tv', 'keyboard', 'mouse', 'cup', 'book']) {
      expect(html).toContain(`>${cls} 0.`);
    }
    expect(html).toContain('утилит в dev-toolbox');
    expect(html).toContain('action в Marketplace');
  });

  it('главная: все проекты со ссылками на свои страницы', () => {
    const html = read(join(DIST, 'index.html'));
    for (const slug of ['confidence-scorer', 'dev-toolbox', 'wallet-api', 'mattermost-bot', 'click-recorder']) {
      expect(html).toContain(`href="/projects/${slug}/"`);
    }
    expect(html).toContain('3</span>');
    expect(html).toContain('open source репозитория');
  });

  it('главная: статьи с Хабра с датой и временем чтения', () => {
    const html = read(join(DIST, 'index.html'));
    expect(html).toContain('href="https://habr.com/ru/articles/1089530/"');
    expect(html).toContain('2 окт');
    expect(html).toContain('7 мин');
  });

  it('главная: все контакты', () => {
    const html = read(join(DIST, 'index.html'));
    for (const href of [
      'https://t.me/medvedevds00',
      'mailto:medvedka.dima@yandex.ru',
      'https://habr.com/ru/users/MedSurg/',
      'https://github.com/Kakadu525',
    ]) {
      expect(html).toContain(`href="${href}"`);
    }
    expect(html).toContain('написать в telegram →');
    expect(html).not.toContain('третью статью');
  });

  it('у каждого проекта своя страница со ссылками и навигацией', () => {
    const slugs = readdirSync(join(process.cwd(), 'src/content/projects')).map((f) => f.replace(/\.md$/, ''));
    expect(slugs.length).toBe(5);
    for (const slug of slugs) {
      const page = join(DIST, 'projects', slug, 'index.html');
      expect(existsSync(page), page).toBe(true);
      expect(read(page)).toContain('← все проекты');
    }
    const scorer = read(join(DIST, 'projects', 'confidence-scorer', 'index.html'));
    expect(scorer).toContain('href="https://github.com/Kakadu525/confidence-scorer"');
    expect(scorer).toContain('open source');
    const clicks = read(join(DIST, 'projects', 'click-recorder', 'index.html'));
    expect(clicks).toContain('код не опубликован');
    expect(clicks).toContain('data-preview="clicks"');
  });

  it('у главной и каждого проекта своё превью 1200×630 для мессенджеров', () => {
    const ogOf = (html: string) => html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
    const pngSize = (path: string) => {
      const png = readFileSync(path);
      return [png.readUInt32BE(16), png.readUInt32BE(20)];
    };

    expect(ogOf(read(join(DIST, 'index.html')))).toBe(`https://${SITE_HOST}/og.png`);
    expect(pngSize(join(DIST, 'og.png'))).toEqual([1200, 630]);

    for (const slug of readdirSync(join(process.cwd(), 'src/content/projects')).map((f) => f.replace(/\.md$/, ''))) {
      const html = read(join(DIST, 'projects', slug, 'index.html'));
      expect(ogOf(html), slug).toBe(`https://${SITE_HOST}/og/${slug}.png`);
      expect(pngSize(join(DIST, 'og', `${slug}.png`)), slug).toEqual([1200, 630]);
    }
  });

  it('иконки для экрана телефона и манифест', () => {
    const html = read(join(DIST, 'index.html'));
    const pngSize = (path: string) => {
      const png = readFileSync(path);
      return [png.readUInt32BE(16), png.readUInt32BE(20)];
    };
    expect(html).toContain('<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png"');
    expect(html).toContain('<link rel="manifest" href="/site.webmanifest"');
    expect(pngSize(join(DIST, 'icons', 'apple-touch-icon.png'))).toEqual([180, 180]);
    expect(read(join(DIST, 'favicon.svg'))).toContain('<svg');

    const manifest = JSON.parse(read(join(DIST, 'site.webmanifest')));
    for (const icon of manifest.icons) {
      const [w, h] = icon.sizes.split('x').map(Number);
      expect(pngSize(join(DIST, icon.src)), icon.src).toEqual([w, h]);
    }
  });

  it('стили встроены в страницу, основной шрифт грузится заранее', () => {
    for (const file of htmlFiles()) {
      expect(read(file), file).not.toContain('rel="stylesheet"');
    }
    const html = read(join(DIST, 'index.html'));
    expect(html).toMatch(/<link rel="preload" href="[^"]+jetbrains-mono-cyrillic-400-normal[^"]*\.woff2" as="font"/);
  });

  it('есть страница 404', () => {
    expect(existsSync(join(DIST, '404.html'))).toBe(true);
  });

  it('страница не грузит ресурсы с чужих хостов', () => {
    const resourceAttr = /<(?:script|img|link|iframe|source|video|audio)\b[^>]*?\s(?:src|href)="(https?:)?\/\/([^/"]+)/g;
    for (const file of htmlFiles()) {
      for (const [, , host] of read(file).matchAll(resourceAttr)) {
        expect(host, `внешний ресурс в ${file}`).toBe(SITE_HOST);
      }
    }
    for (const file of walk(DIST).filter((p) => p.endsWith('.css'))) {
      expect(read(file), `внешний url() в ${file}`).not.toMatch(/url\(\s*["']?(https?:)?\/\//);
    }
  });
});

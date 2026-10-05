import { describe, expect, it } from 'vitest';
import { OG_HEIGHT, OG_WIDTH, homeCard, ogTree, projectCard, renderOgPng, renderOgSvg, type OgNode } from '../../src/lib/og';

function texts(node: OgNode | string): string[] {
  if (typeof node === 'string') return [node];
  const children = node.props.children;
  if (children === undefined) return [];
  return (Array.isArray(children) ? children : [children]).flatMap(texts);
}

const scorer = projectCard({
  id: 'confidence-scorer',
  label: 'repo',
  conf: 0.98,
  title: 'confidence-scorer',
  summary: 'Оценивает PR от нейросети по шкале от 0 до 100.',
  stack: ['python', 'hypothesis', 'fast-check', 'ollama', 'github actions', 'лишний'],
});

describe('ogTree', () => {
  it('главная: имя, подпись детектора, статус и адрес сайта', () => {
    const all = texts(ogTree(homeCard)).join('|');
    expect(all).toContain('Дмитрий');
    expect(all).toContain('person 0.99');
    expect(all).toContain('в поиске интересных предложений');
    expect(all).toContain('kakadu525.github.io');
  });

  it('проект: подпись с уверенностью, путь и не больше пяти чипов', () => {
    const all = texts(ogTree(scorer));
    expect(all).toContain('repo 0.98');
    expect(all.join('|')).toContain('kakadu525.github.io/projects/confidence-scorer');
    expect(all).toContain('github actions');
    expect(all).not.toContain('лишний');
  });
});

describe('renderOgSvg', () => {
  // Если шрифт не найдёт кириллицу, каждая буква станет одинаковым прямоугольником,
  // и два разных слова одной длины дадут одинаковый SVG.
  it('рисует кириллицу настоящими буквами, а не квадратиками', async () => {
    const one = await renderOgSvg({ ...homeCard, title: 'Дмитрий' });
    const other = await renderOgSvg({ ...homeCard, title: 'Жёлудев' });
    expect(one).not.toBe(other);
  }, 20_000);
});

describe('renderOgPng', () => {
  it('отдаёт PNG 1200×630', async () => {
    const png = await renderOgPng(homeCard);
    expect(png.subarray(1, 4).toString('ascii')).toBe('PNG');
    expect(png.readUInt32BE(16)).toBe(OG_WIDTH);
    expect(png.readUInt32BE(20)).toBe(OG_HEIGHT);
  }, 20_000);
});

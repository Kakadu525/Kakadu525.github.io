import { reducedMotion } from './motion';

const TOOLBOX_SAMPLES: ReadonlyArray<readonly [string, string]> = [
  ['jwt  eyJhbGciOiJIUzI1…', '{"alg":"HS256","typ":"JWT"}'],
  ['sha256  "hello"', '2cf24dba5fb0a30e26e8…'],
  ['regex  \\d{3}-\\d{2}', '2 совпадения'],
  ['uuid  v4', '9b1d3f2e-4e2a-4f61-…'],
  ['base64  "привет"', '0L/RgNC40LLQtdGC'],
];
const MM_STATES = [
  { text: '○ создано', color: 'var(--text-muted)' },
  { text: '◐ в работе', color: 'var(--warn)' },
  { text: '● готово', color: 'var(--accent)' },
] as const;
// Проценты, а не пиксели: одна и та же траектория работает в карточке и на странице проекта.
const CLICK_POINTS: ReadonlyArray<readonly [number, number]> = [[6, 40], [30, 70], [52, 30], [20, 75], [64, 60]];
const SCORE = 35;
const INPUTS = 200;

function find<T extends Element = HTMLElement>(root: HTMLElement, selector: string): T {
  const el = root.querySelector<T>(selector);
  if (!el) throw new Error(`preview "${root.dataset.preview}": нет элемента ${selector}`);
  return el;
}

function runScorer(root: HTMLElement): void {
  const lines = [...root.querySelectorAll<HTMLElement>('.ln')];
  const inputs = find(root, '[data-inputs]');
  const bar = find(root, '[data-bar]');
  const score = find(root, '[data-score]');
  const reveal = (i: number) => { lines[i].style.opacity = '1'; };

  const play = () => {
    lines.forEach((line) => { line.style.opacity = '0'; });
    bar.style.width = '0%';
    score.textContent = '0';
    inputs.textContent = '0';
    reveal(0);
    let n = 0;
    const counter = window.setInterval(() => {
      n = Math.min(INPUTS, n + 8);
      inputs.textContent = String(n);
      if (n < INPUTS) return;
      window.clearInterval(counter);
      window.setTimeout(() => reveal(1), 250);
      window.setTimeout(() => reveal(2), 650);
      window.setTimeout(() => {
        reveal(3);
        bar.style.width = `${SCORE}%`;
        let s = 0;
        const fill = window.setInterval(() => {
          s += 1;
          score.textContent = String(s);
          if (s >= SCORE) window.clearInterval(fill);
        }, 24);
      }, 1100);
      window.setTimeout(() => reveal(4), 2100);
    }, 30);
  };
  play();
  window.setInterval(play, 9000);
}

function runToolbox(root: HTMLElement): void {
  const input = find(root, '[data-in]');
  const output = find(root, '[data-out]');
  let index = 0;
  window.setInterval(() => {
    index = (index + 1) % TOOLBOX_SAMPLES.length;
    const [query, answer] = TOOLBOX_SAMPLES[index];
    input.textContent = query;
    output.textContent = '';
    let chars = 0;
    const typing = window.setInterval(() => {
      chars += 1;
      output.textContent = answer.slice(0, chars);
      if (chars >= answer.length) window.clearInterval(typing);
    }, 22);
  }, 2400);
}

function runWallet(root: HTMLElement): void {
  const cells = [...root.querySelectorAll<HTMLElement>('.cell')];
  const sent = find(root, '[data-sent]');
  const ok = find(root, '[data-ok]');
  const play = () => {
    cells.forEach((cell) => cell.classList.remove('on'));
    ok.style.opacity = '0';
    sent.textContent = '0';
    // Запросы приходят вразнобой, как настоящие параллельные.
    const order = cells.map((_, i) => i).sort(() => Math.random() - 0.5);
    order.forEach((cellIndex, n) => {
      window.setTimeout(() => {
        cells[cellIndex].classList.add('on');
        sent.textContent = String(n + 1);
        if (n === cells.length - 1) ok.style.opacity = '1';
      }, 120 + n * 70);
    });
  };
  play();
  window.setInterval(play, 4200);
}

function runMattermost(root: HTMLElement): void {
  const msg = find(root, '[data-msg]');
  const status = find(root, '[data-status]');
  let state = MM_STATES.length - 1;
  let id = Number(msg.textContent);
  window.setInterval(() => {
    state = (state + 1) % MM_STATES.length;
    if (state === 0) {
      id += 1;
      msg.textContent = String(id);
    }
    status.textContent = MM_STATES[state].text;
    status.style.color = MM_STATES[state].color;
  }, 1300);
}

function runClicks(root: HTMLElement): void {
  const pad = find(root, '.pad');
  const dot = find(root, '[data-dot]');
  const loop = find(root, '[data-loop]');
  let point = 0;
  let loops = 1;
  window.setInterval(() => {
    point = (point + 1) % CLICK_POINTS.length;
    if (point === 0) {
      loops += 1;
      loop.textContent = String(loops);
    }
    const [x, y] = CLICK_POINTS[point];
    dot.style.left = `${x}%`;
    dot.style.top = `${y}%`;
    window.setTimeout(() => {
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.left = `${x}%`;
      ripple.style.top = `${y}%`;
      pad.appendChild(ripple);
      window.setTimeout(() => ripple.remove(), 650);
    }, 460);
  }, 900);
}

const RUNNERS: Record<string, (root: HTMLElement) => void> = {
  scorer: runScorer,
  toolbox: runToolbox,
  wallet: runWallet,
  mm: runMattermost,
  clicks: runClicks,
};

if (!reducedMotion()) {
  document.querySelectorAll<HTMLElement>('[data-preview]').forEach((root) => {
    RUNNERS[root.dataset.preview ?? '']?.(root);
  });
}

import { finePointer } from './motion';

const PAD = 5;
// Пауза перед исчезновением: курсор успевает перейти на соседнюю карточку, и рамка едет к ней, не мигая.
const HIDE_DELAY_MS = 140;
const CONF_START = 0.45;

function initTracker(): void {
  const site = document.getElementById('site');
  const box = document.getElementById('trk');
  const label = document.getElementById('trk-label');
  const hudTrack = document.getElementById('hud-track');
  if (!site || !box || !label || !finePointer()) return;

  let hideTimer: number | undefined;
  let confTimer: number | undefined;

  const show = (el: HTMLElement) => {
    window.clearTimeout(hideTimer);
    const r = el.getBoundingClientRect();
    // Рамка позиционируется от внутреннего края колонки, а на широком экране у колонки есть бордер.
    const s = site.getBoundingClientRect();
    box.style.left = `${r.left - s.left - site.clientLeft - PAD}px`;
    box.style.top = `${r.top - s.top - site.clientTop - PAD}px`;
    box.style.width = `${r.width + PAD * 2}px`;
    box.style.height = `${r.height + PAD * 2}px`;
    box.style.opacity = '1';
    if (hudTrack) hudTrack.textContent = el.dataset.name ?? 'object';

    const name = el.dataset.label ?? 'object';
    const target = Number(el.dataset.conf ?? '0.9');
    let conf = CONF_START;
    window.clearInterval(confTimer);
    confTimer = window.setInterval(() => {
      conf = Math.min(target, conf + 0.04);
      label.textContent = `${name} ${conf.toFixed(2)}`;
      if (conf >= target) window.clearInterval(confTimer);
    }, 28);
  };

  const hide = () => {
    hideTimer = window.setTimeout(() => {
      box.style.opacity = '0';
      if (hudTrack) hudTrack.textContent = 'none';
    }, HIDE_DELAY_MS);
  };

  document.querySelectorAll<HTMLElement>('.t').forEach((el) => {
    el.addEventListener('mouseenter', () => show(el));
    el.addEventListener('mouseleave', hide);
    el.addEventListener('focus', () => show(el));
    el.addEventListener('blur', hide);
  });
}

initTracker();

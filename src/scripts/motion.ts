export const reducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const finePointer = (): boolean =>
  window.matchMedia('(hover: hover) and (pointer: fine)').matches;

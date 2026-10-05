export interface TyperState {
  phrase: number;
  chars: number;
  deleting: boolean;
}

export interface TyperStep {
  state: TyperState;
  text: string;
  delay: number;
}

export const TYPE_DELAY = 55;
export const DELETE_DELAY = 26;
export const HOLD_DELAY = 1800;

export function nextTyper(state: TyperState, phrases: readonly string[]): TyperStep {
  if (phrases.length === 0) return { state, text: '', delay: HOLD_DELAY };
  const current = phrases[state.phrase] ?? '';

  if (state.deleting) {
    const chars = Math.max(0, state.chars - 1);
    const text = current.slice(0, chars);
    if (chars === 0) {
      return { state: { phrase: (state.phrase + 1) % phrases.length, chars: 0, deleting: false }, text, delay: DELETE_DELAY };
    }
    return { state: { ...state, chars }, text, delay: DELETE_DELAY };
  }

  const chars = Math.min(current.length, state.chars + 1);
  const text = current.slice(0, chars);
  if (chars === current.length) {
    return { state: { ...state, chars, deleting: true }, text, delay: HOLD_DELAY };
  }
  return { state: { ...state, chars }, text, delay: TYPE_DELAY };
}

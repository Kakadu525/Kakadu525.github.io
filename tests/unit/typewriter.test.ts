import { describe, expect, it } from 'vitest';
import { DELETE_DELAY, HOLD_DELAY, TYPE_DELAY, nextTyper } from '../../src/lib/typewriter';

const phrases = ['ab', 'cd'];

describe('nextTyper', () => {
  it('печатает по одному символу', () => {
    expect(nextTyper({ phrase: 0, chars: 0, deleting: false }, phrases)).toEqual({
      state: { phrase: 0, chars: 1, deleting: false }, text: 'a', delay: TYPE_DELAY,
    });
  });
  it('допечатав фразу, держит паузу и переходит к стиранию', () => {
    expect(nextTyper({ phrase: 0, chars: 1, deleting: false }, phrases)).toEqual({
      state: { phrase: 0, chars: 2, deleting: true }, text: 'ab', delay: HOLD_DELAY,
    });
  });
  it('стирает по одному символу', () => {
    expect(nextTyper({ phrase: 0, chars: 2, deleting: true }, phrases)).toEqual({
      state: { phrase: 0, chars: 1, deleting: true }, text: 'a', delay: DELETE_DELAY,
    });
  });
  it('стерев фразу, берёт следующую', () => {
    expect(nextTyper({ phrase: 0, chars: 1, deleting: true }, phrases)).toEqual({
      state: { phrase: 1, chars: 0, deleting: false }, text: '', delay: DELETE_DELAY,
    });
  });
  it('после последней фразы возвращается к первой', () => {
    expect(nextTyper({ phrase: 1, chars: 1, deleting: true }, phrases).state.phrase).toBe(0);
  });
  it('пустой список не ломается', () => {
    const state = { phrase: 0, chars: 0, deleting: false };
    expect(nextTyper(state, [])).toEqual({ state, text: '', delay: HOLD_DELAY });
  });
});

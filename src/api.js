// Local game driver. Holds a single session in memory and exposes the same
// async surface the UI already uses — no backend, no network. Engine functions
// throw on invalid moves; because these wrappers are async, those throws become
// rejected promises that the UI's try/catch handles.

import {
  createSession,
  deal as dealFn,
  hit as hitFn,
  stand as standFn,
  double as doubleFn,
  split as splitFn,
  serialize,
} from './game.js';

let session = null;

function snapshot() {
  return { gameId: 'local', ...serialize(session) };
}

export const api = {
  async newGame() {
    session = createSession();
    return snapshot();
  },
  async deal(_gameId, bet) {
    dealFn(session, bet);
    return snapshot();
  },
  async hit() {
    hitFn(session);
    return snapshot();
  },
  async stand() {
    standFn(session);
    return snapshot();
  },
  async double() {
    doubleFn(session);
    return snapshot();
  },
  async split() {
    splitFn(session);
    return snapshot();
  },
};

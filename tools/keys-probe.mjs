// Diagnostic: verify stdin chunks tokenise correctly AND that every token
// resolves to the intended action. Run: node tools/keys-probe.mjs

import { ESC, ETX, tokenizeKeys } from '../src/viewport.js';
import { resolveKey, QUIT, OPEN, SCROLL, NONE } from '../src/keys.js';
import { openable } from '../src/data.js';

const ctx = { openable, pageSize: 20, total: 157 };
const show = (t) => t.replaceAll(ESC, '<ESC>').replaceAll(ETX, '<ETX>').replace('\r', '<CR>');

let failures = 0;
const check = (label, ok, detail = '') => {
  if (!ok) failures++;
  console.log(`  ${ok ? 'OK  ' : 'FAIL'} ${label.padEnd(40)} ${detail}`);
};

// --- tokenising -------------------------------------------------------------
console.log('tokenising');
const tokenCases = [
  ['single arrow', `${ESC}[B`, 1],
  ['wheel notch (3 batched)', `${ESC}[B${ESC}[B${ESC}[B`, 3],
  ['fast wheel (6 batched)', `${ESC}[B`.repeat(6), 6],
  ['mixed chunk', `${ESC}[B6`, 2],
  ['held j', 'jjjj', 4],
];
for (const [label, input, expected] of tokenCases) {
  const got = tokenizeKeys(input);
  check(label, got.length === expected, `${got.length} token(s)`);
}
check('arrows never yield a bare ESC', !tokenizeKeys(`${ESC}[A${ESC}[B`).includes(ESC));

// --- every shortcut resolves to its own target ------------------------------
console.log('\nlink shortcuts');
for (const target of openable) {
  const action = resolveKey(target.key, ctx);
  check(
    `[${target.key}] ${target.label}`,
    action.type === OPEN && action.target.url === target.url,
    action.type === OPEN ? action.target.url : `got ${action.type}`
  );
}

// keys must be unique and must not collide with scroll/quit keys
const keys = openable.map((o) => o.key);
check('shortcut keys unique', new Set(keys).size === keys.length, keys.join(' '));
check('no undefined shortcut', keys.every(Boolean), `${keys.length} keys`);
const reserved = ['j', 'k', 'g', 'G', 'q', 'Q', ' ', '\r', ESC, ETX];
check('no clash with reserved keys', !keys.some((k) => reserved.includes(k)));

// --- scrolling --------------------------------------------------------------
console.log('\nscrolling');
const scrollCases = [
  [`${ESC}[A`, -1, 'up arrow'],
  [`${ESC}[B`, 1, 'down arrow'],
  ['k', -1, 'k'],
  ['j', 1, 'j'],
  [`${ESC}[5~`, -20, 'page up'],
  [`${ESC}[6~`, 20, 'page down'],
  [' ', 20, 'space'],
  [`${ESC}[H`, -157, 'home (VT)'],
  [`${ESC}[1~`, -157, 'home (conhost)'],
  [`${ESC}[F`, 157, 'end (VT)'],
  [`${ESC}[4~`, 157, 'end (conhost)'],
];
for (const [key, delta, label] of scrollCases) {
  const a = resolveKey(key, ctx);
  check(label, a.type === SCROLL && a.delta === delta, `delta ${a.delta ?? a.type}`);
}

// --- quitting ---------------------------------------------------------------
console.log('\nquitting');
for (const [key, label] of [[ETX, 'ctrl+c'], ['q', 'q'], ['Q', 'Q'], ['\r', 'enter'], [ESC, 'bare escape']]) {
  check(label, resolveKey(key, ctx).type === QUIT, show(key));
}

// --- a wheel notch end-to-end ----------------------------------------------
console.log('\nend to end');
const notchDelta = tokenizeKeys(`${ESC}[B${ESC}[B${ESC}[B`)
  .map((k) => resolveKey(k, ctx))
  .filter((a) => a.type === SCROLL)
  .reduce((sum, a) => sum + a.delta, 0);
check('wheel notch scrolls 3 lines', notchDelta === 3, `delta ${notchDelta}`);

const unknown = resolveKey('~', ctx);
check('unknown key is inert', unknown.type === NONE);

console.log(failures === 0 ? '\nPASS: all key handling correct' : `\nFAIL: ${failures} case(s)`);
process.exit(failures === 0 ? 0 : 1);

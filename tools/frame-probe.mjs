// Diagnostic: capture what the real drawWindow() writes and prove a frame
// covers the screen exactly once and can never scroll the display.
// Run: node tools/frame-probe.mjs

import { ESC, drawWindow, maxOffset } from '../src/viewport.js';

const ROWS = 30;
const COLS = 100;

Object.defineProperty(process.stdout, 'rows', { value: ROWS, configurable: true });
Object.defineProperty(process.stdout, 'columns', { value: COLS, configurable: true });

const lines = Array.from({ length: 157 }, (_, i) => `line ${i}`);

function capture(offset) {
  const real = process.stdout.write.bind(process.stdout);
  let out = '';
  process.stdout.write = (chunk) => { out += chunk; return true; };
  try {
    drawWindow(lines, offset);
  } finally {
    process.stdout.write = real;
  }
  return out;
}

const frame = capture(40);
const rowsAddressed = [...frame.matchAll(new RegExp(`${ESC}\\[(\\d+);1H`, 'g'))].map((m) => Number(m[1]));
const distinct = new Set(rowsAddressed);
const newlines = (frame.match(/\n/g) ?? []).length;
const clears = (frame.match(new RegExp(`${ESC}\\[K`, 'g')) ?? []).length;
const writes = (() => {
  const real = process.stdout.write.bind(process.stdout);
  let n = 0;
  process.stdout.write = () => { n++; return true; };
  try { drawWindow(lines, 40); } finally { process.stdout.write = real; }
  return n;
})();

const checks = [
  ['no newlines (cannot scroll)', newlines === 0, newlines],
  [`addresses rows 1..${ROWS}`, [...Array(ROWS)].every((_, i) => distinct.has(i + 1)), distinct.size],
  ['never addresses past bottom', Math.max(...rowsAddressed) <= ROWS, Math.max(...rowsAddressed)],
  ['each row addressed once', rowsAddressed.length === distinct.size, rowsAddressed.length],
  [`clears every row`, clears === ROWS, clears],
  ['single write per frame (no flicker)', writes === 1, writes],
];

for (const [label, ok, actual] of checks) {
  console.log(`  ${ok ? 'OK  ' : 'FAIL'} ${label.padEnd(36)} ${actual}`);
}

// Frame shape must be identical at every offset, including clamped past the end.
const shapes = [0, 40, 120, maxOffset(lines.length), 500].map((o) => {
  const f = capture(o);
  return `${new Set([...f.matchAll(new RegExp(`${ESC}\\[(\\d+);1H`, 'g'))].map((m) => m[1])).size}/${(f.match(/\n/g) ?? []).length}`;
});
const stable = new Set(shapes).size === 1;
console.log(`  ${stable ? 'OK  ' : 'FAIL'} ${'stable shape at all offsets'.padEnd(36)} ${shapes.join(' ')}`);

const pass = checks.every(([, ok]) => ok) && stable;
console.log(pass ? '\nPASS: frame is scroll-proof' : '\nFAIL');
process.exit(pass ? 0 : 1);

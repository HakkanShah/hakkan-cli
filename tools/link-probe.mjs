// Diagnostic: do OSC 8 hyperlinks survive the frame renderer?
// Run: node tools/link-probe.mjs

process.stdout.isTTY = true;
Object.defineProperty(process.stdout, 'rows', { value: 30, configurable: true });
Object.defineProperty(process.stdout, 'columns', { value: 100, configurable: true });

const { ESC, drawWindow } = await import('../src/viewport.js');
const { connectScreen } = await import('../src/screens.js');
const { links } = await import('../src/data.js');

const BEL = String.fromCharCode(7);

// 1. Are links present in the rendered section at all?
const section = connectScreen();
const openers = [...section.matchAll(new RegExp(`${ESC}\\]8;;([^${BEL}]*)${BEL}`, 'g'))].map((m) => m[1]);
console.log('openers found in connectScreen():', openers.length, `(expect ${links.length})`);
openers.forEach((u) => console.log('   ', u || '<closer>'));

// 2. Do they survive drawWindow's slice + absolute-positioning rewrite?
const lines = section.split('\n');
let captured = '';
const real = process.stdout.write.bind(process.stdout);
process.stdout.write = (chunk) => { captured += chunk; return true; };
try {
  drawWindow(lines, 0);
} finally {
  process.stdout.write = real;
}

const afterOpeners = [...captured.matchAll(new RegExp(`${ESC}\\]8;;([^${BEL}]*)${BEL}`, 'g'))]
  .map((m) => m[1]).filter(Boolean);
console.log('\nopeners surviving drawWindow:', afterOpeners.length);

const missing = links.filter((l) => !captured.includes(`${ESC}]8;;${l.url}${BEL}`));
console.log('missing after render:', missing.length ? missing.map((l) => l.label).join(', ') : 'none');

// 3. Is any link split across a row boundary by the erase-line sequence?
const eraseInsideLink = new RegExp(`${ESC}\\]8;;[^${BEL}]*${ESC}\\[K`).test(captured);
console.log('erase sequence inside a link:', eraseInsideLink ? 'YES - would break it' : 'no');

// 4. Does every opener have a matching closer on the same row?
const rows = captured.split(new RegExp(`${ESC}\\[\\d+;1H`)).filter(Boolean);
let unbalanced = 0;
for (const row of rows) {
  const o = (row.match(new RegExp(`${ESC}\\]8;;[^${BEL}]+${BEL}`, 'g')) ?? []).length;
  const cl = (row.match(new RegExp(`${ESC}\\]8;;${BEL}`, 'g')) ?? []).length;
  if (o !== cl) unbalanced++;
}
console.log('rows with unbalanced open/close:', unbalanced);

const pass = missing.length === 0 && !eraseInsideLink && unbalanced === 0;
console.log(pass ? '\nPASS: hyperlinks intact through the renderer' : '\nFAIL: renderer is damaging links');

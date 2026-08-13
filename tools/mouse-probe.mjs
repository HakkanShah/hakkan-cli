// Diagnostic: SGR mouse reports must tokenise intact, resolve to the right
// action, and a click on any row of a link entry must find that link.
// Run: node tools/mouse-probe.mjs

process.stdout.isTTY = true;
Object.defineProperty(process.stdout, 'columns', { value: 100, configurable: true });
Object.defineProperty(process.stdout, 'rows', { value: 30, configurable: true });

const { ESC, tokenizeKeys } = await import('../src/viewport.js');
const { resolveKey, buildLineTargets, SCROLL, CLICK, NONE } = await import('../src/keys.js');
const { openable } = await import('../src/data.js');
const { stripAnsi } = await import('../src/theme.js');
const { connectScreen, projectsScreen } = await import('../src/screens.js');

const ctx = { openable, pageSize: 20, total: 157 };
let failures = 0;
const check = (label, ok, detail = '') => {
  if (!ok) failures++;
  console.log(`  ${ok ? 'OK  ' : 'FAIL'} ${label.padEnd(44)} ${detail}`);
};

// --- tokenising mouse reports ----------------------------------------------
console.log('tokenising');
check('wheel-up report is one token', tokenizeKeys(`${ESC}[<64;10;5M`).length === 1);
check('wheel-down report is one token', tokenizeKeys(`${ESC}[<65;10;5M`).length === 1);
check('click press is one token', tokenizeKeys(`${ESC}[<0;12;7M`).length === 1);
check('click release is one token', tokenizeKeys(`${ESC}[<0;12;7m`).length === 1);
check('3-notch burst is 3 tokens', tokenizeKeys(`${ESC}[<65;1;1M`.repeat(3)).length === 3);
check(
  'mouse report not shredded into chars',
  tokenizeKeys(`${ESC}[<64;10;5M`)[0] === `${ESC}[<64;10;5M`,
  tokenizeKeys(`${ESC}[<64;10;5M`)[0]?.replace(ESC, '<ESC>')
);
check('arrow keys still tokenise', tokenizeKeys(`${ESC}[A`).length === 1);

// --- resolving --------------------------------------------------------------
console.log('\nresolving');
const wheelUp = resolveKey(`${ESC}[<64;10;5M`, ctx);
check('wheel up scrolls up 3', wheelUp.type === SCROLL && wheelUp.delta === -3, `delta ${wheelUp.delta}`);
const wheelDown = resolveKey(`${ESC}[<65;10;5M`, ctx);
check('wheel down scrolls down 3', wheelDown.type === SCROLL && wheelDown.delta === 3, `delta ${wheelDown.delta}`);
const press = resolveKey(`${ESC}[<0;12;7M`, ctx);
check('left press is a click at row 7', press.type === CLICK && press.row === 7, `row ${press.row}`);
check('left release is inert (no double fire)', resolveKey(`${ESC}[<0;12;7m`, ctx).type === NONE);
check('right click inert', resolveKey(`${ESC}[<2;12;7M`, ctx).type === NONE);

// --- click targeting --------------------------------------------------------
console.log('\nclick targeting');
const page = (projectsScreen() + '\n\n' + connectScreen()).split('\n');
const targets = buildLineTargets(page, openable);

console.log(`  page rows: ${page.length}, rows bound to a link: ${targets.size}`);

// Every link that appears on this page must be reachable by a click.
const present = openable.filter((o) => page.some((l) => stripAnsi(l).includes(`[${o.key}] `)));
for (const o of present) {
  const rows = [...targets.entries()].filter(([, t]) => t.url === o.url).map(([i]) => i);
  check(
    `[${o.key}] ${o.label} clickable`,
    rows.length > 0,
    `${rows.length} row(s): ${rows.join(',')}`
  );
}

// A project entry spans title + blurb + url; all of those rows should open it.
const ohm = [...targets.entries()].filter(([, t]) => t.label === 'OHMSchool');
check('project entry spans multiple rows', ohm.length >= 2, `${ohm.length} rows`);

// Blank rows and box borders must not be bound to anything.
const blankBound = [...targets.keys()].filter((i) => !/[a-z0-9]/i.test(stripAnsi(page[i])));
check('blank rows unbound', blankBound.length === 0, `${blankBound.length} bound`);

// No row may map to two different links.
const overlap = new Set([...targets.values()].map((t) => t.url)).size;
check('each link distinct', overlap === present.length, `${overlap} distinct of ${present.length}`);

console.log(failures === 0 ? '\nPASS: mouse handling correct' : `\nFAIL: ${failures} case(s)`);
process.exit(failures === 0 ? 0 : 1);

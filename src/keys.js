// Pure key resolution, kept free of I/O so it can be tested exhaustively.
// index.js only dispatches on what this returns.

import { ESC, ETX } from './viewport.js';
import { stripAnsi } from './theme.js';

export const QUIT = 'quit';
export const OPEN = 'open';
export const SCROLL = 'scroll';
export const CLICK = 'click';
export const NONE = 'none';

const QUIT_KEYS = new Set([ETX, 'q', 'Q', '\r', '\n', ESC]);

// SGR mouse report: ESC [ < button ; column ; row  M(press) or m(release)
const MOUSE = new RegExp(`^${ESC}\\[<(\\d+);(\\d+);(\\d+)([Mm])$`);
const WHEEL_UP = 64;
const WHEEL_DOWN = 65;
const LEFT_BUTTON = 0;
const WHEEL_LINES = 3;

// Resolves one key token into an action.
//   key       a single token from tokenizeKeys()
//   openable  registry of { key, label, url }
//   pageSize  lines to move for PgUp/PgDn
//   total     total line count, used for jump-to-top/bottom
export function resolveKey(key, { openable = [], pageSize = 20, total = 0 } = {}) {
  const mouse = MOUSE.exec(key);
  if (mouse) {
    const button = Number(mouse[1]);
    if (button === WHEEL_UP) return { type: SCROLL, delta: -WHEEL_LINES };
    if (button === WHEEL_DOWN) return { type: SCROLL, delta: WHEEL_LINES };
    // Act on press, not release, or every click would fire twice.
    if (button === LEFT_BUTTON && mouse[4] === 'M') {
      return { type: CLICK, column: Number(mouse[2]), row: Number(mouse[3]) };
    }
    return { type: NONE };
  }

  // Checked first so a link shortcut can never be shadowed by a quit key.
  if (QUIT_KEYS.has(key)) return { type: QUIT };

  const target = openable.find((o) => o.key === key);
  if (target) return { type: OPEN, target };

  switch (key) {
    case `${ESC}[A`:
    case 'k':
      return { type: SCROLL, delta: -1 };
    case `${ESC}[B`:
    case 'j':
      return { type: SCROLL, delta: 1 };
    case `${ESC}[5~`:
      return { type: SCROLL, delta: -pageSize };
    case `${ESC}[6~`:
    case ' ':
      return { type: SCROLL, delta: pageSize };
    // Windows conhost and VT terminals disagree on Home/End, so accept both.
    case `${ESC}[H`:
    case `${ESC}[1~`:
    case 'g':
      return { type: SCROLL, delta: -total };
    case `${ESC}[F`:
    case `${ESC}[4~`:
    case 'G':
      return { type: SCROLL, delta: total };
    default:
      return { type: NONE };
  }
}

// Maps each page line index to the link it belongs to, so a click anywhere on an
// entry - its title, blurb or URL row - opens that link rather than only the
// exact URL text. An entry starts at its "[key]" badge and runs until the next
// badge or the next visually empty row.
export function buildLineTargets(lines, openable) {
  const targets = new Map();
  let current = null;

  lines.forEach((line, index) => {
    const plain = stripAnsi(line);
    const badge = openable.find((o) => plain.includes(`[${o.key}] `));

    if (badge) {
      current = badge;
    } else if (isBlankRow(plain)) {
      current = null;
    }

    if (current) targets.set(index, current);
  });

  return targets;
}

// A row inside a box still has borders and padding, so emptiness means "no
// letters or digits", not an empty string.
function isBlankRow(plain) {
  return !/[a-z0-9]/i.test(plain);
}

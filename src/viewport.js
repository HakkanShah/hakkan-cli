// Full-screen frame rendering: cursor control and the scrolling window.

import process from 'node:process';
import { c } from './theme.js';

// Built from char codes so no raw control byte ever lands in a source file.
export const ESC = String.fromCharCode(27);
export const ETX = String.fromCharCode(3); // Ctrl+C, delivered as a byte in raw mode

export const clearScreen = () => process.stdout.write(`${ESC}[2J${ESC}[3J${ESC}[H`);
export const hideCursor = () => process.stdout.write(`${ESC}[?25l`);
export const showCursor = () => process.stdout.write(`${ESC}[?25h`);

// 1049 swaps to the alternate screen, so quitting restores the previous terminal
// contents. 1000 + 1006 turn on mouse reporting in SGR form, which delivers both
// wheel and click events to us.
//
// Handling clicks ourselves is the only way to make links followable here:
// Windows Terminal does not linkify the alternate screen buffer, so the OSC 8
// markup alone is not clickable. Owning the events means a plain click works,
// with no ctrl modifier. 1007 stays on as a fallback for terminals that ignore
// mouse reporting - there it translates the wheel into arrow keys instead.
//
// The trade-off is that drag-to-select now needs Shift held, which is the normal
// convention for any terminal program that reads the mouse.
export function enterFullScreen() {
  process.stdout.write(`${ESC}[?1049h${ESC}[?1007h${ESC}[?1000h${ESC}[?1006h`);
  hideCursor();
}

export function leaveFullScreen() {
  process.stdout.write(`${ESC}[?1006l${ESC}[?1000l${ESC}[?1007l${ESC}[?1049l`);
  showCursor();
}

export const screenRows = () => process.stdout.rows || 30;

// Status bar pinned to the bottom row, showing position through the page.
export function statusBar(offset, total, rows) {
  const max = Math.max(0, total - rows);
  const pct = max === 0 ? 100 : Math.round((offset / max) * 100);
  const scroll = max === 0 ? '' : '↑↓ / wheel scroll  ·  ';
  return c.dim(`  ${scroll}click or press a number to open  ·  q quit`) +
    (max === 0 ? '' : c.dim(`     ${String(pct).padStart(3)}%`));
}

// Overwrites just the bottom row, for transient feedback like "opening ...".
export function drawStatus(message) {
  process.stdout.write(`${ESC}[${screenRows()};1H${ESC}[K` + c.amber(`  ${message}`));
}

// Draws one screenful starting at `offset`.
//
// Every row is positioned absolutely (ESC[row;1H) and cleared individually
// (ESC[K). Writing rows sequentially with newlines is not safe here: a newline
// emitted on the bottom row scrolls the whole screen up by one, so each frame
// would drift one line further out of place. Absolute addressing cannot scroll,
// and it also means a single over-wide line cannot knock the rows below it out
// of alignment. The frame is assembled into one string and written once, which
// keeps the redraw flicker-free.
export function drawWindow(lines, offset) {
  const total = screenRows();
  const contentRows = total - 1;
  const window = lines.slice(offset, offset + contentRows);

  let frame = '';
  for (let i = 0; i < contentRows; i++) {
    frame += `${ESC}[${i + 1};1H${ESC}[K` + (window[i] ?? '');
  }
  frame += `${ESC}[${total};1H${ESC}[K` + statusBar(offset, lines.length, contentRows);

  process.stdout.write(frame);
}

// Largest scroll offset that still fills the screen.
export function maxOffset(lineCount) {
  return Math.max(0, lineCount - (screenRows() - 1));
}

// Splits a raw stdin chunk into individual key tokens.
//
// A single wheel notch is translated by the terminal into three arrow-key
// sequences, and they usually arrive in one chunk. Comparing the whole chunk
// against a key would match nothing, so the input is tokenised and each key
// handled in turn. Order matters: a full CSI sequence must be tried before a
// bare ESC, or every arrow key would read as "escape pressed".
export function tokenizeKeys(input) {
  // SGR mouse reports (ESC[<button;col;rowM) must be matched before the general
  // CSI form, because the '<' would otherwise stop the CSI pattern from matching
  // and the report would be shredded into single characters.
  const pattern = new RegExp(
    `${ESC}\\[<[0-9;]*[Mm]|${ESC}\\[[0-9;]*[A-Za-z~]|${ESC}|[\\s\\S]`,
    'g'
  );
  return input.match(pattern) ?? [];
}

// Locates and renders the avatar. Rendered output is cached because
// terminal-image re-decodes the file on every call.

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import terminalImage from 'terminal-image';
import { fileURLToPath } from 'node:url';
import { termWidth } from './ui.js';

// Height/width of the bundled avatar. Used to derive a column count from a row
// budget, since half-block cells are two pixels tall.
const ASPECT = 597 / 448;

// The bundled file is checked first so that running the CLI from a directory
// that happens to contain a profile.* renders mine, not theirs.
export function findProfileImage() {
  const here = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
  for (const dir of [here, process.cwd()]) {
    for (const ext of ['.jpg', '.png', '.jpeg']) {
      const candidate = path.join(dir, `profile${ext}`);
      if (fs.existsSync(candidate)) return candidate;
    }
  }
  return null;
}

// Both axes are constrained explicitly. Left to its default the library sizes
// against the full terminal height, which on a tall window produces an avatar
// that dwarfs the text beside it.
export function avatarBox() {
  const columns = termWidth();
  const rows = process.stdout.rows || 30;

  // Match the hero text block (banner + rules + profile box is ~20 rows) so the
  // two columns end together, and never eat the whole screen on a tall window.
  const rowBudget = Math.max(10, Math.min(26, rows - 10));

  // Columns the layout can spare next to the text.
  const columnBudget =
    columns >= 130 ? 44 :
    columns >= 110 ? 38 :
    columns >= 96 ? 34 : 26;

  const widthFromRows = Math.floor((rowBudget * 2) / ASPECT);
  return {
    width: Math.max(16, Math.min(columnBudget, widthFromRows)),
    height: rowBudget,
  };
}

// Width alone, for callers doing layout maths.
export function imageWidth() {
  return avatarBox().width;
}

const cache = new Map();

export async function renderAvatar(box = avatarBox()) {
  const { width, height } = box;
  const key = `${width}x${height}`;
  if (cache.has(key)) return cache.get(key);

  const imagePath = findProfileImage();
  if (!imagePath) return null;

  try {
    const rendered = (await terminalImage.file(imagePath, {
      width,
      height,
      preserveAspectRatio: true,
    })).trim();
    cache.set(key, rendered);
    return rendered;
  } catch {
    // Terminal cannot render images (no colour support, unreadable file).
    cache.set(key, null);
    return null;
  }
}

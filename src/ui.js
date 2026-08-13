// Rendering primitives: banner, layout, section boxes, skill chips, typewriter.

import boxen from 'boxen';
import chalk from 'chalk';
import figlet from 'figlet';
import process from 'node:process';
import { c, palette, brandGradient, blockWidth, visibleWidth, padVisible } from './theme.js';

export const COLUMN_GAP = 4;
const MIN_WIDTH = 40;
const MAX_CONTENT = 96;

const ESC = String.fromCharCode(27);
const BEL = String.fromCharCode(7);

// OSC 8 hyperlink. Windows Terminal, iTerm2, WezTerm, Kitty and GNOME Terminal
// all make this ctrl/cmd-clickable; terminals that do not understand it simply
// show the label, and the sequence is zero-width either way.
export function link(label, url) {
  if (!process.stdout.isTTY || chalk.level === 0) return label;
  return `${ESC}]8;;${url}${BEL}${label}${ESC}]8;;${BEL}`;
}

export function termWidth() {
  return process.stdout.columns || 80;
}

// Usable width for boxes and rules, clamped so very wide terminals stay readable.
export function contentWidth() {
  return Math.max(MIN_WIDTH, Math.min(MAX_CONTENT, termWidth() - 2));
}

export const sleep = (ms = 1000) => new Promise((r) => setTimeout(r, ms));

export function banner(text, { small = false } = {}) {
  const rendered = figlet.textSync(text, {
    font: small ? 'Small' : 'ANSI Shadow',
    whitespaceBreak: true,
  });
  return brandGradient(rendered);
}

export function rule(width = contentWidth()) {
  return c.dim('─'.repeat(width));
}

// Types text out one character at a time. Falls back to an instant write when
// stdout is not a TTY, so piped output never waits on animation.
export async function typewriter(text, { delay = 18, prefix = '' } = {}) {
  if (!process.stdout.isTTY) {
    console.log(prefix + text);
    return;
  }

  process.stdout.write(prefix);
  for (const char of text) {
    process.stdout.write(char);
    await sleep(delay);
  }
  process.stdout.write('\n');
}

export function sectionBox(title, body, { width = contentWidth() } = {}) {
  return boxen(body, {
    title: c.amber.bold(title),
    titleAlignment: 'left',
    padding: { top: 1, bottom: 1, left: 2, right: 2 },
    margin: 0,
    width,
    borderStyle: 'round',
    borderColor: palette.border,
    backgroundColor: palette.boxBg,
  });
}

// Dark text on a coloured plate reads better than coloured text on dark.
export function chip(label, hex) {
  return chalk.bgHex(hex).black.bold(` ${label} `);
}

// Lays out chips across the available width, wrapping and indenting cleanly.
export function chipRows(items, hex, width = contentWidth() - 6, indent = '  ') {
  const rows = [];
  let current = indent;

  for (const item of items) {
    const piece = chip(item, hex) + ' ';
    if (visibleWidth(current) + visibleWidth(piece) > width && current.trim() !== '') {
      rows.push(current.trimEnd());
      current = indent;
    }
    current += piece;
  }
  if (current.trim() !== '') rows.push(current.trimEnd());
  return rows.join('\n');
}

// Places two rendered blocks next to each other, aligning on visible width.
export function mergeSideBySide(leftBlock, rightBlock) {
  const left = leftBlock.split('\n');
  const right = rightBlock.split('\n');
  const height = Math.max(left.length, right.length);
  const leftWidth = blockWidth(leftBlock) + 2;

  const out = [];
  for (let i = 0; i < height; i++) {
    out.push(padVisible(left[i] || '', leftWidth) + ' '.repeat(COLUMN_GAP) + (right[i] || ''));
  }
  return out.join('\n');
}

// Word-wraps plain text to a width, preserving an indent on every line.
export function wrap(text, width, indent = '') {
  const words = text.split(' ');
  const lines = [];
  let line = '';

  for (const word of words) {
    if (line && (line + ' ' + word).length > width) {
      lines.push(indent + line);
      line = word;
    } else {
      line = line ? line + ' ' + word : word;
    }
  }
  if (line) lines.push(indent + line);
  return lines.join('\n');
}

// Wraps text after an icon, indenting continuation lines under the text rather
// than under the icon. Styles are applied per segment so colour codes never nest.
export function hangingWrap(icon, text, width, { iconStyle = (s) => s, textStyle = (s) => s } = {}) {
  const indent = ' '.repeat(icon.length);
  const lines = wrap(text, width - icon.length).split('\n');
  return lines
    .map((line, i) => (i === 0 ? iconStyle(icon) : indent) + textStyle(line))
    .join('\n');
}

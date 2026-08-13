// Central palette and text helpers. Every screen pulls colour from here so the
// CLI stays visually consistent instead of scattering hex codes inline.

import chalk from 'chalk';
import gradient from 'gradient-string';
import stringWidth from 'string-width';

export const palette = {
  accent: '#00ff88',
  amber: '#fca311',
  cyan: '#4dd4ff',
  pink: '#ff5f8f',
  muted: '#9aa5b1',
  border: 'cyan',
  boxBg: '#111111',
};

export const c = {
  accent: chalk.hex(palette.accent),
  amber: chalk.hex(palette.amber),
  cyan: chalk.hex(palette.cyan),
  pink: chalk.hex(palette.pink),
  muted: chalk.hex(palette.muted),
  dim: chalk.dim,
  bold: chalk.bold,
  white: chalk.white,
};

export const brandGradient = gradient.vice;

// Built from escape sequences rather than literal control characters so the
// pattern survives any editor or transform that mangles raw bytes.
const ANSI_PATTERN = '[\\u001B\\u009B][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]';

export function stripAnsi(string_) {
  return string_.replace(new RegExp(ANSI_PATTERN, 'g'), '');
}

// Visible width of a line. Delegated to string-width because it also accounts
// for wide characters and OSC 8 hyperlink wrappers, neither of which the CSI
// regex above knows anything about.
export function visibleWidth(line) {
  return stringWidth(line);
}

// Widest visible line in a multi-line block.
export function blockWidth(block) {
  return block.split('\n').reduce((max, line) => Math.max(max, visibleWidth(line)), 0);
}

export function padVisible(line, width) {
  return line + ' '.repeat(Math.max(0, width - visibleWidth(line)));
}

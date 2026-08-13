#!/usr/bin/env node

import chalk from 'chalk';
import fs from 'node:fs';
import ora from 'ora';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import open from 'open';

import { c, blockWidth } from './src/theme.js';
import { openable, profile, shortcutFor } from './src/data.js';
import { renderAvatar, avatarBox } from './src/image.js';
import {
  banner, COLUMN_GAP, hangingWrap, link, mergeSideBySide,
  sectionBox, sleep, termWidth, wrap,
} from './src/ui.js';
import { buildLineTargets, resolveKey, QUIT, OPEN, SCROLL, CLICK } from './src/keys.js';
import {
  aboutScreen, connectScreen, educationScreen,
  experienceScreen, projectsScreen, skillsScreen,
} from './src/screens.js';
import {
  ESC, ETX, clearScreen, drawStatus, drawWindow, enterFullScreen,
  leaveFullScreen, maxOffset, screenRows, tokenizeKeys,
} from './src/viewport.js';

const flags = new Set(process.argv.slice(2));
const NO_IMAGE = flags.has('--no-image');
const FAST = flags.has('--fast') || !process.stdout.isTTY;
const INTERACTIVE = process.stdout.isTTY && process.stdin.isTTY;

if (flags.has('--plain')) chalk.level = 0;

if (flags.has('--version') || flags.has('-v')) {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const { version } = JSON.parse(fs.readFileSync(path.join(here, 'package.json'), 'utf8'));
  console.log(version);
  process.exit(0);
}

if (flags.has('--help') || flags.has('-h')) {
  console.log(`
  ${c.bold.white('hakkan')} - ${profile.headline}

  ${c.dim('Usage')}    npx hakkan [options]

  ${c.dim('Options')}  --no-image   skip the avatar
           --plain      disable colour
           --fast       skip the intro animation
           --version    print version
           --help       show this
`);
  process.exit(0);
}

const TYPE_DELAY = 18;       // ms between revealed lines
const BOTTOM_PAUSE = 2000;   // hold at the end of the page before rewinding
const SCROLL_FRAMES = 34;    // frames in the rewind-to-top animation
const SCROLL_DELAY = 22;
const RESIZE_DEBOUNCE = 120;

async function boot() {
  if (FAST) return;

  const spinner = ora('Initializing system...').start();
  await sleep(350);

  spinner.color = 'yellow';
  spinner.text = 'Loading AI stack...';
  await sleep(350);

  spinner.color = 'cyan';
  spinner.text = 'Verifying identity...';
  await sleep(350);

  spinner.succeed(c.accent('System Ready'));
  await sleep(300);
  clearScreen();
}

function heroText(imageColumns) {
  const width = Math.min(52, Math.max(30, termWidth() - imageColumns - COLUMN_GAP - 6));

  const bio = sectionBox(
    'PROFILE',
    [
      c.white(wrap(`${profile.role} @ ${profile.company}`, width - 8)),
      c.dim(`since ${profile.since}`),
      '',
      hangingWrap('◈ ', profile.location, width - 8, { iconStyle: c.cyan, textStyle: c.dim }),
      // The portfolio URL in the bio opens with the same shortcut as its CONNECT row.
      c.amber(`[${shortcutFor(profile.website)}] `) + c.cyan('◈ ') +
        link(c.dim(profile.website), profile.website),
    ].join('\n'),
    { width }
  );

  return [
    banner(profile.handle),
    c.dim('  ' + '─'.repeat(Math.max(10, width - 4))),
    '  ' + c.bold.hex('#00ff88')('>_ ' + profile.name),
    '  ' + c.amber(profile.headline),
    c.dim('  ' + '─'.repeat(Math.max(10, width - 4))),
    bio,
  ].join('\n');
}

// The whole portfolio as an array of lines, sized for the current terminal.
async function buildPage() {
  const box = avatarBox();
  const avatar = NO_IMAGE ? null : await renderAvatar(box);
  const left = heroText(avatar ? box.width : 0);

  let heroBlock = left;
  if (avatar) {
    const needed = blockWidth(left) + 2 + COLUMN_GAP + box.width;
    heroBlock = needed <= termWidth() ? mergeSideBySide(left, avatar) : left + '\n\n' + avatar;
  }

  const parts = [
    '',
    heroBlock.trim(),
    '',
    '  ' + c.dim(`"${profile.tagline}"`),
    '',
  ];

  for (const render of [
    aboutScreen, experienceScreen, projectsScreen, skillsScreen, educationScreen, connectScreen,
  ]) {
    parts.push(render(), '');
  }

  return parts.join('\n').split('\n');
}

// Phase 1: reveal the page one line at a time. Printing past the bottom lets the
// terminal scroll naturally, so the page appears to type itself downward.
async function typeOut(lines) {
  clearScreen();
  for (const line of lines) {
    process.stdout.write(line + '\n');
    await sleep(TYPE_DELAY);
  }
}

// Phase 2: rewind the viewport to the top. The terminal cannot scroll its own
// scrollback on command, so each frame redraws a window a little further up.
async function rewindToTop(lines) {
  const top = maxOffset(lines.length);
  if (top === 0) return;

  const step = Math.max(1, Math.ceil(top / SCROLL_FRAMES));
  clearScreen();

  for (let offset = top; offset > 0; offset -= step) {
    drawWindow(lines, offset);
    await sleep(SCROLL_DELAY);
  }
  drawWindow(lines, 0);
}

// Launches a URL and reports it on the status row, then restores the status bar.
// Deliberately fire-and-forget: the key handler must stay synchronous so a
// batched chunk of keys is processed in order.
function openTarget(target, lines, state) {
  drawStatus(`opening ${target.url} ...`);

  open(target.url)
    .catch(() => drawStatus(`could not open a browser - ${target.url}`))
    .finally(() => {
      setTimeout(() => drawWindow(lines, state.offset), 1500);
    });
}

// Reads scroll/quit keys. Resolves 'quit' or 'resize'; scrolling is handled here.
function interact(lines, state) {
  return new Promise((resolve) => {
    const { stdin } = process;
    const lineTargets = buildLineTargets(lines, openable);
    let timer;

    const cleanup = () => {
      clearTimeout(timer);
      stdin.off('data', onData);
      process.stdout.off('resize', onResize);
      stdin.setRawMode?.(false);
      stdin.pause();
    };

    const scroll = (delta) => {
      const next = Math.min(maxOffset(lines.length), Math.max(0, state.offset + delta));
      if (next !== state.offset) {
        state.offset = next;
        drawWindow(lines, state.offset);
      }
    };

    const onData = (buffer) => {
      const page = Math.max(1, screenRows() - 3);

      // Each token is handled separately so a batched chunk - three arrow keys
      // from one wheel notch, or a held-down key - scrolls by the full amount.
      for (const key of tokenizeKeys(buffer.toString())) {
        const action = resolveKey(key, {
          openable,
          pageSize: page,
          total: lines.length,
        });

        if (action.type === QUIT) {
          cleanup();
          resolve('quit');
          return;
        }

        if (action.type === OPEN) {
          openTarget(action.target, lines, state);
        } else if (action.type === SCROLL) {
          scroll(action.delta);
        } else if (action.type === CLICK) {
          // Screen rows are 1-based; translate to an index into the page.
          const clicked = lineTargets.get(state.offset + action.row - 1);
          if (clicked) openTarget(clicked, lines, state);
        }
      }
    };

    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        cleanup();
        resolve('resize');
      }, RESIZE_DEBOUNCE);
    };

    stdin.setRawMode?.(true);
    stdin.resume();
    stdin.on('data', onData);
    process.stdout.on('resize', onResize);
  });
}

try {
  if (!INTERACTIVE) {
    // Piped or redirected: print once, no animation, no cursor tricks.
    const lines = await buildPage();
    console.log(lines.join('\n'));
  } else {
    await boot();

    // Restore the terminal even if the process dies unexpectedly - leaving the
    // alternate screen active or the cursor hidden would wreck the user's shell.
    process.on('exit', leaveFullScreen);
    enterFullScreen();

    const state = { offset: 0 };
    let intro = !FAST;

    for (;;) {
      const lines = await buildPage();

      if (intro) {
        await typeOut(lines);
        await sleep(BOTTOM_PAUSE); // let the end of the page land before rewinding
        await rewindToTop(lines);
        state.offset = 0;
        intro = false;
      } else {
        state.offset = Math.min(state.offset, maxOffset(lines.length));
        clearScreen();
        drawWindow(lines, state.offset);
      }

      if (await interact(lines, state) === 'quit') break;
    }

    // Leaving the alternate screen restores whatever was on screen beforehand,
    // so the goodbye lands back in the user's normal shell buffer.
    leaveFullScreen();
    console.log(c.dim('\n  Thanks for stopping by.\n'));
  }
} catch (error) {
  leaveFullScreen();
  console.error(chalk.red('\n  Something went wrong:'), error?.message ?? error);
  process.exit(1);
}

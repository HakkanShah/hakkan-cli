#!/usr/bin/env node

import chalk from 'chalk';
import { select } from '@inquirer/prompts';
import gradient from 'gradient-string';
import figlet from 'figlet';
import boxen from 'boxen';
import open from 'open';
import ora from 'ora';
import terminalImage from 'terminal-image';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Clear
console.clear();

const sleep = (ms = 1000) => new Promise((r) => setTimeout(r, ms));

async function boot() {
  const spinner = ora('Initializing system...').start();
  await sleep(400);

  spinner.color = 'yellow';
  spinner.text = 'Loading modules...';
  await sleep(400);

  spinner.color = 'cyan';
  spinner.text = 'Verifying identity...';
  await sleep(400);

  spinner.succeed(chalk.green('System Ready'));
  await sleep(400);
  console.clear();
}

// Regex to strip ANSI codes (standard simple version)
function stripAnsi(str) {
  return str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
}

function mergeSideBySide(leftBlock, rightBlock) {
  const linesLeft = leftBlock.split('\n');
  const linesRight = rightBlock.split('\n');
  const height = Math.max(linesLeft.length, linesRight.length);

  // Calculate max width of left block (visual length)
  let maxLeftWidth = 0;
  linesLeft.forEach(line => {
    const len = stripAnsi(line).length;
    if (len > maxLeftWidth) maxLeftWidth = len;
  });

  // Add a bit of safety buffer
  maxLeftWidth += 2;

  const combined = [];
  for (let i = 0; i < height; i++) {
    const lLine = linesLeft[i] || '';
    const rLine = linesRight[i] || '';

    // Pad the left line to fixed width
    const currentLen = stripAnsi(lLine).length;
    const padding = ' '.repeat(Math.max(0, maxLeftWidth - currentLen));

    combined.push(lLine + padding + '    ' + rLine);
  }
  return combined.join('\n');
}


async function showProfile() {
  // 1. Generate Banner String (Sync)
  const bannerText = figlet.textSync('HAKKAN', {
    font: 'ANSI Shadow',
    whitespaceBreak: true
  });
  // Changed to 'vice' gradient (Premium Pink/Cyan)
  const bannerColored = gradient.vice(bannerText);

  // 2. Generate Static Bio Name
  const divider = chalk.dim('  ──────────────────────────────────────────');
  const nameLine = '  ' + chalk.bold.hex('#00ff88')('  >_ HAKKAN PARBEJ SHAH');

  // 3. Generate Bio Box
  const bioBox = boxen(
    chalk.white('  Full Stack Developer & Open Source Enthusiast.') +
    '\n' +
    chalk.dim('  Building digital products that matter.') +
    '\n\n' +
    chalk.bold.blue('  Stack: ') + chalk.white('Next.js, TypeScript, Node.js') +
    '\n' +
    chalk.bold.blue('  Focus: ') + chalk.white('Scalable Web Apps & AI Automation'),
    {
      padding: 1,
      margin: 0,
      width: 52,
      borderStyle: 'round',
      borderColor: 'cyan',
      backgroundColor: '#111111',
    }
  );

  // 4. Construct LEFT COLUMN
  const leftColumn =
    bannerColored + '\n' +
    divider + '\n' +
    nameLine + '\n' +
    divider + '\n' +
    bioBox;

  // 5. Construct RIGHT COLUMN (Image)
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const imageExtensions = ['.jpg', '.png', '.jpeg'];
  let imagePath = null;
  for (const ext of imageExtensions) {
    const p = path.join(process.cwd(), `profile${ext}`);
    if (fs.existsSync(p)) { imagePath = p; break; }
    const p2 = path.join(__dirname, `profile${ext}`);
    if (fs.existsSync(p2)) { imagePath = p2; break; }
  }

  let finalOutput = leftColumn;

  if (imagePath) {
    try {
      // Adjusted width to 30 as requested for alignment
      // Trim to remove trailing newlines.
      const imgString = (await terminalImage.file(imagePath, { width: 30, preserveAspectRatio: true })).trim();
      finalOutput = mergeSideBySide(leftColumn, imgString);
    } catch (e) {
      // ignore
    }
  }

  // Trim final output to prevent extra vertical gaps
  console.log('\n' + finalOutput.trim() + '\n');
}

async function menu() {
  await sleep(200);

  const choice = await select({
    message: chalk.bold.hex('#fca311')('▼ SELECT AN OPTION '),
    choices: [
      {
        name: chalk.bold('Portfolio'),
        value: 'Portfolio Website',
        description: 'Check out my latest work'
      },
      {
        name: chalk.bold('GitHub'),
        value: 'GitHub Profile',
        description: 'See my open source code'
      },
      {
        name: chalk.bold('LinkedIn'),
        value: 'LinkedIn',
        description: 'Let\'s connect professionally'
      },
      {
        name: chalk.bold.gray('Email Me'),
        value: 'Email Me',
        description: 'Say hello!'
      },
      {
        name: chalk.bold.gray('Exit'),
        value: 'Exit',
        description: 'Close the portfolio'
      }
    ],
  });

  switch (choice) {
    case 'Portfolio Website':
      await open('https://hakkan.is-a.dev');
      break;
    case 'GitHub Profile':
      await open('https://github.com/HakkanShah');
      break;
    case 'LinkedIn':
      await open('https://www.linkedin.com/in/hakkan');
      break;
    case 'Email Me':
      await open('mailto:hakkanparbej@gmail.com');
      break;
    case 'Exit':
      console.log(chalk.gray('\n  Shutting down...'));
      process.exit(0);
  }

  // Loop
  console.log('');
  await menu();
}

(async () => {
  await boot();
  await showProfile();
  await sleep(500);
  await menu();
})();

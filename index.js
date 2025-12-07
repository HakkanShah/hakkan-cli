#!/usr/bin/env node

import chalk from 'chalk';

// Clear the console for a fresh start (optional)
console.clear();

const log = console.log;
const emptyLine = () => log('');

// Header badge
emptyLine();
log(
  chalk.bgHex('#111111').hex('#00ff88').bold('  hakkan@terminal  ')
);
log(chalk.gray('  ' + '─'.repeat(42)));

// Intro
emptyLine();
log(
  chalk.bold.white('  Hey, I\'m ') +
    chalk.bold.cyan('Hakkan Parbej Shah') +
    chalk.white(' 👋')
);
log(
  chalk.gray('  Full Stack / MERN / Next.js Developer')
);

emptyLine();

// What I do
log(chalk.bold.yellow('  What I do:'));
log(
  '  ' +
    chalk.green('• ') +
    'Build ' +
    chalk.bold('production-ready web apps') +
    ' with ' +
    chalk.cyan('Next.js & MERN')
);
log(
  '  ' +
    chalk.green('• ') +
    'Create smooth, clean UI/UX for real users'
);
log(
  '  ' +
    chalk.green('• ') +
    'Play with ' +
    chalk.magenta('AI, dev tools & automation')
);

emptyLine();

// Tech stack
log(chalk.bold.yellow('  Tech I speak:'));
log(
  '  ' +
    chalk.hex('#DD4B39')('HTML') +
    ' · ' +
    chalk.hex('#0074D9')('CSS') +
    ' · ' +
    chalk.yellow('JavaScript / TypeScript')
);
log(
  '  ' +
    chalk.cyan('React, Next.js') +
    ' · ' +
    chalk.green('Node.js, Express') +
    ' · ' +
    chalk.hex('#fe5d1dff')('Firebase')
);

emptyLine();

// Current focus
log(chalk.bold.yellow('  Current focus:'));
log(
  '  ' +
    chalk.blue('• ') +
    'Shipping real-world projects consistently'
);
log(
  '  ' +
    chalk.blue('• ') +
    'Improving backend, scaling & performance'
);
log(
  '  ' +
    chalk.blue('• ') +
    'Building tools that devs actually use'
);

emptyLine();

// Links
log(
  chalk.bold.white('  Portfolio :  ') +
    chalk.underline.cyan('https://hakkan.is-a.dev')
);
log(
  chalk.bold.white('  GitHub    :  ') +
    chalk.underline.cyan('https://github.com/HakkanShah')
);
log(
  chalk.bold.white('  LinkedIn  :  ') +
    chalk.underline.cyan('https://www.linkedin.com/in/hakkan')
);
log(
  chalk.bold.white('  Email     :  ') +
    chalk.cyan('hakkanparbej@gmail.com')
);

emptyLine();

// Footer
log(chalk.gray('  ' + '─'.repeat(42)));
log(
  chalk.italic.gray('  Run via: ') +
    chalk.italic.cyan('npx hakkan')
);
log(
  chalk.italic.gray('  Let\'s build something cool. 🚀')
);
emptyLine();

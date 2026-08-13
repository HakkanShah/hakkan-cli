// Diagnostic: box-border alignment and OSC 8 hyperlink correctness.
// Run: node tools/width-probe.mjs
import stringWidth from 'string-width';

process.stdout.isTTY = true;
Object.defineProperty(process.stdout, 'columns', { value: 100, configurable: true });

const { connectScreen, projectsScreen, aboutScreen, skillsScreen, experienceScreen, educationScreen } =
  await import('../src/screens.js');
const { links } = await import('../src/data.js');

const ESC = String.fromCharCode(27);
const BEL = String.fromCharCode(7);

// --- 1. border alignment -----------------------------------------------------
const boxes = {
  about: aboutScreen, experience: experienceScreen, projects: projectsScreen,
  skills: skillsScreen, education: educationScreen, connect: connectScreen,
};

let bad = 0;
for (const [name, render] of Object.entries(boxes)) {
  const widths = new Set(render().split('\n').map((l) => stringWidth(l)));
  if (widths.size !== 1) {
    bad++;
    console.log(`${name.padEnd(12)} BAD  widths: ${[...widths].join(', ')}`);
  } else {
    console.log(`${name.padEnd(12)} OK   width ${[...widths][0]}`);
  }
}

// --- 2. hyperlinks -----------------------------------------------------------
const connect = connectScreen();
console.log('\nhyperlinks in CONNECT:');
let missing = 0;
for (const l of links) {
  const opener = `${ESC}]8;;${l.url}${BEL}`;
  const present = connect.includes(opener);
  if (!present) missing++;
  console.log(`  ${present ? 'OK  ' : 'MISS'} ${l.label.padEnd(11)} -> ${l.url}`);
}

const closers = connect.split(`${ESC}]8;;${BEL}`).length - 1;
console.log(`  closers: ${closers} (expect ${links.length})`);

const rawMailto = connect.includes('mailto:') &&
  stringWidth(connect.split('\n').find((l) => l.includes('Email')) ?? '') === 96;
console.log(`  email shows address not "mailto:" prefix: ${!/  mailto:/.test(connect)}`);

console.log(
  bad === 0 && missing === 0 && closers === links.length
    ? '\nPASS: borders aligned, all links wrapped in OSC 8'
    : '\nFAIL'
);

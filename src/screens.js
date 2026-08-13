// One renderer per section of the page. Each returns a string; index.js prints them.

import { c } from './theme.js';
import {
  about, education, experience, featuredProjects,
  highlights, links, profile, shortcutFor, skills,
} from './data.js';
import { chipRows, contentWidth, link, sectionBox, wrap } from './ui.js';

const inner = () => contentWidth() - 8;

export function aboutScreen() {
  const body = [
    c.white(wrap(about.join(' '), inner())),
    '',
    c.dim('─'.repeat(inner())),
    '',
    ...highlights.map((h) => c.accent('  ▸ ') + c.white(h)),
    '',
    c.cyan('  ◈ ') + c.dim(profile.location),
  ].join('\n');

  return sectionBox('ABOUT', body);
}

export function experienceScreen() {
  const lines = [];

  experience.forEach((job, i) => {
    const last = i === experience.length - 1;
    const connector = last ? '└─' : '├─';
    const spine = last ? '  ' : '│ ';
    const dot = job.current ? c.accent('●') : c.dim('○');

    lines.push(`${c.dim(connector)}${dot} ${c.bold.white(job.role)}`);
    lines.push(`${c.dim(spine)}  ${c.amber(job.company)}  ${c.dim('·')}  ${c.dim(job.period)}`);
    lines.push(`${c.dim(spine)}  ${c.muted(job.note)}`);
    if (!last) lines.push(c.dim(spine));
  });

  return sectionBox('EXPERIENCE', lines.join('\n'));
}

export function projectsScreen() {
  const lines = featuredProjects.flatMap((p) => [
    c.amber(`[${shortcutFor(p.url)}] `) + c.accent('◆ ') + c.bold.white(p.name) +
      '  ' + c.dim(p.tags.join(' · ')),
    '      ' + c.muted(wrap(p.blurb, inner() - 6).replaceAll('\n', '\n      ')),
    '      ' + link(c.cyan(p.url), p.url),
    '',
  ]);
  lines.pop();

  return sectionBox('PROJECTS', lines.join('\n'));
}

export function skillsScreen() {
  const blocks = skills.map(({ group, color, items }) =>
    c.bold.white(group) + '\n' + chipRows(items, color)
  );

  return sectionBox('SKILLS', blocks.join('\n\n'));
}

export function educationScreen() {
  const lines = education.flatMap((e) => [
    c.accent('▸ ') + c.bold.white(e.title),
    '  ' + c.amber(e.place),
    '  ' + c.dim(e.period) + '   ' + c.cyan(e.score),
    '',
  ]);
  lines.pop();

  return sectionBox('EDUCATION', lines.join('\n'));
}

export function connectScreen() {
  const width = Math.max(...links.map((l) => l.label.length));
  const lines = links.map(
    (l) => c.amber(`[${shortcutFor(l.url)}] `) + c.cyan(l.icon) + '  ' +
      c.bold.white(l.label.padEnd(width)) + '   ' + link(c.accent(l.value), l.url)
  );

  return sectionBox('CONNECT', lines.join('\n'));
}

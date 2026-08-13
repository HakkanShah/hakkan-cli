# npx hakkan 🚀 

> Hakkan Parbej Shah — Full Stack AI Engineer. My portfolio, right in your terminal.

[![npm version](https://img.shields.io/npm/v/hakkan.svg?style=flat-square)](https://www.npmjs.com/package/hakkan)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg?style=flat-square)](https://opensource.org/licenses/ISC)

## Quick Start 

You don't need to install anything! Just run:
 
```bash
npx hakkan
```

This will run the portfolio CLI directly in your terminal.

## Installation (Optional)

If you want to have it installed globally on your machine:

```bash
npm install -g hakkan
```

Then you can simply run:

```bash
hakkan
```

> Requires Node.js 22 or newer.

## Features

- **Types itself out**: The whole page reveals line by line, scrolls to the bottom, then rewinds to the top.
- **One page, scrollable**: About, Experience, Projects, Skills, Education and Connect — no menus to click through.
- **Click a link to open it**: Plain left-click on any project or link. Every link also has a one-key shortcut.
- **Colour-coded skill chips**: The whole stack, grouped and rendered as chips.
- **Profile photo in the terminal**: True inline graphics on Kitty/iTerm2/WezTerm, ANSI half-blocks everywhere else.
- **Responsive layout**: Adapts to terminal width *and* height, and redraws when you resize.
- **Pipe friendly**: `npx hakkan | cat` prints the whole page as plain text.

## Controls

| | |
|---|---|
| `↑` `↓` / `j` `k` / mouse wheel | scroll |
| `PgUp` `PgDn` / `space` | scroll a page |
| `g` / `G` | jump to top / bottom |
| click, or `1`–`9` `0` `e` | open a link |
| `q` / `Esc` / `Ctrl+C` | quit |

> Mouse reporting is enabled while it runs, so hold **Shift** to select text.

## Options

```bash
npx hakkan --no-image    # skip the avatar
npx hakkan --plain       # disable colour
npx hakkan --fast        # skip the intro animation
npx hakkan --help        # all options
```

## Tech Stack used to build this

- [Node.js](https://nodejs.org/) - Runtime environment
- [Chalk](https://www.npmjs.com/package/chalk) - Terminal styling
- [figlet](https://www.npmjs.com/package/figlet) + [gradient-string](https://www.npmjs.com/package/gradient-string) - ASCII banner
- [boxen](https://www.npmjs.com/package/boxen) - Bio box
- [terminal-image](https://www.npmjs.com/package/terminal-image) - Profile photo in the terminal
- [@inquirer/prompts](https://www.npmjs.com/package/@inquirer/prompts) - Interactive menu
- [ora](https://www.npmjs.com/package/ora) - Boot spinner
- [NPM](https://www.npmjs.com/) - Package Registry

## Author

**Hakkan Parbej Shah**
 
- Website: [hakkan.is-a.dev](https://hakkan.is-a.dev)
- GitHub: [@HakkanShah](https://github.com/HakkanShah)
- LinkedIn: [@hakkan](https://www.linkedin.com/in/hakkan)

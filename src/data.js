// Single source of truth for every piece of profile content the CLI renders.
// Sourced from https://hakkan.is-a.dev - update here and every screen follows.

export const profile = {
  name: 'HAKKAN PARBEJ SHAH',
  handle: 'HAKKAN',
  headline: 'Full Stack AI Engineer',
  role: 'Fullstack AI Engineer',
  company: 'Persist',
  companyUrl: 'https://hakkan.persist.org',
  since: 'Feb 2026',
  tagline: 'I treat the model, the backend and the pixels as one single product.',
  location: 'India - working remotely across four continents',
  website: 'https://hakkan.is-a.dev',
};

export const about = [
  'Fullstack AI Engineer at Persist, building AI products end to end:',
  'the agent that thinks, the backend that scales, and the interface',
  'humans actually enjoy using.',
];

export const highlights = [
  'Won Persist\'s Startupathon against 250+ builders (Feb 2026)',
  'Turned down two campus placements to join Persist',
  'Shipped two live products while finishing the degree',
  'B.Tech CSE, graduated July 2026',
];

export const experience = [
  {
    role: 'Fullstack AI Engineer',
    company: 'Persist',
    period: 'Feb 2026 - Present',
    current: true,
    note: 'Building AI products end to end - agent, backend and interface.',
  },
  {
    role: 'Full Stack Developer Intern',
    company: 'UDRCRAFTS INDIA PVT. LTD.',
    period: 'Previous',
    note: 'Full stack product work.',
  },
  {
    role: 'React & Next.js Developer Intern',
    company: 'AIKing Solutions',
    period: 'Previous',
    note: 'Frontend engineering with React and Next.js.',
  },
];

export const projects = [
  {
    name: 'OHMSchool',
    blurb: 'Adaptive K-12 learning platform with a 24/7 AI mentor',
    url: 'https://www.ohmschool.org/',
    tags: ['AI', 'EdTech', 'Next.js'],
  },
  {
    name: 'AURA',
    blurb: 'Chat and voice driven desktop agent that operates your computer through DOM reasoning',
    url: 'https://aura-website-ashen.vercel.app/',
    tags: ['AI Agent', 'DOM Reasoning', 'Desktop'],
  },
  {
    name: 'Commit Habit',
    blurb: 'GitHub App that keeps your activity streak alive, securely',
    url: 'https://commithabit.vercel.app',
    tags: ['GitHub App', 'Automation'],
  },
  {
    name: 'MockHick',
    blurb: 'Voice driven AI mock interview simulator',
    url: 'https://mockhick.vercel.app/',
    tags: ['AI', 'Speech-to-Text'],
  },
  {
    name: 'Throughput',
    blurb: 'Windows network speed overlay utility',
    url: 'https://github.com/HakkanShah/Throughput',
    tags: ['Desktop', 'C#', '.NET'],
  },
  {
    name: 'BuildMyCV',
    blurb: 'AI powered resume builder',
    url: 'https://cvbanao.netlify.app/',
    tags: ['AI', 'Web'],
  },
];

// The page shows the top five, in portfolio order. Change the count here.
export const featuredProjects = projects.slice(0, 5);

// Every openable URL gets a single-character shortcut, in page order. OSC 8
// hyperlinks need ctrl+click and are not honoured everywhere (Windows Terminal
// does not linkify the alternate screen buffer), so these keys are the reliable
// way to follow a link. Single characters only - a two-digit key would need
// input buffering. Must avoid j/k/g/G/q/Q/space, which scroll or quit.
const PROJECT_KEYS = ['1', '2', '3', '4', '5'];
const LINK_KEYS = ['6', '7', '8', '9', '0', 'e'];

export const skills = [
  { group: 'AI Engineering', color: '#ff5f8f', items: ['AI Agents', 'LLM Orchestration', 'RAG', 'Tool Use', 'DOM Reasoning', 'Speech-to-Text'] },
  { group: 'Frontend', color: '#4dd4ff', items: ['HTML5', 'CSS3', 'JavaScript', 'TypeScript', 'React.js', 'Next.js'] },
  { group: 'Backend', color: '#00ff88', items: ['Node.js', 'Express.js', 'Flask'] },
  { group: 'Desktop & Mobile', color: '#c792ea', items: ['React Native', 'Android', 'iOS', 'Electron', '.NET', 'C#'] },
  { group: 'Database', color: '#fca311', items: ['MongoDB', 'MySQL', 'PostgreSQL', 'Supabase', 'Redis', 'Firestore'] },
  { group: 'UI / UX', color: '#ff9ecd', items: ['Tailwind CSS', 'Framer Motion', 'shadcn/ui'] },
  { group: 'Tools', color: '#9aa5b1', items: ['Git', 'GitHub', 'VS Code', 'Firebase', 'Vercel', 'Netlify', 'Cursor'] },
  { group: 'Languages', color: '#ffd166', items: ['Java', 'C', 'Python'] },
];

export const education = [
  {
    title: 'B.Tech, Computer Science & Engineering',
    place: 'Greater Kolkata College of Engineering and Management',
    period: '2022 - 2026',
    score: 'CGPA 7.7 / 10',
  },
  {
    title: 'Higher Secondary',
    place: 'WBCHSE',
    period: '2022',
    score: '85%',
  },
  {
    title: 'Secondary',
    place: 'WBBSE',
    period: '2020',
    score: '80%',
  },
];

// Not rendered on the page right now - kept so the section can be restored
// without re-gathering it from the portfolio site.
export const certifications = [
  { title: 'Full-Stack MERN BCT Training', issuer: 'Euphoria GenX' },
  { title: 'AWS AI-ML Virtual Internship', issuer: 'Eduskills Foundation & AWS' },
  { title: 'Palo Alto Cybersecurity', issuer: 'Eduskills Foundation & Palo Alto' },
  { title: 'Blue Prism Automation', issuer: 'Eduskills Foundation & Blue Prism' },
  { title: 'Zscaler Zero Trust Security', issuer: 'Eduskills Foundation & Zscaler' },
];

// Icons must be glyphs that measure one cell. Emoji-presentation characters
// (✉ U+2709, ▪ U+25AA, ▫, ◼, ◻) render two cells wide in Windows Terminal while
// string-width reports one, which knocks the box border out of alignment.
// Verify any replacement with: node tools/width-probe.mjs
export const links = [
  { label: 'Portfolio', value: 'hakkan.is-a.dev', url: 'https://hakkan.is-a.dev', icon: '◈' },
  { label: 'GitHub', value: 'github.com/HakkanShah', url: 'https://github.com/HakkanShah', icon: '◆' },
  { label: 'LinkedIn', value: 'linkedin.com/in/hakkan', url: 'https://www.linkedin.com/in/hakkan/', icon: '▣' },
  { label: 'Google Dev', value: 'g.dev/hakkan', url: 'https://g.dev/hakkan', icon: '◇' },
  { label: 'Persist', value: 'hakkan.persist.org', url: 'https://hakkan.persist.org', icon: '❖' },
  { label: 'Email', value: 'hakkanparbej@gmail.com', url: 'mailto:hakkanparbej@gmail.com', icon: '●' },
];

// Page-order registry of everything that can be opened, each with its shortcut.
export const openable = [
  ...featuredProjects.map((p, i) => ({ label: p.name, url: p.url, key: PROJECT_KEYS[i] })),
  ...links.map((l, i) => ({ label: l.label, url: l.url, key: LINK_KEYS[i] })),
];

const keyByUrl = new Map(openable.map((o) => [o.url, o.key]));
export const shortcutFor = (url) => keyByUrl.get(url);

import { readFile, readdir, stat } from 'node:fs/promises';
import { join, resolve, extname } from 'node:path';

const root = resolve('dist');
const files = [];
async function walk(path) { for (const entry of await readdir(path, { withFileTypes: true })) { const target = join(path, entry.name); if (entry.isDirectory()) await walk(target); else files.push(target); } }
await walk(root);
const errors = [];
const pages = files.filter(file => file.endsWith('.html'));
for (const file of pages) {
  const content = await readFile(file, 'utf8');
  if (!content.includes('noindex')) errors.push(`${file}: review build is indexable`);
  for (const match of content.matchAll(/(?:src|href)="(\/[^"#?]*)(?:[?#][^"]*)?"/g)) {
    const path = decodeURIComponent(match[1]);
    const target = join(root, path.endsWith('/') ? `${path}index.html` : path);
    try { await stat(target); } catch { errors.push(`${file}: missing ${path}`); }
  }
  for (const match of content.matchAll(/srcset="([^"]+)"/g)) {
    for (const candidate of match[1].split(',')) {
      const path = candidate.trim().split(/\s+/)[0];
      if (!path.startsWith('/')) continue;
      try { await stat(join(root, path)); } catch { errors.push(`${file}: missing responsive asset ${path}`); }
    }
  }
}
for (const file of files.filter(file => ['.js', '.html', '.json', '.css'].includes(extname(file)))) {
  const content = await readFile(file, 'utf8');
  if (/sk-proj-[A-Za-z0-9_-]{20,}|api\.openai\.com|jquery|googletagmanager|google_translate_element/i.test(content)) errors.push(`${file}: credential or obsolete integration found`);
}
for (const path of ['', 'mill', 'journey', 'rice', 'gallery', 'contact']) {
  for (const locale of ['', 'ta']) { const target = join(root, locale, path, 'index.html'); try { await stat(target); } catch { errors.push(`Missing bilingual route ${target}`); } }
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`Verified ${pages.length} HTML pages, local links/assets, bilingual routes, noindex, and absence of legacy integrations or exposed API keys.`);

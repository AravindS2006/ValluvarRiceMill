import { readFile, readdir, stat } from 'node:fs/promises';
import { join, resolve, extname } from 'node:path';
import { createHash } from 'node:crypto';

const root = resolve('dist');
const base = `/${(process.env.SITE_BASE_PATH || '/').replace(/^\/+|\/+$/g, '')}/`.replace(/^\/\/$/, '/');
function localFile(path, file) {
  if (base !== '/' && !path.startsWith(base)) errors.push(`${file}: URL escapes deployment base: ${path}`);
  const relative = base === '/' ? path.slice(1) : path.slice(base.length);
  return join(root, relative.endsWith('/') || !relative ? `${relative}index.html` : relative);
}
const files = [];
async function walk(path) { for (const entry of await readdir(path, { withFileTypes: true })) { const target = join(path, entry.name); if (entry.isDirectory()) await walk(target); else files.push(target); } }
await walk(root);
const errors = [];
const reviewBuild = process.env.PUBLIC_REVIEW_BUILD !== 'false';
// Validate the actual deliverables, including mobile files that may not be
// fetched during a desktop review. Film two must never include its first 6s.
const cinema = JSON.parse(await readFile(join(root, 'media/cinematic/manifest.json'), 'utf8'));
for (const shot of cinema.assets) {
  const source = cinema.sources.find(source => source.id === shot.source);
  if (!source || shot.ranges.some(([start, end]) => start < source.excludedOpeningSeconds || end <= start)) errors.push(`Invalid cinematic source range: ${shot.name}`);
  for (const variant of ['desktop', 'mobile', 'portrait']) {
    const asset = shot[variant];
    if (!asset) continue;
    const bytes = await readFile(join(root, asset.src.slice(1)));
    if (bytes.length !== asset.bytes || createHash('sha256').update(bytes).digest('hex') !== asset.sha256) errors.push(`Cinematic asset does not match reviewed manifest: ${asset.src}`);
    let offset = 0; const atoms = [];
    while (offset + 8 <= bytes.length) {
      let size = bytes.readUInt32BE(offset); const type = bytes.toString('ascii', offset + 4, offset + 8);
      if (size === 1) size = Number(bytes.readBigUInt64BE(offset + 8));
      if (!size) break;
      atoms.push(type); offset += size;
    }
    if (!atoms.includes('moov') || !atoms.includes('mdat') || atoms.indexOf('moov') > atoms.indexOf('mdat')) errors.push(`Cinematic asset lacks fast-start metadata: ${asset.src}`);
  }
}
const pages = files.filter(file => file.endsWith('.html'));
for (const file of pages) {
  const content = await readFile(file, 'utf8');
  const publicPage = !file.endsWith('404.html') && content.includes('<main id="main">');
  if ((reviewBuild || !publicPage) && !content.includes('noindex')) errors.push(`${file}: should be noindex`);
  if (!reviewBuild && publicPage && (!content.includes('content="index, follow"') || content.includes('DESIGN PREVIEW'))) errors.push(`${file}: production metadata or preview state is incorrect`);
  for (const match of content.matchAll(/(?:src|href)="(\/[^"#?]*)(?:[?#][^"]*)?"/g)) {
    const path = decodeURIComponent(match[1]);
    const target = localFile(path, file);
    try { await stat(target); } catch { errors.push(`${file}: missing ${path}`); }
  }
  for (const match of content.matchAll(/srcset="([^"]+)"/g)) {
    for (const candidate of match[1].split(',')) {
      const path = candidate.trim().split(/\s+/)[0];
      if (!path.startsWith('/')) continue;
      try { await stat(localFile(path, file)); } catch { errors.push(`${file}: missing responsive asset ${path}`); }
    }
  }
}
const robots = await readFile(join(root, 'robots.txt'), 'utf8');
if (reviewBuild ? !robots.includes('Disallow: /') : (!robots.includes('Allow: /') || !robots.includes(`${base}sitemap.xml`))) errors.push('robots.txt does not match the build mode');
for (const file of files.filter(file => ['.js', '.html', '.json', '.css'].includes(extname(file)))) {
  const content = await readFile(file, 'utf8');
  if (/sk-proj-[A-Za-z0-9_-]{20,}|api\.openai\.com|jquery|googletagmanager|google_translate_element/i.test(content)) errors.push(`${file}: credential or obsolete integration found`);
}
for (const path of ['', 'mill', 'journey', 'rice', 'gallery', 'contact']) {
  for (const locale of ['', 'ta']) { const target = join(root, locale, path, 'index.html'); try { await stat(target); } catch { errors.push(`Missing bilingual route ${target}`); } }
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`Verified ${pages.length} HTML pages, deployment base ${base}, ${reviewBuild ? 'review' : 'production'} indexing, local links/assets, ${cinema.assets.length} cinematic edits and mobile variants, bilingual routes, and absence of legacy integrations or exposed API keys.`);

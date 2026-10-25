import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import { mkdir, writeFile } from 'node:fs/promises';

const origin = process.argv[2] || 'http://127.0.0.1:4322';
const chromePath = process.env.CHROME_PATH || (process.platform === 'win32' ? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' : undefined);
const chrome = await launch({ chromePath, chromeFlags: ['--headless=new', '--no-first-run', '--no-default-browser-check', '--disable-extensions'], logLevel: 'error' });
try {
  const results = [];
  for (const path of process.argv.length > 3 ? process.argv.slice(3) : ['/', '/ta/', '/contact/', '/journey/']) {
    const result = await lighthouse(`${origin}${path}`, { port: chrome.port, output: 'json', logLevel: 'error', onlyCategories: ['performance', 'accessibility'], formFactor: 'mobile' });
    const report = result.lhr;
    const issues = Object.values(report.audits).filter(audit => audit.score !== null && audit.score < 1 && ['binary', 'numeric'].includes(audit.scoreDisplayMode)).map(({ id, title, score, details }) => ({ id, title, score, items: details?.items?.slice(0, 5) }));
    const analysis = Object.fromEntries(['largest-contentful-paint-element', 'lcp-breakdown-insight', 'lcp-discovery-insight', 'network-dependency-tree-insight', 'render-blocking-insight'].filter(key => report.audits[key]).map(key => [key, report.audits[key].details]));
    results.push({ path, auditedAt: report.fetchTime, lighthouseVersion: report.lighthouseVersion, performance: report.categories.performance.score * 100, accessibility: report.categories.accessibility.score * 100, metrics: Object.fromEntries(['first-contentful-paint', 'largest-contentful-paint', 'total-blocking-time', 'cumulative-layout-shift', 'speed-index'].map(key => [key, report.audits[key].displayValue])), issues, analysis });
    console.log(`${path}: performance ${results.at(-1).performance}, accessibility ${results.at(-1).accessibility}`);
  }
  await mkdir('docs/qa', { recursive: true });
  await writeFile('docs/qa/lighthouse.json', `${JSON.stringify(results, null, 2)}\n`);
} finally { await Promise.resolve(chrome.kill()); }

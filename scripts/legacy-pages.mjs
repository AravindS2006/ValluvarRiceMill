import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const redirects = { 'about.html': '/mill/', 'products.html': '/rice/', 'gallery.html': '/gallery/', 'contact.html': '/contact/' };
await mkdir(resolve('public'), { recursive: true });
for (const [file, target] of Object.entries(redirects)) {
  await writeFile(resolve('public', file), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta http-equiv="refresh" content="0;url=${target}"><title>Valluvar — page moved</title><link rel="canonical" href="${target}"></head><body><p>This page has moved. <a href="${target}">Continue to Valluvar</a>.</p></body></html>\n`);
}

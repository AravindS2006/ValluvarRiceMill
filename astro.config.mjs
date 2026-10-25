import { defineConfig } from 'astro/config';

export default defineConfig({
  site: process.env.SITE_URL || 'http://localhost:4321',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  vite: { build: { chunkSizeWarningLimit: 600 } },
});

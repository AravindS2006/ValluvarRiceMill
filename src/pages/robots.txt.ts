import type { APIRoute } from 'astro';
import { business } from '../data/site';
import { withBase } from '../lib/paths';

export const GET: APIRoute = ({ site }) => new Response(
  business.reviewBuild ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\nSitemap: ${new URL(withBase('/sitemap.xml'), site).href}\n`,
  { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
);

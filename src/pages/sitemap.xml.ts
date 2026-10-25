import type { APIRoute } from 'astro';
import { pages, pathFor, type Locale } from '../data/site';
export const GET: APIRoute = ({ site }) => {
  const urls = (['en', 'ta'] as Locale[]).flatMap(locale => pages.map(page => `<url><loc>${new URL(pathFor(page, locale), site)}</loc></url>`)).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, { headers: { 'Content-Type': 'application/xml' } });
};

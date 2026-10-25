import type { APIRoute } from 'astro';
import { pathFor, type PageKey } from '../data/site';

export function getStaticPaths() {
  return Object.entries({ about: 'mill', products: 'rice', gallery: 'gallery', contact: 'contact' }).map(([legacy, page]) => ({ params: { legacy }, props: { page } }));
}
export const GET: APIRoute = ({ props, site }) => {
  const target = pathFor(props.page as PageKey);
  const canonical = new URL(target, site).href;
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta http-equiv="refresh" content="0;url=${target}"><title>Valluvar — page moved</title><link rel="canonical" href="${canonical}"></head><body><p>This page has moved. <a href="${target}">Continue to Valluvar</a>.</p></body></html>`, { headers: { 'Content-Type': 'text/html' } });
};

/** Resolve public assets and routes under Astro's configured deployment base. */
export function withBase(path: string, base = import.meta.env.BASE_URL || '/') {
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(path)) return path;
  const prefix = `/${base.replace(/^\/+|\/+$/g, '')}`.replace(/\/$/, '');
  return `${prefix}/${path.replace(/^\/+/, '')}`;
}

export function assetSrcset(candidates: string, base = import.meta.env.BASE_URL || '/') {
  return candidates.split(',').map(candidate => {
    const [path, ...descriptor] = candidate.trim().split(/\s+/);
    return [withBase(path, base), ...descriptor].join(' ');
  }).join(', ');
}

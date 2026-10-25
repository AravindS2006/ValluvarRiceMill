import { describe, expect, it } from 'vitest';
import { assetSrcset, withBase } from './paths';

describe('deployment paths', () => {
  it('supports root and GitHub project hosting', () => {
    expect(withBase('/media/paddy.mp4', '/')).toBe('/media/paddy.mp4');
    expect(withBase('/media/paddy.mp4', '/ValluvarRiceMill/')).toBe('/ValluvarRiceMill/media/paddy.mp4');
    expect(withBase('/ta/rice/', '/ValluvarRiceMill')).toBe('/ValluvarRiceMill/ta/rice/');
    expect(withBase('/', '/ValluvarRiceMill/')).toBe('/ValluvarRiceMill/');
  });
  it('preserves external destinations and fragment links', () => {
    for (const path of ['https://example.com/rice', 'mailto:sales@example.com', 'tel:+919000000000', '#chapter-1', '//example.com']) expect(withBase(path, '/project/')).toBe(path);
  });
  it('prefixes every responsive image candidate', () => {
    expect(assetSrcset('/media/paddy-640.webp 640w, /media/paddy.webp 1600w', '/ValluvarRiceMill/')).toBe('/ValluvarRiceMill/media/paddy-640.webp 640w, /ValluvarRiceMill/media/paddy.webp 1600w');
  });
});

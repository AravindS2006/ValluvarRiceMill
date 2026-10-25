// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

let preferences = { reduced: false, mobile: false, saveData: false };
let observers: MockIntersectionObserver[] = [];
class MockIntersectionObserver {
  callback: IntersectionObserverCallback;
  targets: Element[] = [];
  constructor(callback: IntersectionObserverCallback) { this.callback = callback; observers.push(this); }
  observe(target: Element) { this.targets.push(target); }
  unobserve() {} disconnect() {}
  emit(target: Element, ratio: number) { this.callback([{ target, intersectionRatio: ratio, isIntersecting: ratio > 0 } as IntersectionObserverEntry], this as unknown as IntersectionObserver); }
}
const fixture = () => `<div data-video-shell><video data-lazy-video data-src="/media/paddy.mp4" data-mobile-src="/media/paddy-mobile.mp4"></video><button data-video-toggle><span data-video-icon></span><span data-video-label></span></button><span class="video-failure" hidden>Video unavailable</span></div>`;
const video = () => document.querySelector('video')!;
async function mount(extra = '') {
  document.body.innerHTML = fixture() + extra; document.body.dataset.locale = 'en';
  await import('./site');
  observers[0].emit(video(), .9);
  await Promise.resolve();
}
beforeEach(() => {
  vi.resetModules(); observers = []; preferences = { reduced: false, mobile: false, saveData: false };
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  vi.stubGlobal('matchMedia', vi.fn((query: string) => ({ matches: query.includes('prefers-reduced') ? preferences.reduced : query.includes('max-width') ? preferences.mobile : true, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
  Object.defineProperty(navigator, 'connection', { configurable: true, get: () => ({ saveData: preferences.saveData }) });
  Object.defineProperty(document, 'hidden', { configurable: true, value: false });
  vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {});
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(function(this: HTMLMediaElement) { Object.defineProperty(this, 'paused', { configurable: true, value: false }); this.dispatchEvent(new Event('playing')); return Promise.resolve(); });
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(function(this: HTMLMediaElement) { Object.defineProperty(this, 'paused', { configurable: true, value: true }); this.dispatchEvent(new Event('pause')); });
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); document.body.innerHTML = ''; });

describe('media loading and fallback behaviour', () => {
  it('autoplays only a visible clip and pauses it when it leaves view', async () => {
    await mount(); expect(video().getAttribute('src')).toBe('/media/paddy.mp4'); expect(video().paused).toBe(false);
    observers[0].emit(video(), 0); expect(video().paused).toBe(true);
  });
  it('autoplays muted inline video on mobile', async () => {
    preferences.mobile = true; await mount();
    expect(video().getAttribute('src')).toBe('/media/paddy-mobile.mp4'); expect(video().paused).toBe(false);
    expect(video().muted).toBe(true); expect(video().defaultMuted).toBe(true);
  });
  it.each(['reduced', 'saveData'] as const)('does not download autoplay video with %s preference', async preference => {
    preferences[preference] = true; await mount(); expect(video().getAttribute('src')).toBeNull();
    document.querySelector<HTMLButtonElement>('[data-video-toggle]')!.click(); await Promise.resolve();
    expect(video().getAttribute('src')).toBe('/media/paddy.mp4'); expect(video().paused).toBe(false);
  });
  it('keeps a working play button when browser autoplay is blocked', async () => {
    vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValueOnce(new Error('Autoplay blocked'));
    await mount(); await Promise.resolve();
    expect(document.querySelector('[data-video-toggle]')!.getAttribute('aria-label')).toBe('Play motion');
    document.querySelector<HTMLButtonElement>('[data-video-toggle]')!.click(); await Promise.resolve(); expect(video().paused).toBe(false);
  });
  it('exposes the failure message and retains the poster shell after a failed video', async () => {
    await mount(); video().dispatchEvent(new Event('error'));
    expect(document.querySelector<HTMLElement>('.video-failure')!.hidden).toBe(false);
    expect(document.querySelector<HTMLButtonElement>('[data-video-toggle]')!.hidden).toBe(true);
    expect(document.querySelector('[data-video-shell]')!.classList.contains('is-playing')).toBe(false);
  });
  it('respects an explicit pause when the visible intersection changes', async () => {
    await mount(); document.querySelector<HTMLButtonElement>('[data-video-toggle]')!.click(); observers[0].emit(video(), .8);
    expect(video().paused).toBe(true);
  });
  it('keeps grain stage explanations operable when WebGL is unavailable', async () => {
    preferences.mobile = true;
    await mount(`<div data-scene="grain"><div class="scene-viewport"><canvas></canvas><div data-scene-fallback>Husk, bran, and white endosperm</div><button data-scene-motion><span data-motion-label></span><span aria-hidden="true"></span></button><button data-scene-activate>Explore in 3D</button></div><button data-scene-stage="0" aria-pressed="true">Paddy</button><button data-scene-stage="1" aria-pressed="false">Brown rice</button><p data-stage-description data-descriptions='["Paddy with husk","Brown rice retains bran"]'>Paddy with husk</p></div>`);
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    const { mountScene } = await import('./scenes'); mountScene(document.querySelector<HTMLElement>('[data-scene]')!);
    document.querySelector<HTMLButtonElement>('[data-scene-stage="1"]')!.click();
    expect(document.querySelector('[data-stage-description]')!.textContent).toBe('Brown rice retains bran');
    expect(document.querySelector('[data-scene]')!.classList.contains('is-ready')).toBe(false);
    expect(document.querySelector<HTMLElement>('[data-scene-activate]')!.hidden).toBe(true);
  });
  it('selects the prepared enquiry when clipboard access is unavailable', async () => {
    const form = `<form id="enquiry-form" data-locale="en" data-whatsapp=""><input name="name" value="Preview Buyer"><input name="businessName" value="Preview Store"><input name="phone" value="+91 90000 00000"><select name="product"><option value="choose">Help me choose</option></select><input name="quantity" value="10"><select name="unit"><option value="kg">kg</option></select><input name="destination" value="Dharapuram"><input name="message" value=""><span data-form-status></span><button type="submit">Prepare</button></form><section data-enquiry-result hidden tabindex="-1"><p data-handoff-note></p><textarea id="enquiry-summary"></textarea><a data-whatsapp-link hidden></a><button data-copy-enquiry>Copy</button><p data-copy-status></p></section>`;
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, value: vi.fn() });
    await mount(form);
    document.querySelector<HTMLFormElement>('#enquiry-form')!.requestSubmit();
    document.querySelector<HTMLButtonElement>('[data-copy-enquiry]')!.click(); await Promise.resolve();
    const summary = document.querySelector<HTMLTextAreaElement>('#enquiry-summary')!;
    expect(document.activeElement).toBe(summary); expect(summary.selectionStart).toBe(0); expect(summary.selectionEnd).toBe(summary.value.length);
    expect(document.querySelector('[data-copy-status]')!.textContent).toContain('select and copy');
    expect(document.querySelector<HTMLElement>('[data-whatsapp-link]')!.hidden).toBe(true);
  });
});

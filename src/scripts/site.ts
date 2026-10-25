import { ui, type Locale } from '../data/site';
import { composeEnquiry, selectedProduct, validateEnquiry, whatsappLink, type Enquiry } from '../lib/enquiry';

const locale: Locale = document.body.dataset.locale === 'ta' ? 'ta' : 'en';
const copy = ui[locale];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const mobileMedia = window.matchMedia('(max-width: 650px)');
const header = document.querySelector<HTMLElement>('.site-header');
const menu = document.querySelector<HTMLButtonElement>('.menu-toggle');
const closeMenu = () => { header?.classList.remove('nav-open'); menu?.setAttribute('aria-expanded', 'false'); };
menu?.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; header?.classList.toggle('nav-open', open); menu.setAttribute('aria-expanded', String(open)); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && header?.classList.contains('nav-open')) { closeMenu(); menu?.focus(); } });
document.addEventListener('click', event => { if (header && !header.contains(event.target as Node)) closeMenu(); });
window.matchMedia('(min-width: 901px)').addEventListener('change', closeMenu);

// Native dialogs provide Escape handling and focus containment. Explicitly restore focus.
document.querySelectorAll<HTMLButtonElement>('[data-open-dialog]').forEach(button => {
  const dialog = document.getElementById(button.dataset.openDialog!) as HTMLDialogElement | null;
  button.addEventListener('click', () => { dialog?.showModal(); });
  dialog?.querySelector('[data-close-dialog]')?.addEventListener('click', () => dialog.close());
  dialog?.addEventListener('close', () => button.focus());
  dialog?.addEventListener('click', event => { const bounds = dialog.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close(); });
});

interface VideoState { video: HTMLVideoElement; shell: HTMLElement; button: HTMLButtonElement; ratio: number; pausedByUser: boolean; explicitPlay: boolean; failed: boolean }
const videos: VideoState[] = [];
const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
function setVideoState(state: VideoState, playing: boolean) {
  state.shell.classList.toggle('is-playing', playing);
  const label = playing ? copy.pause : copy.resume;
  state.button.setAttribute('aria-label', label);
  state.button.setAttribute('aria-pressed', String(playing));
  const icon = state.button.querySelector('[data-video-icon]'); if (icon) icon.textContent = playing ? 'Ⅱ' : '▶';
  const text = state.button.querySelector('[data-video-label]'); if (text) text.textContent = label;
}
async function play(state: VideoState) {
  if (state.failed) return;
  state.video.muted = true;
  state.video.defaultMuted = true;
  state.video.playsInline = true;
  if (!state.video.src) { state.video.src = mobileMedia.matches && state.video.dataset.mobileSrc ? state.video.dataset.mobileSrc : state.video.dataset.src!; state.video.load(); }
  try { await state.video.play(); } catch { setVideoState(state, false); }
}
function reconcileVideos() {
  const active = videos.filter(v => v.ratio >= .2 && !v.pausedByUser && !v.failed && (v.explicitPlay || (!reducedMotion.matches && !connection?.saveData))).sort((a, b) => b.ratio - a.ratio)[0];
  videos.forEach(state => { if (state === active && !document.hidden) { if (state.video.paused) void play(state); } else state.video.pause(); });
}
const videoObserver = new IntersectionObserver(entries => { entries.forEach(entry => { const state = videos.find(v => v.video === entry.target); if (state) state.ratio = entry.intersectionRatio; }); reconcileVideos(); }, { threshold: [0, .2, .5, .8, 1] });
document.querySelectorAll<HTMLVideoElement>('[data-lazy-video]').forEach(video => {
  const shell = video.closest<HTMLElement>('[data-video-shell]')!;
  const button = shell.querySelector<HTMLButtonElement>('[data-video-toggle]')!;
  const state: VideoState = { video, shell, button, ratio: 0, pausedByUser: false, explicitPlay: false, failed: false };
  videos.push(state);
  video.addEventListener('playing', () => setVideoState(state, true));
  video.addEventListener('pause', () => setVideoState(state, false));
  video.addEventListener('error', () => { state.failed = true; setVideoState(state, false); shell.querySelector<HTMLElement>('.video-failure')!.hidden = false; button.hidden = true; });
  button.addEventListener('click', () => { if (!video.paused) { state.pausedByUser = true; video.pause(); } else { state.pausedByUser = false; state.explicitPlay = true; videos.forEach(other => { if (other !== state) other.video.pause(); }); void play(state); } });
  videoObserver.observe(video);
});
document.addEventListener('visibilitychange', reconcileVideos);
reducedMotion.addEventListener('change', () => { videos.forEach(v => v.explicitPlay = false); reconcileVideos(); });
mobileMedia.addEventListener('change', reconcileVideos);

const form = document.querySelector<HTMLFormElement>('#enquiry-form');
if (form) {
  const productInput = form.elements.namedItem('product') as HTMLSelectElement;
  productInput.value = selectedProduct(new URLSearchParams(location.search).get('product'));
  const result = document.querySelector<HTMLElement>('[data-enquiry-result]')!;
  const summary = document.querySelector<HTMLTextAreaElement>('#enquiry-summary')!;
  const status = form.querySelector<HTMLElement>('[data-form-status]')!;
  form.addEventListener('submit', event => {
    event.preventDefault();
    const raw = new FormData(form);
    const data = Object.fromEntries([...raw].map(([key, value]) => [key, String(value).trim()])) as unknown as Enquiry;
    const errors = validateEnquiry(data, locale);
    form.querySelectorAll('[aria-invalid]').forEach(field => field.removeAttribute('aria-invalid'));
    form.querySelectorAll('.field-error').forEach(error => error.textContent = '');
    status.textContent = '';
    if (Object.keys(errors).length) {
      result.hidden = true;
      for (const [field, message] of Object.entries(errors)) { const input = form.elements.namedItem(field) as HTMLElement; input?.setAttribute('aria-invalid', 'true'); const error = document.getElementById(`${field}-error`); if (error) error.textContent = message; }
      status.textContent = copy.required;
      form.querySelector<HTMLElement>('[aria-invalid=true]')?.focus();
      return;
    }
    summary.value = composeEnquiry(data, locale);
    const link = whatsappLink(form.dataset.whatsapp || '', summary.value);
    const whatsapp = document.querySelector<HTMLAnchorElement>('[data-whatsapp-link]')!;
    whatsapp.hidden = !link;
    if (link) whatsapp.href = link;
    document.querySelector<HTMLElement>('[data-handoff-note]')!.textContent = link ? copy.handoffNote : copy.noSend;
    document.querySelector<HTMLElement>('[data-copy-status]')!.textContent = '';
    result.hidden = false;
    result.focus({ preventScroll: true });
    result.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'center' });
  });
  // A prepared message must never silently become stale when fields change.
  form.addEventListener('input', () => { result.hidden = true; });
  document.querySelector('[data-copy-enquiry]')?.addEventListener('click', async () => {
    const status = document.querySelector<HTMLElement>('[data-copy-status]')!;
    try { if (!navigator.clipboard) throw new Error('Clipboard unavailable'); await navigator.clipboard.writeText(summary.value); status.textContent = copy.copied; }
    catch { summary.focus(); summary.select(); status.textContent = copy.copyFailed; }
  });
}

const chapters = document.querySelectorAll<HTMLElement>('[data-chapter]');
if (chapters.length) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    document.querySelectorAll('[data-chapter-link]').forEach(link => { if ((link as HTMLElement).dataset.chapterLink === (entry.target as HTMLElement).dataset.chapter) link.setAttribute('aria-current', 'step'); else link.removeAttribute('aria-current'); });
    document.querySelectorAll<HTMLElement>('[data-journey-panel]').forEach(panel => { panel.hidden = panel.dataset.journeyPanel !== (entry.target as HTMLElement).dataset.chapter; });
  }), { rootMargin: '-15% 0px -60% 0px' });
  chapters.forEach(chapter => observer.observe(chapter));
}

const scenes = document.querySelectorAll<HTMLElement>('[data-scene]');
if (scenes.length) {
  scenes.forEach(scene => {
    scene.dataset.motion = String(!reducedMotion.matches);
    const motion = scene.querySelector<HTMLButtonElement>('[data-scene-motion]')!;
    const refreshMotion = () => { const enabled = scene.dataset.motion === 'true'; motion.setAttribute('aria-pressed', String(enabled)); motion.querySelector('[data-motion-label]')!.textContent = enabled ? copy.pause : copy.resume; motion.querySelector('span[aria-hidden]')!.textContent = enabled ? 'Ⅱ' : '▶'; };
    refreshMotion();
    motion.addEventListener('click', () => { scene.dataset.motion = String(scene.dataset.motion !== 'true'); refreshMotion(); scene.dispatchEvent(new Event('rice-motion')); });
    reducedMotion.addEventListener('change', () => { scene.dataset.motion = String(!reducedMotion.matches); refreshMotion(); scene.dispatchEvent(new Event('rice-motion')); });
    scene.querySelectorAll<HTMLButtonElement>('[data-scene-stage]').forEach(button => button.addEventListener('click', () => {
      scene.dataset.stage = button.dataset.sceneStage;
      scene.querySelectorAll('[data-scene-stage]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      const description = scene.querySelector<HTMLElement>('[data-stage-description]');
      if (description) description.textContent = JSON.parse(description.dataset.descriptions!)[Number(button.dataset.sceneStage)];
      scene.dispatchEvent(new Event('rice-stage'));
    }));
  });
  const activate = (scene: HTMLElement) => {
    if (scene.dataset.loading === 'true') return;
    scene.dataset.loading = 'true';
    const button = scene.querySelector<HTMLButtonElement>('[data-scene-activate]')!;
    button.disabled = true;
    void import('./scenes').then(module => module.mountScene(scene)).catch(() => { button.hidden = true; scene.querySelector<HTMLElement>('[data-scene-motion]')!.hidden = true; });
  };
  scenes.forEach(scene => scene.querySelector('[data-scene-activate]')?.addEventListener('click', () => activate(scene)));
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    observer.unobserve(entry.target);
    if (!mobileMedia.matches && !connection?.saveData) activate(entry.target as HTMLElement);
  }), { rootMargin: '0px' });
  scenes.forEach(scene => observer.observe(scene));
}

if (document.querySelector('.hero') && !reducedMotion.matches && !mobileMedia.matches) {
  void import('gsap').then(({ gsap }) => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.hero h1 span', { y: 24, duration: 1.2, stagger: .1, ease: 'power2.out', clearProps: 'all' });
      gsap.from('.earth-seal', { rotation: -10, duration: 2, ease: 'power2.out', clearProps: 'transform' });
    });
  });
}

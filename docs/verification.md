# Verification report

## Real cinematic footage update — 26 October 2026

The user-supplied films were reviewed in contact sheets and individual frames
before editing. The complete second film is trimmed from 114.13 to **108.13
seconds**, removing its first six seconds while retaining its remaining audio.
All website excerpts from that film begin after source second 21. The original
files are untouched; the full trimmed cut stays in ignored `.cache/edits/`.

- All **11 delivery videos** decode successfully with no errors. Dimensions and
  durations match the manifest; all website variants have no audio. Source
  frame rates, original forward motion, and colours are retained. The asset
  verifier checks content hashes, sizes, permitted source ranges, and fast-start
  MP4 atom order in CI.
- `npm run check`: **0 errors, 0 warnings, 0 hints**. All **27 existing tests
  pass**, covering playback policy, fallback behaviour, enquiry, and paths.
- Root and `/ValluvarRiceMill/` builds pass all **17 HTML document checks**,
  including new video files, responsive posters, captions, and navigation.
- **40 responsive checks** on the affected English and Tamil home, mill,
  journey, gallery, and contact pages at 360/390/768/1440px found no horizontal
  overflow, broken loaded images, or media errors.
- Actual desktop home playback: `cinematic/aerial.mp4`, readyState 4, 1280×720,
  advancing beyond 5 seconds. The story section automatically starts planting
  footage and pauses the offscreen hero. Pause/resume controls were exercised.
- Actual Tamil mobile home playback: `aerial-portrait.mp4`, **720×960**, muted,
  readyState 4, unpaused. Its matching portrait poster loads without distortion.
- The mobile growth chapter plays `growing-mobile.mp4`; desktop sticky chapter
  navigation selects the real ripening footage and updates the current stage.
- Project-path mobile playback reached **6.2637 seconds**, readyState 4,
  unpaused and muted, from
  `/ValluvarRiceMill/media/cinematic/aerial-portrait.mp4`.
- The project-path planting lightbox loads its new still, closes correctly,
  and restores focus to its opener. Both film credits are visible in the gallery.
- Browser warning/error logs were empty. Reduced-motion, Save-Data, blocked
  autoplay and failure fallback logic remains unchanged and covered by tests.
- Lighthouse mobile (12.8.2): **English home 97 performance / 100 accessibility;
  Tamil home 97 / 100; journey 100 / 100**. These are local lab results.

Evidence: [responsive checks](qa/cinematic-responsive.json),
[encoding checks](qa/cinematic-encoding.json),
[Pages playback](qa/cinematic-pages-playback.json),
[Lighthouse](qa/lighthouse.json),
[edited frame contact sheet](qa/cinematic-edit-contact.jpg),
[desktop](qa/cinematic-desktop.jpg), [story](qa/cinematic-story.jpg),
[Tamil mobile](qa/cinematic-tamil-mobile.jpg), [journey](qa/cinematic-journey.jpg).

## Previous product and Pages verification — 25 October 2026

Verified on 25 October 2026 against the local production build, served at
`http://127.0.0.1:4322/`, plus the project-path preview at
`http://127.0.0.1:4323/ValluvarRiceMill/`. These fixes are submitted for review;
the existing Pages workflow applies them after merge. No customer message was sent.

## Automated checks

| Check | Result |
| --- | --- |
| `npm run check` | 0 errors, 0 warnings, 0 hints |
| `npm test` | 27 tests passed across path, enquiry, and DOM behaviour suites |
| `npm run build` | Static production build succeeded |
| `npm run verify:site` | 17 HTML documents checked, including 12 bilingual pages, four legacy redirects, and the 404 page |
| Local URLs and assets | Root and `/ValluvarRiceMill/` builds pass, including media sources, captions, responsive images, and legacy redirects |
| Review indexing | All HTML documents retain noindex; robots.txt blocks crawling |
| Retired integrations | No exposed OpenAI credential, chatbot endpoint, jQuery, old analytics, or Google Translate widget in build output |
| `git diff --check` | Passed |

Tests cover valid/invalid phone and quantity inputs, fractional bag rejection,
text limits, bilingual messages, unknown product identifiers, query preselection,
WhatsApp encoding and absent destinations, and selection fallback when clipboard
access is unavailable. DOM tests also cover reduced-motion, Save-Data, mobile
tap-to-play, blocked autoplay, failed-video fallback, explicit pause, offscreen
pause, and stage explanations when WebGL is unavailable.

## Browser verification

The complete six-page English and Tamil sets were checked at **1440, 768, 390,
and 360 CSS pixels** under both root and project hosting: **96 route/viewport
combinations**, with no horizontal overflow or broken loaded image. Project
hosting also checks that internal navigation stays under `/ValluvarRiceMill/`.
Machine-readable results are in [root results](qa/followup-root-responsive.json)
and [Pages results](qa/followup-pages-responsive.json).

The full enquiry story was exercised in the in-app browser:

1. Open a product dialog, then follow its enquiry action.
2. Confirm the selected product carries into the form.
3. Submit an empty form and confirm field errors and focus on the first error.
4. Prepare a valid enquiry and inspect its English summary.
5. Copy it and confirm the UI says the message has not been sent.
6. Repeat with a Tamil enquiry and a confirmed 26 kg product.
7. Confirm no WhatsApp action is offered without a configured destination.

Additional browser checks confirmed mobile menu Escape handling, gallery
lightbox closing and focus restoration, all three growth stages, mobile explicit
3D activation, the sticky chapter panel's harvest stage, grain-layer changes,
and ArrowRight keyboard rotation. Captured browser error logs were empty.
Slow mobile loading is exercised by Lighthouse's simulated mobile throttling;
failure and reduced-motion conditions are exercised through controlled DOM tests.

Follow-up checks verified the new boiled/broken product photos, both 26 kg
options in the enquiry selector, Broken Rice preselection under the project
path, and the `about.html` redirect to the project-path mill page. Muted mobile
autoplay was observed with `readyState=4`, playback advancing to 7.12 seconds,
and `/ValluvarRiceMill/media/paddy-mobile.mp4` as the actual source. Browser
error logs were empty. The Tamil headline now has three inherited 39.48px lines
at 390px width (118.39px total), removing the language-wide spacing override.

## Lighthouse mobile measurements

Lighthouse **12.8.2**, headless Microsoft Edge, local production preview,
default simulated mobile throttling. These are laboratory measurements; they
are not measurements of an eventual public host or every physical device.

| Page | Performance | Accessibility |
| --- | ---: | ---: |
| English home | 98 | 100 |
| Tamil home | 97 | 100 |
| Contact | 100 | 100 |
| Rice journey | 97 | 100 |

Full compact audit results and loading diagnostics are in
[qa/lighthouse.json](qa/lighthouse.json). Reproduce with:

```powershell
npm run preview
node scripts/audit.mjs http://127.0.0.1:4321
```

The audit script uses installed Microsoft Edge on Windows. Elsewhere, provide
`CHROME_PATH` if Chrome Launcher cannot locate a compatible browser. Optional
route arguments limit an investigation to selected pages.

Key optimizations include responsive 640/960/1600px posters, deferred video
downloads, 640px mobile autoplay videos, tap-to-start mobile 3D, preloaded local fonts,
one playing video at a time, capped renderer resolution, and offscreen pause.
The initial shared client module is about 11 kB gzipped. The roughly 126 kB
gzipped Three.js scene bundle is loaded separately when needed.

## Screenshots

- [Desktop homepage](qa/desktop-home.jpg)
- [Mobile homepage](qa/mobile-home.jpg)
- [Tamil mobile homepage](qa/tamil-mobile.jpg)
- [3D rice growth](qa/rice-journey.jpg)
- [Sticky lifecycle chapter](qa/lifecycle-desktop.jpg)
- [Grain-layer explorer](qa/grain-explorer.jpg)
- [Confirmed product bags](qa/followup-products-desktop.jpg)
- [Product photograph in detail dialog](qa/followup-product-dialog.jpg)
- [Corrected Tamil mobile hero](qa/followup-tamil-mobile.jpg)

## Remaining client launch inputs

Sales contact, additional product specifications and pricing, approved website
brand artwork, exact visitor directions, facility imagery, and final Tamil
editorial review remain pending. The two 26 kg products and photos are confirmed.
Field media remains illustrative. The old exposed API credential needs revocation by its owner;
removing current source does not revoke it or erase its Git history.

# Verification report

Verified on 25 October 2026 against the local production build, served at
`http://127.0.0.1:4322/`. No public deployment or real customer message was sent.

## Automated checks

| Check | Result |
| --- | --- |
| `npm run check` | 0 errors, 0 warnings, 0 hints |
| `npm test` | 24 tests passed across enquiry and DOM behaviour suites |
| `npm run build` | Static production build succeeded |
| `npm run verify:site` | 17 HTML documents checked, including 12 bilingual pages, four legacy redirects, and the 404 page |
| Local URLs and assets | All generated page links, responsive image candidates, and referenced assets found |
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
and 360 CSS pixels**: 48 route/viewport combinations, with no horizontal
overflow, missing heading, or broken loaded image. Machine-readable results
are in [qa/responsive.json](qa/responsive.json).

The full enquiry story was exercised in the in-app browser:

1. Open a product dialog, then follow its enquiry action.
2. Confirm the selected product carries into the form.
3. Submit an empty form and confirm field errors and focus on the first error.
4. Prepare a valid enquiry and inspect its English summary.
5. Copy it and confirm the UI says the message has not been sent.
6. Repeat with a Tamil enquiry and Special Rajabogam preselection.
7. Confirm no WhatsApp action is offered without a configured destination.

Additional browser checks confirmed mobile menu Escape handling, gallery
lightbox closing and focus restoration, all three growth stages, mobile explicit
3D activation, the sticky chapter panel's harvest stage, grain-layer changes,
and ArrowRight keyboard rotation. Captured browser error logs were empty.
Slow mobile loading is exercised by Lighthouse's simulated mobile throttling;
failure and reduced-motion conditions are exercised through controlled DOM tests.

## Lighthouse mobile measurements

Lighthouse **12.8.2**, headless Microsoft Edge, local production preview,
default simulated mobile throttling. These are laboratory measurements; they
are not measurements of an eventual public host or every physical device.

| Page | Performance | Accessibility |
| --- | ---: | ---: |
| English home | 98 | 100 |
| Tamil home | 96 | 100 |
| Contact | 100 | 100 |
| Rice journey | 100 | 100 |

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
downloads, mobile tap-to-start media and 3D, preloaded critical local fonts,
one playing video at a time, capped renderer resolution, and offscreen pause.
The initial shared client module is about 10.5 kB gzipped. The roughly 126 kB
gzipped Three.js scene bundle is loaded separately when needed.

## Screenshots

- [Desktop homepage](qa/desktop-home.jpg)
- [Mobile homepage](qa/mobile-home.jpg)
- [Tamil mobile homepage](qa/tamil-mobile.jpg)
- [3D rice growth](qa/rice-journey.jpg)
- [Sticky lifecycle chapter](qa/lifecycle-desktop.jpg)
- [Grain-layer explorer](qa/grain-explorer.jpg)

## Remaining client launch inputs

Sales contact, catalogue confirmation, approved brand artwork, exact visitor
directions, client-specific imagery, and final Tamil editorial review remain
pending. Products are marked provisional and field media is identified as
illustrative. The old exposed API credential needs revocation by its owner;
removing current source does not revoke it or erase its Git history.

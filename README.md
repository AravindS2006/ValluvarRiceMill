# Valluvar — The journey of a grain

A complete English/Tamil redesign for Valluvar brand, Thirumurugan Modern Rice
Mill, Dharapuram. Built with Astro, TypeScript, custom CSS, GSAP, and Three.js.
All pages are rendered as static HTML. Public deployment is intentionally deferred.

## Run locally

Requires Node.js 22.14+ and npm.

```powershell
npm ci
npm run dev
```

Open the local URL printed by Astro (normally `http://127.0.0.1:4321`).

```powershell
npm run check
npm test
npm run build
npm run verify:site
npm run preview
```

The Astro launcher disables optional CLI telemetry and avoids writing Astro
settings to the user's profile. Dependencies are locked in `package-lock.json`.
Undici stays on its Node 22.14-compatible major for Astro's transitive font utility.

## Structure and behaviour

- `/`, `/mill/`, `/journey/`, `/rice/`, `/gallery/`, `/contact/` and Tamil
  equivalents under `/ta/`.
- `/index.html` continues to be the home document. Legacy `about.html`,
  `products.html`, `gallery.html`, and `contact.html` entry points redirect to
  their replacement pages. Redirect source is reproducible with
  `node scripts/legacy-pages.mjs`.
- `src/data/site.ts` holds the bilingual copy, business configuration, product
  confirmation status, FAQs, and lifecycle chapters.
- `src/lib/enquiry.ts` validates requirements, prepares bilingual messages,
  and constructs encoded WhatsApp links. It does not send or store enquiries.
- Three.js is loaded only near the journey illustrations. Video is loaded on
  visibility; only one clip plays at a time. Small screens, reduced motion,
  and Save-Data preferences suppress autoplay. Mobile 3D starts on an explicit
  tap. Posters, explanatory text, and stage labels
  remain available if playback or WebGL fails.
- Product dialogs and gallery lightboxes use native HTML dialogs. The 3D grain
  has labelled stage buttons and a keyboard-operable rotation range control.

## Client review and launch configuration

The preview intentionally has `noindex, nofollow` and a blocking `robots.txt`.
The canonical and sitemap origin defaults to the local preview. To generate
metadata for another review origin, set `SITE_URL` before building. For example:

```powershell
$env:SITE_URL = 'https://confirmed-client-domain.example'
npm run build
```

Before a public launch:

1. Confirm sales contacts, exact visitor directions, product names, pack sizes,
   artwork, and any client-specific facility claims. Provisional products are
   labelled in the UI; current catalogue entries are based on retailer listings.
2. Enter the confirmed international sales number as digits only in
   `business.whatsapp`. An empty or invalid number keeps the WhatsApp action
   unavailable and preserves the copy-message fallback.
3. Set the confirmed public `SITE_URL`, change `business.reviewBuild` to `false`,
   and deliberately replace `public/robots.txt` for indexing. Revisit the static
   verifier's review-only `noindex` assertion when making that launch change.
4. Review Tamil copy with the client, especially preferred product spelling.
5. Revoke the old OpenAI credential that was embedded in the retired chatbot.
   It was removed from current source; its historical exposure remains in Git.
   History was not rewritten.

The website contains no account system, shopping cart, backend, analytics,
chatbot API, or customer-data storage.

## Research, media, and verification

- [Research and client fact ledger](docs/research.md)
- [Media sources, licenses, and reproducible preparation](docs/asset-provenance.md)
- [Verification and browser evidence](docs/verification.md)

All included field footage and rice photography are illustrative stock media;
they do not establish the appearance of client premises or a particular product.
Fontsource supplies Fraunces, Manrope, and Noto Sans Tamil locally. Their license
files are included in their respective npm packages (SIL Open Font License).

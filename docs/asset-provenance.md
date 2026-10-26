# Media provenance

## Current catalogue update — 26 October 2026

The first product is now named **Special Amark Rajabogam (26 kg)** by explicit
owner request. Its existing gold bag photograph is unchanged. The owner replaced
the second product with **Rajabogam Rice (25 kg)** in the supplied yellow bag.
The blue Broken Rice images below remain historical assets and are no longer
referenced by the active catalogue.

The yellow bag uses a labelled transparent studio mockup created with the
built-in image_gen tool. The owner-requested text correction is
**கருப்பு பழுப்பு நீக்கிய அக்மார்க்**. The complete prompt set, method, output
paths, and reproduction command are in [product-mockup.md](product-mockup.md).
The unretouched reference photograph is also shown in its product detail view.
AI-generated artwork should not be treated as a pixel-exact packaging proof.
Current asset hashes and dimensions are in
`public/media/products/rajabogam-25kg-manifest.json`.

Stock media was reviewed on 25 October 2026. On 26 October, the owner supplied
two additional real field films and requested cinematic excerpts for the site.
The current field backgrounds use those supplied films. Neither supplied nor
stock field footage is documented as showing Valluvar's fields, employees,
facility, or a particular rice product. Website captions preserve this
distinction. Actual client product photographs are documented below.

## User-supplied cinematic field films — 26 October 2026

| Supplied filename | Screen credit observed in the original outro | Use |
| --- | --- | --- |
| `RICE FIELDS with DJI Mavic MiniSe cinematic_1080p.mp4` | NiceShotsPH | Aerial opening, mill panorama, gallery film. |
| `Farming _ Cinematic B Roll Video _ Agriculture_1080p.mp4` | Prabal Bhowmik | Planting, young rice, ripening panicles, hand harvest and manual threshing. |

These are real recordings supplied by the user for this website. They are not
AI-generated visuals and are not classified as Pexels assets. The original
creator credit is retained in the gallery and here. A redistribution license
or ownership of these two films has not been independently verified; the
existing review build remains noindex. No claim is made that these scenes
were filmed in Dharapuram or at this mill. The original films remain outside
the repository and are not modified.

The second film has a separate full-length cut with **exactly its first six
seconds removed** at `.cache/edits/farming-first-6-seconds-removed.mp4` (ignored
by Git). It retains the remaining source picture and audio. Website excerpts
all start later than original source second 21, so none contains the excluded
opening, titles, or end credits. This complete cut is not downloaded by visitors.

| Website loop | Original source ranges (seconds) | Placement |
| --- | --- | --- |
| `cinematic/aerial` | Film 1: 20.88–25.60, then 10.32–13.96 | Home hero, Our Mill panorama, gallery |
| `cinematic/planting` | Film 2: 21.20–25.60 | Home story, nursery/planting chapter, gallery |
| `cinematic/growing` | Film 2: 37.76–41.48 | Tillering chapter |
| `cinematic/ripening` | Film 2: 48.84–52.72 | Grain filling/ripening chapter, gallery, contact still |
| `cinematic/harvest` | Film 2: 62.56–67.24, then 97.00–102.32 | Home harvest band, harvest/threshing chapter, gallery |

Edits retain forward movement, source frame rates (30fps aerial / 25fps farm),
original colour and exposure. There is no synthetic growth, frame interpolation,
reverse playback, speed change, or new colour grade. Baked-in letterbox borders
in film 2 are removed (1920×842 at x=0/y=118), followed by proportional cropping
to 16:9. Crossfades of 0.28–0.40 seconds soften the edit and loop boundaries;
there are no black fades. The harvest sequence shows gathering before threshing.
The source film's own photographic colour treatment remains present.

Desktop loops are 1280×720 H.264 CRF24; mobile landscape copies are 768×432
CRF27. The home hero additionally has a 720×960 portrait CRF26 delivery copy
and matching portrait poster. Audio is removed from every website loop;
all have fast-start metadata and yuv420p encoding. 1600/960/640px WebP posters
provide static fallbacks. Exact sizes, hashes, and edit ranges are recorded in
`public/media/cinematic/manifest.json`. The labelled educational illustrations
remain for stages the films do not show, including flowering and milling.

Reproduce with Pillow and imageio-ffmpeg (or supply `--ffmpeg`):

```powershell
python scripts/cinematic-media.py --fields "path/to/fields.mp4" --farming "path/to/farming.mp4" --trim-full
```

The `--trim-full` switch creates the separate complete six-second cut. Omit it
when only recreating website assets. The script never downloads either film.

## Original Pexels assets and license

All four source assets below are published on Pexels under the
[Pexels License](https://www.pexels.com/license/). The source pages label them
free to use. Pexels permits website use, downloading, and modification, without
requiring attribution. Credit is retained here for provenance. Do not imply
endorsement by the people or creators shown, sell unaltered copies, or use
these photographs as a trademark. License terms were checked on the review
date. Source availability and terms should be rechecked if sourcing new assets.
This Pexels license applies to the stock assets, not the separately supplied
client product photographs.

## Included local assets

| Local files | Source and creator | Preparation | Visual review |
| --- | --- | --- | --- |
| `public/media/planting.mp4`, `planting.webp` | [Farmers planting rice seedlings](https://www.pexels.com/video/people-on-rice-field-10783184/) — Dr.Vivasayam YouTube Channel, Pexels video 10783184 | 10-second excerpt beginning at 8s; 1280×720 H.264, 24fps, CRF29, audio removed, fast-start enabled. Poster at source second 9, 1600×900 WebP. | Workers transplant rice seedlings into a flooded, muddy paddy. Beginning/end contact frames and the poster were inspected; no visible watermark or unrelated branding. |
| `public/media/paddy.mp4`, `paddy.webp` | [Rice ready to be harvested](https://www.pexels.com/video/rice-ready-to-be-harvested-1557401/) — Sameera Madusanka, Pexels video 1557401 | Up to 8 seconds from the start; 1280×720 H.264, 24fps, CRF27, audio removed, fast-start enabled. Poster at source second 1, 1600×900 WebP. | Close-up of developed rice panicles and green/yellow leaves moving in the breeze. Source footage is relatively soft. Beginning/end contact frames and poster inspected; no visible watermark. |
| `public/media/harvest.mp4`, `harvest.webp` | [Farmer harvesting rice in sunlit field](https://www.pexels.com/video/farmer-harvesting-rice-in-sunlit-field-34781950/) — Panya Niyomtham, Pexels video 34781950 | 8-second excerpt beginning at 3s; 1280×720 H.264, 24fps, CRF29, audio removed, fast-start enabled. Poster at source second 4, 1600×900 WebP. | Wide shot of a farmer cutting mature rice by hand in a golden field, with trees and blue sky. Beginning/end contact frames and poster inspected; no visible watermark. Do not label its location as Dharapuram. |
| `public/media/grain.webp` | [Grains of rice](https://www.pexels.com/photo/grains-of-rice-18328392/) — Petr Ganaj, Pexels photo 18328392 | Original photograph resized proportionally to 1600×1067 and encoded as WebP, quality 83. | Macro photograph of uncooked white rice grains, inspected visually; no watermark or brand packaging. This does not establish the appearance of a client SKU. |

The three desktop video files total **5,747,552 bytes** (approximately 5.75 MB). Exact per-file
sizes, direct download URLs, source URLs, and transformation details are in
`public/media/manifest.json`.

### Responsive poster variants

Each reviewed 1600px still also has 640px and 960px wide WebP versions for
responsive `srcset` selection. These use proportional Lanczos resizing and
WebP quality 78, method 6; they retain the same source, creator, license, and
illustrative usage restrictions as the parent image. Existing full-size
posters and videos are unchanged.

| Image | 640px version | Bytes | 960px version | Bytes |
| --- | --- | ---: | --- | ---: |
| Planting | `planting-640.webp` (640×360) | 64,848 | `planting-960.webp` (960×540) | 131,912 |
| Paddy | `paddy-640.webp` (640×360) | 21,840 | `paddy-960.webp` (960×540) | 33,890 |
| Harvest | `harvest-640.webp` (640×360) | 46,646 | `harvest-960.webp` (960×540) | 93,790 |
| Grain | `grain-640.webp` (640×427) | 17,546 | `grain-960.webp` (960×640) | 30,024 |

All paths above are inside `public/media/`. The eight variants total 440,496
bytes. Machine-readable widths, heights, URLs, and sizes are recorded in each
asset's `posterVariants` array in the manifest.

### Mobile video variants

The three reviewed video excerpts also have 640×360 mobile delivery copies,
encoded from the existing local 1280px loops. They preserve the same framing,
excerpt, duration, and 24fps timing. Mobile copies use H.264, yuv420p, CRF31,
no audio, and fast-start metadata. The original 1280px videos are unchanged.

| Local file | Duration | Bytes |
| --- | ---: | ---: |
| `public/media/planting-mobile.mp4` | 10.00 seconds | 467,731 |
| `public/media/paddy-mobile.mp4` | 7.96 seconds | 169,250 |
| `public/media/harvest-mobile.mp4` | 8.00 seconds | 476,203 |

Mobile videos total **1,113,184 bytes** (approximately 1.11 MB), around 80.6%
smaller than the desktop set. The corresponding `mobileVideo` manifest objects
record URLs, dimensions, byte counts, encoding, and parent files. All three
were decoded successfully, fast-start atom ordering was checked, and 640px
frames were inspected visually for retained subject detail. These remain
illustrative stock footage under the same Pexels sources and license above.

The video download links were obtained from the source pages' native **Free
download** links. The grain photograph uses its public Pexels image-download
URL. Source originals are cached outside the repository in the system temporary
directory; only website-ready files are included in Git.

## Reproduction

Run with Python 3.10+, Pillow, and imageio-ffmpeg available:

```powershell
python -m pip install Pillow imageio-ffmpeg
python scripts/media-assets.py
```

To regenerate only the responsive poster variants from the existing local
1600px posters, without downloading sources or loading the video encoder:

```powershell
python scripts/media-assets.py --responsive-only
```

This mode only requires Pillow.

To generate/reuse just the mobile video copies from the existing local loops,
without downloading source files:

```powershell
python scripts/media-assets.py --mobile-only
```

Add `--force-mobile` when intentionally re-encoding existing mobile files.
This mode requires imageio-ffmpeg; it preserves the desktop assets.

The script can also use an imageio-ffmpeg installation in
`<system-temp>/valluvar-media-tools`. It caches downloaded originals under
`<system-temp>/valluvar-rice-source-media`. Existing video/poster outputs are
reused; remove only an individual output file if intentionally regenerating it.
Network access is needed when source files are not already cached. This script
does not acquire or require a Pexels API key.

## Deliberately excluded

- Existing watermarked stock photographs and unrelated India Gate packaging.
- Claims that stock-video people supply the client or work at its mill.
- A claimed documentary recording of the client's lifecycle or milling equipment.

The site's rice growth and grain-layer 3D scenes are programmatic illustrations;
their educational explanation should remain distinct from the stock footage
and client-specific process claims.

## Client-supplied product photographs

The client supplied these two actual bag photographs in the implementation
follow-up and requested their inclusion in the catalogue. They are client
media, not Pexels stock and not generated mockups.

| Product | Uploaded input | Website files | Dimensions and sizes |
| --- | --- | --- | --- |
| Valluvar Brand Boiled Rice, 26 kg (gold Special Rajabogam bag) | `codex-clipboard-65b7521b-27e8-46fd-ab39-551c4259b37d.png` | `public/media/products/boiled-rice-26kg.webp`, `boiled-rice-26kg-480.webp` | Original/full: 765×1024, WebP 126,466 bytes. Responsive: 480×643, 55,282 bytes. |
| Valluvar Brand Broken Rice, 26 kg (blue bag) | `codex-clipboard-363fe5e6-d08b-401e-9950-34d2e9f4faeb.png` | `public/media/products/broken-rice-26kg.webp`, `broken-rice-26kg-480.webp` | Original/full: 765×1024, WebP 114,152 bytes. Responsive: 480×643, 48,542 bytes. |

Both input images and the optimized full-size outputs were inspected visually.
The **entire original bag and background** are retained. There is no crop,
retouching, AI regeneration, lettering replacement, recoloring, or background
change. Optimization consists only of WebP quality 88 encoding (method 6)
and proportional Lanczos resizing for the 480px variants. WebP is lossy;
the artwork is spatially unchanged rather than pixel-identical to the PNG.
No output exceeds the original dimensions. Input/output SHA-256 hashes and
dimensions are recorded in `public/media/products/manifest.json`.

Reproduce the product files with Pillow and the two original uploaded PNGs:

```powershell
python scripts/media-products.py --boiled "path/to/gold-original.png" --broken "path/to/blue-original.png"
```

Source PNGs remain outside the repository. The script takes source-file
arguments rather than depending on the original machine's temporary paths.

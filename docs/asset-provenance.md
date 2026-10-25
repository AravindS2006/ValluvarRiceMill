# Media provenance

Stock media reviewed and prepared on 25 October 2026. The field videos and
grain texture are illustrative stock media, not photographs of Valluvar's
fields, employees, facility, or a particular rice product. Keep that
distinction in the website's captions and gallery. Client-supplied product
photographs are documented separately below.

## License

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

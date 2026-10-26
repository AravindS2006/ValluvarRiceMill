# Rajabogam 25 kg studio mockup

Prepared on 26 October 2026 with the built-in image_gen tool. No CLI/API key or
third-party image service was used. The user supplied the yellow bag photograph
and requested a mockup to replace the blue Broken Rice entry. The user then
corrected the small white Tamil line to **கருப்பு பழுப்பு நீக்கிய அக்மார்க்**.

Website asset: `public/media/products/rajabogam-25kg-mockup.webp` (765×1020,
transparent), plus the 480×640 responsive copy. The original input is preserved
as `rajabogam-25kg-reference.webp` (482×642) and available in the product dialog.
The full-resolution corrected PNG is retained locally at
`.cache/edits/rajabogam-25kg-corrected.png`; source PNGs are not published by the
website. Hashes and exact asset sizes are in `rajabogam-25kg-manifest.json`.

The card is labelled **Studio mockup**. It is an AI-assisted catalogue visual,
not an unmodified product photograph. The original reference lets buyers inspect
the supplied packaging. Printed packaging and product names do not establish
an independently verified certification; no certification claim is added to
the site's editorial copy.

## Final prompt set

Initial edit: Create one photorealistic catalogue studio mockup of the supplied
yellow and green Valluvar Rajabogam 25 kg bag, at the same front-left three-quarter
angle, with the full bag visible and a transparent background. Preserve the
yellow front, striped green top/base, Valluvar Tamil brand lettering,
Thiruvalluvar portrait and oval, red Rajabogam panel, rice bowl artwork, white
side window, and 25 kg badge. Improve studio lighting, edge clarity, and woven
material texture. Extend only the clipped striped sealing seam. Do not add
products, props, scenery, claims, or new package design.

Correction edit: Change only the small white Tamil sentence on the red bottom
panel immediately above the large yellow product name. Replace it with the
exact text **கருப்பு பழுப்பு நீக்கிய அக்மார்க்**, on one line, aligned to the
panel's perspective. Preserve all other lettering, packaging, portrait, 25 kg
badge, colours, lighting, shadow, framing, and transparent background.

## Reproduction of website copies

```powershell
python scripts/prepare-rajabogam.py --mockup "path/to/corrected-mockup.png" --reference "path/to/supplied-bag.png"
```

This script only performs proportional resizing and WebP encoding, preserving
alpha. It does not edit artwork or lettering.

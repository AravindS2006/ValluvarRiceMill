"""Optimize the approved studio mockup and original packaging reference.

Only proportional resizing and WebP encoding are performed here. Artwork
changes, including the requested Tamil correction, were made with image_gen.
"""
import argparse
import hashlib
import json
from pathlib import Path
from PIL import Image

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--mockup', type=Path, required=True)
parser.add_argument('--reference', type=Path, required=True)
args = parser.parse_args()
out = Path(__file__).resolve().parents[1] / 'public/media/products'
out.mkdir(parents=True, exist_ok=True)
manifest = dict(product='Valluvar Brand Rajabogam Rice', packKg=25,
                sourceFilename=args.reference.name,
                sourceSha256=hashlib.sha256(args.reference.read_bytes()).hexdigest(),
                mockupSha256=hashlib.sha256(args.mockup.read_bytes()).hexdigest(),
                correctedCopy='கருப்பு பழுப்பு நீக்கிய அக்மார்க்',
                mockupMethod='Built-in image_gen studio mockup and precise Tamil text correction. The unretouched source photograph is also available in the product detail view.',
                assets=[])
for source, name, widths in [(args.mockup, 'rajabogam-25kg-mockup', [765, 480]),
                             (args.reference, 'rajabogam-25kg-reference', [482])]:
    with Image.open(source) as original:
        for width in widths:
            width = min(width, original.width)
            height = round(original.height * width / original.width)
            image = original.convert('RGBA' if 'A' in original.getbands() else 'RGB')
            if image.size != (width, height):
                image = image.resize((width, height), Image.Resampling.LANCZOS)
            path = out / (name + ('-480' if width == 480 else '') + '.webp')
            image.save(path, 'WEBP', quality=90, method=6)
            manifest['assets'].append(dict(src='/media/products/' + path.name,
                                           width=width, height=height,
                                           bytes=path.stat().st_size,
                                           sha256=hashlib.sha256(path.read_bytes()).hexdigest(),
                                           alpha=image.mode == 'RGBA'))
            print(path.name, width, height, path.stat().st_size, flush=True)
(out / 'rajabogam-25kg-manifest.json').write_text(
    json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

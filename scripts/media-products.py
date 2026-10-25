"""Optimize client-supplied product photographs without changing the artwork.

Requires Pillow. No crop, retouching, regeneration, background removal, or
upscaling is performed. Supply both original paths explicitly.
"""
from argparse import ArgumentParser
from hashlib import sha256
import json
from pathlib import Path

from PIL import Image


def file_hash(path: Path) -> str:
    return sha256(path.read_bytes()).hexdigest()


def optimize(source: Path, name: str, label: str, destination: Path) -> dict:
    if not source.is_file():
        raise FileNotFoundError(f'Product source does not exist: {source}')
    variants = []
    with Image.open(source) as original:
        image = original.convert('RGB')
        width, height = image.size
        for output_width in (width, min(width, 480)):
            output_height = round(height * output_width / width)
            filename = f'{name}.webp' if output_width == width else f'{name}-480.webp'
            output = destination / filename
            resized = image if output_width == width else image.resize(
                (output_width, output_height), Image.Resampling.LANCZOS)
            resized.save(output, 'WEBP', quality=88, method=6)
            variants.append({'src': '/media/products/' + filename,
                             'width': output_width, 'height': output_height,
                             'bytes': output.stat().st_size, 'sha256': file_hash(output)})
    return {'name': name, 'label': label, 'source': 'Client-provided photograph uploaded in this chat',
            'sourceFilename': source.name, 'sourceWidth': width, 'sourceHeight': height,
            'sourceSha256': file_hash(source),
            'edits': 'WebP quality 88 encoding; 480px variant uses proportional Lanczos resizing. '
                     'Full bag, printed artwork, Tamil lettering, colors, and background retained. '
                     'No cropping, retouching, AI regeneration, background changes, or upscaling.',
            'variants': variants}


def main():
    parser = ArgumentParser(description=__doc__)
    parser.add_argument('--boiled', required=True, type=Path,
                        help='Original gold Special Rajabogam / boiled-rice photo')
    parser.add_argument('--broken', required=True, type=Path,
                        help='Original blue broken-rice photo')
    args = parser.parse_args()
    destination = Path(__file__).resolve().parents[1] / 'public' / 'media' / 'products'
    destination.mkdir(parents=True, exist_ok=True)
    manifest = [
        optimize(args.boiled, 'boiled-rice-26kg', 'Valluvar Brand Boiled Rice — 26 kg', destination),
        optimize(args.broken, 'broken-rice-26kg', 'Valluvar Brand Broken Rice — 26 kg', destination),
    ]
    (destination / 'manifest.json').write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    for asset in manifest:
        print(asset['name'], asset['variants'])


if __name__ == '__main__':
    main()

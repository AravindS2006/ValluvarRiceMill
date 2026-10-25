"""Reproduce locally optimized, licensed Pexels rice footage and posters.

Install Pillow and imageio-ffmpeg first. Source originals remain in the system
temporary directory; only optimized website assets are written into public/media.
"""
from pathlib import Path
import json
import subprocess
import sys
import tempfile
import urllib.request

tools = Path(tempfile.gettempdir()) / 'valluvar-media-tools'
if tools.exists():
    sys.path.insert(0, str(tools))
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public' / 'media'
TMP = Path(tempfile.gettempdir()) / 'valluvar-rice-source-media'
OUT.mkdir(parents=True, exist_ok=True)
TMP.mkdir(parents=True, exist_ok=True)
def responsive_variants(name):
    """Create smaller posters without altering the reviewed 1600px originals."""
    variants = []
    with Image.open(OUT / f'{name}.webp') as poster:
        for width in (640, 960):
            height = round(poster.height * width / poster.width)
            variant = OUT / f'{name}-{width}.webp'
            poster.convert('RGB').resize((width, height), Image.Resampling.LANCZOS).save(
                variant, 'WEBP', quality=78, method=6)
            variants.append({'width': width, 'height': height,
                             'src': '/media/' + variant.name,
                             'bytes': variant.stat().st_size})
    return variants

if '--responsive-only' in sys.argv:
    manifest_path = OUT / 'manifest.json'
    manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
    for asset in manifest:
        asset['posterVariants'] = responsive_variants(asset['name'])
        print(asset['name'], asset['posterVariants'])
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    sys.exit(0)

import imageio_ffmpeg
ENCODER = imageio_ffmpeg.get_ffmpeg_exe()
ASSETS = [
    dict(id=10783184, name='planting', creator='Dr.Vivasayam YouTube Channel',
         page='https://www.pexels.com/video/people-on-rice-field-10783184/',
         download='https://videos.pexels.com/video-files/10783184/10783184-hd_1920_1080_25fps.mp4',
         start=8, length=10, crf=29,
         description='Farm workers transplanting rice seedlings into a flooded paddy field.'),
    dict(id=1557401, name='paddy', creator='Sameera Madusanka',
         page='https://www.pexels.com/video/rice-ready-to-be-harvested-1557401/',
         download='https://videos.pexels.com/video-files/1557401/1557401-hd_1920_1080_30fps.mp4',
         start=0, length=8, crf=27,
         description='Mature rice panicles and green leaves moving in the breeze.'),
    dict(id=34781950, name='harvest', creator='Panya Niyomtham',
         page='https://www.pexels.com/video/farmer-harvesting-rice-in-sunlit-field-34781950/',
         download='https://videos.pexels.com/video-files/34781950/14745682_1920_1080_30fps.mp4',
         start=3, length=8, crf=29,
         description='A farmer cutting mature rice by hand in a sunlit paddy field.'),
]

def run(args):
    subprocess.run([ENCODER, '-hide_banner', '-loglevel', 'error', '-y', *args], check=True)

manifest = []
for asset in ASSETS:
    original = TMP / (asset['name'] + '-source.mp4')
    if not original.exists():
        request = urllib.request.Request(asset['download'], headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(request, timeout=120) as response, original.open('wb') as target:
            while chunk := response.read(1024 * 1024):
                target.write(chunk)
    video = OUT / (asset['name'] + '.mp4')
    if not video.exists():
        run(['-ss', str(asset['start']), '-i', str(original), '-t', str(asset['length']),
             '-vf', 'scale=1280:-2,fps=24', '-c:v', 'libx264', '-preset', 'slow',
             '-crf', str(asset['crf']), '-pix_fmt', 'yuv420p', '-an', '-movflags', '+faststart', str(video)])
    poster = OUT / (asset['name'] + '.webp')
    if not poster.exists():
        run(['-ss', str(asset['start'] + 1), '-i', str(original), '-frames:v', '1',
             '-vf', 'scale=1600:-2', '-c:v', 'libwebp', '-quality', '83', str(poster)])
    # Three evenly distributed contact frames support visual inspection.
    frames = []
    for index, second in enumerate([1, asset['length'] / 2, asset['length'] - 1]):
        frame = TMP / f"{asset['name']}-{index}.jpg"
        run(['-ss', str(second), '-i', str(video), '-frames:v', '1', '-vf', 'scale=640:-2', str(frame)])
        frames.append(str(frame))
    manifest.append({**asset, 'license': 'Pexels License',
                     'licenseUrl': 'https://www.pexels.com/license/',
                     'video': '/media/' + video.name, 'poster': '/media/' + poster.name,
                     'bytes': video.stat().st_size, 'posterBytes': poster.stat().st_size,
                     'posterVariants': responsive_variants(asset['name']),
                     'edits': f"Excerpt from {asset['start']} seconds, up to {asset['length']} seconds; 1280px wide H.264, 24fps, CRF{asset['crf']}, no audio; 1600px WebP poster.",
                     'usage': 'Illustrative stock footage; not documented client farms, staff, or premises.',
                     'inspection': 'Three contact frames retained in temporary source directory for manual review.'})
    print(asset['name'], video.stat().st_size, poster.stat().st_size, flush=True)

grain_source = TMP / 'grain-source.jpg'
grain_url = 'https://images.pexels.com/photos/18328392/pexels-photo-18328392.jpeg'
if not grain_source.exists():
    request = urllib.request.Request(grain_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(request, timeout=120) as response:
        grain_source.write_bytes(response.read())
with Image.open(grain_source) as grain:
    grain.thumbnail((1600, 1600))
    grain.convert('RGB').save(OUT / 'grain.webp', 'WEBP', quality=83)
manifest.append({'id': 18328392, 'name': 'grain', 'creator': 'Petr Ganaj',
                 'page': 'https://www.pexels.com/photo/grains-of-rice-18328392/',
                 'download': grain_url, 'license': 'Pexels License',
                 'licenseUrl': 'https://www.pexels.com/license/',
                 'poster': '/media/grain.webp', 'bytes': (OUT / 'grain.webp').stat().st_size,
                 'posterVariants': responsive_variants('grain'),
                 'description': 'Macro still photograph of uncooked white rice grains.',
                 'edits': 'Resized to fit 1600px bounding box and encoded WebP quality 83.',
                 'usage': 'Illustrative stock photography; not a photograph of a specific client product.'})
(OUT / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('Complete:', OUT)

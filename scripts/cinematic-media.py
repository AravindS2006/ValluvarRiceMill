"""Create reviewed website loops from the two user-supplied films.

Usage: python scripts/cinematic-media.py --fields path/to/fields.mp4
       --farming path/to/farming.mp4 [--trim-full]
Requires Pillow and imageio-ffmpeg (or --ffmpeg path/to/ffmpeg).
The original films are never changed. Full trimmed film stays in ignored .cache/.
"""
from pathlib import Path
import argparse
import hashlib
import json
import os
import subprocess
import sys

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/media/cinematic'
SHOTS = [
    dict(name='aerial', source='fields', ranges=[(20.88, 25.60), (10.32, 13.96)],
         fps=30, blend=.4, poster=22.4,
         description='Two genuine drone views across green, irrigated rice fields.',
         placements=['Home hero', 'Our Mill panorama', 'Gallery film']),
    dict(name='planting', source='farming', ranges=[(21.20, 25.60)],
         fps=25, blend=.28, poster=23.2,
         description='Farmers transplanting seedlings in a flooded paddy.',
         placements=['Home story', 'Nursery and planting chapter', 'Gallery']),
    dict(name='growing', source='farming', ranges=[(37.76, 41.48)],
         fps=25, blend=.28, poster=39.0,
         description='Young green rice plants growing in water, before heading.',
         placements=['Tillering chapter']),
    dict(name='ripening', source='farming', ranges=[(48.84, 52.72)],
         fps=25, blend=.28, poster=50.4,
         description='Grain-bearing rice panicles moving naturally in the breeze.',
         placements=['Ripening chapter', 'Gallery', 'Contact still']),
    dict(name='harvest', source='farming', ranges=[(62.56, 67.24), (97.0, 102.32)],
         fps=25, blend=.32, poster=64.3,
         description='Rice is gathered by hand, followed by real manual threshing.',
         placements=['Home harvest band', 'Harvest and threshing chapter', 'Gallery']),
]


def digest(path):
    result = hashlib.sha256()
    with path.open('rb') as source:
        for block in iter(lambda: source.read(1024 * 1024), b''):
            result.update(block)
    return result.hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--fields', type=Path, required=True)
    parser.add_argument('--farming', type=Path, required=True)
    parser.add_argument('--ffmpeg')
    parser.add_argument('--trim-full', action='store_true')
    args = parser.parse_args()
    if args.ffmpeg:
        encoder = args.ffmpeg
    else:
        # Same optional local tool installation supported by media-assets.py.
        local = Path(os.environ.get('LOCALAPPDATA', '')) / 'Temp/valluvar-media-tools'
        if local.exists():
            sys.path.insert(0, str(local))
        import imageio_ffmpeg
        encoder = imageio_ffmpeg.get_ffmpeg_exe()
    inputs = {'fields': args.fields.resolve(strict=True), 'farming': args.farming.resolve(strict=True)}
    OUT.mkdir(parents=True, exist_ok=True)

    def run(arguments):
        subprocess.run([encoder, '-hide_banner', '-loglevel', 'error', '-y', *arguments], check=True)

    sources = []
    for key, path in inputs.items():
        sources.append(dict(id=key, filename=path.name, sha256=digest(path),
                            provenance='User supplied for inclusion in the website; original redistribution license not independently verified.',
                            screenCredit='NiceShotsPH' if key == 'fields' else 'Prabal Bhowmik',
                            creditEvidence='Credit visible in source-film outro.',
                            excludedOpeningSeconds=6 if key == 'farming' else 0))

    # A separate, complete cut satisfies the requested six-second opening trim.
    # Accurate decoded seek + re-encode avoids a preceding keyframe reappearing.
    if args.trim_full:
        trimmed = ROOT / '.cache/edits/farming-first-6-seconds-removed.mp4'
        trimmed.parent.mkdir(parents=True, exist_ok=True)
        run(['-ss', '6', '-i', str(inputs['farming']), '-map', '0:v:0', '-map', '0:a?',
             '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p',
             '-c:a', 'copy', '-movflags', '+faststart', '-threads', '4', str(trimmed)])
        print(f'Full trimmed film: {trimmed}', flush=True)

    manifest = dict(version=1, sources=sources, assets=[])
    for shot in SHOTS:
        source = inputs[shot['source']]
        assert shot['source'] != 'farming' or all(start >= 6 for start, _ in shot['ranges'])
        # Remove only the baked-in letterbox borders of film two, then make a
        # proportional centre crop to 16:9. No colour grade or motion synthesis.
        crop = 'crop=1920:842:0:118,' if shot['source'] == 'farming' else ''
        fps, blend = shot['fps'], shot['blend']
        record = dict(shot, sourceTimeBasis='Seconds in the unmodified supplied film',
                      audio=False, fastStart=True, codec='H.264 / yuv420p',
                      colourEdits='None', motionEdits='Original forward motion and frame rate; brief optical fades only.')
        variants = [('desktop', 1280, 720, 24), ('mobile', 768, 432, 27)]
        if shot['name'] == 'aerial':
            variants.append(('portrait', 720, 960, 26))
        for variant, width, height, crf in variants:
            # The hero gets its own portrait composition on a small screen.
            portrait = variant == 'portrait'
            path = OUT / f"{shot['name']}{'-' + variant if variant != 'desktop' else ''}.mp4"
            filters = []
            durations = []
            for i, (start, end) in enumerate(shot['ranges']):
                shape = f'crop=ih*3/4:ih,scale={width}:{height}' if portrait else f'{crop}scale={width}:{height}:force_original_aspect_ratio=increase,crop={width}:{height}'
                filters.append(f'[0:v]trim=start={start}:end={end},setpts=PTS-STARTPTS,{shape},setsar=1,fps={fps},format=yuv420p,settb=AVTB[s{i}]')
                durations.append(end - start)
            current, duration = 's0', durations[0]
            for i in range(1, len(durations)):
                filters.append(f'[{current}][s{i}]xfade=transition=fade:duration={blend}:offset={duration-blend}[join{i}]')
                current = f'join{i}'
                duration += durations[i] - blend
            # End dissolves to the initial moment; next playback starts just
            # after that moment. This avoids a black dip or reverse playback.
            filters.extend([f'[{current}]split=2[body][head]',
                            f'[body]trim=start={blend},setpts=PTS-STARTPTS,fps={fps},settb=AVTB[loopbody]',
                            f'[head]trim=end={blend},setpts=PTS-STARTPTS,fps={fps},settb=AVTB[loophead]',
                            f'[loopbody][loophead]xfade=transition=fade:duration={blend}:offset={duration-2*blend}[out]'])
            run(['-i', str(source), '-filter_complex_threads', '1', '-filter_complex', ';'.join(filters),
                 '-map', '[out]', '-t', str(round(duration-blend, 3)), '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', str(crf),
                 '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-threads', '4', str(path)])
            record[variant] = dict(src='/media/cinematic/' + path.name, width=width, height=height,
                                   bytes=path.stat().st_size, crf=crf, durationSeconds=round(duration-blend, 2),
                                   sha256=digest(path))
            print(path.name, path.stat().st_size, flush=True)

        poster = OUT / f"{shot['name']}.webp"
        run(['-ss', str(shot['poster']), '-i', str(source), '-frames:v', '1',
             '-vf', f'{crop}scale=1600:900:force_original_aspect_ratio=increase,crop=1600:900',
             '-c:v', 'libwebp', '-quality', '84', str(poster)])
        record['poster'] = '/media/cinematic/' + poster.name
        record['posterVariants'] = []
        with Image.open(poster) as original:
            for width in (640, 960):
                variant = OUT / f"{shot['name']}-{width}.webp"
                original.resize((width, round(width * 9 / 16)), Image.Resampling.LANCZOS).save(variant, 'WEBP', quality=80, method=6)
                record['posterVariants'].append(dict(src='/media/cinematic/' + variant.name, width=width, bytes=variant.stat().st_size))
        if shot['name'] == 'aerial':
            poster = OUT / 'aerial-portrait.webp'
            run(['-ss', str(shot['poster']), '-i', str(source), '-frames:v', '1',
                 '-vf', 'crop=ih*3/4:ih,scale=720:960', '-c:v', 'libwebp', '-quality', '82', str(poster)])
            record['portraitPoster'] = '/media/cinematic/' + poster.name
        manifest['assets'].append(record)
    (OUT / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


if __name__ == '__main__':
    main()

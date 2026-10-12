"""Losslessly encode Flutter renders, deduplicate held frames and date metadata."""
import hashlib
import json
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[2]
assets = root / 'public/images/app'
clips = {}
for name in ['main', 'showcase']:
    clips.update(json.loads((root / f'design/capture/native-clips-{name}.json').read_text()))
labels = json.loads((root / 'src/capture-dates.json').read_text())
(root / 'design/capture/native-dates.json').write_text(json.dumps(labels, ensure_ascii=False))
dates = {key: value for key, value in labels.items() if not key.startswith('native')}
date_keys = {json.dumps(value, sort_keys=True): key for key, value in dates.items()}
encoded = {}
manifest = {}
for key, clip in clips.items():
    frames = []
    for name in clip['frames']:
        if not name.startswith('native/'):
            frames.append({'image': f'/images/app/{name}.png', 'date': name})
            continue
        image = Image.open(assets / f'{name}.png').convert('RGB')
        digest = hashlib.sha256(image.tobytes()).hexdigest()[:20]
        path = f'/images/app/native/{digest}.webp'
        if digest not in encoded:
            image.save(assets / f'native/{digest}.webp', format='WEBP', lossless=True, method=6)
            encoded[digest] = path
        value = labels[name]
        if key == 'schedule--registered':
            for label in value:
                if label['kind'] == 'next': label['times'] = [13]
        signature = json.dumps(value, sort_keys=True)
        date = date_keys.get(signature)
        if date is None:
            date = f'native-date-{len(date_keys)}'
            dates[date] = value
            date_keys[signature] = date
        frames.append({'image': path, 'date': date})
    manifest[key] = {'from': clip['from'], 'to': clip['to'], 'platform': 'ios', 'sampleIntervalMs': 16, 'frames': frames}
    if 'stops' in clip: manifest[key]['stops'] = clip['stops']
    last = len(frames) - 1
    if 'pressReleaseIndex' in clip:
        release = clip['pressReleaseIndex']
        manifest[key]['stops'] = [
            .3 * i / release if i <= release else .3 + .7 * (i - release) / (last - release)
            for i in range(len(frames))
        ]
    def frame_stop(index):
        return manifest[key].get('stops', [i / last for i in range(len(frames))])[min(index, last)]
    if 'touches' in clip:
        manifest[key]['touches'] = [
            {'x': touch['x'], 'y': touch['y'], 'start': frame_stop(touch['startIndex']),
             'release': frame_stop(touch['releaseIndex']), 'end': frame_stop(touch['endIndex'])}
            for touch in clip['touches']
        ]
    if 'focusStages' in clip: manifest[key]['focusStages'] = clip['focusStages']
(root / 'src/nativeClips.ts').write_text('// Generated from genuine Flutter renders. See design/capture/website_motion_test.dart.\nexport const nativeClips = ' + json.dumps(manifest, ensure_ascii=False, separators=(',', ':')) + ';\n')
(root / 'src/capture-dates.json').write_text(json.dumps(dates, ensure_ascii=False, separators=(',', ':')) + '\n')
for path in (assets / 'native').rglob('*.png'): path.unlink()
for path in (assets / 'native').glob('*.webp'):
    if path.stem not in encoded: path.unlink()
for path in sorted((assets / 'native').rglob('*'), reverse=True):
    if path.is_dir() and not any(path.iterdir()): path.rmdir()
print(f'{len(clips)} native clips; {sum(len(c["frames"]) for c in manifest.values())} samples; {len(encoded)} unique lossless frames')

# Быстрый просмотр записи эфира Twitch без скачивания: стоп-кадр каждые N секунд → листы с таймкодами.
# python3 vod_scan.py <twitch_vod_url> <out_dir> [шаг_сек=30] [начало_сек=0] [конец_сек=всё]
import sys, os, subprocess, json
from concurrent.futures import ThreadPoolExecutor
from PIL import Image, ImageDraw
url, out = sys.argv[1], sys.argv[2]; step = int(sys.argv[3]) if len(sys.argv) > 3 else 30
a = int(sys.argv[4]) if len(sys.argv) > 4 else 0
os.makedirs(f'{out}/f', exist_ok=True)
info = json.loads(subprocess.check_output(['yt-dlp', '-j', '-f', '360p/480p/worst', url], stderr=subprocess.DEVNULL))
src = info['url']; dur = int(info.get('duration') or 0); b = int(sys.argv[5]) if len(sys.argv) > 5 else dur
ts = list(range(a, b, step))
def grab(t):
    o = f'{out}/f/{t:06d}.jpg'
    if not os.path.exists(o):
        subprocess.run(['timeout', '60', 'ffmpeg', '-loglevel', 'error', '-y', '-ss', str(t), '-i', src, '-frames:v', '1', '-vf', 'scale=320:-1', o])
    return t, o
with ThreadPoolExecutor(12) as ex: res = list(ex.map(grab, ts))
W, H, C, R = 320, 180, 8, 8
for k in range(0, len(res), C * R):
    sh = Image.new('RGB', (W * C, H * R)); d = ImageDraw.Draw(sh)
    for j, (t, f) in enumerate(res[k:k + C * R]):
        if not os.path.exists(f): continue
        x, y = (j % C) * W, (j // C) * H; sh.paste(Image.open(f).resize((W, H)), (x, y))
        d.rectangle([x, y, x + 58, y + 14], fill=(0, 0, 0)); d.text((x + 2, y + 1), f'{t // 3600}:{t % 3600 // 60:02d}:{t % 60:02d}', fill=(255, 255, 0))
    sh.save(f'{out}/sheet_{k // (C * R):02d}.jpg', quality=75)
print('sheets', (len(res) + C * R - 1) // (C * R), 'dur', dur)

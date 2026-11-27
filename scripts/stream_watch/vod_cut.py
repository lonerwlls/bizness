# Быстро вырезать кусок из длинной записи эфира Twitch: качает только нужные сегменты плейлиста.
# python3 vod_cut.py <vod_url> <начало_сек> <длит_сек> <out.mp4> [качество=1080p60/best]
import sys, subprocess, urllib.request, os, tempfile
url, a, d, out = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), sys.argv[4]
q = sys.argv[5] if len(sys.argv) > 5 else '1080p60/best'
m3u = subprocess.check_output(['yt-dlp', '-g', '-f', q, url], stderr=subprocess.DEVNULL).decode().split()[0]
pl = urllib.request.urlopen(m3u).read().decode().splitlines()
base = m3u.rsplit('/', 1)[0] + '/'
segs, t, dur = [], 0.0, None
for line in pl:
    if line.startswith('#EXTINF:'): dur = float(line[8:].split(',')[0])
    elif line and not line.startswith('#') and dur is not None:
        if t + dur > a and t < a + d: segs.append((t, line if line.startswith('http') else base + line))
        t += dur; dur = None
tmp = tempfile.mkdtemp(dir=os.path.dirname(os.path.abspath(out)))
files = []
for k, (st, u) in enumerate(segs):
    f = f'{tmp}/{k:04d}.ts'
    for _ in range(3):
        try: open(f, 'wb').write(urllib.request.urlopen(u, timeout=60).read()); break
        except Exception: pass
    files.append(f)
lst = f'{tmp}/l.txt'; open(lst, 'w').write(''.join(f"file '{f}'\n" for f in files))
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-ss', str(a - segs[0][0]), '-t', str(d),
                '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '14', '-c:a', 'aac', out], check=True)
for f in files + [lst]: os.remove(f)
os.rmdir(tmp); print('OK', out, len(segs), 'segments')

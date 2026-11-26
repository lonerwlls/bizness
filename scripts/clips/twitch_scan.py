# Поиск моментов в записи Twitch: python3 scripts/clips/twitch_scan.py <vod_id> <с_сек> <по_сек> <папка>
# 1) звук кусками по 5 мин (160p, 8 параллельно — одним куском прокси обрывает), 2) всплески громкости,
# 3) распознавание речи ±25 с вокруг всплесков -> <папка>/cand.txt (время, громкость, фраза)
import sys, os, subprocess, json, wave, numpy as np
from concurrent.futures import ThreadPoolExecutor
vid, a, b, D = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), sys.argv[4]
os.makedirs(f"{D}/ch", exist_ok=True)
def get(s):
    out = f"{D}/ch/c_{s:06d}.mp4"
    if os.path.exists(out): return
    for _ in range(3):
        subprocess.run(["yt-dlp", "-q", "-f", "160p/worst", "--download-sections", f"*{s}-{min(s + 300, b)}", "-o", out,
                        f"https://www.twitch.tv/videos/{vid.lstrip('v')}"], capture_output=True, timeout=600)
        if os.path.exists(out): return
with ThreadPoolExecutor(8) as ex: list(ex.map(get, range(a, b, 300)))
parts = sorted(os.listdir(f"{D}/ch")); open(f"{D}/ch.txt", "w").write("".join(f"file '{D}/ch/{p}'\n" for p in parts))
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", f"{D}/ch.txt", "-vn", "-ac", "1", "-ar", "16000", f"{D}/a.wav"], check=True)
w = wave.open(f"{D}/a.wav"); x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
sr = 16000; n = len(x) // sr
db = 20 * np.log10(np.array([np.sqrt((x[i * sr:(i + 1) * sr] ** 2).mean() + 1e-9) for i in range(n)]))
ex_ = db - np.convolve(db, np.ones(60) / 60, "same")
pk = []
for i in np.argsort(-ex_):
    if all(abs(i - p) > 45 for p in pk): pk.append(int(i))
    if len(pk) >= int(os.environ.get("NPEAK", 40)): break
from faster_whisper import WhisperModel
m = WhisperModel("small", compute_type="int8")
with open(f"{D}/cand.txt", "w") as f:
    for p in sorted(pk):
        s0 = max(0, p - 25); seg = x[s0 * sr:(p + 25) * sr]
        segs, _ = m.transcribe(seg, language="ru", vad_filter=True)
        txt = " ".join(f"[{s0 + s.start:.0f}] {s.text.strip()}" for s in segs)
        f.write(f"== {a + p}s ({(a + p) // 60}:{(a + p) % 60:02d}) +{ex_[p]:.0f}dB | {txt}\n"); f.flush()
print("ok", len(pk))

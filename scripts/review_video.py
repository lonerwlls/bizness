# Проверка готового ролика ЦЕЛИКОМ: листы кадров каждые 0.5 с (по 12 на лист) + поиск мерцания/скачков
# (резкая разница соседних кадров без смены сцены) + громкость голоса и звука.
# python3 scripts/review_video.py videos/<id>.mp4 out/<id>/review
import sys, os, subprocess, numpy as np
from PIL import Image
src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
W, H = 180, 320
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", src, "-vf", f"scale={W}:{H}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3).astype(np.float32)
n = len(fr); print("frames", n)
# sheets: every 15th frame (0.5 s), 12 per sheet
idx = list(range(0, n, 15))
for s in range(0, len(idx), 12):
    sheet = Image.new("RGB", (W * 6, H * 2), "black")
    for k, i in enumerate(idx[s:s + 12]):
        sheet.paste(Image.fromarray(fr[i].astype(np.uint8)), ((k % 6) * W, (k // 6) * H))
    sheet.save(f"{out}/sheet_{s // 12:02d}_{idx[s] / 30:05.1f}s.jpg", quality=85)
# flicker: frame f differs a lot from both neighbours while the neighbours match each other (a one-frame pop)
d = np.abs(np.diff(fr, axis=0)).mean(axis=(1, 2, 3))
pops = [f for f in range(1, n - 1) if d[f - 1] > 6 and d[f] > 6 and np.abs(fr[f + 1] - fr[f - 1]).mean() < 0.5 * min(d[f - 1], d[f])]
print("one-frame pops at frames:", pops[:40])
print("ok", out)

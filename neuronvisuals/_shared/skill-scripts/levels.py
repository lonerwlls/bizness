# Уровни SFX-событий в стеме: пиковый RMS (окно 40 мс, максимум за 150 мс от момента события), дБFS.
#   python -I levels.py <стем.wav> <timeline.json> [sfx_dB=-4] > levels.csv
# sfx_dB — то же усиление, что SFX в mix.sh, применяется к стему перед замером.
# timeline.json — формат см. в докстринге sfx/sfx.py (поле "sfx": [{t_sec, kind, gain, pan}]).
# Вывод: CSV в stdout (t_sec, kind, gain_db, peak_dbfs) и сводка по видам в stderr.
# Замер: сравнивай виды между собой и заданный gain из таймлайна — разброс должен отражать замысел.
# Зависимости: ffmpeg и стандартная библиотека (numpy не нужен).
import sys, csv, json, math, array, subprocess
import sys as _sys; _sys.stdout.reconfigure(encoding="utf-8", errors="replace")   # консоль Windows (cp1251)

SR = 48000
stem, tl_path = sys.argv[1], sys.argv[2]
sfx_db = float(sys.argv[3]) if len(sys.argv) > 3 else -4.0
tl = json.load(open(tl_path, encoding="utf-8"))

raw = subprocess.run(["ffmpeg", "-v", "error", "-i", stem, "-af", f"volume={sfx_db}dB",
                      "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"], capture_output=True).stdout
if not raw:
    sys.exit("ffmpeg не выдал аудио из стема")
s = array.array("h"); s.frombytes(raw)

W = int(0.04 * SR); HOP = W // 2; SEG = int(0.15 * SR)

def peak_db(t):
    i = int(round(t * SR)); seg = s[i:i + SEG]; best = -200.0
    for j in range(0, max(1, len(seg) - W + 1), HOP):
        part = seg[j:j + W]
        if not part: break
        rms = math.sqrt(sum(v * v for v in part) / len(part)) / 32768
        best = max(best, 20 * math.log10(rms + 1e-9))
    return round(best, 1)

w = csv.writer(sys.stdout, lineterminator="\n")
w.writerow(["t_sec", "kind", "gain_db", "peak_dbfs"])
by = {}
for e in tl.get("sfx", []):
    p = peak_db(float(e["t_sec"]))
    w.writerow([e["t_sec"], e["kind"], e.get("gain", 0), p])
    by.setdefault(e["kind"], []).append(p)
for k, v in sorted(by.items()):
    print(f"{k:12s} n={len(v):3d} min={min(v):7.1f} max={max(v):7.1f}", file=sys.stderr)

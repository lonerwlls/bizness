# Синтез стема звуков движения (SFX-only, музыки в варианте нет): звук на каждое движение из timeline.json.
# Классы звуков берутся из sfxlib.py: суб-«бум» с падением тона, свист, щелчок, шаги по песку/камню,
# шорох ткани, осыпь, стекло, струя (вода), воздух.
#   python -I sfx.py <timeline.json> <out.wav>   → out.wav (48 кГц, стерео) + out.csv (события: frame, sound, gain_db, pan)
#
# Формат timeline.json (общий для sfx.py, levels.py и selfcheck.py; пишет Higgsedit-проект):
#   {
#     "fps": 30,
#     "duration_sec": 13.0,
#     "sfx": [
#       {"t_sec": 1.23, "kind": "boom", "gain": 4, "pan": -0.2},
#       {"t_sec": 2.50, "kind": "whoosh", "gain": -7, "pan": 0.0, "dur_sec": 0.25}
#     ],
#     "scenes": [...]          # необязательно, скриптами не читается
#   }
#   t_sec  — момент движения, секунды от начала ролика (обязательно);
#   kind   — класс звука (обязательно), см. GEN ниже;
#   gain   — уровень события, дБ (по умолчанию 0);
#   pan    — панорама −1 (лево) … 1 (право) (по умолчанию 0);
#   dur_sec — длительность для классов, где она есть (по умолчанию см. GEN).
# Пример проверки: python -I sfx.py tl.json stem.wav && sh ../mix.sh stem.wav out/audio.wav

import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sfxlib import Mixer
import sys as _sys; _sys.stdout.reconfigure(encoding="utf-8", errors="replace")   # консоль Windows (cp1251)

# kind → (генератор(mx, frames), длительность по умолчанию в секундах или None, если не нужна)
GEN = {
    "boom":       (lambda mx, d: mx.boom(240, 60, 9, 0.3), None),
    "whoosh":     (lambda mx, d: mx.whoosh(d, 500, 6000), 0.25),
    "cloth":      (lambda mx, d: mx.cloth(d), 0.27),
    "click":      (lambda mx, d: mx.click(1.0), None),
    "tap":        (lambda mx, d: mx.tap(), None),
    "sand_step":  (lambda mx, d: mx.sand_step(), None),
    "sand_slide": (lambda mx, d: mx.sand_slide(d), 0.45),
    "sand_spray": (lambda mx, d: mx.sand_spray(d), 0.65),
    "glass":      (lambda mx, d: mx.glass_grab(), None),
    "hiss":       (lambda mx, d: mx.hiss(d), 1.0),
    "swell":      (lambda mx, d: mx.swell(d), 1.3),
}

def main():
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    tl = json.load(open(sys.argv[1], encoding="utf-8"))
    out = os.path.abspath(sys.argv[2])
    fps = float(tl.get("fps", 30)); dur = float(tl["duration_sec"])
    mx = Mixer(dur * fps, fps)
    for e in tl.get("sfx", []):
        kind = e["kind"]
        if kind not in GEN:
            sys.exit(f"неизвестный kind {kind!r}; допустимые: {', '.join(GEN)}")
        gen, dd = GEN[kind]
        d = max(1, int(round(float(e.get("dur_sec", dd or 0)) * fps)))   # длительность в кадрах
        mx.put(gen(mx, d), float(e["t_sec"]) * fps, float(e.get("gain", 0)), float(e.get("pan", 0)),
               f"{kind}@{e['t_sec']}")
    n, length = mx.save(out, os.path.splitext(out)[0] + ".csv")
    print(n, "событий,", length, "с →", out)

if __name__ == "__main__":
    main()

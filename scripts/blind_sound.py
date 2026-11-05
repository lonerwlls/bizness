# Звук: пробный ролик «Imagine never seeing again». Время событий берётся из src/blind/voice.ts. python3 scripts/blind_sound.py
import os, sys, json
sys.path.insert(0, os.path.dirname(__file__))
from sfx import *  # noqa

s = open("src/blind/voice.ts", encoding="utf8").read()
V = json.loads(s[s.index("{"): s.rindex("}") + 1])
LEAD = 0.3
def at(w): return next(x["t"] for x in V["words"] if x["w"] == w) + LEAD
END = V["dur"] + 1.0

def horn(d):
    x = t(int(d * SR)); v = np.sign(np.sin(2 * np.pi * 420 * x)) + np.sign(np.sin(2 * np.pi * 530 * x))
    return norm(filt(v, 300, 2500)) * env(len(x), 0.02, 0.1)

add(pad(END, [45, 52, 57, 60], 0.9), 0.0, 0.12)            # тревожный фон
add(bed(END, 200, 900, 1.0, 1.5), 0.0, 0.03, -0.3)          # гул города
for a in (0.3, 1.1, 1.9): add(chirp(), a, 0.06, 0.4)         # утро, птички
b = at("can") - 0.07
add(shimmer(0.6, 2400, 300), b - 0.2, 0.15)                 # гаснет зрение
add(boom(1.4), b + 0.1, 0.3)
for a in np.arange(b + 0.2, END - 0.3, 0.85): add(thud(55, 0.3), a, 0.18); add(thud(55, 0.3), a + 0.22, 0.11)
for w in ("Not", "Everyone", "Cars", "Strangers", "And"): add(whoosh(0.45, 400, 3500), at(w) - 0.3, 0.12)
c = at("crash")
add(squeal(0.6), c - 0.5, 0.2, 0.3)
add(boom(1.6), c, 0.4); add(crunch(), c + 0.02, 0.3); add(tinkle(1.0, 18), c + 0.1, 0.15)
add(horn(1.2), c + 0.5, 0.06, -0.5)
for k in range(4): add(thud(140, 0.15), at("Strangers") + 0.1 + k * 0.5, 0.07)  # шаги на ощупь
add(pad(2.5, [33, 40], 1.0), at("And") - 0.1, 0.2)
save("public/blind/sfx.wav")

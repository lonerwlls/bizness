# Звук: пробный ролик «Imagine never seeing again» (10,5 сек). python3 scripts/blind_sound.py
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from sfx import *  # noqa

def horn(d):
    x = t(int(d * SR)); v = np.sign(np.sin(2 * np.pi * 420 * x)) + np.sign(np.sin(2 * np.pi * 530 * x))
    return norm(filt(v, 300, 2500)) * env(len(x), 0.02, 0.1)

def heart():
    return thud(55, 0.3) * 0.9

add(pad(10.6, [45, 52, 57, 60], 0.9), 0.0, 0.22)          # тревожный фон
add(bed(10.6, 200, 900, 1.0, 1.5), 0.0, 0.05, -0.3)          # гул города
for a in (0.3, 1.1, 1.9): add(chirp(), a, 0.10, 0.4)          # утро, птички
add(shimmer(0.6, 2400, 300), 2.25, 0.25)                     # гаснет зрение
add(boom(1.4), 2.5, 0.45)
for a in np.arange(2.6, 10.4, 0.85): add(heart(), a, 0.35); add(heart(), a + 0.22, 0.22)
for a in (3.06, 4.0, 4.96, 6.36, 8.1): add(whoosh(0.45, 400, 3500), a - 0.2, 0.22)
add(squeal(0.6), 4.7, 0.35, 0.3)
add(boom(1.6), 5.2, 0.7); add(crunch(), 5.22, 0.5); add(tinkle(1.0, 18), 5.3, 0.25)
add(horn(1.2), 5.7, 0.10, -0.5); add(horn(0.5), 6.9, 0.06, 0.6)
for a in (6.5, 7.0, 7.5, 8.0): add(thud(140, 0.15), a, 0.12)  # шаги на ощупь
add(pad(2.5, [33, 40], 1.0), 8.1, 0.35)
save("public/blind/sfx.wav")

# Звук: «What if everyone lost their eyes», часть 2. python3 scripts/eyes2_sound.py
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from sfx import *  # noqa

def tap(): return norm(click(2600, 0.04, 160) + click(1200, 0.04, 200) * 0.5)
def mix2(a, b):
    n = max(len(a), len(b)); out = np.zeros(n); out[:len(a)] += a; out[:len(b)] += b; return out
def knock(): return norm(mix2(thud(180, 0.12), click(600, 0.05, 80) * 0.6))
def radio_voice(d):
    n = int(d * SR); x = t(n)
    f0 = 120 + 25 * np.sin(2 * np.pi * 1.7 * x) + 15 * np.sin(2 * np.pi * 3.1 * x)
    v = np.sign(np.sin(2 * np.pi * np.cumsum(f0) / SR)) * (np.abs(np.sin(2 * np.pi * 2.2 * x)) > 0.25)
    return norm(filt(v, 500, 2800)) * 0.8 + norm(filt(rng.standard_normal(n), 2000, 6000)) * 0.08

for a in np.arange(0.0, 60.0, 1.0): add(click(2200, 0.015, 500), a, 0.04)
add(whoosh(0.5, 300, 5000), 0.0, 0.3); add(boom(1.2), 0.1, 0.5)
# 1. Майя идёт к двери, стук
add(bed(6.0, 200, 2500, 0.3, 0.3) * 0.6, 0.0, 0.12)
for a in rng.uniform(0.3, 5.5, 4): add(chirp(), a, 0.06)
for a in np.arange(0.2, 3.4, 0.45): add(tap(), a, 0.25)
for a in np.arange(0.4, 3.4, 0.5): add(thud(160, 0.07), a, 0.15)
for a in (3.5, 3.75, 4.0, 4.6, 4.85): add(knock(), a, 0.6)
for a in (4.2, 4.9): add(bark(), a, 0.3, 0.5)
add(click(400, 0.4, 8) * 0.5, 5.0, 0.3)
# 2. трость
add(pad(6.0, [55, 59, 62, 67]), 6.0, 0.25); add(click(1800, 0.05, 120), 9.05, 0.3)
# 3. урок
for a in np.arange(12.2, 18.0, 0.45): add(tap(), a, 0.28, -0.2)
for a in np.arange(12.4, 18.0, 0.5): add(tap(), a, 0.15, 0.3)
for a in rng.uniform(12.2, 17.8, 4): add(chirp(), a, 0.05)
# 4. инфографика
for a in np.arange(18.2, 20.0, 0.07): add(click(3000, 0.01, 600), a, 0.06)
add(boom(1.4), 18.0, 0.4); add(chime(1320, 2, 0.15), 20.8, 0.3)
add(pad(6.0, [52, 57, 60, 64]), 18.5, 0.3)
# 5. шаги
for i, a in enumerate(np.arange(24.0, 28.6, 0.31)): add(thud(150, 0.07), a, 0.2); add(ping(700 + i * 15, 0.12, 25), a, 0.06)
add(chime(1760, 2, 0.12), 28.7, 0.35)
# 6. солнце
add(pad(6.0, [57, 60, 64, 69]), 30.0, 0.3)
for a in rng.uniform(30.2, 35.5, 4): add(chirp(), a, 0.05)
# 7. радио
add(radio_voice(5.8), 36.1, 0.25)
add(filt(rng.standard_normal(int(0.4 * SR)), 2000, 6000) * 0.2, 36.0, 0.3)
# 8. вся улица
for a in np.arange(42.0, 48.0, 0.27): add(thud(150, 0.06), a, 0.12, rng.uniform(-0.5, 0.5))
for a in np.arange(42.2, 48.0, 0.45): add(tap(), a, 0.15)
add(pad(6.0, [55, 59, 62, 67, 71]), 42.0, 0.3)
# 9. ночь
add(crickets(6.0), 48.0, 0.08); add(pad(6.0, [48, 55, 60]), 48.0, 0.22)
# 10. свет гаснет
add(hum(2.5, 60) * 0.6, 54.0, 0.12)
add(powerdown(1.5), 56.4, 0.6)
add(breath(0.5, 2500), 57.6, 0.15)
add(pad(3.0, [38, 45, 49]), 56.6, 0.35)
add(boom(1.0), 59.3, 0.7)
save("public/eyes2/sound.wav")

# Звук: «What if everyone lost their eyes», часть 1. python3 scripts/eyes1_sound.py
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from sfx import *  # noqa

def scream(d=0.8, f0=600):
    x = t(int(d * SR)); f = f0 * (1 + 0.3 * np.sin(2 * np.pi * 5 * x)) * (1 - 0.3 * x / d)
    v = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.5 + rng.standard_normal(len(x)) * 0.3
    return norm(filt(v, 700, 3500)) * env(len(x), 0.05, 0.4)

def horn(d):
    x = t(int(d * SR)); v = np.sign(np.sin(2 * np.pi * 420 * x)) + np.sign(np.sin(2 * np.pi * 530 * x))
    return norm(filt(v, 300, 2500)) * env(len(x), 0.02, 0.1)

def ringtone(d):
    x = t(int(d * SR)); m = (np.sin(2 * np.pi * 2.5 * x) > 0) * ((x % 2.0) < 1.2)
    return (np.sin(2 * np.pi * 1320 * x) + np.sin(2 * np.pi * 1760 * x)) * 0.5 * m * env(len(x), 0.01, 0.05)

for a in np.arange(0.0, 60.0, 1.0): add(click(2200, 0.015, 500), a, 0.04)   # тик счётчика
# 1. утро → 8:00
morn = bed(1.5, 200, 2500, 0.2, 0.05); add(morn, 0.0, 0.15)
for a in rng.uniform(0.0, 1.4, 4): add(chirp(), a, 0.08, rng.uniform(-0.8, 0.8))
for a in np.arange(0.1, 1.5, 0.38): add(thud(160, 0.07), a, 0.2)
add(water(1.5) * 0.4, 0.0, 0.08)
add(boom(2.5), 1.48, 1.0)
x = t(int(5.0 * SR)); add(np.sin(2 * np.pi * 3800 * x) * env(len(x), 0.05, 3.0), 1.5, 0.05)   # звон в ушах
add(pad(10.5, [36, 43, 48]), 1.5, 0.3)
add(bed(10.5, 150, 900, 1.0, 1.0), 1.6, 0.15)
add(scream(1.0, 700), 2.4, 0.2, 0.6)
# 2. все сразу: машина, крики
add(engine(3.6, 0.8), 6.0, 0.15, -0.4)
add(thud(80, 0.4), 9.67, 0.7); add(crunch(), 9.67, 0.5)
add(horn(8.0), 9.75, 0.08, -0.3)
for a, p in ((6.5, 0.5), (7.6, -0.6), (8.9, 0.3), (10.4, -0.2)): add(scream(0.9, rng.uniform(500, 900)), a, 0.15, p)
# 3. нет глаз
for a in np.arange(12.0, 18.0, 0.62): add(thud(55, 0.3), a, 0.35)
add(breath(0.6, 1500), 13.0, 0.3); add(breath(0.6, 1500), 14.2, 0.3); add(thud(100, 0.3), 16.2, 0.4)
# 4. только звук
add(horn(6.0), 18.0, 0.15, -0.8)
for a, p in ((18.4, 0.7), (19.6, -0.5), (21.0, 0.4)): add(scream(0.8, rng.uniform(500, 800)), a, 0.15, p)
for a in np.arange(20.0, 24.0, 0.8): add(bark(), a, 0.25 + (a - 20) * 0.08, 0.6 - (a - 20) * 0.15)
# 5. пёс
for a in np.arange(24.0, 26.0, 0.18): add(click(700, 0.03, 120), a, 0.1)
for a in (24.3, 25.0, 25.6): add(bark(), a, 0.4)
add(pad(6.0, [55, 59, 62, 67]), 24.5, 0.28)
for a in np.arange(26.5, 29.5, 0.35): add(breath(0.18, 2600), a, 0.1)
# 6. инфографика
for a in np.arange(30.2, 32.3, 0.07): add(click(3000, 0.01, 600), a, 0.06)
add(boom(1.4), 30.0, 0.4); add(chime(1320, 2, 0.15), 33.3, 0.3)
# 7. город замер
add(horn(6.0), 36.0, 0.1, -0.5); add(horn(6.0) * 0.6, 36.3, 0.06, 0.5)
add(bed(6.0, 100, 600, 0.5, 0.5), 36.0, 0.2)
add(pad(6.0, [38, 45, 50]), 36.0, 0.3)
# 8. домой
for a in np.arange(42.2, 48.0, 0.5): add(thud(150, 0.07), a, 0.15)
for a in np.arange(42.1, 48.0, 0.22): add(click(800, 0.02, 200), a, 0.05)
add(pad(6.0, [52, 59, 64]), 42.0, 0.25)
for a in rng.uniform(42.2, 47.8, 4): add(chirp(), a, 0.05)
# 9–10. дома: голос, звонок
add(hum(12.0, 60) * 0.3, 48.0, 0.05)
for a in (49.5, 50.3, 51.2): add(ping(900, 0.25, 12), a, 0.2)
add(ringtone(3.3), 54.0, 0.3)
add(click(2500, 0.03, 300), 57.33, 0.3)
add(pad(5.5, [57, 60, 64, 69]), 54.3, 0.3)
save("public/eyes1/sound.wav")

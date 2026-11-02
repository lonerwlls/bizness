# Звук: «What if everyone lost their eyes», часть 4. python3 scripts/eyes4_sound.py
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from sfx import *  # noqa

def mix2(a, b):
    n = max(len(a), len(b)); out = np.zeros(n); out[:len(a)] += a; out[:len(b)] += b; return out
def tongue(): return norm(mix2(click(3500, 0.02, 400), click(1800, 0.03, 300)))
def echo(at, gain=0.5):
    add(tongue(), at, gain)
    for k in range(3): add(filt(tongue(), None, 2600 - k * 600) * (0.45 ** (k + 1)), at + 0.25 + k * 0.1, gain)
def bell(f):
    return norm(mix2(ping(f, 1.2, 3), ping(f * 2.76, 0.8, 5) * 0.4))
def chirp_beacon():
    x = t(int(0.18 * SR)); fr = 2200 + 1800 * x / 0.18
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.sin(np.pi * x / 0.18)
def voice_ai(d):
    n = int(d * SR); x = t(n)
    f0 = 190 + 20 * np.sin(2 * np.pi * 2.0 * x)
    v = np.sign(np.sin(2 * np.pi * np.cumsum(f0) / SR)) * (np.abs(np.sin(2 * np.pi * 3.0 * x)) > 0.3)
    return norm(filt(v, 800, 3500)) * env(n, 0.05, 0.1)

for a in np.arange(0.0, 60.0, 1.0): add(click(2200, 0.015, 500), a, 0.04)
add(whoosh(0.5, 300, 5000), 0.0, 0.3); add(boom(1.2), 0.1, 0.5)
add(bed(60.0, 200, 1500, 0.5, 1.0) * 0.4, 0.0, 0.08)
# 1. щелчки → машина
for c in (0.83, 2.83, 4.67): echo(c); add(shimmer(0.6, 900, 2400), c + 0.55, 0.15)
add(pad(6.0, [50, 57, 62]), 0.0, 0.22)
# 2. схема
for a in np.arange(6.0, 12.0, 3.0): add(tongue(), a + 0.1, 0.4); add(filt(tongue(), None, 2000) * 0.4, a + 1.6, 0.4)
# 3. идёшь сам
for c in (12.5, 13.67, 14.83, 16.0): echo(c, 0.4)
for a in np.arange(12.1, 18.0, 0.4): add(thud(150, 0.07), a, 0.15)
add(pad(6.0, [55, 59, 62, 67]), 12.0, 0.22)
# 4. собака-поводырь
for a in np.arange(18.1, 24.0, 0.43): add(thud(150, 0.07), a, 0.15)
for a in np.arange(18.05, 24.0, 0.2): add(click(800, 0.02, 200), a, 0.05)
add(bark(), 21.0, 0.2, -0.6)
# 5. ИИ-телефон
for a, d in ((24.33, 1.4), (26.0, 0.8), (27.5, 1.6), (29.07, 0.8)): add(ping(1600, 0.15, 20), a, 0.2); add(voice_ai(d), a + 0.15, 0.2)
# 6. свет вернулся
add(crickets(6.0), 30.0, 0.06)
add(hum(3.6, 60) * 0.5, 32.33, 0.15); add(click(1800, 0.05, 120), 32.33, 0.4)
add(pad(3.5, [60, 64, 67, 72]), 32.4, 0.35)
for a in (32.7, 33.1, 33.6): add(bark(), a, 0.3)
# 7. огород
for a in rng.uniform(36.2, 41.8, 6): add(chirp(), a, 0.06, rng.uniform(-0.7, 0.7))
for a in np.arange(36.3, 42.0, 0.5): add(norm(filt(rng.standard_normal(int(0.12 * SR)), 300, 2000)) * env(int(0.12 * SR), 0.01, 0.08), a, 0.08)
add(pad(6.0, [55, 59, 62, 67]), 36.0, 0.2)
# 8. рынок колокольчиков
for a, f in zip(np.arange(42.2, 48.0, 0.7), [880, 1047, 1175, 1319, 988, 1568, 1319, 1047, 880]): add(bell(f), a, 0.18, rng.uniform(-0.6, 0.6))
add(norm(filt(noise(6.0), 300, 2500)) * env(int(6 * SR), 0.3, 0.3), 42.0, 0.06)
# 9. учишь
for c in (49.0, 51.33): echo(c, 0.5)
add(pad(6.0, [57, 60, 64, 69]), 48.0, 0.25)
# 10. маяк
for a in np.arange(54.4, 56.0, 0.25): add(click(600, 0.05, 60), a, 0.15)
for a in np.arange(56.67, 59.8, 0.5): add(chirp_beacon(), a, 0.3)
add(boom(1.0), 59.3, 0.5)
save("public/eyes4/sound.wav")

# Звук: «What if everyone lost their eyes», часть 5. python3 scripts/eyes5_sound.py
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from sfx import *  # noqa

def chirp_beacon():
    x = t(int(0.18 * SR)); fr = 2200 + 1800 * x / 0.18
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.sin(np.pi * x / 0.18)
def jingle():
    out = np.zeros(int(0.5 * SR))
    for _ in range(6):
        a = int(rng.uniform(0, 0.15) * SR); p = ping(rng.uniform(3000, 5000), 0.3, 18); out[a:a + len(p)] += p[: len(out) - a] * rng.uniform(0.3, 1)
    return norm(out)
def radio_voice(d):
    n = int(d * SR); x = t(n)
    f0 = 125 + 25 * np.sin(2 * np.pi * 1.7 * x)
    v = np.sign(np.sin(2 * np.pi * np.cumsum(f0) / SR)) * (np.abs(np.sin(2 * np.pi * 2.2 * x)) > 0.25)
    return norm(filt(v, 300, 3200))
def band(d):
    x = np.zeros(int(d * SR)); beat = 60 / 128
    prog = [[57, 64, 69], [53, 60, 65], [55, 62, 67], [52, 59, 64]]
    for i in range(int(d / beat)):
        a = int(i * beat * SR)
        k = thud(55, 0.3); x[a:a + len(k)] += k[: len(x) - a]
        if i % 2: sn = filt(rng.standard_normal(int(0.15 * SR)), 1200, 7000) * np.exp(-t(int(0.15 * SR)) * 25); x[a:a + len(sn)] += sn[: len(x) - a] * 0.6
        if i % 4 == 0: p = pad(beat * 4, prog[(i // 4) % 4], 0.6); x[a:a + len(p)] += p[: len(x) - a]
        hh = filt(rng.standard_normal(int(0.04 * SR)), 6000, None) * np.exp(-t(int(0.04 * SR)) * 80); b2 = a + int(beat / 2 * SR); x[b2:b2 + len(hh)] += hh[: len(x) - b2] * 0.3
    return norm(x)

for a in np.arange(0.0, 60.0, 1.0): add(click(2200, 0.015, 500), a, 0.03)
add(whoosh(0.5, 300, 5000), 0.0, 0.3); add(boom(1.2), 0.1, 0.5)
# 1. город для ушей
for a in np.arange(0.5, 6.0, 1.0): add(chirp_beacon(), a, 0.18, -0.3)
for a in np.arange(0.1, 6.0, 0.4): add(thud(150, 0.07), a, 0.13)
add(pad(6.0, [55, 59, 62, 67]), 0.0, 0.25)
# 2. правила
for i in range(4): add(ping(700 + i * 130, 0.3, 10), 6.4 + 0.6 * i, 0.3)
# 3. переход, машины без водителя
x = t(int(3.0 * SR)); add(np.sin(2 * np.pi * (260 + 40 * np.sin(2 * np.pi * 0.5 * x)) * x) * env(len(x), 0.5, 1.0) * 0.4, 12.0, 0.2, -0.4)
for a in np.arange(14.7, 18.0, 0.3): add(ping(1000, 0.08, 40), a, 0.2, 0.4)
# 4. радио
add(radio_voice(5.6), 18.3, 0.22)
add(hum(6.0, 50) * 0.2, 18.0, 0.05)
# 5. концерт
add(band(6.0) * env(int(6 * SR), 0.2, 0.3), 24.0, 0.45)
add(norm(filt(noise(6.0), 300, 2500)) * env(int(6 * SR), 0.5, 0.5), 24.0, 0.08)
# 6. мозг
add(pad(6.0, [52, 59, 64, 71]), 30.0, 0.3); add(shimmer(2.0, 500, 2000), 31.2, 0.25)
# 7. футбол с колокольчиками
for a in np.arange(36.2, 42.0, 0.42): add(jingle(), a, 0.22, rng.uniform(-0.5, 0.5))
for a in np.arange(36.1, 42.0, 0.25): add(thud(170, 0.05), a, 0.07)
add(norm(filt(noise(6.0), 500, 3000)) * env(int(6 * SR), 0.3, 0.3), 36.0, 0.05)
# 8. старый Бадди
add(pad(6.0, [52, 55, 59, 64]), 42.0, 0.3)
for a in np.arange(42.5, 48.0, 1.1): add(breath(0.5, 1800), a, 0.12)
for a in rng.uniform(42.2, 47.8, 3): add(chirp(), a, 0.05)
# 9. свадьба
for a, f in zip(np.arange(48.2, 54.0, 0.5), [784, 988, 1175, 1568, 1319, 1175, 988, 1175, 1568, 1976, 1568, 1319]): add(ping(f, 1.0, 4), a, 0.15)
for a in np.arange(51.0, 54.0, 0.08): add(click(rng.uniform(1500, 3000), 0.02, 300), a, 0.07, rng.uniform(-0.6, 0.6))
add(pad(6.0, [60, 64, 67, 72]), 48.0, 0.3)
# 10. роддом
for a in np.arange(54.1, 58.6, 0.5): add(thud(150, 0.07), a, 0.2)
add(hum(6.0, 120) * 0.15, 54.0, 0.08)
for a in np.arange(54.0, 58.6, 0.75): add(thud(55, 0.3), a, 0.25)
x = t(int(1.2 * SR)); cry = np.sin(2 * np.pi * np.cumsum(450 + 150 * np.sin(2 * np.pi * 1.5 * x)) / SR); add(filt(cry, 400, 3000) * env(len(x), 0.05, 0.4), 58.7, 0.35)
add(pad(1.4, [60, 64, 67, 72]), 58.8, 0.3)
save("public/eyes5/sound.wav")

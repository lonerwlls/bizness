# Звук: «What if everyone lost their eyes», часть 3. python3 scripts/eyes3_sound.py
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from sfx import *  # noqa

def mix2(a, b):
    n = max(len(a), len(b)); out = np.zeros(n); out[:len(a)] += a; out[:len(b)] += b; return out
def tap(): return norm(mix2(click(2600, 0.04, 160), click(1200, 0.04, 200) * 0.5))
def sizzle(d):
    n = int(d * SR); x = norm(filt(rng.standard_normal(n), 3000, 9000)) * 0.5
    for _ in range(int(d * 60)):
        a = int(rng.uniform(0, d - 0.02) * SR); c = click(rng.uniform(3000, 7000), 0.01, 500); x[a:a + len(c)] += c * rng.uniform(0.2, 0.8)
    return x
def crackle(d):
    n = int(d * SR); x = norm(filt(rng.standard_normal(n), 100, 600)) * 0.3
    for _ in range(int(d * 14)):
        a = int(rng.uniform(0, d - 0.03) * SR); c = click(rng.uniform(800, 3000), 0.03, 150); x[a:a + len(c)] += c * rng.uniform(0.3, 1)
    return x
def radio_voice(d):
    n = int(d * SR); x = t(n)
    f0 = 120 + 25 * np.sin(2 * np.pi * 1.7 * x)
    v = np.sign(np.sin(2 * np.pi * np.cumsum(f0) / SR)) * (np.abs(np.sin(2 * np.pi * 2.2 * x)) > 0.25)
    return norm(filt(v, 500, 2800))
def tongue(): return norm(mix2(click(3500, 0.02, 400), click(1800, 0.03, 300)))

for a in np.arange(0.0, 60.0, 1.0): add(click(2200, 0.015, 500), a, 0.04)
add(whoosh(0.5, 300, 5000), 0.0, 0.3); add(boom(1.2), 0.1, 0.5)
# 1. холодильник
add(click(500, 0.3, 12) * 0.6, 0.7, 0.4); add(pad(6.0, [40, 47, 52]), 0.0, 0.25)
add(breath(0.6, 1500), 2.2, 0.25); add(breath(0.5, 1500), 3.0, 0.2)
# 2. вода
add(water(1.7), 6.0, 0.3)
for i in range(10):
    if rng.random() > 0.35: add(water(0.12) * env(int(0.12 * SR), 0.01, 0.05), 7.7 + i * 0.16, 0.3)
for a in np.arange(9.4, 11.4, 0.73): add(ping(1800, 0.2, 25), a, 0.3)
for a in (10.4, 10.6, 10.8): add(click(1500, 0.05, 120), a, 0.3)
# 3. инфографика
for i in range(5): add(ping(600 + i * 120, 0.3, 10), 12.4 + 0.4 * i, 0.3)
add(pad(6.0, [38, 45, 50]), 12.0, 0.25)
# 4. верёвка
add(bed(6.0, 200, 1500, 0.3, 0.3), 18.0, 0.15)
for a in np.arange(18.1, 24.0, 0.33): add(thud(150, 0.06), a, 0.13, rng.uniform(-0.5, 0.5))
for a in np.arange(18.2, 24.0, 0.45): add(tap(), a, 0.15)
add(pad(6.0, [52, 57, 60, 64]), 18.0, 0.25)
# 5–6. магазин
add(hum(12.0, 50) * 0.2, 24.0, 0.04)
for a in rng.uniform(24.2, 29.8, 8): add(click(rng.uniform(400, 1200), 0.08, 40), a, 0.15, rng.uniform(-0.6, 0.6))
for a in np.arange(31.0, 34.6, 0.12): add(norm(filt(rng.standard_normal(int(0.06 * SR)), 1500, 6000)) * env(int(0.06 * SR), 0.005, 0.03), a, 0.25)
add(chime(1320, 2, 0.12), 34.8, 0.25)
# 7. готовим по звуку
add(sizzle(6.0) * env(int(6 * SR), 0.2, 0.3), 36.0, 0.22); add(crackle(6.0), 36.0, 0.25)
add(pad(6.0, [55, 59, 62, 67]), 36.0, 0.22)
# 8. радио с ручкой
for a in np.arange(42.0, 48.0, 0.06): add(click(900, 0.01, 500), a, 0.05)
add(radio_voice(4.6), 43.4, 0.2)
# 9. костёр
add(crackle(6.0), 48.0, 0.3); add(crickets(6.0), 48.0, 0.06)
add(pad(6.0, [52, 55, 59, 64, 67]), 48.0, 0.3)
# 10. щелчок → эхо
add(crickets(6.0), 54.0, 0.05)
for c in (55.0, 57.17):
    add(tongue(), c, 0.6)
    for k in range(3): add(filt(tongue(), None, 2500 - k * 500) * (0.4 ** (k + 1)), c + 0.4 + k * 0.12, 0.5)
add(shimmer(1.2, 800, 2400), 55.9, 0.25); add(shimmer(1.2, 800, 2400), 58.05, 0.3)
add(boom(1.0), 59.3, 0.6)
save("public/eyes3/sound.wav")

# Звук: «What if everyone lost their eyes», часть 6 (финал). python3 scripts/eyes6_sound.py
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from sfx import *  # noqa

def coo(d=0.6, f0=520):  # «агу» малыша
    x = t(int(d * SR)); f = f0 + 160 * np.sin(np.pi * x / d)
    v = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.3 * np.sin(4 * np.pi * np.cumsum(f) / SR)
    return norm(filt(v, 300, 3500) * np.sin(np.pi * x / d) ** 2)
def music_box(start, notes, step=0.42, g=0.12):
    for i, m in enumerate(notes):
        add(ping(440 * 2 ** ((m - 69) / 12), 1.2, 3.5), start + i * step, g, 0.2 * np.sin(i))
def brush(d=0.6):
    n = int(d * SR); x = t(n)
    return norm(filt(rng.standard_normal(n), 2000, 7000) * np.sin(np.pi * x / d) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 3 * x))))

for a in np.arange(0.0, 54.0, 1.0): add(click(2200, 0.015, 500), a, 0.025)
add(whoosh(0.5, 300, 5000), 0.0, 0.3)
# 1. роддом: глаза открываются
add(hum(6.0, 120) * 0.15, 0.0, 0.06)
add(pad(6.0, [60, 64, 67, 72]), 0.0, 0.25)
add(shimmer(2.0, 500, 2200), 2.0, 0.3)
add(coo(0.7), 3.2, 0.3); add(coo(0.5, 600), 4.4, 0.25)
# 2. инфографика: новое поколение
for i in range(5): add(ping(660 + i * 110, 0.4, 8), 6.3 + 0.5 * i, 0.25)
add(riser(2.0), 9.5, 0.15); add(thud(70, 0.4), 11.5, 0.3)
# 3. кроватка и мобиль: музыкальная шкатулка + смех
music_box(12.0, [72, 76, 79, 76, 74, 77, 81, 77, 72, 76, 79, 84, 79, 76])
add(laugh(4, 520), 13.2, 0.25); add(laugh(3, 420), 15.4, 0.18); add(laugh(4, 540), 16.2, 0.22)
# 4. прогулка с дочкой и Бадди
for a in np.arange(18.1, 24.0, 0.5): add(thud(150, 0.07), a, 0.14, -0.2)
for a in np.arange(18.35, 24.0, 0.35): add(thud(190, 0.05), a, 0.08, 0.2)
for a in rng.uniform(18.2, 23.8, 4): add(chirp(), a, 0.06, rng.uniform(-0.6, 0.6))
add(pad(6.0, [55, 59, 62, 67]), 18.0, 0.22)
# 5. бабочка: «It's blue, Dad!»
add(flutter(0.8), 24.6, 0.15); add(flutter(0.8), 26.0, 0.12)
add(shimmer(1.5, 800, 2600), 26.8, 0.25); add(laugh(3, 560), 27.6, 0.22)
add(pad(6.0, [57, 60, 64, 69]), 24.0, 0.22)
# 6. класс
add(norm(filt(noise(6.0), 400, 3000)) * env(int(6 * SR), 0.3, 0.3), 30.0, 0.05)
for a in (30.8, 32.4, 34.0): add(chime(1047, 1, 0.3), a, 0.12)
add(laugh(4, 480), 33.0, 0.15); add(laugh(3, 600), 34.6, 0.12)
add(pad(6.0, [60, 65, 69, 72]), 30.0, 0.2)
# 7. щенок для старого Бадди
for a in (36.6, 37.5, 38.6, 39.8, 41.0): add(bark() , a, 0.12, rng.uniform(-0.4, 0.4))
for a in np.arange(36.2, 42.0, 0.2): add(thud(260, 0.04), a, 0.05)
add(breath(0.6, 1600), 38.0, 0.1); add(breath(0.6, 1600), 40.3, 0.1)
add(pad(6.0, [55, 60, 64, 67]), 36.0, 0.22)
# 8. мир снова цветной: кисти и краски
for a in np.arange(42.2, 48.0, 0.7): add(brush(0.5), a, 0.12, rng.uniform(-0.5, 0.5))
for i, a in enumerate(np.arange(42.3, 47.0, 0.55)): add(ping(523 * 2 ** ((i % 6) * 2 / 12), 0.5, 6), a, 0.08)
add(laugh(4, 500), 45.0, 0.15)
add(pad(6.0, [60, 64, 67, 71]), 42.0, 0.25)
# 9. закат на скамейке
add(pad(6.0, [57, 61, 64, 69]), 48.0, 0.3)
add(crickets(6.0) * 0.4, 48.0, 0.06)
add(shimmer(1.8, 600, 2000), 51.0, 0.22)
# 10. улыбка и THE END: большое тёплое крещендо, потом тишина
add(pad(4.5, [53, 57, 60, 65, 69]), 54.0, 0.35)
add(riser(3.0), 55.0, 0.12)
add(shimmer(2.5, 400, 2400), 57.0, 0.3)
add(pad(2.2, [60, 64, 67, 72, 76]), 57.6, 0.3)
add(ping(523, 2.0, 1.5), 58.3, 0.2); add(ping(784, 2.0, 1.5), 58.3, 0.12)
save("public/eyes6/sound.wav")

# Звук для «Last man on Earth», часть 2 (60 сек, без голоса). python3 scripts/lastman2_sound.py
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from sfx import *  # noqa

for a in np.arange(0.0, 59.5, 1.0): add(click(2200, 0.015, 500), a, 0.05)   # тик счётчика

def static(d):
    n = int(d * SR); return norm(filt(rng.standard_normal(n), 800, 7000)) * (0.7 + 0.3 * np.abs(np.sin(2 * np.pi * 3 * t(n))))

def garble(d=1.6):  # обрывок голоса сквозь помехи
    n = int(d * SR); x = t(n)
    f0 = 140 + 30 * np.sin(2 * np.pi * 2.3 * x)
    v = np.sign(np.sin(2 * np.pi * np.cumsum(f0) / SR)) * (np.sin(2 * np.pi * 4.5 * x) > -0.2)
    return norm(filt(v, 400, 2600) + static(d) * 0.4) * env(n, 0.05, 0.3)

def chapter(at):
    add(whoosh(0.5, 300, 5000), at - 0.2, 0.4); add(boom(1.2), at + 0.1, 0.6)

# 1. бег к свету
add(bed(6.0, 200, 1500, 0.2, 0.3), 0.0, 0.2)
for a in np.arange(0.1, 6.0, 0.27): add(thud(130, 0.08), a, 0.3)
for a in np.arange(0.3, 6.0, 0.7): add(breath(0.35, 2200), a, 0.18)
add(pad(6.0, [38, 45, 50]), 0.0, 0.3)
for a in np.arange(0.2, 6.0, 0.6): add(heartbeat() if 'heartbeat' in dir() else thud(55, 0.3), a, 0.25)
add(boom(1.4), 0.4, 0.7)
# 2. карта
for a in np.arange(6.2, 12.0, 1.0): add(ping(1800, 0.3, 12), a, 0.15)
for a in (6.1, 8.4, 10.2): add(click(3000, 0.03, 300), a, 0.2)
add(pad(6.0, [40, 47, 52]), 6.0, 0.22)
# 3. пустая комната
add(click(400, 0.6, 5) * 0.6, 12.35, 0.4)
for a in np.arange(13.0, 14.7, 0.4): add(thud(150, 0.08), a, 0.2)
add(hum(5.0, 60) * 0.4, 12.5, 0.1)
for a in np.arange(12.5, 18.0, 0.5): add(click(5000, 0.01, 600), a, 0.06)
add(pad(1.8, [43, 47, 50]), 14.4, 0.25)
add(ping(1760, 1.0, 4) + ping(2640, 1.0, 5), 16.35, 0.35)
# 4. инфографика
chapter(17.87)
for i in range(4): add(whoosh(0.3, 800, 6000), 18.25 + 0.93 * i, 0.3); add(ping(900 + i * 220, 0.4, 8), 18.35 + 0.93 * i, 0.25)
x = t(int(2.0 * SR)); add(np.sin(2 * np.pi * np.cumsum(300 + 500 * x / 2) / SR) * env(len(x), 0.1, 0.1) * 0.25, 21.0, 0.3)
add(ping(2093, 0.8, 4), 21.7, 0.3); add(chime(1320, 2, 0.12), 22.4, 0.3)
# 5. панели
add(bed(6.0, 300, 2500, 0.3, 0.3) * 0.5, 24.0, 0.12)
for a in rng.uniform(24.2, 29.5, 5): add(chirp(), a, 0.05, rng.uniform(-0.8, 0.8))
for a in np.arange(24.1, 30.0, 0.38): add(thud(140, 0.08), a, 0.18)
for a in (25.67, 27.33, 29.0): add(thud(90, 0.3), a, 0.5); add(click(700, 0.1, 40), a, 0.3)
# 6. свет включился
add(click(1800, 0.05, 150), 31.33, 0.6); add(hum(4.6, 60) * 0.5, 31.35, 0.15)
add(pad(3.0, [60, 64, 67]), 31.4, 0.35)
for a in (31.6, 32.0, 32.5, 33.0): add(bark(), a, 0.35, 0.3)
add(whoosh(0.8, 200, 3000), 33.6, 0.35)
add(pad(2.4, [57, 60, 64]) * 0.8, 33.8, 0.3)
# 7. еда → семена
chapter(35.87)
for i in range(4): add(ping(600 + i * 150, 0.3, 10), 36.33 + 0.4 * i, 0.3)
add(water(1.7) * env(int(1.7 * SR), 0.1, 0.3), 39.8, 0.15)
for a in rng.uniform(39.2, 41.8, 4): add(chirp(), a, 0.06)
# 8. олень
for a in rng.uniform(42.1, 47.8, 7): add(chirp(), a, 0.07, rng.uniform(-0.8, 0.8))
for a in np.arange(42.2, 48.0, 0.38): add(click(900, 0.04, 90), a, 0.15, 0.3)
for a in (44.7, 45.3, 46.0, 46.8): add(bark(), a, 0.35, -0.3)
add(pad(6.0, [55, 59, 62]) * 0.8, 42.0, 0.22)
# 9. радио
chapter(47.87)
st = static(11.5) * env(int(11.5 * SR), 0.3, 0.05); add(st, 48.1, 0.12)
add(click(2500, 0.03, 300), 48.3, 0.3)
add(pad(6.0, [45, 52, 57]) * 0.8, 48.0, 0.25)
# 10. ответ
add(pad(2.0, [38, 45, 49]), 54.0, 0.3)
add(glitch(0.3) if 'glitch' in dir() else click(300, 0.3, 10), 56.0, 0.5)
add(garble(1.8), 56.05, 0.6)
add(boom(1.2), 56.0, 0.6)
add(riser(2.3), 57.2, 0.35)
add(boom(1.0), 59.4, 0.9)
save("public/lastman2/sound.wav")

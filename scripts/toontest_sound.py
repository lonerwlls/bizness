# Звук пробы «мультяшное 3D». python3 scripts/toontest_sound.py
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from sfx import *  # noqa
F = 1 / 30
add(pad(10.0, [57, 61, 64, 69], 0.8), 0.0, 0.18)
for fr in (50, 90, 130, 160, 192, 222, 267): add(whoosh(0.35, 400, 4000), fr * F - 0.12, 0.18)
add(ping(1320, 0.5, 5), 1.9, 0.12)  # хитрая ухмылка
add(laugh(5, 380), 3.1, 0.35, -0.3); add(laugh(4, 470), 3.4, 0.3, 0.3)
add(shimmer(1.0, 900, 2600), 4.4, 0.25)
add(filt(noise(2.6), 40, 300) * env(int(2.6 * SR), 0.8, 0.6), 5.2, 0.5)  # гул топота
for a in np.arange(5.4, 7.6, 0.11): add(thud(110, 0.06), a + rng.uniform(0, 0.04), 0.12, rng.uniform(-0.5, 0.5))
add(ping(700, 0.4, 8), 6.45, 0.25); add(breath(0.4, 2500), 6.5, 0.15)
for i in range(12): add(ping(rng.uniform(2600, 3600), 0.35, 14), 7.55 + i * 0.11, 0.18, 0.2)
add(chime(1047, 2, 0.12), 8.95, 0.25)
add(shimmer(1.2, 600, 2400), 9.0, 0.25)
save("public/toontest/sound.wav")

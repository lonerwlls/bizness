# Звук тест-сцены «Коридор»: гул ламп, шаги по шагам анимации, швабра, смех, похлопывания, «поп» реплик.
import os, sys, math
sys.path.insert(0, os.path.dirname(__file__))
from sfx import *  # noqa
F = 1 / 30
D = 15.0
add(hum(D, 60) * 0.5, 0, 0.05)
add(norm(filt(noise(D), 150, 1200)) * env(int(D * SR), 0.5, 0.5), 0, 0.03)
def ease_out_sin(t): return math.sin(t * math.pi / 2)
def hero_x(f):
    if f < 108: return 330 + (1040 - 330) * ease_out_sin(min(1, f / 108))
    if f < 396: return 1040
    return 1040 - (f - 396) * 9.4
def dist(f):
    x = hero_x(f)
    return (x - 330) / 0.75 if f < 108 else (1040 - x) / 0.75 + 7
prev = None
for f in list(range(0, 108)) + list(range(396, 450)):
    k = math.floor(dist(f) / 95)
    if prev is not None and k != prev: add(thud(170, 0.06), f * F, 0.22, -0.3); add(click(1800, 0.02, 400), f * F, 0.05)
    prev = k
    if f == 107: prev = None
for f in range(0, 138):  # швабра: шорох на каждом проходе
    if f % 28 == 0: add(scrub(0.6), f * F, 0.07, 0.4)
add(thud(120, 0.1), 158 * F, 0.15, 0.4)
for f, txt in ((114, 0), (202, 0), (240, 0), (330, 0)): add(ping(1400, 0.15, 30), f * F, 0.12)
add(laugh(5, 300), 200 * F, 0.35, 0.3)
add(laugh(4, 520), 300 * F, 0.3, -0.2)
for f in (372, 380, 386): add(thud(260, 0.05), f * F, 0.3)
add(pad(15.0, [57, 64, 69, 72], 0.4), 0, 0.05)
save("public/corridor/sound.wav")

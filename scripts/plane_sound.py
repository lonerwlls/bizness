# Звук шортса «самолёт 400 тонн» (~54.5 с): озвучка Fish Audio + музыка + звуки по сценам (тайминги = кадры/30 из air.ts).
import os, sys, subprocess
import numpy as np
sys.path.insert(0, os.path.dirname(__file__))
from sfx import *  # noqa
D = 1635 / 30
F = lambda f: f / 30
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", "public/plane/voice.wav", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
voice = np.frombuffer(raw, np.float32).astype(float); voice /= np.max(np.abs(voice)) + 1e-9

# ---- музыка: бодрый пиццикато-мотив + пэд + лёгкий бит; пауза на «двигатели заглохли» ----
mel = [72, 76, 79, 76, 74, 77, 81, 77, 72, 76, 79, 84, 83, 79, 76, 74, 72, 76, 79, 76, 77, 81, 84, 81, 79, 76, 74, 76, 79, 83, 84, 86]
quiet = lambda a: F(1291) - 0.2 < a < F(1418)
for i in range(int(D / 0.25)):
    a = 0.05 + i * 0.25
    if a > D - 1.2 or quiet(a): continue
    m = mel[i % len(mel)] - (5 if F(1155) <= a < F(1291) else 0)
    add(ping(440 * 2 ** ((m - 69) / 12), 0.3, 9), a, 0.06, 0.2 * np.sin(i))
chords = [[48, 55, 64], [53, 57, 65], [55, 59, 67], [48, 55, 64]]
for k in range(int(D / 1.15)):
    a = 0.05 + k * 1.15
    if quiet(a) or a > D - 1.0: continue
    ch = chords[k % 4] if not (F(1155) <= a < F(1291)) else [[45, 52, 60], [43, 50, 58]][k % 2]
    add(pad(1.15, ch, 0.6), a, 0.055)
for a in np.arange(0.05, D - 1.2, 0.5):
    if not quiet(a): add(thud(80, 0.12), a, 0.06)
add(pad(4.2, [41, 48, 53, 56], 0.8), F(1291), 0.12)           # тревожная тишина без моторов
add(pad(2.0, [48, 55, 60, 64, 67], 0.8), D - 2.4, 0.09)      # финальный аккорд

# ---- аэропорт и разбег ----
def bedn(d, lo, hi): n = int(d * SR); return norm(filt(noise(d), lo, hi)) * env(n, 0.3, 0.5)
add(bedn(4.1, 60, 700), 0, 0.07)
add(whoosh(0.5, 400, 4000), 0.2, 0.1)
add(boom(1.2), F(31), 0.22); add(thud(60, 0.4), F(31), 0.3)
def roar(d, peak):
    n = int(d * SR); x = t(n)
    r = filt(noise(d), 80, 2600) * (0.3 + 0.7 * np.exp(-((x - peak) / 0.55) ** 2)) * env(n, 0.15, 0.8)
    return norm(r + np.sin(2 * np.pi * np.cumsum(1800 + 500 * x / d) / SR) * 0.12 * env(n, 0.2, 0.8))
add(roar(2.6, 0.75), F(124), 0.15, -0.4)
add(engine(1.3, 1.6), F(160), 0.1)
# ---- в небе: ветер, потоки ----
def windb(d, g=1.0): n = int(d * SR); return norm(filt(noise(d), 500, 4500)) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.7 * t(n))) * env(n, 0.3, 0.5) * g
add(windb(F(309 - 193)), F(193), 0.08)
add(whoosh(0.8, 600, 6000), F(193), 0.14, -0.4)
add(whoosh(0.7, 300, 2500), F(221), 0.15, 0.3)
add(riser(0.9), F(260), 0.09)
add(whoosh(0.6, 500, 6000), F(283), 0.16); add(boom(1.2), F(287), 0.15)
# ---- машина и ладонь ----
add(engine(F(434 - 309), 0.8), F(309), 0.07)
n = int(F(434 - 345) * SR); add(norm(filt(noise(F(434 - 345)), 300, 3000)) * env(n, 0.4, 0.4), F(345), 0.09)
add(whoosh(0.6, 400, 5000), F(397), 0.16); add(ping(988, 0.5, 6), F(399), 0.07); add(laugh(4, 420), F(402), 0.1)
add(windb(F(507 - 434)), F(434), 0.07); add(whoosh(0.7, 300, 3000), F(474), 0.12)
# ---- модель крыла ----
add(click(2200, 0.03, 200), F(507), 0.1)
for a in np.arange(F(555), F(605), 0.42): add(whoosh(0.35, 800, 6000), a, 0.05)
for a in np.arange(F(605), F(680), 0.13): add(click(3000 + 1500 * rng.random(), 0.02, 300), a, 0.03, rng.uniform(-0.5, 0.5))
add(riser(0.8), F(678), 0.08); add(boom(1.0), F(702), 0.12); add(ping(1046, 0.6, 5), F(704), 0.07)
# ---- закрылки ----
add(roar(1.8, 0.6), F(735), 0.12)
n = int(1.0 * SR); x = t(n); add(norm(np.sin(2 * np.pi * np.cumsum(220 + 120 * x) / SR) + 0.3 * filt(noise(1.0), 300, 1200)) * env(n, 0.05, 0.3), F(790), 0.08)
add(thud(70, 0.2), F(820), 0.12)
# ---- машина на крыле ----
add(whoosh(0.6, 300, 2500), F(908), 0.12)
add(boom(1.3), F(925), 0.28); add(crunch(), F(925), 0.2); add(thud(55, 0.5), F(925), 0.35)
add(laugh(5, 380), F(1018), 0.12)
# ---- двигатели только толкают ----
add(engine(F(1105 - 1047), 1.2), F(1047), 0.08)
add(roar(1.6, 0.4), F(1105), 0.12, 0.3)
# ---- 1982: пепел ----
add(windb(F(1655 - 1155), 0.8)[:int(F(1456 - 1155) * SR)], F(1155), 0.07)
add(engine(F(1291 - 1155), 1.4), F(1155), 0.05)
for a in np.arange(F(1256), F(1291), 0.11): add(click(4000, 0.02, 400), a + 0.05 * rng.random(), 0.06, rng.uniform(-0.7, 0.7))
add(boom(1.5), F(1291), 0.22); add(powerdown(1.2), F(1291), 0.18)
for a in (F(1300), F(1320), F(1336)): add(thud(70, 0.3), a, 0.12)
add(riser(1.0), F(1388), 0.06)
add(boom(1.2), F(1418), 0.22); add(roar(2.0, 0.8), F(1418), 0.16)
add(whoosh(0.8, 400, 4000), F(1440), 0.12)
# ---- финал ----
add(roar(2.2, 1.0), F(1456), 0.1, 0.4)
add(ping(1318, 0.7, 4), F(1522), 0.08)
add(voice, 0.0, 0.62)
save("out/plane/_sound60.wav")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "out/plane/_sound60.wav", "-t", str(D), "-af", f"afade=t=out:st={D - 0.6}:d=0.6", "-ar", "48000", "public/plane/sound.wav"], check=True)
print("ok public/plane/sound.wav")

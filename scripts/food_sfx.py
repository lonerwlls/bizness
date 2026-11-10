# Звуки предметов для частей сериала про еду. python3 scripts/food_sfx.py 4 → public/food/sfx4.wav
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from sfx import *  # noqa

def step(soft=1.0):
    n = int(0.09 * SR); x = t(n)
    s = filt(rng.standard_normal(n), 120, 1800) * np.exp(-x * 45) + 0.6 * np.sin(2 * np.pi * 85 * x) * np.exp(-x * 35)
    return norm(s) * soft
def cardboard(d=0.25):
    n = int(d * SR); x = t(n)
    return norm(filt(rng.standard_normal(n), 250, 2600) * np.exp(-x * 14) * (0.6 + 0.4 * np.sin(2 * np.pi * 23 * x)))
def box_down(): return norm(cardboard(0.18) * 0.7 + mixlen(thud(110, 0.18), int(0.18 * SR)))
def mixlen(a, n): b = np.zeros(n); b[: min(n, len(a))] = a[:n]; return b
def paper(d=0.35):
    n = int(d * SR); x = t(n)
    return norm(filt(rng.standard_normal(n), 1500, 7000) * np.sin(np.pi * x / d) ** 2 * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 9 * x))))
def slap(): return norm(mixlen(paper(0.12), int(0.25 * SR)) + mixlen(thud(140, 0.25), int(0.25 * SR)))
def stamp(): return norm(mixlen(thud(80, 0.3), int(0.3 * SR)) + 0.5 * mixlen(click(1200, 0.05, 120), int(0.3 * SR)))
def can(): return norm(ping(2400, 0.25, 22) + 0.6 * mixlen(ping(3300, 0.2, 30), int(0.25 * SR)))
def scribble(d=1.0):
    n = int(d * SR); x = t(n)
    return norm(filt(rng.standard_normal(n), 2500, 8000) * (np.abs(np.sin(2 * np.pi * 6 * x)) > 0.3))
def murmur(d):
    n = int(d * SR); x = t(n)
    base = filt(rng.standard_normal(n), 180, 1100) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.7 * x) * np.sin(2 * np.pi * 1.3 * x + 1))
    out = norm(base) * 0.6
    for _ in range(int(d * 5)):
        a = int(rng.uniform(0, d - 0.4) * SR); f0 = rng.uniform(140, 260); m = int(rng.uniform(0.15, 0.35) * SR); xx = t(m)
        v = filt(np.sign(np.sin(2 * np.pi * np.cumsum(f0 + 20 * np.sin(2 * np.pi * 5 * xx)) / SR)), 250, 1600) * np.sin(np.pi * xx / (m / SR)) ** 2
        out[a:a + m] += v * rng.uniform(0.05, 0.12)
    return norm(out) * env(n, 0.4, 0.5)
def room(d, lo=60, hi=400): return norm(filt(noise(d), lo, hi)) * env(int(d * SR), 0.3, 0.3)
def fluo(d): x = t(int(d * SR)); return norm(np.sin(2 * np.pi * 120 * x) + 0.4 * np.sin(2 * np.pi * 240 * x) + 0.2 * filt(rng.standard_normal(len(x)), 2000, 6000))
def wind(d): n = int(d * SR); x = t(n); return norm(filt(noise(d), 200, 900) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.2 * x) ** 2)) * env(n, 0.5, 0.5)
def whisper(d): n = int(d * SR); x = t(n); return norm(filt(rng.standard_normal(n), 1800, 6000) * (np.abs(np.sin(2 * np.pi * 4 * x)) ** 2))
def steps(a, b, every, gain=0.18, pan=0.0):
    for tt in np.arange(a, b, every): add(step(), tt + rng.uniform(-0.01, 0.01), gain, pan)

S = lambda x: 2.0 + x  # секунды озвучки → секунды части (карточка 2 с)
F = 1 / 30
part = int(sys.argv[1])
if part == 4:
    add(whoosh(0.4, 300, 3000), 1.85, 0.25); add(slap(), 2.45, 0.5)
    add(fluo(3.9) * 0.4, S(4.3), 0.06)
    for tt in np.arange(S(4.3), S(8.2), 47 * F): add(click(3000, 0.03, 300), tt, 0.12); add(click(2500, 0.03, 300), tt + 0.2, 0.1)
    add(wind(3.6), S(8.2), 0.1)
    add(room(6.5), S(11.8), 0.12)
    steps(S(11.8), S(18.3), 14 * F, 0.16, -0.3); steps(S(11.8) + 0.2, S(18.3), 14 * F, 0.12, 0.2)
    for g in range(30, 195, 30): add(box_down(), S(11.8) + g * F, 0.3, 0.2)
    add(scribble(2.0), S(11.8) + 1.0, 0.07, 0.5)
    add(paper(0.5), S(18.3), 0.25); add(stamp(), S(18.3) + 50 * F, 0.5)
    add(murmur(3.2), S(21.4), 0.25)
    add(cardboard(0.4), S(24.6) + 0.1, 0.35); add(cardboard(0.3), S(24.6) + 0.35, 0.3)
    for g in (30, 48, 66): add(box_down(), S(24.6) + g * F, 0.25)
    for k in range(3): add(can(), S(24.6) + 84 * F + k * 0.12, 0.2)
    add(wind(4.4), S(30.9), 0.14)
    steps(S(35.3), S(40.3), 15 * F, 0.16, 0.3); add(wind(5.0), S(35.3), 0.08)
    add(murmur(5.2), S(40.3), 0.22)
    for g in range(24, 160, 52): add(box_down(), S(40.3) + g * F, 0.28, -0.2); add(box_down(), S(40.3) + (g + 26) * F, 0.24, 0.2)
    steps(S(40.3), S(45.5), 13 * F, 0.12, -0.4)
    add(murmur(7.5) * 0.6, S(45.5), 0.16); add(whisper(2.5), S(45.5) + 0.3, 0.12, 0.3)
    save("public/food/sfx4.wav")

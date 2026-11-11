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

def dig():
    n = int(0.22 * SR); x = t(n)
    return norm(filt(rng.standard_normal(n), 150, 2200) * np.exp(-x * 14) + 0.5 * mixlen(thud(70, 0.22), n))
def growl(d=1.2):
    n = int(d * SR); x = t(n); f = 70 + 25 * np.sin(2 * np.pi * 2.3 * x)
    return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * (0.5 + 0.5 * np.sin(2 * np.pi * 6 * x) ** 2) + 0.4 * filt(rng.standard_normal(n), 60, 300)) * env(n, 0.2, 0.4)
def pass_car(d=2.0): n = int(d * SR); x = t(n); return norm(filt(noise(d), 80, 1200) * np.sin(np.pi * x / d) ** 3)
def pluck(f): return norm(ping(f, 0.5, 9) + 0.3 * mixlen(ping(f * 2, 0.3, 14), int(0.5 * SR)))

if part == 5:
    F = 1 / 30
    a = S(0); add(murmur(3.1) * 0.5, a, 0.12); add(paper(0.3), a + 8 * F, 0.18)
    a = S(3.1); add(murmur(4.3) * 0.4, a, 0.08); add(box_down(), a + 34 * F, 0.3); add(cardboard(0.6) * 0.6, a + 62 * F, 0.15); add(paper(0.3), a + 104 * F, 0.15)
    a = S(7.4); add(click(1800, 0.04, 150), a + 14 * F, 0.25); add(cardboard(0.3), a + 24 * F, 0.2); add(slap(), a + 64 * F, 0.25)
    a = S(9.9); add(murmur(4.2), a, 0.25); steps(a, a + 4.2, 0.42, 0.1, -0.4); steps(a + 0.2, a + 4.2, 0.46, 0.1, 0.4)
    a = S(14.1); add(murmur(5.4) * 0.6, a, 0.14); add(paper(0.25), a + 62 * F, 0.15); add(can(), a + 62 * F, 0.08)
    a = S(19.5); add(wind(4.9), a, 0.08)
    for k in range(0, 147, 40): add(water(0.6) * env(int(0.6 * SR), 0.05, 0.2), a + k * F, 0.05, 0.2)
    a = S(24.4)
    for k in range(3): add(dig(), a + (21 + 36 * k) * F, 0.22, -0.3); add(dig(), a + (6 + 36 * k) * F, 0.18, 0.3)
    add(wind(2.0), a, 0.06); add(wind(3.9), S(26.4), 0.08)
    a = S(30.3); add(dig() * 0.6, a + 28 * F, 0.12); add(water(0.6) * env(int(0.6 * SR), 0.05, 0.2), a + 66 * F, 0.08)
    add(growl(1.3), S(33.4) + 0.6, 0.3)
    a = S(35.7); add(engine(4.8, 0.8), a, 0.12); add(pass_car(2.5), a + 1.0, 0.08, 0.5)
    a = S(40.5); add(engine(3.4, 0.9), a, 0.08)
    for k in range(3): add(pass_car(1.6), a + k * 1.1, 0.1, -0.5 + k * 0.5)
    steps(a, a + 3.4, 39 * F, 0.12)
    a = S(43.9); add(wind(6.9), a, 0.1); add(box_down() * 0.6, a + 40 * F, 0.15)
    for k in range(50, 100, 7): add(click(900, 0.04, 120), a + k * F, 0.12)
    add(box_down(), a + 118 * F, 0.25)
    a = S(50.8); add(room(6.5), a, 0.1)
    for i in range(13): add(pluck(220 * 2 ** ((i % 5) / 12)), a + (i * 10 + 12) * F, 0.05)
    add(thud(60, 0.6), a + 130 * F, 0.25)
    save("public/food/sfx5.wav")

def crackle(d):
    n = int(d * SR); out = np.zeros(n)
    for _ in range(int(d * 14)):
        a = int(rng.uniform(0, d - 0.05) * SR); c = click(rng.uniform(1500, 4000), 0.02, 300); out[a:a + len(c)] += c * rng.uniform(0.2, 1)
    return norm(out + 0.3 * norm(filt(rng.standard_normal(n), 100, 800)))
def plop(): return norm(mixlen(thud(160, 0.2), int(0.2 * SR)) + 0.5 * mixlen(water(0.15), int(0.2 * SR)))

if part == 6:
    F = 1 / 30
    a = S(0); add(wind(5.1), a, 0.12); steps(a, a + 5.1, 44 * F, 0.08, 0.4)
    a = S(5.1); add(room(2.3), a, 0.05)
    for k in range(16): add(click(2200, 0.02, 250), a + (6 + k * 4) * F, 0.05, (k % 5 - 2) * 0.2)
    a = S(7.4); add(room(5.1), a, 0.06); steps(a, a + 34 * F, 14 * F, 0.14, -0.4); add(box_down(), a + 63 * F, 0.3)
    add(engine(2.4, 0.9), a + 95 * F, 0.12, 0.3)
    a = S(12.5); add(crackle(5.6), a, 0.12); add(glug(5.6) * 0.3, a, 0.05); add(murmur(5.6) * 0.5, a, 0.1); add(plop(), a + 150 * F, 0.3)
    steps(a + 60 * F, a + 120 * F, 15 * F, 0.1, 0.4)
    a = S(18.1); add(scrub(1.4), a, 0.08); add(cardboard(0.6) * 0.5, a + 44 * F, 0.08); add(plop(), a + 64 * F, 0.15); add(plop(), a + 94 * F, 0.3)
    a = S(21.6)
    for k, at in enumerate((0, 24, 52)): add(box_down(), a + (at + 8) * F, 0.32 - k * 0.07)
    a = S(24.4); add(creak(0.5, 200), a + 20 * F, 0.06); add(stamp(), a + 34 * F, 0.25); add(ping(2600, 0.2, 25), a + 80 * F, 0.12)
    a = S(27.4); add(room(5.4), a, 0.08); add(click(2500, 0.03, 250), a + 4 * F, 0.15)
    a = S(32.8); add(murmur(2.3) * 0.5, a, 0.08); add(breath(0.8), a + 0.6, 0.1)
    a = S(35.1); add(crickets(2.8), a, 0.1); steps(a, a + 2.8, 23 * F, 0.1, -0.3)
    a = S(37.9); add(wind(2.6), a, 0.1); add(ping(1800, 0.3, 18), a + 0.4, 0.05)
    a = S(40.5); add(murmur(6.9) * 0.5, a, 0.08); steps(a, a + 46 * F, 15 * F, 0.12, -0.3); steps(a + 0.2, a + 46 * F, 15 * F, 0.12, 0.3); add(click(800, 0.05, 80), a + 50 * F, 0.15)
    a = S(47.4); add(murmur(6.0), a, 0.18); add(crackle(6.0) * 0.4, a, 0.05)
    for k in range(14): add(ping(rng.uniform(2800, 3600), 0.15, 30), a + rng.uniform(0.3, 5.5), 0.05, rng.uniform(-0.6, 0.6))
    save("public/food/sfx6.wav")

def snowstep(): return norm(crunch() * 0.7 + mixlen(step(), int(0.3 * SR)) * 0.5)
def snowsteps(a, b, every, gain=0.12, pan=0.0):
    for tt in np.arange(a, b, every): add(snowstep(), tt + rng.uniform(-0.01, 0.01), gain, pan)
def static(d): n = int(d * SR); return norm(filt(rng.standard_normal(n), 800, 5000) * (0.7 + 0.3 * rng.standard_normal(n) * 0.2))
def radio_voice(d):
    n = int(d * SR); x = t(n); f0 = 130 + 20 * np.sin(2 * np.pi * 0.8 * x)
    v = np.sign(np.sin(2 * np.pi * np.cumsum(f0) / SR)) * (0.5 + 0.5 * np.sin(2 * np.pi * 3.3 * x) * np.sin(2 * np.pi * 1.7 * x + 1)) ** 2
    return norm(filt(v, 400, 2600))
def horn(d=2.2): x = t(int(d * SR)); return norm(np.sin(2 * np.pi * 98 * x) + 0.6 * np.sin(2 * np.pi * 147 * x) + 0.3 * np.sin(2 * np.pi * 196 * x)) * env(len(x), 0.15, 0.6)

if part == 7:
    F = 1 / 30
    a = S(0); add(wind(4.7), a, 0.16); snowsteps(a + 0.3, a + 4.7, 36 * F, 0.14)
    a = S(4.7); add(wind(3.6), a, 0.16); add(ping(3200, 0.4, 10), a + 1.4, 0.03); add(ping(2900, 0.4, 10), a + 2.6, 0.03)
    a = S(8.3); add(room(5.2, 50, 300), a, 0.1); add(plop() * 0.4, a + 1.0, 0.04); add(plop() * 0.4, a + 3.4, 0.04); add(scribble(0.7), a + 80 * F, 0.12)
    a = S(13.5); add(creak(0.7, 260), a, 0.08); steps(a, a + 80 * F, 15 * F, 0.12, 0.3); steps(a + 0.25, a + 80 * F, 15 * F, 0.12, 0.5); add(room(4.9), a, 0.06)
    a = S(18.4); add(crackle(4.7), a, 0.18); add(wind(4.7) * 0.5, a, 0.06)
    a = S(23.1); add(room(4.1), a, 0.05)
    for k in range(0, 123, 22): add(click(1400, 0.03, 160), a + (k + 16) * F, 0.1)
    a = S(27.2)
    for k in range(4): add(crunch(), a + (8 + k * 15.7) * F, 0.1)
    a = S(28.9); add(tinkle(1.1, 20, 1500, 4000), a + 6 * F, 0.06); add(paper(0.4), a + 44 * F, 0.12); add(click(1600, 0.04, 140), a + 86 * F, 0.15)
    a = S(32.5); add(click(1200, 0.04, 140), a + 0.2, 0.12); add(static(4.9) * env(int(4.9 * SR), 0.3, 0.3), a, 0.05); add(radio_voice(3.4), a + 40 * F, 0.08)
    a = S(37.4); add(water(4.2) * env(int(4.2 * SR), 0.6, 0.6), a, 0.06); add(horn(), a + 0.8, 0.12)
    a = S(41.6); add(wind(8.2) * 0.6, a, 0.08); add(paper(0.4), a + 0.3, 0.12); add(click(2400, 0.03, 300), a + 58 * F, 0.15)
    for i in range(3): snowsteps(a + 90 * F + i * 0.15, a + 170 * F, 16 * F, 0.08, 0.2 + i * 0.2)
    a = S(49.8); add(murmur(6.6) * 0.6, a, 0.12)
    for k in range(6): add(ping(rng.uniform(2600, 3200), 0.15, 30), a + rng.uniform(0.5, 6), 0.04, rng.uniform(-0.5, 0.5))
    add(chirp(), a + 4.5, 0.04, 0.6); add(chirp(), a + 4.7, 0.04, 0.6)
    save("public/food/sfx7.wav")

def birds(d, n=6):
    out = np.zeros(int(d * SR))
    for _ in range(n):
        a = rng.uniform(0, d - 0.5)
        for k in range(rng.integers(2, 4)):
            c = chirp(); i = int((a + k * 0.14) * SR); out[i:i + len(c)] += c[: len(out) - i] * rng.uniform(0.4, 1)
    return norm(out)

if part == 8:
    F = 1 / 30
    a = S(0); add(birds(2.7, 4), a, 0.05, 0.4); add(wind(2.7) * 0.4, a, 0.05)
    a = S(2.7); add(birds(8.0, 6), a, 0.04, -0.3)
    for k in range(0, 240, 60): add(water(1.2) * env(int(1.2 * SR), 0.1, 0.2), a + k * F, 0.05, -0.3)
    for k in range(20, 240, 40): add(dig(), a + k * F, 0.14, 0.4)
    a = S(10.7); add(hum(3.6, 55) * 0.5, a, 0.05); add(box_down(), a + 70 * F, 0.3); add(ping(900, 0.5, 8), a + 70 * F, 0.06)
    a = S(14.3); add(engine(2.7, 0.8), a, 0.14)
    a = S(17.0); add(engine(3.6, 0.6), a, 0.08); add(engine(1.0, 0.9), a + 60 * F, 0.06)
    a = S(20.6); add(click(1500, 0.04, 140), a + 22 * F, 0.2); add(norm(filt(noise(1.7), 300, 2500) * (np.abs(np.sin(2 * np.pi * 14 * t(int(1.7 * SR)))))), a + 26 * F, 0.08); add(click(2000, 0.03, 200), a + 80 * F, 0.1)
    a = S(24.2); add(hum(1.1, 120) * 0.3, a, 0.03)
    a = S(25.3); add(room(4.4), a, 0.05); add(paper(0.3), a + 104 * F, 0.15)
    a = S(29.7); add(room(3.7), a, 0.05); add(box_down() * 0.5, a + 68 * F, 0.1)
    a = S(33.4); add(room(2.2), a, 0.05); add(paper(0.35), a + 28 * F, 0.14)
    a = S(35.6); add(murmur(4.6), a, 0.16)
    for k in range(6): add(ping(rng.uniform(2800, 3400), 0.15, 30), a + rng.uniform(0.3, 4.2), 0.04)
    a = S(40.2); add(birds(5.4, 4), a, 0.03, 0.5); add(click(600, 0.05, 90), a + 26 * F, 0.15); add(crunch(), a + 114 * F, 0.12)
    a = S(45.6); add(hum(5.0, 120) * 0.3, a, 0.03); add(room(5.0), a, 0.05)
    save("public/food/sfx8.wav")

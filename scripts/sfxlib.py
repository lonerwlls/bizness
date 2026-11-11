# Общие синтезированные звуки для шортсов (без чужих записей). Используется scripts/foodshort2_sound.py.
import numpy as np
SR = 44100
rng = np.random.default_rng(11)
def tt(n): return np.arange(n) / SR
def fft_filter(x, fn):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X *= fn(f); return np.fft.irfft(X, len(x))
lp = lambda x, c: fft_filter(x, lambda f: 1 / (1 + (f / c) ** 4))
hp = lambda x, c: fft_filter(x, lambda f: 1 - 1 / (1 + (f / max(c, 1)) ** 4))
bp = lambda x, lo, hi: hp(lp(x, hi), lo)
noise = lambda n: rng.standard_normal(n)
def env(n, a, d):
    t = tt(n); return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)
def fade(n, a, b):
    e = np.ones(n); ia, ib = int(a * SR), int(b * SR)
    if ia: e[:ia] = np.linspace(0, 1, ia)
    if ib: e[-ib:] = np.linspace(1, 0, ib)
    return e


# ---------------- звуки предметов ----------------
def thump(d=0.5, f0=60, g=1.0):
    n = int(SR * d); t = tt(n); f = f0 * (1 + 1.5 * np.exp(-t * 25))
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.002, d / 4) + lp(noise(n), 400) * env(n, 0.001, 0.02) * 0.6) * g
def click(c=4000, d=0.05):
    n = int(SR * d); return bp(noise(n), c * 0.5, c * 1.8) * env(n, 0.0004, d / 6)
def step(hard=1.0):
    n = int(SR * 0.22); s = lp(noise(n), 700 + 500 * hard) * env(n, 0.002, 0.035) + thump(0.22, 75, 0.5)
    return s * 0.6
def creak(d=1.4, f0=280):
    n = int(SR * d); t = tt(n)
    f = f0 + 90 * np.sin(2 * np.pi * 0.9 * t) + 40 * np.sin(2 * np.pi * 3.1 * t)
    pulses = (np.sin(2 * np.pi * np.cumsum(f) / SR) > 0.97).astype(float)  # «скрип» — частые щелчки
    s = bp(pulses + 0.15 * noise(n), 300, 3200)
    return s * np.sin(np.pi * t / d) ** 0.6 * 0.9
def metal(f0=900, d=0.9):
    n = int(SR * d); t = tt(n); s = np.zeros(n)
    for k, r in enumerate([1, 2.76, 5.4, 8.93]):
        s += np.sin(2 * np.pi * f0 * r * t) * np.exp(-t * (6 + 4 * k)) / (k + 1)
    return s * 0.5
def rustle(d=0.6):
    n = int(SR * d); x = bp(noise(n), 1500, 7000)
    gate = lp((rng.random(n) < 0.004).astype(float) * 30, 60)
    return x * np.clip(gate, 0, 1) * np.sin(np.pi * tt(n) / d) * 0.8
def whoosh(d=0.7, lo=300, hi=3500, up=True):
    n = int(SR * d); t = tt(n); x = noise(n)
    x = bp(x, lo, hi) * np.sin(np.pi * t / d) ** 2
    return x * 0.6
def buzz(d=0.8, f=170):  # вибрация телефона
    n = int(SR * d); t = tt(n)
    s = np.sign(np.sin(2 * np.pi * f * t)) * 0.4 + lp(noise(n), 300) * 0.3
    return lp(s, 900) * fade(n, 0.01, 0.03)
def ping(f=1320):
    n = int(SR * 0.5); t = tt(n)
    return (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 1.5 * t)) * env(n, 0.003, 0.12) * 0.5
def knock():
    n = int(SR * 0.4); t = tt(n)
    return (np.sin(2 * np.pi * 95 * t) * np.exp(-t * 18) + lp(noise(n), 1500) * env(n, 0.0005, 0.03) * 1.2 + np.sin(2 * np.pi * 210 * t) * np.exp(-t * 30) * 0.5)
def slam():
    return thump(0.9, 55, 1.4) + np.pad(lp(noise(int(SR * 0.3)), 2500) * env(int(SR * 0.3), 0.0005, 0.05), (0, int(SR * 0.6)))
def bolt():
    a = click(2500, 0.08); b = metal(1800, 0.25) * 0.4
    s = np.zeros(int(SR * 0.4)); s[:len(a)] += a; s[int(SR * 0.12):int(SR * 0.12) + len(b)] += b
    s[int(SR * 0.12):int(SR * 0.12) + len(a)] += a * 1.2
    return s
def bubbles(d):
    n = int(SR * d); s = np.zeros(n)
    for _ in range(int(d * 14)):
        i = rng.integers(0, max(1, n - 4000)); m = int(SR * 0.05); t = tt(m)
        f = 300 + rng.random() * 500
        s[i:i + m] += np.sin(2 * np.pi * np.cumsum(f * (1 + 2 * t / 0.05)) / SR) * env(m, 0.002, 0.012) * (0.3 + rng.random() * 0.4)
    return s
def sizzle(d): n = int(SR * d); return bp(noise(n), 3000, 10000) * 0.12 * (0.6 + 0.4 * rng.random(n)) * fade(n, 0.3, 0.5)
def gas_ignite():
    s = np.zeros(int(SR * 1.2))
    for k, at in enumerate([0, 0.18, 0.36]): c = click(5500, 0.04); i = int(at * SR); s[i:i + len(c)] += c * 1.2
    n = int(SR * 0.7); wh = bp(noise(n), 200, 1800) * env(n, 0.02, 0.25) * 1.2
    s[int(0.4 * SR):int(0.4 * SR) + n] += wh
    return s
def tv_babble(d):  # приглушённый голос диктора из телевизора (неразборчиво)
    n = int(SR * d); t = tt(n)
    syl = 0.5 + 0.5 * np.sin(2 * np.pi * 4.3 * t + 2 * np.sin(2 * np.pi * 0.7 * t))
    s = bp(noise(n), 300, 2500) * syl ** 3 * 0.35 + bp(noise(n), 4000, 9000) * 0.03
    return s * fade(n, 0.2, 0.3)
def hum(d, f=120, flick=False):
    n = int(SR * d); t = tt(n)
    s = np.sin(2 * np.pi * f * t) * 0.5 + np.sin(2 * np.pi * f * 2 * t) * 0.25 + np.sin(2 * np.pi * f * 3 * t) * 0.12
    s += bp(noise(n), 2000, 6000) * 0.05
    if flick:
        g = np.repeat(rng.random(int(d * 10) + 1) > 0.3, SR // 10)[:n].astype(float)
        s *= lp(g, 40) * 0.8 + 0.2
    return s * fade(n, 0.3, 0.3)
def wind(d):
    n = int(SR * d); t = tt(n); return lp(noise(n), 500) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.13 * t)) * 0.5 * fade(n, 1, 1)
def murmur(d, people=6):  # шёпот/гул толпы за стеной
    n = int(SR * d); s = np.zeros(n)
    for p in range(people):
        t = tt(n); syl = 0.5 + 0.5 * np.sin(2 * np.pi * (3 + rng.random() * 2) * t + rng.random() * 6)
        s += bp(noise(n), 250 + p * 40, 1400) * syl ** 4 * (0.5 + rng.random())
    return s / people * fade(n, 0.5, 0.5)
def heartbeat(at, end, bpm0, bpm1, g=0.6):
    t = at
    while t < end:
        k = (t - at) / max(1e-3, end - at); bpm = bpm0 + (bpm1 - bpm0) * k
        put(FX, t, thump(0.35, 48, 1.0), g * (0.6 + 0.4 * k)); put(FX, t + 0.24, thump(0.3, 44, 0.7), g * (0.6 + 0.4 * k))
        t += 60 / bpm
def breath(d=1.2):
    n = int(SR * d); t = tt(n); return bp(noise(n), 500, 3000) * np.sin(np.pi * t / d) ** 2 * 0.25


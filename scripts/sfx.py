# Общая библиотека синтезированных звуков для роликов (import sfx). Дорожка 60 сек: add(звук, секунда, громкость, панорама), потом save(путь).
import numpy as np, wave, os

SR = 44100
N = int(SR * 60.0)
rng = np.random.default_rng(11)
L = np.zeros(N); R = np.zeros(N)


def t(n): return np.arange(n) / SR
def norm(x): return x / (np.max(np.abs(x)) + 1e-9)


def filt(x, lo=None, hi=None):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    if hi: X *= 1 / (1 + (f / hi) ** 4)
    if lo: X *= 1 - 1 / (1 + (f / lo) ** 4)
    return np.fft.irfft(X, len(x))


def env(n, a, d):
    e = np.ones(n); na = max(1, int(a * SR)); nd = max(1, int(d * SR))
    e[:na] = np.linspace(0, 1, na); e[-nd:] *= np.linspace(1, 0, nd)
    return e


def add(sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N: return
    sig = sig[: N - i]
    L[i:i + len(sig)] += sig * gain * np.sqrt((1 - pan) / 2)
    R[i:i + len(sig)] += sig * gain * np.sqrt((1 + pan) / 2)


def noise(d): return rng.standard_normal(int(d * SR))
def bed(d, lo, hi, a=0.5, r=0.8): return norm(filt(noise(d), lo, hi)) * env(int(d * SR), a, r)


def click(f=3000, d=0.03, dec=200):
    x = t(int(d * SR))
    return (rng.standard_normal(len(x)) * 0.6 + np.sin(2 * np.pi * f * x)) * np.exp(-x * dec)


def thud(f=90, d=0.25):
    x = t(int(d * SR))
    return np.sin(2 * np.pi * f * x * (1 - x)) * np.exp(-x * 22) + filt(rng.standard_normal(len(x)), None, 900) * np.exp(-x * 40) * 0.5


def boom(d=1.6):
    x = t(int(d * SR))
    return norm(np.sin(2 * np.pi * (60 - 25 * x / d) * x) * np.exp(-x * 2.5) + filt(rng.standard_normal(len(x)), None, 200) * np.exp(-x * 4) * 0.6)


def whoosh(d=0.7, lo=300, hi=3000):
    n = int(d * SR); x = t(n)
    return norm(filt(rng.standard_normal(n), lo, hi) * np.sin(np.pi * x / d) ** 2)


def ping(f, d=0.6, dec=6):
    x = t(int(d * SR))
    return np.sin(2 * np.pi * f * x) * np.exp(-x * dec) + 0.4 * np.sin(2 * np.pi * f * 2.01 * x) * np.exp(-x * dec * 1.6)


def tinkle(d=1.5, k=25, lo=2500, hi=7000):
    n = int(d * SR); x = np.zeros(n)
    for _ in range(k):
        a = int(rng.uniform(0, d - 0.3) * SR); p = ping(rng.uniform(lo, hi), 0.3, 20) * rng.uniform(0.2, 1)
        x[a:a + len(p)] += p
    return norm(x)


def shimmer(d=2.0, f0=600, f1=2400):
    x = t(int(d * SR)); f = f0 * (f1 / f0) ** (x / d)
    s = sum(np.sin(2 * np.pi * np.cumsum(f * k) / SR) / k for k in (1, 1.5, 2))
    return norm(s * env(len(x), 0.3, 0.5)) * 0.6 + tinkle(d, int(d * 14)) * 0.5


def pad(d, notes, vol=1.0):
    x = t(int(d * SR)); s = np.zeros(len(x))
    for m in notes:
        f = 440 * 2 ** ((m - 69) / 12)
        for det in (0.997, 1.003):
            s += np.sin(2 * np.pi * f * det * x + 0.3 * np.sin(2 * np.pi * 0.3 * x))
    return norm(filt(s, None, 2500)) * env(len(x), d * 0.3, d * 0.4) * vol


def scrub(d):  # чистка зубов
    n = int(d * SR); x = t(n)
    return norm(filt(rng.standard_normal(n), 1500, 6000) * (0.3 + 0.7 * np.abs(np.sin(2 * np.pi * 4.5 * x))))


def bark():
    x = t(int(0.22 * SR)); f = 500 - 900 * x
    v = np.sign(np.sin(2 * np.pi * np.cumsum(np.maximum(f, 180)) / SR))
    return norm(filt(v + 0.6 * rng.standard_normal(len(x)), 300, 2500) * np.exp(-((x - 0.05) / 0.06) ** 2))


def laugh(k=4, f0=420):  # детский смех: «ха-ха» — гласные импульсы
    out = np.zeros(int(0.2 * SR * k + SR * 0.2))
    for i in range(k):
        x = t(int(0.13 * SR)); f = f0 * (1 + 0.15 * np.sin(2 * np.pi * 3 * x)) * (1 - i * 0.04)
        v = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.5 + rng.standard_normal(len(x)) * 0.4
        v = filt(v, 700, 3200) * np.sin(np.pi * x / 0.13) ** 2
        a = int(i * 0.19 * SR); out[a:a + len(v)] += v
    return norm(out)


def creak(d=0.5, f0=380):
    x = t(int(d * SR)); f = f0 + 90 * np.sin(2 * np.pi * 2 * x)
    return norm(filt(np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)), 300, 2000) * np.sin(np.pi * x / d) ** 2)


def crunch():
    n = int(0.3 * SR); x = np.zeros(n)
    for _ in range(14):
        a = int(rng.uniform(0, 0.22) * SR); c = click(rng.uniform(800, 2500), 0.04, 120)
        x[a:a + len(c)] += c * rng.uniform(0.3, 1)
    return norm(x)


def shutter():
    a = click(1800, 0.04, 150); b = click(1200, 0.05, 120)
    x = np.zeros(int(0.12 * SR)); x[:len(a)] += a; k = int(0.06 * SR); x[k:k + len(b)] += b
    return norm(x)


def chirp():
    x = t(int(0.12 * SR)); f = 3500 + 2500 * x / 0.12
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * x / 0.12)


def rain(d):
    n = int(d * SR); x = norm(filt(rng.standard_normal(n), 400, 6000)) * 0.6
    for _ in range(int(d * 40)):
        a = int(rng.uniform(0, d - 0.05) * SR); c = click(rng.uniform(1500, 5000), 0.02, 300)
        x[a:a + len(c)] += c * rng.uniform(0.1, 0.5)
    return x


def music_loop(d):  # приглушённая музыка вечеринки (за стеной)
    x = np.zeros(int(d * SR)); beat = 0.5
    chords = [[57, 60, 64], [53, 57, 60], [55, 59, 62], [52, 55, 59]]
    for i in range(int(d / beat)):
        a = int(i * beat * SR)
        k = thud(60, 0.25); x[a:a + len(k)] += k[: len(x) - a] * 0.9
        if i % 2 == 1:
            sn = filt(rng.standard_normal(int(0.12 * SR)), 1500, 6000) * np.exp(-t(int(0.12 * SR)) * 30)
            x[a:a + len(sn)] += sn[: len(x) - a] * 0.5
        if i % 4 == 0:
            p = pad(beat * 4, chords[(i // 4) % 4], 0.5); x[a:a + len(p)] += p[: len(x) - a]
    return filt(norm(x), None, 900)


def glitch(d=0.25):
    n = int(d * SR); x = np.sign(np.sin(2 * np.pi * 90 * t(n))) * (rng.random(n) > 0.5)
    return norm(filt(x + rng.standard_normal(n) * 0.5, 200, 4000)) * env(n, 0.005, 0.03)



def ringback(d=2.0):  # гудок вызова (США)
    x = t(int(d * SR)); return (np.sin(2 * np.pi * 440 * x) + np.sin(2 * np.pi * 480 * x)) * 0.5 * env(len(x), 0.02, 0.02)


def chime(f=880, n=2, gap=0.5):  # «дзынь» открытой двери машины
    out = np.zeros(int((n * gap + 0.6) * SR))
    for i in range(n):
        p = ping(f, 0.5, 8); a = int(i * gap * SR); out[a:a + len(p)] += p
    return norm(out)


def whistle_echo(f0=1500, d=0.7, echoes=4):
    x = t(int(d * SR)); f = f0 + 500 * np.sin(np.pi * x / d)
    w = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(x), 0.05, 0.2)
    out = np.zeros(int((d + echoes * 0.45 + 0.2) * SR))
    for k in range(echoes + 1):
        a = int(k * 0.45 * SR); out[a:a + len(w)] += filt(w, None, 4000 - k * 700) * (0.6 ** k)
    return norm(out)


def flutter(d=0.8):
    n = int(d * SR); x = t(n)
    return norm(filt(rng.standard_normal(n), 300, 3000) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 14 * x))) * env(n, 0.02, 0.4))


def crickets(d):
    n = int(d * SR); x = t(n); out = np.zeros(n)
    for k in range(3):
        f = rng.uniform(4200, 5200); r = rng.uniform(2.5, 4)
        out += np.sin(2 * np.pi * f * x) * (np.sin(2 * np.pi * 30 * x) > 0.3) * (np.sin(2 * np.pi * r * x + k) > 0.2)
    return norm(out) * env(n, 0.8, 0.8)


def hum(d, f=60):
    x = t(int(d * SR)); return (np.sin(2 * np.pi * f * x) + 0.5 * np.sin(2 * np.pi * 2 * f * x)) * env(len(x), 0.2, 0.2) / 1.5


def powerdown(d=1.2):  # щелчок и затухающий гул
    x = t(int(d * SR)); f = 120 * np.exp(-x * 2)
    return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 2.5)) * 0.7 + np.pad(thud(80, 0.2), (0, len(x) - int(0.2 * SR)))


def water(d, k=1.0):
    n = int(d * SR); return norm(filt(rng.standard_normal(n), 500, 5000)) * k


def glug(d=1.2):
    out = np.zeros(int(d * SR))
    for i in range(int(d / 0.18)):
        x = t(int(0.14 * SR)); b = np.sin(2 * np.pi * np.cumsum(220 + 300 * x / 0.14) / SR) * np.sin(np.pi * x / 0.14)
        a = int(i * 0.18 * SR); out[a:a + len(b)] += b[: len(out) - a]
    return norm(out)


def engine(d, rpm=1.0):
    x = t(int(d * SR)); f = 45 * rpm
    e = np.sign(np.sin(2 * np.pi * f * x)) * 0.6 + np.sin(2 * np.pi * f * 2 * x) * 0.4
    return norm(filt(e + rng.standard_normal(len(x)) * 0.3, 40, 600)) * env(len(x), 0.2, 0.3)


def squeal(d=0.7):
    x = t(int(d * SR)); f = 2400 - 600 * x / d
    return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) + filt(rng.standard_normal(len(x)), 1500, 5000) * 0.5) * env(len(x), 0.03, 0.2)


def save(path):
    mix = np.stack([L, R], 1)
    mix = np.tanh(mix * 1.3) / np.tanh(1.3)
    mix /= np.max(np.abs(mix)) + 1e-9; mix *= 0.89
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with wave.open(path, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((mix * 32767).astype("<i2").tobytes())
    print("ok", path)


def breath(d=0.6, cutoff=1800):
    n = int(d * SR); x = t(n)
    return norm(filt(rng.standard_normal(n), 300, cutoff) * np.sin(np.pi * x / d) ** 1.5)


def riser(d):
    n = int(d * SR); x = t(n)
    s = filt(rng.standard_normal(n), 800, 9000) * (x / d) ** 2
    s += np.sin(2 * np.pi * np.cumsum(200 + 600 * (x / d) ** 2) / SR) * (x / d) ** 2 * 0.4
    return norm(s)

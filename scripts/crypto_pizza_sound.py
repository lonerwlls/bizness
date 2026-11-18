# Звуки и музыка для ролика pizza (34 сек): всё синтезируется здесь, без чужих сэмплов.
# Запуск: python3 scripts/crypto_pizza_sound.py  ->  public/crypto/pizza/sound.wav
import numpy as np, wave

SR = 44100
DUR = 34.0
N = int(SR * DUR)
rng = np.random.default_rng(3)
L = np.zeros(N); R = np.zeros(N)
FPS = 30


def tt(n):
    return np.arange(n) / SR


def env(n, a=0.005, d=0.2):
    t = tt(n)
    return np.minimum(1, t / a) * np.exp(-t / d)


def lp(x, cut):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X / (1 + (f / cut) ** 4), len(x))


def hp(x, cut):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X * (1 - 1 / (1 + (f / cut) ** 4)), len(x))


def add(sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N or i < 0: return
    sig = sig[: N - i]
    L[i:i + len(sig)] += sig * gain * np.sqrt((1 - pan) / 2) * 1.414
    R[i:i + len(sig)] += sig * gain * np.sqrt((1 + pan) / 2) * 1.414


# ---------- звуки ----------
def pop(f0=600):
    n = int(0.12 * SR); t = tt(n)
    fr = f0 * (1 + 1.5 * np.exp(-t / 0.015))
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * env(n, 0.002, 0.04)


def whoosh(dur=0.45, up=True):
    n = int(dur * SR); x = rng.standard_normal(n)
    x = hp(lp(x, 2500), 300)
    e = np.sin(np.pi * np.linspace(0, 1, n)) ** 2
    return x * e * 0.5


def thud():
    n = int(0.25 * SR); t = tt(n)
    s = np.sin(2 * np.pi * np.cumsum(90 * (1 + np.exp(-t / 0.03))) / SR) * env(n, 0.002, 0.08)
    return s + lp(rng.standard_normal(n), 900) * env(n, 0.001, 0.03) * 0.5


def boom():
    n = int(1.6 * SR); t = tt(n)
    fr = 48 + 70 * np.exp(-t / 0.08)
    s = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t / 0.7)
    s = np.tanh(s * 2.2) * 0.8
    return s + lp(rng.standard_normal(n), 400) * env(n, 0.001, 0.15) * 0.6


def bell(f, d=0.6):
    n = int(d * 2.5 * SR); t = tt(n)
    return sum(a * np.sin(2 * np.pi * f * m * t) * np.exp(-t / (d / m ** 0.5)) for m, a in [(1, 1), (2.76, 0.4), (5.4, 0.2)]) * np.minimum(1, t / 0.002)


def kaching():
    s = np.zeros(int(1.2 * SR))
    c = lp(rng.standard_normal(int(0.06 * SR)), 5000) * env(int(0.06 * SR), 0.001, 0.02)
    s[: len(c)] += c * 0.8
    b = bell(2100, 0.5) * 0.5 + bell(2650, 0.5) * 0.4
    i = int(0.07 * SR); s[i:i + len(b)] += b[: len(s) - i]
    return s


def clink(f=3200):
    return bell(f * (0.9 + rng.random() * 0.25), 0.12) * 0.5


def click():
    n = int(0.03 * SR)
    return hp(rng.standard_normal(n), 2000) * env(n, 0.0005, 0.006)


def flip():
    n = int(0.12 * SR)
    return hp(lp(rng.standard_normal(n), 6000), 1500) * env(n, 0.003, 0.03) * 0.6


def crickets(dur):
    n = int(dur * SR); t = tt(n)
    chirp = np.sin(2 * np.pi * 4300 * t) * (np.sin(2 * np.pi * 30 * t) > 0.2)
    gate = (np.sin(2 * np.pi * 1.6 * t) > 0.55).astype(float)
    wind = lp(rng.standard_normal(n), 500) * 0.25
    return (chirp * lp(gate, 40) * 0.12 + wind) * np.minimum(1, np.minimum(t, dur - t) / 0.3)


def riser(dur):
    n = int(dur * SR); t = tt(n)
    fr = 200 * (8 ** (t / dur))
    tone = np.sin(2 * np.pi * np.cumsum(fr) / SR) * 0.25
    nz = hp(rng.standard_normal(n), 800) * (t / dur) ** 2 * 0.4
    return (tone + nz) * np.minimum(1, (dur - t) / 0.05)


def choir(dur=1.8):
    n = int(dur * SR); t = tt(n); s = np.zeros(n)
    for f in [523.25, 659.25, 783.99, 1046.5]:
        for d in (-0.4, 0.4):
            ph = 2 * np.pi * (f + d) * t
            s += np.sin(ph) + 0.3 * np.sin(2 * ph) + 0.15 * np.sin(3 * ph)
    return lp(s, 2500) / 14 * np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 0.7


def munch():
    s = np.zeros(int(0.5 * SR))
    for k in range(3):
        n = int(0.07 * SR); c = lp(rng.standard_normal(n), 2500) * env(n, 0.002, 0.02)
        i = int(k * 0.15 * SR); s[i:i + n] += c
    return s


def heartbeat():
    s = np.zeros(int(0.9 * SR))
    for at, g in [(0, 1), (0.22, 0.7)]:
        n = int(0.18 * SR); t = tt(n)
        b = np.sin(2 * np.pi * np.cumsum(60 * (1 + 0.5 * np.exp(-t / 0.02))) / SR) * env(n, 0.003, 0.06)
        i = int(at * SR); s[i:i + n] += b * g
    return s


# ---------- музыка: лёгкий «щипковый» луп, обрывается на развязке ----------
BPM = 112; beat = 60 / BPM
MUSIC_END = 30.68
notes = {"C": [261.6, 329.6, 392.0], "Am": [220.0, 261.6, 329.6], "F": [174.6, 220.0, 261.6], "G": [196.0, 246.9, 293.7]}
prog = ["C", "Am", "F", "G"]


def pluck(f, d=0.35):
    n = int(d * 1.8 * SR); t = tt(n)
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) + 0.12 * np.sin(6 * np.pi * f * t)
    return s * env(n, 0.003, d * 0.4)


def kick():
    n = int(0.3 * SR); t = tt(n)
    return np.sin(2 * np.pi * np.cumsum(55 * (1 + 2.5 * np.exp(-t / 0.02))) / SR) * env(n, 0.002, 0.11)


def hat():
    n = int(0.05 * SR)
    return hp(rng.standard_normal(n), 7000) * env(n, 0.001, 0.012)


ML = np.zeros(N); MR = np.zeros(N)


def madd(sig, at, g=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N: return
    sig = sig[: N - i]
    ML[i:i + len(sig)] += sig * g * (1 - pan * 0.5); MR[i:i + len(sig)] += sig * g * (1 + pan * 0.5)


step = beat / 2; k = 0; tm = 0.15
melody = [0, 2, 1, 2, 0, 2, 1, 2]
while tm < MUSIC_END:
    bar = int(k // 8); ch = notes[prog[bar % 4]]
    if k % 2 == 0: madd(kick(), tm, 0.55)
    madd(hat(), tm + step * 0.5, 0.12, 0.4)
    madd(pluck(ch[melody[k % 8]] * 2), tm, 0.16, -0.3 if k % 2 else 0.3)
    if k % 4 == 0: madd(pluck(ch[0] / 2, 0.6), tm, 0.35)
    k += 1; tm += step
fade = int(0.04 * SR); e = int(MUSIC_END * SR)
for M in (ML, MR):
    M[e - fade:e] *= np.linspace(1, 0, fade); M[e:] = 0
# музыка тише на «музейной» сцене и под интервью
duck = np.ones(N)
for a, b in [(17.58, 19.7), (24.1, 27.3)]:
    duck[int(a * SR):int(b * SR)] = 0.55
L += ML * duck * 0.55; R += MR * duck * 0.55

# ---------- расстановка звуков (секунды совпадают со сценами в src/crypto/pizza.tsx) ----------
add(whoosh(0.35), 0.05, 0.5); add(thud(), 0.42, 0.9)
add(kaching(), 1.62, 0.7); add(boom(), 1.66, 0.55)
add(whoosh(0.4), 2.98, 0.45); add(flip(), 3.1, 0.6)
add(pop(500), 4.9, 0.5)
for i in range(10): add(click(), 5.05 + i * 0.075 + rng.random() * 0.02, 0.35, 0.3)
add(whoosh(0.3), 5.82, 0.4)
for i in range(26): add(click(), 6.1 + i * 0.068 + rng.random() * 0.02, 0.4, 0.2)
for i in range(22): add(clink(), 7.95 + (i * 1.6 + 9 + rng.random() * 3) / FPS, 0.45, rng.random() * 1.6 - 0.8)
add(pop(700), 8.25, 0.4)
add(pop(450), 9.62, 0.4); add(pop(900), 10.27, 0.55); add(bell(1400, 0.2), 10.3, 0.2)
add(crickets(1.95), 11.65, 0.8)
for i in range(5): add(flip(), 13.6 + i * 0.1, 0.7)
add(pop(800), 14.05, 0.4)
add(whoosh(0.4), 14.28, 0.5, 0.5); add(pop(650), 14.85, 0.55, 0.4)
add(bell(1318, 0.5) * 0.6, 15.74, 0.5); add(bell(1046, 0.6) * 0.6, 16.05, 0.5)
add(whoosh(0.3), 15.95, 0.3)
for i, f in enumerate([1568, 2093, 2637]): add(bell(f, 0.25), 16.45 + i * 0.07, 0.25)
add(choir(2.0), 17.58, 0.9)
for i in range(4): add(bell(2800 + i * 300, 0.15), 17.8 + i * 0.35, 0.18, (i % 2) - 0.5)
add(whoosh(0.3), 19.7, 0.4); add(riser(1.35), 19.9, 0.6)
tick_t = 21.32
while tick_t < 23.12:
    add(click(), tick_t, 0.45); add(bell(2400, 0.04), tick_t, 0.08)
    tick_t += max(0.035, 0.16 * (1 - (tick_t - 21.3) / 1.9))
add(kaching(), 23.14, 0.8); add(boom(), 23.16, 0.5)
add(whoosh(0.35), 24.15, 0.45, 0.6); add(pop(600), 25.12, 0.5, 0.3)
add(pop(520), 26.52, 0.55, -0.3)
for i in range(3): add(pop(700 + i * 120), 27.35 + i * 0.2, 0.4)
add(munch(), 27.62, 0.6)
for side in (0, 1):
    for i in range(9): add(thud(), 28.98 + (i * 4 + side * 2 + 7) / FPS, 0.45, -0.6 if side == 0 else 0.6)
add(boom(), 30.7, 1.0); add(kaching(), 30.72, 0.5)
for i in range(10): add(clink(), 30.75 + i * 0.05, 0.3, rng.random() * 2 - 1)
add(heartbeat(), 32.0, 0.8); add(heartbeat(), 32.85, 0.9)
n = int(2.1 * SR); t = tt(n)
drone = (np.sin(2 * np.pi * 55 * t) + 0.5 * np.sin(2 * np.pi * 82.4 * t)) * np.minimum(1, t / 1.2) * 0.3
add(drone, 31.9, 0.6)

out = np.stack([L, R], 1)
out = np.tanh(out / max(1e-6, np.abs(out).max()) * 1.2) * 0.8
fo = int(0.05 * SR); out[-fo:] *= np.linspace(1, 0, fo)[:, None]
with wave.open("public/crypto/pizza/sound.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype(np.int16).tobytes())
print("ok")

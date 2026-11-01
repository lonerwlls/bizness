# Звуковая дорожка для ролика towers (60 сек, без музыки и голоса): всё синтезируется здесь.
# Запуск: python3 scripts/towers_sound.py  ->  public/towers/sound.wav
import numpy as np, wave, os

SR = 44100
DUR = 60.0
N = int(SR * DUR)
rng = np.random.default_rng(7)
L = np.zeros(N); R = np.zeros(N)


def t(n):
    return np.arange(n) / SR


def lp(x, a):  # однополюсный фильтр нижних частот, a=0..1 (меньше = глуше)
    y = np.empty_like(x); s = 0.0
    for i in range(len(x)):
        s += a * (x[i] - s); y[i] = s
    return y


def lp_fast(x, cutoff):
    # фильтр через FFT (быстро для длинных шумов)
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / (1 + (f / cutoff) ** 4)
    return np.fft.irfft(X, len(x))


def bp_fast(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / (1 + (f / hi) ** 4) * (1 - 1 / (1 + (f / lo) ** 4))
    return np.fft.irfft(X, len(x))


def add(sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N: return
    sig = sig[: N - i]
    gl = gain * np.sqrt((1 - pan) / 2); gr = gain * np.sqrt((1 + pan) / 2)
    L[i : i + len(sig)] += sig * gl; R[i : i + len(sig)] += sig * gr


def env(n, a, d):  # атака/спад в секундах
    e = np.ones(n); na = max(1, int(a * SR)); nd = max(1, int(d * SR))
    e[:na] = np.linspace(0, 1, na); e[-nd:] *= np.linspace(1, 0, nd)
    return e


def norm(x):
    return x / (np.max(np.abs(x)) + 1e-9)


# ---------- базовые звуки ----------
def wind(dur, cutoff=500, gust=0.25, seed=0):
    n = int(dur * SR); r = np.random.default_rng(seed)
    x = lp_fast(r.standard_normal(n), cutoff)
    g = lp_fast(r.standard_normal(n), 0.6); g = 0.55 + gust * norm(g)
    return norm(x * g)


def heartbeat():
    n = int(0.5 * SR); tt = t(n)
    def thump(d):
        return np.sin(2 * np.pi * (55 - 20 * tt) * tt) * np.exp(-tt * 18) * (tt >= 0)
    s = thump(0); s2 = np.zeros(n); k = int(0.17 * SR); s2[k:] = 0.7 * thump(0)[: n - k]
    return norm(s + s2)


def click(f=3000, dur=0.03, dec=200):
    tt = t(int(dur * SR))
    return (rng.standard_normal(len(tt)) * 0.6 + np.sin(2 * np.pi * f * tt)) * np.exp(-tt * dec)


def crack():
    n = int(1.2 * SR); x = np.zeros(n)
    for k in range(40):
        at = int(abs(rng.normal(0, 0.12)) * SR)
        c = click(rng.uniform(1500, 6000), 0.05, rng.uniform(80, 300)) * rng.uniform(0.3, 1)
        x[at : at + len(c)] += c[: n - at]
    tt = t(n); x += bp_fast(rng.standard_normal(n), 800, 7000) * np.exp(-tt * 9) * 0.8
    x += np.sin(2 * np.pi * 60 * tt) * np.exp(-tt * 6) * 0.9
    return norm(x)


def tinkle(dur=1.5, k=25):
    n = int(dur * SR); x = np.zeros(n)
    for _ in range(k):
        at = int(rng.uniform(0, dur - 0.3) * SR); tt = t(int(0.3 * SR))
        f = rng.uniform(2500, 7000)
        p = np.sin(2 * np.pi * f * tt) * np.exp(-tt * 25) * rng.uniform(0.2, 1)
        x[at : at + len(p)] += p
    return norm(x)


def whoosh(dur=0.8, lo=300, hi=3000):
    n = int(dur * SR); tt = t(n)
    x = bp_fast(rng.standard_normal(n), lo, hi)
    e = np.sin(np.pi * tt / dur) ** 2
    return norm(x * e)


def thud(f=90, dur=0.25):
    tt = t(int(dur * SR))
    return np.sin(2 * np.pi * f * tt * (1 - tt)) * np.exp(-tt * 22) + lp_fast(rng.standard_normal(len(tt)), 900) * np.exp(-tt * 40) * 0.5


def clank():
    tt = t(int(0.35 * SR)); x = np.zeros(len(tt))
    for f in (420, 1130, 2210, 3170):
        x += np.sin(2 * np.pi * f * tt * rng.uniform(0.97, 1.03)) * np.exp(-tt * rng.uniform(15, 30))
    return norm(x) * 0.6 + thud(70, 0.35) * 0.6


def breath(dur=0.6, cutoff=1800):
    n = int(dur * SR); tt = t(n)
    return norm(bp_fast(rng.standard_normal(n), 300, cutoff) * np.sin(np.pi * tt / dur) ** 1.5)


def pluck(f=110, dur=1.0):  # тетива (Карплус-Стронг)
    n = int(dur * SR); p = int(SR / f); buf = rng.uniform(-1, 1, p); y = np.zeros(n)
    for i in range(n):
        y[i] = buf[i % p]; buf[i % p] = 0.5 * (buf[i % p] + buf[(i + 1) % p]) * 0.996
    return norm(y)


def siren(dur=4.0):
    tt = t(int(dur * SR)); f = 700 + 250 * np.sin(2 * np.pi * 0.5 * tt)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * env(len(tt), 1.2, 1.5)


def chirp():
    tt = t(int(0.12 * SR)); f = 3500 + 2500 * tt / 0.12
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt / 0.12)


def crowd(dur, seed=1):  # гул толпы: много «голосов» = шум через формантные полосы
    n = int(dur * SR); r = np.random.default_rng(seed); x = np.zeros(n)
    for lo, hi in ((250, 700), (700, 1400), (1400, 2600)):
        b = bp_fast(r.standard_normal(n), lo, hi)
        m = 0.6 + 0.4 * norm(lp_fast(r.standard_normal(n), 4))
        x += b * m
    return norm(x)


def gasp(dur=1.4):  # «ах!» толпы: вдох шума с подъёмом
    n = int(dur * SR); tt = t(n)
    return norm(bp_fast(rng.standard_normal(n), 500, 3500) * np.exp(-((tt - 0.25) / 0.25) ** 2))


def cheer(dur=3.0):
    n = int(dur * SR); tt = t(n)
    c = crowd(dur, seed=int(rng.integers(100)))
    ap = np.zeros(n)
    for _ in range(int(dur * 400)):
        at = int(rng.uniform(0, dur - 0.02) * SR); k = click(rng.uniform(1200, 3500), 0.015, 400)
        ap[at : at + len(k)] += k * rng.uniform(0.2, 1)
    return norm(c * 0.7 + norm(ap) * 0.6) * env(n, 0.3, 1.2)


def whistle(dur=0.9):
    tt = t(int(dur * SR)); f = 2800 + 120 * np.sign(np.sin(2 * np.pi * 28 * tt))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(tt), 0.02, 0.15)


def projector(dur):  # треск плёнки 70-х
    n = int(dur * SR); x = np.zeros(n); step = int(SR / 24)
    for i in range(0, n - 400, step):
        k = click(rng.uniform(800, 1600), 0.008, 600); x[i : i + len(k)] += k * 0.5
    x += lp_fast(rng.standard_normal(n), 300) * 0.15
    for _ in range(int(dur * 6)):  # пыль на плёнке
        at = int(rng.uniform(0, dur - 0.01) * SR); k = click(rng.uniform(2000, 6000), 0.005, 900)
        x[at : at + len(k)] += k * rng.uniform(0.2, 1)
    return x


def accordion(dur):  # далёкий уличный вальс
    notes = [64, 67, 71, 72, 71, 67, 64, 62, 64, 66, 67, 69, 67, 64, 62, 60, 59, 60, 62, 64]
    n = int(dur * SR); x = np.zeros(n); beat = 0.45
    for i in range(int(dur / beat)):
        m = notes[i % len(notes)]; f = 440 * 2 ** ((m - 69) / 12)
        tt = t(int(beat * SR)); v = 1 + 0.004 * np.sin(2 * np.pi * 5.5 * tt)
        s = sum(np.sign(np.sin(2 * np.pi * f * h * v * tt)) / h for h in (1, 2)) * env(len(tt), 0.04, 0.12)
        s += 0.5 * np.sin(2 * np.pi * (f / 2) * tt) * env(len(tt), 0.04, 0.2)
        a = int(i * beat * SR); x[a : a + len(s)] += s[: n - a]
    return lp_fast(norm(x), 2200)


def scratch(dur):  # карандаш по бумаге
    n = int(dur * SR); tt = t(n)
    m = 0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 7 * tt))
    return norm(bp_fast(rng.standard_normal(n), 2500, 8000) * m * env(n, 0.05, 0.1))


def riser(dur):
    n = int(dur * SR); tt = t(n)
    x = bp_fast(rng.standard_normal(n), 800, 9000) * (tt / dur) ** 2
    x += np.sin(2 * np.pi * np.cumsum(200 + 600 * (tt / dur) ** 2) / SR) * (tt / dur) ** 2 * 0.4
    return norm(x)


def rumble(dur):
    n = int(dur * SR)
    return norm(lp_fast(rng.standard_normal(n), 120)) * env(n, 0.1, dur * 0.7)


def shutter():
    a = click(1800, 0.04, 150); b = click(1200, 0.05, 120)
    x = np.zeros(int(0.12 * SR)); x[: len(a)] += a; k = int(0.06 * SR); x[k : k + len(b)] += b
    return norm(x)


def paper(dur=0.5):
    n = int(dur * SR)
    return norm(bp_fast(rng.standard_normal(n), 1500, 7000) * (0.4 + 0.6 * np.abs(lp_fast(rng.standard_normal(n), 30)) ) * env(n, 0.02, 0.2))


def hum(dur, f=50):
    tt = t(int(dur * SR))
    return np.sin(2 * np.pi * f * tt) * 0.5 + np.sin(2 * np.pi * 2 * f * tt) * 0.2


def fade(x, a, d):
    return x * env(len(x), a, d)


# ================= СЦЕНА 1 (0–5): трос, ветер, сердце =================
add(fade(wind(7.7, 700, 0.4, 1), 0.3, 0.2), 0.0, 0.32, -0.3)
add(fade(wind(7.7, 300, 0.5, 2), 0.3, 0.2), 0.0, 0.32, 0.3)
for i, bt in enumerate(np.arange(0.2, 5, 0.85)):
    add(heartbeat(), bt, 0.9)
for at in (0.6, 2.8, 4.2):  # скрип троса
    tt = t(int(0.9 * SR)); f = 180 + 60 * np.sin(2 * np.pi * 1.3 * tt)
    add(np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * env(len(tt), 0.2, 0.4) * 0.15, at, 0.35)
add(whoosh(0.9, 200, 2500), 1.75, 0.8)
add(rumble(2.5), 1.9, 0.6)
add(fade(crowd(2.5, 9), 0.5, 1.0), 2.4, 0.04)  # город далеко внизу
for at in (2.9, 3.8): add(np.sin(2 * np.pi * 420 * t(int(0.25 * SR))) * env(int(0.25 * SR), 0.01, 0.1), at, 0.03)  # клаксоны

# ================= СЦЕНА 2 (5–12): паника, стоп-кадр, трещина =================
bt = 5.0; iv = 0.7
while bt < 7.6:
    add(heartbeat(), bt, 1.0); bt += iv; iv = max(0.38, iv * 0.88)
for at in np.arange(5.1, 7.6, 0.55): add(breath(0.35, 2400), at, 0.25)
add(whoosh(0.6, 400, 4000), 5.2, 0.5)
add(shutter(), 7.68, 0.8)  # стоп-кадр
tt = t(int(2.5 * SR)); add(np.sin(2 * np.pi * 4200 * tt) * env(len(tt), 0.05, 1.8), 7.7, 0.06)  # звон в ушах
add(crack(), 8.3, 1.0)
add(crack(), 8.75, 0.7)
add(tinkle(1.6, 30), 9.6, 0.5)
add(whoosh(1.0, 150, 1800), 10.4, 0.6)
add(projector(1.2) * env(int(1.2 * SR), 0.6, 0.01), 10.8, 0.5)

# ================= 70-е: треск плёнки на всю ретро-часть =================
add(projector(43.0) * env(int(43 * SR), 0.01, 0.4), 12.0, 0.35)

# ================= СЦЕНА 3 (12–22): Париж =================
add(fade(crowd(10, 3), 1.0, 1.0), 12.0, 0.09)
add(fade(accordion(10.0), 1.5, 1.5), 12.0, 0.12, 0.4)
for at in np.arange(12.4, 15.2, 0.32):  # мячики в руки
    add(thud(rng.uniform(160, 220), 0.12), at, 0.25, rng.uniform(-0.3, 0.3))
add(paper(0.6), 15.45, 0.5)
add(paper(0.5), 15.9, 0.4)
add(scratch(1.6), 17.2, 0.45)
add(scratch(0.6), 19.0, 0.4)
tt = t(int(1.4 * SR)); add(np.sin(2 * np.pi * 880 * tt) * np.exp(-tt * 4) + 0.5 * np.sin(2 * np.pi * 1320 * tt) * np.exp(-tt * 5), 19.8, 0.25)
add(whoosh(0.7, 300, 3000), 21.6, 0.6)

# ================= СЦЕНА 4 (22–34): ночной Нью-Йорк =================
add(fade(hum(12, 55) * 0.4 + crowd(12, 5) * 0.2, 0.5, 0.5), 22.0, 0.25)
add(siren(4.5), 23.0, 0.05, -0.6)
add(siren(4.0), 31.0, 0.04, 0.6)
for i, at in enumerate(np.arange(22.4, 28.0, 0.42)):
    add(clank(), at, 0.35, -0.2 if i % 2 else 0.2)
for at in np.arange(22.6, 28.0, 1.1): add(breath(0.7, 1400), at, 0.22)
add(fade(lp_fast(rng.standard_normal(int(5.6 * SR)), 250) * 3, 0.3, 0.5), 22.4, 0.12)  # тащат трос
add(fade(wind(6, 600, 0.4, 4), 0.5, 0.5), 28.0, 0.25)
tt = t(int(1.0 * SR)); add(np.sign(np.sin(2 * np.pi * np.cumsum(90 + 60 * tt) / SR)) * env(len(tt), 0.3, 0.05) * 0.2, 28.6, 0.4)  # натяжение лука
add(pluck(98, 1.2), 29.6, 0.9)
add(whoosh(1.1, 600, 6000), 29.65, 0.8)
add(thud(120, 0.3), 30.75, 0.8)
add(clank(), 30.78, 0.3)

# ================= СЦЕНА 5 (34–48): рассвет, проход =================
add(fade(wind(14, 400, 0.3, 6), 0.8, 0.5), 34.0, 0.18)
for at in rng.uniform(34.2, 40, 9): add(chirp(), at, 0.08, rng.uniform(-0.8, 0.8))
cr = crowd(14, 8) * np.linspace(0.2, 1.0, int(14 * SR)); add(fade(cr, 1.0, 0.4), 34.0, 0.2)
add(gasp(1.4), 35.6, 0.5)
add(gasp(1.2), 40.5, 0.4)
add(gasp(1.4), 42.6, 0.5)
add(whistle(0.7), 44.6, 0.12, 0.5)
add(whistle(0.5), 45.4, 0.10, 0.5)
add(cheer(3.0), 45.6, 0.55)
for at in np.arange(36.4, 40.2, 0.75): add(thud(70, 0.2), at, 0.15)  # шаги по тросу

# ================= СЦЕНА 6 (48–55): наручники, газеты =================
add(fade(cheer(7.0), 0.1, 1.0), 48.0, 0.4)
for at in (48.6, 48.75): add(clank() * 0.5, at, 0.5); add(click(4000, 0.05, 90), at, 0.3)
for at in (49.8, 50.9, 52.0, 53.0):
    add(whoosh(0.5, 800, 6000), at - 0.2, 0.5); add(paper(0.4), at + 0.15, 0.5); add(thud(100, 0.2), at + 0.25, 0.5)
for at in (49.2, 50.3, 51.1, 52.4, 53.3, 54.1): add(shutter(), at, 0.3, rng.uniform(-0.5, 0.5))  # вспышки (как в towers.tsx)

# ================= СЦЕНА 7 (55–60): снова наш герой =================
add(whoosh(0.8, 200, 3000), 54.8, 0.5)
add(fade(wind(5.0, 500, 0.3, 11), 0.5, 1.0), 55.0, 0.25)
for at in (55.2, 56.2): add(heartbeat(), at, 0.7)
add(breath(1.6, 1200), 56.6, 0.6)
add(thud(80, 0.3), 58.1, 0.4)
add(riser(1.8), 58.1, 0.45)
tt = t(int(1.0 * SR))
add(sum(np.sin(2 * np.pi * f * tt) for f in (523, 659, 784, 1047)) * env(len(tt), 0.05, 0.9) * 0.25, 59.0, 0.5)

# ---------- сведение ----------
mix = np.stack([L, R], 1)
mix = np.tanh(mix * 1.2) / np.tanh(1.2)
mix /= np.max(np.abs(mix)) + 1e-9; mix *= 0.89
os.makedirs("public/towers", exist_ok=True)
with wave.open("public/towers/sound.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype("<i2").tobytes())
print("ok public/towers/sound.wav")

# Звуковая дорожка ролика invisible (60 сек, без голоса): синтез всех звуков.
# Запуск: python3 scripts/invisible_sound.py  ->  public/invisible/sound.wav
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


# ===== 0–7: ванная, зеркало без отражения =====
add(bed(1.6, 600, 5000, 0.05, 0.4), 0.0, 0.18)             # вода из крана
add(scrub(1.0), 0.0, 0.35)
add(whoosh(0.5, 800, 6000), 0.55, 0.4)                    # резкий наезд на зеркало
add(boom(1.8), 0.95, 1.0)                                 # хук-удар
add(pad(5.5, [38, 45, 50]) * 0.8, 1.5, 0.35)              # тревожный гул
add(shimmer(2.6, 400, 3000), 2.6, 0.45)                   # исчезает
add(whoosh(0.8, 300, 4000), 4.6, 0.4)
add(ping(3200, 0.5, 10) + ping(4100, 0.5, 12), 6.5, 0.4)  # щётка в раковину
add(thud(300, 0.1), 6.5, 0.3)

# ===== 7–14: улица =====
add(bed(7.0, 150, 1200, 0.5, 0.6), 7.0, 0.18)             # гул города
for a in rng.uniform(7.2, 13.5, 6): add(chirp(), a, 0.05, rng.uniform(-0.8, 0.8))
for a in np.arange(7.4, 11.0, 0.42): add(thud(140, 0.08), a, 0.12, -0.3)   # шаги прохожего
add(shimmer(0.9, 900, 2600), 10.6, 0.35)                  # прохожий проходит сквозь
for a in (12.0, 12.4, 12.83, 13.33): add(bark(), a, 0.6, 0.4)
add(whoosh(0.4, 600, 4000), 12.25, 0.3)

# ===== 14–21: пекарня =====
add(ping(1760, 1.2, 3) + ping(2350, 1.2, 3.5), 14.05, 0.3)   # колокольчик двери
add(bed(7.0, 120, 800, 0.3, 0.5), 14.0, 0.1)
add(bed(1.8, 1500, 5000, 0.1, 0.2) * 0.5, 14.3, 0.12)        # протирает прилавок
add(whoosh(0.4, 1000, 6000), 15.6, 0.3)
add(shimmer(1.6, 1200, 2400), 15.7, 0.25)                     # пончик парит
add(whoosh(0.5, 400, 3000), 16.35, 0.35)                      # пекарь ахает
add(click(900, 0.4, 8) + click(1400, 0.4, 9), 16.6, 0.5)      # роняет поднос
add(crunch(), 17.33, 0.6)
add(crunch(), 18.33, 0.6)
add(whoosh(0.6, 300, 3000), 20.2, 0.3)

# ===== 21–28: качели =====
add(bed(7.0, 300, 2500, 0.5, 0.6) * 0.5, 21.0, 0.12)          # ветер в парке
for a in rng.uniform(21.2, 27.5, 7): add(chirp(), a, 0.06, rng.uniform(-0.8, 0.8))
for k in range(9): add(creak(0.45, 360 + k * 6), 21.0 + 0.4 + k * 0.8, 0.12)
for a in (22.2, 23.8, 25.4, 27.0): add(thud(110, 0.15), a, 0.35)
for i, a in enumerate((23.0, 24.6, 26.2, 27.6)): add(laugh(3 + i, 430 + i * 15), a, 0.25 + i * 0.07, 0.3)

# ===== 28–35: вечеринка и фото =====
m = music_loop(5.2) * env(int(5.2 * SR), 0.3, 0.4); add(m, 28.0, 0.35)
cr = norm(filt(noise(5.0), 300, 2500)) * env(int(5 * SR), 0.3, 0.4); add(cr, 28.0, 0.12)
for a in (28.8, 30.2, 32.0): add(laugh(4, 300), a, 0.16, rng.uniform(-0.5, 0.5))
x = t(int(0.9 * SR)); add(np.sin(2 * np.pi * np.cumsum(2000 + 4000 * x / 0.9) / SR) * env(len(x), 0.1, 0.05) * 0.2, 30.75, 0.25)  # вспышка заряжается
add(shutter(), 31.67, 0.8)
add(filt(np.sign(np.sin(2 * np.pi * 120 * t(int(0.8 * SR)))), 200, 2000) * 0.3, 33.0, 0.3)  # полароид выплёвывает фото
add(pad(2.4, [57, 60, 64]), 33.2, 0.25)

# ===== 35–49: дождь, девочка =====
rn = rain(14.5) * np.concatenate([np.linspace(0, 1, int(1.5 * SR)), np.ones(int(13 * SR))]); add(rn, 35.0, 0.3)
add(pad(7.0, [50, 53, 57]), 35.2, 0.3)
add(boom(2.5), 39.0, 0.6)                                    # гром
for a in np.arange(42.3, 45.0, 0.45): add(click(900, 0.06, 60), a, 0.12, -0.4)   # шаги по лужам
add(ping(1320, 1.2, 3), 44.3, 0.3, -0.3)                      # девочка машет
add(pad(5.0, [55, 59, 62]), 44.0, 0.28)
add(ping(1760, 1.2, 3), 45.4, 0.3, 0.3)                       # он машет в ответ

# ===== 49–55: возвращается =====
add(shimmer(3.2, 300, 2400), 49.6, 0.5)
add(pad(3.0, [60, 64, 67, 72]), 52.6, 0.45)
add(tinkle(2.0, 30), 52.6, 0.35)
for a in np.arange(54.0, 55.0, 0.12): add(click(2000, 0.02, 300), a, 0.12, 0.5)   # девочка хлопает

# ===== 55–60: утро, снова зеркало =====
for a in rng.uniform(55.1, 58.5, 5): add(chirp(), a, 0.05, rng.uniform(-0.8, 0.8))
add(scrub(3.4), 55.2, 0.3)
add(glitch(0.15), 58.73, 0.6)
add(glitch(0.12), 58.95, 0.6)
add(boom(0.9), 59.15, 0.9)

mix = np.stack([L, R], 1)
mix = np.tanh(mix * 1.3) / np.tanh(1.3)
mix /= np.max(np.abs(mix)) + 1e-9; mix *= 0.89
os.makedirs("public/invisible", exist_ok=True)
with wave.open("public/invisible/sound.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype("<i2").tobytes())
print("ok public/invisible/sound.wav")

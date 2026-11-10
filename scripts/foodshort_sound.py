# Звук для шортса foodshort: гул, сердцебиение, удары на сменах кадра, стук в дверь и т.д. Всё синтезируется.
# Запуск: python3 scripts/foodshort_sound.py -> public/foodshort/sfx.wav
import numpy as np, wave
SR = 44100; DUR = 67.0; N = int(SR * DUR)
rng = np.random.default_rng(3)
L = np.zeros(N); R = np.zeros(N)
def tt(n): return np.arange(n) / SR
def lpf(x, c):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X *= 1 / (1 + (f / c) ** 4); return np.fft.irfft(X, len(x))
def bpf(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X *= (f > lo) & (f < hi); return np.fft.irfft(X, len(x))
def put(at, s, g=1.0, pan=0.0):
    i = int(at * SR); n = min(len(s), N - i)
    if n <= 0: return
    L[i:i+n] += s[:n] * g * (1 - max(0, pan)); R[i:i+n] += s[:n] * g * (1 + min(0, pan))
def env(n, a, d):
    t = tt(n); return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)
# гул: два низких тона + шум, медленно растёт к концу
t = tt(N); grow = 0.5 + 0.5 * np.clip(t / 60, 0, 1)
drone = (np.sin(2*np.pi*55*t) * 0.5 + np.sin(2*np.pi*55.7*t) * 0.4 + np.sin(2*np.pi*82.4*t) * 0.15) * (0.8 + 0.2*np.sin(2*np.pi*0.1*t))
drone += lpf(rng.standard_normal(N), 180) * 0.6
fade = np.clip(t / 1.5, 0, 1) * np.clip((DUR - t) / 2, 0, 1)
L += drone * 0.05 * grow * fade; R += drone * 0.05 * grow * fade
def boom(d=1.2):
    n = int(SR*d); tt_ = tt(n); f = 70 * np.exp(-tt_ * 3) + 35
    return np.sin(2*np.pi*np.cumsum(f)/SR) * env(n, 0.003, 0.35) + lpf(rng.standard_normal(n), 300) * env(n, 0.002, 0.08) * 0.5
def whoosh(d=0.6):
    n = int(SR*d); x = rng.standard_normal(n); w = np.sin(np.pi * tt(n) / d) ** 2
    return bpf(x, 400, 3000) * w * 0.6
def knock():
    n = int(SR*0.25); tt_ = tt(n)
    return (np.sin(2*np.pi*110*tt_) * 0.8 + lpf(rng.standard_normal(n), 900) * 0.7) * env(n, 0.001, 0.04)
def beat(at):
    put(at, boom(0.4) * 0.6, 0.5); put(at + 0.22, boom(0.4) * 0.45, 0.5)
def click():
    n = int(SR*0.06); return bpf(rng.standard_normal(n), 1500, 6000) * env(n, 0.0005, 0.008)
def buzz(d=0.7):
    n = int(SR*d); tt_ = tt(n); g = (np.sin(2*np.pi*6*tt_) > 0).astype(float)
    return np.sign(np.sin(2*np.pi*150*tt_)) * 0.3 * g * env(n, 0.01, 2)
def creak(d=1.0):
    n = int(SR*d); tt_ = tt(n); f = 300 + 120*np.sin(2*np.pi*1.3*tt_) + 40*rng.standard_normal(n).cumsum()/SR*50
    s = np.sign(np.sin(2*np.pi*np.cumsum(f)/SR)) * (rng.random(n) < 0.35)
    return bpf(s, 200, 2500) * np.sin(np.pi*tt_/d) * 0.5
def sizzle(d):
    n = int(SR*d); return bpf(rng.standard_normal(n), 2500, 9000) * 0.12 * (0.7 + 0.3*rng.random(n))
def step(at, g):
    n = int(SR*0.18); put(at, lpf(rng.standard_normal(n), 600) * env(n, 0.002, 0.03), g)
# удары/вжухи на сменах кадра
for c in [5.45, 10.15, 16.35, 21.95, 25.7, 27.6, 34.45, 37.7, 40.0, 45.5, 51.5, 53.88]:
    put(c - 0.35, whoosh(0.5), 0.5)
for c in [0.05, 3.89, 21.98, 40.47, 53.02, 57.0]:
    put(c, boom(1.6), 0.9)
for k in range(8): beat(41.5 + k * 1.1)                 # сердце: запах ползёт
for k in range(14): beat(53.9 + k * 0.62)               # сердце быстрее: шаги
put(18.6, click(), 0.8); put(18.7, click(), 0.6)         # фонарик
put(29.3, creak(1.4), 0.6); put(32.5, knock() * 0.6, 0.8); put(33.3, click(), 0.9)  # дверь на 3-м
put(37.0, click(), 1.0); put(37.1, knock() * 0.5, 0.9)   # замок
put(38.1, sizzle(13.4), 1.0)                             # кастрюля до выключения
put(45.7, buzz(0.8), 0.5); put(46.6, buzz(0.5), 0.4)
for k in range(10): put(48.0 + k * 0.32, click() * 0.6, 0.6)  # «печатают»
put(51.9, click(), 1.0)                                  # ручка плиты
for k in range(22): step(53.9 + k * 0.33 + rng.random() * 0.1, 0.25 + k * 0.03)
for a in [58.05, 58.4, 58.75]: put(a, knock(), 1.6)
put(61.4, boom(2.2), 1.0)
m = np.max(np.abs(np.stack([L, R]))); L /= m / 0.8; R /= m / 0.8
out = (np.stack([L, R], 1) * 32767).astype(np.int16)
with wave.open("public/foodshort/sfx.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(out.tobytes())
print("ok")

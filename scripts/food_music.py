# Фоновая музыка для всего фильма «What if the world's food supply collapsed?» (≈9,5 мин).
# Настроение по частям: тревога растёт (1–5), холодная пустота (6–7), надежда (8–9), спокойный финал (10).
# python3 scripts/food_music.py dur1 dur2 ... dur10 → public/food/music_full.mp3 (склейка: scripts/glue_food.sh)
import sys, wave
import numpy as np
SR = 44100
rng = np.random.default_rng(7)
durs = [float(x) for x in sys.argv[1:]]
N = int(sum(durs) * SR) + SR
L = np.zeros(N); R = np.zeros(N)
def t(n): return np.arange(n) / SR
def hz(m): return 440 * 2 ** ((m - 69) / 12)
def lp(x, a=0.02):  # однополюсный фильтр нижних частот через FFT (без scipy)
    n = len(x); X = np.fft.rfft(x); w = 2 * np.pi * np.fft.rfftfreq(n)
    return np.fft.irfft(X * (a / (1 - (1 - a) * np.exp(-1j * w))), n)
def fade(n, a, d):
    e = np.ones(n); ka = int(a * SR); kd = int(d * SR)
    if ka: e[:ka] = np.linspace(0, 1, ka)
    if kd: e[-kd:] = np.linspace(1, 0, kd)
    return e
def put(sig, at, g=1.0, pan=0.0):
    i = int(at * SR)
    if i < 0: sig = sig[-i:]; i = 0
    n = min(len(sig), N - i)
    if n <= 0: return
    L[i:i + n] += sig[:n] * g * (1 - max(0, pan)); R[i:i + n] += sig[:n] * g * (1 + min(0, pan))
def drone(d, notes, bright=0.3):
    x = t(int(d * SR)); s = np.zeros(len(x))
    for m in notes:
        f = hz(m)
        for det in (0.996, 1.0, 1.004):
            s += np.sin(2 * np.pi * f * det * x + 0.4 * np.sin(2 * np.pi * 0.07 * x)) * (1.0 if det == 1.0 else 0.6)
            s += bright * 0.3 * np.sin(2 * np.pi * f * 2 * det * x)
    s *= 0.75 + 0.25 * np.sin(2 * np.pi * 0.05 * x + rng.uniform(0, 6))
    return s / (np.max(np.abs(s)) + 1e-9)
def keynote(m, d=3.5, g=1.0):
    x = t(int(d * SR)); f = hz(m)
    s = (np.sin(2 * np.pi * f * x) + 0.4 * np.sin(2 * np.pi * 2 * f * x) + 0.15 * np.sin(2 * np.pi * 3 * f * x)) * np.exp(-x * 1.3)
    return s * np.minimum(1, x * 200) * g
def pulse(d, bpm=56, g=1.0):
    n = int(d * SR); s = np.zeros(n); per = 60 / bpm
    for k in np.arange(0, d, per):
        x = t(int(0.5 * SR)); b = np.sin(2 * np.pi * (48 + 30 * np.exp(-x * 20)) * x) * np.exp(-x * 7)
        i = int(k * SR); m = min(len(b), n - i); s[i:i + m] += b[:m]
        i2 = int((k + 0.28) * SR); m2 = min(len(b), n - i2)
        if m2 > 0: s[i2:i2 + m2] += b[:m2] * 0.55
    return s * g
def air(d):
    n = int(d * SR); w = rng.standard_normal(n); w = w - lp(w, 0.08); w = lp(w, 0.3)
    return w / (np.max(np.abs(w)) + 1e-9) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.03 * t(n)))

# опорные гармонии на каждую часть (MIDI-ноты) и настройки
A_MIN = [45, 52, 57, 60]; D_MIN = [50, 57, 62, 65]; F_MAJ = [53, 60, 65, 69]; C_MAJ = [48, 55, 60, 64]
plan = [  # (аккорды, громкость дрона, пульс, мелодия, яркость, воздух)
    ([A_MIN, F_MAJ], 0.55, 0.0, [69, 72, 76, 74], 0.2, 0.10),
    ([A_MIN, D_MIN], 0.6, 0.20, [69, 68, 69, 64], 0.2, 0.12),
    ([D_MIN, [50, 56, 62, 65]], 0.65, 0.35, [74, 73, 74, 69], 0.25, 0.14),
    ([[45, 51, 57, 60], A_MIN], 0.7, 0.45, [64, 63, 64, 60], 0.15, 0.16),
    ([[44, 51, 56, 59], D_MIN], 0.7, 0.45, [62, 63, 62, 58], 0.15, 0.18),
    ([A_MIN, [41, 48, 57, 60]], 0.6, 0.15, [76, 0, 74, 0], 0.4, 0.22),
    ([D_MIN, A_MIN], 0.6, 0.10, [81, 0, 79, 76], 0.5, 0.25),
    ([F_MAJ, C_MAJ], 0.55, 0.0, [72, 74, 76, 79], 0.35, 0.08),
    ([C_MAJ, F_MAJ], 0.55, 0.0, [76, 74, 72, 74], 0.35, 0.06),
    ([A_MIN, F_MAJ, C_MAJ], 0.55, 0.10, [69, 72, 76, 72], 0.3, 0.08),
]
start = 0.0
for i, (d, (chords, dv, pv, mel, br, av)) in enumerate(zip(durs, plan)):
    seg = d / len(chords)
    for k, ch in enumerate(chords):
        dd = seg + 4.0
        sig = drone(dd, ch, br) * fade(int(dd * SR), 2.5, 3.0)
        put(sig, start + k * seg - 1.0, dv * 0.5, -0.15); put(sig, start + k * seg - 1.0, dv * 0.5, 0.15)
    if pv > 0: put(pulse(d, 54 + i * 2) * fade(int(d * SR), 3, 3), start, pv * 0.5)
    put(air(d) * fade(int(d * SR), 3, 3), start, av)
    step = 7.5
    for j, tt in enumerate(np.arange(start + 3.0, start + d - 4, step)):
        m = mel[j % len(mel)]
        if m: put(keynote(m, 4.0, 0.22), tt, 1.0, 0.3 if j % 2 else -0.3)
    start += d
mix = np.stack([L, R], 1)
mix /= np.max(np.abs(mix)) + 1e-9; mix *= 0.85
mix *= fade(len(mix), 2.0, 4.0)[:, None]
with wave.open("out/music_full.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype("<i2").tobytes())
print("ok music", len(mix) / SR)
import subprocess; subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "out/music_full.wav", "-b:a", "160k", "public/food/music_full.mp3"], check=True)

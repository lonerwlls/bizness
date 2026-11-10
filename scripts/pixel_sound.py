# Звук пробы «пиксель-арт» (10 с): 8-битная музыка 150 уд/мин (1/16 такта = 0.1 с = 1 кадр анимации) и звуки событий.
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
import sfx
from sfx import *  # noqa
D = 10.0
S = 0.1  # 1/16 такта


def hz(m): return 440 * 2 ** ((m - 69) / 12)


def sq(f, d, duty=0.5, dec=6.0, sweep=0.0):  # прямоугольная волна (как у старых приставок)
    n = int(d * SR); x = t(n)
    ph = np.cumsum(f * (1 + sweep * x / d)) / SR
    s = np.where((ph % 1) < duty, 1.0, -1.0)
    e = np.exp(-dec * x); e[: int(0.003 * SR)] *= np.linspace(0, 1, int(0.003 * SR))
    e[-int(0.01 * SR):] *= np.linspace(1, 0, int(0.01 * SR))
    return s * e


def tri(f, d, dec=3.0):
    n = int(d * SR); x = t(n); ph = (f * x) % 1
    s = 4 * np.abs(ph - 0.5) - 1
    e = np.exp(-dec * x); e[-int(0.01 * SR):] *= np.linspace(1, 0, int(0.01 * SR))
    return s * e


def nz(d, dec=30.0, hi=None):  # 8-битный шум (ступенчатый)
    n = int(d * SR); step = 6 if hi else 2
    s = np.repeat(rng.choice([-1.0, 1.0], n // step + 1), step)[:n]
    return s * np.exp(-dec * t(n))


def kick(): n = int(0.15 * SR); x = t(n); return np.sin(2 * np.pi * np.cumsum(150 * np.exp(-25 * x) + 45) / SR) * np.exp(-18 * x)


# аккорды по полтакта (8 кадров): C C Am Am F F G G | C Am F G ... финал C
CH = {"C": [60, 64, 67], "Am": [57, 60, 64], "F": [53, 57, 60], "G": [55, 59, 62], "E": [56, 59, 64]}
prog = ["C", "C", "Am", "Am", "F", "F", "G", "G", "C", "Am", "F", "G"]
END = 88  # финальный аккорд
for k in range(END):
    a = k * S; ch = CH[prog[(k // 8) % len(prog)]]
    calm = 36 <= k < 48  # подбор монеты: музыка затихает
    # арпеджио (каждая 1/16)
    if not (calm and k % 2):
        m = ch[[0, 1, 2, 1][k % 4]] + 12 + (12 if 48 <= k < 64 and k % 4 == 2 else 0)
        add(sq(hz(m), 0.11, 0.25, 14), a, 0.075 if not calm else 0.05, 0.25)
    # бас на восьмые
    if k % 2 == 0 and not calm:
        add(tri(hz(ch[0] - 24 + (12 if k % 4 == 2 else 0)), 0.19, 5), a, 0.3)
    # барабаны
    if not calm and not (48 <= k < 56):
        if k % 8 == 0 or (k % 16 == 10): add(kick(), a, 0.42)
        if k % 8 == 4: add(nz(0.14, 22), a, 0.12)
        if k % 2 == 1: add(nz(0.04, 90, hi=True), a, 0.04, 0.3)
# мелодия поверх (кадр, нота, длина в 1/16)
mel = [(0, 76, 2), (2, 79, 2), (4, 84, 4), (8, 83, 2), (10, 79, 2), (12, 76, 4), (16, 81, 2), (18, 84, 2), (20, 88, 4), (24, 86, 4), (28, 84, 4),
       (64, 79, 2), (66, 84, 2), (68, 88, 4), (72, 91, 2), (74, 88, 2), (76, 84, 4), (80, 86, 2), (82, 88, 2), (84, 91, 4)]
for k, m, ln in mel: add(sq(hz(m), ln * S, 0.5, 3), k * S, 0.06, -0.2)
# финал: аккорд и звонкое арпеджио вверх
for i, m in enumerate([72, 76, 79, 84, 88]): add(sq(hz(m), 1.4, 0.5, 2.2), END * S + i * 0.03, 0.05, (i - 2) * 0.2)
add(tri(hz(48), 1.4, 1.5), END * S, 0.35); add(kick(), END * S, 0.5); add(nz(0.9, 4), END * S, 0.12)

# шаги (кадры касания, пока идёт)
for k in range(0, 36, 2): add(nz(0.05, 70), k * S, 0.07, -0.1)
# блеск монеты на тротуаре
for k in (10, 22, 32): add(sq(hz(100), 0.25, 0.5, 12), k * S, 0.05, 0.5); add(sq(hz(105), 0.2, 0.5, 14), k * S + 0.06, 0.04, 0.5)
# печать букв
for start, n in ((2, 11), (36, 19), (60, 10), (72, 12)):
    for i in range(n): add(sq(hz(96), 0.025, 0.5, 80), (start + i) * S, 0.025, 0.0)
# «!»
add(sq(hz(84), 0.07, 0.5, 20), 36 * S, 0.12); add(sq(hz(91), 0.12, 0.5, 15), 36 * S + 0.07, 0.12)
# подбор: «дзинь-дзинь»
add(sq(hz(83), 0.08, 0.5, 15), 44 * S, 0.12); add(sq(hz(88), 0.35, 0.5, 7), 44 * S + 0.08, 0.12)
# бросок вверх: подъём тона
add(sq(hz(60), 0.8, 0.5, 2.0, sweep=3.0), 48 * S, 0.07)
# сияние наверху
for i, m in enumerate([84, 88, 91, 96, 100]): add(sq(hz(m), 0.3, 0.25, 9), 56 * S + i * 0.04, 0.05, (i - 2) * 0.3)
# удвоения: каждый раз выше
for i, k in enumerate((60, 62, 64, 66)): add(sq(hz(88 + i * 3), 0.18, 0.5, 12), k * S, 0.09, (-1) ** i * 0.3)
# монеты падают и звенят (не больше одного звука за кадр)
land = [68 + int(i * 0.75) + (0 if i < 16 else 2) + 8 for i in range(34)]
for k in sorted(set(land)): add(sq(hz(96 + (k % 3) * 2), 0.06, 0.5, 30), k * S, 0.045, ((k % 5) - 2) * 0.2)
# прыжки
for k in (72, 80): add(sq(hz(67), 0.25, 0.5, 6, sweep=1.2), k * S, 0.08)

# сохраняем ровно 10 секунд
n = int(D * SR)
L2, R2 = sfx.L[:n], sfx.R[:n]
mix = np.stack([L2, R2], 1); mix = np.tanh(mix * 1.3) / np.tanh(1.3); mix /= np.max(np.abs(mix)) + 1e-9; mix *= 0.89
fade = int(0.05 * SR); mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
import wave
os.makedirs("public/pixel", exist_ok=True)
with wave.open("public/pixel/sound.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype("<i2").tobytes())
print("ok public/pixel/sound.wav")

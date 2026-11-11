# Звук и музыка для русского шортса «Последний ящик» (всё синтезируется здесь, без чужих записей).
# Запуск (после node scripts/foodshort_warp.mjs): python3 scripts/foodshort_sound_ru.py -> public/foodshort_ru/bed.wav
# Внутри: страшная музыка (гул, диссонансные «струнные», колокольчики, сердце, нарастание), фон каждой сцены
# и звуки каждого предмета. Под голосом музыка и фон автоматически приглушаются.
import numpy as np, wave, re, json, subprocess

SR = 44100
rng = np.random.default_rng(11)
tsx = open("src/foodshort/FoodShort.tsx", encoding="utf8").read()
WARP = json.loads("[" + re.search(r"export const WARP_RU: \[number, number\]\[\] = \[(.*?)\];", tsx, re.S).group(1).strip().rstrip(",") + "]")
vts = open("src/foodshort/voice_ru.ts", encoding="utf8").read()
VOICE = json.loads(vts[vts.index("{"): vts.rindex("}") + 1])
DUR = VOICE["dur"] + 3.8
N = int(SR * DUR)


def wt(x):  # время английского монтажа -> время русского ролика
    for i in range(1, len(WARP)):
        if x <= WARP[i][0]:
            a, b = WARP[i - 1], WARP[i]
            return a[1] + (b[1] - a[1]) * max(0, (x - a[0]) / (b[0] - a[0]))
    return WARP[-1][1] + x - WARP[-1][0]


CUT = [0, 5.45, 10.15, 16.35, 21.95, 25.7, 27.6, 34.45, 37.7, 40.0, 45.5, 51.5, 53.88, 57.82, 61.4, 66.3]
cut = lambda i: wt(CUT[i])
W = {}
for w in VOICE["words"]: W.setdefault(w["w"], []).append(w["t"])
word = lambda w, n=1: W[w][n - 1]


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

# шины: музыка, фон+предметы, отправка в реверберацию
MUS = np.zeros((N, 2)); FX = np.zeros((N, 2)); REV = np.zeros(N)
def put(bus, at, s, g=1.0, pan=0.0, rev=0.0):
    i = int(at * SR)
    if i >= N: return
    if i < 0: s = s[-i:]; i = 0
    n = min(len(s), N - i)
    s = s[:n] * g
    bus[i:i + n, 0] += s * min(1, 1 - pan); bus[i:i + n, 1] += s * min(1, 1 + pan)
    if rev: REV[i:i + n] += s * rev

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

# ---------- сцены ----------
c = [cut(i) for i in range(len(CUT))]
# 1. дом ночью: ветер, далёкий гул города, окна вспыхивают по одному
put(FX, 0, wind(c[1] + 0.5), 0.5, rev=0.1)
put(FX, 0, lp(noise(int(SR * c[1])), 120) * 0.4 * fade(int(SR * c[1]), 1, 0.5), 0.6)
for k in range(16):
    tw = wt(3.9 + rng.random() * 1.3); put(FX, tw, click(2500, 0.04), 0.35, pan=rng.random() - 0.5, rev=0.3)
put(FX, wt(4.3), murmur(1.6, 8), 0.5, rev=0.4)
# 2. телевизор: шипение, сигнал «срочно», голос диктора
d = c[2] - c[1]
put(FX, c[1], bp(noise(int(SR * d)), 5000, 12000) * 0.03 * fade(int(SR * d), 0.1, 0.2), 1)
put(FX, c[1] + 0.05, tv_babble(d - 0.1), 0.5, pan=0.3)
for k, tb in enumerate([c[1] + 0.1, wt(7.0), wt(7.95)]):
    for j in range(2): put(FX, tb + j * 0.16, ping(880 if j == 0 else 660), 0.35, pan=0.3)
# 3. магазин: гудение мигающей лампы, ветер, хруст стекла, наезд
d = c[3] - c[2]
put(FX, c[2], hum(d, 100, flick=True), 0.18, rev=0.2)
put(FX, c[2], wind(d), 0.35)
put(FX, wt(13.45), whoosh(0.5), 0.5)
for k in range(5): put(FX, wt(15.0) + k * 0.09, click(6000, 0.03), 0.5, pan=0.4)
# 4. подсобка: тишина, капли, щелчок фонарика, шорох коробок, находка
d = c[4] - c[3]
for k in range(int(d / 0.9)): put(FX, c[3] + k * 0.9 + rng.random() * 0.4, metal(2200 + rng.random() * 600, 0.3) * 0.15, 0.6, pan=rng.random() - 0.5, rev=0.6)
put(FX, wt(18.6), click(3000, 0.06), 1.0); put(FX, wt(18.68), click(2200, 0.05), 0.7)
for k in range(3): put(FX, wt(19.2 + k * 0.9), rustle(0.6), 0.7, pan=0.3, rev=0.2)
put(FX, wt(21.35), thump(1.2, 50, 1.2), 0.8, rev=0.4)
# 5. ящик: мешок риса, банки
put(FX, wt(22.755), rustle(0.5) * 1.5, 0.9)
put(FX, wt(22.755), thump(0.3, 90, 0.5), 0.8)
put(FX, wt(23.127), metal(700, 0.8), 0.8, pan=-0.1, rev=0.2)
put(FX, wt(23.789), metal(820, 0.8), 0.8, pan=0.2, rev=0.2)
put(FX, wt(24.4), thump(0.8, 45, 1.0), 0.7)
# 6. лестница: шаги вверх под тяжестью ящика, дыхание
t0 = c[5]
while t0 < c[6]: put(FX, t0, step(1.2), 0.8, rev=0.5); t0 += 0.36
put(FX, c[5] + 0.3, breath(1.2), 0.6)
# 7. третий этаж: шаги, дверь со скрипом приоткрывается и тихо закрывается, лампа гудит
d = c[7] - c[6]
put(FX, c[6], hum(d, 120), 0.1)
t0 = c[6]
while t0 < wt(30.6): put(FX, t0, step(1.0), 0.75, rev=0.4); t0 += 0.33
put(FX, wt(29.2), creak(1.5), 0.8, pan=-0.4, rev=0.4)
put(FX, wt(32.0), creak(0.6, 340), 0.5, pan=-0.4)
put(FX, wt(32.5), click(1800, 0.08), 1.0, pan=-0.4, rev=0.4); put(FX, wt(32.5), thump(0.4, 70, 0.6), 0.6)
put(FX, wt(30.6), breath(1.4), 0.7)
# 8. своя дверь: хлопок, засов, цепочка
put(FX, wt(36.8), slam(), 0.9, rev=0.5)
put(FX, wt(37.0), bolt(), 1.0)
for k in range(4): put(FX, wt(37.25) + k * 0.07, metal(2600, 0.15) * 0.3, 0.6)
# 9. кухня: газ, кастрюля закипает (булькает и шипит до выключения)
put(FX, c[8] + 0.05, gas_ignite(), 0.9)
tb, te = c[8] + 0.4, wt(52.2)
put(FX, tb, bubbles(te - tb) * fade(int(SR * (te - tb)), 1.0, 0.4), 0.55)
put(FX, tb, sizzle(te - tb), 0.8)
put(FX, tb, bp(noise(int(SR * (te - tb))), 150, 600) * 0.15 * fade(int(SR * (te - tb)), 1, 0.4), 1)  # пламя
# 10. разрез дома: запах ползёт по вентиляции, соседи просыпаются, шёпот
d = c[10] - c[9]
put(FX, c[9], whoosh(d, 150, 1200) * 1.2, 0.6, rev=0.5)
put(FX, wt(42.0), murmur(c[10] - wt(42.0), 10), 0.6, rev=0.5)
for k in range(4): put(FX, wt(41.5 + k * 0.8), breath(0.5) * 2, 0.4, pan=(k % 2) - 0.5)  # принюхиваются
# 11. телефон: вибрация, сообщения, печатают
put(FX, c[10] + 0.02, buzz(0.5), 0.8); put(FX, c[10] + 0.7, buzz(0.5), 0.8)
for k, at in enumerate([46.1, 46.8, 48.0]): put(FX, wt(at), ping(1500 if k < 2 else 1100), 0.7 if k < 2 else 0.9)
t0 = wt(49.8)
while t0 < c[11]: put(FX, t0, click(5000 + rng.random() * 2000, 0.03), 0.35, pan=rng.random() - 0.5); t0 += 0.07 + rng.random() * 0.12
# 12. плиту выключили: щелчок ручки, газ стих
put(FX, wt(51.9), click(2600, 0.1), 1.1); put(FX, wt(51.95), whoosh(0.5, 300, 1500) * 0.6, 0.5)
put(FX, wt(53.0), thump(1.5, 40, 1.3), 0.9, rev=0.6)
# 13. лестница: толпа поднимается, шагов всё больше, гул голосов, эхо
t0 = c[12]; k = 0
while t0 < c[14]:
    dens = 1 + 4 * min(1, (t0 - c[12]) / max(0.1, c[13] - c[12]))
    for j in range(int(dens)): put(FX, t0 + rng.random() * 0.25, step(0.8 + rng.random() * 0.5), 0.25 + 0.1 * dens, pan=rng.random() - 0.5, rev=0.6)
    t0 += 0.32
put(FX, c[12], murmur(c[13] - c[12] + 0.3, 12), 0.7, rev=0.6)
# 14. глазок: тяжёлое дыхание за дверью, три удара
put(FX, c[13], breath(1.5) * 1.5, 0.7); put(FX, c[13] + 1.5, breath(1.5) * 1.5, 0.6)
for at in [58.05, 58.4, 58.75]: put(FX, wt(at), knock(), 1.6, rev=0.5)
put(FX, word("Откройте") + 0.75, knock(), 1.8, rev=0.6); put(FX, word("Откройте") + 1.05, knock(), 1.8, rev=0.6)
# 15. финал: удар, глитч
put(FX, c[14], thump(2.5, 38, 1.8), 1.0, rev=0.8)
put(FX, c[14], bp(noise(int(SR * 0.4)), 1000, 8000) * env(int(SR * 0.4), 0.001, 0.08), 0.6)
# склейки: короткий вжух
for i in range(1, 14): put(FX, c[i] - 0.3, whoosh(0.45, 600, 4000), 0.18)

# ---------------- музыка (своя, синтез) ----------------
t = tt(N)
def saw(f, n, det=0.0):
    ph = np.cumsum(np.full(n, f * (1 + det))) / SR
    return 2 * (ph % 1) - 1
def pad(notes, start, end, g=0.25):
    n = int((end - start) * SR)
    if n <= 0: return
    s = np.zeros(n)
    for f in notes:
        for det in (-0.004, 0.0, 0.005): s += saw(f, n, det)
    s = lp(s, 700 + 300 * np.sin(start)) / (len(notes) * 3)
    lfo = 0.75 + 0.25 * np.sin(2 * np.pi * 0.17 * tt(n))
    put(MUS, start, s * lfo * fade(n, 1.6, 1.6), g, rev=0.25)
NOTE = lambda m: 440 * 2 ** ((m - 69) / 12)
# гул на всю длину, растёт к развязке
drone = np.sin(2 * np.pi * NOTE(26) * t) * 0.6 + np.sin(2 * np.pi * NOTE(26) * 1.003 * t) * 0.5 + lp(noise(N), 90) * 0.8
grow = np.interp(t, [0, c[9], c[12], c[14] - 0.2, c[14], DUR], [0.45, 0.6, 0.85, 1.25, 0.15, 0.0])
MUS[:, 0] += drone * 0.11 * grow; MUS[:, 1] += drone * 0.11 * grow
# диссонансные аккорды (ре минор с малой секундой), меняются по сценам
CH = [[50, 53, 57, 51], [46, 50, 53, 52], [43, 46, 50, 51], [45, 49, 52, 46], [50, 53, 56, 51], [44, 47, 50, 51]]
starts = [0, c[3], c[6], c[9], c[12], c[13]]
ends = starts[1:] + [c[14]]
for k, (a, b) in enumerate(zip(starts, ends)): pad([NOTE(m) for m in CH[k]], max(0, a - 0.8), b + 0.8, 0.16 + 0.03 * k)
# колокольчики (как музыкальная шкатулка, расстроенная) — в начале и в тихих местах
bells = [74, 77, 76, 72, 74, 70, 69, 74]
for k in range(16):
    at = 0.6 + k * 1.15
    if at > c[3]: break
    m = bells[k % len(bells)]; n = int(SR * 2.0); tb = tt(n); f = NOTE(m) * (1 + 0.004 * np.sin(2 * np.pi * 5 * tb))
    put(MUS, at, (np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.3 * np.sin(2 * np.pi * np.cumsum(f * 2.01) / SR)) * env(n, 0.003, 0.5), 0.07, pan=0.3 * np.sin(k), rev=0.6)
# пульс: тихие удары от находки, сердце после «ошибки», быстрее на шагах
for k in range(int((c[9] - c[4]) / 1.5)): put(MUS, c[4] + k * 1.5, thump(0.6, 42, 0.8), 0.35)
heartbeat(c[9] + 0.5, c[12], 64, 84, 0.45)
heartbeat(c[12], c[14] - 0.3, 96, 128, 0.55)
# нарастание к стуку: шум + вой вверх
n = int(SR * (c[13] - c[12] + 0.2)); tr = tt(n)
riser = bp(noise(n), 800, 6000) * (tr / tr[-1]) ** 2 * 0.25 + np.sin(2 * np.pi * np.cumsum(220 + 500 * (tr / tr[-1]) ** 2) / SR) * (tr / tr[-1]) ** 2 * 0.08
put(MUS, c[12], riser, 1.0, rev=0.3)
# скрипичный визг (высокие расстроенные синусы) в сцене с соседкой и на финале
for at, d in [(wt(29.3), 3.0), (c[14], 3.0)]:
    n = int(SR * d); tb = tt(n)
    s = sum(np.sin(2 * np.pi * np.cumsum(NOTE(m) * (1 + 0.006 * np.sin(2 * np.pi * 6.5 * tb))) / SR) for m in (86, 87))
    put(MUS, at, s * fade(n, 0.8, 1.2) * 0.04, 1.0, rev=0.5)

# ---------------- реверберация ----------------
irn = int(SR * 2.4); ir = noise(irn) * np.exp(-tt(irn) / 0.55); ir = lp(ir, 3500); ir /= np.sqrt((ir ** 2).sum())
L = len(REV) + irn; nf = 1 << int(np.ceil(np.log2(L)))
wet = np.fft.irfft(np.fft.rfft(REV, nf) * np.fft.rfft(ir, nf), nf)[:N] * 0.35
irR = np.roll(ir, 37); wetR = np.fft.irfft(np.fft.rfft(REV, nf) * np.fft.rfft(irR, nf), nf)[:N] * 0.35

# ---------------- приглушение под голосом ----------------
pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", "public/foodshort_ru_george/voice.mp3", "-f", "s16le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
v = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768
v = np.pad(v, (0, max(0, N - len(v))))[:N]
ve = lp(np.abs(v), 6); ve /= ve.max()
duck = 1 - 0.55 * np.clip(ve * 5, 0, 1)
duck = lp(duck, 3)
bed = MUS * 0.9 + FX
bed[:, 0] += wet; bed[:, 1] += wetR
bed[:, 0] *= duck; bed[:, 1] *= duck
bed *= fade(N, 0.4, 1.5)[:, None]
bed /= np.max(np.abs(bed)) / 0.6
out = (bed * 32767).astype(np.int16)
with wave.open("public/foodshort_ru/bed.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(out.tobytes())
print("ok", round(DUR, 2))

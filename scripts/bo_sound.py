# Звук для «Alone in a city after a total blackout»: одна непрерывная музыка на все 8 частей (режется по частям, чтобы склейка
# была бесшовной) + звуки событий по словам озвучки. python3 scripts/mc_sound.py → public/bo/p<N>/sfx.wav
import os, sys, json
sys.path.insert(0, os.path.dirname(__file__))
import sfx
from sfx import SR, t, norm, filt, env, noise, click, thud, boom, whoosh, ping, tinkle, shimmer, crunch, chirp, bark, squeal, rng, scrub, engine, powerdown
import numpy as np

FPS, LEAD, WIPE = 30, 9, 18
def voice(i):
    s = open(f"src/bo/voices/p{i}.ts", encoding="utf8").read()
    return json.loads(s[s.index("{"): s.rindex("}") + 1])
V = {i: voice(i) for i in range(1, 11) if os.path.exists(f"src/bo/voices/p{i}.ts")}
LAST = 10
FR = {i: round((V[i]["dur"] + 0.3) * FPS) + LEAD + WIPE for i in V}
DUR = {i: FR[i] / FPS for i in V}
TOTAL = sum(DUR.values())

# ---------- музыка ----------
def pluck(f, d=0.5):
    x = t(int(d * SR)); return (np.sin(2 * np.pi * f * x) + 0.35 * np.sin(4 * np.pi * f * x) + 0.12 * np.sin(6 * np.pi * f * x)) * np.exp(-x * 7)
def hz(m): return 440 * 2 ** ((m - 69) / 12)
N = int((TOTAL + 2) * SR); music = np.zeros(N)
def put(sig, at, g):
    i = int(at * SR); sig = sig[: max(0, N - i)]; music[i:i + len(sig)] += sig * g
BPM = 80; beat = 60 / BPM
DAY = [[62, 66, 69, 74], [59, 62, 66, 71], [55, 59, 62, 67], [57, 61, 64, 69]]
NIGHT = [[57, 60, 64, 69], [53, 57, 60, 65], [50, 53, 57, 62], [52, 56, 59, 64]]
start5 = -1.0; end5 = sum(DUR.get(i, 60) for i in range(1, 10))  # всё в миноре, светлеет только финал (часть 10)
b = 0; tt = 0.0
while tt < TOTAL + 1:
    night = start5 - 0.5 <= tt < end5 - 0.5
    ch = (NIGHT if night else DAY)[(b // 8) % 4]
    arp = [0, 1, 2, 3, 2, 1, 2, 3]
    put(pluck(hz(ch[arp[b % 8]] + 12), 0.45), tt, 0.16 if not night else 0.12)
    if b % 4 == 0: put(pluck(hz(ch[0] - 24), 1.2) * 1.2, tt, 0.35); put(thud(60, 0.3), tt, 0.25)
    if b % 4 == 2: put(thud(60, 0.3), tt, 0.18)
    if b % 2 == 1: put(filt(rng.standard_normal(int(0.05 * SR)), 6000, None) * env(int(0.05 * SR), 0.002, 0.04), tt, 0.05)
    b += 1; tt += beat / 2
music = filt(music, None, 5000)

# ---------- звуки событий ----------
def mx(*a):
    n = max(len(x) for x in a); o = np.zeros(n)
    for x in a: o[:len(x)] += x
    return o
def pop(): return norm(mx(thud(220, 0.12), click(1800, 0.03, 300) * 0.4))
def punch(): return norm(mx(thud(120, 0.18), filt(rng.standard_normal(int(0.08 * SR)), 300, 2000) * env(int(0.08 * SR), 0.002, 0.06) * 0.6))
def splash(d=1.0): return norm(filt(rng.standard_normal(int(d * SR)), 300, 4000) * env(int(d * SR), 0.02, d * 0.8))
def fire(d=1.5):
    n = int(d * SR); x = filt(rng.standard_normal(n), 200, 3000) * 0.3
    for _ in range(int(d * 25)):
        a = int(rng.uniform(0, d - 0.05) * SR); x[a:a + 400] += rng.standard_normal(400) * np.exp(-np.arange(400) / 60)
    return norm(x) * env(n, 0.1, 0.4)
def groan(d=1.2):
    x = t(int(d * SR)); f0 = 110 * (1 - 0.2 * x / d) * (1 + 0.05 * np.sin(2 * np.pi * 5 * x))
    v = np.sign(np.sin(2 * np.pi * np.cumsum(f0) / SR)) * 0.5 + rng.standard_normal(len(x)) * 0.2
    return norm(filt(v, 100, 900)) * env(len(x), 0.15, 0.4)
def ring(d=1.5):
    x = t(int(d * SR)); return norm((np.sin(2 * np.pi * 2200 * x) + np.sin(2 * np.pi * 2900 * x)) * (np.sin(2 * np.pi * 18 * x) > 0)) * env(len(x), 0.01, 0.1)
def knock(): return norm(mx(thud(90, 0.2), click(900, 0.04, 120)))
def sparkle(): return shimmer(0.8, 900, 3000)
def boing():
    x = t(int(0.4 * SR)); f = 300 + 500 * x / 0.4; return norm(np.sin(2 * np.pi * np.cumsum(f) / SR)) * env(len(x), 0.005, 0.2)
def cheer(d=1.5): return norm(filt(rng.standard_normal(int(d * SR)), 500, 3000) * (0.6 + 0.4 * np.sin(2 * np.pi * 3 * t(int(d * SR))))) * env(int(d * SR), 0.2, 0.5)
def twang(): x = t(int(0.3 * SR)); return norm(np.sin(2 * np.pi * 180 * x) * np.exp(-x * 14) + filt(rng.standard_normal(len(x)), 1000, 4000) * np.exp(-x * 40))
def chomp(): return norm(mx(crunch() * 0.7, thud(160, 0.1)))
def whisper(d=1.6): return norm(filt(rng.standard_normal(int(d * SR)), 2000, 7000) * (0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 3.3 * t(int(d * SR)))))) * env(int(d * SR), 0.2, 0.5)
def heart():
    o = np.zeros(int(2.2 * SR))
    for k in range(6):
        for dd, g in ((0, 1.0), (0.16, 0.7)):
            a = int((k * 0.36 + dd) * SR); s_ = thud(55, 0.2) * g; o[a:a + len(s_)] += s_[: len(o) - a]
    return norm(o)
def buzz(d=1.0):
    x = t(int(d * SR)); return norm(np.sign(np.sin(2 * np.pi * 150 * x)) * (np.sin(2 * np.pi * 3 * x) > 0)) * 0.6
def horn(d=1.0):
    x = t(int(d * SR)); return norm(filt(np.sign(np.sin(2 * np.pi * 400 * x)) + np.sign(np.sin(2 * np.pi * 500 * x)), 200, 3000)) * env(len(x), 0.02, 0.1)
def squawk():
    x = t(int(0.5 * SR)); f = 1400 - 800 * x
    return norm(filt(np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) + rng.standard_normal(len(x)) * 0.4, 600, 4000)) * env(len(x), 0.01, 0.3)
SND = dict(powerdown=lambda: powerdown(1.4), buzz=buzz, horn=horn, squawk=squawk, whisper=whisper, heart=heart, scrub=lambda: scrub(1.2), engine=lambda: engine(1.6),thud=lambda: thud(90, 0.25), pop=pop, punch=punch, splash=splash, fire=fire, groan=groan, ring=ring, knock=knock, sparkle=sparkle, boing=boing, cheer=cheer, twang=twang,
           chomp=chomp, whoosh=lambda: whoosh(0.5, 400, 3500), boom=lambda: boom(1.4), crunch=crunch, chirp=chirp, bark=bark, squeal=lambda: squeal(0.6),
           drone=lambda: norm(filt(rng.standard_normal(int(3 * SR)), 60, 300)) * env(int(3 * SR), 1, 1))

def at(i, w, n=1):
    if w == "": return 0.0
    xs = [x for x in V[i]["words"] if x["w"].lower() == w.lower()]
    return xs[n - 1]["t"] + LEAD / FPS

EV = json.load(open("scripts/bo_events.json", encoding="utf8"))
off = 0.0
for i in sorted(V):
    n = int(DUR[i] * SR); L = np.zeros(n); R = np.zeros(n)
    def add(sig, a, g=1.0, pan=0.0):
        k = int(a * SR)
        if k >= n or k < 0: return
        s = sig[: n - k]; L[k:k + len(s)] += s * g * np.sqrt((1 - pan) / 2); R[k:k + len(s)] += s * g * np.sqrt((1 + pan) / 2)
    m = music[int(off * SR): int(off * SR) + n]; L[:len(m)] += m * 0.5; R[:len(m)] += m * 0.5
    if i > 1:
        add(shimmer(0.7, 1200, 2600), 0.0, 0.18)
    if i < LAST:
        e = DUR[i] - WIPE / FPS
        add(whoosh(0.6, 400, 4000), e - 0.05, 0.25); add(shimmer(0.8, 900, 3000), e, 0.18)
    for ev in EV.get(str(i), []):
        w, nn, kind, g = ev[0], ev[1], ev[2], ev[3]; dt = ev[4] if len(ev) > 4 else 0
        add(SND[kind](), at(i, w, nn) + dt, g)
    mix = np.stack([L, R], 1); mix = np.tanh(mix * 1.2) / np.tanh(1.2)
    import wave
    os.makedirs(f"public/bo/p{i}", exist_ok=True)
    with wave.open(f"public/bo/p{i}/sfx.wav", "wb") as wv:
        wv.setnchannels(2); wv.setsampwidth(2); wv.setframerate(SR); wv.writeframes((np.clip(mix, -1, 1) * 32767).astype("<i2").tobytes())
    off += DUR[i]
    print("ok part", i, round(DUR[i], 2))

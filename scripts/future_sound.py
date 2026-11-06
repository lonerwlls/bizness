# Звук ролика «Phone predicted your future»: будильник, вибро и уведомления телефона, тиканье отсчёта, улица и
# шаги, жвачка, гроза в фильме, праздник, класс и мел, коридор + весёлая поп-музыка (тише голоса).
import os, sys, json, re, subprocess, wave as wv
sys.path.insert(0, os.path.dirname(__file__))
import numpy as np
import sfx
from sfx import SR, t, norm, filt, env, noise, click, thud, whoosh, ping, tinkle, shimmer, pad, chirp, breath, riser, creak, chime, crickets, hum, laugh

ID = "future"
src = open(f"src/videos/{ID}/voice.ts").read()
V = json.loads(src[src.index("{"):src.rindex("}") + 1])
DUR = V["dur"] + 1.3
sfx.N = int(SR * DUR); sfx.L = np.zeros(sfx.N); sfx.R = np.zeros(sfx.N)
W = V["words"]
def nm(w): return re.sub(r"[^a-z0-9-]", "", w.lower())
def wt(w, n=1):
    k = 0
    for x in W:
        if nm(x["w"]) == nm(w):
            k += 1
            if k == n: return x["t"]
    raise KeyError(w)
rng_ = np.random.default_rng(5)
fx = []
def A(s, at, g=1.0, p=0.0): fx.append((s, at, g, p))
def fit(a, b): n = max(len(a), len(b)); x = np.zeros(n); x[:len(a)] += a; x[:len(b)] += b; return x
def bell(f=330, d=3.0):
    x = t(int(d * SR)); s = 0
    for k, a in ((1, 1), (2.0, 0.5), (2.76, 0.35), (5.4, 0.15)): s = s + a * np.sin(2 * np.pi * f * k * x) * np.exp(-x * (1.0 + k * 0.4))
    return norm(s)
def rustle(d=0.5): x = t(int(d * SR)); return norm(filt(noise(d), 2000, 9000) * (0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 9 * x))) * np.sin(np.pi * x / d))
def tear(d=0.7): x = t(int(d * SR)); return norm(filt(noise(d), 1200, 7000) * (0.3 + 0.7 * (np.sin(2 * np.pi * 40 * x) > 0)) * np.sin(np.pi * x / d) ** 0.5)
def crunch(): d = 0.18; x = t(int(d * SR)); return norm(filt(noise(d), 400, 5000) * np.exp(-x * 18))
def tick(f=2200): return fit(click(f, 0.04, 160) * 0.8, click(f * 2, 0.02, 300) * 0.3)


def bell(d=1.6):
    x = t(int(d * SR)); s = np.sin(2 * np.pi * 1200 * x) * (np.sin(2 * np.pi * 22 * x) > 0) + 0.4 * np.sin(2 * np.pi * 1800 * x) * (np.sin(2 * np.pi * 22 * x) > 0)
    return norm(s * env(len(x), 0.01, 0.15))
def murmur(d):
    s = np.zeros(int(d * SR)); x = t(len(s))
    for k in range(8):
        f0 = rng_.uniform(140, 300); v = np.sin(2 * np.pi * f0 * x + 2 * np.sin(2 * np.pi * rng_.uniform(2, 5) * x)) * (0.5 + 0.5 * np.sin(2 * np.pi * rng_.uniform(0.6, 1.8) * x + k)) ** 2
        s += filt(v, 200, 1800)
    return norm(s) * env(len(s), 0.4, 0.5)
def ooh(d=0.9):
    s = np.zeros(int(d * SR)); x = t(len(s))
    for k in range(6): f = rng_.uniform(220, 420) * (1 + 0.15 * x / d); s += np.sin(2 * np.pi * np.cumsum(f) / SR + k)
    return norm(filt(s, 150, 2000) * np.sin(np.pi * x / d))
def buzz(d=0.35): x = t(int(d * SR)); return norm(filt(np.sign(np.sin(2 * np.pi * 150 * x)), 80, 600) * env(len(x), 0.01, 0.05))
def notif(f=1760): return norm(fit(ping(f, 0.25, 12), 0.6 * ping(f * 1.5, 0.2, 14)))
def squeak(d=0.25): x = t(int(d * SR)); f = 2400 + 500 * np.sin(2 * np.pi * 12 * x); return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * x / d))
def steps(d, rate, f=220):
    s = np.zeros(int(d * SR))
    for k in np.arange(0, d - 0.1, 1 / rate):
        p = fit(thud(f, 0.06) * 0.6, filt(noise(0.04), 2000, 7000) * env(int(0.04 * SR), 0.002, 0.03) * 0.4); i = int(k * SR); s[i:i + len(p)] += p[: len(s) - i]
    return norm(s)
def alarm(d):
    x = t(int(d * SR)); s = (np.sin(2 * np.pi * 2600 * x) + 0.5 * np.sin(2 * np.pi * 3900 * x)) * (np.sin(2 * np.pi * 16 * x) > 0)
    return norm(s * env(len(x), 0.01, 0.1))
def squelch(): d = 0.4; x = t(int(d * SR)); f = 300 - 200 * x / d; return norm(filt(np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.5 * noise(d), 100, 1500) * env(len(x), 0.01, 0.3))
def thunder(d=2.5): x = t(int(d * SR)); return norm(filt(noise(d), 30, 300) * np.exp(-x * 1.5) * (0.6 + 0.4 * np.sin(2 * np.pi * 3 * x)))
def drone(d): x = t(int(d * SR)); return norm((np.sin(2 * np.pi * 73 * x) + 0.5 * np.sin(2 * np.pi * 110 * x) + 0.3 * np.sin(2 * np.pi * 87 * x)) * env(len(x), 0.6, 0.6))
def horn(d=0.6): x = t(int(d * SR)); f = 520 + 120 * np.minimum(1, x / 0.08); return norm(filt(np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)), 200, 3000) * env(len(x), 0.01, 0.15))
def birds(d):
    s = np.zeros(int(d * SR))
    for k in np.arange(0.3, d - 0.3, 0.9):
        c = chirp(); i = int((k + rng_.uniform(0, 0.4)) * SR); s[i:i + len(c)] += c[: len(s) - i]
    return norm(s)
for n, (bz, a, b) in enumerate(((wt("buzzes", 1), wt("in", 1), wt("breakfast", 2)), (wt("buzzes", 2), wt("in", 3), wt("breakfast", 3)))):
    for k in range(3): A(buzz(), bz + k * 0.45, 0.16)
    A(alarm(a - bz), bz + 0.05, 0.09)
    for k in range(10): A(tick(), a + (b - a) * k / 10, 0.12)
A(thud(140, 0.15), wt("breakfast", 2) + 0.05, 0.12)
A(notif(), wt("your", 3) + 0.05, 0.1); A(ping(1568, 0.6, 5), wt("predicted") + 0.1, 0.1)
A(shimmer(1.6, 600, 2200), wt("weirder") - 0.3, 0.12)
A(birds(7.5), wt("rule", 1), 0.06, 0.3)
A(steps(4.2, 2.0), wt("rule", 1) + 0.1, 0.1)
A(notif(), wt("don") - 0.2, 0.1)
A(whoosh(0.3, 400, 2500), wt("step", 2), 0.1); A(squelch(), wt("gum") - 0.25, 0.18)
A(drone(5.0), wt("rule", 2), 0.1); A(thunder(), wt("movie") + 0.1, 0.16)
A(notif(), wt("the", 2) - 0.2, 0.1); A(breath(0.6, 1200), wt("did") + 0.5, 0.1)
A(notif(), wt("it", 5) - 0.2, 0.1); A(horn(), wt("you", 3) - 0.1, 0.1); A(laugh(5, 420), wt("you", 3) + 0.2, 0.1, 0.3); A(ooh(0.9), wt("surprised") + 0.2, 0.14)
A(murmur(10.5), wt("rule", 3), 0.1)
A(squeak(0.3), wt("pop") + 0.05, 0.1); A(squeak(0.25), wt("pop") + 0.45, 0.08)
A(notif(), wt("question") - 0.2, 0.1)
A(whoosh(0.35, 500, 3500), wt("raise") - 0.1, 0.12); A(ooh(1.2), wt("stares") - 0.2, 0.2)
A(murmur(9.0), wt("and", 2), 0.09)
A(notif(), wt("one", 2) - 0.15, 0.1)
for w_, n_ in (("three", 2), ("two", 2), ("one", 3)): A(tick(1800), wt(w_, n_), 0.16)
A(steps(7.0, 2.0, 260), wt("rule", 4) + 0.2, 0.07, -0.3)
A(shimmer(1.4, 900, 3000), wt("hi", 2) + 0.05, 0.12)
A(whoosh(0.4, 300, 3000), wt("yell") - 0.15, 0.14); A(thud(150, 0.15), wt("first") + 0.3, 0.12); A(ping(1047, 0.4, 8), wt("first") + 0.35, 0.08)
for s_, at, g, p in fx: sfx.add(s_ * g, at, 1.0, p)
SFX = np.stack([sfx.L.copy(), sfx.R.copy()], 1)
# ---- music: upbeat pop groove in C (kick/snare/hat + plucked chords + hook) ----
sfx.L[:] = 0; sfx.R[:] = 0
B = 60 / 118
def pl(m, d=0.3, dec=10): return ping(440 * 2 ** ((m - 69) / 12), d, dec)
def bassn(m, d=0.35): x = t(int(d * SR)); return np.sin(2 * np.pi * 440 * 2 ** ((m - 69) / 12) * x) * np.exp(-x * 6)
def snare(): return norm(filt(noise(0.15), 1500, 7000) * env(int(0.15 * SR), 0.002, 0.13))
prog = [(48, [64, 67, 72]), (45, [64, 69, 72]), (41, [65, 69, 72]), (43, [62, 67, 71])]
hook = [72, None, 74, 76, None, 79, 76, None, 74, None, 72, 74, None, 76, None, None]
end = DUR - 0.4
bt, i = 0.2, 0
while bt < end:
    root, ch = prog[(i // 4) % 4]
    sfx.add(thud(60, 0.12), bt, 0.22) if i % 2 == 0 else sfx.add(snare(), bt, 0.08)
    sfx.add(click(9000, 0.02, 300), bt + B / 2, 0.04, 0.3)
    sfx.add(bassn(root - 12), bt, 0.22); sfx.add(bassn(root - 12, 0.2), bt + B / 2, 0.12)
    if i % 2 == 1:
        for m in ch: sfx.add(pl(m, 0.25, 12), bt, 0.04, 0.2)
    m = hook[(i * 2) % 16]
    if m and (i // 16) % 2 == 0: sfx.add(pl(m), bt, 0.08, -0.2)
    m2 = hook[(i * 2 + 1) % 16]
    if m2 and (i // 16) % 2 == 0: sfx.add(pl(m2), bt + B / 2, 0.07, -0.2)
    bt += B; i += 1
MUS = np.stack([sfx.L, sfx.R], 1)
wavp = "/tmp/claude-0/sp/voice_future.wav"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"public/{ID}/voice.mp3", "-ac", "1", "-ar", str(SR), wavp], check=True)
with wv.open(wavp) as w: vv = np.frombuffer(w.readframes(w.getnframes()), "<i2").astype(float) / 32768
vv = np.pad(vv, (0, max(0, sfx.N - len(vv))))[: sfx.N]
hop = int(0.05 * SR); rms = np.sqrt(np.convolve(vv ** 2, np.ones(hop) / hop, "same"))
act = np.convolve(np.clip(rms / 0.04, 0, 1), np.ones(int(0.25 * SR)) / int(0.25 * SR), "same")
MUS *= (1 - 0.5 * act)[:, None]
mix = MUS * 0.6 + SFX * 0.9
mix = np.tanh(mix * 1.2) / 1.2
peak = np.max(np.abs(mix)); mix *= 0.28 / (peak + 1e-9)  # quiet under the voice (user rule)
with wv.open(f"public/{ID}/sound.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype("<i2").tobytes())
print("ok", DUR, "peak", peak)

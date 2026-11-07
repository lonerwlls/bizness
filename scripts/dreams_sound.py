# Звук ролика «Dreams were memories»: сверчки ночью, «звон» сна, птицы и шаги утром, горшок, ключ, замок и скрип
# двери, ступени, щелчки кодового замка, ручка, бумага, прибой у острова + музыка (тише голоса).
import os, sys, json, re, subprocess, wave as wv
sys.path.insert(0, os.path.dirname(__file__))
import numpy as np
import sfx
from sfx import SR, t, norm, filt, env, noise, click, thud, whoosh, ping, tinkle, shimmer, pad, chirp, breath, riser, creak, chime, crickets, hum, laugh

ID = "dreams"
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
def creak(d=0.6): x = t(int(d * SR)); f = 180 + 120 * np.sin(2 * np.pi * 2.5 * x); return norm(filt(np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * (0.5 + 0.5 * np.sin(2 * np.pi * 37 * x)), 300, 2500) * np.sin(np.pi * x / d))
def latch(): return norm(fit(click(1800, 0.03, 200), 0.6 * thud(220, 0.06)))
def slam(): return norm(fit(thud(90, 0.2), 0.5 * click(600, 0.05, 90)))
def surf(d): x = t(int(d * SR)); return norm(filt(noise(d), 200, 3000) * (0.45 + 0.55 * np.sin(2 * np.pi * 0.18 * x) ** 2) * env(len(x), 0.6, 0.6))
def gull():
    d = 0.35; x = t(int(d * SR)); f = 1800 - 900 * x / d
    return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * x / d) * (0.6 + 0.4 * np.sin(2 * np.pi * 30 * x)))
def wind(d, lo=150, hi=1200): x = t(int(d * SR)); return norm(filt(noise(d), lo, hi) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.4 * x + 1)) * env(len(x), 0.3, 0.4))
def hum(d): x = t(int(d * SR)); return norm((np.sin(2 * np.pi * 60 * x) + 0.4 * np.sin(2 * np.pi * 120 * x)) * env(len(x), 0.05, 0.2))
def bounce(): return norm(fit(thud(90, 0.12), 0.4 * click(400, 0.05, 80)))
def sizzle(d): x = t(int(d * SR)); return norm(filt(noise(d), 3000, 9000) * (0.6 + 0.4 * np.sin(2 * np.pi * 7 * x)) * env(len(x), 0.1, 0.2))
def birds(d):
    s = np.zeros(int(d * SR))
    for k in np.arange(0.3, d - 0.3, 0.9):
        c = chirp(); i = int((k + rng_.uniform(0, 0.4)) * SR); s[i:i + len(c)] += c[: len(s) - i]
    return norm(s)
def jingle(): return norm(fit(tinkle(), 0.5 * ping(2600, 0.2, 18)))
def scrape(d=0.35): x = t(int(d * SR)); return norm(filt(noise(d), 600, 3000) * np.sin(np.pi * x / d))
def scribble(d=1.0): x = t(int(d * SR)); return norm(filt(noise(d), 1500, 6000) * (0.3 + 0.7 * np.abs(np.sin(2 * np.pi * 6 * x))) * env(len(x), 0.05, 0.1))
def dial(): return norm(click(2400, 0.03, 220))
for w_, n_ in (("dream", 1), ("dream", 2), ("tonight", 1)): A(shimmer(3.0, 400, 1800), wt(w_, n_) - 0.2, 0.12)
A(crickets(1.6), 0.0, 0.05); A(crickets(2.4), wt("that"), 0.05); A(crickets(2.2), wt("every", 4), 0.05)
A(tinkle(), wt("key", 1) + 0.1, 0.06)
A(birds(4.0), wt("then"), 0.06, 0.3); A(steps(2.0, 2.0), wt("then") - 0.1, 0.07)
A(scrape(), wt("lift") + 0.1, 0.1); A(jingle(), wt("key", 2) + 0.1, 0.1)
A(steps(1.5, 2.0), wt("and", 1) + 0.3, 0.06)
A(click(1500, 0.05, 150), wt("key", 3) + 0.1, 0.12); A(latch(), wt("opens") + 0.1, 0.1); A(creak(0.9), wt("opens") + 0.2, 0.08)
A(steps(1.6, 2.0, 180), wt("inside", 1) + 0.1, 0.06)
for k in range(8): A(creak(0.25), wt("but") + 0.2 + k * 0.22, 0.04)
for w_, n_ in (("seven", 1), ("two", 2), ("four", 1)): A(dial(), wt(w_, n_), 0.12)
A(scribble(1.0), wt("write", 2) + 0.2, 0.1)
A(steps(1.8, 2.0, 180), wt("rule", 3), 0.06)
for w_, n_ in (("seven", 2), ("two", 3), ("four", 2)): A(dial(), wt(w_, n_), 0.12)
A(latch(), wt("click"), 0.16); A(creak(0.8), wt("click") + 0.3, 0.08)
A(rustle(0.5), wt("inside", 2) + 0.1, 0.08); A(rustle(0.4), wt("back") - 0.1, 0.08)
A(shimmer(1.6, 600, 2200), wt("grandpa") + 0.1, 0.1)
A(rustle(0.7), wt("map") - 0.2, 0.1)
A(surf(2.6), wt("tonight") - 0.1, 0.1); A(gull(), wt("island") - 0.2, 0.06)
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
wavp = "/tmp/claude-0/sp/voice_dreams.wav"
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

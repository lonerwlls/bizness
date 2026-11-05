# Звук ролика «What if you swapped bodies every day»: будильник, хлопки смены тел, лаборатория, «бум» о косяк,
# тарелка и брокколи, лай собаки, зеркало, улица + своя весёлая музыка, тише под голосом.
import os, sys, json, re, subprocess, wave as wv
sys.path.insert(0, os.path.dirname(__file__))
import numpy as np
import sfx
from sfx import SR, t, norm, filt, env, noise, click, thud, whoosh, ping, tinkle, shimmer, pad, chirp, breath, riser, creak, chime, crickets, hum

ID = "swap"
src = open(f"src/videos/{ID}/voice.ts").read()
V = json.loads(src[src.index("{"):src.rindex("}") + 1])
DUR = V["dur"] + 1.2
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

def ring(d=1.3):
    x = t(int(d * SR)); s = np.sin(2 * np.pi * 2300 * x) * (np.sin(2 * np.pi * 28 * x) > 0) + 0.5 * np.sin(2 * np.pi * 3100 * x) * (np.sin(2 * np.pi * 28 * x) > 0)
    return norm(s * env(len(x), 0.01, 0.08))
def boing(d=0.6):
    x = t(int(d * SR)); f = 180 + 120 * np.sin(2 * np.pi * 9 * x) * np.exp(-x * 5)
    return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 5))
def pop():
    x = t(int(0.16 * SR)); f = 400 + 1200 * (x / 0.16)
    return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 18))
def woof(f0=420):
    d = 0.22; x = t(int(d * SR)); f = f0 * (1.2 - 0.5 * x / d)
    return norm((np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.6 * filt(noise(d), 300, 2000)) * np.sin(np.pi * x / d) ** 0.7)
def clink(): return norm(fit(ping(2600, 0.5, 9), 0.5 * ping(3900, 0.4, 12)))
def yuck(d=0.6): x = t(int(d * SR)); f = 300 - 120 * x / d; return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * (1 + 0.5 * np.sin(2 * np.pi * 18 * x)) * np.sin(np.pi * x / d))
A(ring(1.25), 0.02, 0.22)
A(breath(0.6, 1200), wt("eyes") - 0.2, 0.1)
A(ping(1568, 0.5, 6), wt("feet") + 0.05, 0.08); A(ping(1047, 0.5, 6), wt("short") + 0.05, 0.08)
for k in range(4): A(pop(), wt("every") + k * 0.55, 0.22, rng_.uniform(-0.5, 0.5))
A(shimmer(1.6, 600, 2200), wt("weirder") - 0.3, 0.12)
for k in range(4): A(creak(0.25, 300 + 40 * k), wt("rule", 1) + 0.3 + k * 0.6, 0.06)
A(hum(wt("whole") - wt("in", 2), 100) * 0.4, wt("in", 2), 0.06)
for k in range(5): A(filt(noise(0.25), 3000, 9000) * env(int(0.25 * SR), 0.05, 0.15), wt("rubber") + k * 0.4, 0.08)
A(ping(1319, 0.6, 5), wt("eleven") + 0.1, 0.1)
for a in np.arange(wt("whole"), wt("walk") + 0.45, 0.45): A(thud(160, 0.08), a, 0.12)
A(thud(70, 0.3), wt("walk") + 0.5, 0.35); A(boing(0.6), wt("walk") + 0.52, 0.22)
A(thud(70, 0.3), wt("twice") - 0.05, 0.35); A(boing(0.6), wt("twice") - 0.03, 0.22); A(tinkle(1.0, 10), wt("twice") + 0.1, 0.08)
A(clink(), wt("breakfast") + 0.1, 0.12); A(clink(), wt("today") + 0.4, 0.12)
A(yuck(0.6), wt("punishment") + 0.1, 0.18)
A(chirp(), wt("rule", 3) + 0.2, 0.07, 0.5); A(chirp(), wt("rule", 3) + 0.9, 0.06, -0.5)
for k in range(4): A(woof(420 + 30 * (k % 2)), wt("barks") + 0.05 + k * 0.4, 0.22, 0.3)
for k in range(3): A(woof(400), wt("to", 4) + 0.2 + k * 0.45, 0.16, 0.3)
A(filt(noise(0.6), 1500, 5000) * env(int(0.6 * SR), 0.1, 0.4), wt("dogs") + 0.3, 0.08)  # sniff
A(shimmer(2.2, 1800, 600), wt("after") - 0.1, 0.12)
for k in range(8): A(pop() * 0.5, wt("after") + 0.1 + k * 0.4, 0.06)
A(ping(1175, 0.8, 4), wt("hat") + 0.02, 0.12); A(ping(1568, 0.8, 4), wt("hat") + 0.12, 0.1)
for a in np.arange(wt("then"), wt("morning", 2) - 0.2, 0.42): A(thud(200, 0.06), a, 0.08)
A(chirp(), wt("smiles") + 0.2, 0.07)
A(ring(0.9), wt("seven", 2) + 0.02, 0.16)
A(pad(2.4, [60, 64, 67, 72], 1.0), wt("mind") - 0.3, 0.14)
for s_, at, g, p in fx: sfx.add(s_ * g, at, 1.0, p)
SFX = np.stack([sfx.L.copy(), sfx.R.copy()], 1)
# ---- music: bouncy pizzicato in F major; sparse and soft for the last rule; warm at the end ----
sfx.L[:] = 0; sfx.R[:] = 0
B = 60 / 112
def pl(m, d=0.35, dec=9): return ping(440 * 2 ** ((m - 69) / 12), d, dec)
def bassn(m, d=0.4): x = t(int(d * SR)); return np.sin(2 * np.pi * 440 * 2 ** ((m - 69) / 12) * x) * np.exp(-x * 5)
prog = [(53, [65, 69, 72]), (48, [64, 67, 72]), (50, [62, 65, 69]), (46, [62, 65, 70])]
mel = [77, 81, 84, 81, 79, 76, 79, 72, 74, 77, 81, 79, 77, 74, 72, None]
soft0, soft1, end = wt("and", 3) - 0.2, wt("then") - 0.2, DUR - 0.4
bt, i = 0.3, 0
while bt < end:
    root, ch = prog[(i // 4) % 4]
    soft = soft0 <= bt < soft1
    if soft:
        if i % 4 == 0: sfx.add(pad(4 * B, [c - 12 for c in ch], 0.8), bt, 0.08)
    else:
        sfx.add(bassn(root - 12 if i % 2 == 0 else root - 5), bt, 0.25)
        if i % 2 == 1:
            for m in ch: sfx.add(pl(m, 0.25, 12), bt, 0.05, 0.2)
        m = mel[(i * 2) % 16]
        if m: sfx.add(pl(m), bt, 0.1, -0.15)
        m2 = mel[(i * 2 + 1) % 16]
        if m2 and (i // 8) % 2: sfx.add(pl(m2), bt + B / 2, 0.08, -0.15)
    bt += B; i += 1
MUS = np.stack([sfx.L, sfx.R], 1)
wavp = "/tmp/claude-0/sp/voice_swap.wav"
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

# Звук ролика «What if the Moon started getting closer»: ночь (сверчки, прибой), скрип двери, растущая Луна, прилив,
# лодки, светлая ночь, страницы, тиканье башни ускоряется, треск и распад Луны, кольца + своя музыка (тише голоса).
import os, sys, json, re, subprocess, wave as wv
sys.path.insert(0, os.path.dirname(__file__))
import numpy as np
import sfx
from sfx import SR, t, norm, filt, env, noise, click, thud, whoosh, ping, tinkle, shimmer, pad, chirp, breath, riser, creak, chime, crickets, hum, water, boom

ID = "moon"
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


def waves(d, k=1.0):
    x = t(int(d * SR)); return norm(filt(noise(d), 150, 2500) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.16 * k * x) ** 2)) * env(int(d * SR), 0.5, 0.6)
def tick(f=2200): return fit(click(f, 0.04, 160) * 0.8, click(f * 2, 0.02, 300) * 0.3)
def rumble(d): x = t(int(d * SR)); return norm(filt(noise(d), 30, 200) * (x / d) ** 1.5) * env(int(d * SR), 0.1, 0.3)
def pageflip(): return norm(filt(noise(0.25), 1500, 8000) * env(int(0.25 * SR), 0.01, 0.2))
night_end = wt("so", 2)
A(crickets(DUR), 0, 0.05)
A(waves(DUR, 1.0), 0, 0.08, 0.3)
A(creak(0.8, 260), wt("you", 1) - 0.2, 0.16, -0.3)
A(riser(1.4), wt("looks") - 0.6, 0.08); A(ping(392, 1.8, 2), wt("bigger") + 0.05, 0.1); A(ping(330, 1.8, 2), wt("lot") + 0.05, 0.12)
A(shimmer(2.0, 300, 1200), wt("falling") - 0.2, 0.12)
A(whoosh(1.4, 100, 900), wt("pull") - 0.2, 0.14)
A(waves(3.5, 3.0), wt("eight") - 0.1, 0.3); A(water(2.5, 1.5), wt("stronger") + 0.2, 0.18)
A(creak(0.8, 220), wt("lake") + 0.1, 0.12, 0.4); A(creak(0.6, 260), wt("twice") + 0.2, 0.1, -0.4)
A(shimmer(2.2, 800, 2400), wt("rule", 2) + 0.4, 0.1)
A(tinkle(1.4, 14), wt("shines") + 0.1, 0.1)
A(pageflip(), wt("book") + 0.05, 0.16); A(pageflip(), wt("midnight", 2) + 0.2, 0.12)
A(filt(noise(1.2), 300, 3000) * env(int(1.2 * SR), 0.2, 0.6), wt("sleep") - 0.2, 0.1)  # sheets
r0 = wt("four", 3)
a = r0; dt = 0.5
while a < wt("and", 5) - 0.2: A(tick(2400), a, 0.14); dt = max(0.07, dt * 0.88); a += dt
A(breath(0.6, 1200), wt("lost") + 0.2, 0.1)
A(rumble(3.5), wt("about", 3) - 0.3, 0.3)
for k in range(5): A(creak(0.4, 120 + 30 * k), wt("about", 3) + 0.4 + k * 0.5, 0.12, rng_.uniform(-0.5, 0.5))
A(boom(2.0), wt("tears") + 0.05, 0.4); A(rumble(2.0), wt("tears") + 0.2, 0.25)
A(shimmer(3.0, 400, 2600), wt("rings") - 0.3, 0.2); A(tinkle(2.5, 26), wt("rings"), 0.12)
A(creak(0.8, 260), wt("so", 2) - 0.1, 0.12, -0.3)
A(pad(3.5, [48, 55, 64, 71, 76], 1.0), wt("glowing") - 1.2, 0.18)
for s_, at, g, p in fx: sfx.add(s_ * g, at, 1.0, p)
SFX = np.stack([sfx.L.copy(), sfx.R.copy()], 1)
# ---- music: a celesta mystery in D minor, darker at the breakup, wonder (D major) at the rings ----
sfx.L[:] = 0; sfx.R[:] = 0
B = 60 / 88
def cel(m, d=1.0, dec=4): return ping(440 * 2 ** ((m - 69) / 12), d, dec)
minor = [[50, 62, 65, 69], [46, 62, 65, 70], [48, 60, 64, 67], [45, 61, 64, 69]]
major = [[50, 62, 66, 69], [55, 62, 67, 71], [57, 64, 69, 73], [50, 62, 66, 74]]
mel_m = [74, 77, 81, None, 79, 77, 74, None, 72, 74, 76, None, 73, None, 69, None]
mel_M = [74, 78, 81, 86, 85, 81, 78, 81, 83, 79, 76, 79, 81, 78, 74, None]
dark0, wonder0, end = wt("about", 3) - 0.2, wt("rings") - 0.3, DUR - 0.4
bt, i = 0.3, 0
while bt < end:
    maj = bt >= wonder0
    ch = (major if maj else minor)[(i // 4) % 4]
    if i % 4 == 0: sfx.add(pad(4 * B, ch, 0.8), bt, 0.1 if maj else 0.08)
    if dark0 <= bt < wonder0:
        if i % 2 == 0: sfx.add(cel(ch[0] - 12, 1.2, 3), bt, 0.12)
    else:
        m = (mel_M if maj else mel_m)[i % 16]
        if m: sfx.add(cel(m), bt, 0.11, -0.15)
    bt += B; i += 1
MUS = np.stack([sfx.L, sfx.R], 1)
wavp = "/tmp/claude-0/sp/voice_moon.wav"
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

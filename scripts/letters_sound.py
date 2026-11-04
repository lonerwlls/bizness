# Звук ролика «Letters from next year»: зимний ветер, колокола Нового года, скрип почтовых ящиков, шорох бумаги,
# разрыв конверта, хруст снега под Лео (почтальон беззвучен), ночь, тиканье башни, лампа + своя музыка-шкатулка.
import os, sys, json, re, subprocess, wave as wv
sys.path.insert(0, os.path.dirname(__file__))
import numpy as np
import sfx
from sfx import SR, t, norm, filt, env, noise, click, thud, whoosh, ping, tinkle, shimmer, pad, chirp, breath, riser, creak, chime, crickets, hum

ID = "letters"
src = open(f"src/videos/{ID}/voice.ts").read()
V = json.loads(src[src.index("{"):src.rindex("}") + 1])
DUR = V["dur"] + 1.4
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
# winter wind under the whole morning; night wind darker
A(norm(filt(noise(DUR), 150, 1200)) * env(int(DUR * SR), 1.5, 1.5), 0, 0.06)
for k in range(4): A(bell([392, 330, 294, 262][k], 3.0), 0.2 + k * 0.7, 0.12, -0.3 + k * 0.2)   # New Year bells
for a in (wt("everyone") - 0.1, wt("everyone") + 0.4, wt("everyone") + 0.8): A(creak(0.3, 500), a, 0.1, rng_.uniform(-0.5, 0.5)); A(click(1800, 0.04, 90), a + 0.25, 0.12)
for w in ("letter", "written", "don", "say", "take"): A(rustle(0.45), wt(w) - 0.05, 0.14, rng_.uniform(-0.4, 0.4))
for k, w in enumerate(("car", "anna", "may")): A(ping([784, 880, 988][k], 0.6, 5), wt(w) + 0.15, 0.1)
A(chirp(), wt("nobody") + 0.3, 0.07, 0.5); A(shimmer(1.6, 600, 2000), wt("hundred") - 0.2, 0.1)
A(bell(220, 3.5), wt("hundred") + 0.3, 0.12)                                                     # the old tower bell
A(ping(1047, 0.5, 6), wt("two") + 0.05, 0.06); A(ping(1175, 0.5, 6), wt("weird") + 0.05, 0.06)
for k in range(5): A(crunch(), wt("leo", 1) - 0.4 + k * 0.0, 0.0)
A(breath(0.6, 1500), wt("never") - 0.2, 0.08)                                                    # eerie silence of the postman's steps
A(riser(0.8), wt("footprints") - 0.6, 0.06)
for k, w in enumerate(("every", "who")): A(rustle(0.4), wt(w, 2 if w == "every" else 1), 0.12)
A(tinkle(1.2, 10), wt("loopy") - 0.1, 0.1); A(ping(1568, 1.2, 3), wt("l") + 0.02, 0.12)
A(creak(0.4, 520), wt("this", 2) + 0.1, 0.12); A(click(1600, 0.05, 80), wt("this", 2) + 0.45, 0.14)
A(tear(0.7), wt("tears") + 0.05, 0.3)
A(rustle(0.5), wt("page") - 0.05, 0.14); A(thud(70, 0.4), wt("blank") + 0.02, 0.2)
A(rustle(0.4), wt("no", 2) + 0.05, 0.12)
A(whoosh(0.8, 200, 1500), wt("not") + 0.1, 0.1)
# night: wind, Leo's crunching steps through fresh snow, the tower ticking
night = wt("so")
A(norm(filt(noise(wt("inside") - night), 100, 700)) * env(int((wt("inside") - night) * SR), 0.6, 0.4), night - 0.1, 0.1)
for a in np.arange(night + 0.1, wt("up") - 0.1, 0.38): A(crunch(), a, 0.16, rng_.uniform(-0.2, 0.2))
for a in np.arange(wt("up"), wt("inside"), 0.5): A(tick(1700), a, 0.14)
A(creak(0.9, 160), wt("inside") - 0.3, 0.18)                                                    # the tower door
for a in np.arange(wt("inside"), DUR - 0.5, 1.0): A(tick(1500), a, 0.07)
A(click(2500, 0.03, 200), wt("lamp") + 0.05, 0.14); A(hum(1.6, 120) * 0.3, wt("lamp") + 0.1, 0.05)
A(ping(1319, 0.7, 4), wt("pen") + 0.05, 0.08)
A(shimmer(2.0, 400, 1600), wt("thousand") - 0.1, 0.12)
A(rustle(0.5), wt("note") - 0.05, 0.12)
A(tinkle(1.4, 12), wt("your") - 0.1, 0.1); A(pad(2.5, [60, 64, 67, 72], 1.0), wt("umbrella", 2) - 0.2, 0.14)
for s_, at, g, p in fx: sfx.add(s_ * g, at, 1.0, p)
SFX = np.stack([sfx.L.copy(), sfx.R.copy()], 1)
# ---- music: music box, gentle C major in the morning, A minor mystery from "but Leo", warm at the end ----
sfx.L[:] = 0; sfx.R[:] = 0
B = 60 / 96
def box(m, d=0.9, dec=4.5): return ping(440 * 2 ** ((m - 69) / 12), d, dec)
major = [[48, 64, 67], [43, 62, 67], [45, 64, 69], [41, 60, 65]]
minor = [[45, 60, 64], [41, 57, 60], [43, 59, 62], [40, 56, 59]]
mel_M = [72, 76, 79, 76, 77, 74, 71, 74, 72, 76, 81, 79, 77, 74, 72, None]
mel_m = [76, 72, 69, None, 74, 71, 67, None, 72, 69, 65, None, 68, 71, 76, None]
myst0, warm, end = wt("but") - 0.2, wt("your") - 0.2, DUR - 0.4
bt, i = 0.3, 0
while bt < end:
    maj = bt < myst0 or bt >= warm
    ch = (major if maj else minor)[(i // 4) % 4]
    if i % 4 == 0: sfx.add(pad(4 * B, ch, 0.8), bt, 0.08)
    m = (mel_M if maj else mel_m)[i % 16]
    if m: sfx.add(box(m), bt, 0.11, -0.2)
    bt += B; i += 1
MUS = np.stack([sfx.L, sfx.R], 1)
wavp = "/tmp/claude-0/sp/voice_letters.wav"
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

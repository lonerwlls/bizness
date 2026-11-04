# Звук ролика «Don't wave»: туман, ветер, река, колокол башни, взмахи, шаги по камню + своя музыка-шкатулка
# (минор до «freezes», тёплый мажор после «smiles»), приглушённая под голосом. python3 scripts/wave_sound.py
import os, sys, json, re, subprocess, wave as wv
sys.path.insert(0, os.path.dirname(__file__))
import numpy as np
import sfx
from sfx import SR, t, norm, filt, env, noise, click, thud, boom, whoosh, ping, tinkle, shimmer, pad, laugh, chirp, breath, riser, chime, creak

ID = "wave"
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
rng_ = np.random.default_rng(7)
fx = []
def A(s, at, g=1.0, p=0.0): fx.append((s, at, g, p))
def fit(a, b):
    n = max(len(a), len(b)); x = np.zeros(n); x[:len(a)] += a; x[:len(b)] += b; return x
def tick(f=2600): return fit(click(f, 0.04, 160) * 0.8, click(f * 2, 0.02, 300) * 0.3)
def bell(f=196, d=4.0):
    x = t(int(d * SR)); s = 0
    for k, a in ((1, 1), (2.0, 0.5), (2.76, 0.35), (5.4, 0.15), (0.5, 0.4)): s = s + a * np.sin(2 * np.pi * f * k * x) * np.exp(-x * (1.2 + k * 0.4))
    return norm(s)
def steps(d, rate, f=200):
    s = np.zeros(int(d * SR))
    for k in np.arange(0, d - 0.1, 1 / rate):
        p = fit(thud(f, 0.08) * 0.6, filt(noise(0.05), 1500, 6000) * env(int(0.05 * SR), 0.002, 0.04) * 0.35)
        i = int(k * SR); s[i:i + len(p)] += p[: len(s) - i]
    return norm(s)
def flap(d=0.6, rate=6):
    x = t(int(d * SR)); return norm(filt(noise(d), 400, 3000) * np.abs(np.sin(np.pi * rate * x)) ** 3)
def cheer(d):
    s = np.zeros(int(d * SR))
    for k in range(10):
        l = laugh(rng_.integers(3, 6), rng_.uniform(300, 520)); i = int(rng_.uniform(0, d - 1.0) * SR); s[i:i + len(l)] += l[: len(s) - i] * rng_.uniform(0.4, 1)
    s += filt(noise(d), 300, 3000) * 0.25 * env(len(s), 0.3, 0.8)
    return norm(s)

# beds: fog wind all through (fading after the lift), river below
wind = norm(filt(noise(DUR), 120, 900) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.07 * t(int(DUR * SR)))))
lift = wt("lifts")
wk = np.clip(1 - (t(len(wind)) - lift) / 2.0, 0.35, 1.0); A(wind * wk * env(len(wind), 1.5, 1.5), 0, 0.10)
A(norm(filt(noise(DUR), 300, 2500)) * env(int(DUR * SR), 2, 2), 0, 0.035, -0.3)
for a in (2.0, 9.0, 14.5, 26.0): A(chirp(), a, 0.04, rng_.uniform(-0.7, 0.7))
# events
A(riser(1.2), 0.0, 0.06); A(whoosh(0.8, 200, 2000), 0.2, 0.1)
A(whoosh(0.5, 300, 2500), wt("nobody") - 0.15, 0.08)
A(thud(70, 0.3), wt("broken") + 0.05, 0.12)
A(ping(988, 0.6, 5), wt("sign") - 0.02, 0.12); A(ping(784, 0.8, 4), wt("don") - 0.02, 0.14); A(ping(659, 1.0, 3), wt("wave") + 0.1, 0.14)
A(whoosh(1.4, 200, 1800), wt("through") - 0.2, 0.14)
A(chime(1320, 1, 0.3), wt("bakery") - 0.1, 0.1, -0.4)
A(tick(), wt("tower") - 0.1, 0.18); A(tick(1900), wt("tower") + 0.4, 0.16)
A(creak(0.5, 300), wt("crooked") + 0.05, 0.16, 0.3)
for k in range(3): A(ping([523, 659, 784][k], 0.5, 6), [wt("same", 1), wt("same", 2), wt("same", 3)][k] - 0.03, 0.08)
for k in range(3): A(bell(196), wt("seven") - 0.25 + k * 1.1, 0.22)
A(cheer(2.6), wt("people") - 0.1, 0.08, 0.3)
for k in range(5): A(flap(0.5, 5), wt("there", 4) + k * 0.45, 0.05, 0.4)
A(thud(55, 0.4), wt("waves", 1) - 0.05, 0.18)
A(ping(880, 0.6, 5), wt("leo") + 0.05, 0.08); A(ping(1047, 0.5, 6), wt("two") + 0.05, 0.07); A(ping(1175, 0.5, 6), wt("weird") + 0.05, 0.07)
for k in np.arange(wt("their"), wt("ahead") + 0.6, 0.5): A(tick(2600 if int(k * 2) % 2 else 1900), k, 0.2)
for k in range(6): A(flap(0.35, 9), wt("hardest") - 0.2 + k * 0.28, 0.07, -0.3)
A(ping(1568, 0.9, 3), wt("orange") + 0.05, 0.12); A(ping(1976, 0.9, 3), wt("his") + 0.05, 0.12)
A(steps(wt("waves", 3) - wt("so"), 2.6), wt("so") + 0.1, 0.22)
A(whoosh(0.4, 600, 5000), wt("waves", 3) - 0.1, 0.18); A(tinkle(1.0, 12), wt("waves", 3) + 0.05, 0.1)
A(boom(1.0), wt("freezes") - 0.02, 0.18); A(breath(0.5, 2400), wt("freezes") + 0.1, 0.1)
A(steps(wt("in") - wt("starts"), 2.6, 230), wt("starts") + 0.1, 0.16)
for k, w in enumerate(("jacket", "hat", "grin")): A(ping([659, 784, 988][k], 0.6, 5), wt(w) - 0.05, 0.1)
A(shimmer(2.6, 400, 2200), lift - 0.3, 0.2); A(whoosh(1.8, 150, 1500), lift - 0.2, 0.16)
for a in (lift + 1.0, lift + 1.6, lift + 3.0): A(chirp(), a, 0.08, rng_.uniform(-0.7, 0.7))
A(cheer(DUR - wt("whole") - 0.3), wt("whole") - 0.1, 0.16)
A(tick(), wt("now") - 0.05, 0.3); A(bell(220, 3.5), wt("now") + 0.1, 0.2)
for s_, at, g, p in fx: sfx.add(s_ * g, at, 1.0, p)
SFX = np.stack([sfx.L.copy(), sfx.R.copy()], 1)

# ---- music: a music-box mystery in A minor, silence on "freezes", warm C major after "smiles" ----
sfx.L[:] = 0; sfx.R[:] = 0
B = 60 / 92
def box(m, d=0.9, dec=4.5): return ping(440 * 2 ** ((m - 69) / 12), d, dec)
def bassn(m, d=0.6): x = t(int(d * SR)); return np.sin(2 * np.pi * 440 * 2 ** ((m - 69) / 12) * x) * np.exp(-x * 3)
minor = [[45, 60, 64], [41, 57, 60], [43, 59, 62], [40, 56, 59]]
major = [[48, 64, 67], [43, 62, 67], [45, 64, 69], [41, 60, 65]]
mel_m = [76, 72, 69, 72, 74, 71, 67, 71, 72, 69, 65, 69, 68, 71, 76, None]
mel_M = [76, 79, 84, 79, 74, 79, 83, 79, 76, 81, 84, 81, 77, 81, 84, 79]
stop0, warm = wt("freezes") - 0.05, wt("smiles") - 0.1
end = DUR - 0.4
bt, i = 0.6, 0
while bt < end:
    if stop0 <= bt < warm: bt += B; continue
    maj = bt >= warm
    ch = (major if maj else minor)[(i // 4) % 4]
    if i % 4 == 0: sfx.add(pad(4 * B, ch, 0.8), bt, 0.10 if maj else 0.08); sfx.add(bassn(ch[0] - 12, 1.2), bt, 0.25)
    if maj and i % 2 == 1: sfx.add(bassn(ch[0], 0.4), bt, 0.12)
    m = (mel_M if maj else mel_m)[i % 16]
    if m: sfx.add(box(m), bt, 0.12, -0.2)
    if maj and bt > lift: sfx.add(box(m + 12 if m else 88, 0.4, 8), bt + B / 2, 0.05, 0.3)
    bt += B; i += 1
sfx.add(pad(2.4, [48, 55, 64, 72, 76], 1.0), end - 1.8, 0.2)
MUS = np.stack([sfx.L, sfx.R], 1)

wavp = "/tmp/claude-0/sp/voice_wave.wav"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"public/{ID}/voice.mp3", "-ac", "1", "-ar", str(SR), wavp], check=True)
with wv.open(wavp) as w: v = np.frombuffer(w.readframes(w.getnframes()), "<i2").astype(float) / 32768
v = np.pad(v, (0, max(0, sfx.N - len(v))))[: sfx.N]
hop = int(0.05 * SR); rms = np.sqrt(np.convolve(v ** 2, np.ones(hop) / hop, "same"))
act = np.convolve(np.clip(rms / 0.04, 0, 1), np.ones(int(0.25 * SR)) / int(0.25 * SR), "same")
MUS *= (1 - 0.5 * act)[:, None]
mix = MUS * 0.6 + SFX * 0.9
mix = np.tanh(mix * 1.2) / 1.2
peak = np.max(np.abs(mix)); mix *= 0.28 / (peak + 1e-9)  # quieter so the voice stays clear (user request)
with wv.open(f"public/{ID}/sound.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype("<i2").tobytes())
print("ok", DUR, "peak", peak)

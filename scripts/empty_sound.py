# Звук ролика «What If Humans Disappeared»: город, исчезновение (хлопки), метро и насосы, вода, гул станции и
# отключение света, собака, дождь, Чернобыль (волки, ветер), ржавый мост (скрип), лес, тишина Луны + своя музыка.
import os, sys, json, re, subprocess, wave as wv
sys.path.insert(0, os.path.dirname(__file__))
import numpy as np
import sfx
from sfx import SR, t, norm, filt, env, noise, click, thud, boom, whoosh, ping, tinkle, shimmer, pad, chirp, breath, riser, creak, rain, hum, powerdown, water, engine, crickets, bark

ID = "empty"
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
rng_ = np.random.default_rng(3)
fx = []
def A(s, at, g=1.0, p=0.0): fx.append((s, at, g, p))
def fit(a, b): n = max(len(a), len(b)); x = np.zeros(n); x[:len(a)] += a; x[:len(b)] += b; return x
def bed(d, lo, hi): return norm(filt(noise(d), lo, hi)) * env(int(d * SR), 0.3, 0.4)
def pop():
    x = t(int(0.16 * SR)); f = 900 - 600 * (x / 0.16)
    return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 20))
def howl(d=2.2, f0=520):
    x = t(int(d * SR)); f = f0 * (1 + 0.35 * np.sin(np.pi * x / d)) * (1 + 0.01 * np.sin(2 * np.pi * 5 * x))
    return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * x / d) ** 1.5)
def growl(d=0.9): x = t(int(d * SR)); return norm(filt(noise(d), 60, 400) * (1 + 0.8 * np.sin(2 * np.pi * 30 * x)) * np.sin(np.pi * x / d))
def whinny(d=1.0):
    x = t(int(d * SR)); f = 700 + 300 * np.sin(2 * np.pi * 9 * x) * np.exp(-x * 2) - 200 * x
    return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * x / d))
def whimper(d=0.8): x = t(int(d * SR)); f = 900 - 300 * x / d; return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * x / d) ** 2)

# city: traffic + crowd at the start, gone at "vanished"
v = wt("vanished")
A(bed(v + 0.2, 200, 2500), 0, 0.08); A(engine(v + 0.2, 0.8) * env(int((v + 0.2) * SR), 0.2, 0.15), 0, 0.05)
for k in range(8): A(pop(), v + 0.05 + k * 0.035, 0.18, rng_.uniform(-0.7, 0.7))
A(whoosh(0.6, 400, 4000), v - 0.1, 0.15); A(chirp(), v + 0.8, 0.06, 0.5)
A(bed(wt("down") - v, 150, 800), v + 0.3, 0.05)  # empty-city wind
# subway: drips, rushing water, pumps hum, then stop
A(water(2.0, 1.0), wt("underwater") - 0.1, 0.25)
A(hum(wt("stop") - wt("down") + 0.2, 55) * env(int((wt("stop") - wt("down") + 0.2) * SR), 0.2, 0.05), wt("down") - 0.1, 0.18)
A(engine(wt("stop") - wt("pumps") + 0.1, 1.4), wt("pumps") - 0.1, 0.1)
A(water(wt("stop") - wt("millions") + 0.5, 1.2), wt("millions") - 0.1, 0.18, -0.3)
A(powerdown(1.4), wt("stop") - 0.05, 0.3); A(thud(60, 0.4), wt("stop"), 0.25)
A(water(wt("within") - wt("stop"), 0.6), wt("stop") + 0.3, 0.2)
for k in range(10): A(click(1800, 0.03, 120), wt("down") + rng_.uniform(0, 5.5), 0.06, rng_.uniform(-0.6, 0.6))  # drips
# power plant: hum fading, blackout
A(hum(wt("and") - wt("within"), 50), wt("within"), 0.14)
A(bed(3.0, 300, 3000), wt("within"), 0.06)
o = wt("out", 2)
for k in range(5): A(powerdown(1.0), o + 0.1 + k * 0.38, 0.16 - k * 0.02, rng_.uniform(-0.5, 0.5))
A(crickets(wt("your") - o), o + 0.4, 0.05)
# the dog
A(whimper(0.7), wt("door") + 0.1, 0.18); A(crickets(1.6), wt("whole"), 0.07); A(whimper(0.6), wt("week") + 0.3, 0.12)
A(breath(0.5, 1500), wt("figures"), 0.12)
for k in range(6): A(click(2400, 0.02, 200), wt("own") - 0.4 + k * 0.23, 0.12, 0.2)  # paws
# five years: grass crack, rain
A(creak(0.6, 200), wt("splits") - 0.05, 0.22); A(thud(70, 0.3), wt("splits"), 0.18)
A(rain(wt("sound") - wt("rain") + 1.4), wt("rain") - 0.2, 0.22); A(boom(1.5), wt("rain") + 0.5, 0.08)
# Chernobyl: wind, crows-ish, wolves, bear, horses
c0 = wt("chernobyl")
A(bed(wt("in", 4) - c0, 100, 900), c0 - 0.1, 0.09); A(creak(0.9, 260), c0 + 0.4, 0.12)  # the wheel
A(howl(2.0, 500), wt("today") - 0.3, 0.14, -0.5); A(howl(1.8, 620), wt("wolves") + 0.4, 0.1, 0.5)
A(growl(0.9), wt("bears") + 0.05, 0.25)
A(whinny(1.0), wt("horses") + 0.2, 0.18, 0.3)
for k in range(8): A(thud(140, 0.08), wt("horses") + k * 0.22, 0.08, 0.3)
# fifty years: birds, rusty bridge creaks, water under the bridge
for a in (wt("in", 4) + 0.3, wt("trees") + 0.4, wt("lots") + 0.2): A(chirp(), a, 0.08, rng_.uniform(-0.7, 0.7))
A(creak(1.0, 180), wt("steel") + 0.1, 0.18); A(creak(0.8, 150), wt("rust") + 0.1, 0.2); A(water(2.4, 0.5), wt("steel"), 0.1)
# a hundred years: forest birds, wind in leaves
fo = wt("in", 5)
A(bed(wt("but") - fo, 800, 5000) * 0.6, fo, 0.08)
for k in range(9): A(chirp(), fo + 0.3 + k * 1.0, 0.07, rng_.uniform(-0.8, 0.8))
A(shimmer(2.0, 500, 1800), wt("swallowed") - 0.2, 0.12)
# the Moon: silence, a low swell, a soft chime on "boot prints"
A(riser(1.0), wt("but") - 0.9, 0.08); A(pad(4.5, [36, 43, 52, 59], 1.0), wt("but"), 0.18)
A(ping(1318, 1.5, 2), wt("boot") + 0.05, 0.12); A(ping(1760, 1.5, 2), wt("prints") + 0.05, 0.1)
for s_, at, g, p in fx: sfx.add(s_ * g, at, 1.0, p)
SFX = np.stack([sfx.L.copy(), sfx.R.copy()], 1)

# ---- music: a slow, curious piano-like line; darker in the blackout; hopeful in the green; a single chord on the Moon ----
sfx.L[:] = 0; sfx.R[:] = 0
B = 60 / 84
def key_(m, d=1.2, dec=3.5): return ping(440 * 2 ** ((m - 69) / 12), d, dec)
prog_dark = [[45, 57, 60, 64], [41, 53, 57, 60], [43, 55, 59, 62], [40, 52, 55, 59]]
prog_hope = [[48, 60, 64, 67], [43, 59, 62, 67], [45, 57, 60, 64], [41, 57, 60, 65]]
mel_dark = [64, None, 67, 69, 67, None, 64, 62, 60, None, 62, 64, 59, None, None, None]
mel_hope = [67, 72, 71, 67, 69, 72, 74, 72, 76, 74, 72, 69, 71, 67, 72, None]
hope0, moon0, end = wt("in", 4) - 0.2, wt("but") - 0.2, DUR - 0.3
bt, i = 0.4, 0
while bt < moon0:
    hope = bt >= hope0
    ch = (prog_hope if hope else prog_dark)[(i // 4) % 4]
    if i % 4 == 0: sfx.add(pad(4 * B, ch, 0.8), bt, 0.09)
    m = (mel_hope if hope else mel_dark)[i % 16]
    if m: sfx.add(key_(m), bt, 0.12, -0.15)
    if hope and i % 2 == 1: sfx.add(key_(ch[0] + 24, 0.5, 6), bt + B / 2, 0.05, 0.3)
    bt += B; i += 1
sfx.add(pad(end - moon0, [48, 55, 64, 71, 76], 1.0), moon0, 0.16)
MUS = np.stack([sfx.L, sfx.R], 1)

wavp = "/tmp/claude-0/sp/voice_empty.wav"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"public/{ID}/voice.mp3", "-ac", "1", "-ar", str(SR), wavp], check=True)
with wv.open(wavp) as w: vv = np.frombuffer(w.readframes(w.getnframes()), "<i2").astype(float) / 32768
vv = np.pad(vv, (0, max(0, sfx.N - len(vv))))[: sfx.N]
hop = int(0.05 * SR); rms = np.sqrt(np.convolve(vv ** 2, np.ones(hop) / hop, "same"))
act = np.convolve(np.clip(rms / 0.04, 0, 1), np.ones(int(0.25 * SR)) / int(0.25 * SR), "same")
MUS *= (1 - 0.5 * act)[:, None]
mix = MUS * 0.6 + SFX * 0.9
mix = np.tanh(mix * 1.2) / 1.2
peak = np.max(np.abs(mix)); mix *= 0.28 / (peak + 1e-9)  # quieter so the voice stays clear (user request)
with wv.open(f"public/{ID}/sound.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype("<i2").tobytes())
print("ok", DUR, "peak", peak)

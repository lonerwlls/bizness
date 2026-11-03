# Звук ролика «таймер жизни»: события по словам озвучки (voice.ts) + своя музыка (пиццикато-марш), приглушённая под голосом.
# Запуск: python3 scripts/timer_sound.py  ->  public/timer/sound.wav
import os, sys, json, re, subprocess
sys.path.insert(0, os.path.dirname(__file__))
import numpy as np
import sfx
from sfx import SR, t, norm, filt, env, noise, click, thud, boom, whoosh, ping, tinkle, shimmer, pad, laugh, chirp, crickets, breath, riser, water, chime

src = open("src/videos/timer/voice.ts").read()
V = json.loads(src[src.index("{"):src.rindex("}") + 1])
DUR = V["dur"] + 1.0
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
def after(w, nxt):
    k = 0
    for i, x in enumerate(W[:-2]):
        if nm(x["w"]) == nm(w):
            k += 1
            if nm(W[i + 1]["w"]) == nxt or nm(W[i + 2]["w"]) == nxt: return wt(w, k)
    raise KeyError(w)

fx = []  # (sound, at, gain, pan)
def A(s, at, g=1.0, p=0.0): fx.append((s, at, g, p))

def tick(): a = click(2600, 0.04, 160) * 0.8; a[:882] += click(5200, 0.02, 300) * 0.3; return a
def pop():
    x = t(int(0.18 * SR)); f = 300 + 1400 * (x / 0.18)
    return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 18))
def murmur(d):
    s = np.zeros(int(d * SR))
    for k in range(7):
        f0 = rng_.uniform(110, 260); x = t(len(s))
        v = np.sin(2 * np.pi * f0 * x + 2 * np.sin(2 * np.pi * rng_.uniform(2, 5) * x)) * (0.5 + 0.5 * np.sin(2 * np.pi * rng_.uniform(0.6, 1.8) * x + k)) ** 2
        s += filt(v, 200, 1800)
    return norm(s) * env(len(s), 0.6, 0.8)
def steps(d, rate, f=180):
    s = np.zeros(int(d * SR))
    for k in np.arange(0, d - 0.1, 1 / rate):
        p = thud(f, 0.08) * 0.6; q = filt(noise(0.05), 1500, 6000) * env(int(0.05 * SR), 0.002, 0.04) * 0.3; p[:len(q)] += q[:len(p)]
        i = int(k * SR); s[i:i + len(p)] += p[: len(s) - i]
    return norm(s)
def swipe(): return whoosh(0.18, 1500, 7000)
def ding(): return norm(ping(1760, 1.2, 3) + 0.6 * ping(2637, 1.2, 4))
def page(): return norm(filt(noise(0.25), 800, 6000) * env(int(0.25 * SR), 0.01, 0.2))
def snore(d=1.2):
    x = t(int(d * SR))
    return norm(filt(noise(d), 80, 600) * np.sin(np.pi * x / d) ** 2 * (1 + 0.6 * np.sin(2 * np.pi * 28 * x)))
def wave_bed(d):
    x = t(int(d * SR))
    return norm(filt(noise(d), 150, 2500) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.18 * x) ** 2)) * env(len(x), 0.4, 0.6)
rng_ = np.random.default_rng(5)

# ---- events keyed to words ----
# hook: timers pop on over the crowd + a clock tick under the question
for k in range(8): A(pop(), 0.15 + k * 0.05 + 0.12, 0.12, rng_.uniform(-0.7, 0.7))
for k in np.arange(0.2, 5.4, 0.5): A(tick(), k, 0.16, 0.2)
A(shimmer(1.6, 900, 2600), wt("timer") - 0.1, 0.12)
A(whoosh(0.6, 300, 3000), wt("floating") - 0.25, 0.14)
A(chirp(), wt("one") + 0.2, 0.07, -0.5); A(chirp(), wt("one") + 0.9, 0.06, 0.5)
A(riser(0.5), wt("appears") - 0.5, 0.1)
A(pop(), wt("appears") - 0.03, 0.35); A(boom(0.9), wt("appears") - 0.02, 0.22); A(tinkle(1.0, 14), wt("appears"), 0.16)
A(whoosh(0.4, 600, 4000), wt("our") - 0.15, 0.1)
for k in np.arange(wt("fifty-two"), wt("not") - 0.1, 0.5): A(tick(), k, 0.2)
A(ping(1318, 0.7, 5), wt("smiles"), 0.12); A(ping(1568, 0.7, 5), wt("smiles") + 0.1, 0.1)
A(steps(3.8, 2.2), wt("steps"), 0.16, -0.2)
A(murmur(wt("banks") - wt("and", 2) + 0.5), after("and", "whole") - 0.3, 0.1)
A(whoosh(0.5, 400, 3000), after("and", "whole") - 0.25, 0.12)
A(laugh(4, 380), wt("staring") + 0.5, 0.0)
A(chime(1320, 1, 0.3), wt("the", 2) - 0.1, 0.12, 0.4)  # bakery door bell
for k in range(4): A(thud(140, 0.1), wt("keeps") + 0.1 + k * 0.32, 0.18, 0.3)  # kneading
for k in np.arange(wt("nine", 2) - 0.1, wt("drops") - 0.2, 0.25): A(tick(), k, 0.24, 0.3)
A(breath(0.5, 2600), wt("drops") - 0.4, 0.18)
A(thud(80, 0.3), wt("drops") + 0.25, 0.45); A(page(), wt("drops") + 0.3, 0.2); A(page(), wt("drops") + 0.45, 0.15)
A(steps(1.2, 6.5, 220), wt("runs"), 0.24); A(whoosh(0.5, 300, 2500), wt("runs") - 0.1, 0.15)
A(wave_bed(3.0), wt("beach") - 0.15, 0.3); A(chirp(), wt("beach") + 0.3, 0.1, -0.5); A(chirp(), wt("beach") + 1.0, 0.08, 0.6)
A(laugh(5, 340), wt("beach") + 0.25, 0.22)
A(whoosh(0.4, 500, 3000), wt("by") - 0.15, 0.1)
A(pop(), wt("they") + 0.05, 0.18)
A(ding(), wt("banks") + 0.05, 0.16); A(thud(70, 0.25), wt("timer", 2) + 0.35, 0.3)  # stamp: no
A(swipe(), wt("dating") + 0.2, 0.2); A(swipe(), wt("sort") - 0.05, 0.24); A(swipe(), wt("sort") + 0.25, 0.2)
A(click(1500, 0.05, 80), wt("sort") + 0.5, 0.2)
couch = after("and", "guy")
A(thud(60, 0.35), couch + 0.05, 0.4); A(filt(noise(0.3), 200, 1500) * env(int(0.3 * SR), 0.01, 0.25), couch + 0.05, 0.2)
A(breath(0.9, 1200), wt("plenty") - 0.2, 0.12)
for w, n in (("tomorrow", 1), ("next", 1), ("next", 2)): A(page(), wt(w, n) + 0.05, 0.3); A(whoosh(0.35, 800, 5000), wt(w, n), 0.1)
night = wt("then")
A(crickets(wt("so", 2) - night), night, 0.06)
for k in np.arange(wt("math"), wt("so", 2) - 0.2, 0.5): A(tick(), k, 0.13)
A(snore(1.0), wt("asleep") + 0.2, 0.2)
A(click(2200, 0.05, 90), wt("years", 2 + 0) if False else after("years", "more") + 0.05, 0.0)
for k in range(5): A(click(3000, 0.03, 200), after("years", "more") + 0.2 + k * 0.28, 0.16, -0.2)  # phone taps
A(riser(1.6), wt("maybe") - 1.4, 0.2)
A(boom(1.4), wt("twenty") - 0.02, 0.5); A(ping(220, 1.0, 3), wt("twenty"), 0.2)
A(whoosh(0.5, 300, 4000), wt("off") - 0.2, 0.22); A(thud(90, 0.2), wt("off") + 0.1, 0.3)
A(steps(1.4, 2.4), wt("couch") + 0.1, 0.16)
A(shimmer(2.4, 500, 2000), wt("here") - 0.1, 0.18)
A(shimmer(1.4, 2400, 900), wt("see", 2) - 0.1, 0.16)
A(wave_bed(DUR - wt("subscribe")), wt("subscribe") - 0.1, 0.25); A(chirp(), wt("subscribe") + 0.6, 0.08, 0.5)
A(laugh(4, 400), wt("go") + 0.2, 0.15, 0.3)
for s_, at, g, p in fx: sfx.add(s_ * g, at, 1.0, p)

# ---- music: original pizzicato march (C major), a sparse minor bridge at night, back to major ----
SFX = np.stack([sfx.L.copy(), sfx.R.copy()], 1)
sfx.L[:] = 0; sfx.R[:] = 0
BPM = 112; B = 60 / BPM
def pluck(m, d=0.35, dec=9): return ping(440 * 2 ** ((m - 69) / 12), d, dec)
def bassn(m, d=0.4): x = t(int(d * SR)); f = 440 * 2 ** ((m - 69) / 12); return np.sin(2 * np.pi * f * x) * np.exp(-x * 5)
major = [(60, [48, 55, 64]), (55, [43, 59, 62]), (57, [45, 60, 64]), (53, [41, 57, 60])]
minor = [(57, [45, 60, 64]), (53, [41, 57, 60]), (50, [38, 57, 62]), (52, [40, 56, 59])]
mel_major = [72, 76, 79, 76, 74, 71, 74, 79, 72, 76, 81, 79, 77, 74, 72, 74]
mel_minor = [69, None, 72, None, 74, None, 72, None, 69, None, 65, None, 64, None, None, None]
night0, wake = wt("then") - 0.2, wt("so", 2) - 0.1
end = DUR - 0.3
bt = 0.0; i = 0
while bt < end:
    sect = "minor" if night0 <= bt < wake else "major"
    prog = minor if sect == "minor" else major
    bar = (i // 4) % 4; beat = i % 4
    root, ch = prog[bar]
    if sect == "major":
        sfx.add(bassn(root - 12 if beat % 2 == 0 else root - 5), bt, 0.32)
        if beat % 2 == 1:
            for m in ch: sfx.add(pluck(m + 12, 0.25, 12), bt, 0.07, 0.2)
        sfx.add(click(8000, 0.03, 250), bt + B / 2, 0.05, -0.3)
        m = mel_major[(i * 2) % 16]; sfx.add(pluck(m, 0.3, 10), bt, 0.12, -0.15)
        m2 = mel_major[(i * 2 + 1) % 16]
        if (i // 16) % 2: sfx.add(pluck(m2, 0.3, 10), bt + B / 2, 0.1, -0.15)
    else:
        if beat == 0: sfx.add(pad(4 * B, ch, 0.9), bt, 0.12)
        m = mel_minor[(i * 2) % 16]
        if m: sfx.add(pluck(m, 0.6, 5), bt, 0.11)
    bt += B; i += 1
sfx.add(pad(2.0, [48, 55, 64, 72], 1.0), end - 1.2, 0.2)
MUS = np.stack([sfx.L, sfx.R], 1)

# duck the music under the voice
wav = "/tmp/claude-0/sp/voice.wav"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "public/timer/voice.mp3", "-ac", "1", "-ar", str(SR), wav], check=True)
import wave as wv
with wv.open(wav) as w: v = np.frombuffer(w.readframes(w.getnframes()), "<i2").astype(float) / 32768
v = np.pad(v, (0, max(0, sfx.N - len(v))))[: sfx.N]
hop = int(0.05 * SR); rms = np.sqrt(np.convolve(v ** 2, np.ones(hop) / hop, "same"))
act = np.clip(rms / 0.04, 0, 1)
k = int(0.25 * SR); act = np.convolve(act, np.ones(k) / k, "same")
duck = 1 - 0.55 * act
MUS *= duck[:, None]
mix = MUS * 0.55 + SFX * 0.9
mix = np.tanh(mix * 1.2) / 1.2
peak = np.max(np.abs(mix)); mix *= min(1.0, 0.5 / (peak + 1e-9))
with wv.open("public/timer/sound.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype("<i2").tobytes())
print("ok", DUR, "peak", peak)

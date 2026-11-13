# Звук и музыка истории «Метро», часть 2 (по времени истории). python3 scripts/story_metro2_sound.py -> public/stories/metro2/bed.wav
import sys, json, subprocess, wave
sys.path.insert(0, "scripts")
from sfxlib import *  # noqa: F401,F403
import numpy as np

vts = open("src/stories/metro2.voice.ts", encoding="utf8").read()
VOICE = json.loads(vts[vts.index("{"): vts.rindex("}") + 1])
END = VOICE["dur"] + 0.15; DUR = VOICE["dur"] + 2.8 + 0.5; N = int(SR * DUR)
def at(w, n=1):
    c = 0
    for x in VOICE["words"]:
        if x["w"] == w:
            c += 1
            if c == n: return x["t"]
    raise KeyError(w)
b = lambda w, n=1: at(w, n) - 0.1
MUS = np.zeros((N, 2)); FX = np.zeros((N, 2)); REV = np.zeros(N)
def put(bus, t0, s, g=1.0, pan=0.0, rev=0.0):
    i = int(t0 * SR)
    if i >= N: return
    if i < 0: s = s[-i:]; i = 0
    n = min(len(s), N - i); s = s[:n] * g
    bus[i:i + n, 0] += s * min(1, 1 - pan); bus[i:i + n, 1] += s * min(1, 1 + pan)
    if rev: REV[i:i + n] += s * rev
def heart(a, e, bpm0, bpm1, g):
    t = a
    while t < e:
        k = (t - a) / max(1e-3, e - a); bpm = bpm0 + (bpm1 - bpm0) * k
        put(MUS, t, thump(0.35, 48, 1.0), g); put(MUS, t + 0.24, thump(0.3, 44, 0.7), g * 0.8); t += 60 / bpm
def ding(f=1400):
    n = int(SR * 1.2); t = tt(n); return (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 2.76 * t)) * env(n, 0.002, 0.35) * 0.5
def motor(d, f0=60):
    n = int(SR * d); t = tt(n)
    return (np.sin(2 * np.pi * np.cumsum(f0 + 4 * np.sin(2 * np.pi * 0.7 * t)) / SR) * 0.5 + lp(noise(n), 250) * 0.6) * fade(n, 0.3, 0.4)
# тишина тоннеля
put(FX, 0, lp(noise(N), 140) * 0.5 * fade(N, 1, 1), 0.45)
for k in range(int(DUR / 2.3)): put(FX, 2 + k * 2.3 + rng.random(), metal(2000 + rng.random() * 600, 0.3) * 0.2, 0.3, pan=rng.random() - 0.5, rev=0.8)
put(FX, at("голову"), bp(noise(int(SR * 1.0)), 300, 1500) * fade(int(SR * 1.0), 0.3, 0.4) * 0.3, 0.6)
put(FX, at("Молча"), thump(1.2, 42, 1.2), 0.8, rev=0.6)
for k in range(3): put(FX, at("Двое") + k * 0.4, step(1.0), 0.5, rev=0.4)
put(FX, at("надо") - 0.05, thump(0.8, 60, 1.0), 0.9)
for k in range(8): put(FX, at("пересесть") + k * 0.22, step(0.8), 0.35, pan=0.5 - k * 0.12, rev=0.3)
put(FX, at("жмёт"), click(2200, 0.05), 0.8)
put(FX, at("Треск"), bp(noise(int(SR * 1.0)), 800, 5000) * 0.3 * (rng.random(int(SR * 1.0)) > 0.5) * fade(int(SR * 1.0), 0.02, 0.2), 0.8)
put(FX, at("Какой") - 0.1, bp(noise(int(SR * (at("отвечал") - at("Какой") + 1.0))), 1000, 4000) * 0.08, 0.6)
put(FX, at("отвечал") + 0.4, thump(1.6, 40, 1.5), 1.0, rev=0.7)
put(FX, at("нет", 1), thump(1.2, 44, 1.2), 0.8, rev=0.6)
put(FX, at("встаёт"), bp(noise(int(SR * 0.6)), 200, 1500) * fade(int(SR * 0.6), 0.1, 0.3) * 0.4, 0.6)
put(FX, at("ехать"), breath(1.0) * 2, 0.5)
put(FX, at("вспыхивает"), click(700, 0.15) * 2, 0.9); put(FX, at("вспыхивает"), bp(noise(int(SR * 0.4)), 3000, 9000) * env(int(SR * 0.4), 0.001, 0.1), 0.6)
put(FX, at("трогается"), motor(END - at("трогается"), 50) * np.linspace(0.3, 1.3, int(SR * (END - at("трогается")))), 1.0, rev=0.4)
put(FX, at("трогается"), thump(1.0, 50, 1.2), 1.0, rev=0.5)
t0 = at("трогается") + 0.4; d = 0.9
while t0 < END: put(FX, t0, thump(0.12, 90, 0.6) * 0.8, 0.6); put(FX, t0 + 0.18, thump(0.12, 80, 0.6) * 0.6, 0.6); t0 += d; d = max(0.35, d * 0.85)
put(FX, END, thump(2.5, 38, 1.8), 1.0, rev=0.8)

# музыка: только нарастающий жуткий фон
from creepmus import creep, NOTE
MUS += creep(N, END, hits=[at("вопросов"), at("Молча"), at("надо"), at("отвечал"), at("Тринадцать"), at("Сам")], heart_from=b("Петя", 2))
for a0, d in [(at("вопросов"), 2.0), (at("отвечал") + 0.4, 2.4), (at("Сам"), 2.0)]:
    n = int(SR * d); tb = tt(n)
    s = sum(np.sin(2 * np.pi * np.cumsum(NOTE(m) * (1 + 0.006 * np.sin(2 * np.pi * 6.5 * tb))) / SR) for m in (86, 87))
    put(MUS, a0, s * fade(n, 0.5, 1.0) * 0.05, 1.0, rev=0.5)

irn = int(SR * 2.4); ir = noise(irn) * np.exp(-tt(irn) / 0.55); ir = lp(ir, 3500); ir /= np.sqrt((ir ** 2).sum())
nf = 1 << int(np.ceil(np.log2(N + irn)))
wetL = np.fft.irfft(np.fft.rfft(REV, nf) * np.fft.rfft(ir, nf), nf)[:N] * 0.35
wetR = np.fft.irfft(np.fft.rfft(REV, nf) * np.fft.rfft(np.roll(ir, 37), nf), nf)[:N] * 0.35
pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", "public/stories/metro2/voice.mp3", "-f", "s16le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
v = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768; v = np.pad(v, (0, max(0, N - len(v))))[:N]
ve = lp(np.abs(v), 6); ve /= ve.max(); duck = lp(1 - 0.55 * np.clip(ve * 5, 0, 1), 3)
bed = MUS * 0.9 + FX; bed[:, 0] += wetL; bed[:, 1] += wetR
bed *= duck[:, None]; bed *= fade(N, 0.3, 0.6)[:, None]; bed /= np.max(np.abs(bed)) / 0.6
with wave.open("public/stories/metro2/bed.wav", "wb") as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((bed * 32767).astype(np.int16).tobytes())
print("ok", round(DUR, 2))

# Звук и музыка истории «Чужой телефон», часть 2 (по времени истории). python3 scripts/story_phone2_sound.py -> public/stories/phone2/bed.wav
import sys, json, subprocess, wave
sys.path.insert(0, "scripts")
from sfxlib import *  # noqa: F401,F403
import numpy as np

vts = open("src/stories/phone2.voice.ts", encoding="utf8").read()
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
def motor(d, f0=60, up=1):
    n = int(SR * d); t = tt(n)
    s = np.sin(2 * np.pi * np.cumsum(f0 + 8 * up * t / d + 2 * np.sin(2 * np.pi * 0.7 * t)) / SR) * 0.5 + lp(noise(n), 250) * 0.6
    return s * fade(n, 0.3, 0.4)
def slide(d=1.2):
    n = int(SR * d); return bp(noise(n), 300, 2500) * np.sin(np.pi * tt(n) / d) * 0.5 + motor(d, 90) * 0.4
def static(d):
    n = int(SR * d); return bp(noise(n), 800, 5000) * 0.25 * (0.5 + 0.5 * (rng.random(n) > 0.6)) * fade(n, 0.05, 0.1)

def buzz(d=0.6):
    n = int(SR * d); tb = tt(n); g = (np.sin(2 * np.pi * 3.2 * tb) > -0.2).astype(float)
    return (np.sign(np.sin(2 * np.pi * 150 * tb)) * 0.3 + lp(noise(n), 400) * 0.4) * g * fade(n, 0.01, 0.05)
def msg(): return ping(990) * 0.5
def creak(d=1.4):
    n = int(SR * d); tb = tt(n)
    return np.sin(2 * np.pi * np.cumsum(260 + 160 * np.sin(2 * np.pi * 1.1 * tb) + 70 * rng.random(n)) / SR) * env(n, 0.05, 0.7) * 0.35 + bp(noise(n), 200, 1200) * 0.2 * fade(n, 0.1, 0.4)
# тихая квартира: гул холодильника, тиканье часов
put(FX, 0, hum(DUR, 50), 0.1)
t0 = 0.5
while t0 < END: put(FX, t0, click(3000, 0.02), 0.2, rev=0.4); t0 += 1.0
put(FX, 0.0, buzz(0.5), 0.9); put(FX, 0.1, msg(), 0.7, rev=0.3)
put(FX, at("открывает") - 0.1, creak(1.2), 0.5, rev=0.5)
put(FX, at("Кто") - 0.1, click(2600, 0.03), 0.4); put(FX, at("Кто") + 0.1, click(2600, 0.03), 0.4)
put(FX, at("Ответ") - 0.2, buzz(0.5), 0.8); put(FX, at("Тот") - 0.05, msg(), 0.6)
put(FX, at("Новое") - 0.2, buzz(0.5), 0.8); put(FX, at("В") - 0.05, msg(), 0.6)
put(FX, at("скрип") - 0.1, creak(1.6), 1.0, rev=0.6)
for k in range(4): put(FX, at("Медленные") + k * 0.75, step(0.7), 0.8, rev=0.6)
for k in range(3): put(FX, at("пятится") + k * 0.4, step(1.1), 0.35, rev=0.3)
put(FX, at("Нет") - 0.2, buzz(0.4), 0.8); put(FX, at("Нет"), msg(), 0.6); put(FX, at("Там"), msg(), 0.6)
for k in range(3): put(FX, at("Шаги") - 0.6 + k * 0.6, step(0.8), 0.9, rev=0.5)
put(FX, at("рядом"), breath(1.2) * 2, 0.6)
# видеозвонок: громкий рингтон
n = int(SR * (at("А") - at("Телефон") + 0.4)); tb = tt(n)
ring = (np.sin(2 * np.pi * 880 * tb) + np.sin(2 * np.pi * 1320 * tb)) * 0.25 * ((np.floor(tb * 4) % 2) == 0) * fade(n, 0.02, 0.1)
put(FX, at("Телефон"), ring, 0.6, rev=0.4); put(FX, at("Телефон"), buzz(at("А") - at("Телефон")), 0.7)
put(FX, at("шепчет") - 0.2, bp(noise(int(SR * 1.2)), 2000, 7000) * fade(int(SR * 1.2), 0.2, 0.4) * 0.25, 0.5, pan=0.4, rev=0.6)
put(FX, at("Нашёл"), thump(1.6, 40, 1.5), 1.0, rev=0.7)
put(FX, END, thump(2.5, 38, 1.8), 1.0, rev=0.8)
put(FX, END, bp(noise(int(SR * 0.4)), 1000, 8000) * env(int(SR * 0.4), 0.001, 0.08), 0.6)

# музыка: только нарастающий жуткий фон
from creepmus import creep, NOTE
MUS += creep(N, END, hits=[at("Тот"), at("В"), at("скрип"), at("ждёт"), at("рядом"), at("Нашёл")], heart_from=b("Из"))
for a0, d in [(at("свет"), 2.0), (at("ждёт"), 2.4), (at("Нашёл"), 2.0)]:
    n = int(SR * d); tb = tt(n)
    s = sum(np.sin(2 * np.pi * np.cumsum(NOTE(m) * (1 + 0.006 * np.sin(2 * np.pi * 6.5 * tb))) / SR) for m in (86, 87))
    put(MUS, a0, s * fade(n, 0.5, 1.0) * 0.05, 1.0, rev=0.5)

irn = int(SR * 2.4); ir = noise(irn) * np.exp(-tt(irn) / 0.55); ir = lp(ir, 3500); ir /= np.sqrt((ir ** 2).sum())
nf = 1 << int(np.ceil(np.log2(N + irn)))
wetL = np.fft.irfft(np.fft.rfft(REV, nf) * np.fft.rfft(ir, nf), nf)[:N] * 0.35
wetR = np.fft.irfft(np.fft.rfft(REV, nf) * np.fft.rfft(np.roll(ir, 37), nf), nf)[:N] * 0.35
pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", "public/stories/phone2/voice.mp3", "-f", "s16le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
v = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768; v = np.pad(v, (0, max(0, N - len(v))))[:N]
ve = lp(np.abs(v), 6); ve /= ve.max(); duck = lp(1 - 0.55 * np.clip(ve * 5, 0, 1), 3)
bed = MUS * 0.9 + FX; bed[:, 0] += wetL; bed[:, 1] += wetR
bed *= duck[:, None]; bed *= fade(N, 0.3, 0.6)[:, None]; bed /= np.max(np.abs(bed)) / 0.6
with wave.open("public/stories/phone2/bed.wav", "wb") as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((bed * 32767).astype(np.int16).tobytes())
print("ok", round(DUR, 2))

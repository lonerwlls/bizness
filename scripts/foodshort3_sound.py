# Звук и музыка для части 3 «Кто за окном» (по времени истории). python3 scripts/foodshort3_sound.py -> public/foodshort3/bed.wav
import sys, json, subprocess, wave
sys.path.insert(0, "scripts")
from sfxlib import *  # noqa: F401,F403
import numpy as np

vts = open("src/foodshort/voice3.ts", encoding="utf8").read()
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

# ветер за окном весь ролик (громче, когда окно открыто)
w = wind(DUR) * np.interp(tt(N), [0, b("Петя", 2), at("окно", 2), b("Мальчик", 1), DUR], [0.6, 0.6, 1.6, 0.5, 0.5])
put(FX, 0, w, 0.7)
# стук по стеклу
for k in [at("Стук"), at("Стук") + 0.3, at("Стук") + 0.6, at("повторяется") + 0.5]: put(FX, k, metal(2400, 0.35) * 0.9, 1.1, rev=0.5)
# высота: вой ветра, далёкая сирена
put(FX, b("Пятый"), whoosh(3.0, 150, 900) * 1.4, 0.6, rev=0.5)
n = int(SR * 3); put(FX, b("Пятый") + 0.5, np.sin(2 * np.pi * np.cumsum(700 + 120 * np.sin(2 * np.pi * 0.8 * tt(n))) / SR) * 0.05 * fade(n, 1, 1), 0.6, rev=0.8)
# телефон: щелчок фонарика
put(FX, b("Петя", 1) + 0.6, click(3000, 0.06), 1.0)
# мальчик: появление — удар, дыхание и стук зубов, туман на стекле
put(FX, at("мальчик") - 0.1, thump(1.4, 45, 1.3), 0.8, rev=0.6)
for k in range(10): put(FX, b("Он", 1) + k * 0.12, click(1800, 0.02), 0.25)
put(FX, at("Пусти") - 0.3, breath(1.2) * 2, 0.6)
# окно открывается, его затаскивают
put(FX, at("открывает"), creak(0.8, 260), 0.9, rev=0.3); put(FX, at("окно", 2), whoosh(0.6, 200, 3000), 0.6)
put(FX, at("затаскивает") + 0.2, rustle(0.6) * 1.5, 0.8); put(FX, at("внутрь") + 0.3, thump(0.5, 70, 0.9), 0.8)
put(FX, at("внутрь") + 0.6, creak(0.5, 300), 0.5)
# холод: стук зубов, дрожь
for k in range(14): put(FX, b("Мальчик", 1) + 0.3 + k * 0.09, click(2200, 0.02), 0.25)
# тайник: доска, банка
put(FX, b("Петя", 3) + 0.3, creak(0.8, 200), 0.9); put(FX, at("банку"), metal(800, 0.6) * 0.8, 0.7)
# еда: ложка/банка, жадное чавканье (шорохи)
for k in range(8): put(FX, b("Мальчик", 2) + 0.4 + k * 0.45, metal(1500 + k * 40, 0.15) * 0.3, 0.5)
for k in range(8): put(FX, b("Мальчик", 2) + 0.6 + k * 0.45, rustle(0.15) * 0.8, 0.4)
# сон: тиканье часов, тишина
t0 = b("А", 1)
while t0 < b("На"): put(FX, t0, click(3500, 0.02), 0.25, pan=0.5); t0 += 1.0
# «что-то не так» — низкий удар
put(FX, at("Что-то"), thump(1.6, 40, 1.4), 0.8, rev=0.6)
# следы — шорох и удары на «больших»
put(FX, at("Маленькие"), rustle(0.4), 0.6); put(FX, at("большие"), thump(1.2, 42, 1.3), 0.9, rev=0.5); put(FX, at("Мужские"), thump(0.8, 50, 1.0), 0.7)
# счёт: сердце; скрип половицы; финал
put(FX, at("скрипит"), creak(1.3, 180), 1.2, pan=0.4, rev=0.5)
put(FX, at("тайника") + 0.3, breath(1.2) * 2.5, 0.7, pan=0.4)
put(FX, END, thump(2.5, 38, 1.8), 1.0, rev=0.8)
put(FX, END, bp(noise(int(SR * 0.4)), 1000, 8000) * env(int(SR * 0.4), 0.001, 0.08), 0.6)

# музыка
t = tt(N); NOTE = lambda m: 440 * 2 ** ((m - 69) / 12)
def saw(f, n, det=0.0): ph = np.cumsum(np.full(n, f * (1 + det))) / SR; return 2 * (ph % 1) - 1
def pad(notes, a, e, g):
    n = int((e - a) * SR)
    if n <= 0: return
    s = sum(saw(f, n, d) for f in notes for d in (-0.004, 0.0, 0.005))
    s = lp(s, 650) / (len(notes) * 3) * (0.75 + 0.25 * np.sin(2 * np.pi * 0.17 * tt(n)))
    put(MUS, a, s * fade(n, 1.5, 1.5), g, rev=0.25)
drone = np.sin(2 * np.pi * NOTE(26) * t) * 0.6 + np.sin(2 * np.pi * NOTE(26) * 1.003 * t) * 0.5 + lp(noise(N), 90) * 0.8
grow = np.interp(t, [0, b("Петя", 3), b("А", 1), b("Петя", 4), b("На"), END - 0.2, END, DUR], [0.8, 0.7, 0.3, 0.4, 0.9, 1.4, 0.15, 0])
MUS[:, 0] += drone * 0.11 * grow; MUS[:, 1] += drone * 0.11 * grow
CH = [[50, 53, 57, 51], [46, 50, 53, 52], [43, 46, 50, 51], [45, 49, 52, 46], [50, 53, 56, 51]]
secs = [0, b("Петя", 2), b("Петя", 3), b("Петя", 4), b("На"), END]
for k in range(5): pad([NOTE(m) for m in CH[k]], max(0, secs[k] - 0.8), secs[k + 1] + 0.8, 0.14 + 0.03 * k)
heart(b("За"), b("Петя", 2), 100, 116, 0.35)
heart(b("На"), END - 0.2, 70, 135, 0.5)
# колыбельная-шкатулка, пока мальчик спит (расстроенная)
for k, m in enumerate([76, 74, 72, 74, 76, 76, 76, 74, 74, 74]):
    a = b("А", 1) + 0.2 + k * 0.55
    if a > b("На"): break
    n = int(SR * 1.6); tb = tt(n); f = NOTE(m) * (1 + 0.006 * np.sin(2 * np.pi * 5 * tb))
    put(MUS, a, np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.003, 0.45), 0.08, pan=0.3, rev=0.6)
for a0, d in [(at("большие"), 2.0), (END, 2.6)]:
    n = int(SR * d); tb = tt(n)
    s = sum(np.sin(2 * np.pi * np.cumsum(NOTE(m) * (1 + 0.006 * np.sin(2 * np.pi * 6.5 * tb))) / SR) for m in (86, 87))
    put(MUS, a0, s * fade(n, 0.5, 1.0) * 0.05, 1.0, rev=0.5)
n = int(SR * (at("скрипит") - b("Петя", 5) + 0.2)); tr = tt(n)
put(MUS, b("Петя", 5), bp(noise(n), 800, 6000) * (tr / tr[-1]) ** 2 * 0.25, 1.0)

irn = int(SR * 2.4); ir = noise(irn) * np.exp(-tt(irn) / 0.55); ir = lp(ir, 3500); ir /= np.sqrt((ir ** 2).sum())
nf = 1 << int(np.ceil(np.log2(N + irn)))
wetL = np.fft.irfft(np.fft.rfft(REV, nf) * np.fft.rfft(ir, nf), nf)[:N] * 0.35
wetR = np.fft.irfft(np.fft.rfft(REV, nf) * np.fft.rfft(np.roll(ir, 37), nf), nf)[:N] * 0.35
pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", "public/foodshort3/voice.mp3", "-f", "s16le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
v = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768; v = np.pad(v, (0, max(0, N - len(v))))[:N]
ve = lp(np.abs(v), 6); ve /= ve.max(); duck = lp(1 - 0.55 * np.clip(ve * 5, 0, 1), 3)
bed = MUS * 0.9 + FX; bed[:, 0] += wetL; bed[:, 1] += wetR
bed *= duck[:, None]; bed *= fade(N, 0.3, 0.6)[:, None]; bed /= np.max(np.abs(bed)) / 0.6
with wave.open("public/foodshort3/bed.wav", "wb") as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((bed * 32767).astype(np.int16).tobytes())
print("ok", round(DUR, 2))

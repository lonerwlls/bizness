# Звук и музыка истории «Лифт», часть 1 (по времени истории). python3 scripts/story_lift1_sound.py -> public/stories/lift1/bed.wav
import sys, json, subprocess, wave
sys.path.insert(0, "scripts")
from sfxlib import *  # noqa: F401,F403
import numpy as np

vts = open("src/stories/lift1.voice.ts", encoding="utf8").read()
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

# двор: ветер, шаги, дверь подъезда
put(FX, 0, wind(b("В", 1) + 0.5), 0.6)
t0 = 0.2
while t0 < b("В", 1) - 0.2: put(FX, t0, step(0.9), 0.4); t0 += 0.4
put(FX, b("В", 1) - 0.15, slam(), 0.6, rev=0.6)
# подъезд: тишина, гудит лампочка вызова, капает
put(FX, b("В", 1), hum(b("Петя", 2) - b("В", 1), 50), 0.15)
for k in range(4): put(FX, b("В", 1) + 0.4 + k * 0.9, metal(2400, 0.3) * 0.2, 0.5, rev=0.7)
# кнопка 9
put(FX, at("девятый") - 0.05, click(2500, 0.06), 1.0); put(FX, at("девятый"), ding(1200) * 0.4, 0.5)
# двери закрываются, лифт едет
put(FX, at("Двери"), slide(1.4), 0.9, rev=0.3); put(FX, at("закрываются") + 0.9, thump(0.4, 80, 0.8), 0.8)
put(FX, at("Лифт", 1) - 0.2, motor(at("остановка") - at("Лифт", 1) + 0.3, 55), 0.9)
for w in ("Третий", "Четвёртый", "Пятый"): put(FX, at(w), ding(1600) * 0.5, 0.6)
# остановка: удар, скрежет
put(FX, at("остановка") - 0.05, thump(1.2, 45, 1.6), 1.0, rev=0.5); put(FX, at("остановка"), creak(0.8, 160), 0.8, rev=0.4)
# свет мигает и гаснет
fl0 = at("мигает")
for k in range(int((at("гаснет") - fl0) / 0.08)): put(FX, fl0 + k * 0.08, click(5000, 0.02) * (rng.random() > 0.4), 0.4)
put(FX, at("гаснет"), click(800, 0.15) * 2, 0.9); put(FX, at("гаснет") + 0.05, thump(1.4, 38, 1.2), 0.7)
# кнопка диспетчера: звонок, гудки, тишина
put(FX, at("кнопку"), click(2000, 0.08), 1.0)
for k in range(3): put(FX, at("кнопку") + 0.3 + k * 0.5, ping(880) * 0.6, 0.5)
# голос из решётки: шипение и треск
put(FX, at("раздаётся") - 0.2, static(at("один") - at("раздаётся") + 0.8), 0.9)
# телефон-фонарик
put(FX, at("светит") - 0.1, click(3000, 0.06), 1.0)
# зеркало: высокий звон, кто-то за спиной — дыхание
put(FX, at("зеркале"), whoosh(0.8, 2000, 7000) * 0.6, 0.5, rev=0.5)
put(FX, at("кто-то"), breath(1.4) * 2.2, 0.7, pan=0.4, rev=0.3)
put(FX, at("спиной"), thump(1.5, 40, 1.5), 0.9, rev=0.6)
put(FX, at("оборачивается"), whoosh(0.5, 300, 2000), 0.6)
put(FX, at("улыбается"), creak(1.2, 420) * 0.5, 0.4, rev=0.6)
# лифт дёргается и едет вниз
put(FX, at("дёргается") - 0.05, thump(1.0, 45, 1.6), 1.0, rev=0.4)
put(FX, at("дёргается"), motor(at("Минус") - at("дёргается") + 0.2, 70, up=-1), 1.0)
put(FX, at("Минус"), ding(700) * 0.8, 0.8, rev=0.6)
put(FX, at("доме"), slide(2.0), 0.9, rev=0.6)
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
grow = np.interp(t, [0, b("И", 1), b("А", 1), b("В", 3), END - 0.2, END, DUR], [0.5, 0.7, 1.0, 1.1, 1.4, 0.15, 0])
MUS[:, 0] += drone * 0.11 * grow; MUS[:, 1] += drone * 0.11 * grow
CH = [[50, 53, 57, 51], [46, 50, 53, 52], [43, 46, 50, 51], [45, 49, 52, 46], [50, 53, 56, 51]]
secs = [0, b("И", 1), b("А", 1), b("В", 3), b("Лифт", 2), END]
for k in range(5): pad([NOTE(m) for m in CH[k]], max(0, secs[k] - 0.8), secs[k + 1] + 0.8, 0.14 + 0.03 * k)
heart(b("А", 1), b("Петя", 6), 90, 118, 0.4)
heart(b("Лифт", 2), END - 0.2, 100, 140, 0.5)
for k, m in enumerate([74, 77, 76, 72, 74]):
    a = 0.5 + k * 1.2; n = int(SR * 2.0); tb = tt(n); f = NOTE(m) * (1 + 0.004 * np.sin(2 * np.pi * 5 * tb))
    put(MUS, a, np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.003, 0.5), 0.07, pan=0.3, rev=0.6)
for a0, d in [(at("спиной"), 2.0), (at("улыбается"), 2.4), (END, 2.6)]:
    n = int(SR * d); tb = tt(n)
    s = sum(np.sin(2 * np.pi * np.cumsum(NOTE(m) * (1 + 0.006 * np.sin(2 * np.pi * 6.5 * tb))) / SR) for m in (86, 87))
    put(MUS, a0, s * fade(n, 0.5, 1.0) * 0.05, 1.0, rev=0.5)

irn = int(SR * 2.4); ir = noise(irn) * np.exp(-tt(irn) / 0.55); ir = lp(ir, 3500); ir /= np.sqrt((ir ** 2).sum())
nf = 1 << int(np.ceil(np.log2(N + irn)))
wetL = np.fft.irfft(np.fft.rfft(REV, nf) * np.fft.rfft(ir, nf), nf)[:N] * 0.35
wetR = np.fft.irfft(np.fft.rfft(REV, nf) * np.fft.rfft(np.roll(ir, 37), nf), nf)[:N] * 0.35
pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", "public/stories/lift1/voice.mp3", "-f", "s16le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
v = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768; v = np.pad(v, (0, max(0, N - len(v))))[:N]
ve = lp(np.abs(v), 6); ve /= ve.max(); duck = lp(1 - 0.55 * np.clip(ve * 5, 0, 1), 3)
bed = MUS * 0.9 + FX; bed[:, 0] += wetL; bed[:, 1] += wetR
bed *= duck[:, None]; bed *= fade(N, 0.3, 0.6)[:, None]; bed /= np.max(np.abs(bed)) / 0.6
with wave.open("public/stories/lift1/bed.wav", "wb") as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((bed * 32767).astype(np.int16).tobytes())
print("ok", round(DUR, 2))

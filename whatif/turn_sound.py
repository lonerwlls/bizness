# Звук «Лишний на турникете»: python3 whatif/turn_sound.py <1|2|3> -> whatif/public/turnN/bed.wav
import sys, json, subprocess, wave
sys.path.insert(0, "scripts")
from sfxlib import *  # noqa
from creepmus import creep
import numpy as np
P = int(sys.argv[1])
W = json.load(open(f"whatif/src/turnstile/words{P}.json"))
cl = lambda s: s.lower().strip(".,?!«»—–-")
def at(p, n=1):
    c = 0
    for x in W:
        if cl(x["w"]).startswith(p):
            c += 1
            if c == n: return x["t"]
    raise KeyError(p)
VO = {1: 47.93, 2: 47.6, 3: 40.7}[P]
END = at("фонарь", 2) + 0.12 if P == 3 else VO + 0.2
DUR = VO + 3.0; N = int(SR * DUR)
MUS = np.zeros((N, 2)); FX = np.zeros((N, 2)); REV = np.zeros(N)
def put(bus, t0, s, g=1.0, pan=0.0, rev=0.0):
    i = int(t0 * SR)
    if i >= N or len(s) == 0: return
    if i < 0: s = s[-i:]; i = 0
    n = min(len(s), N - i); s = s[:n] * g
    bus[i:i + n, 0] += s * min(1, 1 - pan); bus[i:i + n, 1] += s * min(1, 1 + pan)
    if rev: REV[i:i + n] += s * rev
def tone(f, d, g=0.3):
    n = int(SR * d); return np.sin(2 * np.pi * f * tt(n)) * fade(n, 0.005, 0.03) * g
def beep(t, rev=0.3, g=0.6):  # турникет: короткое «пи-пик»
    put(FX, t, tone(1760, 0.09), g, rev=rev); put(FX, t + 0.13, tone(2350, 0.12), g, rev=rev)
def deny(t):  # отказ: низкий резкий зуммер
    n = int(SR * 0.45); s = np.sign(np.sin(2 * np.pi * 220 * tt(n))) * 0.18 * fade(n, 0.005, 0.05)
    put(FX, t, lp(s, 3000), 0.9, rev=0.2)
def static(d):
    n = int(SR * d); return bp(noise(n), 900, 5000) * 0.3 * (0.4 + 0.6 * (rng.random(n) > 0.55)) * fade(n, 0.05, 0.1)
def radio(t, d=1.2): put(FX, t - 0.1, click(1800, 0.05), 0.7); put(FX, t - 0.05, static(d), 0.45)
def ding(t, rev=0.5): put(FX, t, ping(1320), 0.6, rev=rev); put(FX, t + 0.25, ping(990), 0.6, rev=rev)
def door(t, d=1.0): n = int(SR * d); put(FX, t, bp(noise(n), 150, 900) * fade(n, 0.2, 0.3) * 0.35, 0.6, rev=0.3)
def steps(a, b, dt, g=0.5, rev=0.4):
    x = a
    while x < b: put(FX, x, step(), g, pan=0.1 * np.sin(x * 3), rev=rev); x += dt
put(FX, 0, hum(DUR, 50), 0.05)  # гул ламп в холле
hits = []; heart = None
if P == 1:
    put(FX, at("запер"), bolt(), 0.8, rev=0.4)
    beep(at("сигнализацию") + 0.4, g=0.4)
    put(FX, at("413"), thump(0.6, 60, 1.2), 0.6); put(FX, at("413"), tone(880, 0.15), 0.5)
    put(FX, at("отматываешь"), whoosh(1.4, 400, 5000), 0.4); put(FX, at("отматываешь") + 0.1, static(1.6), 0.25)
    put(FX, at("щелкнул"), click(2400, 0.04), 1.0, rev=0.6); beep(at("щелкнул") + 0.05)
    put(FX, at("включаешь") + 0.3, click(3000, 0.03), 0.9)
    steps(at("включаешь") + 0.9, at("спиной") - 0.2, 0.5, 0.4)
    beep(at("пищить"), rev=0.8)
    put(FX, at("оборачиваешься"), whoosh(0.5, 300, 4000), 0.5)
    put(FX, at("414"), thump(1.4, 44, 1.3), 0.9, rev=0.7); put(FX, at("414"), tone(880, 0.15), 0.5)
    hits = [at("413"), at("щелкнул"), at("пищить"), at("414")]; heart = at("включаешь")
elif P == 2:
    radio(at("разница"), 0.9)
    door(at("заходишь"), 0.8); put(FX, at("жмёшь"), click(2600, 0.03), 0.8)
    a, b = at("лифт") + 0.5, at("открываются")
    n = int(SR * (b - a)); put(FX, a, hum(b - a, 90) * fade(n, 0.4, 0.4), 0.18)
    for k in range(6): put(FX, at("мигает") - 0.3 + k * 0.17, click(1500 + 300 * k, 0.02), 0.5)
    put(FX, at("останавливается"), thump(1.0, 50, 1.4), 1.0, rev=0.5); put(FX, at("останавливается") + 0.1, metal(400, 0.8), 0.3)
    ding(at("31"))
    put(FX, at("нет"), thump(1.4, 42, 1.3), 0.8, rev=0.6)
    door(at("открываются"), 1.2)
    steps(at("длинный"), at("ты", 2), 0.55, 0.45, 0.6)
    put(FX, at("твой"), thump(1.2, 44, 1.2), 0.8, rev=0.6)
    put(FX, at("завтра"), thump(1.8, 38, 1.6), 1.0, rev=0.8)
    beep(at("пищит"), rev=1.2, g=0.25)
    radio(at("рация"), 1.4)
    put(FX, at("оборачиваешься"), whoosh(0.5, 300, 4000), 0.5)
    door(at("закрываются") - 0.2, 1.4); put(FX, at("тебя"), thump(1.0, 55, 1.4), 0.9, rev=0.4)
    hits = [at("останавливается"), at("нет"), at("завтра"), at("закрываются")]; heart = at("кроме")
else:
    steps(0.1, at("20") + 0.3, 0.26, 0.55, 0.7)
    for k in range(12):
        x = at("мигает") + k * 0.2
        if k % 4 == 0: put(FX, x, click(2200, 0.02), 0.5)
    put(FX, at("повернули"), thump(1.4, 42, 1.3), 0.9, rev=0.7)
    for w, g in [("20", 0.4), ("10", 0.4)]: put(FX, at(w), whoosh(0.4, 300, 3000), g)
    radio(at("рация") + 0.2, 1.2)
    put(FX, at("врываешься") + 0.2, slam(), 0.9, rev=0.5)
    put(FX, at("бледнеет"), thump(1.2, 46, 1.2), 0.8, rev=0.6)
    put(FX, at("попрощался"), thump(1.4, 42, 1.3), 0.8, rev=0.6)
    put(FX, at("пропуск") - 0.1, rustle(0.4), 0.4)
    deny(at("курникет")); deny(at("еще")); deny(at("еще") + 0.6)
    put(FX, at("один"), thump(1.8, 38, 1.6), 1.0, rev=0.8)
    put(FX, END, click(3000, 0.03), 1.0)  # щелчок фонаря
    put(FX, END + 0.02, thump(2.4, 34, 1.8), 1.0, rev=0.9)
    hits = [at("повернули"), at("рация"), at("бледнеет"), at("курникет"), at("один")]; heart = at("ты", 2)
MUS[:] += creep(N, END, hits=hits, heart_from=heart)
irn = int(SR * 2.4); ir = noise(irn) * np.exp(-tt(irn) / 0.55); ir = lp(ir, 3500); ir /= np.sqrt((ir ** 2).sum())
nf = 1 << int(np.ceil(np.log2(N + irn)))
wetL = np.fft.irfft(np.fft.rfft(REV, nf) * np.fft.rfft(ir, nf), nf)[:N] * 0.35
wetR = np.fft.irfft(np.fft.rfft(REV, nf) * np.fft.rfft(np.roll(ir, 37), nf), nf)[:N] * 0.35
pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", f"whatif/public/turn{P}/voice.mp3", "-f", "s16le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
v = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768; v = np.pad(v, (0, max(0, N - len(v))))[:N]
ve = lp(np.abs(v), 6); ve /= ve.max(); duck = lp(1 - 0.55 * np.clip(ve * 5, 0, 1), 3)
bed = MUS * 0.9 + FX; bed[:, 0] += wetL; bed[:, 1] += wetR
bed *= duck[:, None]; bed *= fade(N, 0.3, 0.6)[:, None]; bed /= np.max(np.abs(bed)) / 0.6
with wave.open(f"whatif/public/turn{P}/bed.wav", "wb") as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((bed * 32767).astype(np.int16).tobytes())
print("ok", P, round(DUR, 2))

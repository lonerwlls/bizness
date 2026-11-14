# Звук «Метеостанции»: эмбиент, эффекты, нарастающая жуткая музыка (обрыв на выключении фонаря).
# python3 whatif/station_sound.py -> whatif/public/station/bed.wav (время истории, без рекламы)
import sys, json, subprocess, wave
sys.path.insert(0, "scripts")
from sfxlib import *  # noqa
from creepmus import creep, NOTE
import numpy as np
W = json.load(open("whatif/src/station/words.json"))
cl = lambda s: s.lower().strip(".,?!«»—-")
def at(p, n=1):
    c = 0
    for x in W:
        if cl(x["w"]).startswith(p) :
            c += 1
            if c == n: return x["t"]
    raise KeyError(p)
VO = 49.16; END = VO + 0.2; DUR = END + 2.6; N = int(SR * DUR)
OFF = at("фонарь", 2) + 0.1
MUS = np.zeros((N, 2)); FX = np.zeros((N, 2)); REV = np.zeros(N)
def put(bus, t0, s, g=1.0, pan=0.0, rev=0.0):
    i = int(t0 * SR)
    if i >= N or len(s) == 0: return
    if i < 0: s = s[-i:]; i = 0
    n = min(len(s), N - i); s = s[:n] * g
    bus[i:i + n, 0] += s * min(1, 1 - pan); bus[i:i + n, 1] += s * min(1, 1 + pan)
    if rev: REV[i:i + n] += s * rev
def seg(a, b): return int(SR * max(0, b - a))
# ветер снаружи (кадры улицы) и гул внутри
outA = [(0, at("3") - 0.15), (at("они") - 0.1, at("рация") - 0.1), (at("открой") - 0.1, at("снаружи") - 0.1)]
for a, b in outA:
    n = seg(a, b); w = bp(noise(n), 200, 900) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.23 * tt(n))) * fade(n, 0.3, 0.3)
    put(FX, a, w, 0.5)
put(FX, 0, hum(DUR, 50), 0.06)
# тиканье часов в комнате
t0 = at("3")
while t0 < OFF: put(FX, t0, click(3200, 0.02), 0.12, rev=0.3); t0 += 1.0
# фонарь: щелчок включения
put(FX, at("включаешь") + 0.25, click(2400, 0.04) * 2, 0.8)
for k in range(4): put(FX, at("включаешь") + 0.9 + k * 0.42, step(0.9), 0.5, rev=0.3)
put(FX, at("басы"), thump(1.2, 44, 1.2), 0.8, rev=0.6)
put(FX, at("нет", 1), thump(1.4, 40, 1.3), 0.9, rev=0.7)
# рация: шипение, голос из динамика
def static(d): n = int(SR * d); return bp(noise(n), 900, 5000) * 0.3 * (0.4 + 0.6 * (rng.random(n) > 0.55)) * fade(n, 0.05, 0.1)
put(FX, at("рация"), static(1.4), 0.7)
put(FX, at("седьмой") - 0.1, static(at("видишь") - at("седьмой") + 0.8), 0.25)
put(FX, at("тогда") - 0.1, static(at("никому") - at("тогда") + 0.8), 0.25)
put(FX, at("никому") + 0.5, click(1800, 0.05), 0.6)
# скрип половицы
n = int(SR * 1.3); tb = tt(n)
cr = np.sin(2 * np.pi * np.cumsum(240 + 140 * np.sin(2 * np.pi * 1.4 * tb) + 60 * rng.random(n)) / SR) * env(n, 0.05, 0.6) * 0.35
put(FX, at("скрипит"), cr, 1.0, rev=0.6)
# капли с куртки
for k in range(8): put(FX, at("лучь") + 0.6 + k * 0.55, ping(1800 + rng.random() * 400) * 0.2, 0.35, pan=-0.3, rev=0.5)
put(FX, at("мокрая"), thump(1.0, 46, 1.0), 0.6, rev=0.5)
# стук в дверь: три удара
for k in [at("стучат"), at("стучат") + 0.42, at("три") + 0.3]: put(FX, k, thump(0.35, 70, 1.4) * 1.6, 1.0, rev=0.5)
# дыхание в темноте
for k in range(3): put(FX, at("внутри") + 0.4 + k * 1.1, breath(1.0) * 2, 0.5, pan=-0.4, rev=0.3)
# выключение фонаря: щелчок, потом тишина и удар
put(FX, OFF, click(2400, 0.04) * 2.5, 1.0)
put(FX, OFF + 0.25, thump(2.5, 36, 1.8), 1.0, rev=0.8)
# вжухи на смене мест
for w in [at("3") - 0.15, at("они") - 0.1, at("рация") - 0.1, 29.85]: put(FX, w - 0.15, whoosh(0.5, 300, 4000), 0.4)
# музыка: нарастающий жуткий фон, обрыв на выключении
MUS[:] += creep(N, OFF, hits=[at("басы"), at("нет", 1), at("никому"), at("мокрая"), at("открой"), at("дыхание")], heart_from=at("стучат"))
for a0, d in [(at("нет", 1), 2.0), (at("выходил"), 2.2), (at("открой"), 2.4)]:
    n = int(SR * d); tb = tt(n)
    s = sum(np.sin(2 * np.pi * np.cumsum(NOTE(m) * (1 + 0.006 * np.sin(2 * np.pi * 6.5 * tb))) / SR) for m in (86, 87))
    put(MUS, a0, s * fade(n, 0.5, 1.0) * 0.05, 1.0, rev=0.5)
irn = int(SR * 2.4); ir = noise(irn) * np.exp(-tt(irn) / 0.55); ir = lp(ir, 3500); ir /= np.sqrt((ir ** 2).sum())
nf = 1 << int(np.ceil(np.log2(N + irn)))
wetL = np.fft.irfft(np.fft.rfft(REV, nf) * np.fft.rfft(ir, nf), nf)[:N] * 0.35
wetR = np.fft.irfft(np.fft.rfft(REV, nf) * np.fft.rfft(np.roll(ir, 37), nf), nf)[:N] * 0.35
pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", "whatif/public/station/voice.mp3", "-f", "s16le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
v = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768; v = np.pad(v, (0, max(0, N - len(v))))[:N]
ve = lp(np.abs(v), 6); ve /= ve.max(); duck = lp(1 - 0.55 * np.clip(ve * 5, 0, 1), 3)
bed = MUS * 0.9 + FX; bed[:, 0] += wetL; bed[:, 1] += wetR
bed *= duck[:, None]; bed *= fade(N, 0.3, 0.6)[:, None]; bed /= np.max(np.abs(bed)) / 0.6
with wave.open("whatif/public/station/bed.wav", "wb") as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((bed * 32767).astype(np.int16).tobytes())
print("ok", round(DUR, 2))

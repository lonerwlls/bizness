# Звук и музыка для части 2 (по времени истории, без стоп-кадров — их вырезает сам ролик).
# Запуск: python3 scripts/foodshort2_sound.py -> public/foodshort2/bed.wav
import sys, json, subprocess
sys.path.insert(0, "scripts")
from sfxlib import *  # noqa: F401,F403
import numpy as np

vts = open("src/foodshort/voice2.ts", encoding="utf8").read()
VOICE = json.loads(vts[vts.index("{"): vts.rindex("}") + 1])
DUR = VOICE["dur"] + 2.8 + 0.5
N = int(SR * DUR)
WORDS = VOICE["words"]
def at(w, n=1):
    c = 0
    for x in WORDS:
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

END = VOICE["dur"] + 0.15
# --- сцены ---
# за дверью: гул голосов в подъезде, шарканье, лампа подъезда
put(FX, 0, murmur(b("Он"), 12) * fade(int(SR * b("Он")), 0.5, 1.0), 0.7, rev=0.5)
for k in range(14): put(FX, rng.random() * b("Он"), step(0.6 + rng.random() * 0.4), 0.18, pan=rng.random() - 0.5, rev=0.4)
put(FX, 0, hum(b("Он"), 100), 0.05)
# стук и «Петя, мы знаем»
for k in range(3): put(FX, at("стук") + k * 0.32, knock(), 1.5, rev=0.5)
put(FX, at("Петя") - 0.3, breath(1.5) * 1.5, 0.5)
# выбор: тикающая тишина
for k in range(int((b("Он") - b("Петя", 2)) / 0.5)): put(FX, b("Петя", 2) + k * 0.5, click(2200, 0.03), 0.25)
put(FX, at("Открыть"), whoosh(0.4), 0.3); put(FX, at("Не", 1), whoosh(0.4), 0.3)
put(FX, at("выломают") + 0.1, thump(1.2, 42, 1.3), 0.8, rev=0.5)
# доска: скрип гвоздей, банки и мешки в тайник
put(FX, b("Он") + 0.25, creak(0.9, 200), 0.9, rev=0.2); put(FX, b("Он") + 1.1, thump(0.4, 80, 0.8), 0.7)
for k, a in enumerate([1.3, 1.9, 2.5, 3.1, 3.6]):
    t0 = b("Он") + a + 0.45
    put(FX, t0, metal(650 + 80 * k, 0.6) * 0.8 if k in (0, 2, 3) else rustle(0.4) * 1.4, 0.7, pan=-0.4 + 0.2 * k, rev=0.2)
put(FX, b("Себе") - 0.3, thump(0.5, 70, 0.8), 0.6)  # доску положили
# банка в руке
put(FX, at("банку") , metal(900, 0.5) * 0.5, 0.5)
# ключ в замке
put(FX, at("поворачивается") - 0.2, click(2500, 0.06), 1.0)
for k in range(4): put(FX, at("поворачивается") + k * 0.22, click(1600 + k * 300, 0.05), 0.9)
put(FX, at("ключ") + 0.1, bolt(), 1.1)
# соседка с ключом: звон ключей
for k in range(6): put(FX, b("Запасной") + 0.3 + k * 0.45 + rng.random() * 0.2, metal(2600 + rng.random() * 800, 0.25) * 0.35, 0.5, pan=0.3, rev=0.4)
put(FX, b("Запасной"), breath(1.6) * 1.4, 0.4)
# дверь открывается и упирается в цепочку
put(FX, at("открывается") - 0.1, creak(1.0, 240), 0.9, rev=0.4)
put(FX, at("упирается"), metal(1400, 0.4) * 1.2, 1.0); put(FX, at("упирается"), thump(0.4, 90, 1.0), 0.8)
put(FX, at("открывается"), murmur(b("Петя", 4) - at("открывается"), 10), 0.9, rev=0.4)  # гул из подъезда громче
# глаз и шёпот
put(FX, b("В", 1), breath(1.4) * 2, 0.5, rev=0.3)
# банка в щель, её забирают
put(FX, at("щель"), metal(800, 0.4) * 0.6, 0.6); put(FX, at("супа", 2) + 0.4, rustle(0.3) * 1.5, 0.7)
# глаз исчезает, шаги уходят вниз
put(FX, at("исчезает"), whoosh(0.5, 200, 1200), 0.4)
t0 = b("Шаги"); k = 0
while t0 < b("Тишина"):
    fadeo = 1 - (t0 - b("Шаги")) / (b("Тишина") - b("Шаги"))
    for j in range(3): put(FX, t0 + rng.random() * 0.2, step(0.9), 0.4 * fadeo + 0.05, pan=rng.random() - 0.5, rev=0.7)
    t0 += 0.3
# тишина, выдох
put(FX, at("выдыхает"), breath(1.6) * 2.4, 0.9)
# холодильник гудит до «замолкает», потом щелчок и тишина; свет гаснет с электрическим щелчком
put(FX, 0, hum(at("замолкает") + 0.2, 55) * 0.6, 0.12)
put(FX, at("гаснет"), click(900, 0.15) * 2, 1.0); put(FX, at("гаснет") + 0.05, thump(1.6, 38, 1.4), 0.9, rev=0.6)
put(FX, at("замолкает") + 0.2, click(700, 0.1), 0.9)
# стук в окно (стекло) и ветер снаружи
put(FX, b("А", 2), wind(DUR - b("А", 2)), 0.6)
for k in range(3): put(FX, at("стучит") + k * 0.3, metal(2400, 0.35) * 0.9, 1.1, rev=0.5)
put(FX, END, thump(2.5, 38, 1.8), 1.0, rev=0.8)
put(FX, END, bp(noise(int(SR * 0.4)), 1000, 8000) * env(int(SR * 0.4), 0.001, 0.08), 0.6)
CUTS = [b(w, n) for w, n in [("Снова", 1), ("Они", 1), ("Петя", 2), ("Он", 1), ("Себе", 1), ("И", 1), ("Запасной", 1), ("Дверь", 1), ("В", 1), ("Петя", 4), ("Глаз", 1), ("Шаги", 1), ("Тишина", 1), ("И", 2), ("Холодильник", 1), ("А", 2), ("Петя", 6)]]
for c in CUTS: put(FX, c - 0.3, whoosh(0.45, 600, 4000), 0.16)

# --- музыка ---
t = tt(N)
NOTE = lambda m: 440 * 2 ** ((m - 69) / 12)
def saw(f, n, det=0.0): ph = np.cumsum(np.full(n, f * (1 + det))) / SR; return 2 * (ph % 1) - 1
def pad(notes, a, e, g):
    n = int((e - a) * SR)
    if n <= 0: return
    s = sum(saw(f, n, d) for f in notes for d in (-0.004, 0.0, 0.005))
    s = lp(s, 650) / (len(notes) * 3) * (0.75 + 0.25 * np.sin(2 * np.pi * 0.17 * tt(n)))
    put(MUS, a, s * fade(n, 1.5, 1.5), g, rev=0.25)
drone = np.sin(2 * np.pi * NOTE(26) * t) * 0.6 + np.sin(2 * np.pi * NOTE(26) * 1.003 * t) * 0.5 + lp(noise(N), 90) * 0.8
grow = np.interp(t, [0, b("Он"), b("Шаги"), b("Тишина") + 0.5, at("гаснет"), END - 0.2, END, DUR], [0.7, 0.9, 1.1, 0.3, 1.0, 1.3, 0.15, 0])
MUS[:, 0] += drone * 0.11 * grow; MUS[:, 1] += drone * 0.11 * grow
CH = [[50, 53, 57, 51], [46, 50, 53, 52], [43, 46, 50, 51], [45, 49, 52, 46], [50, 53, 56, 51]]
secs = [0, b("Он"), b("Запасной"), b("Тишина"), b("И", 2), END]
for k in range(5): pad([NOTE(m) for m in CH[k]], max(0, secs[k] - 0.8), secs[k + 1] + 0.8, 0.15 + 0.03 * k)
heart(0, b("Он"), 92, 110, 0.4)
heart(b("И", 1), b("Тишина"), 88, 120, 0.45)
heart(at("гаснет"), END - 0.2, 70, 130, 0.5)
# колокольчики в тишине
for k, m in enumerate([74, 77, 76, 72]):
    a = b("Тишина") + 0.2 + k * 0.8; n = int(SR * 2.0); tb = tt(n); f = NOTE(m) * (1 + 0.004 * np.sin(2 * np.pi * 5 * tb))
    put(MUS, a, np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.003, 0.5), 0.08, pan=0.3, rev=0.6)
# визг перед финалом
for a0, d in [(at("стучит"), 2.4), (END, 2.6)]:
    n = int(SR * d); tb = tt(n)
    s = sum(np.sin(2 * np.pi * np.cumsum(NOTE(m) * (1 + 0.006 * np.sin(2 * np.pi * 6.5 * tb))) / SR) for m in (86, 87))
    put(MUS, a0, s * fade(n, 0.6, 1.0) * 0.05, 1.0, rev=0.5)
# нарастание к стуку в окно
n = int(SR * (at("стучит") - b("А", 2) + 0.3)); tr = tt(n)
put(MUS, b("А", 2), bp(noise(n), 800, 6000) * (tr / tr[-1]) ** 2 * 0.25, 1.0)

# --- реверберация, приглушение под голосом, сохранение ---
irn = int(SR * 2.4); ir = noise(irn) * np.exp(-tt(irn) / 0.55); ir = lp(ir, 3500); ir /= np.sqrt((ir ** 2).sum())
nf = 1 << int(np.ceil(np.log2(N + irn)))
wetL = np.fft.irfft(np.fft.rfft(REV, nf) * np.fft.rfft(ir, nf), nf)[:N] * 0.35
wetR = np.fft.irfft(np.fft.rfft(REV, nf) * np.fft.rfft(np.roll(ir, 37), nf), nf)[:N] * 0.35
pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", "public/foodshort2/voice.mp3", "-f", "s16le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
v = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768; v = np.pad(v, (0, max(0, N - len(v))))[:N]
ve = lp(np.abs(v), 6); ve /= ve.max(); duck = lp(1 - 0.55 * np.clip(ve * 5, 0, 1), 3)
bed = MUS * 0.9 + FX; bed[:, 0] += wetL; bed[:, 1] += wetR
bed *= duck[:, None]; bed *= fade(N, 0.3, 0.6)[:, None]
bed /= np.max(np.abs(bed)) / 0.6
import wave
with wave.open("public/foodshort2/bed.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((bed * 32767).astype(np.int16).tobytes())
print("ok", round(DUR, 2))

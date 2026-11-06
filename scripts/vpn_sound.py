# Звук шортса «что происходит, когда включаешь VPN» (vpn): озвучка Fish + загадочная техно-музыка с нарастанием + звуки по словам.
# python3 scripts/web_sound.py → public/vpn/mix.wav
import os, sys, json, subprocess
import numpy as np
sys.path.insert(0, os.path.dirname(__file__))
from sfx import *  # noqa
LEAD = 6 / 30
s = open("src/vpn/voices/p1.ts", encoding="utf8").read(); V = json.loads(s[s.index("{"): s.rindex("}") + 1])
D = V["dur"] + 1.2 + LEAD
def at(w, n=1):
    xs = [x for x in V["words"] if x["w"].lower() == w.lower()]
    return xs[n - 1]["t"] + LEAD
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
def tone(f, d, dec=6, fm=0.0):
    x = t(int(d * SR)); return np.sin(2 * np.pi * f * x + fm * np.sin(2 * np.pi * f * 2 * x)) * np.exp(-x * dec)
def drone(d, notes, cut=900):
    x = t(int(d * SR)); y = sum(np.sin(2 * np.pi * hz(m) * x + 0.3 * np.sin(2 * np.pi * 0.2 * x + m)) for m in notes)
    return norm(filt(y + 0.15 * noise(d)[: len(x)], 40, cut)) * env(len(x), 1.5, 1.5)
# ---- музыка: тёмный пэд, арпеджио, пульс баса, тиканье; слои добавляются, к концу — нарастание ----
T1, T2, T3, T4 = at("Когда"), at("Вместо"), at("А"), at("Так")
CH = [[45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59], [40, 47, 52, 56]]   # Am F G E
bar = 2.4
for k in range(int(D / bar) + 1):
    a = k * bar
    if a > D - 1: break
    add(drone(bar + 1.2, CH[k % 4], 700 + 1200 * min(1, a / D)), a, 0.075)
step = bar / 16
arp = [0, 2, 3, 1, 2, 3, 0, 3]
for i in range(int(D / step)):
    a = i * step; k = int(a / bar) % 4
    if a > D - 1.2: break
    m = CH[k][arp[i % 8] % 4] + 12 + (12 if a > T3 and i % 4 == 0 else 0)
    g = 0.025 + 0.022 * min(1, a / T3)
    if a < 1.0 or i % 2 == 0 or a > T2: add(tone(hz(m), 0.35, 9, 0.6), a, g, 0.3 * np.sin(i))
for i in range(int(D / (bar / 4))):                       # пульс баса с блокировки
    a = i * bar / 4
    if T1 <= a < D - 1.2: add(tone(hz(CH[int(a / bar) % 4][0] - 12), 0.5, 5), a, 0.065)
for i in range(int(D / (bar / 8))):                       # тиканье «часов» с карты
    a = i * bar / 8
    if T2 <= a < D - 1.2: add(click(6000, 0.02, 500), a, 0.02 + 0.02 * (a > T3), 0.4 * (-1) ** i)
add(riser(1.8), T3 - 2.1, 0.05); add(riser(2.0), T4 - 2.3, 0.06)
add(boom(1.8), T4 - 0.25, 0.12); add(drone(D - T4, [45, 52, 57, 64, 69], 2500), T4, 0.12)
# ---- звуки ----
def buzz(d=0.5):
    x = t(int(d * SR)); return norm(np.sign(np.sin(2 * np.pi * 110 * x)) * 0.6 + np.sin(2 * np.pi * 220 * x)) * env(len(x), 0.01, 0.1)
# начало: удар под надпись, щелчок переключателя, «включение» города
add(boom(1.2), LEAD, 0.14); add(glitch(0.25), LEAD + 0.05, 0.08); add(whoosh(0.5, 600, 6000), LEAD, 0.08)
add(click(2200, 0.05, 120), at("кнопку") + 0.22, 0.16); add(ping(1568, 0.4, 7), at("кнопку") + 0.27, 0.08); add(shimmer(1.0, 900, 3000), at("кнопку") + 0.3, 0.07)
add(ping(988, 0.5, 6), at("Но"), 0.06); add(ping(1175, 0.5, 6), at("Но") + 0.2, 0.05)
add(whoosh(1.0, 400, 5000), at("Когда") + 0.4, 0.09); add(shimmer(1.2, 600, 2400), at("сервером"), 0.07)
add(riser(1.0), at("И", 2) + 0.2, 0.06)
add(whoosh(0.8, 300, 2500), at("Вместо") + 0.2, 0.07); add(thud(70, 0.3), at("Вместо") + 1.2, 0.12)
add(whoosh(0.7, 500, 6000), at("передаёт"), 0.08); add(whoosh(0.7, 500, 6000), at("передаёт") + 0.7, 0.07)
for i in range(6): add(click(3000 + 500 * rng.random(), 0.02, 400), at("шифруются") + i * 0.12, 0.05, 0.4 * (-1) ** i)
add(ping(880, 0.4, 6), at("поэтому") + 0.9, 0.05)
add(click(1800, 0.05, 80), at("видят") + 0.1, 0.08); add(ping(1318, 0.4, 6), at("VPN-сервера"), 0.06)
add(shimmer(1.2, 700, 2600), at("Из-за"), 0.07)
add(shimmer(1.0, 600, 2000), at("подвох"), 0.06)
for i in range(4): add(click(1500 + 200 * i, 0.04, 90), at("файлам") + i * 0.13, 0.06)
add(whoosh(0.9, 400, 4000), at("Так"), 0.08)
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", "public/vpn/voice.mp3", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
voice = np.frombuffer(raw, np.float32).astype(float); voice /= np.max(np.abs(voice)) + 1e-9
add(voice, LEAD, 0.62)
save("out/vpn/_sound60.wav")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "out/vpn/_sound60.wav", "-t", f"{D:.3f}", "-af", f"afade=t=out:st={D - 0.8:.3f}:d=0.8", "-ar", "48000", "public/vpn/mix.wav"], check=True)
print("ok public/vpn/mix.wav", round(D, 2))

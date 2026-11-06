# Звук пробы «самолёт 400 тонн» (11.5 с): озвучка Fish Audio + лёгкая музыка + аэропорт, гул и разбег двигателей,
# ветер на высоте, свист потоков воздуха, удары на «четыреста тонн» и «вверх».
import os, sys, subprocess
import numpy as np
sys.path.insert(0, os.path.dirname(__file__))
from sfx import *  # noqa
D = 11.5
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", "public/plane/voice.wav", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
voice = np.frombuffer(raw, np.float32).astype(float)
voice = voice / (np.max(np.abs(voice)) + 1e-9)
# музыка: бодрый «научный» мотив пиццикато + мягкий пэд, шаг 0.25 с
mel = [72, 76, 79, 76, 74, 77, 81, 77, 72, 76, 79, 84, 83, 79, 76, 74, 72, 76, 79, 76, 77, 81, 84, 81, 79, 76, 74, 76, 79, 83, 84, 86, 88, 84, 79, 84, 88, 91, 88, 86, 84, 84]
for i, m in enumerate(mel):
    a = 0.05 + i * 0.25
    if a > 10.6: break
    add(ping(440 * 2 ** ((m - 69) / 12), 0.3, 9), a, 0.07, 0.2 * np.sin(i))
for k, ch in enumerate([[48, 55, 64], [53, 57, 65], [55, 59, 67], [48, 55, 64], [53, 57, 65], [55, 59, 67], [57, 60, 64], [55, 59, 62], [60, 64, 67], [60, 64, 67]]):
    add(pad(1.15, ch, 0.6), 0.05 + k * 1.15, 0.06)
for a in np.arange(0.05, 10.9, 0.5): add(thud(80, 0.12), a, 0.07)
# аэропорт: ровный далёкий гул (0-4.8 с)
n = int(4.8 * SR)
add(norm(filt(noise(4.8), 60, 700)) * env(n, 0.4, 0.6), 0.0, 0.07)
add(whoosh(0.5, 400, 4000), 1.05, 0.12)                    # пролёт камеры к самолёту
add(boom(1.2), 1.13, 0.22); add(thud(60, 0.4), 1.13, 0.3)   # «четыреста тонн» — тяжёлый удар
# разбег: рёв двигателей нарастает, пролетает мимо слева направо (4.75-7.1 с)
d = 2.6; n = int(d * SR); x = t(n)
roar = filt(noise(d), 80, 2600) * (0.3 + 0.7 * np.exp(-((x - 0.65) / 0.55) ** 2)) * env(n, 0.15, 0.8)
whine = np.sin(2 * np.pi * np.cumsum(1800 + 500 * x / d) / SR) * 0.15 * env(n, 0.2, 0.8)
add(norm(roar + whine), 4.75, 0.17, -0.5); add(norm(roar), 4.95, 0.12, 0.5)
add(engine(1.3, 1.6), 5.95, 0.12)                           # отрыв: гул под камерой
# в небе: ветер и свист потоков (7.05-11.5 с)
n = int(4.4 * SR)
add(norm(filt(noise(4.4), 500, 4500)) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.7 * t(n))) * env(n, 0.3, 0.6), 7.05, 0.1)
add(whoosh(0.8, 600, 6000), 7.05, 0.16, -0.4)
add(whoosh(0.7, 300, 2500), 8.0, 0.16, 0.3)                 # «вниз» — поток уходит вниз
add(riser(0.9), 9.3, 0.1)
add(whoosh(0.6, 500, 6000), 10.05, 0.18); add(boom(1.2), 10.2, 0.16)   # «вверх» — рывок
add(ping(1046, 0.8, 4), 10.25, 0.08)
add(voice, 0.0, 0.62)
save("out/plane/_sound60.wav")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "out/plane/_sound60.wav", "-t", str(D), "-af", "afade=t=out:st=11.0:d=0.5", "-ar", "48000", "public/plane/sound.wav"], check=True)
print("ok public/plane/sound.wav")

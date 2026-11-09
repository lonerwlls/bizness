# Звук пробы «10 seconds into the future» (20 с, без голоса). python3 scripts/future_sound.py
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from sfx import *  # noqa
F = 1 / 30
def ghost_cue(): return shimmer(0.6, 1400, 3200)
# фон: ночной город + мягкая музыка
add(norm(filt(noise(20), 80, 900)) * env(int(20 * SR), 1.0, 1.0), 0, 0.06)
for k, ch in enumerate([[50, 57, 62], [46, 53, 62], [48, 55, 64], [45, 52, 60]] * 2):
    a = k * 2.0
    if a < 14.6: add(pad(2.0, ch, 0.8), a, 0.14)
for a in np.arange(0.0, 14.6, 0.5): add(thud(70, 0.15), a, 0.12)
for a in np.arange(0.25, 14.6, 0.5): add(click(5000, 0.02, 400), a, 0.05)
# двор: призрачная траектория, бросок, поимка
add(ghost_cue(), 8 * F, 0.25); add(whoosh(0.5, 600, 4000), 45 * F, 0.25); add(thud(160, 0.12), 66 * F, 0.45); add(ping(990, 0.4, 9), 66 * F, 0.12)
# склейки
for fr in (75, 135, 210, 270, 380): add(whoosh(0.3, 800, 6000), fr * F - 0.08, 0.12)
# столовая: призрак подноса, бег, поимка
add(ghost_cue(), (135 + 6) * F, 0.25)
for a in np.arange((135 + 4) * F, (135 + 30) * F, 0.18): add(thud(200, 0.05), a, 0.12)
add(thud(130, 0.12), (135 + 46) * F, 0.4); add(click(2500, 0.05, 200), (135 + 46) * F, 0.2)
add(laugh(2, 520), (210 + 10) * F, 0.12)
# улица: призрак машины, шаги, настоящая машина
add(ghost_cue(), (270 + 16) * F, 0.25)
for a in np.arange((270 + 6) * F, (270 + 18) * F, 0.22): add(thud(180, 0.05), a, 0.1)
add(engine(1.2, 1.4) * env(int(1.2 * SR), 0.4, 0.5), (270 + 30) * F, 0.35, -0.6); add(whoosh(0.9, 200, 3000), (270 + 40) * F, 0.35, 0.4)
# крупный план: сердцебиение, гул
for a in (12.8, 13.4, 14.0, 14.6): add(thud(55, 0.25), a, 0.4)
add(riser(2.2), 12.8, 0.18)
# название
add(boom(1.8), 15.0, 0.55); add(shimmer(1.5, 900, 2600), 15.1, 0.25)
for fr in (4 + 14, 20 + 14, 36 + 14): add(thud(90, 0.2), 15.0 + fr * F, 0.35)
add(pad(4.5, [50, 57, 62, 69], 1.0), 15.3, 0.25)
save("public/future/sound.wav")

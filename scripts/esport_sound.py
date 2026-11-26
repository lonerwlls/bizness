# Звук пробы «киберспорт» (10 сек). python3 scripts/esport_sound.py
import os, sys, json
sys.path.insert(0, os.path.dirname(__file__))
from sfx import *  # noqa

s = open("src/esport/voice.ts", encoding="utf8").read()
V = json.loads(s[s.index("{"): s.rindex("}") + 1])
LEAD = 0.25
def at(w): return next(x["t"] for x in V["words"] if x["w"].lower().strip(".,") == w) + LEAD
END = 10.0

# музыка: тёмный пэд + мягкий бит с нарастанием
add(pad(END, [45, 52, 57, 64], 0.9), 0.0, 0.10)
for i, a in enumerate(np.arange(0.25, END - 0.5, 0.5)):
    add(thud(55, 0.3), a, 0.16 if i % 2 == 0 else 0.08)
    if a > at("but"): add(click(6000, 0.02, 300), a + 0.25, 0.05)
# коридор: смех детей
for k, a in enumerate((0.2, 0.7, 1.2)): add(laugh(4, 380 + k * 60), a, 0.12, -0.4 + k * 0.4)
add(laugh(5, 450), at("talentless"), 0.16, 0.3)
add(thud(70, 0.3), at("talentless"), 0.25)
# смены сцен: «вжух»
for w in ("even", "but", "secretly"): add(whoosh(0.4, 400, 4000), at(w) - 0.3, 0.14)
# родители: выдёргивают шнур
add(powerdown(1.2), at("banned"), 0.3)
add(boom(1.2), at("banned"), 0.25)
# ночь: тихий ветер
add(bed(2.0, 300, 1200, 0.3, 0.5), at("but"), 0.05)
# клуб: щёлкает лампа + удар + блеск
c = at("club")
add(click(2500, 0.03, 150), c, 0.25)
add(boom(1.6), c, 0.3)
add(shimmer(1.5, 800, 3000), c + 0.05, 0.08)
for a in np.arange(at("secretly"), END - 0.5, 0.11): add(click(4000 + 800 * rng.random(), 0.015, 400), a, 0.03 * rng.random() + 0.01)  # клавиатура
save("public/esport/sfx.wav")

# Звук для пробников стилей (5 сек): кафе, укусы, жевание. python3 scripts/eat_sound.py
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from sfx import *  # noqa

add(bed(5.0, 200, 2500, 0.2, 0.3), 0.0, 0.12)
add(norm(filt(noise(5.0), 300, 2500)) * env(int(5 * SR), 0.2, 0.3), 0.0, 0.05)  # гул кафе
add(whoosh(0.4, 600, 3000), 0.7, 0.2)
for a in (1.5, 3.17): add(crunch(), a, 0.7)
for a in list(np.arange(1.6, 2.8, 0.15)) + list(np.arange(3.25, 4.15, 0.15)): add(filt(click(500, 0.06, 60), None, 1500), a, 0.25)
add(ping(1320, 0.8, 4) + ping(1760, 0.8, 4), 4.2, 0.3)
save("public/styles/_eat60.wav")

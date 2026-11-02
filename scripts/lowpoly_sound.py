# Звук для пробника low-poly (5 сек): вечерняя улица, шаги, удар по мячу. python3 scripts/lowpoly_sound.py
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from sfx import *  # noqa
add(bed(5.0, 200, 1800, 0.3, 0.4), 0.0, 0.18)
for a in rng.uniform(0.2, 4.6, 5): add(chirp(), a, 0.06, rng.uniform(-0.8, 0.8))
for a in np.arange(0.3, 5.0, 0.38): add(thud(160, 0.07), a, 0.18)
add(thud(110, 0.25), 2.33, 0.7); add(click(900, 0.08, 60), 2.33, 0.4)
for k, a in enumerate((2.75, 3.15, 3.5)): add(thud(180, 0.1), a, 0.3 * (0.7 ** k))
add(pad(5.0, [52, 59, 64, 67]), 0.0, 0.18)
save("public/lowpoly/_s60.wav")

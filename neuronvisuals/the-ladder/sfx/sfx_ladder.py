# SFX «The Ladder»: синтез кодом по timeline.json. Классы «Пустого зала» + металл лестницы, бумага, «динь».
import json, os, sys
import numpy as np
sys.path.insert(0, "/home/user/neuron/pustoy-zal/sfx")
from sfx_zal_lib import Zal, SR
class Lad(Zal):
    def grab(self):     # ладонь хватает металлическую перекладину
        n = int(SR * 0.35); x = self.t(n)
        ring = sum(a * np.sin(2 * np.pi * f * x) * np.exp(-x / d) for f, a, d in [(1240, 0.3, 0.12), (2710, 0.18, 0.07), (4150, 0.08, 0.04)])
        slap = self.fbp(self.noise(n), 400, 4000) * np.exp(-x / 0.008)
        return (ring * 0.7 + slap) * 0.8
    def mstep(self):    # ступня на металлическую ступеньку
        n = int(SR * 0.3); x = self.t(n)
        thud = np.sin(2 * np.pi * (110 + 80 * np.exp(-x / 0.008)) * x) * np.exp(-x / 0.04)
        ring = sum(a * np.sin(2 * np.pi * f * x) * np.exp(-x / d) for f, a, d in [(880, 0.25, 0.09), (1930, 0.12, 0.05)])
        return (thud + ring + self.fbp(self.noise(n), 1500, 6000) * np.exp(-x / 0.004) * 0.4) * 0.8
    def paper(self, dur):
        n = int(SR * dur); x = np.linspace(0, 1, n)
        crackle = self.fbp(self.noise(n), 2000, 9000) * (self.rng.random(n) < 0.08) * 2.0
        return (self.fbp(self.noise(n), 900, 6000) * 0.5 + crackle) * np.sin(np.pi * x) ** 0.8 * 0.7
    def ding(self):     # табличка суммы вспыхивает
        n = int(SR * 0.9); x = self.t(n)
        return sum(a * np.sin(2 * np.pi * f * x) * np.exp(-x / d) for f, a, d in [(1568, 0.5, 0.35), (3136, 0.18, 0.2), (4704, 0.07, 0.12)]) * np.minimum(1, x / 0.002) * 0.6
    def whoosh2(self, dur):
        n = int(SR * dur); x = np.linspace(0, 1, n); nz = self.noise(n)
        lo = self.fbp(nz, 300, 1800); hi = self.fbp(nz, 1500, 6000)
        return (lo * 0.8 + hi * x) * np.sin(np.pi * x) ** 1.8 * 0.9
Lad.wind = lambda self, dur: (lambda n, x: (self.fbp(self.noise(n), 120, 700) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.23 * x + 1.0)) + 0.25 * self.fbp(self.noise(n), 900, 2500) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.11 * x))) * np.minimum(1, x / 1.2) * 0.8)(int(SR * dur), np.arange(int(SR * dur)) / SR)
Lad.fstep = lambda self: (lambda n, x: (np.sin(2 * np.pi * (90 + 50 * np.exp(-x / 0.01)) * x) * np.exp(-x / 0.035) + self.fbp(self.noise(n), 800, 5000) * np.exp(-x / 0.012) * 0.6) * 0.7)(int(SR * 0.2), np.arange(int(SR * 0.2)) / SR)
GEN = {"hum": lambda m, d: m.hum(d), "grab": lambda m, d: m.grab(), "mstep": lambda m, d: m.mstep(), "ding": lambda m, d: m.ding(),
       "whoosh": lambda m, d: m.whoosh2(d), "paper": lambda m, d: m.paper(d), "cloth": lambda m, d: m.cloth(int(round(d * 30))), "creak": lambda m, d: m.creak(0.4),
       "boom": lambda m, d: m.boom(240, 60, 9, 0.3), "relay": lambda m, d: m.relay(), "heart": lambda m, d: m.heart(), "wind": lambda m, d: m.wind(d), "fstep": lambda m, d: m.fstep()}
tl = json.load(open(sys.argv[1], encoding="utf-8")); out = sys.argv[2]
m = Lad(tl["duration_sec"] * tl["fps"], tl["fps"])
for e in tl["sfx"]:
    m.put(np.asarray(GEN[e["kind"]](m, e.get("dur_sec")), float), e["t_sec"] * tl["fps"], e.get("gain", 0), e.get("pan", 0), f'{e["kind"]}@{e["t_sec"]}')
print(m.save(out, os.path.splitext(out)[0] + ".csv"))

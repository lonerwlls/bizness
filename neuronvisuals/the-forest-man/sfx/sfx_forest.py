# SFX «The 101st Blow»: удары кувалды по камню, треск, раскол, шаги, щелчки света, три ноты.
import json, os, sys
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import importlib.util
spec = importlib.util.spec_from_file_location("base", os.path.join(os.path.dirname(os.path.abspath(__file__)), "sfx_base_lib.py")); base = importlib.util.module_from_spec(spec); spec.loader.exec_module(base)
R, SR, GEN = base.R, base.SR, base.GEN
class S(R):
    def hit(self, big=0.0):   # кувалда о камень: глухой удар + хруст + короткий звон металла
        n = int(SR * (0.6 + big)); x = self.t(n)
        thump = np.sin(2 * np.pi * (70 + 90 * np.exp(-x / 0.01)) * x) * np.exp(-x / (0.06 + 0.12 * big))
        crunch = self.fbp(self.noise(n), 700, 5000) * np.exp(-x / (0.018 + 0.02 * big)) * 0.9
        ring = sum(a * np.sin(2 * np.pi * f * x) * np.exp(-x / d) for f, a, d in [(1870, 0.18, 0.12), (2730, 0.1, 0.08), (4120, 0.05, 0.05)])
        grit = self.fbp(self.noise(n), 2500, 9000) * (self.rng.random(n) < 0.02) * np.exp(-x / 0.12) * 1.5
        return (thump * (1.0 + big) + crunch + ring + grit) * 0.8
    def crack(self, dur):     # камень трещит: серия сухих щелчков
        n = int(SR * dur); x = np.linspace(0, 1, n); nz = self.noise(n)
        clicks = (self.rng.random(n) < 0.004 * (0.3 + x)) * 1.0
        k = np.exp(-np.arange(int(SR * 0.004)) / (SR * 0.0008)); cl = np.convolve(clicks, k)[:n]
        return self.fbp(nz * cl * 6, 900, 7000) * 0.8
    def split(self):          # раскол: низкий гул + глубокий треск
        n = int(SR * 2.4); x = self.t(n)
        rum = self.fbp(self.noise(n), 30, 180) * np.minimum(1, x / 0.05) * np.exp(-x / 0.9) * 1.6
        tone = np.sin(2 * np.pi * 48 * x) * np.exp(-x / 0.8) * 0.6
        return rum + tone + np.pad(self.crack(0.7), (0, n - int(SR * 0.7))) * 1.3
    def wind(self, dur):       # ночной ветер над рекой
        n = int(SR * dur); x = np.arange(n) / SR
        lfo = 0.6 + 0.4 * np.sin(2 * np.pi * 0.11 * x) * np.sin(2 * np.pi * 0.047 * x + 1.0)
        return self.fbp(self.noise(n), 150, 900) * lfo * 0.5
    def dig(self):             # ладони в песке
        n = int(SR * 0.5); x = self.t(n)
        return (self.fbp(self.noise(n), 300, 2500) * np.exp(-x / 0.09) + self.fbp(self.noise(n), 80, 300) * np.exp(-x / 0.05) * 0.6) * 0.8
    def sprout(self, f0=880.0):  # росток: мягкий восходящий звон
        n = int(SR * 1.2); x = self.t(n); f = f0 * (1 + 0.5 * (1 - np.exp(-x / 0.25)))
        return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x / 0.45) * np.minimum(1, x / 0.01) + 0.3 * np.sin(2 * np.pi * np.cumsum(f * 2) / SR) * np.exp(-x / 0.3)) * 0.35
    def leaves(self, dur):     # шелест листвы
        n = int(SR * dur); x = np.linspace(0, 1, n)
        g = (self.rng.random(n) < 0.02) * 1.0; k = np.exp(-np.arange(int(SR * 0.01)) / (SR * 0.002)); g = np.convolve(g, k)[:n]
        return self.fbp(self.noise(n) * (0.4 + g * 3), 1500, 7000) * np.sin(np.pi * x) * 0.5
GEN = dict(GEN)
GEN.update({"wind": lambda m, d: m.wind(d), "dig": lambda m, d: m.dig(), "sprout": lambda m, d: m.sprout(), "sprout2": lambda m, d: m.sprout(1175.0), "sprout3": lambda m, d: m.sprout(1318.5), "leaves": lambda m, d: m.leaves(d), "hit": lambda m, d: m.hit(0.0), "hitbig": lambda m, d: m.hit(0.5), "crack": lambda m, d: m.crack(d or 0.5), "split": lambda m, d: m.split(),
            "step": lambda m, d: m.step(), "relay": lambda m, d: m.relay(), "clack": lambda m, d: m.clack(), "heart": lambda m, d: m.heart(), "hum": lambda m, d: m.hum(d)})
tl = json.load(open(sys.argv[1], encoding="utf-8")); out = sys.argv[2]
m = S(tl["duration_sec"] * tl["fps"], tl["fps"])
for e in tl["sfx"]:
    m.put(np.asarray(GEN[e["kind"]](m, e.get("dur_sec")), float), e["t_sec"] * tl["fps"], e.get("gain", 0), e.get("pan", 0), f'{e["kind"]}@{e["t_sec"]}')
print(m.save(out, os.path.splitext(out)[0] + ".csv"))

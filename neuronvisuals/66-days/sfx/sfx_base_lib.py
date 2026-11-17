# SFX «The Raise»: неоновое гудение, мотор ленты, шаги бега по резине, «чинь» прибавки, скольжение коробки, свист камеры.
import json, os, sys
import numpy as np
sys.path.insert(0, "/home/user/neuron/pustoy-zal/sfx")
from sfx_zal_lib import Zal, SR
class R(Zal):
    def neon(self, dur):   # гудение неоновой трубки: 120 Гц с гармониками + лёгкий треск
        n = int(SR * dur); x = self.t(n)
        s = sum(a * np.sin(2 * np.pi * f * x) for f, a in [(120, 0.35), (240, 0.25), (360, 0.12), (600, 0.05)])
        crack = self.fbp(self.noise(n), 3000, 9000) * (self.rng.random(n) < 0.0008) * 3
        return (np.tanh(s * 1.4) * 0.6 + crack) * 0.5
    def motor(self, dur):  # мотор ленты: низкий гул с ритмом роликов
        n = int(SR * dur); x = self.t(n)
        return (self.fbp(self.noise(n), 60, 260) * (0.7 + 0.3 * np.sin(2 * np.pi * 7 * x)) + 0.3 * np.sin(2 * np.pi * 55 * x)) * 0.6
    def run(self):         # шаг бега по резиновой ленте
        n = int(SR * 0.18); x = self.t(n)
        return (np.sin(2 * np.pi * (80 + 70 * np.exp(-x / 0.008)) * x) * np.exp(-x / 0.03) + self.fbp(self.noise(n), 600, 3500) * np.exp(-x / 0.01) * 0.5) * 0.8
    def ching(self):       # прибавка: «чинь» кассы + монетка
        n = int(SR * 1.0); x = self.t(n)
        bell = sum(a * np.sin(2 * np.pi * f * x) * np.exp(-x / d) for f, a, d in [(2093, 0.5, 0.4), (2637, 0.35, 0.3), (3136, 0.25, 0.25), (4186, 0.1, 0.15)])
        clack = self.fbp(self.noise(n), 1500, 8000) * np.exp(-x / 0.006)
        return (bell + clack) * 0.6
    def slide(self, dur):  # коробка едет по ленте
        n = int(SR * dur); x = np.linspace(0, 1, n)
        return self.fbp(self.noise(n), 300, 2000) * (0.4 + 0.6 * x) * np.minimum(1, (1 - x) * 8) * 0.5
    def grabbox(self):
        n = int(SR * 0.3); x = self.t(n)
        return (np.sin(2 * np.pi * (120 + 60 * np.exp(-x / 0.01)) * x) * np.exp(-x / 0.05) + self.fbp(self.noise(n), 400, 3000) * np.exp(-x / 0.02)) * 0.8
    def whoosh2(self, dur):
        n = int(SR * dur); x = np.linspace(0, 1, n); nz = self.noise(n)
        return (self.fbp(nz, 300, 1800) * 0.8 + self.fbp(nz, 1500, 6000) * x) * np.sin(np.pi * x) ** 1.8 * 0.9
R.sig3 = lambda self: (lambda n, x: sum(np.pad((sum(a * np.sin(2 * np.pi * f0 * k * x[: n - int(t0 * SR)]) for k, a in [(1, 0.6), (2, 0.18), (3, 0.06)]) * np.exp(-x[: n - int(t0 * SR)] / 0.55) * np.minimum(1, x[: n - int(t0 * SR)] / 0.004)), (int(t0 * SR), 0)) for t0, f0 in [(0.0, 659.25), (0.27, 523.25), (0.54, 440.0)]) * 0.55)(int(SR * 2.4), np.arange(int(SR * 2.4)) / SR)
R.zap = lambda self: (lambda n, x: (self.fbp(self.noise(n), 2000, 9000) * (self.rng.random(n) < 0.15) * 2.5 + np.sign(np.sin(2 * np.pi * 120 * x)) * 0.25) * np.exp(-x / 0.05) * 0.7)(int(SR * 0.2), np.arange(int(SR * 0.2)) / SR)
R.swipe = lambda self, dur: (lambda n, xx: (self.fbp(self.noise(n), 80, 600) * 0.9 + self.fbp(self.noise(n), 1200, 4000) * 0.3) * np.sin(np.pi * xx) ** 0.7 * 0.8)(int(SR * dur), np.linspace(0, 1, int(SR * dur)))
R.beep = lambda self: (lambda n, x: (np.sin(2 * np.pi * 1397 * x) * (x < 0.12) + np.sin(2 * np.pi * 1865 * x) * ((x > 0.15) & (x < 0.36))) * 0.5)(int(SR * 0.45), np.arange(int(SR * 0.45)) / SR)
R.plug = lambda self: (lambda n, x: (self.fbp(self.noise(n), 1500, 9000) * np.exp(-x / 0.004) * 1.2 + np.sin(2 * np.pi * 160 * x) * np.exp(-x / 0.03) * 0.8 + np.sin(2 * np.pi * 2400 * x) * np.exp(-x / 0.015) * 0.3) * 0.8)(int(SR * 0.2), np.arange(int(SR * 0.2)) / SR)
R.tick = lambda self: (lambda n, x: (np.sin(2 * np.pi * 3520 * x) * np.exp(-x / 0.05) * 0.4 + np.sin(2 * np.pi * 2637 * x) * np.exp(-x / 0.08) * 0.3) * np.minimum(1, x / 0.001))(int(SR * 0.3), np.arange(int(SR * 0.3)) / SR)
R.lock = lambda self: (lambda n, x: (self.fbp(self.noise(n), 2000, 9000) * np.exp(-x / 0.003) + np.sin(2 * np.pi * 220 * x) * np.exp(-x / 0.02) * 0.6) * 0.8)(int(SR * 0.15), np.arange(int(SR * 0.15)) / SR)
R.unlock = lambda self: (lambda n, x: (np.sin(2 * np.pi * 1046.5 * x) * np.exp(-x / 0.12) * (x < 0.4) + np.pad(np.sin(2 * np.pi * 1568 * x[: n - int(0.09 * SR)]) * np.exp(-x[: n - int(0.09 * SR)] / 0.18), (int(0.09 * SR), 0))) * 0.4)(int(SR * 0.7), np.arange(int(SR * 0.7)) / SR)
GEN = {"neon": lambda m, d: m.neon(d), "motor": lambda m, d: m.motor(d), "run": lambda m, d: m.run(), "ching": lambda m, d: m.ching(),
       "slide": lambda m, d: m.slide(d), "grabbox": lambda m, d: m.grabbox(), "whoosh": lambda m, d: m.whoosh2(d),
       "boom": lambda m, d: m.boom(240, 60, 9, 0.3), "cloth": lambda m, d: m.cloth(int(round((d or 0.3) * 30))), "relay": lambda m, d: m.relay(), "sig3": lambda m, d: m.sig3(), "zap": lambda m, d: m.zap(), "swipe": lambda m, d: m.swipe(d), "beep": lambda m, d: m.beep(), "plug": lambda m, d: m.plug(), "tick": lambda m, d: m.tick(), "lock": lambda m, d: m.lock(), "unlock": lambda m, d: m.unlock(), "creak": lambda m, d: m.creak(0.5), "grabbox": lambda m, d: m.grabbox()}

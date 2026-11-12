# SFX «Пустой зал»: синтез кодом по timeline.json (kind, t_sec, gain, pan, dur_sec).
# Классы серии берутся из sfxlib (boom, cloth); новые для зала: сердце, скрип кресла, шёпот, кашель,
# гул толпы, гул прожектора, щелчок рубильника, реле, гудение ламп, шаг по деревянной сцене.
import json, os, sys
import numpy as np
sys.path.insert(0, "/home/user/neuron/skill/scripts/sfx")
from sfxlib import Mixer, SR

class Zal(Mixer):
    def fbp(self, x, lo, hi):   # быстрый полосовой фильтр через FFT
        X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
        m = np.clip((f - lo * 0.8) / (lo * 0.4 + 1e-9), 0, 1) * np.clip((hi * 1.2 - f) / (hi * 0.4), 0, 1)
        return np.fft.irfft(X * m, len(x))
    def heart(self):            # «тук-тук»: два низких глухих удара
        n = int(SR * 0.55); x = self.t(n); out = np.zeros(n)
        for t0, a, f0 in [(0.0, 1.0, 72), (0.17, 0.72, 64)]:
            i = int(t0 * SR); xx = x[: n - i]
            ph = 2 * np.pi * np.cumsum(f0 * np.exp(-xx * 6) + 38) / SR
            out[i:] += a * np.sin(ph) * np.minimum(1, xx / 0.004) * np.exp(-xx / 0.07)
        return np.tanh(out * 1.6) * 0.85
    def creak(self, dur=0.45, f0=780):   # скрип кресла: прерывистое трение, резонанс дерева/металла
        n = int(SR * dur); x = np.linspace(0, 1, n); out = np.zeros(n)
        rate = 55 + 40 * np.sin(np.pi * x) + 10 * self.rng.standard_normal(n).cumsum() / np.sqrt(n)
        ph = np.cumsum(rate / SR); idx = np.where(np.diff(np.floor(ph)) > 0)[0]
        k = np.arange(int(SR * 0.012)) / SR
        grain = (np.sin(2 * np.pi * f0 * k) + 0.6 * np.sin(2 * np.pi * f0 * 2.13 * k) + 0.3 * np.sin(2 * np.pi * f0 * 3.4 * k)) * np.exp(-k / 0.004)
        for i in idx:
            a = 0.5 + 0.5 * self.rng.random(); j = min(len(grain), n - i); out[i:i + j] += a * grain[:j]
        return out * np.sin(np.pi * x) ** 0.5 * 0.35
    def whisper(self, dur=0.8):  # шёпот: шипящие и глухие «слоги»
        n = int(SR * dur); x = np.arange(n) / SR; nz = self.noise(n)
        syl = np.zeros(n); t = 0.02
        while t < dur - 0.08:
            L = 0.07 + 0.09 * self.rng.random(); i0, i1 = int(t * SR), int(min(dur, t + L) * SR)
            syl[i0:i1] += np.sin(np.linspace(0, np.pi, i1 - i0)) ** 1.5 * (0.6 + 0.4 * self.rng.random()); t += L + 0.03 * self.rng.random()
        s = self.fbp(nz, 2500, 8000) * syl + 0.5 * self.fbp(nz, 700, 2200) * syl ** 2
        return s * np.minimum(1, x / 0.03) * np.minimum(1, (dur - x) / 0.06) * 0.9
    def cough(self):
        n = int(SR * 0.5); x = self.t(n); out = np.zeros(n)
        for t0, a in [(0.0, 1.0), (0.2, 0.7)]:
            i = int(t0 * SR); xx = x[: n - i]
            out[i:] += a * (self.fbp(self.noise(n - i), 250, 2200) * 0.8 + np.sin(2 * np.pi * 140 * xx) * 0.3) * np.minimum(1, xx / 0.006) * np.exp(-xx / 0.06)
        return np.tanh(out * 1.3) * 0.8
    def murmur(self, dur):       # гул толпы нарастает и обрывается
        n = int(SR * dur); x = np.linspace(0, 1, n); s = np.zeros(n)
        for _ in range(6):
            w = self.whisper(dur); s += np.roll(w, int(self.rng.random() * n * 0.3)) * (0.5 + 0.5 * self.rng.random())
        babble = self.fbp(self.noise(n), 250, 1200) * (0.6 + 0.4 * np.sin(2 * np.pi * (3 + 2 * x) * x * dur))
        return (s * 0.25 + babble * 0.6) * x ** 1.6 * 0.9
    def hum(self, dur):          # гул прожектора
        n = int(SR * dur); x = self.t(n)
        s = 0.5 * np.sin(2 * np.pi * 100 * x) + 0.2 * np.sin(2 * np.pi * 200 * x) + 0.08 * np.sin(2 * np.pi * 300 * x)
        return (s + 0.35 * self.fbp(self.noise(n), 3000, 6000)) * (0.9 + 0.1 * np.sin(2 * np.pi * 0.4 * x)) * 0.4
    def buzz(self, dur):         # гудение ламп зала
        n = int(SR * dur); x = self.t(n)
        s = sum(a * np.sin(2 * np.pi * f * x) for f, a in [(120, 0.5), (240, 0.3), (360, 0.15), (480, 0.1)])
        return np.tanh(s * 1.5) * np.minimum(1, x / 0.05) * 0.45
    def clack(self):             # большой рубильник: металлический удар + дребезг
        n = int(SR * 0.4); x = self.t(n)
        hit = self.fbp(self.noise(n), 900, 9000) * np.exp(-x / 0.006)
        body = np.sin(2 * np.pi * 130 * x) * np.exp(-x / 0.05)
        ring = sum(a * np.sin(2 * np.pi * f * x) * np.exp(-x / d) for f, a, d in [(1630, 0.25, 0.05), (2870, 0.15, 0.03)])
        rattle = self.fbp(self.noise(n), 2000, 7000) * np.exp(-((x - 0.03) / 0.01) ** 2) * 0.5
        return np.tanh((hit * 1.2 + body + ring + rattle) * 1.3) * 0.9
    def relay(self):             # щелчок реле: свет ряда гаснет
        n = int(SR * 0.2); x = self.t(n)
        return (self.fbp(self.noise(n), 1200, 8000) * np.exp(-x / 0.004) + np.sin(2 * np.pi * 95 * x) * np.exp(-x / 0.035) * 0.7) * 0.8
    def step(self):              # шаг по деревянной сцене
        n = int(SR * 0.25); x = self.t(n)
        thud = np.sin(2 * np.pi * (85 + 60 * np.exp(-x / 0.01)) * x) * np.exp(-x / 0.05)
        wood = sum(a * np.sin(2 * np.pi * f * x) * np.exp(-x / d) for f, a, d in [(420, 0.35, 0.03), (910, 0.2, 0.018)])
        tick = self.fbp(self.noise(n), 1500, 6000) * np.exp(-x / 0.005) * 0.5
        return (thud + wood + tick) * 0.8

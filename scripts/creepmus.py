# Нарастающая жуткая музыка для историй (решение пользователя 12.11.2026): с первой секунды тихий гул,
# к концу — громкий дрожащий кластер, ускоряющееся сердце и визг; на END — резкая тишина.
# from creepmus import creep;  MUS += creep(N, END, hits=[...], heart_from=сек)
import numpy as np
from sfxlib import SR, lp, noise, tt, env, fade, thump

NOTE = lambda m: 440 * 2 ** ((m - 69) / 12)
def _saw(f, n, det=0.0):
    ph = np.cumsum(np.broadcast_to(f * (1 + det), (n,))) / SR; return 2 * (ph % 1) - 1
def _sin(f, n): return np.sin(2 * np.pi * np.cumsum(np.broadcast_to(f, (n,))) / SR)

def creep(N, END, hits=(), heart_from=None, key=50):
    t = tt(N); p = np.clip(t / END, 0, 1); rise = p ** 1.6; on = (t < END).astype(float)
    out = np.zeros((N, 2))
    def add(s, g, pan=0.0):
        out[:, 0] += s * g * min(1, 1 - pan); out[:, 1] += s * g * min(1, 1 + pan)
    # 1) низкий гул с биениями
    sub = _sin(NOTE(key - 24), N) * 0.6 + _sin(NOTE(key - 24) * 1.007, N) * 0.5 + _sin(NOTE(key - 17), N) * 0.25 + lp(noise(N), 80) * 0.6
    add(sub * on, 0.22 + 0.5 * rise)
    # 2) диссонансный кластер (малая секунда + тритон): глухой в начале, яркий и дрожащий к концу
    cl = sum(_saw(NOTE(m), N, d) for m in (key, key + 1, key + 6) for d in (-0.003, 0.004)) / 6
    lo, hi = lp(cl, 300), lp(cl, 1800)
    trem = 1 - 0.45 * (0.5 + 0.5 * np.sin(2 * np.pi * np.cumsum(0.3 + 6 * rise ** 2) / SR))
    add((lo * (1 - rise) + hi * rise) * trem * on, 0.05 + 0.2 * rise, -0.25)
    add((lo * (1 - rise) + hi * rise) * trem[::-1] * on, 0.03 + 0.12 * rise, 0.25)
    # 3) медленно ползущая вверх «скрипка» (глиссандо на квинту) с вибрато
    f = NOTE(key + 12) * 2 ** (7 / 12 * p) * (1 + 0.006 * np.sin(2 * np.pi * 5.5 * t))
    add(_sin(f, N) * on, 0.06 * np.clip((p - 0.25) / 0.75, 0, 1) ** 1.3, 0.2)
    # 4) высокий писк с биениями в последней трети
    add((_sin(2300, N) + _sin(2333, N)) * on, 0.018 * np.clip((p - 0.66) / 0.34, 0, 1) ** 2)
    # 5) вдохи-нарастания (обратные хлопки) перед важными моментами
    for h in hits:
        n = int(SR * 1.2); s = lp(noise(n), 900) * np.linspace(0, 1, n) ** 3
        i = int((h - 1.2) * SR)
        if 0 <= i < N - n: out[i:i + n, 0] += s * 0.35; out[i:i + n, 1] += s * 0.35
    # 6) сердце: ускоряется и громчает
    if heart_from is not None:
        a = heart_from
        while a < END - 0.1:
            k = (a - heart_from) / max(1e-3, END - heart_from); bpm = 62 + 90 * k ** 1.4; g = 0.25 + 0.5 * k
            for d, gg, ff in ((0, 1.0, 48), (0.24, 0.7, 44)):
                s = thump(0.35, ff, 1.0); i = int((a + d) * SR)
                if i + len(s) < N: out[i:i + len(s), :] += (s * g * gg)[:, None]
            a += 60 / bpm
    # резкий обрыв на END
    out *= np.clip((END - t) / 0.04, 0, 1)[:, None]
    return out

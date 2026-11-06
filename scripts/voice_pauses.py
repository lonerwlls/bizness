# Паузы между предложениями (решение пользователя): вставляем тишину ТОЛЬКО внутрь настоящей тишины в записи,
# чтобы не рвать слова. Место ищем по громкости звука (окна по 10 мс), а не по таймингам распознавания.
#   python3 scripts/voice_pauses.py <voice_raw.wav> <raw.voice.ts> <script.txt> <out voice.mp3> <out voice.ts> <out pauses.json>
import json, re, subprocess, sys, wave
import numpy as np
src, ts_in, script, mp3_out, ts_out, pauses_out = sys.argv[1:7]
SR = 48000
x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", src, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout, np.float32)
FR = SR // 100
db = 20 * np.log10(np.array([np.sqrt(np.mean(x[i:i + FR] ** 2)) for i in range(0, len(x) - FR, FR)]) + 1e-9)
floor = np.percentile(db, 10)
quiet = db < floor + 8
# участки тишины ≥ 70 мс: [начало, конец] в секундах
gaps, i = [], 0
while i < len(quiet):
    if quiet[i]:
        j = i
        while j < len(quiet) and quiet[j]: j += 1
        if j - i >= 2: gaps.append((i / 100, j / 100))
        i = j
    else: i += 1
s = open(ts_in, encoding="utf8").read(); V = json.loads(s[s.index("{"): s.rindex("}") + 1]); W = V["words"]
txt = open(script, encoding="utf8").read().strip()
par_last = [re.findall(r"[\w$]+(?:[-.,][\w]+)*", l)[-1] for l in txt.split("\n") if l.strip()]
# проверка распознаванием: слева от паузы последнее слово предложения целиком, справа — первое слово следующего целиком
from faster_whisper import WhisperModel
wm = WhisperModel("medium", device="cpu", compute_type="int8")
SYN = {"vpn": "впн", "вэпээн": "впн", "google": "гугл", "youtube": "ютуб", "ip": "айпи", "cookie": "куки"}
nrm = lambda t: [SYN.get(q, q) for q in (re.sub(r"[^а-яa-z0-9]", "", w.lower().replace("ё", "е")) for w in t.replace("-", " ").split()) if q]
def hear(a, b):
    a, b = max(0.0, a), min(len(x) / SR, b)
    y16 = x[int(a * SR): int(b * SR)][::3]  # 48 кГц -> 16 кГц
    return nrm(" ".join(sg.text for sg in wm.transcribe(y16, language="ru", beam_size=5)[0]))
same = lambda u, v: u == v or (len(u) > 3 and len(v) > 3 and (u.startswith(v[:4]) or v.startswith(u[:4])))
cuts, pi, missed, used = [], 0, [], -1.0
for k, w in enumerate(W[:-1]):
    if not w["end"]: continue
    big = pi < len(par_last) and w["w"] == par_last[pi]
    if big: pi += 1
    last, first = nrm(w["w"])[-1], nrm(W[k + 1]["w"])[0]
    # только тишина между концом слова и НАЧАЛОМ следующего слова (с запасом на сдвиг таймингов распознавания)
    cand = [g for g in gaps if g[0] > used and g[1] - g[0] >= 0.02 and w["t"] - 0.4 <= (g[0] + g[1]) / 2 <= W[k + 1]["e"] + 0.4]
    cand.sort(key=lambda g: -(g[1] - g[0]))  # сначала самые длинные тишины
    ok = None
    for g in cand[:6]:
        c = (g[0] + g[1]) / 2
        L, R = hear(c - 1.6, c), hear(c, c + 1.6)
        if L and R and same(L[-1], last) and same(R[0], first): ok = c; break
    if ok is None:
        missed.append(w["w"])
        for g in cand[:6]:
            c = (g[0] + g[1]) / 2; print("   нет:", w["w"], round(c, 2), hear(c - 1.4, c)[-2:], "|", hear(c, c + 1.4)[:2], "ждём", last, first)
        if not cand: print("   нет тишины в окне:", w["w"], w["e"], W[k + 1]["t"])
        continue
    used = ok
    cuts.append([round(ok, 3), 0.75 if big else 0.45, w["w"]])
cuts.sort()
# баннер рекламы ставится в паузу между предложениями; чтобы он стоял РОВНО в середине ролика, чуть меняем длину пауз:
# до выбранной паузы +a, после −a (на слух незаметно). Длина ролика = озвучка + хвост TAIL (как в ролике), пауза баннера — середина.
import os
TAIL = float(os.environ.get("TAIL", "0"))
if os.environ.get("AD_CENTER") and len(cuts) > 2:
    total = len(x) / SR + sum(d for _, d, _ in cuts) + TAIL
    pos = lambda i: cuts[i][0] + sum(d for c, d, _ in cuts[:i]) + cuts[i][1] / 2  # середина i-й паузы в итоговой озвучке
    i = min(range(len(cuts)), key=lambda i: abs(pos(i) + float(os.environ.get("LEAD", "0")) - total / 2))
    nb, na = i, len(cuts) - i - 1          # пауз до и после выбранной
    need = total / 2 - (pos(i) + float(os.environ.get("LEAD", "0")))  # >0: сдвинуть паузу позже
    a = 2 * need / max(1, nb) if need > 0 else 2 * need / max(1, na)  # пауза сдвигается на половину добавки
    a = max(-0.2, min(0.2, a))
    for j in range(len(cuts)):
        if (need > 0 and j < i) or (need < 0 and j > i): cuts[j][1] = round(cuts[j][1] + (a if need > 0 else a), 3)
    print(f"баннер: пауза после «{cuts[i][2]}», сдвиг пауз на {a:+.3f} с")
parts, prev, x = [], 0, x.copy()
F8 = int(0.008 * SR)  # 8 мс плавного стыка, чтобы не было щелчков
for c, d, _ in cuts:
    i = int(c * SR)
    x[i - F8:i] *= np.linspace(1, 0, F8, dtype=np.float32); x[i:i + F8] *= np.linspace(0, 1, F8, dtype=np.float32)
    parts += [x[prev:i], np.zeros(int(d * SR), np.float32)]; prev = i
parts.append(x[prev:]); y = np.concatenate(parts)
tmp = mp3_out + ".wav"
with wave.open(tmp, "wb") as f:
    f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes((np.clip(y, -1, 1) * 32767).astype("<i2").tobytes())
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-b:a", "160k", mp3_out], check=True)
subprocess.run(["rm", "-f", tmp])
sh = lambda t: t + sum(d for c, d, _ in cuts if c < t)
for w in W: w["t"], w["e"] = round(sh(w["t"]), 3), round(sh(w["e"]), 3)
V["dur"] = round(len(y) / SR, 3)
open(ts_out, "w", encoding="utf8").write("// Fish Audio + тайминги по аудио; паузы между предложениями вставлены в настоящую тишину (scripts/voice_pauses.py).\nexport const VOICE = " + json.dumps(V, ensure_ascii=False) + ";\n")
json.dump(cuts, open(pauses_out, "w"), ensure_ascii=False)
# проверка: в каждой точке вставки громкость исходника на уровне тишины
worst = max(20 * np.log10(np.sqrt(np.mean(x[int(c * SR) - 240: int(c * SR) + 240] ** 2)) + 1e-9) - floor for c, _, _ in cuts)
print(f"пауз {len(cuts)}, без тишины пропущено: {missed}; самое громкое место вставки: +{worst:.1f} дБ над тишиной; длина {V['dur']} с")

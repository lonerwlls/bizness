# Тайминги слов по аудио: faster-whisper распознаёт речь со временем слов, затем слова сценария
# сопоставляются с распознанными (difflib); несовпавшие получают время по соседям.
# python3 scripts/fish_align.py <voice.mp3> <script.txt> <out.voice.ts> [ru|en]
# Нужно: pip install faster-whisper (модель small скачается сама, ~500 МБ).
import difflib, json, re, subprocess, sys
import numpy as np
from faster_whisper import WhisperModel

mp3, script, out = sys.argv[1:4]
lang = sys.argv[4] if len(sys.argv) > 4 else "ru"

pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", mp3, "-f", "s16le", "-ac", "1", "-ar", "16000", "-"],
                     capture_output=True, check=True).stdout
audio = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768
dur = round(len(audio) / 16000, 3)

model = WhisperModel("small", device="cpu", compute_type="int8")
segs, _ = model.transcribe(audio, language=lang, word_timestamps=True, vad_filter=False)
heard = [(w.start, w.end, w.word.strip()) for s in segs for w in s.words]

norm = lambda w: re.sub(r"[^\w$]", "", w.lower().replace("ё", "е"))
text = open(script, encoding="utf8").read()
# Слова сценария с признаками: end — после слова конец предложения, pause — запятая/тире/двоеточие.
words = []
for m in re.finditer(r"[\w$]+(?:[-.,][\w]+)*", text):
    after = text[m.end():m.end() + 4]
    words.append({"w": m.group(0), "end": bool(re.match(r"\s*[.!?…]", after)),
                  "pause": bool(re.match(r"\s*[,:—–-]", after))})

A = [norm(w["w"]) for w in words]
B = [norm(h[2]) for h in heard]
t = [None] * len(words)
for blk in difflib.SequenceMatcher(None, A, B, autojunk=False).get_matching_blocks():
    for k in range(blk.size):
        t[blk.a + k] = heard[blk.b + k][:2]
matched = sum(x is not None for x in t)

# Несовпавшие слова: равномерно между ближайшими известными соседями.
i = 0
while i < len(t):
    if t[i] is not None:
        i += 1
        continue
    j = i
    while j < len(t) and t[j] is None:
        j += 1
    a = t[i - 1][1] if i > 0 else 0.0
    b = t[j][0] if j < len(t) else dur
    step = (b - a) / (j - i)
    for k in range(i, j):
        t[k] = (a + step * (k - i), a + step * (k - i + 1))
    i = j

for w, (s, e) in zip(words, t):
    w["t"], w["e"] = round(s, 3), round(e, 3)
res = [{"t": w["t"], "e": w["e"], "w": w["w"], "end": w["end"], "pause": w["pause"]} for w in words]
with open(out, "w", encoding="utf8") as f:
    f.write("// Сгенерировано tts_fish.mjs (Fish Audio + тайминги по аудио): длительность озвучки (сек) и слова.\n")
    f.write("export const VOICE = " + json.dumps({"dur": dur, "words": res}, ensure_ascii=False) + ";\n")
print(f"ok {dur} сек, слов {len(words)}, совпало по звуку {matched}")

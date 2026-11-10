# Тайминги слов по готовому аудио (локально, faster-whisper): python3 scripts/align_words.py <audio> <script.txt> <lang> > words.json
# Слова берутся из сценария (как написано), времена — из распознавания; непойманные слова — по соседям.
import sys, json, re, difflib, subprocess
import numpy as np
from faster_whisper import WhisperModel
audio, script, lang = sys.argv[1], sys.argv[2], sys.argv[3]
text = re.sub(r"\s+", " ", open(script, encoding="utf8").read().replace("́", "")).strip()
toks = []
for m in re.finditer(r"[^\W_]+(?:[-'’][^\W_]+)*", text):
    after = text[m.end():m.end() + 3]
    toks.append({"w": m.group(0), "end": bool(re.match(r"\s*[.!?…]", after)), "pause": bool(re.match(r"\s*[,:—–-]", after))})
model = WhisperModel("small", device="cpu", compute_type="int8")
pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", audio, "-f", "s16le", "-ac", "1", "-ar", "16000", "-"], capture_output=True, check=True).stdout
wav = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768
segs, _ = model.transcribe(wav, language=lang, word_timestamps=True, vad_filter=False, condition_on_previous_text=False)
rec = [(re.sub(r"[^\w-]", "", w.word.lower()), w.start, w.end) for s in segs for w in s.words]
rec = [r for r in rec if r[0]]
norm = lambda s: s.lower().replace("ё", "е")
A = [norm(t["w"]) for t in toks]; B = [norm(r[0]) for r in rec]
T = [None] * len(toks)
for blk in difflib.SequenceMatcher(None, A, B, autojunk=False).get_opcodes():
    tag, i1, i2, j1, j2 = blk
    if tag == "equal":
        for k in range(i2 - i1): T[i1 + k] = (rec[j1 + k][1], rec[j1 + k][2])
    elif tag == "replace" and j2 - j1 == i2 - i1:  # «польки» вместо «полки»: один к одному
        for k in range(i2 - i1): T[i1 + k] = (rec[j1 + k][1], rec[j1 + k][2])
    elif tag == "replace" and j2 > j1:
        s0, e0 = rec[j1][1], rec[j2 - 1][2]; n = i2 - i1
        for k in range(n): T[i1 + k] = (s0 + (e0 - s0) * k / n, s0 + (e0 - s0) * (k + 1) / n)
# пропуски — равномерно между соседями
i = 0
while i < len(T):
    if T[i] is None:
        j = i
        while j < len(T) and T[j] is None: j += 1
        a = T[i - 1][1] if i > 0 else 0.0
        b = T[j][0] if j < len(T) else a + 0.4 * (j - i)
        for k in range(i, j): T[k] = (a + (b - a) * (k - i) / (j - i), a + (b - a) * (k - i + 1) / (j - i))
        i = j
    else: i += 1
miss = sum(1 for o in difflib.SequenceMatcher(None, A, B, autojunk=False).get_opcodes() if o[0] != "equal")
print(json.dumps([{"t": round(t[0], 3), "e": round(t[1], 3), **tk} for t, tk in zip(T, toks)], ensure_ascii=False))
print(f"слов {len(toks)}, распознано {len(rec)}, расхождений {miss}", file=sys.stderr)

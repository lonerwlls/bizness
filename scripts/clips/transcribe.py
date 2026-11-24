import sys, wave, numpy as np, json
from faster_whisper import WhisperModel
w = wave.open(sys.argv[1]); a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
m = WhisperModel("small", compute_type="int8")
segs, info = m.transcribe(a, word_timestamps=True, vad_filter=True)
out = []
for s in segs:
    out.append({"s": s.start, "e": s.end, "t": s.text.strip(), "w": [[x.word, x.start, x.end] for x in s.words]})
json.dump({"lang": info.language, "segs": out}, open(sys.argv[2], "w"), ensure_ascii=False)
print(info.language, len(out))

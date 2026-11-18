# Тайминги слов по аудио (для Fish Audio, который их не отдаёт): ffmpeg -i voice.mp3 -ac 1 -ar 16000 -f s16le v.raw && python3 scripts/words_whisper.py v.raw - words.json
import sys, json
from faster_whisper import WhisperModel
m = WhisperModel("small", device="cpu", compute_type="int8")
import numpy as np
aud = np.fromfile(sys.argv[1], dtype=np.int16).astype(np.float32)/32768
segs, _ = m.transcribe(aud, language="ru", word_timestamps=True)
out = [dict(w=w.word.strip(), t=round(w.start,3), e=round(w.end,3)) for s in segs for w in s.words]
json.dump(out, open(sys.argv[3], "w"), ensure_ascii=False)
print(len(out)); print(" ".join(f"{o['w']}@{o['t']}" for o in out))

# Реплика через Fish Audio + тайминги слов по аудио (Fish их не отдаёт).
# python3 tts_fish_line.py <out.mp3> <reference_id> "текст"  → out.mp3 + out.json [{w,t,e}]
import sys, os, re, json, subprocess, tempfile
import numpy as np
from faster_whisper import WhisperModel
out, ref, text = sys.argv[1], sys.argv[2], sys.argv[3]
show = sys.argv[4] if len(sys.argv) > 4 else text  # что показывать в субтитрах (то же число слов)
with tempfile.NamedTemporaryFile('w', suffix='.txt', delete=False) as f: f.write(text); tf = f.name
subprocess.run(['node', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tts_fish.mjs'), tf, out, ref], check=True, stdout=subprocess.DEVNULL)
os.remove(tf)
raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', out, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True).stdout
m = WhisperModel('small', device='cpu', compute_type='int8')
segs, _ = m.transcribe(np.frombuffer(raw, np.float32), language='ru', word_timestamps=True)
hw = [w for s in segs for w in (s.words or []) if re.search(r'\w', w.word)]
words = re.findall(r"[\w\-]+", show)
import difflib
def norm(x): return re.sub(r'[^\w]', '', x.lower()).replace('ё', 'е')
sw = re.findall(r"[\w\-]+", text)  # слова, которые реально произносились (say), по ним выравниваем
hn = [norm(h.word) for h in hw]; sn = [norm(w) for w in sw]
T = [None] * len(sw)
for a, b, n in difflib.SequenceMatcher(None, sn, hn, autojunk=False).get_matching_blocks():
    for k in range(n): T[a + k] = (hw[b + k].start, hw[b + k].end)
total = len(raw) / 4 / 16000
known = [k for k, t in enumerate(T) if t]
for k in range(len(sw)):  # недостающие — между соседями
    if T[k]: continue
    p_ = max([j for j in known if j < k], default=None); n_ = min([j for j in known if j > k], default=None)
    a = T[p_][1] if p_ is not None else 0.0; b = T[n_][0] if n_ is not None else total
    cnt = (n_ if n_ is not None else len(sw)) - (p_ if p_ is not None else -1) - 1
    pos = k - (p_ if p_ is not None else -1) - 1; step = (b - a) / max(cnt, 1)
    T[k] = (a + step * pos, a + step * (pos + 1))
# слова для показа (show) могут отличаться от say числом слов («GTA 6» vs «ГэТэА шесть») — сопоставляем по порядку с пропорцией
if len(words) == len(sw): res = [{'w': w, 't': round(t[0], 3), 'e': round(t[1], 3)} for w, t in zip(words, T)]
else:
    res = []
    for k, w in enumerate(words):
        j = min(len(sw) - 1, round(k * len(sw) / len(words))); res.append({'w': w, 't': round(T[j][0], 3), 'e': round(T[j][1], 3)})
json.dump(res, open(out[:-4] + '.json', 'w'), ensure_ascii=False)
print('ok', out, len(words), 'words', f'matched {len(known)}/{len(sw)}')

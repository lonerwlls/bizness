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
res = []
if len(hw) == len(words):
    res = [{'w': w, 't': round(h.start, 3), 'e': round(h.end, 3)} for w, h in zip(words, hw)]
else:  # распределяем по длине слов внутри звучащего промежутка
    a = hw[0].start if hw else 0.0; b = hw[-1].end if hw else len(raw) / 4 / 16000
    tot = sum(len(w) + 1 for w in words); c = a
    for w in words:
        d = (b - a) * (len(w) + 1) / tot; res.append({'w': w, 't': round(c, 3), 'e': round(c + d * 0.9, 3)}); c += d
json.dump(res, open(out[:-4] + '.json', 'w'), ensure_ascii=False)
print('ok', out, len(words), 'words', 'aligned' if len(hw) == len(words) else f'spread ({len(hw)} heard)')

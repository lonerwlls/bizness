# Речь стримера в отрезке [a, b] (unix-время): python3 transcribe.py A B [DIR]
import glob, os, sys, subprocess, numpy as np
from faster_whisper import WhisperModel
a, b = int(sys.argv[1]), int(sys.argv[2]); D = sys.argv[3] if len(sys.argv) > 3 else "/tmp/clipper"
segs = sorted((int(os.path.basename(p)[:-3]), p) for p in glob.glob(D + "/buf/*.ts"))
use = [x for x in segs if a - 12 <= x[0] <= b]
lst = D + "/tr_list.txt"; open(lst, "w").write("".join("file '%s'\n" % p for _, p in use))
pcm = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(a - use[0][0]), "-t", str(b - a), "-f", "concat", "-safe", "0", "-i", lst,
                      "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True).stdout
m = WhisperModel("small", device="cpu", compute_type="int8", cpu_threads=4)
s, _ = m.transcribe(np.frombuffer(pcm, np.float32), language="ru", vad_filter=True, beam_size=1)
for x in s: print("%3.0f: %s" % (x.start, x.text.strip()))

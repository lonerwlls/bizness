# Клип 16:9 -> шортс 9:16 (центр без вебки) + субтитры внизу по 2-4 слова, активное слово жёлтое.
import sys, subprocess, re, numpy as np
from faster_whisper import WhisperModel
src, dst = sys.argv[1], sys.argv[2]
raw = subprocess.run(["ffmpeg","-loglevel","error","-i",src,"-ac","1","-ar","16000","-f","f32le","-"],capture_output=True).stdout
m = WhisperModel("small", device="cpu", compute_type="int8")
segs, _ = m.transcribe(np.frombuffer(raw, np.float32), language="en", vad_filter=True, word_timestamps=True)
words = [w for s in segs for w in (s.words or []) if w.word.strip()]
chunks, cur = [], []
for w in words:
    cur.append(w)
    end_sent = re.search(r"[.?!,]$", w.word.strip())
    if len(cur) >= 4 or (len(cur) >= 2 and end_sent) or (len(cur) and w is words[-1]):
        chunks.append(cur); cur = []
    elif len(cur) > 1 and w.start - cur[-2].end > 0.6:
        chunks.append(cur[:-1]); cur = [w]
if cur: chunks.append(cur)
def ts(t): t = max(t, 0); return f"{int(t//3600)}:{int(t%3600//60):02d}:{t%60:05.2f}"
def clean(s): return re.sub(r"[{}\\]", "", s.strip()).upper()
ev = []
for c in chunks:
    for i, w in enumerate(c):
        st = w.start; en = c[i+1].start if i + 1 < len(c) else min(w.end + 0.4, c[-1].end + 0.6)
        txt = " ".join(("{\\c&H00E6FF&}" + clean(x.word) + "{\\c&HFFFFFF&}") if j == i else clean(x.word) for j, x in enumerate(c))
        ev.append(f"Dialogue: 0,{ts(st)},{ts(en)},S,,0,0,0,,{txt}")
ass = f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: S,Inter Black,84,&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,7,3,2,70,70,430,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
""" + "\n".join(ev) + "\n"
import os; assf = "/home/user/stream_watch/clips/" + os.path.basename(dst) + ".ass"; open(assf, "w").write(ass)
vf = f"crop=ih*9/16:ih:(iw-ih*9/16)/2:0,scale=1080:1920:flags=lanczos,unsharp=5:5:0.6,ass={assf}"
subprocess.run(["ffmpeg","-y","-loglevel","error","-i",src,"-vf",vf,"-r","30","-c:v","libx264","-preset","medium","-crf","20","-c:a","aac","-b:a","160k","-movflags","+faststart",dst], check=True)
print("SHORT", dst, len(words), "words")

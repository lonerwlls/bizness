# Ищет всплески чата, вырезает клипы (-45..+15 с), делает кадры и расшифровку.
import json, os, glob, time, subprocess, statistics, datetime as dt, re, sys
W = "/home/user/stream_watch"; SEG = W + "/seg"; CL = W + "/clips"
STATE = W + "/state.json"
st = json.load(open(STATE)) if os.path.exists(STATE) else {"done": []}
now = time.time()
msgs = [m for m in (json.loads(l) for l in open(W + "/chat.jsonl")) if m["t"] > now - 3600] if os.path.exists(W + "/chat.jsonl") else []
HYPE = re.compile(r"(LUL|KEKW|OMEGALUL|LMAO|LOL|ICANT|💀|😂|🤣|POG|W+\b|CLIP|NO WAY|WTF|HOLY|\?\?\?|Aware|monkaS|Sadge|o7|GG|RIP)", re.I)
BIN = 10
bins = {}
for m in msgs:
    b = int(m["t"] // BIN); d = bins.setdefault(b, [0, 0, []]); d[0] += 1
    if HYPE.search(m["m"]): d[1] += 1
    d[2].append(m["m"])
if not bins: print("no chat yet"); sys.exit()
lo, hi = min(bins), max(bins)
rates = [bins.get(b, [0])[0] for b in range(lo, hi + 1)]
base = max(statistics.median(rates), 1)
# окно 30 с
cands = []
for b in range(lo + 3, hi + 1):
    win = [bins.get(x, [0, 0, []]) for x in range(b - 2, b + 1)]
    n = sum(w[0] for w in win); h = sum(w[1] for w in win)
    score = n / (3 * base) + 2 * h / (3 * base)
    if (n >= 3 * base * 1.6 and h >= max(3, 0.3 * n)) or (n >= 3 * base * 1.1 and h >= max(3, 0.6 * n)):
        cands.append((score, b * BIN, n, h, [m for w in win for m in w[2]]))
cands.sort(reverse=True)
picked = []
for c in cands:
    if any(abs(c[1] - p[1]) < 90 for p in picked + [(0, d) for d in st["done"]]): continue
    if now - c[1] < 40: continue  # ждём, пока запишется хвост
    picked.append(c)
segs = sorted(glob.glob(SEG + "/*.ts"))
def seg_t(p): return dt.datetime.strptime(os.path.basename(p)[:-3], "%Y%m%d-%H%M%S").replace(tzinfo=dt.timezone.utc).timestamp()
for score, t, n, h, texts in picked[:5]:
    a, b = t - 45, t + 20
    use = [p for p in segs if seg_t(p) < b and seg_t(p) + 60 > a]
    if not use: continue
    name = dt.datetime.fromtimestamp(t, dt.timezone.utc).strftime("%H%M%S")
    lst = f"{CL}/{name}.txt"; open(lst, "w").write("".join(f"file '{p}'\n" for p in use))
    off = a - seg_t(use[0])
    out = f"{CL}/{name}.mp4"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", lst, "-ss", str(max(off, 0)), "-t", "65", "-c:v", "libx264", "-preset", "veryfast", "-crf", "23", "-c:a", "aac", out])
    for i, s in enumerate((10, 30, 45, 55)):
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", str(s), "-i", out, "-frames:v", "1", "-vf", "scale=640:-1", f"{CL}/{name}_f{i}.jpg"])
    tr = ""
    try:
        from faster_whisper import WhisperModel
        mdl = WhisperModel("small", device="cpu", compute_type="int8")
        import numpy as np
        raw = subprocess.run(["ffmpeg","-loglevel","error","-i",out,"-ac","1","-ar","16000","-f","f32le","-"],capture_output=True).stdout
        segs_w, _ = mdl.transcribe(np.frombuffer(raw, np.float32), language="en", vad_filter=True)
        tr = "\n".join(f"[{s.start:4.0f}s] {s.text.strip()}" for s in segs_w)
    except Exception as e:
        tr = f"(no transcript: {e})"
    json.dump({"t": t, "utc": dt.datetime.fromtimestamp(t, dt.timezone.utc).isoformat(), "score": round(score, 1), "msgs": n, "hype": h,
               "chat": texts[:60], "transcript": tr}, open(f"{CL}/{name}.json", "w"), ensure_ascii=False, indent=1)
    subprocess.run(["bash","/tmp/claude-0/-home-user-bizness/e80367d3-b9c9-510a-966b-8a02bbc9d722/scratchpad/sw/make_169.sh",out,"/tmp/claude-0/-home-user-bizness/e80367d3-b9c9-510a-966b-8a02bbc9d722/scratchpad/highlights/"+name+"_16x9.mp4"])
    st["done"].append(t); print("CLIP", name, round(score, 1), n, h)
json.dump(st, open(STATE, "w"))
# чистим старые куски (> 40 мин)
for p in segs:
    if now - seg_t(p) > 2400: os.remove(p)
print("chat msgs:", len(msgs), "base/10s:", base, "segments:", len(segs))

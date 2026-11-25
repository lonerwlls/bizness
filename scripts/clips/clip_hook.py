# Нарезка по правилам пользователя: ≤30 с, ХУК (самый яркий кусок) первыми ~2 с, без приближений,
# слабый кроп из центра + размытый фон, громкие «вжух»/удар, баннер в середине (стоп-кадр темнеет),
# звук без провала перед баннером, громкость выравнивается один раз.
# python3 scripts/clips/clip_hook.py <конфиг.json>
# конфиг: {"banner": путь, "key": "0x2b873b" | null (зелёный фон баннера; null — фона нет), "out": папка,
#          "crop": [w,h,x,y], "clips": [{"name","src","hook":[a,b],"main":[a,b],"ad":t,"hits":[t,...]}]}
import sys, json, subprocess, wave, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
import numpy as np
from sfxlib import SR, whoosh, thump
C = json.load(open(sys.argv[1])); O = C["out"]; os.makedirs(O, exist_ok=True)
BAN = C["banner"]; KEY = C.get("key")
BLEN = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", BAN], capture_output=True, text=True).stdout)
HOLD = BLEN + 0.15
cw, ch, cx, cy = C.get("crop", [864, 1000, 528, 0]); fh = round(1080 * ch / cw / 2) * 2
def run(*a): subprocess.run(["ffmpeg", "-v", "error", "-y", *a], check=True)
VF = (f"fps=30,split[a][b];[a]crop=608:1080:656:0,scale=1080:1920,boxblur=30:2,eq=brightness=-0.15[bg];"
      f"[b]crop={cw}:{ch}:{cx}:{cy},scale=1080:{fh}:flags=lanczos,unsharp=5:5:0.6[fg];[bg][fg]overlay=0:{(1920 - fh) // 2},format=yuv420p")
def vid(src, s, e, out):
    run("-ss", f"{s}", "-t", f"{e - s}", "-i", src, "-filter_complex", VF, "-an", "-c:v", "libx264", "-preset", "slow", "-crf", "15", "-r", "30", out)
for c in C["clips"]:
    n, src = c["name"], c["src"]; (h0, h1), (m0, m1), X = c["hook"], c["main"], c["ad"]
    p = [f"{O}/_{i}.mp4" for i in range(4)]
    vid(src, h0, h1, p[0]); vid(src, m0, X, p[1]); vid(src, X, m1, p[3])
    run("-sseof", "-0.05", "-i", p[1], "-frames:v", "1", f"{O}/_last.png")
    bk = f"colorkey={KEY}:0.09:0.04,despill=type=green:mix=0.6:expand=0," if KEY else ""
    bw = 1766 if KEY else 1112   # без зелёного фона баннер во всю ширину (>30% экрана)
    fc = (f"[0:v]loop=loop=-1:size=1,trim=duration={HOLD},setpts=N/30/TB,fps=30,eq=brightness=-0.22:saturation=0.6,boxblur=4:1[bg];"
          f"[1:v]format=rgba,{bk}scale={bw}:-2,fade=in:st=0:d=0.1:alpha=1,fade=out:st={BLEN - 0.15}:d=0.15:alpha=1[bn];"
          f"[bg][bn]overlay=(W-w)/2:(H-h)/2:eof_action=pass,format=yuv420p[v]")
    run("-i", f"{O}/_last.png", "-i", BAN, "-filter_complex", fc, "-map", "[v]", "-t", f"{HOLD}", "-c:v", "libx264", "-preset", "slow", "-crf", "15", "-r", "30", p[2])
    open(f"{O}/_l.txt", "w").write("".join(f"file '{x}'\n" for x in p))
    run("-f", "concat", "-safe", "0", "-i", f"{O}/_l.txt", "-c", "copy", f"{O}/_v.mp4")
    HL = h1 - h0; LA = HL + (X - m0); TOT = HL + (m1 - m0) + HOLD
    def T(t): return HL + (t - m0) + (HOLD if t >= X else 0)   # время источника -> время ролика
    N = int(SR * (TOT + 0.5)); fx = np.zeros(N)
    def put(t, s, g):
        i = int(t * SR); k = min(len(s), N - i)
        if 0 <= i < N: fx[i:i + k] += s[:k] * g
    put(0.0, whoosh(0.45, 300, 4000), 1.6); put(0.05, thump(0.6, 55, 1.3), 1.3)
    put(HL - 0.3, whoosh(0.4, 4000, 300), 1.8); put(HL, thump(0.5, 60, 1.3), 1.2)       # переход хук -> начало
    for h in c.get("hits", []):
        if m0 <= h <= m1: put(T(h) - 0.3, whoosh(0.35, 400, 5000), 1.8); put(T(h), thump(0.6, 55, 1.3), 1.4)
    put(LA - 0.25, whoosh(0.35, 4000, 300), 1.4)
    with wave.open(f"{O}/_fx.wav", "wb") as f:
        f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes((np.clip(fx, -1, 1) * 32767).astype(np.int16).tobytes())
    ms = lambda t: int(t * 1000)
    af = (f"[0:a]atrim={h0}:{h1},asetpts=PTS-STARTPTS,afade=t=out:st={HL - 0.08}:d=0.08[gh];"
          f"[0:a]atrim={m0}:{X},asetpts=PTS-STARTPTS,adelay={ms(HL)}|{ms(HL)}[ga];"
          f"[0:a]atrim={X}:{m1},asetpts=PTS-STARTPTS,adelay={ms(LA + HOLD)}|{ms(LA + HOLD)}[gb];"
          f"[1:a]volume=2.5,adelay={ms(LA)}|{ms(LA)}[ad];[2:a]aformat=channel_layouts=stereo,volume=1.6[fx];"
          f"[gh][ga][gb][ad][fx]amix=inputs=5:duration=longest:normalize=0,atrim=0:{TOT},loudnorm=I=-14:TP=-1.5,alimiter=limit=0.9,afade=t=out:st={TOT - 0.3}:d=0.3[a]")
    run("-i", src, "-i", BAN, "-i", f"{O}/_fx.wav", "-i", f"{O}/_v.mp4", "-filter_complex", af,
        "-map", "3:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "-t", f"{TOT}", f"{O}/{n}.mp4")
    for x in p + [f"{O}/_last.png", f"{O}/_l.txt", f"{O}/_v.mp4", f"{O}/_fx.wav"]: os.remove(x)
    print(n, round(TOT, 1), "сек, реклама с", round(LA, 1))

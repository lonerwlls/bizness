# Нарезка игрового видео (без вебки): вертикаль 9:16 из центра, громкие «вжух»+удар на ярких словах (БЕЗ приближений — решение пользователя),
# баннер в середине (стоп-кадр темнеет, зелёный фон вырезан, по центру, >30% экрана).
# python3 scripts/clips/clip_game.py <папка с src.mp4 и banner.mp4>; моменты — в CLIPS (начало, конец, время рекламы, яркие слова)
import sys, subprocess, wave, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
import numpy as np
from sfxlib import SR, whoosh, thump, fade
D = sys.argv[1]; SRC = f"{D}/src.mp4"; BAN = f"{D}/banner.mp4"; O = f"{D}/out"; os.makedirs(O, exist_ok=True)
BLEN = 4.07; PRE = 0.0; HOLD = PRE + BLEN + 0.15  # баннер сразу, без тишины перед ним
CLIPS = {
 "1_zasada": (430.3, 454.3, 441.9, [434.8, 442.3, 444.1, 446.4, 451.6]),
 "2_tvist_bog": (265.6, 304.2, 283.0, [268.7, 274.0, 274.8, 280.9, 301.1]),
 "3_simpl": (116.0, 136.4, 127.4, [120.1, 122.1, 129.5, 132.9]),
 "4_gryaz": (536.8, 561.3, 545.4, [542.5, 548.6, 556.8, 558.5]),
}
def run(*a): subprocess.run(["ffmpeg", "-v", "error", "-y", *a], check=True)
def zexpr(hits, dur):
    z = f"1.06+0.05*it/{dur:.2f}"
    for h in hits:
        z += f"+if(between(it,{h-0.1:.2f},{h:.2f}),0.24*(it-{h-0.1:.2f})/0.1,if(gt(it,{h:.2f}),0.24*exp(-(it-{h:.2f})/0.45),0))"
    sh = "+".join(f"if(between(it,{h:.2f},{h+0.35:.2f}),14*sin(it*70)*(1-(it-{h:.2f})/0.35),0)" for h in hits) or "0"
    return z, sh
def part(s, e, hits, out):
    d = e - s; hs = [h - s for h in hits if s - 0.1 <= h < e]
    z, sh = zexpr(hs, d)
    # слабое приближение: кадр 864x1080 из центра (видно больше), сверху/снизу — размытый фон; лёгкая резкость против «пикселей»
    vf = ("fps=30,split[a][b];[a]crop=608:1080:656:0,scale=1080:1920,boxblur=30:2,eq=brightness=-0.15[bg];"
          "[b]crop=864:1080:528:0,scale=1080:1350:flags=lanczos,unsharp=5:5:0.6[fg];[bg][fg]overlay=0:285,format=yuv420p")
    run("-ss", f"{s}", "-t", f"{d}", "-i", SRC, "-filter_complex", vf, "-an", "-c:v", "libx264", "-preset", "slow", "-crf", "15", out)
for name, (a, b, X, hits) in CLIPS.items():
    pa, pb, pf = f"{O}/_a.mp4", f"{O}/_b.mp4", f"{O}/_f.mp4"
    part(a, X, hits, pa); part(X, b, hits, pb)
    # стоп-кадр: последний кадр части A, затемнён, баннер без зелёного фона по центру
    run("-sseof", "-0.05", "-i", pa, "-frames:v", "1", f"{O}/_last.png")
    fc = (f"[0:v]loop=loop=-1:size=1,trim=duration={HOLD},setpts=N/30/TB,fps=30,"
          f"eq=brightness=-0.22:saturation=0.6,boxblur=4:1[bg];"
          f"[1:v]format=rgba,colorkey=0x2b873b:0.09:0.04,despill=type=green:mix=0.6:expand=0,scale=1766:-2,"
          f"fade=in:st=0:d=0.1:alpha=1,fade=out:st={BLEN-0.2}:d=0.2:alpha=1,setpts=PTS-STARTPTS+{PRE}/TB[bn];"
          f"[bg][bn]overlay=(W-w)/2:(H-h)/2+28:eof_action=pass,format=yuv420p[v]")
    run("-i", f"{O}/_last.png", "-i", BAN, "-filter_complex", fc, "-map", "[v]", "-t", f"{HOLD}", "-c:v", "libx264", "-preset", "slow", "-crf", "15", pf)
    open(f"{O}/_l.txt", "w").write(f"file '{pa}'\nfile '{pf}'\nfile '{pb}'\n")
    run("-f", "concat", "-safe", "0", "-i", f"{O}/_l.txt", "-c", "copy", f"{O}/_v.mp4")
    # звуки: вжух перед приближением и глухой удар на нём (время уже с учётом паузы под рекламу)
    LA = X - a; TOT = (b - a) + HOLD; N = int(SR * (TOT + 0.5)); fx = np.zeros(N)
    def put(t, s, g):
        i = int(t * SR); n = min(len(s), N - i)
        if 0 <= i < N: fx[i:i + n] += s[:n] * g
    put(0.0, whoosh(0.45, 300, 4000), 1.6)
    for h in hits:
        t = h - a if h < X else h - a + HOLD
        put(t - 0.3, whoosh(0.35, 400, 5000), 1.8); put(t, thump(0.6, 55, 1.3), 1.4)  # «вжух» громко
    put(LA, whoosh(0.4, 4000, 300), 1.4)
    fx = np.clip(fx, -1, 1)
    with wave.open(f"{O}/_fx.wav", "wb") as f:
        f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes((fx * 32767).astype(np.int16).tobytes())
    ms = lambda t: int(t * 1000)
    af = (f"[0:a]atrim={a}:{X},asetpts=PTS-STARTPTS,volume=1.0[ga];"
          f"[0:a]atrim={X}:{b},asetpts=PTS-STARTPTS,adelay={ms(LA + HOLD)}|{ms(LA + HOLD)}[gb];"
          f"[1:a]volume=2.2,adelay={ms(LA + PRE)}|{ms(LA + PRE)}[ad];"
          f"[2:a]aformat=channel_layouts=stereo,volume=1.6[fx];"
          f"[ga][gb][ad][fx]amix=inputs=4:duration=longest:normalize=0,atrim=0:{TOT},loudnorm=I=-14:TP=-1.5,alimiter=limit=0.9,afade=t=out:st={TOT-0.3}:d=0.3[a]")
    run("-i", SRC, "-i", BAN, "-i", f"{O}/_fx.wav", "-i", f"{O}/_v.mp4", "-filter_complex", af,
        "-map", "3:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "-t", f"{TOT}", f"{O}/{name}.mp4")
    for p in [pa, pb, pf, f"{O}/_last.png", f"{O}/_l.txt", f"{O}/_v.mp4", f"{O}/_fx.wav"]: os.remove(p)
    print(name, round(TOT, 1), "реклама с", round(LA, 1))

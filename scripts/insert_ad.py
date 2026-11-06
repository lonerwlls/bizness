# Рекламная вставка (решение пользователя: КАЖДЫЙ ролик, строго в середине).
# Баннер ads/ad.mp4 (зелёный фон) ставится по центру кадра во всю ширину, зелёный убирается, баннер ускорен в 1.3 раза
# (как в примере пользователя). На время баннера ролик стоит на паузе (стоп-кадр, звук ролика молчит), потом продолжается.
# Правила NATRIA (natriamedia.ru/pravila): баннер СТРОГО в середине ролика (3.1), ровно по центру экрана и не меньше 25% площади
# экрана (3.2), ускорение не больше 1.3x (3.6), хромакей убран полностью (2.8). Место паузы — промежуток между словами, ближайший к
# середине исходного ролика: тогда баннер стоит ровно посередине и готового ролика (середина ± 0,1 с), и слово не режется.
#   python3 scripts/insert_ad.py <видео.mp4> <слова: voice.ts | words.json | -> [сдвиг_озвучки_сек] [выход.mp4]
import json, subprocess, sys, os

AD, SPEED = "ads/ad.mp4", 1.3
src = sys.argv[1]
words_src = sys.argv[2] if len(sys.argv) > 2 else "-"
lead = float(sys.argv[3]) if len(sys.argv) > 3 else 0.0
out = sys.argv[4] if len(sys.argv) > 4 else src.replace(".mp4", "_ad.mp4")

probe = lambda f: float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], capture_output=True, text=True).stdout)
dur, ad_dur = probe(src), probe(AD) / SPEED
mid = dur / 2

# промежутки между словами (середина промежутка)
cuts = []
if words_src != "-":
    s = open(words_src, encoding="utf8").read()
    if words_src.endswith(".ts"):
        W = json.loads(s[s.index("{"): s.rindex("}") + 1])["words"]
        for a, b in zip(W, W[1:]):
            cuts.append((a["e"] + b["t"]) / 2 + lead)
    else:  # words.json: [[start, end, word], ...]
        W = json.loads(s)
        for a, b in zip(W, W[1:]):
            cuts.append((a[1] + b[0]) / 2 + lead)
T = min(cuts, key=lambda c: abs(c - mid)) if cuts else mid
T = round(T * 30) / 30  # ровно на кадр
print(f"ролик {dur:.2f} с, середина {mid:.2f} с, вставка в {T:.2f} с, баннер {ad_dur:.2f} с")

fc = f"""
[0:v]split=3[va][vb][vf];
[va]trim=0:{T},setpts=PTS-STARTPTS[A];
[vb]trim=start={T},setpts=PTS-STARTPTS[B];
[vf]trim=start={T}:duration=0.05,setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration={ad_dur + 0.2},trim=0:{ad_dur},setpts=PTS-STARTPTS,eq=brightness=-0.06:saturation=0.85,gblur=sigma=6[F0];
[1:v]setpts=PTS/{SPEED},fps=30,chromakey=0x00FE00:0.30:0.06,despill=type=green,scale=1150:-2,crop=1080:ih,format=yuva420p[ad];
[F0][ad]overlay=(W-w)/2:(H-h)/2:shortest=1:format=auto[F];
[A][F][B]concat=n=3:v=1:a=0[v];
[0:a]aformat=sample_rates=48000:channel_layouts=stereo,asplit=2[a1][a2];
[a1]atrim=0:{T},asetpts=PTS-STARTPTS[aA];
[a2]atrim=start={T},asetpts=PTS-STARTPTS[aB];
[1:a]aformat=sample_rates=48000:channel_layouts=stereo,atempo={SPEED},volume=8dB,apad,atrim=0:{ad_dur},asetpts=PTS-STARTPTS[aF];
[aA][aF][aB]concat=n=3:v=0:a=1,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]
"""
subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", src, "-i", AD, "-filter_complex", fc, "-map", "[v]", "-map", "[a]",
                "-c:v", "libx264", "-preset", "veryfast", "-crf", "23", "-maxrate", "11M", "-bufsize", "18M", "-pix_fmt", "yuv420p",
                "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", out], check=True)
tot = probe(out)
h = round(1150 * 750 / 1770 / 2) * 2
print(f"баннер 1080×{h}: {100 * 1080 * h / (1080 * 1920):.1f}% экрана (нужно ≥ 25%)")
print("готово:", out, f"{tot:.2f} с; баннер {T:.2f}–{T + ad_dur:.2f} с, его середина {T + ad_dur / 2:.2f} с, середина ролика {tot / 2:.2f} с")

# Вырезает кусок эфира [start, end] (unix-время) и делает вертикальный шортс 1080x1920:
# сверху заголовок, в центре кадр стрима целиком, снизу субтитры речи, фон — размытый кадр.
# python3 make_clip.py START END out.mp4 "ЗАГОЛОВОК" [buf_dir] [--nosubs]
import sys, os, glob, subprocess, tempfile, json, re
MAT = re.compile(r"(?i)\b(\w*?)(бля|еба|ёба|ебу|ебл|еби|заеб|пизд|хуй|хуе|хуё|хуя|сук)(\w*)")
def clean(t): return MAT.sub(lambda m: m.group(1) + m.group(2)[0] + "*" + m.group(2)[2:] + m.group(3), t)
start, end, out, title = float(sys.argv[1]), float(sys.argv[2]), sys.argv[3], sys.argv[4]
DIR = sys.argv[5] if len(sys.argv) > 5 and not sys.argv[5].startswith("--") else "/tmp/clipper"
CLEAN = "--titled" not in sys.argv          # по умолчанию: чистое видео без заголовка и субтитров
NOSUBS = CLEAN or "--nosubs" in sys.argv
AD = os.environ.get("AD", "/tmp/clipper/ad2/ad.mp4")  # баннер на зелёном фоне; "" — без баннера
FONT = "/usr/share/fonts/opentype/inter/Inter-Black.otf"
segs = sorted((int(os.path.basename(p)[:-3]), p) for p in glob.glob(DIR + "/buf/*.ts"))
use = [(t, p) for t, p in segs if start - 12 <= t <= end]
assert use, "нет записи на это время"
tmp = tempfile.mkdtemp(dir=os.path.dirname(os.path.abspath(out)))
with open(tmp + "/list.txt", "w") as f:
    for _, p in use: f.write("file '%s'\n" % p)
off, dur = max(0, start - use[0][0]), end - start
raw = tmp + "/raw.mp4"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", tmp + "/list.txt", "-ss", "%.2f" % off, "-t", "%.2f" % dur,
                "-c:v", "libx264", "-preset", "ultrafast", "-crf", "16", "-c:a", "aac", "-b:a", "192k", raw], check=True)
# чёрные полосы сверху/снизу
cd = subprocess.run(["ffmpeg", "-ss", "1", "-i", raw, "-t", "4", "-vf", "cropdetect=24:2:0", "-f", "null", "-"], capture_output=True, text=True).stderr
crops = [l.split("crop=")[-1].strip() for l in cd.splitlines() if "crop=" in l]
crop = crops[-1] if crops else "iw:ih:0:0"
cw = int(crop.split(":")[0]); ch = int(crop.split(":")[1])
if cw < 1000 or ch < 500: crop = "iw:ih:0:0"
# субтитры
ass = None
if not NOSUBS:
    from faster_whisper import WhisperModel
    m = WhisperModel(os.environ.get("WHISPER", "small"), device="cpu", compute_type="int8", cpu_threads=4)
    import numpy as np
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", raw, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True, check=True).stdout
    segs_, _ = m.transcribe(np.frombuffer(pcm, np.float32), language="ru", word_timestamps=True, vad_filter=True, beam_size=1)
    words = [w for s in segs_ for w in (s.words or []) if w.probability > 0.25]
    def ts(x): x = max(0, x); return "%d:%02d:%05.2f" % (x // 3600, x % 3600 // 60, x % 60)
    lines, cur = [], []
    for w in words:
        cur.append(w)
        if len(cur) >= 3 or w.word.strip()[-1:] in ".,!?…" or (len(cur) > 1 and w.start - cur[-2].end > 0.6):
            lines.append(cur); cur = []
    if cur: lines.append(cur)
    ass = tmp + "/s.ass"
    with open(ass, "w") as f:
        f.write("[Script Info]\nPlayResX: 1080\nPlayResY: 1920\nWrapStyle: 0\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n")
        f.write("Style: S,Inter Black,92,&H0000F0FF,&H00FFFFFF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,7,3,8,60,60,1390,1\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n")
        for i, L in enumerate(lines):
            e = min(L[-1].end + 0.25, lines[i + 1][0].start) if i + 1 < len(lines) else L[-1].end + 0.4
            txt = clean(" ".join(w.word.strip() for w in L)).upper().replace("{", "").replace("}", "")
            f.write("Dialogue: 0,%s,%s,S,,0,0,0,,{\\fad(40,0)}%s\n" % (ts(L[0].start), ts(e), txt))
    open(out[:-4] + ".txt", "w").write("\n".join(" ".join(w.word.strip() for w in L) for L in lines))
# заголовок: до 2 строк
title = re.sub(r"[^\w\s.,!?:;()«»\"'%+№-]", "", title).strip()
with open(tmp + "/title.txt", "w") as f: f.write(title)
fh = round(1080 * ch / cw) if crop != "iw:ih:0:0" else 608
fy = 700
vf = ("[0:v]split[a][b];[a]crop=%s,scale=-2:1920,crop=1080:1920,boxblur=28:2,eq=brightness=-0.22:saturation=1.2[bg];"
      "[b]crop=%s,scale=1080:%d,setsar=1[fg];[bg][fg]overlay=0:%d,"
      "drawbox=x=0:y=%d:w=1080:h=6:color=white@0.9:t=fill,drawbox=x=0:y=%d:w=1080:h=6:color=white@0.9:t=fill,"
      "%sdrawtext=fontfile=%s:textfile=%s:fontsize=78:fontcolor=white:borderw=8:bordercolor=black:line_spacing=14:x=(w-tw)/2:y=%d-th-60:text_align=C,"
      "drawtext=fontfile=%s:text='twitch.tv/skywhywalker':fontsize=40:fontcolor=white@0.85:borderw=4:bordercolor=black:x=(w-tw)/2:y=1760"
      % (crop, crop, fh, fy, fy - 6, fy + fh, "" , FONT, tmp + "/title.txt", fy, FONT))
CAM = os.environ.get("CAM")  # "w:h:x:y" вебки в исходнике: вебка сверху, игра снизу
if CLEAN and CAM:
    cw_, ch_ = [int(v) for v in CAM.split(":")[:2]]
    camh = round(1080 * ch_ / cw_ / 2) * 2; gh = 1920 - camh
    vf = ("[0:v]split[a][b];[a]crop=%s,scale=1080:%d,setsar=1[cam];"
          "[b]crop=trunc(ih*1080/%d/2)*2:ih:(iw-ow)/2:0,scale=1080:%d,setsar=1[game];"
          "[cam][game]vstack,drawbox=x=0:y=%d:w=1080:h=6:color=black@0.9:t=fill" % (CAM, camh, gh, gh, camh - 3))
elif CLEAN:
    fy = (1920 - fh) // 2
    vf = ("[0:v]split[a][b];[a]crop=%s,scale=-2:1920,crop=1080:1920,boxblur=28:2,eq=brightness=-0.22:saturation=1.2[bg];"
          "[b]crop=%s,scale=1080:%d,setsar=1[fg];[bg][fg]overlay=0:%d" % (crop, crop, fh, fy))
if ass: vf += ",subtitles=%s:fontsdir=/usr/share/fonts/opentype/inter" % ass
vf += "[v]"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-filter_complex", vf, "-map", "[v]", "-map", "0:a",
                "-c:v", "libx264", "-preset", "ultrafast" if AD else "fast", "-crf", "14" if AD else "21", "-r", "60", "-pix_fmt", "yuv420p",
                "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-c:a", "aac", "-b:a", "160k", "-ar", "48000", "-movflags", "+faststart", tmp + "/base.mp4"], check=True)
if AD and os.path.exists(AD):
    ad_d = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", AD], capture_output=True, text=True).stdout)
    mid = float(os.environ.get("AD_AT", dur / 2))
    # concat: (видео А+стоп-кадр, звук А) затем (видео B, ...) — звук баннера вставляем отдельно
    fc = ("[0:v]split[v1][v2];[v1]trim=0:%.3f,setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration=%.3f[pa];"
          "[1:v]format=rgba,colorkey=0x00FC00:0.35:0.12,despill=type=green,scale=1080:-2,fps=60,setpts=PTS-STARTPTS+%.3f/TB[ad];"
          "[pa][ad]overlay=0:(H-h)/2:eof_action=pass,format=yuv420p[pa2];"
          "[v2]trim=%.3f,setpts=PTS-STARTPTS,format=yuv420p[pb];"
          "[0:a]asplit[x1][x2];[x1]atrim=0:%.3f,asetpts=PTS-STARTPTS[aa];"
          "[1:a]aresample=48000,aformat=channel_layouts=stereo,apad=whole_dur=%.3f[ab];"
          "[x2]atrim=%.3f,asetpts=PTS-STARTPTS[ac];"
          "[aa][ab]concat=n=2:v=0:a=1[aab];"
          "[pa2][aab][pb][ac]concat=n=2:v=1:a=1[vx][ax]" % (mid, ad_d, mid, mid, mid, ad_d, mid))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp + "/base.mp4", "-i", AD, "-filter_complex", fc, "-map", "[vx]", "-map", "[ax]",
                    "-c:v", "libx264", "-preset", "fast", "-crf", "21", "-r", "60", "-pix_fmt", "yuv420p",
                    "-c:a", "aac", "-b:a", "160k", "-ar", "48000", "-movflags", "+faststart", out], check=True)
else:
    os.replace(tmp + "/base.mp4", out)
subprocess.run(["rm", "-rf", tmp])
print("OK", out, "%.0fs" % dur)

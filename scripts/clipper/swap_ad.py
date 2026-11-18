# Меняет баннер в готовом клипе: вырезает старую паузу с баннером (если есть) и вставляет новый баннер
# в середину: видео стоит на паузе (стоп-кадр), поверх по центру баннер без зелёного фона, со своим звуком.
# python3 swap_ad.py in.mp4 out.mp4 new_ad.mp4 [длина_клипа_без_рекламы] [есть_старая_реклама 0/1]
import sys, subprocess, math
src, out, ad = sys.argv[1], sys.argv[2], sys.argv[3]
Dreq = float(sys.argv[4]) if len(sys.argv) > 4 else 0.0
has_old = len(sys.argv) > 5 and sys.argv[5] == "1"
FPS = 60
def dur(p): return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p], capture_output=True, text=True).stdout)
T = dur(src); ad_d = dur(ad)
oldf = 376 if has_old else 0            # старый баннер 6,27 с = 376 кадров при 60 к/с
D = Dreq or (T - oldf / FPS)            # длина клипа без рекламы (как задавали при нарезке)
mid = D / 2
nA = math.ceil(mid * FPS - 1e-6)        # кадров до паузы (trim=0:mid)
tA = nA / FPS; tB = (nA + oldf) / FPS
fc = ("[0:v]split[v1][v2];[v1]trim=end_frame=%d,setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration=%.4f[pa];"
      "[1:v]format=rgba,colorkey=0x00FC00:0.35:0.12,despill=type=green,scale=1080:-2,fps=%d,setpts=PTS-STARTPTS+%.4f/TB[ad];"
      "[pa][ad]overlay=0:(H-h)/2:eof_action=pass,format=yuv420p[pa2];"
      "[v2]trim=start_frame=%d,setpts=PTS-STARTPTS,format=yuv420p[pb];"
      "[0:a]asplit[x1][x2];[x1]atrim=0:%.4f,asetpts=PTS-STARTPTS[aa];"
      "[1:a]aresample=48000,aformat=channel_layouts=stereo,apad=whole_dur=%.4f[ab];"
      "[x2]atrim=%.4f,asetpts=PTS-STARTPTS[ac];[aa][ab]concat=n=2:v=0:a=1[aab];"
      "[pa2][aab][pb][ac]concat=n=2:v=1:a=1[vx][ax]" % (nA, ad_d, FPS, tA, nA + oldf, tA, ad_d, tB))
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-i", ad, "-filter_complex", fc, "-map", "[vx]", "-map", "[ax]",
                "-c:v", "libx264", "-preset", "fast", "-crf", "19", "-r", str(FPS), "-pix_fmt", "yuv420p",
                "-c:a", "aac", "-b:a", "160k", "-ar", "48000", "-movflags", "+faststart", out], check=True)
print("OK", out, "%.1fs" % dur(out))

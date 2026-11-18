# Раскадровка эфира: кадр каждые STEP секунд в диапазоне [a, b] (unix-время) -> jpg (подписи — секунды от a)
import sys, glob, os, subprocess, tempfile
a, b, out = int(sys.argv[1]), int(sys.argv[2]), sys.argv[3]; step = int(sys.argv[4]) if len(sys.argv) > 4 else 3
segs = sorted((int(os.path.basename(p)[:-3]), p) for p in glob.glob("/tmp/clipper/buf/*.ts"))
use = [x for x in segs if a - 12 <= x[0] <= b]
lst = tempfile.mktemp(suffix=".txt")
open(lst, "w").write("".join("file '%s'\n" % p for _, p in use))
n = (b - a) // step; cols = 5; rows = (n + cols - 1) // cols
subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(max(0, a - use[0][0])), "-t", str(b - a), "-f", "concat", "-safe", "0", "-i", lst,
                "-vf", "fps=1/%d,scale=320:-1,drawtext=fontfile=/usr/share/fonts/opentype/inter/Inter-Black.otf:text='%%{eif\\:n*%d\\:d}':fontsize=30:fontcolor=yellow:borderw=3:x=6:y=6,tile=%dx%d" % (step, step, cols, rows),
                "-frames:v", "1", out], check=True)
os.remove(lst)

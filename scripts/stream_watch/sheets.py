# Раз в 10 минут: лист стоп-кадров (каждые 15 с) за последние 10 минут записи — для поиска моментов «GTA 6 vs GTA 5».
# Удаляет куски записи старше 2 часов. Печатает "SHEET <путь> <начало>-<конец>".
import glob, os, time, subprocess, datetime as dt
from PIL import Image, ImageDraw
W = "/home/user/stream_watch"; SEG = W + "/seg"; OUT = W + "/sheets"
def seg_t(p): return dt.datetime.strptime(os.path.basename(p)[:-3], "%Y%m%d-%H%M%S").replace(tzinfo=dt.timezone.utc).timestamp()
last = time.time() - 60
while True:
    time.sleep(max(0, last + 600 + 70 - time.time()))
    a, b = last, last + 600; last = b
    frames = []
    for p in sorted(glob.glob(SEG + "/*.ts")):
        s = seg_t(p)
        if s + 62 < a or s >= b: continue
        for off in range(0, 60, 15):
            t = s + off
            if a <= t < b:
                o = f"/tmp/sw_{int(t)}.jpg"
                subprocess.run(["ffmpeg","-loglevel","error","-y","-ss",str(off),"-i",p,"-frames:v","1","-vf","scale=384:-1",o])
                if os.path.exists(o): frames.append((t, o))
    if frames:
        Wd, H, C = 384, 216, 8; R = (len(frames) + C - 1) // C
        sh = Image.new("RGB", (Wd*C, H*R)); d = ImageDraw.Draw(sh)
        for j, (t, f) in enumerate(frames):
            x, y = (j % C)*Wd, (j//C)*H; sh.paste(Image.open(f).resize((Wd, H)), (x, y))
            lab = dt.datetime.fromtimestamp(t, dt.timezone.utc).strftime("%H:%M:%S")
            d.rectangle([x, y, x+62, y+14], fill=(0,0,0)); d.text((x+3, y+1), lab, fill=(255,255,0)); os.remove(f)
        name = f"{OUT}/{dt.datetime.fromtimestamp(a, dt.timezone.utc).strftime('%H%M')}.jpg"
        sh.save(name, quality=80)
        print("SHEET", name, flush=True)
    else:
        print("NOFRAMES", flush=True)
    for p in glob.glob(SEG + "/*.ts"):
        if time.time() - seg_t(p) > 7200: os.remove(p)

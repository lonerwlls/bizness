import sys, subprocess, os
from concurrent.futures import ThreadPoolExecutor
from PIL import Image, ImageDraw
p, a, b, s, name = int(sys.argv[1]), int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4]), sys.argv[5]
U=f"https://archive.org/download/PCLongplay667_Grand_Theft_Auto_V/PC_Longplay_667_Grand_Theft_Auto_V_part_0{p}.mp4"
os.makedirs('fine', exist_ok=True)
ts=list(range(a,b,s))
def g(t):
    o=f'fine/{name}_{t}.jpg'
    if not os.path.exists(o): subprocess.run(['timeout','60','ffmpeg','-loglevel','error','-y','-ss',str(t),'-i',U,'-frames:v','1','-vf','scale=480:-1',o])
    return o
with ThreadPoolExecutor(12) as ex: fs=list(ex.map(g,ts))
W,H,C=480,270,5; R=(len(fs)+C-1)//C
sh=Image.new('RGB',(W*C,H*R)); d=ImageDraw.Draw(sh)
for j,(f,t) in enumerate(zip(fs,ts)):
    if not os.path.exists(f): continue
    x,y=(j%C)*W,(j//C)*H; sh.paste(Image.open(f).resize((W,H)),(x,y))
    d.rectangle([x,y,x+60,y+16],fill=(0,0,0)); d.text((x+3,y+2),str(t),fill=(255,255,0))
sh.save(f'fine_{name}.jpg',quality=80)

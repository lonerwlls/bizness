import sys, subprocess, os
from PIL import Image, ImageDraw
src, name, a, b, s = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4]), float(sys.argv[5])
os.makedirs('sh', exist_ok=True); ts=[]; t=a
while t<b: ts.append(t); t+=s
fs=[]
for t in ts:
    o=f'sh/{name}_{t:.0f}.jpg'; subprocess.run(['ffmpeg','-loglevel','error','-y','-ss',str(t),'-i',src,'-frames:v','1','-vf','scale=384:-1',o]); fs.append(o)
W,H,C=384,216,6; R=(len(fs)+C-1)//C
sh=Image.new('RGB',(W*C,H*R)); d=ImageDraw.Draw(sh)
for j,(f,t) in enumerate(zip(fs,ts)):
    if not os.path.exists(f): continue
    x,y=(j%C)*W,(j//C)*H; sh.paste(Image.open(f).resize((W,H)),(x,y)); d.rectangle([x,y,x+40,y+14],fill=(0,0,0)); d.text((x+3,y+1),f'{t:.0f}',fill=(255,255,0))
sh.save(f'sheet_{name}.jpg',quality=80)

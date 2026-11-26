import subprocess, sys, os
os.chdir('/home/user/bizness/cartoon/impostor')
SC = 1.8; W = 3456; CW = 1094
SEGS = [(197, 457), (8005, 9066), (9699, 10024)]
# (global frame, focus x in 1920 screen coords); linear between keys, cuts = two keys one frame apart
KEYS = [(197,960),(353,960),(354,975),(457,975),
 (8005,880),(8191,860),(8192,1560),(8236,1560),(8250,840),(8349,870),
 (8350,780),(8466,780),(8467,330),(8489,1120),(8560,1060),(8645,960),
 (8646,320),(8679,1000),(8757,1060),(8758,960),(8851,960),(8852,980),(8949,980),(8950,970),(8975,970),(8976,560),(9010,1400),(9028,960),(9066,960),
 (9699,900),(9820,920),(9821,900),(9884,980),(9885,760),(9930,1060),(9940,1060),(9941,1000),(10024,1000)]
def px(x): return max(0, min(W - CW, round(x * SC - CW / 2)))
outs = []
for a, b in SEGS:
    ks = [(g - a, px(x)) for g, x in KEYS if a <= g <= b]
    expr = str(ks[-1][1])
    for (n0, x0), (n1, x1) in reversed(list(zip(ks, ks[1:]))):
        seg = f"{x0}+({x1}-{x0})*(n-{n0})/{max(1,n1-n0)}" if n1 > n0 else str(x1)
        expr = f"if(lt(n,{n1}),{seg},{expr})"
    expr = expr.replace(',', '\\,')
    src = f'out/vs/seg_{a}-{b}.mp4'; out = f'out/vs/crop_{a}.mp4'
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i',src,'-vf',f"crop={CW}:1944:{expr}:0,scale=1080:1920:flags=lanczos",'-c:v','libx264','-crf','18','-preset','medium','-pix_fmt','yuv420p',out], check=True)
    outs.append(out)
# audio from the finished long video, same frames, short fades at the joins
full = '../../videos/impostor_full.mp4'
parts = []
for i, (a, b) in enumerate(SEGS):
    d = (b - a + 1) / 30
    o = f'out/vs/a_{a}.wav'
    subprocess.run(['ffmpeg','-y','-loglevel','error','-ss',f'{a/30:.4f}','-t',f'{d:.4f}','-i',full,'-vn','-af',f'afade=t=in:d=0.08,afade=t=out:st={d-0.12:.3f}:d=0.12','-ar','48000','-ac','2',o], check=True)
    parts.append(o)
with open('out/vs/list.txt','w') as f:
    for o in outs: f.write(f"file '{os.path.abspath(o)}'\n")
with open('out/vs/alist.txt','w') as f:
    for o in parts: f.write(f"file '{os.path.abspath(o)}'\n")
subprocess.run(['ffmpeg','-y','-loglevel','error','-f','concat','-safe','0','-i','out/vs/list.txt','-c','copy','out/vs/v.mp4'], check=True)
subprocess.run(['ffmpeg','-y','-loglevel','error','-f','concat','-safe','0','-i','out/vs/alist.txt','out/vs/a.wav'], check=True)
subprocess.run(['ffmpeg','-y','-loglevel','error','-i','out/vs/v.mp4','-i','out/vs/a.wav','-map','0:v','-map','1:a','-c:v','copy','-af','loudnorm=I=-14:TP=-1:LRA=11','-ar','48000','-c:a','aac','-b:a','160k','-shortest','-movflags','+faststart','../../videos/impostor_short.mp4'], check=True)
print('ok')

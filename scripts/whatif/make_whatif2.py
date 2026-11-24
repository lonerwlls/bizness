# «Что будет, если…» v2 — ПОКАЗЫВАЕМ, а не пересказываем:
# короткие реплики George ставятся на свои места на таймлайне, между ними картинка играет сама;
# у каждого кадра — свой центр, замедление, приближение (плавный наезд или резкий зум), размытие чужих субтитров.
# Реклама: стоп-кадр + баннер без зелёного фона по центру (>30% кадра) со звуком.
# python3 make_whatif2.py <папка>   (spec.json; озвучка реплик кешируется в <папка>/lines/)
import json, os, sys, subprocess
from PIL import ImageFont
D = os.path.abspath(sys.argv[1]); S = json.load(open(f'{D}/spec.json'))
ROOT = '/home/user/bizness'; FONT = f'{ROOT}/shorts/fonts/MontserratBlackSC.ttf'
BANNER = S.get('banner', f'{ROOT}/shorts/ads/banner_green.mp4'); VOICE = S.get('voice', 'JBFqnCBsd6RMkjVDRZzb')
def dur(f): return float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f]))
L = S['length']; TA = S['ad_at']; BD = dur(BANNER)
# --- 1) реплики
os.makedirs(f'{D}/lines', exist_ok=True); lines = []
for k, (t0, text) in enumerate(S['lines']):
    mp3 = f'{D}/lines/{k:02d}.mp3'
    tf = f'{D}/lines/{k:02d}.txt'
    if not (os.path.exists(mp3) and os.path.exists(tf) and open(tf).read() == text):
        env = dict(os.environ, EL_SPEED=str(S.get('speed', 1.12)))
        subprocess.run(['node', f'{ROOT}/scripts/tts_eleven.mjs', 'line', mp3, VOICE, text], check=True, env=env)
        open(tf, 'w').write(text)
    lines.append((t0, mp3, json.load(open(mp3[:-4] + '.json')), dur(mp3)))
for (a, _, _, d), nxt in zip(lines, lines[1:] + [(L, 0, 0, 0)]):
    if a + d > nxt[0] + 0.01: print(f'!! реплика в {a}s ({d:.1f}s) налезает на следующую в {nxt[0]}s')
    if a < TA < a + d: print(f'!! реклама {TA}s внутри реплики {a}s')
# --- 2) видео
def zexpr(kf):
    kf = sorted(kf); e = f'{kf[-1][1]}'
    for (t0, z0), (t1, z1) in reversed(list(zip(kf, kf[1:]))):
        e = f'if(lt(t,{t1}),{z0}+({z1}-{z0})*(t-{t0})/{max(t1 - t0, 1e-3)},{e})'
    return f'if(lt(t,{kf[0][0]}),{kf[0][1]},{e})'
shots = S['shots']; ins = []; parts = []; cuts = []
for i, sh in enumerate(shots):
    t0, src, s0 = sh[:3]; o = sh[3] if len(sh) > 3 else {}
    t1 = shots[i + 1][0] if i + 1 < len(shots) else L; dd = t1 - t0; sp = o.get('speed', 1.0)
    ins += ['-ss', str(s0), '-t', str(dd * sp + 0.1), '-i', src]
    f = f'[{i}:v]fps=30'
    for (y0, y1) in o.get('blur', []):  # размыть полосы источника (чужие субтитры)
        f += f'[p{i}];[p{i}]split[q{i}][r{i}];[r{i}]crop=iw:{y1 - y0}:0:{y0},boxblur=luma_radius=18:luma_power=2:chroma_radius=10:chroma_power=2[bb{i}];[q{i}][bb{i}]overlay=0:{y0}'
    cx = o.get('cx', 0.5); fx, fy = o.get('focus', [0.5, 0.5]); Z = zexpr(o.get('zoom', [[0, 1]]))
    f += (f",setpts=(PTS-STARTPTS)/{sp},crop=ih*9/16:ih:'max(0,min(iw-ow,{cx}*iw-ow/2))':0,scale=1080:1920:flags=lanczos,"
          f"scale=w='2*trunc(1080*({Z})/2)':h='2*trunc(1920*({Z})/2)':eval=frame,crop=1080:1920:'(2*trunc(1080*({Z})/2)-1080)*{fx}':'(2*trunc(1920*({Z})/2)-1920)*{fy}',"
          f"setsar=1,fps=30,trim=0:{dd:.3f},setpts=PTS-STARTPTS[s{i}]")
    parts.append(f); cuts.append(t0)
gl = '+'.join(f'between(t,{c:.3f},{c + 0.12:.3f})' for c in cuts[1:]) or '0'
fc = ';'.join(parts) + ';' + ''.join(f'[s{i}]' for i in range(len(shots))) + f"concat=n={len(shots)}:v=1:a=0,rgbashift=rh=-14:bh=14:enable='{gl}',eq=saturation=1.08:contrast=1.04[v]"
subprocess.run(['ffmpeg','-loglevel','error','-y',*ins,'-filter_complex',fc,'-map','[v]','-c:v','libx264','-preset','veryfast','-crf','14',f'{D}/_main.mp4'], check=True)
# --- 3) звук основной части: реплики на местах + звуки (whoosh на резких зумах, hit на ударах)
ain = []; af = []; n = 0
for (t0, mp3, _, _) in lines:
    ain += ['-i', mp3]; af.append(f'[{n}:a]aresample=44100,adelay={int(t0 * 1000)}:all=1[l{n}]'); n += 1
for (t0, kind) in S.get('sfx', []):
    if kind == 'whoosh': src = 'anoisesrc=c=pink:a=0.5:d=0.45,bandpass=f=1800:w=1600,afade=t=in:d=0.25,afade=t=out:st=0.25:d=0.2,volume=0.6'
    else: src = 'sine=f=55:d=0.6,afade=t=out:st=0.05:d=0.55,volume=2.2'
    ain += ['-f', 'lavfi', '-i', src]; af.append(f'[{n}:a]aresample=44100,aformat=channel_layouts=stereo,adelay={int(t0 * 1000)}:all=1[l{n}]'); n += 1
af.append(''.join(f'[l{k}]' for k in range(n)) + f'amix=inputs={n}:normalize=0:duration=longest,apad,atrim=0:{L}[am]')
subprocess.run(['ffmpeg','-loglevel','error','-y',*ain,'-filter_complex',';'.join(af),'-map','[am]','-ac','2','-ar','44100',f'{D}/_main.wav'], check=True)
# --- 4) субтитры по одному слову
NAMES = set(S.get('names', [])); SHOW = S.get('show', {}); words = []
for (t0, _, ws, d) in lines:
    for j, w in enumerate(ws):
        end = t0 + (ws[j + 1]['t'] if j + 1 < len(ws) else d + 0.15)
        if w['w'].isdigit() and words and words[-1]['txt'] == 'GTA': words[-1]['txt'] += ' ' + w['w']; words[-1]['b'] = end; continue
        txt = SHOW.get(w['w'], w['w'] if (w['w'] in NAMES or w['w'].isascii()) else w['w'].upper())
        words.append({'txt': txt, 'a': t0 + w['t'], 'b': end})
def ts(x): return f'{int(x // 3600)}:{int(x % 3600 // 60):02d}:{max(x, 0) % 60:05.2f}'
ev = []
for w in words:
    a, b = w['a'], w['b']
    if a < TA < b: b = TA
    sh = BD if a >= TA else 0; fs = 160
    while ImageFont.truetype(FONT, fs).getlength(w['txt']) > 1000: fs -= 4
    ev.append(f"Dialogue: 0,{ts(a + sh)},{ts(b + sh)},S,,0,0,0,,{{\\pos(540,1400)\\fs{fs}}}{w['txt']}")
open(f'{D}/_subs.ass', 'w').write("""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: S,Montserrat Black SC,160,&H00FFFFFF,&H00FFFFFF,&H00000000,&H90000000,0,0,0,0,100,100,1,0,1,7,5,5,40,40,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
""" + '\n'.join(ev) + '\n')
# --- 5) пауза под рекламу и финал
BW = S.get('banner_w', 1080); crop = S.get('banner_crop', '1200:780:360:135')
fc = (f"[0:v]trim=0:{TA:.3f},setpts=PTS-STARTPTS[a];[0:v]trim={TA:.3f},setpts=PTS-STARTPTS[b];"
      f"[0:v]trim={TA - 0.04:.3f}:{TA:.3f},setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration={BD:.3f},trim=0:{BD:.3f}[f];"
      f"[2:v]fps=30,chromakey=0x2A8539:0.08:0.03,despill=type=green,crop={crop},scale={BW}:-2,format=yuva420p[k];"
      f"[f][k]overlay=(W-w)/2:(H-h)/2[fa];[a][fa][b]concat=n=3:v=0+1:a=0,ass={D}/_subs.ass:fontsdir={ROOT}/shorts/fonts[v];"
      f"[1:a]atrim=0:{TA:.3f},asetpts=PTS-STARTPTS[va];[1:a]atrim={TA:.3f},asetpts=PTS-STARTPTS[vb];"
      f"[2:a]aresample=44100,aformat=channel_layouts=stereo,apad,atrim=0:{BD:.3f},volume={S.get('banner_gain', 2.0)}[ba];"
      f"[va][ba][vb]concat=n=3:v=0:a=1,apad,atrim=0:{L + BD:.3f},loudnorm=I=-14:TP=-1.5:LRA=7[au]").replace('v=0+1', 'v=1')
out = f"{D}/{S['out']}"
subprocess.run(['ffmpeg','-loglevel','error','-y','-i',f'{D}/_main.mp4','-i',f'{D}/_main.wav','-i',BANNER,'-filter_complex',fc,
                '-map','[v]','-map','[au]','-c:v','libx264','-preset','medium','-crf','19','-pix_fmt','yuv420p','-r','30',
                '-c:a','aac','-b:a','192k','-ar','48000','-movflags','+faststart',out], check=True)
print('OK', out, f'len {L + BD:.1f}s')

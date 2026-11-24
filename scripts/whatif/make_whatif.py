# Шортс «Что будет, если…» в формате примера пользователя:
# 9:16 геймплей на весь экран, озвучка, субтитры по одному слову (Montserrat Black, белые с чёрной обводкой),
# короткий RGB-глитч на склейках, в середине — пауза: стоп-кадр + рекламный баннер (зелёный фон вырезан) по центру.
# Запуск: python3 make_whatif.py <папка_ролика>   (в папке: spec.json, voice.mp3, voice.ts)
import json, os, sys, subprocess
from PIL import ImageFont
D = sys.argv[1]; S = json.load(open(f'{D}/spec.json'))
ROOT = '/home/user/bizness/shorts'; FONT = f'{ROOT}/fonts/MontserratBlackSC.ttf'
BANNER = S.get('banner', f'{ROOT}/ads/banner_green.mp4')
t = open(f'{D}/voice.ts').read(); V = json.loads(t[t.index('{'):t.rindex('}') + 1]); W = V['words']
def dur(f): return float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f]))
VD = dur(f'{D}/voice.mp3'); TAIL = 0.5; MAIN = VD + TAIL
# точка рекламы: после слова с индексом ad_after (по умолчанию — ближайший конец фразы к середине)
ai = S['ad_after']; TA = (W[ai]['e'] + W[ai + 1]['t']) / 2; BD = dur(BANNER)
# --- 1) основное видео по списку кадров [начало_в_ролике, файл, начало_в_источнике]
shots = S['shots']; ins = []; parts = []
for i, (t0, src, s0) in enumerate(shots):
    t1 = shots[i + 1][0] if i + 1 < len(shots) else MAIN
    ins += ['-ss', str(s0), '-t', str(t1 - t0 + 0.05), '-i', src]
    parts.append(f"[{i}:v]fps=30,crop=ih*9/16:ih:(iw-ih*9/16)/2+{S.get('xshift',0)}:0,scale=1080:1920:flags=lanczos,setsar=1,trim=0:{t1 - t0:.3f},setpts=PTS-STARTPTS[s{i}]")
cuts = [s[0] for s in shots[1:]]
gl = '+'.join(f'between(t,{c:.3f},{c + 0.13:.3f})' for c in cuts) or '0'
fc = ';'.join(parts) + ';' + ''.join(f'[s{i}]' for i in range(len(shots))) + f"concat=n={len(shots)}:v=1:a=0,rgbashift=rh=-14:bh=14:enable='{gl}',eq=saturation=1.08:contrast=1.04[v]"
subprocess.run(['ffmpeg','-loglevel','error','-y',*ins,'-filter_complex',fc,'-map','[v]','-c:v','libx264','-preset','veryfast','-crf','14',f'{D}/_main.mp4'], check=True)
# --- 2) субтитры: одно слово, ВЕРХНИЙ регистр (имена — как в тексте), после рекламы сдвиг на длину баннера
NAMES = set(S.get('names', [])); SHOW = S.get('show', {})
words = []
for i, w in enumerate(W):
    if i > 0 and w['w'].isdigit() and words and words[-1]['merge']:
        words[-1]['txt'] += ' ' + w['w']; words[-1]['e'] = w['e']; continue
    txt = SHOW.get(w['w'], w['w'] if (w['w'] in NAMES or w['w'].isascii()) else w['w'].upper())
    words.append({'txt': txt, 't': w['t'], 'e': w['e'], 'merge': w['w'] in ('GTA',)})
def ts(x): x = max(0, x); return f'{int(x // 3600)}:{int(x % 3600 // 60):02d}:{x % 60:05.2f}'
ev = []
for i, w in enumerate(words):
    a = w['t']; b = words[i + 1]['t'] if i + 1 < len(words) else VD + 0.3
    if a < TA < b: b = TA
    sh = BD if a >= TA else 0
    fs = 160
    while ImageFont.truetype(FONT, fs).getlength(w['txt']) > 1000: fs -= 4
    ev.append(f"Dialogue: 0,{ts(a + sh)},{ts(b + sh)},S,,0,0,0,,{{\\fs{fs}}}{w['txt']}")
ass = f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: S,Montserrat Black SC,118,&H00FFFFFF,&H00FFFFFF,&H00000000,&H90000000,0,0,0,0,100,100,1,0,1,7,5,5,40,40,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
""" + '\n'.join(e.replace(',S,,0,0,0,,', ',S,,0,0,0,,{\\pos(540,1400)}') for e in ev) + '\n'
open(f'{D}/_subs.ass', 'w').write(ass)
# --- 3) пауза под рекламу: [0..TA] + стоп-кадр + баннер по центру + [TA..конец], звук: голос / звук баннера / голос
BW = S.get('banner_w', 1080); crop = S.get('banner_crop', '1200:780:360:135')
fc = (f"[0:v]trim=0:{TA:.3f},setpts=PTS-STARTPTS[a];[0:v]trim={TA:.3f},setpts=PTS-STARTPTS[b];"
      f"[0:v]trim={TA - 0.04:.3f}:{TA:.3f},setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration={BD:.3f},trim=0:{BD:.3f}[f];"
      f"[2:v]fps=30,chromakey=0x2A8539:0.08:0.03,despill=type=green,crop={crop},scale={BW}:-2,format=yuva420p[k];"
      f"[f][k]overlay=(W-w)/2:(H-h)/2[fa];[a][fa][b]concat=n=3:v=1:a=0,ass={D}/_subs.ass:fontsdir={ROOT}/fonts[v];"
      f"[1:a]atrim=0:{TA:.3f},asetpts=PTS-STARTPTS[va];[1:a]atrim={TA:.3f},asetpts=PTS-STARTPTS[vb];"
      f"[2:a]aresample=44100,apad,atrim=0:{BD:.3f},volume={S.get('banner_gain',2.0)}[ba];"
      f"[va][ba][vb]concat=n=3:v=0:a=1,apad,atrim=0:{MAIN + BD:.3f},loudnorm=I=-14:TP=-1.5:LRA=7[au]")
out = f"{D}/{S['out']}"
subprocess.run(['ffmpeg','-loglevel','error','-y','-i',f'{D}/_main.mp4','-i',f'{D}/voice.mp3','-i',BANNER,'-filter_complex',fc,
                '-map','[v]','-map','[au]','-c:v','libx264','-preset','medium','-crf','19','-pix_fmt','yuv420p','-r','30',
                '-c:a','aac','-b:a','192k','-ar','48000','-movflags','+faststart',out], check=True)
print('OK', out, f'ad at {TA:.2f}s', f'len {MAIN + BD:.1f}s')

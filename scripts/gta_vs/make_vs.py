# GTA 5 vs GTA 6: вертикальный ролик 1080x1920, сверху GTA 5, снизу GTA 6, подписи.
import subprocess, os, sys, json
C = '/home/user/bizness/clips'
FONT = '/usr/share/fonts/opentype/inter/Inter-Black.otf'
FONT2 = '/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf'
T = [
 # id, topic, g5 file, g6 file, g6 start, g6 dur, caption lines
 ('01_stealing_a_car','STEALING A CAR','g5_1.mp4',f'{C}/kaicenat/01_cant_steal_car_busted.mp4',10,20,['GTA 5: break in and drive off','GTA 6: some cars have ANTI-THEFT']),
 ('02_social_media','SOCIAL MEDIA','g5_2.mp4',f'{C}/typicalgamer/03_phone_social_media.mp4',0,19,['GTA 5: Lifeinvader on a PC','GTA 6: a real feed with comments']),
 ('03_the_map','THE MAP','g5_3.mp4',f'{C}/typicalgamer/02_map_reveal.mp4',18,20,['GTA 5: one city','GTA 6: a whole state']),
 ('04_phone_camera','PHONE CAMERA','g5_4.mp4',f'{C}/kaicenat/10_filming_angry_npc_selfie.mp4',9,30,['GTA 5: photos for a mission','GTA 6: film anyone, take selfies']),
 ('05_escaping_cops','ESCAPING THE COPS','g5_5.mp4',f'{C}/kaicenat/26_drove_off_bridge_escape.mp4',6,38,['GTA 5: drive away, stars fade','GTA 6: they search the whole map']),
 ('06_car_shop','THE CAR SHOP','g5_6.mp4',f'{C}/typicalgamer/06_car_respray_weak.mp4',0,20,['GTA 5: Los Santos Customs','GTA 6: $400 respray to lose the cops']),
 ('07_minigames','MINIGAMES','g5_7.mp4',f'{C}/kaicenat/15_furniture_race_with_lucia.mp4',0,25,['GTA 5: yoga with Michael','GTA 6: building furniture with Lucia']),
 ('08_npcs_up_close','NPCs UP CLOSE','g5_8.mp4',f'{C}/typicalgamer/04_npc_girls_roast.mp4',15,20,['GTA 5: NPCs on a yacht party','GTA 6: NPCs talk back and roast you']),
]
if os.environ.get('VS_SPEC'): T = [tuple(x) for x in json.load(open(os.environ['VS_SPEC']))]
os.makedirs('out', exist_ok=True); os.makedirs('txt', exist_ok=True)
def tf(name, s):
    p = f'txt/{name}.txt'; open(p, 'w').write(s); return p
def dur(f): return float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f]))
only = sys.argv[1:] 
for (id_, topic, g5, g6, s6, d6, cap) in T:
    if only and id_[:2] not in only: continue
    d5 = dur(g5); D = max(d5, d6)
    t1 = tf(id_+'_t1', 'GTA 5  vs  GTA 6'); t2 = tf(id_+'_t2', topic)
    l5 = tf('l5', 'GTA 5  (2013)'); l6 = tf('l6', 'GTA 6  (2026)')
    c1 = tf(id_+'_c1', cap[0]); c2 = tf(id_+'_c2', cap[1])
    fc = (
      f"color=c=0x0d0d12:s=1080x1920:r=30:d={D}[bg];"
      f"[0:v]scale=1080:608,setsar=1,tpad=stop_mode=clone:stop_duration={D}[a];"
      f"[1:v]crop=840:472:300:124,scale=1080:608,setsar=1,fps=30,tpad=stop_mode=clone:stop_duration={D}[b];"
      f"[bg][a]overlay=0:330:shortest=1[x];[x][b]overlay=0:962:shortest=1[y];"
      f"[y]drawbox=x=0:y=938:w=1080:h=24:color=0x0d0d12:t=fill,"
      f"drawtext=fontfile={FONT2}:textfile={t1}:fontsize=54:fontcolor=white:x=(w-tw)/2:y=120,"
      f"drawtext=fontfile={FONT}:textfile={t2}:fontsize=96:fontcolor=0xFFD400:x=(w-tw)/2:y=195,"
      f"drawtext=fontfile={FONT}:textfile={l5}:fontsize=40:fontcolor=white:box=1:boxcolor=0x000000@0.75:boxborderw=14:x=24:y=352,"
      f"drawtext=fontfile={FONT}:textfile={l6}:fontsize=40:fontcolor=black:box=1:boxcolor=0xFFD400:boxborderw=14:x=24:y=984,"
      f"drawtext=fontfile={FONT2}:textfile={c1}:fontsize=50:fontcolor=0xBBBBBB:x=(w-tw)/2:y=1615,"
      f"drawtext=fontfile={FONT}:textfile={c2}:fontsize=54:fontcolor=white:x=(w-tw)/2:y=1690[v];"
      f"[1:a]volume=1.0,apad[a6];[0:a]volume=0.35,apad[a5];[a6][a5]amix=inputs=2:duration=longest:normalize=0,atrim=0:{D}[au]"
    )
    out = f'out/{id_}.mp4'
    subprocess.run(['ffmpeg','-loglevel','error','-y','-i',g5,'-ss',str(s6),'-t',str(d6),'-i',g6,'-filter_complex',fc,
                    '-map','[v]','-map','[au]','-t',str(D),'-c:v','libx264','-preset','medium','-crf','21','-pix_fmt','yuv420p',
                    '-c:a','aac','-b:a','160k','-movflags','+faststart',out], check=True)
    print('OK', out, round(D,1))

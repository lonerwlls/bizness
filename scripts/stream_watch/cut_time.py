# Вырезать кусок записи стрима по времени UTC: cut_time.py HH:MM:SS длительность_сек out.mp4 [YYYYMMDD]
import sys, glob, os, subprocess, datetime as dt
hms, d, out = sys.argv[1], float(sys.argv[2]), sys.argv[3]
day = sys.argv[4] if len(sys.argv) > 4 else dt.datetime.now(dt.timezone.utc).strftime('%Y%m%d')
t0 = dt.datetime.strptime(day + hms, '%Y%m%d%H:%M:%S').replace(tzinfo=dt.timezone.utc).timestamp()
SEG = '/home/user/stream_watch/seg'
def st(p): return dt.datetime.strptime(os.path.basename(p)[:-3], '%Y%m%d-%H%M%S').replace(tzinfo=dt.timezone.utc).timestamp()
use = [p for p in sorted(glob.glob(SEG + '/*.ts')) if st(p) < t0 + d and st(p) + 62 > t0]
lst = out + '.txt'; open(lst, 'w').write(''.join(f"file '{p}'\n" for p in use))
subprocess.run(['ffmpeg','-loglevel','error','-y','-f','concat','-safe','0','-i',lst,'-ss',str(max(0, t0 - st(use[0]))),'-t',str(d),
                '-vf','fps=30','-c:v','libx264','-preset','veryfast','-crf','18','-c:a','aac','-ar','48000','-ac','2',out], check=True)
os.remove(lst); print('OK', out)

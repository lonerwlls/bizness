#!/usr/bin/env python3
"""Разбор каналов: все ролики канала, просмотры, возраст канала, какие темы выстрелили.
python3 scripts/yt_channels.py res1.json [res2.json ...] > out.json   (берёт мелкие каналы-победители)"""
import json, os, sys, time, urllib.request, urllib.parse, urllib.error, re, datetime, statistics
KEY = os.environ["YOUTUBE_API_KEY"]
def api(ep, **p):
    p["key"] = KEY; u = f"https://www.googleapis.com/youtube/v3/{ep}?" + urllib.parse.urlencode(p)
    with urllib.request.urlopen(u, timeout=30) as r: return json.load(r)
def dur(s):
    m = re.match(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", s or "")
    return sum(int(x or 0)*k for x,k in zip(m.groups(), (3600,60,1))) if m else 0
names = set(os.environ.get("CH", "").split("|")) - {""}
chs = {}
for f in sys.argv[1:]:
    for n, d in json.load(open(f)).items():
        for r in d["top"] + d["small"]:
            if (names and r["ch"] in names) or (not names and r["subs"] < 300_000 and r["views"] >= 500_000):
                chs.setdefault(r["ch"], r["id"])
now = datetime.datetime.now(datetime.UTC).replace(tzinfo=None); out = []
for ch, vid in chs.items():
    cid = api("videos", part="snippet", id=vid)["items"][0]["snippet"]["channelId"]
    c = api("channels", part="snippet,statistics,contentDetails", id=cid)["items"][0]
    up = c["contentDetails"]["relatedPlaylists"]["uploads"]; ids = []; tok = None
    while len(ids) < 200:
        r = api("playlistItems", part="contentDetails", playlistId=up, maxResults=50, **({"pageToken": tok} if tok else {}))
        ids += [i["contentDetails"]["videoId"] for i in r["items"]]; tok = r.get("nextPageToken")
        if not tok: break
    vs = []
    for i in range(0, len(ids), 50):
        for v in api("videos", part="snippet,statistics,contentDetails", id=",".join(ids[i:i+50]))["items"]:
            vs.append(dict(t=v["snippet"]["title"], v=int(v["statistics"].get("viewCount", 0)),
                sec=dur(v["contentDetails"]["duration"]), d=v["snippet"]["publishedAt"][:10]))
    lng = [x for x in vs if x["sec"] >= 180]; sh = [x for x in vs if x["sec"] < 180]
    first = min((x["d"] for x in vs), default="")
    o = dict(ch=ch, id=cid, subs=int(c["statistics"].get("subscriberCount", 0)),
        total=int(c["statistics"].get("viewCount", 0)), created=c["snippet"]["publishedAt"][:10],
        first_upload=first, n_long=len(lng), n_short=len(sh),
        med_long=int(statistics.median([x["v"] for x in lng])) if lng else 0,
        med_len=round(statistics.median([x["sec"] for x in lng])/60, 1) if lng else 0,
        best=sorted(lng, key=lambda x: -x["v"])[:6], latest=sorted(lng, key=lambda x: x["d"])[-4:])
    out.append(o)
    print(f'{ch[:22]:22} subs={o["subs"]:>9,} 1st={first} long={len(lng):>3} short={len(sh):>3} med={o["med_long"]:>9,} len={o["med_len"]}', file=sys.stderr, flush=True)
json.dump(out, sys.stdout, ensure_ascii=False, indent=1)

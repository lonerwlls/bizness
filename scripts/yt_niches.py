#!/usr/bin/env python3
"""Анализ ниш YouTube: для каждого запроса берём популярные ролики за N дней,
смотрим просмотры, подписчиков каналов и долю «маленьких» каналов-победителей.
python3 scripts/yt_niches.py niches.json out.json [days]"""
import time, urllib.error, json, os, sys, statistics, urllib.request, urllib.parse, datetime, re
KEY = os.environ["YOUTUBE_API_KEY"]
def api(ep, **p):
    p["key"] = KEY
    u = f"https://www.googleapis.com/youtube/v3/{ep}?" + urllib.parse.urlencode(p)
    for i in range(6):
        try:
            with urllib.request.urlopen(u, timeout=30) as r: return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code != 429 or i == 5: raise
            time.sleep(10 * (i + 1))
def dur(s):
    m = re.match(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", s or "")
    return sum(int(x or 0)*k for x,k in zip(m.groups(), (3600,60,1))) if m else 0
DURS = os.environ.get("DURS", "any").split(",")
niches = json.load(open(sys.argv[1])); days = int(sys.argv[3]) if len(sys.argv)>3 else 90
after = (datetime.datetime.now(datetime.UTC).replace(tzinfo=None)-datetime.timedelta(days=days)).strftime("%Y-%m-%dT%H:%M:%SZ")
now = datetime.datetime.now(datetime.UTC).replace(tzinfo=None); res = {}
for name, queries in niches.items():
    vids = {}
    for q in queries:
      for d in DURS:
        r = api("search", part="id", q=q, type="video", order="viewCount", publishedAfter=after,
                maxResults=50, relevanceLanguage="en", videoDuration=d)
        for it in r.get("items", []): vids[it["id"]["videoId"]] = 1
    ids = list(vids); vd = []
    for i in range(0, len(ids), 50):
        vd += api("videos", part="snippet,statistics,contentDetails", id=",".join(ids[i:i+50]))["items"]
    chs = list({v["snippet"]["channelId"] for v in vd}); cd = {}
    for i in range(0, len(chs), 50):
        for c in api("channels", part="statistics,snippet", id=",".join(chs[i:i+50]))["items"]:
            cd[c["id"]] = c
    rows = []
    for v in vd:
        c = cd.get(v["snippet"]["channelId"], {}); st = c.get("statistics", {})
        pub = datetime.datetime.strptime(v["snippet"]["publishedAt"], "%Y-%m-%dT%H:%M:%SZ")
        rows.append(dict(id=v["id"], title=v["snippet"]["title"], ch=v["snippet"]["channelTitle"],
            views=int(v["statistics"].get("viewCount", 0)), subs=int(st.get("subscriberCount", 0) or 0),
            chvids=int(st.get("videoCount", 0) or 0),
            chstart=c.get("snippet", {}).get("publishedAt", "")[:10],
            sec=dur(v["contentDetails"].get("duration")), age=max(1,(now-pub).days)))
    MINS = int(os.environ.get("MINSEC", "0")); rows = [r for r in rows if r["sec"] >= MINS]
    for r in rows: r["vpd"] = r["views"] // r["age"]
    rows.sort(key=lambda x: -x["views"])
    top = rows[:60]; V = [r["views"] for r in top]
    small = [r for r in top if r["subs"] < 100_000 and r["views"] >= 100_000]
    res[name] = dict(n=len(rows), median_views=int(statistics.median(V)) if V else 0,
        top10_views=int(statistics.mean(V[:10])) if V else 0,
        channels=len({r["ch"] for r in top}), small_winners=len(small),
        median_len_min=round(statistics.median([r["sec"] for r in top])/60,1) if top else 0,
        top=top[:15], small=small[:10])
    json.dump(res, open(sys.argv[2], "w"), ensure_ascii=False, indent=1)
    print(f"{name:30s} med={res[name]['median_views']:>9,} top10={res[name]['top10_views']:>11,} "
          f"chan={res[name]['channels']:>3} small_win={len(small):>2} len={res[name]['median_len_min']}", flush=True)
json.dump(res, open(sys.argv[2], "w"), ensure_ascii=False, indent=1)

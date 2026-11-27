#!/usr/bin/env python3
"""Поиск «пустых» тем: для каждой темы — немецкий запрос (сколько немецких роликов и сколько они набрали)
и английский запрос (есть ли спрос). python3 scripts/yt_gap.py topics.json out.json"""
import json, os, re, sys, urllib.request, urllib.parse
KEY = os.environ["YOUTUBE_API_KEY"]
def api(ep, **p):
    p["key"] = KEY
    with urllib.request.urlopen(f"https://www.googleapis.com/youtube/v3/{ep}?" + urllib.parse.urlencode(p), timeout=30) as r: return json.load(r)
def dur(s):
    m = re.match(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", s or ""); return sum(int(x or 0)*k for x,k in zip(m.groups(), (3600,60,1)))
DE = re.compile(r"[äöüß]|\b(der|die|das|und|wie|du|wenn|im|auf|mit|ein|eine|lange|würdest|was|passiert|überleb\w*|deinem?|wäre)\b", re.I)
def look(q, lang, region):
    r = api("search", part="id", q=q, type="video", maxResults=25, relevanceLanguage=lang, regionCode=region, order="relevance")
    ids = [i["id"]["videoId"] for i in r.get("items", [])]
    if not ids: return []
    vs = api("videos", part="snippet,statistics,contentDetails", id=",".join(ids))["items"]
    return [dict(t=v["snippet"]["title"], ch=v["snippet"]["channelTitle"], v=int(v["statistics"].get("viewCount", 0)), sec=dur(v["contentDetails"]["duration"])) for v in vs]
topics = json.load(open(sys.argv[1])); out = {}
for name, (qde, qen) in topics.items():
    de = [x for x in look(qde, "de", "DE") if x["sec"] >= 180 and DE.search(x["t"])]
    en = [x for x in look(qen, "en", "US") if x["sec"] >= 180]
    de.sort(key=lambda x: -x["v"]); en.sort(key=lambda x: -x["v"])
    out[name] = dict(de_n=len(de), de_max=de[0]["v"] if de else 0, de_top=de[:3], en_max=en[0]["v"] if en else 0, en_top=en[:3])
    print(f"{name:34s} DE: {len(de):>2} роликов, max {out[name]['de_max']:>10,} | EN max {out[name]['en_max']:>11,}  {en[0]['t'][:55] if en else ''}", flush=True)
    json.dump(out, open(sys.argv[2], "w"), ensure_ascii=False, indent=1)

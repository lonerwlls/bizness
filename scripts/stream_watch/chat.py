# Анонимно читает чат Twitch и пишет его в chat.jsonl
import asyncio, json, time, sys, random, websockets
CH = sys.argv[1] if len(sys.argv) > 1 else "typicalgamer"
OUT = "/home/user/stream_watch/chat.jsonl"
async def run():
    while True:
        try:
            async with websockets.connect("wss://irc-ws.chat.twitch.tv:443", ping_interval=60) as ws:
                await ws.send("CAP REQ :twitch.tv/tags")
                await ws.send("PASS SCHMOOPIIE"); await ws.send(f"NICK justinfan{random.randint(10000,99999)}")
                await ws.send(f"JOIN #{CH}")
                with open(OUT, "a") as f:
                    async for raw in ws:
                        for line in raw.split("\r\n"):
                            if line.startswith("PING"): await ws.send("PONG :tmi.twitch.tv"); continue
                            if " PRIVMSG " not in line: continue
                            tags, rest = (line[1:].split(" ", 1) if line.startswith("@") else ("", line))
                            user = rest.split("!", 1)[0].lstrip(":")
                            msg = rest.split(" PRIVMSG ", 1)[1].split(" :", 1)[1] if " :" in rest.split(" PRIVMSG ", 1)[1] else ""
                            f.write(json.dumps({"t": time.time(), "u": user, "m": msg}, ensure_ascii=False) + "\n"); f.flush()
        except Exception as e:
            print("reconnect", e, file=sys.stderr); await asyncio.sleep(5)
asyncio.run(run())

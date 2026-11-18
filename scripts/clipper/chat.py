# Читает чат анонимно и пишет chat.log: время<TAB>ник<TAB>текст
import websocket, os, sys, time, urllib.parse as u
ch = sys.argv[1] if len(sys.argv) > 1 else "skywhywalker"
out = open(os.path.join(sys.argv[2] if len(sys.argv) > 2 else "/tmp/clipper", "chat.log"), "a", buffering=1)
p = u.urlparse(os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy") or "")
while True:
    try:
        kw = dict(http_proxy_host=p.hostname, http_proxy_port=p.port, proxy_type="http") if p.hostname else {}
        ws = websocket.create_connection("wss://irc-ws.chat.twitch.tv:443", sslopt={"ca_certs": "/root/.ccr/ca-bundle.crt"}, timeout=360, **kw)
        for m in ["PASS SCHMOOPIIE", "NICK justinfan%d" % (int(time.time()) % 90000), "JOIN #" + ch]: ws.send(m)
        while True:
            for line in ws.recv().split("\r\n"):
                if line.startswith("PING"): ws.send("PONG :tmi.twitch.tv")
                elif " PRIVMSG " in line:
                    nick = line[1:line.find("!")]
                    msg = line.split(" PRIVMSG ", 1)[1].split(" :", 1)[-1]
                    out.write("%.1f\t%s\t%s\n" % (time.time(), nick, msg.replace("\t", " ")))
    except Exception as e:
        print(time.ctime(), "chat reconnect:", e, file=sys.stderr); time.sleep(5)

# Ищет всплески смеха/хайпа в чате. Печатает строку MOMENT, когда найден момент.
import sys, time, re, statistics, os, collections
DIR = sys.argv[1] if len(sys.argv) > 1 else "/tmp/clipper"
LAUGH = re.compile(r"(а?ха){2,}|(х[ах]){2,}|(a?ha){2,}|kekw|lul|omegalul|lmao|\blol\b|\bлол\b|ору|орно|угар|ржу|xd|\){3,}|pepelaugh|kekl|😂|🤣|icant|сме[шх]", re.I)
HYPE = re.compile(r"pog|wow|\bвау\b|жесть|ахуе|охуе|ебат|ебать|пизд|бля+|ниче?го себе|шок|омг|\bomg\b|what|ч[ёе]\?|wtf|monkas|clip|клип|момент|f{3,}|wait|тупо|лох|\?{3,}|!{3,}", re.I)
W, STEP, COOLDOWN = 15, 5, 75
pos, msgs, hist, last = 0, collections.deque(), collections.deque(maxlen=120), 0
while True:
    try:
        with open(os.path.join(DIR, "chat.log")) as f:
            f.seek(pos); data = f.read(); pos = f.tell()
    except FileNotFoundError: data = ""
    for line in data.splitlines():
        p = line.split("\t", 2)
        if len(p) == 3: msgs.append((float(p[0]), p[1], p[2]))
    now = time.time()
    while msgs and msgs[0][0] < now - 120: msgs.popleft()
    win = [m for m in msgs if m[0] >= now - W]
    users = {}
    for t, u, m in win:  # один зритель считается один раз
        s = 2 if LAUGH.search(m) else (1 if HYPE.search(m) else 0)
        users[u] = max(users.get(u, 0), s)
    score = sum(users.values()); total = len(win)
    base = statistics.median(hist) if len(hist) >= 12 else 6
    hist.append(score)
    thr = max(24, base * 2.0 + 8)
    if score >= thr and now - last > COOLDOWN:
        last = now
        laughs = sum(1 for v in users.values() if v == 2)
        sample = " | ".join(m for _, _, m in win[-12:])[:400]
        print("MOMENT t=%d score=%d base=%.1f laughs=%d msgs=%d :: %s" % (now, score, base, laughs, total, sample), flush=True)
        with open(os.path.join(DIR, "events.log"), "a") as e: e.write("%d\t%d\t%d\t%s\n" % (now, score, laughs, sample))
    time.sleep(STEP)

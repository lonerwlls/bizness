# Сравнить варианты озвучки со сценарием (faster-whisper medium) и найти «лишнюю речь» вне слов.
#   python3 scripts/check_takes.py <script.txt> take1.wav take2.wav ...
import sys, re, difflib, subprocess
import numpy as np
from faster_whisper import WhisperModel
m = WhisperModel("medium", device="cpu", compute_type="int8")
SYN = {"vpn": "впн", "вэпээн": "впн", "wifi": "вайфай", "ip": "айпи", "cookie": "куки"}
def nrm(t):
    out = [q for q in (re.sub(r"[^а-яa-z0-9]", "", w.lower().replace("ё", "е")) for w in t.replace("-", " ").replace("—", " ").split()) if q]
    return [SYN.get(q, q) for q in " ".join(out).replace("wi fi", "wifi").replace("вай фай", "вайфай").split()]
S = nrm(open(sys.argv[1], encoding="utf8").read())
for f in sys.argv[2:]:
    a = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", f, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True).stdout, np.float32)
    segs = list(m.transcribe(a, language="ru", beam_size=5, word_timestamps=True)[0])
    H = nrm(" ".join(s.text for s in segs))
    ops = [(op, " ".join(S[max(0, a1 - 1):a2 + 1]), H[b1:b2]) for op, a1, a2, b1, b2 in difflib.SequenceMatcher(None, S, H, autojunk=False).get_opcodes() if op != "equal"]
    db = 20 * np.log10(np.array([np.sqrt(np.mean(a[i:i + 160] ** 2)) for i in range(0, len(a) - 160, 160)]) + 1e-9)
    cov = np.zeros(len(db), bool)
    for s in segs:
        for w in s.words: cov[max(0, int((w.start - 0.1) * 100)):int((w.end + 0.1) * 100)] = True
    bad = (db > -30) & ~cov; runs, i = [], 0
    while i < len(bad):
        if bad[i]:
            j = i
            while j < len(bad) and bad[j]: j += 1
            if j - i >= 12: runs.append((i / 100, j / 100))
            i = j
        else: i += 1
    print(f"{f}: {len(a) / 16000:.1f} с; расхождения: {ops}; лишняя речь: {runs}")

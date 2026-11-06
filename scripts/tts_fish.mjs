// Озвучка через Fish Audio (ключ FISH_API_KEY) + тайминги слов по аудио (faster-whisper, scripts/fish_align.py).
// node scripts/tts_fish.mjs sample <out.mp3> <voice> "текст"
// node scripts/tts_fish.mjs full <public_dir> <ts_out> <script.txt> <voice>   → <public_dir>/voice.mp3 + <ts_out> (VOICE)
// <voice> — ID модели голоса или ссылка вида https://fish.audio/m/<id>/
// Переменные: FISH_MODEL (по умолчанию s1), FISH_SPEED (1.0), FISH_LANG (en по умолчанию / ru — для распознавания таймингов).
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const K = process.env.FISH_API_KEY;
if (!K) throw new Error("Нет FISH_API_KEY: добавь ключ в переменные окружения");
const MODEL = process.env.FISH_MODEL ?? "s1";
const voiceId = (v) => (v.match(/[0-9a-f]{32}/i) ?? [v])[0];

const tts = async (voice, text) => {
  for (let attempt = 1; ; attempt++) {
    const r = await fetch("https://api.fish.audio/v1/tts", {
      method: "POST",
      headers: { Authorization: `Bearer ${K}`, "Content-Type": "application/json", model: MODEL },
      body: JSON.stringify({
        text, ...(voice ? { reference_id: voiceId(voice) } : {}), format: "mp3", mp3_bitrate: 128, normalize: true, latency: "normal",
        prosody: { speed: +(process.env.FISH_SPEED ?? 1.0), volume: 0 },
      }),
    });
    if (r.ok) return Buffer.from(await r.arrayBuffer());
    const err = (await r.text()).slice(0, 300);
    if (attempt >= 4 || r.status < 500) throw new Error(`Fish ${r.status}: ${err}`);
    await new Promise((res) => setTimeout(res, 2000 * attempt));
  }
};

// Длинный текст режем по предложениям на куски ~1200 символов, потом склеиваем.
const chunks = (text, max = 1200) => {
  const sent = text.match(/[^.!?…]+[.!?…]+["»”]?\s*|[^.!?…]+$/g) ?? [text];
  const out = [""];
  for (const s of sent) (out.at(-1).length + s.length > max && out.at(-1) ? out.push(s) : (out[out.length - 1] += s));
  return out.map((c) => c.trim()).filter(Boolean);
};

const [mode, ...a] = process.argv.slice(2);
if (mode === "sample") {
  const [out, voice, text] = a;
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, await tts(voice, text));
  console.log("ok", out);
} else {
  const [OUT, TS, SCRIPT, voice] = a;
  const text = fs.readFileSync(SCRIPT, "utf8").replace(/́/g, "").replace(/\s+/g, " ").trim();
  fs.mkdirSync(OUT, { recursive: true });
  const parts = chunks(text);
  const tmp = fs.mkdtempSync(path.join(OUT, ".fish-"));
  for (let i = 0; i < parts.length; i++) {
    fs.writeFileSync(path.join(tmp, `${i}.mp3`), await tts(voice, parts[i]));
    console.log(`кусок ${i + 1}/${parts.length}`);
  }
  const voiceMp3 = path.join(OUT, "voice.mp3");
  if (parts.length === 1) fs.copyFileSync(path.join(tmp, "0.mp3"), voiceMp3);
  else {
    fs.writeFileSync(path.join(tmp, "list.txt"), parts.map((_, i) => `file '${i}.mp3'`).join("\n"));
    execSync(`ffmpeg -v error -y -f concat -safe 0 -i "${path.join(tmp, "list.txt")}" -ar 44100 -b:a 128k "${voiceMp3}"`);
  }
  fs.rmSync(tmp, { recursive: true, force: true });
  const plain = path.join(OUT, ".script_plain.txt");
  fs.writeFileSync(plain, text);
  execSync(`python3 scripts/fish_align.py "${voiceMp3}" "${plain}" "${TS}" ${process.env.FISH_LANG ?? "en"}`, { stdio: "inherit" });
  fs.rmSync(plain, { force: true });
}

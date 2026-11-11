// Озвучка Fish Audio + тайминги слов (Fish их не отдаёт: определяем по аудио локально через faster-whisper).
// Нужно один раз: pip install faster-whisper. Язык распознавания: LANG_CODE=ru|en.
// node scripts/tts_fish_words.mjs <script.txt> <public_dir> <ts_out> [reference_id]
// → <public_dir>/voice.mp3 и <ts_out> с VOICE = { dur, words: [{t,e,w,end,pause}] } (как у tts_eleven.mjs)
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const [SCRIPT, OUT, TS, ref = "7312c38557eb4fb384e3874e8e9cea67"] = process.argv.slice(2);
const FK = process.env.FISH_API_KEY;
if (!FK) throw new Error("Нет FISH_API_KEY");
const text = fs.readFileSync(SCRIPT, "utf8").replace(/́/g, "").replace(/\s+/g, " ").trim();
fs.mkdirSync(OUT, { recursive: true });
const mp3 = path.join(OUT, "voice.mp3");
if (!process.env.SKIP_TTS) {
  const r = await fetch("https://api.fish.audio/v1/tts", {
    method: "POST",
    headers: { Authorization: `Bearer ${FK}`, "Content-Type": "application/json", model: process.env.FISH_MODEL ?? "s1" },
    body: JSON.stringify({ text, reference_id: ref, format: "mp3", mp3_bitrate: 192, normalize: true, latency: "normal" }),
  });
  if (!r.ok) throw new Error(`fish ${r.status} ${await r.text()}`);
  fs.writeFileSync(mp3, Buffer.from(await r.arrayBuffer()));
}
// тайминги слов: локальное распознавание (scripts/align_words.py)
const words = JSON.parse(execSync(`python3 scripts/align_words.py "${mp3}" "${SCRIPT}" ${process.env.LANG_CODE ?? "ru"}`, { maxBuffer: 1 << 26, stdio: ["ignore", "pipe", "inherit"] }).toString());
const dur = +execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${mp3}"`).toString().trim();
fs.writeFileSync(TS, `// Сгенерировано tts_fish_words.mjs (Fish Audio, голос ${ref}; тайминги — выравнивание по аудио).\nexport const VOICE = ${JSON.stringify({ dur, words })};\n`);
console.log("ok", dur, words.length);

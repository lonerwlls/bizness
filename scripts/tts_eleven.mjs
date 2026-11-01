// Озвучка через ElevenLabs (ключ в переменной окружения ELEVENLABS_API_KEY) с таймингами символов → слова для движка.
// node scripts/tts_eleven.mjs sample <out.mp3> <voice_id> "текст"
// node scripts/tts_eleven.mjs full <public_dir> <ts_out> <script.txt> <voice_id>   → <public_dir>/voice.mp3 + <ts_out> (VOICE)
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const K = process.env.ELEVENLABS_API_KEY;
if (!K) throw new Error("Нет ELEVENLABS_API_KEY: добавь ключ в переменные окружения");
const MODEL = process.env.EL_MODEL ?? "eleven_multilingual_v2";
const SETTINGS = { stability: 0.4, similarity_boost: 0.8, style: 0.35, use_speaker_boost: true, speed: +(process.env.EL_SPEED ?? 1.08) };

const tts = async (voice, text) => {
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}/with-timestamps?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": K, "Content-Type": "application/json" },
    body: JSON.stringify({ text, model_id: MODEL, language_code: "ru", voice_settings: SETTINGS }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(JSON.stringify(j.detail ?? j).slice(0, 300));
  return j;
};

const [mode, ...a] = process.argv.slice(2);
if (mode === "sample") {
  const [out, voice, text] = a;
  const j = await tts(voice, text);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, Buffer.from(j.audio_base64, "base64"));
  console.log("ok", out);
} else {
  const [OUT, TS, SCRIPT, voice] = a;
  const text = fs.readFileSync(SCRIPT, "utf8").replace(/́/g, "").replace(/\s+/g, " ").trim();
  const j = await tts(voice, text);
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, "voice.mp3"), Buffer.from(j.audio_base64, "base64"));
  // Слова из посимвольных таймингов; end = дальше конец предложения, pause = запятая/тире/двоеточие.
  const { characters: C, character_start_times_seconds: S, character_end_times_seconds: E } = j.alignment;
  const words = [];
  let i = 0;
  while (i < C.length) {
    while (i < C.length && !/[\p{L}\p{N}$]/u.test(C[i])) i++;
    if (i >= C.length) break;
    const s = i;
    while (i < C.length && /[\p{L}\p{N}$\-,.]/u.test(C[i]) && !(/[,.]/.test(C[i]) && !/[\p{N}]/u.test(C[i + 1] ?? ""))) i++;
    const w = C.slice(s, i).join("");
    const after = C.slice(i, i + 4).join("");
    words.push({ t: +S[s].toFixed(3), e: +E[i - 1].toFixed(3), w, end: /^\s*[.!?…]/.test(after), pause: /^\s*[,:—–-]/.test(after) });
  }
  const dur = +execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${path.join(OUT, "voice.mp3")}"`).toString().trim();
  fs.writeFileSync(TS, `// Сгенерировано el_tts.mjs (ElevenLabs ${MODEL}): длительность озвучки (сек) и слова с таймингами.\nexport const VOICE = ${JSON.stringify({ dur, words })};\n`);
  console.log("ok", dur, words.length);
}

// ElevenLabs по API с пословными таймингами → public/voice.mp3 + audio/words.json (формат как у whisper.mjs)
//   node tools/tts_el.mjs script/voice.txt <voice_id>
import fs from "node:fs";
const [, , txt, voice = "nPczCjzI2devNBz1zQrb"] = process.argv;
const text = fs.readFileSync(txt, "utf8").replace(/\[[^\]]+\]\s*/g, "").trim();
const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}/with-timestamps?output_format=mp3_44100_128`, {
  method: "POST", headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY ?? "x", "Content-Type": "application/json" },
  body: JSON.stringify({ text, model_id: process.env.EL_MODEL ?? "eleven_multilingual_v2", language_code: "en",
    voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.25, use_speaker_boost: true, speed: 1.08 } }) });
const j = await r.json();
if (!r.ok) throw new Error(JSON.stringify(j).slice(0, 400));
fs.mkdirSync("public", { recursive: true }); fs.mkdirSync("audio", { recursive: true });
fs.writeFileSync("public/voice.mp3", Buffer.from(j.audio_base64, "base64"));
const { characters: C, character_start_times_seconds: S, character_end_times_seconds: E } = j.alignment;
const words = []; let cur = null;
C.forEach((c, i) => {
  if (/\s/.test(c)) { if (cur) words.push(cur); cur = null; return; }
  if (!cur) cur = { t: "", s: +S[i].toFixed(2), e: 0 };
  cur.t += c; cur.e = +E[i].toFixed(2);
});
if (cur) words.push(cur);
fs.writeFileSync("audio/words.json", JSON.stringify(words, null, 1));
console.log(words.map((w) => w.s.toFixed(1) + " " + w.t).join(" | "));

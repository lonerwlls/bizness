// Озвучка-рассказ ElevenLabs по кускам с паузами: каждая строка сценария — отдельный запрос (с previous_text/next_text,
// чтобы интонация шла одним рассказом), между кусками — тишина заданной длины.
// node scripts/tts_eleven_story.mjs <script.txt> <public_dir> <ts_out> <voice_id>
// В сценарии: строка "= 0.8" — пауза после предыдущей строки (по умолчанию 0.45 с), "#" — комментарий.
// Ударения: слова-омографы («полки», «варите», «дома») заменяй на однозначные, «ё» пиши всегда.
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const [SCRIPT, OUT, TS, voice] = process.argv.slice(2);
const K = process.env.ELEVENLABS_API_KEY ?? "x";
const MODEL = process.env.EL_MODEL ?? "eleven_multilingual_v2";
const SET = { stability: +(process.env.EL_STAB ?? 0.35), similarity_boost: 0.8, style: +(process.env.EL_STYLE ?? 0.45), use_speaker_boost: true, speed: +(process.env.EL_SPEED ?? 0.97) };
const lines = fs.readFileSync(SCRIPT, "utf8").split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#"));
const parts = [];
for (const l of lines) {
  if (l.startsWith("=")) { if (parts.length) parts[parts.length - 1].gap = +l.slice(1); continue; }
  parts.push({ text: l, gap: 0.45 });
}
const tmp = path.join(OUT, "_parts"); fs.mkdirSync(tmp, { recursive: true });
const words = []; let off = 0.15; const list = [];
const sil = (sec, f) => execSync(`ffmpeg -v error -y -f lavfi -i anullsrc=r=44100:cl=mono -t ${sec} -c:a pcm_s16le "${f}"`);
sil(0.15, path.join(tmp, "s_start.wav")); list.push("s_start.wav");
for (let i = 0; i < parts.length; i++) {
  const p = parts[i];
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}/with-timestamps?output_format=mp3_44100_128`, {
    method: "POST", headers: { "xi-api-key": K, "Content-Type": "application/json" },
    body: JSON.stringify({ text: p.text, model_id: MODEL, language_code: process.env.EL_LANG ?? "ru", voice_settings: SET,
      previous_text: parts.slice(Math.max(0, i - 3), i).map((x) => x.text).join(" ") || undefined,
      next_text: parts.slice(i + 1, i + 3).map((x) => x.text).join(" ") || undefined }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(JSON.stringify(j.detail ?? j).slice(0, 300));
  const mp3 = path.join(tmp, `p${i}.mp3`), wav = path.join(tmp, `p${i}.wav`);
  fs.writeFileSync(mp3, Buffer.from(j.audio_base64, "base64"));
  // обрезаем тишину в начале/конце куска, чтобы паузы были ровно такими, как задано
  execSync(`ffmpeg -v error -y -i "${mp3}" -af "silenceremove=start_periods=1:start_threshold=-55dB:start_silence=0.04,areverse,silenceremove=start_periods=1:start_threshold=-55dB:start_silence=0.08,areverse" -ar 44100 -ac 1 -c:a pcm_s16le "${wav}"`);
  const lead = (() => { // сколько тишины срезали в начале
    const o = execSync(`ffmpeg -v info -i "${mp3}" -af silencedetect=n=-55dB:d=0.01 -f null - 2>&1 || true`).toString();
    const m = o.match(/silence_start: 0(?:\.0+)?\s[\s\S]*?silence_end: ([\d.]+)/); return m ? +m[1] : 0;
  })();
  const dur = +execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${wav}"`).toString().trim();
  const { characters: C, character_start_times_seconds: S, character_end_times_seconds: E } = j.alignment;
  let k = 0;
  while (k < C.length) {
    while (k < C.length && !/[\p{L}\p{N}]/u.test(C[k])) k++;
    if (k >= C.length) break;
    const s = k;
    while (k < C.length && /[\p{L}\p{N}\-]/u.test(C[k])) k++;
    const after = C.slice(k, k + 4).join("");
    words.push({ t: +(off + Math.max(0, S[s] - lead)).toFixed(3), e: +(off + Math.min(dur, E[k - 1] - lead)).toFixed(3), w: C.slice(s, k).join(""),
      end: /^[»"]?\s*[.!?…]|^[.!?…]/.test(after) || (/^[»"]?\s*$/.test(after) && k >= C.length), pause: /^\s*[,:—–-]/.test(after) });
  }
  list.push(`p${i}.wav`); off += dur;
  if (i < parts.length - 1) { sil(p.gap, path.join(tmp, `s${i}.wav`)); list.push(`s${i}.wav`); off += p.gap; }
  process.stdout.write(".");
}
fs.writeFileSync(path.join(tmp, "list.txt"), list.map((f) => `file '${f}'`).join("\n"));
execSync(`ffmpeg -v error -y -f concat -safe 0 -i "${path.join(tmp, "list.txt")}" -af "apad=pad_dur=0.3" -c:a libmp3lame -b:a 192k "${path.join(OUT, "voice.mp3")}"`);
fs.rmSync(tmp, { recursive: true, force: true });
const total = +execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${path.join(OUT, "voice.mp3")}"`).toString().trim();
fs.writeFileSync(TS, `// Сгенерировано tts_eleven_story.mjs (ElevenLabs ${MODEL}, голос ${voice}, куски с паузами).\nexport const VOICE = ${JSON.stringify({ dur: total, words })};\n`);
console.log("\nok", total, words.length);

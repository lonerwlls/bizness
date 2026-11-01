// Озвучка всего сценария одним куском (цельная интонация): voice.mp3 + voice.ts с таймингами слов.
// node scripts/tts_edge.mjs <public_dir> <ts_out> <script.txt> [voice] [rate]
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const [OUT, TS, SCRIPT, VOICE = "en-US-AndrewMultilingualNeural", RATE = "+5%"] = process.argv.slice(2);
const text = fs.readFileSync(SCRIPT, "utf8").replace(/\s+/g, " ").trim();
fs.mkdirSync(OUT, { recursive: true });
const tmp = path.join(OUT, "_tmp");
fs.mkdirSync(tmp, { recursive: true });

let res;
for (let a = 0; a < 10 && !res; a++) {
  const tts = new MsEdgeTTS();
  try {
    await tts.setMetadata(VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3, { wordBoundaryEnabled: true });
    res = await tts.toFile(tmp, text, { rate: RATE });
  } catch (e) {
    console.log("retry", a, e.message.slice(0, 40));
    await new Promise((r) => setTimeout(r, 2000));
  }
  tts.close();
}
fs.renameSync(res.audioFilePath, path.join(OUT, "voice.mp3"));
const meta = JSON.parse(fs.readFileSync(res.metadataFilePath, "utf8")).Metadata.filter((m) => m.Type === "WordBoundary");
fs.rmSync(tmp, { recursive: true });

// Слова без ударений; end = после слова конец предложения, pause = запятая/тире/двоеточие.
const plain = text.replace(/́/g, "");
let pos = 0;
const words = meta.map((m) => {
  const w = m.Data.text.Text.replace(/́/g, "");
  const k = plain.indexOf(w, pos);
  if (k >= 0) pos = k + w.length;
  const after = plain.slice(pos);
  return {
    t: +(m.Data.Offset / 1e7).toFixed(3),
    e: +((m.Data.Offset + m.Data.Duration) / 1e7).toFixed(3),
    w,
    end: /^\s*[.!?]/.test(after),
    pause: /^\s*[,:—-]/.test(after),
  };
});
const dur = +execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${path.join(OUT, "voice.mp3")}"`).toString().trim();
fs.writeFileSync(TS, `// Сгенерировано gen2.mjs: длительность озвучки (сек) и слова с таймингами.\nexport const VOICE = ${JSON.stringify({ dur, words })};\n`);
console.log("ok", dur, words.length);

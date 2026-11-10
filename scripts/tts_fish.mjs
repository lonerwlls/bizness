// Озвучка через Fish Audio (ключ FISH_API_KEY). node scripts/tts_fish.mjs <text.txt> <out.mp3> [reference_id]
import fs from "fs";
const [inp, out, ref = "0327fdb5da9e4fd782899a8058c8ae2b"] = process.argv.slice(2);
const K = process.env.FISH_API_KEY;
if (!K) throw new Error("Нет FISH_API_KEY");
const text = fs.readFileSync(inp, "utf8").trim();
const r = await fetch("https://api.fish.audio/v1/tts", {
  method: "POST",
  headers: { Authorization: `Bearer ${K}`, "Content-Type": "application/json", model: process.env.FISH_MODEL ?? "s1" },
  body: JSON.stringify({ text, reference_id: ref, format: "mp3", mp3_bitrate: 192, normalize: true, latency: "normal" }),
});
if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
fs.writeFileSync(out, Buffer.from(await r.arrayBuffer()));
console.log("ok", out);

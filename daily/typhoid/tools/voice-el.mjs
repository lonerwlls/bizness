// Voice-over with ElevenLabs (shorts of our channel). node tools/voice-el.mjs [--force] [--only 003,007]
// src/story/voices.json: {"N": {"el": "<voice_id>", "model": "...", "settings": {...}}}.
// Writes public/vo/<id>.mp3, loudness-normalized to -17 LUFS; [tags] in a line go only to eleven_v3.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {ROOT, readJson, say} from './lib.mjs';

const args = process.argv.slice(2);
const force = args.includes('--force');
const only = args.includes('--only') ? (args[args.indexOf('--only') + 1] ?? '').split(',').filter(Boolean) : [];
const lines = readJson('src/story/lines.json');
const voices = readJson('src/story/voices.json');
const K = process.env.ELEVENLABS_API_KEY;
if (!K) throw new Error('no ELEVENLABS_API_KEY');
const outDir = path.join(ROOT, 'public', 'vo');
fs.mkdirSync(outDir, {recursive: true});
const madeFile = path.join(outDir, '.made-el.json');
const made = fs.existsSync(madeFile) ? JSON.parse(fs.readFileSync(madeFile, 'utf8')) : {};
const failed = [];
for (const l of lines) {
	if (l.reuse) continue;
	if (only.length && !only.some((o) => l.id.startsWith(o))) continue;
	const v = voices[l.sp] ?? voices.N;
	const key = JSON.stringify([l.t, v]);
	const target = path.join(outDir, `${l.id}.mp3`);
	if (!force && !only.length && made[l.id] === key && fs.existsSync(target)) continue;
	const text = v.model === 'eleven_v3' ? l.t : l.t.replace(/\[[^\]]*\]\s*/g, '');
	let ok = false;
	for (let i = 0; i < 4 && !ok; i++) {
		try {
			const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${v.el}?output_format=mp3_44100_128`, {
				method: 'POST',
				headers: {'xi-api-key': K, 'Content-Type': 'application/json'},
				body: JSON.stringify({text, model_id: v.model ?? 'eleven_multilingual_v2', voice_settings: v.settings}),
			});
			if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
			const buf = Buffer.from(await r.arrayBuffer());
			if (buf.length < 2000) throw new Error('empty audio');
			const raw = target + '.raw.mp3';
			fs.writeFileSync(raw, buf);
			execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', raw, '-af', 'loudnorm=I=-17:TP=-1.5:LRA=11', '-ar', '44100', '-b:a', '192k', target]);
			fs.unlinkSync(raw);
			made[l.id] = key;
			ok = true;
			say(`ok ${l.id}`);
		} catch (e) {
			say(`retry ${l.id}: ${e.message.slice(0, 200)}`);
			await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
		}
	}
	if (!ok) failed.push(l.id);
	fs.writeFileSync(madeFile, JSON.stringify(made, null, 1));
}
say(failed.length ? `FAILED: ${failed.join(',')}` : 'all lines voiced');

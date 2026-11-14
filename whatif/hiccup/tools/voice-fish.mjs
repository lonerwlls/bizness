// Voice-over with Fish Audio (key FISH_API_KEY). Long videos of our channel use it.
// node tools/voice-fish.mjs [--force] [--only 003,007]
// voices.json: {"N": {"fish": "<reference_id>"}}. Writes public/vo/<id>.mp3; a clip is redone
// only when its text or voice changed (public/vo/.made-fish.json).
import fs from 'node:fs';
import path from 'node:path';
import {ROOT, readJson, say} from './lib.mjs';

const args = process.argv.slice(2);
const force = args.includes('--force');
const only = args.includes('--only') ? (args[args.indexOf('--only') + 1] ?? '').split(',').filter(Boolean) : [];
const lines = readJson('src/story/lines.json');
const voices = readJson('src/story/voices.json');
const K = process.env.FISH_API_KEY;
if (!K) throw new Error('no FISH_API_KEY');
const outDir = path.join(ROOT, 'public', 'vo');
fs.mkdirSync(outDir, {recursive: true});
const madeFile = path.join(outDir, '.made-fish.json');
const made = fs.existsSync(madeFile) ? JSON.parse(fs.readFileSync(madeFile, 'utf8')) : {};
const ids = new Set(lines.map((l) => l.id));
if (!only.length) for (const f of fs.readdirSync(outDir)) {
	const m = f.match(/^(\d{3}_.+)\.mp3$/);
	if (m && !ids.has(m[1])) { fs.unlinkSync(path.join(outDir, f)); delete made[m[1]]; say(`removed old clip ${f}`); }
}
const failed = [];
for (const l of lines) {
	if (l.reuse) continue;
	if (only.length && !only.some((o) => l.id.startsWith(o))) continue;
	const v = voices[l.sp] ?? voices.N;
	const key = JSON.stringify([l.t, v]);
	const target = path.join(outDir, `${l.id}.mp3`);
	if (!force && !only.length && made[l.id] === key && fs.existsSync(target)) continue;
	let ok = false;
	for (let i = 0; i < 4 && !ok; i++) {
		try {
			const r = await fetch('https://api.fish.audio/v1/tts', {
				method: 'POST',
				headers: {Authorization: `Bearer ${K}`, 'Content-Type': 'application/json', model: v.model ?? 's1'},
				body: JSON.stringify({text: l.t, reference_id: v.fish, format: 'mp3', mp3_bitrate: 192, normalize: true, latency: 'normal', prosody: v.speed ? {speed: v.speed} : undefined}),
			});
			if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
			const buf = Buffer.from(await r.arrayBuffer());
			if (buf.length < 2000) throw new Error('empty audio');
			fs.writeFileSync(target, buf);
			made[l.id] = key;
			ok = true;
			say(`ok ${l.id}`);
		} catch (e) {
			say(`retry ${l.id}: ${e.message}`);
			await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
		}
	}
	if (!ok) failed.push(l.id);
	fs.writeFileSync(madeFile, JSON.stringify(made, null, 1));
}
say(failed.length ? `FAILED: ${failed.join(',')}` : 'all lines voiced');

// Voice-over with ElevenLabs (key ELEVENLABS_API_KEY) — our shorts use it.
// node tools/voice-eleven.mjs [--only 003,007]
// voices.json: {"N": {"eleven": "<voice_id>", "model": "eleven_multilingual_v2", "speed": 1.08}}
// Each line is voiced with its neighbours as context, so the intonation flows like one take.
import fs from 'node:fs';
import path from 'node:path';
import {ROOT, readJson, say} from './lib.mjs';

const args = process.argv.slice(2);
const only = args.includes('--only') ? (args[args.indexOf('--only') + 1] ?? '').split(',').filter(Boolean) : [];
const lines = readJson('src/story/lines.json');
const voices = readJson('src/story/voices.json');
const K = process.env.ELEVENLABS_API_KEY;
if (!K) throw new Error('no ELEVENLABS_API_KEY');
const outDir = path.join(ROOT, 'public', 'vo');
fs.mkdirSync(outDir, {recursive: true});
const clean = (t) => t.normalize('NFC');
for (let i = 0; i < lines.length; i++) {
	const l = lines[i];
	if (only.length && !only.some((o) => l.id.startsWith(o))) continue;
	const v = voices[l.sp] ?? voices.N;
	const body = {
		text: clean(l.t),
		model_id: v.model ?? 'eleven_multilingual_v2',
		previous_text: lines.slice(Math.max(0, i - 2), i).map((x) => x.t).join(' ') || undefined,
		next_text: lines[i + 1]?.t,
		voice_settings: {stability: 0.45, similarity_boost: 0.8, style: 0.3, use_speaker_boost: true, speed: v.speed ?? 1.05},
	};
	let ok = false;
	for (let k = 0; k < 4 && !ok; k++) {
		try {
			const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${v.eleven}?output_format=mp3_44100_128`, {method: 'POST', headers: {'xi-api-key': K, 'Content-Type': 'application/json'}, body: JSON.stringify(body)});
			if (!r.ok) throw new Error(`${r.status} ${(await r.text()).slice(0, 200)}`);
			const buf = Buffer.from(await r.arrayBuffer());
			if (buf.length < 2000) throw new Error('empty audio');
			fs.writeFileSync(path.join(outDir, `${l.id}.mp3`), buf);
			ok = true;
			say(`ok ${l.id}`);
		} catch (e) {
			say(`retry ${l.id}: ${e.message}`);
			await new Promise((r) => setTimeout(r, 2000 * (k + 1)));
		}
	}
	if (!ok) throw new Error('failed ' + l.id);
}
say('all lines voiced');

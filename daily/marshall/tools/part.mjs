// Renders one part of the long video for review: node tools/part.mjs <fromLine> <toLineExclusive|end> <out.mp4>
// e.g. node tools/part.mjs 001 025 ../../videos/whatif_money_part1.mp4
// Frames run from the shot start of <fromLine> to the shot start of <toLine>; sound = bed + voices, -14 LUFS.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {ROOT, ffbin, readJson, say} from './lib.mjs';

const [a, b, outArg] = process.argv.slice(2);
const TL = readJson('src/story/timeline.json');
const cfg = readJson('src/story/render.json').long ?? {};
const start = (id) => {
	const l = TL.lines.find((x) => x.id.startsWith(id));
	if (!l) throw new Error('no line ' + id);
	return Math.max(0, l.from - 6);
};
const f0 = a === '001' ? 0 : start(a);
const f1 = b === 'end' ? TL.total - 1 : start(b) - 1;
const dir = path.join(ROOT, 'out', 'part');
fs.mkdirSync(dir, {recursive: true});
const silent = path.join(dir, 'silent.mp4');
say(`frames ${f0}-${f1} (${((f1 - f0 + 1) / 30).toFixed(1)} s)`);
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
let r = spawnSync(npx, ['remotion', 'render', 'Long', silent, `--frames=${f0}-${f1}`, '--muted', `--gl=${cfg.gl ?? 'angle'}`, `--concurrency=${cfg.concurrency ?? 3}`, '--crf=18', '--log=error', `--timeout=${cfg.timeout ?? 120000}`], {cwd: ROOT, stdio: ['ignore', 'ignore', 'inherit']});
if (r.status !== 0) process.exit(1);
const mix = path.join(dir, 'mix.wav');
r = spawnSync(process.execPath, [path.join(ROOT, 'tools', 'mix-audio.mjs'), 'src/story/timeline.json', path.join('public', cfg.bed ?? 'sfx/bed.wav'), String(cfg.bedVolume ?? 1), mix], {cwd: ROOT, stdio: 'inherit'});
if (r.status !== 0) process.exit(1);
const cut = path.join(dir, 'cut.wav');
r = spawnSync(ffbin(), ['-v', 'error', '-y', '-ss', String(f0 / 30), '-t', String((f1 - f0 + 1) / 30), '-i', mix, cut], {stdio: 'inherit'});
if (r.status !== 0) process.exit(1);
const out = path.resolve(ROOT, outArg ?? 'out/part.mp4');
r = spawnSync(process.execPath, [path.join(ROOT, 'tools', 'loudness.mjs'), cut, silent, out, String(cfg.lufs ?? -14)], {cwd: ROOT, stdio: 'inherit'});
if (r.status !== 0) process.exit(1);
say(`DONE ${out}`);

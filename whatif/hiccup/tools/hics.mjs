// Where the hero hiccups: global frames for the sound (make-sound adds a 'hic' at each) and for
// the picture (Actor jerks the hero's body and pops a "HIC!"). Hiccups land in the air after
// lines inside the hiccup eras, plus explicit ones at a fraction of a line.
// node tools/hics.mjs  -> src/story/hics.json
import fs from 'node:fs';
const TL = JSON.parse(fs.readFileSync('src/story/timeline.json', 'utf8'));
const P = JSON.parse(fs.readFileSync('src/story/hics-plan.json', 'utf8'));
const n = (id) => Number(id.slice(0, 3));
const inEra = (id) => P.eras.some(([a, b]) => n(id) >= n(a) && n(id) <= n(b));
const pitch = (id) => (n(id) <= 8 ? 150 : n(id) <= 41 ? 215 : 215 - (n(id) - 41) * 8);
const out = [];
TL.lines.forEach((l, i) => {
	const id = l.id.slice(0, 3);
	if (!inEra(id)) return;
	const next = TL.lines[i + 1];
	const end = l.from + l.dur;
	if (next && next.from - end >= 18 && !P.noGapAfter.includes(id)) out.push({f: end + 5, f0: pitch(id), amp: 0.26});
});
for (const [id, frac] of P.explicit) {
	const l = TL.lines.find((x) => x.id.startsWith(id));
	out.push({f: Math.round(l.from + l.dur * frac), f0: pitch(id), amp: 0.3});
}
out.sort((a, b) => a.f - b.f);
const dedup = out.filter((h, i) => i === 0 || h.f - out[i - 1].f > 15);
fs.writeFileSync('src/story/hics.json', JSON.stringify(dedup));
console.log(`hics: ${dedup.length}`);

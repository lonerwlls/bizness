import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import TL from './story/timeline.json';
import LINES from './story/lines.json';
import {FONT, HAND} from './kit/ui';

/* 9:16 short for "The Great Impostor": three stretches of the finished long video
   (the hook, the surgery at sea, the real Dr. Cyr), the full 16:9 frame in the middle,
   a hook title on top and big captions below. Source: public/short_src.mp4 (= videos/impostor_full.mp4). */
const L = (id: string) => TL.lines.find((l) => l.id.startsWith(id))!;
const end = (id: string) => L(id).from + L(id).dur;
const SEGS: [number, number][] = [
	[L('002').from - 6, end('003') + 8],
	[L('065').from - 6, end('075') + 8],
	[L('081').from - 6, L('084').from - 6],
];
const CARD = 80;
const STARTS = SEGS.reduce<number[]>((a, s, i) => [...a, i ? a[i - 1] + (SEGS[i - 1][1] - SEGS[i - 1][0]) : 0], []);
const BODY = STARTS[STARTS.length - 1] + (SEGS[SEGS.length - 1][1] - SEGS[SEGS.length - 1][0]);
export const IMPOSTOR_SHORT_FRAMES = BODY + CARD;

/* captions: every line inside a stretch, split into chunks of ~3 words, timed by length */
type Cap = {from: number; to: number; text: string; who: string};
const CAPS: Cap[] = (() => {
	const out: Cap[] = [];
	const texts = LINES as {id: string; sp: string; t: string}[];
	SEGS.forEach(([a, b], i) => {
		for (const l of TL.lines) {
			if (l.from < a || l.from >= b) continue;
			const words = texts.find((x) => x.id === l.id)!.t.replace(/\.\.\./g, '…').split(' ');
			const chunks: string[] = [];
			for (const w of words) {
				const last = chunks[chunks.length - 1];
				if (last && last.split(' ').length < 3 && (last + ' ' + w).length <= 15 && !/[.!?…]$/.test(last)) chunks[chunks.length - 1] = last + ' ' + w;
				else chunks.push(w);
			}
			const total = chunks.reduce((s, c) => s + c.length, 0);
			let t = l.from - a + STARTS[i];
			for (const c of chunks) {
				const d = (l.dur * c.length) / total;
				out.push({from: Math.round(t), to: Math.round(t + d), text: c, who: l.sp});
				t += d;
			}
		}
	});
	return out;
})();

const pop = (f: number, t: number) => spring({frame: f - t, fps: 30, config: {damping: 11, stiffness: 170}});

const Stretch: React.FC<{a: number; len: number}> = ({a, len}) => (
	<OffthreadVideo
		src={staticFile('short_src.mp4')}
		startFrom={a}
		volume={(f) => interpolate(f, [0, 4, len - 5, len], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
		style={{width: 1080, height: 608}}
	/>
);

export const ImpostorShort: React.FC = () => {
	const f = useCurrentFrame();
	const cap = CAPS.find((c) => f >= c.from && f < c.to);
	const card = f >= BODY;
	const ck = card ? pop(f, BODY + 2) : 0;
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #2e2430 0%, #120e14 80%)'}}>
			{/* hook title */}
			<div style={{position: 'absolute', top: 250, left: 0, right: 0, textAlign: 'center'}}>
				<div style={{fontFamily: FONT, fontWeight: 900, fontSize: 104, color: '#f2c94c', lineHeight: 1.02, transform: `scale(${pop(f, 0)}) rotate(-2deg)`, textShadow: '0 8px 0 #000'}}>
					HE WASN'T
					<br />A SURGEON
				</div>
				<div style={{fontFamily: HAND, fontWeight: 700, fontSize: 70, color: '#f4efe2', marginTop: 18, opacity: interpolate(f, [8, 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>…but he operated anyway</div>
			</div>
			{/* the long video, full frame */}
			<div style={{position: 'absolute', top: 640, left: 0, width: 1080, height: 608, overflow: 'hidden', boxShadow: '0 0 0 8px #f2c94c, 0 20px 50px rgba(0,0,0,0.6)'}}>
				{SEGS.map(([a, b], i) => (
					<Sequence key={i} from={STARTS[i]} durationInFrames={b - a}>
						<Stretch a={a} len={b - a} />
					</Sequence>
				))}
				{card ? (
					<Img src={staticFile('short_end.jpg')} style={{width: 1080, height: 608, filter: 'brightness(0.35)'}} />
				) : null}
			</div>
			{/* captions */}
			{cap && !card ? (
				<div key={cap.from} style={{position: 'absolute', top: 1360, left: 40, right: 40, textAlign: 'center'}}>
					<span style={{fontFamily: FONT, fontWeight: 900, fontSize: 84, color: cap.who === 'N' ? '#ffffff' : '#7ad0ff', textTransform: 'uppercase', WebkitTextStroke: '6px #000', paintOrder: 'stroke', display: 'inline-block', transform: `scale(${0.85 + 0.15 * pop(f, cap.from)})`}}>{cap.text}</span>
				</div>
			) : null}
			{/* end card */}
			{card ? (
				<div style={{position: 'absolute', top: 1330, left: 0, right: 0, textAlign: 'center', transform: `scale(${ck})`}}>
					<div style={{fontFamily: FONT, fontWeight: 900, fontSize: 74, color: '#fff', WebkitTextStroke: '5px #000', paintOrder: 'stroke'}}>HOW DID HE GET CAUGHT?</div>
					<div style={{display: 'inline-block', marginTop: 30, fontFamily: FONT, fontWeight: 900, fontSize: 54, color: '#120e14', background: '#f2c94c', borderRadius: 24, padding: '16px 40px'}}>FULL STORY ON THE CHANNEL</div>
				</div>
			) : null}
			<AbsoluteFill style={{background: '#000', opacity: interpolate(f, [0, 5], [1, 0], {extrapolateRight: 'clamp'})}} />
		</AbsoluteFill>
	);
};

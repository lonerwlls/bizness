import React from 'react';
import {AbsoluteFill, interpolate, spring} from 'remotion';
import {Pose, Stickman} from '../engine/Stickman';
import {useShot} from '../kit/core';
import {camOn, clamp, ease, mixCam} from '../kit/kit';
import {FONT} from '../kit/ui';
import {CAST} from './cast';

/* helpers shared by all parts of the hiccup video */
export const useW = () => {
	const {at, end} = useShot();
	return (id: string, frac: number) => at(id) + Math.round((end(id) - at(id)) * frac);
};
export const pop = (f: number, t: number) => spring({frame: f - t, fps: 30, config: {damping: 11, stiffness: 160}});
const ease3 = (k: number) => interpolate(k, [0, 1], [0, 1], {...clamp, easing: ease});
/* camera through several framings: keys = [frame, cam] */
export const camPath = (f: number, keys: [number, ReturnType<typeof camOn>][]) => {
	if (f <= keys[0][0]) return keys[0][1];
	for (let i = 0; i + 1 < keys.length; i++) {
		const [a, ca] = keys[i];
		const [b, cb] = keys[i + 1];
		if (f <= b) return mixCam(ca, cb, ease3((f - a) / Math.max(1, b - a)));
	}
	return keys[keys.length - 1][1];
};
export const Tag: React.FC<{f: number; t: number; x: number; y: number; text: string; c?: string; fg?: string; size?: number; rot?: number; stroke?: string; until?: number}> = ({f, t, x, y, text, c = '#11142c', fg = '#fff', size = 40, rot = -4, stroke = '#ffd34a', until}) => {
	const k = pop(f, t);
	if (f < t) return null;
	const out = until !== undefined ? interpolate(f, [until, until + 8], [1, 0], clamp) : 1;
	if (out <= 0) return null;
	const w = text.length * size * 0.62 + 50;
	return (
		<g transform={`translate(${x},${y}) rotate(${rot}) scale(${k * out})`} opacity={Math.min(1, k * 1.5) * out}>
			<rect x={-w / 2} y={-size * 0.95} width={w} height={size * 1.9} rx={size * 0.5} fill={c} stroke={stroke} strokeWidth={4} />
			<text y={size * 0.35} textAnchor="middle" fontSize={size} fontFamily={FONT} fontWeight={900} fill={fg}>
				{text}
			</text>
		</g>
	);
};
/* big words popping in one by one across a line (title questions) */
export const TitleWords: React.FC<{words: string[]; hot?: string[]; t0: number; len: number; top?: number; size?: number}> = ({words, hot = [], t0, len, top = 40, size = 92}) => {
	const {f} = useShot();
	return (
		<AbsoluteFill style={{pointerEvents: 'none', alignItems: 'center', paddingTop: top}}>
			<div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', width: 1500, gap: '0 22px'}}>
				{words.map((wd, i) => {
					const t = t0 + (i / words.length) * len * 0.9;
					const k = spring({frame: f - t, fps: 30, config: {damping: 12, stiffness: 170}});
					const h = hot.some((x) => wd.includes(x));
					return (
						<span key={i} style={{fontFamily: FONT, fontWeight: 900, fontSize: size, color: h ? '#ffd34a' : '#fff', WebkitTextStroke: '3px #11142c', textShadow: '0 6px 0 #11142c, 0 0 30px rgba(0,0,0,0.6)', opacity: Math.min(1, k * 1.5), transform: `translateY(${(1 - k) * 60}px) scale(${0.6 + 0.4 * k}) rotate(${(1 - k) * (i % 2 ? 8 : -8)}deg)`, display: 'inline-block', lineHeight: 1.08}}>
							{wd}
						</span>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};
/* someone lying flat (on a stretcher, in bed, carried): a rotated stickman, head to the right */
export const Lying: React.FC<{who: string; x: number; y: number; s?: number; rot?: number; f: number; id: string; expr?: React.ComponentProps<typeof Stickman>['expr']; pose?: Pose; extra?: Partial<React.ComponentProps<typeof Stickman>>}> = ({who, x, y, s = 1, rot = 84, f, id, expr = 'sleepy', pose, extra}) => (
	<g transform={`translate(${x},${y}) rotate(${rot})`}>
		<Stickman id={id} x={0} y={0} scale={s} pose={pose ?? {lean: 0, head: -10 + Math.sin(f / 30) * 3, armB: [4, 10], armF: [6, 12], legB: [0, 0], legF: [3, 0]}} {...CAST[who]} expr={expr} look={[0.4, -0.5]} faceTurn={0.2} t={f} {...extra} />
	</g>
);
/* a jolt 0..1 for non-actor hiccups (the farmer, the sleeper): spikes at each frame in ts */
export const jolt = (f: number, ts: number[]) => {
	let k = 0;
	for (const t of ts) {
		const d = f - t;
		if (d < -2 || d > 14) continue;
		k = Math.max(k, d <= 1 ? (d + 2) / 3 : Math.exp(-(d - 1) / 3));
	}
	return k;
};

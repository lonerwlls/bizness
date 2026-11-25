import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {clamp} from '../kit/kit';
import {HAND} from '../kit/ui';

/* The hand-drawn explainer look used in "What if you lived underwater for 30 days?":
   wobbly ink over the whole frame, handwritten labels that type on with a curved arrow,
   a place/date stamp top right, black title cards. Hard cuts, slow push-ins only. */

export const INK = '#1e1d24';
export const PAPER = '#f6f1e4';
const kk = (x: number, a: number, b: number) => Math.max(0, Math.min(1, (x - a) / (b - a)));

export const Wobble: React.FC<{children: React.ReactNode; seed?: number; amt?: number}> = ({children, seed = 3, amt = 4}) => (
	<AbsoluteFill>
		<svg width={0} height={0} style={{position: 'absolute'}}>
			<filter id={`wob${seed}`} x="-2%" y="-2%" width="104%" height="104%">
				<feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves={2} seed={seed} />
				<feDisplacementMap in="SourceGraphic" scale={amt} xChannelSelector="R" yChannelSelector="G" />
			</filter>
		</svg>
		<AbsoluteFill style={{filter: `url(#wob${seed})`}}>{children}</AbsoluteFill>
	</AbsoluteFill>
);

/* handwritten label, types on letter by letter, then a curved arrow draws toward `to` */
export const Label: React.FC<{f: number; t: number; x: number; y: number; text: string; to?: [number, number]; bend?: number; c?: string; size?: number; rot?: number; until?: number; anchor?: 'middle' | 'start' | 'end'}> = ({
	f,
	t,
	x,
	y,
	text,
	to,
	bend = 60,
	c = PAPER,
	size = 58,
	rot = -3,
	until,
	anchor = 'middle',
}) => {
	if (f < t) return null;
	const out = until !== undefined ? interpolate(f, [until, until + 6], [1, 0], clamp) : 1;
	if (out <= 0) return null;
	const n = Math.min(text.length, Math.floor((f - t) * 1.7));
	const done = t + text.length / 1.7;
	const arrowK = kk(f, done, done + 10);
	let arrow: React.ReactNode = null;
	if (to) {
		const w = text.length * size * 0.42;
		const cx = anchor === 'middle' ? x : anchor === 'start' ? x + w / 2 : x - w / 2;
		const half = w / 2;
		const sx = to[0] < cx - half ? cx - half - 14 : to[0] > cx + half ? cx + half + 14 : cx;
		const sy = to[1] < y - size ? y - size * 0.85 : y + 16;
		const mx = (sx + to[0]) / 2 + bend;
		const my = (sy + to[1]) / 2 - bend * 0.4;
		const ang = Math.atan2(to[1] - my, to[0] - mx);
		arrow = (
			<g stroke={c} strokeWidth={5} fill="none" strokeLinecap="round">
				<path d={`M${sx},${sy} Q${mx},${my} ${to[0]},${to[1]}`} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - arrowK} />
				{arrowK >= 1 ? <path d={`M${to[0] - 22 * Math.cos(ang - 0.5)},${to[1] - 22 * Math.sin(ang - 0.5)} L${to[0]},${to[1]} L${to[0] - 22 * Math.cos(ang + 0.5)},${to[1] - 22 * Math.sin(ang + 0.5)}`} /> : null}
			</g>
		);
	}
	return (
		<g opacity={out}>
			{arrow}
			<text x={x} y={y} fontFamily={HAND} fontWeight={700} fontSize={size} fill={c} textAnchor={anchor} transform={`rotate(${rot},${x},${y})`} style={{paintOrder: 'stroke'}} stroke="#00000066" strokeWidth={7}>
				{text.slice(0, n)}
			</text>
		</g>
	);
};

/* place/date stamp, top right */
export const Stamp: React.FC<{f: number; a: string; b?: string}> = ({f, a, b}) => {
	const k = interpolate(f, [2, 8], [1.25, 1], clamp);
	return (
		<g transform={`translate(1840,78) scale(${k})`} opacity={interpolate(f, [2, 5], [0, 1], clamp)}>
			<text textAnchor="end" fontFamily={HAND} fontWeight={700} fontSize={56} fill={PAPER} style={{paintOrder: 'stroke'}} stroke="#00000066" strokeWidth={7}>
				{a}
			</text>
			{b ? (
				<text y={48} textAnchor="end" fontFamily={HAND} fontWeight={400} fontSize={40} fill="#d9d2c0" style={{paintOrder: 'stroke'}} stroke="#00000066" strokeWidth={6}>
					{b}
				</text>
			) : null}
		</g>
	);
};

/* screen-space overlay (1920×1080) */
export const Over: React.FC<{children: React.ReactNode}> = ({children}) => (
	<AbsoluteFill style={{pointerEvents: 'none'}}>
		<svg viewBox="0 0 1920 1080" width={1920} height={1080}>
			{children}
		</svg>
	</AbsoluteFill>
);

/* black title card with one handwritten line (or two) that types on */
export const TitleCard: React.FC<{f: number; lines: string[]; size?: number; hot?: number}> = ({f, lines, size = 96, hot}) => {
	let left = Math.floor(f * 1.4);
	return (
		<AbsoluteFill style={{background: '#000', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10}}>
			{lines.map((l, i) => {
				const n = Math.max(0, Math.min(l.length, left));
				left -= l.length;
				return (
					<div key={i} style={{fontFamily: HAND, fontWeight: 700, fontSize: size, color: hot === i ? '#9fe0e8' : PAPER, transform: `rotate(${i % 2 ? 1.5 : -2}deg)`, minHeight: size * 1.15, whiteSpace: 'pre'}}>
						{l.slice(0, n)}
					</div>
				);
			})}
		</AbsoluteFill>
	);
};

/* a fish silhouette */
export const Fish: React.FC<{x: number; y: number; s?: number; c?: string; dir?: 1 | -1}> = ({x, y, s = 1, c = '#24475a', dir = 1}) => (
	<g transform={`translate(${x},${y}) scale(${s * dir},${s})`}>
		<path d="M-40,0 Q-10,-22 26,0 Q-10,22 -40,0 Z M26,0 L46,-14 L44,14 Z" fill={c} />
	</g>
);

/* a sheet of paper on a dark desk for diagrams and maps */
export const Paper: React.FC<{children: React.ReactNode; tint?: string}> = ({children, tint = '#efe6d2'}) => (
	<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #3a3a42 0%, #1a1a20 90%)'}}>
		<svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
			<rect x={110} y={70} width={1700} height={940} fill="#000" opacity={0.35} transform="translate(10,14)" />
			<rect x={110} y={70} width={1700} height={940} fill={tint} stroke={INK} strokeWidth={5} />
			{Array.from({length: 20}).map((_, i) => (
				<line key={i} x1={110} y1={120 + i * 46} x2={1810} y2={120 + i * 46} stroke="#b8c8d8" strokeWidth={1.5} opacity={0.5} />
			))}
			{children}
		</svg>
	</AbsoluteFill>
);

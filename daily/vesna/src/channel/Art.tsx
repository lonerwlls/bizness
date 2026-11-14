import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {Stickman, Pose} from '../engine/Stickman';
import {idle} from '../kit/actions';
import {CAST} from '../story/cast';

/* Channel art: avatar (800x800) and banner (2560x1440, safe area 1546x423 in the middle).
   Only the hero (Doctor ROO) on a doodle wallpaper that fits any topic: science, history,
   money, medicine, space… No text. */
const ROO = CAST.doc;

/* small line doodles, each ~120 px, centred on 0,0 */
const DOODLES: ((c: string) => React.ReactNode)[] = [
	(c) => ( // atom
		<g fill="none" stroke={c}>
			<ellipse rx={56} ry={20} />
			<ellipse rx={56} ry={20} transform="rotate(60)" />
			<ellipse rx={56} ry={20} transform="rotate(-60)" />
			<circle r={7} fill={c} />
		</g>
	),
	(c) => <path d="M0,34 C-60,-6 -44,-56 0,-28 C44,-56 60,-6 0,34 Z" fill="none" stroke={c} />, // heart
	(c) => ( // light bulb
		<g fill="none" stroke={c}>
			<path d="M-18,22 C-44,0 -36,-44 0,-46 C36,-44 44,0 18,22 Z" />
			<path d="M-14,30 h28 M-12,40 h24" />
		</g>
	),
	(c) => ( // planet
		<g fill="none" stroke={c}>
			<circle r={30} />
			<ellipse rx={58} ry={14} transform="rotate(-18)" />
		</g>
	),
	(c) => <path d="M-50,6 L40,-8 Q56,-10 54,0 Q52,8 40,8 L-50,10 Z M-10,4 L-30,34 L-18,34 L14,6 M-40,6 L-52,-14 L-44,-14 L-30,4" fill="none" stroke={c} />, // plane
	(c) => ( // clock
		<g fill="none" stroke={c}>
			<circle r={40} />
			<path d="M0,0 V-26 M0,0 L18,10" />
		</g>
	),
	(c) => ( // coin
		<g fill="none" stroke={c}>
			<circle r={36} />
			<path d="M10,-16 C2,-24 -18,-20 -14,-8 C-10,4 14,-2 12,12 C10,24 -8,24 -14,16 M0,-28 V28" />
		</g>
	),
	(c) => <path d="M-14,-50 C26,-30 -26,-10 14,10 C54,30 -2,50 -14,50 M14,-50 C-26,-30 26,-10 -14,10 C-54,30 2,50 14,50 M-8,-36 h16 M-12,-2 h24 M-8,30 h16" fill="none" stroke={c} />, // DNA
	(c) => <path d="M0,-44 L12,-12 L46,-12 L18,8 L28,40 L0,20 L-28,40 L-18,8 L-46,-12 L-12,-12 Z" fill="none" stroke={c} />, // star
	(c) => ( // magnifier
		<g fill="none" stroke={c}>
			<circle cx={-8} cy={-8} r={28} />
			<path d="M12,12 L40,40" />
		</g>
	),
	(c) => <path d="M0,-50 C22,-30 22,10 12,26 H-12 C-22,10 -22,-30 0,-50 Z M-12,14 L-28,34 L-12,30 M12,14 L28,34 L12,30 M-6,26 L0,44 L6,26" fill="none" stroke={c} />, // rocket
	(c) => ( // globe
		<g fill="none" stroke={c}>
			<circle r={38} />
			<ellipse rx={16} ry={38} />
			<path d="M-38,0 H38 M-32,-20 H32 M-32,20 H32" />
		</g>
	),
	(c) => <path d="M-24,-40 H24 M-24,40 H24 M-20,-40 C-20,-10 20,-10 20,0 C20,10 -20,10 -20,40 M20,-40 C20,-10 -20,-10 -20,0 C-20,10 20,10 20,40" fill="none" stroke={c} />, // hourglass
	(c) => <path d="M8,-50 L-22,6 H2 L-8,50 L24,-8 H0 Z" fill="none" stroke={c} />, // lightning
	(c) => ( // eye
		<g fill="none" stroke={c}>
			<path d="M-50,0 Q0,-40 50,0 Q0,40 -50,0 Z" />
			<circle r={14} />
		</g>
	),
	(c) => ( // question mark
		<path d="M-18,-22 C-18,-50 22,-50 22,-22 C22,-4 0,-2 0,16 M0,32 v2" fill="none" stroke={c} />
	),
	(c) => <path d="M-30,30 C-50,10 -40,-30 -10,-30 C-6,-46 22,-46 26,-30 C50,-28 52,4 34,14 C40,32 10,40 0,28 C-10,40 -30,40 -30,30 Z M-10,-30 C-6,-14 10,-14 10,0 M0,28 C2,14 18,10 34,14" fill="none" stroke={c} />, // brain
	(c) => ( // pyramid
		<g fill="none" stroke={c}>
			<path d="M-50,34 L0,-40 L50,34 Z M0,-40 L12,34" />
		</g>
	),
];
const Doodles: React.FC<{w: number; h: number; c: string; step?: number; o?: number; seed?: string}> = ({w, h, c, step = 210, o = 0.16, seed = 'd'}) => {
	const out: React.ReactNode[] = [];
	let n = 0;
	for (let y = -40; y < h + 80; y += step * 0.86)
		for (let x = ((y / (step * 0.86)) % 2) * (step / 2) - 60; x < w + 80; x += step) {
			const i = Math.floor(random(seed + 'i' + n) * DOODLES.length);
			const r = (random(seed + 'r' + n) - 0.5) * 50;
			const s = 0.75 + random(seed + 's' + n) * 0.4;
			const jx = (random(seed + 'x' + n) - 0.5) * step * 0.3;
			const jy = (random(seed + 'y' + n) - 0.5) * step * 0.3;
			out.push(
				<g key={n} transform={`translate(${x + jx},${y + jy}) rotate(${r}) scale(${s})`} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round">
					{DOODLES[i](c)}
				</g>,
			);
			n++;
		}
	return <g opacity={o}>{out}</g>;
};

/* avatar: head and shoulders, big and friendly */
const avatarPose: Pose = {lean: 0, head: -3, armB: [-4, 4], armF: [4, 4], legB: [-4, 0], legF: [4, 0]};
export const Avatar: React.FC = () => (
	<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #ffe48a 0%, #f6bd2c 58%, #e39a1c 100%)'}}>
		<svg viewBox="0 0 800 800" width={800} height={800}>
			<Doodles w={800} h={800} c="#8a5a10" step={170} o={0.18} seed="av" />
			<circle cx={400} cy={350} r={250} fill="#fff6d0" opacity={0.35} />
			<Stickman id="ava" x={400} y={370 + 164 * 4.4} scale={4.4} facing={1} pose={avatarPose} {...ROO} color="#f6f0e4" rim="#fff6dc" rimW={1.6} look={[0.05, 0.08]} faceTurn={0.1} mouth="smile" expr="normal" t={30} />
		</svg>
	</AbsoluteFill>
);

/* banner: the hero waving in the middle, doodle wallpaper on a deep night-blue */
export const Banner: React.FC = () => (
	<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, #33408f 0%, #1c2462 50%, #0d1236 100%)'}}>
		<svg viewBox="0 0 2560 1440" width={2560} height={1440}>
			<Doodles w={2560} h={1440} c="#9fd8ff" step={230} o={0.14} seed="bn" />
			<defs>
				<radialGradient id="glow">
					<stop offset="0" stopColor="#ffd88a" stopOpacity={0.55} />
					<stop offset="0.55" stopColor="#ffb85a" stopOpacity={0.18} />
					<stop offset="1" stopColor="#ffb85a" stopOpacity={0} />
				</radialGradient>
			</defs>
			<circle cx={1280} cy={700} r={560} fill="url(#glow)" />
			<ellipse cx={1280} cy={1390} rx={260} ry={36} fill="#000" opacity={0.35} />
			<Stickman id="ban" x={1280} y={1390 - 157 * 2.3} scale={2.3} facing={1} pose={{...idle(8, 3), armF: [86, 82]}} {...ROO} color="#f6f0e4" look={[0.05, -0.05]} faceTurn={0.15} mouth="smile" expr="normal" t={20} />
		</svg>
	</AbsoluteFill>
);

import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {Stickman, Pose} from '../engine/Stickman';
import {gesture, idle, reach} from '../kit/actions';
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

/* ---------- medical doodles for the banner wallpaper ---------- */
const MED: ((c: string) => React.ReactNode)[] = [
	(c) => ( // capsule pill
		<g fill="none" stroke={c} transform="rotate(-30)">
			<rect x={-50} y={-20} width={100} height={40} rx={20} />
			<line x1={0} y1={-20} x2={0} y2={20} />
		</g>
	),
	(c) => ( // medical cross
		<path d="M-14,-46 h28 v32 h32 v28 h-32 v32 h-28 v-32 h-32 v-28 h32 z" fill="none" stroke={c} />
	),
	(c) => ( // heart
		<path d="M0,40 C-60,0 -50,-40 -22,-40 C-8,-40 0,-28 0,-20 C0,-28 8,-40 22,-40 C50,-40 60,0 0,40 Z" fill="none" stroke={c} />
	),
	(c) => ( // DNA
		<g fill="none" stroke={c}>
			<path d="M-20,-50 C20,-25 20,0 -20,25 C-40,38 -30,50 -20,50" />
			<path d="M20,-50 C-20,-25 -20,0 20,25 C40,38 30,50 20,50" />
			{[-38, -18, 2, 22].map((y) => (
				<line key={y} x1={-12} y1={y} x2={12} y2={y} />
			))}
		</g>
	),
	(c) => ( // syringe
		<g fill="none" stroke={c} transform="rotate(35)">
			<rect x={-40} y={-12} width={60} height={24} rx={4} />
			<line x1={20} y1={0} x2={50} y2={0} />
			<line x1={-40} y1={0} x2={-58} y2={0} />
			<line x1={-58} y1={-14} x2={-58} y2={14} />
		</g>
	),
	(c) => ( // molecule
		<g fill="none" stroke={c}>
			<circle cx={0} cy={0} r={12} />
			<circle cx={38} cy={-22} r={9} />
			<circle cx={-34} cy={-26} r={9} />
			<circle cx={6} cy={42} r={9} />
			<line x1={10} y1={-6} x2={30} y2={-17} />
			<line x1={-9} y1={-8} x2={-26} y2={-20} />
			<line x1={2} y1={12} x2={5} y2={33} />
		</g>
	),
	(c) => ( // flask
		<path d="M-12,-46 h24 v30 l30,50 q6,14 -8,16 h-68 q-14,-2 -8,-16 l30,-50 z" fill="none" stroke={c} />
	),
	(c) => ( // bandage
		<g fill="none" stroke={c} transform="rotate(-40)">
			<rect x={-52} y={-16} width={104} height={32} rx={14} />
			<rect x={-16} y={-16} width={32} height={32} />
		</g>
	),
	(c) => ( // thermometer
		<g fill="none" stroke={c} transform="rotate(20)">
			<rect x={-8} y={-50} width={16} height={74} rx={8} />
			<circle cx={0} cy={34} r={14} />
		</g>
	),
];
const MedDoodles: React.FC<{w: number; h: number; c: string; step?: number; o?: number; seed?: string}> = ({w, h, c, step = 170, o = 0.13, seed = 'm'}) => {
	const out: React.ReactNode[] = [];
	let n = 0;
	for (let y = -40; y < h + 80; y += step * 0.86)
		for (let x = ((y / (step * 0.86)) % 2) * (step / 2) - 60; x < w + 80; x += step) {
			const i = Math.floor(random(seed + 'i' + n) * MED.length);
			const r = (random(seed + 'r' + n) - 0.5) * 40;
			const sc = 0.7 + random(seed + 's' + n) * 0.35;
			out.push(
				<g key={n} transform={`translate(${x + (random(seed + 'x' + n) - 0.5) * 40},${y + (random(seed + 'y' + n) - 0.5) * 40}) rotate(${r}) scale(${sc})`} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round">
					{MED[i](c)}
				</g>,
			);
			n++;
		}
	return <g opacity={o}>{out}</g>;
};

/* ---------- lab pieces for the banner (flat, our ink outline) ---------- */
const INK = '#1a1626';
const Flask: React.FC<{x: number; y: number; c: string; s?: number; round?: boolean}> = ({x, y, c, s = 1, round}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		{round ? (
			<g>
				<circle cx={0} cy={-46} r={46} fill="#dff0fa" fillOpacity={0.5} stroke={INK} strokeWidth={6} />
				<path d="M-40,-40 A46,46 0 0 0 40,-40 Z" fill={c} />
				<circle cx={0} cy={-46} r={46} fill="none" stroke={INK} strokeWidth={6} />
				<rect x={-12} y={-130} width={24} height={46} fill="#dff0fa" fillOpacity={0.5} stroke={INK} strokeWidth={6} />
			</g>
		) : (
			<g>
				<path d="M-14,-120 h28 v40 l40,64 q8,16 -10,16 h-88 q-18,0 -10,-16 l40,-64 z" fill="#dff0fa" fillOpacity={0.5} />
				<path d="M-34,-48 h68 l20,32 q8,16 -10,16 h-88 q-18,0 -10,-16 z" fill={c} />
				<path d="M-14,-120 h28 v40 l40,64 q8,16 -10,16 h-88 q-18,0 -10,-16 l40,-64 z" fill="none" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
			</g>
		)}
		{[0, 1, 2].map((k) => (
			<circle key={k} cx={-10 + k * 12} cy={-(round ? 150 : 140) - k * 22} r={7 - k * 1.5} fill="none" stroke="#dff6ff" strokeWidth={3} opacity={0.8} />
		))}
	</g>
);
const TubeRack: React.FC<{x: number; y: number}> = ({x, y}) => (
	<g transform={`translate(${x},${y})`}>
		{['#7af0a8', '#ff8a9a', '#9fd8ff', '#ffd34a'].map((c, i) => (
			<g key={i} transform={`translate(${-54 + i * 36},0)`}>
				<rect x={-11} y={-110} width={22} height={100} rx={11} fill="#dff0fa" fillOpacity={0.5} stroke={INK} strokeWidth={5} />
				<rect x={-8} y={-60} width={16} height={46} rx={8} fill={c} />
			</g>
		))}
		<rect x={-80} y={-50} width={160} height={14} fill="#c99a3a" stroke={INK} strokeWidth={5} />
		<rect x={-80} y={-12} width={160} height={14} fill="#c99a3a" stroke={INK} strokeWidth={5} />
	</g>
);
const Microscope: React.FC<{x: number; y: number}> = ({x, y}) => (
	<g transform={`translate(${x},${y})`} stroke={INK} strokeWidth={6} strokeLinejoin="round">
		<rect x={-60} y={-18} width={120} height={18} rx={6} fill="#4a5068" />
		<path d="M10,-18 L30,-130 L50,-126 L34,-18 Z" fill="#c8ccd8" />
		<rect x={-40} y={-74} width={80} height={12} rx={4} fill="#4a5068" />
		<g transform="translate(0,-150) rotate(-28)">
			<rect x={-14} y={-70} width={28} height={110} rx={6} fill="#e8ecf2" />
			<rect x={-18} y={-84} width={36} height={20} rx={5} fill="#4a5068" />
			<rect x={-9} y={40} width={18} height={24} fill="#8a90a0" />
		</g>
	</g>
);
const XrayBox: React.FC<{x: number; y: number}> = ({x, y}) => (
	<g transform={`translate(${x},${y})`}>
		<rect x={-150} y={-120} width={300} height={240} rx={12} fill="#2a3048" stroke={INK} strokeWidth={6} />
		<rect x={-134} y={-104} width={268} height={208} fill="#d8f0ff" />
		<rect x={-124} y={-94} width={248} height={188} fill="#0e1830" />
		{/* chest x-ray */}
		<g stroke="#cfe6f6" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.9}>
			<line x1={0} y1={-80} x2={0} y2={80} />
			{[-60, -34, -8, 18, 44].map((yy) => (
				<g key={yy}>
					<path d={`M-6,${yy} q-60,8 -86,36`} />
					<path d={`M6,${yy} q60,8 86,36`} />
				</g>
			))}
			<path d="M-40,-86 q40,-14 80,0" />
		</g>
		<path d="M20,4 q30,-20 40,10 q-10,30 -40,26 z" fill="#ff8a9a" opacity={0.55} />
	</g>
);
const HeartModel: React.FC<{x: number; y: number}> = ({x, y}) => (
	<g transform={`translate(${x},${y})`} stroke={INK} strokeWidth={6} strokeLinejoin="round">
		<rect x={-8} y={-60} width={16} height={60} fill="#8a90a0" />
		<ellipse cx={0} cy={0} rx={50} ry={10} fill="#4a5068" />
		<g transform="translate(0,-130)">
			<path d="M0,60 C-80,10 -70,-50 -30,-56 C-10,-58 0,-44 0,-34 C0,-44 10,-58 30,-56 C70,-50 80,10 0,60 Z" fill="#e0505e" />
			<path d="M-10,-50 q-6,-30 10,-40 M14,-50 q10,-26 26,-30" fill="none" stroke="#3d6fd6" strokeWidth={12} strokeLinecap="round" />
			<path d="M-10,-50 q-6,-30 10,-40 M14,-50 q10,-26 26,-30" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" opacity={0.6} />
			<path d="M-30,-10 q20,20 0,40" fill="none" stroke="#a8303e" strokeWidth={6} />
		</g>
	</g>
);
const Helix: React.FC<{x: number; y: number; h: number}> = ({x, y, h}) => (
	<g transform={`translate(${x},${y})`}>
		{Array.from({length: 14}).map((_, i) => {
			const t = i / 13;
			const yy = -h * t;
			const dx = Math.sin(t * Math.PI * 3) * 38;
			return (
				<g key={i}>
					<line x1={-dx} y1={yy} x2={dx} y2={yy} stroke="#9fd8ff" strokeWidth={5} opacity={0.7} />
					<circle cx={-dx} cy={yy} r={9} fill="#7af0a8" stroke={INK} strokeWidth={3} />
					<circle cx={dx} cy={yy} r={9} fill="#ff8a9a" stroke={INK} strokeWidth={3} />
				</g>
			);
		})}
	</g>
);
/* a glowing heartbeat line across the whole width */
const ecgPath = (w: number, y: number) => {
	let d = `M0,${y}`;
	for (let x = 0; x < w; x += 320) d += ` L${x + 120},${y} L${x + 140},${y - 20} L${x + 160},${y} L${x + 180},${y} L${x + 196},${y + 30} L${x + 214},${y - 110} L${x + 232},${y + 50} L${x + 248},${y} L${x + 320},${y}`;
	return d;
};

/* banner: 2560x1440 for TV; desktop shows the middle 2560x423 band (y 508–931), phones show
   1546x423 (x 507–2053). Doctor ROO's lab fills that safe band; the rest is wallpaper. */
export const Banner: React.FC = () => {
	const FLOOR = 905;
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, #33408f 0%, #1c2462 50%, #0d1236 100%)'}}>
			<svg viewBox="0 0 2560 1440" width={2560} height={1440}>
				<MedDoodles w={2560} h={1440} c="#9fd8ff" step={150} o={0.12} seed="bn2" />
				<defs>
					<radialGradient id="glow">
						<stop offset="0" stopColor="#ffd88a" stopOpacity={0.45} />
						<stop offset="0.55" stopColor="#ffb85a" stopOpacity={0.14} />
						<stop offset="1" stopColor="#ffb85a" stopOpacity={0} />
					</radialGradient>
					<filter id="neon" x="-10%" y="-50%" width="120%" height="200%">
						<feGaussianBlur stdDeviation="8" />
					</filter>
				</defs>
				<ellipse cx={1280} cy={720} rx={760} ry={250} fill="url(#glow)" />
				{/* heartbeat line */}
				<path d={ecgPath(2560, 700)} stroke="#7af0a8" strokeWidth={14} fill="none" opacity={0.5} filter="url(#neon)" />
				<path d={ecgPath(2560, 700)} stroke="#b8ffd8" strokeWidth={5} fill="none" opacity={0.85} strokeLinejoin="round" />
				{/* lab floor strip */}
				<rect x={0} y={FLOOR} width={2560} height={14} fill="#0b0f2a" opacity={0.6} />
				{/* LEFT: bench with flasks, test tubes and a microscope */}
				<g>
					<rect x={600} y={FLOOR - 120} width={520} height={20} rx={6} fill="#c8ccd8" stroke={INK} strokeWidth={6} />
					<rect x={620} y={FLOOR - 100} width={16} height={100} fill="#8a90a0" stroke={INK} strokeWidth={4} />
					<rect x={1084} y={FLOOR - 100} width={16} height={100} fill="#8a90a0" stroke={INK} strokeWidth={4} />
					<Flask x={680} y={FLOOR - 120} c="#ff8a9a" s={0.95} />
					<Flask x={810} y={FLOOR - 120} c="#7af0a8" s={0.85} round />
					<TubeRack x={940} y={FLOOR - 120} />
					<Microscope x={1060} y={FLOOR - 120} />
				</g>
				{/* RIGHT: x-ray light box, heart model, DNA helix */}
				<XrayBox x={1610} y={640} />
				<HeartModel x={1830} y={FLOOR} />
				<Helix x={1960} y={FLOOR - 20} h={330} />
				{/* CENTER: Doctor ROO raising a glowing test tube */}
				<circle cx={1300} cy={600} r={60} fill="#7af0a8" opacity={0.18} filter="url(#neon)" />
				<ellipse cx={1280} cy={FLOOR + 6} rx={120} ry={14} fill="#000" opacity={0.35} />
				<Stickman
					id="ban"
					x={1280}
					y={FLOOR + 4 - 157 * 0.88}
					scale={0.88}
					facing={1}
					pose={reach(idle(9, 4), 'F', [118, -128], 1)}
					handItem={
						<g transform="rotate(-12)">
							<rect x={-9} y={-70} width={18} height={70} rx={9} fill="#dff0fa" fillOpacity={0.6} stroke={INK} strokeWidth={4} />
							<rect x={-6} y={-38} width={12} height={34} rx={6} fill="#7af0a8" />
							<circle cx={0} cy={-80} r={5} fill="none" stroke="#dff6ff" strokeWidth={2.5} />
						</g>
					}
					{...ROO}
					color="#f6f0e4"
					look={[0.25, -0.35]}
					faceTurn={0.2}
					mouth="smile"
					expr="normal"
					t={20}
				/>
			</svg>
		</AbsoluteFill>
	);
};

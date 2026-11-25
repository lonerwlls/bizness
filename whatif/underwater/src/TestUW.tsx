import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {ShotCtx} from './kit/core';
import {KazRoo} from './kaz/Roo';
import {Layer, Stage, Svg, camOn, clamp} from './kit/kit';
import {HAND} from './kit/ui';
import TL from './story/timeline.json';

/* 15-second style test for "What if you lived underwater for 30 days?" in the new explainer look:
   hand-drawn wobbly ink, muted palette with one accent, handwritten labels that type on with a
   curved arrow, a place/date stamp, a black title card, hard cuts and slow push-ins only. */

const INK = '#1e1d24';
const L = (id: string) => TL.lines.find((l) => l.id.startsWith(id))!;
const at = (id: string, k: number) => L(id).from + Math.round(L(id).dur * k);
const kk = (x: number, a: number, b: number) => Math.max(0, Math.min(1, (x - a) / (b - a)));

/* ---------------- hand-drawn kit ---------------- */
const Wobble: React.FC<{children: React.ReactNode; seed: number}> = ({children, seed}) => (
	<AbsoluteFill>
		<svg width={0} height={0} style={{position: 'absolute'}}>
			<filter id={`wob${seed}`} x="-2%" y="-2%" width="104%" height="104%">
				<feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves={2} seed={seed} />
				<feDisplacementMap in="SourceGraphic" scale={4} xChannelSelector="R" yChannelSelector="G" />
			</filter>
		</svg>
		<AbsoluteFill style={{filter: `url(#wob${seed})`}}>{children}</AbsoluteFill>
	</AbsoluteFill>
);
/* handwritten label that types on letter by letter, with a curved arrow drawing toward the target */
const Label: React.FC<{f: number; t: number; x: number; y: number; text: string; to?: [number, number]; bend?: number; c?: string; size?: number; rot?: number}> = ({f, t, x, y, text, to, bend = 60, c = '#f6f1e4', size = 54, rot = -3}) => {
	if (f < t) return null;
	const n = Math.min(text.length, Math.floor((f - t) * 1.6));
	const arrowK = kk(f, t + text.length / 1.6, t + text.length / 1.6 + 10);
	let arrow: React.ReactNode = null;
	if (to) {
		const half = text.length * size * 0.21;
		const sx = to[0] < x - half ? x - half - 14 : to[0] > x + half ? x + half + 14 : x;
		const sy = to[1] < y - size ? y - size * 0.85 : y + 16;
		const mx = (sx + to[0]) / 2 + bend;
		const my = (sy + to[1]) / 2 - bend * 0.4;
		const len = 900;
		const ang = Math.atan2(to[1] - my, to[0] - mx);
		arrow = (
			<g stroke={c} strokeWidth={5} fill="none" strokeLinecap="round">
				<path d={`M${sx},${sy} Q${mx},${my} ${to[0]},${to[1]}`} strokeDasharray={len} strokeDashoffset={len * (1 - arrowK)} />
				{arrowK >= 1 ? <path d={`M${to[0] - 22 * Math.cos(ang - 0.5)},${to[1] - 22 * Math.sin(ang - 0.5)} L${to[0]},${to[1]} L${to[0] - 22 * Math.cos(ang + 0.5)},${to[1] - 22 * Math.sin(ang + 0.5)}`} /> : null}
			</g>
		);
	}
	return (
		<g>
			{arrow}
			<text x={x} y={y} fontFamily={HAND} fontWeight={700} fontSize={size} fill={c} textAnchor="middle" transform={`rotate(${rot},${x},${y})`} style={{paintOrder: 'stroke'}} stroke="#00000055" strokeWidth={6}>
				{text.slice(0, n)}
			</text>
		</g>
	);
};
/* place/date stamp, top right */
const Stamp: React.FC<{f: number; a: string; b: string}> = ({f, a, b}) => {
	const k = interpolate(f, [2, 8], [1.25, 1], clamp);
	return (
		<g transform={`translate(1840,70) scale(${k})`} opacity={interpolate(f, [2, 5], [0, 1], clamp)}>
			<text textAnchor="end" fontFamily={HAND} fontWeight={700} fontSize={50} fill="#f6f1e4" style={{paintOrder: 'stroke'}} stroke="#00000066" strokeWidth={6}>
				{a}
			</text>
			<text y={44} textAnchor="end" fontFamily={HAND} fontWeight={400} fontSize={38} fill="#d9d2c0" style={{paintOrder: 'stroke'}} stroke="#00000066" strokeWidth={5}>
				{b}
			</text>
		</g>
	);
};
const Over: React.FC<{children: React.ReactNode}> = ({children}) => (
	<AbsoluteFill>
		<svg viewBox="0 0 1920 1080" width={1920} height={1080}>
			{children}
		</svg>
	</AbsoluteFill>
);
const Fish: React.FC<{x: number; y: number; s?: number; c?: string; dir?: 1 | -1}> = ({x, y, s = 1, c = '#24475a', dir = 1}) => (
	<g transform={`translate(${x},${y}) scale(${s * dir},${s})`}>
		<path d="M-40,0 Q-10,-22 26,0 Q-10,22 -40,0 Z M26,0 L46,-14 L44,14 Z" fill={c} />
	</g>
);
/* the shot context our rig needs (frame inside the shot, global frame) */
const Shot: React.FC<{from: number; to: number; C: React.FC<{f: number; dur: number}>}> = ({from, to, C}) => (
	<Sequence from={from} durationInFrames={to - from}>
		<Inner from={from} to={to} C={C} />
	</Sequence>
);
const Inner: React.FC<{from: number; to: number; C: React.FC<{f: number; dur: number}>}> = ({from, to, C}) => {
	const f = useCurrentFrame();
	return (
		<ShotCtx.Provider value={{f, gf: from + f, dur: to - from, start: from, at: (n) => L(n).from - from, end: (n) => L(n).from + L(n).dur - from}}>
			<C f={f} dur={to - from} />
		</ShotCtx.Provider>
	);
};

/* ---------------- places ---------------- */
const FLOOR = 900;
const POOL: [number, number] = [520, 860]; // the moon pool opening in the floor (x from..to)
/* inside the habitat: a steel tube with ribs, a porthole, bunks, the moon pool in the floor */
const Habitat: React.FC<{gf: number}> = ({gf}) => (
	<Svg>
		<rect x={-400} y={-300} width={2800} height={1300} fill="#5f6d76" />
		{/* curved ceiling and ribs */}
		<path d="M-400,-300 L2400,-300 L2400,140 Q960,40 -400,140 Z" fill="#4c5861" stroke={INK} strokeWidth={5} />
		{Array.from({length: 12}).map((_, i) => (
			<path key={i} d={`M${-200 + i * 220},120 L${-200 + i * 220},${FLOOR}`} stroke="#4f5b64" strokeWidth={18} />
		))}
		{/* pipes */}
		<path d="M-400,190 L2400,190" stroke="#8a7a5a" strokeWidth={16} />
		<path d="M-400,190 L2400,190" stroke={INK} strokeWidth={3} opacity={0.6} />
		<path d="M-400,222 L2400,222" stroke="#6a5a4a" strokeWidth={10} />
		{/* bunk beds on the left */}
		<g stroke={INK} strokeWidth={4}>
			<rect x={40} y={330} width={380} height={30} fill="#8a8f96" />
			<rect x={50} y={300} width={360} height={34} rx={10} fill="#a87a5a" />
			<rect x={40} y={560} width={380} height={30} fill="#8a8f96" />
			<rect x={50} y={530} width={360} height={34} rx={10} fill="#7a8a6a" />
			<line x1={40} y1={300} x2={40} y2={FLOOR} />
		</g>
		{/* porthole on the right: dark blue water, a few fish, light from above */}
		<g transform="translate(1520,420)">
			<circle r={170} fill="#8a9099" stroke={INK} strokeWidth={6} />
			<circle r={140} fill="#1f4b5f" stroke={INK} strokeWidth={5} />
			<clipPath id="ph">
				<circle r={138} />
			</clipPath>
			<g clipPath="url(#ph)">
				<rect x={-140} y={-140} width={280} height={120} fill="#5a95a6" opacity={0.7} />
				<ellipse cx={20} cy={-150} rx={90} ry={40} fill="#f2e6b0" opacity={0.5} />
				{[0, 1, 2].map((i) => (
					<polygon key={i} points={`${-80 + i * 70},-140 ${-50 + i * 70},-140 ${-10 + i * 70},140 ${-60 + i * 70},140`} fill="#cfe8e8" opacity={0.08} />
				))}
				<Fish x={-160 + ((gf * 1.4) % 360)} y={10} s={0.9} c="#173544" />
				<Fish x={-200 + ((gf * 1.1 + 120) % 400)} y={60} s={0.6} c="#173544" />
			</g>
			{Array.from({length: 10}).map((_, i) => (
				<circle key={i} cx={155 * Math.cos((i / 10) * Math.PI * 2)} cy={155 * Math.sin((i / 10) * Math.PI * 2)} r={6} fill="#5a6068" stroke={INK} strokeWidth={2} />
			))}
		</g>
		{/* floor: steel grating, with the moon pool cut into it */}
		<rect x={-400} y={FLOOR} width={2800} height={400} fill="#3d434b" stroke={INK} strokeWidth={5} />
		{Array.from({length: 40}).map((_, i) => (
			<line key={i} x1={-400 + i * 70} y1={FLOOR} x2={-400 + i * 70 - 60} y2={FLOOR + 180} stroke="#2e333a" strokeWidth={4} />
		))}
	</Svg>
);
/* the moon pool: a square hole in the floor with sea water standing in it */
const MoonPool: React.FC<{gf: number; fish?: number}> = ({gf, fish = 0}) => {
	const [a, b] = POOL;
	const wave = (x: number) => 4 * Math.sin(x / 40 + gf / 8);
	const top = FLOOR + 34;
	const pts = Array.from({length: 18}).map((_, i) => {
		const x = a + ((b - a) * i) / 17;
		return `${x},${top + wave(x)}`;
	});
	return (
		<g>
			<polygon points={`${a - 30},${FLOOR} ${b + 30},${FLOOR} ${b},${FLOOR + 60} ${a},${FLOOR + 60}`} fill="#141c22" stroke={INK} strokeWidth={5} />
			<polygon points={`${a},${FLOOR + 60} ${pts.join(' ')} ${b},${FLOOR + 60}`} fill="#2d6b80" />
			<polyline points={pts.join(' ')} fill="none" stroke="#9fd0d8" strokeWidth={4} />
			{fish > 0 && fish < 1 ? <Fish x={a + (b - a) * fish} y={top + 16} s={0.5} c="#0f2a36" /> : null}
			{/* ladder going down into the sea */}
			<g stroke="#c9b27a" strokeWidth={8}>
				<line x1={b - 70} y1={FLOOR - 80} x2={b - 70} y2={FLOOR + 50} />
				<line x1={b - 20} y1={FLOOR - 80} x2={b - 20} y2={FLOOR + 50} />
				{[FLOOR - 60, FLOOR - 20, FLOOR + 20].map((y) => (
					<line key={y} x1={b - 70} y1={y} x2={b - 20} y2={y} />
				))}
			</g>
		</g>
	);
};

/* ---------------- shots ---------------- */
const RX = 1000;
/* A: day one — the front door is a hole in the floor */
const ShotA: React.FC<{f: number; dur: number}> = ({f, dur}) => {
	const gf = f;
	const point = kk(f, at('001', 0.3) , at('001', 0.3) + 10);
	const z = 1.32 + 0.05 * (f / dur);
	const hand: [number, number] = [62 + (150 - 62) * point, -190 + (-250 + 190) * point];
	return (
		<Wobble seed={3}>
			<Stage still cam={camOn(820, 690, z)} bg="#5f6d76" light={{x: 70, y: 0, o: 0.25, c: '200,235,240'}} grain={0.12} vig={0.6}>
				<Layer depth={1}>
					<Habitat gf={gf} />
					<Svg>
						<MoonPool gf={gf} fish={kk(f, at('001', 0.75), at('001', 0.95))} />
						<Label f={f} t={at('001', 0.22)} x={560} y={700} text="your front door" to={[640, 915]} bend={-60} size={62} />
						<Label f={f} t={at('001', 0.7)} x={1240} y={1010} text="the open ocean" to={[880, 960]} bend={40} c="#9fe0e8" rot={2} size={56} />
						<KazRoo x={RX} y={FLOOR} s={0.66} facing={-1} t={gf} pose={{hand}} face={{look: [0.6, 0.5], mouth: f > at('001', 0.75) ? 'open' : 'smile', brows: f > at('001', 0.75) ? 'up' : 'flat'}} />
					</Svg>
				</Layer>
			</Stage>
			<Over>
				<Stamp f={f} a="Day 1" b="60 ft under the Florida Keys" />
			</Over>
		</Wobble>
	);
};
/* B1: the habitat in cross-section on the seafloor, 60 ft below a tiny boat */
const ShotB1: React.FC<{f: number; dur: number}> = ({f, dur}) => {
	const z = 1.0 + 0.03 * (f / dur);
	return (
		<Wobble seed={5}>
			<AbsoluteFill style={{background: '#21495c'}}>
				<div style={{position: 'absolute', inset: 0, transform: `scale(${z})`}}>
					<svg viewBox="0 0 1920 1080" width={1920} height={1080}>
						<defs>
							<linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
								<stop offset="0" stopColor="#4f8a9c" />
								<stop offset="1" stopColor="#173a4b" />
							</linearGradient>
						</defs>
						<rect width={1920} height={150} fill="#c9d6d2" />
						<rect y={150} width={1920} height={930} fill="url(#sea)" />
						<path d={`M0,150 ${Array.from({length: 25}).map((_, i) => `q40,${i % 2 ? 10 : -10} 80,0`).join(' ')}`} fill="none" stroke={INK} strokeWidth={4} />
						{/* the tiny support boat */}
						<g transform={`translate(1240,${146 + 3 * Math.sin(f / 10)})`} stroke={INK} strokeWidth={4}>
							<path d="M-90,0 L90,0 L70,26 L-70,26 Z" fill="#b8a27a" />
							<rect x={-30} y={-30} width={50} height={30} fill="#e8e0d0" />
						</g>
						{/* light shafts */}
						{[0, 1, 2, 3].map((i) => (
							<polygon key={i} points={`${400 + i * 300},150 ${470 + i * 300},150 ${600 + i * 300},900 ${480 + i * 300},900`} fill="#e8f4f0" opacity={0.06} />
						))}
						{/* sand and the habitat on its legs */}
						<path d="M0,900 Q480,870 960,890 T1920,880 L1920,1080 L0,1080 Z" fill="#9a8a6a" stroke={INK} strokeWidth={5} />
						<g transform="translate(960,760)" stroke={INK} strokeWidth={5}>
							{[-220, -80, 80, 220].map((x) => (
								<line key={x} x1={x} y1={60} x2={x + (x > 0 ? 20 : -20)} y2={135} strokeWidth={10} />
							))}
							<rect x={-300} y={-80} width={600} height={150} rx={75} fill="#c9c3b2" />
							{[-180, -60, 60, 180].map((x) => (
								<circle key={x} cx={x} cy={-6} r={26} fill="#f2d27a" />
							))}
							<rect x={-60} y={68} width={120} height={22} fill="#141c22" />
						</g>
						{/* fish school */}
						{Array.from({length: 7}).map((_, i) => (
							<Fish key={i} x={200 + ((f * 2 + i * 60) % 700)} y={420 + (i % 3) * 30} s={0.55} c="#173544" />
						))}
						{/* depth ruler */}
						<g stroke="#f6f1e4" strokeWidth={5} strokeLinecap="round" fill="none">
							<line x1={330} y1={170} x2={330} y2={880} strokeDasharray="22 16" />
							<path d="M310,190 L330,170 L350,190 M310,860 L330,880 L350,860" />
						</g>
					</svg>
				</div>
			</AbsoluteFill>
			<Over>
				<Label f={f} t={6} x={470} y={540} text="about 60 ft" rot={-4} size={64} />
				<Label f={f} t={30} x={1500} y={600} text="your new home" to={[1270, 720]} bend={-40} size={50} rot={3} />
			</Over>
		</Wobble>
	);
};
/* B2: why the sea stays out — air pressure pushes back */
const ShotB2: React.FC<{f: number; dur: number}> = ({f, dur}) => {
	const gf = f + 200;
	const z = 1.55 + 0.05 * (f / dur);
	const push = kk(f, 8, 24);
	return (
		<Wobble seed={7}>
			<Stage still cam={camOn(760, 820, z)} bg="#5f6d76" light={{x: 70, y: 0, o: 0.25, c: '200,235,240'}} grain={0.12} vig={0.6}>
				<Layer depth={1}>
					<Habitat gf={gf} />
					<Svg>
						<MoonPool gf={gf} />
						<KazRoo x={RX - 60} y={FLOOR} s={0.66} facing={-1} t={gf} pose={{head: 8}} face={{look: [0.5, 0.9], mouth: 'open', brows: 'up'}} />
						{/* pressure arrows: the air presses down, the sea presses up */}
						<g opacity={push} strokeLinecap="round">
							{[600, 690, 780].map((x, i) => (
								<g key={x} stroke="#e8b46a" strokeWidth={10} fill="none">
									<path d={`M${x},${FLOOR - 150 + 6 * Math.sin(f / 5 + i)} L${x},${FLOOR + 10}`} />
									<path d={`M${x - 16},${FLOOR - 8} L${x},${FLOOR + 12} L${x + 16},${FLOOR - 8}`} />
								</g>
							))}
						</g>
					</Svg>
				</Layer>
			</Stage>
			<Over>
				<Label f={f} t={14} x={560} y={470} text="2.5× the pressure" rot={-4} size={72} c="#f2c98a" />
				<Label f={f} t={50} x={1060} y={1000} text="the sea just... stays out" rot={2} size={64} c="#9fe0e8" />
			</Over>
		</Wobble>
	);
};
/* C: black title card */
const CardC: React.FC<{f: number; dur: number}> = ({f}) => {
	const text = 'Day 7.';
	const n = Math.min(text.length, Math.floor(f * 0.9));
	return (
		<AbsoluteFill style={{background: '#000', alignItems: 'center', justifyContent: 'center'}}>
			<div style={{fontFamily: HAND, fontWeight: 700, fontSize: 120, color: '#f6f1e4', transform: 'rotate(-2deg)'}}>{text.slice(0, n)}</div>
		</AbsoluteFill>
	);
};
/* D: day seven — looking up at the light through the porthole; no quick way back up */
const ShotD: React.FC<{f: number; dur: number}> = ({f, dur}) => {
	const gf = f + 400;
	const z = 1.5 + 0.05 * (f / dur);
	const out = interpolate(f, [dur - 10, dur], [0, 1], clamp);
	return (
		<>
			<Wobble seed={9}>
				<Stage still cam={camOn(1440, 540, z)} bg="#5f6d76" light={{x: 80, y: 0, o: 0.3, c: '200,235,240'}} grain={0.12} vig={0.65}>
					<Layer depth={1}>
						<Habitat gf={gf} />
						<Svg>
							<KazRoo x={1330} y={FLOOR} s={0.66} facing={1} t={gf} pose={{head: -12}} face={{look: [0.6, -0.9], mouth: 'flat', brows: 'worried'}} />
						</Svg>
					</Layer>
				</Stage>
				<Over>
					<Stamp f={f} a="Day 7" b="still 60 ft under" />
					<Label f={f} t={10} x={470} y={250} text="the sun: right up there" to={[1000, 165]} bend={-60} size={60} c="#f2d27a" />
					<Label f={f} t={36} x={1440} y={960} text="no quick way back up" rot={-2} size={70} c="#ff9a8a" />
				</Over>
			</Wobble>
			<AbsoluteFill style={{background: '#000', opacity: out}} />
		</>
	);
};

export const TEST_FRAMES = TL.total;
export const TestUW: React.FC = () => {
	const b2 = at('002', 0.42);
	const c = L('003').from - 2;
	const d = c + 32;
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<Shot from={0} to={L('002').from - 2} C={ShotA} />
			<Shot from={L('002').from - 2} to={b2} C={ShotB1} />
			<Shot from={b2} to={c} C={ShotB2} />
			<Shot from={c} to={d} C={CardC} />
			<Shot from={d} to={TL.total} C={ShotD} />
			{TL.lines.map((l) => (
				<Sequence key={l.id} from={l.from}>
					<Audio src={staticFile(l.file)} />
				</Sequence>
			))}
			<Audio src={staticFile('sfx/test_bed.wav')} volume={0.35} />
		</AbsoluteFill>
	);
};

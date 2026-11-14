import React from 'react';
import {interpolate, random} from 'remotion';
import {Svg} from '../engine/camera';
import {darken} from '../engine/color';
import {FONT, HAND} from '../kit/ui';
import {Floor, Wall} from './placesH';

/* Places of the Vesna Vulović short. Everything important sits in the middle column
   (x ≈ 660–1260): the short is a 9:16 crop around x = 960. */
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/* 1972 jet cabin, side view: curved wall, round windows with dusk outside, seat backs */
export const Cabin: React.FC<{f: number; shake?: number}> = ({f, shake = 0}) => (
	<Svg>
		<g transform={`translate(${Math.sin(f * 2.3) * 6 * shake},${Math.cos(f * 1.9) * 5 * shake})`}>
			<Wall id="cab-w" top="#d9cfb8" bot="#efe6d0" />
			<rect x={-400} y={-300} width={2800} height={330} fill="#c4b89c" />
			<rect x={-400} y={20} width={2800} height={16} fill="#a89c80" />
			{/* overhead bins */}
			{Array.from({length: 10}).map((_, i) => (
				<g key={i}>
					<rect x={-300 + i * 300} y={60} width={290} height={120} rx={14} fill="#e6dcc4" stroke="#b8ac90" strokeWidth={4} />
					<rect x={-180 + i * 300} y={150} width={60} height={12} rx={6} fill="#9a8e74" />
				</g>
			))}
			{/* windows */}
			{Array.from({length: 10}).map((_, i) => (
				<g key={i} transform={`translate(${-150 + i * 300},330)`}>
					<rect x={-50} y={-70} width={100} height={140} rx={46} fill="#b8ac90" />
					<rect x={-38} y={-58} width={76} height={116} rx={36} fill="url(#cab-sky)" />
				</g>
			))}
			<defs>
				<linearGradient id="cab-sky" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#2a3a7a" />
					<stop offset="0.6" stopColor="#e88a6a" />
					<stop offset="1" stopColor="#f6d6a0" />
				</linearGradient>
			</defs>
			{/* seat rows (backs) */}
			{Array.from({length: 9}).map((_, i) => (
				<g key={i} transform={`translate(${-60 + i * 300},0)`}>
					<rect x={-70} y={520} width={150} height={300} rx={34} fill="#c0503a" />
					<rect x={-60} y={520} width={130} height={60} rx={20} fill="#f2ead8" />
					<circle cx={0} cy={500} r={46} fill={['#3a2a1a', '#e8b48a', '#c98a5a', '#f2d0b5', '#8a5a3a'][i % 5]} opacity={0.9} />
				</g>
			))}
			<Floor y={880} c="#6a5a7a" />
			<rect x={-400} y={880} width={2800} height={30} fill="#4a8a7a" opacity={0.6} />
		</g>
	</Svg>
);
/* the catering trolley (side view), origin at its floor centre */
export const Cart: React.FC<{x: number; y: number; rot?: number; s?: number}> = ({x, y, rot = 0, s = 1}) => (
	<g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
		<rect x={-70} y={-190} width={140} height={176} rx={10} fill="#c9ced8" stroke="#8a90a0" strokeWidth={5} />
		<rect x={-58} y={-176} width={116} height={50} rx={6} fill="#aab0bc" />
		<rect x={-58} y={-116} width={116} height={50} rx={6} fill="#aab0bc" />
		<rect x={-30} y={-206} width={60} height={20} rx={6} fill="#e4473c" />
		<circle cx={-48} cy={-6} r={10} fill="#1b1a26" />
		<circle cx={48} cy={-6} r={10} fill="#1b1a26" />
	</g>
);
/* sky with drifting cloud bands; speed > 0 makes clouds rush up (falling) */
export const SkyFall: React.FC<{f: number; speed?: number; dusk?: number}> = ({f, speed = 0, dusk = 1}) => (
	<Svg>
		<defs>
			<linearGradient id="sky-fall" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor={dusk ? '#1d2560' : '#6aa0d8'} />
				<stop offset="0.55" stopColor={dusk ? '#8a5a9a' : '#a8cfe8'} />
				<stop offset="1" stopColor={dusk ? '#f2a07a' : '#e8f2f6'} />
			</linearGradient>
		</defs>
		<rect x={-400} y={-300} width={2800} height={1700} fill="url(#sky-fall)" />
		{Array.from({length: 14}).map((_, i) => {
			const y = ((random('cy' + i) * 1500 - f * speed * (0.6 + random('cs' + i))) % 1500 + 1500) % 1500 - 250;
			const x = random('cx' + i) * 2200 - 140 + Math.sin(f / 60 + i) * 20;
			const w = 260 + random('cw' + i) * 420;
			return (
				<g key={i} opacity={0.55 + random('co' + i) * 0.4}>
					<ellipse cx={x} cy={y} rx={w / 2} ry={46} fill="#fbe8e0" />
					<ellipse cx={x - w * 0.18} cy={y - 30} rx={w * 0.22} ry={40} fill="#fbe8e0" />
					<ellipse cx={x + w * 0.12} cy={y - 40} rx={w * 0.2} ry={44} fill="#fff4ee" />
				</g>
			);
		})}
		{speed > 0
			? Array.from({length: 22}).map((_, i) => {
					const y = ((random('ly' + i) * 1300 - f * speed * 3) % 1300 + 1300) % 1300 - 100;
					return <line key={i} x1={random('lx' + i) * 1920} y1={y} x2={random('lx' + i) * 1920} y2={y + 120} stroke="#fff" strokeWidth={3} opacity={0.35} />;
				})
			: null}
	</Svg>
);
/* the DC-9 (side view, faces right), origin at its centre */
export const Jet: React.FC<{x: number; y: number; s?: number; rot?: number}> = ({x, y, s = 1, rot = 0}) => (
	<g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
		<path d="M-330,-10 L-390,-150 L-330,-150 L-250,-30 Z" fill="#d8dce6" />
		<path d="M-400,-150 L-280,-150 L-300,-130 L-400,-130 Z" fill="#2f5fa8" />
		<rect x={-340} y={-40} width={660} height={80} rx={40} fill="#f2f4f8" />
		<path d="M320,-40 Q380,-30 400,0 Q380,30 320,40 Z" fill="#f2f4f8" />
		<path d="M340,-24 Q370,-20 384,-6 L340,-6 Z" fill="#2a3a6a" />
		<rect x={-340} y={-6} width={680} height={12} fill="#2f5fa8" />
		{Array.from({length: 14}).map((_, i) => (
			<circle key={i} cx={-240 + i * 38} cy={-18} r={7} fill="#2a3a6a" />
		))}
		<path d="M-40,20 L60,20 L-60,90 L-120,90 Z" fill="#c8ccd8" />
		<rect x={-300} y={-70} width={90} height={36} rx={18} fill="#c8ccd8" />
	</g>
);
/* a torn section of fuselage with a cut-away, origin at its centre */
export const Chunk: React.FC<{x: number; y: number; rot?: number; s?: number; children?: React.ReactNode}> = ({x, y, rot = 0, s = 1, children}) => (
	<g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
		<path d="M-260,-120 L240,-120 L270,-90 L250,-40 L280,10 L250,60 L270,120 L-250,120 L-280,70 L-250,20 L-285,-30 L-250,-80 Z" fill="#f2f4f8" stroke="#8a90a0" strokeWidth={6} />
		<path d="M-220,-90 L210,-90 L230,-50 L215,0 L235,50 L215,95 L-215,95 L-240,50 L-215,0 L-245,-45 Z" fill="#3a2f40" />
		<rect x={-250} y={-12} width={520} height={14} fill="#2f5fa8" opacity={0.6} />
		{children}
	</g>
);
/* snowy wooded mountainside */
export const SnowSlope: React.FC<{f: number; night?: boolean}> = ({f, night}) => (
	<Svg>
		<Wall id={night ? 'sn-n' : 'sn-d'} top={night ? '#1d2550' : '#8fb0d8'} bot={night ? '#5a5a8a' : '#dce8f2'} />
		<path d="M-400,520 L300,260 L800,460 L1300,240 L2400,560 L2400,1100 L-400,1100 Z" fill={night ? '#3a4270' : '#c8d6e8'} />
		<path d="M-400,760 L2400,560 L2400,1300 L-400,1300 Z" fill={night ? '#c8d0e6' : '#f4f8fc'} />
		{Array.from({length: 26}).map((_, i) => {
			const x = -300 + i * 100 + random('tx' + i) * 40;
			const y = 760 - (x + 400) * 0.0714 + random('ty' + i) * 80 - 60;
			const h = 180 + random('th' + i) * 120;
			return (
				<g key={i} transform={`translate(${x},${y})`}>
					<rect x={-8} y={-20} width={16} height={40} fill="#4a3a2a" />
					<path d={`M0,${-h} L${h * 0.32},-10 L${-h * 0.32},-10 Z`} fill={night ? '#1f3a3a' : '#2f5a4a'} />
					<path d={`M0,${-h} L${h * 0.18},${-h * 0.55} L${-h * 0.18},${-h * 0.55} Z`} fill="#fff" opacity={0.85} />
				</g>
			);
		})}
		{Array.from({length: 40}).map((_, i) => (
			<circle key={i} cx={(random('sx' + i) * 2000 + f * 0.8) % 2000 - 40} cy={(random('sy' + i) * 1100 + f * (1.2 + random('sv' + i))) % 1100} r={2 + random('sr' + i) * 3} fill="#fff" opacity={0.8} />
		))}
	</Svg>
);
/* light box with a standing skeleton (front view), marks = 0..1 per injury: skull, legs, spine */
export const XRay: React.FC<{x: number; y: number; marks: number[]; f: number}> = ({x, y, marks, f}) => {
	const ring = (cx: number, cy: number, r: number, k: number) =>
		k > 0 ? <ellipse cx={cx} cy={cy} rx={r} ry={r * 1.1} fill="none" stroke="#ff4a4a" strokeWidth={8} opacity={k} strokeDasharray={`${k * 400} 400`} /> : null;
	return (
		<g transform={`translate(${x},${y})`}>
			<rect x={-190} y={-400} width={380} height={800} rx={20} fill="#1b2230" stroke="#3a4250" strokeWidth={12} />
			<rect x={-170} y={-380} width={340} height={760} rx={10} fill="#0d1c2a" />
			<g stroke="#cfe6f2" strokeWidth={10} strokeLinecap="round" fill="none" opacity={0.9}>
				<ellipse cx={0} cy={-300} rx={50} ry={58} fill="#cfe6f2" opacity={0.85} stroke="none" />
				<line x1={0} y1={-240} x2={0} y2={20} strokeDasharray="14 8" strokeWidth={14} />
				{[0, 1, 2, 3, 4].map((i) => (
					<path key={i} d={`M-80,${-190 + i * 32} Q0,${-210 + i * 32} 80,${-190 + i * 32}`} strokeWidth={7} />
				))}
				<path d="M-60,30 Q0,70 60,30 L50,70 Q0,90 -50,70 Z" fill="#cfe6f2" opacity={0.7} stroke="none" />
				<line x1={-90} y1={-220} x2={-120} y2={-40} />
				<line x1={90} y1={-220} x2={120} y2={-40} />
				<line x1={-120} y1={-40} x2={-130} y2={110} />
				<line x1={120} y1={-40} x2={130} y2={110} />
				<line x1={-40} y1={80} x2={-55} y2={230} />
				<line x1={40} y1={80} x2={55} y2={230} />
				<line x1={-55} y1={230} x2={-60} y2={360} />
				<line x1={55} y1={230} x2={60} y2={360} />
			</g>
			{/* crack lines */}
			{marks[0] > 0.5 ? <path d="M-20,-340 l12,22 l-10,14 l14,20" stroke="#ff8a7a" strokeWidth={4} fill="none" /> : null}
			{ring(0, -300, 74, marks[0])}
			{ring(-56, 250, 50, marks[1])}
			{ring(56, 250, 50, marks[1])}
			{ring(0, -60, 56, marks[2])}
			<rect x={-170} y={-380} width={340} height={760} rx={10} fill="#9fd8ff" opacity={0.05 + 0.03 * Math.sin(f / 6)} />
		</g>
	);
};
/* hospital room wall (no sign), a bed on the right */
export const Ward: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<Wall id="wd-w" top="#2a5a64" bot="#3a6e74" />
		<rect x={-400} y={560} width={2800} height={14} fill="#4a8a90" />
		{[0, 1, 2].map((i) => (
			<rect key={i} x={160 + i * 640} y={-40} width={300} height={22} rx={8} fill="#e9fbff" opacity={0.9} />
		))}
		<g transform="translate(1420,250)">
			<rect x={-150} y={-110} width={300} height={220} fill="#cfe3e6" />
			<rect x={-136} y={-96} width={272} height={192} fill="#9fc8e8" />
			<line x1={0} y1={-96} x2={0} y2={96} stroke="#cfe3e6" strokeWidth={8} />
		</g>
		<Floor y={900} c="#3a6064" tiles />
	</Svg>
);
/* blood-pressure dial; k = needle 0 (high) .. 1 (low) */
export const Gauge: React.FC<{x: number; y: number; k: number; s?: number}> = ({x, y, k, s = 1}) => {
	const a = interpolate(k, [0, 1], [60, -70], clamp);
	return (
		<g transform={`translate(${x},${y}) scale(${s})`}>
			<circle r={160} fill="#f4f1e6" stroke="#2a2f4a" strokeWidth={14} />
			<path d="M-120,40 A130,130 0 0 1 -60,-110" stroke="#3a8af0" strokeWidth={22} fill="none" />
			<path d="M-60,-110 A130,130 0 0 1 60,-110" stroke="#9ff0b0" strokeWidth={22} fill="none" />
			<path d="M60,-110 A130,130 0 0 1 120,40" stroke="#ff6a5a" strokeWidth={22} fill="none" />
			<line x1={0} y1={0} x2={0} y2={-120} stroke="#11142c" strokeWidth={10} strokeLinecap="round" transform={`rotate(${a})`} />
			<circle r={18} fill="#11142c" />
			<text y={90} textAnchor="middle" fontSize={34} fontFamily={FONT} fontWeight={900} fill="#2a2f4a">
				mmHg
			</text>
		</g>
	);
};
/* record certificate */
export const Certificate: React.FC<{x: number; y: number; k: number; s?: number}> = ({x, y, k, s = 1}) => (
	<g transform={`translate(${x},${y}) scale(${s * k}) rotate(${(1 - k) * -8})`} opacity={Math.min(1, k * 1.4)}>
		<rect x={-270} y={-330} width={540} height={660} rx={10} fill="#fbf4dc" stroke="#c9a04a" strokeWidth={14} />
		<rect x={-240} y={-300} width={480} height={600} rx={6} fill="none" stroke="#c9a04a" strokeWidth={3} />
		<text y={-220} textAnchor="middle" fontSize={50} fontFamily={FONT} fontWeight={900} fill="#2a2f4a">
			WORLD RECORD
		</text>
		<text y={-130} textAnchor="middle" fontSize={34} fontFamily={FONT} fontWeight={800} fill="#5a4a2a">
			Highest fall survived
		</text>
		<text y={-86} textAnchor="middle" fontSize={34} fontFamily={FONT} fontWeight={800} fill="#5a4a2a">
			without a parachute
		</text>
		<text y={20} textAnchor="middle" fontSize={88} fontFamily={FONT} fontWeight={900} fill="#d23b3b">
			10,160 m
		</text>
		<text y={90} textAnchor="middle" fontSize={40} fontFamily={HAND} fontWeight={700} fill="#2a2f4a">
			Vesna Vulović · 1972
		</text>
		<circle cx={0} cy={200} r={64} fill="#e4b84a" stroke="#b8902a" strokeWidth={6} />
		<path d="M-20,250 L-40,320 L0,300 L40,320 L20,250" fill="#d23b3b" />
		<text y={214} textAnchor="middle" fontSize={44} fontFamily={FONT} fontWeight={900} fill="#fbf4dc">
			★
		</text>
	</g>
);
export const darkenC = darken;

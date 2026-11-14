// Оформление канала с героем Фонариком: аватарка 800×800 и шапка YouTube 2560×1440
// (важное — в безопасной зоне 1546×423 по центру, её видно на телефоне).
import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {Stickman, POSES} from '../engine/Stickman';
import {FONT} from '../kit/ui';
import {Forest, Ground, NightSky, Station} from './Station';

const TEAL = '#1f9a96';
const hero = {color: TEAL, outfit: 'coat' as const, hair: 'none' as const, hood: true, acc: ['lamp' as const], shoe: '#f2f2f2', rim: '#d8fff8', rimW: 2.6};
const Snow: React.FC<{n: number; w: number; h: number; x0?: number; y0?: number; seed: string}> = ({n, w, h, x0 = 0, y0 = 0, seed}) => (
	<g>{Array.from({length: n}).map((_, i) => <circle key={i} cx={x0 + random(seed + 'x' + i) * w} cy={y0 + random(seed + 'y' + i) * h} r={1.5 + random(seed + 'r' + i) * 3.5} fill="#fff" opacity={0.4 + random(seed + 'o' + i) * 0.5} />)}</g>
);
const BeamCone: React.FC<{x: number; y: number; ang: number; len: number; w: number; id: string; o?: number}> = ({x, y, ang, len, w, id, o = 0.5}) => (
	<g transform={`translate(${x},${y}) rotate(${ang})`}>
		<defs>
			<linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
				<stop offset="0" stopColor="#fff6c8" stopOpacity={o} />
				<stop offset="1" stopColor="#fff6c8" stopOpacity={0} />
			</linearGradient>
		</defs>
		<polygon points={`0,-8 ${len},${-w} ${len},${w} 0,8`} fill={`url(#${id})`} />
		<circle r={34} fill="#fff6c8" opacity={0.35} />
	</g>
);

// нейтральный фон «темнота»: едва видные силуэты разных историй и глаза во тьме
const Eyes: React.FC<{x: number; y: number; s?: number; o?: number}> = ({x, y, s = 1, o = 0.8}) => (
	<g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
		{[-1, 1].map((k) => <g key={k}><ellipse cx={k * 16} cy={0} rx={9} ry={6} fill="#ffe9a8" /><ellipse cx={k * 16} cy={0} rx={22} ry={14} fill="#ffe9a8" opacity={0.15} /></g>)}
	</g>
);
const Dark: React.FC<{w: number; h: number}> = ({w, h}) => (
	<g>
		<defs>
			<radialGradient id="dk" cx="0.55" cy="0.5" r="0.75"><stop offset="0" stopColor="#141b30" /><stop offset="0.6" stopColor="#0a0e1c" /><stop offset="1" stopColor="#04060c" /></radialGradient>
			<linearGradient id="fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0f1426" /><stop offset="1" stopColor="#05070e" /></linearGradient>
		</defs>
		<rect width={w} height={h} fill="url(#dk)" />
	</g>
);

export const Avatar: React.FC = () => {
	const s = 2.3, x = 380, floor = 380 + 321 * s;
	return (
		<AbsoluteFill style={{background: '#06080f'}}>
			<svg width={800} height={800} viewBox="0 0 800 800">
				<Dark w={800} h={800} />
				<Eyes x={130} y={190} s={0.9} o={0.55} />
				<Eyes x={690} y={600} s={0.8} o={0.4} />
				<BeamCone x={x + 14} y={floor - 321 * s - 31 * s} ang={-18} len={600} w={180} id="avb" o={0.6} />
				<Snow n={40} w={420} h={300} x0={420} y0={60} seed="dust" />
				<Stickman id="av" x={x} y={floor - 157 * s} scale={s} facing={1} pose={{...POSES.stand, head: -4}} {...hero} expr="normal" mouth="smirk" look={[0.5, -0.1]} faceTurn={0.3} blink={0} />
			</svg>
		</AbsoluteFill>
	);
};

export const Banner: React.FC = () => {
	const s = 1.15, hx = 1720, floor = 980;
	const [lx, ly] = [hx - 6 * s, floor - 157 * s - 164 * s - 31 * s];
	return (
		<AbsoluteFill style={{background: '#06080f'}}>
			<svg width={2560} height={1440} viewBox="0 0 2560 1440">
				<Dark w={2560} h={1440} />
				<rect y={floor} width={2560} height={1440 - floor} fill="url(#fl)" />
				{/* силуэты историй в темноте */}
				<g opacity={0.5}>
					{/* приоткрытая дверь со светом */}
					<rect x={180} y={560} width={190} height={420} fill="#0c1020" stroke="#1c2440" strokeWidth={6} />
					<polygon points="345,560 370,560 370,980 345,980" fill="#ffd27a" opacity={0.5} />
					<polygon points="370,980 345,980 300,1180 480,1180" fill="#ffd27a" opacity={0.08} />
					{/* окно с луной */}
					<rect x={2250} y={330} width={160} height={200} fill="#0d1428" stroke="#1c2440" strokeWidth={6} />
					<path d="M 2330 330 L 2330 530 M 2250 430 L 2410 430" stroke="#1c2440" strokeWidth={6} />
					<circle cx={2380} cy={370} r={18} fill="#c8d4f0" opacity={0.6} />
					{/* лестница вверх */}
					{Array.from({length: 7}).map((_, i) => <rect key={i} x={2160 + i * 40} y={980 - (i + 1) * 46} width={60} height={46} fill="#0c1020" stroke="#1c2440" strokeWidth={4} />)}
					{/* фонарный столб */}
					<rect x={60} y={300} width={12} height={680} fill="#141a30" /><rect x={40} y={290} width={60} height={18} fill="#141a30" />
				</g>
				<Eyes x={560} y={420} o={0.7} />
				<Eyes x={2080} y={820} s={0.8} o={0.55} />
				<Eyes x={260} y={1150} s={0.7} o={0.4} />
				{/* луч фонаря выхватывает имя */}
				<BeamCone x={lx} y={ly} ang={188} len={1500} w={330} id="bnb" o={0.55} />
				<Snow n={90} w={1100} h={420} x0={560} y0={430} seed="dust" />
				<ellipse cx={hx} cy={floor + 4} rx={80 * s} ry={13 * s} fill="#000" opacity={0.5} />
				<Stickman id="bn" x={hx} y={floor - 157 * s} scale={s} facing={-1} pose={{...POSES.stand, armF: [40, 50]}} {...hero} expr="normal" mouth="smirk" look={[-0.6, -0.1]} faceTurn={0.3} blink={0} />
				<g style={{filter: 'drop-shadow(0 0 30px rgba(255,236,170,0.6))'}}>
					<text x={1050} y={790} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={176} fill="#fff6dc" letterSpacing={4}>ФОНАРИК</text>
				</g>
			</svg>
		</AbsoluteFill>
	);
};

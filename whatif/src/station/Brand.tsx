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

export const Avatar: React.FC = () => {
	const s = 2.3, x = 380, floor = 380 + 321 * s;
	return (
		<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #1d3b52 0%, #0d1830 55%, #060a18 100%)'}}>
			<svg width={800} height={800} viewBox="0 0 800 800">
				{/* северное сияние */}
				{[0, 1].map((k) => <path key={k} d={`M -50 ${170 + k * 70} C 200 ${90 + k * 60}, 500 ${260 + k * 40}, 850 ${140 + k * 50}`} stroke={k ? '#2fb39a' : '#3fe0a8'} strokeWidth={70} fill="none" opacity={0.16} style={{filter: 'blur(22px)'}} />)}
				<Snow n={70} w={800} h={800} seed="av" />
				<BeamCone x={x + 14} y={floor - 321 * s - 31 * s} ang={-18} len={560} w={170} id="avb" o={0.55} />
				<Stickman id="av" x={x} y={floor - 157 * s} scale={s} facing={1} pose={{...POSES.stand, head: -4}} {...hero} expr="normal" mouth="smirk" look={[0.5, -0.1]} faceTurn={0.3} blink={0} />
				<circle cx={400} cy={400} r={392} fill="none" stroke="#5ee0da" strokeWidth={6} opacity={0.0} />
			</svg>
		</AbsoluteFill>
	);
};

export const Banner: React.FC = () => {
	const s = 1.2, hx = 1280, floor = 905;
	const [lx, ly] = [hx - 6 * s, floor - 157 * s - 164 * s - 31 * s];
	return (
		<AbsoluteFill style={{background: '#060a18'}}>
			{/* мир 1920×1080 растянут на 2560×1440: x −320…2240, y −180…1260 */}
			<svg width={2560} height={1440} viewBox="-320 -180 2560 1440">
				<NightSky T={3} />
				<Forest y={800} />
				<Ground />
				<g transform="translate(800,0)"><Station T={3} /></g>
				{/* следы от леса к Фонарику */}
				{Array.from({length: 9}).map((_, i) => <ellipse key={i} cx={-200 + i * 150 + (i % 2) * 20} cy={1010 - i * 10} rx={22} ry={8} fill="#8a98b0" opacity={0.8} />)}
				<BeamCone x={lx} y={ly} ang={192} len={1100} w={260} id="bnb" o={0.5} />
				<ellipse cx={hx} cy={floor + 4} rx={80 * s} ry={13 * s} fill="#000" opacity={0.25} />
				<Stickman id="bn" x={hx} y={floor - 157 * s} scale={s} facing={-1} pose={{...POSES.stand, armF: [40, 50]}} {...hero} expr="normal" mouth="smirk" look={[-0.6, -0.1]} faceTurn={0.3} blink={0} />
				<Snow n={160} w={2560} h={1440} x0={-320} y0={-180} seed="bn" />
				{/* надпись в луче фонаря — в безопасной зоне */}
				<g style={{filter: 'drop-shadow(0 0 24px rgba(255,240,180,0.55))'}}>
					<text x={680} y={500} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={112} fill="#fff6dc">ЧТО ЕСЛИ ТЫ…</text>
				</g>
				<text x={650} y={585} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={46} fill="#9fe8e4">страшные истории от первого лица</text>
				<g transform="translate(650,660)">
					<rect x={-200} y={-34} width={400} height={64} rx={32} fill="#11142c" stroke="#ffc94a" strokeWidth={4} />
					<text y={12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill="#fff">ТЫ — ГЛАВНЫЙ ГЕРОЙ</text>
				</g>
			</svg>
		</AbsoluteFill>
	);
};

import React from 'react';
import {Svg} from '../engine/camera';
import {FONT, HAND} from '../kit/ui';
import {Floor, Wall} from './placesH';

/* Locations of the Barry Marshall short: a 1984 hospital lab in Australia (beige, CRT, incubator),
   a medical conference hall, the Nobel stage (2005). */

export const LAB84_TOP = 760;
export const Lab84: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<Wall id="l84-w" top="#e8dcc0" bot="#dccfae" />
		<rect x={-400} y={600} width={2800} height={300} fill="#c8b890" />
		{/* hospital sign */}
		<g transform="translate(960,120)">
			<rect x={-300} y={-44} width={600} height={88} rx={10} fill="#2a5a4a" />
			<text y={14} textAnchor="middle" fontSize={34} fontFamily={FONT} fontWeight={900} fill="#f4efe2">
				FREMANTLE HOSPITAL · LAB
			</text>
		</g>
		{/* incubator with petri dishes */}
		<g transform="translate(380,250)">
			<rect width={300} height={340} rx={12} fill="#d8d8cc" stroke="#8a8a7a" strokeWidth={4} />
			<rect x={26} y={30} width={248} height={200} rx={8} fill="#f6e8b0" opacity={0.8 + 0.1 * Math.sin(f / 20)} />
			{[0, 1, 2].map((r) =>
				[0, 1, 2].map((c) => <ellipse key={`${r}-${c}`} cx={70 + c * 80} cy={70 + r * 60} rx={30} ry={10} fill="#e8b46a" stroke="#a87a3a" strokeWidth={3} />),
			)}
			<text x={150} y={290} textAnchor="middle" fontSize={26} fontFamily={FONT} fontWeight={900} fill="#5a5a4a">
				37°C
			</text>
		</g>
		{/* an 80s computer with a green screen */}
		<g transform="translate(1440,330)">
			<rect x={-140} y={-110} width={280} height={220} rx={16} fill="#d8d0b8" stroke="#8a8270" strokeWidth={5} />
			<rect x={-110} y={-84} width={220} height={150} rx={10} fill="#0a2a10" />
			{[0, 1, 2, 3].map((i) => (
				<rect key={i} x={-94} y={-64 + i * 30} width={(i * 53) % 120 + 60} height={10} fill="#3aff6a" opacity={0.8} />
			))}
			<rect x={-30} y={110} width={60} height={40} fill="#c8c0a8" />
			<rect x={-160} y={150} width={320} height={40} rx={8} fill="#d8d0b8" />
		</g>
		{/* poster: a stomach, "ULCERS = STRESS?" */}
		<g transform="translate(980,330) rotate(-2)">
			<rect x={-150} y={-120} width={300} height={240} fill="#fbfaf4" />
			<path d="M-40,-60 Q60,-90 70,0 Q60,90 -30,70 Q-60,60 -50,30 Q20,30 10,-10 Q0,-40 -40,-60 Z" fill="#f0a0a8" stroke="#2a1a14" strokeWidth={5} />
			<text y={104} textAnchor="middle" fontSize={26} fontFamily={HAND} fontWeight={700} fill="#d23b3b">
				Ulcers = stress?
			</text>
		</g>
		<Floor y={900} c="#a89a74" tiles />
	</Svg>
);
export const LabTable: React.FC<{x: number; w?: number}> = ({x, w = 560}) => (
	<g transform={`translate(${x},0)`}>
		<rect x={-w / 2} y={LAB84_TOP} width={w} height={22} rx={4} fill="#3a4a3a" />
		<rect x={-w / 2 + 16} y={LAB84_TOP + 22} width={w - 32} height={900 - LAB84_TOP - 22} fill="#e8e0c8" />
		{Array.from({length: Math.floor((w - 32) / 130)}).map((_, i) => (
			<rect key={i} x={-w / 2 + 30 + i * 130} y={LAB84_TOP + 40} width={116} height={100} rx={5} fill="#d8d0b8" />
		))}
	</g>
);

export const Hall84: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<Wall id="h84-w" top="#3a2a2a" bot="#4a3430" />
		{/* projection screen */}
		<g transform="translate(960,280)">
			<rect x={-380} y={-200} width={760} height={420} fill="#f4f0e4" />
			<text y={-110} textAnchor="middle" fontSize={44} fontFamily={FONT} fontWeight={900} fill="#2a2f4a">
				PEPTIC ULCER
			</text>
			<text y={-20} textAnchor="middle" fontSize={40} fontFamily={FONT} fontWeight={900} fill="#d23b3b">
				CAUSE: STRESS + ACID
			</text>
			<path d="M-120,40 Q0,0 120,40 Q100,150 0,160 Q-100,150 -120,40 Z" fill="#f0a0a8" stroke="#2a1a14" strokeWidth={5} />
			<polygon points="-380,-200 380,-200 330,220 -330,220" fill="#fff8d0" opacity={0.08 + 0.02 * Math.sin(f / 9)} />
		</g>
		<rect x={-400} y={620} width={2800} height={280} fill="#2a1c1c" />
		<Floor y={900} c="#5a2a2a" />
	</Svg>
);
/* audience row (front piece): backs of heads in silhouette */
export const AudienceRow: React.FC<{laugh: number; f: number}> = ({laugh, f}) => (
	<g>
		{Array.from({length: 12}).map((_, i) => {
			const x = -100 + i * 190;
			const bob = laugh > 0 ? Math.abs(Math.sin(f / 3 + i)) * 10 * laugh : 0;
			return (
				<g key={i}>
					<circle cx={x} cy={930 - bob} r={56} fill={['#2a2030', '#3a2a24', '#1d2030'][i % 3]} />
					<rect x={x - 70} y={960 - bob} width={140} height={160} rx={40} fill={['#3a3448', '#4a3a30', '#2a3040'][i % 3]} />
				</g>
			);
		})}
	</g>
);
export const Podium: React.FC<{x: number}> = ({x}) => (
	<g transform={`translate(${x},0)`}>
		<path d="M-110,700 L110,700 L90,900 L-90,900 Z" fill="#6a4028" />
		<rect x={-120} y={690} width={240} height={20} rx={6} fill="#8a5a3a" />
		<circle cx={0} cy={790} r={34} fill="#c99a3a" />
	</g>
);

export const NobelStage: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<rect x={-400} y={-300} width={2800} height={1300} fill="#0e1a3a" />
		{Array.from({length: 20}).map((_, i) => (
			<rect key={i} x={-400 + i * 140} y={-300} width={70} height={1200} fill="#14244a" />
		))}
		<g transform="translate(960,300)">
			<circle r={180} fill="#c99a3a" opacity={0.25} />
			<circle r={150} fill="none" stroke="#e8b830" strokeWidth={8} opacity={0.6} />
			<text y={20} textAnchor="middle" fontSize={56} fontFamily={FONT} fontWeight={900} fill="#e8b830" opacity={0.75}>
				2005
			</text>
		</g>
		{[400, 1520].map((x, i) => (
			<polygon key={i} points={`${x},-300 ${x + 60},-300 ${x + 260 + 40 * Math.sin(f / 30 + i)},900 ${x - 200},900`} fill="#fff4c0" opacity={0.07} />
		))}
		<rect x={-400} y={760} width={2800} height={140} fill="#2a2a3a" />
		<rect x={-400} y={752} width={2800} height={12} fill="#e8b830" />
		<Floor y={900} c="#1a1a2a" />
	</Svg>
);

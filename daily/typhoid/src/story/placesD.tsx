import React from 'react';
import {random} from 'remotion';
import {Svg} from '../engine/camera';
import {FONT} from '../kit/ui';
import {Floor, Wall} from './placesH';

/* Part D places — each scene its own background. */

/* family dining room: warm wallpaper stripes, a pendant lamp, a hutch with plates */
export const Dining: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<Wall id="dn-w" top="#f2d8a8" bot="#e8c890" />
		{Array.from({length: 30}).map((_, i) => (
			<rect key={i} x={-400 + i * 100} y={-300} width={40} height={900} fill="#e8c888" opacity={0.6} />
		))}
		<rect x={-400} y={560} width={2800} height={340} fill="#b8805a" />
		<rect x={-400} y={556} width={2800} height={10} fill="#8a5a3a" />
		<g transform="translate(1620,0)">
			<rect x={-150} y={200} width={300} height={420} fill="#7a4e2e" />
			<rect x={-130} y={220} width={260} height={180} fill="#f4ecd8" />
			{[0, 1, 2].map((i) => (
				<circle key={i} cx={-80 + i * 80} cy={310} r={34} fill="#fbfaf4" stroke="#3d6fd6" strokeWidth={6} />
			))}
		</g>
		<g transform="translate(960,0)">
			<line x1={0} y1={-300} x2={0} y2={250} stroke="#2a2a34" strokeWidth={4} />
			<path d="M-80,320 L80,320 L40,250 L-40,250 Z" fill="#c0503a" />
			<polygon points="-80,320 80,320 260,700 -260,700" fill="#ffe8a0" opacity={0.1 + 0.02 * Math.sin(f / 11)} />
		</g>
		<g transform="translate(380,250)">
			<rect x={-110} y={-90} width={220} height={180} fill="#5a3a22" />
			<rect x={-96} y={-76} width={192} height={152} fill="#9fd0f0" />
			<circle cx={-30} cy={-10} r={20} fill="#f2d0b5" />
			<circle cx={30} cy={0} r={16} fill="#f2d0b5" />
			<circle cx={0} cy={-20} r={22} fill="#f2d0b5" />
		</g>
		<Floor y={900} c="#7a5236" />
	</Svg>
);
/* dining table (front piece): top at y = 700 */
export const DinnerTable: React.FC<{x: number; w?: number}> = ({x, w = 620}) => (
	<g transform={`translate(${x},0)`}>
		<rect x={-w / 2} y={700} width={w} height={24} rx={6} fill="#f4ecd8" />
		<path d={`M${-w / 2},724 L${-w / 2 + 20},790 L${w / 2 - 20},790 L${w / 2},724 Z`} fill="#e8dcc0" />
		<rect x={-w / 2 + 40} y={790} width={18} height={110} fill="#5a3a22" />
		<rect x={w / 2 - 58} y={790} width={18} height={110} fill="#5a3a22" />
	</g>
);
/* long hospital corridor: doors, room numbers, a handrail */
export const Corridor2: React.FC = () => (
	<Svg>
		<Wall id="c2-w" top="#dfeef0" bot="#cfe2e6" />
		<rect x={-400} y={600} width={2800} height={300} fill="#b8d4d8" />
		<rect x={-400} y={590} width={2800} height={14} fill="#7aa0a8" />
		{[0, 1, 2, 3, 4].map((i) => (
			<g key={i} transform={`translate(${-100 + i * 520},0)`}>
				<rect x={0} y={330} width={220} height={570} fill="#9ab8d8" stroke="#6a88a8" strokeWidth={6} />
				<rect x={160} y={600} width={14} height={40} rx={6} fill="#4a5a6a" />
				<rect x={60} y={360} width={100} height={130} fill="#cfe6f6" />
				<rect x={40} y={270} width={140} height={44} rx={8} fill="#2a4a6a" />
				<text x={110} y={302} textAnchor="middle" fontSize={28} fontFamily={FONT} fontWeight={900} fill="#fff">
					{201 + i}
				</text>
			</g>
		))}
		{Array.from({length: 4}).map((_, i) => (
			<rect key={i} x={-200 + i * 700} y={-40} width={300} height={24} rx={8} fill="#f4fbff" />
		))}
		<Floor y={900} c="#9ab8bc" tiles />
	</Svg>
);
/* waiting chairs row (front), seat top 826 */
export const WaitChairs: React.FC<{x: number; n: number}> = ({x, n}) => (
	<g transform={`translate(${x},0)`}>
		{Array.from({length: n}).map((_, i) => (
			<g key={i} transform={`translate(${i * 120},0)`}>
				<rect x={-50} y={826} width={100} height={16} rx={6} fill="#3a8a8a" />
				<rect x={-50} y={730} width={14} height={110} rx={6} fill="#3a8a8a" />
			</g>
		))}
		<rect x={-50} y={842} width={n * 120 - 20} height={10} fill="#4a5a6a" />
		<rect x={-40} y={852} width={10} height={48} fill="#4a5a6a" />
		<rect x={n * 120 - 90} y={852} width={10} height={48} fill="#4a5a6a" />
	</g>
);
/* private hospital room at night: window with moon (k = 0 night → 1 dawn), curtain */
export const WardNight: React.FC<{f: number; k?: number}> = ({f, k = 0}) => (
	<Svg>
		<Wall id="wn-w" top="#1f2c48" bot="#2a3a58" />
		<rect x={-400} y={600} width={2800} height={300} fill="#253552" />
		<g transform="translate(1420,140)">
			<rect x={-14} y={-14} width={428} height={348} fill="#3a4a6a" />
			<rect width={400} height={320} fill="#0b1430" />
			<rect width={400} height={320} fill="#ffb27a" opacity={k * 0.8} />
			{Array.from({length: 20}).map((_, i) => (
				<circle key={i} cx={random('ws' + i) * 400} cy={random('wy' + i) * 200} r={2} fill="#fff" opacity={(1 - k) * 0.8} />
			))}
			<circle cx={80 + 260 * Math.min(1, k * 1.2)} cy={90 + 120 * k} r={30} fill="#eef1ff" opacity={1 - k * 0.7} />
			<line x1={200} y1={0} x2={200} y2={320} stroke="#3a4a6a" strokeWidth={10} />
			<path d="M-40,-30 h120 q-30,180 10,380 h-130 z" fill="#5a4a7a" opacity={0.9} />
		</g>
		<g transform="translate(300,260)">
			<rect x={-90} y={-70} width={180} height={140} fill="#3a2a22" />
			<rect x={-78} y={-58} width={156} height={116} fill="#e8b46a" opacity={0.7} />
			<circle cx={-20} cy={0} r={22} fill="#f2d0b5" opacity={0.8} />
			<circle cx={24} cy={4} r={20} fill="#f2d0b5" opacity={0.8} />
		</g>
		<Floor y={900} c="#1d2a44" />
	</Svg>
);
/* hospital bed (side view): mattress top at y = 730, head on the LEFT */
export const HospBed: React.FC<{x: number; w?: number}> = ({x, w = 560}) => (
	<g transform={`translate(${x},0)`}>
		<rect x={-w / 2 - 20} y={600} width={24} height={300} rx={8} fill="#c8d0dc" />
		<rect x={w / 2 - 4} y={660} width={20} height={240} rx={8} fill="#c8d0dc" />
		<rect x={-w / 2} y={740} width={w} height={36} rx={10} fill="#8a9aa8" />
		<rect x={-w / 2} y={700} width={w} height={44} rx={16} fill="#f4f6fa" />
		<rect x={-w / 2 + 10} y={672} width={120} height={40} rx={18} fill="#ffffff" />
		<rect x={-w / 2 + 40} y={776} width={14} height={124} fill="#6a7a88" />
		<rect x={w / 2 - 54} y={776} width={14} height={124} fill="#6a7a88" />
	</g>
);
export const BedBlanket: React.FC<{x: number; w?: number}> = ({x, w = 560}) => (
	<g transform={`translate(${x},0)`}>
		<path d={`M${-w / 2 + 120},696 Q${-w / 2 + 160},676 ${-w / 2 + 240},684 L${w / 2},690 L${w / 2},760 L${-w / 2 + 120},760 Z`} fill="#7aa0d8" />
		<path d={`M${-w / 2 + 120},700 L${w / 2},704`} stroke="#5a80b8" strokeWidth={4} />
	</g>
);

/* hospital bed with the head section raised (head on the LEFT): she half-sits against it */
export const HospBedRaised: React.FC<{x: number; w?: number}> = ({x, w = 560}) => (
	<g transform={`translate(${x},0)`}>
		<rect x={-w / 2 - 20} y={560} width={24} height={340} rx={8} fill="#c8d0dc" />
		<rect x={w / 2 - 4} y={660} width={20} height={240} rx={8} fill="#c8d0dc" />
		<rect x={-w / 2} y={740} width={w} height={36} rx={10} fill="#8a9aa8" />
		<rect x={-w / 2 + 90} y={700} width={w - 90} height={44} rx={16} fill="#f4f6fa" />
		<path d={`M${-w / 2 + 120},704 L${-w / 2 + 40},540 L${-w / 2},556 L${-w / 2 + 70},744 Z`} fill="#e8ecf2" />
		<path d={`M${-w / 2 + 10},540 Q${-w / 2 + 60},520 ${-w / 2 + 90},560 L${-w / 2 + 80},600 Q${-w / 2 + 40},590 ${-w / 2 + 20},600 Z`} fill="#ffffff" />
		<rect x={-w / 2 + 40} y={776} width={14} height={124} fill="#6a7a88" />
		<rect x={w / 2 - 54} y={776} width={14} height={124} fill="#6a7a88" />
	</g>
);
export const BedBlanket2: React.FC<{x: number; w?: number}> = ({x, w = 560}) => (
	<g transform={`translate(${x},0)`}>
		<path d={`M${-w / 2 + 70},${716} Q${-w / 2 + 120},${690} ${-w / 2 + 200},${694} L${w / 2},${696} L${w / 2},${764} L${-w / 2 + 80},${764} Z`} fill="#7aa0d8" />
		<path d={`M${-w / 2 + 80},${720} Q${-w / 2 + 130},${700} ${-w / 2 + 200},${702}`} stroke="#5a80b8" strokeWidth={4} fill="none" />
	</g>
);

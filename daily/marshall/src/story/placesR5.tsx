import React from 'react';
import {Svg} from '../engine/camera';
import {FONT} from '../kit/ui';
import {Floor, Wall} from './placesH';

/* Locations of part 5: the regeneration lab with frog tanks (2022), a daytime ER treatment bay. */

export const FROG_BENCH = 760;
export const RegenLab: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<Wall id="rg-w" top="#1d3a4a" bot="#24485a" />
		{/* racks of frog tanks with blue water */}
		{[0, 1].map((r) =>
			Array.from({length: 6}).map((_, i) => (
				<g key={`${r}-${i}`} transform={`translate(${120 + i * 300},${150 + r * 200})`}>
					<rect width={260} height={150} rx={8} fill="#3a7ab0" opacity={0.75} />
					<rect width={260} height={40} fill="#5aa0d0" opacity={0.5} />
					<rect y={150} width={260} height={14} fill="#8a9aa8" />
					<ellipse cx={80 + 40 * Math.sin(f / 40 + i + r)} cy={110} rx={22} ry={10} fill="#5a7a3a" opacity={0.8} />
					{Array.from({length: 3}).map((_, k) => (
						<circle key={k} cx={200} cy={130 - ((f * 1.5 + k * 40 + i * 13) % 120)} r={4} fill="none" stroke="#dff6ff" strokeWidth={2} opacity={0.7} />
					))}
				</g>
			)),
		)}
		<g transform="translate(960,90)">
			<rect x={-260} y={-40} width={520} height={70} rx={10} fill="#11142c" />
			<text y={10} textAnchor="middle" fontSize={32} fontFamily={FONT} fontWeight={900} fill="#7af0a8">
				REGENERATION LAB
			</text>
		</g>
		<rect x={-400} y={600} width={2800} height={300} fill="#1a3444" />
		<Floor y={900} c="#16303e" tiles gloss />
	</Svg>
);

export const BAY_TOP = 770;
export const ERBay: React.FC = () => (
	<Svg>
		<Wall id="bay-w" top="#e4f2f4" bot="#d0e8ec" />
		{/* curtain on a rail */}
		<rect x={-400} y={110} width={2800} height={10} fill="#8aa8b0" />
		{Array.from({length: 7}).map((_, i) => (
			<path key={i} d={`M${1280 + i * 90},120 q30,300 0,780 l90,0 q-30,-480 0,-780 z`} fill={i % 2 ? '#8ccbd4' : '#7abcc6'} />
		))}
		{/* daylight window */}
		<g transform="translate(300,170)">
			<rect x={-14} y={-14} width={388} height={298} fill="#f4f6fa" />
			<rect width={360} height={270} fill="#9fd8ff" />
			<circle cx={290} cy={70} r={34} fill="#fff4b0" />
			{[[50, 250, 80], [180, 260, 70], [310, 250, 80]].map(([x, y, r], i) => (
				<circle key={i} cx={x} cy={y} r={r} fill="#5ab06a" />
			))}
			<line x1={180} y1={0} x2={180} y2={270} stroke="#f4f6fa" strokeWidth={10} />
		</g>
		{/* glove box + sharps bin on the wall */}
		<g transform="translate(860,330)">
			<rect x={-90} y={-40} width={180} height={80} rx={8} fill="#f4f6fa" stroke="#8a9aa8" strokeWidth={4} />
			{[-50, 0, 50].map((x) => (
				<rect key={x} x={x - 20} y={-30} width={40} height={60} rx={6} fill="#7ab0e8" />
			))}
			<rect x={120} y={-50} width={70} height={100} rx={8} fill="#ffd34a" />
		</g>
		<rect x={-400} y={600} width={2800} height={300} fill="#c0dde2" />
		<Floor y={900} c="#a8c8d0" tiles />
	</Svg>
);
/* exam bed (front piece), mattress top at BAY_TOP */
export const ExamBed: React.FC<{x: number}> = ({x}) => (
	<g transform={`translate(${x},0)`}>
		<rect x={-220} y={BAY_TOP} width={440} height={34} rx={12} fill="#3a6a9a" />
		<rect x={-210} y={BAY_TOP - 6} width={420} height={10} fill="#fbfaf4" />
		<rect x={-200} y={BAY_TOP + 34} width={400} height={900 - BAY_TOP - 34} fill="#e8ecf2" />
		<rect x={-180} y={BAY_TOP + 54} width={160} height={80} rx={6} fill="#d8dce6" />
		<rect x={20} y={BAY_TOP + 54} width={160} height={80} rx={6} fill="#d8dce6" />
	</g>
);

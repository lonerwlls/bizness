import React from 'react';
import {Svg} from '../engine/camera';
import {Fish, INK} from '../kaz/kit';
import {FONT} from '../kit/ui';

/* Places of "What if you lived underwater for 30 days?" in the muted hand-drawn look:
   the habitat's living room (steel tube, bunks, porthole, moon pool), the sea in cross-section
   (surface, boat or buoy, hose, habitat on its legs), the shore watch room. */

export const FLOOR = 900;
export const POOL: [number, number] = [520, 860]; // moon pool opening (x from..to)
export const PORT: [number, number] = [1520, 420]; // porthole centre

/* inside the habitat */
export const Habitat: React.FC<{gf: number; dim?: number; sunny?: boolean}> = ({gf, dim = 0, sunny}) => (
	<Svg>
		<rect x={-400} y={-300} width={2800} height={1300} fill="#5f6d76" />
		<path d="M-400,-300 L2400,-300 L2400,140 Q960,40 -400,140 Z" fill="#4c5861" stroke={INK} strokeWidth={5} />
		{Array.from({length: 13}).map((_, i) => (
			<path key={i} d={`M${-200 + i * 220},120 L${-200 + i * 220},${FLOOR}`} stroke="#4f5b64" strokeWidth={18} />
		))}
		<path d="M-400,190 L2400,190" stroke="#8a7a5a" strokeWidth={16} />
		<path d="M-400,190 L2400,190" stroke={INK} strokeWidth={3} opacity={0.6} />
		<path d="M-400,222 L2400,222" stroke="#6a5a4a" strokeWidth={10} />
		{/* little wall lamps with a warm glow */}
		{[300, 1150].map((x) => (
			<g key={x}>
				<circle cx={x} cy={290} r={70} fill="#f2d27a" opacity={0.12} />
				<path d={`M${x - 26},300 L${x + 26},300 L${x + 16},270 L${x - 16},270 Z`} fill="#e8c46a" stroke={INK} strokeWidth={4} />
				<rect x={x - 4} y={300} width={8} height={20} fill="#6a5a4a" />
			</g>
		))}
		{/* condensation drops on the wall */}
		{Array.from({length: 14}).map((_, i) => (
			<ellipse key={i} cx={(i * 263) % 1900 - 100} cy={380 + ((i * 97) % 380)} rx={3} ry={5} fill="#cfe0e6" opacity={0.35} />
		))}
		{/* bunks */}
		<g stroke={INK} strokeWidth={4}>
			<rect x={40} y={330} width={380} height={30} fill="#8a8f96" />
			<rect x={50} y={300} width={360} height={34} rx={10} fill="#a87a5a" />
			<rect x={40} y={560} width={380} height={30} fill="#8a8f96" />
			<rect x={50} y={530} width={360} height={34} rx={10} fill="#7a8a6a" />
			<line x1={40} y1={300} x2={40} y2={FLOOR} />
		</g>
		{/* porthole */}
		<g transform={`translate(${PORT[0]},${PORT[1]})`}>
			<circle r={170} fill="#8a9099" stroke={INK} strokeWidth={6} />
			<circle r={140} fill="#1f4b5f" stroke={INK} strokeWidth={5} />
			<clipPath id="ph-u">
				<circle r={138} />
			</clipPath>
			<g clipPath="url(#ph-u)">
				<rect x={-140} y={-140} width={280} height={120} fill={sunny ? '#6aa5b6' : '#3b7186'} opacity={0.7} />
				{sunny ? (
					<path d={`M-140,-118 ${Array.from({length: 8}).map((_, i) => `q18,${i % 2 ? 8 : -8} 36,0`).join(' ')}`} stroke="#f6eab0" strokeWidth={5} fill="none" transform={`translate(${(gf * 0.6) % 36},0)`} />
				) : null}
				{[0, 1, 2].map((i) => (
					<polygon key={i} points={`${-80 + i * 70},-140 ${-50 + i * 70},-140 ${-10 + i * 70},140 ${-60 + i * 70},140`} fill="#cfe8e8" opacity={sunny ? 0.16 : 0.08} />
				))}
				<Fish x={-160 + ((gf * 1.4) % 360)} y={10} s={0.9} c="#173544" />
				<Fish x={-200 + ((gf * 1.1 + 120) % 400)} y={60} s={0.6} c="#173544" />
			</g>
			{Array.from({length: 10}).map((_, i) => (
				<circle key={i} cx={155 * Math.cos((i / 10) * Math.PI * 2)} cy={155 * Math.sin((i / 10) * Math.PI * 2)} r={6} fill="#5a6068" stroke={INK} strokeWidth={2} />
			))}
		</g>
		<rect x={-400} y={FLOOR} width={2800} height={400} fill="#3d434b" stroke={INK} strokeWidth={5} />
		{Array.from({length: 40}).map((_, i) => (
			<line key={i} x1={-400 + i * 70} y1={FLOOR} x2={-400 + i * 70 - 60} y2={FLOOR + 180} stroke="#2e333a" strokeWidth={4} />
		))}
		{dim > 0 ? <rect x={-400} y={-300} width={2800} height={1600} fill="#0a0f1e" opacity={dim} /> : null}
	</Svg>
);

/* the moon pool: a hole in the floor with the sea standing in it, and a ladder */
export const MoonPool: React.FC<{gf: number; fish?: number}> = ({gf, fish = 0}) => {
	const [a, b] = POOL;
	const top = FLOOR + 34;
	const pts = Array.from({length: 18}).map((_, i) => {
		const x = a + ((b - a) * i) / 17;
		return `${x},${top + 4 * Math.sin(x / 40 + gf / 8)}`;
	});
	return (
		<g>
			<polygon points={`${a - 30},${FLOOR} ${b + 30},${FLOOR} ${b},${FLOOR + 60} ${a},${FLOOR + 60}`} fill="#141c22" stroke={INK} strokeWidth={5} />
			<polygon points={`${a},${FLOOR + 60} ${pts.join(' ')} ${b},${FLOOR + 60}`} fill="#2d6b80" />
			<polyline points={pts.join(' ')} fill="none" stroke="#9fd0d8" strokeWidth={4} />
			{fish > 0 && fish < 1 ? <Fish x={a + (b - a) * fish} y={top + 16} s={0.5} c="#0f2a36" /> : null}
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

/* the sea in cross-section: surface at y 150, sand at ~900, the habitat on its legs at HAB */
export const HAB: [number, number] = [960, 760];
export const SURF = 150;
export const SeaSection: React.FC<{f: number; boat?: boolean; buoy?: boolean; hose?: boolean; habitat?: boolean; sunK?: number}> = ({f, boat = true, buoy, hose, habitat = true, sunK = 0}) => (
	<Svg>
		<defs>
			<linearGradient id="sea-u" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor="#4f8a9c" />
				<stop offset="1" stopColor="#173a4b" />
			</linearGradient>
		</defs>
		<rect x={-400} y={-300} width={2800} height={SURF + 300} fill="#c9d6d2" />
		{sunK > 0 ? <circle cx={1500} cy={40} r={70} fill="#f6e6a0" opacity={sunK} /> : null}
		<rect x={-400} y={SURF} width={2800} height={1100} fill="url(#sea-u)" />
		<path d={`M-400,${SURF} ${Array.from({length: 36}).map((_, i) => `q40,${i % 2 ? 10 : -10} 80,0`).join(' ')}`} fill="none" stroke={INK} strokeWidth={4} transform={`translate(${-((f * 1.2) % 160)},0)`} />
		{boat ? (
			<g transform={`translate(1240,${SURF - 4 + 3 * Math.sin(f / 10)})`} stroke={INK} strokeWidth={4}>
				<path d="M-90,0 L90,0 L70,26 L-70,26 Z" fill="#b8a27a" />
				<rect x={-30} y={-30} width={50} height={30} fill="#e8e0d0" />
			</g>
		) : null}
		{buoy ? (
			<g transform={`translate(1350,${SURF - 6 + 4 * Math.sin(f / 12)})`} stroke={INK} strokeWidth={4}>
				<ellipse rx={110} ry={26} fill="#e8b830" />
				<rect x={-50} y={-70} width={100} height={52} rx={8} fill="#e8e0d0" />
				<line x1={0} y1={-70} x2={0} y2={-150} strokeWidth={6} />
				<path d="M-18,-150 L18,-150 M-12,-130 L12,-130" />
			</g>
		) : null}
		{hose ? <path d={`M1350,${SURF + 18} C1340,400 1160,520 ${HAB[0] + 200},${HAB[1] - 60}`} stroke={INK} strokeWidth={16} fill="none" /> : null}
		{hose ? <path d={`M1350,${SURF + 18} C1340,400 1160,520 ${HAB[0] + 200},${HAB[1] - 60}`} stroke="#e8b830" strokeWidth={9} fill="none" /> : null}
		{[0, 1, 2, 3].map((i) => (
			<polygon key={i} points={`${400 + i * 300},${SURF} ${470 + i * 300},${SURF} ${600 + i * 300},900 ${480 + i * 300},900`} fill="#e8f4f0" opacity={0.06} />
		))}
		{Array.from({length: 7}).map((_, i) => (
			<Fish key={i} x={200 + ((f * 2 + i * 60) % 700)} y={420 + (i % 3) * 30} s={0.55} c="#173544" />
		))}
		<path d="M-400,900 Q480,870 960,890 T2400,880 L2400,1300 L-400,1300 Z" fill="#9a8a6a" stroke={INK} strokeWidth={5} />
		{/* a little coral */}
		{[300, 380, 1580, 1660, 1730].map((x, i) => (
			<path key={x} d={`M${x},892 q-10,-40 4,-70 M${x},892 q14,-30 26,-44 M${x},892 q-24,-20 -30,-46`} stroke={['#c8705a', '#d89a5a', '#a86a8a'][i % 3]} strokeWidth={9} fill="none" strokeLinecap="round" />
		))}
		{habitat ? (
			<g transform={`translate(${HAB[0]},${HAB[1]})`} stroke={INK} strokeWidth={5}>
				{[-220, -80, 80, 220].map((x) => (
					<line key={x} x1={x} y1={60} x2={x + (x > 0 ? 20 : -20)} y2={135} strokeWidth={10} />
				))}
				<rect x={-300} y={-80} width={600} height={150} rx={75} fill="#c9c3b2" />
				{[-180, -60, 60, 180].map((x) => (
					<circle key={x} cx={x} cy={-6} r={26} fill="#f2d27a" />
				))}
				<rect x={-60} y={68} width={120} height={22} fill="#141c22" />
			</g>
		) : null}
	</Svg>
);

/* shore base: the watch desk with screens, at night */
export const WatchRoom: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<rect x={-400} y={-300} width={2800} height={1300} fill="#3a4250" />
		<rect x={-400} y={560} width={2800} height={340} fill="#4a4038" />
		<rect x={-400} y={552} width={2800} height={12} fill="#2a2420" />
		{/* window: palm trees and the night sea */}
		<g transform="translate(220,150)" stroke={INK} strokeWidth={5}>
			<rect width={420} height={300} fill="#1c2a44" />
			<rect y={210} width={420} height={90} fill="#24405a" />
			<path d="M120,300 q-10,-120 30,-190 M150,110 q-60,-10 -90,30 M150,110 q50,-30 90,10 M150,110 q-10,-50 -60,-60" stroke="#11141e" strokeWidth={10} fill="none" />
			<circle cx={330} cy={70} r={22} fill="#eef1ff" stroke="none" />
			<line x1={210} y1={0} x2={210} y2={300} />
		</g>
		{/* the monitors */}
		{[0, 1, 2].map((i) => (
			<g key={i} transform={`translate(${880 + i * 330},300)`} stroke={INK} strokeWidth={5}>
				<rect x={-140} y={-100} width={280} height={190} rx={10} fill="#2a2f3a" />
				<rect x={-124} y={-86} width={248} height={160} fill={['#1f4b5f', '#18302a', '#1f4b5f'][i]} />
				<rect x={-12} y={90} width={24} height={40} fill="#2a2f3a" />
			</g>
		))}
		{/* screen 1: habitat camera; screen 2: green readouts; screen 3: depth */}
		<g transform="translate(880,300)">
			<rect x={-60} y={-20} width={120} height={50} rx={25} fill="#c9c3b2" />
			{[-30, 0, 30].map((x) => (
				<circle key={x} cx={x} cy={4} r={9} fill="#f2d27a" />
			))}
			<circle cx={100} cy={-70} r={7} fill="#e8343a" opacity={f % 30 < 15 ? 1 : 0.3} />
		</g>
		<g transform="translate(1210,300)">
			{[0, 1, 2, 3].map((i) => (
				<rect key={i} x={-100} y={-66 + i * 34} width={60 + ((i * 47 + Math.floor(f / 10) * 13) % 120)} height={14} fill="#7af0a8" opacity={0.8} />
			))}
		</g>
		<g transform="translate(1540,300)">
			<text y={10} textAnchor="middle" fontSize={44} fontFamily={FONT} fontWeight={900} fill="#9fe0e8">
				60 FT
			</text>
		</g>
		{/* desk */}
		<rect x={600} y={640} width={1400} height={30} fill="#7a5a3a" stroke={INK} strokeWidth={5} />
		<rect x={640} y={670} width={20} height={230} fill="#5a3a22" />
		<rect x={1940} y={670} width={20} height={230} fill="#5a3a22" />
	</Svg>
);

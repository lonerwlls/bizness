import React from 'react';
import {interpolate, random} from 'remotion';
import {Svg} from '../engine/camera';
import {darken, lighten} from '../engine/color';
import {FONT, HAND} from '../kit/ui';
import {Floor, Wall} from './placesH';

/* Part B places: every scene has its own background. */
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/* ---------------- doctor's office: wood, books, diplomas, a skeleton poster ---------------- */
export const Office: React.FC<{f: number; night?: boolean}> = ({f, night}) => (
	<Svg>
		<Wall id={night ? 'of-n' : 'of-d'} top={night ? '#2a2440' : '#e8d6b4'} bot={night ? '#3a3050' : '#d8c09a'} />
		<rect x={-400} y={600} width={2800} height={300} fill={night ? '#3a2a30' : '#a8805a'} />
		<rect x={-400} y={596} width={2800} height={12} fill={night ? '#2a1a20' : '#7a5a3a'} />
		{/* window */}
		<g transform="translate(240,140)">
			<rect x={-14} y={-14} width={328} height={318} fill="#f4ece0" />
			<rect width={300} height={290} fill={night ? '#141a3d' : '#9fd0f0'} />
			{night ? <circle cx={220} cy={70} r={28} fill="#eef1ff" /> : <circle cx={220} cy={70} r={36} fill="#fff4c0" />}
			<path d="M0,230 Q80,190 150,230 T300,220 V290 H0 Z" fill={night ? '#1d2550' : '#7ab07a'} />
			<line x1={150} y1={0} x2={150} y2={290} stroke="#f4ece0" strokeWidth={10} />
		</g>
		{/* bookshelf */}
		<g transform="translate(1420,60)">
			<rect x={0} y={0} width={420} height={560} fill="#6a4a2e" />
			{[0, 1, 2, 3].map((r) => (
				<g key={r}>
					<rect x={10} y={20 + r * 135} width={400} height={115} fill="#4a321e" />
					{Array.from({length: 12}).map((_, i) => {
						const h = 70 + random('bk' + r + i) * 40;
						return <rect key={i} x={18 + i * 32} y={135 + r * 135 - h} width={26} height={h} fill={['#c0503a', '#3d6fd6', '#3aa37a', '#f2b21c', '#7a5cc4', '#e8e0d0'][Math.floor(random('bc' + r + i) * 6)]} />;
					})}
				</g>
			))}
		</g>
		{/* diplomas */}
		{[0, 1].map((i) => (
			<g key={i} transform={`translate(${760 + i * 220},${180 + i * 20}) rotate(${i ? 2 : -2})`}>
				<rect x={-80} y={-60} width={160} height={120} fill="#7a5a3a" />
				<rect x={-68} y={-48} width={136} height={96} fill="#fbf4dc" />
				<circle cx={40} cy={22} r={14} fill="#d23b3b" />
				<line x1={-50} y1={-20} x2={30} y2={-20} stroke="#8a7a5a" strokeWidth={4} />
				<line x1={-50} y1={0} x2={10} y2={0} stroke="#8a7a5a" strokeWidth={4} />
			</g>
		))}
		<Floor y={900} c={night ? '#2a2030' : '#7a5a3a'} />
	</Svg>
);
/* office desk (front piece): seat height SEAT */
export const DeskFront: React.FC<{x: number; night?: boolean; lamp?: number}> = ({x, night, lamp = 1}) => (
	<g transform={`translate(${x},0)`}>
		<rect x={-260} y={700} width={520} height={22} rx={6} fill={night ? '#4a3240' : '#8a5a3a'} />
		<rect x={-240} y={722} width={480} height={180} fill={night ? '#3a2430' : '#6a4228'} />
		<rect x={-220} y={740} width={140} height={60} rx={4} fill={night ? '#2a1a20' : '#5a361e'} />
		<g transform="translate(170,700)">
			<rect x={-30} y={-6} width={60} height={8} fill="#2a2a34" />
			<line x1={0} y1={-6} x2={-20} y2={-90} stroke="#2a2a34" strokeWidth={6} />
			<path d="M-50,-110 L10,-110 L-6,-80 L-40,-80 Z" fill="#2f7a5a" />
			{night ? <polygon points="-40,-80 -6,-80 30,0 -80,0" fill="#ffe9a0" opacity={0.25 * lamp} /> : null}
		</g>
	</g>
);
/* a patient chart on a clipboard: title + diagnosis written in */
export const Chart: React.FC<{x: number; y: number; s?: number; name: string; dx: string; write: number; stamp?: number; stampText?: string}> = ({x, y, s = 1, name, dx, write, stamp = 0, stampText}) => (
	<g transform={`translate(${x},${y}) scale(${s}) rotate(-3)`}>
		<rect x={-200} y={-260} width={400} height={520} rx={14} fill="#8a5a3a" />
		<rect x={-180} y={-230} width={360} height={470} fill="#fbfaf4" />
		<rect x={-60} y={-280} width={120} height={50} rx={10} fill="#9aa0ae" />
		<text x={-160} y={-170} fontSize={28} fontFamily={FONT} fontWeight={900} fill="#2a2f4a">
			PATIENT:
		</text>
		<text x={-30} y={-170} fontSize={34} fontFamily={HAND} fontWeight={700} fill="#1d3a8a">
			{name}
		</text>
		<text x={-160} y={-100} fontSize={28} fontFamily={FONT} fontWeight={900} fill="#2a2f4a">
			DIAGNOSIS:
		</text>
		<clipPath id={'chw' + Math.round(x)}>
			<rect x={-170} y={-80} width={340 * write} height={120} />
		</clipPath>
		<text x={-160} y={-30} fontSize={42} fontFamily={HAND} fontWeight={700} fill="#d23b3b" clipPath={`url(#chw${Math.round(x)})`}>
			{dx}
		</text>
		{[30, 80, 130, 180].map((yy) => (
			<line key={yy} x1={-160} y1={yy} x2={160} y2={yy} stroke="#c8ccd8" strokeWidth={3} />
		))}
		{stamp > 0 && stampText ? (
			<g transform={`translate(0,120) rotate(-14) scale(${1.6 - 0.6 * stamp})`} opacity={stamp}>
				<rect x={-170} y={-50} width={340} height={100} rx={10} fill="none" stroke="#d23b3b" strokeWidth={10} />
				<text y={22} textAnchor="middle" fontSize={56} fontFamily={FONT} fontWeight={900} fill="#d23b3b">
					{stampText}
				</text>
			</g>
		) : null}
	</g>
);
/* wall calendar whose page shows a day number */
export const Calendar: React.FC<{x: number; y: number; day: number; month?: string}> = ({x, y, day, month = 'MARCH'}) => (
	<g transform={`translate(${x},${y})`}>
		<rect x={-80} y={-90} width={160} height={190} rx={8} fill="#fbfaf4" stroke="#2a2f4a" strokeWidth={4} />
		<rect x={-80} y={-90} width={160} height={50} rx={8} fill="#d23b3b" />
		<text y={-56} textAnchor="middle" fontSize={26} fontFamily={FONT} fontWeight={900} fill="#fff">
			{month}
		</text>
		<text y={60} textAnchor="middle" fontSize={90} fontFamily={FONT} fontWeight={900} fill="#2a2f4a">
			{day}
		</text>
	</g>
);

/* ---------------- MRI room: pale blue tiles, the big white ring ---------------- */
export const MRIRoom: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<Wall id="mri-w" top="#cfe6f2" bot="#b8d8e8" />
		{Array.from({length: 24}).map((_, i) => (
			<line key={i} x1={-400 + i * 120} y1={-300} x2={-400 + i * 120} y2={900} stroke="#a8c8d8" strokeWidth={2} />
		))}
		{Array.from({length: 10}).map((_, i) => (
			<line key={'h' + i} x1={-400} y1={i * 100} x2={2400} y2={i * 100} stroke="#a8c8d8" strokeWidth={2} />
		))}
		<g transform="translate(1620,180)">
			<rect x={-110} y={-50} width={220} height={100} rx={10} fill="#f4c040" />
			<text y={14} textAnchor="middle" fontSize={34} fontFamily={FONT} fontWeight={900} fill="#2a2f4a">
				⚠ MAGNET
			</text>
		</g>
		<rect x={140} y={140} width={340} height={200} rx={10} fill="#2a3a4a" />
		<rect x={160} y={160} width={300} height={160} fill="#9fd8ff" opacity={0.5 + 0.1 * Math.sin(f / 9)} />
		<Floor y={900} c="#9ab8c8" tiles />
	</Svg>
);
/* the scanner ring (front): opening centred at (x, 640) */
export const Scanner: React.FC<{x: number; f: number}> = ({x, f}) => (
	<g transform={`translate(${x},0)`}>
		<rect x={-230} y={330} width={460} height={570} rx={60} fill="#f4f6fa" stroke="#c8d0dc" strokeWidth={8} />
		<circle cx={0} cy={630} r={170} fill="#2a3442" />
		<circle cx={0} cy={630} r={150} fill="#3a4658" />
		<circle cx={0} cy={630} r={182} fill="none" stroke="#3d6fd6" strokeWidth={10} opacity={0.5 + 0.4 * Math.sin(f / 5)} />
		<rect x={-150} y={410} width={300} height={30} rx={10} fill="#e6eaf0" />
	</g>
);
export const ScanTable: React.FC<{x: number}> = ({x}) => (
	<g transform={`translate(${x},0)`}>
		<rect x={-300} y={700} width={600} height={40} rx={18} fill="#e8eef4" stroke="#b8c4d0" strokeWidth={4} />
		<rect x={-200} y={740} width={300} height={160} fill="#c8d0dc" />
	</g>
);

/* ---------------- reading room: dark, monitors glowing ---------------- */
export const ReadingRoom: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<Wall id="rr-w" top="#0d1420" bot="#16202e" />
		{[0, 1, 2].map((i) => (
			<g key={i} transform={`translate(${520 + i * 440},300)`}>
				<rect x={-190} y={-140} width={380} height={270} rx={14} fill="#1b2230" />
				<rect x={-176} y={-126} width={352} height={242} rx={6} fill="#0a1018" />
				<ellipse cx={0} cy={-6} rx={90} ry={100} fill="#6a7a90" opacity={0.85} />
				<path d="M-60,-30 q30,-30 60,0 q30,-30 60,0 M-70,20 q40,-20 70,0 q40,-20 70,0" stroke="#4a5668" strokeWidth={6} fill="none" />
				<rect x={-10} y={130} width={20} height={70} fill="#2a3240" />
			</g>
		))}
		<rect x={-400} y={480} width={2800} height={600} fill="#9fd8ff" opacity={0.05 + 0.01 * Math.sin(f / 7)} />
		<rect x={200} y={500} width={1500} height={30} fill="#2a2a34" />
		<Floor y={900} c="#141a24" />
	</Svg>
);

/* ---------------- 1922 doctor's office (sepia) ---------------- */
export const OldOffice: React.FC = () => (
	<Svg>
		<Wall id="oo-w" top="#c8a878" bot="#b08a5a" />
		{Array.from({length: 26}).map((_, i) => (
			<rect key={i} x={-400 + i * 110} y={560} width={100} height={340} fill="#8a6a44" stroke="#6a4a2a" strokeWidth={4} />
		))}
		<g transform="translate(1520,120)">
			<rect x={0} y={0} width={300} height={460} fill="#6a4a2a" />
			{[0, 1, 2].map((r) => (
				<g key={r}>
					<rect x={14} y={20 + r * 145} width={272} height={124} fill="#d8c8a0" opacity={0.6} />
					{Array.from({length: 6}).map((_, i) => (
						<rect key={i} x={30 + i * 42} y={60 + r * 145 + (i % 2) * 10} width={26} height={70 - (i % 2) * 10} rx={6} fill={['#7a5a3a', '#4a6a5a', '#8a3a2a'][i % 3]} opacity={0.85} />
					))}
				</g>
			))}
		</g>
		<g transform="translate(400,260)">
			<rect x={-90} y={-110} width={180} height={220} fill="#5a3a1a" />
			<rect x={-76} y={-96} width={152} height={192} fill="#e8d8b0" />
			<text y={10} textAnchor="middle" fontSize={30} fontFamily={HAND} fontWeight={700} fill="#4a3a2a">
				M.D. 1904
			</text>
		</g>
		<Floor y={900} c="#7a5a3a" />
	</Svg>
);

/* ---------------- hospital rooftop with a helipad; the sky turns day ↔ night (k 0..1..2) ---------------- */
export const Rooftop: React.FC<{f: number; k: number}> = ({f, k}) => {
	const night = Math.sin((k * Math.PI) / 1) ** 2; // 0 day, 1 night (k = 0.5)
	const top = night > 0.5 ? '#141a44' : '#5a9ad8';
	const sunA = k * Math.PI * 2;
	return (
		<Svg>
			<rect x={-400} y={-300} width={2800} height={1300} fill="#5a9ad8" />
			<rect x={-400} y={-300} width={2800} height={1300} fill="#141a44" opacity={night} />
			<rect x={-400} y={300} width={2800} height={500} fill="#ffb27a" opacity={0.35 * Math.sin(k * Math.PI * 2) ** 2} />
			{Array.from({length: 40}).map((_, i) => (
				<circle key={i} cx={random('rsx' + i) * 1920} cy={random('rsy' + i) * 450} r={2 + random('rsr' + i) * 2} fill="#fff" opacity={night * 0.8} />
			))}
			<circle cx={960 + Math.cos(sunA - Math.PI / 2) * 760} cy={560 + Math.sin(sunA - Math.PI / 2) * 420} r={60} fill="#fff4c0" />
			<circle cx={960 + Math.cos(sunA + Math.PI / 2) * 760} cy={560 + Math.sin(sunA + Math.PI / 2) * 420} r={46} fill="#eef1ff" />
			{/* far rooftops (low, not a skyline) */}
			<path d="M-400,700 H200 V650 H420 V690 H700 V640 H900 V700 H1300 V660 H1600 V700 H2400 V800 H-400 Z" fill={night > 0.5 ? '#2a2f5a' : '#8aa8c8'} />
			{/* roof */}
			<rect x={-400} y={760} width={2800} height={400} fill="#6a6a78" />
			<rect x={-400} y={760} width={2800} height={14} fill="#4a4a58" />
			<ellipse cx={960} cy={860} rx={420} ry={70} fill="none" stroke="#f4c040" strokeWidth={12} />
			<text x={960} y={884} textAnchor="middle" fontSize={80} fontFamily={FONT} fontWeight={900} fill="#f4f4f4" opacity={0.8}>
				H
			</text>
			{/* water tank + vents */}
			<g transform="translate(1600,560)">
				<rect x={-80} y={0} width={160} height={160} rx={20} fill="#9a8a7a" />
				<path d="M-90,0 L0,-50 L90,0 Z" fill="#7a6a5a" />
				<rect x={-70} y={160} width={12} height={50} fill="#4a4a58" />
				<rect x={58} y={160} width={12} height={50} fill="#4a4a58" />
			</g>
			<rect x={240} y={690} width={80} height={80} fill="#8a8a98" />
			<rect x={230} y={680} width={100} height={16} fill="#5a5a68" />
		</Svg>
	);
};

/* ---------------- exam room: pale green, eye chart, height ruler ---------------- */
export const ExamRoom: React.FC = () => (
	<Svg>
		<Wall id="ex-w" top="#cfe8d8" bot="#b8dcc8" />
		<rect x={-400} y={560} width={2800} height={340} fill="#a8d0b8" />
		<g transform="translate(1600,300)">
			<rect x={-90} y={-160} width={180} height={320} fill="#fbfaf4" stroke="#8a90a0" strokeWidth={4} />
			{['E', 'F P', 'T O Z', 'L P E D', 'P E C F D'].map((t, i) => (
				<text key={i} y={-110 + i * 55} textAnchor="middle" fontSize={56 - i * 9} fontFamily={FONT} fontWeight={900} fill="#11142c">
					{t}
				</text>
			))}
		</g>
		<g transform="translate(300,0)">
			<rect x={0} y={200} width={40} height={700} fill="#fbfaf4" />
			{Array.from({length: 14}).map((_, i) => (
				<line key={i} x1={0} y1={220 + i * 48} x2={i % 2 ? 16 : 28} y2={220 + i * 48} stroke="#3a3a44" strokeWidth={3} />
			))}
		</g>
		<g transform="translate(560,380)">
			<rect x={-90} y={-60} width={180} height={120} rx={10} fill="#f4f6fa" stroke="#c8ccd8" strokeWidth={4} />
			<rect x={-30} y={60} width={60} height={30} fill="#c8ccd8" />
		</g>
		<Floor y={900} c="#7ab09a" tiles />
	</Svg>
);
/* exam table with a paper roll: top at y = 740 */
export const ExamTable: React.FC<{x: number}> = ({x}) => (
	<g transform={`translate(${x},0)`}>
		<rect x={-220} y={740} width={440} height={36} rx={12} fill="#3a6a9a" />
		<rect x={-200} y={734} width={400} height={10} fill="#fbfaf4" />
		<rect x={-200} y={776} width={400} height={124} fill="#e8ecf2" />
		<rect x={-180} y={796} width={160} height={80} rx={6} fill="#d8dce6" />
		<rect x={20} y={796} width={160} height={80} rx={6} fill="#d8dce6" />
	</g>
);

/* ---------------- operating room: green tiles, the big round lamp ---------------- */
export const OR: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<Wall id="or-w" top="#2f5a54" bot="#3a6a62" />
		{Array.from({length: 30}).map((_, i) => (
			<line key={i} x1={-400 + i * 100} y1={-300} x2={-400 + i * 100} y2={900} stroke="#2a4a46" strokeWidth={3} />
		))}
		{Array.from({length: 12}).map((_, i) => (
			<line key={'h' + i} x1={-400} y1={i * 100} x2={2400} y2={i * 100} stroke="#2a4a46" strokeWidth={3} />
		))}
		<g transform="translate(1560,380)">
			<rect x={-100} y={-80} width={200} height={150} rx={12} fill="#1b2230" />
			<rect x={-86} y={-66} width={172} height={110} fill="#071a14" />
			<path d={Array.from({length: 40}).map((_, i) => `${i ? 'L' : 'M'}${-80 + i * 4.1},${-10 + ((i + Math.floor(f / 2)) % 13 === 0 ? -34 : 0)}`).join(' ')} stroke="#4cff9a" strokeWidth={3} fill="none" />
		</g>
		<Floor y={900} c="#2a4a46" tiles />
	</Svg>
);
export const SurgLamp: React.FC<{x: number; on?: number}> = ({x, on = 1}) => (
	<g transform={`translate(${x},0)`}>
		<rect x={-8} y={-300} width={16} height={420} fill="#8a9aa8" />
		<ellipse cx={0} cy={140} rx={170} ry={50} fill="#c8d0dc" />
		<ellipse cx={0} cy={150} rx={140} ry={36} fill="#fffbe8" />
		{[-80, 0, 80].map((d) => (
			<circle key={d} cx={d} cy={150} r={20} fill="#fff" />
		))}
		<polygon points="-140,150 140,150 300,760 -300,760" fill="#fffbe0" opacity={0.12 * on} />
	</g>
);
export const ORTable: React.FC<{x: number}> = ({x}) => (
	<g transform={`translate(${x},0)`}>
		<rect x={-300} y={720} width={600} height={34} rx={10} fill="#5a8ab0" />
		<path d="M-280,690 Q-200,640 -60,660 Q100,620 260,690 L280,722 L-290,722 Z" fill="#7ab0d8" />
		<circle cx={240} cy={672} r={34} fill="#f2d0b5" />
		<rect x={-20} y={754} width={40} height={146} fill="#8a9aa8" />
		<rect x={-160} y={880} width={320} height={20} fill="#6a7a88" />
	</g>
);
export const Scalpel: React.FC = () => (
	<g transform="rotate(-30)">
		<rect x={-4} y={-50} width={8} height={46} rx={3} fill="#9aa0ae" />
		<path d="M-4,-50 L4,-50 L2,-74 Q-6,-66 -4,-50 Z" fill="#e8ecf2" />
	</g>
);

/* ---------------- the hero's kitchen ---------------- */
export const Kitchen2: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<Wall id="kt-w" top="#f2e2b8" bot="#e8d0a0" />
		{/* tiled backsplash */}
		{Array.from({length: 20}).map((_, i) =>
			Array.from({length: 4}).map((_, j) => <rect key={i + '-' + j} x={-200 + i * 120 + (j % 2) * 60} y={440 + j * 60} width={116} height={56} fill={(i + j) % 3 ? '#f4f6fa' : '#cfe6f2'} />),
		)}
		<g transform="translate(400,120)">
			<rect x={-14} y={-14} width={328} height={258} fill="#fbfaf4" />
			<rect width={300} height={230} fill="#ffe0a8" />
			<circle cx={210} cy={80} r={40} fill="#fff4c8" />
			<line x1={150} y1={0} x2={150} y2={230} stroke="#fbfaf4" strokeWidth={10} />
			{[40, 110, 220].map((x, i) => (
				<g key={i} transform={`translate(${x},228)`}>
					<rect x={-22} y={-30} width={44} height={34} rx={6} fill="#c0603a" />
					<circle cy={-50} r={26 + Math.sin(f / 30 + i) * 2} fill="#3a8a4a" />
				</g>
			))}
		</g>
		{/* fridge */}
		<g transform="translate(1600,180)">
			<rect x={-130} y={0} width={260} height={720} rx={24} fill="#e8ecf2" stroke="#b8c0cc" strokeWidth={6} />
			<line x1={-130} y1={250} x2={130} y2={250} stroke="#b8c0cc" strokeWidth={6} />
			<rect x={90} y={80} width={14} height={120} rx={6} fill="#9aa0ae" />
			<rect x={90} y={300} width={14} height={160} rx={6} fill="#9aa0ae" />
			<rect x={-80} y={290} width={70} height={50} fill="#ffd34a" transform="rotate(-6)" />
		</g>
		{/* counter */}
		<rect x={-400} y={680} width={1850} height={30} fill="#7a5a3a" />
		<rect x={-400} y={710} width={1850} height={190} fill="#a8805a" />
		{Array.from({length: 8}).map((_, i) => (
			<rect key={i} x={-380 + i * 230} y={730} width={210} height={150} rx={8} fill="#b8906a" stroke="#8a6a44" strokeWidth={3} />
		))}
		<Floor y={900} c="#c8a878" />
	</Svg>
);
/* blender on the counter; spin 0..1, contents colour */
export const Blender: React.FC<{x: number; y: number; spin: number; f: number; c?: string; broken?: boolean; s?: number}> = ({x, y, spin, f, c = '#c06a5a', broken, s = 1}) => (
	<g transform={`translate(${x + (spin > 0 ? Math.sin(f * 3) * 3 * spin : 0)},${y}) scale(${s})`}>
		<rect x={-60} y={-60} width={120} height={60} rx={10} fill={broken ? '#5a5a68' : '#d23b3b'} />
		<path d="M-50,-60 L-40,-230 L40,-230 L50,-60 Z" fill="#dff2fa" opacity={0.7} stroke="#9ab8c8" strokeWidth={4} />
		<path d={`M-48,-70 L-44,-150 Q0,${-150 - 20 * spin * Math.sin(f)} 44,-150 L48,-70 Z`} fill={c} opacity={0.9} />
		<rect x={-46} y={-246} width={92} height={18} rx={6} fill="#2a2a34" />
		{broken ? (
			<g opacity={0.8}>
				<path d="M-30,-200 L-10,-170 L-26,-140" stroke="#2a2a34" strokeWidth={4} fill="none" />
				{[0, 1, 2].map((i) => (
					<circle key={i} cx={-10 + i * 16} cy={-260 - ((f * 2 + i * 20) % 60)} r={14 + i * 4} fill="#8a8a98" opacity={0.6 - ((f * 2 + i * 20) % 60) / 100} />
				))}
			</g>
		) : null}
	</g>
);
export const Sandwich: React.FC = () => (
	<g>
		<path d="M-40,-10 Q0,-34 40,-10 L40,0 L-40,0 Z" fill="#e8b46a" />
		<rect x={-42} y={0} width={84} height={8} fill="#5ab04a" />
		<rect x={-40} y={8} width={80} height={10} fill="#d24a3a" />
		<rect x={-40} y={18} width={80} height={12} rx={4} fill="#e8b46a" />
	</g>
);

/* ---------------- candle-lit bistro ---------------- */
export const Bistro: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<Wall id="bs-w" top="#3a1a1a" bot="#5a2a22" />
		{Array.from({length: 14}).map((_, r) =>
			Array.from({length: 22}).map((_, i) => <rect key={r + '-' + i} x={-300 + i * 120 + (r % 2) * 60} y={-40 + r * 50} width={114} height={44} fill={random('br' + r + i) > 0.5 ? '#6a2e24' : '#5a2620'} />),
		)}
		{/* string lights */}
		<path d="M-300,120 Q300,240 960,150 T2300,130" stroke="#1a0a0a" strokeWidth={3} fill="none" />
		{Array.from({length: 24}).map((_, i) => {
			const t = i / 23;
			const x = -300 + t * 2600;
			const y = 120 + Math.sin(t * Math.PI * 2) * 50 + 40;
			return <circle key={i} cx={x} cy={y} r={10} fill="#ffe08a" opacity={0.75 + 0.25 * Math.sin(f / 6 + i)} />;
		})}
		<g transform="translate(1560,360)">
			<rect x={-100} y={-120} width={200} height={240} fill="#2a1410" stroke="#8a6a3a" strokeWidth={8} />
			<text y={-60} textAnchor="middle" fontSize={30} fontFamily={HAND} fontWeight={700} fill="#f4e6c0">
				Menu
			</text>
			<line x1={-60} y1={-20} x2={60} y2={-20} stroke="#f4e6c0" strokeWidth={3} />
			<line x1={-60} y1={20} x2={40} y2={20} stroke="#f4e6c0" strokeWidth={3} />
			<line x1={-60} y1={60} x2={50} y2={60} stroke="#f4e6c0" strokeWidth={3} />
		</g>
		<Floor y={900} c="#3a2018" />
	</Svg>
);
/* small round table with a candle (front piece) */
export const CandleTable: React.FC<{x: number}> = ({x}) => (
	<g transform={`translate(${x},0)`}>
		<ellipse cx={0} cy={770} rx={150} ry={20} fill="#fbf4e0" />
		<rect x={-150} y={770} width={300} height={34} fill="#f4ead0" />
		<rect x={-12} y={804} width={24} height={96} fill="#2a1a12" />
		<rect x={-60} y={892} width={120} height={10} rx={4} fill="#2a1a12" />
	</g>
);
export const BistroChair: React.FC<{x: number; facing: 1 | -1}> = ({x, facing}) => (
	<g transform={`translate(${x},0) scale(${facing},1)`}>
		<rect x={-50} y={826} width={100} height={14} rx={5} fill="#2a1a12" />
		<rect x={-50} y={700} width={12} height={140} rx={5} fill="#2a1a12" />
		<rect x={-44} y={840} width={8} height={60} fill="#2a1a12" />
		<rect x={36} y={840} width={8} height={60} fill="#2a1a12" />
	</g>
);

/* ---------------- autumn park ---------------- */
export const AutumnPark: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<Wall id="ap-w" top="#f2c88a" bot="#f8e0b0" />
		<path d="M-400,640 Q300,560 960,620 T2400,600 V900 H-400 Z" fill="#c8a85a" />
		{Array.from({length: 9}).map((_, i) => {
			const x = -200 + i * 280 + random('tx' + i) * 60;
			return (
				<g key={i} transform={`translate(${x},${560 + random('ty' + i) * 60})`}>
					<rect x={-14} y={-40} width={28} height={140} fill="#6a4a2e" />
					<circle cx={0} cy={-120} r={110} fill={['#e0702a', '#d24a2a', '#f2a03a'][i % 3]} />
					<circle cx={-60} cy={-80} r={70} fill={['#f2a03a', '#e0702a', '#d24a2a'][i % 3]} />
					<circle cx={60} cy={-90} r={80} fill={['#d24a2a', '#f2a03a', '#e0702a'][i % 3]} />
				</g>
			);
		})}
		{Array.from({length: 26}).map((_, i) => {
			const y = ((random('ly' + i) * 1000 + f * (1 + random('lv' + i))) % 1000) - 50;
			const x = random('lx' + i) * 1920 + Math.sin(f / 20 + i) * 40;
			return <ellipse key={i} cx={x} cy={y} rx={10} ry={5} fill={['#e0702a', '#d24a2a', '#f2c03a'][i % 3]} transform={`rotate(${f * 3 + i * 40} ${x} ${y})`} />;
		})}
		<Floor y={900} c="#a8884a" />
	</Svg>
);
export const ParkBench: React.FC<{x: number}> = ({x}) => (
	<g transform={`translate(${x},0)`}>
		<rect x={-260} y={826} width={520} height={18} rx={6} fill="#7a4e2a" />
		<rect x={-260} y={720} width={520} height={18} rx={6} fill="#7a4e2a" />
		<rect x={-260} y={760} width={520} height={18} rx={6} fill="#7a4e2a" />
		<rect x={-240} y={844} width={14} height={56} fill="#2a2a34" />
		<rect x={226} y={844} width={14} height={56} fill="#2a2a34" />
	</g>
);
export const Metronome: React.FC<{x: number; y: number; f: number; s?: number}> = ({x, y, f, s = 1}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<path d="M-60,80 L-30,-90 L30,-90 L60,80 Z" fill="#8a5a3a" stroke="#5a3a1e" strokeWidth={5} />
		<line x1={0} y1={60} x2={0} y2={-110} stroke="#f4e6c0" strokeWidth={6} transform={`rotate(${Math.sin(f / 7) * 30} 0 60)`} />
		<rect x={-12} y={-60} width={24} height={20} fill="#ffd34a" transform={`rotate(${Math.sin(f / 7) * 30} 0 60)`} />
	</g>
);

/* ---------------- outdoor wedding: flower arch, rows of guests ---------------- */
export const Wedding: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<Wall id="wd-sky" top="#9fd0f0" bot="#e8f4fa" />
		<path d="M-400,640 Q400,580 960,630 T2400,610 V900 H-400 Z" fill="#8ac06a" />
		{Array.from({length: 6}).map((_, i) => (
			<ellipse key={i} cx={-200 + i * 420} cy={150 + (i % 2) * 40} rx={120} ry={40} fill="#fff" opacity={0.85} />
		))}
		{/* flower arch */}
		<path d="M760,900 V420 A200,200 0 0 1 1160,420 V900" fill="none" stroke="#f4f1e6" strokeWidth={30} />
		{Array.from({length: 26}).map((_, i) => {
			const t = i / 25;
			const L = 480 + 628 + 480;
			const d = t * L;
			let x, y;
			if (d < 480) [x, y] = [760, 900 - d];
			else if (d < 480 + 628) {
				const a = Math.PI - ((d - 480) / 628) * Math.PI;
				[x, y] = [960 + Math.cos(a) * 200, 420 - Math.sin(a) * 200];
			} else [x, y] = [1160, 420 + (d - 480 - 628)];
			return <circle key={i} cx={x + Math.sin(i) * 8} cy={y} r={20} fill={['#ff8ab0', '#fff4c8', '#ffb0c8', '#e8f8e0'][i % 4]} />;
		})}
		{/* chairs with ribbons */}
		{Array.from({length: 10}).map((_, i) => (
			<g key={i} transform={`translate(${i < 5 ? 120 + i * 110 : 1360 + (i - 5) * 110},820)`}>
				<rect x={-30} y={0} width={60} height={10} fill="#f4f1e6" />
				<rect x={-30} y={-70} width={8} height={80} fill="#f4f1e6" />
				<circle cx={-26} cy={-70} r={10} fill="#ff8ab0" />
			</g>
		))}
		<Floor y={900} c="#7ab05a" />
	</Svg>
);
export const fadeK = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);
export const lightenC = lighten;
export const darkenC = darken;

import React from 'react';
import {Svg} from '../engine/camera';
import {FONT} from '../kit/ui';
import {Floor, Wall} from './placesH';

/* Places of the St. Martin / Beaumont short (Mackinac Island, 1822–1880):
   the fur-company store, the surgeon's room (night / morning), Beaumont's study,
   the lake shore toward Canada, the village graveyard at dusk. Each one has its own look. */

const Logs: React.FC<{c1: string; c2: string; top?: number; bot?: number}> = ({c1, c2, top = -300, bot = 900}) => (
	<g>
		{Array.from({length: Math.ceil((bot - top) / 62)}).map((_, i) => (
			<g key={i}>
				<rect x={-400} y={top + i * 62} width={2800} height={62} rx={28} fill={i % 2 ? c1 : c2} />
				<rect x={-400} y={top + i * 62 + 50} width={2800} height={8} fill="#000" opacity={0.12} />
			</g>
		))}
	</g>
);
const Pelt: React.FC<{x: number; y: number; c: string; s?: number}> = ({x, y, c, s = 1}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<path d="M0,-70 C30,-70 40,-50 46,-30 C70,-30 70,10 50,16 C54,50 40,80 0,86 C-40,80 -54,50 -50,16 C-70,10 -70,-30 -46,-30 C-40,-50 -30,-70 0,-70 Z" fill={c} />
		<path d="M0,-50 L0,70" stroke="#000" strokeWidth={3} opacity={0.15} />
		<circle cx={0} cy={-78} r={6} fill="#3a2a1a" />
	</g>
);
const Barrel: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<path d="M-60,-150 Q-74,-75 -60,0 L60,0 Q74,-75 60,-150 Z" fill="#9a6232" />
		{[-130, -24].map((yy) => (
			<rect key={yy} x={-70} y={yy} width={140} height={14} fill="#4a4c58" />
		))}
		{[-30, 0, 30].map((xx) => (
			<line key={xx} x1={xx} y1={-148} x2={xx} y2={-2} stroke="#000" strokeWidth={3} opacity={0.15} />
		))}
	</g>
);

/* American Fur Company store, 1822: log walls, pelts, barrels, a window on the lake */
export const STORE_TOP = 760;
export const FurStore: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<Logs c1="#8a5a32" c2="#7a4e2a" />
		{/* window on the lake */}
		<g transform="translate(1290,170)">
			<rect x={-14} y={-14} width={318} height={258} fill="#5a3a20" />
			<rect width={290} height={230} fill="#8fd0f0" />
			<rect y={140} width={290} height={90} fill="#3a86b8" />
			{[0, 1, 2].map((i) => (
				<path key={i} d={`M${20 + i * 90 + ((f / 3) % 40)},${170 + i * 14} q15,-8 30,0`} stroke="#bfe6ff" strokeWidth={4} fill="none" />
			))}
			<path d="M0,140 L60,110 L120,132 L200,100 L290,128 L290,140 Z" fill="#2a5a3a" />
			<line x1={145} y1={0} x2={145} y2={230} stroke="#5a3a20" strokeWidth={10} />
			<line x1={0} y1={115} x2={290} y2={115} stroke="#5a3a20" strokeWidth={10} />
		</g>
		{/* company sign */}
		<g transform="translate(860,110) rotate(-1.5)">
			<rect x={-270} y={-48} width={540} height={96} rx={8} fill="#2a1a0e" />
			<rect x={-258} y={-36} width={516} height={72} rx={6} fill="none" stroke="#c9a04a" strokeWidth={4} />
			<text y={16} textAnchor="middle" fontSize={44} fontFamily={FONT} fontWeight={900} fill="#f2d9a0">
				AMERICAN FUR CO.
			</text>
		</g>
		{/* shelf with pelts and blankets */}
		<rect x={340} y={330} width={620} height={16} fill="#5a3a20" />
		{[
			[420, '#8a5a32'],
			[540, '#c98a4a'],
			[660, '#6a4a2a'],
			[780, '#b07a42'],
			[890, '#7a5232'],
		].map(([x, c], i) => (
			<Pelt key={i} x={x as number} y={250} c={c as string} s={0.8} />
		))}
		{[0, 1, 2].map((i) => (
			<rect key={i} x={380 + i * 160} y={480 - i * 0} width={140} height={44} rx={6} fill={['#c83a3a', '#e8d8a8', '#3a6ab0'][i]} />
		))}
		<rect x={340} y={524} width={620} height={16} fill="#5a3a20" />
		<Barrel x={1500} y={900} />
		<Barrel x={1640} y={900} s={0.85} />
		<Barrel x={240} y={900} s={0.9} />
		<Floor y={900} c="#6a4a2a" />
		{Array.from({length: 12}).map((_, i) => (
			<line key={i} x1={-400 + i * 260} y1={900} x2={-400 + i * 260 - 120} y2={1500} stroke="#4a3018" strokeWidth={4} />
		))}
	</Svg>
);

/* the surgeon's room at the fort: whitewashed planks, a small window (night = stars,
   day = sun), a shelf of bottles. The cot is a front piece. */
export const COT_TOP = 790;
export const Surgery: React.FC<{f: number; night?: boolean}> = ({f, night}) => (
	<Svg>
		<Wall id={night ? 'sg-wn' : 'sg-wd'} top={night ? '#3a3a52' : '#eae2cc'} bot={night ? '#2a2a40' : '#ddd2b6'} />
		{Array.from({length: 22}).map((_, i) => (
			<line key={i} x1={-400 + i * 130} y1={-300} x2={-400 + i * 130} y2={900} stroke="#000" strokeWidth={3} opacity={night ? 0.25 : 0.08} />
		))}
		<g transform="translate(1260,170)">
			<rect x={-12} y={-12} width={244} height={224} fill={night ? '#4a3a2a' : '#8a6a42'} />
			<rect width={220} height={200} fill={night ? '#0e1430' : '#9fd8ff'} />
			{night ? (
				<>
					<circle cx={160} cy={60} r={26} fill="#eef1ff" />
					{[[30, 40], [70, 120], [120, 30], [190, 150], [40, 170]].map(([x, y], i) => (
						<circle key={i} cx={x} cy={y} r={3 + (i % 2)} fill="#fff" opacity={0.5 + 0.4 * Math.sin(f / 9 + i)} />
					))}
				</>
			) : (
				<>
					<circle cx={60} cy={60} r={30} fill="#fff4b0" />
					<rect y={150} width={220} height={50} fill="#3a86b8" />
				</>
			)}
			<line x1={110} y1={0} x2={110} y2={200} stroke={night ? '#4a3a2a' : '#8a6a42'} strokeWidth={8} />
		</g>
		{/* shelf of medicine bottles */}
		<rect x={420} y={300} width={460} height={14} fill={night ? '#3a2a1a' : '#7a5232'} />
		{['#5a8a5a', '#8a4a2a', '#3a6ab0', '#c9a04a', '#7a3a6a', '#5a8a5a'].map((c, i) => (
			<g key={i} transform={`translate(${450 + i * 75},300)`}>
				<rect x={-16} y={-70} width={32} height={70} rx={6} fill={c} opacity={night ? 0.6 : 1} />
				<rect x={-7} y={-86} width={14} height={18} fill="#c9b090" opacity={night ? 0.6 : 1} />
				<rect x={-12} y={-50} width={24} height={20} fill="#f4efe2" opacity={night ? 0.4 : 0.9} />
			</g>
		))}
		{/* a framed army commission */}
		<g transform="translate(980,240)">
			<rect x={-70} y={-90} width={140} height={180} fill={night ? '#4a3a2a' : '#7a5232'} />
			<rect x={-58} y={-78} width={116} height={156} fill={night ? '#8a8478' : '#f4efe2'} />
			{[0, 1, 2, 3, 4].map((i) => (
				<rect key={i} x={-44} y={-56 + i * 24} width={88 - (i % 2) * 20} height={6} fill="#5a5048" opacity={0.6} />
			))}
			<circle cx={30} cy={56} r={12} fill="#c83a3a" />
		</g>
		<Floor y={900} c={night ? '#3a2e24' : '#9a7a52'} />
		{night ? <rect x={-400} y={-300} width={2800} height={1300} fill="#0a0a20" opacity={0.25} /> : null}
	</Svg>
);
/* army cot (front piece), mattress top at COT_TOP */
export const Cot: React.FC<{x: number; w?: number; night?: boolean}> = ({x, w = 440, night}) => (
	<g transform={`translate(${x},0)`} opacity={1}>
		<rect x={-w / 2} y={COT_TOP} width={w} height={30} rx={12} fill={night ? '#8a8270' : '#e8e0c8'} />
		<rect x={-w / 2} y={COT_TOP + 20} width={w} height={14} fill={night ? '#4a3a2a' : '#7a5232'} />
		{[-w / 2 + 14, w / 2 - 26].map((xx) => (
			<rect key={xx} x={xx} y={COT_TOP + 30} width={12} height={900 - COT_TOP - 30} fill={night ? '#3a2a1a' : '#5a3a20'} />
		))}
		<rect x={-w / 2 + 40} y={COT_TOP + 4} width={w - 120} height={26} rx={10} fill={night ? '#3a4a6a' : '#5a7ab0'} />
	</g>
);

/* Beaumont's study: green wall, bookshelf, a wall clock (hours run), a fireplace. */
export const STUDY_TOP = 760;
export const Study: React.FC<{f: number; h: number}> = ({f, h}) => {
	const ha = (h / 12) * 360;
	const ma = (h % 1) * 360;
	return (
		<Svg>
			<Wall id="st-w" top="#3a5a4a" bot="#2e4a3c" />
			<rect x={-400} y={560} width={2800} height={340} fill="#5a3a22" />
			<rect x={-400} y={552} width={2800} height={14} fill="#7a5232" />
			{/* bookshelf */}
			<g transform="translate(300,140)">
				<rect width={360} height={420} fill="#4a2e18" />
				{[0, 1, 2].map((r) => (
					<g key={r}>
						<rect x={10} y={20 + r * 134} width={340} height={110} fill="#2a1a0e" />
						{Array.from({length: 10}).map((_, i) => (
							<rect key={i} x={18 + i * 33} y={20 + r * 134 + 14 + ((i * 7 + r * 3) % 4) * 6} width={26} height={96 - ((i * 7 + r * 3) % 4) * 6} fill={['#8a2a2a', '#2a4a8a', '#c9a04a', '#3a6a3a', '#6a3a6a'][(i + r) % 5]} />
						))}
					</g>
				))}
			</g>
			{/* wall clock with running hands */}
			<g transform="translate(1000,230)">
				<circle r={92} fill="#7a5232" />
				<circle r={78} fill="#f6efd8" />
				{Array.from({length: 12}).map((_, i) => (
					<line key={i} x1={0} y1={-70} x2={0} y2={-58} stroke="#3a2a1a" strokeWidth={5} transform={`rotate(${i * 30})`} />
				))}
				<line x1={0} y1={0} x2={0} y2={-40} stroke="#2a1a0e" strokeWidth={9} strokeLinecap="round" transform={`rotate(${ha})`} />
				<line x1={0} y1={0} x2={0} y2={-62} stroke="#2a1a0e" strokeWidth={5} strokeLinecap="round" transform={`rotate(${ma})`} />
				<circle r={8} fill="#c83a3a" />
			</g>
			{/* fireplace */}
			<g transform="translate(1520,900)">
				<rect x={-200} y={-380} width={400} height={380} fill="#8a4a3a" />
				{Array.from({length: 8}).map((_, i) => (
					<line key={i} x1={-200} y1={-40 - i * 45} x2={200} y2={-40 - i * 45} stroke="#6a3428" strokeWidth={4} />
				))}
				<rect x={-230} y={-400} width={460} height={30} fill="#5a3a22" />
				<path d="M-120,0 L-120,-200 Q0,-280 120,-200 L120,0 Z" fill="#1a0e08" />
				{[0, 1, 2].map((i) => (
					<path key={i} d={`M${-50 + i * 50},0 q${-20 + 10 * Math.sin(f / 4 + i)},-60 0,${-90 - 20 * Math.sin(f / 3 + i)} q20,50 0,90 Z`} fill={i === 1 ? '#ffd34a' : '#ff8a3a'} opacity={0.9} />
				))}
			</g>
			<Floor y={900} c="#5a3a22" />
		</Svg>
	);
};
/* work table (front piece), top at STUDY_TOP */
export const Desk: React.FC<{x: number; w?: number}> = ({x, w = 420}) => (
	<g transform={`translate(${x},0)`}>
		<rect x={-w / 2} y={STUDY_TOP} width={w} height={20} rx={4} fill="#8a5a32" />
		<rect x={-w / 2 + 16} y={STUDY_TOP + 20} width={16} height={900 - STUDY_TOP - 20} fill="#6a4226" />
		<rect x={w / 2 - 32} y={STUDY_TOP + 20} width={16} height={900 - STUDY_TOP - 20} fill="#6a4226" />
	</g>
);

/* lake shore: open water to the right toward Canada, pines, a signpost */
export const WATER_Y = 760;
export const LakeShore: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<defs>
			<linearGradient id="lk-sky" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor="#6ab4e8" />
				<stop offset="1" stopColor="#cfeaf8" />
			</linearGradient>
		</defs>
		<rect x={-400} y={-300} width={2800} height={1300} fill="url(#lk-sky)" />
		{[[300, 160], [1200, 110], [1700, 190]].map(([x, y], i) => (
			<g key={i} transform={`translate(${x + ((f * 0.3) % 200)},${y})`} fill="#fff" opacity={0.9}>
				<ellipse rx={90} ry={28} />
				<ellipse cx={-50} cy={8} rx={60} ry={22} />
				<ellipse cx={50} cy={6} rx={70} ry={24} />
			</g>
		))}
		{/* far shore of Canada */}
		<path d="M800,600 L1000,570 L1200,590 L1500,560 L2400,580 L2400,640 L800,640 Z" fill="#4a7a6a" />
		{Array.from({length: 18}).map((_, i) => (
			<polygon key={i} points={`${860 + i * 90},${600 - (i % 3) * 8} ${880 + i * 90},${540 - (i % 3) * 8} ${900 + i * 90},${600 - (i % 3) * 8}`} fill="#3a6a5a" />
		))}
		<rect x={-400} y={620} width={2800} height={400} fill="#3a86b8" />
		{Array.from({length: 14}).map((_, i) => (
			<path key={i} d={`M${-300 + i * 200 + ((f * 1.2) % 200)},${680 + (i % 4) * 40} q25,-12 50,0`} stroke="#bfe6ff" strokeWidth={5} fill="none" />
		))}
		{/* near shore with pines on the left */}
		<path d="M-400,700 L300,720 Q420,760 460,1000 L-400,1000 Z" fill="#c8a870" />
		{[-200, -60, 80, 200].map((x, i) => (
			<g key={i} transform={`translate(${x},${700 + i * 4})`}>
				<rect x={-10} y={-60} width={20} height={60} fill="#5a3a22" />
				{[0, 1, 2].map((k) => (
					<polygon key={k} points={`-${80 - k * 18},${-50 - k * 70} 0,${-170 - k * 70} ${80 - k * 18},${-50 - k * 70}`} fill={k % 2 ? '#2a5a3a' : '#3a6a4a'} />
				))}
			</g>
		))}
		{/* signpost */}
		<g transform="translate(380,730)">
			<rect x={-8} y={-200} width={16} height={200} fill="#6a4226" />
			<g transform="translate(0,-170) rotate(-4)">
				<path d="M-20,-34 L170,-34 L206,0 L170,34 L-20,34 Z" fill="#c98a4a" stroke="#5a3a20" strokeWidth={5} />
				<text x={86} y={14} textAnchor="middle" fontSize={40} fontFamily={FONT} fontWeight={900} fill="#2a1a0e">
					CANADA
				</text>
			</g>
		</g>
	</Svg>
);

/* village graveyard at dusk: a picket fence, a bare tree, the open deep grave is a front piece */
export const GRAVE_Y = 800;
export const Graveyard: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<defs>
			<linearGradient id="gv-sky" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor="#3a2a5a" />
				<stop offset="0.6" stopColor="#c86a6a" />
				<stop offset="1" stopColor="#f0b070" />
			</linearGradient>
		</defs>
		<rect x={-400} y={-300} width={2800} height={1300} fill="url(#gv-sky)" />
		<circle cx={1400} cy={560} r={90} fill="#ffd8a0" opacity={0.85} />
		{[[200, 120], [700, 60], [1650, 140]].map(([x, y], i) => (
			<circle key={i} cx={x} cy={y} r={3} fill="#fff" opacity={0.5 + 0.3 * Math.sin(f / 10 + i)} />
		))}
		<path d="M-400,640 Q400,600 1000,630 T2400,620 L2400,1000 L-400,1000 Z" fill="#3a4a3a" />
		{/* old gravestones far away */}
		{[300, 520, 1500, 1700].map((x, i) => (
			<path key={i} d={`M${x - 30},${660 + (i % 2) * 10} L${x - 30},${610 + (i % 2) * 10} Q${x},${580 + (i % 2) * 10} ${x + 30},${610 + (i % 2) * 10} L${x + 30},${660 + (i % 2) * 10} Z`} fill="#6a6e7a" />
		))}
		{/* bare tree */}
		<g transform="translate(260,700)" stroke="#1d1a24" strokeLinecap="round" fill="none">
			<path d="M0,0 L10,-300" strokeWidth={34} />
			<path d="M8,-200 L-90,-300 M6,-250 L100,-370 M10,-290 L-20,-420 M-60,-270 L-120,-280 M70,-330 L140,-330" strokeWidth={14} />
		</g>
		{/* fence */}
		{Array.from({length: 30}).map((_, i) => (
			<path key={i} d={`M${-300 + i * 90},700 l0,-80 l12,-16 l12,16 l0,80 z`} fill="#e8e0d0" opacity={0.75} />
		))}
		<rect x={-400} y={650} width={2800} height={10} fill="#e8e0d0" opacity={0.75} />
		<rect x={-400} y={GRAVE_Y} width={2800} height={300} fill="#4a5a3a" />
		<rect x={-400} y={GRAVE_Y} width={2800} height={10} fill="#3a4a2a" />
	</Svg>
);

import React from 'react';
import {random} from 'remotion';
import {Svg} from '../engine/camera';
import {FONT, HAND} from '../kit/ui';
import {Floor, Wall} from './placesH';

/* Locations of part 2: a 1974 children's ward (warm 70s orange/brown), the hospital cafeteria,
   a softball field on a sunny day, a home dining room in the evening, a Kyoto clinic,
   a night office with an X-ray light box. Each place is its own set. */

/* ================================ 1974 CHILDREN'S WARD ================================ */
export const KID_BED_TOP = 760;
export const Ward1974: React.FC = () => (
	<Svg>
		<Wall id="w74" top="#e8b46a" bot="#d89a50" />
		{/* 70s wallpaper: rows of brown circles */}
		{Array.from({length: 8}).map((_, r) =>
			Array.from({length: 22}).map((_, c) => <circle key={`${r}-${c}`} cx={-300 + c * 120 + (r % 2) * 60} cy={40 + r * 80} r={26} fill="none" stroke="#c07a3a" strokeWidth={8} opacity={0.5} />),
		)}
		<rect x={-400} y={600} width={2800} height={300} fill="#8a5a2a" />
		<rect x={-400} y={596} width={2800} height={12} fill="#6a4020" />
		{/* window with a grey Sheffield sky and chimneys */}
		<g transform="translate(1320,150)">
			<rect x={-14} y={-14} width={418} height={318} fill="#f4efe2" />
			<rect width={390} height={290} fill="#b8c4cc" />
			{[[30, 200, 60, 90], [120, 170, 80, 120], [240, 190, 70, 100], [320, 160, 60, 130]].map(([x, y, w, h], i) => (
				<g key={i}>
					<rect x={x} y={y} width={w} height={h} fill="#6a6e78" />
					<rect x={x + 10} y={y - 30} width={14} height={30} fill="#5a5e68" />
				</g>
			))}
			<line x1={195} y1={0} x2={195} y2={290} stroke="#f4efe2" strokeWidth={10} />
		</g>
		{/* children's drawings pinned on the wall */}
		{[[420, 260, -6, '#ffd34a'], [600, 230, 4, '#9fd8ff'], [780, 270, -3, '#ffb0c0']].map(([x, y, r, c], i) => (
			<g key={i} transform={`translate(${x},${y}) rotate(${r})`}>
				<rect x={-70} y={-55} width={140} height={110} fill="#fbfaf4" />
				<circle cx={-30} cy={-16} r={18} fill={c as string} />
				<path d="M-60,40 q30,-40 60,-10 q30,30 60,-20" stroke="#3a7a3a" strokeWidth={6} fill="none" />
				<circle cy={-50} r={5} fill="#d23b3b" />
			</g>
		))}
		{/* 1974 calendar */}
		<g transform="translate(1060,260)">
			<rect x={-70} y={-90} width={140} height={180} fill="#fbfaf4" stroke="#6a4020" strokeWidth={4} />
			<rect x={-70} y={-90} width={140} height={44} fill="#d86a2a" />
			<text y={-58} textAnchor="middle" fontSize={30} fontFamily={FONT} fontWeight={900} fill="#fff">
				1974
			</text>
			{Array.from({length: 20}).map((_, i) => (
				<rect key={i} x={-58 + (i % 5) * 24} y={-34 + Math.floor(i / 5) * 28} width={18} height={18} fill="#e8d8c0" />
			))}
		</g>
		<Floor y={900} c="#6a4a2a" />
	</Svg>
);
/* hospital bed of the 70s (front piece): orange blanket, mattress top KID_BED_TOP */
export const KidBed: React.FC<{x: number}> = ({x}) => (
	<g transform={`translate(${x},0)`}>
		<rect x={-250} y={KID_BED_TOP} width={500} height={50} rx={14} fill="#fbfaf4" />
		<rect x={-250} y={KID_BED_TOP + 10} width={360} height={46} rx={10} fill="#e4762a" />
		<rect x={-270} y={KID_BED_TOP - 140} width={18} height={290} rx={8} fill="#c8ccd8" />
		<rect x={-270} y={KID_BED_TOP - 140} width={60} height={14} rx={6} fill="#c8ccd8" />
		<rect x={-240} y={KID_BED_TOP + 50} width={480} height={14} fill="#8a90a0" />
		{[-220, 220].map((lx) => (
			<rect key={lx} x={lx - 6} y={KID_BED_TOP + 60} width={12} height={900 - KID_BED_TOP - 70} fill="#8a90a0" />
		))}
		{[-220, 220].map((lx) => (
			<circle key={'w' + lx} cx={lx} cy={890} r={10} fill="#2a2a34" />
		))}
	</g>
);

/* ================================ CAFETERIA ================================ */
export const CAFE_TOP = 742;
export const Cafeteria: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<Wall id="cafe-w" top="#f4e2c4" bot="#ecd2a8" />
		{/* menu board */}
		<g transform="translate(980,170)">
			<rect x={-330} y={-100} width={660} height={200} rx={10} fill="#1d2a2a" />
			<text y={-46} textAnchor="middle" fontSize={40} fontFamily={HAND} fontWeight={700} fill="#ffd34a">
				TODAY
			</text>
			{['Burger ....... $6', 'Pizza ......... $4', 'Soup ......... $3'].map((t, i) => (
				<text key={i} x={-260} y={4 + i * 40} fontSize={32} fontFamily={HAND} fontWeight={700} fill="#fbfaf4">
					{t}
				</text>
			))}
		</g>
		{/* serving counter with a sneeze guard and trays */}
		<rect x={400} y={430} width={1160} height={200} fill="#c8ccd8" />
		<rect x={400} y={420} width={1160} height={16} fill="#9aa0ae" />
		<rect x={420} y={330} width={1120} height={8} fill="#dff0fa" opacity={0.8} />
		<rect x={420} y={338} width={1120} height={90} fill="#dff0fa" opacity={0.3} />
		{[0, 1, 2, 3, 4].map((i) => (
			<g key={i}>
				<rect x={450 + i * 220} y={392} width={180} height={34} rx={6} fill={['#e8b46a', '#e4503c', '#5ab04a', '#f2c84a', '#c87a3a'][i]} />
				{Array.from({length: 3}).map((_, k) => (
					<path key={k} d={`M${480 + i * 220 + k * 50},380 q${Math.sin(f / 10 + k + i) * 6},-20 0,-40`} stroke="#fff" strokeWidth={4} fill="none" opacity={0.35} />
				))}
			</g>
		))}
		{/* round clock + exit sign */}
		<circle cx={1700} cy={160} r={56} fill="#fbfaf4" stroke="#8a90a0" strokeWidth={8} />
		<line x1={1700} y1={160} x2={1700} y2={124} stroke="#222" strokeWidth={6} />
		<line x1={1700} y1={160} x2={1726} y2={170} stroke="#222" strokeWidth={5} />
		<rect x={200} y={120} width={140} height={50} rx={6} fill="#2a9a5a" />
		<text x={270} y={156} textAnchor="middle" fontSize={30} fontFamily={FONT} fontWeight={900} fill="#fff">
			EXIT
		</text>
		<Floor y={900} c="#b89a74" tiles />
	</Svg>
);
/* cafeteria table (front piece), top at CAFE_TOP */
export const CafeTable: React.FC<{x: number; w?: number}> = ({x, w = 520}) => (
	<g transform={`translate(${x},0)`}>
		<rect x={-w / 2} y={CAFE_TOP} width={w} height={20} rx={6} fill="#e4762a" />
		<rect x={-14} y={CAFE_TOP + 20} width={28} height={900 - CAFE_TOP - 30} fill="#5a5e68" />
		<ellipse cx={0} cy={896} rx={110} ry={10} fill="#5a5e68" />
	</g>
);

/* ================================ SOFTBALL FIELD ================================ */
export const Park: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<rect x={-400} y={-300} width={2800} height={900} fill="#8fd0ff" />
		<circle cx={1650} cy={130} r={70} fill="#fff4b0" />
		{[0, 1, 2].map((i) => (
			<g key={i} transform={`translate(${(200 + i * 640 + f * 0.4) % 2600 - 300},${100 + i * 40})`}>
				<ellipse rx={90} ry={34} fill="#fff" />
				<ellipse cx={60} cy={-14} rx={60} ry={30} fill="#fff" />
			</g>
		))}
		{/* trees behind the field */}
		{Array.from({length: 12}).map((_, i) => (
			<circle key={i} cx={-300 + i * 230} cy={520 + (i % 2) * 20} r={120 + (i % 3) * 20} fill={i % 2 ? '#3a8a4a' : '#2f7a40'} />
		))}
		{/* bleachers */}
		<g transform="translate(260,0)">
			{[0, 1, 2, 3].map((k) => (
				<rect key={k} x={-200 + k * 20} y={520 + k * 50} width={400 - k * 40} height={14} fill="#b8c4cc" />
			))}
			<rect x={-200} y={520} width={10} height={260} fill="#8a90a0" />
			<rect x={190} y={520} width={10} height={260} fill="#8a90a0" />
		</g>
		{/* chain-link fence */}
		<rect x={-400} y={560} width={2800} height={220} fill="none" />
		{Array.from({length: 60}).map((_, i) => (
			<line key={i} x1={-400 + i * 50} y1={560} x2={-350 + i * 50} y2={780} stroke="#9aa0ae" strokeWidth={2} opacity={0.6} />
		))}
		{Array.from({length: 60}).map((_, i) => (
			<line key={'b' + i} x1={-350 + i * 50} y1={560} x2={-400 + i * 50} y2={780} stroke="#9aa0ae" strokeWidth={2} opacity={0.6} />
		))}
		<rect x={-400} y={556} width={2800} height={8} fill="#8a90a0" />
		{/* grass + infield dirt */}
		<rect x={-400} y={780} width={2800} height={400} fill="#5ab04a" />
		{Array.from({length: 14}).map((_, i) => (
			<rect key={i} x={-400 + i * 200} y={780} width={100} height={400} fill="#62b852" />
		))}
		<ellipse cx={1100} cy={905} rx={700} ry={70} fill="#c8a070" />
		<polygon points="1060,898 1100,886 1140,898 1100,910" fill="#fbfaf4" />
	</Svg>
);

/* ================================ HOME DINING ROOM (evening) ================================ */
export const HOME_TABLE_TOP = 742;
export const DiningRoom: React.FC = () => (
	<Svg>
		<Wall id="dr-w" top="#4a3a6a" bot="#5a466e" />
		{/* stripes */}
		{Array.from({length: 30}).map((_, i) => (
			<rect key={i} x={-400 + i * 100} y={-300} width={44} height={900} fill="#54426e" />
		))}
		<rect x={-400} y={600} width={2800} height={300} fill="#3a2e52" />
		{/* window: evening sky over trees */}
		<g transform="translate(1340,170)">
			<rect x={-14} y={-14} width={388} height={298} fill="#2a2240" />
			<rect width={360} height={270} fill="#f08a5a" />
			<rect width={360} height={130} fill="#8a5aa0" />
			<circle cx={260} cy={170} r={34} fill="#ffd08a" />
			{[[40, 260, 70], [160, 270, 60], [300, 260, 80]].map(([x, y, r], i) => (
				<circle key={i} cx={x} cy={y} r={r} fill="#3a2a4a" />
			))}
			<line x1={180} y1={0} x2={180} y2={270} stroke="#2a2240" strokeWidth={10} />
		</g>
		{/* hanging lamp */}
		<line x1={900} y1={-300} x2={900} y2={250} stroke="#2a2240" strokeWidth={6} />
		<path d="M820,250 L980,250 L940,200 L860,200 Z" fill="#e8b46a" />
		<ellipse cx={900} cy={250} rx={80} ry={14} fill="#fff4c0" />
		<polygon points="820,256 980,256 1220,900 580,900" fill="#fff4c0" opacity={0.08} />
		{/* family photos */}
		{[[420, 300, -4], [560, 280, 3]].map(([x, y, r], i) => (
			<g key={i} transform={`translate(${x},${y}) rotate(${r})`}>
				<rect x={-56} y={-70} width={112} height={140} fill="#c99a3a" />
				<rect x={-44} y={-58} width={88} height={116} fill="#cfe8f0" />
				<circle cy={-6} r={22} fill="#f2c9a5" />
			</g>
		))}
		<Floor y={900} c="#6a4a3a" />
	</Svg>
);
export const HomeTable: React.FC<{x: number; w?: number}> = ({x, w = 560}) => (
	<g transform={`translate(${x},0)`}>
		<rect x={-w / 2} y={HOME_TABLE_TOP} width={w} height={22} rx={6} fill="#8a5a3a" />
		<rect x={-w / 2 - 10} y={HOME_TABLE_TOP - 6} width={w + 20} height={10} rx={4} fill="#fbfaf4" />
		<rect x={-w / 2 + 30} y={HOME_TABLE_TOP + 22} width={20} height={900 - HOME_TABLE_TOP - 22} fill="#6a4028" />
		<rect x={w / 2 - 50} y={HOME_TABLE_TOP + 22} width={20} height={900 - HOME_TABLE_TOP - 22} fill="#6a4028" />
	</g>
);

/* ================================ KYOTO CLINIC ================================ */
export const KyotoClinic: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<Wall id="ky-w" top="#f4ecdc" bot="#e8dcc4" />
		{/* light wood panels */}
		{Array.from({length: 16}).map((_, i) => (
			<rect key={i} x={-400 + i * 180} y={600} width={170} height={300} fill={i % 2 ? '#d8b88a' : '#d0ae80'} />
		))}
		{/* big window in a wooden lattice: a pagoda and a cherry tree outside */}
		<g transform="translate(1100,120)">
			<rect x={-16} y={-16} width={672} height={412} fill="#8a5a3a" />
			<rect width={640} height={380} fill="#bfe3ff" />
			<g transform="translate(470,380)">
				{[0, 1, 2, 3, 4].map((k) => (
					<g key={k}>
						<rect x={-40 + k * 4} y={-60 - k * 56} width={80 - k * 8} height={46} fill="#7a3a2a" />
						<path d={`M${-80 + k * 8},${-60 - k * 56} L${80 - k * 8},${-60 - k * 56} L${60 - k * 8},${-74 - k * 56} L${-60 + k * 8},${-74 - k * 56} Z`} fill="#3a2a2a" />
					</g>
				))}
				<line x1={0} y1={-340} x2={0} y2={-380} stroke="#3a2a2a" strokeWidth={6} />
			</g>
			<g transform="translate(140,300)">
				<path d="M0,80 Q10,0 -10,-60" stroke="#5a3a2a" strokeWidth={18} fill="none" />
				{Array.from({length: 16}).map((_, i) => (
					<circle key={i} cx={-80 + random('ck' + i) * 160} cy={-160 + random('cy' + i) * 140} r={34 + random('cr' + i) * 20} fill="#f6b8cc" opacity={0.95} />
				))}
			</g>
			{Array.from({length: 5}).map((_, i) => {
				const t = ((f * 1.2 + i * 70) % 380) / 380;
				return <circle key={i} cx={100 + i * 110 + Math.sin(f / 15 + i) * 20} cy={t * 380} r={5} fill="#f6b8cc" />;
			})}
			{[160, 320, 480].map((x) => (
				<line key={x} x1={x} y1={0} x2={x} y2={380} stroke="#8a5a3a" strokeWidth={8} />
			))}
			{[127, 253].map((y) => (
				<line key={y} x1={0} y1={y} x2={640} y2={y} stroke="#8a5a3a" strokeWidth={8} />
			))}
		</g>
		{/* clinic sign */}
		<g transform="translate(460,230)">
			<rect x={-180} y={-60} width={360} height={120} rx={12} fill="#fbfaf4" stroke="#2a8a8a" strokeWidth={6} />
			<text y={-8} textAnchor="middle" fontSize={34} fontFamily={FONT} fontWeight={900} fill="#2a8a8a">
				DENTAL RESEARCH
			</text>
			<text y={36} textAnchor="middle" fontSize={28} fontFamily={FONT} fontWeight={900} fill="#5a6078">
				KYOTO
			</text>
		</g>
		<Floor y={900} c="#c8a070" />
	</Svg>
);
/* dental chair (side view), seat top at 826, facing right */
export const DentalChair: React.FC<{x: number}> = ({x}) => (
	<g transform={`translate(${x},0)`}>
		<rect x={-60} y={826} width={150} height={26} rx={12} fill="#2a8a8a" />
		<path d="M-60,840 L-110,640 Q-114,620 -94,618 L-74,618 L-30,826 Z" fill="#2a8a8a" />
		<rect x={90} y={830} width={90} height={20} rx={10} fill="#2a8a8a" transform="rotate(20 90 840)" />
		<rect x={-10} y={852} width={30} height={40} fill="#8a90a0" />
		<ellipse cx={5} cy={896} rx={90} ry={10} fill="#8a90a0" />
		<rect x={-160} y={560} width={12} height={340} fill="#c8ccd8" />
		<path d="M-154,560 q60,-40 120,-20" stroke="#c8ccd8" strokeWidth={10} fill="none" />
		<circle cx={-30} cy={540} r={26} fill="#fbfaf4" stroke="#8a90a0" strokeWidth={6} />
	</g>
);

/* ================================ NIGHT OFFICE + X-RAY LIGHT BOX ================================ */
export const XrayOffice: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<Wall id="xr-w" top="#141c34" bot="#1c2644" />
		<rect x={-400} y={600} width={2800} height={300} fill="#18203a" />
		{/* light box with three films: chest, hand, skull */}
		<g transform="translate(1180,300)">
			<rect x={-430} y={-170} width={860} height={340} rx={12} fill="#2a3048" />
			<rect x={-410} y={-150} width={820} height={300} fill="#eaf6ff" opacity={0.92 + 0.05 * Math.sin(f / 9)} />
			{[-275, 0, 275].map((cx, i) => (
				<g key={i} transform={`translate(${cx},0)`}>
					<rect x={-120} y={-140} width={240} height={280} fill="#0e1424" />
					{i === 0 ? (
						<g stroke="#cfe2f0" strokeWidth={6} fill="none" opacity={0.85}>
							<line x1={0} y1={-110} x2={0} y2={110} />
							{[-80, -50, -20, 10, 40, 70].map((y) => (
								<path key={y} d={`M-8,${y} q-70,10 -90,40 M8,${y} q70,10 90,40`} />
							))}
						</g>
					) : i === 1 ? (
						<g stroke="#cfe2f0" strokeWidth={10} strokeLinecap="round" opacity={0.85}>
							<rect x={-50} y={20} width={100} height={90} rx={30} fill="none" strokeWidth={6} />
							{[-36, -12, 12, 36].map((x, k) => (
								<line key={x} x1={x} y1={20} x2={x * 1.1} y2={-60 - (k === 1 ? 30 : k === 2 ? 22 : 0)} />
							))}
							<line x1={-50} y1={60} x2={-90} y2={0} />
						</g>
					) : (
						<g stroke="#cfe2f0" strokeWidth={6} fill="none" opacity={0.85}>
							<ellipse cx={0} cy={-20} rx={80} ry={90} />
							<circle cx={-30} cy={-10} r={18} />
							<circle cx={30} cy={-10} r={18} />
							<path d="M-40,60 q40,30 80,0" />
						</g>
					)}
				</g>
			))}
		</g>
		<polygon points="750,470 1610,470 1900,900 460,900" fill="#eaf6ff" opacity={0.07} />
		{/* desk lamp glow on the left */}
		<circle cx={300} cy={500} r={160} fill="#ffd08a" opacity={0.1} />
		<Floor y={900} c="#1a2038" />
	</Svg>
);

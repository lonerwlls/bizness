import React from 'react';
import {random} from 'remotion';
import {Svg} from '../engine/camera';
import {FONT, HAND} from '../kit/ui';
import {Floor, Wall, WallClock} from './placesH';

/* Locations of part 3: transplant unit, the waiting-list hallway, a rich man's office,
   a tissue-engineering lab, a 3D-printing clean room, the blood lab, a forest with a deer. */

/* ================================ TRANSPLANT UNIT ================================ */
export const TransplantUnit: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<Wall id="tu-w" top="#d8ecf4" bot="#c4e0ec" />
		<rect x={-400} y={560} width={2800} height={340} fill="#b0d4e4" />
		<rect x={-400} y={552} width={2800} height={10} fill="#8ab8cc" />
		{/* OR double doors with round windows */}
		<g transform="translate(1380,0)">
			<rect x={-230} y={300} width={460} height={600} fill="#7aa8c0" />
			{[-1, 1].map((s) => (
				<g key={s}>
					<rect x={s < 0 ? -220 : 4} y={310} width={216} height={590} fill="#9cc6da" stroke="#6a98b0" strokeWidth={6} />
					<circle cx={s * 108} cy={470} r={50} fill="#dff4fa" stroke="#6a98b0" strokeWidth={8} />
					<rect x={s * 108 - 50} y={640} width={100} height={20} rx={8} fill="#c8ccd8" />
				</g>
			))}
			<rect x={-180} y={220} width={360} height={64} rx={10} fill="#d23b3b" />
			<text y={264} textAnchor="middle" fontSize={34} fontFamily={FONT} fontWeight={900} fill="#fff">
				TRANSPLANT UNIT
			</text>
			<circle cx={200} cy={250} r={14} fill={f % 50 < 25 ? '#ff6a5a' : '#7a2a2a'} />
		</g>
		{/* handrail + a hand-sanitiser dispenser */}
		<rect x={-400} y={640} width={2800} height={12} rx={6} fill="#8ab8cc" />
		<g transform="translate(330,470)">
			<rect x={-30} y={-50} width={60} height={100} rx={10} fill="#f4f6fa" stroke="#8a90a0" strokeWidth={4} />
			<rect x={-8} y={50} width={16} height={18} fill="#8a90a0" />
		</g>
		<Floor y={900} c="#8ab0c4" tiles gloss />
	</Svg>
);

/* ================================ WAITING-LIST HALLWAY ================================ */
export const NAMES = ['M. Alvarez', 'J. Okafor', 'S. Kim', 'D. Novak', 'A. Rossi', 'P. Singh', 'L. Brown', 'T. Haddad'];
export const ListHall: React.FC<{f: number; struck: number}> = ({f, struck}) => (
	<Svg>
		<Wall id="lh-w" top="#efe6d8" bot="#e4d8c4" />
		<rect x={-400} y={600} width={2800} height={300} fill="#c8b89a" />
		<g transform="translate(960,330)">
			<rect x={-420} y={-250} width={840} height={540} rx={14} fill="#2a3a4a" />
			<rect x={-400} y={-230} width={800} height={500} rx={8} fill="#fbfaf4" />
			<rect x={-400} y={-230} width={800} height={80} fill="#3d6fd6" />
			<text y={-176} textAnchor="middle" fontSize={40} fontFamily={FONT} fontWeight={900} fill="#fff">
				TRANSPLANT WAITING LIST
			</text>
			{NAMES.map((n, i) => {
				const y = -110 + i * 46;
				const k = Math.max(0, Math.min(1, struck - i));
				return (
					<g key={n} opacity={1 - 0.55 * k}>
						<text x={-340} y={y + 14} fontSize={34} fontFamily={HAND} fontWeight={700} fill="#2a2f4a">
							{i + 1}. {n}
						</text>
						<text x={300} y={y + 14} fontSize={28} fontFamily={FONT} fontWeight={900} fill={k > 0.5 ? '#2a9a5a' : '#8a90a0'} textAnchor="middle">
							{k > 0.5 ? 'MATCHED' : 'WAITING'}
						</text>
						<line x1={-350} y1={y + 2} x2={-350 + 400 * k} y2={y + 2} stroke="#2a9a5a" strokeWidth={6} />
					</g>
				);
			})}
		</g>
		<WallClock x={1620} y={200} h={10.2 + f / 30 / 3600} r={60} />
		<Floor y={900} c="#a89878" tiles />
	</Svg>
);

/* ================================ RICH MAN'S OFFICE ================================ */
export const EXEC_DESK_TOP = 742;
export const ExecOffice: React.FC = () => (
	<Svg>
		<Wall id="ex-w" top="#2a2232" bot="#3a2e40" />
		{/* panoramic window: mountains and a lake at golden hour */}
		<g transform="translate(860,110)">
			<rect x={-14} y={-14} width={1028} height={478} fill="#141018" />
			<rect width={1000} height={450} fill="#f2b86a" />
			<rect y={0} width={1000} height={180} fill="#d87a5a" />
			<circle cx={720} cy={230} r={60} fill="#ffe0a0" />
			<polygon points="0,330 160,170 300,290 450,150 620,300 800,190 1000,320 1000,450 0,450" fill="#6a4a6a" />
			<polygon points="0,380 200,300 420,360 700,310 1000,370 1000,450 0,450" fill="#4a3a5a" />
			<rect y={400} width={1000} height={50} fill="#8ab0d0" opacity={0.6} />
			{[250, 500, 750].map((x) => (
				<line key={x} x1={x} y1={0} x2={x} y2={450} stroke="#141018" strokeWidth={10} />
			))}
		</g>
		{/* abstract painting + gold lamp */}
		<g transform="translate(400,320)">
			<rect x={-150} y={-120} width={300} height={240} fill="#c99a3a" />
			<rect x={-136} y={-106} width={272} height={212} fill="#f4efe2" />
			<circle cx={-40} cy={-20} r={56} fill="#d23b3b" />
			<rect x={20} y={-70} width={90} height={150} fill="#2a4a9a" />
			<rect x={-110} y={50} width={140} height={30} fill="#ffd34a" />
		</g>
		<rect x={-400} y={620} width={2800} height={280} fill="#1d1820" />
		<Floor y={900} c="#d8d0c4" gloss />
	</Svg>
);
/* a glossy executive desk (front piece) */
export const ExecDesk: React.FC<{x: number; w?: number}> = ({x, w = 700}) => (
	<g transform={`translate(${x},0)`}>
		<rect x={-w / 2} y={EXEC_DESK_TOP} width={w} height={24} rx={6} fill="#1d1d24" />
		<rect x={-w / 2} y={EXEC_DESK_TOP} width={w} height={6} rx={3} fill="#4a4a58" />
		<rect x={-w / 2 + 30} y={EXEC_DESK_TOP + 24} width={w - 60} height={900 - EXEC_DESK_TOP - 24} fill="#2a2a34" />
		<rect x={-w / 2 + 50} y={EXEC_DESK_TOP + 40} width={w - 100} height={8} fill="#c99a3a" />
	</g>
);
/* leather armchair (side view), seat top at 826 */
export const LeatherChair: React.FC<{x: number; facing?: 1 | -1}> = ({x, facing = 1}) => (
	<g transform={`translate(${x},0) scale(${facing},1)`}>
		<rect x={-60} y={810} width={120} height={40} rx={14} fill="#5a2a1a" />
		<rect x={-70} y={640} width={34} height={210} rx={14} fill="#4a2214" />
		<rect x={-8} y={850} width={16} height={36} fill="#2a2a34" />
		<ellipse cx={0} cy={892} rx={60} ry={8} fill="#2a2a34" />
	</g>
);

/* ================================ TISSUE LAB ================================ */
export const TissueLab: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<Wall id="ti-w" top="#1c3a5a" bot="#24486a" />
		{/* incubators with glowing windows */}
		{[0, 1, 2, 3].map((i) => (
			<g key={i} transform={`translate(${260 + i * 360},220)`}>
				<rect width={300} height={380} rx={12} fill="#d8e2ea" />
				<rect x={30} y={40} width={240} height={200} rx={8} fill="#7ad0e8" opacity={0.7 + 0.1 * Math.sin(f / 20 + i)} />
				{[0, 1, 2].map((k) => (
					<rect key={k} x={50 + k * 70} y={150} width={50} height={70} rx={10} fill="#f0a0a8" opacity={0.7} />
				))}
				<rect x={40} y={270} width={60} height={24} rx={6} fill="#2a2f3a" />
				<text x={70} y={289} textAnchor="middle" fontSize={18} fontFamily={FONT} fontWeight={900} fill="#7af0a8">
					37.0°
				</text>
			</g>
		))}
		<rect x={-400} y={620} width={2800} height={280} fill="#1a3048" />
		<Floor y={900} c="#16283c" tiles gloss />
	</Svg>
);
export const LAB_BENCH_TOP = 760;
export const SteelBench: React.FC<{x: number; w?: number}> = ({x, w = 620}) => (
	<g transform={`translate(${x},0)`}>
		<rect x={-w / 2} y={LAB_BENCH_TOP} width={w} height={20} rx={4} fill="#c8ccd8" />
		<rect x={-w / 2 + 20} y={LAB_BENCH_TOP + 20} width={14} height={900 - LAB_BENCH_TOP - 20} fill="#8a90a0" />
		<rect x={w / 2 - 34} y={LAB_BENCH_TOP + 20} width={14} height={900 - LAB_BENCH_TOP - 20} fill="#8a90a0" />
		<rect x={-w / 2 + 20} y={850} width={w - 40} height={10} fill="#8a90a0" />
	</g>
);

/* ================================ 3D-PRINT CLEAN ROOM ================================ */
export const PrintRoom: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<Wall id="pr-w" top="#f2f0e4" bot="#e6e2d0" />
		{/* yellow clean-room light strip + hatch window */}
		<rect x={-400} y={80} width={2800} height={26} fill="#ffe08a" opacity={0.8} />
		<g transform="translate(1500,330)">
			<rect x={-180} y={-150} width={360} height={300} rx={20} fill="#c8ccd8" />
			<rect x={-150} y={-120} width={300} height={240} rx={14} fill="#bfe3ff" opacity={0.8} />
			<path d="M-150,40 q60,-30 120,0 t120,0" stroke="#fff" strokeWidth={6} fill="none" opacity={0.5} />
		</g>
		{/* screen showing the ear model rotating */}
		<g transform="translate(560,320)">
			<rect x={-190} y={-130} width={380} height={260} rx={12} fill="#1d2236" />
			<rect x={-174} y={-114} width={348} height={228} rx={6} fill="#0b1430" />
			<g transform={`translate(0,0) scale(${0.8 + 0.2 * Math.cos(f / 25)},1)`}>
				<path d="M0,70 C-40,70 -54,10 -46,-40 C-38,-90 26,-110 60,-70 C90,-30 60,10 40,20 C20,30 34,60 0,70 Z" fill="none" stroke="#7af0a8" strokeWidth={5} />
			</g>
			{Array.from({length: 6}).map((_, i) => (
				<line key={i} x1={-170} y1={-100 + i * 40} x2={170} y2={-100 + i * 40} stroke="#7af0a8" strokeWidth={1} opacity={0.25} />
			))}
		</g>
		<rect x={-400} y={640} width={2800} height={260} fill="#d8d4c0" />
		<Floor y={900} c="#c8c4b0" tiles gloss />
	</Svg>
);

/* ================================ BLOOD LAB ================================ */
export const BloodLab: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<Wall id="bl-w" top="#e4ecf4" bot="#d4e0ec" />
		{/* sample racks with red tubes */}
		{[0, 1].map((r) => (
			<g key={r} transform={`translate(${260 + r * 330},300)`}>
				<rect x={-130} y={-20} width={260} height={18} fill="#8a90a0" />
				{Array.from({length: 8}).map((_, i) => (
					<g key={i}>
						<rect x={-118 + i * 32} y={-90} width={18} height={70} rx={8} fill="#fbfaf4" stroke="#8a90a0" strokeWidth={2} />
						<rect x={-118 + i * 32} y={-60} width={18} height={40} rx={8} fill="#c0303a" />
						<rect x={-120 + i * 32} y={-100} width={22} height={12} rx={4} fill={['#7a3aa0', '#3d6fd6', '#2a9a5a', '#ffd34a'][i % 4]} />
					</g>
				))}
			</g>
		))}
		{/* big analysis screen */}
		<g transform="translate(1300,330)">
			<rect x={-300} y={-200} width={600} height={380} rx={14} fill="#1d2236" />
			<rect x={-280} y={-180} width={560} height={340} rx={8} fill="#0b1430" />
			<text x={-250} y={-140} fontSize={26} fontFamily={FONT} fontWeight={900} fill="#9fd8ff">
				CELL DIVISION RATE
			</text>
			<path d={`M-250,120 ${Array.from({length: 30}).map((_, i) => `L${-250 + i * 17},${120 - Math.pow(i / 29, 3) * 230 - Math.sin(i + f / 6) * 4}`).join(' ')}`} stroke="#ff6a5a" strokeWidth={6} fill="none" />
			<line x1={-250} y1={60} x2={250} y2={60} stroke="#7af0a8" strokeWidth={3} strokeDasharray="12 10" />
			<text x={250} y={50} textAnchor="end" fontSize={20} fontFamily={FONT} fontWeight={900} fill="#7af0a8">
				NORMAL
			</text>
		</g>
		<rect x={-400} y={620} width={2800} height={280} fill="#c4d4e4" />
		<Floor y={900} c="#a8bccc" tiles />
	</Svg>
);

/* ================================ FOREST + DEER ================================ */
export const Forest: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<rect x={-400} y={-300} width={2800} height={1300} fill="#cfe8c0" />
		<rect x={-400} y={-300} width={2800} height={600} fill="#e8f4d8" />
		{/* sun rays through the trees */}
		{[0, 1, 2].map((i) => (
			<polygon key={i} points={`${600 + i * 300},-300 ${680 + i * 300},-300 ${980 + i * 340},900 ${780 + i * 340},900`} fill="#fff8d0" opacity={0.25} />
		))}
		{Array.from({length: 16}).map((_, i) => {
			const x = -300 + i * 170 + random('tx' + i) * 60;
			const far = i % 2;
			return (
				<g key={i} opacity={far ? 0.55 : 1}>
					<rect x={x - 14} y={far ? 200 : 120} width={28} height={800} fill={far ? '#6a8a5a' : '#5a4030'} />
					<circle cx={x} cy={far ? 220 : 140} r={far ? 110 : 140} fill={far ? '#7ab06a' : '#3a7a40'} />
				</g>
			);
		})}
		<rect x={-400} y={780} width={2800} height={400} fill="#6aa050" />
		{Array.from({length: 30}).map((_, i) => (
			<path key={i} d={`M${-380 + i * 95},900 q4,-${20 + (i % 3) * 10} ${10 + Math.sin(f / 20 + i) * 4},-${30 + (i % 3) * 14}`} stroke="#4a8a3a" strokeWidth={6} fill="none" />
		))}
	</Svg>
);
/* a flat cartoon deer (side view, facing right); antler = 0..1 how grown the antlers are */
export const Deer: React.FC<{x: number; y: number; antler: number; f: number; s?: number}> = ({x, y, antler, f, s = 1}) => {
	const ink = '#2a1a10';
	const tine = (len: number) => len * antler;
	return (
		<g transform={`translate(${x},${y}) scale(${s})`}>
			{/* legs */}
			{[-90, -60, 60, 90].map((lx, i) => (
				<rect key={i} x={lx - 8} y={-120} width={16} height={120} rx={8} fill="#a0623a" stroke={ink} strokeWidth={5} />
			))}
			{/* body */}
			<ellipse cx={0} cy={-170} rx={140} ry={70} fill="#b8743e" stroke={ink} strokeWidth={7} />
			<ellipse cx={-10} cy={-140} rx={100} ry={34} fill="#e8c8a0" />
			<path d="M-140,-200 q-30,-10 -30,20" stroke={ink} strokeWidth={6} fill="#fbfaf4" />
			{/* neck + head */}
			<path d="M90,-200 L150,-320 L200,-300 L140,-170 Z" fill="#b8743e" stroke={ink} strokeWidth={7} strokeLinejoin="round" />
			<g transform={`translate(190,-320) rotate(${Math.sin(f / 30) * 3})`}>
				<ellipse cx={20} cy={0} rx={56} ry={34} fill="#b8743e" stroke={ink} strokeWidth={7} />
				<ellipse cx={70} cy={8} rx={14} ry={11} fill="#2a1a10" />
				<circle cx={10} cy={-8} r={8} fill={ink} />
				<circle cx={12} cy={-10} r={2.5} fill="#fff" />
				<ellipse cx={-30} cy={-28} rx={26} ry={12} fill="#b8743e" stroke={ink} strokeWidth={5} transform="rotate(-30 -30 -28)" />
				{/* antlers (velvet), growing */}
				<g stroke="#8a5a3a" strokeWidth={12} strokeLinecap="round" fill="none">
					<path d={`M0,-30 l${-20 * antler},${-tine(90)} l${-30 * antler},${-tine(60)}`} />
					<path d={`M${-20 * antler},${-30 - tine(90)} l${30 * antler},${-tine(50)}`} />
					<path d={`M${-10 * antler},${-30 - tine(45)} l${-34 * antler},${-tine(20)}`} />
					<path d={`M20,-30 l${10 * antler},${-tine(80)} l${30 * antler},${-tine(50)}`} />
					<path d={`M${20 + 10 * antler},${-30 - tine(80)} l${-20 * antler},${-tine(44)}`} />
				</g>
			</g>
		</g>
	);
};

import React from 'react';
import {random} from 'remotion';
import {Svg} from '../engine/camera';
import {FONT, HAND} from '../kit/ui';
import {Floor, Wall} from './placesH';

/* Locations of part 4: the hero's office at night (whiteboard), his bathroom in the morning,
   the ER entrance, a new operating room, the recovery room at dawn. */

/* ================================ OFFICE AT NIGHT + WHITEBOARD ================================ */
export const BOARD = {x: 1000, y: 400, w: 640, h: 300};
export const tallyAt = (i: number): [number, number] => {
	const grp = Math.floor(i / 5);
	const k = i % 5;
	const gx = BOARD.x + 40 + (grp % 5) * 116;
	const gy = BOARD.y + 70 + Math.floor(grp / 5) * 110;
	return k < 4 ? [gx + k * 20, gy] : [gx - 10, gy + 50];
};
/* tally marks: n strokes in groups of five */
export const Tally: React.FC<{n: number}> = ({n}) => (
	<g stroke="#1d2a5a" strokeWidth={7} strokeLinecap="round">
		{Array.from({length: n}).map((_, i) => {
			const k = i % 5;
			const [x, y] = tallyAt(i);
			return k < 4 ? <line key={i} x1={x} y1={y} x2={x + 3} y2={y + 64} /> : <line key={i} x1={x} y1={y} x2={x + 86} y2={y - 46} />;
		})}
	</g>
);
export const DocOffice: React.FC<{tally: number}> = ({tally}) => (
	<Svg>
		<Wall id="do-w" top="#1a2240" bot="#222c50" />
		<rect x={-400} y={620} width={2800} height={280} fill="#1c2444" />
		{/* window: night sky over the hospital garden */}
		<g transform="translate(240,180)">
			<rect x={-14} y={-14} width={338} height={318} fill="#3a4468" />
			<rect width={310} height={290} fill="#0b1430" />
			{Array.from({length: 12}).map((_, i) => (
				<circle key={i} cx={random('ws' + i) * 310} cy={random('wy' + i) * 160} r={1.8} fill="#fff" />
			))}
			<circle cx={230} cy={70} r={30} fill="#f4f0d8" />
			{[[60, 270, 80], [200, 280, 70], [300, 270, 60]].map(([x, y, r], i) => (
				<circle key={i} cx={x} cy={y} r={r} fill="#0a2420" />
			))}
			<line x1={155} y1={0} x2={155} y2={290} stroke="#3a4468" strokeWidth={8} />
		</g>
		{/* whiteboard */}
		<rect x={BOARD.x - 16} y={BOARD.y - 16} width={BOARD.w + 32} height={BOARD.h + 32} rx={10} fill="#8a90a0" />
		<rect x={BOARD.x} y={BOARD.y} width={BOARD.w} height={BOARD.h} fill="#f4f6fa" />
		<text x={BOARD.x + 30} y={BOARD.y + 44} fontSize={34} fontFamily={HAND} fontWeight={700} fill="#d23b3b">
			Regrowths:
		</text>
		<Tally n={tally} />
		<rect x={BOARD.x + 40} y={BOARD.y + BOARD.h + 16} width={BOARD.w - 80} height={14} rx={4} fill="#6a7080" />
		{/* desk lamp pool */}
		<circle cx={760} cy={720} r={300} fill="#ffd08a" opacity={0.08} />
		<Floor y={900} c="#2a2440" />
	</Svg>
);
export const DESK2_TOP = 742;
export const NightDesk: React.FC<{x: number; w?: number}> = ({x, w = 520}) => (
	<g transform={`translate(${x},0)`}>
		<rect x={-w / 2} y={DESK2_TOP} width={w} height={22} rx={5} fill="#5a3a2a" />
		<rect x={-w / 2 + 20} y={DESK2_TOP + 22} width={26} height={900 - DESK2_TOP - 22} fill="#3a2418" />
		<rect x={w / 2 - 46} y={DESK2_TOP + 22} width={26} height={900 - DESK2_TOP - 22} fill="#3a2418" />
		{/* desk lamp */}
		<g transform={`translate(${-w / 2 + 70},${DESK2_TOP})`}>
			<ellipse cx={0} cy={-6} rx={36} ry={10} fill="#2a2a34" />
			<line x1={0} y1={-6} x2={30} y2={-110} stroke="#2a2a34" strokeWidth={8} />
			<path d="M10,-120 L70,-130 L60,-90 Z" fill="#c99a3a" />
			<polygon points="40,-100 80,-104 160,0 -20,0" fill="#ffe0a0" opacity={0.15} />
		</g>
	</g>
);

/* ================================ BATHROOM (morning) ================================ */
export const Bathroom: React.FC<{dark?: number}> = ({dark = 0}) => (
	<Svg>
		<Wall id="ba-w" top="#d8f0f0" bot="#c8e6e8" />
		{/* tiles */}
		{Array.from({length: 26}).map((_, i) => (
			<line key={i} x1={-400 + i * 110} y1={-300} x2={-400 + i * 110} y2={900} stroke="#b8d8dc" strokeWidth={3} />
		))}
		{Array.from({length: 12}).map((_, i) => (
			<line key={'h' + i} x1={-400} y1={-300 + i * 110} x2={2400} y2={-300 + i * 110} stroke="#b8d8dc" strokeWidth={3} />
		))}
		{/* mirror with a reflection sheen */}
		<g transform="translate(1200,330)">
			<rect x={-220} y={-200} width={440} height={340} rx={30} fill="#9ab4bc" />
			<rect x={-200} y={-180} width={400} height={300} rx={20} fill="#cfe8f0" />
			<polygon points="-150,-180 -60,-180 -180,100 -200,100 -200,60" fill="#fff" opacity={0.4} />
			<rect x={-180} y={170} width={360} height={14} rx={6} fill="#9ab4bc" />
		</g>
		{/* sink */}
		<g transform="translate(1200,0)">
			<path d="M-200,620 L200,620 Q190,720 0,730 Q-190,720 -200,620 Z" fill="#fbfaf4" stroke="#9ab4bc" strokeWidth={6} />
			<rect x={-30} y={730} width={60} height={170} fill="#e8ecf2" />
			<path d="M-10,620 L-10,570 Q-10,550 20,550 L60,550" stroke="#9aa0ae" strokeWidth={14} fill="none" />
		</g>
		{/* towel + morning window light */}
		<rect x={300} y={300} width={140} height={260} rx={10} fill="#ffb05a" />
		<rect x={300} y={300} width={140} height={30} fill="#e8963a" />
		<polygon points="560,-300 760,-300 1000,900 600,900" fill="#fff8d0" opacity={0.2 * (1 - dark)} />
		<Floor y={900} c="#9ac0c8" tiles />
		<rect x={-400} y={-300} width={2800} height={1300} fill="#0b1030" opacity={0.75 * dark} />
	</Svg>
);

/* ================================ ER ENTRANCE ================================ */
export const EREntrance: React.FC<{f: number; open: number}> = ({f, open}) => (
	<Svg>
		<Wall id="ee-w" top="#2a3a5a" bot="#34466a" />
		<rect x={-400} y={600} width={2800} height={300} fill="#2a3450" />
		{/* sliding doors (open by `open`) with the night outside and an ambulance light */}
		<g transform="translate(1500,0)">
			<rect x={-300} y={240} width={600} height={660} fill="#0b1430" />
			<circle cx={-120} cy={420} r={80 + 20 * Math.sin(f / 3)} fill={Math.floor(f / 6) % 2 ? '#ff3a3a' : '#3a6aff'} opacity={0.35} />
			<rect x={-300} y={240} width={600} height={20} fill="#8a90a0" />
			<rect x={-300 - 290 * open} y={260} width={300} height={640} fill="#9fd8ff" opacity={0.45} stroke="#c8ccd8" strokeWidth={8} />
			<rect x={0 + 290 * open} y={260} width={300} height={640} fill="#9fd8ff" opacity={0.45} stroke="#c8ccd8" strokeWidth={8} />
			<rect x={-180} y={150} width={360} height={70} rx={10} fill="#d23b3b" />
			<text y={198} textAnchor="middle" fontSize={44} fontFamily={FONT} fontWeight={900} fill="#fff">
				EMERGENCY
			</text>
		</g>
		{/* corridor side: chairs and a triage desk */}
		<g transform="translate(420,0)">
			<rect x={-220} y={560} width={440} height={340} fill="#3a4a6a" />
			<rect x={-240} y={548} width={480} height={18} fill="#5a6a8a" />
			<text y={520} textAnchor="middle" fontSize={34} fontFamily={FONT} fontWeight={900} fill="#9fd8ff">
				TRIAGE
			</text>
		</g>
		{Array.from({length: 4}).map((_, i) => (
			<rect key={i} x={-60 + i * 520} y={-40} width={300} height={22} rx={8} fill="#e9fbff" opacity={0.9} />
		))}
		<Floor y={900} c="#3a4a64" tiles gloss />
	</Svg>
);
/* ER stretcher with a raised backrest (side view, head end to the right); mattress top at BED_TOP */
export const BED_TOP = 770;
export const RaisedStretcher: React.FC<{x: number}> = ({x}) => (
	<g transform={`translate(${x},0)`}>
		<rect x={-200} y={BED_TOP} width={400} height={28} rx={10} fill="#e9f3f4" />
		<path d={`M120,${BED_TOP} L190,${BED_TOP - 150} L214,${BED_TOP - 140} L150,${BED_TOP + 6} Z`} fill="#e9f3f4" stroke="#b8c8cc" strokeWidth={4} />
		<rect x={-200} y={BED_TOP + 28} width={400} height={14} rx={4} fill="#8a9aa8" />
		{[-170, 170].map((lx) => (
			<g key={lx}>
				<rect x={lx - 5} y={BED_TOP + 40} width={10} height={90} fill="#6a7a88" />
				<circle cx={lx} cy={BED_TOP + 132} r={10} fill="#2a2a34" />
			</g>
		))}
	</g>
);

/* ================================ OPERATING ROOM (new) ================================ */
export const OR2: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<Wall id="or2-w" top="#1d4a4a" bot="#235858" />
		{Array.from({length: 22}).map((_, i) => (
			<line key={i} x1={-400 + i * 130} y1={-300} x2={-400 + i * 130} y2={900} stroke="#1a4242" strokeWidth={4} />
		))}
		{/* big double surgical lamp */}
		{[-1, 1].map((s) => (
			<g key={s} transform={`translate(${960 + s * 170},150)`}>
				<line x1={0} y1={-300} x2={0} y2={-40} stroke="#8a9aa8" strokeWidth={14} />
				<ellipse cx={0} cy={0} rx={140} ry={50} fill="#d8e2ea" />
				<ellipse cx={0} cy={10} rx={110} ry={30} fill="#fffbe0" />
			</g>
		))}
		<polygon points="760,170 1160,170 1360,820 560,820" fill="#fffbe0" opacity={0.1} />
		{/* anaesthesia machine */}
		<g transform="translate(1600,0)">
			<rect x={-110} y={420} width={220} height={480} rx={12} fill="#c8ccd8" />
			<rect x={-90} y={450} width={180} height={110} rx={8} fill="#0b1430" />
			<path d={Array.from({length: 30}).map((_, i) => `${i ? 'L' : 'M'}${-84 + i * 6},${505 + ((i + Math.floor(f / 2)) % 12 === 0 ? -26 : 0)}`).join(' ')} stroke="#4cff9a" strokeWidth={3} fill="none" />
		</g>
		<Floor y={900} c="#2a5a5a" tiles gloss />
	</Svg>
);
export const ORTable2: React.FC<{x: number}> = ({x}) => (
	<g transform={`translate(${x},0)`}>
		<rect x={-260} y={700} width={520} height={40} rx={12} fill="#3a6a9a" />
		<rect x={-250} y={690} width={500} height={16} rx={6} fill="#9fd8ff" />
		<rect x={-40} y={740} width={80} height={140} fill="#8a9aa8" />
		<rect x={-140} y={880} width={280} height={20} rx={8} fill="#6a7a88" />
	</g>
);

/* ================================ RECOVERY ROOM (dawn) ================================ */
export const Recovery: React.FC<{dawn: number}> = ({dawn}) => (
	<Svg>
		<Wall id="rc-w" top="#e8d8e8" bot="#dcc8dc" />
		<rect x={-400} y={600} width={2800} height={300} fill="#c8b0c8" />
		<g transform="translate(900,140)">
			<rect x={-14} y={-14} width={428} height={318} fill="#f4f0f4" />
			<rect width={400} height={290} fill="#2a3a6a" />
			<rect width={400} height={290} fill="#ffb27a" opacity={0.9 * dawn} />
			<circle cx={200} cy={290 - 80 * dawn} r={50} fill="#ffe8a0" opacity={dawn} />
			{[[60, 270, 70], [200, 290, 80], [340, 270, 70]].map(([x, y, r], i) => (
				<circle key={i} cx={x} cy={y} r={r} fill="#4a3a5a" />
			))}
			<line x1={200} y1={0} x2={200} y2={290} stroke="#f4f0f4" strokeWidth={10} />
		</g>
		<polygon points="900,440 1300,440 1500,900 700,900" fill="#ffd8a0" opacity={0.18 * dawn} />
		<Floor y={900} c="#a890a8" />
	</Svg>
);
/* hospital bed with a raised head end (head end on the right), mattress top at RB_TOP */
export const RB_TOP = 770;
export const RecoveryBed: React.FC<{x: number; c?: string; flip?: boolean}> = ({x, c = '#9fc8ff', flip}) => (
	<g transform={`translate(${x},0) scale(${flip ? -1 : 1},1)`}>
		<rect x={-220} y={RB_TOP} width={440} height={34} rx={12} fill="#fbfaf4" />
		<path d={`M120,${RB_TOP + 4} L200,${RB_TOP - 150} L226,${RB_TOP - 138} L156,${RB_TOP + 10} Z`} fill="#fbfaf4" stroke="#c8ccd8" strokeWidth={4} />
		<rect x={-220} y={RB_TOP + 14} width={300} height={34} rx={10} fill={c} />
		<rect x={-236} y={RB_TOP - 90} width={16} height={240} rx={6} fill="#8a9aa8" />
		<rect x={-200} y={RB_TOP + 48} width={400} height={14} fill="#8a9aa8" />
		{[-180, 180].map((lx) => (
			<rect key={lx} x={lx - 6} y={RB_TOP + 60} width={12} height={900 - RB_TOP - 64} fill="#8a9aa8" />
		))}
	</g>
);

import React from 'react';
import {random} from 'remotion';
import {Svg} from '../engine/camera';
import {darken, lighten} from '../engine/color';
import {FONT, HAND} from '../kit/ui';
import {Floor, Wall, WallClock} from './placesH';

/* Locations of "What if you could regrow any body part?" — part 1.
   Palette: night hospital blue-teal with warm lamp pools; aquarium blue; 1898 sepia; daylight lab mint. */

/* ================================ BREAK ROOM (3 a.m.) ================================ */
export const COUNTER_TOP = 680;
/* back wall: window on the night car park and trees, fridge, cupboards, notice board, clock, vending machine */
export const BreakRoom: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<Wall id="br-w" top="#1f3a4e" bot="#2a4d5e" />
		{/* fluorescent tube, one end flickering */}
		<rect x={760} y={-30} width={420} height={20} rx={8} fill="#eafcff" opacity={random('fl' + Math.floor(f / 5)) > 0.9 ? 0.5 : 0.95} />
		{/* window: night sky, a lamp post in the car park, trees */}
		<g transform="translate(120,180)">
			<rect x={-16} y={-16} width={392} height={312} rx={8} fill="#9ab4c0" />
			<rect width={360} height={280} fill="#0d1838" />
			{Array.from({length: 14}).map((_, i) => (
				<circle key={i} cx={20 + random('st' + i) * 320} cy={14 + random('sy' + i) * 120} r={1.5 + random('sr' + i) * 1.5} fill="#fff" opacity={0.5 + 0.5 * Math.sin(f / 14 + i)} />
			))}
			<circle cx={290} cy={60} r={24} fill="#f4f0d8" />
			{[[40, 200, 70], [120, 215, 60], [220, 205, 80], [320, 220, 55]].map(([x, y, r], i) => (
				<circle key={i} cx={x} cy={y} r={r} fill="#0a2a24" />
			))}
			<rect x={168} y={120} width={6} height={160} fill="#2a3448" />
			<circle cx={171} cy={118} r={10} fill="#ffe3a0" />
			<circle cx={171} cy={118} r={44} fill="#ffe3a0" opacity={0.15} />
			<line x1={180} y1={0} x2={180} y2={280} stroke="#9ab4c0" strokeWidth={10} />
			<line x1={0} y1={140} x2={360} y2={140} stroke="#9ab4c0" strokeWidth={8} />
		</g>
		{/* notice board */}
		<g transform="translate(640,210)">
			<rect x={-120} y={-90} width={240} height={180} rx={6} fill="#a0703e" />
			<rect x={-108} y={-78} width={216} height={156} fill="#c9a06a" />
			{[[-70, -40, '#fff6a8', -4], [10, -48, '#bfe3ff', 5], [-40, 26, '#ffd0dc', 3], [56, 20, '#fbfaf2', -6]].map(([x, y, c, r], i) => (
				<g key={i} transform={`translate(${x},${y}) rotate(${r})`}>
					<rect x={-34} y={-30} width={68} height={60} fill={c as string} />
					<circle cy={-24} r={5} fill="#d23b3b" />
					{[0, 1, 2].map((k) => (
						<rect key={k} x={-24} y={-8 + k * 12} width={40 - k * 8} height={4} fill="#8a90a0" />
					))}
				</g>
			))}
		</g>
		<WallClock x={1010} y={170} h={3.0 + f / 30 / 3600} r={56} />
		{/* upper cupboards over the counter */}
		{[0, 1, 2, 3].map((i) => (
			<g key={i} transform={`translate(${1130 + i * 150},250)`}>
				<rect width={140} height={170} rx={6} fill="#d8e2e6" stroke="#9aaab0" strokeWidth={4} />
				<rect x={i % 2 ? 14 : 112} y={70} width={12} height={36} rx={5} fill="#7a8a90" />
			</g>
		))}
		{/* tiled splashback */}
		<rect x={760} y={480} width={1000} height={200} fill="#cfe0e4" />
		{Array.from({length: 20}).map((_, i) => (
			<line key={i} x1={760 + i * 50} y1={480} x2={760 + i * 50} y2={680} stroke="#b4c8cc" strokeWidth={2} />
		))}
		{[530, 580, 630].map((y) => (
			<line key={y} x1={760} y1={y} x2={1760} y2={y} stroke="#b4c8cc" strokeWidth={2} />
		))}
		{/* vending machine (far right) */}
		<g transform="translate(1900,330)">
			<rect x={-130} y={0} width={260} height={570} rx={10} fill="#2a3a7a" />
			<rect x={-110} y={24} width={160} height={400} rx={6} fill="#bfe3ff" opacity={0.85} />
			{Array.from({length: 5}).map((_, r) =>
				Array.from({length: 3}).map((_, c) => <rect key={`${r}-${c}`} x={-100 + c * 50} y={40 + r * 76} width={36} height={52} rx={5} fill={['#e4473c', '#ffd34a', '#3fcf7a', '#f08a3a', '#9f7af0'][(r + c) % 5]} />),
			)}
			<rect x={66} y={60} width={44} height={120} rx={6} fill="#11142c" />
			<rect x={-110} y={450} width={160} height={70} rx={6} fill="#11142c" />
		</g>
		{/* fridge (left of the counter) */}
		<g transform="translate(560,0)">
			<rect x={-110} y={340} width={220} height={560} rx={16} fill="#e8eef2" stroke="#9aaab0" strokeWidth={4} />
			<line x1={-110} y1={530} x2={110} y2={530} stroke="#9aaab0" strokeWidth={4} />
			<rect x={80} y={380} width={10} height={110} rx={5} fill="#8a9aa0" />
			<rect x={80} y={560} width={10} height={140} rx={5} fill="#8a9aa0" />
			<rect x={-70} y={580} width={60} height={70} fill="#ffd34a" transform="rotate(-6 -40 615)" />
		</g>
		<Floor y={900} c="#3a5a6a" tiles />
	</Svg>
);
/* base cabinets with the worktop at COUNTER_TOP (draw on the actors' layer, behind them) */
export const Counter: React.FC<{x0: number; x1: number}> = ({x0, x1}) => (
	<g>
		<rect x={x0} y={COUNTER_TOP + 14} width={x1 - x0} height={900 - COUNTER_TOP - 14} fill="#7a96a4" />
		{Array.from({length: Math.floor((x1 - x0) / 160)}).map((_, i) => (
			<g key={i}>
				<rect x={x0 + 12 + i * 160} y={COUNTER_TOP + 30} width={140} height={170} rx={6} fill="#8aa6b4" />
				<rect x={x0 + 70 + i * 160} y={COUNTER_TOP + 44} width={26} height={8} rx={4} fill="#4a5a64" />
			</g>
		))}
		<rect x={x0 - 10} y={COUNTER_TOP} width={x1 - x0 + 20} height={18} rx={4} fill="#e8e2d4" />
		<rect x={x0 - 10} y={COUNTER_TOP + 14} width={x1 - x0 + 20} height={4} fill="#b8b0a0" />
	</g>
);
/* coffee machine standing on the worktop */
export const CoffeeMachine: React.FC<{x: number; f: number}> = ({x, f}) => (
	<g transform={`translate(${x},${COUNTER_TOP})`}>
		<rect x={-60} y={-190} width={120} height={190} rx={12} fill="#2a2a34" />
		<rect x={-44} y={-170} width={88} height={40} rx={6} fill="#11142c" />
		<circle cx={30} cy={-150} r={6} fill={f % 40 < 20 ? '#3fcf7a' : '#1d6a3a'} />
		<rect x={-30} y={-110} width={60} height={20} rx={4} fill="#5a5a68" />
		<rect x={-50} y={-14} width={100} height={14} rx={4} fill="#3a3a48" />
	</g>
);

/* ================================ AQUARIUM LAB ================================ */
export const TANK = {x: 1180, y: 380, w: 620, h: 340}; // water box (top-left, size)
export const AquaLab: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<Wall id="aq-w" top="#0d2240" bot="#16345a" />
		{/* shelves with specimen jars */}
		{[220, 400].map((y, r) => (
			<g key={y}>
				<rect x={120} y={y} width={560} height={14} fill="#3a5a7a" />
				{[0, 1, 2, 3, 4].map((i) => (
					<g key={i} transform={`translate(${170 + i * 105},${y})`}>
						<rect x={-30} y={-90 + (i % 2) * 12} width={60} height={90 - (i % 2) * 12} rx={10} fill={['#5ac8b0', '#8ad0ff', '#c8a0f0', '#9fe0a0', '#ffd08a'][(i + r) % 5]} opacity={0.6} />
						<rect x={-32} y={-100 + (i % 2) * 12} width={64} height={14} rx={4} fill="#2a2f4a" />
					</g>
				))}
			</g>
		))}
		{/* poster of the axolotl */}
		<g transform="translate(400,640) rotate(-2)">
			<rect x={-150} y={-100} width={300} height={200} fill="#f4efe2" />
			<text y={-58} textAnchor="middle" fontSize={26} fontFamily={FONT} fontWeight={900} fill="#2a2f4a">
				AMBYSTOMA
			</text>
			<text y={-26} textAnchor="middle" fontSize={26} fontFamily={FONT} fontWeight={900} fill="#2a2f4a">
				MEXICANUM
			</text>
			<ellipse cx={-10} cy={40} rx={90} ry={26} fill="#f4a6b8" />
			<ellipse cx={74} cy={34} rx={34} ry={26} fill="#f4a6b8" />
			{[-1, 0, 1].map((k) => (
				<line key={k} x1={64} y1={20} x2={50 + k * 18} y2={-6} stroke="#e0708e" strokeWidth={6} strokeLinecap="round" />
			))}
		</g>
		{/* bubbling caustics on the wall */}
		{Array.from({length: 6}).map((_, i) => (
			<ellipse key={i} cx={TANK.x + 80 + i * 100 + Math.sin(f / 30 + i) * 30} cy={200 + Math.cos(f / 25 + i) * 20} rx={60} ry={14} fill="#6ad0ff" opacity={0.08} />
		))}
		<Floor y={900} c="#1d3450" tiles />
	</Svg>
);
/* tank back: water, gravel, plants (behind the 3D axolotl) */
export const TankBack: React.FC<{f: number}> = ({f}) => (
	<g>
		<rect x={TANK.x - 20} y={TANK.y + TANK.h + 10} width={TANK.w + 40} height={900 - TANK.y - TANK.h - 10} fill="#2a3a5a" />
		<rect x={TANK.x} y={TANK.y + TANK.h + 34} width={TANK.w} height={120} rx={8} fill="#22314e" />
		<rect x={TANK.x} y={TANK.y} width={TANK.w} height={TANK.h} fill="#2f8ab0" />
		<rect x={TANK.x} y={TANK.y} width={TANK.w} height={TANK.h} fill="url(#aq-wg)" />
		<defs>
			<linearGradient id="aq-wg" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor="#7ad8f0" stopOpacity={0.5} />
				<stop offset="1" stopColor="#0a3a5a" stopOpacity={0.6} />
			</linearGradient>
		</defs>
		{/* plants swaying */}
		{[40, 90, 520, 570, 600].map((x, i) => (
			<path key={i} d={`M${TANK.x + x},${TANK.y + TANK.h} q${Math.sin(f / 20 + i) * 20},-90 ${Math.sin(f / 26 + i) * 10},-${150 + (i % 2) * 60}`} stroke="#3aa060" strokeWidth={10} fill="none" strokeLinecap="round" />
		))}
		{/* gravel */}
		{Array.from({length: 46}).map((_, i) => (
			<circle key={i} cx={TANK.x + 8 + i * 13.3} cy={TANK.y + TANK.h - 10 + (i % 3) * 3} r={9 + (i % 4) * 2} fill={['#c8b08a', '#a8906a', '#d8c8a0'][i % 3]} />
		))}
	</g>
);
/* tank front: glass rim, reflections, bubbles (over the axolotl) */
export const TankFront: React.FC<{f: number}> = ({f}) => (
	<g>
		{Array.from({length: 8}).map((_, i) => {
			const t = ((f * 2 + i * 41) % 300) / 300;
			return <circle key={i} cx={TANK.x + 560 + Math.sin(f / 8 + i) * 8} cy={TANK.y + TANK.h - t * TANK.h} r={4 + (i % 3) * 2} fill="none" stroke="#dff6ff" strokeWidth={2} opacity={0.8 * (1 - t)} />;
		})}
		<polygon points={`${TANK.x + 40},${TANK.y} ${TANK.x + 110},${TANK.y} ${TANK.x + 30},${TANK.y + TANK.h} ${TANK.x - 40 + 40},${TANK.y + TANK.h}`} fill="#fff" opacity={0.08} />
		<rect x={TANK.x - 14} y={TANK.y - 26} width={TANK.w + 28} height={26} rx={6} fill="#2a2f4a" />
		<rect x={TANK.x - 14} y={TANK.y} width={14} height={TANK.h + 10} fill="#2a2f4a" />
		<rect x={TANK.x + TANK.w} y={TANK.y} width={14} height={TANK.h + 10} fill="#2a2f4a" />
		<rect x={TANK.x - 14} y={TANK.y + TANK.h} width={TANK.w + 28} height={14} fill="#2a2f4a" />
	</g>
);

/* ================================ 1898 LAB (sepia) ================================ */
export const DESK_TOP = 740;
export const Lab1898: React.FC = () => (
	<Svg>
		<Wall id="l98-w" top="#6a5236" bot="#7a6040" />
		{/* wainscot */}
		<rect x={-400} y={600} width={2800} height={300} fill="#5a4028" />
		{Array.from({length: 18}).map((_, i) => (
			<rect key={i} x={-380 + i * 160} y={630} width={130} height={240} rx={4} fill="#4e3622" />
		))}
		{/* tall window with daylight */}
		<g transform="translate(1500,120)">
			<rect x={-14} y={-14} width={288} height={428} fill="#3a2a18" />
			<rect width={260} height={400} fill="#e8d8b0" />
			<rect width={260} height={400} fill="#fff4d8" opacity={0.5} />
			<line x1={130} y1={0} x2={130} y2={400} stroke="#3a2a18" strokeWidth={10} />
			{[100, 200, 300].map((y) => (
				<line key={y} x1={0} y1={y} x2={260} y2={y} stroke="#3a2a18" strokeWidth={8} />
			))}
		</g>
		<polygon points="1500,520 1760,520 1500,900 1200,900" fill="#fff4d8" opacity={0.08} />
		{/* bookcase */}
		<g transform="translate(180,120)">
			<rect width={420} height={780} fill="#3a2a18" />
			{[0, 1, 2, 3, 4].map((r) => (
				<g key={r}>
					<rect x={14} y={20 + r * 150} width={392} height={130} fill="#2a1e10" />
					{Array.from({length: 12}).map((_, i) => (
						<rect key={i} x={20 + i * 32} y={20 + r * 150 + 130 - (90 + ((i * 7 + r * 3) % 4) * 10)} width={26} height={90 + ((i * 7 + r * 3) % 4) * 10} fill={['#7a3a2a', '#4a5a3a', '#8a6a3a', '#3a4a6a', '#6a4a5a'][(i + r) % 5]} />
					))}
				</g>
			))}
		</g>
		{/* framed chart of a flatworm */}
		<g transform="translate(900,300) rotate(1)">
			<rect x={-150} y={-120} width={300} height={240} fill="#3a2a18" />
			<rect x={-136} y={-106} width={272} height={212} fill="#efe4c8" />
			<path d="M-90,10 q30,-40 90,-36 q70,6 96,30 q-30,30 -96,34 q-60,2 -90,-28 z" fill="#8a6a4a" />
			<circle cx={-62} cy={-2} r={5} fill="#2a1a0e" />
			<circle cx={-62} cy={20} r={5} fill="#2a1a0e" />
			<text y={90} textAnchor="middle" fontSize={26} fontFamily={HAND} fontWeight={700} fill="#3a2a18">
				Planaria maculata
			</text>
		</g>
		<Floor y={900} c="#4a3420" />
	</Svg>
);
/* writing desk (front piece) with the top at DESK_TOP */
export const OldDesk: React.FC<{x: number; w?: number}> = ({x, w = 520}) => (
	<g transform={`translate(${x},0)`}>
		<rect x={-w / 2} y={DESK_TOP} width={w} height={22} rx={4} fill="#6a4a2a" />
		<rect x={-w / 2 + 20} y={DESK_TOP + 22} width={30} height={900 - DESK_TOP - 22} fill="#4a3018" />
		<rect x={w / 2 - 50} y={DESK_TOP + 22} width={30} height={900 - DESK_TOP - 22} fill="#4a3018" />
		<rect x={w / 2 - 190} y={DESK_TOP + 22} width={140} height={100} fill="#5a3a20" />
		<circle cx={w / 2 - 120} cy={DESK_TOP + 72} r={7} fill="#c99a3a" />
	</g>
);
/* wooden chair (side view), seat top at SEAT + 4 = 826 */
export const OldChair: React.FC<{x: number; facing?: 1 | -1}> = ({x, facing = 1}) => (
	<g transform={`translate(${x},0) scale(${facing},1)`}>
		<rect x={-44} y={826} width={88} height={14} rx={4} fill="#5a3a20" />
		<rect x={-46} y={680} width={12} height={160} rx={4} fill="#5a3a20" />
		<rect x={-46} y={690} width={12} height={10} fill="#3a2410" />
		<rect x={-38} y={840} width={9} height={62} fill="#3a2410" />
		<rect x={30} y={840} width={9} height={62} fill="#3a2410" />
	</g>
);

/* ================================ DAYLIGHT LAB (experiments) ================================ */
export const BENCH_TOP = 745;
export const DayLab: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<Wall id="dl-w" top="#d8efe6" bot="#c4e4d8" />
		{/* big window: trees and a morning sky */}
		<g transform="translate(1280,140)">
			<rect x={-14} y={-14} width={548} height={348} rx={8} fill="#f4f6fa" />
			<rect width={520} height={320} fill="#9fd8ff" />
			<circle cx={430} cy={70} r={34} fill="#fff4b0" />
			{[[60, 300, 110], [190, 320, 90], [330, 300, 120], [470, 320, 80]].map(([x, y, r], i) => (
				<circle key={i} cx={x + Math.sin(f / 40 + i) * 3} cy={y} r={r} fill={i % 2 ? '#5ab06a' : '#4a9a5a'} />
			))}
			<line x1={260} y1={0} x2={260} y2={320} stroke="#f4f6fa" strokeWidth={10} />
		</g>
		{/* periodic-table style poster + eye-wash sign */}
		<g transform="translate(560,260)">
			<rect x={-160} y={-110} width={320} height={220} fill="#fbfaf4" stroke="#8a90a0" strokeWidth={4} />
			{Array.from({length: 6}).map((_, r) =>
				Array.from({length: 9}).map((_, c) => <rect key={`${r}-${c}`} x={-140 + c * 31} y={-90 + r * 31} width={27} height={27} fill={['#9fd8ff', '#ffd08a', '#c8f0c0', '#f0c0d0'][(r * 3 + c) % 4]} />),
			)}
		</g>
		{/* wall cabinets with glassware */}
		{[0, 1].map((i) => (
			<g key={i} transform={`translate(${780 + i * 230},180)`}>
				<rect width={210} height={240} rx={6} fill="#f4f6fa" stroke="#9aaab0" strokeWidth={4} />
				<rect x={12} y={12} width={186} height={216} fill="#cfe8f0" opacity={0.6} />
				{[0, 1, 2].map((k) => (
					<path key={k} d={`M${40 + k * 60},${100} l-14,60 h40 l-14,-60 z`} fill={['#7ad8b0', '#f0b0c0', '#9fc8ff'][k]} opacity={0.8} />
				))}
				<rect x={12} y={170} width={186} height={6} fill="#9aaab0" />
			</g>
		))}
		<Floor y={900} c="#9ac8b8" tiles />
	</Svg>
);
/* lab bench (front piece), top at BENCH_TOP */
export const Bench: React.FC<{x: number; w?: number}> = ({x, w = 560}) => (
	<g transform={`translate(${x},0)`}>
		<rect x={-w / 2} y={BENCH_TOP} width={w} height={24} rx={4} fill="#2a3a4a" />
		<rect x={-w / 2 + 16} y={BENCH_TOP + 24} width={w - 32} height={900 - BENCH_TOP - 24} fill="#e8ecf2" />
		{Array.from({length: Math.floor((w - 32) / 130)}).map((_, i) => (
			<g key={i}>
				<rect x={-w / 2 + 30 + i * 130} y={BENCH_TOP + 40} width={116} height={100} rx={5} fill="#d8dce6" />
				<rect x={-w / 2 + 70 + i * 130} y={BENCH_TOP + 52} width={36} height={8} rx={4} fill="#8a90a0" />
			</g>
		))}
	</g>
);
/* lab stool, seat top at 826 */
export const Stool: React.FC<{x: number}> = ({x}) => (
	<g transform={`translate(${x},0)`}>
		<ellipse cx={0} cy={830} rx={46} ry={12} fill="#2a3a4a" />
		<rect x={-5} y={836} width={10} height={50} fill="#8a90a0" />
		<path d="M-34,900 L0,880 L34,900" stroke="#8a90a0" strokeWidth={8} fill="none" />
	</g>
);

/* ================================ CLOSE-UPS ================================ */
/* the hero's hand, big (fingers up). tip = 0..1 how much of the index fingertip exists
   (0 → missing, white dressing-free cartoon stump, no blood); nail appears after 0.85 */
export const BigHand: React.FC<{tip: number; glow?: number}> = ({tip, glow = 0}) => {
	const skin = '#f2c9a5';
	const ink = '#2a1a14';
	const fingers = [
		{x: -78, h: 150, w: 46},
		{x: -26, h: 196, w: 48},
		{x: 28, h: 182, w: 48},
		{x: 78, h: 140, w: 42},
	];
	const lost = 70; // px of the index fingertip
	return (
		<g>
			{/* sleeve */}
			<rect x={-150} y={170} width={300} height={140} rx={20} fill="#eef2f8" stroke={ink} strokeWidth={8} />
			<rect x={-150} y={170} width={300} height={34} fill="#d8dce6" stroke={ink} strokeWidth={8} />
			{/* palm */}
			<rect x={-120} y={-30} width={240} height={220} rx={70} fill={skin} stroke={ink} strokeWidth={8} />
			{/* thumb */}
			<g transform="translate(-112,90) rotate(-48)">
				<rect x={-24} y={-130} width={50} height={140} rx={25} fill={skin} stroke={ink} strokeWidth={8} />
			</g>
			{fingers.map((fg, i) => {
				const h = i === 1 ? fg.h - lost * (1 - tip) : fg.h;
				return (
					<g key={i}>
						<rect x={fg.x - fg.w / 2} y={-h} width={fg.w} height={h + 40} rx={fg.w / 2} fill={skin} stroke={ink} strokeWidth={8} />
						{i !== 1 || tip > 0.85 ? <rect x={fg.x - fg.w / 2 + 10} y={-h + 8} width={fg.w - 20} height={28} rx={10} fill="#fbe0d0" stroke={ink} strokeWidth={4} opacity={i === 1 ? (tip - 0.85) / 0.15 : 1} /> : null}
						<line x1={fg.x - 12} y1={-h * 0.45} x2={fg.x + 12} y2={-h * 0.45} stroke={ink} strokeWidth={3} opacity={0.5} />
					</g>
				);
			})}
			{/* the growing tip: bone first (white), then skin closes over it */}
			{tip < 1 ? (
				<g>
					<rect x={-26 - 24} y={-(196 - lost * (1 - tip)) - 6} width={48} height={14} rx={7} fill="#f6a0a8" stroke={ink} strokeWidth={6} />
				</g>
			) : null}
			{glow > 0
				? Array.from({length: 8}).map((_, i) => {
						const a = (i / 8) * Math.PI * 2;
						const d = 50 + 50 * glow;
						return <path key={i} d={`M${-26 + Math.cos(a) * d},${-200 + Math.sin(a) * d} l0,-14 l4,10 l10,4 l-10,4 l-4,10 l-4,-10 l-10,-4 l10,-4 z`} fill="#fff4b0" opacity={glow} />;
					})
				: null}
		</g>
	);
};
/* a forearm lying across the frame (wrist to the right) with a wound state */
export type ArmState = 'clean' | 'cut' | 'stitched' | 'scar' | 'bandage' | 'lump';
export const ArmInset: React.FC<{state: ArmState; k?: number}> = ({state, k = 1}) => {
	const skin = '#f2c9a5';
	const ink = '#2a1a14';
	return (
		<g>
			{/* rolled-up white sleeve on the left */}
			<rect x={-430} y={-90} width={190} height={180} rx={40} fill="#eef2f8" stroke={ink} strokeWidth={8} />
			<path d="M-250,-90 q30,90 0,180" stroke="#c8ccd8" strokeWidth={10} fill="none" />
			{/* forearm */}
			<path d="M-250,-70 L330,-50 Q380,-48 380,0 Q380,48 330,50 L-250,70 Z" fill={skin} stroke={ink} strokeWidth={8} />
			{/* hand stub on the right */}
			<ellipse cx={400} cy={0} rx={60} ry={58} fill={skin} stroke={ink} strokeWidth={8} />
			{/* freckles */}
			{[[-120, -30], [-60, 30], [200, -20], [260, 24]].map(([x, y], i) => (
				<circle key={i} cx={x} cy={y} r={4} fill="#c07a50" />
			))}
			<g transform="translate(60,0)">
				{state === 'cut' ? <rect x={-50} y={-20} width={100} height={40} rx={14} fill="#f6a0a8" stroke={ink} strokeWidth={5} /> : null}
				{state === 'stitched' ? (
					<g>
						<line x1={-56} y1={0} x2={56} y2={0} stroke="#c06070" strokeWidth={8} strokeLinecap="round" />
						{[-40, -16, 8, 32].map((x) => (
							<line key={x} x1={x} y1={-18} x2={x + 10} y2={18} stroke="#2a2f4a" strokeWidth={5} strokeLinecap="round" />
						))}
					</g>
				) : null}
				{state === 'scar' ? <path d="M-56,0 q28,-6 56,0 q28,6 56,0" stroke="#e8a090" strokeWidth={10} fill="none" strokeLinecap="round" /> : null}
				{state === 'bandage' ? (
					<g>
						<rect x={-80} y={-46} width={160} height={92} rx={10} fill="#fbfaf2" stroke={ink} strokeWidth={6} />
						<rect x={-36} y={-26} width={72} height={52} rx={6} fill="#f0e8d8" />
					</g>
				) : null}
				{state === 'lump' ? <ellipse cx={0} cy={-6} rx={30 * k} ry={22 * k} fill="#f6b8a8" stroke={ink} strokeWidth={6} /> : null}
			</g>
		</g>
	);
};
/* a round close-up frame (insert) placed in a scene */
export const Insert: React.FC<{x: number; y: number; r: number; k: number; bg?: string; ring?: string; children: React.ReactNode; id: string}> = ({x, y, r, k, bg = '#11142c', ring = '#9fd8ff', children, id}) => (
	<g transform={`translate(${x},${y}) scale(${k})`} opacity={Math.min(1, k * 1.5)}>
		<defs>
			<clipPath id={id}>
				<circle r={r} />
			</clipPath>
		</defs>
		<circle r={r + 10} fill="#000" opacity={0.3} transform="translate(8,12)" />
		<circle r={r} fill={bg} />
		<g clipPath={`url(#${id})`}>{children}</g>
		<circle r={r} fill="none" stroke={ring} strokeWidth={10} />
	</g>
);
export const skinOf = (c: string) => lighten(c, 0);
export const shade = (c: string, k: number) => darken(c, k);

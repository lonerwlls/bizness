import React from 'react';
import {random} from 'remotion';
import {Svg} from '../engine/camera';
import {FONT, HAND} from '../kit/ui';
import {Floor, Wall} from './placesH';

/* Part C places — each scene its own background. */

/* living room at night: TV glow, lamp, sofa drawn by the scene */
export const LivingNight: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<Wall id="ln-w" top="#1d2246" bot="#2a2a58" />
		<rect x={-400} y={620} width={2800} height={280} fill="#232248" />
		{/* window with rain streaks */}
		<g transform="translate(300,140)">
			<rect x={-14} y={-14} width={348} height={318} fill="#3a3a6a" />
			<rect width={320} height={290} fill="#0b1030" />
			{Array.from({length: 14}).map((_, i) => {
				const x = random('rx' + i) * 320;
				const y = ((random('ry' + i) * 290 + f * 6) % 290);
				return <line key={i} x1={x} y1={y} x2={x - 4} y2={y + 26} stroke="#9fb0e0" strokeWidth={2} opacity={0.5} />;
			})}
			<line x1={160} y1={0} x2={160} y2={290} stroke="#3a3a6a" strokeWidth={10} />
		</g>
		{/* floor lamp */}
		<g transform="translate(1560,0)">
			<rect x={-6} y={300} width={12} height={600} fill="#2a2a34" />
			<path d="M-70,300 L70,300 L40,220 L-40,220 Z" fill="#e8c06a" />
			<polygon points="-70,300 70,300 200,900 -200,900" fill="#ffe0a0" opacity={0.08} />
		</g>
		{/* framed photos */}
		{[0, 1, 2].map((i) => (
			<rect key={i} x={820 + i * 140} y={200 + (i % 2) * 30} width={110} height={90} fill="#5a4a3a" stroke="#c9a06a" strokeWidth={6} />
		))}
		<Floor y={900} c="#2a2440" />
	</Svg>
);
/* a gym: mirrors, rubber floor, a pull-up bar */
export const Gym: React.FC = () => (
	<Svg>
		<Wall id="gy-w" top="#3a4a5a" bot="#4a5a6a" />
		{[0, 1, 2, 3].map((i) => (
			<g key={i}>
				<rect x={-200 + i * 560} y={120} width={520} height={500} fill="#9ab8c8" opacity={0.35} />
				<line x1={-140 + i * 560} y1={140} x2={-40 + i * 560} y2={600} stroke="#fff" strokeWidth={6} opacity={0.25} />
			</g>
		))}
		<rect x={-400} y={620} width={2800} height={20} fill="#e4473c" />
		<rect x={1500} y={100} width={360} height={16} rx={8} fill="#2a2a34" />
		<rect x={1500} y={100} width={14} height={520} fill="#2a2a34" />
		<rect x={1846} y={100} width={14} height={520} fill="#2a2a34" />
		<g transform="translate(300,300)">
			<rect x={-90} y={-50} width={180} height={100} rx={10} fill="#11142c" />
			<text y={14} textAnchor="middle" fontSize={40} fontFamily={FONT} fontWeight={900} fill="#ffd34a">
				NO PAIN
			</text>
		</g>
		<Floor y={900} c="#2a2a34" />
		{Array.from({length: 24}).map((_, i) => (
			<line key={i} x1={-400 + i * 120} y1={900} x2={-460 + i * 120} y2={1100} stroke="#3a3a44" strokeWidth={3} />
		))}
	</Svg>
);
/* bright clinic treatment room: big window with lawn, cabinets */
export const Clinic: React.FC = () => (
	<Svg>
		<Wall id="cl-w" top="#eaf4f6" bot="#d8eaee" />
		<g transform="translate(260,130)">
			<rect x={-14} y={-14} width={628} height={378} fill="#f4f8fa" />
			<rect width={600} height={350} fill="#bfe4f4" />
			<path d="M0,250 Q150,200 300,240 T600,230 V350 H0 Z" fill="#8ac06a" />
			{[80, 230, 480].map((x, i) => (
				<g key={i} transform={`translate(${x},240)`}>
					<rect x={-6} y={-20} width={12} height={40} fill="#6a4a2e" />
					<circle cy={-40} r={34} fill="#5aa04a" />
				</g>
			))}
			<line x1={300} y1={0} x2={300} y2={350} stroke="#f4f8fa" strokeWidth={10} />
		</g>
		<g transform="translate(1500,0)">
			<rect x={0} y={420} width={380} height={200} rx={8} fill="#cfe0e6" stroke="#9ab0b8" strokeWidth={4} />
			<line x1={190} y1={420} x2={190} y2={620} stroke="#9ab0b8" strokeWidth={4} />
			<rect x={150} y={500} width={12} height={40} rx={4} fill="#6a7a88" />
			<rect x={218} y={500} width={12} height={40} rx={4} fill="#6a7a88" />
			<rect x={40} y={180} width={300} height={180} rx={8} fill="#fbfaf4" stroke="#9ab0b8" strokeWidth={4} />
			<path d="M80,300 L140,240 L200,280 L260,210 L300,230" stroke="#3fae8f" strokeWidth={6} fill="none" />
		</g>
		<Floor y={900} c="#c8dce2" tiles />
	</Svg>
);
/* treatment recliner (side view, facing right), seat top at 812 */
export const Recliner: React.FC<{x: number}> = ({x}) => (
	<g transform={`translate(${x},0)`}>
		<path d="M-120,600 Q-140,620 -130,830 L-80,830 L-70,640 Q-80,600 -120,600 Z" fill="#3d6fd6" />
		<rect x={-110} y={808} width={230} height={40} rx={14} fill="#3d6fd6" />
		<rect x={-110} y={812} width={220} height={12} rx={6} fill="#5a8ae6" />
		<rect x={-14} y={848} width={28} height={52} fill="#6a7a88" />
		<rect x={-90} y={892} width={180} height={10} rx={4} fill="#4a5a68" />
	</g>
);
/* hotel room: patterned wallpaper, bed headboard, a framed print */
export const Hotel: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<Wall id="ht-w" top="#e8dcc8" bot="#d8c8b0" />
		{Array.from({length: 22}).map((_, i) =>
			Array.from({length: 7}).map((_, j) => <path key={i + '-' + j} d={`M${-300 + i * 110 + (j % 2) * 55},${40 + j * 90} l14,-22 l14,22 l-14,22 z`} fill="#c8b490" opacity={0.6} />),
		)}
		<rect x={-400} y={600} width={2800} height={300} fill="#b89a70" />
		<g transform="translate(1180,0)">
			<rect x={-280} y={460} width={560} height={200} rx={20} fill="#6a3a2a" />
			<rect x={-300} y={640} width={600} height={140} rx={16} fill="#f4f1e6" />
			<rect x={-300} y={700} width={600} height={80} rx={10} fill="#8a3a4a" />
			<rect x={-240} y={600} width={160} height={60} rx={24} fill="#fff" />
			<rect x={80} y={600} width={160} height={60} rx={24} fill="#fff" />
		</g>
		<g transform="translate(560,250)">
			<rect x={-110} y={-80} width={220} height={160} fill="#3a2a22" />
			<rect x={-96} y={-66} width={192} height={132} fill="#f2c88a" />
			<path d="M-96,40 Q-30,-20 20,30 T96,10 V66 H-96 Z" fill="#c0603a" />
		</g>
		<g transform="translate(320,560)">
			<rect x={-50} y={0} width={100} height={60} fill="#5a3a2a" />
			<rect x={-12} y={-80} width={24} height={80} fill="#c9a04a" />
			<path d="M-50,-80 L50,-80 L36,-140 L-36,-140 Z" fill="#f4e6c0" />
			<circle cx={0} cy={-110} r={60} fill="#ffe0a0" opacity={0.12 + 0.02 * Math.sin(f / 9)} />
		</g>
		<Floor y={900} c="#8a6a4a" />
	</Svg>
);
/* front hallway: the door with a mail slot, coat hooks, a rug */
export const Hallway2: React.FC = () => (
	<Svg>
		<Wall id="hw2-w" top="#c8d8b8" bot="#b8cca8" />
		<rect x={-400} y={560} width={2800} height={340} fill="#9ab088" />
		<rect x={-400} y={556} width={2800} height={10} fill="#7a9068" />
		<g transform="translate(1320,0)">
			<rect x={-170} y={250} width={340} height={650} fill="#8a4a2e" />
			<rect x={-150} y={270} width={300} height={290} fill="#7a3e24" />
			<rect x={-150} y={580} width={300} height={300} fill="#7a3e24" />
			<rect x={-70} y={600} width={140} height={22} rx={4} fill="#c9a04a" />
			<circle cx={120} cy={580} r={14} fill="#c9a04a" />
		</g>
		{[0, 1, 2].map((i) => (
			<g key={i} transform={`translate(${420 + i * 110},360)`}>
				<rect x={-6} y={-10} width={12} height={30} fill="#5a3a2a" />
			</g>
		))}
		<path d="M380,370 Q420,500 470,370 Z" fill="#d23b3b" opacity={0.85} />
		<Floor y={900} c="#a8805a" />
		<ellipse cx={1100} cy={930} rx={420} ry={40} fill="#c0503a" opacity={0.8} />
	</Svg>
);
/* living room by day: big window, plants, a bookshelf */
export const LivingDay: React.FC = () => (
	<Svg>
		<Wall id="ld-w" top="#f2e6d0" bot="#e8d8bc" />
		<g transform="translate(860,120)">
			<rect x={-14} y={-14} width={548} height={398} fill="#fbfaf4" />
			<rect width={520} height={370} fill="#9fd0f0" />
			<circle cx={420} cy={80} r={42} fill="#fff4c0" />
			<path d="M0,300 Q120,250 260,290 T520,280 V370 H0 Z" fill="#8ac06a" />
			<line x1={260} y1={0} x2={260} y2={370} stroke="#fbfaf4" strokeWidth={10} />
		</g>
		<rect x={-400} y={620} width={2800} height={280} fill="#d8c09a" />
		<g transform="translate(1600,620)">
			<rect x={-40} y={-60} width={80} height={60} rx={8} fill="#c0603a" />
			<circle cy={-110} r={60} fill="#3a8a4a" />
			<circle cx={-40} cy={-150} r={40} fill="#4a9a5a" />
		</g>
		<Floor y={900} c="#b89a70" />
	</Svg>
);
/* the wall he stands on his head against (plain painted wall with a skirting board) */
/* farmhouse porch, sepia */
export const Porch: React.FC = () => (
	<Svg>
		<Wall id="po-sky" top="#9fc2e0" bot="#f2e2b8" />
		<path d="M-400,700 Q300,640 900,690 T2400,670 V1000 H-400 Z" fill="#a8b86a" />
		<g transform="translate(1300,0)">
			<rect x={-500} y={260} width={1100} height={460} fill="#d8c8a0" />
			{Array.from({length: 14}).map((_, i) => (
				<line key={i} x1={-500} y1={290 + i * 32} x2={600} y2={290 + i * 32} stroke="#b8a880" strokeWidth={4} />
			))}
			<path d="M-560,270 L60,120 L660,270 Z" fill="#8a6a4a" />
			<rect x={-120} y={420} width={160} height={300} fill="#6a4a2a" />
			<rect x={160} y={400} width={160} height={140} fill="#e8f0f4" stroke="#6a4a2a" strokeWidth={10} />
			<rect x={-540} y={700} width={1180} height={30} fill="#7a5a3a" />
			{[-520, -200, 300, 600].map((x) => (
				<rect key={x} x={x} y={300} width={22} height={400} fill="#f4ecd8" />
			))}
		</g>
		<rect x={-400} y={740} width={2800} height={400} fill="#c8a868" />
		<Floor y={900} c="#b89858" />
	</Svg>
);
/* research lab: whiteboard, shelves of glassware */
export const Lab: React.FC = () => (
	<Svg>
		<Wall id="lb-w" top="#e6ecf2" bot="#d4dee8" />
		<g transform="translate(700,120)">
			<rect x={0} y={0} width={620} height={360} rx={10} fill="#fbfdff" stroke="#9aa8b8" strokeWidth={8} />
			<text x={40} y={70} fontSize={48} fontFamily={HAND} fontWeight={700} fill="#1d3a8a">
				Hiccup straw — test
			</text>
			<text x={40} y={140} fontSize={40} fontFamily={HAND} fontWeight={700} fill="#d23b3b">
				249 volunteers
			</text>
			<path d="M40,300 L140,240 L240,260 L340,180 L440,200 L560,120" stroke="#3fae8f" strokeWidth={6} fill="none" />
		</g>
		<g transform="translate(1500,0)">
			<rect x={0} y={200} width={360} height={14} fill="#8a9aa8" />
			<rect x={0} y={360} width={360} height={14} fill="#8a9aa8" />
			{[30, 110, 190, 270].map((x, i) => (
				<g key={i}>
					<path d={`M${x},${200} l10,-60 h20 l10,60 z`} fill={['#9fd8ff', '#9ff0b0', '#ffd34a', '#ff9ab0'][i]} opacity={0.8} />
					<rect x={x + 6} y={300} width={28} height={60} rx={6} fill={['#ff9ab0', '#9fd8ff', '#9ff0b0', '#ffd34a'][i]} opacity={0.8} />
				</g>
			))}
		</g>
		<rect x={-400} y={640} width={2800} height={16} fill="#2a3a4a" />
		<rect x={-400} y={656} width={2800} height={244} fill="#cfd8e2" />
		<Floor y={900} c="#9aa8b8" tiles />
	</Svg>
);

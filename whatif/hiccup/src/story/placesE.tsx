import React from 'react';
import {random} from 'remotion';
import {Svg} from '../engine/camera';
import {FONT, HAND} from '../kit/ui';
import {Floor, Wall} from './placesH';

/* Part E places — each scene its own background. */

/* an old man's bedroom in the morning: floral wallpaper, curtains with sun, the wedding photo */
export const OldBedroom: React.FC<{f: number; warm?: number}> = ({f, warm = 0}) => (
	<Svg>
		<Wall id="ob-w" top="#e8dcc8" bot="#dccab0" />
		{Array.from({length: 22}).map((_, i) =>
			Array.from({length: 7}).map((_, j) => <circle key={i + '-' + j} cx={-300 + i * 110 + (j % 2) * 55} cy={30 + j * 90} r={8} fill="#c8a8a0" opacity={0.5} />),
		)}
		<rect x={-400} y={640} width={2800} height={260} fill="#c8b490" />
		<g transform="translate(1520,120)">
			<rect x={-14} y={-14} width={328} height={378} fill="#f4ece0" />
			<rect width={300} height={350} fill="#ffe0a8" />
			<circle cx={210} cy={90} r={40} fill="#fff4c8" />
			<line x1={150} y1={0} x2={150} y2={350} stroke="#f4ece0" strokeWidth={10} />
			<path d="M-60,-30 h110 q-20,200 10,420 h-120 z" fill="#c0603a" />
			<path d="M360,-30 h-110 q20,200 -10,420 h120 z" fill="#c0603a" />
			<polygon points="0,350 300,350 120,800 -380,800" fill="#fff4c8" opacity={0.12 + 0.08 * warm} />
		</g>
		{/* wedding photo */}
		<g transform="translate(1080,250) rotate(-2)">
			<rect x={-90} y={-70} width={180} height={140} fill="#7a5a3a" />
			<rect x={-78} y={-58} width={156} height={116} fill="#cfe6f0" />
			<path d="M-46,58 L-30,-6 L-14,58 Z" fill="#1d1d24" />
			<circle cx={-30} cy={-18} r={13} fill="#f2d0b5" />
			<path d="M-36,-30 l6,-10 l6,8 l6,-10 l4,10" stroke="#e4602c" strokeWidth={5} fill="none" />
			<path d="M14,58 L30,-6 L46,58 Z" fill="#fbf8f4" />
			<circle cx={30} cy={-18} r={13} fill="#f2d0b5" />
			<path d="M17,-20 Q30,-40 43,-20" stroke="#3a2418" strokeWidth={8} fill="none" />
		</g>
		<Floor y={900} c="#8a6a4a" />
	</Svg>
);
/* low bed, head on the LEFT, mattress top at y = 820 */
export const OldBed: React.FC<{x: number; w?: number}> = ({x, w = 600}) => (
	<g transform={`translate(${x},0)`}>
		<rect x={-w / 2 - 20} y={600} width={40} height={300} rx={14} fill="#6a4a2e" />
		<rect x={w / 2 - 20} y={740} width={30} height={160} rx={10} fill="#6a4a2e" />
		<rect x={-w / 2} y={830} width={w} height={40} fill="#7a5a3a" />
		<rect x={-w / 2} y={790} width={w} height={44} rx={16} fill="#f4f1e6" />
		<path d={`M${-w / 2 + 10},790 Q${-w / 2 + 70},740 ${-w / 2 + 140},780 L${-w / 2 + 130},800 L${-w / 2 + 10},800 Z`} fill="#ffffff" />
	</g>
);
export const OldBlanket: React.FC<{x: number; w?: number}> = ({x, w = 600}) => (
	<g transform={`translate(${x},0)`}>
		<path d={`M${-w / 2 + 150},806 Q${-w / 2 + 200},776 ${-w / 2 + 280},782 L${w / 2},786 L${w / 2 + 6},850 L${-w / 2 + 150},850 Z`} fill="#c06a5a" />
		{[0, 1, 2, 3].map((i) => (
			<line key={i} x1={-w / 2 + 220 + i * 90} y1={790} x2={-w / 2 + 220 + i * 90} y2={850} stroke="#a85a4a" strokeWidth={4} />
		))}
	</g>
);
/* old kitchen: checkered tiles, a stove, an old radio */
export const OldKitchen: React.FC = () => (
	<Svg>
		<Wall id="ok-w" top="#d8e8d0" bot="#c8dcc0" />
		{Array.from({length: 26}).map((_, i) =>
			Array.from({length: 4}).map((_, j) => <rect key={i + '-' + j} x={-300 + i * 90} y={420 + j * 60} width={88} height={58} fill={(i + j) % 2 ? '#f4f6f0' : '#c8d8c8'} />),
		)}
		<g transform="translate(1560,0)">
			<rect x={-140} y={560} width={280} height={340} rx={10} fill="#e8e4d8" stroke="#9a9888" strokeWidth={6} />
			<rect x={-110} y={640} width={220} height={180} rx={8} fill="#2a2a34" />
			{[-80, -20, 40, 100].map((x) => (
				<circle key={x} cx={x} cy={600} r={12} fill="#6a6a78" />
			))}
		</g>
		<g transform="translate(360,380)">
			<rect x={-90} y={-60} width={180} height={120} rx={20} fill="#8a5a3a" />
			<circle cx={-40} cy={0} r={34} fill="#c8a878" />
			<rect x={20} y={-30} width={50} height={60} rx={6} fill="#f4e6c0" />
		</g>
		<rect x={-400} y={660} width={2800} height={240} fill="#b8c8a8" />
		<Floor y={900} c="#9a8a6a" />
	</Svg>
);
/* a modern consult room: glass wall, plant, a screen with a hiccup trace gone flat */
export const Consult: React.FC = () => (
	<Svg>
		<Wall id="cs-w" top="#f2f6fa" bot="#e2eaf2" />
		{[0, 1, 2].map((i) => (
			<rect key={i} x={140 + i * 300} y={120} width={280} height={520} fill="#bfe0f0" opacity={0.6} stroke="#9ab8c8" strokeWidth={4} />
		))}
		<g transform="translate(1500,220)">
			<rect x={-170} y={-100} width={340} height={200} rx={12} fill="#1b2230" />
			<rect x={-156} y={-86} width={312} height={172} fill="#071a14" />
			<path d="M-140,0 L-60,0 L-50,-40 L-40,30 L-30,0 L140,0" stroke="#4cff9a" strokeWidth={4} fill="none" />
			<text x={100} y={-50} fontSize={26} fontFamily={FONT} fontWeight={900} fill="#4cff9a">
				0/min
			</text>
		</g>
		<g transform="translate(1760,620)">
			<rect x={-40} y={0} width={80} height={80} rx={8} fill="#c0603a" />
			<path d="M0,0 Q-60,-120 -20,-200 M0,0 Q60,-140 30,-220 M0,0 Q0,-160 0,-240" stroke="#3a8a4a" strokeWidth={16} fill="none" />
		</g>
		<rect x={-400} y={640} width={2800} height={260} fill="#d8e2ea" />
		<Floor y={900} c="#b8c4d0" />
	</Svg>
);
/* the old living room at night: fireplace gone cold, a grandfather clock, one lamp */
export const OldLiving: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<Wall id="ol-w" top="#1a1830" bot="#26223e" />
		<g transform="translate(1300,0)">
			<rect x={-220} y={420} width={440} height={480} fill="#4a3a3a" />
			<rect x={-150} y={560} width={300} height={340} fill="#120e18" />
			<rect x={-240} y={400} width={480} height={30} fill="#5a4a4a" />
		</g>
		<g transform="translate(500,0)">
			<rect x={-70} y={200} width={140} height={700} rx={10} fill="#4a2e22" />
			<circle cx={0} cy={300} r={52} fill="#e8dcc0" />
			<line x1={0} y1={300} x2={0} y2={262} stroke="#1b1a26" strokeWidth={6} />
			<line x1={0} y1={300} x2={24} y2={310} stroke="#1b1a26" strokeWidth={6} />
			<rect x={-40} y={420} width={80} height={300} fill="#2a1a12" />
			<line x1={0} y1={430} x2={0} y2={640} stroke="#c9a04a" strokeWidth={4} />
			<circle cx={0} cy={650} r={16} fill="#c9a04a" />
		</g>
		<polygon points="880,520 1000,520 1180,900 700,900" fill="#ffd27a" opacity={0.06 + 0.01 * Math.sin(f / 9)} />
		<Floor y={900} c="#1d1a28" />
	</Svg>
);
export const Armchair2: React.FC<{x: number}> = ({x}) => (
	<g transform={`translate(${x},0)`}>
		<rect x={-110} y={640} width={60} height={200} rx={24} fill="#5a3a5a" />
		<rect x={-110} y={800} width={230} height={70} rx={22} fill="#6a4a6a" />
		<rect x={-100} y={812} width={210} height={20} rx={10} fill="#7a5a7a" />
		<rect x={-100} y={866} width={14} height={34} fill="#1b1a26" />
		<rect x={96} y={866} width={14} height={34} fill="#1b1a26" />
	</g>
);
/* farm at sunset (sepia applied by the scene) */
export const FarmSunset: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<Wall id="fs-sky" top="#e8a060" bot="#f8e0a0" />
		<circle cx={1300} cy={600} r={120} fill="#fff0b0" />
		<path d="M-400,660 Q300,600 900,650 T2400,640 V1000 H-400 Z" fill="#a89048" />
		{Array.from({length: 20}).map((_, i) => (
			<rect key={i} x={-300 + i * 130} y={680} width={12} height={110} fill="#5a4028" />
		))}
		<rect x={-400} y={700} width={2800} height={10} fill="#5a4028" />
		<rect x={-400} y={740} width={2800} height={10} fill="#5a4028" />
		{Array.from({length: 6}).map((_, i) => (
			<path key={i} d={`M${200 + i * 300 + ((f * 0.4) % 300)},${200 + (i % 3) * 40} q10,-8 20,0 q10,-8 20,0`} stroke="#5a4028" strokeWidth={3} fill="none" />
		))}
		<rect x={-400} y={760} width={2800} height={400} fill="#c8a058" />
		<Floor y={900} c="#b89048" />
	</Svg>
);
/* teenager's room at night: posters, a desk lamp, a glowing screen */
export const TeenRoom: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<Wall id="tr-w" top="#141a3a" bot="#1e2450" />
		{[0, 1, 2].map((i) => (
			<g key={i} transform={`translate(${300 + i * 260},${220 + (i % 2) * 30}) rotate(${i % 2 ? 3 : -4})`}>
				<rect x={-90} y={-120} width={180} height={240} fill={['#5a2f6a', '#2a5a7a', '#7a3a2a'][i]} />
				<circle cy={-20} r={40} fill="#ffd34a" opacity={0.6} />
			</g>
		))}
		<g transform="translate(1500,600)">
			<rect x={-220} y={0} width={440} height={20} fill="#3a3050" />
			<rect x={-90} y={-170} width={200} height={140} rx={8} fill="#11142c" />
			<rect x={-80} y={-160} width={180} height={120} fill="#3d6fd6" opacity={0.6 + 0.2 * Math.sin(f / 5)} />
			<polygon points="-80,-40 100,-40 300,300 -280,300" fill="#9fd8ff" opacity={0.06} />
		</g>
		{Array.from({length: 30}).map((_, i) => (
			<circle key={i} cx={random('ts' + i) * 1920} cy={random('ty' + i) * 140} r={2} fill="#fff" opacity={0.15} />
		))}
		<Floor y={900} c="#1a1830" />
	</Svg>
);
export const PhotoCard: React.FC<{x: number; y: number; rot?: number; caption: string; k: number}> = ({x, y, rot = -3, caption, k}) => (
	<g transform={`translate(${x},${y}) rotate(${rot}) scale(${k})`}>
		<rect x={-170} y={-210} width={340} height={420} fill="#efe4c8" stroke="#8a6a44" strokeWidth={8} />
		<rect x={-140} y={-180} width={280} height={300} fill="#cbb48a" />
		<circle cy={-60} r={60} fill="#e8c8a0" stroke="#3a2a1a" strokeWidth={6} />
		<path d="M-56,-100 Q0,-140 56,-100 L66,-80 L-66,-80 Z" fill="#5a4a3a" />
		<path d="M-22,-46 q11,-6 22,-2 q12,-4 22,2 q-11,6 -22,3 q-12,3 -22,-3 z" fill="#9a8a7a" />
		<path d="M-90,120 Q-90,20 0,10 Q90,20 90,120 Z" fill="#8a6a4a" />
		<text y={175} textAnchor="middle" fontSize={34} fontFamily={HAND} fontWeight={700} fill="#2a1a0e">
			{caption}
		</text>
	</g>
);

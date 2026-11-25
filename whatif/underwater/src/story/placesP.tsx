import React from 'react';
import {random} from 'remotion';
import {Svg} from '../engine/camera';
import {darken, lighten} from '../engine/color';
import {Pose, frontHand} from '../engine/Stickman';
import {FONT, HAND} from '../kit/ui';

/* Places and props for "What if every hour on your phone aged you one day?".
   One night palette: navy outside, warm amber inside, cold blue phone light on faces. */

const Wall: React.FC<{id: string; top: string; bot: string}> = ({id, top, bot}) => (
	<>
		<defs>
			<linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor={top} />
				<stop offset="1" stopColor={bot} />
			</linearGradient>
		</defs>
		<rect x={-400} y={-300} width={2800} height={1300} fill={`url(#${id})`} />
	</>
);
const Floor: React.FC<{y: number; c: string; planks?: boolean}> = ({y, c, planks}) => (
	<g>
		<rect x={-400} y={y} width={2800} height={600} fill={c} />
		<rect x={-400} y={y} width={2800} height={10} fill={darken(c, 0.3)} />
		{planks ? Array.from({length: 7}).map((_, i) => <line key={i} x1={-400} y1={y + 22 + i * i * 10} x2={2400} y2={y + 22 + i * i * 10} stroke={darken(c, 0.14)} strokeWidth={2} />) : null}
	</g>
);
const Glow: React.FC<{x: number; y: number; r: number; c?: string; o?: number}> = ({x, y, r, c = '#ffcf7a', o = 0.16}) => (
	<circle cx={x} cy={y} r={r} fill={c} opacity={o} style={{filter: `blur(${r / 5}px)`}} />
);

/* cold blue light from a phone in the front hand: lights the face from below */
export const PhoneLight: React.FC<{pose: Pose; x: number; floor: number; s?: number; facing?: 1 | -1; on?: number}> = ({pose, x, floor, s = 1, facing = 1, on = 1}) => {
	const [hx, hy] = frontHand(pose, x, floor - 157 * s, s, facing);
	if (on <= 0) return null;
	return (
		<g style={{mixBlendMode: 'screen'}} opacity={on}>
			<circle cx={hx} cy={hy - 40} r={150 * s} fill="#7cc4ff" opacity={0.22} style={{filter: 'blur(26px)'}} />
			<circle cx={hx} cy={hy - 10} r={50 * s} fill="#bfe3ff" opacity={0.35} style={{filter: 'blur(10px)'}} />
		</g>
	);
};

/* ------------------------------- school gate ------------------------------- */
// early winter morning: brick school with lit windows, iron gate, guard booth on the right
export const SchoolGate: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<Wall id="sg-sky" top="#141c44" bot="#3a4380" />
		<circle cx={300} cy={140} r={60} fill="#ffd9a0" opacity={0.25} style={{filter: 'blur(30px)'}} />
		{/* school building */}
		<rect x={-200} y={240} width={2300} height={560} fill="#5a2f36" />
		<rect x={-200} y={230} width={2300} height={24} fill="#3a1f26" />
		{Array.from({length: 13}).map((_, c) =>
			[0, 1].map((r) => (
				<g key={`${c}-${r}`}>
					<rect x={-150 + c * 180} y={300 + r * 200} width={110} height={130} rx={6} fill={random('sw' + c + r) > 0.35 ? '#ffd27a' : '#2a1f3a'} opacity={0.85} />
					<line x1={-95 + c * 180} y1={300 + r * 200} x2={-95 + c * 180} y2={430 + r * 200} stroke="#3a1f26" strokeWidth={6} />
				</g>
			)),
		)}
		<rect x={760} y={170} width={400} height={80} rx={10} fill="#e9e2cf" />
		<text x={960} y={225} textAnchor="middle" fontSize={44} fontFamily={FONT} fontWeight={900} fill="#5a2f36">
			WESTLAKE HIGH
		</text>
		{/* fence + gate */}
		{Array.from({length: 44}).map((_, i) => (
			<rect key={i} x={-200 + i * 56} y={640} width={8} height={260} fill="#1b1a26" />
		))}
		<rect x={-200} y={660} width={2400} height={10} fill="#1b1a26" />
		<rect x={-200} y={780} width={2400} height={10} fill="#1b1a26" />
		{/* guard booth */}
		<g transform="translate(1500,0)">
			<rect x={0} y={560} width={260} height={340} fill="#2a3a5a" />
			<rect x={-12} y={540} width={284} height={30} rx={6} fill="#1d2a44" />
			<rect x={30} y={600} width={200} height={130} rx={8} fill="#ffe3a0" opacity={0.85} />
			<text x={130} y={790} textAnchor="middle" fontSize={30} fontFamily={FONT} fontWeight={900} fill="#9fd8ff">
				SECURITY
			</text>
			<Glow x={130} y={660} r={200} o={0.18} />
		</g>
		<Floor y={900} c="#3a3f5a" />
		{/* frost breath / light snow */}
		{Array.from({length: 30}).map((_, i) => (
			<circle key={i} cx={(random('sn' + i) * 2200 + f * 0.6) % 2200 - 100} cy={(random('sy' + i) * 900 + f * (1 + random('ss' + i))) % 900} r={2 + random('sr' + i) * 2} fill="#fff" opacity={0.5} />
		))}
	</Svg>
);

/* ------------------------------- cinema booth ------------------------------- */
export const Cinema: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<Wall id="cn-w" top="#2a1030" bot="#3a1a40" />
		{/* marquee with chasing bulbs */}
		<rect x={300} y={80} width={1320} height={200} rx={16} fill="#11142c" />
		{Array.from({length: 40}).map((_, i) => {
			const x = 320 + (i % 20) * 66;
			const y = i < 20 ? 96 : 264;
			return <circle key={i} cx={x} cy={y} r={7} fill="#ffd34a" opacity={(i + Math.floor(f / 4)) % 3 === 0 ? 1 : 0.3} />;
		})}
		<text x={960} y={210} textAnchor="middle" fontSize={84} fontFamily={FONT} fontWeight={900} fill="#ff4f8b">
			NOW SHOWING
		</text>
		<Glow x={960} y={180} r={500} c="#ff4f8b" o={0.12} />
		{/* posters */}
		{[0, 1, 2].map((i) => (
			<g key={i} transform={`translate(${380 + i * 460},340)`}>
				<rect width={300} height={420} rx={8} fill="#11142c" stroke="#ffd34a" strokeWidth={6} />
				<rect x={20} y={20} width={260} height={300} fill={['#3d6fd6', '#d23b3b', '#3aa37a'][i]} opacity={0.7} />
				<text x={150} y={380} textAnchor="middle" fontSize={34} fontFamily={FONT} fontWeight={900} fill="#fff">
					{['SPACE 3', 'R-RATED', 'ZOMBIES'][i]}
				</text>
			</g>
		))}
		<Floor y={900} c="#2a1a30" />
	</Svg>
);

/* --------------------------- grandma's countryside --------------------------- */
// dusk garden: hills, a fence, vegetable beds, the cottage with a lit window
export const Garden: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<Wall id="gd-sky" top="#2a2f6a" bot="#e48a6a" />
		<circle cx={1500} cy={560} r={90} fill="#ffcf7a" opacity={0.9} />
		<Glow x={1500} y={560} r={400} c="#ffb070" o={0.25} />
		<path d="M-400,640 Q200,480 800,620 T2400,600 L2400,1000 L-400,1000 Z" fill="#3a4a6a" />
		<path d="M-400,720 Q400,600 1100,720 T2400,700 L2400,1000 L-400,1000 Z" fill="#2f4a4a" />
		{/* cottage */}
		<g transform="translate(120,0)">
			<rect x={0} y={520} width={420} height={380} fill="#e9d9b8" />
			<path d="M-30,530 L210,360 L450,530 Z" fill="#7a3f22" />
			<rect x={60} y={620} width={110} height={110} rx={6} fill="#ffd27a" />
			<Glow x={115} y={675} r={160} o={0.3} />
			<rect x={260} y={680} width={100} height={220} rx={6} fill="#5a3a22" />
			<rect x={300} y={380} width={40} height={90} fill="#5a3a22" />
			{[0, 1, 2].map((i) => (
				<circle key={i} cx={320 + Math.sin((f + i * 30) / 20) * 10} cy={360 - ((f * 0.8 + i * 40) % 120)} r={14 + i * 4} fill="#c9ccd6" opacity={0.3} />
			))}
		</g>
		{/* fence */}
		{Array.from({length: 22}).map((_, i) => (
			<rect key={i} x={640 + i * 80} y={760} width={14} height={140} rx={4} fill="#c9a87a" />
		))}
		<rect x={640} y={790} width={1760} height={10} fill="#c9a87a" />
		<rect x={640} y={840} width={1760} height={10} fill="#c9a87a" />
		{/* vegetable beds */}
		{[0, 1, 2].map((r) => (
			<g key={r}>
				<rect x={-400} y={900 + r * 40} width={2800} height={20} fill="#4a3424" />
				{Array.from({length: 28}).map((_, i) => (
					<ellipse key={i} cx={-380 + i * 100 + r * 30} cy={902 + r * 40} rx={18} ry={10 + Math.sin((f + i * 10) / 15) * 1.5} fill="#5ab04a" />
				))}
			</g>
		))}
		<rect x={-400} y={900} width={2800} height={6} fill="#2a1f14" />
	</Svg>
);

/* cottage inside at night: stone fireplace with a living fire, rug, chess table */
export const Cottage: React.FC<{f: number; fire?: number}> = ({f, fire = 1}) => (
	<Svg>
		<Wall id="ct-w" top="#3a2a2e" bot="#5a3d36" />
		{Array.from({length: 12}).map((_, i) => (
			<rect key={i} x={-400 + i * 240} y={-300} width={8} height={1200} fill="#2a1f22" opacity={0.5} />
		))}
		{/* fireplace */}
		<g transform="translate(1240,0)">
			<rect x={0} y={420} width={520} height={480} fill="#6a5a5a" />
			{Array.from({length: 24}).map((_, i) => (
				<rect key={i} x={(i % 6) * 86 + (Math.floor(i / 6) % 2) * 40} y={430 + Math.floor(i / 6) * 60} width={80} height={52} rx={6} fill="#7a6a6a" opacity={0.7} />
			))}
			<rect x={-20} y={400} width={560} height={30} rx={6} fill="#4a3424" />
			<rect x={110} y={640} width={300} height={260} rx={20} fill="#1b1416" />
			{Array.from({length: 7}).map((_, i) => {
				const h = (60 + 50 * Math.abs(Math.sin(f / 4 + i * 1.7))) * fire;
				return <path key={i} d={`M${150 + i * 34},880 Q${160 + i * 34 + Math.sin(f / 3 + i) * 10},${880 - h} ${170 + i * 34},880 Z`} fill={i % 2 ? '#ffb547' : '#e4602c'} />;
			})}
			<rect x={140} y={870} width={240} height={16} rx={6} fill="#5a3a22" />
			<circle cx={260} cy={800} r={260} fill="#ff9a4a" opacity={(0.18 + 0.05 * Math.sin(f / 3)) * fire} style={{filter: 'blur(50px)'}} />
		</g>
		{/* bookshelf + clock */}
		<rect x={80} y={300} width={360} height={600} fill="#4a3424" />
		{[0, 1, 2, 3].map((r) =>
			Array.from({length: 9}).map((_, i) => <rect key={`${r}${i}`} x={96 + i * 38} y={330 + r * 140} width={30} height={100} rx={3} fill={['#d23b3b', '#3d6fd6', '#3aa37a', '#e9d9b8', '#7a5cc4'][(i + r) % 5]} opacity={0.85} />),
		)}
		<Floor y={900} c="#5a3a2a" planks />
		<ellipse cx={960} cy={940} rx={520} ry={40} fill="#7a3f52" opacity={0.85} />
	</Svg>
);
/* chess table with a board (on the actors' layer) */
export const ChessTable: React.FC<{x: number; f: number}> = ({x, f}) => (
	<g>
		<rect x={x - 130} y={760} width={260} height={16} rx={6} fill="#7a4e34" />
		<rect x={x - 10} y={776} width={20} height={126} fill="#5a3a22" />
		<rect x={x - 60} y={900} width={120} height={8} rx={4} fill="#5a3a22" />
		<g transform={`translate(${x - 70},732)`}>
			{Array.from({length: 16}).map((_, i) => (
				<rect key={i} x={(i % 8) * 17.5} y={Math.floor(i / 8) * 14} width={17.5} height={14} fill={(i + Math.floor(i / 8)) % 2 ? '#e9d9b8' : '#3a2a22'} />
			))}
			{[10, 40, 90, 120].map((px, i) => (
				<path key={i} d={`M${px - 6},28 L${px + 6},28 L${px + 3},${10 + (i % 2) * 4} L${px - 3},${10 + (i % 2) * 4} Z`} fill={i % 2 ? '#f4efe2' : '#1b1a26'} />
			))}
		</g>
	</g>
);

/* a 1972 living room on an old film: patterned wallpaper, a big wooden TV */
export const Room72: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<Wall id="r72" top="#7a5a2a" bot="#5a4020" />
		{Array.from({length: 10}).map((_, r) =>
			Array.from({length: 16}).map((_, c) => <circle key={`${r}-${c}`} cx={-300 + c * 170 + (r % 2) * 85} cy={-200 + r * 120} r={34} fill="none" stroke="#e48a3a" strokeWidth={10} opacity={0.35} />),
		)}
		<g transform="translate(1180,520)">
			<rect x={-230} y={-200} width={460} height={380} rx={30} fill="#6a3a1a" />
			<rect x={-190} y={-160} width={300} height={240} rx={40} fill="#9fb8a8" />
			<rect x={-190} y={-160} width={300} height={240} rx={40} fill="#ffffff" opacity={0.15 + 0.1 * Math.sin(f / 2)} />
			{Array.from({length: 12}).map((_, i) => (
				<line key={i} x1={-180} y1={-150 + ((i * 20 + f * 3) % 230)} x2={100} y2={-150 + ((i * 20 + f * 3) % 230)} stroke="#fff" strokeWidth={2} opacity={0.15} />
			))}
			<circle cx={160} cy={-110} r={18} fill="#c9a87a" />
			<circle cx={160} cy={-50} r={18} fill="#c9a87a" />
			<rect x={-180} y={180} width={20} height={70} fill="#4a2a10" />
			<rect x={160} y={180} width={20} height={70} fill="#4a2a10" />
			<circle cx={-40} cy={-40} r={260} fill="#bfe3ff" opacity={0.12} style={{filter: 'blur(40px)'}} />
		</g>
		<Floor y={900} c="#5a3a1a" />
	</Svg>
);

/* ------------------------------- the snowy ridge ------------------------------- */
// night storm on the mountain: dark pines, a trail sign, the creek, snow blowing sideways
export const Ridge: React.FC<{f: number; storm?: number; pine?: boolean; creek?: boolean; ledge?: boolean}> = ({f, storm = 1, pine, creek, ledge}) => (
	<Svg>
		<Wall id="rg-sky" top="#0b0e22" bot="#2a3466" />
		<path d="M-400,560 L0,320 L300,520 L700,260 L1100,540 L1500,300 L1900,520 L2400,360 L2400,1000 L-400,1000 Z" fill="#1d2552" />
		<path d="M0,320 L80,370 L-40,380 Z M700,260 L790,320 L640,330 Z M1500,300 L1590,360 L1440,370 Z" fill="#e9f0ff" opacity={0.7} />
		{Array.from({length: 18}).map((_, i) => {
			const x = -300 + i * 150 + (i % 3) * 30;
			const h = 260 + (i % 4) * 60;
			return <path key={i} d={`M${x},900 L${x + 50},${900 - h} L${x + 100},900 Z`} fill={i % 2 ? '#141a38' : '#18204a'} />;
		})}
		{pine ? (
			<g transform="translate(1320,0)">
				<rect x={-10} y={520} width={20} height={380} fill="#3a2a22" />
				<path d="M0,520 L60,440 L20,460" stroke="#3a2a22" strokeWidth={14} fill="none" />
				<path d="M-70,640 L0,500 L50,600 Z" fill="#1d3a2a" />
			</g>
		) : null}
		{creek ? (
			<g>
				<path d="M-400,930 Q400,900 900,940 T2400,920 L2400,980 L-400,990 Z" fill="#3a5a8a" />
				<path d="M-400,940 Q400,910 900,950 T2400,930" stroke="#9fd8ff" strokeWidth={3} fill="none" opacity={0.6} />
			</g>
		) : null}
		{ledge ? (
			<g>
				<path d="M1100,560 L1700,520 L1820,600 L1760,640 L1120,640 Z" fill="#4a4a5a" />
				<path d="M1120,640 L1760,640 L1800,900 L1080,900 Z" fill="#1b1a26" opacity={0.85} />
				<path d="M1100,560 L1700,520 L1820,600" stroke="#e9f0ff" strokeWidth={14} fill="none" strokeLinecap="round" />
			</g>
		) : null}
		<rect x={-400} y={900} width={2800} height={300} fill="#c9d4ea" />
		<rect x={-400} y={900} width={2800} height={8} fill="#9fb0d0" />
		{/* trail sign */}
		<g transform="translate(260,0)">
			<rect x={-6} y={700} width={12} height={200} fill="#5a3a22" />
			<rect x={-90} y={700} width={180} height={50} rx={6} fill="#7a4e34" />
			<text y={735} textAnchor="middle" fontSize={26} fontFamily={FONT} fontWeight={900} fill="#f4efe2">
				RIDGE TRAIL
			</text>
		</g>
		{/* blowing snow */}
		{Array.from({length: 140}).map((_, i) => {
			const sp = 6 + random('rs' + i) * 10;
			const x = ((random('rx' + i) * 2600 - f * sp * storm) % 2600 + 2600) % 2600 - 300;
			const y = ((random('ry' + i) * 1200 + f * (2 + random('rv' + i) * 3)) % 1200) - 100;
			return <line key={i} x1={x} y1={y} x2={x + 16 * storm} y2={y - 3} stroke="#fff" strokeWidth={2 + random('rw' + i) * 2} opacity={0.35 + 0.4 * random('ro' + i)} strokeLinecap="round" />;
		})}
	</Svg>
);
/* flashlight beam from a hand point toward a direction */
export const Beam: React.FC<{x: number; y: number; ang: number; len?: number}> = ({x, y, ang, len = 900}) => (
	<g transform={`translate(${x},${y}) rotate(${ang})`} style={{mixBlendMode: 'screen'}}>
		<defs>
			<linearGradient id="beamG" x1="0" y1="0" x2="1" y2="0">
				<stop offset="0" stopColor="#fff6c8" stopOpacity="0.7" />
				<stop offset="1" stopColor="#fff6c8" stopOpacity="0" />
			</linearGradient>
		</defs>
		<polygon points={`0,-8 ${len},-170 ${len},170 0,8`} fill="url(#beamG)" />
	</g>
);
/* hand-held console (prop) */
export const Console = () => (
	<g transform="rotate(-10)">
		<rect x={-26} y={-30} width={64} height={34} rx={12} fill="#d23b3b" />
		<rect x={-8} y={-26} width={28} height={22} rx={3} fill="#9fd8ff" />
		<circle cx={-17} cy={-14} r={4} fill="#1b1a26" />
		<circle cx={29} cy={-14} r={4} fill="#1b1a26" />
	</g>
);
/* red glove in the snow */
export const Glove: React.FC<{x: number; y: number; k: number}> = ({x, y, k}) => (
	<g transform={`translate(${x},${y}) scale(${k})`}>
		<circle r={60} fill="#ff4a4a" opacity={0.15} style={{filter: 'blur(10px)'}} />
		<path d="M-20,10 L-20,-14 Q-20,-22 -12,-22 L-12,-30 Q-6,-36 0,-30 L2,-34 Q8,-38 12,-32 L14,-26 Q20,-28 22,-20 L22,10 Z" fill="#d23b3b" />
		<path d="M-20,-4 Q-34,-10 -30,-20 Q-26,-24 -20,-16" fill="#d23b3b" />
	</g>
);

export {lighten, HAND};

import React from 'react';
import {interpolate, random} from 'remotion';
import {Svg} from '../engine/camera';
import {darken, lighten} from '../engine/color';
import {FONT, HAND} from '../kit/ui';

/* Locations of "What if you hiccuped for 68 years?". One palette: deep navy night,
   cool hospital teal, warm amber for homes and the TV studio, sepia for 1922. */

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const Wall: React.FC<{id: string; top: string; bot: string}> = ({id, top, bot}) => (
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
export const Floor: React.FC<{y: number; c: string; tiles?: boolean; gloss?: boolean}> = ({y, c, tiles, gloss}) => (
	<g>
		<rect x={-400} y={y} width={2800} height={600} fill={c} />
		<rect x={-400} y={y} width={2800} height={10} fill={darken(c, 0.3)} />
		{tiles ? Array.from({length: 30}).map((_, i) => <line key={i} x1={-400 + i * 110} y1={y} x2={-400 + i * 110 - 260} y2={y + 600} stroke={darken(c, 0.12)} strokeWidth={2} />) : null}
		{tiles ? [40, 110, 210].map((d) => <line key={d} x1={-400} y1={y + d} x2={2400} y2={y + d} stroke={darken(c, 0.12)} strokeWidth={2} />) : null}
		{gloss ? <rect x={-400} y={y + 10} width={2800} height={60} fill="#fff" opacity={0.05} /> : null}
	</g>
);

/* ================================ TV STUDIO ================================ */
/* late-night show: city backdrop, neon title, light truss; host desk on the right, guest armchair left */
export const STUDIO_SEAT = 806;
export const Studio: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<Wall id="st-w" top="#141a44" bot="#2a2466" />
		{/* painted city backdrop */}
		<rect x={-200} y={120} width={2320} height={560} fill="#1d2a6a" />
		<rect x={-200} y={120} width={2320} height={560} fill="url(#st-sky)" />
		<defs>
			<linearGradient id="st-sky" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor="#2a2f7a" />
				<stop offset="1" stopColor="#c45a8a" />
			</linearGradient>
		</defs>
		<circle cx={1500} cy={300} r={60} fill="#ffe9c0" opacity={0.85} />
		{Array.from({length: 22}).map((_, i) => {
			const w = 70 + random('stb' + i) * 90;
			const h = 140 + random('sth' + i) * 300;
			const x = -200 + i * 110;
			return (
				<g key={i}>
					<rect x={x} y={680 - h} width={w} height={h} fill={i % 2 ? '#141a44' : '#1b2154'} />
					{Array.from({length: Math.floor(h / 40)}).map((_, j) => (random('stw' + i + j) > 0.45 ? <rect key={j} x={x + 12 + (j % 2) * (w / 2 - 10)} y={680 - h + 20 + j * 36} width={14} height={16} fill="#ffd27a" opacity={0.75} /> : null))}
				</g>
			);
		})}
		{/* frame of the backdrop */}
		<rect x={-200} y={672} width={2320} height={24} fill="#0d1030" />
		{/* neon title */}
		<g transform="translate(960,70)">
			<rect x={-330} y={-50} width={660} height={100} rx={50} fill="#0b0d26" stroke="#ff5aa8" strokeWidth={6} opacity={0.95} />
			<text y={22} textAnchor="middle" fontSize={58} fontFamily={FONT} fontWeight={900} fill="#ffe6f4" stroke="#ff5aa8" strokeWidth={2} opacity={0.85 + 0.15 * Math.sin(f / 5)}>
				THE LATE HOUR
			</text>
		</g>
		{/* light truss */}
		<rect x={-300} y={-40} width={2520} height={26} fill="#2a2d44" />
		{Array.from({length: 7}).map((_, i) => (
			<g key={i} transform={`translate(${100 + i * 290},-14)`}>
				<rect x={-26} y={0} width={52} height={50} rx={8} fill="#3a3d58" />
				<circle cy={50} r={20} fill="#fff6d8" />
			</g>
		))}
		<Floor y={900} c="#1c1838" gloss />
		{/* stage edge */}
		<rect x={-400} y={940} width={2800} height={16} fill="#ffd34a" opacity={0.35} />
	</Svg>
);
/* light cones from the truss (draw in front, screen blend) */
export const StudioBeams: React.FC<{f: number; o?: number}> = ({f, o = 0.16}) => (
	<Svg>
		{[390, 970, 1550].map((x, i) => (
			<polygon key={i} points={`${x - 20},40 ${x + 20},40 ${x + 260 + Math.sin(f / 50 + i) * 30},940 ${x - 260 + Math.sin(f / 50 + i) * 30},940`} fill="#fff1c8" opacity={o} style={{filter: 'blur(18px)'}} />
		))}
	</Svg>
);
/* host desk (front piece, hides the host's legs) */
export const HostDesk: React.FC<{x: number}> = ({x}) => (
	<g transform={`translate(${x},0)`}>
		<rect x={-200} y={760} width={400} height={20} rx={6} fill="#8a5a3a" />
		<path d="M-190,780 L190,780 L170,900 L-170,900 Z" fill="#5a3a2a" />
		<rect x={-150} y={800} width={300} height={70} rx={10} fill="#3a2a22" />
		<text y={846} textAnchor="middle" fontSize={30} fontFamily={FONT} fontWeight={900} fill="#ffd34a" opacity={0.9}>
			LATE HOUR
		</text>
		{/* mug */}
		<rect x={-140} y={722} width={34} height={40} rx={6} fill="#e4473c" />
		<path d="M-106,730 q16,4 0,22" stroke="#e4473c" strokeWidth={6} fill="none" />
		<rect x={80} y={748} width={70} height={12} rx={3} fill="#f4f1e6" />
	</g>
);
/* guest armchair (side view, faces right): seat top at STUDIO_SEAT + 4 */
export const Armchair: React.FC<{x: number; c?: string}> = ({x, c = '#2f7a8a'}) => (
	<g transform={`translate(${x},0)`}>
		<rect x={-90} y={680} width={50} height={160} rx={22} fill={darken(c, 0.15)} />
		<rect x={-90} y={800} width={190} height={70} rx={22} fill={c} />
		<rect x={-80} y={806} width={170} height={20} rx={10} fill={lighten(c, 0.15)} />
		<rect x={-80} y={866} width={14} height={34} fill="#1b1a26" />
		<rect x={80} y={866} width={14} height={34} fill="#1b1a26" />
	</g>
);
/* audience heads in the dark, bouncing when they laugh (front layer) */
export const Audience: React.FC<{f: number; laugh: number; y?: number}> = ({f, laugh, y = 1060}) => (
	<Svg>
		{Array.from({length: 16}).map((_, i) => {
			const x = -120 + i * 140 + (i % 2) * 40;
			const b = laugh * Math.abs(Math.sin(f / 3 + i)) * 14;
			return (
				<g key={i} transform={`translate(${x},${y - b + (i % 3) * 20})`}>
					<ellipse cy={60} rx={70} ry={60} fill="#07081a" />
					<circle cy={-30} r={46} fill="#0b0c22" />
				</g>
			);
		})}
	</Svg>
);
/* studio camera on a pedestal with a red tally light */
export const StudioCam: React.FC<{x: number; f: number}> = ({x, f}) => (
	<g transform={`translate(${x},0)`}>
		<rect x={-8} y={640} width={16} height={260} fill="#14151f" />
		<path d="M-70,900 L70,900 L40,870 L-40,870 Z" fill="#14151f" />
		<rect x={-110} y={560} width={200} height={110} rx={14} fill="#22243a" />
		<rect x={80} y={584} width={70} height={60} rx={10} fill="#14151f" />
		<circle cx={-80} cy={580} r={9} fill="#ff3a3a" opacity={0.6 + 0.4 * Math.sin(f / 4)} />
	</g>
);

/* ================================ 1922 FARM ================================ */
export const Farm: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<Wall id="fm-sky" top="#9fc2e0" bot="#f2e2b8" />
		<circle cx={1520} cy={200} r={70} fill="#fff4c8" />
		{/* hills */}
		<path d="M-400,640 Q200,520 700,600 T1600,580 T2400,620 L2400,1000 L-400,1000 Z" fill="#a8b86a" />
		{/* barn */}
		<g transform="translate(360,0)">
			<path d="M-220,700 L-220,420 L0,300 L220,420 L220,700 Z" fill="#b4473a" />
			<path d="M-240,430 L0,290 L240,430" stroke="#f2ead8" strokeWidth={16} fill="none" />
			<rect x={-90} y={500} width={180} height={200} fill="#8a3428" />
			<path d="M-90,500 L90,700 M90,500 L-90,700" stroke="#f2ead8" strokeWidth={10} />
			<rect x={-90} y={500} width={180} height={200} fill="none" stroke="#f2ead8" strokeWidth={10} />
			<rect x={-40} y={360} width={80} height={70} fill="#f2ead8" />
		</g>
		{/* fence */}
		{Array.from({length: 14}).map((_, i) => (
			<rect key={i} x={700 + i * 110} y={640} width={14} height={110} fill="#8a6a44" />
		))}
		<rect x={690} y={660} width={1600} height={12} fill="#8a6a44" />
		<rect x={690} y={710} width={1600} height={12} fill="#8a6a44" />
		{/* windmill */}
		<g transform="translate(1700,0)">
			<path d="M-30,700 L-10,380 L10,380 L30,700" stroke="#6a5a4a" strokeWidth={8} fill="none" />
			<g transform={`translate(0,370) rotate(${f * 3})`}>
				{[0, 1, 2, 3, 4, 5].map((k) => (
					<rect key={k} x={-8} y={-110} width={16} height={100} fill="#d8cfbf" transform={`rotate(${k * 60})`} />
				))}
			</g>
		</g>
		<rect x={-400} y={740} width={2800} height={400} fill="#c8a868" />
		<rect x={-400} y={740} width={2800} height={10} fill="#a88848" />
		{Array.from({length: 40}).map((_, i) => (
			<line key={i} x1={-400 + i * 70} y1={760 + (i % 4) * 40} x2={-380 + i * 70} y2={750 + (i % 4) * 40} stroke="#8a6a3a" strokeWidth={4} />
		))}
	</Svg>
);
/* a big farm hog (side view, faces right), origin at its feet centre */
export const Hog: React.FC<{x: number; y: number; s?: number; rot?: number; kick?: number}> = ({x, y, s = 1, rot = 0, kick = 0}) => (
	<g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
		<rect x={-70} y={-50} width={20} height={50 - kick * 10} rx={8} fill="#d88a88" transform={`rotate(${kick * 20} -60 -50)`} />
		<rect x={40} y={-50} width={20} height={50} rx={8} fill="#d88a88" transform={`rotate(${-kick * 20} 50 -50)`} />
		<ellipse cx={0} cy={-90} rx={110} ry={62} fill="#f0a8a2" />
		<ellipse cx={-20} cy={-110} rx={70} ry={26} fill="#f8c4bc" opacity={0.6} />
		<path d="M-110,-110 q-30,-10 -20,12 q14,6 6,-14" stroke="#d88a88" strokeWidth={6} fill="none" />
		<circle cx={98} cy={-108} r={44} fill="#f0a8a2" />
		<path d="M80,-150 L96,-176 L108,-146 Z" fill="#d88a88" />
		<ellipse cx={136} cy={-100} rx={18} ry={14} fill="#e48a88" />
		<circle cx={132} cy={-100} r={3} fill="#7a3a3a" />
		<circle cx={142} cy={-100} r={3} fill="#7a3a3a" />
		<circle cx={108} cy={-118} r={5} fill="#1b1a26" />
		<rect x={-50} y={-50} width={20} height={50} rx={8} fill="#e89a96" />
		<rect x={60} y={-50} width={20} height={50} rx={8} fill="#e89a96" />
	</g>
);
/* old film: sepia tone, flicker, scratches, dust (overlay on top of a scene) */
export const OldFilm: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<rect x={-400} y={-300} width={2800} height={1600} fill="#000" opacity={0.06 + 0.06 * random('fl' + f)} />
		{[0, 1].map((i) => (random('scr' + i + Math.floor(f / 3)) > 0.4 ? <line key={i} x1={random('sx' + i + Math.floor(f / 3)) * 1920} y1={-20} x2={random('sx' + i + Math.floor(f / 3)) * 1920 + 6} y2={1100} stroke="#fff6dc" strokeWidth={2} opacity={0.5} /> : null))}
		{Array.from({length: 8}).map((_, i) => (
			<circle key={i} cx={random('dx' + i + f) * 1920} cy={random('dy' + i + f) * 1080} r={1 + random('dr' + i + f) * 3} fill={i % 2 ? '#1b1208' : '#fff6dc'} opacity={0.6} />
		))}
	</Svg>
);

/* ================================ HOSPITAL / ER ================================ */
/* night emergency room: teal walls, bay curtains, wall clock, monitor, a window */
export const ER: React.FC<{f: number; dawn?: number; clock?: number}> = ({f, dawn = 0, clock = 3.97}) => (
	<Svg>
		<Wall id="er-w" top="#17394a" bot="#21505a" />
		<rect x={-400} y={560} width={2800} height={14} fill="#2f6a74" />
		{/* ceiling lights */}
		{[0, 1, 2, 3].map((i) => (
			<rect key={i} x={-60 + i * 620} y={-40} width={300} height={22} rx={8} fill="#e9fbff" opacity={0.9 - (i === 2 && random('erf' + Math.floor(f / 6)) > 0.85 ? 0.5 : 0)} />
		))}
		{/* window with night → dawn */}
		<g transform="translate(140,170)">
			<rect x={-14} y={-14} width={328} height={278} rx={6} fill="#cfe3e6" />
			<rect width={300} height={250} fill={dawn > 0 ? '#2a3a6a' : '#0b1430'} />
			<rect width={300} height={250} fill="#ffb27a" opacity={dawn * 0.85} />
			{Array.from({length: 7}).map((_, i) => (
				<rect key={i} x={10 + i * 42} y={250 - 60 - (i % 3) * 30} width={34} height={60 + (i % 3) * 30} fill={dawn > 0.5 ? '#6a4a5a' : '#0f1838'} />
			))}
			<line x1={150} y1={0} x2={150} y2={250} stroke="#cfe3e6" strokeWidth={8} />
		</g>
		{/* EMERGENCY sign */}
		<g transform="translate(960,150)">
			<rect x={-250} y={-46} width={500} height={92} rx={12} fill="#e4473c" />
			<text y={18} textAnchor="middle" fontSize={50} fontFamily={FONT} fontWeight={900} fill="#fff">
				EMERGENCY
			</text>
		</g>
		{/* wall clock */}
		<WallClock x={1460} y={170} h={clock} />
		{/* curtain rails + bays */}
		<rect x={500} y={262} width={1900} height={10} fill="#9ab8bf" />
		{[0, 1].map((i) => (
			<path key={i} d={`M${620 + i * 1180},272 q40,140 0,300 q-40,160 20,330 l120,0 q-40,-170 0,-330 q40,-160 0,-300 z`} fill={i ? '#8fc1c8' : '#7ab0b8'} opacity={0.9} />
		))}
		{/* heart monitor on a stand */}
		<g transform="translate(1660,420)">
			<rect x={-90} y={-70} width={180} height={130} rx={12} fill="#1b2230" />
			<rect x={-78} y={-58} width={156} height={100} rx={6} fill="#071a14" />
			<path d={Array.from({length: 40}).map((_, i) => `${i ? 'L' : 'M'}${-74 + i * 3.8},${-8 + ((i + Math.floor(f / 2)) % 14 === 0 ? -30 : (i + Math.floor(f / 2)) % 14 === 1 ? 18 : 0)}`).join(' ')} stroke="#4cff9a" strokeWidth={3} fill="none" />
			<rect x={-6} y={60} width={12} height={420} fill="#3a4250" />
		</g>
		<Floor y={900} c="#2f5a5e" tiles />
	</Svg>
);
export const WallClock: React.FC<{x: number; y: number; h: number; r?: number}> = ({x, y, h, r = 70}) => {
	const ha = (h / 12) * 360;
	const ma = (h % 1) * 360;
	return (
		<g transform={`translate(${x},${y})`}>
			<circle r={r + 8} fill="#d9e4e8" />
			<circle r={r} fill="#fbfaf4" />
			{Array.from({length: 12}).map((_, i) => (
				<line key={i} x1={0} y1={-r + 6} x2={0} y2={-r + 16} stroke="#333" strokeWidth={4} transform={`rotate(${i * 30})`} />
			))}
			<line x1={0} y1={0} x2={0} y2={-r * 0.5} stroke="#222" strokeWidth={7} strokeLinecap="round" transform={`rotate(${ha})`} />
			<line x1={0} y1={0} x2={0} y2={-r * 0.78} stroke="#222" strokeWidth={4} strokeLinecap="round" transform={`rotate(${ma})`} />
			<circle r={6} fill="#e4473c" />
		</g>
	);
};
/* hospital stretcher (side view), mattress top at STRETCHER_TOP */
export const STRETCHER_TOP = 748;
export const Stretcher: React.FC<{x: number; w?: number}> = ({x, w = 380}) => (
	<g transform={`translate(${x},0)`}>
		<rect x={-w / 2} y={STRETCHER_TOP} width={w} height={30} rx={12} fill="#e9f3f4" />
		<rect x={-w / 2} y={STRETCHER_TOP + 30} width={w} height={14} rx={4} fill="#8a9aa8" />
		<rect x={-w / 2 + 30} y={STRETCHER_TOP + 44} width={10} height={90} fill="#6a7a88" />
		<rect x={w / 2 - 40} y={STRETCHER_TOP + 44} width={10} height={90} fill="#6a7a88" />
		<rect x={-w / 2 + 20} y={STRETCHER_TOP + 96} width={w - 40} height={8} fill="#6a7a88" />
		<circle cx={-w / 2 + 35} cy={890} r={12} fill="#1b1a26" />
		<circle cx={w / 2 - 35} cy={890} r={12} fill="#1b1a26" />
		<rect x={w / 2 - 20} y={STRETCHER_TOP - 50} width={10} height={60} rx={4} fill="#8a9aa8" />
	</g>
);
/* paper bag in a hand; burst = 0..1 */
export const PaperBag: React.FC<{burst?: number}> = ({burst = 0}) =>
	burst > 0.5 ? (
		<g>
			{Array.from({length: 7}).map((_, i) => (
				<path key={i} d="M0,0 l10,-6 l6,10 z" fill="#c9a06a" transform={`rotate(${i * 51}) translate(${20 + burst * 30},0)`} />
			))}
		</g>
	) : (
		<g transform="rotate(-10)">
			<path d="M-22,-70 L22,-70 L28,0 L-28,0 Z" fill="#c9a06a" />
			<path d="M-22,-70 l8,-8 l8,8 l8,-8 l8,8 l8,-8 l4,8" stroke="#a8804a" strokeWidth={3} fill="none" />
		</g>
	);
export const Spoon: React.FC = () => (
	<g transform="rotate(-30)">
		<rect x={-3} y={-60} width={6} height={56} rx={3} fill="#c9d0dc" />
		<ellipse cx={0} cy={-70} rx={14} ry={10} fill="#c9d0dc" />
		<ellipse cx={0} cy={-73} rx={10} ry={5} fill="#fff" />
	</g>
);
export const Glass: React.FC<{tilt?: number}> = ({tilt = 0}) => (
	<g transform={`rotate(${tilt})`}>
		<path d="M-14,-44 L14,-44 L11,0 L-11,0 Z" fill="#cfefff" opacity={0.8} />
		<path d="M-12,-26 L12,-26 L11,0 L-11,0 Z" fill="#6ec6ff" opacity={0.8} />
	</g>
);
export const Coffee: React.FC = () => (
	<g>
		<rect x={-12} y={-40} width={24} height={34} rx={4} fill="#f4f1e6" />
		<rect x={-12} y={-30} width={24} height={10} fill="#8a5a3a" />
		<rect x={-14} y={-44} width={28} height={6} rx={3} fill="#3a2a22" />
	</g>
);

/* ============================== INFOGRAPHICS ============================== */
/* side view of a head and chest: lungs, diaphragm dome, windpipe, the glottis flap.
   twitch 0..1 pulls the dome down, air 0..1 sends arrows in, shut 0..1 closes the flap */
export const Anatomy: React.FC<{twitch: number; air: number; shut: number; f: number; labels: number[]}> = ({twitch, air, shut, f, labels}) => {
	const dy = twitch * 46;
	return (
		<g>
			{/* body outline */}
			<path d="M-60,-420 C-160,-420 -170,-300 -120,-250 L-110,-200 C-260,-170 -280,-40 -270,120 L-260,330 L260,330 L270,120 C280,-40 260,-170 110,-200 L120,-250 C170,-300 160,-420 60,-420 Z" fill="#2a3170" stroke="#9fd8ff" strokeWidth={5} />
			<circle cx={0} cy={-330} r={110} fill="#2a3170" stroke="#9fd8ff" strokeWidth={5} />
			{/* windpipe */}
			<rect x={-16} y={-250} width={32} height={210} rx={10} fill="#e9a0a0" />
			<path d="M0,-40 L-60,10 M0,-40 L60,10" stroke="#e9a0a0" strokeWidth={20} strokeLinecap="round" />
			{/* lungs */}
			<path d={`M-40,-30 C-200,-60 -230,60 -200,${170 + dy * 0.6} C-150,${190 + dy} -60,${180 + dy} -40,${150 + dy * 0.5} Z`} fill="#f08a96" opacity={0.92} />
			<path d={`M40,-30 C200,-60 230,60 200,${170 + dy * 0.6} C150,${190 + dy} 60,${180 + dy} 40,${150 + dy * 0.5} Z`} fill="#f08a96" opacity={0.92} />
			{/* diaphragm dome */}
			<path d={`M-240,${230} Q0,${110 + dy * 2.2} 240,${230}`} stroke="#ff4a4a" strokeWidth={22} fill="none" strokeLinecap="round" />
			{/* glottis flap at the top of the windpipe */}
			<g transform={`translate(0,-220) rotate(${-70 + 70 * shut})`}>
				<rect x={-4} y={-6} width={44} height={12} rx={6} fill="#ffd34a" />
			</g>
			{/* air arrows */}
			{air > 0
				? [0, 1, 2].map((i) => {
						const p = ((f / 6 + i / 3) % 1) * air;
						return <path key={i} d={`M0,${-420 + p * 220} l-18,-26 h36 z`} fill="#9fd8ff" opacity={air * (1 - shut)} />;
					})
				: null}
			{/* labels */}
			<g opacity={labels[0]}>
				<line x1={160} y1={180} x2={330} y2={240} stroke="#ff8a7a" strokeWidth={4} />
				<text x={340} y={256} fontSize={44} fontFamily={FONT} fontWeight={900} fill="#ff8a7a">
					DIAPHRAGM
				</text>
			</g>
			<g opacity={labels[1]}>
				<line x1={-30} y1={-222} x2={-260} y2={-260} stroke="#ffd34a" strokeWidth={4} />
				<text x={-270} y={-252} textAnchor="end" fontSize={44} fontFamily={FONT} fontWeight={900} fill="#ffd34a">
					THROAT FLAP
				</text>
				<text x={-270} y={-206} textAnchor="end" fontSize={28} fontFamily={FONT} fill="#ffe9a8">
					(glottis)
				</text>
			</g>
			<g opacity={labels[2]}>
				<text x={-330} y={60} textAnchor="end" fontSize={44} fontFamily={FONT} fontWeight={900} fill="#9fd8ff">
					LUNGS
				</text>
			</g>
		</g>
	);
};
/* a tadpole (faces right) with fluttering gills and a throat that closes */
export const Tadpole: React.FC<{f: number; shut: number}> = ({f, shut}) => (
	<g>
		<path d={`M-60,0 Q-160,${Math.sin(f / 3) * 40} -260,${Math.sin(f / 3 - 1) * 50} Q-160,${20 + Math.sin(f / 3) * 30} -60,24 Z`} fill="#4a6a3a" />
		<ellipse cx={20} cy={8} rx={110} ry={86} fill="#5a7a44" />
		<ellipse cx={0} cy={-20} rx={70} ry={40} fill="#6a8a54" opacity={0.6} />
		<circle cx={80} cy={-30} r={20} fill="#fff" />
		<circle cx={86} cy={-30} r={10} fill="#1b1a26" />
		{[0, 1, 2].map((i) => (
			<path key={i} d={`M${-10 + i * 18},60 q${-10 + Math.sin(f / 2 + i) * 8},30 ${-4},50`} stroke="#ff8a8a" strokeWidth={8} fill="none" strokeLinecap="round" />
		))}
		<g transform={`translate(110,30) rotate(${-60 + 60 * shut})`}>
			<rect x={-2} y={-5} width={30} height={10} rx={5} fill="#ffd34a" />
		</g>
	</g>
);
/* a baby curled up inside a belly circle; jolt 0..1 */
export const Womb: React.FC<{f: number; jolt: number}> = ({f, jolt}) => (
	<g>
		<circle r={300} fill="#f2a08a" opacity={0.25} />
		<circle r={260} fill="#e47a6a" opacity={0.35} />
		<circle r={230} fill="#2a1a3a" opacity={0.6} />
		<g transform={`translate(0,${-jolt * 18}) rotate(${-10 + Math.sin(f / 30) * 3})`}>
			<path d="M-40,40 C-120,20 -110,-110 -10,-120 C80,-120 120,-40 100,40 C80,110 -10,120 -40,40 Z" fill="#f6c6a8" />
			<circle cx={40} cy={-90} r={74} fill="#f8d0b4" />
			<path d="M10,-80 q10,10 22,0" stroke="#6a4a3a" strokeWidth={4} fill="none" strokeLinecap="round" />
			<path d="M60,-70 q8,6 16,0" stroke="#6a4a3a" strokeWidth={4} fill="none" strokeLinecap="round" />
			<path d="M-60,60 q30,40 80,30" stroke="#f6c6a8" strokeWidth={34} fill="none" strokeLinecap="round" />
			<path d="M30,20 q40,20 30,60" stroke="#f6c6a8" strokeWidth={26} fill="none" strokeLinecap="round" />
		</g>
		<path d="M0,230 q20,60 -10,120" stroke="#e47a6a" strokeWidth={14} fill="none" opacity={0.6} />
	</g>
);
/* MRI-style brain scan on a light box; spot = 0..1 pulses a tiny bright spot near the brainstem */
export const BrainScan: React.FC<{spot: number; f: number}> = ({spot, f}) => (
	<g>
		<rect x={-300} y={-260} width={600} height={520} rx={20} fill="#0b0f18" stroke="#3a4250" strokeWidth={12} />
		<ellipse cx={0} cy={-20} rx={210} ry={200} fill="#3a4250" />
		<ellipse cx={0} cy={-20} rx={190} ry={180} fill="#8a96a8" />
		<path d="M-150,-60 q40,-60 80,-10 q40,-60 80,0 q40,-50 70,10 M-160,20 q60,-30 100,10 q50,-40 100,0 q40,-30 80,10 M-130,90 q50,-30 90,0 q50,-30 90,0" stroke="#5a6478" strokeWidth={8} fill="none" />
		<path d="M-30,140 Q0,200 30,140 L20,250 L-20,250 Z" fill="#7a8698" />
		<circle cx={6} cy={150} r={6 + spot * 4} fill="#ffefa0" opacity={spot} />
		<circle cx={6} cy={150} r={20 + (f % 20)} fill="none" stroke="#ffd34a" strokeWidth={3} opacity={spot * (1 - (f % 20) / 20)} />
	</g>
);
/* big red heart with beat (k = beat phase 0..1) */
export const Heart: React.FC<{k: number; c?: string}> = ({k, c = '#e4473c'}) => (
	<g transform={`scale(${1 + 0.14 * Math.max(0, Math.sin(k * Math.PI * 2)) ** 4})`}>
		<path d="M0,40 C-80,-20 -60,-90 0,-50 C60,-90 80,-20 0,40 Z" fill={c} />
		<ellipse cx={-26} cy={-44} rx={14} ry={8} fill="#fff" opacity={0.4} transform="rotate(-30 -26 -44)" />
	</g>
);
export const beatK = (f: number, period = 27) => (f % period) / period;
export const fadeIn = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);
export const Sticky: React.FC<{x: number; y: number; text: string; c?: string; rot?: number}> = ({x, y, text, c = '#ffe38a', rot = -4}) => (
	<g transform={`translate(${x},${y}) rotate(${rot})`}>
		<rect x={-80} y={-50} width={160} height={100} fill={c} />
		<text y={10} textAnchor="middle" fontSize={30} fontFamily={HAND} fontWeight={700} fill="#3a2a22">
			{text}
		</text>
	</g>
);

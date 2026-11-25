import React from 'react';
import {random} from 'remotion';
import {Svg} from '../engine/camera';
import {darken, lighten} from '../engine/color';
import {FONT, HAND} from '../kit/ui';

/* Locations and props for part 2 (rewind, the three rules). Same night palette:
   navy outside, warm amber light inside. */

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
const Floor: React.FC<{y: number; c: string; tiles?: boolean}> = ({y, c, tiles}) => (
	<g>
		<rect x={-400} y={y} width={2800} height={600} fill={c} />
		<rect x={-400} y={y} width={2800} height={10} fill={darken(c, 0.3)} />
		{tiles ? Array.from({length: 30}).map((_, i) => <line key={i} x1={-400 + i * 110} y1={y} x2={-400 + i * 110 - 260} y2={y + 600} stroke={darken(c, 0.12)} strokeWidth={2} />) : null}
	</g>
);
const Glow: React.FC<{x: number; y: number; r: number; c?: string; o?: number}> = ({x, y, r, c = '#ffcf7a', o = 0.16}) => (
	<circle cx={x} cy={y} r={r} fill={c} opacity={o} style={{filter: `blur(${r / 5}px)`}} />
);

/* --------------------------------- bathroom --------------------------------- */
// MIRROR rect for the reflection: x 960..1400, y 230..640
export const MIRROR = {x: 960, y: 230, w: 440, h: 410};
export const Bathroom: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<Wall id="bath-w" top="#1f3a4a" bot="#2a4a5a" />
		{Array.from({length: 14}).map((_, r) =>
			Array.from({length: 26}).map((__, c) => (
				<rect key={`${r}-${c}`} x={-300 + c * 100} y={-100 + r * 70} width={96} height={66} rx={4} fill="#2f5466" opacity={0.55} />
			)),
		)}
		{/* towel + shelf */}
		<rect x={300} y={300} width={160} height={10} rx={4} fill="#c9ccd6" />
		<path d="M320,310 L440,310 L430,520 L330,520 Z" fill="#e47a3c" />
		<rect x={330} y={470} width={100} height={10} fill="#c5612b" />
		{/* mirror frame + light bar */}
		<rect x={MIRROR.x - 18} y={MIRROR.y - 18} width={MIRROR.w + 36} height={MIRROR.h + 36} rx={20} fill="#c9ccd6" />
		<rect x={MIRROR.x} y={MIRROR.y} width={MIRROR.w} height={MIRROR.h} rx={8} fill="#1d3442" />
		<rect x={MIRROR.x + 60} y={MIRROR.y - 60} width={MIRROR.w - 120} height={22} rx={11} fill="#fff4cf" />
		<Glow x={MIRROR.x + MIRROR.w / 2} y={MIRROR.y - 40} r={220} o={0.22} />
		{/* sink */}
		<rect x={1010} y={700} width={340} height={30} rx={14} fill="#eef1f6" />
		<path d="M1030,730 L1330,730 L1290,800 L1070,800 Z" fill="#dfe3ec" />
		<rect x={1150} y={800} width={60} height={100} fill="#c9ccd6" />
		<path d="M1170,700 v-40 h50" stroke="#c9ccd6" strokeWidth={12} fill="none" strokeLinecap="round" />
		{/* toothbrush cup */}
		<rect x={1290} y={650} width={40} height={50} rx={8} fill="#3aa37a" />
		<line x1={1302} y1={650} x2={1296} y2={600} stroke="#e47a3c" strokeWidth={6} strokeLinecap="round" />
		<Floor y={900} c="#2a3a48" tiles />
	</Svg>
);

/* ------------------------------- corner store ------------------------------- */
export const Store: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<Wall id="st-w" top="#203a3a" bot="#2c4a46" />
		{[0, 1, 2, 3].map((r) => (
			<g key={r}>
				<rect x={-300} y={200 + r * 150} width={1300} height={14} fill="#6a5a4a" />
				{Array.from({length: 24}).map((_, i) => {
					const c = ['#d94a3a', '#f2b21c', '#3aa37a', '#4f7dd8', '#e47a3c', '#c95ab0'][Math.floor(random('st' + r + i) * 6)];
					const h = 50 + random('sh' + r + i) * 40;
					return <rect key={i} x={-290 + i * 52} y={200 + r * 150 - h} width={42} height={h} rx={5} fill={c} opacity={0.85} />;
				})}
			</g>
		))}
		{/* neon OPEN sign */}
		<g opacity={0.8 + 0.2 * Math.sin(f / 3)}>
			<rect x={1330} y={170} width={300} height={110} rx={20} fill="none" stroke="#ff4f8b" strokeWidth={8} />
			<text x={1480} y={248} textAnchor="middle" fontSize={64} fontFamily={FONT} fontWeight={900} fill="#ffd0e0" stroke="#ff4f8b" strokeWidth={2}>
				OPEN
			</text>
		</g>
		<Glow x={1480} y={225} r={200} c="#ff4f8b" o={0.18} />
		<Floor y={900} c="#3a4a48" tiles />
	</Svg>
);
/* store counter with a gum rack; drawn in front of the clerk */
export const StoreCounter: React.FC<{x?: number}> = ({x = 980}) => (
	<g>
		<rect x={x} y={712} width={900} height={22} rx={6} fill="#c9ccd6" />
		<rect x={x + 10} y={734} width={880} height={200} fill="#4a5a68" />
		<rect x={x + 30} y={760} width={840} height={20} fill="#3a4856" />
		<g transform={`translate(${x + 140},712)`}>
			<rect x={-50} y={-110} width={100} height={110} rx={6} fill="#2a2633" />
			{[0, 1, 2].map((r) => [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={-42 + c * 30} y={-100 + r * 34} width={24} height={28} rx={3} fill={['#3fcf7a', '#ff4f8b', '#9fd8ff'][(r + c) % 3]} />))}
		</g>
	</g>
);
/* pack of gum (prop held in a hand) */
export const Gum = () => (
	<g transform="rotate(-15)">
		<rect x={-4} y={-22} width={34} height={20} rx={4} fill="#3fcf7a" stroke="#0e3a22" strokeWidth={2} />
		<text x={13} y={-8} textAnchor="middle" fontSize={10} fontFamily={FONT} fontWeight={900} fill="#0e3a22">
			GUM
		</text>
	</g>
);

/* --------------------------------- burger bar -------------------------------- */
export const BurgerBar: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<Wall id="bb-w" top="#3a1f2a" bot="#55303a" />
		<rect x={-400} y={600} width={2800} height={300} fill="#c94a3a" opacity={0.35} />
		{Array.from({length: 30}).map((_, i) => (
			<rect key={i} x={-400 + i * 100} y={600} width={50} height={300} fill="#f4efe2" opacity={0.08} />
		))}
		{/* menu light boxes */}
		{[0, 1, 2].map((i) => (
			<g key={i} transform={`translate(${520 + i * 330},120)`}>
				<rect width={300} height={200} rx={12} fill="#1b1a26" />
				<rect x={10} y={10} width={280} height={180} rx={8} fill="#fff1c8" opacity={0.95} />
				<ellipse cx={150} cy={90} rx={80} ry={22} fill="#c98a4a" />
				<rect x={74} y={92} width={152} height={18} rx={6} fill="#7a3f22" />
				<rect x={70} y={108} width={160} height={10} rx={4} fill="#3fcf7a" />
				<ellipse cx={150} cy={124} rx={80} ry={14} fill="#c98a4a" />
				<text x={150} y={176} textAnchor="middle" fontSize={34} fontFamily={FONT} fontWeight={900} fill="#c94a3a">
					{['$12', '$9', '$4'][i]}
				</text>
			</g>
		))}
		<Glow x={850} y={220} r={360} o={0.12} />
		<Floor y={900} c="#4a2f36" tiles />
	</Svg>
);
export const Burger = () => (
	<g transform="translate(6,-10)">
		<ellipse cx={0} cy={-14} rx={22} ry={12} fill="#c98a4a" />
		<rect x={-22} y={-12} width={44} height={8} rx={3} fill="#7a3f22" />
		<rect x={-24} y={-6} width={48} height={5} rx={2} fill="#3fcf7a" />
		<ellipse cx={0} cy={2} rx={22} ry={7} fill="#c98a4a" />
	</g>
);

/* ------------------------------------ ATM ------------------------------------ */
// `press` 0..1 presses DEPOSIT, `deny` shows the red cross
export const Atm: React.FC<{x: number; y: number; s?: number; deny: number; f: number}> = ({x, y, s = 1, deny, f}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<Glow x={0} y={-240} r={260} c="#9fd8ff" o={0.16} />
		<rect x={-170} y={-470} width={340} height={470} rx={18} fill="#2b3348" />
		<rect x={-150} y={-450} width={300} height={60} rx={10} fill="#3d6fd6" />
		<text x={0} y={-408} textAnchor="middle" fontSize={34} fontFamily={FONT} fontWeight={900} fill="#fff">
			LIFE BANK
		</text>
		<rect x={-130} y={-370} width={260} height={180} rx={10} fill="#0f1a2e" />
		<text x={-110} y={-322} fontSize={26} fontFamily={FONT} fontWeight={800} fill="#9ff0b0">
			WITHDRAW ✓
		</text>
		<g opacity={deny > 0 && Math.floor(f / 4) % 2 === 0 ? 0.55 : 1}>
			<text x={-110} y={-260} fontSize={26} fontFamily={FONT} fontWeight={800} fill={deny > 0 ? '#ff6a5a' : '#9fd8ff'}>
				DEPOSIT {deny > 0 ? '✗' : ''}
			</text>
		</g>
		{deny > 0 ? (
			<text x={0} y={-212} textAnchor="middle" fontSize={20} fontFamily={FONT} fontWeight={700} fill="#ff6a5a">
				NOT AVAILABLE. EVER.
			</text>
		) : null}
		{[0, 1, 2].map((r) => [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={-70 + c * 50} y={-170 + r * 40} width={40} height={30} rx={5} fill="#4a5470" />))}
		<rect x={-110} y={-40} width={220} height={14} rx={7} fill="#0f1a2e" />
	</g>
);

/* phone banner notification (payroll) */
export const Banner: React.FC<{x: number; y: number; k: number; title: string; text: string; c?: string}> = ({x, y, k, title, text, c = '#3fcf7a'}) => (
	<g transform={`translate(${x},${y + (1 - k) * -120}) scale(${0.8 + 0.2 * k})`} opacity={Math.min(1, k * 1.5)}>
		<rect x={-300} y={-60} width={600} height={120} rx={28} fill="#000" opacity={0.3} transform="translate(8,12)" style={{filter: 'blur(10px)'}} />
		<rect x={-300} y={-60} width={600} height={120} rx={28} fill="#f4f6fb" />
		<rect x={-270} y={-36} width={72} height={72} rx={18} fill={c} />
		<text x={-234} y={14} textAnchor="middle" fontSize={44} fontFamily={FONT} fontWeight={900} fill="#fff">
			$
		</text>
		<text x={-178} y={-8} fontSize={26} fontFamily={FONT} fontWeight={700} fill="#5a6078">
			{title}
		</text>
		<text x={-178} y={34} fontSize={38} fontFamily={FONT} fontWeight={900} fill="#13203a">
			{text}
		</text>
	</g>
);

/* microwave with a fork inside, sparking (for Marco's thought bubble) */
export const Microwave: React.FC<{f: number}> = ({f}) => (
	<g>
		<rect x={-110} y={-70} width={220} height={140} rx={14} fill="#c9ccd6" />
		<rect x={-96} y={-56} width={140} height={112} rx={8} fill="#1d2236" />
		<rect x={60} y={-50} width={36} height={100} rx={6} fill="#9a9eae" />
		<path d="M-40,20 l0,-40 M-30,20 l0,-40 M-20,20 l0,-40 M-30,20 l0,25" stroke="#e8e8ee" strokeWidth={4} strokeLinecap="round" />
		{Array.from({length: 6}).map((_, i) => {
			const a = random('mw' + i + Math.floor(f / 3)) * Math.PI * 2;
			return <path key={i} d={`M-30,-10 l${Math.cos(a) * 30},${Math.sin(a) * 30} l${Math.cos(a + 0.8) * 14},${Math.sin(a + 0.8) * 14}`} stroke="#ffd34a" strokeWidth={4} fill="none" strokeLinecap="round" />;
		})}
		<text x={0} y={-90} textAnchor="middle" fontSize={40} fontFamily={FONT} fontWeight={900} fill="#ffd34a" stroke="#11142c" strokeWidth={6} paintOrder="stroke">
			ZZZT!
		</text>
	</g>
);

/* clipboard (Marco the scientist) */
export const Clipboard = () => (
	<g transform="rotate(10)">
		<rect x={-4} y={-46} width={40} height={52} rx={4} fill="#a9805a" />
		<rect x={0} y={-40} width={32} height={42} rx={2} fill="#f4efe2" />
		<line x1={5} y1={-30} x2={27} y2={-30} stroke="#5a6078" strokeWidth={2} />
		<line x1={5} y1={-22} x2={27} y2={-22} stroke="#5a6078" strokeWidth={2} />
		<line x1={5} y1={-14} x2={20} y2={-14} stroke="#5a6078" strokeWidth={2} />
	</g>
);

/* big wall clock for the rewind; hands run backwards with `t` */
export const BigClock: React.FC<{x: number; y: number; r: number; t: number}> = ({x, y, r, t}) => {
	const m = (-t * 30) % 360;
	const h = (-t * 2.5) % 360;
	const rad = (d: number) => (d * Math.PI) / 180;
	return (
		<g transform={`translate(${x},${y})`}>
			<Glow x={0} y={0} r={r * 1.5} c="#9fd8ff" o={0.15} />
			<circle r={r} fill="#f4f6fb" stroke="#e47a3c" strokeWidth={r * 0.08} />
			{Array.from({length: 12}).map((_, i) => (
				<line key={i} x1={Math.sin(rad(i * 30)) * r * 0.8} y1={-Math.cos(rad(i * 30)) * r * 0.8} x2={Math.sin(rad(i * 30)) * r * 0.92} y2={-Math.cos(rad(i * 30)) * r * 0.92} stroke="#13203a" strokeWidth={r * 0.04} strokeLinecap="round" />
			))}
			<line x1={0} y1={0} x2={Math.sin(rad(h)) * r * 0.5} y2={-Math.cos(rad(h)) * r * 0.5} stroke="#13203a" strokeWidth={r * 0.07} strokeLinecap="round" />
			<line x1={0} y1={0} x2={Math.sin(rad(m)) * r * 0.78} y2={-Math.cos(rad(m)) * r * 0.78} stroke="#e4473c" strokeWidth={r * 0.04} strokeLinecap="round" />
			<circle r={r * 0.06} fill="#13203a" />
		</g>
	);
};

export {lighten, HAND};

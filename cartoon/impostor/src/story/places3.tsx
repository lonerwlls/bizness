import React from 'react';
import {random} from 'remotion';
import {Svg} from '../engine/camera';
import {darken, lighten} from '../engine/color';
import {FONT, HAND} from '../kit/ui';

/* Locations and props for part 3 (life as a calculator). Same night palette. */

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
const Floor: React.FC<{y: number; c: string}> = ({y, c}) => (
	<g>
		<rect x={-400} y={y} width={2800} height={600} fill={c} />
		<rect x={-400} y={y} width={2800} height={10} fill={darken(c, 0.3)} />
		{Array.from({length: 30}).map((_, i) => <line key={i} x1={-400 + i * 110} y1={y} x2={-400 + i * 110 - 260} y2={y + 600} stroke={darken(c, 0.12)} strokeWidth={2} />)}
	</g>
);
const Glow: React.FC<{x: number; y: number; r: number; c?: string; o?: number}> = ({x, y, r, c = '#ffcf7a', o = 0.16}) => (
	<circle cx={x} cy={y} r={r} fill={c} opacity={o} style={{filter: `blur(${r / 5}px)`}} />
);

/* TV on a low stand; `show` animates the picture, `off` turns it dark */
export const Tv: React.FC<{x: number; y: number; f: number; off?: boolean}> = ({x, y, f, off}) => (
	<g transform={`translate(${x},${y})`}>
		{off ? null : <Glow x={0} y={-150} r={260} c="#9fd8ff" o={0.2} />}
		<rect x={-110} y={-40} width={220} height={40} rx={6} fill="#2a2633" />
		<rect x={-20} y={-80} width={40} height={40} fill="#1b1a26" />
		<rect x={-220} y={-300} width={440} height={230} rx={12} fill="#15161d" />
		<rect x={-206} y={-286} width={412} height={202} rx={6} fill={off ? '#0b0c12' : '#1d3a5a'} />
		{off ? null : (
			<g>
				<circle cx={-60 + Math.sin(f / 20) * 40} cy={-190} r={40} fill="#ffd34a" opacity={0.85} />
				<rect x={-206} y={-130} width={412} height={46} fill="#2a5a3a" />
				<text x={0} y={-100} textAnchor="middle" fontSize={22} fontFamily={FONT} fontWeight={800} fill="#fff" opacity={0.8}>
					EPISODE 47
				</text>
			</g>
		)}
	</g>
);

/* subscription screen on a phone: `cancel` 0..1 stamps CANCELLED */
export const SubPhone: React.FC<{x: number; y: number; s?: number; cancel: number; title: string; price: string; note: string}> = ({x, y, s = 1, cancel, title, price, note}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<rect x={-160} y={-300} width={320} height={600} rx={44} fill="#000" opacity={0.3} transform="translate(14,20)" style={{filter: 'blur(14px)'}} />
		<rect x={-160} y={-300} width={320} height={600} rx={44} fill="#15161d" />
		<rect x={-146} y={-286} width={292} height={572} rx={34} fill="#f4f6fb" />
		<text x={0} y={-200} textAnchor="middle" fontSize={30} fontFamily={FONT} fontWeight={900} fill="#13203a">
			{title}
		</text>
		<text x={0} y={-110} textAnchor="middle" fontSize={64} fontFamily={FONT} fontWeight={900} fill="#e4473c">
			{price}
		</text>
		<text x={0} y={-40} textAnchor="middle" fontSize={22} fontFamily={FONT} fill="#8a90a6">
			{note}
		</text>
		<g transform="translate(0,170)">
			<rect x={-110} y={-44} width={220} height={88} rx={44} fill="#5a6078" />
			<text x={0} y={14} textAnchor="middle" fontSize={36} fontFamily={FONT} fontWeight={900} fill="#fff">
				CANCEL
			</text>
		</g>
		{cancel > 0 ? (
			<g transform={`translate(0,40) rotate(-14) scale(${1 + (1 - Math.min(1, cancel)) * 1.2})`} opacity={Math.min(1, cancel * 1.5)}>
				<rect x={-150} y={-46} width={300} height={92} rx={10} fill="#f4f6fb" stroke="#d23b3b" strokeWidth={8} />
				<text y={18} textAnchor="middle" fontSize={44} fontFamily={FONT} fontWeight={900} fill="#d23b3b">
					CANCELLED
				</text>
			</g>
		) : null}
	</g>
);

/* checkout: conveyor belt + register display; `items` are drawn by the scene */
export const Checkout: React.FC<{total: string; f: number}> = ({total, f}) => (
	<g>
		<rect x={980} y={712} width={940} height={22} rx={6} fill="#c9ccd6" />
		<rect x={990} y={734} width={920} height={200} fill="#4a5a68" />
		<rect x={1000} y={700} width={600} height={14} fill="#1b1a26" />
		{Array.from({length: 16}).map((_, i) => (
			<line key={i} x1={1000 + ((i * 40 + f * 2) % 600)} y1={702} x2={1000 + ((i * 40 + f * 2) % 600)} y2={712} stroke="#3a3a4a" strokeWidth={3} />
		))}
		<g transform="translate(1700,712)">
			<rect x={-40} y={-200} width={20} height={200} fill="#2a2633" />
			<rect x={-150} y={-280} width={240} height={110} rx={10} fill="#15161d" />
			<rect x={-138} y={-268} width={216} height={86} rx={6} fill="#0e2a1a" />
			<text x={-30} y={-210} textAnchor="middle" fontSize={50} fontFamily={FONT} fontWeight={900} fill="#3fcf7a">
				{total}
			</text>
		</g>
	</g>
);
export const Cheese: React.FC<{fancy?: boolean}> = ({fancy}) => (
	<g>
		<path d="M-34,0 L34,0 L34,-30 L-34,-46 Z" fill={fancy ? '#ffd34a' : '#f2c84c'} stroke="#b9800c" strokeWidth={3} />
		<circle cx={-10} cy={-22} r={5} fill="#d9a520" />
		<circle cx={14} cy={-14} r={4} fill="#d9a520" />
		{fancy ? (
			<g>
				<rect x={-26} y={-14} width={52} height={14} rx={3} fill="#7a3f52" />
				<text y={-3} textAnchor="middle" fontSize={10} fontFamily={FONT} fontWeight={900} fill="#ffd34a">
					GOURMET
				</text>
			</g>
		) : null}
	</g>
);
export const GroceryItems: React.FC<{x: number; n: number}> = ({x, n}) => (
	<g>
		{Array.from({length: n}).map((_, i) => {
			const c = ['#d94a3a', '#3aa37a', '#4f7dd8', '#e47a3c', '#f4efe2'][i % 5];
			const h = 40 + ((i * 17) % 40);
			return <rect key={i} x={x + i * 58} y={700 - h} width={44} height={h} rx={6} fill={c} />;
		})}
	</g>
);

/* a simple taxi, nose to the right, standing on `y` */
export const Taxi: React.FC<{x: number; y: number; f: number; s?: number}> = ({x, y, f, s = 1}) => {
	const wheel = (wx: number) => (
		<g transform={`translate(${wx},0)`}>
			<circle r={40} fill="#0d0f1c" />
			<circle r={20} fill="#8c93ad" />
		</g>
	);
	return (
		<g transform={`translate(${x},${y - 40}) scale(${s})`}>
			<ellipse cx={0} cy={44} rx={300} ry={14} fill="#05060f" opacity={0.5} />
			<path d="M-280,-10 L-280,-70 Q-270,-86 -240,-88 L-170,-92 L-110,-150 Q-96,-160 -70,-160 L60,-160 Q90,-160 110,-140 L170,-90 L250,-84 Q280,-78 282,-50 L282,-10 Q276,14 250,14 L-260,14 Q-280,10 -280,-10 Z" fill="#f2b21c" />
			<path d="M-150,-92 L-100,-146 Q-92,-152 -76,-152 L-20,-152 L-20,-92 Z" fill="#1d2a52" />
			<path d="M-4,-152 L60,-152 Q82,-152 98,-138 L148,-92 L-4,-92 Z" fill="#1d2a52" />
			<rect x={-280} y={-44} width={562} height={14} fill="#11142c" />
			{Array.from({length: 14}).map((_, i) => (
				<rect key={i} x={-276 + i * 40} y={-44} width={20} height={7} fill="#f4efe2" />
			))}
			<rect x={-50} y={-188} width={90} height={28} rx={6} fill="#11142c" />
			<text x={-5} y={-167} textAnchor="middle" fontSize={20} fontFamily={FONT} fontWeight={900} fill="#ffd34a">
				TAXI
			</text>
			<ellipse cx={268} cy={-56} rx={12} ry={9} fill="#fff6c8" />
			<circle cx={268} cy={-56} r={30} fill="#fff2b8" opacity={0.3 + 0.05 * Math.sin(f / 3)} />
			{wheel(-170)}
			{wheel(170)}
		</g>
	);
};

/* tech store: clean walls, glowing logo, display tables */
export const TechStore: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<Wall id="ts-w" top="#1a2a4a" bot="#24365a" />
		{[0, 1, 2, 3].map((i) => (
			<g key={i}>
				<rect x={-100 + i * 560} y={140} width={420} height={260} rx={20} fill="#2e4470" />
				<rect x={-80 + i * 560} y={160} width={380} height={220} rx={14} fill={['#3d6fd6', '#e47a3c', '#3aa37a', '#c95ab0'][i]} opacity={0.6} />
				<rect x={20 + i * 560} y={190} width={90} height={160} rx={16} fill="#15161d" />
				<rect x={28 + i * 560} y={198} width={74} height={144} rx={10} fill="#bfe3ff" />
			</g>
		))}
		<Glow x={960} y={260} r={420} c="#9fd8ff" o={0.12} />
		<Floor y={900} c="#2e3a52" />
	</Svg>
);
/* display table with the new phone */
export const PhoneTable: React.FC<{x: number; lift: number}> = ({x, lift}) => (
	<g>
		<rect x={x - 220} y={720} width={440} height={20} rx={8} fill="#eef1f6" />
		<rect x={x - 200} y={740} width={400} height={180} fill="#c9ccd6" />
		<g transform={`translate(${x},${712 - lift})`}>
			<rect x={-26} y={-60} width={52} height={60} rx={8} fill="#15161d" />
			<rect x={-22} y={-56} width={44} height={52} rx={5} fill="#7cc4ff" />
		</g>
		<g transform={`translate(${x + 120},700)`}>
			<rect x={-60} y={-40} width={120} height={40} rx={6} fill="#11142c" stroke="#ffd34a" strokeWidth={3} />
			<text y={-12} textAnchor="middle" fontSize={24} fontFamily={FONT} fontWeight={900} fill="#ffd34a">
				$1,000
			</text>
		</g>
	</g>
);

/* car dealership: big window, spotlights, a shiny car on a turntable */
export const Dealership: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<Wall id="dl-w" top="#141a38" bot="#20284e" />
		{[0, 1, 2, 3, 4].map((i) => (
			<rect key={i} x={-200 + i * 480} y={120} width={440} height={560} fill="#1b2350" stroke="#2e3a6a" strokeWidth={10} />
		))}
		{[300, 960, 1620].map((x, i) => (
			<g key={i}>
				<polygon points={`${x - 20},0 ${x + 20},0 ${x + 260},900 ${x - 260},900`} fill="#fff4cf" opacity={0.06 + 0.02 * Math.sin(f / 10 + i)} />
			</g>
		))}
		<Floor y={900} c="#2a2f4a" />
	</Svg>
);
export const ShowCar: React.FC<{x: number; y: number; f: number; tag: string; tagK: number}> = ({x, y, f, tag, tagK}) => (
	<g>
		<ellipse cx={x} cy={y + 6} rx={420} ry={34} fill="#3a4378" />
		<ellipse cx={x} cy={y} rx={400} ry={28} fill="#4a5490" />
		<g transform={`translate(${x},${y - 30})`}>
			<path d="M-330,0 L-330,-70 Q-318,-90 -280,-92 L-190,-98 L-120,-170 Q-104,-182 -76,-182 L80,-182 Q112,-182 134,-160 L200,-98 L300,-90 Q332,-84 334,-54 L334,0 Q326,24 298,24 L-306,24 Q-330,20 -330,0 Z" fill="#d23b3b" />
			<path d="M-168,-98 L-112,-162 Q-100,-170 -82,-170 L-14,-170 L-14,-98 Z" fill="#1d2a52" />
			<path d="M4,-170 L80,-170 Q104,-170 122,-154 L178,-98 L4,-98 Z" fill="#1d2a52" />
			<path d="M-300,-80 L300,-76" stroke="#ff8a7a" strokeWidth={6} opacity={0.6} />
			<rect x={-60 + ((f * 6) % 400) - 200} y={-176} width={30} height={180} fill="#fff" opacity={0.12} transform="skewX(-20)" />
			{[-200, 200].map((wx) => (
				<g key={wx} transform={`translate(${wx},20)`}>
					<circle r={46} fill="#0d0f1c" />
					<circle r={24} fill="#c9cede" />
				</g>
			))}
		</g>
		<g transform={`translate(${x + 250},${y - 300}) rotate(${6 - 4 * tagK})`}>
			<line x1={-60} y1={-70} x2={-60} y2={30} stroke="#c9ccd6" strokeWidth={3} />
			<rect x={-150} y={-40} width={300} height={100} rx={12} fill={tagK > 0.5 ? '#d23b3b' : '#f4efe2'} />
			<text y={28} textAnchor="middle" fontSize={50} fontFamily={FONT} fontWeight={900} fill={tagK > 0.5 ? '#fff' : '#13203a'} transform={`scale(1,${Math.abs(Math.cos(tagK * Math.PI))})`}>
				{tag}
			</text>
		</g>
	</g>
);

/* the rent monster: a house with eyes and teeth that eats clocks */
export const RentMonster: React.FC<{x: number; y: number; f: number; chomp: number; s?: number}> = ({x, y, f, chomp, s = 1}) => {
	const open = 10 + 40 * Math.abs(Math.sin(chomp * Math.PI * 3));
	return (
		<g transform={`translate(${x},${y}) scale(${s})`}>
			<ellipse cx={0} cy={6} rx={240} ry={24} fill="#000" opacity={0.3} />
			<path d="M-200,0 L-200,-300 L0,-460 L200,-300 L200,0 Z" fill="#7a5cc4" />
			<path d="M-230,-290 L0,-480 L230,-290" stroke="#5a3d9a" strokeWidth={30} fill="none" strokeLinejoin="round" />
			<rect x={-150} y={-280} width={110} height={90} rx={10} fill="#fff" />
			<rect x={40} y={-280} width={110} height={90} rx={10} fill="#fff" />
			<circle cx={-90 + Math.sin(f / 9) * 16} cy={-230} r={22} fill="#11142c" />
			<circle cx={100 + Math.sin(f / 9) * 16} cy={-230} r={22} fill="#11142c" />
			<path d="M-160,-310 L-40,-290 M160,-310 L40,-290" stroke="#11142c" strokeWidth={12} strokeLinecap="round" />
			<rect x={-140} y={-150} width={280} height={open + 20} rx={20} fill="#2a1030" />
			{Array.from({length: 6}).map((_, i) => (
				<path key={i} d={`M${-130 + i * 46},-150 l20,26 l20,-26 Z`} fill="#fff" />
			))}
			<text x={0} y={-370} textAnchor="middle" fontSize={44} fontFamily={FONT} fontWeight={900} fill="#ffd34a">
				RENT
			</text>
		</g>
	);
};

/* parchment with a quill-written quote */
export const Parchment: React.FC<{x: number; y: number; write: number; stamp: number}> = ({x, y, write, stamp}) => (
	<g transform={`translate(${x},${y}) rotate(-3)`}>
		<rect x={-380} y={-200} width={760} height={400} rx={14} fill="#000" opacity={0.3} transform="translate(12,16)" style={{filter: 'blur(10px)'}} />
		<path d="M-380,-200 Q0,-230 380,-200 L380,200 Q0,230 -380,200 Z" fill="#efe0b8" />
		<clipPath id="quill">
			<rect x={-380} y={-200} width={760 * write} height={400} />
		</clipPath>
		<g clipPath="url(#quill)">
			<text y={-40} textAnchor="middle" fontSize={64} fontFamily={HAND} fontWeight={700} fill="#3a2a1a">
				"Remember that
			</text>
			<text y={40} textAnchor="middle" fontSize={64} fontFamily={HAND} fontWeight={700} fill="#3a2a1a">
				time is money."
			</text>
			<text x={250} y={140} textAnchor="end" fontSize={40} fontFamily={HAND} fill="#5a4a3a">
				— B. Franklin, 1748
			</text>
		</g>
		{stamp > 0 ? (
			<g transform={`translate(180,-110) rotate(-16) scale(${1 + (1 - Math.min(1, stamp)) * 1.4})`} opacity={Math.min(1, stamp * 1.5)}>
				<rect x={-130} y={-40} width={260} height={80} rx={8} fill="none" stroke="#d23b3b" strokeWidth={8} />
				<text y={16} textAnchor="middle" fontSize={46} fontFamily={FONT} fontWeight={900} fill="#d23b3b">
					RECEIPT
				</text>
			</g>
		) : null}
	</g>
);

/* coupon slip */
export const Coupon: React.FC<{x: number; y: number; rot: number; text: string}> = ({x, y, rot, text}) => (
	<g transform={`translate(${x},${y}) rotate(${rot})`}>
		<rect x={-110} y={-50} width={220} height={100} rx={6} fill="#fff4cf" stroke="#e47a3c" strokeWidth={4} strokeDasharray="10 6" />
		<text y={14} textAnchor="middle" fontSize={40} fontFamily={FONT} fontWeight={900} fill="#e4473c">
			{text}
		</text>
	</g>
);
export const CakeSlice = () => (
	<g transform="translate(6,-8)">
		<path d="M-22,0 L22,0 L22,-22 L-22,-30 Z" fill="#f4efe2" />
		<path d="M-22,-14 L22,-10" stroke="#e4473c" strokeWidth={5} />
		<circle cx={0} cy={-32} r={6} fill="#e4473c" />
	</g>
);
export const PartyBg: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<Wall id="pt-bg" top="#2a1f4a" bot="#3a2a5a" />
		{Array.from({length: 9}).map((_, i) => (
			<path key={i} d={`M${-200 + i * 280},120 l140,60 l140,-60`} stroke="#c9ccd6" strokeWidth={3} fill="none" />
		))}
		{Array.from({length: 18}).map((_, i) => (
			<path key={'f' + i} d={`M${-200 + i * 140},${146 + (i % 2) * 6} l26,46 l26,-46 Z`} fill={['#e4473c', '#ffd34a', '#3fcf7a', '#4f7dd8'][i % 4]} />
		))}
		{Array.from({length: 40}).map((_, i) => (
			<rect key={'c' + i} x={(random('cf' + i) * 2200 - 100 + f * 0.5) % 2200} y={(random('cy' + i) * 900 + f * (1 + random('cs' + i))) % 900} width={8} height={14} fill={['#e4473c', '#ffd34a', '#3fcf7a', '#4f7dd8'][i % 4]} opacity={0.7} transform={`rotate(${i * 40 + f * 3})`} />
		))}
		<Floor y={900} c="#3a2f4a" />
	</Svg>
);

export {lighten};

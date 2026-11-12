import React from 'react';
import {random} from 'remotion';
import {Svg} from '../engine/camera';
import {darken} from '../engine/color';
import {FONT, HAND} from '../kit/ui';

/* Locations for parts 5–6: hospital, bus, office. Same night palette. */

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

/* hospital waiting room: teal walls, cold light, a sign, a row of plastic chairs drawn by the scene */
export const Hospital: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<Wall id="hos-w" top="#1f4a50" bot="#2a5a60" />
		<rect x={-400} y={560} width={2800} height={12} fill="#3a7a80" />
		{[0, 1, 2].map((i) => (
			<rect key={i} x={160 + i * 640} y={-40} width={300} height={24} rx={8} fill="#e9fbff" opacity={0.85 + (i === 1 ? 0.15 * Math.sin(f / 2) * (random('fl' + Math.floor(f / 7)) > 0.8 ? 1 : 0) : 0)} />
		))}
		<g transform="translate(960,190)">
			<rect x={-330} y={-60} width={660} height={120} rx={14} fill="#e9fbff" />
			<text y={20} textAnchor="middle" fontSize={56} fontFamily={FONT} fontWeight={900} fill="#1f4a50">
				ST. MERCY HOSPITAL
			</text>
		</g>
		<g transform="translate(1550,330)">
			<rect x={-70} y={-70} width={140} height={140} rx={20} fill="#e4473c" />
			<rect x={-16} y={-46} width={32} height={92} fill="#fff" />
			<rect x={-46} y={-16} width={92} height={32} fill="#fff" />
		</g>
		<g transform="translate(330,380)">
			<rect x={-90} y={-110} width={180} height={220} rx={8} fill="#f4efe2" />
			<text y={-60} textAnchor="middle" fontSize={26} fontFamily={HAND} fill="#1f4a50">
				Wash your
			</text>
			<text y={-26} textAnchor="middle" fontSize={26} fontFamily={HAND} fill="#1f4a50">
				hands!
			</text>
		</g>
		<Floor y={900} c="#3a5a5e" />
	</Svg>
);
/* waiting-room plastic chair (side view): seat top at y = 826, backrest on the side it faces away from */
export const PlasticChair: React.FC<{x: number; c?: string; facing?: 1 | -1}> = ({x, c = '#e47a3c', facing = 1}) => (
	<g transform={`translate(${x},0) scale(${facing},1)`}>
		<rect x={-40} y={856} width={100} height={8} fill="#2a2f3a" />
		<rect x={-34} y={840} width={8} height={62} fill="#2a2f3a" />
		<rect x={42} y={840} width={8} height={62} fill="#2a2f3a" />
		<path d={`M-52,700 Q-60,770 -50,836 L-36,836 Q-46,770 -38,700 Z`} fill={c} />
		<rect x={-56} y={690} width={22} height={70} rx={10} fill={c} />
		<rect x={-52} y={822} width={112} height={18} rx={8} fill={c} />
		<rect x={-52} y={822} width={112} height={6} rx={3} fill="#fff" opacity={0.2} />
	</g>
);
/* front desk with a big payment screen; `paid` turns it green */
export const FrontDesk: React.FC<{x: number; paid: number; amount: string}> = ({x, paid, amount}) => (
	<g>
		<rect x={x - 40} y={712} width={760} height={22} rx={6} fill="#e9fbff" />
		<rect x={x - 30} y={734} width={740} height={200} fill="#3a7a80" />
		<g transform={`translate(${x + 120},712)`}>
			<rect x={-14} y={-90} width={28} height={90} fill="#2a2633" />
			<rect x={-150} y={-300} width={300} height={220} rx={14} fill="#15161d" />
			<rect x={-138} y={-288} width={276} height={196} rx={8} fill={paid > 0.5 ? '#3fcf7a' : '#f4f6fb'} />
			<text y={-232} textAnchor="middle" fontSize={20} fontFamily={FONT} fontWeight={700} fill="#5a6078">
				{paid > 0.5 ? 'PAYMENT COMPLETE' : 'PATIENT: MOM'}
			</text>
			<text y={-174} textAnchor="middle" fontSize={50} fontFamily={FONT} fontWeight={900} fill="#13203a">
				{paid > 0.5 ? '✓' : amount}
			</text>
			{paid > 0.5 ? null : (
				<g transform="translate(0,-122)">
					<rect x={-70} y={-24} width={140} height={48} rx={24} fill="#e47a3c" />
					<text y={10} textAnchor="middle" fontSize={28} fontFamily={FONT} fontWeight={900} fill="#fff">
						PAY
					</text>
				</g>
			)}
		</g>
	</g>
);

/* inside a night bus: windows with the city sliding past, yellow poles, seats, a card validator */
export const BusInside: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<rect x={-400} y={-300} width={2800} height={1300} fill="#24305a" />
		<rect x={-400} y={120} width={2800} height={360} fill="#141a38" />
		<clipPath id="bus-win">
			{[0, 1, 2, 3, 4].map((i) => (
				<rect key={i} x={-260 + i * 520} y={150} width={460} height={300} rx={24} />
			))}
		</clipPath>
		<g clipPath="url(#bus-win)">
			<rect x={-400} y={120} width={2800} height={360} fill="#0d1230" />
			{Array.from({length: 18}).map((_, i) => {
				const x = ((i * 260 - f * 14) % 4680 + 4680) % 4680 - 600;
				const h = 120 + ((i * 53) % 160);
				return (
					<g key={i}>
						<rect x={x} y={460 - h} width={200} height={h} fill={i % 2 ? '#1b2350' : '#161d44'} />
						{Array.from({length: 6}).map((__, r) => (random('bw' + i + r) > 0.45 ? <rect key={r} x={x + 20 + (r % 3) * 60} y={480 - h + Math.floor(r / 3) * 50} width={22} height={24} fill="#ffd27a" opacity={0.6} /> : null))}
					</g>
				);
			})}
			{Array.from({length: 8}).map((_, i) => {
				const x = ((i * 600 - f * 30) % 4800 + 4800) % 4800 - 600;
				return <circle key={'l' + i} cx={x} cy={200} r={10} fill="#fff4cf" opacity={0.8} />;
			})}
		</g>
		{[0, 1, 2, 3, 4].map((i) => (
			<rect key={i} x={-260 + i * 520} y={150} width={460} height={300} rx={24} fill="none" stroke="#3a4680" strokeWidth={10} />
		))}
		{/* handrail and hanging straps */}
		<rect x={-400} y={70} width={2800} height={12} rx={6} fill="#ffd34a" />
		{Array.from({length: 12}).map((_, i) => (
			<g key={i} transform={`translate(${-200 + i * 200},82) rotate(${Math.sin(f / 9 + i) * 4})`}>
				<line x1={0} y1={0} x2={0} y2={60} stroke="#c9ccd6" strokeWidth={4} />
				<circle cx={0} cy={72} r={14} fill="none" stroke="#c9ccd6" strokeWidth={5} />
			</g>
		))}
		{/* seats along the wall */}
		{[0, 1, 2, 3].map((i) => (
			<g key={i} transform={`translate(${200 + i * 460},0)`}>
				<rect x={0} y={640} width={130} height={170} rx={20} fill="#3d6fd6" />
				<rect x={-10} y={800} width={170} height={30} rx={10} fill="#2f5fd0" />
				<rect x={60} y={830} width={14} height={70} fill="#1b1a26" />
			</g>
		))}
		<rect x={-400} y={900} width={2800} height={300} fill="#2a2f4a" />
		<rect x={-400} y={900} width={2800} height={10} fill="#1b1a26" />
		{Array.from({length: 40}).map((_, i) => (
			<rect key={i} x={-400 + i * 80} y={930} width={40} height={6} fill="#3a4060" />
		))}
	</Svg>
);
/* yellow pole with a card validator (drawn on the actors' layer) */
export const Validator: React.FC<{x: number; ok: number}> = ({x, ok}) => (
	<g>
		<rect x={x - 7} y={70} width={14} height={830} fill="#ffd34a" />
		<g transform={`translate(${x + 8},620)`}>
			<rect x={0} y={-60} width={70} height={110} rx={10} fill="#2a2633" />
			<rect x={8} y={-50} width={54} height={44} rx={6} fill={ok > 0.5 ? '#3fcf7a' : '#9fd8ff'} />
			<text x={35} y={-20} textAnchor="middle" fontSize={16} fontFamily={FONT} fontWeight={900} fill="#11142c">
				{ok > 0.5 ? 'OK ✓' : '$4.00'}
			</text>
			<circle cx={35} cy={22} r={14} fill="#4a4f60" />
		</g>
	</g>
);

/* city bus at night, door open; the scene puts people in front */
export const Bus: React.FC<{x: number; y: number; f: number}> = ({x, y, f}) => (
	<g transform={`translate(${x},${y})`}>
		<rect x={-520} y={-420} width={1040} height={380} rx={40} fill="#3d6fd6" />
		<rect x={-520} y={-120} width={1040} height={60} fill="#2f5fd0" />
		{[0, 1, 2, 3, 4].map((i) => (
			<rect key={i} x={-480 + i * 180} y={-380} width={150} height={150} rx={14} fill={i === 3 ? '#1d2a52' : '#ffe3a0'} opacity={i === 3 ? 1 : 0.75} />
		))}
		<rect x={60} y={-380} width={110} height={330} rx={8} fill="#ffe3a0" opacity={0.9} />
		<rect x={-520} y={-460} width={300} height={44} rx={10} fill="#11142c" />
		<text x={-370} y={-428} textAnchor="middle" fontSize={30} fontFamily={FONT} fontWeight={900} fill="#ffd34a">
			12 · HOSPITAL
		</text>
		{[-340, 340].map((wx) => (
			<g key={wx} transform={`translate(${wx},-30)`}>
				<circle r={56} fill="#0d0f1c" />
				<circle r={28} fill="#8c93ad" />
			</g>
		))}
		<circle cx={500} cy={-110} r={20} fill="#fff6c8" opacity={0.8 + 0.2 * Math.sin(f / 4)} />
	</g>
);

/* office at night: desks with glowing monitors, a big wall clock */
export const Office: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<Wall id="off-w" top="#1a2240" bot="#222c50" />
		{[0, 1, 2, 3, 4, 5].map((i) => (
			<g key={i}>
				<rect x={-300 + i * 420} y={80} width={340} height={420} fill="#141a38" stroke="#2e3a6a" strokeWidth={8} />
				{/* far towers seen through the pane, kept inside it */}
				{[0, 1, 2].map((b) => (
					<g key={b}>
						<rect x={-280 + i * 420 + b * 105} y={200 + ((i + b) % 3) * 50} width={90} height={296 - ((i + b) % 3) * 50} fill="#1b2350" />
						{Array.from({length: 6}).map((_, r) =>
							random('ow' + i + b + r) > 0.5 ? <rect key={r} x={-262 + i * 420 + b * 105 + (r % 2) * 34} y={220 + ((i + b) % 3) * 50 + Math.floor(r / 2) * 60} width={16} height={22} fill="#ffd27a" opacity={0.5} /> : null,
						)}
					</g>
				))}
			</g>
		))}
		<g transform="translate(960,190)">
			<circle r={90} fill="#f4f6fb" stroke="#5a6078" strokeWidth={8} />
			<line x1={0} y1={0} x2={0} y2={-60} stroke="#13203a" strokeWidth={8} strokeLinecap="round" transform={`rotate(${f * 6})`} />
			<line x1={0} y1={0} x2={44} y2={0} stroke="#13203a" strokeWidth={10} strokeLinecap="round" transform={`rotate(${f * 0.5})`} />
		</g>
		<Floor y={900} c="#2a2f4a" />
	</Svg>
);
export const DeskMonitor: React.FC<{x: number; f: number}> = ({x, f}) => (
	<g>
		<rect x={x - 160} y={720} width={320} height={16} rx={6} fill="#5a4a3a" />
		<rect x={x - 150} y={736} width={14} height={170} fill="#3a2f2a" />
		<rect x={x + 136} y={736} width={14} height={170} fill="#3a2f2a" />
		<rect x={x - 10} y={680} width={20} height={40} fill="#2a2633" />
		<rect x={x - 90} y={590} width={180} height={100} rx={8} fill="#15161d" />
		<rect x={x - 82} y={598} width={164} height={84} rx={4} fill="#3d6fd6" opacity={0.8 + 0.2 * Math.sin(f / 9 + x)} />
		<circle cx={x} cy={640} r={120} fill="#7cc4ff" opacity={0.1} style={{filter: 'blur(20px)'}} />
	</g>
);

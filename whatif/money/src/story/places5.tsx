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
/* one plastic chair (side view), seat at y≈790 */
export const PlasticChair: React.FC<{x: number; c?: string}> = ({x, c = '#e47a3c'}) => (
	<g transform={`translate(${x},0)`}>
		<rect x={-50} y={790} width={100} height={14} rx={6} fill={c} />
		<rect x={-50} y={690} width={14} height={110} rx={6} fill={c} />
		<rect x={-40} y={804} width={8} height={96} fill="#2a2f3a" />
		<rect x={32} y={804} width={8} height={96} fill="#2a2f3a" />
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

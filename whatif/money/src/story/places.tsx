import React from 'react';
import {interpolate, random} from 'remotion';
import {Svg} from '../engine/camera';
import {darken, lighten} from '../engine/color';
import {FONT, HAND} from '../kit/ui';

/* Locations of "What if every dollar cost you a minute of your life?".
   One night palette for the whole video: deep navy outside, warm amber light inside. */

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

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
/* warm hanging lamp with a glow pool */
const Pendant: React.FC<{x: number; y: number; f: number; seed: string}> = ({x, y, f, seed}) => {
	const sway = Math.sin(f / 40 + random(seed) * 6) * 2;
	return (
		<g transform={`rotate(${sway} ${x} -300)`}>
			<line x1={x} y1={-300} x2={x} y2={y - 26} stroke="#1b1a26" strokeWidth={4} />
			<circle cx={x} cy={y + 30} r={150} fill="#ffcf7a" opacity={0.16} style={{filter: 'blur(30px)'}} />
			<path d={`M${x - 48},${y + 12} Q${x},${y - 60} ${x + 48},${y + 12} Z`} fill="#2a2633" />
			<ellipse cx={x} cy={y + 14} rx={30} ry={8} fill="#ffe7b0" />
		</g>
	);
};

/* ----------------------------------- cafe ----------------------------------- */
// back wall with a chalk menu, a window onto the night street, espresso machine, pendants
export const Cafe: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<Wall id="cafe-w" top="#3b2a2e" bot="#5a3d36" />
		{/* brick hint */}
		{Array.from({length: 16}).map((_, r) =>
			Array.from({length: 26}).map((__, c) =>
				random(`br${r}-${c}`) > 0.82 ? <rect key={`${r}-${c}`} x={-300 + c * 100 + (r % 2) * 50} y={-200 + r * 44} width={92} height={36} rx={4} fill="#6a463c" opacity={0.45} /> : null,
			),
		)}
		{/* window onto the night street */}
		<g>
			<rect x={-120} y={170} width={560} height={420} rx={10} fill="#141a3c" />
			<rect x={-110} y={180} width={540} height={400} fill="#1d2552" />
			{[0, 1, 2, 3, 4].map((i) => (
				<rect key={i} x={-90 + i * 110} y={300 - (i % 3) * 50} width={90} height={400} fill={i % 2 ? '#141a38' : '#18204a'} />
			))}
			{Array.from({length: 26}).map((_, i) => (
				<rect key={i} x={-80 + (i % 9) * 56} y={330 + Math.floor(i / 9) * 60} width={16} height={20} fill="#ffd27a" opacity={0.35 + 0.3 * (random('cw' + i) > 0.5 ? 1 : 0)} />
			))}
			<rect x={155} y={170} width={14} height={420} fill="#2a1f22" />
			<rect x={-120} y={370} width={560} height={12} fill="#2a1f22" />
			<text x={160} y={250} textAnchor="middle" fontSize={44} fontFamily={HAND} fill="#ffd27a" opacity={0.85} transform="scale(-1,1) translate(-320,0)">
				Bean There
			</text>
		</g>
		{/* chalk menu */}
		<g transform="translate(640,120)">
			<rect x={0} y={0} width={620} height={330} rx={14} fill="#1f2a26" stroke="#7a5236" strokeWidth={14} />
			<text x={310} y={66} textAnchor="middle" fontSize={50} fontFamily={HAND} fill="#f4efe2">
				MENU
			</text>
			{[
				['Coffee', '$5'],
				['Latte', '$6'],
				['Muffin', '$4'],
				['Bagel', '$3'],
			].map(([n, p], i) => (
				<g key={n}>
					<text x={50} y={124 + i * 52} fontSize={40} fontFamily={HAND} fill="#f4efe2">
						{n}
					</text>
					<line x1={190} y1={114 + i * 52} x2={470} y2={114 + i * 52} stroke="#f4efe2" strokeWidth={2} strokeDasharray="4 10" opacity={0.5} />
					<text x={570} y={124 + i * 52} textAnchor="end" fontSize={40} fontFamily={HAND} fill={i === 0 ? '#ffc94a' : '#f4efe2'}>
						{p}
					</text>
				</g>
			))}
		</g>
		{/* shelves with cups and jars */}
		{[0, 1].map((r) => (
			<g key={r}>
				<rect x={1360} y={230 + r * 150} width={520} height={12} fill="#7a5236" />
				{Array.from({length: 7}).map((_, i) => (
					<g key={i} transform={`translate(${1390 + i * 70},${230 + r * 150})`}>
						{(i + r) % 3 === 0 ? (
							<rect x={-18} y={-70} width={40} height={70} rx={8} fill="#c98a4a" opacity={0.9} />
						) : (
							<>
								<rect x={-18} y={-40} width={36} height={40} rx={6} fill={['#f4efe2', '#e47a3c', '#3aa37a'][(i + r) % 3]} />
								<path d="M18,-32 q14,0 14,12 q0,12 -14,12" stroke={['#f4efe2', '#e47a3c', '#3aa37a'][(i + r) % 3]} strokeWidth={6} fill="none" />
							</>
						)}
					</g>
				))}
			</g>
		))}
		<Pendant x={760} y={-10} f={f} seed="p1" />
		<Pendant x={1260} y={-30} f={f} seed="p2" />
		<Floor y={900} c="#6b4a3a" planks />
	</Svg>
);

/* the counter in front of the barista (draw on a layer above the barista, below the hero) */
export const CafeCounter: React.FC<{f: number; x?: number}> = ({f, x = 1000}) => (
	<g>
		{/* espresso machine with steam */}
		<g transform={`translate(${x + 560},560)`}>
			<rect x={-110} y={-20} width={220} height={170} rx={16} fill="#c9ccd6" />
			<rect x={-110} y={-20} width={220} height={40} rx={14} fill="#9a9eae" />
			<rect x={-60} y={60} width={34} height={44} rx={6} fill="#2a2633" />
			<rect x={26} y={60} width={34} height={44} rx={6} fill="#2a2633" />
			<circle cx={70} cy={30} r={14} fill="#e47a3c" />
			{[0, 1, 2].map((i) => {
				const t = ((f + i * 20) % 60) / 60;
				return <circle key={i} cx={-60 + Math.sin(t * 6 + i) * 10} cy={-30 - t * 120} r={14 + t * 20} fill="#fff" opacity={0.25 * (1 - t)} />;
			})}
		</g>
		<rect x={x - 40} y={712} width={1100} height={22} rx={6} fill="#c98a5a" />
		<rect x={x - 30} y={734} width={1080} height={200} fill="#8a5a3c" />
		{Array.from({length: 9}).map((_, i) => (
			<rect key={i} x={x - 10 + i * 118} y={760} width={98} height={150} rx={6} fill="#7a4e34" />
		))}
	</g>
);

/* card reader on the counter; `paid` 0..1 turns the screen green */
export const Terminal: React.FC<{x: number; y: number; paid: number; amount: string; s?: number}> = ({x, y, paid, amount, s = 1}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<path d="M-34,0 L-28,-80 L28,-80 L34,0 Z" fill="#23252f" />
		<rect x={-24} y={-74} width={48} height={40} rx={4} fill={paid > 0.5 ? '#3fcf7a' : '#bfe3ff'} />
		{paid > 0.5 ? (
			<path d="M-10,-54 l7,8 l14,-16" stroke="#0e3a22" strokeWidth={5} fill="none" strokeLinecap="round" />
		) : (
			<text x={0} y={-48} textAnchor="middle" fontSize={15} fontFamily={FONT} fontWeight={800} fill="#13203a">
				{amount}
			</text>
		)}
		{[0, 1, 2].map((r) => [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={-18 + c * 13} y={-28 + r * 8} width={9} height={5} rx={1} fill="#4a4f60" />))}
		{paid > 0 && paid < 1 ? <circle cx={0} cy={-54} r={40 + 60 * paid} fill="none" stroke="#3fcf7a" strokeWidth={6 * (1 - paid)} /> : null}
	</g>
);

/* ------------------------------ night apartment ------------------------------ */
// small living room: window with the city, wall calendar, sofa, floor lamp
export const Apartment: React.FC<{f: number; page?: number}> = ({f, page = 1}) => (
	<Svg>
		<Wall id="apt-w" top="#232a52" bot="#33366a" />
		<rect x={-400} y={640} width={2800} height={12} fill="#2a2f5a" />
		{/* window */}
		<g>
			<rect x={1180} y={160} width={520} height={440} rx={10} fill="#d8d4ec" />
			<rect x={1196} y={176} width={488} height={408} fill="#0d1230" />
			{[0, 1, 2, 3, 4, 5].map((i) => (
				<rect key={i} x={1200 + i * 82} y={300 + ((i * 37) % 120)} width={70} height={300} fill={i % 2 ? '#151b3e' : '#1b2350'} />
			))}
			{Array.from({length: 40}).map((_, i) => {
				const on = random('aw' + i) > 0.45 && !(random('af' + i + Math.floor(f / 40)) > 0.97);
				return on ? <rect key={i} x={1210 + (i % 10) * 47} y={330 + Math.floor(i / 10) * 60} width={14} height={18} fill="#ffd27a" opacity={0.55} /> : null;
			})}
			<circle cx={1600} cy={240} r={30} fill="#eef1ff" opacity={0.9} />
			<rect x={1432} y={176} width={14} height={408} fill="#d8d4ec" />
			<path d="M1150,150 Q1190,380 1160,620 L1120,620 Z" fill="#7a3f52" />
			<path d="M1730,150 Q1690,380 1720,620 L1760,620 Z" fill="#7a3f52" />
		</g>
		{/* wall calendar; `page` flips on «rent day» */}
		<g transform="translate(250,180)">
			<rect x={0} y={0} width={250} height={290} rx={8} fill="#f4efe2" />
			<rect x={0} y={0} width={250} height={60} rx={8} fill="#d94a3a" />
			<text x={125} y={42} textAnchor="middle" fontSize={30} fontFamily={FONT} fill="#fff">
				{page > 0.5 ? 'MARCH' : 'FEBRUARY'}
			</text>
			{Array.from({length: 28}).map((_, i) => (
				<rect key={i} x={18 + (i % 7) * 32} y={78 + Math.floor(i / 7) * 34} width={22} height={22} rx={3} fill="#d8d0bc" opacity={page > 0.5 && i > 0 ? 0.5 : 0.9} />
			))}
			{page > 0.5 ? (
				<g>
					<circle cx={29} cy={89} r={22} fill="none" stroke="#d94a3a" strokeWidth={5} />
					<text x={125} y={265} textAnchor="middle" fontSize={34} fontFamily={HAND} fill="#d94a3a">
						RENT DAY!
					</text>
				</g>
			) : null}
			{/* page flying away */}
			{page > 0 && page < 1 ? (
				<g transform={`translate(0,${-page * 160}) rotate(${-page * 40})`} opacity={1 - page}>
					<rect x={0} y={60} width={250} height={230} fill="#f4efe2" />
				</g>
			) : null}
		</g>
		{/* floor lamp */}
		<g>
			<rect x={96} y={420} width={8} height={480} fill="#1b1a26" />
			<path d="M40,430 L160,430 L130,350 L70,350 Z" fill="#e8c98a" />
			<circle cx={100} cy={440} r={200} fill="#ffcf7a" opacity={0.14} style={{filter: 'blur(40px)'}} />
		</g>
		{/* sofa */}
		<g transform="translate(560,0)">
			<rect x={0} y={700} width={520} height={160} rx={30} fill="#3f6d8f" />
			<rect x={-30} y={760} width={70} height={140} rx={20} fill="#355d7c" />
			<rect x={480} y={760} width={70} height={140} rx={20} fill="#355d7c" />
			<rect x={20} y={780} width={480} height={70} rx={20} fill="#4a7ea3" />
		</g>
		<Floor y={900} c="#3a2f4a" planks />
	</Svg>
);

/* phone in close-up: a banking app, `tap` 0..1 presses PAY, `done` shows the receipt */
export const PhonePay: React.FC<{x: number; y: number; s?: number; tap: number; done: number; amount: string; what: string}> = ({x, y, s = 1, tap, done, amount, what}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<rect x={-160} y={-300} width={320} height={600} rx={44} fill="#000" opacity={0.3} transform="translate(14,20)" style={{filter: 'blur(14px)'}} />
		<rect x={-160} y={-300} width={320} height={600} rx={44} fill="#15161d" />
		<rect x={-146} y={-286} width={292} height={572} rx={34} fill="#f4f6fb" />
		<rect x={-40} y={-280} width={80} height={16} rx={8} fill="#15161d" />
		<text x={0} y={-210} textAnchor="middle" fontSize={26} fontFamily={FONT} fontWeight={700} fill="#5a6078">
			{what}
		</text>
		<text x={0} y={-120} textAnchor="middle" fontSize={72} fontFamily={FONT} fontWeight={900} fill="#13203a">
			{amount}
		</text>
		<rect x={-110} y={-70} width={220} height={4} rx={2} fill="#dde1ec" />
		<text x={0} y={-20} textAnchor="middle" fontSize={22} fontFamily={FONT} fill="#8a90a6">
			Due today
		</text>
		<g transform={`translate(0,170) scale(${1 - 0.08 * Math.sin(Math.min(1, tap) * Math.PI)})`}>
			<rect x={-110} y={-44} width={220} height={88} rx={44} fill={done > 0.5 ? '#3fcf7a' : '#e47a3c'} />
			<text x={0} y={14} textAnchor="middle" fontSize={40} fontFamily={FONT} fontWeight={900} fill="#fff">
				{done > 0.5 ? 'PAID ✓' : 'PAY'}
			</text>
		</g>
		{tap > 0 && tap < 1 ? <circle cx={20} cy={170} r={20 + 70 * tap} fill="#e47a3c" opacity={0.35 * (1 - tap)} /> : null}
	</g>
);

/* ---------------------------------- hallway ---------------------------------- */
// apartment entrance at night: front door with a slit of light under it
export const Hallway: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<Wall id="hall-w" top="#1b2045" bot="#272b58" />
		<rect x={-400} y={620} width={2800} height={14} fill="#20244c" />
		{/* coat rack */}
		<g>
			<rect x={420} y={300} width={160} height={14} rx={6} fill="#3a2f4a" />
			<path d="M450,314 q-20,40 -6,160 l50,0 q14,-120 -4,-160 z" fill="#3f6d8f" />
			<path d="M530,314 q-16,30 -4,110 l40,0 q10,-80 -6,-110 z" fill="#7a3f52" />
		</g>
		{/* door */}
		<g transform="translate(1100,0)">
			<rect x={-20} y={180} width={440} height={724} rx={6} fill="#141836" />
			<rect x={0} y={200} width={400} height={704} rx={4} fill="#4a3a5c" />
			<rect x={40} y={250} width={320} height={260} rx={8} fill="#433452" />
			<rect x={40} y={560} width={320} height={300} rx={8} fill="#433452" />
			<circle cx={350} cy={560} r={16} fill="#d9b25a" />
			<circle cx={200} cy={300} r={10} fill="#1b1a26" />
			{/* light under the door from the stairwell */}
			<rect x={0} y={896} width={400} height={6} fill="#ffe3a0" opacity={0.85} />
			<path d="M0,902 L400,902 L520,1100 L-120,1100 Z" fill="#ffe3a0" opacity={0.12 + 0.03 * Math.sin(f / 7)} />
		</g>
		{/* doormat */}
		<rect x={1090} y={920} width={420} height={30} rx={10} fill="#5a4a3a" />
		<Floor y={900} c="#2e2840" planks />
	</Svg>
);

/* the envelope from under the door, in close-up */
export const Envelope: React.FC<{x: number; y: number; s?: number; rot?: number; open?: number; glow?: number}> = ({x, y, s = 1, rot = 0, open = 1, glow = 0}) => (
	<g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
		{glow > 0 ? <rect x={-300} y={-170} width={600} height={340} rx={30} fill="#ff4a4a" opacity={0.35 * glow} style={{filter: 'blur(30px)'}} /> : null}
		<rect x={-260} y={-150} width={520} height={300} rx={10} fill="#000" opacity={0.3} transform="translate(10,16)" style={{filter: 'blur(10px)'}} />
		<rect x={-260} y={-150} width={520} height={300} rx={10} fill="#f2ecdc" />
		<path d="M-260,-150 L0,30 L260,-150" stroke="#d8cfb8" strokeWidth={4} fill="none" />
		<g opacity={open}>
			<text x={-230} y={-100} fontSize={22} fontFamily={FONT} fontWeight={700} fill="#5a6078">
				ST. MERCY HOSPITAL
			</text>
			<text x={-230} y={70} fontSize={22} fontFamily={FONT} fill="#5a6078">
				AMOUNT DUE:
			</text>
			<text x={-230} y={124} fontSize={52} fontFamily={FONT} fontWeight={900} fill="#13203a">
				$ ???,???
			</text>
			<g transform="translate(150,-60) rotate(-10)">
				<rect x={-110} y={-36} width={220} height={72} rx={8} fill="none" stroke="#d23b3b" strokeWidth={6} />
				<text x={0} y={14} textAnchor="middle" fontSize={34} fontFamily={FONT} fontWeight={900} fill="#d23b3b">
					FINAL NOTICE
				</text>
			</g>
		</g>
	</g>
);

/* a one-dollar coin that flips into a clock face (`k` 0 = coin, 1 = clock) */
export const CoinClock: React.FC<{x: number; y: number; r: number; k: number; f: number}> = ({x, y, r, k, f}) => {
	const flip = Math.cos(k * Math.PI);
	const clock = k > 0.5;
	const sx = Math.max(0.04, Math.abs(flip));
	const hand = (f * 6) % 360;
	return (
		<g transform={`translate(${x},${y + Math.sin(f / 14) * 8})`}>
			<circle r={r * 1.6} fill={clock ? '#9fd8ff' : '#ffd34a'} opacity={0.18} style={{filter: 'blur(26px)'}} />
			<g transform={`scale(${sx},1)`}>
				<circle r={r} fill={clock ? '#f4f6fb' : '#f2b21c'} stroke={clock ? '#13203a' : '#b9800c'} strokeWidth={r * 0.1} />
				{clock ? (
					<>
						{Array.from({length: 12}).map((_, i) => {
							const a = (i / 12) * Math.PI * 2;
							return <line key={i} x1={Math.sin(a) * r * 0.78} y1={-Math.cos(a) * r * 0.78} x2={Math.sin(a) * r * 0.9} y2={-Math.cos(a) * r * 0.9} stroke="#13203a" strokeWidth={r * 0.05} strokeLinecap="round" />;
						})}
						<line x1={0} y1={0} x2={0} y2={-r * 0.45} stroke="#13203a" strokeWidth={r * 0.08} strokeLinecap="round" />
						<line x1={0} y1={0} x2={Math.sin((hand * Math.PI) / 180) * r * 0.7} y2={-Math.cos((hand * Math.PI) / 180) * r * 0.7} stroke="#e4473c" strokeWidth={r * 0.05} strokeLinecap="round" />
						<circle r={r * 0.07} fill="#13203a" />
						<text y={r * 0.45} textAnchor="middle" fontSize={r * 0.26} fontFamily={FONT} fontWeight={900} fill="#13203a">
							1 MIN
						</text>
					</>
				) : (
					<>
						<circle r={r * 0.8} fill="none" stroke="#ffe08a" strokeWidth={r * 0.04} />
						<text y={r * 0.3} textAnchor="middle" fontSize={r * 0.9} fontFamily={FONT} fontWeight={900} fill="#fff4cf" stroke="#b9800c" strokeWidth={r * 0.03}>
							$1
						</text>
					</>
				)}
			</g>
		</g>
	);
};

/* balance scales: $1 on one pan, 1 MIN on the other; `tip` tilts it (−1..1) */
export const Scales: React.FC<{x: number; y: number; s?: number; tip: number; on: number}> = ({x, y, s = 1, tip, on}) => {
	const a = tip * 12;
	const rad = (a * Math.PI) / 180;
	const L = 170;
	const lx = -Math.cos(rad) * L;
	const ly = -Math.sin(rad) * L;
	const rx = Math.cos(rad) * L;
	const ry = Math.sin(rad) * L;
	return (
		<g transform={`translate(${x},${y}) scale(${s * on})`} opacity={Math.min(1, on * 1.4)}>
			<rect x={-8} y={0} width={16} height={230} fill="#d9b25a" />
			<rect x={-70} y={222} width={140} height={20} rx={8} fill="#b9902a" />
			<line x1={lx} y1={ly} x2={rx} y2={ry} stroke="#d9b25a" strokeWidth={12} strokeLinecap="round" />
			<circle r={16} fill="#f2d58a" />
			{[
				[lx, ly, '$1', '#f2b21c'],
				[rx, ry, '1 MIN', '#9fd8ff'],
			].map(([px, py, t, c], i) => (
				<g key={i} transform={`translate(${px},${py})`}>
					<line x1={-50} y1={90} x2={0} y2={0} stroke="#d9b25a" strokeWidth={3} />
					<line x1={50} y1={90} x2={0} y2={0} stroke="#d9b25a" strokeWidth={3} />
					<path d="M-70,90 Q0,130 70,90 Z" fill="#d9b25a" />
					<rect x={-52} y={36} width={104} height={50} rx={12} fill={c as string} />
					<text y={71} textAnchor="middle" fontSize={i ? 26 : 34} fontFamily={FONT} fontWeight={900} fill="#13203a">
						{t}
					</text>
				</g>
			))}
		</g>
	);
};

export const fade = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);
export {lighten};

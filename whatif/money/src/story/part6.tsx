import React from 'react';
import {AbsoluteFill, interpolate, random, spring} from 'remotion';
import {Pose, Stickman, toLocal} from '../engine/Stickman';
import {env, gesture, idle, reach, walk} from '../kit/actions';
import {Actor, useShot} from '../kit/core';
import type {ShotDef} from '../kit/coverage';
import {HeroBadge, Layer, Stage, Svg, camOn, clamp, usePush} from '../kit/kit';
import {AgeBadge, Cite, FONT} from '../kit/ui';
import {CAST} from './cast';
import {Bang, Card, FL, HS, SFL, StreetBG, badgeY} from './common';
import {Cafe, CafeCounter, SEAT, SeatChair, Terminal} from './places';
import {DeskMonitor, Office} from './places5';
import {BurgerBar} from './places2';

/* PART 6 (≈5:40–6:31): back to reality — everyone pays in minutes; the coffee; the question. */

const useW = () => {
	const {at, end} = useShot();
	return (id: string, frac: number) => at(id) + Math.round((end(id) - at(id)) * frac);
};
const pop = (f: number, t: number) => spring({frame: f - t, fps: 30, config: {damping: 11, stiffness: 160}});
const Big: React.FC<{f: number; t: number; x: number; y: number; text: string; c?: string; size?: number}> = ({f, t, x, y, text, c = '#fff', size = 64}) => {
	const k = pop(f, t);
	if (f < t) return null;
	return (
		<g transform={`translate(${x},${y}) scale(${k})`} opacity={Math.min(1, k * 1.5)}>
			<text textAnchor="middle" fontSize={size} fontFamily={FONT} fontWeight={900} fill={c} stroke="#11142c" strokeWidth={10} paintOrder="stroke">
				{text}
			</text>
		</g>
	);
};

/* 073 «Here's the strange part.» */
const U073: React.FC = () => {
	const {f, gf, at} = useShot();
	const HX = 960;
	const cam = usePush(camOn(960, 520, 1.5), camOn(960, 500, 1.8));
	return (
		<Stage cam={cam} bg="#0b0e22" light={{x: 50, y: 0, o: 0.5, c: '255,240,200'}}>
			<Layer depth={1}>
				<Svg>
					<polygon points="900,-200 1020,-200 1260,900 660,900" fill="#fff4cf" opacity={0.12} />
					<Actor who="hero" x={HX} floor={FL} s={HS} facing={1} faceTurn={0.05} look={[0, 0]} pose={gesture('think', idle(gf, 1), env(f, at('073') + 4, 1e9, 10, 1), f)} uid="h-str" />
					<HeroBadge x={HX} y={badgeY(FL)} s={0.8} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 074 «In real life, the federal minimum wage in America is seven dollars and twenty-five cents an hour.»
   075 «That means for millions of people, one dollar already costs about eight minutes of work.» */
const U074: React.FC<{math?: boolean}> = ({math}) => {
	const {f, gf, at} = useShot();
	const w = useW();
	const WX = 760;
	const flip = Math.sin(gf / 6);
	const workerPose: Pose = reach(idle(gf, 3), 'F', [70 + 10 * flip, -110 - 20 * Math.abs(flip)], 1);
	const cam = usePush(camOn(1000, 540, 1.12), camOn(1000, 520, 1.25));
	return (
		<Stage cam={cam} bg="#3a1f2a" light={{x: 50, y: 10, o: 0.45, c: '255,214,150'}}>
			<Layer depth={1.6}>
				<BurgerBar f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<rect x={520} y={712} width={520} height={22} rx={6} fill="#c9ccd6" />
					<rect x={530} y={734} width={500} height={200} fill="#8a2f2a" />
					<ellipse cx={WX + 120} cy={706 - 30 * Math.abs(flip)} rx={30} ry={10} fill="#7a3f22" />
					<Actor who="clerk" x={WX} floor={FL} s={0.98} facing={1} faceTurn={0.3} look={[0.7, 0.6]} expr="sleepy" mouth="flat" pose={workerPose} uid="worker" />
					{!math ? (
						<g transform={`translate(1380,${420}) scale(${pop(f, at('074') + 30)})`}>
							<rect x={-280} y={-150} width={560} height={300} rx={30} fill="#11142c" stroke="#ffd34a" strokeWidth={6} />
							<text y={-70} textAnchor="middle" fontSize={34} fontFamily={FONT} fontWeight={800} fill="#ffd34a">
								FEDERAL MINIMUM WAGE
							</text>
							<text y={40} textAnchor="middle" fontSize={110} fontFamily={FONT} fontWeight={900} fill="#fff">
								$7.25
							</text>
							<text y={110} textAnchor="middle" fontSize={40} fontFamily={FONT} fontWeight={800} fill="#9fd8ff">
								PER HOUR
							</text>
						</g>
					) : (
						<g>
							<Big f={f} t={at('075') + 6} x={1380} y={330} text="60 MIN ÷ $7.25" c="#ffd34a" size={56} />
							<Big f={f} t={w('075', 0.6)} x={1380} y={450} text="$1 ≈ 8 MIN OF WORK" c="#ff6a5a" size={60} />
						</g>
					)}
					<Cite text="U.S. Department of Labor, federal minimum wage since 2009" t={f - at(math ? '075' : '074')} x={1880} y={1050} />
				</Svg>
			</Layer>
		</Stage>
	);
};
const U074a: React.FC = () => <U074 />;
const U075: React.FC = () => <U074 math />;

/* 076 «Your curse wasn't a curse. It was a discount.» */
const U076: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const HX = 640;
	const strike = interpolate(f, [w('076', 0.35), w('076', 0.45)], [0, 1], clamp);
	const disc = pop(f, w('076', 0.6));
	const laugh = env(f, w('076', 0.6), 1e9, 10, 1);
	const hp: Pose = {...idle(gf, 3), lean: -8 * laugh, head: -10 * laugh + Math.sin(f / 2) * 3 * laugh};
	const cam = usePush(camOn(960, 540, 1.12), camOn(960, 520, 1.25));
	return (
		<Stage cam={cam} bg="#101634" light={{x: 50, y: 20, o: 0.4, night: true}}>
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={HX} floor={FL} s={HS} facing={1} faceTurn={0.3} look={[0.6, -0.2]} mouth={laugh > 0.3 ? 'open' : 'line'} expr={laugh > 0.3 ? 'wide' : 'normal'} pose={hp} uid="h-disc" />
					<HeroBadge x={HX} y={badgeY(FL)} s={0.8} />
					<g transform="translate(1300,360) rotate(-6)">
						<path d="M-260,-90 L200,-90 L270,0 L200,90 L-260,90 Z" fill="#f4efe2" />
						<circle cx={-210} cy={0} r={18} fill="#101634" />
						<text x={0} y={22} textAnchor="middle" fontSize={70} fontFamily={FONT} fontWeight={900} fill="#5a6078">
							CURSE
						</text>
						<line x1={-140} y1={0} x2={-140 + 290 * strike} y2={0} stroke="#d23b3b" strokeWidth={14} strokeLinecap="round" />
					</g>
					<g transform={`translate(1300,640) rotate(4) scale(${disc})`} opacity={Math.min(1, disc * 1.5)}>
						<path d="M-300,-100 L240,-100 L310,0 L240,100 L-300,100 Z" fill="#3fcf7a" />
						<circle cx={-250} cy={0} r={18} fill="#101634" />
						<text x={0} y={-10} textAnchor="middle" fontSize={64} fontFamily={FONT} fontWeight={900} fill="#0e3a22">
							DISCOUNT
						</text>
						<text x={0} y={60} textAnchor="middle" fontSize={44} fontFamily={FONT} fontWeight={900} fill="#fff">
							≈ 87% OFF
						</text>
					</g>
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 077 «We all pay in minutes. You were just the only one who could see the price.» — every passer-by
   gets a faint badge of their own */
const U077: React.FC = () => {
	const {f, gf, at} = useShot();
	const w = useW();
	const HX = 960;
	const show = interpolate(f, [at('077') + 10, w('077', 0.4)], [0, 1], clamp);
	const cam = usePush(camOn(960, 540, 1.05), camOn(960, 520, 1.15));
	const people = [
		{x: 240, who: 'friend', dir: 1},
		{x: 520, who: 'mom', dir: 1},
		{x: 1400, who: 'clerk', dir: -1},
		{x: 1680, who: 'date', dir: -1},
	] as const;
	return (
		<Stage cam={cam} bg="#0b1030" light={{x: 60, y: 20, o: 0.35, night: true}}>
			<StreetBG gf={gf} />
			<Layer depth={1}>
				<Svg>
					{people.map((p, i) => {
						const x = p.x + p.dir * ((gf * 1.6) % 300);
						const ph = (gf / 8 + i) % (Math.PI * 2);
						const v = Math.floor(18000000 + random('pv' + i) * 14000000 - gf * 7);
						return (
							<g key={i}>
								<Actor who={p.who} x={x} floor={SFL} s={0.95} facing={p.dir as 1 | -1} faceTurn={0.4} look={[p.dir * 0.8, 0]} pose={walk(ph)} uid={'pp' + i} sp="NOBODY" />
								<g opacity={0.55 * show}>
									<AgeBadge x={x} y={badgeY(SFL, 0.95)} value={v} s={0.6} label="MINUTES LEFT" c="#9fd8ff" />
								</g>
							</g>
						);
					})}
					<Actor who="hero" x={HX} floor={SFL} s={HS} facing={1} faceTurn={0.05} look={[Math.sin(f / 18), 0]} expr="wide" pose={idle(gf, 2)} uid="h-all" />
					<HeroBadge x={HX} y={badgeY(SFL)} s={0.8} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 078 «Every shift, every overtime hour, every late night at the office. That's minutes, turned into dollars, turned into stuff.» */
const U078: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const chain = [
		['⏱ MINUTES', '#9fd8ff', 0.55],
		['$ DOLLARS', '#3fcf7a', 0.68],
		['📦 STUFF', '#ffd34a', 0.82],
	] as const;
	const cam = usePush(camOn(960, 560, 1.08), camOn(960, 540, 1.18));
	return (
		<Stage cam={cam} bg="#1a2240" light={{x: 50, y: 20, o: 0.4, c: '220,235,255'}}>
			<Layer depth={1.4}>
				<Office f={gf * 8} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					{[420, 960, 1500].map((x, i) => (
						<g key={x}>
							<SeatChair x={x - 150} c="#2a2f3a" />
							<Actor who={['friend', 'clerk', 'date'][i]} x={x - 140} floor={FL} seat={SEAT} s={0.95} facing={1} faceTurn={0.3} look={[0.6, 0.2]} expr="sleepy" mouth="flat" pose={{lean: 4, head: 6, armB: [60, 60], armF: [70 + Math.sin(gf / 2 + i) * 6, 50], legB: [88, 85], legF: [92, 90]}} uid={'off' + i} sp="NOBODY" />
							<DeskMonitor x={x} f={gf} />
						</g>
					))}
					{chain.map(([t, c, k], i) => {
						const kk = pop(f, w('078', k));
						return (
							<g key={t} transform={`translate(${460 + i * 500},${330}) scale(${kk})`} opacity={Math.min(1, kk * 1.5)}>
								<rect x={-190} y={-50} width={380} height={100} rx={22} fill="#11142c" stroke={c} strokeWidth={5} />
								<text y={16} textAnchor="middle" fontSize={44} fontFamily={FONT} fontWeight={900} fill={c}>
									{t.replace('⏱ ', '').replace('📦 ', '')}
								</text>
								{i < 2 ? (
									<text x={250} y={18} textAnchor="middle" fontSize={60} fontFamily={FONT} fontWeight={900} fill="#fff">
										→
									</text>
								) : null}
							</g>
						);
					})}
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 079 «A week later, Mom is home. Marco comes over. You buy him a coffee.»
   080 «Five dollars. Click. Five minutes.» 081 «Best five minutes you ever spent.» */
const TERM: [number, number] = [1010, 712];
const Coffee: React.FC<{beat: 0 | 1 | 2}> = ({beat}) => {
	const {f, gf, at} = useShot();
	const w = useW();
	const HX = 880;
	const hip = FL - 157;
	const tap = beat === 0 ? env(f, w('079', 0.7), 1e9, 10, 1) : beat === 1 ? env(f, -99, w('080', 0.7), 1, 10) : 0;
	let hp: Pose = reach(idle(gf, 1), 'F', toLocal(TERM[0] - 8, TERM[1] - 64, HX, hip, HS, 1), tap);
	if (beat === 1) hp = {...hp, head: hp.head - 14 * interpolate(f, [w('080', 0.4), w('080', 0.5)], [0, 1], clamp)};
	const cheers = beat === 2 ? env(f, at('081') + 6, 1e9, 10, 1) : 0;
	if (beat === 2) hp = reach(idle(gf, 1), 'F', [60, -150], cheers);
	const mp = beat === 2 ? reach(idle(gf, 6), 'F', [60, -150], cheers) : idle(gf, 6);
	const Cup = () => (
		<g transform="translate(4,-14)">
			<path d="M-14,0 L14,0 L18,-34 L-18,-34 Z" fill="#f4efe2" />
			<rect x={-18} y={-24} width={36} height={10} fill="#e47a3c" />
		</g>
	);
	const cam = beat === 0 ? usePush(camOn(820, 580, 1.15), camOn(860, 600, 1.35)) : beat === 1 ? usePush(camOn(HX + 40, 480, 1.9, {farBlur: 7}), camOn(HX + 30, 460, 2.1, {farBlur: 8})) : usePush(camOn(760, 520, 1.4), camOn(760, 500, 1.6));
	return (
		<Stage cam={cam} bg="#2a1f22" light={{x: 40, y: 0, o: 0.55, c: '255,214,150'}}>
			<Layer depth={1.6}>
				<Cafe f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="barista" x={1360} floor={FL} s={0.97} facing={-1} faceTurn={0.5} look={[-0.6, 0.3]} mouth="smile" pose={idle(gf, 4)} uid="ba2" />
					<CafeCounter f={gf} />
					<Terminal x={TERM[0]} y={TERM[1]} paid={beat === 0 ? 0 : 1} amount="$5.00" />
					<Actor who="friend" x={beat === 2 ? 660 : 600} floor={FL} s={1.02} facing={1} faceTurn={0.5} look={[0.8, -0.1]} mouth="smile" pose={mp} handItem={beat === 2 ? <Cup /> : undefined} uid="m-cafe" />
					<Actor who="hero" x={HX} floor={FL} s={HS} facing={beat === 2 ? -1 : 1} faceTurn={0.5} look={beat === 1 ? [0.1, -1] : [beat === 2 ? -0.8 : 0.7, 0.2]} mouth="smile" pose={hp} handItem={beat === 2 ? <Cup /> : tap > 0.3 ? <Card /> : undefined} uid="h-cafe2" />
					<HeroBadge x={HX} y={badgeY(FL)} s={0.8} />
					{beat === 1 ? <Bang f={f} t={w('080', 0.42)} x={HX + 300} y={badgeY(FL) + 110} text="CLICK." c="#ffd34a" /> : null}
					{beat === 2 ? <Big f={f} t={w('081', 0.3)} x={760} y={290} text="BEST 5 MINUTES EVER" c="#9ff0b0" size={52} /> : null}
				</Svg>
			</Layer>
		</Stage>
	);
};
const U079: React.FC = () => <Coffee beat={0} />;
const U080: React.FC = () => <Coffee beat={1} />;
const U081: React.FC = () => <Coffee beat={2} />;

/* 082 «Because the real question was never how much something costs. It's how much of your life it's worth.» */
const U082: React.FC = () => {
	const {f, at} = useShot();
	const w = useW();
	const a = pop(f, at('082') + 6);
	const strike = interpolate(f, [w('082', 0.4), w('082', 0.5)], [0, 1], clamp);
	const b = pop(f, w('082', 0.55));
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #1d2552 0%, #0b0e22 75%)', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 50}}>
			<div style={{position: 'relative', fontFamily: FONT, fontWeight: 900, fontSize: 76, color: '#8a90a6', transform: `scale(${a})`, opacity: Math.min(1, a * 1.5)}}>
				HOW MUCH DOES IT COST?
				<div style={{position: 'absolute', left: -10, top: '50%', height: 12, width: `${strike * 104}%`, background: '#d23b3b', borderRadius: 6}} />
			</div>
			<div style={{fontFamily: FONT, fontWeight: 900, fontSize: 92, color: '#ffb547', textAlign: 'center', lineHeight: 1.1, transform: `scale(${b})`, opacity: Math.min(1, b * 1.5)}}>
				HOW MUCH OF YOUR LIFE
				<br />
				IS IT WORTH?
			</div>
		</AbsoluteFill>
	);
};

/* 083 «So tell me. If you could see the price of everything in minutes of your life, what would you stop buying first?» */
const U083: React.FC = () => {
	const {f, gf, at, dur} = useShot();
	const w = useW();
	const HX = 960;
	const q = pop(f, w('083', 0.55));
	const c = pop(f, w('083', 0.85));
	const out = interpolate(f, [dur - 20, dur - 2], [0, 1], clamp);
	const cam = usePush(camOn(960, 560, 1.2), camOn(960, 520, 1.45));
	return (
		<>
			<Stage cam={cam} bg="#0b1030" light={{x: 60, y: 20, o: 0.35, night: true}}>
				<StreetBG gf={gf} />
				<Layer depth={1}>
					<Svg>
						<Actor who="hero" x={HX} floor={SFL} s={HS} facing={1} faceTurn={0} look={[0, 0]} mouth="smile" pose={gesture('presentF', idle(gf, 2), env(f, at('083') + 10, 1e9, 10, 1), f)} uid="h-end" />
						<HeroBadge x={HX} y={badgeY(SFL)} s={0.8} />
					</Svg>
				</Layer>
			</Stage>
			<AbsoluteFill style={{pointerEvents: 'none', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 70, flexDirection: 'column', gap: 20}}>
				<div style={{fontFamily: FONT, fontWeight: 900, fontSize: 80, color: '#fff', WebkitTextStroke: '3px #11142c', textShadow: '0 6px 0 #11142c', transform: `scale(${q})`, opacity: Math.min(1, q * 1.5), textAlign: 'center', lineHeight: 1.05}}>
					WHAT WOULD YOU
					<br />
					<span style={{color: '#ffb547'}}>STOP BUYING FIRST?</span>
				</div>
				<div style={{fontFamily: FONT, fontWeight: 800, fontSize: 44, color: '#11142c', background: '#ffd34a', borderRadius: 18, padding: '8px 26px', transform: `scale(${c})`, opacity: Math.min(1, c * 1.5)}}>TELL ME IN THE COMMENTS</div>
			</AbsoluteFill>
			<AbsoluteFill style={{background: '#000', opacity: out}} />
		</>
	);
};

export const SHOTS6: ShotDef[] = [
	{at: '073', C: U073, whip: true},
	{at: '074', C: U074a, whip: true},
	{at: '075', C: U075},
	{at: '076', C: U076, whip: true},
	{at: '077', C: U077, whip: true},
	{at: '078', C: U078, whip: true},
	{at: '079', C: U079, whip: true},
	{at: '080', C: U080},
	{at: '081', C: U081},
	{at: '082', C: U082, whip: true},
	{at: '083', C: U083, whip: true},
];

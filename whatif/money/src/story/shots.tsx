import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useVideoConfig} from 'remotion';
import {Pose, toLocal} from '../engine/Stickman';
import {env, gesture, idle, reach, walkTo} from '../kit/actions';
import {Actor, useShot} from '../kit/core';
import type {ShotDef} from '../kit/coverage';
import {HeroBadge, Layer, Stage, Svg, camOn, clamp, ease, mixCam, usePush} from '../kit/kit';
import {Callout} from '../kit/graphics';
import {FONT} from '../kit/ui';
import {LampCone, LampPost, Sky, Skyline, Street} from '../reference/PauseTime';
import {Apartment, Cafe, CafeCounter, CoinClock, Envelope, Hallway, PhonePay, Scales, Terminal} from './places';

/* "What if every dollar you spent cost you one minute of your life?" — cold open (0:00–0:28). */

const FL = 900;
const HS = 1; // hero scale
const headY = (floor: number, s = HS) => floor - 157 * s - 164 * s;
const badgeY = (floor: number, s = HS) => headY(floor, s) - 118 * s;

/* a bank card held in the front hand */
const Card = () => (
	<g transform="rotate(-20)">
		<rect x={-6} y={-30} width={46} height={30} rx={4} fill="#3d6fd6" stroke="#e9f3ff" strokeWidth={2} />
		<rect x={0} y={-24} width={10} height={8} rx={2} fill="#ffd34a" />
	</g>
);
const SmallPhone = () => (
	<g transform="rotate(-12)">
		<rect x={-10} y={-44} width={30} height={52} rx={6} fill="#15161d" />
		<rect x={-7} y={-40} width={24} height={42} rx={4} fill="#bfe3ff" />
	</g>
);

/* ---------------------------------------------------------------------------
   001 «You tap your card for a coffee. Five dollars.» — the hero pays at the cafe */
const TERM: [number, number] = [1010, 712];
const HX1 = 880;
const CafeShot: React.FC<{mode: 'pay' | 'look' | 'face'}> = ({mode}) => {
	const {f, gf, at} = useShot();
	const paidAt = mode === 'pay' ? 1e9 : at('002') + 2;
	const paid = interpolate(f, [paidAt, paidAt + 14], [0, 1], clamp);
	// hand with the card goes to the reader and stays a moment after the beep
	const tapK = mode === 'pay' ? env(f, at('001') + 8, 1e9, 14, 1) : env(f, -99, at('002') + 26, 1, 12);
	let hp: Pose = idle(gf, 1);
	const hip = FL - 157 * HS;
	hp = reach(hp, 'F', toLocal(TERM[0] - 8, TERM[1] - 64, HX1, hip, HS, 1), tapK);
	// looks up at the badge after the beep
	const up = mode === 'pay' ? 0 : interpolate(f, [at('002') + 30, at('002') + 44], [0, 1], {...clamp, easing: ease});
	hp = {...hp, head: hp.head - 16 * up};
	// 003: hand to the cheek, worried
	const face = mode === 'face' ? env(f, at('003') + 18, 1e9, 10, 1) : 0;
	if (face) hp = gesture('touchFace', hp, face, f);
	const look: [number, number] = up > 0.5 && !face ? [0.1, -1] : face ? [-0.2, -0.6] : [0.7, 0.4];
	const expr = mode === 'face' ? 'worried' : up > 0.5 ? 'wide' : 'normal';
	// barista offers the reader, then smiles
	let bp = gesture('presentF', idle(gf, 4), env(f, mode === 'pay' ? at('001') + 30 : -99, mode === 'pay' ? 1e9 : at('002') + 30, 12, 12), f);
	bp = {...bp, head: bp.head + 4};

	let cam;
	if (mode === 'pay') cam = usePush(camOn(1060, 600, 1.2), camOn(990, 640, 1.5));
	else if (mode === 'look') {
		const k = interpolate(f, [at('002') + 22, at('002') + 52], [0, 1], {...clamp, easing: ease});
		cam = mixCam(camOn(1000, 660, 2.1, {farBlur: 8}), camOn(HX1 + 40, 500, 1.6, {farBlur: 6}), k);
	} else cam = usePush(camOn(HX1 + 30, 520, 1.95, {farBlur: 8}), camOn(HX1 + 20, 500, 2.2, {farBlur: 9}));

	const bY = badgeY(FL);
	return (
		<Stage cam={cam} bg="#2a1f22" light={{x: 40, y: 0, o: 0.5, c: '255,214,150'}}>
			<Layer depth={1.6}>
				<Cafe f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="barista" x={1360} floor={FL} s={0.97} facing={-1} faceTurn={0.5} look={[-0.6, 0.3]} mouth="smile" pose={bp} uid="ba" />
					<CafeCounter f={gf} />
					<Terminal x={TERM[0]} y={TERM[1]} paid={paid} amount="$5.00" />
					<Actor who="hero" x={HX1} floor={FL} s={HS} facing={1} faceTurn={0.5} look={look} expr={expr} mouth={mode === 'face' ? 'frown' : undefined} pose={hp} handItem={tapK > 0.3 ? <Card /> : undefined} armOver={face > 0.5} uid="h-cafe" />
					<HeroBadge x={HX1} y={bY} s={0.8} />
					{mode === 'pay' ? <Callout f={f} t0={at('001') + 44} t1={1e9} from={[TERM[0], TERM[1] - 60]} to={[TERM[0] + 170, 560]} text="$5.00" /> : null}
					{mode === 'look' ? <Bang f={f} t={at('002') + 2} x={TERM[0] + 40} y={TERM[1] - 120} text="BEEP!" /> : null}
					{mode === 'face' ? (
						<>
							<Struck f={f} t={at('003')} x={HX1 - 260} y={bY + 90} text="$5" strikeAt={at('003') + 22} />
							<Callout f={f} t0={at('003') + 32} t1={1e9} from={[HX1 + 120, bY + 30]} to={[HX1 + 150, bY + 190]} text="5 MIN OF LIFE" c="#ff6a5a" size={26} />
						</>
					) : null}
				</Svg>
			</Layer>
		</Stage>
	);
};
const S1: React.FC = () => <CafeShot mode="pay" />;
const S2: React.FC = () => <CafeShot mode="look" />;
const S3: React.FC = () => <CafeShot mode="face" />;

/* comic sound word that pops with a spring */
const Bang: React.FC<{f: number; t: number; x: number; y: number; text: string; c?: string}> = ({f, t, x, y, text, c = '#3fcf7a'}) => {
	const {fps} = useVideoConfig();
	const k = spring({frame: f - t, fps, config: {damping: 9, stiffness: 200}});
	const o = interpolate(f, [t, t + 2, t + 40, t + 52], [0, 1, 1, 0], clamp);
	return (
		<g transform={`translate(${x},${y}) rotate(-10) scale(${k})`} opacity={o}>
			<text textAnchor="middle" fontSize={64} fontFamily={FONT} fontWeight={900} fill={c} stroke="#11142c" strokeWidth={10} paintOrder="stroke">
				{text}
			</text>
		</g>
	);
};
/* a word that appears and gets crossed out */
const Struck: React.FC<{f: number; t: number; x: number; y: number; text: string; strikeAt: number}> = ({f, t, x, y, text, strikeAt}) => {
	const {fps} = useVideoConfig();
	const k = spring({frame: f - t, fps, config: {damping: 11, stiffness: 160}});
	const s = interpolate(f, [strikeAt, strikeAt + 8], [0, 1], {...clamp, easing: ease});
	return (
		<g transform={`translate(${x},${y}) rotate(-6) scale(${k})`} opacity={1 - 0.5 * s}>
			<text textAnchor="middle" fontSize={96} fontFamily={FONT} fontWeight={900} fill="#ffd34a" stroke="#11142c" strokeWidth={10} paintOrder="stroke">
				{text}
			</text>
			<line x1={-70} y1={-30} x2={-70 + 140 * s} y2={-30 + 0 * s} stroke="#ff4a4a" strokeWidth={12} strokeLinecap="round" transform="rotate(-12)" />
		</g>
	);
};

/* ---------------------------------------------------------------------------
   004 «What if every dollar you spent cost you one minute of your life?» — night street,
   a coin flips into a clock, the title words fly in one by one.
   005 «Sounds cheap, right? A dollar a minute.» — walks on, shrugs, the scales balance. */
const SFL = 905;
const StreetBG: React.FC<{gf: number}> = ({gf}) => (
	<>
		<Layer depth={2.4}>
			<Sky wt={gf} />
		</Layer>
		<Layer depth={1.8}>
			<Skyline wt={gf} />
		</Layer>
		<Layer depth={1.25}>
			<LampPost wt={gf} />
		</Layer>
		<Layer depth={1}>
			<Street wt={gf} />
		</Layer>
		<Layer depth={1.25} blend="screen">
			<LampCone />
		</Layer>
	</>
);
const TITLE = ['WHAT IF', 'EVERY $1', 'YOU SPENT', 'COST YOU', '1 MINUTE', 'OF YOUR LIFE?'];
const S4: React.FC = () => {
	const {f, gf, at, end} = useShot();
	const {fps} = useVideoConfig();
	const hx = 760;
	const flipK = interpolate(f, [at('004') + 44, at('004') + 62], [0, 1], {...clamp, easing: ease});
	let hp: Pose = {...idle(gf, 2), head: -12};
	hp = gesture('point', hp, env(f, at('004') + 46, end('004') + 4, 10, 10), f);
	const cam = usePush(camOn(980, 560, 1.12), camOn(960, 520, 1.3));
	const len = end('004') - at('004');
	return (
		<>
			<Stage cam={cam} bg="#0b1030" light={{x: 60, y: 20, o: 0.35, night: true}}>
				<StreetBG gf={gf} />
				<Layer depth={1}>
					<Svg>
						<Actor who="hero" x={hx} floor={SFL} s={HS} facing={1} faceTurn={0.4} look={[0.7, -0.8]} expr="wide" pose={hp} handF={env(f, at('004') + 46, end('004') + 4, 10, 10) > 0.5 ? 'point' : undefined} uid="h-t" />
						<HeroBadge x={hx} y={badgeY(SFL)} s={0.8} />
						<CoinClock x={1240} y={520} r={120} k={flipK} f={gf} />
					</Svg>
				</Layer>
			</Stage>
			<AbsoluteFill style={{pointerEvents: 'none', alignItems: 'center', paddingTop: 34}}>
				<div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', width: 1500, gap: '0 22px'}}>
					{TITLE.map((w, i) => {
						const t0 = at('004') + (i / TITLE.length) * len * 0.92;
						const k = spring({frame: f - t0, fps, config: {damping: 12, stiffness: 170}});
						const hot = w.includes('$1') || w.includes('MINUTE');
						return (
							<span key={i} style={{fontFamily: FONT, fontWeight: 900, fontSize: 88, color: hot ? '#ffb547' : '#fff', WebkitTextStroke: '3px #11142c', textShadow: '0 6px 0 #11142c, 0 0 30px rgba(0,0,0,0.6)', opacity: Math.min(1, k * 1.5), transform: `translateY(${(1 - k) * 60}px) scale(${0.6 + 0.4 * k}) rotate(${(1 - k) * (i % 2 ? 8 : -8)}deg)`, display: 'inline-block', lineHeight: 1.08}}>
								{w}
							</span>
						);
					})}
				</div>
			</AbsoluteFill>
		</>
	);
};
const S5: React.FC = () => {
	const {f, gf, at, end} = useShot();
	const w = walkTo(f, 0, at('005') + 30, 520, 820, 3, 0.3);
	let hp = w.pose;
	hp = gesture('shrug', hp, env(f, at('005') + 4, at('005') + 34, 8, 8), f);
	hp = gesture('presentF', hp, env(f, at('005') + 40, end('005') + 10, 10, 10), f);
	const on = spring({frame: f - at('005') - 34, fps: 30, config: {damping: 11, stiffness: 150}});
	const tip = Math.sin(Math.max(0, f - at('005') - 34) / 5) * Math.exp(-Math.max(0, f - at('005') - 34) / 14) * 0.9;
	const cam = usePush(camOn(820, 560, 1.4), camOn(1000, 540, 1.25));
	return (
		<Stage cam={cam} bg="#0b1030" light={{x: 60, y: 20, o: 0.35, night: true}}>
			<StreetBG gf={gf} />
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={w.x} floor={SFL} s={HS} facing={1} faceTurn={0.5} look={[0.6, 0]} mouth="smirk" pose={hp} vx={w.vx} bob={w.bob} uid="h-s" />
					<HeroBadge x={w.x} y={badgeY(SFL) - w.bob} s={0.8} />
					<Scales x={1220} y={420} s={0.95} tip={tip} on={on} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* ---------------------------------------------------------------------------
   006 «Then rent day comes. Fifteen hundred dollars.» — calendar flips, the bank app
   007 «That's twenty-five hours. Gone in one tap.» — badge rolls down 1,500, hands on head */
const AX = 820;
const AptShot: React.FC<{mode: 'rent' | 'gone'}> = ({mode}) => {
	const {f, gf, at} = useShot();
	const page = mode === 'rent' ? interpolate(f, [at('006') + 6, at('006') + 22], [0, 1], clamp) : 1;
	const phoneOn = mode === 'rent' ? spring({frame: f - at('006') - 40, fps: 30, config: {damping: 13, stiffness: 150}}) : 1;
	const tap = mode === 'rent' ? interpolate(f, [at('006') + 74, at('006') + 86], [0, 1], clamp) : 1;
	const done = mode === 'rent' ? (f > at('006') + 80 ? 1 : 0) : 1;
	let hp: Pose = idle(gf, 5);
	const hip = FL - 157 * HS;
	// holds the phone in front of the chest, thumb taps at the end of 006
	hp = reach(hp, 'F', [42, -112], mode === 'rent' ? 1 : env(f, -99, at('007') + 6, 1, 8));
	hp = {...hp, head: hp.head + (mode === 'rent' && page >= 1 ? 14 : 0)};
	const panic = mode === 'gone' ? env(f, at('007') + 8, 1e9, 10, 1) : 0;
	if (panic) hp = gesture('handsOnHead', hp, panic, f);
	const look: [number, number] = mode === 'rent' ? (f < at('006') + 30 ? [-1, -0.3] : [0.5, 0.8]) : [0, -0.9];
	const cam =
		mode === 'rent'
			? mixCam(camOn(560, 520, 1.5, {farBlur: 2}), camOn(1040, 540, 1.15), interpolate(f, [at('006') + 28, at('006') + 52], [0, 1], {...clamp, easing: ease}))
			: usePush(camOn(AX + 120, 470, 1.7, {farBlur: 6}), camOn(AX + 120, 450, 1.9, {farBlur: 7}));
	return (
		<Stage cam={cam} bg="#1b2045" light={{x: 10, y: 30, o: 0.45, c: '255,214,150'}}>
			<Layer depth={1.5}>
				<Apartment f={gf} page={page} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={AX} floor={FL} s={HS} facing={1} faceTurn={0.45} look={look} expr={mode === 'gone' ? 'wide' : 'normal'} mouth={mode === 'gone' ? 'open' : 'line'} pose={hp} handItem={panic > 0.4 ? undefined : <SmallPhone />} uid="h-apt" />
					<HeroBadge x={AX} y={badgeY(FL)} s={0.8} />
					<g opacity={Math.min(1, phoneOn * 1.4)} transform={`translate(0,${(1 - phoneOn) * 200})`}>
						<PhonePay x={mode === 'rent' ? 1340 : 1290} y={mode === 'rent' ? 520 : 620} s={mode === 'rent' ? 0.95 : 0.72} tap={tap} done={done} amount="$1,500" what="Rent · Apt 4B" />
					</g>
					{mode === 'gone' ? <Callout f={f} t0={at('007') + 26} t1={1e9} from={[AX + 170, badgeY(FL) - 10]} to={[AX + 250, badgeY(FL) - 130]} text="= 25 HOURS" c="#ff6a5a" size={30} /> : null}
				</Svg>
			</Layer>
		</Stage>
	);
};
const S6: React.FC = () => <AptShot mode="rent" />;
const S7: React.FC = () => <AptShot mode="gone" />;

/* ---------------------------------------------------------------------------
   008 «And one day, you'll get a bill that isn't even yours.» — an envelope slides under
   the door; then the envelope in close-up, glowing red, and the picture goes dark. */
const S8: React.FC = () => {
	const {f, gf, at} = useShot();
	const slide = interpolate(f, [at('008') - 2, at('008') + 20], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	const w = walkTo(f, at('008') + 4, at('008') + 34, -200, 700, 6, 0.32);
	let hp = w.pose;
	if (!w.moving) hp = {...hp, head: 22, lean: 6};
	const cam = usePush(camOn(1000, 600, 1.12), camOn(1080, 700, 1.35));
	return (
		<Stage cam={cam} bg="#1b2045" light={{x: 70, y: 90, o: 0.4, c: '255,227,160'}}>
			<Layer depth={1.4}>
				<Hallway f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<g transform={`translate(${1300 - 260 * slide},${938}) rotate(${-8 + 14 * slide}) scale(0.32,0.12)`}>
						<rect x={-260} y={-150} width={520} height={300} rx={10} fill="#f2ecdc" />
						<rect x={60} y={-80} width={160} height={50} fill="none" stroke="#d23b3b" strokeWidth={14} />
					</g>
					<Actor who="hero" x={w.x} floor={FL} s={HS} facing={1} faceTurn={0.5} look={[0.6, 0.9]} expr="worried" pose={hp} vx={w.vx} bob={w.bob} uid="h-hall" />
					<HeroBadge x={w.x} y={badgeY(FL) - w.bob} s={0.8} />
				</Svg>
			</Layer>
		</Stage>
	);
};
const S9: React.FC = () => {
	const {f, gf, dur} = useShot();
	const cam = usePush(camOn(960, 560, 1.0, {farBlur: 10}), camOn(960, 540, 1.12, {farBlur: 12}));
	const glow = 0.5 + 0.5 * Math.sin(gf / 5);
	const out = interpolate(f, [dur - 18, dur - 2], [0, 1], clamp);
	return (
		<>
			<Stage cam={cam} bg="#1b2045" light={{x: 50, y: 80, o: 0.4, c: '255,227,160'}}>
				<Layer depth={1.4}>
					<Hallway f={gf} />
				</Layer>
				<Layer depth={1} sharp>
					<Svg>
						<rect x={-400} y={700} width={2800} height={600} fill="#2e2840" opacity={0.9} />
						<Envelope x={960} y={560} s={1.45} rot={-5} glow={glow} />
					</Svg>
				</Layer>
			</Stage>
			<AbsoluteFill style={{background: '#000', opacity: out}} />
		</>
	);
};

export const SHOTS: ShotDef[] = [
	{at: '001', C: S1},
	{at: '002', C: S2},
	{at: '003', C: S3},
	{at: '004', C: S4, whip: true},
	{at: '005', C: S5},
	{at: '006', C: S6, whip: true},
	{at: '007', C: S7},
	{at: '008', C: S8, whip: true},
	{at: '008', off: 52, C: S9},
];

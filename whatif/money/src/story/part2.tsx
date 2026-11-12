import React from 'react';
import {AbsoluteFill, interpolate, spring} from 'remotion';
import {Pose, toLocal} from '../engine/Stickman';
import {env, gesture, idle, reach, walkTo} from '../kit/actions';
import {Actor, useShot} from '../kit/core';
import type {ShotDef} from '../kit/coverage';
import {HeroBadge, Layer, Mirror, Sleeper, Stage, Svg, camOn, clamp, ease, mixCam, usePush} from '../kit/kit';
import {Callout} from '../kit/graphics';
import {Bedroom, Blanket} from '../kit/sets';
import {Bubble, FONT, RuleCard} from '../kit/ui';
import {Bang, Card, FL, HS, SFL, SmallPhone, StreetBG, badgeY} from './common';
import {Apartment, Cafe, CoinClock, PhonePay, Terminal} from './places';
import {Atm, Banner, BigClock, Bathroom, Burger, BurgerBar, Clipboard, Gum, MIRROR, Microwave, Store, StoreCounter} from './places2';

/* PART 2 (≈0:26–1:38): rewind to the first morning, Marco's experiments, the three rules. */

/* frame of a word inside a line: `frac` of the way through it (approximate word timing) */
const useW = () => {
	const {at, end} = useShot();
	return (id: string, frac: number) => at(id) + Math.round((end(id) - at(id)) * frac);
};

/* 009 «Let's go back to that morning. One hour before the coffee.» — rewind */
const P009: React.FC = () => {
	const {f, gf, dur} = useShot();
	const w = useW();
	const cam = usePush(camOn(900, 520, 1.05), camOn(900, 500, 1.2));
	const tag = spring({frame: f - w('009', 0.5), fps: 30, config: {damping: 12, stiffness: 160}});
	const jitter = Math.sin(f * 1.7) * 3;
	return (
		<>
			<Stage cam={cam} bg="#101634" light={{x: 50, y: 30, o: 0.4, night: true}}>
				<Layer depth={1}>
					<Svg>
						<BigClock x={1220} y={470} r={240} t={f * 2.4} />
						<Actor who="hero" x={640} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.8, -0.4]} expr="wide" pose={{...idle(gf, 3), head: -10}} uid="h-rw" />
						<HeroBadge x={640} y={badgeY(FL)} s={0.8} />
					</Svg>
				</Layer>
			</Stage>
			<AbsoluteFill style={{pointerEvents: 'none'}}>
				{/* VHS rewind: scanlines, tracking band, blinking label */}
				<AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0 2px, rgba(0,0,0,0) 2px 5px)'}} />
				<div style={{position: 'absolute', left: 0, right: 0, top: ((f * 23) % 1300) - 120, height: 70, background: 'rgba(255,255,255,0.07)', transform: `translateX(${jitter}px)`}} />
				<div style={{position: 'absolute', left: 70, top: 56, fontFamily: FONT, fontWeight: 900, fontSize: 64, color: '#fff', textShadow: '3px 0 #ff4f8b, -3px 0 #3fe0e8', opacity: Math.floor(f / 10) % 2 ? 1 : 0.35}}>◀◀ REWIND</div>
				<div style={{position: 'absolute', left: 0, right: 0, bottom: 90, textAlign: 'center', opacity: Math.min(1, tag * 1.4), transform: `scale(${0.7 + 0.3 * tag})`}}>
					<span style={{fontFamily: FONT, fontWeight: 900, fontSize: 60, color: '#ffb547', background: 'rgba(14,16,36,0.85)', border: '4px solid #ffb547', borderRadius: 20, padding: '10px 30px'}}>1 HOUR BEFORE THE COFFEE</span>
				</div>
				<AbsoluteFill style={{background: '#fff', opacity: interpolate(f, [dur - 6, dur], [0, 0.5], clamp)}} />
			</AbsoluteFill>
		</>
	);
};

/* 010 «You wake up, shuffle to the mirror, and there it is. A glowing number over your head.» */
const PLANE = 990;
const BathShot: React.FC<{close?: boolean}> = ({close}) => {
	const {f, gf, at} = useShot();
	const w = useW();
	const walk = walkTo(f, close ? -999 : at('010') + 4, close ? -998 : w('010', 0.5), -200, 800, 2, 0.24);
	const hx = walk.x;
	const up = close ? 1 : interpolate(f, [w('010', 0.55), w('010', 0.62)], [0, 1], {...clamp, easing: ease});
	let hp: Pose = walk.moving ? walk.pose : idle(gf, 2);
	hp = {...hp, head: hp.head - 14 * up, lean: hp.lean + (walk.moving ? 6 : 0)};
	const rub = close ? 0 : env(f, at('010') + 6, w('010', 0.3), 8, 8);
	if (rub) hp = gesture('rubChin', hp, rub, f);
	const scratch = close ? env(f, at('011') + 10, 1e9, 10, 1) : 0;
	if (scratch) hp = gesture('scratch', hp, scratch, f);
	const expr = up > 0.5 ? 'wide' : 'sleepy';
	const rx = 2 * PLANE - hx;
	const cam = close
		? usePush(camOn(820, 470, 2.0, {farBlur: 7}), camOn(840, 450, 2.2, {farBlur: 8}))
		: mixCam(camOn(820, 560, 1.15), camOn(940, 480, 1.4), interpolate(f, [w('010', 0.5), w('010', 0.75)], [0, 1], {...clamp, easing: ease}));
	return (
		<Stage cam={cam} bg="#1f3a4a" light={{x: 60, y: 10, o: 0.45, c: '255,240,200'}}>
			<Layer depth={1.4}>
				<Bathroom f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Mirror x={MIRROR.x} y={MIRROR.y} w={MIRROR.w} h={MIRROR.h} id="bm">
						<Actor who="hero" x={rx} floor={FL} s={HS} facing={-1} faceTurn={0.15} look={up > 0.5 ? [0, -1] : [-0.3, 0]} expr={expr} pose={hp} vx={walk.vx} bob={walk.bob} shadow={false} uid="h-refl" />
						{close ? null : <HeroBadge x={rx} y={badgeY(FL) - walk.bob} s={0.8} />}
					</Mirror>
					<Actor who="hero" x={hx} floor={FL} s={HS} facing={1} faceTurn={0.5} look={up > 0.5 ? [0.4, -1] : [0.6, 0.1]} expr={expr} mouth={close ? 'open' : undefined} pose={hp} vx={walk.vx} bob={walk.bob} armOver={rub > 0.5} uid="h-bath" />
					<HeroBadge x={hx} y={badgeY(FL) - walk.bob} s={0.8} />
					{close ? <Callout f={f} t0={w('011', 0.55)} t1={1e9} from={[hx + 110, badgeY(FL) - 30]} to={[hx + 150, badgeY(FL) - 120]} text="≈ 53 YEARS" size={30} /> : null}
				</Svg>
			</Layer>
		</Stage>
	);
};
const P010: React.FC = () => <BathShot />;
const P011: React.FC = () => <BathShot close />;

/* 012 «Your best friend Marco sees it too. Marco once microwaved a fork… experiment on you.» */
const P012: React.FC = () => {
	const {f, gf, at} = useShot();
	const w = useW();
	const HX = 680;
	const mw = walkTo(f, at('012') - 6, at('012') + 40, 2200, 1160, 4, 0.34);
	let mp = mw.pose;
	const point = env(f, at('012') + 40, w('012', 0.2), 8, 8);
	mp = gesture('point', {...mp, head: mp.head - 8 * point}, point, f);
	const board = f > w('012', 0.68) ? 1 : 0;
	if (board) mp = reach(mp, 'F', [40, -100], env(f, w('012', 0.68), 1e9, 10, 1));
	let hp: Pose = idle(gf, 7);
	hp = gesture('shrug', hp, env(f, w('012', 0.1), w('012', 0.24), 8, 8), f);
	hp = gesture('handsOnHead', hp, env(f, w('012', 0.8), 1e9, 10, 1) * 0.6, f);
	const bubble = f > w('012', 0.26) && f < w('012', 0.66);
	const cam = mixCam(camOn(930, 560, 1.12), camOn(1060, 520, 1.4), interpolate(f, [w('012', 0.24), w('012', 0.34)], [0, 1], {...clamp, easing: ease}));
	return (
		<Stage cam={cam} bg="#1b2045" light={{x: 10, y: 30, o: 0.45, c: '255,214,150'}}>
			<Layer depth={1.5}>
				<Apartment f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={HX} floor={FL} s={HS} facing={1} faceTurn={0.5} look={[0.8, 0]} expr={board ? 'worried' : 'normal'} pose={hp} uid="h-m" />
					<HeroBadge x={HX} y={badgeY(FL)} s={0.8} />
					<Actor who="friend" x={mw.x} floor={FL} s={1.02} facing={-1} faceTurn={0.5} look={bubble ? [0.3, -1] : [-0.8, -0.3]} expr={point > 0.5 ? 'wide' : 'normal'} mouth={board ? 'smirk' : 'smile'} pose={mp} handF={point > 0.5 ? 'point' : undefined} handItem={board ? <Clipboard /> : undefined} vx={mw.vx} bob={mw.bob} uid="m-m" />
					{bubble ? (
						<Bubble x={mw.x + 60} y={330} w={300} h={210} t={f - w('012', 0.26)} tail={[-60, 170]} thought>
							<g transform="translate(0,20) scale(0.9)">
								<Microwave f={gf} />
							</g>
						</Bubble>
					) : null}
					{board ? <Bang f={f} t={w('012', 0.72)} x={mw.x + 40} y={330} text="SCIENCE!" c="#ffd34a" /> : null}
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 013 «He grabs a pack of gum and makes you pay. One dollar.» 014 «Click. Minus one minute.» */
const TERM2: [number, number] = [1070, 712];
const StoreShot: React.FC<{click?: boolean}> = ({click}) => {
	const {f, gf, at} = useShot();
	const w = useW();
	const HX = 930;
	const hip = FL - 157 * HS;
	const tap = click ? 1 : env(f, w('013', 0.62), 1e9, 10, 1);
	let hp: Pose = reach(idle(gf, 1), 'F', toLocal(TERM2[0] - 8, TERM2[1] - 64, HX, hip, HS, 1), tap);
	if (click) hp = {...hp, head: hp.head - 14};
	const give = click ? 0 : env(f, at('013') + 4, w('013', 0.6), 10, 10);
	let mp: Pose = idle(gf, 9);
	mp = reach(mp, 'F', [70, -120], give);
	const paid = click ? 1 : 0;
	const cam = click ? usePush(camOn(HX + 30, 480, 2.0, {farBlur: 7}), camOn(HX + 30, 460, 2.25, {farBlur: 8})) : usePush(camOn(1000, 600, 1.2), camOn(1040, 620, 1.4));
	return (
		<Stage cam={cam} bg="#203a3a" light={{x: 70, y: 10, o: 0.45, c: '255,214,150'}}>
			<Layer depth={1.5}>
				<Store f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="clerk" x={1480} floor={FL} s={0.98} facing={-1} faceTurn={0.4} look={[-0.6, 0.3]} pose={idle(gf, 11)} uid="clerk" />
					<StoreCounter />
					<Terminal x={TERM2[0]} y={TERM2[1]} paid={paid} amount="$1.00" />
					<Actor who="friend" x={640} floor={FL} s={1.02} facing={1} faceTurn={0.5} look={[0.7, -0.3]} mouth="smirk" pose={mp} handItem={give > 0.3 ? <Gum /> : undefined} uid="m-st" />
					<Actor who="hero" x={HX} floor={FL} s={HS} facing={1} faceTurn={0.4} look={click ? [0.1, -1] : [0.6, 0.4]} expr={click ? 'wide' : 'normal'} pose={hp} handItem={tap > 0.3 && !click ? <Card /> : undefined} uid="h-st" />
					<HeroBadge x={HX} y={badgeY(FL)} s={0.8} />
					{click ? <Bang f={f} t={at('014')} x={HX + 260} y={badgeY(FL) - 40} text="CLICK!" c="#ffd34a" /> : <Callout f={f} t0={w('013', 0.7)} t1={1e9} from={[TERM2[0], TERM2[1] - 60]} to={[TERM2[0] + 170, 560]} text="$1.00" />}
				</Svg>
			</Layer>
		</Stage>
	);
};
const P013: React.FC = () => <StoreShot />;
const P014: React.FC = () => <StoreShot click />;

/* rule cards (full frame chalk slate) */
const Rule: React.FC<{id: string; n: string; text: string; icon?: React.ReactNode}> = ({id, n, text, icon}) => {
	const {f, at} = useShot();
	return <RuleCard n={n} title="RULE" text={text} t={f - at(id) + 6} icon={icon} />;
};
const P015: React.FC = () => {
	const {f, gf, at} = useShot();
	return <Rule id="015" n="#1" text="Every $1 YOU pay = 1 minute of your life" icon={<CoinClock x={0} y={-30} r={110} k={interpolate(f, [at('015') + 40, at('015') + 58], [0, 1], clamp)} f={gf} />} />;
};
const P019: React.FC = () => (
	<Rule
		id="019"
		n="#2"
		text="If someone ELSE pays, it's free"
		icon={
			<g transform="translate(0,-30)">
				<circle r={110} fill="#3fcf7a" opacity={0.2} />
				<text y={40} textAnchor="middle" fontSize={120} fontFamily={FONT} fontWeight={900} fill="#9ff0b0">
					$0
				</text>
			</g>
		}
	/>
);
const P022: React.FC = () => (
	<Rule
		id="022"
		n="#3"
		text="Earning gives NOTHING back. Only spending takes."
		icon={
			<g transform="translate(0,-30)">
				<circle r={110} fill="#ff6a5a" opacity={0.2} />
				<text y={30} textAnchor="middle" fontSize={90} fontFamily={FONT} fontWeight={900} fill="#ffb0a8">
					+0 min
				</text>
			</g>
		}
	/>
);

/* 016 «You do the math… a multi-millionaire. Just not in dollars.» */
const P016: React.FC = () => {
	const {f, gf, at, end} = useShot();
	const w = useW();
	const hw = walkTo(f, at('016') - 6, w('016', 0.55), 380, 900, 5, 0.26);
	let hp: Pose = {...hw.pose, lean: hw.pose.lean - 6, head: hw.pose.head - 6};
	hp = gesture('presentF', hp, env(f, w('016', 0.6), end('016') + 10, 10, 10), f);
	const mw = walkTo(f, at('016') + 10, w('016', 0.6), 80, 560, 8, 0.24);
	const k = spring({frame: f - w('016', 0.45), fps: 30, config: {damping: 10, stiffness: 150}});
	const cam = usePush(camOn(700, 560, 1.25), camOn(860, 520, 1.35));
	return (
		<Stage cam={cam} bg="#0b1030" light={{x: 60, y: 20, o: 0.35, night: true}}>
			<StreetBG gf={gf} />
			<Layer depth={1}>
				<Svg>
					<Actor who="friend" x={mw.x} floor={SFL} s={1.02} facing={1} faceTurn={0.4} look={[0.3, -1]} expr="sleepy" mouth="flat" pose={mw.moving ? mw.pose : idle(gf, 8)} vx={mw.vx} bob={mw.bob} uid="m-mm" />
					<Actor who="hero" x={hw.x} floor={SFL} s={HS} facing={1} faceTurn={0.5} look={[0.6, -0.2]} mouth="smile" pose={hp} vx={hw.vx} bob={hw.bob} uid="h-mm" />
					<HeroBadge x={hw.x} y={badgeY(SFL) - hw.bob} s={0.8} />
					<g transform={`translate(${hw.x + 330},${300}) scale(${k}) rotate(${-4 + Math.sin(gf / 20) * 2})`} opacity={Math.min(1, k * 1.5)}>
						<rect x={-230} y={-70} width={460} height={140} rx={20} fill="#11142c" stroke="#ffd34a" strokeWidth={6} />
						<text y={-12} textAnchor="middle" fontSize={34} fontFamily={FONT} fontWeight={900} fill="#ffd34a">
							MINUTE-MILLIONAIRE
						</text>
						<text y={46} textAnchor="middle" fontSize={50} fontFamily={FONT} fontWeight={900} fill="#fff">
							× 27
						</text>
					</g>
					{Array.from({length: 7}).map((_, i) => {
						const t = f - w('016', 0.45) - i * 5;
						if (t < 0) return null;
						return <CoinClock key={i} x={hw.x + 120 + ((i * 173) % 700)} y={120 + ((t * 4 + i * 90) % 700)} r={26} k={(i % 2) * 1} f={gf + i * 20} />;
					})}
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 017 «Then Marco buys you a burger. Twelve dollars.» 018 «Nothing. The number doesn't move.» */
const TERM3: [number, number] = [1220, 712];
const BurgerShot: React.FC<{stare?: boolean}> = ({stare}) => {
	const {f, gf, at} = useShot();
	const w = useW();
	const HX = 760;
	const MX = 1080;
	const hip = FL - 157;
	const tap = stare ? 0 : env(f, w('017', 0.45), 1e9, 10, 1);
	const mp = reach(idle(gf, 4), 'F', toLocal(TERM3[0] - 8, TERM3[1] - 64, MX, hip, 1.02, 1), tap);
	let hp: Pose = reach(idle(gf, 2), 'F', [40, -110], 1);
	if (stare) hp = {...hp, head: hp.head - 16};
	const cam = stare ? usePush(camOn(HX + 80, 470, 1.9, {farBlur: 7}), camOn(HX + 80, 450, 2.1, {farBlur: 8})) : usePush(camOn(980, 600, 1.25), camOn(1000, 620, 1.4));
	return (
		<Stage cam={cam} bg="#3a1f2a" light={{x: 50, y: 10, o: 0.45, c: '255,214,150'}}>
			<Layer depth={1.5}>
				<BurgerBar f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="clerk" x={1560} floor={FL} s={0.98} facing={-1} faceTurn={0.4} look={[-0.6, 0.3]} mouth="smile" pose={idle(gf, 12)} uid="clerk2" />
					<rect x={1140} y={712} width={800} height={22} rx={6} fill="#e4473c" />
					<rect x={1150} y={734} width={780} height={200} fill="#8a2f2a" />
					<Terminal x={TERM3[0]} y={TERM3[1]} paid={stare || f > w('017', 0.6) ? 1 : 0} amount="$12.00" />
					<Actor who="friend" x={MX} floor={FL} s={1.02} facing={1} faceTurn={0.4} look={stare ? [-0.6, -0.8] : [0.6, 0.4]} expr={stare ? 'wide' : 'normal'} pose={stare ? {...idle(gf, 4), head: -12} : mp} handItem={tap > 0.3 ? <Card /> : undefined} uid="m-b" />
					<Actor who="hero" x={HX} floor={FL} s={HS} facing={1} faceTurn={0.4} look={stare ? [0.1, -1] : [0.7, 0]} expr={stare ? 'wide' : 'normal'} mouth={stare ? 'open' : 'smile'} pose={hp} handItem={<Burger />} uid="h-b" />
					<HeroBadge x={HX} y={badgeY(FL)} s={0.8} />
					{stare ? <Bang f={f} t={at('018') + 2} x={HX + 290} y={badgeY(FL) + 110} text="NO CHANGE" c="#9fd8ff" /> : <Callout f={f} t0={w('017', 0.62)} t1={1e9} from={[TERM3[0], TERM3[1] - 60]} to={[TERM3[0] + 140, 560]} text="$12 · MARCO" />}
				</Svg>
			</Layer>
		</Stage>
	);
};
const P017: React.FC = () => <BurgerShot />;
const P018: React.FC = () => <BurgerShot stare />;

/* 020 «On Friday, your paycheck lands. Two thousand dollars.» */
const P020: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const HX = 820;
	const ban = spring({frame: f - w('020', 0.3), fps: 30, config: {damping: 12, stiffness: 160}});
	let hp: Pose = reach(idle(gf, 5), 'F', [42, -112], 1);
	const yay = env(f, w('020', 0.5), w('020', 0.85), 8, 10);
	hp = gesture('fist', hp, yay, f);
	const up = interpolate(f, [w('020', 0.85), w('020', 0.95)], [0, 1], clamp);
	hp = {...hp, head: hp.head - 14 * up};
	const cam = usePush(camOn(900, 520, 1.3), camOn(920, 480, 1.55));
	return (
		<Stage cam={cam} bg="#1b2045" light={{x: 10, y: 30, o: 0.45, c: '255,214,150'}}>
			<Layer depth={1.5}>
				<Apartment f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={HX} floor={FL} s={HS} facing={1} faceTurn={0.45} look={up > 0.5 ? [0.1, -1] : [0.5, 0.8]} mouth={yay > 0.3 ? 'smile' : 'line'} expr={up > 0.5 ? 'wide' : 'normal'} pose={hp} handItem={yay > 0.4 ? undefined : <SmallPhone />} uid="h-pay" />
					<HeroBadge x={HX} y={badgeY(FL)} s={0.8} />
					<Banner x={1300} y={300} k={ban} title="PAYROLL · Friday" text="+$2,000.00" />
					{up > 0.5 ? <Bang f={f} t={w('020', 0.9)} x={HX + 230} y={badgeY(FL) + 120} text="+0 ?" c="#9fd8ff" /> : null}
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 021 «You check the number at lunch. At dinner. At three in the morning. It doesn't go up…»
   three quick set-ups cut on the words, with a time stamp each */
const P021: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const c1 = w('021', 0.22);
	const c2 = w('021', 0.36);
	const part = f < c1 ? 0 : f < c2 ? 1 : 2;
	const t0 = [0, c1, c2][part];
	const stamp = ['12:30 PM', '7:00 PM', '3:00 AM'][part];
	const sk = spring({frame: f - t0 - 2, fps: 30, config: {damping: 11, stiffness: 180}});
	const HX = 860;
	const look: Pose = {...idle(gf, part), head: -14};
	let scene: React.ReactNode;
	if (part === 0) {
		const cam = camOn(900, 500, 1.6, {farBlur: 6});
		scene = (
			<Stage cam={cam} bg="#2a1f22" light={{x: 40, y: 0, o: 0.5, c: '255,214,150'}}>
				<Layer depth={1.6}>
					<Cafe f={gf} />
				</Layer>
				<Layer depth={1}>
					<Svg>
						<Actor who="hero" x={HX} floor={FL} s={HS} facing={1} faceTurn={0.3} look={[0.1, -1]} pose={reach(look, 'F', [40, -110], 1)} handItem={<Burger />} uid="h-l" />
						<HeroBadge x={HX} y={badgeY(FL)} s={0.8} />
					</Svg>
				</Layer>
			</Stage>
		);
	} else if (part === 1) {
		const cam = camOn(900, 500, 1.6, {farBlur: 6});
		scene = (
			<Stage cam={cam} bg="#1b2045" light={{x: 10, y: 30, o: 0.45, c: '255,214,150'}}>
				<Layer depth={1.5}>
					<Apartment f={gf} page={1} />
				</Layer>
				<Layer depth={1}>
					<Svg>
						<Actor who="hero" x={HX} floor={FL} s={HS} facing={-1} faceTurn={0.3} look={[-0.1, -1]} expr="worried" pose={look} uid="h-d" />
						<HeroBadge x={HX} y={badgeY(FL)} s={0.8} />
					</Svg>
				</Layer>
			</Stage>
		);
	} else {
		const cam = usePushLocal(f - c2, camOn(1500, 560, 1.25), camOn(1560, 560, 1.5));
		scene = (
			<Stage cam={cam} bg="#1d2550" light={{x: 70, y: 20, o: 0.4, night: true}}>
				<Layer depth={1.3}>
					<Bedroom night f={gf} />
				</Layer>
				<Layer depth={1}>
					<Svg>
						<Sleeper x={1640} y={668} s={0.9} expr="wide" />
						<Blanket night f={gf} />
						<HeroBadge x={1640} y={440} s={0.8} />
					</Svg>
				</Layer>
			</Stage>
		);
	}
	return (
		<>
			{scene}
			<AbsoluteFill style={{pointerEvents: 'none'}}>
				<div style={{position: 'absolute', left: 70, top: 60, transform: `scale(${sk}) rotate(-4deg)`, transformOrigin: 'left top', fontFamily: FONT, fontWeight: 900, fontSize: 64, color: '#11142c', background: '#ffd34a', borderRadius: 16, padding: '6px 24px'}}>{stamp}</div>
			</AbsoluteFill>
		</>
	);
};
const usePushLocal = (t: number, a: ReturnType<typeof camOn>, b: ReturnType<typeof camOn>) => mixCam(a, b, interpolate(t, [0, 140], [0, 1], {...clamp, easing: ease}));

/* 023 «So your life is a bank account. You can only withdraw. Never deposit.» */
const P023: React.FC = () => {
	const {f, gf, at} = useShot();
	const w = useW();
	const HX = 900;
	const press = env(f, w('023', 0.62), w('023', 0.85), 8, 8);
	let hp: Pose = reach(idle(gf, 3), 'F', toLocal(1180, SFL - 330, HX, SFL - 157, HS, 1), press);
	const palm = env(f, w('023', 0.9), 1e9, 8, 1);
	if (palm) hp = gesture('facepalm', hp, palm, f);
	const cam = usePush(camOn(1000, 560, 1.2), camOn(1060, 500, 1.45));
	return (
		<Stage cam={cam} bg="#0b1030" light={{x: 60, y: 20, o: 0.35, night: true}}>
			<StreetBG gf={gf} />
			<Layer depth={1}>
				<Svg>
					<Atm x={1260} y={SFL} deny={f > w('023', 0.7) ? 1 : 0} f={gf} />
					<Actor who="hero" x={HX} floor={SFL} s={HS} facing={1} faceTurn={0.4} look={[0.8, -0.2]} expr={palm ? 'sad' : 'normal'} pose={hp} armOver={palm > 0.5} uid="h-atm" />
					<HeroBadge x={HX} y={badgeY(SFL)} s={0.8} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 024 «Then came the coffee. And the rent. You know that part.» — two snapshots pop in */
const P024: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const HX = 960;
	const a = spring({frame: f - w('024', 0.15), fps: 30, config: {damping: 12, stiffness: 160}});
	const b = spring({frame: f - w('024', 0.42), fps: 30, config: {damping: 12, stiffness: 160}});
	const hp = gesture('shrug', idle(gf, 4), env(f, w('024', 0.65), 1e9, 10, 1), f);
	const cam = usePush(camOn(960, 520, 1.1), camOn(960, 500, 1.22));
	const Snap: React.FC<{x: number; k: number; rot: number; children: React.ReactNode; label: string}> = ({x, k, rot, children, label}) => (
		<g transform={`translate(${x},${380}) rotate(${rot * k}) scale(${k})`} opacity={Math.min(1, k * 1.5)}>
			<rect x={-190} y={-170} width={380} height={380} rx={8} fill="#f4efe2" />
			<rect x={-170} y={-150} width={340} height={280} fill="#2a1f22" />
			<g clipPath="url(#snapclip)">{children}</g>
			<text y={180} textAnchor="middle" fontSize={34} fontFamily="'Caveat', cursive" fontWeight={700} fill="#13203a">
				{label}
			</text>
		</g>
	);
	return (
		<Stage cam={cam} bg="#1b2045" light={{x: 10, y: 30, o: 0.45, c: '255,214,150'}}>
			<Layer depth={1.6}>
				<Apartment f={gf} page={1} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<defs>
						<clipPath id="snapclip">
							<rect x={-170} y={-150} width={340} height={280} />
						</clipPath>
					</defs>
					<Actor who="hero" x={HX} floor={FL} s={HS} facing={1} faceTurn={0.1} look={[0, 0]} mouth="flat" pose={hp} uid="h-rc" />
					<HeroBadge x={HX} y={badgeY(FL)} s={0.8} />
					<Snap x={440} k={a} rot={-6} label="coffee · $5">
						<rect x={-170} y={-150} width={340} height={280} fill="#5a3d36" />
						<g transform="translate(0,90) scale(2.2)">
							<Terminal x={0} y={0} paid={1} amount="$5.00" />
						</g>
					</Snap>
					<Snap x={1480} k={b} rot={5} label="rent · $1,500">
						<rect x={-170} y={-150} width={340} height={280} fill="#33366a" />
						<PhonePay x={0} y={40} s={0.42} tap={1} done={1} amount="$1,500" what="Rent · Apt 4B" />
					</Snap>
				</Svg>
			</Layer>
		</Stage>
	);
};

export const SHOTS2: ShotDef[] = [
	{at: '009', C: P009, whip: true},
	{at: '010', C: P010, whip: true},
	{at: '011', C: P011},
	{at: '012', C: P012, whip: true},
	{at: '013', C: P013, whip: true},
	{at: '014', C: P014},
	{at: '015', C: P015},
	{at: '016', C: P016, whip: true},
	{at: '017', C: P017, whip: true},
	{at: '018', C: P018},
	{at: '019', C: P019},
	{at: '020', C: P020, whip: true},
	{at: '021', C: P021, own: true},
	{at: '022', C: P022},
	{at: '023', C: P023, whip: true},
	{at: '024', C: P024, whip: true},
];

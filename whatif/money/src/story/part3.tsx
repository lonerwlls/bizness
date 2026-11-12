import React from 'react';
import {interpolate, spring} from 'remotion';
import {Pose, toLocal} from '../engine/Stickman';
import {SIT, env, gesture, idle, reach, walkTo} from '../kit/actions';
import {Actor, useShot} from '../kit/core';
import type {ShotDef} from '../kit/coverage';
import {CrowdRow, HeroBadge, Layer, Stage, Svg, camOn, clamp, ease, mixCam, usePush} from '../kit/kit';
import {Callout} from '../kit/graphics';
import {Cite, FONT, HAND} from '../kit/ui';
import {Bang, FL, HS, SFL, SmallPhone, StreetBG, badgeY} from './common';
import {Apartment, CoinClock} from './places';
import {Banner, Store} from './places2';
import {CakeSlice, Checkout, Cheese, Coupon, Dealership, GroceryItems, Parchment, PartyBg, PhoneTable, RentMonster, ShowCar, SubPhone, Taxi, TechStore, Tv} from './places3';

/* PART 3 (≈1:38–3:00): life turns into a calculator. */

const useW = () => {
	const {at, end} = useShot();
	return (id: string, frac: number) => at(id) + Math.round((end(id) - at(id)) * frac);
};
const pop = (f: number, t: number) => spring({frame: f - t, fps: 30, config: {damping: 11, stiffness: 160}});

/* a floating math note that pops in and drifts */
const Note: React.FC<{f: number; t: number; x: number; y: number; text: string; c?: string; size?: number}> = ({f, t, x, y, text, c = '#fff', size = 46}) => {
	const k = pop(f, t);
	if (f < t) return null;
	return (
		<g transform={`translate(${x},${y - (f - t) * 0.4}) rotate(${Math.sin((f + x) / 25) * 4}) scale(${k})`} opacity={Math.min(1, k * 1.5)}>
			<text textAnchor="middle" fontSize={size} fontFamily={HAND} fontWeight={700} fill={c} stroke="#11142c" strokeWidth={8} paintOrder="stroke">
				{text}
			</text>
		</g>
	);
};

/* 025 «So you start doing math. Everywhere.» */
const Q025: React.FC = () => {
	const {f, gf, at} = useShot();
	const HX = 900;
	let hp = gesture('think', idle(gf, 2), env(f, at('025') + 4, 1e9, 10, 1), f);
	const notes = ['$16 = 16 min', '$84 = 1h 24m', '× 60', '÷ 1,440', '$1 = 1 min', '?!'];
	const cam = usePush(camOn(900, 520, 1.35), camOn(900, 480, 1.6));
	return (
		<Stage cam={cam} bg="#1b2045" light={{x: 10, y: 30, o: 0.45, c: '255,214,150'}}>
			<Layer depth={1.5}>
				<Apartment f={gf} page={1} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={HX} floor={FL} s={HS} facing={1} faceTurn={0.3} look={[0.5, -0.6]} expr="worried" pose={hp} uid="h-math" />
					<HeroBadge x={HX} y={badgeY(FL)} s={0.8} />
					{notes.map((n, i) => (
						<Note key={i} f={f} t={at('025') + 4 + i * 8} x={HX + [-330, 330, -280, 300, -180, 230][i]} y={[360, 330, 560, 560, 260, 240][i]} text={n} c={i % 2 ? '#ffd34a' : '#fff'} />
					))}
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 026 «A streaming subscription… for a show you fall asleep to.» 027 «Cancel.» */
const Q026: React.FC = () => {
	const {f, gf, at} = useShot();
	const w = useW();
	const HX = 760;
	const doze = interpolate(f, [w('026', 0.6), w('026', 0.8)], [0, 1], clamp);
	const wake = f > at('027') - 10 ? 1 : 0;
	const phoneK = pop(f, w('026', 0.18));
	const cancel = interpolate(f, [at('027'), at('027') + 8], [0, 1], clamp);
	let hp: Pose = {...SIT, head: 10 * doze * (1 - wake), lean: SIT.lean - 6 * doze * (1 - wake)};
	if (wake) hp = reach(hp, 'F', [50, -100], 1);
	const cam = wake ? usePush(camOn(1100, 520, 1.3), camOn(1150, 520, 1.45)) : usePush(camOn(1000, 560, 1.15), camOn(980, 560, 1.3));
	return (
		<Stage cam={cam} bg="#1b2045" light={{x: 70, y: 40, o: 0.35, night: true}}>
			<Layer depth={1.5}>
				<Apartment f={gf} page={1} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Tv x={1250} y={900} f={gf} />
					<Actor who="hero" x={HX} floor={FL} seat={752} s={HS} facing={1} faceTurn={0.4} look={wake ? [0.6, 0.4] : [0.8, -0.2]} expr={doze > 0.5 && !wake ? 'sleepy' : wake ? 'angry' : 'normal'} blink={doze > 0.9 && !wake ? 1 : undefined} pose={hp} handItem={wake ? <SmallPhone /> : undefined} uid="h-tv" />
					<HeroBadge x={HX} y={752 - 164 - 118} s={0.8} />
					{doze > 0.9 && !wake ? <Note f={f} t={w('026', 0.8)} x={HX + 110} y={420} text="z z z" c="#9fd8ff" size={56} /> : null}
					<g opacity={Math.min(1, phoneK * 1.4)} transform={`translate(0,${(1 - phoneK) * 160})`}>
						<SubPhone x={1560} y={470} s={0.75} cancel={cancel} title="STREAMBOX" price="$15.99" note="per month · 16 min of life" />
					</g>
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 028 «Groceries, eighty-four dollars… you put back the normal cheese.» */
const Q028: React.FC = () => {
	const {f, gf, at} = useShot();
	const w = useW();
	const HX = 900;
	const back1 = env(f, w('028', 0.5), w('028', 0.66), 10, 10);
	const back2 = env(f, w('028', 0.75), w('028', 0.92), 10, 10);
	let hp: Pose = idle(gf, 3);
	hp = reach(hp, 'F', toLocal(1060, 690, HX, FL - 157, HS, 1), Math.max(back1, back2));
	const total = f < w('028', 0.62) ? '$84.00' : f < w('028', 0.88) ? '$71.50' : '$66.00';
	const gone1 = f > w('028', 0.62);
	const gone2 = f > w('028', 0.88);
	const cam = usePush(camOn(1150, 600, 1.2), camOn(1200, 580, 1.35));
	return (
		<Stage cam={cam} bg="#203a3a" light={{x: 70, y: 10, o: 0.45, c: '255,214,150'}}>
			<Layer depth={1.5}>
				<Store f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="clerk" x={1560} floor={FL} s={0.98} facing={-1} faceTurn={0.4} look={[-0.6, 0.2]} mouth="flat" pose={idle(gf, 13)} uid="clerk3" />
					<Checkout total={total} f={gf} />
					<GroceryItems x={1180} n={5} />
					{gone1 ? null : (
						<g transform={`translate(${1080 - back1 * 30},${700 - back1 * 40})`}>
							<Cheese fancy />
						</g>
					)}
					{gone2 ? null : (
						<g transform={`translate(${1150 - back2 * 30},${700 - back2 * 40})`}>
							<Cheese />
						</g>
					)}
					<Actor who="hero" x={HX} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.8, 0.3]} expr={gone2 ? 'sad' : 'worried'} pose={hp} uid="h-gr" />
					<HeroBadge x={HX} y={badgeY(FL)} s={0.8} />
					<Callout f={f} t0={w('028', 0.22)} t1={w('028', 0.5)} from={[1680, 470]} to={[1500, 300]} text="= 1 h 24 min" c="#ff6a5a" />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 029 «A taxi across town, thirty dollars… Walking takes forty.»
   030 «So you walk, feeling smart. Until you realize you just spent forty minutes to save thirty.» */
const Q029: React.FC = () => {
	const {f, gf, at} = useShot();
	const w = useW();
	const tx = interpolate(f, [at('029') - 6, at('029') + 30], [2600, 1350], {...clamp, easing: ease});
	const HX = 760;
	let hp = gesture('stop', idle(gf, 4), env(f, w('029', 0.55), 1e9, 10, 1), f);
	const card = pop(f, w('029', 0.45));
	const cam = usePush(camOn(1000, 560, 1.12), camOn(1000, 540, 1.25));
	return (
		<Stage cam={cam} bg="#0b1030" light={{x: 60, y: 20, o: 0.35, night: true}}>
			<StreetBG gf={gf} />
			<Layer depth={1}>
				<Svg>
					<Taxi x={tx} y={1000} f={gf} />
					<Actor who="hero" x={HX} floor={SFL} s={HS} facing={1} faceTurn={0.5} look={[0.8, 0]} pose={hp} uid="h-taxi" />
					<HeroBadge x={HX} y={badgeY(SFL)} s={0.8} />
					<g transform={`translate(1000,250) scale(${card})`} opacity={Math.min(1, card * 1.5)}>
						<rect x={-420} y={-80} width={840} height={160} rx={24} fill="#11142c" stroke="#ffd34a" strokeWidth={5} />
						<text x={-210} y={-18} textAnchor="middle" fontSize={34} fontFamily={FONT} fontWeight={800} fill="#ffd34a">
							TAXI · $30
						</text>
						<text x={-210} y={38} textAnchor="middle" fontSize={38} fontFamily={FONT} fontWeight={900} fill="#ff6a5a">
							30 min of LIFE
						</text>
						<line x1={0} y1={-60} x2={0} y2={60} stroke="#3a4378" strokeWidth={4} />
						<text x={210} y={-18} textAnchor="middle" fontSize={34} fontFamily={FONT} fontWeight={800} fill="#9fd8ff">
							WALK · $0
						</text>
						<text x={210} y={38} textAnchor="middle" fontSize={38} fontFamily={FONT} fontWeight={900} fill="#9fd8ff">
							40 min of DAY
						</text>
					</g>
				</Svg>
			</Layer>
		</Stage>
	);
};
const Q030: React.FC = () => {
	const {f, gf, at, end} = useShot();
	const w = useW();
	const stop = w('030', 0.45);
	const hw = walkTo(f, at('030') - 6, stop, 300, 1000, 6, 0.22);
	let hp: Pose = hw.moving ? {...hw.pose, lean: hw.pose.lean + 6} : idle(gf, 6);
	const palm = env(f, w('030', 0.5), 1e9, 10, 1);
	if (palm) hp = gesture('facepalm', hp, palm, f);
	const mins = Math.min(40, Math.floor(interpolate(f, [at('030'), stop], [0, 40], clamp)));
	const card = pop(f, w('030', 0.55));
	const cam = usePush(camOn(700, 560, 1.3), camOn(1000, 520, 1.4));
	return (
		<Stage cam={cam} bg="#0b1030" light={{x: 60, y: 20, o: 0.35, night: true}}>
			<StreetBG gf={gf + 400} />
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={hw.x} floor={SFL} s={HS} facing={1} faceTurn={0.5} look={[0.7, 0]} expr={palm ? 'sad' : 'normal'} mouth={hw.moving ? 'smirk' : 'frown'} pose={hp} vx={hw.vx} bob={hw.bob} armOver={palm > 0.5} uid="h-walk" />
					<HeroBadge x={hw.x} y={badgeY(SFL) - hw.bob} s={0.8} />
					<g transform={`translate(${hw.x - 300},${360})`}>
						<rect x={-110} y={-50} width={220} height={100} rx={20} fill="#11142c" stroke="#9fd8ff" strokeWidth={4} />
						<text y={20} textAnchor="middle" fontSize={56} fontFamily={FONT} fontWeight={900} fill="#9fd8ff">
							{`${mins}:00`}
						</text>
					</g>
					<g transform={`translate(${hw.x + 360},${300}) scale(${card})`} opacity={Math.min(1, card * 1.5)}>
						<rect x={-260} y={-70} width={520} height={140} rx={20} fill="#11142c" stroke="#ff6a5a" strokeWidth={5} />
						<text y={-12} textAnchor="middle" fontSize={36} fontFamily={FONT} fontWeight={900} fill="#fff">
							SPENT 40 MIN
						</text>
						<text y={40} textAnchor="middle" fontSize={36} fontFamily={FONT} fontWeight={900} fill="#ff6a5a">
							TO SAVE 30
						</text>
					</g>
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 031 «A new phone, one thousand dollars. Almost seventeen hours.» */
const Q031: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const HX = 760;
	const lift = env(f, w('031', 0.1), w('031', 0.75), 12, 12);
	let hp: Pose = reach(idle(gf, 2), 'F', toLocal(1000, 690 - lift * 120, HX, FL - 157, HS, 1), Math.min(1, lift * 1.4));
	const cam = usePush(camOn(960, 580, 1.25), camOn(980, 560, 1.45));
	return (
		<Stage cam={cam} bg="#1a2a4a" light={{x: 50, y: 10, o: 0.45, c: '220,235,255'}}>
			<Layer depth={1.5}>
				<TechStore f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<PhoneTable x={1000} lift={lift * 120} />
					<Actor who="hero" x={HX} floor={FL} s={HS} facing={1} faceTurn={0.5} look={[0.7, 0.3]} expr={f > w('031', 0.5) ? 'worried' : 'wide'} pose={hp} uid="h-ph" />
					<HeroBadge x={HX} y={badgeY(FL)} s={0.8} />
					<Callout f={f} t0={w('031', 0.5)} t1={1e9} from={[1120, 670]} to={[1260, 430]} text="≈ 16 h 40 min" c="#ff6a5a" />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 032 «A gym membership you never use… paying minutes just to feel guilty.» */
const Q032: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const HX = 760;
	const ban = pop(f, w('032', 0.05));
	const ban2 = pop(f, w('032', 0.45));
	let hp: Pose = {...SIT, armF: [50, 70]};
	hp = reach(hp, 'F', [44, -112], 1);
	const cam = usePush(camOn(960, 520, 1.25), camOn(1000, 500, 1.4));
	return (
		<Stage cam={cam} bg="#1b2045" light={{x: 10, y: 30, o: 0.45, c: '255,214,150'}}>
			<Layer depth={1.5}>
				<Apartment f={gf} page={1} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={HX} floor={FL} seat={752} s={HS} facing={1} faceTurn={0.4} look={[0.6, 0.6]} expr="sad" mouth="frown" pose={hp} handItem={<SmallPhone />} uid="h-gym" />
					<HeroBadge x={HX} y={752 - 164 - 118} s={0.8} />
					<Banner x={1340} y={300} k={ban} title="POWER GYM · monthly" text="−$40.00" c="#e4473c" />
					<Banner x={1340} y={470} k={ban2} title="Last visit" text="214 days ago" c="#5a6078" />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 033 «Your friend's wedding in Miami… You send a card.» */
const Q033: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const inv = pop(f, w('033', 0.02));
	const items = [
		['FLIGHT', '$900', 0.18],
		['HOTEL', '$700', 0.28],
		['GIFT', '$400', 0.38],
	] as const;
	const tot = pop(f, w('033', 0.5));
	const card = pop(f, w('033', 0.85));
	const HX = 520;
	const cam = usePush(camOn(960, 540, 1.05), camOn(960, 520, 1.12));
	return (
		<Stage cam={cam} bg="#1b2045" light={{x: 10, y: 30, o: 0.45, c: '255,214,150'}}>
			<Layer depth={1.6}>
				<Apartment f={gf} page={1} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={HX} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.8, -0.3]} expr={tot > 0.5 ? 'wide' : 'normal'} pose={gesture('rubChin', idle(gf, 3), env(f, w('033', 0.5), w('033', 0.8), 10, 10), f)} uid="h-wed" />
					<HeroBadge x={HX} y={badgeY(FL)} s={0.8} />
					<g transform={`translate(1150,${300}) rotate(-3) scale(${inv})`} opacity={Math.min(1, inv * 1.5)}>
						<rect x={-300} y={-150} width={600} height={300} rx={16} fill="#f4efe2" />
						<rect x={-284} y={-134} width={568} height={268} rx={10} fill="none" stroke="#d9b25a" strokeWidth={4} />
						<text y={-60} textAnchor="middle" fontSize={56} fontFamily={HAND} fontWeight={700} fill="#7a3f52">
							You're invited!
						</text>
						<text y={10} textAnchor="middle" fontSize={40} fontFamily={HAND} fill="#3a2a1a">
							Jake & Emma · Miami
						</text>
						{card > 0.3 ? (
							<g transform={`rotate(-12) scale(${card})`}>
								<rect x={-200} y={30} width={400} height={90} rx={10} fill="#f4efe2" stroke="#3fcf7a" strokeWidth={6} />
								<text y={92} textAnchor="middle" fontSize={50} fontFamily={HAND} fontWeight={700} fill="#2a8a4a">
									Congrats! ♥
								</text>
							</g>
						) : null}
					</g>
					{items.map(([n, p, t], i) => {
						const k = pop(f, w('033', t));
						return (
							<g key={n} transform={`translate(${900 + i * 250},${600}) scale(${k})`} opacity={Math.min(1, k * 1.5)}>
								<rect x={-110} y={-50} width={220} height={100} rx={16} fill="#11142c" stroke="#ffd34a" strokeWidth={4} />
								<text y={-8} textAnchor="middle" fontSize={26} fontFamily={FONT} fontWeight={800} fill="#ffd34a">
									{n}
								</text>
								<text y={34} textAnchor="middle" fontSize={36} fontFamily={FONT} fontWeight={900} fill="#fff">
									{p}
								</text>
							</g>
						);
					})}
					<g transform={`translate(1150,${780}) scale(${tot})`} opacity={Math.min(1, tot * 1.5)}>
						<rect x={-330} y={-50} width={660} height={100} rx={20} fill="#ff6a5a" />
						<text y={16} textAnchor="middle" fontSize={44} fontFamily={FONT} fontWeight={900} fill="#fff">
							$2,000 = 1 DAY 9 HOURS
						</text>
					</g>
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 034 «The average new car in America… thirty-three days of your life. For a car.» */
const Q034: React.FC = () => {
	const {f, gf, at} = useShot();
	const w = useW();
	const flip = interpolate(f, [w('034', 0.5), w('034', 0.6)], [0, 1], clamp);
	const HX = 520;
	const cam = usePush(camOn(1000, 560, 1.12), camOn(1080, 540, 1.3));
	return (
		<Stage cam={cam} bg="#141a38" light={{x: 50, y: 0, o: 0.45, c: '255,240,200'}}>
			<Layer depth={1.5}>
				<Dealership f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<ShowCar x={1160} y={900} f={gf} tag={flip > 0.5 ? '33 DAYS' : '$48,000'} tagK={flip} />
					<Actor who="hero" x={HX} floor={FL} s={HS} facing={1} faceTurn={0.5} look={[0.8, -0.2]} expr={flip > 0.5 ? 'wide' : 'normal'} mouth={flip > 0.5 ? 'open' : undefined} pose={gesture('handsOnHead', idle(gf, 2), env(f, w('034', 0.85), 1e9, 10, 1), f)} uid="h-car" />
					<HeroBadge x={HX} y={badgeY(FL)} s={0.8} />
					<Cite text="Average new-car price: Kelley Blue Book, 2024" t={f - at('034')} x={1880} y={1050} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 035 «And rent is the real monster… twelve and a half days of your life, every single year.» */
const Q035: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const HX = 560;
	const sum = pop(f, w('035', 0.62));
	let hp = gesture('handsOnHead', idle(gf, 4), env(f, w('035', 0.12), w('035', 0.5), 10, 10), f);
	const cam = usePush(camOn(1000, 540, 1.1), camOn(1000, 520, 1.2));
	return (
		<Stage cam={cam} bg="#0b1030" light={{x: 60, y: 20, o: 0.35, night: true}}>
			<StreetBG gf={gf} />
			<Layer depth={1}>
				<Svg>
					<RentMonster x={1300} y={SFL} f={gf} chomp={f / 40} s={0.95} />
					{Array.from({length: 12}).map((_, i) => {
						const t0 = w('035', 0.3) + i * 4;
						const p = interpolate(f, [t0, t0 + 18], [0, 1], clamp);
						if (p <= 0 || p >= 1) return null;
						return <CoinClock key={i} x={300 + 1000 * p} y={240 + Math.sin(p * Math.PI) * -100 + i * 6} r={28} k={1} f={gf} />;
					})}
					<Actor who="hero" x={HX} floor={SFL} s={HS} facing={1} faceTurn={0.5} look={[0.8, -0.2]} expr="wide" pose={hp} uid="h-rent" />
					<HeroBadge x={HX} y={badgeY(SFL)} s={0.8} />
					<g transform={`translate(960,${190}) scale(${sum})`} opacity={Math.min(1, sum * 1.5)}>
						<rect x={-430} y={-60} width={860} height={120} rx={22} fill="#11142c" stroke="#ff6a5a" strokeWidth={5} />
						<text y={-6} textAnchor="middle" fontSize={34} fontFamily={FONT} fontWeight={800} fill="#ffd34a">
							$1,500 × 12 MONTHS = 18,000 MIN
						</text>
						<text y={42} textAnchor="middle" fontSize={40} fontFamily={FONT} fontWeight={900} fill="#ff6a5a">
							= 12.5 DAYS EVERY YEAR
						</text>
					</g>
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 036 «Benjamin Franklin wrote… For you, it's a receipt.» */
const Q036: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const write = interpolate(f, [w('036', 0.05), w('036', 0.4)], [0, 1], clamp);
	const stamp = interpolate(f, [w('036', 0.8), w('036', 0.86)], [0, 1], clamp);
	const cam = usePush(camOn(960, 520, 1.0, {farBlur: 6}), camOn(960, 520, 1.12, {farBlur: 6}));
	return (
		<Stage cam={cam} bg="#2a1f22" light={{x: 30, y: 10, o: 0.5, c: '255,214,150'}}>
			<Layer depth={1}>
				<Svg>
					<rect x={-400} y={-300} width={2800} height={1400} fill="#3a2a22" />
					{Array.from({length: 12}).map((_, i) => (
						<rect key={i} x={-400} y={-200 + i * 110} width={2800} height={6} fill="#2a1f18" opacity={0.6} />
					))}
					<circle cx={1500} cy={200} r={300} fill="#ffcf7a" opacity={0.12} style={{filter: 'blur(60px)'}} />
					<g transform="translate(960,520) scale(1.45) translate(-960,-520)">
						<Parchment x={960} y={520} write={write} stamp={stamp} />
					</g>
					<g transform={`translate(${410 + 1100 * write},${450 + Math.sin(f / 3) * 10}) rotate(30) scale(1.4)`} opacity={write > 0 && write < 1 ? 1 : 0}>
						<path d="M0,0 C30,-80 60,-140 90,-190 C40,-140 20,-80 0,0 Z" fill="#f4efe2" stroke="#c9ccd6" strokeWidth={3} />
					</g>
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 037 «But you get good at this. Really good.» */
const Q037: React.FC = () => {
	const {f, gf, at} = useShot();
	const HX = 900;
	const hp = gesture('armsCrossed', idle(gf, 3), env(f, at('037') + 4, 1e9, 10, 1), f);
	const k = pop(f, at('037') + 20);
	const cam = usePush(camOn(900, 520, 1.5), camOn(900, 500, 1.75));
	return (
		<Stage cam={cam} bg="#0b1030" light={{x: 60, y: 20, o: 0.35, night: true}}>
			<StreetBG gf={gf} />
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={HX} floor={SFL} s={HS} facing={1} faceTurn={0.2} look={[0.3, 0]} mouth="smirk" lidL={0.3} lidR={0.3} pose={hp} uid="h-pro" />
					<HeroBadge x={HX} y={badgeY(SFL)} s={0.8} />
					<g transform={`translate(${HX + 290},${560}) rotate(-8) scale(${k})`} opacity={Math.min(1, k * 1.5)}>
						<rect x={-150} y={-44} width={300} height={88} rx={16} fill="#3fcf7a" />
						<text y={16} textAnchor="middle" fontSize={44} fontFamily={FONT} fontWeight={900} fill="#0e3a22">
							LEVEL UP!
						</text>
					</g>
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 038 «Coupons. Free samples. Birthday parties with free cake. You haven't paid for lunch in two weeks.»
   four quick cuts on the words */
const Q038: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const cuts = [0, w('038', 0.12), w('038', 0.27), w('038', 0.52)];
	let part = 0;
	while (part + 1 < cuts.length && f >= cuts[part + 1]) part++;
	const t = f - cuts[part];
	const HX = 860;
	let scene: React.ReactNode;
	if (part === 0) {
		const snip = Math.sin(t / 2) * 10;
		scene = (
			<Stage cam={camOn(960, 560, 1.4)} bg="#1b2045" light={{x: 10, y: 30, o: 0.45, c: '255,214,150'}}>
				<Layer depth={1.5}>
					<Apartment f={gf} page={1} />
				</Layer>
				<Layer depth={1}>
					<Svg>
						<Actor who="hero" x={HX} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.6, 0.6]} mouth="smile" pose={reach(idle(gf, 1), 'F', [50, -100 + snip], 1)} uid="h-cp" />
						<HeroBadge x={HX} y={badgeY(FL)} s={0.8} />
						{['-50%', 'FREE', '2 FOR 1', '-30%'].map((c, i) => (
							<Coupon key={i} x={1180 + (i % 2) * 260} y={380 + Math.floor(i / 2) * 150 + Math.sin((gf + i * 20) / 15) * 8} rot={-8 + i * 5} text={c} />
						))}
					</Svg>
				</Layer>
			</Stage>
		);
	} else if (part === 1) {
		scene = (
			<Stage cam={camOn(1000, 560, 1.4)} bg="#203a3a" light={{x: 70, y: 10, o: 0.45, c: '255,214,150'}}>
				<Layer depth={1.5}>
					<Store f={gf} />
				</Layer>
				<Layer depth={1}>
					<Svg>
						<rect x={1060} y={712} width={300} height={18} rx={6} fill="#c9ccd6" />
						<rect x={1080} y={730} width={260} height={180} fill="#4a5a68" />
						{Array.from({length: 6}).map((_, i) => (
							<rect key={i} x={1080 + i * 44} y={690} width={26} height={22} rx={4} fill="#f4efe2" />
						))}
						<text x={1210} y={670} textAnchor="middle" fontSize={34} fontFamily={FONT} fontWeight={900} fill="#ffd34a">
							FREE SAMPLES
						</text>
						<Actor who="hero" x={HX} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.6, 0.2]} mouth="smile" pose={reach(reach(idle(gf, 2), 'F', [60, -100], 1), 'B', [50, -96], 1)} uid="h-sm" />
						<HeroBadge x={HX} y={badgeY(FL)} s={0.8} />
					</Svg>
				</Layer>
			</Stage>
		);
	} else if (part === 2) {
		scene = (
			<Stage cam={camOn(960, 560, 1.2)} bg="#2a1f4a" light={{x: 50, y: 20, o: 0.4, c: '255,214,150'}}>
				<Layer depth={1.5}>
					<PartyBg f={gf} />
				</Layer>
				<Layer depth={1}>
					<Svg>
						<CrowdRow n={5} x0={1100} x1={1800} floor={FL} s={0.95} mode="dance" seed="party" t={gf} />
						<Actor who="hero" x={HX} floor={FL} s={HS} facing={1} faceTurn={0.2} look={[0.2, 0]} mouth="smile" pose={reach(idle(gf, 3), 'F', [40, -110], 1)} handItem={<CakeSlice />} uid="h-cake" />
						<HeroBadge x={HX} y={badgeY(FL)} s={0.8} />
						<Bang f={f} t={cuts[2] + 4} x={HX + 280} y={420} text="FREE CAKE!" c="#ffd34a" />
					</Svg>
				</Layer>
			</Stage>
		);
	} else {
		const days = Math.min(14, Math.floor(t / 3));
		scene = (
			<Stage cam={usePushT(t, camOn(960, 520, 1.1), camOn(960, 500, 1.2))} bg="#1b2045" light={{x: 10, y: 30, o: 0.45, c: '255,214,150'}}>
				<Layer depth={1.6}>
					<Apartment f={gf} page={1} />
				</Layer>
				<Layer depth={1}>
					<Svg>
						<Actor who="hero" x={560} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.8, -0.2]} mouth="smile" pose={gesture('presentF', idle(gf, 4), 1, f)} uid="h-lunch" />
						<HeroBadge x={560} y={badgeY(FL)} s={0.8} />
						<g transform="translate(1200,470)">
							<rect x={-330} y={-250} width={660} height={500} rx={20} fill="#f4efe2" />
							<rect x={-330} y={-250} width={660} height={90} rx={20} fill="#3aa37a" />
							<text y={-190} textAnchor="middle" fontSize={44} fontFamily={FONT} fontWeight={900} fill="#fff">
								LUNCH PAID BY ME
							</text>
							{Array.from({length: 14}).map((_, i) => (
								<g key={i} transform={`translate(${-260 + (i % 7) * 87},${-80 + Math.floor(i / 7) * 150})`}>
									<rect x={-34} y={-40} width={68} height={80} rx={8} fill="#e2dccb" />
									<text y={-12} textAnchor="middle" fontSize={20} fontFamily={FONT} fill="#5a6078">
										{i + 1}
									</text>
									{i < days ? (
										<text y={30} textAnchor="middle" fontSize={44} fontFamily={FONT} fontWeight={900} fill="#d23b3b">
											✗
										</text>
									) : null}
								</g>
							))}
						</g>
					</Svg>
				</Layer>
			</Stage>
		);
	}
	return <>{scene}</>;
};
const usePushT = (t: number, a: ReturnType<typeof camOn>, b: ReturnType<typeof camOn>) => mixCam(a, b, interpolate(t, [0, 90], [0, 1], {...clamp, easing: ease}));

/* 039 «Your number barely moves. You feel immortal.» */
const Q039: React.FC = () => {
	const {f, gf, at} = useShot();
	const HX = 900;
	const arms = env(f, at('039') + 30, 1e9, 14, 1);
	const hp: Pose = {...idle(gf, 5), armF: [170 * arms + 8 * (1 - arms), 10], armB: [-170 * arms - 8 * (1 - arms), 10], head: -14 * arms};
	const glow = 0.5 + 0.5 * Math.sin(gf / 6);
	const cam = usePush(camOn(900, 560, 1.15), camOn(900, 480, 1.5));
	return (
		<Stage cam={cam} bg="#0b1030" light={{x: 50, y: 10, o: 0.5, c: '255,230,160'}}>
			<StreetBG gf={gf} />
			<Layer depth={1}>
				<Svg>
					<circle cx={HX} cy={badgeY(SFL)} r={180} fill="#ffd34a" opacity={0.18 * glow * arms} style={{filter: 'blur(30px)'}} />
					{Array.from({length: 10}).map((_, i) => {
						const a = (i / 10) * Math.PI * 2 + gf / 40;
						return <line key={i} x1={HX + Math.cos(a) * 160} y1={600 + Math.sin(a) * 160} x2={HX + Math.cos(a) * (260 + 40 * glow)} y2={600 + Math.sin(a) * (260 + 40 * glow)} stroke="#ffd34a" strokeWidth={6} opacity={0.35 * arms} strokeLinecap="round" />;
					})}
					<Actor who="hero" x={HX} floor={SFL} s={HS} facing={1} faceTurn={0.05} look={[0, -0.6]} mouth="smile" pose={hp} uid="h-imm" />
					<HeroBadge x={HX} y={badgeY(SFL)} s={0.8} />
				</Svg>
			</Layer>
		</Stage>
	);
};

export const SHOTS3: ShotDef[] = [
	{at: '025', C: Q025, whip: true},
	{at: '026', C: Q026, whip: true},
	{at: '028', C: Q028, whip: true},
	{at: '029', C: Q029, whip: true},
	{at: '030', C: Q030},
	{at: '031', C: Q031, whip: true},
	{at: '032', C: Q032, whip: true},
	{at: '033', C: Q033},
	{at: '034', C: Q034, whip: true},
	{at: '035', C: Q035, whip: true},
	{at: '036', C: Q036, whip: true},
	{at: '037', C: Q037, whip: true},
	{at: '038', C: Q038, own: true},
	{at: '039', C: Q039},
];

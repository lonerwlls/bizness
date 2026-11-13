import React from 'react';
import {interpolate, random} from 'remotion';
import {Pose, frontHand, toLocal} from '../engine/Stickman';
import {SIT, env, gesture, idle, reach, walkTo} from '../kit/actions';
import {Actor, useShot} from '../kit/core';
import type {ShotDef} from '../kit/coverage';
import {CrowdRow, HeroBadge, Layer, Stage, Svg, camOn, clamp, ease, usePush} from '../kit/kit';
import {Bubble, Cite, FONT, HAND, PhoneChat} from '../kit/ui';
import {Onoma} from '../reference/PauseTime';
import {Bang, FL, HS, SFL, SmallPhone, StreetBG, badgeY} from './common';
import {Apartment, Cafe, SEAT, SeatChair, Sofa} from './places';
import {BusInside} from './places5';
import {Cinema, Console, PhoneLight} from './placesP';
import {A035, Tag, camPath, phonePose, pop, useW} from './partA';

/* PART B (1:34–3:02): the fun months, the pull of the phone, the human phone, the price. */

/* 020 «And honestly? The first few months are kind of great.» — strutting down the street */
const B020: React.FC = () => {
	const {f, gf, at} = useShot();
	const hw = walkTo(f, -6, 1e9, 300, 2000, 4, 0.3);
	const cam = camOn(hw.x + 80, 540, 1.35);
	return (
		<Stage cam={cam} bg="#0b1030" light={{x: 60, y: 20, o: 0.35, night: true}}>
			<StreetBG gf={gf} />
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={hw.x} floor={SFL} s={HS} facing={1} faceTurn={0.6} look={[0.8, 0]} mouth="smile" pose={{...hw.pose, lean: hw.pose.lean - 5}} vx={hw.vx} bob={hw.bob} uid="h-20" />
					<HeroBadge x={hw.x} y={badgeY(SFL) - hw.bob} s={0.8} />
					<Tag f={f} t={at('020') + 30} x={hw.x + 300} y={330} text="KIND OF GREAT" c="#1d3a2a" fg="#9ff0b0" stroke="#3fcf7a" size={36} rot={-4} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* a bank counter */
const Bank: React.FC<{f: number}> = () => (
	<Svg>
		<rect x={-400} y={-300} width={2800} height={1300} fill="#1d2a44" />
		{[0, 1, 2, 3, 4].map((i) => (
			<rect key={i} x={-200 + i * 480} y={80} width={60} height={820} fill="#2a3a5a" />
		))}
		<rect x={700} y={120} width={520} height={110} rx={10} fill="#e9e2cf" />
		<text x={960} y={196} textAnchor="middle" fontSize={64} fontFamily={FONT} fontWeight={900} fill="#1d2a44">
			CITY BANK
		</text>
		<rect x={-400} y={900} width={2800} height={300} fill="#3a4060" />
	</Svg>
);

/* 021 «Nobody asks for your ID at the movies. The bank calls you sir. A waiter hands your mom the kids' menu…» */
const B021: React.FC = () => {
	const {f, gf, at} = useShot();
	const w = useW();
	const c1 = w('021', 0.3);
	const c2 = w('021', 0.5);
	const part = f < c1 ? 0 : f < c2 ? 1 : 2;
	const t0 = [at('021'), c1, c2][part];
	const tt = f - t0;
	const HX = 860;
	const cam = camPath(tt, [
		[0, camOn(980, 560, 1.2)],
		[90, camOn(1020, 520, 1.45)],
	]);
	let scene: React.ReactNode;
	if (part === 0)
		scene = (
			<Stage cam={cam} bg="#2a1030" light={{x: 50, y: 0, o: 0.45, c: '255,200,220'}}>
				<Layer depth={1.4}>
					<Cinema f={gf} />
				</Layer>
				<Layer depth={1}>
					<Svg>
						<rect x={1120} y={712} width={600} height={22} rx={6} fill="#c9ccd6" />
						<rect x={1130} y={734} width={580} height={200} fill="#5a2a3a" />
						<Actor who="waiter" x={1460} floor={FL} s={0.98} facing={-1} faceTurn={0.4} look={[-0.6, 0.2]} mouth="smile" pose={gesture('presentF', idle(gf, 9), 1, f)} uid="cashier-b" />
						<Actor who="hero" x={HX + 140} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.7, 0]} mouth="smirk" pose={idle(gf, 3)} uid="h-21a" />
						<HeroBadge x={HX + 140} y={badgeY(FL)} s={0.8} />
						<Tag f={f} t={t0 + 20} x={1380} y={480} text="R-RATED ✓ NO ID" c="#11142c" fg="#9ff0b0" stroke="#3fcf7a" size={30} rot={4} />
					</Svg>
				</Layer>
			</Stage>
		);
	else if (part === 1)
		scene = (
			<Stage cam={cam} bg="#1d2a44" light={{x: 50, y: 0, o: 0.4, c: '220,235,255'}}>
				<Layer depth={1.4}>
					<Bank f={gf} />
				</Layer>
				<Layer depth={1}>
					<Svg>
						<rect x={1120} y={712} width={600} height={22} rx={6} fill="#c9ccd6" />
						<rect x={1130} y={734} width={580} height={200} fill="#2a3a5a" />
						<Actor who="guard" x={1460} floor={FL} s={0.98} facing={-1} faceTurn={0.4} look={[-0.6, 0.1]} mouth="smile" pose={gesture('presentF', idle(gf, 9), 1, f)} uid="teller" />
						<Actor who="hero" x={HX + 140} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.7, 0]} pose={idle(gf, 3)} uid="h-21b" />
						<HeroBadge x={HX + 140} y={badgeY(FL)} s={0.8} />
						<Bubble x={1440} y={360} w={420} h={100} t={tt - 4} tail={[0, 80]}>
							<text y={14} textAnchor="middle" fontSize={36} fontFamily={FONT} fontWeight={900} fill="#13203a">
								Good morning, sir.
							</text>
						</Bubble>
					</Svg>
				</Layer>
			</Stage>
		);
	else {
		const give = env(tt, 20, 1e9, 10, 1);
		scene = (
			<Stage cam={cam} bg="#2a1f22" light={{x: 40, y: 0, o: 0.55, c: '255,214,150'}}>
				<Layer depth={1.6}>
					<Cafe f={gf} />
				</Layer>
				<Layer depth={1}>
					<Svg>
						<rect x={760} y={740} width={400} height={18} rx={6} fill="#f4efe2" />
						<rect x={950} y={758} width={20} height={150} fill="#5a3d36" />
						<SeatChair x={700} facing={1} />
						<SeatChair x={1230} facing={-1} />
						<Actor who="hero" x={720} floor={FL} seat={SEAT} s={HS} facing={1} faceTurn={0.4} look={[0.8, 0]} expr="wide" pose={reach(SIT, 'F', [60, -90], give)} handItem={give > 0.5 ? <g transform="rotate(-10)"><rect x={-4} y={-40} width={34} height={46} rx={3} fill="#7a1f2b" /><text x={13} y={-14} textAnchor="middle" fontSize={9} fontFamily={FONT} fontWeight={900} fill="#ffd34a">WINE</text></g> : undefined} uid="h-21c" />
						<Actor who="mom" x={1210} floor={FL} seat={SEAT} s={0.97} facing={-1} faceTurn={0.4} look={[-0.8, 0]} mouth="open" pose={reach(SIT, 'F', [60, -90], give)} handItem={give > 0.5 ? <g transform="rotate(-10)"><rect x={-4} y={-40} width={34} height={46} rx={3} fill="#ffd34a" /><text x={13} y={-14} textAnchor="middle" fontSize={9} fontFamily={FONT} fontWeight={900} fill="#d23b3b">KIDS</text></g> : undefined} uid="mom-21" />
						<Actor who="waiter" x={960} floor={FL} s={0.98} facing={1} faceTurn={0.1} look={[0, 0.3]} mouth="smile" pose={gesture('presentF', idle(gf, 6), 1, f)} uid="waiter-21" />
						<HeroBadge x={720} y={SEAT - 164 - 118} s={0.8} />
					</Svg>
				</Layer>
			</Stage>
		);
	}
	return <>{scene}</>;
};

/* 022 «But your body is keeping score.» — a scoreboard over the hero */
const B022: React.FC = () => {
	const {f, gf, at} = useShot();
	const HX = 900;
	const cam = usePush(camOn(900, 500, 1.6), camOn(900, 440, 1.9));
	return (
		<Stage cam={cam} bg="#0b1030" light={{x: 50, y: 0, o: 0.5, c: '255,240,200'}}>
			<StreetBG gf={gf} />
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={HX} floor={SFL} s={HS} facing={1} faceTurn={0.1} look={[0, -1]} expr="worried" pose={{...idle(gf, 2), head: -14}} uid="h-22" />
					<HeroBadge x={HX} y={badgeY(SFL)} s={0.8} />
					<g transform={`translate(${HX + 330},${330}) scale(${pop(f, at('022'))})`}>
						<rect x={-170} y={-60} width={340} height={120} rx={10} fill="#11142c" stroke="#ff6a5a" strokeWidth={5} />
						<text x={-80} y={-14} textAnchor="middle" fontSize={22} fontFamily={FONT} fontWeight={800} fill="#ff9a8a">
							BODY
						</text>
						<text x={80} y={-14} textAnchor="middle" fontSize={22} fontFamily={FONT} fontWeight={800} fill="#9fd8ff">
							YOU
						</text>
						<text x={-80} y={42} textAnchor="middle" fontSize={56} fontFamily={FONT} fontWeight={900} fill="#ff6a5a">
							{Math.floor(f / 6) % 2 ? 9 : 8}
						</text>
						<text x={80} y={42} textAnchor="middle" fontSize={56} fontFamily={FONT} fontWeight={900} fill="#9fd8ff">
							0
						</text>
					</g>
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 023 «At seventeen, your back hurts when you sneeze… You say back in my day about last Tuesday.» */
const B023: React.FC = () => {
	const {f, gf, at} = useShot();
	const w = useW();
	const sneeze = env(f, w('023', 0.1), w('023', 0.32), 4, 10);
	const stand = interpolate(f, [w('023', 0.38), w('023', 0.55)], [0, 1], {...clamp, easing: ease});
	const talk = f > w('023', 0.62);
	let hp: Pose;
	if (f < w('023', 0.38)) hp = {...SIT, lean: SIT.lean + 18 * sneeze, head: 14 * sneeze};
	else hp = {...idle(gf, 2), lean: 18 * (1 - stand) + (talk ? 6 : 0)};
	if (f > w('023', 0.4)) hp = reach(hp, 'B', [-30, -40], 1);
	if (talk) hp = gesture('point', hp, env(f, w('023', 0.65), 1e9, 8, 1), f);
	const seatY = f < w('023', 0.38) ? SEAT : SEAT + (FL - 157 - SEAT) * stand;
	const cam = camPath(f, [
		[at('023'), camOn(760, 520, 1.6, {farBlur: 6})],
		[w('023', 0.35), camOn(780, 520, 1.5, {farBlur: 6})],
		[w('023', 0.6), camOn(960, 520, 1.3)],
	]);
	return (
		<Stage cam={cam} bg="#1b2045" light={{x: 10, y: 30, o: 0.45, c: '255,214,150'}}>
			<Layer depth={1.5}>
				<Apartment f={gf} page={1} sofa={false} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Sofa />
					<Actor who="hero" x={720} floor={FL} seat={seatY} s={HS} facing={1} faceTurn={0.4} look={[0.8, 0]} expr={sneeze > 0.3 ? 'sleepy' : talk ? 'normal' : 'worried'} mouth={sneeze > 0.3 ? 'open' : talk ? 'open' : 'frown'} pose={hp} handF={talk ? 'point' : undefined} uid="h-23" />
					<HeroBadge x={720} y={seatY - 164 - 118 + (f < w('023', 0.38) ? 0 : 0)} s={0.8} />
					<Actor who="kai" x={1180} floor={FL} s={0.92} facing={-1} faceTurn={0.4} look={[-0.8, 0]} expr={talk ? 'sleepy' : 'normal'} mouth={talk ? 'flat' : 'smile'} pose={idle(gf, 7)} uid="kai-23" />
					{f > w('023', 0.1) && f < w('023', 0.36) ? <Onoma x={880} y={500} text="ACHOO!" t={f - w('023', 0.1)} c="#9fd8ff" size={60} /> : null}
					{f > w('023', 0.18) && f < w('023', 0.36) ? <Onoma x={600} y={720} text="CRACK" t={f - w('023', 0.18)} c="#ff6a5a" rot={10} size={48} /> : null}
					{f > w('023', 0.42) && f < w('023', 0.6) ? <Onoma x={620} y={560} text="OOF..." t={f - w('023', 0.42)} c="#ffd34a" size={52} /> : null}
					{talk ? (
						<Bubble x={760} y={300} w={440} h={110} t={f - w('023', 0.62)} tail={[-20, 90]}>
							<text y={-4} textAnchor="middle" fontSize={34} fontFamily={FONT} fontWeight={900} fill="#13203a">
								Back in my day...
							</text>
							<text y={34} textAnchor="middle" fontSize={24} fontFamily={HAND} fontWeight={700} fill="#5a6078">
								(last Tuesday)
							</text>
						</Bubble>
					) : null}
				</Svg>
			</Layer>
		</Stage>
	);
};

/* notification bubbles swarming around a point */
const Swarm: React.FC<{f: number; t0: number; cx: number; cy: number; n: number; text?: string}> = ({f, t0, cx, cy, n, text}) => (
	<g>
		{Array.from({length: n}).map((_, i) => {
			const t = f - t0 - i * 3;
			if (t < 0) return null;
			const a = random('na' + i) * Math.PI * 2 + t / (40 + random('nb' + i) * 30);
			const r = 160 + random('nr' + i) * 260;
			const k = Math.min(1, t / 8);
			return (
				<g key={i} transform={`translate(${cx + Math.cos(a) * r},${cy + Math.sin(a) * r * 0.55}) scale(${k})`}>
					<rect x={-70} y={-22} width={140} height={44} rx={14} fill="#f4f6fb" opacity={0.95} />
					<circle cx={-48} cy={0} r={12} fill={['#e4473c', '#3d6fd6', '#3fcf7a', '#e0607a', '#ffb547'][i % 5]} />
					<rect x={-28} y={-8} width={84} height={6} rx={3} fill="#c9ccd6" />
					<rect x={-28} y={4} width={60} height={6} rx={3} fill="#dde1ec" />
					{text && i % 4 === 0 ? (
						<text x={10} y={-28} textAnchor="middle" fontSize={18} fontFamily={HAND} fontWeight={700} fill="#ffd34a">
							{text}
						</text>
					) : null}
				</g>
			);
		})}
	</g>
);

/* 024 «And the phone keeps calling you back. A typical teen gets around two hundred and thirty notifications a day.» */
const B024: React.FC = () => {
	const {f, gf, at} = useShot();
	const w = useW();
	const HX = 960;
	const n = Math.floor(interpolate(f, [w('024', 0.4), w('024', 0.95)], [0, 230], clamp));
	const hp = phonePose(gf, 2, 12);
	const cam = usePush(camOn(960, 560, 1.15), camOn(960, 520, 1.35));
	return (
		<Stage cam={cam} bg="#0b1030" light={{x: 50, y: 30, o: 0.35, night: true}}>
			<StreetBG gf={gf} />
			<Layer depth={1}>
				<Svg>
					<Swarm f={f} t0={at('024')} cx={HX} cy={540} n={26} />
					<Actor who="hero" x={HX} floor={SFL} s={HS} facing={1} faceTurn={0.2} look={[0.2, 1]} pose={hp} handItem={<SmallPhone />} uid="h-24" />
					<PhoneLight pose={hp} x={HX} floor={SFL} />
					<HeroBadge x={HX} y={badgeY(SFL)} s={0.8} />
					<g transform="translate(960,240)">
						<rect x={-260} y={-56} width={520} height={112} rx={24} fill="#11142c" stroke="#ff6a5a" strokeWidth={5} />
						<text y={22} textAnchor="middle" fontSize={64} fontFamily={FONT} fontWeight={900} fill="#ff6a5a">
							{n} / DAY
						</text>
					</g>
					<Cite text="Common Sense Media, 'Constant Companion', 2023" t={f - at('024')} x={1880} y={1050} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 025 «Two hundred and thirty little taps on the shoulder. Each one says, just one minute. It is never one minute.» */
const B025: React.FC = () => {
	const {f, gf, at} = useShot();
	const w = useW();
	const HX = 900;
	const hp = phonePose(gf, 2, 14);
	const mins = Math.floor(interpolate(f, [w('025', 0.55), w('025', 0.95)], [1, 63], clamp));
	const cam = usePush(camOn(960, 480, 1.7, {farBlur: 6}), camOn(980, 470, 1.95, {farBlur: 8}));
	return (
		<Stage cam={cam} bg="#0b1030" light={{x: 50, y: 30, o: 0.35, night: true}}>
			<StreetBG gf={gf} />
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={HX} floor={SFL} s={HS} facing={1} faceTurn={0.2} look={[0.2, 1]} pose={hp} handItem={<SmallPhone />} uid="h-25" />
					<PhoneLight pose={hp} x={HX} floor={SFL} />
					{/* little glowing fingers tapping the shoulder */}
					{[0, 1, 2].map((i) => {
						const tp = Math.abs(Math.sin((f + i * 9) / 4));
						return (
							<g key={i} transform={`translate(${HX - 40 + i * 30},${SFL - 157 - 120 - 30 * tp})`} opacity={env(f, at('025') + i * 8, 1e9, 6, 1)}>
								<rect x={-6} y={-30} width={12} height={34} rx={6} fill="#bfe3ff" />
								<circle r={16} fill="#7cc4ff" opacity={0.3 * (1 - tp)} />
							</g>
						);
					})}
					<HeroBadge x={HX} y={badgeY(SFL)} s={0.8} />
					<Tag f={f} t={w('025', 0.35)} x={HX + 300} y={360} text="just 1 minute..." c="#11142c" fg="#bfe3ff" stroke="#7cc4ff" size={30} rot={-3} />
					{f > w('025', 0.55) ? (
						<g transform={`translate(${HX + 300},${470})`}>
							<rect x={-130} y={-40} width={260} height={80} rx={14} fill="#11142c" stroke="#ff6a5a" strokeWidth={4} />
							<text y={18} textAnchor="middle" fontSize={50} fontFamily={FONT} fontWeight={900} fill="#ff6a5a">
								{mins} min
							</text>
						</g>
					) : null}
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 026 «You try to quit. Day one, your hand keeps reaching for a phone that isn't there.» */
const B026: React.FC = () => {
	const {f, gf, at} = useShot();
	const w = useW();
	const HX = 760;
	const reachK = Math.max(0, Math.sin((f - w('026', 0.35)) / 9)) * (f > w('026', 0.35) ? 1 : 0);
	const hp = reach({...SIT, head: 8}, 'F', [80, -40], 0.4 + 0.6 * reachK);
	const cam = usePush(camOn(960, 560, 1.2), camOn(900, 600, 1.55));
	return (
		<Stage cam={cam} bg="#1b2045" light={{x: 10, y: 30, o: 0.45, c: '255,214,150'}}>
			<Layer depth={1.5}>
				<Apartment f={gf} page={1} sofa={false} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<SeatChair x={HX - 20} />
					<rect x={820} y={740} width={360} height={18} rx={6} fill="#c98a5a" />
					<rect x={990} y={758} width={20} height={150} fill="#7a4e34" />
					{/* phone locked in a box */}
					<g transform="translate(1100,740)">
						<rect x={-60} y={-70} width={120} height={70} rx={8} fill="#5a6078" />
						<rect x={-60} y={-80} width={120} height={16} rx={6} fill="#3a4060" />
						<circle cx={0} cy={-36} r={10} fill="#ffd34a" />
						<text x={0} y={-90} textAnchor="middle" fontSize={20} fontFamily={FONT} fontWeight={900} fill="#ffd34a">
							PHONE JAIL
						</text>
					</g>
					<Actor who="hero" x={HX} floor={FL} seat={SEAT} s={HS} facing={1} faceTurn={0.4} look={[0.8, 0.5]} expr="worried" mouth="frown" pose={hp} uid="h-26" />
					<HeroBadge x={HX} y={SEAT - 164 - 118} s={0.8} />
					<Tag f={f} t={at('026') + 20} x={1240} y={360} text="DAY 1" c="#11142c" fg="#ffb547" size={44} rot={4} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 027 «Your pocket buzzes, and nothing is in it. In one study, eighty-nine percent of college students…» */
const B027: React.FC = () => {
	const {f, gf, at} = useShot();
	const w = useW();
	const HX = 900;
	const pat = env(f, w('027', 0.15), w('027', 0.45), 8, 8);
	const hp = reach(idle(gf, 2), 'F', [8, -20], pat);
	const stat = pop(f, w('027', 0.5));
	const cam = camPath(f, [
		[at('027'), camOn(HX + 10, 740, 2.2, {farBlur: 8})],
		[w('027', 0.42), camOn(HX + 10, 720, 2.1, {farBlur: 8})],
		[w('027', 0.55), camOn(1060, 540, 1.2)],
	]);
	return (
		<Stage cam={cam} bg="#0b1030" light={{x: 50, y: 30, o: 0.35, night: true}}>
			<StreetBG gf={gf} />
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={HX} floor={SFL} s={HS} facing={1} faceTurn={0.4} look={[0.2, 1]} expr="wide" pose={hp} uid="h-27" />
					{[0, 1, 2].map((i) => {
						const k = ((f + i * 6) % 18) / 18;
						return f < w('027', 0.45) ? <path key={i} d={`M${HX + 30 + 20 * k},${SFL - 157 + 30 - 20} q${10 + i * 6},-14 0,-28`} stroke="#9fd8ff" strokeWidth={4} fill="none" opacity={1 - k} transform={`translate(${i * 12},${i * 8})`} /> : null;
					})}
					{f > w('027', 0.3) && f < w('027', 0.48) ? <Onoma x={HX + 150} y={720} text="EMPTY?!" t={f - w('027', 0.3)} c="#ffd34a" size={44} /> : null}
					<HeroBadge x={HX} y={badgeY(SFL)} s={0.8} />
					<g transform={`translate(1380,420) scale(${stat})`} opacity={Math.min(1, stat * 1.5)}>
						<rect x={-260} y={-130} width={520} height={260} rx={30} fill="#11142c" stroke="#9fd8ff" strokeWidth={5} />
						<text y={10} textAnchor="middle" fontSize={130} fontFamily={FONT} fontWeight={900} fill="#9fd8ff">
							89%
						</text>
						<text y={80} textAnchor="middle" fontSize={30} fontFamily={FONT} fontWeight={800} fill="#fff">
							felt phantom vibrations
						</text>
					</g>
					<Cite text="Drouin, Kaiser & Miller, 2012 (college students)" t={f - w('027', 0.5)} x={1880} y={1050} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 028 «Day two, you find your old handheld console, just to check the battery. Four hours. Four days.» */
const B028: React.FC = () => {
	const {f, gf, at} = useShot();
	const w = useW();
	const HX = 760;
	const hold = env(f, w('028', 0.2), 1e9, 10, 1);
	const hp: Pose = reach({...SIT, head: 10 * hold}, 'F', [50, -90], hold);
	const hrs = Math.floor(interpolate(f, [w('028', 0.45), w('028', 0.75)], [0, 4], clamp));
	const day = 0.5 + 0.5 * Math.cos(f / 14);
	const cam = usePush(camOn(820, 560, 1.4), camOn(800, 600, 1.75));
	return (
		<Stage cam={cam} bg="#1b2045" light={{x: 70, y: 40, o: 0.35, night: true}}>
			<Layer depth={1.5}>
				<Apartment f={gf} page={1} sofa={false} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<rect x={1196} y={176} width={488} height={408} fill="#ffcf7a" opacity={f > w('028', 0.45) ? 0.25 * day : 0} />
					<Sofa />
					<Actor who="hero" x={HX} floor={FL} seat={SEAT} s={HS} facing={1} faceTurn={0.3} look={[0.3, 0.9]} expr={hrs >= 4 ? 'wide' : 'normal'} mouth={hrs >= 4 ? 'open' : 'smile'} pose={hp} handItem={hold > 0.3 ? <Console /> : undefined} uid="h-28" />
					<PhoneLight pose={hp} x={HX} floor={SEAT + 157} on={hold} />
					<HeroBadge x={HX} y={SEAT - 164 - 118} s={0.8} />
					<Tag f={f} t={at('028') + 10} x={1100} y={330} text="DAY 2" c="#11142c" fg="#ffb547" size={40} rot={4} />
					<Tag f={f} t={w('028', 0.22)} x={HX + 260} y={480} text="just checking the battery" c="#11142c" fg="#bfe3ff" stroke="#7cc4ff" size={26} rot={-3} />
					{f > w('028', 0.45) ? <Tag f={f} t={w('028', 0.45)} x={HX - 230} y={420} text={`${hrs} HOURS`} c="#3a1d2a" fg="#ff9a8a" stroke="#ff6a5a" size={36} rot={-5} /> : null}
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 029 «So you make Kai your human phone…» 030 the cat video, narrated */
const HumanPhone: React.FC<{cat?: boolean}> = ({cat}) => {
	const {f, gf, at} = useShot();
	const w = useW();
	const kp = phonePose(gf, 6, 10);
	const hp: Pose = {...SIT, armF: [150, 30], armB: [-150, 30], head: -6};
	const cam = cat ? usePush(camOn(1060, 480, 1.45), camOn(1100, 460, 1.65)) : usePush(camOn(960, 580, 1.2), camOn(940, 560, 1.4));
	const lines = ['"Mom says: call me"', '"Feed: new sneakers"', '"Video: a guy eats 50 tacos"'];
	const li = Math.min(2, Math.floor((f - at('029')) / 55));
	const cat1 = cat ? interpolate(f, [at('030'), w('030', 0.3)], [0, 1], clamp) : 0;
	const catY = cat ? (f < w('030', 0.3) ? 0 : Math.min(1, (f - w('030', 0.3)) / 10)) : 0;
	return (
		<Stage cam={cam} bg="#1b2045" light={{x: 10, y: 30, o: 0.45, c: '255,214,150'}}>
			<Layer depth={1.5}>
				<Apartment f={gf} page={1} sofa={false} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Sofa />
					<Actor who="hero" x={700} floor={FL} seat={SEAT} s={HS} facing={1} faceTurn={0.3} look={[0.6, -0.2]} mouth="smile" lidL={0.5} lidR={0.5} pose={hp} uid="h-29" />
					<HeroBadge x={700} y={SEAT - 164 - 118} s={0.8} />
					<Actor who="kai" x={940} floor={FL} seat={SEAT} s={0.92} facing={1} faceTurn={0.4} look={[0.2, 1]} mouth="open" pose={{...kp, legB: SIT.legB, legF: SIT.legF, lean: SIT.lean}} handItem={<SmallPhone />} uid="kai-29" />
					<PhoneLight pose={kp} x={940} floor={SEAT + 157 * 0.92} s={0.92} />
					{!cat ? (
						<Bubble x={1180} y={360} w={460} h={100} t={f - at('029') - li * 55} tail={[-160, 80]}>
							<text y={12} textAnchor="middle" fontSize={30} fontFamily={FONT} fontWeight={900} fill="#13203a">
								{lines[li]}
							</text>
						</Bubble>
					) : (
						<Bubble x={1240} y={360} w={420} h={300} t={f - at('030') + 10} tail={[-200, 170]}>
							{/* tiny cartoon: cat on a table, falls, angry, eats */}
							<rect x={-160} y={60} width={200} height={14} fill="#c98a5a" />
							<g transform={`translate(${-60 + cat1 * 160},${40 + catY * 70}) rotate(${catY * 60})`}>
								<ellipse cx={0} cy={0} rx={34} ry={20} fill="#ffb547" />
								<circle cx={30} cy={-16} r={16} fill="#ffb547" />
								<path d="M22,-30 l6,-12 l6,12 M34,-30 l6,-12 l6,12" fill="#ffb547" />
								<path d="M-34,0 q-20,-20 -10,-36" stroke="#ffb547" strokeWidth={6} fill="none" />
								{f > w('030', 0.55) ? <path d="M26,-20 l6,4 M38,-20 l-6,4" stroke="#1b1a26" strokeWidth={3} /> : <circle cx={34} cy={-18} r={3} fill="#1b1a26" />}
							</g>
							{f > w('030', 0.75) ? <circle cx={150} cy={110} r={14} fill="#c98a5a" /> : null}
							<text y={-100} textAnchor="middle" fontSize={22} fontFamily={HAND} fontWeight={700} fill="#5a6078">
								{f < w('030', 0.3) ? 'a cat falls...' : f < w('030', 0.6) ? "now it's angry" : "now it's... eating?"}
							</text>
						</Bubble>
					)}
				</Svg>
			</Layer>
		</Stage>
	);
};
const B029: React.FC = () => <HumanPhone />;
const B030: React.FC = () => <HumanPhone cat />;

/* 031 «It works for about two weeks.» — fourteen ticks */
const B031: React.FC = () => {
	const {f, at} = useShot();
	const n = Math.min(14, Math.floor((f - at('031') + 6) / 3));
	const cam = usePush(camOn(960, 540, 1.0), camOn(960, 540, 1.1));
	return (
		<Stage cam={cam} bg="#101634" light={{x: 50, y: 20, o: 0.4, night: true}}>
			<Layer depth={1}>
				<Svg>
					<g transform="translate(960,540)">
						<rect x={-460} y={-220} width={920} height={440} rx={24} fill="#f4efe2" />
						<rect x={-460} y={-220} width={920} height={80} rx={24} fill="#3aa37a" />
						<text y={-166} textAnchor="middle" fontSize={44} fontFamily={FONT} fontWeight={900} fill="#fff">
							KAI = MY PHONE
						</text>
						{Array.from({length: 14}).map((_, i) => (
							<g key={i} transform={`translate(${-390 + (i % 7) * 130},${-60 + Math.floor(i / 7) * 150})`}>
								<rect x={-50} y={-50} width={100} height={110} rx={10} fill="#e2dccb" />
								{i < n ? (
									<text y={34} textAnchor="middle" fontSize={64} fontFamily={FONT} fontWeight={900} fill="#2a8a4a">
										✓
									</text>
								) : null}
							</g>
						))}
					</g>
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 032 «Then Kai gets tired of being your phone…» */
const B032: React.FC = () => {
	const {f, gf, at} = useShot();
	const w = useW();
	const toss = env(f, w('032', 0.25), 1e9, 6, 1);
	const kp = gesture('handsOnHead', idle(gf, 6), env(f, at('032'), w('032', 0.22), 8, 8), f);
	const cam = usePush(camOn(1000, 520, 1.3), camOn(1040, 500, 1.55));
	return (
		<Stage cam={cam} bg="#1b2045" light={{x: 10, y: 30, o: 0.45, c: '255,214,150'}}>
			<Layer depth={1.5}>
				<Apartment f={gf} page={1} sofa={false} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Sofa />
					<Actor who="hero" x={760} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.8, 0]} expr="sad" mouth="frown" pose={gesture('armsCrossed', idle(gf, 2), 1, f)} uid="h-32" />
					<HeroBadge x={760} y={badgeY(FL)} s={0.8} />
					<Actor who="kai" x={1160} floor={FL} s={0.92} facing={-1} faceTurn={0.4} look={[-0.8, -0.1]} expr="angry" mouth="open" pose={reach(kp, 'F', [80, -60], toss * 0)} uid="kai-32" />
					<g transform={`translate(${1120 - 260 * toss},${700 + 120 * toss - 200 * Math.sin(toss * Math.PI)}) rotate(${toss * 400})`}>
						<rect x={-14} y={-24} width={28} height={48} rx={6} fill="#15161d" />
					</g>
					{f > w('032', 0.2) ? (
						<Bubble x={1240} y={330} w={460} h={110} t={f - w('032', 0.2)} tail={[-60, 90]}>
							<text y={14} textAnchor="middle" fontSize={34} fontFamily={FONT} fontWeight={900} fill="#13203a">
								Bro. I'm not your phone.
							</text>
						</Bubble>
					) : null}
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 033 «The group chat moves on without you. Plans get made at midnight, and you find out at noon.» */
const B033: React.FC = () => {
	const {f, gf, at} = useShot();
	const w = useW();
	const noon = f > w('033', 0.65);
	const cam = usePush(camOn(960, 540, 1.0, {farBlur: 8}), camOn(960, 540, 1.1, {farBlur: 8}));
	return (
		<Stage cam={cam} bg="#1b2045" light={{x: 10, y: 30, o: 0.45, c: '255,214,150'}}>
			<Layer depth={1.6}>
				<Apartment f={gf} page={1} />
			</Layer>
			<Layer depth={1} sharp>
				<Svg>
					<PhoneChat
						t={f - at('033') + 10}
						title="THE SQUAD (12)"
						x={780}
						y={540}
						s={0.9}
						msgs={[
							{at: 0, from: 'Nora', text: 'lake tomorrow??'},
							{at: 14, from: 'Kai', text: 'YES'},
							{at: 26, from: 'Max', text: 'im in'},
							{at: 38, from: 'Nora', text: 'leaving at 8am'},
							{at: 52, from: 'Max', text: 'see u there'},
						]}
					/>
					<g transform="translate(1380,380)">
						<rect x={-200} y={-70} width={400} height={140} rx={24} fill="#11142c" stroke={noon ? '#ff6a5a' : '#9fd8ff'} strokeWidth={5} />
						<text y={26} textAnchor="middle" fontSize={84} fontFamily={FONT} fontWeight={900} fill={noon ? '#ff6a5a' : '#9fd8ff'}>
							{noon ? '12:00 PM' : '00:04 AM'}
						</text>
					</g>
					{noon ? <Tag f={f} t={w('033', 0.68)} x={1380} y={560} text="YOU FIND OUT" c="#3a1d2a" fg="#ff9a8a" stroke="#ff6a5a" size={34} rot={3} /> : null}
					{gf < -1 ? <Console /> : null}
				</Svg>
			</Layer>
		</Stage>
	);
};

/* a lake at sunset with a car */
const Lake: React.FC<{f: number}> = ({f}) => (
	<Svg>
		<defs>
			<linearGradient id="lk-sky" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor="#2a2f6a" />
				<stop offset="1" stopColor="#ff9a6a" />
			</linearGradient>
		</defs>
		<rect x={-400} y={-300} width={2800} height={1000} fill="url(#lk-sky)" />
		<circle cx={1300} cy={600} r={110} fill="#ffcf7a" />
		<path d="M-400,640 Q300,560 900,640 T2400,620 L2400,700 L-400,700 Z" fill="#2a3466" />
		<rect x={-400} y={680} width={2800} height={220} fill="#3a5a8a" />
		{Array.from({length: 14}).map((_, i) => (
			<rect key={i} x={1200 + Math.sin((f + i * 20) / 12) * 30} y={700 + i * 14} width={200 - i * 10} height={4} rx={2} fill="#ffcf7a" opacity={0.6} />
		))}
		<rect x={-400} y={900} width={2800} height={300} fill="#c9a87a" />
	</Svg>
);
/* 034 «Nora invites everyone to the lake. Everyone except the guy who looks like a substitute teacher.» */
const B034: React.FC = () => {
	const {f, gf, at} = useShot();
	const w = useW();
	const cam = usePush(camOn(1100, 560, 1.15), camOn(500, 560, 1.4));
	return (
		<Stage cam={cam} bg="#2a2f6a" light={{x: 70, y: 40, o: 0.5, c: '255,200,150'}}>
			<Layer depth={1.4}>
				<Lake f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<CrowdRow n={4} x0={1050} x1={1600} floor={FL} s={0.95} mode="dance" seed="lake" t={gf} />
					<Actor who="nora" x={960} floor={FL} s={0.96} facing={1} faceTurn={0.3} look={[0.8, 0]} mouth="smile" pose={gesture('wave', idle(gf, 4), 1, f)} uid="nora" />
					<Actor who="kai" x={1720} floor={FL} s={0.9} facing={-1} faceTurn={0.4} look={[-0.6, 0]} mouth="smile" pose={idle(gf, 7)} uid="kai-34" />
					{/* the hero, far left, alone behind a tree */}
					<rect x={380} y={420} width={40} height={480} fill="#2a1f22" />
					<circle cx={400} cy={420} r={130} fill="#1d3a2a" />
					<Actor who="hero" x={480} floor={FL} s={HS} facing={1} faceTurn={0.5} look={[0.8, 0]} expr="sad" mouth="frown" pose={idle(gf, 2)} uid="h-34" />
					<HeroBadge x={480} y={badgeY(FL)} s={0.8} />
					<Tag f={f} t={w('034', 0.5)} x={540} y={300} text="SUBSTITUTE TEACHER?" c="#3a1d2a" fg="#ff9a8a" stroke="#ff6a5a" size={28} rot={-4} />
					<Tag f={f} t={at('034') + 10} x={1300} y={330} text="LAKE DAY!" c="#11142c" fg="#ffb547" size={40} rot={4} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 036 «So you get on a bus to the one person in your family who never owned a smartphone. Grandma Rosa.» */
const B036: React.FC = () => {
	const {f, gf, at} = useShot();
	const w = useW();
	const HX = 760;
	const hp: Pose = {...SIT, head: -2};
	const cam = usePush(camOn(820, 560, 1.3), camOn(860, 520, 1.5));
	return (
		<Stage cam={cam} bg="#24305a" light={{x: 50, y: 0, o: 0.35, c: '220,235,255'}}>
			<Layer depth={1.4}>
				<BusInside f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<rect x={650} y={640} width={130} height={170} rx={20} fill="#3d6fd6" />
					<rect x={640} y={800} width={170} height={30} rx={10} fill="#2f5fd0" />
					<Actor who="hero" x={HX} floor={FL} seat={790} s={HS} facing={1} faceTurn={0.3} look={[0.6, -0.4]} pose={hp} uid="h-36" />
					<HeroBadge x={HX} y={790 - 164 - 118} s={0.8} />
					<Tag f={f} t={w('036', 0.6)} x={1200} y={380} text="→ GRANDMA ROSA · 2h" c="#11142c" fg="#ffb547" size={32} rot={-3} />
					{gf < -1 ? <Bang f={f} t={at('036')} x={0} y={0} text="" /> : null}
				</Svg>
			</Layer>
		</Stage>
	);
};

export const SHOTS_B: ShotDef[] = [
	{at: '020', C: B020, whip: true},
	{at: '021', C: B021, own: true, whip: true},
	{at: '022', C: B022, whip: true},
	{at: '023', C: B023, whip: true},
	{at: '024', C: B024, whip: true},
	{at: '025', C: B025},
	{at: '026', C: B026, whip: true},
	{at: '027', C: B027, whip: true},
	{at: '028', C: B028, whip: true},
	{at: '029', C: B029},
	{at: '030', C: B030},
	{at: '031', C: B031, whip: true},
	{at: '032', C: B032, whip: true},
	{at: '033', C: B033},
	{at: '034', C: B034, whip: true},
	{at: '035', C: A035, whip: true},
	{at: '036', C: B036, whip: true},
];

export const _unused = {frontHand, toLocal};

import React from 'react';
import {interpolate} from 'remotion';
import {Pose, frontHand} from '../engine/Stickman';
import {SIT, env, gesture, idle, reach, walk, walkTo} from '../kit/actions';
import {Actor, useShot} from '../kit/core';
import type {ShotDef} from '../kit/coverage';
import {HeroBadge, Layer, Stage, Svg, camOn, clamp, ease, usePush} from '../kit/kit';
import {Bedroom} from '../kit/sets';
import {Bubble, FONT, HAND, RuleCard} from '../kit/ui';
import {Bang, CallSplit, FL, HS, SmallPhone, badgeY} from './common';
import {SEAT, SeatChair} from './places';
import {DeskMonitor} from './places5';
import {Beam, Cottage, Glove, PhoneLight, Ridge} from './placesP';
import {Tag, camPath, phonePose, pop, useW} from './partA';
import {FlipPhone} from './partC';

/* PART D (4:08–5:27): the storm on the ridge, Kai as the eyes, the red glove. */

const RF = 900; // ridge floor
const Hammer = () => (
	<g transform="rotate(-20)">
		<line x1={0} y1={-60} x2={0} y2={30} stroke="#c98a4a" strokeWidth={6} />
		<rect x={-16} y={-70} width={32} height={14} rx={3} fill="#5a6078" />
	</g>
);
const Flashlight = () => (
	<g transform="rotate(-80)">
		<rect x={-6} y={-30} width={12} height={34} rx={4} fill="#2a2f3a" />
		<rect x={-9} y={-36} width={18} height={10} rx={3} fill="#ffd34a" />
	</g>
);

/* 048 «Then winter comes. One Saturday, Grandma walks up the ridge trail to fix a fence…» */
const D048: React.FC = () => {
	const {f, gf, at} = useShot();
	const gw = walkTo(f, at('048') - 6, 1e9, 200, 1700, 5, 0.18);
	const cam = camOn(gw.x + 60, 540, 1.3);
	return (
		<Stage cam={cam} bg="#1d2552" light={{x: 30, y: 10, o: 0.45, c: '220,235,255'}}>
			<Layer depth={1.4}>
				<Ridge f={gf} storm={0.15} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="grandma" x={gw.x} floor={RF} s={0.94} facing={1} faceTurn={0.5} look={[0.8, -0.1]} mouth="smile" pose={reach(gw.pose, 'F', [40, -80], 1)} handItem={<Hammer />} vx={gw.vx} bob={gw.bob} uid="gma-48" />
					<Tag f={f} t={at('048') + 20} x={gw.x + 260} y={380} text="SATURDAY · 1 PM" c="#11142c" fg="#9fd8ff" stroke="#9fd8ff" size={30} rot={-3} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 049 «At four o'clock, a storm rolls in. At five, she isn't back. Her flip phone goes straight to voicemail.» */
const D049: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const HX = 900;
	const five = f > w('049', 0.32);
	const call = env(f, w('049', 0.5), 1e9, 10, 1);
	const hp: Pose = {...reach(idle(gf, 2), 'F', [30, -175], call), head: 4};
	const cam = usePush(camOn(960, 540, 1.2), camOn(940, 500, 1.5));
	return (
		<Stage cam={cam} bg="#2a1f22" light={{x: 85, y: 70, o: 0.4, c: '255,170,100'}}>
			<Layer depth={1.4}>
				<Cottage f={gf} fire={0.6} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					{/* storm in the window */}
					<g>
						<rect x={560} y={260} width={300} height={260} rx={10} fill="#0b0e22" stroke="#4a3424" strokeWidth={14} />
						{Array.from({length: 26}).map((_, i) => {
							const x = 570 + ((i * 47 + f * 9) % 290);
							const y = 270 + ((i * 31 + f * 4) % 240);
							return <line key={i} x1={x} y1={y} x2={x + 12} y2={y - 2} stroke="#fff" strokeWidth={2} opacity={0.6} />;
						})}
					</g>
					<Actor who="hero" x={HX} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.6, 0]} expr="worried" pose={hp} handItem={call > 0.4 ? <SmallPhone /> : undefined} armOver={call > 0.5} uid="h-49" />
					<HeroBadge x={HX} y={badgeY(FL)} s={0.8} />
					<g transform="translate(1300,330)">
						<rect x={-170} y={-56} width={340} height={112} rx={20} fill="#11142c" stroke="#ff6a5a" strokeWidth={5} />
						<text y={22} textAnchor="middle" fontSize={64} fontFamily={FONT} fontWeight={900} fill="#ff6a5a">
							{five ? '5:00 PM' : '4:00 PM'}
						</text>
					</g>
					{f > w('049', 0.7) ? <Tag f={f} t={w('049', 0.7)} x={1300} y={480} text="VOICEMAIL" c="#3a1d2a" fg="#ff9a8a" stroke="#ff6a5a" size={40} rot={3} /> : null}
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 050 «The rescue team is two hours away. The trail splits into six paths, and the snow is erasing her footprints.» */
const D050: React.FC = () => {
	const {f, at} = useShot();
	const w = useW();
	const fade = interpolate(f, [w('050', 0.55), w('050', 1)], [1, 0.05], clamp);
	const cam = usePush(camOn(960, 540, 1.0), camOn(1000, 520, 1.15));
	const paths = [
		'M960,900 Q900,700 620,560 T300,260',
		'M960,900 Q930,700 820,520 T700,180',
		'M960,900 Q960,680 960,480 T980,140',
		'M960,900 Q1000,680 1120,520 T1260,180',
		'M960,900 Q1040,720 1330,580 T1640,280',
		'M960,900 Q1080,780 1460,720 T1800,520',
	];
	return (
		<Stage cam={cam} bg="#c9d4ea" light={{x: 50, y: 20, o: 0.3, c: '220,235,255'}}>
			<Layer depth={1}>
				<Svg>
					<rect x={-400} y={-300} width={2800} height={1500} fill="#dfe7f5" />
					{Array.from({length: 30}).map((_, i) => (
						<path key={i} d={`M${(i * 173) % 2000 - 100},${(i * 97) % 1000} l30,-60 l30,60 Z`} fill="#3a5a4a" opacity={0.6} />
					))}
					{paths.map((p, i) => (
						<path key={i} d={p} stroke="#8a6a4a" strokeWidth={14} fill="none" strokeDasharray="2000" strokeDashoffset={2000 * (1 - interpolate(f, [w('050', 0.3) + i * 6, w('050', 0.3) + i * 6 + 30], [0, 1], clamp))} strokeLinecap="round" />
					))}
					{Array.from({length: 10}).map((_, i) => (
						<ellipse key={i} cx={960 + (i % 2 ? 10 : -10)} cy={880 - i * 34} rx={7} ry={11} fill="#5a4a3a" opacity={fade} />
					))}
					<circle cx={960} cy={900} r={18} fill="#d23b3b" />
					<text x={960} y={960} textAnchor="middle" fontSize={30} fontFamily={FONT} fontWeight={900} fill="#13203a">
						TRAILHEAD
					</text>
					<Tag f={f} t={at('050') + 6} x={560} y={180} text="RESCUE: 2 HOURS AWAY" c="#3a1d2a" fg="#ff9a8a" stroke="#ff6a5a" size={34} rot={-3} />
					<Tag f={f} t={w('050', 0.35)} x={1500} y={150} text="6 PATHS" c="#11142c" fg="#ffb547" size={40} rot={4} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* map on a phone: radar, her last ping */
const MapPhone: React.FC<{x: number; y: number; s?: number; t: number}> = ({x, y, s = 1, t}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<rect x={-180} y={-330} width={360} height={660} rx={48} fill="#000" opacity={0.35} transform="translate(14,20)" style={{filter: 'blur(14px)'}} />
		<rect x={-180} y={-330} width={360} height={660} rx={48} fill="#15161d" />
		<rect x={-164} y={-314} width={328} height={628} rx={36} fill="#dfe7f5" />
		<clipPath id="mapclip">
			<rect x={-164} y={-314} width={328} height={628} rx={36} />
		</clipPath>
		<g clipPath="url(#mapclip)">
			{Array.from({length: 8}).map((_, i) => (
				<path key={i} d={`M-170,${-300 + i * 80} Q0,${-260 + i * 80} 170,${-300 + i * 80}`} stroke="#b9c6dc" strokeWidth={3} fill="none" />
			))}
			<path d="M0,280 Q-40,120 -90,40 T-60,-200" stroke="#8a6a4a" strokeWidth={10} fill="none" />
			{/* radar blob */}
			<ellipse cx={60} cy={-60} rx={150} ry={110} fill="#3d6fd6" opacity={0.35} />
			<ellipse cx={80} cy={-80} rx={80} ry={60} fill="#7a5cc4" opacity={0.4} />
			{/* last ping */}
			<circle cx={-80} cy={-40} r={10} fill="#d23b3b" />
			<circle cx={-80} cy={-40} r={10 + (t % 30) * 2} fill="none" stroke="#d23b3b" strokeWidth={3} opacity={1 - (t % 30) / 30} />
			<text x={-80} y={-64} textAnchor="middle" fontSize={20} fontFamily={FONT} fontWeight={900} fill="#d23b3b">
				LAST PING 4:12
			</text>
		</g>
		<rect x={-164} y={-314} width={328} height={60} rx={30} fill="#11142c" />
		<text y={-274} textAnchor="middle" fontSize={26} fontFamily={FONT} fontWeight={900} fill="#fff">
			FIND ROSA
		</text>
	</g>
);
/* 051 «There's one thing that can find her. A screen. A map, her last signal, the weather radar.» */
const D051: React.FC = () => {
	const {f, gf} = useShot();
	const cam = usePush(camOn(960, 540, 1.0, {farBlur: 10}), camOn(960, 520, 1.2, {farBlur: 12}));
	return (
		<Stage cam={cam} bg="#1d2552" light={{x: 50, y: 50, o: 0.4, c: '190,220,255'}}>
			<Layer depth={1.4}>
				<Ridge f={gf} storm={1} />
			</Layer>
			<Layer depth={1} sharp>
				<Svg>
					<rect x={-400} y={-300} width={2800} height={1500} fill="#05060f" opacity={0.4} />
					<g transform={`rotate(${-3 + Math.sin(f / 25) * 1.5} 960 540)`}>
						<MapPhone x={960} y={540} s={1.3} t={f} />
					</g>
					<circle cx={960} cy={540} r={440} fill="#7cc4ff" opacity={0.08} style={{filter: 'blur(60px)'}} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 052 «You don't care about the days it will cost. The problem is your hands…» */
const D052: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const HX = 760;
	const juggle = Math.sin(f / 6);
	let hp: Pose = reach(idle(gf, 2), 'F', [60 + 10 * juggle, -110], 1);
	hp = reach(hp, 'B', [40, -60 - 10 * juggle], 1);
	const [bx, by] = frontHand(hp, HX, RF - 157, HS, 1);
	const cam = usePush(camOn(900, 560, 1.4), camOn(880, 520, 1.65));
	const items = [
		['FLASHLIGHT', 0.45, -260, 360],
		['ROPE', 0.58, 250, 300],
		['HER', 0.72, 300, 460],
	] as const;
	return (
		<Stage cam={cam} bg="#0b0e22" light={{x: 30, y: 10, o: 0.3, night: true}}>
			<Layer depth={1.4}>
				<Ridge f={gf} storm={1} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Beam x={bx} y={by - 10} ang={-8 + juggle * 6} />
					<Actor who="hero" x={HX} floor={RF} s={HS} facing={1} faceTurn={0.5} look={[0.8, 0]} expr="worried" pose={hp} handItem={<Flashlight />} uid="h-52" />
					<g transform={`translate(${HX - 40},${RF - 157 - 40})`}>
						<circle r={22} fill="none" stroke="#c98a4a" strokeWidth={8} />
						<circle r={12} fill="none" stroke="#c98a4a" strokeWidth={6} />
					</g>
					<HeroBadge x={HX} y={badgeY(RF)} s={0.8} />
					{items.map(([t, k, dx, y]) => (
						<Tag key={t} f={f} t={w('052', k)} x={HX + dx} y={y} text={t} c="#11142c" fg="#ffb547" size={30} rot={dx > 0 ? 4 : -4} />
					))}
					<Tag f={f} t={w('052', 0.1)} x={HX + 330} y={300} text="DAYS? WHO CARES" c="#1d3a2a" fg="#9ff0b0" stroke="#3fcf7a" size={28} rot={3} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 053 rule two again */
const D053: React.FC = () => {
	const {f, at} = useShot();
	return <RuleCard n="#2" title="RULE" text="Only the screen in YOUR hands counts" t={f - at('053') + 40} />;
};

/* 054 call Kai — split screen. 055 Kai as the eyes. */
const KaiCall: React.FC<{beat: '054' | '055'}> = ({beat}) => {
	const {f, gf, at} = useShot();
	const w = useW();
	const ear = (seed: number): Pose => ({...reach(idle(gf, seed), 'F', [30, -175], 1), head: 4});
	const k = beat === '054' ? spring01(f - at('054')) : 1;
	const HX = 960;
	const hero = (
		<Stage cam={camOn(HX + 40, 520, 1.35)} bg="#0b0e22" light={{x: 30, y: 10, o: 0.3, night: true}}>
			<Layer depth={1.4}>
				<Ridge f={gf} storm={1} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={HX} floor={RF} s={HS} facing={1} faceTurn={0.4} look={[0.7, 0.1]} expr="worried" pose={beat === '054' ? ear(2) : {...idle(gf, 2), head: -6}} handItem={beat === '054' ? <SmallPhone /> : <Flashlight />} armOver={beat === '054'} uid="h-call" />
					{beat === '055' ? <Beam x={HX + 60} y={RF - 157 - 110} ang={-6} /> : null}
					<HeroBadge x={HX} y={badgeY(RF)} s={0.8} />
					{beat === '055' ? <Tag f={f} t={at('055') + 10} x={HX + 120} y={330} text="EARBUD: KAI" c="#11142c" fg="#9fd8ff" stroke="#9fd8ff" size={26} rot={-3} /> : null}
				</Svg>
			</Layer>
		</Stage>
	);
	const KX = 900;
	const kp = beat === '054' ? ear(6) : reach({...SIT, head: 8}, 'F', [70, -60], 1);
	const kai = (
		<Stage cam={camOn(KX - 40, beat === '054' ? 520 : 560, 1.35)} bg="#1d2550" light={{x: 70, y: 20, o: 0.4, night: true}}>
			<Layer depth={1.3}>
				<Bedroom night f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					{beat === '055' ? (
						<>
							<DeskMonitor x={KX + 150} f={gf} />
							<ellipse cx={KX + 160} cy={636} rx={50} ry={30} fill="#7a5cc4" opacity={0.6} />
							<circle cx={KX + 140} cy={640} r={6} fill="#d23b3b" />
							<SeatChair x={KX - 10} c="#2a2f3a" />
						</>
					) : null}
					<Actor who="kai" x={KX} floor={880} seat={beat === '055' ? SEAT - 20 : undefined} s={0.92} facing={beat === '054' ? -1 : 1} faceTurn={0.4} look={beat === '054' ? [-0.6, 0] : [0.7, 0.2]} expr="normal" pose={kp} handItem={beat === '054' ? <SmallPhone /> : undefined} armOver={beat === '054'} talk={beat === '055' ? 0.2 + 0.25 * Math.abs(Math.sin(f / 3)) : undefined} uid="kai-call" />
					{beat === '054' && f > w('054', 0.6) ? (
						<Bubble x={KX - 60} y={300} w={300} h={100} t={f - w('054', 0.6)} tail={[40, 80]}>
							<text y={14} textAnchor="middle" fontSize={38} fontFamily={FONT} fontWeight={900} fill="#13203a">
								I'm here.
							</text>
						</Bubble>
					) : null}
					{beat === '055' && f > w('055', 0.5) ? (
						<Bubble x={KX - 40} y={330} w={420} h={100} t={f - w('055', 0.5)} tail={[40, 80]}>
							<text y={14} textAnchor="middle" fontSize={32} fontFamily={FONT} fontWeight={900} fill="#13203a">
								Okay. Go left.
							</text>
						</Bubble>
					) : null}
				</Svg>
			</Layer>
		</Stage>
	);
	return <CallSplit left={hero} right={kai} k={k} />;
};
const spring01 = (t: number) => interpolate(t, [0, 12], [0, 1], {...clamp, easing: ease});
const D054: React.FC = () => <KaiCall beat="054" />;
const D055: React.FC = () => <KaiCall beat="055" />;

/* 056 «Left at the broken pine. Two hundred steps. Her phone last pinged near the creek.» */
const D056: React.FC = () => {
	const {f, gf, at} = useShot();
	const w = useW();
	const hw = walkTo(f, at('056') - 6, 1e9, 500, 1900, 3, 0.2);
	const steps = Math.min(200, Math.floor(interpolate(f, [w('056', 0.25), w('056', 0.6)], [0, 200], clamp)));
	const hp = reach(hw.pose, 'F', [60, -110], 1);
	const [bx, by] = frontHand(hp, hw.x, RF - 157, HS, 1);
	const cam = camOn(hw.x + 140, 520, 1.3);
	return (
		<Stage cam={cam} bg="#0b0e22" light={{x: 30, y: 10, o: 0.3, night: true}}>
			<Layer depth={1.4}>
				<Ridge f={gf} storm={1} pine />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Beam x={bx} y={by - 10} ang={-6 + Math.sin(f / 8) * 4} />
					<Actor who="hero" x={hw.x} floor={RF} s={HS} facing={1} faceTurn={0.5} look={[0.8, 0]} expr="worried" pose={hp} handItem={<Flashlight />} vx={hw.vx} bob={hw.bob} uid="h-56" />
					<HeroBadge x={hw.x} y={badgeY(RF) - hw.bob} s={0.8} />
					<Tag f={f} t={at('056') + 4} x={hw.x + 340} y={300} text="KAI: LEFT AT THE PINE" c="#11142c" fg="#9fd8ff" stroke="#9fd8ff" size={26} rot={-3} />
					{f > w('056', 0.25) ? <Tag f={f} t={w('056', 0.25)} x={hw.x + 340} y={390} text={`${steps} / 200 STEPS`} c="#11142c" fg="#ffb547" size={28} rot={3} /> : null}
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 057 «Your knees are thirty-one and they're screaming. But your eyes are up… One red glove in the snow.» */
const D057: React.FC = () => {
	const {f, gf, at} = useShot();
	const w = useW();
	const hw = walkTo(f, at('057') - 6, w('057', 0.55), 300, 900, 4, 0.14);
	const up = interpolate(f, [w('057', 0.35), w('057', 0.45)], [0, 1], clamp);
	let hp: Pose = hw.moving ? {...hw.pose, lean: hw.pose.lean + 12} : idle(gf, 2);
	hp = {...reach(hp, 'F', [60, -110 + 30 * up], 1), head: -8 * up};
	const [bx, by] = frontHand(hp, hw.x, RF - 157, HS, 1);
	const glove = pop(f, w('057', 0.72));
	const cam = camPath(f, [
		[at('057'), camOn(hw.x + 100, 700, 1.8, {farBlur: 7})],
		[w('057', 0.35), camOn(800, 520, 1.5)],
		[w('057', 0.7), camOn(1180, 760, 1.8, {farBlur: 7})],
	]);
	return (
		<Stage cam={cam} bg="#0b0e22" light={{x: 30, y: 10, o: 0.3, night: true}}>
			<Layer depth={1.4}>
				<Ridge f={gf} storm={0.8} creek />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Beam x={bx} y={by - 10} ang={18 * up + Math.sin(f / 8) * 3} len={700} />
					<Actor who="hero" x={hw.x} floor={RF} s={HS} facing={1} faceTurn={0.5} look={up > 0.5 ? [0.8, 0.4] : [0.6, 0.6]} expr={glove > 0.5 ? 'wide' : 'worried'} mouth={hw.moving ? 'open' : undefined} pose={hp} handItem={<Flashlight />} vx={hw.vx} bob={hw.bob} uid="h-57" />
					<HeroBadge x={hw.x} y={badgeY(RF) - hw.bob} s={0.8} />
					<Tag f={f} t={at('057') + 10} x={hw.x + 60} y={700} text="KNEES: 31 & SCREAMING" c="#3a1d2a" fg="#ff9a8a" stroke="#ff6a5a" size={24} rot={-3} />
					<Glove x={1200} y={905} k={glove} />
					{glove > 0.3 ? <Bang f={f} t={w('057', 0.74)} x={1300} y={760} text="!" c="#ff6a5a" /> : null}
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 058 «She's under a rock ledge, ankle twisted, absolutely furious at the fence.» */
const D058: React.FC = () => {
	const {f, gf, at} = useShot();
	const w = useW();
	const GX = 1400;
	const shake = env(f, w('058', 0.55), 1e9, 6, 1);
	const gp: Pose = gesture('fist', {...SIT, legF: [60, 10], head: 4}, shake, f);
	const cam = usePush(camOn(1200, 640, 1.6, {farBlur: 6}), camOn(1300, 660, 1.9, {farBlur: 7}));
	return (
		<Stage cam={cam} bg="#0b0e22" light={{x: 30, y: 10, o: 0.3, night: true}}>
			<Layer depth={1.4}>
				<Ridge f={gf} storm={0.6} ledge />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="grandma" x={GX} floor={RF} seat={RF - 70} s={0.94} facing={-1} faceTurn={0.4} look={[-0.8, -0.1]} expr="angry" mouth="open" pose={gp} handItem={<Hammer />} uid="gma-58" />
					<ellipse cx={GX - 70} cy={RF - 8} rx={20} ry={10} fill="#f4efe2" />
					<Actor who="hero" x={1060} floor={RF} s={HS} facing={1} faceTurn={0.5} look={[0.8, 0.3]} expr="wide" mouth="smile" pose={{...idle(gf, 2), lean: 18, head: 10}} uid="h-58" />
					<HeroBadge x={1060} y={badgeY(RF)} s={0.8} />
					{f > w('058', 0.55) ? <Bubble x={GX + 40} y={430} w={420} h={100} t={f - w('058', 0.55)} tail={[-40, 80]}>
						<text y={14} textAnchor="middle" fontSize={34} fontFamily={FONT} fontWeight={900} fill="#13203a">
							THAT FENCE!!
						</text>
					</Bubble> : null}
					<Tag f={f} t={at('058') + 10} x={GX - 60} y={RF - 40} text="ANKLE" c="#11142c" fg="#ffb547" size={22} rot={0} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 059 «You carry her down. Kai guides the rescue team to the trailhead. Nobody looks at a single number all night.» */
const D059: React.FC = () => {
	const {f, gf, at} = useShot();
	const w = useW();
	const x = interpolate(f, [at('059') - 6, w('059', 0.6)], [1500, 700], clamp);
	const ph = (f / 12) % (Math.PI * 2);
	const hp: Pose = {...walk(ph), lean: 14, armF: [40, 60], armB: [-20, 60]};
	const gp: Pose = {lean: -10, head: 4, armB: [60, 40], armF: [80, 20], legB: [70, 40], legF: [80, 30]};
	const lights = env(f, w('059', 0.5), 1e9, 20, 1);
	const cam = usePush(camOn(1100, 540, 1.25), camOn(800, 540, 1.35));
	return (
		<Stage cam={cam} bg="#0b0e22" light={{x: 30, y: 10, o: 0.3, night: true}}>
			<Layer depth={1.4}>
				<Ridge f={gf} storm={0.5} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					{/* rescue lights at the trailhead */}
					{[0, 1, 2].map((i) => (
						<g key={i} opacity={lights}>
							<circle cx={260 + i * 90} cy={760} r={60} fill={i % 2 ? '#ff4a4a' : '#4a7aff'} opacity={0.3 + 0.3 * Math.sin(f / 3 + i)} style={{filter: 'blur(12px)'}} />
							<Actor who="rescuer" x={260 + i * 90} floor={RF} s={0.9} facing={1} faceTurn={0.4} look={[0.8, 0]} pose={gesture('wave', idle(gf, i), i === 1 ? 1 : 0, f)} uid={'resc' + i} />
						</g>
					))}
					{/* grandma on the hero's back */}
					<Actor who="grandma" x={x + 30} floor={RF} seat={RF - 157 - 60} s={0.86} facing={-1} faceTurn={0.4} look={[-0.6, 0]} mouth="smile" pose={gp} shadow={false} uid="gma-back" />
					<Actor who="hero" x={x} floor={RF} s={HS} facing={-1} faceTurn={0.5} look={[-0.8, 0.1]} mouth="smile" pose={hp} vx={-3} bob={Math.abs(Math.sin(ph)) * 4} uid="h-59" />
					<HeroBadge x={x} y={badgeY(RF)} s={0.8} />
					<Tag f={f} t={w('059', 0.35)} x={x - 120} y={300} text="KAI → RESCUE TEAM" c="#11142c" fg="#9fd8ff" stroke="#9fd8ff" size={26} rot={-3} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 060 «In the morning, the number over your head says thirty-one years and two days…» */
const D060: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const cam = usePush(camOn(940, 560, 1.2), camOn(860, 500, 1.55));
	return (
		<Stage cam={cam} bg="#3a2a2e" light={{x: 20, y: 0, o: 0.55, c: '255,240,210'}}>
			<Layer depth={1.4}>
				<Cottage f={gf} fire={0.3} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<polygon points="400,-200 700,-200 1100,900 600,900" fill="#fff4cf" opacity={0.1} />
					<SeatChair x={1160} facing={-1} c="#5a3a22" />
					<Actor who="grandma" x={1140} floor={FL} seat={SEAT} s={0.94} facing={-1} faceTurn={0.4} look={[-0.7, 0]} mouth="smile" pose={{...SIT, legF: [70, 20]}} uid="gma-60" />
					<ellipse cx={1050} cy={890} rx={22} ry={12} fill="#f4efe2" />
					<Actor who="hero" x={780} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.1, -1]} mouth="smile" pose={{...idle(gf, 2), head: -12}} uid="h-60" />
					<HeroBadge x={780} y={badgeY(FL)} s={0.8} />
					<Tag f={f} t={w('060', 0.7)} x={1120} y={380} text="WORTH IT" c="#1d3a2a" fg="#9ff0b0" stroke="#3fcf7a" size={50} rot={3} />
					{gf < -1 ? <FlipPhone /> : null}
					{gf < -1 ? <PhoneLight pose={idle(0)} x={0} floor={0} /> : null}
					{gf < -1 ? <span>{HAND}{phonePose(0).lean}</span> : null}
				</Svg>
			</Layer>
		</Stage>
	);
};

export const SHOTS_D: ShotDef[] = [
	{at: '048', C: D048, whip: true},
	{at: '049', C: D049, whip: true},
	{at: '050', C: D050, whip: true},
	{at: '051', C: D051, whip: true},
	{at: '052', C: D052, whip: true},
	{at: '053', C: D053, whip: true},
	{at: '054', C: D054, whip: true},
	{at: '055', C: D055},
	{at: '056', C: D056, whip: true},
	{at: '057', C: D057},
	{at: '058', C: D058},
	{at: '059', C: D059, whip: true},
	{at: '060', C: D060, whip: true},
];

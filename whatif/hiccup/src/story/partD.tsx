import React from 'react';
import {interpolate, random} from 'remotion';
import {Pose} from '../engine/Stickman';
import {SIT, env, gesture, idle, reach, walkTo} from '../kit/actions';
import {Actor, useShot} from '../kit/core';
import type {ShotDef} from '../kit/coverage';
import {Extra, HeroBadge, Layer, Stage, Svg, camOn, clamp} from '../kit/kit';
import {Bubble, FONT} from '../kit/ui';
import {Onoma} from '../reference/PauseTime';
import {Prop3D, at, propScene} from '../three/Prop3D';
import {makeGlass, makeIV, makeMonitor, makePlate, makeWallClock} from '../three/props';
import {CAST} from './cast';
import {FL, HS, badgeY} from './common';
import {SEAT, SeatChair} from './places';
import {Lying, Tag, camPath, pop, useW} from './lib';
import {Audience, HostDesk, Studio, StudioBeams, StudioCam} from './placesH';
import {BedBlanket, Corridor2, Dining, DinnerTable, HospBed, WaitChairs, WardNight} from './placesD';

/* PART D (4:01–4:46): the decades — kids, grey hair, the night at the hospital bed,
   and back to the TV show from the cold open. */
const OLD = ['glasses', 'scarf', 'stethoscope', 'mustache'] as ('glasses' | 'scarf' | 'stethoscope' | 'mustache')[];

/* ---------- 042 the kids grow up talking in the gaps ---------- */
const D042: React.FC = () => {
	const {f, gf, dur} = useShot();
	const w = useW();
	const grow = interpolate(f, [0, dur], [0, 1], clamp);
	const ks = 0.62 + 0.24 * grow;
	const kseat = 700 + 60 * grow;
	const hicT = w('042', 0.62);
	const cam = camPath(f, [
		[0, camOn(960, 560, 1.2)],
		[w('042', 0.5), camOn(1080, 520, 1.45)],
		[w('042', 1.1), camOn(1100, 520, 1.55)],
	]);
	return (
		<Stage cam={cam} bg="#e8c890" light={{x: 50, y: 20, o: 0.5, c: '255,226,170'}}>
			<Layer depth={1.4}>
				<Dining f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<SeatChair x={590} c="#5a3a22" />
					<SeatChair x={1170} facing={-1} c="#5a3a22" />
					<SeatChair x={1350} facing={-1} c="#5a3a22" />
					{/* booster cushions that shrink as the kids grow */}
					<rect x={1120} y={kseat + 4} width={100} height={826 - kseat - 4} rx={10} fill="#c0503a" />
					<rect x={1300} y={kseat + 4} width={100} height={826 - kseat - 4} rx={10} fill="#3d6fd6" />
					<Actor who="hero" x={610} floor={FL} seat={SEAT} s={HS} facing={1} faceTurn={0.4} look={[0.7, 0]} mouth="smile" pose={{...SIT, armF: [60, 70], armB: [50, 70]}} uid="h-042" />
					<Actor who="kid1" x={1150} floor={FL} seat={kseat} s={ks} facing={-1} faceTurn={0.4} look={[-0.7, 0]} mouth="smile" pose={{...SIT, armF: [60, 70]}} uid="kid1-42" />
					<Actor who="kid2" x={1330} floor={FL} seat={kseat} s={ks} facing={-1} faceTurn={0.4} look={[-0.7, 0]} mouth={f > hicT - 10 && f < hicT ? 'open' : f > hicT + 8 ? 'open' : 'smile'} pose={{...SIT, armF: [60, 70]}} uid="kid2-42" />
					<DinnerTable x={960} />
				</Svg>
				<Prop3D
					x={640}
					y={600}
					w={640}
					h={130}
					make={() => {
						const scene = propScene();
						const foods: ('pasta' | 'peas' | 'soup')[] = ['pasta', 'soup', 'peas'];
						[740, 1050, 1220].forEach((x, i) => {
							const p = makePlate(foods[i]);
							at(p, x, 700, 0);
							p.rotation.x = 0.35;
							scene.add(p);
						});
						[820, 1130].forEach((x) => {
							const g = makeGlass();
							g.scale.setScalar(0.7);
							at(g, x, 700, -10);
							g.rotation.x = 0.2;
							scene.add(g);
						});
						return {scene};
					}}
				/>
				<Svg>
					<HeroBadge x={610} y={SEAT - 164 - 118} s={0.8} />
					<Tag f={f} t={4} x={960} y={200} text="DECADES ROLL PAST" c="#11142c" fg="#ffd34a" size={36} rot={-3} />
					{f > w('042', 0.45) ? (
						<Bubble x={1360} y={360} w={360} h={100} t={f - w('042', 0.45)} tail={[-20, 90]}>
							<text y={14} textAnchor="middle" fontSize={34} fontFamily={FONT} fontWeight={900} fill="#13203a">
								{f < hicT + 6 ? 'Dad, can I…' : 'Dad, can I… …go out?'}
							</text>
						</Bubble>
					) : null}
				</Svg>
			</Layer>
		</Stage>
	);
};

/* ---------- 043 grey hair; patients hear him coming down the hall ---------- */
const D043: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const wk = walkTo(f, 0, w('043', 1.1), 200, 900, 2, 0.26);
	const cam = camPath(f, [
		[0, camOn(600, 540, 1.2)],
		[w('043', 1.1), camOn(1000, 540, 1.3)],
	]);
	const turned = f > w('043', 0.45);
	return (
		<Stage cam={cam} bg="#cfe2e6" light={{x: 50, y: 0, o: 0.4, c: '235,250,255'}}>
			<Layer depth={1.4}>
				<Corridor2 />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<WaitChairs x={1120} n={4} />
					{[0, 1, 2, 3].map((i) => (
						<Extra key={i} i={i + 3} seed="wt" x={1120 + i * 120} floor={826 + 157 * 0.95 - 4} s={0.95} facing={turned ? -1 : 1} pose={{...SIT, armF: [40, 60]}} expr={turned ? 'wide' : 'normal'} />
					))}
					<Actor who="hero" x={wk.x} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.8, 0]} pose={wk.moving ? wk.pose : idle(gf, 2)} vx={wk.vx} bob={wk.bob} uid="h-043" />
					<HeroBadge x={wk.x} y={badgeY(FL) - wk.bob} s={0.8} />
					<Tag f={f} t={6} x={600} y={260} text="GREY HAIR" c="#11142c" fg="#e0e0e8" stroke="#c8ccd8" size={34} rot={-3} />
					<Tag f={f} t={w('043', 0.5)} x={1300} y={300} text="HEARD BEFORE SEEN" c="#11142c" fg="#ffd34a" size={30} rot={3} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* ---------- 044–047 the night at her hospital bed ---------- */
const BX = 1100; // bed centre
const HX = 660; // hero on the chair by the head of the bed
const WIFE_OLD = {hairColor: '#d9d9e0', age: 0.9, acc: ['lashes'] as 'lashes'[]};
const HAND: [number, number] = [868, 724];
const WardShot: React.FC<{beat: 'sit' | 'sorry' | 'hand' | 'night'}> = ({beat}) => {
	const {f, gf, dur} = useShot();
	const w = useW();
	const dawn = beat === 'night' ? interpolate(f, [0, dur], [0, 1], clamp) : 0;
	const holding = beat === 'hand' || beat === 'night';
	const sorry = beat === 'sorry' ? env(f, w('045', 0.55), 1e9, 8, 1) : 0;
	let hp: Pose = {...SIT, lean: 10, armF: [50, 60], armB: [40, 60]};
	if (holding) hp = reach(hp, 'F', [HAND[0] - HX, HAND[1] - SEAT], 1);
	if (sorry > 0) hp = gesture('touchFace', hp, sorry, f);
	if (beat === 'night') hp = {...hp, head: hp.head + 10 * Math.max(0, Math.sin(f / 18))};
	const squeeze = beat === 'hand' ? Math.max(0, Math.sin((f - w('046', 0.05)) / 5)) * env(f, w('046', 0.05), w('046', 0.3), 4, 8) : 0;
	let cam;
	if (beat === 'sit') cam = camPath(f, [[0, camOn(1000, 560, 1.15)], [dur, camOn(980, 560, 1.3)]]);
	else if (beat === 'sorry') cam = camPath(f, [[0, camOn(820, 520, 1.6, {farBlur: 7})], [dur, camOn(800, 500, 1.8, {farBlur: 8})]]);
	else if (beat === 'hand') cam = camPath(f, [[0, camOn(860, 640, 1.9, {farBlur: 8})], [w('046', 0.4), camOn(860, 600, 1.7, {farBlur: 7})], [dur, camOn(880, 580, 1.6, {farBlur: 7})]]);
	else cam = camPath(f, [[0, camOn(1060, 520, 1.15)], [dur, camOn(1060, 540, 1.25)]]);
	return (
		<Stage cam={cam} bg="#141c34" light={{x: 75, y: 15, o: 0.45 + 0.2 * dawn, c: dawn > 0.5 ? '255,200,150' : '170,190,255'}}>
			<Layer depth={1.4}>
				<WardNight f={gf} k={dawn} />
			</Layer>
			<Layer depth={1}>
				<Prop3D
					x={720}
					y={150}
					w={860}
					h={760}
					make={() => {
						const scene = propScene(1.9);
						const mon = makeMonitor();
						at(mon, 800, 900, -60);
						mon.rotation.set(0.05, 0.35, 0);
						const iv = makeIV();
						at(iv, 1440, 900, -80);
						const clock = makeWallClock();
						at(clock, 1100, 260, -100);
						clock.scale.setScalar(0.9);
						scene.add(mon, iv, clock);
						return {scene, mon, clock};
					}}
					update={(wd, ff) => {
						wd.mon.userData.beat(ff);
						(wd.clock.userData.set as (h: number) => void)(beat === 'night' ? 1 + 5 * dawn : 0.9 + ff / 30 / 3600);
					}}
				/>
				<Svg>
					<HospBed x={BX} />
					<Lying who="wife" x={1100} y={676} s={0.95} rot={-86} f={gf} id="wife-bed" expr={beat === 'hand' ? 'sleepy' : 'sleepy'} extra={{...WIFE_OLD, mouth: beat === 'hand' && f > w('046', 0.2) ? 'smile' : 'smile', look: [0.3, -0.6]}} />
					<BedBlanket x={BX} />
					{/* her arm over the blanket, hand reaching to the edge of the bed */}
					<path d={`M985,${700} Q930,${716} ${HAND[0] + 10},${HAND[1] - 4 + squeeze * 3}`} stroke={CAST.wife.color} strokeWidth={20} fill="none" strokeLinecap="round" />
					<circle cx={HAND[0] + 8} cy={HAND[1] - 2 + squeeze * 3} r={10} fill="#0b0b0d" />
					<SeatChair x={HX - 30} c="#4a5a7a" />
					<Actor who="hero" x={HX} floor={FL} seat={SEAT} s={HS} facing={1} faceTurn={0.4} look={[0.7, 0.3]} expr={beat === 'night' ? 'sleepy' : 'sad'} mouth={beat === 'sorry' && sorry > 0.3 ? 'open' : beat === 'hand' ? 'smile' : undefined} pose={hp} uid="h-ward" />
					<HeroBadge x={HX} y={SEAT - 164 - 118} s={0.8} />
					{beat === 'sit' ? <Tag f={f} t={w('044', 0.1)} x={1060} y={240} text="AGE 80" c="#11142c" fg="#9fd8ff" stroke="#9fd8ff" size={36} rot={-3} /> : null}
					{beat === 'sorry' && sorry > 0.2 ? (
						<Bubble x={560} y={380} w={220} h={80} t={f - w('045', 0.55)} tail={[60, 70]}>
							<text y={12} textAnchor="middle" fontSize={32} fontFamily={FONT} fontWeight={900} fill="#13203a">
								sorry…
							</text>
						</Bubble>
					) : null}
					{beat === 'hand' && f > w('046', 0.3) ? (
						<Bubble x={1080} y={430} w={520} h={130} t={f - w('046', 0.3)} tail={[-120, 120]}>
							<text y={-10} textAnchor="middle" fontSize={30} fontFamily={FONT} fontWeight={900} fill="#13203a">
								47 years… and I never once
							</text>
							<text y={30} textAnchor="middle" fontSize={30} fontFamily={FONT} fontWeight={900} fill="#13203a">
								lost you in a crowd. ♥
							</text>
						</Bubble>
					) : null}
					{beat === 'night' ? <Tag f={f} t={6} x={1060} y={180} text="ALL NIGHT" c="#11142c" fg="#ffd34a" size={34} rot={3} /> : null}
				</Svg>
			</Layer>
		</Stage>
	);
};
const D044: React.FC = () => <WardShot beat="sit" />;
const D045: React.FC = () => <WardShot beat="sorry" />;
const D046: React.FC = () => <WardShot beat="hand" />;
const D047: React.FC = () => <WardShot beat="night" />;

/* ---------- 048 fifteen years later: the TV show, applause, a bow — and a hiccup ---------- */
const D048: React.FC = () => {
	const {f, gf, dur} = useShot();
	const w = useW();
	const bow = env(f, w('048', 0.8), w('048', 1.05), 10, 12);
	const hp: Pose = {...gesture('wave', idle(gf, 2), env(f, w('048', 0.5), w('048', 0.78), 10, 10), f), lean: 2 + 38 * bow, head: 14 * bow};
	const clap = env(f, w('048', 0.55), 1e9, 6, 1);
	const cam = camPath(f, [
		[0, camOn(960, 620, 1.05)],
		[w('048', 0.4), camOn(960, 600, 1.2)],
		[w('048', 0.8), camOn(900, 560, 1.55, {farBlur: 7})],
		[dur, camOn(900, 560, 1.65, {farBlur: 7})],
	]);
	return (
		<Stage cam={cam} bg="#0d0f2a" light={{x: 50, y: 0, o: 0.5, c: '255,220,170'}}>
			<Layer depth={1.6}>
				<Studio f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="host" x={1340} floor={FL} seat={806} s={1} facing={-1} faceTurn={0.5} look={[-0.8, 0]} mouth="smile" pose={{...SIT, armF: [70 + 20 * Math.abs(Math.sin(f / 3)) * clap, 60], armB: [60, 60]}} uid="host-48" />
					<HostDesk x={1380} />
					<Actor who="hero" x={900} floor={FL} s={HS} facing={1} faceTurn={0.3} look={[0.4, 0.1]} mouth="smile" pose={hp} acc={OLD} uid="h-048" />
					<HeroBadge x={900} y={badgeY(FL)} s={0.8} />
					{clap > 0
						? Array.from({length: 40}).map((_, i) => {
								const y = ((random('cf' + i) * 1000 + (f - w('048', 0.55)) * (3 + random('cv' + i) * 3)) % 1000) - 60;
								const x = random('cx' + i) * 1920 + Math.sin(f / 9 + i) * 20;
								return <rect key={i} x={x} y={y} width={12} height={20} fill={['#ffd34a', '#ff6a5a', '#9fd8ff', '#9ff0b0'][i % 4]} transform={`rotate(${f * 6 + i * 40} ${x} ${y})`} />;
							})
						: null}
					<Tag f={f} t={w('048', 0.3)} x={900} y={240} text="15 YEARS LATER" c="#11142c" fg="#9fd8ff" stroke="#9fd8ff" size={34} rot={-3} />
				</Svg>
			</Layer>
			<Layer depth={0.95} blend="screen">
				<StudioBeams f={gf} o={0.12} />
			</Layer>
			<Layer depth={0.72}>
				<Svg>
					<StudioCam x={160} f={gf} />
				</Svg>
				<Audience f={gf} laugh={clap} />
			</Layer>
		</Stage>
	);
};

export const SHOTS_D: ShotDef[] = [
	{at: '042', C: D042, whip: true},
	{at: '043', C: D043, whip: true},
	{at: '044', C: D044, whip: true},
	{at: '045', C: D045},
	{at: '046', C: D046},
	{at: '047', C: D047},
	{at: '048', C: D048, whip: true},
];
export {Onoma};

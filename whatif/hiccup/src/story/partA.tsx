import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {Pose, Stickman} from '../engine/Stickman';
import {SIT, env, gesture, idle, reach, walkTo} from '../kit/actions';
import {Actor, hicK, useShot} from '../kit/core';
import type {ShotDef} from '../kit/coverage';
import {HeroBadge, Layer, Sleeper, Stage, Svg, camOn, clamp, flash, usePush} from '../kit/kit';
import {Bedroom, Blanket} from '../kit/sets';
import {Board, Bubble, Cite, FONT} from '../kit/ui';
import {Onoma} from '../reference/PauseTime';
import {CAST} from './cast';
import {Bang, FL, HS, badgeY} from './common';
import {Lying, Tag, TitleWords, camPath, jolt, pop, useW} from './lib';
import {
	Anatomy,
	Armchair,
	Audience,
	BrainScan,
	Coffee,
	ER,
	Farm,
	Glass,
	Heart,
	Hog,
	HostDesk,
	OldFilm,
	PaperBag,
	STRETCHER_TOP,
	STUDIO_SEAT,
	Spoon,
	Stretcher,
	Studio,
	StudioBeams,
	StudioCam,
	Tadpole,
	Womb,
	beatK,
} from './placesH';

/* PART A (0:00–1:42): the TV show at ninety-five, the question, Charles Osborne in 1922,
   the night shift where it starts, what a hiccup is, the first cures. */

const OLD = {acc: ['glasses', 'scarf', 'stethoscope', 'mustache'] as const};
const YOUNG = {age: 0, hairColor: CAST.hero.hairColor};

/* ---------- 001–005 the late-night show ---------- */
const GX = 720; // guest (hero) in the armchair
const HX = 1300; // host behind the desk
const StudioShot: React.FC<{beat: 'wide' | 'host' | 'answer' | 'laugh' | 'count'}> = ({beat}) => {
	const {f, gf, at} = useShot();
	const w = useW();
	const lean = beat === 'wide' ? env(f, w('001', 0.55), 1e9, 20, 1) : beat === 'host' ? 1 : 0;
	const hostPose: Pose = {...SIT, lean: SIT.lean + 14 * lean, armF: [60, 70], armB: [50, 70]};
	let hp: Pose = {...SIT, armF: [30, 60], armB: [20, 60]};
	if (beat === 'laugh') hp = gesture('rubChin', hp, env(f, w('004', 0.45), w('004', 0.8), 12, 12), f);
	const laugh = beat === 'laugh' ? env(f, at('004') - 4, w('004', 0.35), 6, 20) : 0;
	let cam;
	if (beat === 'wide') cam = usePush(camOn(960, 640, 1.0), camOn(1010, 600, 1.22));
	else if (beat === 'host') cam = usePush(camOn(HX - 120, 560, 1.9, {farBlur: 7}), camOn(HX - 130, 570, 2.1, {farBlur: 8}));
	else if (beat === 'answer') cam = usePush(camOn(GX + 60, 560, 2.1, {farBlur: 7}), camOn(GX + 50, 580, 2.4, {farBlur: 8}));
	else if (beat === 'laugh')
		cam = camPath(f, [
			[at('004'), camOn(960, 700, 1.05)],
			[w('004', 0.3), camOn(960, 680, 1.12)],
			[w('004', 0.45), camOn(GX + 40, 560, 1.9, {farBlur: 7})],
			[w('004', 1), camOn(GX + 40, 570, 2.05, {farBlur: 7})],
		]);
	else cam = usePush(camOn(GX + 60, 580, 1.9, {farBlur: 8}), camOn(GX + 50, 570, 2.15, {farBlur: 9}));
	const mouth = beat === 'answer' && f > w('003', 0.35) ? 'open' : beat === 'laugh' ? 'flat' : undefined;
	return (
		<Stage cam={cam} bg="#0d0f2a" light={{x: 50, y: 0, o: 0.5, c: '255,220,170'}}>
			<Layer depth={1.6}>
				<Studio f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Armchair x={GX - 10} />
					<Actor who="host" x={HX} floor={FL} seat={STUDIO_SEAT} s={1} facing={-1} faceTurn={0.5} look={[-0.8, 0]} sp="N" mouth={beat === 'host' ? undefined : laugh > 0.3 ? 'smile' : 'smirk'} pose={hostPose} uid="host" />
					<HostDesk x={HX + 40} />
					<Actor who="hero" x={GX} floor={FL} seat={STUDIO_SEAT} s={HS} facing={1} faceTurn={0.5} look={[0.8, beat === 'laugh' ? 0.3 : 0]} expr={beat === 'answer' ? 'wide' : beat === 'laugh' ? 'sad' : 'normal'} mouth={mouth} pose={hp} {...OLD} acc={[...OLD.acc]} uid="h-show" />
					<HeroBadge x={GX} y={STUDIO_SEAT - 164 - 118} s={0.8} />
					{beat === 'host' ? (
						<Bubble x={HX - 140} y={400} w={600} h={140} t={f - at('002') - 2} tail={[90, 120]}>
							<text y={-14} textAnchor="middle" fontSize={36} fontFamily={FONT} fontWeight={900} fill="#13203a">
								So, Doctor... how many times
							</text>
							<text y={32} textAnchor="middle" fontSize={36} fontFamily={FONT} fontWeight={900} fill="#13203a">
								have you hiccuped?
							</text>
						</Bubble>
					) : null}
					{beat === 'laugh' ? (
						<>
							<Tag f={f} t={w('004', 0.45)} x={GX - 330} y={420} text="AGE 95" c="#11142c" fg="#9fd8ff" stroke="#9fd8ff" size={34} rot={-5} />
							<Tag f={f} t={w('004', 0.62)} x={GX + 330} y={360} text="67 YEARS NONSTOP" c="#3a1d2a" fg="#ff9a8a" stroke="#ff6a5a" size={36} rot={4} />
						</>
					) : null}
					{beat === 'count' ? <Tag f={f} t={at('005') + 30} x={GX + 300} y={430} text="AND COUNTING" c="#11142c" fg="#ffd34a" size={36} rot={5} /> : null}
				</Svg>
			</Layer>
			<Layer depth={0.95} blend="screen">
				<StudioBeams f={gf} o={0.12} />
			</Layer>
			<Layer depth={0.72}>
				<Svg>
					<StudioCam x={160} f={gf} />
				</Svg>
				<Audience f={gf} laugh={laugh} />
			</Layer>
		</Stage>
	);
};
const A001: React.FC = () => <StudioShot beat="wide" />;
const A002: React.FC = () => <StudioShot beat="host" />;
const A003: React.FC = () => <StudioShot beat="answer" />;
const A004: React.FC = () => <StudioShot beat="laugh" />;
const A005: React.FC = () => <StudioShot beat="count" />;

/* ---------- 006 «So what if you got the hiccups, and they never went away?» ---------- */
const A006: React.FC = () => {
	const {f, gf, at, end} = useShot();
	const cam = usePush(camOn(960, 640, 1.4), camOn(960, 600, 1.15));
	const ts = [at('006') + 26, at('006') + 62];
	const hk = jolt(f, ts);
	return (
		<>
			<Stage cam={cam} bg="#07081a" light={{x: 50, y: 40, o: 0.5, c: '255,230,190'}}>
				<Layer depth={1}>
					<Svg>
						<ellipse cx={960} cy={905} rx={300} ry={40} fill="#fff6d8" opacity={0.18} />
						<polygon points="900,-40 1020,-40 1260,905 660,905" fill="#fff6d8" opacity={0.08} />
						<Actor who="hero" x={960} floor={FL} s={HS} facing={1} faceTurn={0.1} look={[0, 0]} expr="sad" pose={idle(gf, 4)} hic={false} bob={hk * 10} acc={[...OLD.acc]} uid="h-title" />
						{ts.map((t, i) => (f > t - 1 && f < t + 26 ? <Onoma key={i} x={1090} y={560} text="HIC!" t={f - t} c="#ffd34a" size={56} /> : null))}
					</Svg>
				</Layer>
			</Stage>
			<TitleWords words={['SO', 'WHAT', 'IF', 'YOU', 'GOT', 'THE', 'HICCUPS…', 'AND', 'THEY', 'NEVER', 'WENT', 'AWAY?']} hot={['HICCUPS', 'NEVER']} t0={at('006')} len={end('006') - at('006')} />
		</>
	);
};

/* ---------- 007–008 Charles Osborne, 1922 (sepia film) ---------- */
const FarmShot: React.FC<{beat: 'hog' | 'years'}> = ({beat}) => {
	const {f, gf, at, end} = useShot();
	const w = useW();
	const FX0 = 760;
	const HOGX = 1180;
	let fx = FX0;
	let fp: Pose = idle(gf, 7);
	let fall = 0;
	let lift = 0;
	let hogX = HOGX;
	let hogY = FL;
	let hogRot = 0;
	let walkVx = 0;
	let bob = 0;
	const hicTs = beat === 'hog' ? [w('007', 0.86), w('007', 0.95)] : [at('008') + 8, at('008') + 34, at('008') + 60];
	if (beat === 'hog') {
		const wk = walkTo(f, w('007', 0.3), w('007', 0.45), FX0, HOGX - 170, 7, 0.3);
		fx = wk.x;
		fp = wk.moving ? wk.pose : idle(gf, 7);
		walkVx = wk.vx;
		bob = wk.bob;
		lift = env(f, w('007', 0.47), 1e9, 16, 1);
		fall = interpolate(f, [w('007', 0.62), w('007', 0.68)], [0, 1], clamp);
		if (lift > 0) fp = reach(reach({...fp, lean: 10 - 16 * lift, legF: [10, 20 * (1 - lift)]}, 'F', [130, -60 - 70 * lift], lift), 'B', [120, -50 - 70 * lift], lift);
		if (lift > 0 && fall < 1) {
			hogX = interpolate(lift, [0, 1], [HOGX, fx + 130]);
			hogY = interpolate(lift, [0, 1], [FL, FL - 157 - 20]);
			hogRot = -8 * lift;
		}
		if (fall > 0) {
			hogX = fx + 220 + 60 * fall;
			hogY = interpolate(fall, [0, 1], [FL - 177, FL]);
			hogRot = 20 * fall * (1 - fall);
		}
		const sitUp = interpolate(f, [w('007', 0.76), w('007', 0.84)], [0, 1], clamp);
		if (fall > 0) fp = {lean: -10, head: -6, armB: [-40, 30], armF: [40, 40], legB: [70, 10], legF: [80, 20]};
		if (sitUp > 0) fp = {...SIT, lean: -10 + 6 * sitUp};
	} else {
		fp = {...SIT, lean: -4};
	}
	const fj = jolt(f, hicTs);
	const lying = beat === 'hog' && fall > 0 && f < w('007', 0.76);
	const seated = beat === 'years' || f >= w('007', 0.76);
	const cam =
		beat === 'hog'
			? camPath(f, [
					[at('007'), camOn(960, 560, 1.0)],
					[w('007', 0.3), camOn(900, 580, 1.15)],
					[w('007', 0.55), camOn(fx + 120, 620, 1.5)],
					[w('007', 0.75), camOn(fx + 60, 700, 1.7)],
					[w('007', 1), camOn(fx + 40, 690, 1.85)],
				])
			: usePush(camOn(820, 620, 1.5), camOn(820, 640, 1.25));
	const year = beat === 'years' ? Math.round(interpolate(f, [at('008') + 4, at('008') + 64], [1922, 1990], {...clamp})) : 1922;
	const old = beat === 'years' ? interpolate(f, [at('008') + 4, at('008') + 64], [0, 1], clamp) : 0;
	const farmerHair = old > 0 ? `rgb(${90 + 130 * old},${74 + 140 * old},${58 + 160 * old})` : CAST.farmer.hairColor;
	return (
		<AbsoluteFill style={{filter: 'sepia(0.85) saturate(0.9) contrast(1.05) brightness(0.98)'}}>
			<Stage cam={cam} bg="#c8b088" light={{x: 70, y: 10, o: 0.35}} grain={0.25} vig={0.7}>
				<Layer depth={1.5}>
					<Farm f={gf} />
				</Layer>
				<Layer depth={1}>
					<Svg>
						<Hog x={hogX} y={hogY} rot={hogRot} kick={lift > 0 && fall < 1 ? Math.abs(Math.sin(f / 2)) : 0} />
						{lying ? (
							<g transform={`translate(${fx},${FL - 30}) rotate(-80)`}>
								<Stickman id="farmer-l" x={0} y={0} scale={1} pose={{lean: 0, head: 6, armB: [-30, 20], armF: [30, 20], legB: [-6, 0], legF: [8, 6]}} {...CAST.farmer} expr="wide" t={gf} />
							</g>
						) : (
							<Actor who="farmer" x={fx} floor={FL} seat={seated ? FL - 60 - fj * 12 : undefined} s={1} facing={1} faceTurn={0.5} look={[0.6, 0]} expr={seated ? 'worried' : 'normal'} mouth={fj > 0.3 ? 'open' : undefined} pose={{...fp, head: fp.head - 10 * fj}} vx={walkVx} bob={bob} hairColor={farmerHair} age={old} shadow={!seated} uid="farmer" />
						)}
						{hicTs.map((t, i) => (f > t - 1 && f < t + 26 ? <Onoma key={i} x={fx + 150} y={FL - 330 + (i % 2) * 30} text="HIC!" t={f - t} c="#fff4d8" size={58} rot={i % 2 ? 8 : -8} /> : null))}
						{beat === 'hog' ? (
							<>
								<Tag f={f} t={w('007', 0.4)} x={HOGX + 40} y={FL - 330} text="350 LB" c="#2a1a10" fg="#fff4d8" stroke="#fff4d8" size={38} rot={5} until={w('007', 0.66)} />
								{f > w('007', 0.62) && f < w('007', 0.75) ? <Onoma x={fx + 60} y={FL - 200} text="THUD!" t={f - w('007', 0.62)} c="#fff4d8" size={64} /> : null}
							</>
						) : null}
					</Svg>
				</Layer>
				<Layer depth={0.9}>
					<OldFilm f={gf} />
				</Layer>
			</Stage>
			{/* caption card like an old newsreel */}
			<AbsoluteFill style={{pointerEvents: 'none'}}>
				<div style={{position: 'absolute', left: 70, top: 60, padding: '14px 28px', background: '#1b1208', color: '#fff4d8', fontFamily: FONT, fontWeight: 900, fontSize: 44, letterSpacing: 4, opacity: interpolate(f, [4, 14], [0, 1], clamp), transform: `rotate(-2deg) scale(${pop(f, 4)})`}}>
					{year} · {beat === 'hog' ? 'NEBRASKA, USA' : 'STILL HICCUPING'}
				</div>
				{beat === 'hog' ? (
					<div style={{position: 'absolute', right: 80, top: 70, padding: '10px 26px', background: '#fff4d8', color: '#1b1208', fontFamily: FONT, fontWeight: 900, fontSize: 40, opacity: interpolate(f, [w('007', 0.22), w('007', 0.26)], [0, 1], clamp), transform: `rotate(2deg) scale(${pop(f, w('007', 0.22))})`}}>
						CHARLES OSBORNE, FARMER
					</div>
				) : (
					<div style={{position: 'absolute', right: 80, top: 70, padding: '10px 26px', background: '#fff4d8', color: '#1b1208', fontFamily: FONT, fontWeight: 900, fontSize: 52, transform: `rotate(2deg) scale(${pop(f, at('008') + 4)})`}}>
						{year - 1922} YEARS
					</div>
				)}
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
const A007: React.FC = () => <FarmShot beat="hog" />;
const A008: React.FC = () => <FarmShot beat="years" />;

/* 008b «Today, that's you. Only you're a doctor.» — colour bursts back, the hero in the white coat */
const A008b: React.FC = () => {
	const {f, gf} = useShot();
	const cam = usePush(camOn(960, 560, 1.55), camOn(960, 600, 1.3));
	const k = interpolate(f, [0, 10], [0, 1], clamp);
	const hp = gesture('presentF', reach(idle(gf, 3), 'B', [-10, -150], env(f, 16, 1e9, 10, 1)), env(f, 24, 1e9, 12, 1), f);
	return (
		<Stage cam={cam} bg="#101a44" light={{x: 50, y: 20, o: 0.55, c: '255,236,200'}} dust="#9fd8ff">
			<Layer depth={1.4}>
				<Svg>
					{Array.from({length: 14}).map((_, i) => (
						<polygon key={i} points={`960,520 ${960 + Math.cos((i / 14) * Math.PI * 2 + f / 80) * 1600},${520 + Math.sin((i / 14) * Math.PI * 2 + f / 80) * 1600} ${960 + Math.cos(((i + 0.5) / 14) * Math.PI * 2 + f / 80) * 1600},${520 + Math.sin(((i + 0.5) / 14) * Math.PI * 2 + f / 80) * 1600}`} fill="#1d2a6a" opacity={0.8} />
					))}
					<circle cx={960} cy={520} r={260 + 30 * k} fill="#2a3a8a" opacity={0.6} />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<ellipse cx={960} cy={905} rx={220} ry={30} fill="#000" opacity={0.3} />
					<Actor who="hero" x={960} floor={FL} s={HS * (0.9 + 0.1 * pop(f, 0))} facing={1} faceTurn={0.2} look={[0.2, -0.1]} mouth="smile" pose={hp} {...YOUNG} uid="h-doc" />
					<Tag f={f} t={22} x={1300} y={420} text="DOCTOR" c="#11142c" fg="#ffffff" stroke="#e4473c" size={48} rot={5} />
					<Tag f={f} t={30} x={640} y={340} text="THAT'S YOU" c="#11142c" fg="#ffd34a" size={38} rot={-6} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* ---------- 009–013 the night shift ---------- */
const HX9 = 900;
const A009: React.FC = () => {
	const {f, gf, at} = useShot();
	const w = useW();
	const wk = walkTo(f, -6, w('009', 0.75), 260, HX9, 2, 0.28);
	const cam = usePush(camOn(700, 560, 1.15), camOn(HX9 + 40, 540, 1.45));
	return (
		<Stage cam={cam} bg="#0d2230" light={{x: 70, y: 0, o: 0.4, c: '200,240,255'}}>
			<Layer depth={1.6}>
				<ER f={gf} clock={3.96 + f / 30 / 3600} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Stretcher x={1380} />
					<Actor who="hero" x={wk.x} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.8, 0]} expr="sleepy" pose={reach(wk.moving ? wk.pose : idle(gf, 2), 'F', [50, -96], 1)} handItem={<Coffee />} vx={wk.vx} bob={wk.bob} {...YOUNG} uid="h-er" />
					<HeroBadge x={wk.x} y={badgeY(FL) - wk.bob} s={0.8} />
					<Tag f={f} t={w('009', 0.45)} x={HX9 + 330} y={360} text="AGE 28" c="#11142c" fg="#9fd8ff" stroke="#9fd8ff" size={38} rot={4} />
					<Tag f={f} t={w('009', 0.7)} x={1460} y={290} text="NIGHT SHIFT" c="#11142c" fg="#ffd34a" size={30} rot={-3} />
				</Svg>
			</Layer>
		</Stage>
	);
};
/* 010 the heartbeat through the stethoscope — the planted rule */
const PX = 1160; // patient on the stretcher edge
const A010: React.FC = () => {
	const {f, gf, at} = useShot();
	const w = useW();
	const lis = env(f, 10, 1e9, 14, 1);
	const hp = reach({...idle(gf, 2), lean: 10 * lis, head: 10 * lis}, 'F', [112, -84], lis);
	const cam = camPath(f, [
		[0, camOn(1080, 580, 1.35)],
		[w('010', 0.4), camOn(1100, 540, 1.7, {farBlur: 7})],
		[w('010', 1), camOn(1100, 520, 1.85, {farBlur: 8})],
	]);
	const hand: [number, number] = [HX9 + 130 + 112, FL - 157 - 84];
	const hk = beatK(f, 26);
	return (
		<Stage cam={cam} bg="#0d2230" light={{x: 60, y: 10, o: 0.45, c: '200,240,255'}}>
			<Layer depth={1.6}>
				<ER f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Stretcher x={PX + 120} />
					<Actor who="patient" x={PX} floor={FL} seat={STRETCHER_TOP - 4} s={1.08} facing={-1} faceTurn={0.4} look={[-0.6, 0.3]} pose={SIT} uid="pat-10" />
					<Actor who="hero" x={HX9 + 130} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.6, 0.6]} expr="sleepy" mouth="smile" pose={hp} {...YOUNG} uid="h-steth" />
					{lis > 0.5 ? <path d={`M${HX9 + 130 + 6},${FL - 157 - 120} Q${HX9 + 180},${FL - 157 - 20} ${hand[0]},${hand[1]}`} stroke="#2a2f4a" strokeWidth={5} fill="none" /> : null}
					{lis > 0.5 ? <circle cx={hand[0] + 4} cy={hand[1]} r={9} fill="#c9d0dc" stroke="#5a6278" strokeWidth={2.5} /> : null}
					<g transform={`translate(${1380},${400}) scale(${pop(f, w('010', 0.15)) * 1.1})`}>
						<circle r={110} fill="#11142c" opacity={0.85} stroke="#ff8a9a" strokeWidth={6} />
						<Heart k={hk} />
					</g>
					{f > w('010', 0.2) ? <Onoma x={1500} y={300} text="BA-DUM" t={(f - w('010', 0.2)) % 26} c="#ff8a9a" size={42} rot={6} /> : null}
					<Tag f={f} t={w('010', 0.62)} x={860} y={360} text="REMEMBER THIS SOUND" c="#11142c" fg="#ffd34a" size={36} rot={-5} />
				</Svg>
			</Layer>
		</Stage>
	);
};
/* 011 the patient slides off the stretcher, the hero catches him */
const A011: React.FC = () => {
	const {f, gf, at} = useShot();
	const w = useW();
	const SX = 1480;
	const slide = interpolate(f, [w('011', 0.3), w('011', 0.5)], [0, 1], {...clamp});
	const run = walkTo(f, w('011', 0.3), w('011', 0.48), 800, 1030, 3, 0.5);
	const caught = f >= w('011', 0.5);
	const strain = env(f, w('011', 0.5), 1e9, 6, 1);
	let hp: Pose = run.moving ? run.pose : idle(gf, 3);
	if (caught) hp = reach(reach({...hp, lean: 12, legF: [24, 40 * strain], legB: [-18, 40 * strain]}, 'F', [110, -40], 1), 'B', [100, -30], 1);
	const heroX = run.x;
	const sag = strain * 26 + Math.sin(f / 2) * 3 * strain;
	// patient path: lying on the stretcher → sliding off the left edge → in the hero's arms
	const px = caught ? heroX + 70 : interpolate(slide, [0, 1], [SX, heroX + 90]);
	const py = caught ? FL - 157 - 40 + sag : interpolate(slide, [0, 1], [STRETCHER_TOP - 52, FL - 157 - 20]);
	const rot = caught ? 78 : 84 + 16 * Math.sin(slide * Math.PI);
	const cam = camPath(f, [
		[0, camOn(1300, 600, 1.35)],
		[w('011', 0.3), camOn(1250, 620, 1.25)],
		[w('011', 0.52), camOn(1110, 620, 1.55, {farBlur: 7})],
		[w('011', 1), camOn(1110, 640, 1.75, {farBlur: 8})],
	]);
	return (
		<Stage cam={cam} bg="#0d2230" light={{x: 60, y: 10, o: 0.45, c: '200,240,255'}}>
			<Layer depth={1.6}>
				<ER f={gf} clock={4.0} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Stretcher x={SX} />
					<Actor who="hero" x={heroX} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.7, 0.3]} expr={caught ? 'wide' : 'worried'} mouth={caught ? 'open' : undefined} pose={hp} vx={run.vx} bob={run.bob - sag * 0.3} squash={caught ? 0.04 * strain : 0} {...YOUNG} uid="h-catch" />
					<Lying who="patient" x={px} y={py} s={1.15} rot={rot} f={gf} id="pat-11" expr={slide > 0.05 ? 'wide' : 'sleepy'} />
					<HeroBadge x={heroX} y={badgeY(FL) - 10} s={0.8} />
					{f > w('011', 0.5) && f < w('011', 0.65) ? <Bang f={f} t={w('011', 0.5)} x={heroX + 120} y={FL - 420} text="OOF!" c="#ffd34a" /> : null}
					<Tag f={f} t={w('011', 0.72)} x={heroX + 330} y={420} text="350 LB" c="#11142c" fg="#ff9a8a" stroke="#ff6a5a" size={44} rot={5} />
					<Tag f={f} t={w('011', 0.05)} x={1560} y={330} text="4:00 AM" c="#11142c" fg="#9fd8ff" stroke="#9fd8ff" size={32} rot={-4} until={w('011', 0.45)} />
				</Svg>
			</Layer>
		</Stage>
	);
};
/* 012 «Something inside you goes pop. You feel nothing. Then your chest jumps.» */
const A012: React.FC = () => {
	const {f, gf, at} = useShot();
	const w = useW();
	const popT = w('012', 0.12);
	const cam = camPath(f, [
		[0, camOn(980, 520, 1.9, {farBlur: 7})],
		[w('012', 0.5), camOn(1020, 480, 2.2, {farBlur: 8})],
		[w('012', 0.85), camOn(960, 560, 1.6, {farBlur: 7})],
		[w('012', 1.3), camOn(960, 560, 1.7, {farBlur: 7})],
	]);
	const hp = gesture('touchFace', idle(gf, 2), env(f, w('012', 0.45), w('012', 0.75), 10, 10), f);
	return (
		<Stage cam={cam} bg="#0d2230" light={{x: 60, y: 10, o: 0.45, c: '200,240,255'}}>
			<Layer depth={1.6}>
				<ER f={gf} clock={4.02} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Stretcher x={1500} />
					<Lying who="patient" x={1500} y={STRETCHER_TOP - 52} s={1.15} f={gf} id="pat-12" />
					<Actor who="hero" x={960} floor={FL} s={HS} facing={1} faceTurn={0.5} look={[0.3, 0]} expr={f > w('012', 0.85) ? 'wide' : 'normal'} pose={hp} {...YOUNG} uid="h-pop" />
					<HeroBadge x={960} y={badgeY(FL)} s={0.8} />
					{/* the inside view: a pin-sized pop at the base of the brain */}
					<g transform={`translate(1240,440) scale(${0.34 * pop(f, popT)})`} opacity={interpolate(f, [w('012', 0.7), w('012', 0.8)], [1, 0], clamp)}>
						<circle r={330} fill="#11142c" stroke="#9fd8ff" strokeWidth={10} />
						<BrainScan spot={env(f, popT, 1e9, 4, 1)} f={f} />
					</g>
					{f > popT && f < popT + 28 ? <Onoma x={1340} y={330} text="pop" t={f - popT} c="#ffd34a" size={48} /> : null}
					<Tag f={f} t={w('012', 0.45)} x={700} y={380} text="FEEL NOTHING" c="#11142c" fg="#9fd8ff" stroke="#9fd8ff" size={32} rot={-5} until={w('012', 0.8)} />
				</Svg>
			</Layer>
		</Stage>
	);
};
/* 013 «You laugh it off. You're a doctor.» */
const A013: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const cam = usePush(camOn(1020, 560, 1.4), camOn(1000, 540, 1.6));
	const hp = gesture('shrug', idle(gf, 2), env(f, w('013', 0.1), w('013', 0.6), 8, 12), f);
	const np = gesture('touchFace', idle(gf, 5), env(f, w('013', 0.05), w('013', 0.8), 8, 12), f);
	return (
		<Stage cam={cam} bg="#0d2230" light={{x: 60, y: 10, o: 0.45, c: '200,240,255'}}>
			<Layer depth={1.6}>
				<ER f={gf} clock={4.05} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={900} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.6, 0]} mouth="smile" pose={hp} {...YOUNG} uid="h-laugh" />
					<Actor who="nurse" x={1240} floor={FL} s={0.98} facing={-1} faceTurn={0.4} look={[-0.7, 0]} mouth="smile" pose={np} uid="nurse-13" />
					<HeroBadge x={900} y={badgeY(FL)} s={0.8} />
					{f > w('013', 0.12) && f < w('013', 0.5) ? <Onoma x={760} y={430} text="HA!" t={f - w('013', 0.12)} c="#9ff0b0" size={50} /> : null}
					<Tag f={f} t={w('013', 0.55)} x={1240} y={330} text="IT'S JUST A HICCUP" c="#11142c" fg="#fff" size={32} rot={4} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* ---------- 014–016 what a hiccup is (infographics) ---------- */
const A014: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const twitch = Math.max(env(f, w('014', 0.3), w('014', 0.36), 3, 5), env(f, w('014', 0.84), w('014', 0.88), 2, 6));
	const air = env(f, w('014', 0.48), w('014', 0.66), 6, 6);
	const shut = interpolate(f, [w('014', 0.66), w('014', 0.7)], [0, 1], clamp) * (1 - interpolate(f, [w('014', 0.92), w('014', 1.05)], [0, 1], clamp));
	const z = interpolate(f, [0, w('014', 0.45), w('014', 0.6), w('014', 1.1)], [0.85, 0.95, 1.15, 1.25], clamp);
	const cy = interpolate(f, [w('014', 0.45), w('014', 0.62)], [560, 700], clamp);
	const hicT = w('014', 0.84);
	return (
		<Board tint="#1a2150">
			<g transform={`translate(960,${cy}) scale(${z})`}>
				<Anatomy twitch={twitch} air={air} shut={shut} f={f} labels={[pop(f, w('014', 0.05)), pop(f, w('014', 0.6)), pop(f, w('014', 0.18))]} />
			</g>
			{f > hicT && f < hicT + 30 ? <Onoma x={1380} y={300} text="HIC!" t={f - hicT} c="#ffd34a" size={120} /> : null}
			<Tag f={f} t={w('014', 0.48)} x={1500} y={600} text="AIR RUSHES IN" c="#11142c" fg="#9fd8ff" stroke="#9fd8ff" size={34} rot={4} until={w('014', 0.8)} />
		</Board>
	);
};
const A015: React.FC = () => {
	const {f} = useShot();
	const w = useW();
	const shut = (f % 40) / 40 < 0.5 ? 1 : 0;
	return (
		<Board tint="#16364a">
			{Array.from({length: 18}).map((_, i) => (
				<circle key={i} cx={(i * 211) % 1920} cy={1080 - ((f * (1 + (i % 3)) + i * 97) % 1100)} r={6 + (i % 4) * 3} fill="none" stroke="#9fd8ff" strokeWidth={3} opacity={0.35} />
			))}
			<g transform={`translate(${interpolate(f, [0, w('015', 1)], [1100, 1180], clamp)},${600 + Math.sin(f / 10) * 14}) scale(${1.5 * pop(f, w('015', 0.35))})`}>
				<Tadpole f={f} shut={shut} />
			</g>
			<g opacity={pop(f, 2)}>
				<text x={960} y={170} textAnchor="middle" fontSize={78} fontFamily={FONT} fontWeight={900} fill="#fff" stroke="#11142c" strokeWidth={10} paintOrder="stroke">
					NOBODY KNOWS WHY
				</text>
			</g>
			<g transform={`translate(520,600) scale(${pop(f, w('015', 0.5))})`}>
				<text textAnchor="middle" fontSize={56} fontFamily={FONT} fontWeight={900} fill="#9ff0b0">
					LEFT OVER
				</text>
				<text y={70} textAnchor="middle" fontSize={56} fontFamily={FONT} fontWeight={900} fill="#9ff0b0">
					FROM TADPOLES?
				</text>
				<text y={150} textAnchor="middle" fontSize={34} fontFamily={FONT} fill="#cfe9ff">
					they shut the throat
				</text>
				<text y={195} textAnchor="middle" fontSize={34} fontFamily={FONT} fill="#cfe9ff">
					to breathe through gills
				</text>
			</g>
			<Cite text="Straus et al., BioEssays, 2003" t={f - w('015', 0.5)} />
		</Board>
	);
};
const A016: React.FC = () => {
	const {f} = useShot();
	const ts = [16, 44, 72];
	const j = jolt(f, ts);
	return (
		<Board tint="#3a1d3a">
			<g transform={`translate(960,560) scale(${1.05 + f * 0.0015})`}>
				<Womb f={f} jolt={j} />
			</g>
			{ts.map((t, i) => (f > t - 1 && f < t + 26 ? <Onoma key={i} x={1220} y={420 + i * 30} text="hic" t={f - t} c="#ffd0e0" size={46} rot={i % 2 ? 8 : -8} /> : null))}
			<Tag f={f} t={8} x={960} y={130} text="BEFORE THE FIRST BREATH" c="#11142c" fg="#ffd0e0" stroke="#ff8ab0" size={44} rot={-2} />
		</Board>
	);
};

/* ---------- 017–018 the cures ---------- */
const NX = 1190;
const CureShot: React.FC<{beat: 'cures' | 'bag'}> = ({beat}) => {
	const {f, gf, at} = useShot();
	const w = useW();
	let hp: Pose = idle(gf, 2);
	let np: Pose = idle(gf, 5);
	let item: React.ReactNode = undefined;
	let nItem: React.ReactNode = undefined;
	let nx = NX;
	let nFacing: 1 | -1 = -1;
	let expr: 'normal' | 'wide' | 'worried' = 'normal';
	let mouth: 'flat' | 'open' | undefined;
	let cam;
	let bob = 0;
	let puff = 0;
	if (beat === 'cures') {
		const a = env(f, w('017', 0.28), w('017', 0.5), 8, 6);
		const b = env(f, w('017', 0.52), w('017', 0.72), 8, 6);
		const c = env(f, w('017', 0.74), 1e9, 10, 1);
		puff = a;
		if (a > 0) {
			hp = gesture('touchFace', hp, a, 0);
			expr = 'wide';
			mouth = 'flat';
		}
		if (b > 0) {
			np = reach(np, 'F', [150, -150], b);
			nItem = b > 0.5 && f < w('017', 0.62) ? <Spoon /> : undefined;
			if (f >= w('017', 0.62)) {
				hp = reach(hp, 'F', [40, -175], b);
				item = <Spoon />;
			}
		}
		if (c > 0) {
			hp = reach({...hp, lean: hp.lean + 48 * c, head: hp.head + 20 * c}, 'F', [70, -150], c);
			nx = NX + 120 * c;
			item = <Glass tilt={-150 * c} />;
			expr = 'worried';
		}
		cam = camPath(f, [
			[at('017'), camOn(1000, 560, 1.25)],
			[w('017', 0.28), camOn(940, 470, 1.9, {farBlur: 7})],
			[w('017', 0.52), camOn(1060, 480, 1.75, {farBlur: 7})],
			[w('017', 0.74), camOn(980, 600, 1.55)],
			[w('017', 1), camOn(990, 620, 1.65)],
		]);
	} else {
		// the nurse sneaks up behind and pops a paper bag
		nFacing = 1;
		const sneak = walkTo(f, at('018') - 2, w('018', 0.45), 560, 760, 5, 0.18);
		nx = sneak.x;
		np = sneak.moving ? sneak.pose : idle(gf, 5);
		const popT = w('018', 0.55);
		np = reach(np, 'F', [70, -150], 1);
		nItem = <PaperBag burst={interpolate(f, [popT, popT + 6], [0, 1], clamp)} />;
		const startle = env(f, popT, popT + 14, 2, 10);
		bob = startle * 40;
		if (f >= popT) {
			expr = 'wide';
			mouth = 'open';
			hp = gesture('handsOnHead', hp, startle, f);
		}
		cam = camPath(f, [
			[at('018'), camOn(860, 560, 1.5)],
			[popT - 4, camOn(880, 520, 1.75, {farBlur: 7})],
			[popT + 8, camOn(900, 560, 1.45)],
			[w('018', 1.6), camOn(920, 540, 1.75, {farBlur: 7})],
		]);
	}
	const popT = beat === 'bag' ? w('018', 0.55) : -1;
	const fl = beat === 'bag' ? flash(f, popT, 5) : 0;
	return (
		<Stage cam={cam} bg="#123040" light={{x: 20, y: 10, o: 0.55, c: '255,214,170'}}>
			<Layer depth={1.6}>
				<ER f={gf} dawn={1} clock={7.0 + f / 30 / 600} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					{beat === 'cures' ? <Actor who="colleague" x={640} floor={FL} s={0.98} facing={1} faceTurn={0.4} look={[0.7, 0]} mouth="smile" pose={gesture('point', idle(gf, 8), env(f, w('017', 0.1), w('017', 0.3), 8, 8), f)} uid="col-17" /> : null}
					<Actor who="nurse" x={nx} floor={FL} s={0.98} facing={nFacing} faceTurn={0.4} look={[0.7 * nFacing, 0]} mouth={beat === 'bag' ? 'smirk' : 'smile'} pose={np} handItem={nItem} uid="nurse-17" />
					<Actor who="hero" x={960} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.5, 0]} expr={expr} mouth={mouth} pose={hp} handItem={item} bob={bob} {...YOUNG} uid="h-cure" />
					{puff > 0.3 ? <circle cx={960 + 16} cy={FL - 157 - 164 + 22} r={20 * puff} fill="#ff6a5a" opacity={0.35} /> : null}
					<HeroBadge x={960} y={badgeY(FL) - bob} s={0.8} />
					{beat === 'cures' ? (
						<>
							<Tag f={f} t={w('017', 0.3)} x={800} y={340} text="HOLD YOUR BREATH" c="#11142c" fg="#9fd8ff" stroke="#9fd8ff" size={32} rot={-5} until={w('017', 0.5)} />
							<Tag f={f} t={w('017', 0.54)} x={1180} y={330} text="SUGAR ON A SPOON" c="#11142c" fg="#ffd34a" size={32} rot={4} until={w('017', 0.73)} />
							<Tag f={f} t={w('017', 0.76)} x={820} y={380} text="WATER UPSIDE DOWN" c="#11142c" fg="#9ff0b0" stroke="#9ff0b0" size={32} rot={-4} />
						</>
					) : (
						<>
							{f > popT && f < popT + 30 ? <Onoma x={760} y={430} text="POP!" t={f - popT} c="#ffffff" size={96} /> : null}
							<Tag f={f} t={w('018', 1.6)} x={1260} y={330} text="NOTHING WORKS" c="#3a1d2a" fg="#ff9a8a" stroke="#ff6a5a" size={36} rot={4} />
						</>
					)}
				</Svg>
			</Layer>
			{fl > 0 ? <AbsoluteFill style={{background: '#fff', opacity: fl * 0.6}} /> : null}
		</Stage>
	);
};
const A017: React.FC = () => <CureShot beat="cures" />;
const A018: React.FC = () => <CureShot beat="bag" />;

/* ---------- 019 home, asleep, and the same rhythm in the morning ---------- */
const A019: React.FC = () => {
	const {f, gf, at, end} = useShot();
	const w = useW();
	const morning = interpolate(f, [w('019', 0.45), w('019', 0.6)], [0, 1], clamp);
	const cam = camPath(f, [
		[at('019'), camOn(1500, 640, 1.5)],
		[w('019', 0.5), camOn(1520, 660, 1.75)],
		[w('019', 1.3), camOn(1540, 640, 1.95)],
	]);
	const j = hicK(gf);
	return (
		<Stage cam={cam} bg="#0b1030" light={{x: 40, y: 20, o: 0.35 + 0.2 * morning, night: morning < 0.5}}>
			<Layer depth={1.4}>
				<AbsoluteFill style={{opacity: 1 - morning}}>
					<Bedroom night f={gf} />
				</AbsoluteFill>
				<AbsoluteFill style={{opacity: morning}}>
					<Bedroom f={gf} ring={f > w('019', 0.55) && f < w('019', 0.75)} />
				</AbsoluteFill>
			</Layer>
			<Layer depth={1.4}>
				<Svg>
					<g transform={`translate(0,${-j * 16})`}>
						<Lying who="hero" x={1500} y={640} s={0.95} f={gf} id="h-sleep" expr={morning > 0.5 ? (j > 0.2 ? 'wide' : 'worried') : 'sleepy'} extra={{age: 0, hairColor: CAST.hero.hairColor}} />
					</g>
				</Svg>
				<Blanket f={gf} night={morning < 0.5} />
				<Svg>
					<HeroBadge x={1500} y={420} s={0.8} />
					{f > w('019', 0.2) && f < w('019', 0.45) ? <Onoma x={1700} y={430} text="z z z" t={(f - w('019', 0.2)) % 26} c="#9fd8ff" size={40} /> : null}
				</Svg>
			</Layer>
		</Stage>
	);
};

export const SHOTS_A: ShotDef[] = [
	{at: '001', C: A001},
	{at: '002', C: A002},
	{at: '003', C: A003},
	{at: '004', C: A004},
	{at: '005', C: A005},
	{at: '006', C: A006, whip: true},
	{at: '007', C: A007, whip: true},
	{at: '008', C: A008},
	{at: '008', off: 74, C: A008b, whip: true},
	{at: '009', C: A009, whip: true},
	{at: '010', C: A010},
	{at: '011', C: A011},
	{at: '012', C: A012},
	{at: '013', C: A013},
	{at: '014', C: A014, whip: true},
	{at: '015', C: A015, whip: true},
	{at: '016', C: A016, whip: true},
	{at: '017', C: A017, whip: true},
	{at: '018', C: A018},
	{at: '019', C: A019, whip: true},
];

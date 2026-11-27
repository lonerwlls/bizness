import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {Pose} from '../engine/Stickman';
import {SIT, env, gesture, idle, reach, walkTo} from '../kit/actions';
import {Actor, useShot} from '../kit/core';
import type {ShotDef} from '../kit/coverage';
import {HeroBadge, Layer, Stage, Svg, camOn, clamp, usePush} from '../kit/kit';
import {Board, Bubble, FONT} from '../kit/ui';
import {Onoma} from '../reference/PauseTime';
import {Prop3D, at, propScene} from '../three/Prop3D';
import {makeSubButton, makeTimer, Timer} from '../three/props';
import {Frog, Switch, makeDome, makeFrog, makeNeedleHolder, makeSwitch} from '../three/regrow';
import {FL, HS, badgeY} from './common';
import {pop, useW} from './lib';
import {BigHand, Insert, TANK, TankBack, TankFront} from './placesR';
import {LAB_BENCH_TOP, SteelBench} from './placesR3';
import {BAY_TOP, ERBay, ExamBed, RegenLab} from './placesR5';
import {Glove, HIP, Over, Tag, placeTool, useFont} from './partR1';

/* PART 5 (5:10–6:30): the twist (you already regrow a little), the switch, Levin's frog (2022),
   Lily a year later — leave it open — her fingertip grows back; the question; subscribe. */

const kk = (x: number, a: number, b: number) => Math.max(0, Math.min(1, (x - a) / (b - a)));
const Sparkles: React.FC<{x: number; y: number; k: number; r?: number; n?: number}> = ({x, y, k, r = 80, n = 8}) =>
	k > 0 ? (
		<g>
			{Array.from({length: n}).map((_, i) => {
				const a = (i / n) * Math.PI * 2;
				const d = r + r * 0.6 * k;
				return <path key={i} d={`M${x + Math.cos(a) * d},${y + Math.sin(a) * d} l0,-14 l4,10 l10,4 l-10,4 l-4,10 l-4,-10 l-10,-4 l10,-4 z`} fill="#fff4b0" opacity={k} />;
			})}
		</g>
	) : null;
const Burst: React.FC<{f: number; c1: string; c2: string}> = ({f, c1, c2}) => (
	<Svg>
		<rect x={-400} y={-300} width={2800} height={1600} fill={c1} />
		{Array.from({length: 24}).map((_, i) => {
			const a0 = (i / 24) * Math.PI * 2 + f / 200;
			const a1 = ((i + 0.5) / 24) * Math.PI * 2 + f / 200;
			return <polygon key={i} points={`960,540 ${960 + Math.cos(a0) * 2400},${540 + Math.sin(a0) * 2400} ${960 + Math.cos(a1) * 2400},${540 + Math.sin(a1) * 2400}`} fill={c2} />;
		})}
	</Svg>
);

/* ================================ 052 the twist ================================ */
const R052: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const fade = 1 - kk(f, w('052', 0.2), w('052', 0.45));
	const hp = gesture('presentF', idle(gf, 2), env(f, w('052', 0.5), 1e9, 8, 1), f);
	const cam = usePush(camOn(960, 560, 1.25), camOn(960, 540, 1.45));
	return (
		<Stage cam={cam} bg="#1a2a6a" light={{x: 50, y: 20, o: 0.5}}>
			<Layer depth={1.3}>
				<Burst f={f} c1="#1d2a6a" c2="#26358a" />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<ellipse cx={960} cy={FL + 4} rx={160} ry={20} fill="#000" opacity={0.25} />
					<Actor who="hero" x={960} floor={FL} s={HS} facing={1} faceTurn={0.1} look={[0, -0.1]} mouth="smile" pose={hp} uid="h-052" />
					<g opacity={fade}>
						<HeroBadge x={960} y={badgeY(FL)} s={0.8} />
					</g>
					<Tag f={f} t={w('052', 0.05)} x={620} y={330} text="THE TWIST" c="#11142c" fg="#ffd34a" size={48} rot={-5} />
					<Tag f={f} t={w('052', 0.62)} x={1320} y={420} text="YOU ALREADY CAN" c="#0e3a22" fg="#7af0a8" stroke="#7af0a8" size={40} rot={4} />
					<Tag f={f} t={w('052', 0.85)} x={1320} y={520} text="…A LITTLE" c="#11142c" fg="#fff" size={34} rot={-2} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* ================================ 053 what we already regrow (x-ray body) ================================ */
const XBody: React.FC<{liver: number; skin: number; bone: number; rib: number; f: number}> = ({liver, skin, bone, rib, f}) => {
	const c = '#9fd8ff';
	return (
		<g>
			{/* skin outline, glowing when "skin" is on */}
			<g stroke={skin > 0 ? '#ffd0a0' : c} strokeWidth={skin > 0 ? 10 + 4 * Math.sin(f / 4) * skin : 8} fill="#0e1a30" opacity={0.95}>
				<circle cx={0} cy={-330} r={80} />
				<path d="M-120,-230 L120,-230 L150,120 L80,130 L70,420 L10,420 L0,160 L-10,420 L-70,420 L-80,130 L-150,120 Z" />
				<path d="M-120,-220 L-230,60 L-190,80 L-100,-120 M120,-220 L230,60 L190,80 L100,-120" fill="none" />
			</g>
			{/* ribs; one of them regrows */}
			{Array.from({length: 6}).map((_, i) => {
				const y = -190 + i * 34;
				const grow = i === 3 ? rib : 1;
				return (
					<g key={i} stroke={i === 3 && rib > 0 ? '#7af0a8' : '#cfe2f0'} strokeWidth={8} fill="none" opacity={0.85} strokeLinecap="round">
						<path d={`M-6,${y} q-${80 * grow},10 -${100 * grow},40`} />
						<path d={`M6,${y} q80,10 100,40`} />
					</g>
				);
			})}
			<line x1={0} y1={-240} x2={0} y2={120} stroke="#cfe2f0" strokeWidth={10} />
			{/* thigh bone with a healing break */}
			<g stroke={bone > 0 ? '#7af0a8' : '#cfe2f0'} strokeWidth={14} strokeLinecap="round">
				<line x1={-40} y1={150} x2={-40} y2={270} />
				<line x1={-40} y1={270 + 20 * (1 - bone)} x2={-40} y2={400} />
			</g>
			<line x1={40} y1={150} x2={40} y2={400} stroke="#cfe2f0" strokeWidth={14} strokeLinecap="round" />
			{/* liver */}
			<path d="M-10,-40 C40,-70 120,-60 120,-20 C120,20 40,30 -10,20 Z" fill="#d06a5a" opacity={0.4 + 0.6 * liver} stroke={liver > 0 ? '#ffd34a' : 'none'} strokeWidth={6} />
		</g>
	);
};
const R053: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const liver = env(f, w('053', 0.02), 1e9, 8, 1);
	const skin = env(f, w('053', 0.16), 1e9, 8, 1);
	const bone = kk(f, w('053', 0.33), w('053', 0.5));
	const rib = kk(f, w('053', 0.6), w('053', 0.85));
	return (
		<Board tint="#0e1a3a">
			<g transform="translate(960,560) scale(1.0)">
				<XBody liver={liver} skin={skin} bone={bone} rib={rib} f={f} />
			</g>
			<Tag f={f} t={w('053', 0.04)} x={1330} y={510} text="LIVER" c="#11142c" fg="#ff9a8a" stroke="#ff9a8a" size={40} rot={3} />
			<Tag f={f} t={w('053', 0.18)} x={560} y={220} text="SKIN" c="#11142c" fg="#ffd0a0" stroke="#ffd0a0" size={40} rot={-3} />
			<Tag f={f} t={w('053', 0.35)} x={600} y={780} text="BONE" c="#11142c" fg="#7af0a8" stroke="#7af0a8" size={40} rot={-2} />
			<Tag f={f} t={w('053', 0.62)} x={1460} y={300} text="A RIB — IF ITS LINING STAYS" c="#11142c" fg="#7af0a8" stroke="#7af0a8" size={32} rot={2} />
			<ellipse cx={1560} cy={1004} rx={90} ry={12} fill="#000" opacity={0.3} />
			<Actor who="hero" x={1560} floor={1000} s={0.55} facing={-1} faceTurn={0.2} look={[-0.4, -0.4]} mouth="smile" pose={gesture('point', idle(gf, 2), 1, f)} uid="h-053" />
		</Board>
	);
};

/* ================================ 054 nerves 1 mm a day; kids' fingertips ================================ */
const R054: React.FC = () => {
	const {f} = useShot();
	const w = useW();
	const nerve = kk(f, w('054', 0.05), w('054', 0.5));
	const mm = Math.round(nerve * 30);
	const tip = kk(f, w('054', 0.62), w('054', 0.95));
	return (
		<Board tint="#1a1a3a">
			<g transform={`translate(540,520) scale(${pop(f, 2)})`}>
				<rect x={-360} y={-300} width={720} height={600} rx={40} fill="#11142c" stroke="#ffd34a" strokeWidth={8} />
				<text y={-230} textAnchor="middle" fontSize={46} fontFamily={FONT} fontWeight={900} fill="#ffd34a">
					CUT NERVES
				</text>
				{/* an arm outline with a nerve growing along it */}
				<path d="M-300,40 L200,10 Q260,8 270,40 Q260,80 200,80 L-300,110 Z" fill="#f2c9a5" stroke="#2a1a14" strokeWidth={8} />
				<path d={`M-280,74 L${-280 + 480 * nerve},${74 - 30 * nerve}`} stroke="#ffd34a" strokeWidth={8} strokeLinecap="round" />
				<circle cx={-280 + 480 * nerve} cy={74 - 30 * nerve} r={10} fill="#fff4b0" />
				<text y={230} textAnchor="middle" fontSize={64} fontFamily={FONT} fontWeight={900} fill="#fff">
					~1 MM A DAY
				</text>
				<text y={-150} textAnchor="middle" fontSize={40} fontFamily={FONT} fontWeight={900} fill="#9fd8ff">
					{mm} DAYS → {mm} MM
				</text>
			</g>
			<g transform={`translate(1380,520) scale(${pop(f, w('054', 0.55))})`}>
				<rect x={-360} y={-300} width={720} height={600} rx={40} fill="#11142c" stroke="#7af0a8" strokeWidth={8} />
				<text y={-230} textAnchor="middle" fontSize={46} fontFamily={FONT} fontWeight={900} fill="#7af0a8">
					KIDS' FINGERTIPS
				</text>
				<g transform="translate(0,90) scale(0.95)">
					<BigHand tip={tip} glow={env(f, w('054', 0.92), 1e9, 6, 1)} sleeve="#9a6ad0" cuff="#7a4ab0" />
				</g>
			</g>
			<Tag f={f} t={w('054', 0.75)} x={1380} y={960} text="IF WE LEAVE THEM ALONE" c="#11142c" fg="#fff" size={36} rot={-2} />
		</Board>
	);
};

/* ================================ 055 the switch ================================ */
const R055: React.FC = () => {
	const {f} = useShot();
	const w = useW();
	const reachK = kk(f, w('055', 0.45), w('055', 0.95));
	const g: [number, number] = [1400 - 260 * reachK, 220 + 120 * reachK];
	return (
		<AbsoluteFill>
			<Board tint="#2a1a3a">
				<text x={960} y={980} textAnchor="middle" fontSize={56} fontFamily={FONT} fontWeight={900} fill="#fff" opacity={pop(f, w('055', 0.5))}>
					SCIENTISTS ARE LOOKING FOR THE SWITCH
				</text>
				<g transform="translate(960,150)">
					<rect x={-230} y={-50} width={460} height={90} rx={20} fill="#11142c" stroke="#ff9a8a" strokeWidth={6} />
					<text y={18} textAnchor="middle" fontSize={50} fontFamily={FONT} fontWeight={900} fill="#ff9a8a">
						REGROW: OFF
					</text>
				</g>
			</Board>
			<Prop3D
				x={560}
				y={260}
				w={800}
				h={640}
				make={() => {
					const scene = propScene(2.2);
					const sw = makeSwitch();
					sw.scale.setScalar(1.5);
					at(sw, 960, 560, 0);
					sw.rotation.y = -0.25;
					scene.add(sw);
					return {scene, sw};
				}}
				update={(wd) => (wd.sw as Switch).userData.set(0.05 * Math.sin(f / 3) * env(f, w('055', 0.1), w('055', 0.4), 4, 4))}
			/>
			<AbsoluteFill>
				<svg viewBox="0 0 1920 1080" width={1920} height={1080}>
					<Glove g={g} from={[2100, -200]} />
				</svg>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

/* ================================ 056 Levin's frog, 2022 ================================ */
const FROG_X = 960;
const R056: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const cam = usePush(camOn(960, 560, 1.15), camOn(980, 620, 1.55, {farBlur: 7}));
	return (
		<>
			<Stage cam={cam} bg="#1d3a4a" light={{x: 50, y: 0, o: 0.45, c: '220,240,255'}}>
				<Layer depth={1.4}>
					<RegenLab f={gf} />
				</Layer>
				<Layer depth={1}>
					<Svg>
						<SteelBench x={960} w={720} />
					</Svg>
					<Prop3D
						x={640}
						y={460}
						w={660}
						h={320}
						make={() => {
							const scene = propScene(2.0);
							const frog = makeFrog();
							frog.scale.setScalar(1.1);
							at(frog, FROG_X, LAB_BENCH_TOP, 0);
							frog.rotation.y = -0.4;
							const dome = makeDome();
							at(dome, FROG_X - 70, LAB_BENCH_TOP, 50);
							const timer = makeTimer();
							timer.scale.setScalar(0.55);
							at(timer, 1200, LAB_BENCH_TOP - 34, -20);
							timer.rotation.y = -0.3;
							scene.add(frog, dome, timer);
							return {scene, frog, timer};
						}}
						update={(wd, ff) => {
							(wd.frog as Frog).userData.setLeg(0);
							(wd.frog as Frog).userData.idle(ff);
							const h = Math.round(interpolate(f, [w('056', 0.3), w('056', 0.52)], [0, 24], clamp));
							(wd.timer as Timer).userData.set(`${String(h).padStart(2, '0')} H`, '#7af0a8');
						}}
					/>
				</Layer>
			</Stage>
			<Over>
				<Tag f={f} t={w('056', 0.04)} x={420} y={180} text="2022 · TUFTS UNIVERSITY" c="#11142c" fg="#9fd8ff" stroke="#9fd8ff" size={38} rot={-4} />
				<Tag f={f} t={w('056', 0.12)} x={480} y={290} text="MICHAEL LEVIN'S TEAM" c="#11142c" fg="#fff" size={32} rot={3} />
				<Tag f={f} t={w('056', 0.24)} x={1500} y={300} text="DOME + 5 DRUGS" c="#11142c" fg="#ffd08a" stroke="#ffd08a" size={38} rot={3} />
				<Tag f={f} t={w('056', 0.4)} x={1500} y={420} text="JUST 24 HOURS" c="#11142c" fg="#7af0a8" stroke="#7af0a8" size={38} rot={-2} />
			</Over>
		</>
	);
};
const R056b: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const leg = kk(f, w('056', 0.6), w('056', 0.95));
	const months = Math.round(18 * leg);
	const cam = usePush(camOn(FROG_X - 40, 680, 2.0, {farBlur: 8}), camOn(FROG_X - 30, 680, 2.2, {farBlur: 9}));
	return (
		<>
			<Stage cam={cam} bg="#1d3a4a" light={{x: 50, y: 0, o: 0.45, c: '220,240,255'}}>
				<Layer depth={1.4}>
					<RegenLab f={gf} />
				</Layer>
				<Layer depth={1}>
					<Svg>
						<SteelBench x={960} w={720} />
					</Svg>
					<Prop3D
						x={700}
						y={560}
						w={520}
						h={240}
						make={() => {
							const scene = propScene(2.0);
							const frog = makeFrog();
							frog.scale.setScalar(1.1);
							at(frog, FROG_X, LAB_BENCH_TOP, 0);
							frog.rotation.y = -0.4;
							scene.add(frog);
							return {scene, frog};
						}}
						update={(wd, ff) => {
							(wd.frog as Frog).userData.setLeg(leg);
							(wd.frog as Frog).userData.idle(ff);
						}}
					/>
				</Layer>
			</Stage>
			<Over>
				<g transform="translate(1500,240)">
					<rect x={-230} y={-80} width={460} height={160} rx={30} fill="#11142c" stroke="#ffd34a" strokeWidth={6} />
					<text y={28} textAnchor="middle" fontSize={76} fontFamily={FONT} fontWeight={900} fill="#ffd34a">
						{months} MONTHS
					</text>
				</g>
				<Sparkles x={760} y={720} k={env(f, w('056', 0.9), 1e9, 6, 1)} r={120} n={8} />
				<Tag f={f} t={w('056', 0.93)} x={480} y={240} text="A WORKING LEG" c="#0e3a22" fg="#7af0a8" stroke="#7af0a8" size={44} rot={-4} />
			</Over>
		</>
	);
};
/* 057 it swims with the new leg — not perfect, but it works; mammals next */
const R057: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const cam = usePush(camOn(TANK.x + 300, TANK.y + 180, 1.4), camOn(TANK.x + 320, TANK.y + 190, 1.55));
	const swimX = TANK.x + 120 + ((f * 2.2) % (TANK.w - 200));
	return (
		<>
			<Stage cam={cam} bg="#1d3a4a" light={{x: 50, y: 0, o: 0.45, c: '220,240,255'}}>
				<Layer depth={1.4}>
					<RegenLab f={gf} />
				</Layer>
				<Layer depth={1}>
					<Svg>
						<TankBack f={gf} />
					</Svg>
					<Prop3D
						x={TANK.x}
						y={TANK.y}
						w={TANK.w}
						h={TANK.h}
						make={() => {
							const scene = propScene(2.0);
							const frog = makeFrog();
							frog.scale.setScalar(0.85);
							frog.rotation.set(0, -0.2, 0.15);
							scene.add(frog);
							return {scene, frog};
						}}
						update={(wd, ff) => {
							(wd.frog as Frog).userData.setLeg(1);
							at(wd.frog, swimX, TANK.y + 170 + Math.sin(ff / 12) * 20, 0);
						}}
					/>
					<Svg>
						<TankFront f={gf} />
					</Svg>
				</Layer>
			</Stage>
			<Over>
				<Tag f={f} t={w('057', 0.05)} x={420} y={200} text="NOT PERFECT" c="#11142c" fg="#c8ccd8" size={40} rot={-4} />
				<Tag f={f} t={w('057', 0.3)} x={460} y={310} text="BUT IT WORKS" c="#0e3a22" fg="#7af0a8" stroke="#7af0a8" size={40} rot={3} />
				<Tag f={f} t={w('057', 0.7)} x={1500} y={880} text="MAMMALS ARE NEXT" c="#11142c" fg="#ffd34a" size={44} rot={-2} />
			</Over>
		</>
	);
};

/* ================================ 058–060 Lily, a year later ================================ */
const BEDX = 1060;
const LX = 1000; // Lily sitting on the exam bed edge
const lilySit: Pose = {...SIT, lean: 0, head: 4};
const R058: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const wk = walkTo(f, w('058', 0.25), w('058', 0.6), 380, 760, 2, 0.3);
	const lp = reach(lilySit, 'F', [-60, -60], 1);
	const cam = usePush(camOn(980, 580, 1.15), camOn(980, 600, 1.35));
	return (
		<Stage cam={cam} bg="#d0e8ec" light={{x: 30, y: 0, o: 0.45, c: '255,250,230'}}>
			<Layer depth={1.4}>
				<ERBay />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<ExamBed x={BEDX} />
					<Actor who="lily" x={LX} floor={FL} seat={BAY_TOP - 4} s={0.72} facing={-1} faceTurn={0.4} look={[-0.6, 0.2]} expr="worried" pose={lp} uid="lily-058" />
					<circle cx={LX - 60 * 0.72 + 6} cy={BAY_TOP - 4 - 60 * 0.72 - 4} r={9} fill="#fbfaf2" stroke="#2a1a14" strokeWidth={3} />
					<Actor who="hero" x={wk.x} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.7, 0.2]} mouth="smile" pose={wk.moving ? wk.pose : idle(gf, 2)} vx={wk.vx} bob={wk.bob} uid="h-058" />
					<Tag f={f} t={w('058', 0.04)} x={560} y={260} text="A YEAR LATER" c="#11142c" fg="#ffd34a" size={44} rot={-4} />
					<Tag f={f} t={w('058', 0.55)} x={1440} y={420} text="CAR DOOR" c="#3a1d2a" fg="#ff9a8a" stroke="#ff6a5a" size={36} rot={3} />
				</Svg>
			</Layer>
		</Stage>
	);
};
const R059: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const SX = 1190; // surgeon on duty, on the far side of the exam bed
	const fingerP: [number, number] = [LX - 60 * 0.72, BAY_TOP - 4 - 60 * 0.72];
	// the needle holder lives in his fist: the grip moves, the tool follows; tip ends near her finger
	const TH = 160;
	const S = 1.1;
	const len = (48 + 40) * S;
	const r = (TH * Math.PI) / 180;
	const restGrip: [number, number] = [SX - 50, HIP - 50];
	const tipTarget: [number, number] = [fingerP[0] + 22, fingerP[1] - 8];
	const gripTarget: [number, number] = [tipTarget[0] - len * Math.cos(r), tipTarget[1] - len * Math.sin(r)];
	const come = kk(f, w('059', 0.05), w('059', 0.36));
	const stopT = w('059', 0.4);
	const back = kk(f, stopT + 6, stopT + 22) * 0.45;
	const k = come * (1 - back);
	const grip: [number, number] = [restGrip[0] + (gripTarget[0] - restGrip[0]) * k, restGrip[1] + (gripTarget[1] - restGrip[1]) * k];
	const tip: [number, number] = [grip[0] + len * Math.cos(r), grip[1] + len * Math.sin(r)];
	const stop = f > stopT;
	const sp = reach({...idle(gf, 5), lean: 8 * k}, 'F', [SX - grip[0], grip[1] - HIP], 1);
	const HX = 780;
	const hp = gesture('stop', idle(gf, 2), env(f, stopT - 4, 1e9, 6, 1), f);
	const cam = usePush(camOn(1060, 560, 1.3), camOn(1060, 560, 1.45));
	return (
		<>
			<Stage cam={cam} bg="#d0e8ec" light={{x: 30, y: 0, o: 0.45, c: '255,250,230'}}>
				<Layer depth={1.4}>
					<ERBay />
				</Layer>
				<Layer depth={1}>
					<Svg>
						<Actor who="colleague" x={SX} floor={FL} s={0.98} facing={-1} faceTurn={0.4} look={[-0.7, 0.5]} expr={stop ? 'wide' : 'normal'} pose={sp} uid="surg-059" />
					</Svg>
					<Prop3D
						x={760}
						y={480}
						w={700}
						h={320}
						make={() => {
							const scene = propScene();
							const nh = makeNeedleHolder();
							scene.add(nh);
							return {scene, nh};
						}}
						update={(wd) => placeTool(wd.nh, 48, -40, tip, TH, S, 60)}
					/>
					<Svg>
						{/* his fist drawn over the tool's finger rings */}
						<circle cx={grip[0]} cy={grip[1]} r={10} fill="#e8c4a0" stroke="#2a1a14" strokeWidth={3} />
						<ExamBed x={BEDX} />
						<Actor who="lily" x={LX} floor={FL} seat={BAY_TOP - 4} s={0.72} facing={-1} faceTurn={0.4} look={[0.6, -0.2]} expr="worried" pose={reach(lilySit, 'F', [-60, -60], 1)} uid="lily-059" />
						<circle cx={fingerP[0] + 6} cy={fingerP[1] - 4} r={9} fill="#fbfaf2" stroke="#2a1a14" strokeWidth={3} />
						<Actor who="hero" x={HX} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.7, 0]} mouth={stop ? 'open' : undefined} pose={hp} uid="h-059" />
					</Svg>
				</Layer>
			</Stage>
			<Over>
				<Tag f={f} t={w('059', 0.06)} x={1500} y={260} text="SURGEON ON DUTY" c="#11142c" fg="#9ff0b0" stroke="#9ff0b0" size={34} rot={3} until={w('059', 0.42)} />
				<Bubble x={560} y={260} w={560} h={130} t={f - w('059', 0.5)} tail={[150, 110]}>
					<text y={-8} textAnchor="middle" fontSize={36} fontFamily={FONT} fontWeight={900} fill="#13203a">
						Leave it open.
					</text>
					<text y={36} textAnchor="middle" fontSize={32} fontFamily={FONT} fontWeight={900} fill="#2a9a5a">
						Just a dressing.
					</text>
				</Bubble>
			</Over>
		</>
	);
};
const R060: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const wave = env(f, w('060', 0.3), 1e9, 8, 1);
	const lp = reach({...idle(gf, 7), armB: [-24, 20]}, 'F', [70 + 14 * Math.sin(f / 2.4), -175], wave);
	const grow = kk(f, w('060', 0.35), w('060', 0.6));
	const cam = usePush(camOn(1000, 600, 1.25), camOn(980, 600, 1.4));
	return (
		<>
			<Stage cam={cam} bg="#d0e8ec" light={{x: 30, y: 0, o: 0.45, c: '255,250,230'}}>
				<Layer depth={1.4}>
					<ERBay />
				</Layer>
				<Layer depth={1}>
					<Svg>
						<Actor who="hero" x={760} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.7, 0.3]} mouth="smile" pose={idle(gf, 2)} uid="h-060" />
						<Actor who="lily" x={1080} floor={FL} s={0.72} facing={-1} faceTurn={0.4} look={[-0.7, -0.3]} mouth="smile" pose={lp} uid="lily-060" />
					</Svg>
				</Layer>
			</Stage>
			<Over>
				<Tag f={f} t={w('060', 0.04)} x={460} y={200} text="8 WEEKS LATER" c="#11142c" fg="#ffd34a" size={44} rot={-4} />
				<Insert x={1460} y={420} r={280} k={pop(f, w('060', 0.3))} id="ins-060" bg="#e8f4ee" ring="#7af0a8">
					<g transform="translate(0,110) scale(1.0)">
						<BigHand tip={grow} glow={env(f, w('060', 0.58), 1e9, 6, 1)} sleeve="#9a6ad0" cuff="#7a4ab0" />
					</g>
				</Insert>
				<Tag f={f} t={w('060', 0.6)} x={1460} y={760} text="NAIL AND ALL" c="#0e3a22" fg="#7af0a8" stroke="#7af0a8" size={40} rot={3} />
				<Tag f={f} t={w('060', 0.8)} x={760} y={300} text="NO SUPERPOWER NEEDED" c="#11142c" fg="#fff" size={36} rot={-2} />
			</Over>
		</>
	);
};

/* ================================ 061 the question; 062 subscribe ================================ */
const R061: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const cam = usePush(camOn(960, 560, 1.15), camOn(960, 540, 1.3));
	const icons = ['🫀', '🦷', '☝️', '👂', '🦴', '🫁'];
	void icons;
	return (
		<>
			<Stage cam={cam} bg="#2f5a8a" light={{x: 50, y: 30, o: 0.45}}>
				<Layer depth={1.3}>
					<Burst f={f} c1="#2f5a8a" c2="#3a6a9a" />
				</Layer>
				<Layer depth={1}>
					<Svg>
						<ellipse cx={720} cy={FL + 4} rx={150} ry={20} fill="#000" opacity={0.25} />
						<Actor who="hero" x={720} floor={FL} s={HS} facing={1} faceTurn={0.3} look={[0.5, -0.3]} mouth="smile" pose={gesture('presentF', idle(gf, 2), env(f, 6, 1e9, 10, 1), f)} uid="h-061" />
					</Svg>
				</Layer>
			</Stage>
			<Over>
				<g transform={`translate(1280,330) scale(${pop(f, 4)})`}>
					<rect x={-420} y={-150} width={840} height={300} rx={40} fill="#fbfaf4" stroke="#11142c" strokeWidth={8} />
					<text y={-50} textAnchor="middle" fontSize={56} fontFamily={FONT} fontWeight={900} fill="#13203a">
						WHICH BODY PART
					</text>
					<text y={30} textAnchor="middle" fontSize={56} fontFamily={FONT} fontWeight={900} fill="#13203a">
						WOULD YOU REGROW?
					</text>
					<text y={110} textAnchor="middle" fontSize={40} fontFamily={FONT} fontWeight={900} fill="#d23b3b" opacity={pop(f, w('061', 0.6))}>
						↓ TELL ME IN THE COMMENTS
					</text>
				</g>
			</Over>
		</>
	);
};
const R062: React.FC = () => {
	const {f, gf, dur} = useShot();
	const fontOk = useFont("900 80px 'Rubik'");
	const out = interpolate(f, [dur - 24, dur - 2], [0, 1], clamp);
	const press = env(f, 14, 30, 6, 8);
	const cam = usePush(camOn(960, 560, 1.15), camOn(960, 540, 1.3));
	return (
		<>
			<Stage cam={cam} bg="#3a1a5a" light={{x: 50, y: 30, o: 0.4}}>
				<Layer depth={1.3}>
					<Burst f={f} c1="#4a1f6a" c2="#6a2f8a" />
				</Layer>
				<Layer depth={1}>
					{fontOk ? (
					<Prop3D
						x={820}
						y={420}
						w={620}
						h={260}
						make={() => {
							const scene = propScene();
							const b = makeSubButton();
							scene.add(b);
							return {scene, b};
						}}
						update={(wd) => {
							at(wd.b, 1120, 560, -18 * press);
							wd.b.rotation.set(0.12, -0.3, 0);
							wd.b.scale.set(1, 1, 1 - 0.3 * press);
						}}
					/>
					) : null}
					<Svg>
						<Actor who="hero" x={720} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.6, -0.1]} mouth="smile" pose={reach(idle(gf, 2), 'F', [150, -120 + 20 * press], env(f, 4, 40, 8, 10))} uid="h-062" />
					</Svg>
				</Layer>
			</Stage>
			<AbsoluteFill style={{background: '#000', opacity: out}} />
		</>
	);
};

export const SHOTS_R5: ShotDef[] = [
	{at: '052', C: R052, whip: true},
	{at: '053', C: R053, whip: true},
	{at: '054', C: R054, whip: true},
	{at: '055', C: R055, whip: true},
	{at: '056', C: R056, whip: true},
	{at: '056', off: 210, C: R056b},
	{at: '057', C: R057, whip: true},
	{at: '058', C: R058, whip: true},
	{at: '059', C: R059},
	{at: '060', C: R060, whip: true},
	{at: '061', C: R061, whip: true},
	{at: '062', C: R062},
];

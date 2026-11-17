import React from 'react';
import {AbsoluteFill, Easing, interpolate, random} from 'remotion';
import * as THREE from 'three';
import {Pose} from '../engine/Stickman';
import {SIT, env, gesture, idle, reach, walkTo} from '../kit/actions';
import {Actor, hicAgo, hicK, useShot} from '../kit/core';
import type {ShotDef} from '../kit/coverage';
import {HeroBadge, Layer, Stage, Svg, camOn, clamp, flash, usePush} from '../kit/kit';
import {Board, Cite, FONT, HAND} from '../kit/ui';
import {Onoma} from '../reference/PauseTime';
import {Prop3D, at, propScene} from '../three/Prop3D';
import {makeDumbbell, makeEnvelope, makeGasTank, makeHose, makeJar, makeMask, makeNewspaper, makeShotgun, makeSpoon, makeStraw, makeSubButton, makeSuitcase, makeTimer, makeWaterGlass} from '../three/props';
import {FL, HS, badgeY} from './common';
import {SEAT, Sofa} from './places';
import {Tag, camPath, jolt, pop, useW} from './lib';
import {OldFilm} from './placesH';
import {Clinic, Gym, Hallway2, Hotel, Lab, LivingDay, LivingNight, Porch, Recliner} from './placesC';

/* PART C (3:00–4:06): the real problem (the number, the soreness), the gas that worked for
   fifty hours, the letters and the folk cures, the shotgun, the straw, the subscribe ask. */
const ease = Easing.inOut(Easing.cubic);
const T = (x: number, y: number, z = 0) => new THREE.Vector3(x, -y, z);

/* ---------- 032 «But none of that is the real problem.» ---------- */
const C032: React.FC = () => {
	const {f, gf} = useShot();
	const cam = usePush(camOn(820, 600, 1.35), camOn(800, 560, 1.75, {farBlur: 8}));
	return (
		<Stage cam={cam} bg="#141638" light={{x: 75, y: 30, o: 0.5, c: '255,214,150'}}>
			<Layer depth={1.4}>
				<LivingNight f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Sofa x={560} />
					<Actor who="hero" x={790} floor={FL} seat={SEAT} s={HS} facing={1} faceTurn={0.2} look={[0.2, 0.3]} expr="sad" pose={{...SIT, lean: 4, armF: [40, 60], armB: [30, 60]}} uid="h-032" />
					<HeroBadge x={790} y={SEAT - 164 - 118} s={0.8} />
					<Tag f={f} t={8} x={1150} y={330} text="THE REAL PROBLEM" c="#3a1d2a" fg="#ff9a8a" stroke="#ff6a5a" size={36} rot={4} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* ---------- 033 the number: 40 a minute → 57,600 a day ---------- */
const C033: React.FC = () => {
	const {f} = useShot();
	const w = useW();
	const n = (t0: number, t1: number, v: number) => Math.round(interpolate(f, [t0, t1], [0, v], {...clamp, easing: ease}));
	const rows: [string, number, string, number][] = [
		['', 40, 'PER MINUTE', w('033', 0.38)],
		['', 2400, 'PER HOUR', w('033', 0.55)],
		['', 57600, 'PER DAY', w('033', 0.72)],
	];
	return (
		<Board tint="#1a2a40">
			{rows.map(([, v, lab, t], i) => (
				<g key={i} transform={`translate(960,${300 + i * 230}) scale(${pop(f, t)})`} opacity={f > t ? 1 : 0}>
					<text x={-40} y={40} textAnchor="end" fontSize={i === 2 ? 170 : 130} fontFamily={FONT} fontWeight={900} fill={i === 2 ? '#ff6a5a' : '#ffd34a'} stroke="#11142c" strokeWidth={10} paintOrder="stroke">
						{n(t, t + 24, v).toLocaleString('en-US')}
					</text>
					<text x={0} y={30} fontSize={58} fontFamily={FONT} fontWeight={900} fill="#fff">
						HICCUPS {lab}
					</text>
				</g>
			))}
			<Tag f={f} t={2} x={960} y={110} text="THE NUMBER" c="#11142c" fg="#9fd8ff" stroke="#9fd8ff" size={40} rot={-2} />
		</Board>
	);
};

/* ---------- 034 sore ribs, like a workout that never ends ---------- */
const C034: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const hx = 900;
	const ache = hicK(gf);
	const hp = reach(reach({...idle(gf, 2), lean: 6 + 10 * ache}, 'F', [34, -96], 1), 'B', [20, -86], 1);
	const cam = camPath(f, [
		[0, camOn(960, 560, 1.2)],
		[w('034', 0.3), camOn(920, 520, 1.6, {farBlur: 7})],
		[w('034', 0.62), camOn(910, 500, 1.75, {farBlur: 8})],
	]);
	return (
		<Stage cam={cam} bg="#2a3440" light={{x: 30, y: 0, o: 0.45, c: '230,240,255'}}>
			<Layer depth={1.4}>
				<Gym />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<rect x={1180} y={700} width={420} height={18} fill="#4a4a58" />
					<rect x={1200} y={718} width={14} height={182} fill="#4a4a58" />
					<rect x={1566} y={718} width={14} height={182} fill="#4a4a58" />
					<rect x={1180} y={800} width={420} height={14} fill="#4a4a58" />
				</Svg>
				<Prop3D
					x={1160}
					y={620}
					w={460}
					h={220}
					make={() => {
						const scene = propScene();
						[[1250, 680], [1390, 680], [1530, 680], [1290, 780], [1450, 780]].forEach(([x, y], i) => {
							const d = makeDumbbell(['#2a2a34', '#d23b3b', '#3d6fd6'][i % 3]);
							d.scale.setScalar(i < 3 ? 1.1 : 0.9);
							at(d, x, y, 0);
							d.rotation.set(0.3, 0.5, 0);
							scene.add(d);
						});
						return {scene};
					}}
				/>
				<Svg>
					<Actor who="hero" x={hx} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.5, 0.2]} expr={ache > 0.2 ? 'worried' : 'sad'} mouth={ache > 0.3 ? 'open' : 'frown'} pose={hp} uid="h-034" />
					{/* ribs light up at every hiccup */}
					<g opacity={0.25 + 0.75 * ache} transform={`translate(${hx + 6},${FL - 157 - 82})`}>
						{[0, 1, 2, 3].map((i) => (
							<path key={i} d={`M-26,${-22 + i * 13} Q0,${-30 + i * 13} 26,${-22 + i * 13}`} stroke="#ff4a4a" strokeWidth={5} fill="none" strokeLinecap="round" />
						))}
					</g>
					<HeroBadge x={hx} y={badgeY(FL)} s={0.8} />
					<Tag f={f} t={w('034', 0.05)} x={620} y={300} text="SORE RIBS" c="#3a1d2a" fg="#ff9a8a" stroke="#ff6a5a" size={34} rot={-4} />
					<Tag f={f} t={w('034', 0.3)} x={1300} y={300} text="A WORKOUT THAT NEVER ENDS" c="#11142c" fg="#ffd34a" size={28} rot={3} />
				</Svg>
			</Layer>
		</Stage>
	);
};
const QuoteCard: React.FC<{lines: string[]; who: string; t0: number}> = ({lines, who, t0}) => {
	const {f, gf} = useShot();
	return (
		<AbsoluteFill style={{filter: 'sepia(0.8) contrast(1.05)'}}>
			<Board tint="#5a4630">
				<g transform={`translate(960,520) rotate(-2) scale(${pop(f, t0)})`}>
					<rect x={-640} y={-300} width={1280} height={600} fill="#efe4c8" stroke="#8a6a44" strokeWidth={10} />
					<rect x={-600} y={-260} width={260} height={320} fill="#cbb48a" />
					<g transform="translate(-470,40)">
						<circle cy={-170} r={70} fill="#e8c8a0" stroke="#3a2a1a" strokeWidth={6} />
						<path d="M-60,-220 Q0,-260 60,-220 L70,-200 L-70,-200 Z" fill="#5a4a3a" />
						<path d="M-90,30 Q-90,-80 0,-90 Q90,-80 90,30 Z" fill="#8a6a4a" />
						<path d="M-26,-150 q12,-6 26,-2 q14,-4 26,2 q-12,6 -26,3 q-14,3 -26,-3 z" fill="#9a8a7a" />
					</g>
					{lines.map((l, i) => (
						<text key={i} x={-300} y={-140 + i * 90} fontSize={70} fontFamily={HAND} fontWeight={700} fill="#2a1a0e" opacity={interpolate(f, [t0 + 6 + i * 10, t0 + 14 + i * 10], [0, 1], clamp)}>
							{l}
						</text>
					))}
					<text x={-300} y={220} fontSize={40} fontFamily={FONT} fontWeight={900} fill="#5a3a1a">
						{who}
					</text>
				</g>
			</Board>
			<OldFilm f={gf} />
		</AbsoluteFill>
	);
};
const C034b: React.FC = () => <QuoteCard lines={['"I get so sore,', 'jerking all', 'the time."']} who="— CHARLES OSBORNE, 1978" t0={2} />;

/* ---------- 035 the best clinic: a mix of gases, and the hiccups stop ---------- */
const RX = 980; // recliner
const C035: React.FC = () => {
	const {f, gf} = useShot();
	const wk = walkTo(f, 0, 56, 380, 760, 2, 0.3);
	const drop = env(f, 58, 1e9, 6, 1);
	const hp = reach(wk.moving ? wk.pose : idle(gf, 2), 'F', [70, 40 - 30 * drop], 1);
	const cam = usePush(camOn(820, 580, 1.2), camOn(900, 560, 1.35));
	const hand: [number, number] = [wk.x + 70, FL - 157 + 40 - 30 * drop];
	return (
		<Stage cam={cam} bg="#cfe4ea" light={{x: 30, y: 0, o: 0.45, c: '255,250,235'}}>
			<Layer depth={1.4}>
				<Clinic />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Recliner x={RX} />
					<Actor who="clinic" x={RX + 260} floor={FL} s={1} facing={-1} faceTurn={0.4} look={[-0.6, 0]} mouth="smile" pose={gesture('presentF', idle(gf, 9), env(f, 20, 1e9, 10, 1), f)} uid="clinic-35" />
					<Actor who="hero" x={wk.x} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.7, 0]} pose={hp} vx={wk.vx} bob={wk.bob} uid="h-035" />
					<HeroBadge x={wk.x} y={badgeY(FL) - wk.bob} s={0.8} />
					<Tag f={f} t={6} x={820} y={300} text="THE BEST CLINIC" c="#11142c" fg="#9fd8ff" stroke="#9fd8ff" size={34} rot={-3} />
				</Svg>
				<Prop3D
					x={300}
					y={560}
					w={700}
					h={360}
					make={() => {
						const scene = propScene();
						const s = makeSuitcase();
						scene.add(s);
						return {scene, s};
					}}
					update={(wd) => {
						const placed = f > 64;
						at(wd.s, placed ? 845 : hand[0], placed ? 900 : hand[1] + 150, 30);
						wd.s.rotation.set(0.15, -0.5, placed ? 0 : -0.1);
					}}
				/>
			</Layer>
		</Stage>
	);
};
const C035b: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const put = interpolate(f, [8, 26], [0, 1], {...clamp, easing: ease});
	const hx = RX + 20;
	const seat = 808;
	const mouth: [number, number] = [hx + 34, seat - 164 + 22];
	// the doctor brings the mask from the tank to his face
	const mask: [number, number] = [mouth[0] + 160 * (1 - put), mouth[1] - 60 * (1 - put)];
	const dx = RX + 230;
	const dpose = reach(idle(gf, 9), 'F', [dx - mask[0] - 20, mask[1] - (FL - 157)], put < 1 ? 1 : 0.6);
	const calm = f > w('035', 0.9);
	const cam = camPath(f, [
		[0, camOn(1080, 560, 1.3)],
		[30, camOn(1060, 520, 1.6, {farBlur: 7})],
		[w('035', 1.2), camOn(1060, 520, 1.7, {farBlur: 8})],
	]);
	return (
		<Stage cam={cam} bg="#cfe4ea" light={{x: 30, y: 0, o: 0.45, c: '255,250,235'}}>
			<Layer depth={1.4}>
				<Clinic />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Recliner x={RX} />
					<Actor who="hero" x={hx} floor={FL} seat={seat} s={HS} facing={1} faceTurn={0.4} look={[0.7, 0]} expr={calm ? 'sleepy' : 'normal'} pose={{...SIT, lean: -10, armF: [30, 50], armB: [20, 50]}} uid="h-035b" />
					<Actor who="clinic" x={dx} floor={FL} s={1} facing={-1} faceTurn={0.4} look={[-0.7, 0.2]} mouth="smile" pose={dpose} uid="clinic-35b" />
					<HeroBadge x={hx} y={seat - 164 - 118} s={0.8} />
					{calm ? <Tag f={f} t={w('035', 0.9)} x={1060} y={300} text="SILENCE" c="#1d3a2a" fg="#9ff0b0" stroke="#3fcf7a" size={44} rot={-3} /> : null}
				</Svg>
				<Prop3D
					x={980}
					y={420}
					w={480}
					h={500}
					make={() => {
						const scene = propScene();
						const tank = makeGasTank();
						at(tank, 1330, 900, -40);
						tank.rotation.x = 0.1;
						const m = makeMask();
						scene.add(tank, m);
						return {scene, m, hose: null as THREE.Object3D | null};
					}}
					update={(wd) => {
						at(wd.m, mask[0], mask[1], 40);
						wd.m.rotation.set(0, Math.PI / 2, 0);
						if (wd.hose) wd.scene.remove(wd.hose);
						wd.hose = makeHose([T(mask[0] + 22, mask[1] + 10, 40), T(mask[0] + 90, mask[1] + 140, 30), T(1290, 700, 0), T(1330, 610, -10)]);
						wd.scene.add(wd.hose);
					}}
				/>
			</Layer>
		</Stage>
	);
};

/* ---------- 036 fifty hours of quiet, then they're back ---------- */
const C036: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const back = w('036', 0.47);
	const hours = Math.min(50, Math.floor(interpolate(f, [4, back - 4], [0, 50], clamp)));
	const mins = f < back - 4 ? Math.floor((f * 7) % 60) : 0;
	const isBack = f >= back;
	const hx = 1000;
	const cam = camPath(f, [
		[0, camOn(920, 480, 1.3)],
		[back - 6, camOn(940, 470, 1.45)],
		[back + 4, camOn(980, 520, 1.7, {farBlur: 7})],
		[w('036', 1.1), camOn(960, 520, 1.5)],
	]);
	return (
		<Stage cam={cam} bg="#d8c8b0" light={{x: 25, y: 10, o: 0.5, c: '255,226,180'}}>
			<Layer depth={1.4}>
				<Hotel f={gf} />
			</Layer>
			<Layer depth={1}>
				<Prop3D
					x={680}
					y={220}
					w={380}
					h={180}
					make={() => {
						const scene = propScene();
						const t = makeTimer();
						at(t, 870, 310, 0);
						t.rotation.set(0.05, 0.15, 0);
						scene.add(t);
						return {scene, t};
					}}
					update={(wd) => wd.t.userData.set(`${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`, isBack ? '#ff4a4a' : '#4cff9a')}
				/>
				<Svg>
					<Actor who="hero" x={hx} floor={FL} s={HS} facing={-1} faceTurn={0.4} look={[-0.6, -0.3]} expr={isBack ? 'wide' : 'normal'} mouth={isBack ? 'open' : 'smile'} pose={isBack ? gesture('handsOnHead', idle(gf, 2), env(f, back + 4, 1e9, 8, 1), f) : gesture('presentF', idle(gf, 2), env(f, 10, back - 10, 10, 8), f)} uid="h-036" />
					<HeroBadge x={hx} y={badgeY(FL)} s={0.8} />
					<Tag f={f} t={10} x={870} y={160} text="HICCUP-FREE" c="#1d3a2a" fg="#9ff0b0" stroke="#3fcf7a" size={32} rot={-3} until={back - 4} />
					{isBack ? <Tag f={f} t={back + 2} x={870} y={160} text="THEY'RE BACK" c="#3a1d2a" fg="#ff9a8a" stroke="#ff6a5a" size={36} rot={3} /> : null}
					<Tag f={f} t={w('036', 0.72)} x={1320} y={420} text="OSBORNE: ~50 HOURS TOO" c="#2a1a10" fg="#fff4d8" stroke="#c9a06a" size={28} rot={-3} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* ---------- 037 the papers find you; four thousand letters pour in ---------- */
const SLOT: [number, number] = [1320, 611];
const C037: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const pour = w('037', 0.42);
	const hx = 930;
	const read = f < pour + 10;
	const hp = read ? reach(reach(idle(gf, 2), 'F', [70, -120], 1), 'B', [60, -116], 1) : gesture('handsOnHead', idle(gf, 2), env(f, pour + 14, 1e9, 10, 1), f);
	const cam = camPath(f, [
		[0, camOn(980, 500, 1.5, {farBlur: 7})],
		[pour - 6, camOn(1000, 520, 1.45)],
		[pour + 20, camOn(1080, 600, 1.2)],
		[w('037', 1.2), camOn(1060, 620, 1.3)],
	]);
	return (
		<Stage cam={cam} bg="#b8cca8" light={{x: 30, y: 10, o: 0.45, c: '255,240,210'}}>
			<Layer depth={1.4}>
				<Hallway2 />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={hx} floor={FL} s={HS} facing={1} faceTurn={0.4} look={read ? [0.3, 0.4] : [0.8, 0.1]} expr={read ? 'normal' : 'wide'} mouth={read ? undefined : 'open'} pose={hp} uid="h-037" />
					<HeroBadge x={hx} y={badgeY(FL)} s={0.8} />
					<Tag f={f} t={w('037', 0.75)} x={1150} y={300} text="4,000 LETTERS" c="#11142c" fg="#ffd34a" size={40} rot={3} />
				</Svg>
				<Prop3D
					x={600}
					y={300}
					w={1000}
					h={640}
					make={() => {
						const scene = propScene();
						const paper = makeNewspaper(['DOCTOR', "CAN'T STOP", 'HICCUPING'], 'Year 7 — and counting');
						const env: THREE.Object3D[] = [];
						for (let i = 0; i < 70; i++) {
							const e = makeEnvelope();
							scene.add(e);
							env.push(e);
						}
						scene.add(paper);
						return {scene, paper, env};
					}}
					update={(wd, ff) => {
						wd.paper.visible = read;
						at(wd.paper, hx + 64, FL - 157 - 130, 50);
						wd.paper.rotation.set(0.05, -0.55, 0.05);
						wd.paper.scale.setScalar(0.5);
						wd.env.forEach((e, i) => {
							const t0 = pour + i * 0.9;
							const t = ff - t0;
							e.visible = t >= 0;
							if (t < 0) return;
							const vx = -(5 + random('ev' + i) * 9);
							const vy = -(random('eu' + i) * 6);
							const g = 0.7;
							const floorY = 890 - Math.floor(i / 9) * 7 - random('eh' + i) * 6;
							let x = SLOT[0] + vx * t;
							let y = SLOT[1] + vy * t + 0.5 * g * t * t;
							const landed = y >= floorY;
							if (landed) {
								const tl = (floorY - SLOT[1]) / 1;
								void tl;
								y = floorY;
								x = Math.max(hx - 160, SLOT[0] + vx * Math.sqrt((2 * (floorY - SLOT[1])) / g));
							}
							at(e, x, y, 20 + (i % 7) * 6);
							e.rotation.set(landed ? -1.3 : t * 0.3 * (i % 2 ? 1 : -1), 0, landed ? random('er' + i) * 2 : t * 0.2);
						});
					}}
				/>
			</Layer>
		</Stage>
	);
};

/* ---------- 038 pickle juice, peanut butter, standing on your head ---------- */
const C038: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const b1 = w('038', 0.28);
	const b2 = w('038', 0.56);
	const beat = f < b1 ? 0 : f < b2 ? 1 : 2;
	const hx = beat < 2 ? 980 : 640;
	const mouth: [number, number] = [hx + 40, FL - 157 - 150];
	const hp = beat === 0 ? reach(idle(gf, 2), 'F', [mouth[0] - hx + 10, mouth[1] - (FL - 157) + 10], 1) : beat === 1 ? reach(reach(idle(gf, 2), 'F', [mouth[0] - hx - 4, mouth[1] - (FL - 157) - 4], 1), 'B', [40, -40], 1) : idle(gf, 2);
	const pivot = (900 + FL - 371) / 2;
	const cam = camPath(f, [
		[0, camOn(1000, 500, 1.6, {farBlur: 7})],
		[b1, camOn(1000, 500, 1.6, {farBlur: 7})],
		[b2 - 4, camOn(1000, 520, 1.55, {farBlur: 7})],
		[b2 + 10, camOn(700, 620, 1.35)],
		[w('038', 1.2), camOn(700, 640, 1.45)],
	]);
	return (
		<Stage cam={cam} bg="#e8d8bc" light={{x: 70, y: 0, o: 0.45, c: '255,240,210'}}>
			<Layer depth={1.4}>
				<LivingDay />
			</Layer>
			<Layer depth={1}>
				<Svg>
					{beat < 2 ? (
						<Actor who="hero" x={hx} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.4, -0.3]} expr="sleepy" mouth={beat === 1 ? 'flat' : 'open'} pose={hp} uid="h-038" />
					) : (
						<g transform={`rotate(180 ${hx} ${pivot})`}>
							<Actor who="hero" x={hx} floor={FL} s={HS} facing={-1} faceTurn={0.4} look={[0.4, 0]} expr="worried" pose={{lean: 0, head: 0, armB: [-150, 20], armF: [150, -20], legB: [-4, 0], legF: [6, 0]}} shadow={false} uid="h-038b" />
						</g>
					)}
					{beat === 2 ? <rect x={hx - 140} y={pivot * 2 - 900 - 40} width={10} height={420} fill="#d8c09a" opacity={0} /> : null}
					<HeroBadge x={beat < 2 ? hx : hx + 170} y={beat < 2 ? badgeY(FL) : 380} s={0.8} />
					<Tag f={f} t={4} x={1300} y={320} text="PICKLE JUICE" c="#11142c" fg="#9ff0b0" stroke="#9ff0b0" size={34} rot={4} until={b1 - 2} />
					<Tag f={f} t={b1 + 2} x={1300} y={320} text="PEANUT BUTTER" c="#11142c" fg="#ffd34a" size={34} rot={-4} until={b2 - 2} />
					<Tag f={f} t={b2 + 6} x={1000} y={330} text="UPSIDE DOWN" c="#11142c" fg="#9fd8ff" stroke="#9fd8ff" size={36} rot={4} />
				</Svg>
				{beat < 2 ? (
					<Prop3D
						x={860}
						y={300}
						w={360}
						h={460}
						make={() => {
							const scene = propScene();
							const pickle = makeJar('pickle');
							const pb = makeJar('pb');
							const spoon = makeSpoon();
							scene.add(pickle, pb, spoon);
							return {scene, pickle, pb, spoon};
						}}
						update={(wd) => {
							wd.pickle.visible = beat === 0;
							wd.pb.visible = beat === 1;
							wd.spoon.visible = beat === 1;
							at(wd.pickle, mouth[0] + 26, mouth[1] + 30, 40);
							wd.pickle.rotation.set(0.1, 0, 1.15);
							wd.pickle.scale.setScalar(0.7);
							at(wd.pb, hx + 60, FL - 157 - 10, 40);
							wd.pb.scale.setScalar(0.6);
							wd.pb.rotation.set(0.25, -0.4, 0);
							at(wd.spoon, mouth[0] - 2, mouth[1] + 10, 50);
							wd.spoon.rotation.set(0, 0, -1.2);
						}}
					/>
				) : null}
			</Layer>
		</Stage>
	);
};

/* ---------- 039 Osborne's friend fires a shotgun into the air behind him (sepia) ---------- */
const C039: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const shot = w('039', 0.18);
	const startle = env(f, shot, shot + 16, 2, 12);
	const hicAt = shot + 30;
	const fj = jolt(f, [hicAt]);
	const ox = 1000;
	const fx = 720;
	const cam = usePush(camOn(880, 580, 1.25), camOn(900, 560, 1.4));
	const aim = reach(reach(idle(gf, 4), 'F', [90, -150], 1), 'B', [40, -110], 1);
	return (
		<AbsoluteFill style={{filter: 'sepia(0.85) saturate(0.9) contrast(1.05)'}}>
			<Stage cam={cam} bg="#c8b088" light={{x: 70, y: 10, o: 0.35}} grain={0.25} vig={0.7}>
				<Layer depth={1.4}>
					<Porch />
				</Layer>
				<Layer depth={1}>
					<Svg>
						<Actor who="farmer" x={ox} floor={FL} s={1} facing={1} faceTurn={0.4} look={[0.5, 0]} expr={startle > 0.2 ? 'wide' : 'normal'} mouth={startle > 0.2 || fj > 0.2 ? 'open' : undefined} pose={gesture('handsOnHead', {...idle(gf, 7), head: -10 * fj}, startle, f)} bob={startle * 30 + fj * 8} hairColor="#9a8a7a" age={0.6} uid="osb-39" />
						<Actor who="friend40" x={fx} floor={FL} s={1} facing={1} faceTurn={0.4} look={[0.4, -0.6]} mouth="smirk" pose={aim} uid="fr-39" />
						{f > shot && f < shot + 30 ? <Onoma x={fx + 200} y={360} text="BANG!" t={f - shot} c="#fff4d8" size={100} /> : null}
						{f > hicAt - 1 && f < hicAt + 26 ? <Onoma x={ox + 140} y={520} text="HIC!" t={f - hicAt} c="#fff4d8" size={60} /> : null}
					</Svg>
					<Prop3D
						x={fx}
						y={200}
						w={420}
						h={420}
						make={() => {
							const scene = propScene();
							const gun = makeShotgun();
							at(gun, fx + 70, FL - 157 - 130, 40);
							gun.rotation.set(0, 0, 1.05);
							const flashM = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), new THREE.MeshBasicMaterial({color: '#fff2b0'}));
							flashM.userData.noInk = true;
							scene.add(gun, flashM);
							return {scene, flashM};
						}}
						update={(wd, ff) => {
							const k = Math.max(0, 1 - Math.abs(ff - shot - 2) / 5);
							wd.flashM.visible = k > 0;
							at(wd.flashM, fx + 70 + Math.cos(1.05) * 200, FL - 157 - 130 - Math.sin(1.05) * 200, 60);
							wd.flashM.scale.setScalar(30 * k);
						}}
					/>
				</Layer>
				<Layer depth={0.9}>
					<OldFilm f={gf} />
				</Layer>
			</Stage>
			{flash(f, shot, 6) > 0 ? <AbsoluteFill style={{background: '#fff8e0', opacity: flash(f, shot, 6) * 0.7}} /> : null}
		</AbsoluteFill>
	);
};
const C039b: React.FC = () => <QuoteCard lines={['"It scared me some,', "but it didn't scare", 'the hiccups out of me."']} who="— CHARLES OSBORNE" t0={2} />;

/* ---------- 040 the 2021 straw: 92% said it worked — you're in the other 8 ---------- */
const C040: React.FC = () => {
	const {f, gf} = useShot();
	const cam = usePush(camOn(960, 520, 1.35), camOn(1000, 500, 1.55));
	const show = reach(idle(gf, 3), 'F', [80, -150], env(f, 6, 1e9, 10, 1));
	return (
		<Stage cam={cam} bg="#d4dee8" light={{x: 30, y: 0, o: 0.4, c: '235,245,255'}}>
			<Layer depth={1.4}>
				<Lab />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="researcher" x={900} floor={FL} s={0.98} facing={1} faceTurn={0.4} look={[0.6, -0.3]} mouth="smile" pose={show} uid="res-40" />
					<Tag f={f} t={8} x={1200} y={560} text="2021" c="#11142c" fg="#ffd34a" size={40} rot={4} />
				</Svg>
				<Prop3D
					x={900}
					y={300}
					w={260}
					h={340}
					make={() => {
						const scene = propScene();
						const s = makeStraw();
						at(s, 1000, 600, 40);
						s.rotation.set(0.2, 0.4, -0.15);
						scene.add(s);
						return {scene, s};
					}}
					update={(wd, ff) => (wd.s.rotation.y = 0.4 + ff * 0.03)}
				/>
			</Layer>
		</Stage>
	);
};
const C040b: React.FC = () => {
	const {f} = useShot();
	const k = interpolate(f, [6, 46], [0, 0.92], {...clamp, easing: ease});
	const a = k * Math.PI * 2;
	const R = 260;
	return (
		<Board tint="#1a2150">
			<g transform="translate(700,560)">
				<circle r={R} fill="#3a4680" />
				<path d={`M0,0 L0,${-R} A${R},${R} 0 ${a > Math.PI ? 1 : 0} 1 ${Math.sin(a) * R},${-Math.cos(a) * R} Z`} fill="#3fcf7a" />
				<circle r={R} fill="none" stroke="#11142c" strokeWidth={10} />
			</g>
			<g transform={`translate(1300,440) scale(${pop(f, 40)})`}>
				<text textAnchor="middle" fontSize={150} fontFamily={FONT} fontWeight={900} fill="#9ff0b0" stroke="#11142c" strokeWidth={10} paintOrder="stroke">
					92%
				</text>
				<text y={70} textAnchor="middle" fontSize={50} fontFamily={FONT} fontWeight={900} fill="#fff">
					SAID IT WORKED
				</text>
			</g>
			<g transform={`translate(1300,740) scale(${pop(f, 70)})`}>
				<text textAnchor="middle" fontSize={90} fontFamily={FONT} fontWeight={900} fill="#ff9a8a">
					8%: YOU
				</text>
			</g>
			<Cite text="Alvarez et al., JAMA Network Open, 2021 (249 users)" t={f - 20} />
		</Board>
	);
};
const C040c: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const hx = 900;
	const mouth: [number, number] = [hx + 46, FL - 157 - 150];
	const hp = reach(idle(gf, 2), 'F', [mouth[0] - hx + 20, mouth[1] - (FL - 157) + 70], 1);
	const cam = usePush(camOn(960, 500, 1.5, {farBlur: 7}), camOn(960, 480, 1.7, {farBlur: 8}));
	return (
		<Stage cam={cam} bg="#d4dee8" light={{x: 30, y: 0, o: 0.4, c: '235,245,255'}}>
			<Layer depth={1.4}>
				<Lab />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={hx} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.3, 0.4]} expr="sleepy" mouth="flat" pose={hp} uid="h-040" />
					<HeroBadge x={hx} y={badgeY(FL)} s={0.8} />
					<Tag f={f} t={w('040', 0.97) + 4} x={1220} y={330} text="THE OTHER 8%" c="#3a1d2a" fg="#ff9a8a" stroke="#ff6a5a" size={36} rot={4} />
				</Svg>
				<Prop3D
					x={880}
					y={320}
					w={260}
					h={420}
					make={() => {
						const scene = propScene();
						const g = makeWaterGlass();
						const s = makeStraw();
						scene.add(g, s);
						return {scene, g, s};
					}}
					update={(wd) => {
						const gx = mouth[0] + 40;
						const gy = mouth[1] + 190;
						at(wd.g, gx, gy, 20);
						wd.g.rotation.x = 0.15;
						at(wd.s, gx, gy - 20, 30);
						wd.s.rotation.set(0, 0, 0.35);
						wd.s.scale.setScalar(0.95);
					}}
				/>
			</Layer>
		</Stage>
	);
};

/* ---------- 041 the subscribe ask ---------- */
const C041: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const press = env(f, w('041', 0.2), w('041', 0.38), 6, 8);
	const hx = 700;
	const hp = reach(idle(gf, 2), 'F', [150, -120 + 20 * press], env(f, w('041', 0.1), w('041', 0.45), 8, 10));
	const cam = usePush(camOn(960, 560, 1.15), camOn(960, 540, 1.3));
	return (
		<Stage cam={cam} bg="#3a1a5a" light={{x: 50, y: 30, o: 0.4}}>
			<Layer depth={1.3}>
				<Svg>
					<rect x={-400} y={-300} width={2800} height={1600} fill="#4a1f6a" />
					{Array.from({length: 22}).map((_, i) => (
						<polygon key={i} points={`960,540 ${960 + Math.cos((i / 22) * Math.PI * 2 + f / 200) * 2000},${540 + Math.sin((i / 22) * Math.PI * 2 + f / 200) * 2000} ${960 + Math.cos(((i + 0.5) / 22) * Math.PI * 2 + f / 200) * 2000},${540 + Math.sin(((i + 0.5) / 22) * Math.PI * 2 + f / 200) * 2000}`} fill="#6a2f8a" />
					))}
					<rect x={-400} y={900} width={2800} height={400} fill="#2a103a" />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Prop3D
					x={820}
					y={420}
					w={620}
					h={260}
					make={() => {
						const scene = propScene();
						const b = makeSubButton();
						at(b, 1120, 560, 0);
						scene.add(b);
						return {scene, b};
					}}
					update={(wd) => {
						at(wd.b, 1120, 560, -18 * press);
						wd.b.rotation.set(0.12, -0.3, 0);
						wd.b.scale.set(1, 1, 1 - 0.3 * press);
					}}
				/>
				<Svg>
					<Actor who="hero" x={hx} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.6, -0.1]} mouth="smile" pose={hp} uid="h-041" />
					<HeroBadge x={hx} y={badgeY(FL)} s={0.8} />
					<Tag f={f} t={w('041', 0.6)} x={1120} y={780} text="YOU'RE WAY BEHIND" c="#11142c" fg="#ffd34a" size={36} rot={-3} />
				</Svg>
			</Layer>
		</Stage>
	);
};

export const SHOTS_C: ShotDef[] = [
	{at: '032', C: C032, whip: true},
	{at: '033', C: C033, whip: true},
	{at: '034', C: C034, whip: true},
	{at: '034', off: 160, C: C034b, whip: true},
	{at: '035', C: C035, whip: true},
	{at: '035', off: 66, C: C035b},
	{at: '036', C: C036, whip: true},
	{at: '037', C: C037, whip: true},
	{at: '038', C: C038, whip: true},
	{at: '039', C: C039, whip: true},
	{at: '039', off: 96, C: C039b, whip: true},
	{at: '040', C: C040, whip: true},
	{at: '040', off: 80, C: C040b, whip: true},
	{at: '040', off: 166, C: C040c, whip: true},
	{at: '041', C: C041, whip: true},
];
export {hicAgo};

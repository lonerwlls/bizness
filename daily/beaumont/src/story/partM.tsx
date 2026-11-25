import React from 'react';
import {AbsoluteFill, interpolate, random} from 'remotion';
import * as THREE from 'three';
import {Pose} from '../engine/Stickman';
import {env, gesture, idle, reach} from '../kit/actions';
import {Actor, useShot} from '../kit/core';
import type {ShotDef} from '../kit/coverage';
import {Layer, Stage, Svg, camOn, clamp, usePush} from '../kit/kit';
import {Board, Bubble, FONT} from '../kit/ui';
import {Onoma} from '../reference/PauseTime';
import {Prop3D, at, propScene} from '../three/Prop3D';
import {makeScalpel} from '../three/props';
import {Beaker, makeBeaker, makeChili, makeMedal, makePill, makePillBottle} from '../three/regrow';
import {FL, HS} from './common';
import {pop, useW} from './lib';
import {Bathroom} from './placesR4';
import {AudienceRow, Hall84, LAB84_TOP, Lab84, LabTable, NobelStage, Podium} from './placesM';
import {HIP, Over, Tag, useFont} from './partR1';

/* "He drank bacteria to prove a point" — daily short, Doctor ROO plays Barry Marshall.
   Made in 16:9 and cropped to 9:16 around each shot's focus: everything important stays
   within ±300 px of the focus. */

const kk = (x: number, a: number, b: number) => Math.max(0, Math.min(1, (x - a) / (b - a)));
const HX = 900;
/* where the drinking hand is: on the table → at the mouth */
const mouthOf = (x: number): [number, number] => [x + 52, HIP - 150];

/* a spiral bacterium with whipping flagella */
const Bug: React.FC<{x: number; y: number; a: number; f: number; s?: number; c?: string}> = ({x, y, a, f, s = 1, c = '#7ad0a0'}) => (
	<g transform={`translate(${x},${y}) rotate(${a}) scale(${s})`}>
		<path d={`M-40,0 ${Array.from({length: 9}).map((_, i) => `Q${-35 + i * 10},${(i % 2 ? -1 : 1) * 12} ${-30 + i * 10},0`).join(' ')}`} stroke="#2a1a14" strokeWidth={16} fill="none" strokeLinecap="round" />
		<path d={`M-40,0 ${Array.from({length: 9}).map((_, i) => `Q${-35 + i * 10},${(i % 2 ? -1 : 1) * 12} ${-30 + i * 10},0`).join(' ')}`} stroke={c} strokeWidth={10} fill="none" strokeLinecap="round" />
		{[-1, 0, 1].map((k) => (
			<path key={k} d={`M-42,${k * 3} q-14,${8 * Math.sin(f / 2 + k)} -28,${k * 6} t-24,${-k * 4}`} stroke="#2a1a14" strokeWidth={3} fill="none" />
		))}
	</g>
);
const STOMACH = 'M-60,-150 Q60,-200 130,-90 Q190,20 120,120 Q40,200 -60,170 Q-150,140 -150,60 Q-150,10 -80,10 Q-20,10 -20,-40 Q-20,-90 -60,-150 Z';

/* ================================ 001 he drinks the broth ================================ */
const M001: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const grab = kk(f, w('001', 0.2), w('001', 0.32));
	const lift = kk(f, w('001', 0.34), w('001', 0.46));
	const drink = kk(f, w('001', 0.48), w('001', 0.82));
	const down = kk(f, w('001', 0.86), w('001', 0.96));
	const tableP: [number, number] = [HX + 100, LAB84_TOP - 40];
	const m = mouthOf(HX);
	const rest: [number, number] = [HX + 40, HIP - 30];
	let hand: [number, number] = rest;
	if (f >= w('001', 0.2)) hand = grab < 1 ? [rest[0] + (tableP[0] - rest[0]) * grab, rest[1] + (tableP[1] - rest[1]) * grab] : [tableP[0] + (m[0] - tableP[0]) * lift, tableP[1] + (m[1] - tableP[1]) * lift];
	if (down > 0) hand = [m[0] + (tableP[0] - m[0]) * down, m[1] + (tableP[1] - m[1]) * down];
	const held = f >= w('001', 0.32) && down < 1;
	const tilt = 1.5 * Math.sin(Math.min(1, drink) * Math.PI * 0.5) * (1 - down);
	const hp = reach({...idle(gf, 2), head: -10 * tilt}, 'F', [hand[0] - HX, hand[1] - HIP], f >= w('001', 0.2) ? 1 : 0);
	const cam = usePush(camOn(960, 560, 1.25), camOn(950, 520, 1.5, {farBlur: 7}));
	return (
		<Stage cam={cam} bg="#dccfae" light={{x: 60, y: 0, o: 0.45, c: '255,240,200'}}>
			<Layer depth={1.4}>
				<Lab84 f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<LabTable x={1150} />
				</Svg>
				<Svg>
					<Actor who="hero" x={HX} floor={FL} s={HS} facing={1} faceTurn={0.45} look={drink > 0 ? [0.3, -0.6] : [0.6, 0.4]} expr={drink > 0.95 ? 'wide' : 'normal'} mouth={drink > 0 && drink < 1 ? 'open' : 'smile'} pose={hp} uid="h-001" />
					{drink > 0.2 && drink < 0.95 ? <Onoma x={HX + 130} y={HIP - 230} text="gulp" t={(f % 22) + 2} c="#a8925a" size={40} rot={6} /> : null}
				</Svg>
				<Prop3D
					x={760}
					y={420}
					w={640}
					h={380}
					make={() => {
						const scene = propScene();
						const b = makeBeaker();
						b.scale.setScalar(0.8);
						scene.add(b);
						return {scene, b};
					}}
					update={(wd) => {
						const b = wd.b as Beaker;
						b.userData.level(1 - drink);
						if (held) {
							at(b, hand[0] + 6, hand[1] + 37, 60);
							b.rotation.set(0.1, 0, tilt);
						} else {
							at(b, tableP[0], LAB84_TOP, 40);
							b.rotation.set(0.2, 0, 0);
						}
					}}
				/>
			</Layer>
			<Over>
				<Tag f={f} t={w('001', 0.04)} x={830} y={330} text="1984" c="#11142c" fg="#ffd34a" size={52} rot={-4} />
				<Tag f={f} t={w('001', 0.12)} x={1090} y={420} text="AUSTRALIA" c="#11142c" fg="#9fd8ff" stroke="#9fd8ff" size={38} rot={3} />
				<Tag f={f} t={w('001', 0.55)} x={960} y={880} text="A GLASS OF BACTERIA" c="#3a1d2a" fg="#ff9a8a" stroke="#ff6a5a" size={40} rot={-2} />
			</Over>
		</Stage>
	);
};

/* ================================ 002 Barry Marshall; nobody believed him ================================ */
const M002: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const shake = Math.sin(f / 3) * 6 * env(f, w('002', 0.45), 1e9, 6, 1);
	const cam = usePush(camOn(960, 560, 1.2), camOn(960, 560, 1.35));
	return (
		<Stage cam={cam} bg="#dccfae" light={{x: 60, y: 0, o: 0.45, c: '255,240,200'}}>
			<Layer depth={1.4}>
				<Lab84 f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="expertA" x={800} floor={FL} s={0.96} facing={1} faceTurn={0.4} look={[0.6, 0]} expr="angry" pose={{...gesture('armsCrossed', idle(gf, 3), 1, f), head: shake}} uid="ex-a" />
					<Actor who="expertB" x={1130} floor={FL} s={0.96} facing={-1} faceTurn={0.4} look={[-0.6, 0]} expr="angry" mouth="frown" pose={{...gesture('armsCrossed', idle(gf, 6), 1, f), head: -shake}} uid="ex-b" />
					<Actor who="hero" x={970} floor={FL} s={HS} facing={1} faceTurn={0.1} look={[0, -0.1]} mouth="smile" pose={gesture('shrug', idle(gf, 2), env(f, w('002', 0.5), 1e9, 8, 1), f)} uid="h-002" />
				</Svg>
			</Layer>
			<Over>
				<Tag f={f} t={w('002', 0.08)} x={960} y={210} text="DR. BARRY MARSHALL" c="#11142c" fg="#ffd34a" size={42} rot={-3} />
				<Tag f={f} t={w('002', 0.55)} x={960} y={900} text="NOBODY BELIEVED HIM" c="#3a1d2a" fg="#ff9a8a" stroke="#ff6a5a" size={40} rot={2} />
			</Over>
		</Stage>
	);
};

/* ================================ 003 ulcers = stress and spicy food; surgery ================================ */
const M003: React.FC = () => {
	const {f} = useShot();
	const w = useW();
	const cut = kk(f, w('003', 0.62), w('003', 0.85));
	return (
		<AbsoluteFill>
			<Board tint="#3a1a2a">
				<Tag f={f} t={w('003', 0.02)} x={960} y={130} text="BACK THEN" c="#11142c" fg="#9fd8ff" stroke="#9fd8ff" size={44} rot={-2} />
				<g transform={`translate(960,560) scale(${1.25 * pop(f, 4)})`}>
					<path d={STOMACH} fill="#f0a0a8" stroke="#2a1a14" strokeWidth={9} />
					<circle cx={60} cy={40} r={22} fill="#c0303a" stroke="#2a1a14" strokeWidth={5} />
					{cut > 0 ? <line x1={-160} y1={-160 + 0} x2={-160 + 340 * cut} y2={-160 + 330 * cut} stroke="#1d2236" strokeWidth={8} strokeDasharray="18 12" /> : null}
				</g>
				<Tag f={f} t={w('003', 0.14)} x={850} y={290} text="STRESS?" c="#11142c" fg="#fff" size={40} rot={-6} />
				<Tag f={f} t={w('003', 0.3)} x={1070} y={380} text="SPICY FOOD?" c="#3a1d2a" fg="#ff9a6a" stroke="#ff9a6a" size={34} rot={5} />
				<Tag f={f} t={w('003', 0.66)} x={960} y={900} text="STOMACH CUT OUT" c="#11142c" fg="#ff9a8a" stroke="#ff6a5a" size={40} rot={-2} />
			</Board>
			<Prop3D
				x={660}
				y={340}
				w={600}
				h={500}
				make={() => {
					const scene = propScene(2.2);
					const chili = makeChili();
					chili.scale.setScalar(1.4);
					const sc = makeScalpel();
					sc.scale.setScalar(2.4);
					scene.add(chili, sc);
					return {scene, chili, sc};
				}}
				update={(wd, ff) => {
					wd.chili.visible = f > w('003', 0.3);
					at(wd.chili, 1150, 470 + Math.sin(ff / 10) * 6, 80);
					wd.chili.rotation.set(0.3, 0, -0.4 + 0.1 * Math.sin(ff / 14));
					wd.sc.visible = cut > 0 && cut < 1;
					at(wd.sc, 960 + 1.25 * (-160 + 340 * cut) + 20, 560 + 1.25 * (-160 + 330 * cut) - 20, 120);
					wd.sc.rotation.set(0.2, 0, -0.75);
				}}
			/>
		</AbsoluteFill>
	);
};

/* ================================ 004 Robin Warren: a tiny spiral bacterium ================================ */
const M004: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const bugs = Array.from({length: 7}).map((_, i) => ({
		x: 960 + Math.cos(f / 40 + i * 1.7) * (90 + (i % 3) * 60),
		y: 520 + Math.sin(f / 33 + i * 2.3) * (70 + (i % 2) * 50),
		a: ((f * 2 + i * 50) % 360) * 0.4 + i * 50,
	}));
	return (
		<Board tint="#1a3a2a">
			<circle cx={960} cy={520} r={330} fill="#f4ecd8" stroke="#2a1a14" strokeWidth={20} />
			<defs>
				<clipPath id="scope-m4">
					<circle cx={960} cy={520} r={320} />
				</clipPath>
			</defs>
			<g clipPath="url(#scope-m4)">
				{bugs.map((b, i) => (
					<Bug key={i} x={b.x} y={b.y} a={b.a} f={f + i * 5} s={1.4} />
				))}
			</g>
			<Tag f={f} t={w('004', 0.1)} x={960} y={130} text="DR. ROBIN WARREN" c="#11142c" fg="#ffd34a" size={42} rot={-3} />
			<Tag f={f} t={w('004', 0.55)} x={1010} y={900} text="SPIRAL BACTERIUM" c="#0e3a22" fg="#7ad0a0" stroke="#7ad0a0" size={38} rot={2} />
			<ellipse cx={760} cy={1004} rx={70} ry={10} fill="#000" opacity={0.3} />
			<Actor who="warren" x={760} floor={1000} s={0.5} facing={1} faceTurn={0.3} look={[0.5, -0.4]} pose={gesture('point', idle(gf, 4), 1, f)} uid="warren-004" />
		</Board>
	);
};

/* ================================ 005 the experts laughed — so he made himself the experiment ================================ */
const M005: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const laugh = env(f, 4, w('005', 0.5), 4, 10);
	const raise = env(f, w('005', 0.55), 1e9, 8, 1);
	const hand: [number, number] = [960 + 60, HIP - 150];
	const hp = reach(idle(gf, 2), 'F', [hand[0] - 960, hand[1] - HIP], raise);
	const cam = usePush(camOn(960, 600, 1.2), camOn(960, 560, 1.4));
	return (
		<Stage cam={cam} bg="#3a2a2a" light={{x: 50, y: 0, o: 0.5, c: '255,230,190'}}>
			<Layer depth={1.4}>
				<Hall84 f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={960} floor={FL} s={HS} facing={1} faceTurn={0.1} look={[0, -0.2]} expr={raise > 0.5 ? 'normal' : 'sad'} mouth={raise > 0.5 ? 'smirk' : 'line'} pose={hp} uid="h-005" />
					<Podium x={960 - 10} />
				</Svg>
				<Prop3D
					x={860}
					y={400}
					w={260}
					h={300}
					make={() => {
						const scene = propScene();
						const b = makeBeaker();
						b.scale.setScalar(0.8);
						scene.add(b);
						return {scene, b};
					}}
					update={(wd) => {
						wd.b.visible = raise > 0.05;
						at(wd.b, hand[0] + 6, hand[1] + 37, 60);
						wd.b.rotation.set(0.1, 0, 0);
					}}
				/>
				<Svg>
					<AudienceRow laugh={laugh} f={gf} />
					{laugh > 0.3 ? <Onoma x={820} y={760} text="HA HA" t={(f % 24) + 2} c="#ffd34a" size={48} /> : null}
					{laugh > 0.3 ? <Onoma x={1110} y={740} text="HA!" t={((f + 9) % 24) + 2} c="#ffd34a" size={44} rot={8} /> : null}
				</Svg>
			</Layer>
			<Over>
				<Tag f={f} t={w('005', 0.6)} x={960} y={200} text="MYSELF: THE EXPERIMENT" c="#11142c" fg="#7af0a8" stroke="#7af0a8" size={38} rot={-3} />
			</Over>
		</Stage>
	);
};

/* ================================ 006 three days later: sick; Mom smells his breath ================================ */
const M006: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const heave = Math.max(0, Math.sin(f / 5)) * env(f, 2, w('006', 0.5), 4, 8);
	const hp: Pose = {...idle(gf, 2), lean: 22 + 10 * heave, head: 16};
	const mp = gesture('stop', idle(gf, 7), env(f, w('006', 0.55), 1e9, 6, 1), f);
	const cam = usePush(camOn(1080, 560, 1.3), camOn(1060, 560, 1.45));
	return (
		<Stage cam={cam} bg="#c8e6e8" light={{x: 35, y: 0, o: 0.45, c: '255,250,225'}}>
			<Layer depth={1.4}>
				<Bathroom />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={980} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.4, 0.8]} expr="sad" mouth="open" pose={hp} uid="h-006" />
					<Actor who="mom84" x={1210} floor={FL} s={0.95} facing={-1} faceTurn={0.4} look={[-0.6, 0.2]} expr="worried" mouth="frown" pose={mp} uid="mom-006" />
				</Svg>
			</Layer>
			<Over>
				<Tag f={f} t={w('006', 0.04)} x={960} y={190} text="3 DAYS LATER" c="#11142c" fg="#ffd34a" size={44} rot={-4} />
				<Bubble x={1100} y={330} w={320} h={110} t={f - w('006', 0.55)} tail={[60, 90]}>
					<text y={14} textAnchor="middle" fontSize={38} fontFamily={FONT} fontWeight={900} fill="#13203a">
						Your breath!
					</text>
				</Bubble>
			</Over>
		</Stage>
	);
};

/* ================================ 007 the camera inside: inflamed, full of bacteria ================================ */
const M007: React.FC = () => {
	const {f} = useShot();
	const w = useW();
	const tube = kk(f, 4, w('007', 0.3));
	const inside = kk(f, w('007', 0.3), w('007', 0.4));
	return (
		<Board tint="#2a0e14">
			{inside < 1 ? (
				<g opacity={1 - inside}>
					<g transform="translate(960,600) scale(1.2)">
						<path d={STOMACH} fill="#f0a0a8" stroke="#2a1a14" strokeWidth={9} />
					</g>
					<path d={`M960,0 L960,${80 + 330 * tube}`} stroke="#1d2236" strokeWidth={14} strokeLinecap="round" />
					<circle cx={960} cy={80 + 330 * tube} r={14} fill="#fff4b0" stroke="#1d2236" strokeWidth={4} />
				</g>
			) : null}
			{inside > 0 ? (
				<g opacity={inside}>
					<circle cx={960} cy={540} r={380} fill="#c84a52" stroke="#11142c" strokeWidth={20} />
					<defs>
						<clipPath id="scope-m7">
							<circle cx={960} cy={540} r={370} />
						</clipPath>
					</defs>
					<g clipPath="url(#scope-m7)">
						{Array.from({length: 8}).map((_, i) => (
							<path key={i} d={`M560,${300 + i * 70} q100,${-30 + 20 * Math.sin(f / 10 + i)} 200,0 t200,0 t200,0 t200,0`} stroke="#e86a72" strokeWidth={14} fill="none" opacity={0.7} />
						))}
						{Array.from({length: 14}).map((_, i) => (
							<Bug key={i} x={700 + random('mx' + i) * 520 + Math.sin(f / 15 + i) * 10} y={300 + random('my' + i) * 480} a={random('ma' + i) * 360 + f} f={f + i * 7} s={0.9} c="#9ff0b0" />
						))}
					</g>
				</g>
			) : null}
			<Tag f={f} t={w('007', 0.5)} x={960} y={110} text="INFLAMED" c="#3a1d2a" fg="#ff9a8a" stroke="#ff6a5a" size={46} rot={-3} />
			<Tag f={f} t={w('007', 0.72)} x={960} y={970} text="FULL OF THE BACTERIA" c="#0e3a22" fg="#9ff0b0" stroke="#9ff0b0" size={42} rot={2} />
		</Board>
	);
};

/* ================================ 008 a few antibiotics ================================ */
const M008: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const toMouth = kk(f, w('008', 0.2), w('008', 0.55));
	const m = mouthOf(HX);
	const start: [number, number] = [HX + 90, HIP - 70];
	const hand: [number, number] = [start[0] + (m[0] - start[0]) * toMouth, start[1] + (m[1] - start[1]) * toMouth];
	const hp = reach(reach(idle(gf, 2), 'F', [hand[0] - HX, hand[1] - HIP], 1), 'B', [70, -60], 1);
	const cam = usePush(camOn(950, 520, 1.5), camOn(950, 510, 1.6));
	return (
		<Stage cam={cam} bg="#dccfae" light={{x: 60, y: 0, o: 0.45, c: '255,240,200'}}>
			<Layer depth={1.4}>
				<Lab84 f={gf} />
			</Layer>
			<Layer depth={1}>
				<Prop3D
					x={760}
					y={420}
					w={400}
					h={360}
					make={() => {
						const scene = propScene();
						const bottle = makePillBottle();
						const pill = makePill();
						scene.add(bottle, pill);
						return {scene, bottle, pill};
					}}
					update={(wd) => {
						at(wd.bottle, HX + 70 - 4, HIP - 60 + 30, 50);
						wd.bottle.rotation.set(0.15, 0.3, 0);
						wd.pill.visible = toMouth < 0.98;
						at(wd.pill, hand[0] + 4, hand[1] - 4, 70);
					}}
				/>
				<Svg>
					<Actor who="hero" x={HX} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.5, 0.3]} mouth={toMouth > 0.9 ? 'smile' : 'open'} pose={hp} uid="h-008" />
				</Svg>
			</Layer>
			<Over>
				<Tag f={f} t={w('008', 0.1)} x={960} y={200} text="ANTIBIOTICS" c="#11142c" fg="#7af0a8" stroke="#7af0a8" size={46} rot={-3} />
			</Over>
		</Stage>
	);
};

/* ================================ 009 cured in two weeks; the Nobel Prize ================================ */
const M009: React.FC = () => {
	const {f} = useShot();
	const w = useW();
	const heal = kk(f, w('009', 0.08), w('009', 0.38));
	const days = Math.round(14 * heal);
	return (
		<Board tint="#1a2a4a">
			<Tag f={f} t={4} x={960} y={120} text="TODAY" c="#11142c" fg="#9fd8ff" stroke="#9fd8ff" size={44} rot={-2} />
			<g transform="translate(960,560) scale(1.25)">
				<path d={STOMACH} fill="#f0a0a8" stroke="#2a1a14" strokeWidth={9} />
				<circle cx={60} cy={40} r={22 * (1 - heal)} fill="#c0303a" />
			</g>
			<g transform="translate(960,930)">
				<rect x={-200} y={-55} width={400} height={110} rx={28} fill="#11142c" stroke="#7af0a8" strokeWidth={6} />
				<text y={20} textAnchor="middle" fontSize={54} fontFamily={FONT} fontWeight={900} fill="#7af0a8">
					DAY {days}
				</text>
			</g>
		</Board>
	);
};
const M009b: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const cam = usePush(camOn(960, 560, 1.2), camOn(960, 540, 1.35));
	return (
		<Stage cam={cam} bg="#0e1a3a" light={{x: 50, y: 0, o: 0.5, c: '255,230,170'}}>
			<Layer depth={1.4}>
				<NobelStage f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="warren" x={820} floor={FL - 140} s={0.95} facing={1} faceTurn={0.25} look={[0.2, -0.1]} mouth="smile" pose={gesture('wave', idle(gf, 4), env(f, 8, 1e9, 10, 1), f)} uid="warren-009" />
					<Actor who="hero" x={1060} floor={FL - 140} s={HS} facing={-1} faceTurn={0.25} look={[-0.2, -0.1]} mouth="smile" pose={gesture('wave', idle(gf, 2), env(f, 4, 1e9, 10, 1), f)} uid="h-009" />
				</Svg>
				<Prop3D
					x={700}
					y={300}
					w={500}
					h={400}
					make={() => {
						const scene = propScene(2.2);
						const m1 = makeMedal();
						const m2 = makeMedal();
						m1.scale.setScalar(0.6);
						m2.scale.setScalar(0.6);
						scene.add(m1, m2);
						return {scene, m1, m2};
					}}
					update={(wd, ff) => {
						// medals hang on their chests (ribbon over the neck)
						at(wd.m1, 820 + 4, FL - 140 - 157 - 60, 60);
						at(wd.m2, 1060 - 4, FL - 140 - 157 - 60, 60);
						wd.m1.rotation.set(0, Math.sin(ff / 20) * 0.3, 0);
						wd.m2.rotation.set(0, Math.sin(ff / 22 + 1) * 0.3, 0);
					}}
				/>
			</Layer>
			<Over>
				<Tag f={f} t={6} x={960} y={190} text="NOBEL PRIZE · 2005" c="#11142c" fg="#e8b830" stroke="#e8b830" size={46} rot={-3} />
			</Over>
		</Stage>
	);
	void w;
};

/* ================================ 010 would you drink it? ================================ */
const M010: React.FC = () => {
	const {f, gf, dur} = useShot();
	const w = useW();
	useFont("900 40px 'Rubik'");
	const out = interpolate(f, [dur - 18, dur - 2], [0, 1], clamp);
	const hand: [number, number] = [960 + 70, HIP - 120];
	const hp = reach(idle(gf, 2), 'F', [hand[0] - 960, hand[1] - HIP], env(f, 2, 1e9, 8, 1));
	const cam = usePush(camOn(960, 600, 1.25), camOn(960, 590, 1.35));
	return (
		<>
			<Stage cam={cam} bg="#2f5a8a" light={{x: 50, y: 30, o: 0.45}}>
				<Layer depth={1.3}>
					<Svg>
						<rect x={-400} y={-300} width={2800} height={1600} fill="#2f5a8a" />
						{Array.from({length: 24}).map((_, i) => {
							const a0 = (i / 24) * Math.PI * 2 + f / 200;
							const a1 = ((i + 0.5) / 24) * Math.PI * 2 + f / 200;
							return <polygon key={i} points={`960,700 ${960 + Math.cos(a0) * 2400},${700 + Math.sin(a0) * 2400} ${960 + Math.cos(a1) * 2400},${700 + Math.sin(a1) * 2400}`} fill="#3a6a9a" />;
						})}
					</Svg>
				</Layer>
				<Layer depth={1}>
					<Svg>
						<ellipse cx={960} cy={FL + 4} rx={150} ry={20} fill="#000" opacity={0.25} />
						<Actor who="hero" x={960} floor={FL} s={HS} facing={1} faceTurn={0.15} look={[0.1, -0.2]} mouth="smirk" pose={hp} uid="h-010" />
					</Svg>
					<Prop3D
						x={900}
						y={420}
						w={260}
						h={320}
						make={() => {
							const scene = propScene();
							const b = makeBeaker();
						b.scale.setScalar(0.8);
							scene.add(b);
							return {scene, b};
						}}
						update={(wd) => {
							at(wd.b, hand[0] + 6, hand[1] + 37, 60);
							wd.b.rotation.set(0.15, 0, 0.12 * Math.sin(f / 12));
						}}
					/>
				</Layer>
			</Stage>
			<Over>
				<g transform={`translate(960,190) scale(${pop(f, 4)})`}>
					<rect x={-290} y={-80} width={580} height={160} rx={30} fill="#fbfaf4" stroke="#11142c" strokeWidth={8} />
					<text y={-8} textAnchor="middle" fontSize={44} fontFamily={FONT} fontWeight={900} fill="#13203a">
						WOULD YOU DRINK IT
					</text>
					<text y={46} textAnchor="middle" fontSize={40} fontFamily={FONT} fontWeight={900} fill="#d23b3b">
						TO PROVE YOU'RE RIGHT?
					</text>
				</g>
				<Tag f={f} t={w('010', 0.55)} x={960} y={950} text="TELL ME IN THE COMMENTS ↓" c="#ffd34a" fg="#11142c" stroke="#11142c" size={34} rot={-2} />
			</Over>
			<AbsoluteFill style={{background: '#000', opacity: out}} />
		</>
	);
};

export const SHOTS_M: ShotDef[] = [
	{at: '001', C: M001, focus: 960},
	{at: '002', C: M002, focus: 960, whip: true},
	{at: '003', C: M003, focus: 960, whip: true},
	{at: '004', C: M004, focus: 960, whip: true},
	{at: '005', C: M005, focus: 960, whip: true},
	{at: '006', C: M006, focus: 1000, whip: true},
	{at: '007', C: M007, focus: 960, whip: true},
	{at: '008', C: M008, focus: 960, whip: true},
	{at: '009', C: M009, focus: 960, whip: true},
	{at: '009', off: 96, C: M009b, focus: 960, whip: true},
	{at: '010', C: M010, focus: 960, whip: true},
];

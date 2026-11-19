import React from 'react';
import {AbsoluteFill, interpolate, random} from 'remotion';
import * as THREE from 'three';
import {Pose} from '../engine/Stickman';
import {SIT, env, gesture, idle, reach, walkTo} from '../kit/actions';
import {Actor, useShot} from '../kit/core';
import type {ShotDef} from '../kit/coverage';
import {HeroBadge, Layer, Stage, Svg, camOn, clamp, usePush} from '../kit/kit';
import {Board, FONT, HAND} from '../kit/ui';
import {Onoma} from '../reference/PauseTime';
import {Prop3D, PropWorld, at, propScene} from '../three/Prop3D';
import {makeCalendar, makeNewspaper, makePage} from '../three/props';
import {Printer, makeBioJar, makeCheque, makeCoin, makeCooler, makeDish, makePrinter, makeVial} from '../three/regrow';
import {FL, HS, badgeY} from './common';
import {pop, useW} from './lib';
import {SEAT} from './places';
import {OldFilm} from './placesH';
import {BloodLab, Deer, EXEC_DESK_TOP, ExecDesk, ExecOffice, Forest, LAB_BENCH_TOP, LeatherChair, ListHall, PrintRoom, SteelBench, TissueLab, TransplantUnit} from './placesR3';
import {HIP, Over, Tag, useFont} from './partR1';

/* PART 3 (2:35–3:55): the Spare Parts Doctor — liver every month, a kidney, the waiting list,
   the billion-dollar offer, real lab-grown bladders and a printed ear, "no thanks"; then the price:
   Reyes's blood test, deer antlers, cancer genes, Dvorak's "wounds that do not heal". */

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

/* ================================ 025 a donor every month ================================ */
const MONTHS = ['MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPT', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
const CAL = {x: 640, y: 330};
type DonorW = PropWorld & {cals: THREE.Group[]; pages: THREE.Mesh[]; coolers: THREE.Group[]};
const R025: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	// month switch times: March, April, then a quick run to December
	const tm = [0.2, 0.36, 0.5, 0.53, 0.56, 0.59, 0.62, 0.65, 0.68, 0.71].map((k) => w('025', k));
	const month = tm.filter((t) => f >= t).length - 1;
	const HX = 820;
	const hp = gesture('presentF', idle(gf, 2), env(f, w('025', 0.22), 1e9, 10, 1), f);
	const cam = usePush(camOn(960, 560, 1.12), camOn(980, 580, 1.3));
	// coolers stack in two columns of five next to the hero; each drops in and settles
	const slot = (i: number): [number, number] => [1060 + (i % 2) * 112, FL - Math.floor(i / 2) * 74];
	return (
		<Stage cam={cam} bg="#c4e0ec" light={{x: 60, y: 0, o: 0.45, c: '240,250,255'}}>
			<Layer depth={1.4}>
				<TransplantUnit f={gf} />
			</Layer>
			<Layer depth={1}>
				<Prop3D
					x={0}
					y={120}
					w={1920}
					h={800}
					make={(): DonorW => {
						const scene = propScene();
						const cals = MONTHS.map((m) => {
							const c = makeCalendar(m, 1);
							at(c, CAL.x, CAL.y, 0);
							c.scale.setScalar(0.85);
							scene.add(c);
							return c;
						});
						const pages = MONTHS.map(() => {
							const p = makePage(1) as THREE.Mesh;
							p.scale.setScalar(0.72);
							scene.add(p);
							return p;
						});
						const coolers = MONTHS.map(() => {
							const c = makeCooler();
							c.scale.setScalar(0.8);
							scene.add(c);
							return c;
						});
						return {scene, cals, pages, coolers};
					}}
					update={(wd) => {
						wd.cals.forEach((c, i) => (c.visible = i === Math.max(0, month)));
						wd.pages.forEach((p, i) => {
							// the page of month i is torn off when month i+1 starts; it falls and stays on the floor
							const t0 = tm[i + 1];
							const t = t0 === undefined ? -1 : f - t0;
							p.visible = t >= 0;
							if (t < 0) return;
							const fall = 7 * t - 63 * (1 - Math.exp(-t / 9));
							const floorY = FL - 6 - (i % 3) * 3;
							const y = Math.min(floorY, CAL.y - 16 + fall);
							const landed = y >= floorY;
							const drift = (i % 2 ? 1 : -1) * (40 + i * 16) * (1 - Math.exp(-t / 20)) + (landed ? 0 : Math.sin(t / 6 + i) * 16);
							at(p, CAL.x + drift, y, 20 + i);
							p.rotation.set(landed ? -1.35 : Math.sin(t / 5 + i) * 0.6, 0, landed ? (i % 2 ? 0.3 : -0.25) : Math.sin(t / 4 + i) * 0.8);
						});
						wd.coolers.forEach((c, i) => {
							const t = f - (tm[i] + 4);
							c.visible = t >= 0;
							if (t < 0) return;
							const [x, y] = slot(i);
							const drop = t < 8 ? 90 * (1 - t / 8) * (1 - t / 8) : 0;
							at(c, x, y - drop, 20 - Math.floor(i / 2));
							c.rotation.set(0.15, -0.2, 0);
						});
					}}
				/>
				<Svg>
					<Actor who="hero" x={HX} floor={FL} s={HS} facing={1} faceTurn={0.45} look={[0.6, -0.1]} mouth="smile" pose={hp} uid="h-025" />
					<HeroBadge x={HX} y={badgeY(FL)} s={0.8} />
					<Tag f={f} t={w('025', 0.08)} x={1420} y={600} text="DONOR" c="#11142c" fg="#ff9a8a" stroke="#ff9a8a" size={40} rot={3} until={w('025', 0.74)} />
					<Tag f={f} t={w('025', 0.8)} x={1000} y={190} text="> 1 WHOLE LIVER GIVEN" c="#11142c" fg="#ffd34a" size={34} rot={-3} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* ================================ 026 the kidney ================================ */
const KIDNEY = 'M0,-150 C90,-160 150,-80 140,10 C130,100 60,160 -10,150 C-80,140 -110,80 -60,40 C-20,10 -30,-30 -70,-60 C-110,-100 -70,-150 0,-150 Z';
const R026: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const day = Math.min(4, Math.floor(interpolate(f, [w('026', 0.45), w('026', 0.8)], [1, 4.99], clamp)));
	const grow = interpolate(f, [w('026', 0.45), w('026', 0.8)], [0, 1], clamp);
	return (
		<Board tint="#2a1a3a">
			<g transform={`translate(540,500) scale(${pop(f, 2)})`}>
				<rect x={-330} y={-330} width={660} height={660} rx={40} fill="#11142c" stroke="#8a90a0" strokeWidth={8} />
				<text y={-260} textAnchor="middle" fontSize={46} fontFamily={FONT} fontWeight={900} fill="#c8ccd8">
					NORMAL KIDNEY
				</text>
				<g transform="translate(0,40) scale(1.1)">
					<path d={KIDNEY} fill="#8a6a6a" stroke="#2a1a14" strokeWidth={10} />
				</g>
				<text y={290} textAnchor="middle" fontSize={44} fontFamily={FONT} fontWeight={900} fill="#ff9a8a" opacity={pop(f, w('026', 0.2))}>
					CAN'T REGROW
				</text>
			</g>
			<g transform={`translate(1380,500) scale(${pop(f, w('026', 0.38))})`}>
				<rect x={-330} y={-330} width={660} height={660} rx={40} fill="#11142c" stroke="#7af0a8" strokeWidth={8} />
				<text y={-260} textAnchor="middle" fontSize={46} fontFamily={FONT} fontWeight={900} fill="#7af0a8">
					YOURS
				</text>
				<g transform={`translate(0,40) scale(${1.1 * (0.15 + 0.85 * grow)})`}>
					<path d={KIDNEY} fill="#c06a6a" stroke="#2a1a14" strokeWidth={10 / Math.max(0.2, 0.15 + 0.85 * grow)} />
				</g>
				<text y={290} textAnchor="middle" fontSize={52} fontFamily={FONT} fontWeight={900} fill="#ffd34a">
					DAY {day}
				</text>
			</g>
			<Sparkles x={1380} y={540} k={env(f, w('026', 0.8), 1e9, 6, 1)} r={190} n={10} />
			<ellipse cx={960} cy={1004} rx={90} ry={12} fill="#000" opacity={0.3} />
			<Actor who="hero" x={960} floor={1000} s={0.55} facing={1} faceTurn={0.2} look={[0.4, -0.4]} mouth="smile" pose={gesture('point', idle(gf, 2), env(f, w('026', 0.5), 1e9, 8, 1), f)} uid="h-026" />
		</Board>
	);
};

/* ================================ 027 the waiting list + the newspaper ================================ */
const R027: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const struck = interpolate(f, [w('027', 0.05), w('027', 0.5)], [0, 6], clamp);
	const cam = usePush(camOn(960, 380, 1.15), camOn(960, 400, 1.3));
	return (
		<Stage cam={cam} bg="#efe6d8" light={{x: 50, y: 0, o: 0.4, c: '255,245,225'}}>
			<Layer depth={1}>
				<ListHall f={gf} struck={struck} />
			</Layer>
		</Stage>
	);
};
const R027b: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const hx = 880;
	const P: [number, number] = [hx + 64, HIP - 104];
	const hp = reach(reach(idle(gf, 2), 'F', [P[0] - hx + 40, P[1] - HIP + 4], 1), 'B', [P[0] - hx - 30, P[1] - HIP + 6], 1);
	const cam = usePush(camOn(960, 470, 1.6, {farBlur: 7}), camOn(960, 460, 1.8, {farBlur: 8}));
	return (
		<Stage cam={cam} bg="#efe6d8" light={{x: 50, y: 0, o: 0.4, c: '255,245,225'}}>
			<Layer depth={1.5}>
				<ListHall f={gf} struck={6} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={hx} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.3, 0.4]} mouth="smile" pose={hp} uid="h-027b" />
					<HeroBadge x={hx} y={badgeY(FL)} s={0.8} />
				</Svg>
				<Prop3D
					x={720}
					y={300}
					w={500}
					h={460}
					make={() => {
						const scene = propScene();
						const paper = makeNewspaper(['THE SPARE', 'PARTS', 'DOCTOR'], 'He regrows what he gives away');
						scene.add(paper);
						return {scene, paper};
					}}
					update={(wd) => {
						at(wd.paper, P[0], P[1] - 6, 50);
						wd.paper.rotation.set(0.05, -0.3, 0.03);
						wd.paper.scale.setScalar(0.42);
					}}
				/>
			</Layer>
			<Over>
				<Tag f={f} t={w('027', 0.62)} x={1460} y={260} text={'"THE SPARE PARTS DOCTOR"'} c="#11142c" fg="#ffd34a" size={38} rot={3} />
			</Over>
		</Stage>
	);
};

/* ================================ 028 / 031 the billion-dollar offer ================================ */
const SUITX = 1260;
const HERO_O = 700;
type OfferW = PropWorld & {cheque: THREE.Group; vial: THREE.Group};
const OfficeScene: React.FC<{cheque: number; vialUp: number; heroPose: Pose; heroX: number; heroLook: [number, number]; heroExpr?: 'normal' | 'wide' | 'worried'; heroMouth?: 'smile' | 'open' | 'line'; suitExpr?: 'normal' | 'wide' | 'angry'; suitPose: Pose; heroVx?: number; heroBob?: number; facing?: 1 | -1; tag?: React.ReactNode; camA: ReturnType<typeof camOn>; camB: ReturnType<typeof camOn>}> = (p) => {
	const {gf} = useShot();
	const cam = usePush(p.camA, p.camB);
	const chequeX = 1120 - 300 * p.cheque;
	const vialHand: [number, number] = [SUITX - 70 - 40 * p.vialUp, SEAT - 50 - 20 * p.vialUp];
	return (
		<Stage cam={cam} bg="#2a2232" light={{x: 70, y: 10, o: 0.45, c: '255,220,170'}}>
			<Layer depth={1.4}>
				<ExecOffice />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<LeatherChair x={SUITX + 20} facing={-1} />
					<Actor who="suitman" x={SUITX} floor={FL} seat={SEAT} s={HS} facing={-1} faceTurn={0.4} look={[-0.6, 0]} expr={p.suitExpr ?? 'normal'} mouth={p.suitExpr === 'angry' ? 'frown' : 'smirk'} pose={p.suitPose} uid="suit" />
					<Actor who="hero" x={p.heroX} floor={FL} s={HS} facing={p.facing ?? 1} faceTurn={0.4} look={p.heroLook} expr={p.heroExpr ?? 'normal'} mouth={p.heroMouth} pose={p.heroPose} vx={p.heroVx ?? 0} bob={p.heroBob ?? 0} uid="h-office" />
					<ExecDesk x={1000} />
				</Svg>
				<Prop3D
					x={640}
					y={420}
					w={760}
					h={380}
					make={(): OfferW => {
						const scene = propScene();
						const cheque = makeCheque();
						const vial = makeVial('CELLS');
						scene.add(cheque, vial);
						return {scene, cheque, vial};
					}}
					update={(wd) => {
						at(wd.cheque, chequeX, EXEC_DESK_TOP - 2, 40);
						wd.cheque.rotation.set(0.5, 0, 0);
						at(wd.vial, vialHand[0], vialHand[1] + 20, 60);
						wd.vial.rotation.set(0.15, 0.3, 0);
						wd.vial.visible = p.vialUp > 0.02;
					}}
				/>
				<Svg>
					<HeroBadge x={p.heroX} y={badgeY(FL) - (p.heroBob ?? 0)} s={0.8} />
					{p.tag}
				</Svg>
			</Layer>
		</Stage>
	);
};
const R028: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const slide = interpolate(f, [w('028', 0.45), w('028', 0.7)], [0, 1], {...clamp, easing: (k) => 1 - (1 - k) * (1 - k)});
	const vialUp = env(f, w('028', 0.72), 1e9, 10, 1);
	const pushHand: [number, number] = [1120 - 300 * slide + 60, EXEC_DESK_TOP - 12];
	const sp = reach(reach({...SIT, lean: 14}, 'B', [SUITX - pushHand[0], pushHand[1] - SEAT], f < w('028', 0.72) && f > w('028', 0.4) ? 1 : 0), 'F', [70 + 40 * vialUp, -50 - 20 * vialUp], vialUp);
	return (
		<OfficeScene
			cheque={slide}
			vialUp={vialUp}
			heroX={HERO_O}
			heroPose={idle(gf, 2)}
			heroLook={[0.7, 0.2]}
			heroExpr={slide > 0.9 ? 'wide' : 'normal'}
			heroMouth={slide > 0.9 ? 'open' : undefined}
			suitPose={sp}
			camA={camOn(980, 560, 1.15)}
			camB={camOn(980, 600, 1.35)}
			tag={
				<>
					<Tag f={f} t={w('028', 0.75)} x={980} y={330} text="$1,000,000,000" c="#0e3a22" fg="#7af0a8" stroke="#7af0a8" size={52} rot={-3} />
					<Tag f={f} t={w('028', 0.9)} x={1420} y={420} text="FOR ONE VIAL" c="#11142c" fg="#fff" size={30} rot={3} />
				</>
			}
		/>
	);
};
const R031: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	// he pushes the cheque back across the desk with his fingertips, then turns and walks out
	const back = interpolate(f, [w('031', 0.4), w('031', 0.6)], [0, 1], clamp);
	const leaving = f > w('031', 0.66);
	const wk = walkTo(f, w('031', 0.66), w('031', 1.1), HERO_O, 220, 3, 0.3);
	const hx = leaving ? wk.x : HERO_O + 40 * env(f, w('031', 0.3), w('031', 0.62), 8, 8);
	const handP: [number, number] = [820 + 300 * back - 60, EXEC_DESK_TOP - 12];
	const pushing = f > w('031', 0.36) && f < w('031', 0.62);
	const hp = leaving ? wk.pose : reach(idle(gf, 2), 'F', [handP[0] - hx, handP[1] - HIP], pushing ? 1 : 0);
	return (
		<OfficeScene
			cheque={1 - back}
			vialUp={1}
			heroX={hx}
			facing={leaving ? -1 : 1}
			heroVx={leaving ? wk.vx : 0}
			heroBob={leaving ? wk.bob : 0}
			heroPose={hp}
			heroLook={leaving ? [-0.8, 0] : [0.7, 0.1]}
			heroMouth="smile"
			suitPose={reach({...SIT, lean: 6}, 'F', [110, -70], 1)}
			suitExpr={back > 0.5 ? 'wide' : 'normal'}
			camA={camOn(940, 580, 1.2)}
			camB={camOn(820, 580, 1.25)}
			tag={<Tag f={f} t={w('031', 0.45)} x={700} y={330} text="NO, THANKS" c="#11142c" fg="#ffd34a" size={44} rot={-4} />}
		/>
	);
};

/* ================================ 029 lab-grown bladders (2006) ================================ */
const R029: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const cam = usePush(camOn(960, 560, 1.1), camOn(1000, 580, 1.4));
	const steps = ['CELLS', 'SCAFFOLD', 'BLADDER'];
	return (
		<>
			<Stage cam={cam} bg="#1c3a5a" light={{x: 50, y: 0, o: 0.45, c: '200,235,255'}}>
				<Layer depth={1.4}>
					<TissueLab f={gf} />
				</Layer>
				<Layer depth={1}>
					<Svg>
						<SteelBench x={1000} w={760} />
					</Svg>
					<Prop3D
						x={620}
						y={420}
						w={760}
						h={360}
						make={() => {
							const scene = propScene();
							const jar = makeBioJar();
							at(jar, 1040, LAB_BENCH_TOP, 0);
							jar.rotation.x = 0.15;
							const d1 = makeDish();
							at(d1, 760, LAB_BENCH_TOP, 0);
							d1.rotation.x = 0.35;
							const d2 = makeDish();
							at(d2, 860, LAB_BENCH_TOP, 20);
							d2.rotation.x = 0.35;
							scene.add(jar, d1, d2);
							return {scene, jar};
						}}
						update={(wd, ff) => (wd.jar.rotation.y = ff / 60)}
					/>
				</Layer>
			</Stage>
			<Over>
				<Tag f={f} t={w('029', 0.3)} x={360} y={160} text="2006" c="#11142c" fg="#9fd8ff" stroke="#9fd8ff" size={48} rot={-4} />
				<Tag f={f} t={w('029', 0.4)} x={420} y={270} text="DR. ANTHONY ATALA" c="#11142c" fg="#fff" size={34} rot={3} />
				{steps.map((s, i) => (
					<g key={s} transform={`translate(${1060 + i * 280},170) scale(${pop(f, w('029', 0.5 + i * 0.08))})`}>
						<rect x={-120} y={-44} width={240} height={88} rx={22} fill="#11142c" stroke="#f0a0a8" strokeWidth={5} />
						<text y={14} textAnchor="middle" fontSize={34} fontFamily={FONT} fontWeight={900} fill="#f0a0a8">
							{s}
						</text>
						{i < 2 ? <path d="M128,0 l26,0 m-10,-12 l12,12 l-12,12" stroke="#f0a0a8" strokeWidth={6} fill="none" /> : null}
					</g>
				))}
				<Tag f={f} t={w('029', 0.82)} x={1340} y={900} text="7 YOUNG PATIENTS" c="#11142c" fg="#ffd34a" size={40} rot={-3} />
			</Over>
		</>
	);
};

/* ================================ 030 the 3D-printed ear (2022) ================================ */
const R030: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const k = interpolate(f, [w('030', 0.05), w('030', 0.85)], [0, 1], clamp);
	const cam = usePush(camOn(1080, 560, 1.15), camOn(1100, 560, 1.45));
	return (
		<>
			<Stage cam={cam} bg="#f2f0e4" light={{x: 40, y: 0, o: 0.4, c: '255,248,220'}}>
				<Layer depth={1.4}>
					<PrintRoom f={gf} />
				</Layer>
				<Layer depth={1}>
					<Svg>
						<SteelBench x={1100} w={640} />
					</Svg>
					<Prop3D
						x={820}
						y={280}
						w={560}
						h={500}
						make={() => {
							const scene = propScene();
							const pr = makePrinter();
							at(pr, 1100, LAB_BENCH_TOP, 0);
							pr.rotation.set(0.12, -0.35, 0);
							scene.add(pr);
							return {scene, pr};
						}}
						update={(wd, ff) => (wd.pr as Printer).userData.set(k, ff)}
					/>
				</Layer>
			</Stage>
			<Over>
				<Tag f={f} t={w('030', 0.1)} x={420} y={620} text="2022 · TEXAS" c="#11142c" fg="#9fd8ff" stroke="#9fd8ff" size={44} rot={-4} />
				<Tag f={f} t={w('030', 0.4)} x={1500} y={220} text="3D-PRINTED EAR" c="#11142c" fg="#ffd34a" size={40} rot={3} />
				<Tag f={f} t={w('030', 0.72)} x={1480} y={330} text="FROM HER OWN CELLS" c="#11142c" fg="#f2d6c4" stroke="#f2d6c4" size={34} rot={-2} />
			</Over>
		</>
	);
};

/* ================================ 032 Reyes reads the blood test ================================ */
const R032: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const quiet = f > w('032', 0.55);
	const rp = gesture(quiet ? 'touchFace' : 'rubChin', {...idle(gf, 6), lean: 6}, env(f, w('032', 0.2), 1e9, 10, 1), f);
	const cam = usePush(camOn(1080, 520, 1.25), camOn(1120, 480, 1.55, {farBlur: 7}));
	return (
		<Stage cam={cam} bg="#d4e0ec" light={{x: 60, y: 0, o: 0.4, c: '240,248,255'}}>
			<Layer depth={1.4}>
				<BloodLab f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="reyes" x={940} floor={FL} s={0.98} facing={1} faceTurn={0.5} look={[0.8, -0.2]} expr={quiet ? 'worried' : 'normal'} mouth={quiet ? 'line' : undefined} pose={rp} uid="reyes-032" />
					<Tag f={f} t={w('032', 0.05)} x={720} y={330} text="TUESDAY" c="#11142c" fg="#9fd8ff" stroke="#9fd8ff" size={40} rot={-4} />
					<Tag f={f} t={w('032', 0.6)} x={1560} y={600} text="YOUR BLOOD TEST" c="#11142c" fg="#ff9a8a" stroke="#ff9a8a" size={32} rot={3} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* ================================ 033 cells dividing ================================ */
const R033: React.FC = () => {
	const {f} = useShot();
	const w = useW();
	const gen = interpolate(f, [0, w('033', 0.8)], [0, 5], clamp);
	const n = Math.pow(2, Math.floor(gen));
	const split = gen % 1;
	const cells: [number, number][] = [];
	for (let i = 0; i < n; i++) cells.push([random('cx' + i) * 1400 - 700, random('cy' + i) * 600 - 300]);
	return (
		<Board tint="#2a1030">
			<circle cx={960} cy={540} r={470} fill="#f4e4ec" stroke="#2a1a14" strokeWidth={22} />
			<defs>
				<clipPath id="scope-33">
					<circle cx={960} cy={540} r={460} />
				</clipPath>
			</defs>
			<g clipPath="url(#scope-33)">
				{cells.map(([x, y], i) => {
					const d = split * 26;
					return (
						<g key={i} transform={`translate(${960 + x * 0.55},${540 + y * 0.6})`}>
							{[-1, 1].map((s) => (
								<g key={s} transform={`translate(${s * d},0)`}>
									<circle r={36} fill="#f0a0b8" stroke="#2a1a14" strokeWidth={5} />
									<circle r={12} fill="#9a3a6a" />
								</g>
							))}
						</g>
					);
				})}
			</g>
			<Tag f={f} t={w('033', 0.5)} x={960} y={130} text="FASTER THAN A DEER ANTLER" c="#11142c" fg="#ffd34a" size={44} rot={-2} />
		</Board>
	);
};

/* ================================ 034 antlers: up to 2 cm a day ================================ */
const R034: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const antler = interpolate(f, [w('034', 0.1), w('034', 0.85)], [0.15, 1], clamp);
	const cam = usePush(camOn(1000, 560, 1.1), camOn(1060, 480, 1.35));
	return (
		<Stage cam={cam} bg="#cfe8c0" light={{x: 70, y: 0, o: 0.35, c: '255,250,220'}}>
			<Layer depth={1.4}>
				<Forest f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<ellipse cx={1000} cy={FL + 4} rx={220} ry={20} fill="#000" opacity={0.2} />
					<Deer x={960} y={FL} antler={antler} f={gf} s={1.25} />
					{/* a ruler next to the antlers */}
					<g transform="translate(1450,260)">
						<rect x={-24} y={0} width={48} height={260} fill="#ffd34a" stroke="#2a1a10" strokeWidth={5} />
						{Array.from({length: 11}).map((_, i) => (
							<line key={i} x1={-24} y1={i * 26} x2={i % 5 === 0 ? 10 : -4} y2={i * 26} stroke="#2a1a10" strokeWidth={4} />
						))}
					</g>
				</Svg>
			</Layer>
			<Over>
				<Tag f={f} t={w('034', 0.55)} x={1440} y={200} text="UP TO 2 CM A DAY" c="#11142c" fg="#ffd34a" size={44} rot={3} />
				<Tag f={f} t={w('034', 0.2)} x={420} y={180} text="FASTEST-GROWING TISSUE" c="#11142c" fg="#9ff0b0" stroke="#9ff0b0" size={32} rot={-3} />
			</Over>
		</Stage>
	);
};

/* ================================ 035 antler genes ≈ bone-cancer genes (2019) ================================ */
const GENES = [3, 1, 4, 1, 5, 2, 6, 5, 3, 5, 2, 4, 6, 1, 3, 2];
const GCOL = ['#ff6a5a', '#ffd34a', '#7af0a8', '#9fd8ff', '#c8a0f0', '#ffb05a', '#f0a0b8'];
const R035: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const match = interpolate(f, [w('035', 0.35), w('035', 0.6)], [0, 1], clamp);
	const brake = pop(f, w('035', 0.72));
	const row = (y: number, label: string, c: string, k: number) => (
		<g transform={`translate(260,${y})`}>
			<text x={0} y={-24} fontSize={40} fontFamily={FONT} fontWeight={900} fill={c}>
				{label}
			</text>
			{GENES.map((g, i) => (
				<rect key={i} x={i * 88} y={0} width={76} height={110} rx={10} fill={GCOL[g]} opacity={i / GENES.length < k ? 1 : 0.15} stroke="#11142c" strokeWidth={4} />
			))}
		</g>
	);
	return (
		<Board tint="#1a2a4a">
			<Tag f={f} t={4} x={1560} y={110} text="2019 · SCIENCE" c="#11142c" fg="#9fd8ff" stroke="#9fd8ff" size={36} rot={3} />
			{row(250, 'ANTLER GROWTH', '#ffd34a', 1)}
			{row(560, 'BONE CANCER', '#ff9a8a', match)}
			{match > 0.98 ? <rect x={250} y={240} width={1420} height={440} rx={20} fill="none" stroke="#7af0a8" strokeWidth={6} strokeDasharray="20 14" /> : null}
			<g transform={`translate(960,870) scale(${brake})`}>
				<rect x={-360} y={-60} width={720} height={120} rx={30} fill="#11142c" stroke="#7af0a8" strokeWidth={6} />
				<circle cx={-280} cy={0} r={36} fill="none" stroke="#7af0a8" strokeWidth={10} />
				<rect x={-292} y={-12} width={24} height={24} fill="#7af0a8" />
				<text x={30} y={18} textAnchor="middle" fontSize={44} fontFamily={FONT} fontWeight={900} fill="#7af0a8">
					DEER HAVE THE BRAKES
				</text>
			</g>
		</Board>
	);
	void gf;
};

/* ================================ 036 two sides of one coin + Dvorak 1986 ================================ */
const R036: React.FC = () => {
	const fontOk = useFont("900 34px 'Rubik'");
	const {f} = useShot();
	const w = useW();
	const flip = interpolate(f, [w('036', 0.12), w('036', 0.36)], [0, Math.PI * 3], clamp);
	return (
		<AbsoluteFill>
			<Board tint="#2a1a1a">
				<text x={960} y={140} textAnchor="middle" fontSize={64} fontFamily={FONT} fontWeight={900} fill="#fff" opacity={pop(f, 4)}>
					TWO SIDES OF ONE COIN
				</text>
			</Board>
			{fontOk ? (
			<Prop3D
				x={560}
				y={240}
				w={800}
				h={700}
				make={() => {
					const scene = propScene(2.2);
					const coin = makeCoin('FAST GROWTH', 'CANCER');
					coin.scale.setScalar(2);
					at(coin, 960, 600, 0);
					scene.add(coin);
					return {scene, coin};
				}}
				update={(wd) => {
					wd.coin.rotation.set(0, flip + 0.25 * Math.sin(f / 20), 0);
					wd.coin.position.y = -600 + Math.abs(Math.sin(flip / 3)) * 60;
				}}
			/>
			) : null}
		</AbsoluteFill>
	);
};
const R036b: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const lines = ['"Tumors:', 'wounds that', 'do not heal."'];
	return (
		<AbsoluteFill style={{filter: 'sepia(0.8) contrast(1.05)'}}>
			<Board tint="#5a4630">
				<g transform={`translate(960,520) rotate(-2) scale(${pop(f, 2)})`}>
					<rect x={-620} y={-300} width={1240} height={600} fill="#efe4c8" stroke="#8a6a44" strokeWidth={10} />
					{lines.map((l, i) => (
						<text key={i} x={0} y={-120 + i * 120} textAnchor="middle" fontSize={100} fontFamily={HAND} fontWeight={700} fill="#2a1a0e" opacity={interpolate(f, [8 + i * 12, 18 + i * 12], [0, 1], clamp)}>
							{l}
						</text>
					))}
					<text x={0} y={240} textAnchor="middle" fontSize={44} fontFamily={FONT} fontWeight={900} fill="#5a3a1a" opacity={pop(f, w('036', 0.8))}>
						— DR. HAROLD DVORAK, 1986
					</text>
				</g>
				<OldFilm f={gf} />
			</Board>
		</AbsoluteFill>
	);
};

export const SHOTS_R3: ShotDef[] = [
	{at: '025', C: R025, whip: true},
	{at: '026', C: R026, whip: true},
	{at: '027', C: R027, whip: true},
	{at: '027', off: 78, C: R027b},
	{at: '028', C: R028, whip: true},
	{at: '029', C: R029, whip: true},
	{at: '030', C: R030, whip: true},
	{at: '031', C: R031, whip: true},
	{at: '032', C: R032, whip: true},
	{at: '033', C: R033, whip: true},
	{at: '034', C: R034, whip: true},
	{at: '035', C: R035, whip: true},
	{at: '036', C: R036, whip: true},
	{at: '036', off: 118, C: R036b},
];

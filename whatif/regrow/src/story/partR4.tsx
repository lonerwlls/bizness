import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import * as THREE from 'three';
import {Pose} from '../engine/Stickman';
import {SIT, env, gesture, idle, reach, walkTo} from '../kit/actions';
import {Actor, useShot} from '../kit/core';
import type {ShotDef} from '../kit/coverage';
import {HeroBadge, Layer, Stage, Svg, camOn, clamp, usePush} from '../kit/kit';
import {Board, Bubble, FONT, HAND} from '../kit/ui';
import {Onoma} from '../reference/PauseTime';
import {Prop3D, PropWorld, at, propScene} from '../three/Prop3D';
import {Clip, makeClipboard, makeMonitor, makeScalpel, makeWallClock, Monitor} from '../three/props';
import {Form, makeNeedleHolder, makePen, makeAxolotl, makeBagel, makeBloodBag, makeDie, makeForm, makeMarker, makeMug, makeTray2, formTipAt, swimAxo, Axo} from '../three/regrow';
import {FL, HS, badgeY} from './common';
import {Lying, pop, useW} from './lib';
import {SEAT, SeatChair} from './places';
import {ArmInset, Insert} from './placesR';
import {CAFE_TOP, CafeTable, Cafeteria} from './placesR2';
import {BloodLab, LAB_BENCH_TOP, SteelBench} from './placesR3';
import {BED_TOP, BOARD, Bathroom, DocOffice, EREntrance, OR2, ORTable2, RB_TOP, RaisedStretcher, Recovery, RecoveryBed, tallyAt} from './placesR4';
import {AC, AS, ArmClose, Glove, HIP, Over, PEN_TIP, PenHand, SLEEVE_FROM, Tag, WND, gripOf, placeTool, useFont} from './partR1';

/* PART 4 (3:55–5:10): the dice, the count, the lump, the scar as a stop sign, the theory,
   "no more"; Lily, the match, the night talk with Reyes, the bagel, the signature,
   nine hours of surgery, dawn, a week of mornings — the counter stops at 42. */

const kk = (x: number, a: number, b: number) => Math.max(0, Math.min(1, (x - a) / (b - a)));
const lerp2 = (a: [number, number], b: [number, number], k: number): [number, number] => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
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
/* two dice thrown at t0 from `from` along the surface y; they tumble, slow down and stay (faces 6 and 3) */
const diceAt = (f: number, t0: number, from: [number, number], dir: number, y: number, i: number) => {
	const t = Math.max(0, f - t0);
	const dist = (260 + i * 60) * (1 - Math.exp(-t / 9));
	const hop = t < 22 ? Math.abs(Math.sin((t / 22) * Math.PI * 2)) * 40 * (1 - t / 22) : 0;
	const yy = t < 8 ? from[1] + (y - from[1]) * (t / 8) : y - hop;
	const spin = (1 - Math.exp(-t / 9)) * (6 + i * 2) * Math.PI;
	return {x: from[0] + dir * dist + i * 16, y: f < t0 ? from[1] : yy, spin, t};
};
const settle = (spin: number, k: number, target: number) => spin * (1 - k) + target * k;

/* ================================ 037 "you roll the dice" ================================ */
const R037: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const throwT = w('037', 0.55);
	const RX = 1150;
	const HX = 640;
	const hand: [number, number] = [RX - 80, HIP - 70];
	const rp = reach({...idle(gf, 6), lean: 8}, 'F', [80 + 30 * env(f, throwT - 6, throwT + 4, 3, 8), -70], 1);
	const cam = usePush(camOn(900, 560, 1.25), camOn(900, 580, 1.42));
	return (
		<Stage cam={cam} bg="#d4e0ec" light={{x: 60, y: 0, o: 0.4, c: '240,248,255'}}>
			<Layer depth={1.4}>
				<BloodLab f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={HX} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.6, 0.3]} expr="worried" pose={idle(gf, 2)} uid="h-037" />
					<Actor who="reyes" x={RX} floor={FL} s={0.98} facing={-1} faceTurn={0.45} look={[-0.6, 0.2]} expr="worried" mouth={Math.sin(f / 3) > 0 ? 'open' : 'line'} pose={rp} uid="reyes-037" />
					<SteelBench x={900} w={420} />
					<HeroBadge x={HX} y={badgeY(FL)} s={0.8} />
				</Svg>
				<Prop3D
					x={640}
					y={480}
					w={620}
					h={320}
					make={() => {
						const scene = propScene();
						const dice = [makeDie(), makeDie()];
						scene.add(...dice);
						return {scene, dice};
					}}
					update={(wd) => {
						(wd.dice as THREE.Group[]).forEach((d, i) => {
							const p = diceAt(f, throwT, [hand[0] + 10, hand[1] + 20], -1, LAB_BENCH_TOP - 20, i);
							at(d, p.x, p.y, 40 + i * 10);
							const k = kk(p.t, 30, 40);
							d.rotation.set(settle(p.spin, k, i ? 0 : Math.PI / 2), settle(p.spin * 0.7, k, 0.4), settle(p.spin * 0.4, k, 0));
						});
					}}
				/>
			</Layer>
			<Over>
				<Bubble x={1300} y={230} w={500} h={120} t={f - w('037', 0.1)} tail={[-120, 90]}>
					<text y={10} textAnchor="middle" fontSize={40} fontFamily={FONT} fontWeight={900} fill="#13203a">
						You roll the dice.
					</text>
				</Bubble>
			</Over>
		</Stage>
	);
};

/* ================================ 038 tally marks on the whiteboard: 41 ================================ */
const MarkerScene: React.FC<{n0: number; n1: number; t0: number; t1: number; words?: {text: string; t0: number; t1: number}}> = ({n0, n1, t0, t1, words}) => {
	const {f, gf} = useShot();
	useFont("700 40px 'Caveat'");
	const prog = interpolate(f, [t0, t1], [n0, n1], clamp);
	const n = Math.floor(prog);
	const sub = prog - n;
	// the marker tip: on the stroke being drawn, or sweeping along the words
	let tip: [number, number];
	let wk = 0;
	if (words && f >= words.t0) {
		wk = kk(f, words.t0, words.t1);
		tip = [BOARD.x + 120 + 380 * wk, BOARD.y + 262 + Math.sin(f / 1.5) * 6];
	} else {
		const i = Math.min(n, n1 - 1);
		const [x, y] = tallyAt(i);
		const diag = i % 5 === 4;
		tip = diag ? [x + 86 * sub, y - 46 * sub] : [x + 3 * sub, y + 64 * sub];
	}
	const back = words ? kk(f, words.t1 + 2, words.t1 + 18) : 0;
	const hx = tip[0] - 96 - 220 * back;
	const hand: [number, number] = [tip[0] - (PEN_TIP + 22) * Math.cos((-30 * Math.PI) / 180), tip[1] - (PEN_TIP + 22) * Math.sin((-30 * Math.PI) / 180)];
	const hp = reach(idle(gf, 2), 'F', [hand[0] - hx, hand[1] - HIP], 1 - back);
	const cam = usePush(camOn(1120, 520, 1.25), camOn(1160, 520, 1.42));
	return (
		<Stage cam={cam} bg="#1a2240" light={{x: 40, y: 20, o: 0.45, c: '255,220,170'}}>
			<Layer depth={1}>
				<DocOffice tally={Math.max(n0, n)} />
				<Svg>
					{words && wk > 0 ? (
						<g>
							<defs>
								<clipPath id="words-clip">
									<rect x={BOARD.x + 100} y={BOARD.y + 190} width={420 * wk} height={110} />
								</clipPath>
							</defs>
							<text x={BOARD.x + 110} y={BOARD.y + 272} fontSize={84} fontFamily={HAND} fontWeight={700} fill="#d23b3b" clipPath="url(#words-clip)">
								{words.text}
							</text>
						</g>
					) : null}
					<Actor who="hero" x={hx} floor={FL} s={HS} facing={1} faceTurn={0.55} look={[0.8, -0.2]} expr={words ? 'sad' : 'worried'} pose={hp} uid="h-board" />
				</Svg>
				<Prop3D
					x={900}
					y={360}
					w={800}
					h={420}
					make={() => {
						const scene = propScene();
						const m = makeMarker();
						scene.add(m);
						return {scene, m};
					}}
					update={(wd) => {
						wd.m.visible = back < 0.05;
						placeTool(wd.m, 45, -24, tip, -30, 1, 60);
					}}
				/>
			</Layer>
		</Stage>
	);
};
const R038: React.FC = () => {
	const w = useW();
	return <MarkerScene n0={34} n1={41} t0={w('038', 0.05)} t1={w('038', 0.85)} />;
};

/* ================================ 039 the lump, in the bathroom mirror ================================ */
const R039: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const HX = 980;
	const feel = env(f, w('039', 0.25), 1e9, 10, 1);
	const hp = reach(reach(idle(gf, 2), 'F', [70, -50], feel), 'B', [96, -46], feel);
	const lump = interpolate(f, [w('039', 0.35), w('039', 0.6)], [0.3, 1], clamp);
	const cam = usePush(camOn(1080, 560, 1.25), camOn(1060, 560, 1.45));
	return (
		<>
			<Stage cam={cam} bg="#c8e6e8" light={{x: 35, y: 0, o: 0.45, c: '255,250,225'}}>
				<Layer depth={1.4}>
					<Bathroom />
				</Layer>
				<Layer depth={1}>
					<Svg>
						<Actor who="hero" x={HX} floor={FL} s={HS} facing={1} faceTurn={0.3} look={[0.3, 0.8]} expr={lump > 0.5 ? 'wide' : 'sleepy'} mouth={lump > 0.5 ? 'open' : undefined} pose={hp} uid="h-039" />
						<HeroBadge x={HX} y={badgeY(FL)} s={0.8} />
					</Svg>
				</Layer>
			</Stage>
			<Over>
				<Tag f={f} t={w('039', 0.04)} x={420} y={180} text="3 WEEKS LATER" c="#11142c" fg="#ffd34a" size={40} rot={-4} />
				<Insert x={1460} y={380} r={250} k={pop(f, w('039', 0.32))} id="ins-039" bg="#e8f4ee" ring="#ff8a7a">
					<g transform="scale(0.6)">
						<ArmInset state="lump" k={lump} />
					</g>
				</Insert>
				<Tag f={f} t={w('039', 0.6)} x={1460} y={680} text="A HARD LUMP" c="#3a1d2a" fg="#ff9a8a" stroke="#ff6a5a" size={40} rot={3} />
			</Over>
		</>
	);
};

/* ================================ 040 Reyes cuts it out; the lab says: not cancer ================================ */
const R040: React.FC = () => {
	const {f} = useShot();
	const w = useW();
	const inK = interpolate(f, [w('040', 0.02), w('040', 0.08)], [0, 1], clamp);
	const around = interpolate(f, [w('040', 0.08), w('040', 0.38)], [0, 1], clamp);
	const lift = interpolate(f, [w('040', 0.38), w('040', 0.5)], [0, 1], clamp);
	const shake = Math.sin(f / 1.3) * 3 * (1 - lift);
	const a = around * Math.PI * 2;
	let tip: [number, number] = [WND[0] + Math.cos(a) * 54 + shake, WND[1] + Math.sin(a) * 40 - 4];
	tip = [tip[0] + (1 - inK) * 500 + lift * 500, tip[1] - (1 - inK) * 420 - lift * 420];
	const grip = gripOf(45, -20, tip, 130, 3.0);
	const lump = 1 - kk(f, w('040', 0.36), w('040', 0.44));
	return (
		<ArmClose
			wnd={{cut: lump < 1 ? 1 : 0, stitches: 0, lump}}
			props3d={
				<Prop3D
					x={0}
					y={0}
					w={1920}
					h={1080}
					make={() => {
						const scene = propScene(2.0);
						const sc = makeScalpel();
						scene.add(sc);
						return {scene, sc};
					}}
					update={(wd) => placeTool(wd.sc, 45, -20, tip, 130, 3.0, 120)}
				/>
			}
		>
			<Glove g={grip} from={SLEEVE_FROM} />
			<Tag f={f} t={w('040', 0.12)} x={420} y={180} text="HANDS SHAKING" c="#11142c" fg="#9fd8ff" stroke="#9fd8ff" size={36} rot={-4} until={w('040', 0.5)} />
		</ArmClose>
	);
};
const R040b: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const stamp = interpolate(f, [w('040', 0.68), w('040', 0.74)], [0, 1], clamp);
	return (
		<AbsoluteFill>
			<Board tint="#1d2a3a">
				<Tag f={f} t={w('040', 0.88)} x={1440} y={760} text="NOT YET." c="#3a1d2a" fg="#ff9a8a" stroke="#ff6a5a" size={64} rot={-5} />
				<Tag f={f} t={w('040', 0.6)} x={460} y={200} text="LAB REPORT" c="#11142c" fg="#fff" size={40} rot={-3} />
				<Tag f={f} t={w('040', 0.76)} x={1440} y={620} text="NOT CANCER" c="#0e3a22" fg="#7af0a8" stroke="#7af0a8" size={52} rot={3} />
			</Board>
			<Prop3D
				x={560}
				y={60}
				w={800}
				h={960}
				make={() => {
					const scene = propScene(2.0);
					const clip = makeClipboard('Dr. ROO', 'Lump, left forearm', 'BENIGN');
					clip.scale.setScalar(2.1);
					at(clip, 960, 540, 0);
					scene.add(clip);
					return {scene, clip};
				}}
				update={(wd) => {
					(wd.clip as Clip).userData.redraw(1, stamp);
					wd.clip.rotation.set(0, 0, -0.04 + 0.01 * Math.sin(f / 20));
				}}
			/>
		</AbsoluteFill>
	);
	void gf;
};

/* ================================ 041 she stitches it shut — a scar is a stop sign ================================ */
const R041: React.FC = () => {
	const {f} = useShot();
	const w = useW();
	const L = 70 * AS;
	const inK = interpolate(f, [w('041', 0.0), w('041', 0.06)], [0, 1], clamp);
	const ph = interpolate(f, [w('041', 0.06), w('041', 0.5)], [0, 4], clamp);
	const out = interpolate(f, [w('041', 0.52), w('041', 0.58)], [0, 1], clamp);
	const si = Math.min(3, Math.floor(ph));
	const sp = ph - si;
	const sx = WND[0] - L + 18 + si * ((2 * L - 36) / 3);
	const dip = Math.sin(Math.min(1, sp) * Math.PI);
	let tip: [number, number] = [sx + 10 - 4 * dip, WND[1] - 40 + 40 * dip];
	const away = Math.max(1 - inK, out);
	tip = [tip[0] + away * 500, tip[1] - away * 420];
	const grip = gripOf(48, -40, tip, 125, 2.6);
	const stitches = Math.min(4, Math.floor(ph + 0.5));
	const scar = f > w('041', 0.62);
	const stop = pop(f, w('041', 0.7));
	return (
		<ArmClose
			wnd={{cut: scar ? 0 : 1, stitches: scar ? 0 : stitches, thread: scar || out > 0 ? null : tip, scar}}
			props3d={
				<Prop3D
					x={0}
					y={0}
					w={1920}
					h={1080}
					make={() => {
						const scene = propScene(2.0);
						const nh = makeNeedleHolder();
						scene.add(nh);
						return {scene, nh};
					}}
					update={(wd) => {
						wd.nh.visible = out < 1;
						placeTool(wd.nh, 48, -40, tip, 125, 2.6, 120);
					}}
				/>
			}
		>
			{out < 1 ? <Glove g={grip} from={SLEEVE_FROM} /> : null}
			{/* the stop sign stamped next to the scar */}
			<g transform={`translate(${WND[0] + 330},${WND[1] - 250}) scale(${stop})`}>
				<polygon points="-80,-34 -34,-80 34,-80 80,-34 80,34 34,80 -34,80 -80,34" fill="#d23b3b" stroke="#fff" strokeWidth={10} />
				<text y={18} textAnchor="middle" fontSize={50} fontFamily={FONT} fontWeight={900} fill="#fff">
					STOP
				</text>
			</g>
			<Tag f={f} t={w('041', 0.78)} x={WND[0] - 60} y={WND[1] - 300} text="A SCAR IS A STOP SIGN" c="#11142c" fg="#ffd34a" size={40} rot={-3} />
		</ArmClose>
	);
};

/* ================================ 042 one theory: regrow vs scar ================================ */
const R042: React.FC = () => {
	const {f} = useShot();
	const w = useW();
	return (
		<AbsoluteFill>
			<Board tint="#1a2a4a">
				<Tag f={f} t={4} x={960} y={110} text="ONE THEORY" c="#11142c" fg="#9fd8ff" stroke="#9fd8ff" size={52} rot={-2} />
				<g transform={`translate(520,500) scale(${pop(f, w('042', 0.1))})`}>
					<rect x={-330} y={-270} width={660} height={540} rx={40} fill="#11142c" stroke="#f4a6b8" strokeWidth={8} />
					<text y={-200} textAnchor="middle" fontSize={54} fontFamily={FONT} fontWeight={900} fill="#f4a6b8">
						REGROW
					</text>
					<text y={220} textAnchor="middle" fontSize={40} fontFamily={FONT} fontWeight={900} fill="#c8ccd8">
						SLOW · RISKY
					</text>
				</g>
				<g transform={`translate(1400,500) scale(${pop(f, w('042', 0.3))})`}>
					<rect x={-330} y={-270} width={660} height={540} rx={40} fill="#11142c" stroke="#7af0a8" strokeWidth={8} />
					<text y={-200} textAnchor="middle" fontSize={54} fontFamily={FONT} fontWeight={900} fill="#7af0a8">
						SCAR
					</text>
					<g transform="translate(0,10) scale(0.62)">
						<ArmInset state="scar" />
					</g>
					<text y={220} textAnchor="middle" fontSize={40} fontFamily={FONT} fontWeight={900} fill="#c8ccd8">
						FAST · SAFE
					</text>
				</g>
				<Tag f={f} t={w('042', 0.62)} x={1400} y={880} text="STOPS INFECTION" c="#11142c" fg="#7af0a8" stroke="#7af0a8" size={36} rot={-3} />
				<Tag f={f} t={w('042', 0.82)} x={1400} y={980} text="STOPS RUNAWAY GROWTH" c="#11142c" fg="#7af0a8" stroke="#7af0a8" size={36} rot={2} />
			</Board>
			<Prop3D
				x={200}
				y={330}
				w={640}
				h={340}
				make={() => {
					const scene = propScene(2.0);
					const axo = makeAxolotl();
					axo.scale.setScalar(1.2);
					axo.rotation.y = -0.35;
					at(axo, 510, 560, 0);
					scene.add(axo);
					return {scene, axo};
				}}
				update={(wd, ff) => {
					swimAxo(wd.axo as Axo, ff);
					wd.axo.visible = f > w('042', 0.1);
				}}
			/>
		</AbsoluteFill>
	);
};

/* ================================ 043 "no more regrowing. ever." ================================ */
const R043: React.FC = () => {
	const w = useW();
	return <MarkerScene n0={41} n1={41} t0={0} t1={1} words={{text: 'NO MORE. EVER.', t0: w('043', 0.2), t1: w('043', 0.85)}} />;
};

/* ================================ 044 Lily arrives ================================ */
const LilyOnStretcher: React.FC<{x: number; f: number; gf: number; look?: [number, number]; uid: string}> = ({x, gf, look = [-0.8, 0], uid}) => {
	const lp: Pose = {...SIT, lean: -30, head: -8, armF: [30, 40], armB: [20, 40], legF: [92, 2], legB: [88, 4]};
	return (
		<g>
			<Actor who="lily" x={x + 70} floor={FL} seat={BED_TOP - 4} s={0.7} facing={-1} faceTurn={0.4} look={look} expr="worried" pose={lp} uid={uid} />
			<rect x={x - 180} y={BED_TOP - 30} width={220} height={36} rx={14} fill="#f4c0d8" stroke="#c88aa8" strokeWidth={4} />
			<rect x={x - 200} y={BED_TOP - 4} width={40} height={30} rx={8} fill="#f4f6fa" />
			{void gf}
		</g>
	);
};
const R044: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const open = interpolate(f, [0, 14], [0, 1], clamp);
	const sx = interpolate(f, [4, w('044', 0.55)], [1700, 1180], {...clamp, easing: (k) => 1 - (1 - k) * (1 - k)});
	const moving = f > 4 && f < w('044', 0.55);
	const medX = sx + 300;
	const mp = reach(moving ? {...idle(gf, 8), lean: 10} : idle(gf, 8), 'F', [100, -40], 1);
	const HX = 640;
	const cam = usePush(camOn(1160, 560, 1.12), camOn(1060, 560, 1.32));
	return (
		<Stage cam={cam} bg="#2a3a5a" light={{x: 70, y: 0, o: 0.45, c: '220,235,255'}}>
			<Layer depth={1.4}>
				<EREntrance f={gf} open={open} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={HX} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.8, 0.2]} expr="worried" pose={idle(gf, 2)} uid="h-044" />
					<HeroBadge x={HX} y={badgeY(FL)} s={0.8} />
					<RaisedStretcher x={sx} />
					<LilyOnStretcher x={sx} f={f} gf={gf} uid="lily-044" />
					<Actor who="medic" x={medX} floor={FL} s={0.98} facing={-1} faceTurn={0.4} look={[-0.6, 0.2]} pose={mp} vx={moving ? -6 : 0} uid="medic-044" />
					<Tag f={f} t={w('044', 0.35)} x={sx - 20} y={BED_TOP - 260} text="LILY, 7" c="#11142c" fg="#f0c0ff" stroke="#c8a0f0" size={40} rot={-3} />
					<Tag f={f} t={w('044', 0.55)} x={1500} y={330} text="LIVER FAILING" c="#3a1d2a" fg="#ff9a8a" stroke="#ff6a5a" size={36} rot={3} />
					<Tag f={f} t={w('044', 0.78)} x={1520} y={430} text="NO DONOR" c="#11142c" fg="#fff" size={36} rot={-2} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* ================================ 045 the match ================================ */
const R045: React.FC = () => {
	const {f} = useShot();
	const w = useW();
	return (
		<AbsoluteFill>
			<Board tint="#2a1a2a">
				<text x={560} y={860} textAnchor="middle" fontSize={50} fontFamily={FONT} fontWeight={900} fill="#fff">
					YOU
				</text>
				<text x={1360} y={860} textAnchor="middle" fontSize={50} fontFamily={FONT} fontWeight={900} fill="#f0c0ff">
					LILY
				</text>
				<g transform={`translate(960,520) scale(${pop(f, w('045', 0.5))})`}>
					<circle r={70} fill="#2a9a5a" />
					<path d="M-30,0 L-8,24 L34,-24" stroke="#fff" strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round" />
				</g>
				<Tag f={f} t={w('045', 0.6)} x={960} y={970} text="PERFECT MATCH" c="#0e3a22" fg="#7af0a8" stroke="#7af0a8" size={48} rot={-2} />
			</Board>
			<Prop3D
				x={300}
				y={150}
				w={1320}
				h={680}
				make={() => {
					const scene = propScene(2.0);
					const a = makeBloodBag('O+');
					const b = makeBloodBag('O+');
					a.scale.setScalar(1.8);
					b.scale.setScalar(1.8);
					scene.add(a, b);
					return {scene, a, b};
				}}
				update={(wd, ff) => {
					at(wd.a, 560, 240 - 20 * (1 - pop(f, 2)), 0);
					at(wd.b, 1360, 240 - 20 * (1 - pop(f, 8)), 0);
					wd.a.rotation.set(0, 0.2, Math.sin(ff / 20) * 0.04);
					wd.b.rotation.set(0, -0.2, Math.sin(ff / 22 + 1) * 0.04);
				}}
			/>
		</AbsoluteFill>
	);
};

/* ================================ 046 two months vs one night — another roll ================================ */
const R046: React.FC = () => {
	const {f} = useShot();
	const w = useW();
	const throwT = w('046', 0.72);
	return (
		<AbsoluteFill>
			<Board tint="#1a1a3a">
				<g transform={`translate(560,300) scale(${pop(f, 2)})`}>
					<rect x={-330} y={-130} width={660} height={260} rx={36} fill="#11142c" stroke="#8a90a0" strokeWidth={8} />
					<text y={-40} textAnchor="middle" fontSize={40} fontFamily={FONT} fontWeight={900} fill="#c8ccd8">
						NORMAL DONOR
					</text>
					<text y={60} textAnchor="middle" fontSize={70} fontFamily={FONT} fontWeight={900} fill="#fff">
						~2 MONTHS
					</text>
				</g>
				<g transform={`translate(1360,300) scale(${pop(f, w('046', 0.45))})`}>
					<rect x={-330} y={-130} width={660} height={260} rx={36} fill="#11142c" stroke="#ffd34a" strokeWidth={8} />
					<text y={-40} textAnchor="middle" fontSize={40} fontFamily={FONT} fontWeight={900} fill="#ffd34a">
						YOU
					</text>
					<text y={60} textAnchor="middle" fontSize={70} fontFamily={FONT} fontWeight={900} fill="#fff">
						1 NIGHT
					</text>
				</g>
				<rect x={460} y={700} width={1000} height={20} rx={8} fill="#2a3048" />
				<Tag f={f} t={w('046', 0.8)} x={960} y={930} text="ANOTHER ROLL OF THE DICE" c="#11142c" fg="#ff9a8a" stroke="#ff6a5a" size={44} rot={-2} />
			</Board>
			<Prop3D
				x={300}
				y={450}
				w={1320}
				h={330}
				make={() => {
					const scene = propScene(2.2);
					const dice = [makeDie(), makeDie()];
					dice.forEach((d) => d.scale.setScalar(2.2));
					scene.add(...dice);
					return {scene, dice};
				}}
				update={(wd) => {
					(wd.dice as THREE.Group[]).forEach((d, i) => {
						const p = diceAt(f, throwT, [1500, 560], -1, 655, i);
						at(d, p.x - 40 * i, p.y, 40);
						const k = kk(p.t, 30, 40);
						d.rotation.set(settle(p.spin, k, i ? 0 : Math.PI / 2), settle(p.spin * 0.7, k, 0.4), settle(p.spin * 0.4, k, 0));
						d.visible = f >= throwT;
					});
				}}
			/>
		</AbsoluteFill>
	);
};

/* ================================ 047–048 the empty cafeteria at night ================================ */
const HX7 = 800;
const R047: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const RXs = 1330;
	const wk = walkTo(f, 2, w('047', 0.35), 1760, RXs, 6, 0.3);
	const sitK = kk(f, w('047', 0.35), w('047', 0.45));
	const standing = sitK <= 0;
	const rSeat = (FL - 157) + (SEAT - (FL - 157)) * sitK;
	const rp: Pose = standing ? (wk.moving ? wk.pose : idle(gf, 6)) : {...SIT, lean: 2, head: 2, armF: [50, 62], armB: [40, 62]};
	const talking = f > w('047', 0.55);
	const hp: Pose = {...SIT, lean: 6, head: 4, armF: [50, 60], armB: [44, 62]};
	const cam = usePush(camOn(1060, 580, 1.2), camOn(1060, 600, 1.35));
	return (
		<Stage cam={cam} bg="#2a2440" light={{x: 50, y: 0, o: 0.5, c: '255,215,160'}}>
			<Layer depth={1.4}>
				<Cafeteria f={gf} />
				<Svg>
					<rect x={-400} y={-300} width={2800} height={1300} fill="#0b1030" opacity={0.62} />
					<circle cx={1060} cy={200} r={60} fill="#fff4c0" opacity={0.7} />
					<polygon points="980,200 1140,200 1460,900 660,900" fill="#fff4c0" opacity={0.08} />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<SeatChair x={HX7 - 30} c="#e4762a" />
					<SeatChair x={RXs + 30} facing={-1} c="#e4762a" />
					<Actor who="hero" x={HX7} floor={FL} seat={SEAT} s={HS} facing={1} faceTurn={0.4} look={[0.6, 0.3]} expr="sad" pose={hp} uid="h-047" />
					<Actor who="reyes" x={standing ? wk.x : RXs} floor={FL} seat={standing ? undefined : rSeat} s={0.98} facing={-1} faceTurn={0.4} look={[-0.7, 0.1]} expr="worried" mouth={talking && Math.sin(f / 3) > 0 ? 'open' : 'line'} pose={rp} vx={standing ? wk.vx : 0} bob={standing ? wk.bob : 0} uid="reyes-047" />
					<CafeTable x={1065} w={560} />
					<HeroBadge x={HX7} y={SEAT - 164 - 118} s={0.8} />
				</Svg>
				<Prop3D
					x={780}
					y={560}
					w={560}
					h={240}
					make={() => {
						const scene = propScene();
						const tray = makeTray2();
						at(tray, 960, CAFE_TOP, 0);
						tray.rotation.x = 0.4;
						const bagel = makeBagel();
						at(bagel, 940, CAFE_TOP - 6, 10);
						bagel.rotation.x = 0.4;
						const mug = makeMug('#3d6fd6');
						at(mug, 1180, CAFE_TOP, 0);
						mug.rotation.set(0.25, 0.4, 0);
						scene.add(tray, bagel, mug);
						return {scene};
					}}
				/>
			</Layer>
			<Over>
				<Bubble x={1360} y={250} w={560} h={130} t={f - w('047', 0.58)} tail={[-80, 100]}>
					<text y={10} textAnchor="middle" fontSize={36} fontFamily={FONT} fontWeight={900} fill="#13203a">
						You don't owe anyone this.
					</text>
				</Bubble>
			</Over>
		</Stage>
	);
};
/* 048 the bagel on the tray — the same kind that started it all */
const R048: React.FC = () => {
	const {f, gf} = useShot();
	const cam = usePush(camOn(960, 540, 1.0), camOn(960, 540, 1.08));
	return (
		<Stage cam={cam} bg="#2a2440" light={{x: 50, y: 0, o: 0.45, c: '255,215,160'}}>
			<Layer depth={1}>
				<Svg>
					<rect x={-400} y={-300} width={2800} height={1600} fill="#3a2a2a" />
					<rect x={-400} y={-300} width={2800} height={1600} fill="#e4762a" opacity={0.55} />
					<circle cx={960} cy={300} r={500} fill="#fff4c0" opacity={0.08} />
				</Svg>
				<Prop3D
					x={0}
					y={0}
					w={1920}
					h={1080}
					make={() => {
						const scene = propScene(2.0);
						const tray = makeTray2();
						tray.scale.setScalar(4.5);
						at(tray, 960, 760, -200);
						tray.rotation.x = 1.1;
						const bagel = makeBagel();
						bagel.scale.setScalar(4.2);
						at(bagel, 900, 700, 0);
						bagel.rotation.x = 1.0;
						scene.add(tray, bagel);
						return {scene, bagel};
					}}
					update={(wd, ff) => (wd.bagel.rotation.z = Math.sin(ff / 60) * 0.03)}
				/>
				<Svg>
					<PenHand g={[1500, 920]} from={[2200, 1300]} />
				</Svg>
			</Layer>
			<Over>
				<Tag f={f} t={10} x={460} y={180} text="WHERE IT ALL STARTED" c="#11142c" fg="#ffd34a" size={38} rot={-4} />
			</Over>
		</Stage>
	);
	void gf;
};

/* ================================ 049 he signs ================================ */
const FORM_C: [number, number] = [960, 560];
const FORM_S = 2.2;
const R049: React.FC = () => {
	const {f} = useShot();
	const w = useW();
	useFont("700 28px 'Rubik'");
	const k = interpolate(f, [4, Math.max(12, w('049', 1))], [0, 1], clamp);
	const [u, v] = formTipAt(k);
	const tip: [number, number] = [FORM_C[0] + (u / 512 - 0.5) * 270 * FORM_S, FORM_C[1] - 16 * FORM_S + (v / 680 - 0.5) * 357 * FORM_S];
	const grip = gripOf(PEN_TIP, -18, tip, -52, FORM_S * 0.8);
	const cam = usePush(camOn(980, 600, 1.0), camOn(1000, 640, 1.12));
	return (
		<Stage cam={cam} bg="#3a2a2a" light={{x: 50, y: 0, o: 0.45, c: '255,215,160'}}>
			<Layer depth={1}>
				<Svg>
					<rect x={-400} y={-300} width={2800} height={1600} fill="#c86a2a" />
				</Svg>
				<Prop3D
					x={0}
					y={0}
					w={1920}
					h={1080}
					make={() => {
						const scene = propScene(2.0);
						const form = makeForm();
						form.scale.setScalar(FORM_S);
						at(form, FORM_C[0], FORM_C[1], 0);
						const pen = makePen();
						scene.add(form, pen);
						return {scene, form, pen};
					}}
					update={(wd) => {
						(wd.form as Form).userData.sign(k);
						placeTool(wd.pen, PEN_TIP, -18, tip, -52, FORM_S * 0.8, 200);
					}}
				/>
				<Svg>
					<PenHand g={grip} from={[-200, 1400]} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* ================================ 050 nine hours of surgery; dawn ================================ */
const R050: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const hours = interpolate(f, [0, w('050', 0.45)], [7, 16], clamp);
	const cam = usePush(camOn(960, 520, 1.1), camOn(960, 500, 1.25));
	const sp = reach({...idle(gf, 4), lean: 22, head: 18}, 'F', [110, -40 + Math.sin(f / 4) * 6], 1);
	return (
		<Stage cam={cam} bg="#1d4a4a" light={{x: 50, y: 0, o: 0.5, c: '255,250,225'}}>
			<Layer depth={1.4}>
				<OR2 f={gf} />
			</Layer>
			<Layer depth={1}>
				<Prop3D
					x={300}
					y={60}
					w={600}
					h={400}
					make={() => {
						const scene = propScene();
						const clock = makeWallClock();
						at(clock, 560, 260, 0);
						scene.add(clock);
						return {scene, clock};
					}}
					update={(wd) => (wd.clock.userData.set as (h: number) => void)(hours)}
				/>
				<Svg>
					<ORTable2 x={960} />
					{/* the donor (you) asleep on the table under a blue drape, head on the right */}
					<Lying who="hero" x={1060} y={690 - 30} s={0.95} f={gf} id="h-or" expr="sleepy" />
					<path d="M700,694 Q860,610 1110,640 L1130,700 L700,700 Z" fill="#3d6fd6" stroke="#2a4a9a" strokeWidth={4} />
					<Actor who="reyes" x={760} floor={FL} s={0.98} facing={1} faceTurn={0.5} look={[0.7, 0.8]} pose={sp} uid="reyes-050" />
					<Tag f={f} t={6} x={1460} y={260} text="9 HOURS" c="#11142c" fg="#ffd34a" size={48} rot={3} />
				</Svg>
			</Layer>
		</Stage>
	);
};
const R050b: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const dawn = interpolate(f, [0, 40], [0.3, 1], clamp);
	const half: Pose = {...SIT, lean: -30, head: -6, armF: [30, 40], armB: [20, 40], legF: [92, 2], legB: [88, 4]};
	const cam = usePush(camOn(1000, 560, 1.12), camOn(1000, 560, 1.28));
	return (
		<Stage cam={cam} bg="#dcc8dc" light={{x: 55, y: 0, o: 0.5, c: '255,215,170'}}>
			<Layer depth={1.4}>
				<Recovery dawn={dawn} />
			</Layer>
			<Layer depth={1}>
				<Prop3D
					x={1200}
					y={300}
					w={400}
					h={620}
					make={() => {
						const scene = propScene();
						const mon = makeMonitor();
						at(mon, 1420, 900, -60);
						mon.rotation.set(0.05, -0.35, 0);
						scene.add(mon);
						return {scene, mon};
					}}
					update={(wd, ff) => (wd.mon as Monitor).userData.beat(ff)}
				/>
				<Svg>
					<RecoveryBed x={620} c="#9fc8ff" />
					<Actor who="hero" x={640 + 60} floor={FL} seat={RB_TOP - 4} s={HS} facing={-1} faceTurn={-0.4} look={[0.8, 0]} mouth="smile" pose={half} uid="h-050b" />
					<rect x={420} y={RB_TOP - 36} width={260} height={44} rx={16} fill="#9fc8ff" stroke="#6a98c8" strokeWidth={4} />
					<RecoveryBed x={1240} c="#f4c0d8" />
					<Actor who="lily" x={1240 + 70} floor={FL} seat={RB_TOP - 4} s={0.7} facing={-1} faceTurn={-0.4} look={[-0.8, 0]} mouth="smile" pose={half} uid="lily-050b" />
					<rect x={1040} y={RB_TOP - 30} width={230} height={36} rx={14} fill="#f4c0d8" stroke="#c88aa8" strokeWidth={4} />
					<HeroBadge x={700} y={RB_TOP - 330} s={0.8} />
					<Tag f={f} t={w('050', 0.6)} x={1240} y={300} text="NEW LIVER: WORKING" c="#0e3a22" fg="#7af0a8" stroke="#7af0a8" size={34} rot={3} />
					<Tag f={f} t={w('050', 0.82)} x={600} y={260} text="YOURS: ALREADY BACK" c="#11142c" fg="#ffd34a" size={34} rot={-3} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* ================================ 051 a week of mornings: no lumps; 42 ================================ */
const R051: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const day = Math.min(7, 1 + Math.floor(interpolate(f, [w('051', 0.05), w('051', 0.55)], [0, 7], clamp)));
	const dark = interpolate(f, [w('051', 0.85), w('051', 0.92)], [0, 1], clamp);
	const HX = 980;
	const check = env(f, w('051', 0.05), w('051', 0.6), 8, 8);
	const hp = reach(reach(idle(gf, 2), 'F', [70, -50], check), 'B', [96, -46], check);
	const leave = walkTo(f, w('051', 0.7), w('051', 0.95), HX, 520, 2, 0.3);
	const x = f > w('051', 0.7) ? leave.x : HX;
	const cam = usePush(camOn(1080, 560, 1.25), camOn(1040, 560, 1.4));
	return (
		<>
			<Stage cam={cam} bg="#c8e6e8" light={{x: 35, y: 0, o: 0.45 * (1 - dark), c: '255,250,225'}}>
				<Layer depth={1.4}>
					<Bathroom dark={dark} />
				</Layer>
				<Layer depth={1}>
					<Svg>
						<Actor who="hero" x={x} floor={FL} s={HS} facing={f > w('051', 0.7) ? -1 : 1} faceTurn={0.3} look={[0.3, 0.8]} mouth="smile" pose={f > w('051', 0.7) ? leave.pose : hp} vx={f > w('051', 0.7) ? leave.vx : 0} bob={f > w('051', 0.7) ? leave.bob : 0} uid="h-051" />
						<HeroBadge x={x} y={badgeY(FL)} s={0.8} />
						<rect x={-400} y={-300} width={2800} height={1300} fill="#0b1030" opacity={0.72 * dark} />
					</Svg>
				</Layer>
			</Stage>
			<Over>
				<Tag f={f} t={w('051', 0.05)} x={420} y={180} text={`DAY ${day}`} c="#11142c" fg="#ffd34a" size={44} rot={-4} until={w('051', 0.7)} />
				<Insert x={1460} y={380} r={240} k={pop(f, w('051', 0.1)) * (1 - kk(f, w('051', 0.62), w('051', 0.68)))} id="ins-051" bg="#e8f4ee" ring="#7af0a8">
					<g transform="scale(0.58)">
						<ArmInset state="scar" />
					</g>
				</Insert>
				<Tag f={f} t={w('051', 0.3)} x={1460} y={670} text="NO LUMPS ✓" c="#0e3a22" fg="#7af0a8" stroke="#7af0a8" size={40} rot={3} until={w('051', 0.66)} />
			</Over>
		</>
	);
};

export const SHOTS_R4: ShotDef[] = [
	{at: '037', C: R037, whip: true},
	{at: '038', C: R038, whip: true},
	{at: '039', C: R039, whip: true},
	{at: '040', C: R040, whip: true},
	{at: '040', off: 112, C: R040b},
	{at: '041', C: R041, whip: true},
	{at: '042', C: R042, whip: true},
	{at: '043', C: R043, whip: true},
	{at: '044', C: R044, whip: true},
	{at: '045', C: R045, whip: true},
	{at: '046', C: R046, whip: true},
	{at: '047', C: R047, whip: true},
	{at: '048', C: R048},
	{at: '049', C: R049},
	{at: '050', C: R050, whip: true},
	{at: '050', off: 92, C: R050b, whip: true},
	{at: '051', C: R051, whip: true},
];

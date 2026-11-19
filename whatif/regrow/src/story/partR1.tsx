import React from 'react';
import {AbsoluteFill, continueRender, delayRender, interpolate} from 'remotion';
import * as THREE from 'three';
import {Pose} from '../engine/Stickman';
import {SIT, env, gesture, idle, reach, walkTo} from '../kit/actions';
import {Actor, useShot} from '../kit/core';
import type {ShotDef} from '../kit/coverage';
import {HeroBadge, Layer, Stage, Svg, camOn, clamp} from '../kit/kit';
import {usePush} from '../kit/kit';
import {Board, FONT} from '../kit/ui';
import {Onoma} from '../reference/PauseTime';
import {Prop3D, PropWorld, at, propScene} from '../three/Prop3D';
import {makeCalendar, makePage, makeScalpel, makeTimer, Timer} from '../three/props';
import {Axo, Notebook, makeBandage, noteTipAt, makeAxolotl, makeBagel, makeBoard, makeDish, makeFirstAid, makeGauze, makeKnife, makeMicroscope, makeMug, makeNeedleHolder, makeNotebook, makePen, makePuddle, makeTape, swimAxo} from '../three/regrow';
import {FL, HS, badgeY} from './common';
import {TitleWords, camPath, pop, useW} from './lib';
import {OldFilm} from './placesH';
import {
	AquaLab,
	ArmInset,
	ArmState,
	BENCH_TOP,
	Bench,
	BigHand,
	BreakRoom,
	COUNTER_TOP,
	CoffeeMachine,
	Counter,
	DESK_TOP,
	DayLab,
	Insert,
	Lab1898,
	OldChair,
	OldDesk,
	Stool,
	TANK,
	TankBack,
	TankFront,
} from './placesR';
import {SEAT} from './places';

/* PART 1 (0:00–1:21): the bagel at 3 a.m., the finger grows back, the question, the axolotl,
   Morgan's flatworm (1898), "that's you", and the first rule: stitched wounds scar, open ones regrow. */

export const HIP = FL - 157; // standing body origin
export const Tag: React.FC<{f: number; t: number; x: number; y: number; text: string; c?: string; fg?: string; size?: number; rot?: number; stroke?: string; until?: number}> = ({f, t, x, y, text, c = '#11142c', fg = '#fff', size = 40, rot = -4, stroke = '#ffd34a', until}) => {
	const k = pop(f, t);
	if (f < t) return null;
	const out = until !== undefined ? interpolate(f, [until, until + 8], [1, 0], clamp) : 1;
	if (out <= 0) return null;
	const w = text.length * size * 0.62 + 50;
	return (
		<g transform={`translate(${x},${y}) rotate(${rot}) scale(${k * out})`} opacity={Math.min(1, k * 1.5) * out}>
			<rect x={-w / 2} y={-size * 0.95} width={w} height={size * 1.9} rx={size * 0.5} fill={c} stroke={stroke} strokeWidth={4} />
			<text y={size * 0.35} textAnchor="middle" fontSize={size} fontFamily={FONT} fontWeight={900} fill={fg}>
				{text}
			</text>
		</g>
	);
};
/* screen-space overlay (1920×1080) drawn over a Stage */
export const Over: React.FC<{children: React.ReactNode}> = ({children}) => (
	<AbsoluteFill style={{pointerEvents: 'none'}}>
		<svg viewBox="0 0 1920 1080" width={1920} height={1080}>
			{children}
		</svg>
	</AbsoluteFill>
);

/* ================================ 001–005 the break room ================================ */
const HX = 820; // hero at the counter
const NX = 1420; // night nurse by the coffee machine
const BOARD: [number, number] = [985, COUNTER_TOP];
type BreakW = PropWorld & {knife: THREE.Group; bagel: THREE.Group; mug: THREE.Group; puddle: THREE.Mesh; board: THREE.Group};
const makeBreak = (): BreakW => {
	const scene = propScene();
	const board = makeBoard();
	at(board, BOARD[0], BOARD[1], 0);
	board.rotation.x = 0.35;
	const bagel = makeBagel();
	const knife = makeKnife();
	const mug = makeMug('#e4473c');
	const puddle = makePuddle();
	scene.add(board, bagel, knife, mug, puddle);
	return {scene, knife, bagel, mug, puddle, board};
};
/* nurse's hand (front, facing left) and hero's slicing hand */
const nurseHand = (sip: number): [number, number] => [NX - 70 + 20 * sip, HIP - 70 - 70 * sip];
const BreakBG: React.FC<{f: number}> = ({f}) => (
	<Layer depth={1.5}>
		<BreakRoom f={f} />
	</Layer>
);
const R001: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const slip = w('001', 0.8);
	const saw = f < slip ? Math.sin(f / 3.2) : 0;
	const jerk = env(f, slip, slip + 10, 2, 8);
	const hand: [number, number] = [HX + 92 + 16 * saw - 40 * jerk, COUNTER_TOP - 26 - 50 * jerk];
	const hp = reach({...idle(gf, 2), lean: 6}, 'F', [hand[0] - HX, hand[1] - HIP], 1);
	const sip = env(f, w('001', 0.3), w('001', 0.6), 14, 14);
	const nh = nurseHand(sip);
	const np = reach(idle(gf, 7), 'F', [NX - nh[0], nh[1] - HIP], 1);
	const cam = usePush(camOn(1080, 560, 1.0), camOn(960, 600, 1.42));
	return (
		<Stage cam={cam} bg="#0d2230" light={{x: 45, y: 0, o: 0.45, c: '220,245,255'}}>
			<BreakBG f={gf} />
			<Layer depth={1}>
				<Svg>
					<Counter x0={700} x1={1660} />
					<CoffeeMachine x={1540} f={gf} />
				</Svg>
				<Prop3D
					x={700}
					y={420}
					w={960}
					h={480}
					make={makeBreak}
					update={(wd) => {
						at(wd.bagel, BOARD[0] + 10, BOARD[1] - 2, 20);
						wd.bagel.rotation.set(0.35, 0, 0);
						at(wd.knife, hand[0], hand[1], 60);
						wd.knife.rotation.set(0.2, 0, -0.08 - 0.5 * jerk);
						at(wd.mug, nh[0], nh[1] + 26, 50);
						wd.mug.rotation.set(0.2, Math.PI, 0.6 * sip);
						wd.puddle.visible = false;
					}}
				/>
				<Svg>
					<Actor who="nurse" x={NX} floor={FL} s={0.98} facing={-1} faceTurn={0.4} look={[-0.4, 0.2]} expr="sleepy" pose={np} uid="nurse-001" />
					<Actor who="hero" x={HX} floor={FL} s={HS} facing={1} faceTurn={0.45} look={[0.5, 0.7]} expr={jerk > 0.2 ? 'wide' : 'sleepy'} mouth={jerk > 0.2 ? 'open' : undefined} pose={hp} uid="h-001" />
					{f > slip && f < slip + 28 ? <Onoma x={HX + 170} y={COUNTER_TOP - 120} text="SHHK!" t={f - slip} c="#ff8a7a" size={52} /> : null}
					<Tag f={f} t={w('001', 0.08)} x={1080} y={300} text="3:00 AM" c="#11142c" fg="#9fd8ff" stroke="#9fd8ff" size={34} rot={-4} until={w('001', 0.7)} />
				</Svg>
			</Layer>
		</Stage>
	);
};
/* 002 «Half an inch of your finger is just… gone.» — his face, the hand in an insert */
const R002: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const up = env(f, 0, 1e9, 8, 1);
	const hp = reach(idle(gf, 2), 'B', [70, -150], up);
	const cam = usePush(camOn(860, 560, 2.0, {farBlur: 8}), camOn(860, 550, 2.2, {farBlur: 9}));
	const k = pop(f, w('002', 0.15));
	return (
		<>
			<Stage cam={cam} bg="#0d2230" light={{x: 45, y: 0, o: 0.45, c: '220,245,255'}}>
				<BreakBG f={gf} />
				<Layer depth={1}>
					<Svg>
						<Counter x0={700} x1={1660} />
						<Actor who="hero" x={HX} floor={FL} s={HS} facing={1} faceTurn={0.25} look={[0.4, -0.2]} expr="wide" mouth="open" pose={hp} uid="h-002" />
					</Svg>
				</Layer>
			</Stage>
			<Over>
				<Insert x={1440} y={520} r={330} k={k} id="ins-002" bg="#16304a" ring="#ff8a9a">
					<g transform="translate(0,120) scale(1.15)">
						<BigHand tip={0} />
					</g>
				</Insert>
				<Tag f={f} t={w('002', 0.55)} x={1440} y={150} text="GONE" c="#3a1d2a" fg="#ff9a8a" stroke="#ff6a5a" size={44} rot={4} />
			</Over>
		</>
	);
};
/* 003 the doctor's checklist — first-aid box, gauze — then the finger itches */
const FA: [number, number] = [1215, 575]; // first-aid box on the splashback, right of the board
const R003: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const wk = walkTo(f, 4, w('003', 0.24), HX, 1040, 2, 0.3);
	const x = wk.x;
	const grab = interpolate(f, [w('003', 0.32), w('003', 0.45)], [0, 1], clamp);
	const back = interpolate(f, [w('003', 0.48), w('003', 0.6)], [0, 1], clamp);
	const held = f >= w('003', 0.45);
	const itch = f >= w('003', 0.7);
	const handF: [number, number] = held ? [x + 60 - 10 * back, HIP - 60 - 70 * (1 - back)] : [x + 20 + (FA[0] - 40 - x - 20) * grab, HIP - 30 + (FA[1] + 60 - HIP + 30) * grab];
	let hp: Pose = wk.moving ? wk.pose : idle(gf, 2);
	hp = reach(hp, 'F', [handF[0] - x, handF[1] - HIP], grab > 0 || held ? 1 : 0);
	hp = reach(hp, 'B', [40, -60], itch ? env(f, w('003', 0.7), 1e9, 8, 1) : 0);
	const cam = usePush(camOn(1020, 560, 1.25), camOn(1090, 560, 1.5, {farBlur: 7}));
	const open = env(f, w('003', 0.3), w('003', 0.55), 6, 8);
	return (
		<Stage cam={cam} bg="#0d2230" light={{x: 45, y: 0, o: 0.45, c: '220,245,255'}}>
			<BreakBG f={gf} />
			<Layer depth={1}>
				<Svg>
					<Counter x0={700} x1={1660} />
					<CoffeeMachine x={1540} f={gf} />
				</Svg>
				<Prop3D
					x={760}
					y={440}
					w={900}
					h={460}
					make={() => {
						const scene = propScene();
						const box = makeFirstAid();
						at(box, FA[0], FA[1], -20);
						const gauze = makeGauze();
						const board = makeBoard();
						at(board, BOARD[0] + 60, BOARD[1], 0);
						board.rotation.x = 0.35;
						const bagel = makeBagel();
						at(bagel, BOARD[0] + 70, BOARD[1] - 2, 20);
						bagel.rotation.x = 0.35;
						const knife = makeKnife();
						at(knife, BOARD[0] + 30, BOARD[1] - 4, 70);
						knife.rotation.set(1.2, 0, 0.2);
						const mug = makeMug('#e4473c');
						const nh = nurseHand(0);
						at(mug, nh[0], nh[1] + 26, 50);
						mug.rotation.set(0.2, Math.PI, 0);
						scene.add(box, gauze, board, bagel, knife, mug);
						return {scene, box, gauze};
					}}
					update={(wd) => {
						wd.box.rotation.y = -0.15 - 0.5 * open;
						if (held) at(wd.gauze, handF[0] + 4, handF[1] + 18, 60);
						else at(wd.gauze, FA[0] - 20, FA[1] + 34, 10);
						wd.gauze.visible = held || open > 0.3;
					}}
				/>
				<Svg>
					<Actor who="nurse" x={NX} floor={FL} s={0.98} facing={-1} faceTurn={0.4} look={[-0.7, 0]} expr="worried" pose={reach(idle(gf, 7), 'F', [NX - nurseHand(0)[0], nurseHand(0)[1] - HIP], 1)} uid="nurse-003" />
					<Actor who="hero" x={x} floor={FL} s={HS} facing={1} faceTurn={itch ? 0.2 : 0.45} look={itch ? [-0.1, 0.7] : [0.6, -0.2]} expr={itch ? 'wide' : 'worried'} pose={hp} vx={wk.vx} bob={wk.bob} uid="h-003" />
					{itch ? <Onoma x={x - 90} y={HIP - 60} text="itch" t={(f - w('003', 0.72)) % 22} c="#ffd34a" size={40} rot={8} /> : null}
				</Svg>
			</Layer>
			<Over>
				<Tag f={f} t={w('003', 0.24)} x={330} y={200} text="✓ ICE" c="#11142c" fg="#9fd8ff" stroke="#9fd8ff" size={36} rot={-3} until={w('003', 0.68)} />
				<Tag f={f} t={w('003', 0.34)} x={360} y={300} text="✓ GAUZE" c="#11142c" fg="#9fd8ff" stroke="#9fd8ff" size={36} rot={2} until={w('003', 0.68)} />
				<Tag f={f} t={w('003', 0.46)} x={400} y={400} text="✓ CALL SURGEON" c="#11142c" fg="#9fd8ff" stroke="#9fd8ff" size={36} rot={-2} until={w('003', 0.68)} />
			</Over>
		</Stage>
	);
};
/* 004 the fingertip grows back: bone, skin, nail — forty seconds, no scar */
const R004: React.FC = () => {
	const {f} = useShot();
	const w = useW();
	const bone = interpolate(f, [w('004', 0.08), w('004', 0.3)], [0, 1], clamp);
	const skin = interpolate(f, [w('004', 0.3), w('004', 0.5)], [0, 0.85], clamp);
	const nail = interpolate(f, [w('004', 0.5), w('004', 0.6)], [0, 0.15], clamp);
	const tip = skin + nail;
	const secs = Math.round(interpolate(f, [w('004', 0.08), w('004', 0.6)], [0, 40], clamp));
	const glow = env(f, w('004', 0.6), w('004', 0.85), 4, 14);
	const zoom = interpolate(f, [0, w('004', 1)], [1, 1.08], clamp);
	const lost = 70;
	const stump = -(196 - lost);
	return (
		<Board tint="#16304a">
			<g transform={`translate(860,700) scale(${1.55 * zoom})`}>
				{/* bone sprouting from the stump before the skin covers it */}
				{bone > 0 && tip < 0.84 ? <rect x={-26 - 13} y={stump - lost * bone} width={26} height={lost * bone + 8} rx={13} fill="#fbf6ea" stroke="#2a1a14" strokeWidth={6} /> : null}
				<BigHand tip={tip} glow={glow} />
			</g>
			<g transform="translate(1440,380)">
				<rect x={-200} y={-90} width={400} height={180} rx={30} fill="#0b0d14" stroke="#7af0a8" strokeWidth={6} />
				<text y={40} textAnchor="middle" fontSize={120} fontFamily={FONT} fontWeight={900} fill="#7af0a8">
					0:{String(secs).padStart(2, '0')}
				</text>
			</g>
			<Tag f={f} t={w('004', 0.12)} x={1440} y={580} text="BONE" c="#11142c" fg="#fbf6ea" stroke="#fbf6ea" size={40} rot={-3} />
			<Tag f={f} t={w('004', 0.34)} x={1440} y={680} text="SKIN" c="#11142c" fg="#f2c9a5" stroke="#f2c9a5" size={40} rot={2} />
			<Tag f={f} t={w('004', 0.52)} x={1440} y={780} text="NAIL" c="#11142c" fg="#ffd0dc" stroke="#ffd0dc" size={40} rot={-2} />
			<Tag f={f} t={w('004', 0.82)} x={860} y={150} text="NO SCAR" c="#0e3a22" fg="#7af0a8" stroke="#7af0a8" size={56} rot={-5} />
		</Board>
	);
};
/* 005 the nurse drops her coffee, he drops the bagel — both stay on the floor */
const R005: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const t1 = w('005', 0.1);
	const t2 = w('005', 0.55);
	// mug: free fall from the nurse's hand, lands, tips over, puddle spreads
	const nh = nurseHand(0);
	const g = 2.4;
	const m = f - t1;
	const mugFall = m <= 0 ? 0 : Math.min(FL - (nh[1] + 26), 0.5 * g * m * m);
	const mugLanded = m > 0 && mugFall >= FL - (nh[1] + 26);
	const landT = Math.sqrt((2 * (FL - (nh[1] + 26))) / g);
	const tip = mugLanded ? interpolate(m - landT, [0, 6], [0, 1], clamp) : 0;
	const puddle = mugLanded ? interpolate(m - landT, [0, 24], [0, 1], {...clamp, easing: (k) => 1 - (1 - k) * (1 - k)}) : 0;
	// bagel: from the hero's hand, falls, bounces once, rolls to the right and stops
	const hx = 900;
	const bh: [number, number] = [hx + 70, HIP - 80];
	const b = f - t2;
	const fallH = FL - 14 - bh[1];
	const bLand = Math.sqrt((2 * fallH) / g);
	let bx = bh[0];
	let by = bh[1];
	let brot = 0;
	let flat = 0;
	if (b > 0) {
		if (b < bLand) by = bh[1] + 0.5 * g * b * b;
		else {
			const r = b - bLand;
			const hop = r < 10 ? Math.max(0, 22 * Math.sin((r / 10) * Math.PI)) : 0;
			by = FL - 14 - hop;
			const dist = 110 * (1 - Math.exp(-r / 9));
			bx = bh[0] + 20 + dist;
			brot = dist / 30;
			flat = interpolate(r, [18, 28], [0, 1], {...clamp, easing: (k) => k * k});
		}
	}
	const holdingBagel = b <= 0;
	const hp = reach(reach(idle(gf, 2), 'F', holdingBagel ? [70, -80] : [50, -50], 1), 'B', [40, -100], 1);
	const np = reach(idle(gf, 7), 'F', [NX - nh[0], nh[1] - HIP], m > 0 ? 1 - env(f, t1, 1e9, 1, 16) * 0.5 : 1);
	const cam = usePush(camOn(1120, 600, 1.12), camOn(1120, 640, 1.22));
	return (
		<Stage cam={cam} bg="#0d2230" light={{x: 45, y: 0, o: 0.45, c: '220,245,255'}}>
			<BreakBG f={gf} />
			<Layer depth={1}>
				<Svg>
					<Counter x0={700} x1={1660} />
					<CoffeeMachine x={1540} f={gf} />
				</Svg>
				<Prop3D
					x={700}
					y={420}
					w={1000}
					h={520}
					make={makeBreak}
					update={(wd) => {
						at(wd.board, BOARD[0] + 60, BOARD[1], 0);
						at(wd.knife, BOARD[0] + 30, BOARD[1] - 4, 70);
						wd.knife.rotation.set(1.2, 0, 0.2);
						at(wd.bagel, bx, by + (b > bLand ? 14 * flat : 0), 40);
						wd.bagel.rotation.set(b > bLand ? 1.4 * (1 - flat) + 0.3 * flat : 0.4, 0, -brot * (1 - flat));
						at(wd.mug, nh[0] - 12 * tip, nh[1] + 26 + mugFall - 14 * tip, 60);
						wd.mug.rotation.set(0.2, Math.PI, (m > 0 ? 0.15 * Math.min(1, m / 10) : 0) + (Math.PI / 2) * tip);
						(wd.mug.userData.coffee as THREE.Mesh).visible = !mugLanded;
						wd.puddle.visible = puddle > 0;
						at(wd.puddle, nh[0] - 40, FL - 1, 40);
						wd.puddle.scale.set(70 * puddle + 1, 26 * puddle + 1, 1);
					}}
				/>
				<Svg>
					<Actor who="nurse" x={NX} floor={FL} s={0.98} facing={-1} faceTurn={0.4} look={[-0.6, -0.1]} expr="wide" mouth="open" pose={np} uid="nurse-005" />
					<Actor who="hero" x={hx} floor={FL} s={HS} facing={1} faceTurn={0.45} look={[0.4, -0.3]} expr="wide" mouth="open" pose={hp} uid="h-005" />
					{mugLanded && m - landT < 26 ? <Onoma x={nh[0] - 30} y={FL - 80} text="CLANK!" t={m - landT} c="#ff8a7a" size={46} /> : null}
					{b > bLand && b - bLand < 26 ? <Onoma x={bx} y={FL - 90} text="thud" t={b - bLand} c="#ffd34a" size={40} rot={6} /> : null}
				</Svg>
			</Layer>
		</Stage>
	);
};

/* ================================ 006 the question ================================ */
const R006: React.FC = () => {
	const {f, gf, at: atL, end} = useShot();
	const cam = usePush(camOn(960, 660, 1.4), camOn(960, 620, 1.18));
	const hp = reach(idle(gf, 4), 'F', [56, -150], env(f, 0, 1e9, 10, 1));
	return (
		<>
			<Stage cam={cam} bg="#07081a" light={{x: 50, y: 40, o: 0.5, c: '255,230,190'}}>
				<Layer depth={1}>
					<Svg>
						<ellipse cx={960} cy={905} rx={300} ry={40} fill="#fff6d8" opacity={0.18} />
						<polygon points="900,-40 1020,-40 1260,905 660,905" fill="#fff6d8" opacity={0.08} />
						<Actor who="hero" x={960} floor={FL} s={HS} facing={1} faceTurn={0.2} look={[0.5, -0.6]} expr="wide" mouth="smile" pose={hp} uid="h-title" />
						{Array.from({length: 8}).map((_, i) => {
							const a = (i / 8) * Math.PI * 2 + f / 20;
							return <circle key={i} cx={960 + 56 + Math.cos(a) * 40} cy={HIP - 160 + Math.sin(a) * 40} r={4} fill="#fff4b0" opacity={0.7} />;
						})}
					</Svg>
				</Layer>
			</Stage>
			<TitleWords words={['SO', 'WHAT', 'IF', 'YOU', 'COULD', 'REGROW', 'ANY', 'PART', 'OF', 'YOUR', 'BODY?']} hot={['REGROW']} t0={atL('006')} len={end('006') - atL('006')} />
		</>
	);
};

/* ================================ 007 the axolotl ================================ */
type AxoW = PropWorld & {axo: Axo};
const makeAxoWorld = (): AxoW => {
	const scene = propScene(2.0);
	const axo = makeAxolotl();
	axo.scale.setScalar(1.1);
	axo.rotation.y = -0.35;
	scene.add(axo);
	return {scene, axo};
};
const AXO_Y = TANK.y + TANK.h - 22;
const AxoTank: React.FC<{regrow: number; swimX: number}> = ({regrow, swimX}) => {
	const {gf} = useShot();
	return (
		<>
			<Svg>
				<TankBack f={gf} />
			</Svg>
			<Prop3D
				x={TANK.x}
				y={TANK.y}
				w={TANK.w}
				h={TANK.h}
				make={makeAxoWorld}
				update={(wd, ff) => {
					swimAxo(wd.axo, ff);
					at(wd.axo, swimX, AXO_Y, 0);
					wd.axo.userData.legs[0].scale.setScalar(Math.max(0.001, regrow));
				}}
			/>
			<Svg>
				<TankFront f={gf} />
			</Svg>
		</>
	);
};
const R007: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const hx = 960;
	const hp: Pose = {...idle(gf, 3), lean: 10, head: 6};
	const swimX = TANK.x + 230 + 60 * Math.sin(f / 70);
	const cam = usePush(camOn(1150, 560, 1.05), camOn(1300, 560, 1.3));
	return (
		<Stage cam={cam} bg="#0b1c34" light={{x: 70, y: 20, o: 0.4, c: '150,220,255'}}>
			<Layer depth={1.4}>
				<AquaLab f={gf} />
			</Layer>
			<Layer depth={1}>
				<AxoTank regrow={1} swimX={swimX} />
				<Svg>
					<Actor who="hero" x={hx} floor={FL} s={HS} facing={1} faceTurn={0.5} look={[0.9, 0.3]} mouth="smile" pose={gesture('rubChin', hp, env(f, w('007', 0.15), 1e9, 10, 1), f)} uid="h-007" />
					<Tag f={f} t={w('007', 0.22)} x={TANK.x + 300} y={TANK.y - 90} text="AXOLOTL" c="#3a1d2a" fg="#f4a6b8" stroke="#f4a6b8" size={44} rot={-3} />
					<Tag f={f} t={w('007', 0.32)} x={TANK.x + 560} y={TANK.y - 20} text="MEXICO" c="#11142c" fg="#ffd34a" size={32} rot={4} />
				</Svg>
			</Layer>
		</Stage>
	);
};
const R007b: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const regrow = interpolate(f, [w('007', 0.58), w('007', 0.78)], [0, 1], clamp);
	const swimX = TANK.x + 260;
	const cam = usePush(camOn(TANK.x + 330, TANK.y + 200, 1.55, {farBlur: 7}), camOn(TANK.x + 300, TANK.y + 210, 1.7, {farBlur: 8}));
	return (
		<Stage cam={cam} bg="#0b1c34" light={{x: 70, y: 20, o: 0.4, c: '150,220,255'}}>
			<Layer depth={1.4}>
				<AquaLab f={gf} />
			</Layer>
			<Layer depth={1}>
				<AxoTank regrow={regrow} swimX={swimX} />
				<Svg>
					{regrow > 0 && regrow < 1
						? Array.from({length: 6}).map((_, i) => {
								const a = (i / 6) * Math.PI * 2 + f / 6;
								return <circle key={i} cx={swimX + 60 + Math.cos(a) * 46} cy={AXO_Y - 10 + Math.sin(a) * 26} r={5} fill="#fff4b0" opacity={0.9} />;
							})
						: null}
				</Svg>
			</Layer>
			<Over>
				<Tag f={f} t={w('007', 0.56)} x={1560} y={300} text="LEG ✓" c="#11142c" fg="#f4a6b8" stroke="#f4a6b8" size={44} rot={-3} />
				<Tag f={f} t={w('007', 0.66)} x={1580} y={420} text="HEART ✓" c="#11142c" fg="#ff8a9a" stroke="#ff8a9a" size={44} rot={2} />
				<Tag f={f} t={w('007', 0.76)} x={1560} y={540} text="BRAIN ✓" c="#11142c" fg="#c8a0f0" stroke="#c8a0f0" size={44} rot={-2} />
				<Tag f={f} t={w('007', 0.9)} x={420} y={180} text="NO SCAR" c="#0e3a22" fg="#7af0a8" stroke="#7af0a8" size={52} rot={-5} />
			</Over>
		</Stage>
	);
};

/* ================================ 008 Morgan's flatworm, 1898 ================================ */
const MX = 760; // Morgan on his chair
const R008: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const mp: Pose = reach(reach({...SIT, lean: 14, head: 12}, 'F', [118, -66], 1), 'B', [104, -54], 1);
	const cam = usePush(camOn(1000, 560, 1.15), camOn(960, 540, 1.4));
	return (
		<AbsoluteFill style={{filter: 'sepia(0.85) contrast(1.05)'}}>
			<Stage cam={cam} bg="#3a2a18" light={{x: 75, y: 10, o: 0.45, c: '255,240,200'}}>
				<Layer depth={1.4}>
					<Lab1898 />
				</Layer>
				<Layer depth={1}>
					<Svg>
						<OldChair x={MX - 6} />
						<Actor who="morgan" x={MX} floor={FL} seat={SEAT} s={HS} facing={1} faceTurn={0.6} look={[0.8, 0.4]} pose={mp} uid="morgan-008" />
						<OldDesk x={1040} />
					</Svg>
					<Prop3D
						x={760}
						y={420}
						w={520}
						h={340}
						make={() => {
							const scene = propScene();
							const mic = makeMicroscope();
							at(mic, 930, DESK_TOP, 0);
							mic.rotation.y = -0.4;
							mic.scale.setScalar(0.95);
							const dish = makeDish();
							at(dish, 1130, DESK_TOP, 0);
							dish.rotation.x = 0.3;
							scene.add(mic, dish);
							return {scene};
						}}
					/>
					<Svg>
						<Tag f={f} t={w('008', 0.04)} x={600} y={250} text="1898" c="#2a1a0e" fg="#fff4d8" stroke="#fff4d8" size={48} rot={-4} />
						<Tag f={f} t={w('008', 0.14)} x={1280} y={300} text="THOMAS HUNT MORGAN" c="#2a1a0e" fg="#fff4d8" stroke="#fff4d8" size={32} rot={3} />
					</Svg>
					<OldFilm f={gf} />
				</Layer>
			</Stage>
		</AbsoluteFill>
	);
};
/* the microscope view: the worm is cut into pieces; a 1/279 sliver grows into a new worm */
const Worm: React.FC<{len?: number; c?: string}> = ({len = 1, c = '#8a6a4a'}) => (
	<g transform={`scale(${len},${len})`}>
		<path d="M-300,0 q60,-70 240,-62 q170,8 250,40 q40,22 0,44 q-80,32 -250,40 q-180,8 -240,-62 z" fill={c} stroke="#2a1a0e" strokeWidth={8 / len} />
		<path d="M-270,-10 q-30,-30 -10,-50 M-270,10 q-30,30 -10,50" stroke={c} strokeWidth={14 / len} fill="none" strokeLinecap="round" />
		<circle cx={-236} cy={-16} r={9} fill="#fff4d8" stroke="#2a1a0e" strokeWidth={3} />
		<circle cx={-236} cy={16} r={9} fill="#fff4d8" stroke="#2a1a0e" strokeWidth={3} />
		<circle cx={-232} cy={-16} r={4} fill="#2a1a0e" />
		<circle cx={-232} cy={16} r={4} fill="#2a1a0e" />
	</g>
);
const R008b: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const cut = interpolate(f, [w('008', 0.42), w('008', 0.56)], [0, 1], clamp);
	const spread = interpolate(f, [w('008', 0.52), w('008', 0.62)], [0, 1], clamp);
	const focus = interpolate(f, [w('008', 0.62), w('008', 0.7)], [0, 1], clamp);
	const grow = interpolate(f, [w('008', 0.74), w('008', 0.98)], [0, 1], clamp);
	const N = 9;
	return (
		<AbsoluteFill style={{filter: 'sepia(0.85) contrast(1.05)'}}>
			<Board tint="#3a2a18">
				<circle cx={960} cy={540} r={470} fill="#d8c8a0" stroke="#2a1a0e" strokeWidth={24} />
				<circle cx={960} cy={540} r={470} fill="none" stroke="#5a4028" strokeWidth={6} opacity={0.6} />
				<g transform="translate(960,540)">
					{grow <= 0 && spread <= 0 ? <Worm /> : null}
					{grow <= 0 && spread > 0
						? Array.from({length: N}).map((_, i) => {
								const xc = -300 + ((i + 0.5) * 600) / N;
								const h = 128 - 70 * Math.pow(Math.abs(xc + 10) / 300, 2);
								const dx = (i - (N - 1) / 2) * 34 * spread;
								const dy = Math.sin(i * 1.7) * 40 * spread;
								const fade = i === 4 ? 1 : 1 - 0.75 * focus;
								return (
									<g key={i} opacity={fade} transform={`translate(${xc + dx},${dy}) rotate(${Math.sin(i * 2.3) * 25 * spread})`}>
										<rect x={-600 / N / 2 + 4} y={-h / 2} width={600 / N - 8} height={h} rx={22} fill="#8a6a4a" stroke="#2a1a0e" strokeWidth={7} />
									</g>
								);
							})
						: null}
					{cut > 0 && spread < 0.2
						? Array.from({length: N - 1}).map((_, i) => {
								const x = -300 + ((i + 1) * 600) / N;
								const k = Math.min(1, Math.max(0, cut * (N - 1) - i));
								return <line key={i} x1={x} y1={-110} x2={x} y2={-110 + 220 * k} stroke="#fff4d8" strokeWidth={6} strokeDasharray="14 10" />;
							})
						: null}
					{grow > 0 ? (
						<g transform={`translate(${-300 + (4.5 * 600) / N},${Math.sin(4 * 1.7) * 40})`}>
							<Worm len={0.12 + 0.6 * grow} />
						</g>
					) : null}
					{focus > 0 && grow <= 0 ? <circle cx={-300 + (4.5 * 600) / N} cy={Math.sin(4 * 1.7) * 40} r={70} fill="none" stroke="#ffd34a" strokeWidth={8} opacity={focus} /> : null}
				</g>
				<Tag f={f} t={w('008', 0.64)} x={1500} y={220} text="1/279" c="#2a1a0e" fg="#ffd34a" stroke="#ffd34a" size={70} rot={5} />
				<Tag f={f} t={w('008', 0.86)} x={480} y={880} text="A WHOLE NEW WORM" c="#2a1a0e" fg="#fff4d8" stroke="#fff4d8" size={40} rot={-4} />
				<OldFilm f={gf} />
			</Board>
		</AbsoluteFill>
	);
};

/* ================================ 009 «Today, that's you. Only you're a doctor.» ================================ */
const R009: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const cam = usePush(camOn(960, 560, 1.3), camOn(960, 520, 1.45));
	const hp = gesture('presentF', idle(gf, 2), env(f, 4, 1e9, 8, 1), f);
	return (
		<Stage cam={cam} bg="#1a2a6a" light={{x: 50, y: 20, o: 0.5}}>
			<Layer depth={1.3}>
				<Svg>
					<rect x={-400} y={-300} width={2800} height={1600} fill="#1d2a6a" />
					{Array.from({length: 24}).map((_, i) => {
						const a0 = (i / 24) * Math.PI * 2 + f / 200;
						const a1 = ((i + 0.5) / 24) * Math.PI * 2 + f / 200;
						return <polygon key={i} points={`960,540 ${960 + Math.cos(a0) * 2400},${540 + Math.sin(a0) * 2400} ${960 + Math.cos(a1) * 2400},${540 + Math.sin(a1) * 2400}`} fill="#26358a" />;
					})}
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<ellipse cx={960} cy={FL + 4} rx={160} ry={20} fill="#000" opacity={0.25} />
					<Actor who="hero" x={960} floor={FL} s={HS} facing={1} faceTurn={0.15} look={[0.1, -0.1]} mouth="smile" pose={hp} uid="h-009" />
					<HeroBadge x={960} y={badgeY(FL)} s={0.8} />
					<Tag f={f} t={w('009', 0.05)} x={640} y={400} text="THAT'S YOU" c="#11142c" fg="#ffd34a" size={44} rot={-5} />
					<Tag f={f} t={w('009', 0.5)} x={1300} y={460} text="DOCTOR" c="#3a1d2a" fg="#fff" stroke="#d23b3b" size={44} rot={4} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* ================================ 010–014 experiments in the lab ================================ */
const SX = 760; // hero on the stool
const RX = 1260; // Dr. Reyes behind the bench
const NOTE: [number, number] = [880, BENCH_TOP];
const ARM: [number, number] = [905, BENCH_TOP - 12]; // where his forearm rests on the bench
const LabBG: React.FC<{f: number}> = ({f}) => (
	<Layer depth={1.4}>
		<DayLab f={f} />
	</Layer>
);
const seatedHero = (gf: number, lean = 8): Pose => ({...SIT, lean, head: 4, armB: [30, 60], armF: [40, 60]});

/* a hand-held tool whose TIP sits exactly on point P (screen px, y down), pointing at screen angle th (deg).
   Returns where the fingers hold it (grip). Tools are modelled along +x with the tip at +tipX. */
export const gripOf = (tipX: number, gripX: number, P: [number, number], th: number, s: number): [number, number] => {
	const r = (th * Math.PI) / 180;
	return [P[0] + (gripX - tipX) * s * Math.cos(r), P[1] + (gripX - tipX) * s * Math.sin(r)];
};
export const placeTool = (o: THREE.Object3D, tipX: number, gripX: number, P: [number, number], th: number, s: number, z = 80): [number, number] => {
	const r = (th * Math.PI) / 180;
	const c: [number, number] = [P[0] - tipX * s * Math.cos(r), P[1] - tipX * s * Math.sin(r)];
	o.scale.setScalar(s);
	at(o, c[0], c[1], z);
	o.rotation.set(0.25, 0, -r);
	return gripOf(tipX, gripX, P, th, s);
};
/* Reyes's gloved hand at the grip; her navy sleeve runs off the frame toward `from` */
export const Glove: React.FC<{g: [number, number]; from: [number, number]; s?: number}> = ({g, from, s = 1}) => {
	const a = Math.atan2(from[1] - g[1], from[0] - g[0]);
	const wx = g[0] + Math.cos(a) * 70 * s;
	const wy = g[1] + Math.sin(a) * 70 * s;
	return (
		<g>
			<line x1={wx} y1={wy} x2={from[0]} y2={from[1]} stroke="#2a1a14" strokeWidth={84 * s} strokeLinecap="round" />
			<line x1={wx} y1={wy} x2={from[0]} y2={from[1]} stroke="#3d5fb0" strokeWidth={70 * s} strokeLinecap="round" />
			<line x1={g[0] + Math.cos(a) * 30 * s} y1={g[1] + Math.sin(a) * 30 * s} x2={wx} y2={wy} stroke="#2a1a14" strokeWidth={66 * s} strokeLinecap="round" />
			<line x1={g[0] + Math.cos(a) * 30 * s} y1={g[1] + Math.sin(a) * 30 * s} x2={wx} y2={wy} stroke="#7ab0e8" strokeWidth={54 * s} strokeLinecap="round" />
			<circle cx={g[0]} cy={g[1]} r={38 * s} fill="#7ab0e8" stroke="#2a1a14" strokeWidth={7 * s} />
			{/* curled fingers over the tool + thumb */}
			{[-1, 0, 1].map((k) => (
				<ellipse key={k} cx={g[0] - Math.cos(a) * 22 * s + Math.cos(a + Math.PI / 2) * k * 18 * s} cy={g[1] - Math.sin(a) * 22 * s + Math.sin(a + Math.PI / 2) * k * 18 * s} rx={14 * s} ry={11 * s} fill="#8abcf0" stroke="#2a1a14" strokeWidth={5 * s} />
			))}
			<ellipse cx={g[0] + Math.cos(a - 1.2) * 34 * s} cy={g[1] + Math.sin(a - 1.2) * 34 * s} rx={20 * s} ry={13 * s} fill="#8abcf0" stroke="#2a1a14" strokeWidth={5 * s} transform={`rotate(${(a * 180) / Math.PI} ${g[0] + Math.cos(a - 1.2) * 34 * s} ${g[1] + Math.sin(a - 1.2) * 34 * s})`} />
		</g>
	);
};
/* the hero's own hand (peach) holding a pen, white sleeve running off the frame */
export const PenHand: React.FC<{g: [number, number]; from: [number, number]}> = ({g, from}) => {
	const a = Math.atan2(from[1] - g[1], from[0] - g[0]);
	const wx = g[0] + Math.cos(a) * 80;
	const wy = g[1] + Math.sin(a) * 80;
	return (
		<g>
			<line x1={wx} y1={wy} x2={from[0]} y2={from[1]} stroke="#2a1a14" strokeWidth={104} strokeLinecap="round" />
			<line x1={wx} y1={wy} x2={from[0]} y2={from[1]} stroke="#eef2f8" strokeWidth={90} strokeLinecap="round" />
			<line x1={g[0]} y1={g[1]} x2={wx} y2={wy} stroke="#2a1a14" strokeWidth={72} strokeLinecap="round" />
			<line x1={g[0]} y1={g[1]} x2={wx} y2={wy} stroke="#f2c9a5" strokeWidth={60} strokeLinecap="round" />
			<circle cx={g[0]} cy={g[1]} r={40} fill="#f2c9a5" stroke="#2a1a14" strokeWidth={7} />
			{[-1, 0, 1].map((k) => (
				<ellipse key={k} cx={g[0] - Math.cos(a) * 26 + Math.cos(a + Math.PI / 2) * k * 19} cy={g[1] - Math.sin(a) * 26 + Math.sin(a + Math.PI / 2) * k * 19} rx={15} ry={12} fill="#f6d2b2" stroke="#2a1a14" strokeWidth={5} />
			))}
			{[[-14, 6], [10, -10]].map(([x, y], i) => (
				<circle key={i} cx={g[0] + x} cy={g[1] + y} r={3} fill="#c07a50" />
			))}
		</g>
	);
};

/* the handwriting font must be in before the notebook page is painted */
const useCaveat = () => {
	const q = "700 40px 'Caveat'";
	const [ok, setOk] = React.useState(() => document.fonts.check(q));
	const [h] = React.useState(() => (ok ? null : delayRender('caveat', {timeoutInMilliseconds: 30000})));
	React.useEffect(() => {
		if (ok || h === null) return;
		document.fonts.load(q).then(
			() => {
				setOk(true);
				continueRender(h);
			},
			() => continueRender(h),
		);
	}, [ok, h]);
	return ok;
};
/* 010 he takes the pen and writes — in the wide the tip is on the page */
const PEN_TIP = 47; // pen model: tip at +47
const R010: React.FC = () => {
	useCaveat();
	const {f, gf} = useShot();
	const w = useW();
	const take = interpolate(f, [w('010', 0.12), w('010', 0.3)], [0, 1], clamp);
	const writing = f >= w('010', 0.3);
	const k = interpolate(f, [w('010', 0.32), w('010', 0.6)], [0, 0.35], clamp);
	// tip on the page: moves along a line while writing, small up-down strokes
	const tip: [number, number] = writing ? [NOTE[0] - 40 + 70 * ((k * 3) % 1), BENCH_TOP - 4 - Math.abs(Math.sin(f / 2.2)) * 3] : [NOTE[0] + 40, BENCH_TOP - 4];
	const th = 62; // pen leaning, tip down-right
	const r = (th * Math.PI) / 180;
	const grip: [number, number] = [tip[0] - (PEN_TIP + 18) * Math.cos(r), tip[1] - (PEN_TIP + 18) * Math.sin(r)];
	const restHand: [number, number] = [SX + 60, SEAT - 40];
	const hand: [number, number] = take < 1 && !writing ? [restHand[0] + (grip[0] - restHand[0]) * take, restHand[1] + (grip[1] - restHand[1]) * take] : grip;
	const hp = reach({...seatedHero(gf, 14), head: 14}, 'F', [hand[0] - SX, hand[1] - SEAT], 1);
	const rp = gesture('armsCrossed', idle(gf, 6), 1, f);
	const cam = usePush(camOn(960, 620, 1.35), camOn(900, 640, 1.6, {farBlur: 7}));
	return (
		<Stage cam={cam} bg="#cfe8de" light={{x: 75, y: 10, o: 0.45, c: '255,250,230'}}>
			<LabBG f={gf} />
			<Layer depth={1}>
				<Svg>
					<Stool x={SX - 6} />
					<Actor who="reyes" x={RX} floor={FL} s={0.98} facing={-1} faceTurn={0.4} look={[-0.6, 0.3]} pose={rp} uid="reyes-010" />
					<Actor who="hero" x={SX} floor={FL} seat={SEAT} s={HS} facing={1} faceTurn={0.5} look={[0.5, 0.9]} mouth="smile" pose={hp} uid="h-010" />
					<Bench x={1060} />
				</Svg>
				<Prop3D
					x={700}
					y={560}
					w={720}
					h={240}
					make={() => {
						const scene = propScene();
						const nb = makeNotebook();
						at(nb, NOTE[0], NOTE[1], 0);
						nb.scale.setScalar(0.62);
						nb.rotation.x = 0.4;
						const pen = makePen();
						const tape = makeTape();
						at(tape, 1240, BENCH_TOP, 0);
						const dish = makeDish();
						at(dish, 1120, BENCH_TOP, 0);
						dish.rotation.x = 0.3;
						scene.add(nb, pen, tape, dish);
						return {scene, nb, pen};
					}}
					update={(wd) => {
						(wd.nb as Notebook).userData.write(k);
						if (take <= 0) {
							at(wd.pen, NOTE[0] + 40, BENCH_TOP - 3, 60);
							wd.pen.rotation.set(0.25, 0, 0);
						} else if (!writing) {
							// carried in the fist, tip down
							placeTool(wd.pen, PEN_TIP, -18, [hand[0] + (PEN_TIP + 18) * Math.cos(r), hand[1] + (PEN_TIP + 18) * Math.sin(r)], th, 1, 60);
						} else placeTool(wd.pen, PEN_TIP, -18, tip, th, 1, 60);
					}}
				/>
				<Svg>
					<HeroBadge x={SX} y={SEAT - 164 - 118} s={0.8} />
				</Svg>
			</Layer>
		</Stage>
	);
};
/* 010b the page from above: his hand writes Day 1 / Test subject: ME / Skin sample, arm */
const NB_C: [number, number] = [930, 560];
const NB_S = 3.2;
const R010b: React.FC = () => {
	useCaveat();
	const {f, gf} = useShot();
	const w = useW();
	const k = interpolate(f, [0, w('010', 1)], [0.35, 1], clamp);
	const [u, v] = noteTipAt(k);
	const tip: [number, number] = [NB_C[0] + (u / 512 - 0.5) * 232 * NB_S, NB_C[1] + (v / 320 - 0.5) * 150 * NB_S - 4 + Math.sin(f / 1.7) * 3];
	const grip = gripOf(PEN_TIP, -18, tip, -52, NB_S * 0.9);
	const cam = usePush(camOn(960, 560, 1.0), camOn(980, 560, 1.06));
	return (
		<Stage cam={cam} bg="#33475a" light={{x: 70, y: 0, o: 0.4, c: '255,250,230'}}>
			<Layer depth={1}>
				<Svg>
					<rect x={-400} y={-300} width={2800} height={1600} fill="#3a4e62" />
					{Array.from({length: 9}).map((_, i) => (
						<line key={i} x1={-400} y1={-100 + i * 150} x2={2400} y2={-60 + i * 150} stroke="#33475a" strokeWidth={4} />
					))}
				</Svg>
				<Prop3D
					x={0}
					y={0}
					w={1920}
					h={1080}
					make={() => {
						const scene = propScene(2.0);
						const nb = makeNotebook();
						nb.scale.setScalar(NB_S);
						nb.rotation.set(Math.PI / 2 - 0.05, 0, -0.06);
						at(nb, NB_C[0], NB_C[1], 0);
						const pen = makePen();
						scene.add(nb, pen);
						return {scene, nb, pen};
					}}
					update={(wd) => {
						(wd.nb as Notebook).userData.write(k);
						placeTool(wd.pen, PEN_TIP, -18, tip, -52, NB_S * 0.9, 200);
					}}
				/>
				<Svg>
					<PenHand g={grip} from={[-200, 1400]} />
				</Svg>
			</Layer>
			<Over>
				<Tag f={f} t={w('010', 0.62)} x={420} y={140} text="EXPERIMENT #1" c="#11142c" fg="#ffd34a" size={40} rot={-4} />
			</Over>
		</Stage>
	);
	void gf;
};

/* ---------- the arm on the bench, close: Reyes's gloved hand works on it ---------- */
const AC: [number, number] = [880, 640]; // arm centre in the close-up
const AS = 1.25;
const WND: [number, number] = [AC[0] + 60 * AS, AC[1]]; // the wound spot
type Wound = {cut: number; stitches: number; thread?: [number, number] | null; scar?: boolean; clean?: number};
const ArmClose: React.FC<{wnd: Wound; children?: React.ReactNode; over?: React.ReactNode; props3d?: React.ReactNode}> = ({wnd, children, props3d}) => {
	const {gf} = useShot();
	const cam = usePush(camOn(980, 560, 1.0), camOn(990, 570, 1.08));
	const L = 70 * AS;
	return (
		<Stage cam={cam} bg="#33475a" light={{x: 70, y: 0, o: 0.4, c: '255,250,230'}}>
			<Layer depth={1.6}>
				<Svg>
					<rect x={-400} y={-300} width={2800} height={620} fill="#cfe8de" />
					<rect x={300} y={60} width={420} height={200} fill="#f4f6fa" opacity={0.7} />
					<rect x={1300} y={40} width={500} height={240} fill="#9fd8ff" opacity={0.7} />
					<circle cx={1450} cy={300} r={120} fill="#5ab06a" opacity={0.6} />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<rect x={-400} y={320} width={2800} height={1000} fill="#2a3a4a" />
					<rect x={-400} y={320} width={2800} height={16} fill="#3e5468" />
					<ellipse cx={AC[0] + 40} cy={AC[1] + 70} rx={560} ry={40} fill="#000" opacity={0.25} />
					<g transform={`translate(${AC[0]},${AC[1]}) scale(${AS})`}>
						<ArmInset state="clean" />
					</g>
					{/* the wound: a cut drawn from left to right, stitches, or a pale scar */}
					{wnd.cut > 0 && !wnd.scar ? <line x1={WND[0] - L} y1={WND[1]} x2={WND[0] - L + 2 * L * wnd.cut} y2={WND[1]} stroke="#e0607a" strokeWidth={14} strokeLinecap="round" opacity={1 - (wnd.clean ?? 0)} /> : null}
					{Array.from({length: wnd.stitches}).map((_, i) => {
						const x = WND[0] - L + 18 + i * ((2 * L - 36) / 3);
						return <line key={i} x1={x - 8} y1={WND[1] - 22} x2={x + 8} y2={WND[1] + 22} stroke="#1d2236" strokeWidth={6} strokeLinecap="round" />;
					})}
					{wnd.thread && wnd.stitches > 0 ? <path d={`M${WND[0] - L + 18 + (wnd.stitches - 1) * ((2 * L - 36) / 3) + 8},${WND[1] + 22} Q${(wnd.thread[0] + WND[0]) / 2 + 40},${WND[1] + 60} ${wnd.thread[0]},${wnd.thread[1]}`} stroke="#1d2236" strokeWidth={4} fill="none" /> : null}
				</Svg>
				{props3d}
				<Svg>{children}</Svg>
			</Layer>
		</Stage>
	);
	void gf;
};
const SLEEVE_FROM: [number, number] = [1900, -260];
/* 011 wide: he lays his forearm on the bench, Reyes comes over with a scalpel */
const R011: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const lay = interpolate(f, [2, 26], [0, 1], clamp);
	const hp = reach(seatedHero(gf, 10), 'F', [ARM[0] - SX, ARM[1] - SEAT], lay);
	const wk = walkTo(f, 4, 40, RX, 1030, 5, 0.3);
	const rh: [number, number] = [wk.x - 60, HIP - 40];
	const rp = reach(wk.moving ? wk.pose : idle(gf, 6), 'F', [wk.x - rh[0], rh[1] - HIP], 1);
	const cam = usePush(camOn(960, 600, 1.35), camOn(940, 610, 1.5));
	return (
		<Stage cam={cam} bg="#cfe8de" light={{x: 75, y: 10, o: 0.45, c: '255,250,230'}}>
			<LabBG f={gf} />
			<Layer depth={1}>
				<Svg>
					<Stool x={SX - 6} />
					<Actor who="reyes" x={wk.x} floor={FL} s={0.98} facing={-1} faceTurn={0.4} look={[-0.7, 0.4]} pose={rp} vx={wk.vx} bob={wk.bob} uid="reyes-011" />
					<Actor who="hero" x={SX} floor={FL} seat={SEAT} s={HS} facing={1} faceTurn={0.45} look={[0.6, 0.3]} expr="worried" pose={hp} uid="h-011" />
					<Bench x={1060} />
				</Svg>
				<Prop3D
					x={700}
					y={460}
					w={760}
					h={340}
					make={() => {
						const scene = propScene();
						const scalpel = makeScalpel();
						scene.add(scalpel);
						return {scene, scalpel};
					}}
					update={(wd) => {
						placeTool(wd.scalpel, 45, -20, [rh[0] - 50, rh[1] + 14], 165, 1.1, 60);
					}}
				/>
				<Svg>
					<HeroBadge x={SX} y={SEAT - 164 - 118} s={0.8} />
					<Tag f={f} t={8} x={1280} y={380} text="DR. REYES" c="#11142c" fg="#9fd8ff" stroke="#3d5fb0" size={40} rot={3} />
				</Svg>
			</Layer>
		</Stage>
	);
	void w;
};
/* 011b close: the scalpel cuts along the skin, then four stitches with needle and thread */
const R011b: React.FC = () => {
	const {f} = useShot();
	const w = useW();
	const L = 70 * AS;
	const inK = interpolate(f, [w('011', 0.26), w('011', 0.31)], [0, 1], {...clamp, easing: (k) => 1 - (1 - k) * (1 - k)});
	const cut = interpolate(f, [w('011', 0.31), w('011', 0.47)], [0, 1], clamp);
	const swapOut = interpolate(f, [w('011', 0.48), w('011', 0.52)], [0, 1], clamp);
	const swapIn = interpolate(f, [w('011', 0.52), w('011', 0.57)], [0, 1], clamp);
	const stitchPhase = interpolate(f, [w('011', 0.57), w('011', 0.95)], [0, 4], clamp);
	const useNeedle = f >= w('011', 0.52);
	const si = Math.min(3, Math.floor(stitchPhase));
	const sp = stitchPhase - si;
	const stitches = Math.min(4, Math.floor(stitchPhase + 0.5));
	const sx = WND[0] - L + 18 + si * ((2 * L - 36) / 3);
	// tip positions: scalpel slides along the cut; needle dips down into the skin and pulls up
	let tip: [number, number];
	if (!useNeedle) {
		const x = WND[0] - L + 2 * L * cut;
		tip = [x, WND[1] - 2];
		const away = Math.max(1 - inK, swapOut);
		tip = [tip[0] + away * 500, tip[1] - away * 420];
	} else {
		const dip = Math.sin(Math.min(1, sp) * Math.PI);
		tip = [sx + 10 - 4 * dip, WND[1] - 40 + 40 * dip];
		tip = [tip[0] + (1 - swapIn) * 500, tip[1] - (1 - swapIn) * 420];
	}
	const grip = useNeedle ? gripOf(48, -40, tip, 125, 2.6) : gripOf(45, -20, tip, 130, 3.0);
	return (
		<ArmClose
			wnd={{cut, stitches: useNeedle ? stitches : 0, thread: useNeedle ? tip : null}}
			props3d={
				<Prop3D
					x={0}
					y={0}
					w={1920}
					h={1080}
					make={() => {
						const scene = propScene(2.0);
						const scalpel = makeScalpel();
						const needle = makeNeedleHolder();
						scene.add(scalpel, needle);
						return {scene, scalpel, needle};
					}}
					update={(wd) => {
						wd.scalpel.visible = !useNeedle;
						wd.needle.visible = useNeedle;
						if (useNeedle) placeTool(wd.needle, 48, -40, tip, 125, 2.6, 120);
						else placeTool(wd.scalpel, 45, -20, tip, 130, 3.0, 120);
					}}
				/>
			}
		>
			<Glove g={grip} from={SLEEVE_FROM} />
			<Tag f={f} t={w('011', 0.9)} x={1420} y={260} text="STITCHED" c="#11142c" fg="#fff" stroke="#ffd34a" size={44} rot={-3} />
		</ArmClose>
	);
};
/* 012 a week later: calendar pages fall and stay on the floor; the insert shows a scar */
const CAL = {x: 1640, y: 300};
type CalW = PropWorld & {pages: THREE.Mesh[]};
const makeCalWorld = (): CalW => {
	const scene = propScene();
	const cal = makeCalendar('MAY', 9);
	at(cal, CAL.x, CAL.y, 0);
	cal.scale.setScalar(0.9);
	scene.add(cal);
	const pages: THREE.Mesh[] = [];
	for (let i = 0; i < 7; i++) {
		const p = makePage(2 + i) as THREE.Mesh;
		p.scale.setScalar(0.76);
		scene.add(p);
		pages.push(p);
	}
	return {scene, pages};
};
const fallPage = (p: THREE.Mesh, f: number, t0: number, i: number) => {
	const t = f - t0;
	if (t < 0) {
		at(p, CAL.x, CAL.y - 14, 8 + i);
		p.rotation.set(0, 0, 0);
		return;
	}
	const vt = 7;
	const tau = 9;
	const fall = vt * t - vt * tau * (1 - Math.exp(-t / tau));
	const floorY = FL - 6 - (i % 3) * 4;
	const y = Math.min(floorY, CAL.y - 14 + fall);
	const landed = y >= floorY;
	const drift = (i % 2 ? 1 : -1) * (30 + i * 14) * (1 - Math.exp(-t / 20)) + Math.sin(t / 6 + i) * 16 * (landed ? 0 : 1);
	at(p, CAL.x + drift, y, 20 + i);
	p.rotation.set(landed ? -1.35 : Math.sin(t / 5 + i) * 0.6, Math.sin(t / 7) * 0.4 * (landed ? 0 : 1), landed ? (i % 2 ? 0.3 : -0.25) : Math.sin(t / 4 + i) * 0.8);
};
const R012: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const hp = reach(seatedHero(gf, 6), 'F', [ARM[0] - SX, ARM[1] - SEAT], 1);
	const cam = usePush(camOn(1260, 560, 1.15), camOn(1240, 560, 1.3));
	const scar = f >= w('012', 0.45);
	return (
		<>
			<Stage cam={cam} bg="#cfe8de" light={{x: 75, y: 10, o: 0.45, c: '255,250,230'}}>
				<LabBG f={gf} />
				<Layer depth={1}>
					<Prop3D x={1460} y={160} w={400} h={760} make={makeCalWorld} update={(wd, ff) => wd.pages.forEach((p, i) => fallPage(p, ff, 2 + i * 5, i))} />
					<Svg>
						<Stool x={SX - 6} />
						<Actor who="hero" x={SX} floor={FL} seat={SEAT} s={HS} facing={1} faceTurn={0.45} look={[0.6, 0.7]} expr={scar ? 'sad' : 'normal'} pose={hp} uid="h-012" />
						<Bench x={1060} />
						<HeroBadge x={SX} y={SEAT - 164 - 118} s={0.8} />
					</Svg>
				</Layer>
			</Stage>
			<Over>
				<Tag f={f} t={w('012', 0.05)} x={420} y={200} text="1 WEEK LATER" c="#11142c" fg="#ffd34a" size={40} rot={-4} />
				<Insert x={1060} y={330} r={210} k={pop(f, w('012', 0.4))} id="ins-012" bg="#e8f4ee" ring="#e8a090">
					<g transform="scale(0.55)">
						<ArmInset state="scar" />
					</g>
				</Insert>
				<Tag f={f} t={w('012', 0.62)} x={1060} y={580} text="SCAR" c="#3a1d2a" fg="#ffb0a0" stroke="#e8a090" size={40} rot={3} />
			</Over>
		</>
	);
};
/* 013 close: another cut, a bandage pressed on by her hand, 20 s on the timer, she peels it — skin is back */
const BAND_S = 2.2;
const R013: React.FC = () => {
	const {f} = useShot();
	const w = useW();
	const L = 70 * AS;
	const inK = interpolate(f, [w('013', 0.02), w('013', 0.07)], [0, 1], clamp);
	const cut = interpolate(f, [w('013', 0.07), w('013', 0.19)], [0, 1], clamp);
	const outK = interpolate(f, [w('013', 0.2), w('013', 0.25)], [0, 1], clamp);
	const bringK = interpolate(f, [w('013', 0.26), w('013', 0.35)], [0, 1], {...clamp, easing: (k) => 1 - (1 - k) * (1 - k)});
	const leaveK = interpolate(f, [w('013', 0.37), w('013', 0.43)], [0, 1], clamp);
	const backK = interpolate(f, [w('013', 0.74), w('013', 0.79)], [0, 1], clamp);
	const peelK = interpolate(f, [w('013', 0.8), w('013', 0.88)], [0, 1], {...clamp, easing: (k) => k * k});
	const secs = Math.round(interpolate(f, [w('013', 0.43), w('013', 0.73)], [0, 20], clamp));
	const healed = f >= w('013', 0.8);
	const glow = env(f, w('013', 0.84), w('013', 0.99), 4, 10);
	const scalpelOn = f < w('013', 0.25);
	// scalpel tip
	const away = Math.max(1 - inK, outK);
	const sTip: [number, number] = [WND[0] - L + 2 * L * cut + away * 500, WND[1] - 2 - away * 420];
	// bandage: carried in from top-right, pressed on the wound, later peeled off by its right end
	const onArm: [number, number] = [WND[0], WND[1] - 4];
	const offP: [number, number] = [onArm[0] + 520, onArm[1] - 440];
	let band: [number, number] = onArm;
	let bandRot = 0;
	let bandVis = f >= w('013', 0.26);
	if (f < w('013', 0.35)) band = [offP[0] + (onArm[0] - offP[0]) * bringK, offP[1] + (onArm[1] - offP[1]) * bringK];
	else if (f >= w('013', 0.8)) {
		band = [onArm[0] + 40 * peelK + (offP[0] - onArm[0]) * peelK * peelK, onArm[1] - 30 * peelK + (offP[1] - onArm[1]) * peelK * peelK];
		bandRot = -0.6 * peelK;
		bandVis = peelK < 0.98;
	}
	const bandEnd: [number, number] = [band[0] + 62 * BAND_S * Math.cos(bandRot), band[1] + 62 * BAND_S * Math.sin(bandRot)];
	// where the glove is
	let glove: [number, number] | null = null;
	if (scalpelOn) glove = gripOf(45, -20, sTip, 130, 3.0);
	else if (f < w('013', 0.37)) glove = bandEnd;
	else if (f < w('013', 0.43)) glove = [bandEnd[0] + leaveK * 500, bandEnd[1] - leaveK * 420];
	else if (f >= w('013', 0.74) && f < w('013', 0.8)) glove = [bandEnd[0] + (1 - backK) * 500, bandEnd[1] - (1 - backK) * 420];
	else if (f >= w('013', 0.8)) glove = bandEnd;
	return (
		<ArmClose
			wnd={{cut: healed ? 0 : cut, stitches: 0}}
			props3d={
				<Prop3D
					x={0}
					y={0}
					w={1920}
					h={1080}
					make={() => {
						const scene = propScene(2.0);
						const scalpel = makeScalpel();
						const band = makeBandage();
						band.scale.setScalar(BAND_S);
						const timer = makeTimer();
						timer.scale.setScalar(1.3);
						at(timer, 1540, 820, 0);
						timer.rotation.set(-0.35, -0.25, 0);
						scene.add(scalpel, band, timer);
						return {scene, scalpel, band, timer};
					}}
					update={(wd) => {
						wd.scalpel.visible = scalpelOn;
						placeTool(wd.scalpel, 45, -20, sTip, 130, 3.0, 120);
						wd.band.visible = bandVis;
						at(wd.band, band[0], band[1], 60);
						wd.band.rotation.set(Math.PI / 2 - 0.15, 0, -bandRot);
						(wd.timer as Timer).userData.set(`00:${String(secs).padStart(2, '0')}`, '#7af0a8');
					}}
				/>
			}
		>
			{glove ? <Glove g={glove} from={SLEEVE_FROM} /> : null}
			{glow > 0
				? Array.from({length: 10}).map((_, i) => {
						const a = (i / 10) * Math.PI * 2;
						const d = 90 + 50 * glow;
						return <path key={i} d={`M${WND[0] + Math.cos(a) * d},${WND[1] + Math.sin(a) * d * 0.6} l0,-14 l4,10 l10,4 l-10,4 l-4,10 l-4,-10 l-10,-4 l10,-4 z`} fill="#fff4b0" opacity={glow} />;
					})
				: null}
			<Tag f={f} t={w('013', 0.36)} x={1420} y={260} text="LEFT OPEN" c="#11142c" fg="#fff" stroke="#9fd8ff" size={40} rot={-3} until={w('013', 0.78)} />
			<Tag f={f} t={w('013', 0.86)} x={1420} y={260} text="SKIN IS BACK" c="#0e3a22" fg="#7af0a8" stroke="#7af0a8" size={44} rot={3} />
		</ArmClose>
	);
};
/* 013b wide: he looks at his arm and grins; the counter goes +1 */
const R013b: React.FC = () => {
	const {f, gf} = useShot();
	const hp = reach(seatedHero(gf, 8), 'F', [ARM[0] - 20 - SX, ARM[1] - 60 - SEAT], 1);
	const rp = gesture('armsCrossed', idle(gf, 6), 1, f);
	const cam = usePush(camOn(900, 600, 1.45), camOn(880, 590, 1.6));
	return (
		<Stage cam={cam} bg="#cfe8de" light={{x: 75, y: 10, o: 0.45, c: '255,250,230'}}>
			<LabBG f={gf} />
			<Layer depth={1}>
				<Svg>
					<Stool x={SX - 6} />
					<Actor who="reyes" x={1030} floor={FL} s={0.98} facing={-1} faceTurn={0.4} look={[-0.7, 0.3]} expr="wide" mouth="open" pose={rp} uid="reyes-013b" />
					<Actor who="hero" x={SX} floor={FL} seat={SEAT} s={HS} facing={1} faceTurn={0.45} look={[0.5, 0.4]} mouth="smile" pose={hp} uid="h-013b" />
					<Bench x={1060} />
					<HeroBadge x={SX} y={SEAT - 164 - 118} s={0.8} />
				</Svg>
			</Layer>
		</Stage>
	);
};
/* 014 RULE #1: stitched → scar, open → regrows (the hero presents the card) */
const R014: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const strike = interpolate(f, [w('014', 0.15), w('014', 0.35)], [0, 1], clamp);
	return (
		<Board tint="#1a2a5a">
			<g transform={`translate(960,140) scale(${pop(f, 2)})`}>
				<text textAnchor="middle" y={30} fontSize={96} fontFamily={FONT} fontWeight={900} fill="#ffd34a" stroke="#11142c" strokeWidth={10} paintOrder="stroke">
					RULE #1
				</text>
			</g>
			{/* left: needle and thread → scar */}
			<g transform={`translate(560,520) scale(${pop(f, w('014', 0.1))})`}>
				<rect x={-300} y={-220} width={600} height={440} rx={40} fill="#11142c" stroke="#e8a090" strokeWidth={8} />
				<path d="M-160,-80 q60,-90 140,-30" stroke="#c8ccd8" strokeWidth={14} fill="none" strokeLinecap="round" />
				<path d="M-20,-110 q80,-20 150,60" stroke="#e8e8f0" strokeWidth={4} fill="none" strokeDasharray="10 8" />
				<line x1={-120} y1={40} x2={120} y2={40} stroke="#c06070" strokeWidth={12} strokeLinecap="round" />
				{[-80, -30, 20, 70].map((x) => (
					<line key={x} x1={x} y1={18} x2={x + 14} y2={62} stroke="#e8e8f0" strokeWidth={8} strokeLinecap="round" />
				))}
				<text y={170} textAnchor="middle" fontSize={56} fontFamily={FONT} fontWeight={900} fill="#ffb0a0">
					STITCHED = SCAR
				</text>
			</g>
			{/* right: bandage → regrows */}
			<g transform={`translate(1360,520) scale(${pop(f, w('014', 0.45))})`}>
				<rect x={-300} y={-220} width={600} height={440} rx={40} fill="#11142c" stroke="#7af0a8" strokeWidth={8} />
				<rect x={-130} y={-90} width={260} height={130} rx={20} fill="#fbfaf2" stroke="#2a1a14" strokeWidth={6} />
				<rect x={-50} y={-62} width={100} height={74} rx={10} fill="#f0e8d8" />
				{[-1, 1].map((s) => (
					<path key={s} d={`M${s * 170},-30 l${s * 30},-30 M${s * 180},10 l${s * 40},0`} stroke="#fff4b0" strokeWidth={8} strokeLinecap="round" />
				))}
				<text y={170} textAnchor="middle" fontSize={56} fontFamily={FONT} fontWeight={900} fill="#7af0a8">
					OPEN = REGROWS
				</text>
			</g>
			{strike > 0 ? null : null}
			<g transform="translate(960,1000)">
				<ellipse rx={110} ry={16} fill="#000" opacity={0.3} />
			</g>
			<Actor who="hero" x={960} floor={1000} s={0.62} facing={1} faceTurn={0.2} look={[0.3, -0.4]} mouth="smile" pose={gesture('point', idle(gf, 2), env(f, w('014', 0.4), 1e9, 8, 1), f)} uid="h-014" />
		</Board>
	);
};

export const SHOTS_R1: ShotDef[] = [
	{at: '001', C: R001},
	{at: '002', C: R002},
	{at: '003', C: R003},
	{at: '004', C: R004, whip: true},
	{at: '005', C: R005, whip: true},
	{at: '006', C: R006, whip: true},
	{at: '007', C: R007, whip: true},
	{at: '007', off: 156, C: R007b},
	{at: '008', C: R008, whip: true},
	{at: '008', off: 132, C: R008b},
	{at: '009', C: R009, whip: true},
	{at: '010', C: R010, whip: true},
	{at: '010', off: 76, C: R010b},
	{at: '011', C: R011},
	{at: '011', off: 58, C: R011b},
	{at: '012', C: R012},
	{at: '013', C: R013},
	{at: '013', off: 166, C: R013b},
	{at: '014', C: R014, whip: true},
];

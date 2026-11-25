import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {Pose} from '../engine/Stickman';
import {SIT, blend, env, gesture, idle, reach} from '../kit/actions';
import {Actor, useShot} from '../kit/core';
import type {ShotDef} from '../kit/coverage';
import {Layer, Stage, Svg, camOn, clamp, usePush} from '../kit/kit';
import {Board, FONT} from '../kit/ui';
import {Onoma} from '../reference/PauseTime';
import {Prop3D, at, propScene} from '../three/Prop3D';
import {makeCandle, flicker} from '../three/props';
import {Bait, Jar, MUSKET_TIP, makeBread, makeCanoe, makeCoffin, makeDocBag, makeGravestone, makeJar, makeLeaf, makeMagnifier, makeMeat, makeMusket, makePaddle, makeShovel} from '../three/beaumont';
import {FL, HS} from './common';
import {Lying, pop, useW} from './lib';
import {SEAT, SeatChair} from './places';
import {COT_TOP, Cot, Desk, FurStore, GRAVE_Y, Graveyard, LakeShore, STUDY_TOP, Study, Surgery, WATER_Y} from './placesSM';
import {HIP, Over, Tag, useFont} from './partR1';
import TL from './timeline.json';

/* "The man with a window in his stomach" — daily short. Doctor ROO plays Dr. William Beaumont,
   Alexis St. Martin is a young voyageur in a red tuque and a blue shirt. Made in 16:9 and cropped
   to 9:16 around each shot's focus: everything important stays within ±300 px (screen) of it. */

const kk = (x: number, a: number, b: number) => Math.max(0, Math.min(1, (x - a) / (b - a)));
const lerp2 = (a: [number, number], b: [number, number], k: number): [number, number] => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
/* reach target in an actor's local space (facing, scale) */
const loc = (x: number, oy: number, t: [number, number], facing: 1 | -1, s = 1): [number, number] => [((t[0] - x) * facing) / s, (t[1] - oy) / s];
const STOMACH = 'M-60,-150 Q60,-200 130,-90 Q190,20 120,120 Q40,200 -60,170 Q-150,140 -150,60 Q-150,10 -80,10 Q-20,10 -20,-40 Q-20,-90 -60,-150 Z';

/* the healed opening on his side: a pink patch with a dark hole */
const Hole: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<ellipse rx={17} ry={15} fill="#f0b0a0" stroke="#2a1a14" strokeWidth={3} />
		<ellipse rx={8} ry={7} fill="#5a1a22" />
	</g>
);

/* ================================ 001 the musket goes off ================================ */
const S001: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const TX = 700;
	const SX = 1065;
	const fire = w('001', 0.36);
	const fall = kk(f, fire + 2, fire + 16);
	const fallE = fall * fall * (3 - 2 * fall);
	const flashK = interpolate(f, [fire, fire + 1, fire + 7], [0, 1, 0], clamp);
	const grip: [number, number] = [TX + 60, HIP - 40];
	const kick = f > fire ? Math.exp(-(f - fire) / 4) * 0.25 : 0;
	const th = 0.04 + kick;
	const fore: [number, number] = [grip[0] + Math.cos(th) * 120, grip[1] - Math.sin(th) * 120];
	let tp = reach(idle(gf, 3), 'F', loc(TX, HIP, grip, 1), 1);
	tp = reach(tp, 'B', loc(TX, HIP, fore, 1), 1);
	const muzzle: [number, number] = [grip[0] + Math.cos(th) * MUSKET_TIP, grip[1] - Math.sin(th) * MUSKET_TIP - 12];
	const smoke = f > fire ? kk(f, fire, fire + 40) : 0;
	const cam = usePush(camOn(890, 620, 1.05), camOn(890, 630, 1.14));
	const down: Pose = {...SIT, lean: -16, head: 8, legB: [72, 22], legF: [84, 12], armB: [-40, 40]};
	const sp = reach(blend(idle(gf, 5), down, fallE), 'F', [16, -46], fallE);
	const seatY = HIP + (FL - 30 - HIP) * fallE;
	return (
		<Stage cam={cam} bg="#7a4e2a" light={{x: 70, y: 0, o: 0.45, c: '255,220,170'}}>
			<Layer depth={1.4}>
				<FurStore f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="trader" x={TX} floor={FL} s={HS} facing={1} faceTurn={0.4} look={f > fire ? [0.7, 0.2] : [-0.3, 0]} expr={f > fire ? 'wide' : 'normal'} mouth={f > fire ? 'open' : 'smile'} pose={tp} uid="tr-001" />
					<Actor who="stmartin" x={SX} floor={FL} seat={seatY} s={HS} facing={-1} faceTurn={0.4} look={[-0.6, 0.1]} expr={f > fire ? 'wide' : 'normal'} mouth={f > fire ? 'open' : 'smile'} pose={sp} uid="sm-001" />
				</Svg>
				<Prop3D
					x={700}
					y={560}
					w={500}
					h={260}
					make={() => {
						const scene = propScene();
						const m = makeMusket();
						scene.add(m);
						return {scene, m};
					}}
					update={(wd) => {
						at(wd.m, grip[0], grip[1], 60);
						wd.m.rotation.set(0, 0, th);
					}}
				/>
				<Svg>
					{flashK > 0 ? (
						<g transform={`translate(${muzzle[0]},${muzzle[1]})`} opacity={flashK}>
							<polygon points="0,-46 14,-14 52,0 14,14 0,46 -14,14 -40,0 -14,-14" fill="#ffe08a" />
							<circle r={20} fill="#fffbe0" />
						</g>
					) : null}
					{smoke > 0 && smoke < 1
						? [0, 1, 2, 3].map((i) => (
								<circle key={i} cx={muzzle[0] + 10 + i * 18 * smoke} cy={muzzle[1] - 20 * smoke - i * 14 * smoke} r={16 + 30 * smoke + i * 4} fill="#e8e4dc" opacity={0.75 * (1 - smoke)} />
							))
						: null}
					{f > fire && f < fire + 30 ? <Onoma x={900} y={470} text="BANG!" t={f - fire + 2} c="#ffd34a" size={72} rot={-6} /> : null}
				</Svg>
			</Layer>
			<Over>
				<Tag f={f} t={w('001', 0.04)} x={960} y={320} text="1822" c="#11142c" fg="#ffd34a" size={52} rot={-4} until={fire - 4} />
				<Tag f={f} t={w('001', 0.62)} x={960} y={920} text="SHOT IN THE STOMACH" c="#3a1d2a" fg="#ff9a8a" stroke="#ff6a5a" size={40} rot={-2} />
			</Over>
		</Stage>
	);
};

/* ================================ 002 the army doctor: he won't last the night ================================ */
const S002: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const RX = 1030;
	const candleHand: [number, number] = [RX - 60, HIP - 70];
	const rp = reach({...idle(gf, 2), head: 12, lean: 4}, 'F', loc(RX, HIP, candleHand, -1), 1);
	const cam = usePush(camOn(880, 620, 1.3), camOn(880, 640, 1.42));
	return (
		<Stage cam={cam} bg="#2a2a40" light={{x: 70, y: 40, o: 0.6, c: '255,200,120'}}>
			<Layer depth={1.4}>
				<Surgery f={gf} night />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Cot x={820} w={520} night />
					<ellipse cx={935} cy={COT_TOP - 8} rx={62} ry={22} fill="#e8e0c8" />
					<Lying who="stmartin" x={710} y={COT_TOP - 22} s={0.9} rot={84} f={gf} id="sm-002" expr="sleepy" />
					<rect x={570} y={COT_TOP - 40} width={300} height={44} rx={18} fill="#5a6a8a" />
					<Actor who="hero" x={RX} floor={FL} s={HS} facing={-1} faceTurn={0.4} look={[-0.6, 0.6]} expr="worried" mouth="frown" pose={rp} uid="h-002" />
				</Svg>
				<Prop3D
					x={870}
					y={560}
					w={200}
					h={200}
					make={() => {
						const scene = propScene();
						const c = makeCandle();
						scene.add(c);
						return {scene, c};
					}}
					update={(wd, ff) => {
						at(wd.c, candleHand[0] - 2, candleHand[1] + 8, 60);
						flicker(wd.c, ff);
					}}
				/>
			</Layer>
			<Over>
				<Tag f={f} t={w('002', 0.04)} x={960} y={860} text="DR. WILLIAM BEAUMONT" c="#11142c" fg="#ffd34a" size={38} rot={-2} />
			</Over>
		</Stage>
	);
};

/* ================================ 003a he lived ================================ */
const S003: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const SX = 860;
	const RX = 1110;
	const sit = reach({...SIT, lean: 0, head: 4}, 'B', [-40, -20], 1);
	const sp = gesture('wave', sit, env(f, w('003', 0.06), 1e9, 8, 1), f);
	const cam = usePush(camOn(960, 620, 1.3), camOn(960, 620, 1.42));
	return (
		<Stage cam={cam} bg="#eae2cc" light={{x: 30, y: 0, o: 0.45, c: '255,245,215'}}>
			<Layer depth={1.4}>
				<Surgery f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Cot x={900} w={520} />
					<Actor who="stmartin" x={SX} floor={FL} seat={COT_TOP - 4} s={HS} facing={1} faceTurn={0.3} look={[0.4, -0.2]} mouth="smile" pose={sp} uid="sm-003" />
					{/* bandage around his middle */}
					<rect x={SX - 34} y={COT_TOP - 66} width={68} height={24} rx={8} fill="#fbfaf4" stroke="#2a1a14" strokeWidth={3} />
					<Actor who="hero" x={RX} floor={FL} s={HS} facing={-1} faceTurn={0.4} look={[-0.6, 0.2]} expr="wide" mouth="open" pose={gesture('handsOnHead', idle(gf, 2), env(f, w('003', 0.12), 1e9, 8, 1), f)} uid="h-003" />
				</Svg>
			</Layer>
			<Over>
				<Tag f={f} t={w('003', 0.05)} x={960} y={330} text="HE LIVED!" c="#11142c" fg="#7af0a8" stroke="#7af0a8" size={52} rot={-4} />
				<Tag f={f} t={w('003', 0.3)} x={960} y={900} text="ALEXIS ST. MARTIN" c="#11142c" fg="#9fd8ff" stroke="#9fd8ff" size={40} rot={2} />
			</Over>
		</Stage>
	);
};

/* ================================ 003b a hole straight into his stomach ================================ */
const S003b: React.FC = () => {
	const {f} = useShot();
	const w = useW();
	const open = kk(f, 6, 30);
	return (
		<Board tint="#3a1a2a">
			{/* front view of his torso; the stomach sits on his left (screen right), a tunnel to the skin */}
			<g transform={`translate(960,700) scale(${0.78 * pop(f, 2)})`}>
				<path d="M-230,-300 Q-150,-340 -60,-330 Q0,-300 60,-330 Q150,-340 230,-300 L250,-120 Q210,-90 200,-60 L190,320 L-190,320 L-200,-60 Q-210,-90 -250,-120 Z" fill="#e8c4a0" stroke="#2a1a14" strokeWidth={9} />
				<rect x={-50} y={-380} width={100} height={70} fill="#e8c4a0" stroke="#2a1a14" strokeWidth={9} />
				<circle cx={0} cy={-470} r={110} fill="#e8c4a0" stroke="#2a1a14" strokeWidth={9} />
				<path d="M-110,-500 Q-100,-600 0,-600 Q100,-600 110,-500 Z" fill="#c83a3a" stroke="#2a1a14" strokeWidth={8} />
				<circle cx={0} cy={-610} r={24} fill="#fbfaf4" stroke="#2a1a14" strokeWidth={6} />
				<circle cx={-40} cy={-460} r={12} fill="#2a1a14" />
				<circle cx={40} cy={-460} r={12} fill="#2a1a14" />
				<path d="M-30,-410 Q0,-390 30,-410" fill="none" stroke="#2a1a14" strokeWidth={7} strokeLinecap="round" />
				<g transform="translate(50,30) scale(0.72)">
					<path d={STOMACH} fill="#f0a0a8" stroke="#2a1a14" strokeWidth={10} />
				</g>
				<rect x={140} y={-10} width={55 * open} height={34} fill="#5a1a22" />
				<ellipse cx={194} cy={7} rx={10} ry={20} fill="#f0b0a0" stroke="#2a1a14" strokeWidth={4} />
				<ellipse cx={196} cy={7} rx={5} ry={11} fill="#5a1a22" />
			</g>
			{f > 34 ? (
				<g transform={`translate(${1150 - 14 * Math.sin(f / 5)},705)`}>
					<path d="M0,0 L-60,0 M-60,0 l20,-16 M-60,0 l20,16" stroke="#ffd34a" strokeWidth={10} strokeLinecap="round" />
				</g>
			) : null}
			<Tag f={f} t={6} x={960} y={90} text="THE WOUND NEVER CLOSED" c="#11142c" fg="#ff9a8a" stroke="#ff6a5a" size={36} rot={-2} />
			<Tag f={f} t={w('003', 0.75) - w('003', 0.45)} x={960} y={1000} text="A HOLE INTO HIS STOMACH" c="#11142c" fg="#ffd34a" size={36} rot={2} />
		</Board>
	);
};

/* ================================ 004 nobody knew how digestion worked — a window ================================ */
const S004: React.FC = () => {
	const {f} = useShot();
	const w = useW();
	const win = w('004', 0.62);
	const shutter = kk(f, win + 4, win + 18);
	return (
		<Board tint="#1a2a4a">
			<Tag f={f} t={4} x={960} y={150} text="1820s" c="#11142c" fg="#9fd8ff" stroke="#9fd8ff" size={44} rot={-3} />
			<g transform={`translate(960,560) scale(${1.2 * pop(f, 2)})`}>
				<path d={STOMACH} fill="#f0a0a8" stroke="#2a1a14" strokeWidth={9} />
				{f < win
					? [0, 1, 2].map((i) => (
							<text key={i} x={-70 + i * 70} y={40 + 20 * Math.sin(f / 8 + i)} textAnchor="middle" fontSize={90} fontFamily={FONT} fontWeight={900} fill="#11142c" opacity={kk(f, 8 + i * 8, 16 + i * 8)}>
								?
							</text>
						))
					: null}
				{f >= win ? (
					<g transform={`translate(10,10) scale(${pop(f, win)})`}>
						<rect x={-70} y={-60} width={140} height={120} fill="#ffe8a0" stroke="#5a3a20" strokeWidth={10} />
						<line x1={0} y1={-60} x2={0} y2={60} stroke="#5a3a20" strokeWidth={8} />
						<line x1={-70} y1={0} x2={70} y2={0} stroke="#5a3a20" strokeWidth={8} />
						<path d={`M-70,-60 L${-70 - 50 * shutter},-50 L${-70 - 50 * shutter},50 L-70,60 Z`} fill="#3a86b8" stroke="#2a1a14" strokeWidth={5} />
						<path d={`M70,-60 L${70 + 50 * shutter},-50 L${70 + 50 * shutter},50 L70,60 Z`} fill="#3a86b8" stroke="#2a1a14" strokeWidth={5} />
					</g>
				) : null}
			</g>
			<Tag f={f} t={w('004', 0.1)} x={960} y={950} text="HOW DO WE DIGEST?" c="#11142c" fg="#fff" size={40} rot={2} until={win - 6} />
			<Tag f={f} t={win + 6} x={960} y={950} text="A WINDOW!" c="#11142c" fg="#ffd34a" size={52} rot={-2} />
		</Board>
	);
};

/* ================================ 005 meat on a silk string, in and out every hour ================================ */
const SMX = 800; // St. Martin on the chair
const RX5 = 935; // Doctor ROO next to him
const HOLE: [number, number] = [SMX + 22, SEAT - 52];
const S005: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const show = w('005', 0.05);
	const down0 = w('005', 0.36);
	const down1 = w('005', 0.52);
	const up0 = w('005', 0.74);
	const up1 = w('005', 0.86);
	const showP: [number, number] = [RX5 - 60, HIP - 150];
	const overP: [number, number] = [HOLE[0] + 4, HOLE[1] - 62];
	const lookP: [number, number] = [RX5 - 62, HIP - 168];
	let hand: [number, number] = [RX5 - 30, HIP - 40];
	if (f >= show) hand = lerp2(hand, showP, kk(f, show, show + 12));
	if (f >= down0 - 12) hand = lerp2(showP, overP, kk(f, down0 - 12, down0));
	if (f >= up1) hand = lerp2(overP, lookP, kk(f, up1, up1 + 12));
	// string length: hanging (40) → into the hole → back out
	const into = kk(f, down0, down1);
	const outK = kk(f, up0, up1);
	const len = f < up0 ? 16 + 100 * into : 116 - 100 * outK;
	const inside = Math.max(0, len - 56) / 50; // 0 at the skin, 1 fully in
	const shown = 1 - Math.min(1, inside * 1.6);
	const digested = f >= up0 ? 0.6 : 0;
	const hours = 9 + 4 * kk(f, down1, up0);
	const rp = reach(reach({...idle(gf, 2), lean: 8 * kk(f, down0 - 12, down0) * (1 - kk(f, up1, up1 + 12))}, 'F', loc(RX5, HIP, hand, -1), 1), 'B', [20, -30], 0.6);
	const sp = reach(reach({...SIT, lean: 0, head: -4}, 'F', [-30, -100], 1), 'B', [-20, -40], 1);
	const cam = usePush(camOn(930, 610, 1.35), camOn(910, 640, 1.48));
	const knot: [number, number] = [hand[0], hand[1] + 6];
	const end: [number, number] = [hand[0], hand[1] + 6 + len];
	return (
		<Stage cam={cam} bg="#2e4a3c" light={{x: 70, y: 0, o: 0.5, c: '255,225,180'}}>
			<Layer depth={1.4}>
				<Study f={gf} h={hours} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Desk x={1110} w={260} />
					<SeatChair x={SMX} facing={1} />
					<Actor who="stmartin" x={SMX} floor={FL} seat={SEAT} s={HS} facing={1} faceTurn={0.35} look={[0.3, -0.2]} expr={inside > 0 ? 'worried' : 'normal'} mouth={inside > 0 ? 'line' : 'smile'} pose={sp} uid="sm-005" />
					<Hole x={HOLE[0]} y={HOLE[1]} />
					<Actor who="hero" x={RX5} floor={FL} s={HS} facing={-1} faceTurn={0.4} look={f >= up1 ? [-0.3, 0.1] : [-0.5, 0.6]} expr={f >= up1 ? 'wide' : 'normal'} mouth={f >= up1 ? 'open' : 'smile'} pose={rp} uid="h-005" />
					{/* the silk string: from the fingers to the meat, or into the hole */}
					<line x1={knot[0]} y1={knot[1]} x2={end[0]} y2={Math.min(end[1], HOLE[1])} stroke="#fbfaf4" strokeWidth={2.5} />
				</Svg>
				<Prop3D
					x={600}
					y={380}
					w={800}
					h={520}
					make={() => {
						const scene = propScene();
						const meat = makeMeat();
						const bread = makeBread();
						const leaf = makeLeaf();
						scene.add(meat, bread, leaf);
						return {scene, meat, bread, leaf};
					}}
					update={(wd, ff) => {
						const m = wd.meat as Bait;
						m.userData.digest(digested);
						m.visible = shown > 0.02;
						m.scale.setScalar(Math.max(0.02, shown));
						at(m, end[0], end[1] - 6, 70);
						m.rotation.set(0, Math.sin(ff / 14) * 0.4, Math.sin(ff / 11) * 0.06);
						// bread and a cabbage leaf on their strings, lying on the desk
						at(wd.bread, 1050, STUDY_TOP - 6, 40);
						wd.bread.rotation.set(-1.25, 0, 1.5);
						at(wd.leaf, 1130, STUDY_TOP - 5, 40);
						wd.leaf.rotation.set(-1.3, 0, 1.6);
					}}
				/>
			</Layer>
			<Over>
				<Tag f={f} t={w('005', 0.1)} x={960} y={300} text="MEAT · BREAD · CABBAGE" c="#11142c" fg="#ffd34a" size={34} rot={-3} until={down0 + 10} />
				<Tag f={f} t={w('005', 0.58)} x={960} y={300} text="EVERY HOUR" c="#11142c" fg="#9fd8ff" stroke="#9fd8ff" size={46} rot={-3} />
				<Tag f={f} t={up1 + 4} x={960} y={930} text="WHAT'S LEFT?" c="#11142c" fg="#ff9a8a" stroke="#ff6a5a" size={42} rot={2} />
			</Over>
		</Stage>
	);
};

/* ================================ 006 in a jar, the juice dissolves meat ================================ */
const S006: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const JX = 920;
	const RX = 1090;
	const dig = kk(f, w('006', 0.15), w('006', 0.95));
	const lensHand: [number, number] = [RX - 90, HIP - 60];
	const rp = reach({...idle(gf, 2), lean: 10, head: 10}, 'F', loc(RX, HIP, lensHand, -1), 1);
	const cam = usePush(camOn(980, 640, 1.5), camOn(980, 660, 1.65));
	return (
		<Stage cam={cam} bg="#2e4a3c" light={{x: 70, y: 0, o: 0.5, c: '255,225,180'}}>
			<Layer depth={1.4}>
				<Study f={gf} h={13.5 + 2 * dig} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={RX} floor={FL} s={HS} facing={-1} faceTurn={0.45} look={[-0.7, 0.4]} expr="wide" mouth="smile" pose={rp} uid="h-006" />
					<Desk x={960} w={420} />
				</Svg>
				<Prop3D
					x={760}
					y={520}
					w={420}
					h={260}
					make={() => {
						const scene = propScene();
						const jar = makeJar();
						const mag = makeMagnifier();
						scene.add(jar, mag);
						return {scene, jar, mag};
					}}
					update={(wd) => {
						(wd.jar as Jar).userData.digest(dig);
						at(wd.jar, JX, STUDY_TOP, 30);
						wd.jar.rotation.set(0.15, 0, 0);
						at(wd.mag, lensHand[0], lensHand[1] + 10, 120);
						wd.mag.rotation.set(0, 0, 0.9);
					}}
				/>
			</Layer>
			<Over>
				<Tag f={f} t={w('006', 0.05)} x={960} y={300} text="STOMACH JUICE" c="#11142c" fg="#ffd34a" size={44} rot={-3} />
				<Tag f={f} t={w('006', 0.6)} x={960} y={930} text="IT DISSOLVES MEAT" c="#11142c" fg="#ff9a8a" stroke="#ff6a5a" size={40} rot={2} />
			</Over>
		</Stage>
	);
};

/* ================================ 007 not grinding — acid ================================ */
const Gear: React.FC<{x: number; y: number; r: number; a: number}> = ({x, y, r, a}) => (
	<g transform={`translate(${x},${y}) rotate(${a})`}>
		{Array.from({length: 10}).map((_, i) => (
			<rect key={i} x={-12} y={-r - 22} width={24} height={30} rx={4} fill="#8a90a0" stroke="#2a1a14" strokeWidth={4} transform={`rotate(${i * 36})`} />
		))}
		<circle r={r} fill="#a8aebe" stroke="#2a1a14" strokeWidth={6} />
		<circle r={r * 0.35} fill="#5a6078" stroke="#2a1a14" strokeWidth={5} />
	</g>
);
const S007: React.FC = () => {
	const {f} = useShot();
	const w = useW();
	const cross = kk(f, w('007', 0.3), w('007', 0.42));
	const acid = w('007', 0.5);
	return (
		<Board tint="#1a3a2a">
			<g transform={`scale(1)`}>
				<Gear x={890} y={300} r={60} a={f * (cross < 1 ? 3 : 0.3)} />
				<Gear x={1020} y={340} r={46} a={-f * (cross < 1 ? 4 : 0.4) + 18} />
				{cross > 0 ? (
					<g stroke="#e8343a" strokeWidth={22} strokeLinecap="round">
						<line x1={820} y1={210} x2={820 + 280 * cross} y2={210 + 220 * cross} />
						{cross > 0.5 ? <line x1={1100} y1={210} x2={1100 - 280 * (cross - 0.5) * 2} y2={210 + 220 * (cross - 0.5) * 2} /> : null}
					</g>
				) : null}
			</g>
			<Tag f={f} t={6} x={960} y={130} text="JUST GRINDING?" c="#11142c" fg="#fff" size={40} rot={-3} />
			{f >= acid ? (
				<g transform={`translate(960,720) scale(${0.9 * pop(f, acid)})`}>
					<path d={STOMACH} fill="#f0a0a8" stroke="#2a1a14" strokeWidth={9} />
					<path d="M-100,60 Q0,30 110,40 Q130,110 60,140 Q-40,160 -110,110 Z" fill="#c8e86a" opacity={0.9} />
					{Array.from({length: 8}).map((_, i) => (
						<circle key={i} cx={-80 + i * 24} cy={120 - ((f * 2 + i * 23) % 80)} r={6 + (i % 3) * 2} fill="none" stroke="#f4ffd0" strokeWidth={3} />
					))}
				</g>
			) : null}
			<Tag f={f} t={acid + 8} x={960} y={970} text="ACID!" c="#11142c" fg="#c8e86a" stroke="#c8e86a" size={56} rot={2} />
		</Board>
	);
};

/* ================================ 008a 200+ experiments; he's fed up ================================ */
const S008: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const n = Math.round(interpolate(f, [4, w('008', 0.25)], [1, 200], clamp));
	const hand: [number, number] = [HOLE[0] + 4, HOLE[1] - 62 + 6 * Math.sin(f / 8)];
	const rp = reach(idle(gf, 2), 'F', loc(RX5, HIP, hand, -1), 1);
	const sp = reach(reach({...SIT, lean: 0, head: -6}, 'F', [-30, -100], 1), 'B', [-20, -40], 1);
	const cam = usePush(camOn(900, 620, 1.35), camOn(890, 630, 1.45));
	return (
		<Stage cam={cam} bg="#2e4a3c" light={{x: 70, y: 0, o: 0.5, c: '255,225,180'}}>
			<Layer depth={1.4}>
				<Study f={gf} h={9 + f / 6} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<SeatChair x={SMX} facing={1} />
					<Actor who="stmartin" x={SMX} floor={FL} seat={SEAT} s={HS} facing={1} faceTurn={0.2} look={[-0.3, -0.2]} expr="angry" mouth="frown" pose={sp} uid="sm-008" />
					<Actor who="hero" x={RX5} floor={FL} s={HS} facing={-1} faceTurn={0.4} look={[-0.5, 0.6]} mouth="smile" pose={rp} uid="h-008" />
					<line x1={hand[0]} y1={hand[1] + 6} x2={HOLE[0]} y2={HOLE[1]} stroke="#fbfaf4" strokeWidth={2.5} />
					<Hole x={HOLE[0]} y={HOLE[1]} />
				</Svg>
			</Layer>
			<Over>
				<g transform={`translate(960,240) scale(${pop(f, 4)})`}>
					<rect x={-250} y={-60} width={500} height={120} rx={30} fill="#11142c" stroke="#ffd34a" strokeWidth={6} />
					<text y={20} textAnchor="middle" fontSize={54} fontFamily={FONT} fontWeight={900} fill="#ffd34a">
						{n >= 200 ? '200+' : n} TESTS
					</text>
				</g>
			</Over>
		</Stage>
	);
};

/* ================================ 008b/c he paddles off to Canada; brought back ================================ */
const paddlePose = (base: Pose, gf: number, x: number, oy: number, facing: 1 | -1, ph: number) => {
	const g: [number, number] = [x + facing * (30 + 40 * Math.sin(ph)), oy - 110 + 10 * Math.cos(ph)];
	const a = 0.35 * Math.sin(ph);
	const low: [number, number] = [g[0] - facing * Math.sin(a) * 60, g[1] + Math.cos(a) * 60];
	let p = reach(base, 'B', loc(x, oy, g, facing), 1);
	p = reach(p, 'F', loc(x, oy, low, facing), 1);
	return {p, g, a};
};
const Canoe: React.FC<{back?: boolean}> = ({back}) => {
	const {f, gf, dur} = useShot();
	const w = useW();
	const dir: 1 | -1 = back ? -1 : 1;
	const cx = back ? 1080 - 220 * kk(f, 0, dur) : 760 + 200 * kk(f, 0, dur);
	const bob = Math.sin(gf / 9) * 4;
	const keel = WATER_Y + 30 + bob;
	const seatY = keel - 26;
	const ph = gf / 7;
	const front = cx + dir * 70;
	const rear = cx - dir * 70;
	const sm = back ? {x: rear, ...paddlePose({...SIT, lean: 0, head: -4}, gf, rear, seatY, dir, ph + 1.2)} : {x: front, ...paddlePose({...SIT, lean: 6, head: 0}, gf, front, seatY, dir, ph)};
	const ro = back ? {x: front, ...paddlePose({...SIT, lean: 4, head: 0}, gf, front, seatY, dir, ph)} : null;
	const cam = usePush(camOn(960, 600, 1.25), camOn(960, 610, 1.35));
	return (
		<Stage cam={cam} bg="#6ab4e8" light={{x: 30, y: 0, o: 0.35, c: '255,250,230'}}>
			<Layer depth={1.4}>
				<LakeShore f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="stmartin" x={sm.x} floor={FL} seat={seatY} s={HS} facing={dir} faceTurn={0.35} look={back ? [-0.4, 0.2] : [0.5, -0.1]} expr={back ? 'angry' : 'normal'} mouth={back ? 'frown' : 'smile'} pose={sm.p} uid="sm-canoe" shadow={false} />
					{ro ? <Actor who="hero" x={ro.x} floor={FL} seat={seatY} s={HS} facing={dir} faceTurn={0.35} look={[-0.4, 0]} mouth="smile" pose={ro.p} uid="h-canoe" shadow={false} /> : null}
				</Svg>
				<Prop3D
					x={300}
					y={460}
					w={1300}
					h={480}
					make={() => {
						const scene = propScene();
						const c = makeCanoe();
						const p1 = makePaddle();
						const p2 = makePaddle();
						scene.add(c, p1, p2);
						return {scene, c, p1, p2};
					}}
					update={(wd) => {
						at(wd.c, cx, keel, 0);
						wd.c.rotation.set(0.12, 0, Math.sin(gf / 11) * 0.02);
						at(wd.p1, sm.g[0], sm.g[1], 80);
						wd.p1.rotation.set(0, 0, -dir * sm.a);
						wd.p2.visible = !!ro;
						if (ro) {
							at(wd.p2, ro.g[0], ro.g[1], 80);
							wd.p2.rotation.set(0, 0, -dir * ro.a);
						}
					}}
				/>
				<Svg>
					{/* the water in front of the hull hides the legs and the keel */}
					<rect x={-400} y={WATER_Y + 16 + bob * 0.5} width={2800} height={400} fill="#3a86b8" />
					{Array.from({length: 10}).map((_, i) => (
						<path key={i} d={`M${200 + i * 170 + ((gf * 1.5) % 170)},${WATER_Y + 40 + (i % 3) * 30} q25,-12 50,0`} stroke="#bfe6ff" strokeWidth={5} fill="none" />
					))}
				</Svg>
			</Layer>
			<Over>
				{back ? <Tag f={f} t={6} x={960} y={300} text="BROUGHT BACK" c="#11142c" fg="#7af0a8" stroke="#7af0a8" size={46} rot={-3} /> : <Tag f={f} t={6} x={960} y={300} text="RAN AWAY!" c="#11142c" fg="#ff9a8a" stroke="#ff6a5a" size={50} rot={-3} />}
			</Over>
		</Stage>
	);
	void w;
};
const S008b: React.FC = () => <Canoe />;
const S008c: React.FC = () => <Canoe back />;

/* ================================ 009a he outlived his doctor ================================ */
const S009: React.FC = () => {
	const {f, gf} = useShot();
	return (
		<Board tint="#2a2a4a">
			<ellipse cx={820} cy={824} rx={80} ry={12} fill="#000" opacity={0.3} />
			<Actor who="hero" x={820} floor={820} s={0.75} facing={1} faceTurn={0.3} look={[0.4, -0.1]} mouth="smile" pose={idle(gf, 2)} uid="h-009" />
			<ellipse cx={1100} cy={824} rx={80} ry={12} fill="#000" opacity={0.3} />
			<Actor who="stmartin" x={1100} floor={820} s={0.75} facing={-1} faceTurn={0.3} look={[-0.4, -0.1]} mouth="smile" pose={idle(gf, 5)} uid="sm-009" />
			<Tag f={f} t={6} x={820} y={330} text="†1853" c="#11142c" fg="#c8ccd8" stroke="#c8ccd8" size={40} rot={-3} />
			<Tag f={f} t={20} x={1100} y={330} text="†1880" c="#11142c" fg="#ffd34a" size={40} rot={3} />
			<Tag f={f} t={36} x={960} y={950} text="+27 YEARS" c="#11142c" fg="#7af0a8" stroke="#7af0a8" size={56} rot={-2} />
		</Board>
	);
};

/* ================================ 009b buried extra deep ================================ */
const S009b: React.FC = () => {
	const {f, gf} = useShot();
	const PX = 900;
	const dig = Math.sin(gf / 6);
	const SNX = PX + 150;
	const SO = GRAVE_Y + 4 - 157 * 0.95;
	const sa = -0.55 - 0.1 * dig;
	const shovelGrip: [number, number] = [SNX - 40 + 10 * dig, SO - 70 - 20 * dig];
	const lowHand: [number, number] = [shovelGrip[0] + 70 * Math.sin(sa), shovelGrip[1] + 70 * Math.cos(sa)];
	const sonP = reach(reach({...idle(gf, 4), lean: 14}, 'F', loc(SNX, SO, lowHand, -1, 0.95), 1), 'B', loc(SNX, SO, shovelGrip, -1, 0.95), 1);
	const DX = 1120;
	const peek = env(f, 30, 1e9, 14, 1);
	const cam = usePush(camOn(980, 650, 1.12), camOn(980, 670, 1.18));
	return (
		<Stage cam={cam} bg="#3a2a5a" light={{x: 70, y: 20, o: 0.5, c: '255,190,140'}}>
			<Layer depth={1.4}>
				<Graveyard f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					{/* deep grave in cutaway, measured */}
					<rect x={PX - 80} y={GRAVE_Y} width={160} height={400} fill="#2a1e14" />
					<path d={`M${PX - 140},${GRAVE_Y} q60,-50 120,-6 q40,-30 70,6 Z`} fill="#5a4030" transform="translate(150,0)" />
					<g stroke="#ffd34a" strokeWidth={6} strokeLinecap="round">
						<line x1={PX - 55} y1={GRAVE_Y + 14} x2={PX - 55} y2={1000} />
						<line x1={PX - 73} y1={GRAVE_Y + 14} x2={PX - 37} y2={GRAVE_Y + 14} />
						<path d={`M${PX - 55},1000 l-14,-22 M${PX - 55},1000 l14,-22`} />
					</g>
					<Actor who="son" x={SNX} floor={GRAVE_Y + 4} s={0.95} facing={-1} faceTurn={0.4} look={[-0.6, 0.6]} expr="normal" mouth="line" pose={sonP} uid="son-009" />
					<Actor who="olddoc" x={DX + 120 - 60 * peek} floor={GRAVE_Y + 4} s={0.95} facing={-1} faceTurn={0.4} look={[-0.8, 0.5]} expr="sad" mouth="frown" pose={idle(gf, 7)} uid="doc-009" />
				</Svg>
				<Prop3D
					x={640}
					y={420}
					w={800}
					h={640}
					make={() => {
						const scene = propScene();
						const stone = makeGravestone('A. ST. MARTIN', '1880');
						const sh = makeShovel();
						const coffin = makeCoffin();
						const bag = makeDocBag();
						scene.add(stone, sh, coffin, bag);
						return {scene, stone, sh, coffin, bag};
					}}
					update={(wd) => {
						at(wd.stone, PX - 100, GRAVE_Y + 6, -60);
						wd.stone.rotation.set(0, 0.2, 0);
						wd.stone.scale.setScalar(0.75);
						at(wd.coffin, PX, 1030, 0);
						wd.coffin.scale.setScalar(0.62);
						at(wd.sh, shovelGrip[0], shovelGrip[1], 60);
						wd.sh.rotation.set(0, 0, sa);
						at(wd.bag, DX + 120 - 60 * peek - 50, GRAVE_Y + 2, 60);
					}}
				/>
			</Layer>
			<Over>
				<Tag f={f} t={6} x={960} y={210} text="EXTRA DEEP" c="#11142c" fg="#ffd34a" size={50} rot={-3} />
				<Tag f={f} t={50} x={1100} y={960} text="NO DOCTORS!" c="#3a1d2a" fg="#ff9a8a" stroke="#ff6a5a" size={38} rot={2} />
			</Over>
		</Stage>
	);
};

/* ================================ 010 would you? ================================ */
const S010: React.FC = () => {
	const {f, gf, dur} = useShot();
	const w = useW();
	useFont("900 40px 'Rubik'");
	const out = interpolate(f, [dur - 18, dur - 2], [0, 1], clamp);
	const hand: [number, number] = [960 + 80, HIP - 130];
	const hp = reach(idle(gf, 2), 'F', loc(960, HIP, hand, 1), env(f, 2, 1e9, 8, 1));
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
						<Actor who="hero" x={960} floor={FL} s={HS} facing={1} faceTurn={0.15} look={[0.3, -0.1]} mouth="smirk" pose={hp} uid="h-010" />
					</Svg>
					<Prop3D
						x={900}
						y={420}
						w={300}
						h={360}
						make={() => {
							const scene = propScene();
							const m = makeMagnifier();
							scene.add(m);
							return {scene, m};
						}}
						update={(wd) => {
							at(wd.m, hand[0], hand[1] + 10, 80);
							wd.m.rotation.set(0, 0.2 * Math.sin(f / 14), -0.25);
						}}
					/>
				</Layer>
			</Stage>
			<Over>
				<g transform={`translate(960,200) scale(${pop(f, 4)})`}>
					<rect x={-290} y={-80} width={580} height={160} rx={30} fill="#fbfaf4" stroke="#11142c" strokeWidth={8} />
					<text y={-8} textAnchor="middle" fontSize={40} fontFamily={FONT} fontWeight={900} fill="#13203a">
						LET A DOCTOR LOOK
					</text>
					<text y={46} textAnchor="middle" fontSize={40} fontFamily={FONT} fontWeight={900} fill="#d23b3b">
						INSIDE YOU?
					</text>
				</g>
				<Tag f={f} t={w('010', 0.55)} x={960} y={950} text="TELL ME IN THE COMMENTS ↓" c="#ffd34a" fg="#11142c" stroke="#11142c" size={34} rot={-2} />
			</Over>
			<AbsoluteFill style={{background: '#000', opacity: out}} />
		</>
	);
};

const T = (id: string, k: number) => Math.round(TL.lines.find((x) => x.id.startsWith(id))!.dur * k);
export const SHOTS_SM: ShotDef[] = [
	{at: '001', C: S001, focus: 960},
	{at: '002', C: S002, focus: 960, whip: true},
	{at: '003', C: S003, focus: 960, whip: true},
	{at: '003', off: T('003', 0.45), C: S003b, focus: 960, whip: true},
	{at: '004', C: S004, focus: 960, whip: true},
	{at: '005', C: S005, focus: 960, whip: true},
	{at: '006', C: S006, focus: 960, whip: true},
	{at: '007', C: S007, focus: 960, whip: true},
	{at: '008', C: S008, focus: 960, whip: true},
	{at: '008', off: T('008', 0.36), C: S008b, focus: 960, whip: true},
	{at: '008', off: T('008', 0.72), C: S008c, focus: 960, whip: true},
	{at: '009', C: S009, focus: 960, whip: true},
	{at: '009', off: T('009', 0.42), C: S009b, focus: 960, whip: true},
	{at: '010', C: S010, focus: 960, whip: true},
];

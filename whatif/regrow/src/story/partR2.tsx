import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import * as THREE from 'three';
import {Pose} from '../engine/Stickman';
import {SIT, env, gesture, idle, reach, walkTo} from '../kit/actions';
import {Actor, useShot} from '../kit/core';
import type {ShotDef} from '../kit/coverage';
import {HeroBadge, Layer, Stage, Svg, camOn, clamp, usePush} from '../kit/kit';
import {Board, Bubble, FONT} from '../kit/ui';
import {Onoma} from '../reference/PauseTime';
import {Prop3D, PropWorld, at, propScene} from '../three/Prop3D';
import {makeBurger, makeDinnerPlate, makePizzaBox, makeSoftball, makeSyringe, makeTooth, makeVial, makeWrapper} from '../three/regrow';
import {FL, HS, badgeY} from './common';
import {pop, useW} from './lib';
import {SEAT, SeatChair} from './places';
import {BigHand, Insert} from './placesR';
import {CAFE_TOP, CafeTable, Cafeteria, DentalChair, DiningRoom, HOME_TABLE_TOP, HomeTable, KID_BED_TOP, KidBed, KyotoClinic, Park, Ward1974, XrayOffice} from './placesR2';
import {HIP, Over, Tag, placeTool} from './partR1';

/* PART 2 (1:21–2:35): Illingworth's fingertips (1974), rule two (food), rule three (factory-new
   tooth), the Kyoto tooth trial, the dangerous question, the liver. */

const seated = (gf: number, lean = 4): Pose => ({...SIT, lean, head: 2});
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

/* ================================ 015–016 Illingworth, 1974 ================================ */
const BX = 760; // the boy on the bed edge
const IX = 1010; // Dr. Illingworth
const R015: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const show = env(f, w('015', 0.18), 1e9, 10, 1);
	const bp = reach(seated(gf, 0), 'F', [64, -50], show);
	const hand: [number, number] = [BX + 64 * 0.72, KID_BED_TOP - 4 - 50 * 0.72];
	const ip = reach({...idle(gf, 3), lean: 16, head: 14}, 'F', [IX - hand[0] - 20, hand[1] - HIP + 10], show);
	const cam = usePush(camOn(960, 580, 1.15), camOn(900, 600, 1.42));
	return (
		<AbsoluteFill style={{filter: 'sepia(0.25) saturate(1.1)'}}>
			<Stage cam={cam} bg="#c88a4a" light={{x: 70, y: 10, o: 0.4, c: '255,230,190'}}>
				<Layer depth={1.4}>
					<Ward1974 />
				</Layer>
				<Layer depth={1}>
					<Svg>
						<KidBed x={680} />
						<Actor who="boy74" x={BX} floor={FL} seat={KID_BED_TOP - 4} s={0.72} facing={1} faceTurn={0.4} look={[0.6, 0.2]} expr="worried" pose={bp} uid="boy-015" />
						{/* the dressing on his fingertip */}
						<ellipse cx={hand[0] + 6} cy={hand[1] - 4} rx={9} ry={7} fill="#fbfaf2" stroke="#2a1a14" strokeWidth={3} opacity={show} />
						<Actor who="illingworth" x={IX} floor={FL} s={0.96} facing={-1} faceTurn={0.4} look={[-0.7, 0.6]} mouth="smile" pose={ip} uid="ill-015" />
						<Tag f={f} t={w('015', 0.16)} x={520} y={260} text="1974" c="#3a1d0a" fg="#ffd34a" size={48} rot={-4} />
						<Tag f={f} t={w('015', 0.22)} x={1420} y={540} text="SHEFFIELD" c="#11142c" fg="#fff" size={34} rot={3} />
						<Tag f={f} t={w('015', 0.3)} x={1180} y={330} text="DR. CYNTHIA ILLINGWORTH" c="#11142c" fg="#ffd0a0" stroke="#ffd0a0" size={30} rot={-2} />
					</Svg>
				</Layer>
			</Stage>
		</AbsoluteFill>
	);
};
/* the comparison: stitched closed vs left alone */
const R015b: React.FC = () => {
	const {f} = useShot();
	const w = useW();
	const grow = interpolate(f, [w('015', 0.66), w('015', 0.95)], [0, 1], clamp);
	const kid = {sleeve: '#d86a2a', cuff: '#b8501a'};
	return (
		<Board tint="#3a2a1a">
			<g transform={`translate(520,560) scale(${pop(f, 2)})`}>
				<rect x={-330} y={-400} width={660} height={800} rx={40} fill="#11142c" stroke="#e8a090" strokeWidth={8} />
				<g transform="translate(0,90) scale(1.05)">
					<BigHand tip={0} {...kid} />
					{[-44, -26, -8].map((x) => (
						<line key={x} x1={x} y1={-136} x2={x + 6} y2={-116} stroke="#1d2236" strokeWidth={6} strokeLinecap="round" />
					))}
				</g>
				<text y={-320} textAnchor="middle" fontSize={50} fontFamily={FONT} fontWeight={900} fill="#ffb0a0">
					STITCHED CLOSED
				</text>
				<g transform={`translate(230,-250) scale(${pop(f, w('015', 0.6))})`}>
					<circle r={44} fill="#d23b3b" />
					<path d="M-18,-18 L18,18 M18,-18 L-18,18" stroke="#fff" strokeWidth={10} strokeLinecap="round" />
				</g>
			</g>
			<g transform={`translate(1400,560) scale(${pop(f, w('015', 0.55))})`}>
				<rect x={-330} y={-400} width={660} height={800} rx={40} fill="#11142c" stroke="#7af0a8" strokeWidth={8} />
				<g transform="translate(0,90) scale(1.05)">
					<BigHand tip={grow} glow={env(f, w('015', 0.9), 1e9, 6, 1)} {...kid} />
				</g>
				<text y={-320} textAnchor="middle" fontSize={50} fontFamily={FONT} fontWeight={900} fill="#7af0a8">
					LEFT ALONE
				</text>
				<g transform={`translate(230,-250) scale(${pop(f, w('015', 0.94))})`}>
					<circle r={44} fill="#2a9a5a" />
					<path d="M-20,0 L-6,16 L22,-16" stroke="#fff" strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
				</g>
			</g>
		</Board>
	);
};
/* 016 up to about eleven: nail, fingerprint and all */
const Fingerprint: React.FC<{k: number}> = ({k}) => (
	<g opacity={k}>
		{Array.from({length: 9}).map((_, i) => (
			<ellipse key={i} cx={0} cy={20} rx={22 + i * 22} ry={30 + i * 26} fill="none" stroke="#c88a6a" strokeWidth={7} strokeDasharray={i % 3 === 1 ? '40 18' : undefined} />
		))}
	</g>
);
const R016: React.FC = () => {
	const {f} = useShot();
	const w = useW();
	const age = interpolate(f, [w('016', 0.05), w('016', 0.4)], [0, 11], clamp);
	const print = interpolate(f, [w('016', 0.55), w('016', 0.8)], [0, 1], clamp);
	return (
		<Board tint="#3a2a1a">
			{/* age bar */}
			<g transform="translate(330,220)">
				<text x={0} y={-50} fontSize={44} fontFamily={FONT} fontWeight={900} fill="#ffd34a">
					KIDS UP TO ~11
				</text>
				<rect x={0} y={0} width={620} height={46} rx={23} fill="#11142c" stroke="#ffd0a0" strokeWidth={5} />
				<rect x={6} y={6} width={(608 * age) / 11} height={34} rx={17} fill="#ffb05a" />
				{[0, 5, 11].map((a) => (
					<text key={a} x={(620 * a) / 11} y={90} textAnchor="middle" fontSize={32} fontFamily={FONT} fontWeight={900} fill="#fff">
						{a}
					</text>
				))}
			</g>
			{/* the fingertip, huge: nail on top, fingerprint on the pad */}
			<Insert x={1300} y={560} r={400} k={pop(f, 2)} id="tip-016" bg="#2a1a10" ring="#ffd0a0">
				<g transform="translate(0,60)">
					<rect x={-190} y={-330} width={380} height={720} rx={190} fill="#f2c9a5" stroke="#2a1a14" strokeWidth={10} />
					<g transform="translate(0,-60)">
						<Fingerprint k={print} />
					</g>
					<rect x={-120} y={-310} width={240} height={150} rx={60} fill="#fbe0d0" stroke="#2a1a14" strokeWidth={8} opacity={pop(f, w('016', 0.42))} />
				</g>
			</Insert>
			<Tag f={f} t={w('016', 0.45)} x={520} y={560} text="NAIL ✓" c="#11142c" fg="#ffd0dc" stroke="#ffd0dc" size={48} rot={-3} />
			<Tag f={f} t={w('016', 0.7)} x={560} y={700} text="FINGERPRINT ✓" c="#11142c" fg="#ffd0a0" stroke="#ffd0a0" size={48} rot={2} />
		</Board>
	);
};

/* ================================ 017–018 rule two: food ================================ */
const EX = 800; // hero at the cafeteria table
type CafeW = PropWorld & {b1: THREE.Group; b2: THREE.Group; box: THREE.Group; slice: THREE.Mesh; wraps: THREE.Object3D[]};
const R017: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const mouth: [number, number] = [EX + 44, SEAT - 150];
	// three courses: burger, burger, pizza slices; each = bring to mouth, two bites
	const ph = interpolate(f, [w('017', 0.12), w('017', 0.92)], [0, 3], clamp);
	const course = Math.min(2, Math.floor(ph));
	const p = ph - course;
	const lift = p < 0.2 ? p / 0.2 : p > 0.85 ? 1 - (p - 0.85) / 0.15 : 1;
	const bite = Math.max(0, Math.min(1, (p - 0.25) / 0.55));
	const grab: [number, number][] = [
		[EX + 150, CAFE_TOP - 30],
		[EX + 230, CAFE_TOP - 30],
		[EX + 360, CAFE_TOP - 30],
	];
	const hand: [number, number] = [grab[course][0] + (mouth[0] - grab[course][0]) * lift, grab[course][1] + (mouth[1] + 20 - grab[course][1]) * lift];
	const hp = reach(seated(gf, 8), 'F', [hand[0] - EX, hand[1] - SEAT], ph > 0 && ph < 3 ? 1 : 0);
	const chew = bite > 0 && bite < 1 && lift > 0.9 ? Math.abs(Math.sin(f / 3)) : 0;
	const cam = usePush(camOn(1000, 600, 1.25), camOn(980, 600, 1.45));
	return (
		<Stage cam={cam} bg="#e8d2a8" light={{x: 60, y: 0, o: 0.45, c: '255,240,210'}}>
			<Layer depth={1.4}>
				<Cafeteria f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<SeatChair x={EX - 30} c="#e4762a" />
					<Actor who="hero" x={EX} floor={FL} seat={SEAT} s={HS} facing={1} faceTurn={0.4} look={[0.5, 0.3]} mouth={chew > 0.5 ? 'open' : 'smile'} pose={hp} uid="h-017" />
					<CafeTable x={1080} w={600} />
				</Svg>
				<Prop3D
					x={760}
					y={480}
					w={700}
					h={320}
					make={(): CafeW => {
						const scene = propScene();
						const b1 = makeBurger();
						const b2 = makeBurger();
						const box = makePizzaBox();
						at(box, 1240, CAFE_TOP, 0);
						box.rotation.x = 0.45;
						box.scale.setScalar(0.9);
						const slice = (box.userData.slices as THREE.Mesh[])[0].clone(true);
						const wraps: THREE.Object3D[] = [];
						for (let i = 0; i < 6; i++) {
							const wp = makeWrapper(['#f4efe2', '#ffd34a', '#e4503c', '#9fd8ff', '#f4efe2', '#7af0a8'][i]);
							at(wp, 960 + (i % 3) * 26 - 10, CAFE_TOP - 12 - Math.floor(i / 3) * 20, 40 + i);
							wp.visible = false;
							wraps.push(wp);
						}
						scene.add(b1, b2, box, slice, ...wraps);
						return {scene, b1, b2, box, slice, wraps};
					}}
					update={(wd) => {
						const placeFood = (o: THREE.Object3D, i: number) => {
							const eaten = course > i || (course === i && ph >= 3);
							o.visible = !eaten && !(course === i && bite >= 0.98);
							if (course === i && ph > 0) {
								at(o, hand[0] + 16, hand[1] - 10, 60);
								o.scale.setScalar(Math.max(0.05, 1 - 0.8 * bite));
								o.rotation.set(0.3, 0, -0.2);
							} else {
								at(o, grab[i][0], CAFE_TOP, 30);
								o.scale.setScalar(1);
								o.rotation.set(0.35, 0, 0);
							}
						};
						placeFood(wd.b1, 0);
						placeFood(wd.b2, 1);
						const slices = wd.box.userData.slices as THREE.Mesh[];
						const gone = course < 2 ? 0 : Math.floor(p * 8);
						slices.forEach((s, i) => (s.visible = i >= gone + (course === 2 ? 1 : 0)));
						wd.slice.visible = course === 2 && lift > 0.05;
						at(wd.slice, hand[0] + 70, hand[1] + 10, 70);
						wd.slice.scale.setScalar(0.9 * (1 - 0.6 * bite));
						wd.slice.rotation.set(1.2, 0, 0.6);
						const nWraps = Math.min(6, (course >= 1 ? 2 : 0) + (course >= 2 ? 1 : 0) + (course === 2 ? Math.floor(p * 4) : 0));
						wd.wraps.forEach((x, i) => (x.visible = i < nWraps));
					}}
				/>
				<Svg>
					<HeroBadge x={EX} y={SEAT - 164 - 118} s={0.8} />
					{chew > 0.5 ? <Onoma x={EX + 120} y={SEAT - 230} text="nom" t={(f % 18) + 4} c="#ffd34a" size={36} rot={6} /> : null}
				</Svg>
			</Layer>
			<Over>
				<Tag f={f} t={w('017', 0.35)} x={1500} y={260} text="2 BURGERS" c="#11142c" fg="#ffd34a" size={40} rot={3} />
				<Tag f={f} t={w('017', 0.55)} x={1540} y={370} text="PIZZA" c="#11142c" fg="#ff9a6a" stroke="#ff9a6a" size={40} rot={-3} />
				<Tag f={f} t={w('017', 0.8)} x={1460} y={480} text="½ VENDING MACHINE" c="#11142c" fg="#9fd8ff" stroke="#9fd8ff" size={36} rot={2} />
			</Over>
		</Stage>
	);
};
/* 018 RULE #2: food in → new tissue out */
const R018: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const grow = interpolate(f, [w('018', 0.35), w('018', 0.65)], [0, 1], clamp);
	const flow = interpolate(f, [w('018', 0.25), w('018', 0.45)], [0, 1], clamp);
	return (
		<AbsoluteFill>
			<Board tint="#2a1a3a">
				<g transform={`translate(960,130) scale(${pop(f, 2)})`}>
					<text textAnchor="middle" y={30} fontSize={96} fontFamily={FONT} fontWeight={900} fill="#ffd34a" stroke="#11142c" strokeWidth={10} paintOrder="stroke">
						RULE #2
					</text>
				</g>
				<rect x={180} y={260} width={620} height={480} rx={40} fill="#11142c" stroke="#ff9a6a" strokeWidth={8} />
				<g transform={`translate(960,500)`} opacity={flow}>
					<path d={`M-110,0 L${-110 + 200 * flow},0`} stroke="#ffd34a" strokeWidth={22} strokeLinecap="round" />
					<path d={`M${70 * flow + 10},-40 l40,40 l-40,40`} stroke="#ffd34a" strokeWidth={22} fill="none" strokeLinecap="round" strokeLinejoin="round" />
				</g>
				<rect x={1120} y={260} width={620} height={480} rx={40} fill="#11142c" stroke="#7af0a8" strokeWidth={8} />
				<g transform="translate(1430,490) scale(0.8)">
					<BigHand tip={grow} glow={env(f, w('018', 0.62), 1e9, 6, 1)} />
				</g>
				<text x={960} y={850} textAnchor="middle" fontSize={56} fontFamily={FONT} fontWeight={900} fill="#fff">
					EVERY REGROWTH =
				</text>
				<text x={960} y={930} textAnchor="middle" fontSize={64} fontFamily={FONT} fontWeight={900} fill="#ff9a6a" opacity={pop(f, w('018', 0.7))}>
					A MOUNTAIN OF FOOD
				</text>
			</Board>
			<Prop3D
				x={180}
				y={260}
				w={620}
				h={480}
				make={() => {
					const scene = propScene(2.2);
					const pile: THREE.Object3D[] = [];
					for (let i = 0; i < 5; i++) {
						const b = makeBurger();
						b.scale.setScalar(1.3);
						at(b, 330 + (i % 3) * 110 + (i > 2 ? 55 : 0), 650 - (i > 2 ? 80 : 0), i * 10);
						b.rotation.x = 0.4;
						pile.push(b);
					}
					const box = makePizzaBox();
					box.scale.setScalar(1.2);
					at(box, 560, 560, -40);
					box.rotation.x = 0.5;
					scene.add(box, ...pile);
					return {scene, pile};
				}}
				update={(wd, ff) => (wd.pile as THREE.Object3D[]).forEach((b, i) => (b.rotation.y = Math.sin(ff / 30 + i) * 0.3))}
			/>
		</AbsoluteFill>
	);
	void gf;
};

/* ================================ 019–020 rule three: the tooth ================================ */
const PX = 900; // hero on the field
const R019: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const hitT = w('019', 0.34);
	const face: [number, number] = [PX + 40, HIP - 168];
	// the ball flies in from the right along an arc, bounces off the face and settles on the grass
	const b = f - hitT;
	let ball: [number, number];
	if (b < 0) {
		const k = interpolate(f, [hitT - 26, hitT], [0, 1], clamp);
		ball = [face[0] + 900 * (1 - k), face[1] - 260 * Math.sin(k * Math.PI) * 0.6 + 120 * (1 - k)];
	} else {
		const g = 1.8;
		const t = Math.min(b, 40);
		const y = face[1] - 10 * t + 0.5 * g * t * t;
		const groundY = 892;
		ball = [face[0] + 6 * Math.min(b, 60) + (b > 40 ? (b - 40) * 2 * Math.exp(-(b - 40) / 10) : 0), Math.min(groundY, y)];
	}
	// the tooth: out of the mouth, a small arc to the left, lands and stays
	const tb = f - hitT;
	const tooth: [number, number] = tb < 0 ? face : [face[0] - Math.min(tb, 22) * 7, Math.min(898, face[1] + 8 - 12 * tb + 0.6 * 1.8 * tb * tb)];
	const jerk = env(f, hitT, hitT + 12, 1, 10);
	const ouch = f > hitT;
	const hp = gesture('touchFace', {...idle(gf, 2), lean: -14 * jerk, head: -20 * jerk}, env(f, hitT + 8, 1e9, 8, 1), f);
	const cam = usePush(camOn(1000, 560, 1.15), camOn(960, 560, 1.4));
	return (
		<Stage cam={cam} bg="#8fd0ff" light={{x: 80, y: 0, o: 0.35, c: '255,250,220'}}>
			<Layer depth={1.6}>
				<Park f={gf} />
			</Layer>
			<Layer depth={1}>
				<Prop3D
					x={0}
					y={160}
					w={1920}
					h={760}
					make={() => {
						const scene = propScene(2.2);
						const ball = makeSoftball();
						const tooth = makeTooth();
						scene.add(ball, tooth);
						return {scene, ball, tooth};
					}}
					update={(wd, ff) => {
						at(wd.ball, ball[0], ball[1] - 2, 80);
						wd.ball.rotation.z = -ff * 0.3;
						wd.tooth.visible = f >= hitT;
						at(wd.tooth, tooth[0], tooth[1] - 2, 90);
						wd.tooth.rotation.z = tooth[1] >= 897 ? 1.4 : tb * 0.5;
					}}
				/>
				<Svg>
					<Actor who="hero" x={PX} floor={FL} s={HS} facing={1} faceTurn={0.4} look={ouch ? [0.1, -0.2] : [0.8, -0.1]} expr={ouch ? 'wide' : 'normal'} mouth={ouch ? 'open' : 'smile'} pose={hp} uid="h-019" />
					<HeroBadge x={PX} y={badgeY(FL)} s={0.8} />
					{f > hitT && f < hitT + 26 ? <Onoma x={face[0] + 90} y={face[1] - 70} text="BONK!" t={f - hitT} c="#ff8a7a" size={60} /> : null}
				</Svg>
			</Layer>
		</Stage>
	);
};
/* 019b by dinner: a new tooth has pushed in (mouth insert) */
const MouthInsert: React.FC<{grow: number}> = ({grow}) => (
	<g>
		<rect x={-300} y={-300} width={600} height={600} fill="#f2c9a5" />
		<path d="M-220,-30 Q0,-150 220,-30 Q160,170 0,180 Q-160,170 -220,-30 Z" fill="#7a2030" stroke="#2a1a14" strokeWidth={10} />
		{[-150, -90, -30, 30, 90, 150].map((x, i) => {
			const front = i === 2;
			const h = front ? 90 * grow : 80 - Math.abs(x) * 0.15;
			return front && grow <= 0.02 ? null : <rect key={x} x={x - 27} y={-80} width={54} height={h} rx={12} fill="#fbfaf2" stroke="#2a1a14" strokeWidth={6} />;
		})}
		<path d="M-220,-30 Q0,-80 220,-30" stroke="#d86a7a" strokeWidth={22} fill="none" />
	</g>
);
const R019b: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const grow = interpolate(f, [w('019', 0.72), w('019', 0.95)], [0, 1], clamp);
	const cam = usePush(camOn(960, 580, 1.25), camOn(940, 580, 1.4));
	return (
		<>
			<Stage cam={cam} bg="#4a3a6a" light={{x: 50, y: 10, o: 0.5, c: '255,230,180'}}>
				<Layer depth={1.4}>
					<DiningRoom />
				</Layer>
				<Layer depth={1}>
					<Svg>
						<SeatChair x={770} c="#6a4028" />
						<Actor who="hero" x={800} floor={FL} seat={SEAT} s={HS} facing={1} faceTurn={0.2} look={[0.1, -0.1]} mouth="smile" pose={gesture('point', seated(gf, 2), env(f, w('019', 0.75), 1e9, 8, 1), f)} uid="h-019b" />
						<HomeTable x={1080} />
					</Svg>
					<Prop3D
						x={860}
						y={600}
						w={460}
						h={200}
						make={() => {
							const scene = propScene();
							const plate = makeDinnerPlate();
							at(plate, 1020, HOME_TABLE_TOP - 4, 0);
							plate.rotation.x = 0.4;
							scene.add(plate);
							return {scene};
						}}
					/>
					<Svg>
						<HeroBadge x={800} y={SEAT - 164 - 118} s={0.8} />
					</Svg>
				</Layer>
			</Stage>
			<Over>
				<Insert x={1440} y={420} r={260} k={pop(f, w('019', 0.66))} id="mouth-019" bg="#f2c9a5" ring="#ffd34a">
					<g transform="scale(0.9)">
						<MouthInsert grow={grow} />
					</g>
				</Insert>
				<Tag f={f} t={w('019', 0.64)} x={440} y={220} text="BY DINNER" c="#11142c" fg="#ffd34a" size={44} rot={-4} />
			</Over>
		</>
	);
};
/* 020 old tooth vs factory-new tooth */
const BigTooth: React.FC<{old?: boolean; shine?: number}> = ({old, shine = 0}) => (
	<g>
		<path d="M-120,-150 Q0,-210 120,-150 Q150,-40 110,40 L80,190 Q60,230 30,190 L0,90 L-30,190 Q-60,230 -80,190 L-110,40 Q-150,-40 -120,-150 Z" fill={old ? '#efe2c0' : '#fbfaf6'} stroke="#2a1a14" strokeWidth={10} />
		{old ? (
			<g>
				<path d="M-40,-150 L20,-150 L30,-90 L-30,-80 Z" fill="#8a90a0" stroke="#2a1a14" strokeWidth={6} />
				{[[-70, -40, 16], [60, -20, 12], [10, 30, 10]].map(([x, y, r], i) => (
					<circle key={i} cx={x} cy={y} r={r} fill="#b89060" opacity={0.8} />
				))}
				<path d="M70,-140 l-20,40 l14,20 l-16,40" stroke="#2a1a14" strokeWidth={5} fill="none" />
			</g>
		) : (
			<path d="M-80,-130 Q-90,-60 -70,-10" stroke="#fff" strokeWidth={18} strokeLinecap="round" fill="none" opacity={0.8} />
		)}
		{shine > 0
			? Array.from({length: 6}).map((_, i) => {
					const a = (i / 6) * Math.PI * 2;
					return <path key={i} d={`M${Math.cos(a) * 200},${Math.sin(a) * 220} l0,-18 l5,13 l13,5 l-13,5 l-5,13 l-5,-13 l-13,-5 l13,-5 z`} fill="#fff4b0" opacity={shine} />;
				})
			: null}
	</g>
);
const R020: React.FC = () => {
	const {f} = useShot();
	const w = useW();
	return (
		<Board tint="#1a2a5a">
			<g transform={`translate(540,520) scale(${pop(f, 2)})`}>
				<rect x={-320} y={-360} width={640} height={720} rx={40} fill="#11142c" stroke="#8a90a0" strokeWidth={8} />
				<text y={-290} textAnchor="middle" fontSize={50} fontFamily={FONT} fontWeight={900} fill="#c8ccd8">
					OLD TOOTH
				</text>
				<g transform="translate(0,40) scale(0.95)">
					<BigTooth old />
				</g>
			</g>
			<g transform={`translate(1380,520) scale(${pop(f, w('020', 0.12))})`}>
				<rect x={-320} y={-360} width={640} height={720} rx={40} fill="#11142c" stroke="#7af0a8" strokeWidth={8} />
				<text y={-290} textAnchor="middle" fontSize={50} fontFamily={FONT} fontWeight={900} fill="#7af0a8">
					NEW TOOTH
				</text>
				<g transform="translate(0,40) scale(0.95)">
					<BigTooth shine={env(f, w('020', 0.2), 1e9, 8, 1)} />
				</g>
				{/* the stamp sits inside the card */}
				<g transform={`translate(110,250) rotate(-10) scale(${pop(f, w('020', 0.72))})`}>
					<rect x={-170} y={-48} width={340} height={96} rx={12} fill="none" stroke="#7af0a8" strokeWidth={8} />
					<text y={18} textAnchor="middle" fontSize={50} fontFamily={FONT} fontWeight={900} fill="#7af0a8">
						FACTORY NEW
					</text>
				</g>
			</g>
			<Tag f={f} t={w('020', 0.34)} x={960} y={380} text="NO FILLING" c="#11142c" fg="#fff" size={38} rot={-4} />
			<Tag f={f} t={w('020', 0.46)} x={960} y={520} text="NO STAINS" c="#11142c" fg="#fff" size={38} rot={3} />
		</Board>
	);
};

/* ================================ 021 Kyoto, 2024 ================================ */
const KX = 1060; // the Kyoto doctor
const CX = 760; // the patient in the dental chair
const R021: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const hold: [number, number] = [KX - 70, HIP - 70];
	const kp = reach(idle(gf, 4), 'F', [KX - hold[0], hold[1] - HIP], 1);
	const cam = usePush(camOn(1000, 560, 1.12), camOn(960, 580, 1.35));
	return (
		<Stage cam={cam} bg="#f0e6d2" light={{x: 75, y: 10, o: 0.4, c: '255,245,230'}}>
			<Layer depth={1.4}>
				<KyotoClinic f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<DentalChair x={CX} />
					<Actor who="kyopat" x={CX + 10} floor={FL} seat={SEAT - 4} s={0.98} facing={1} faceTurn={0.4} look={[0.6, -0.2]} mouth="smile" pose={{...SIT, lean: -12, head: -4}} uid="kp-021" />
					<Actor who="kyodoc" x={KX} floor={FL} s={0.98} facing={-1} faceTurn={0.4} look={[-0.6, 0.1]} pose={kp} uid="kd-021" />
				</Svg>
				<Prop3D
					x={800}
					y={440}
					w={460}
					h={360}
					make={() => {
						const scene = propScene();
						const vial = makeVial('TRG');
						const syr = makeSyringe();
						scene.add(vial, syr);
						return {scene, vial, syr};
					}}
					update={(wd) => {
						at(wd.vial, hold[0] - 4, hold[1] + 14, 60);
						wd.vial.rotation.set(0.15, 0.3, 0);
						placeTool(wd.syr, 66, -40, [KX + 70, HIP - 40], 170, 0.8, 50);
						wd.syr.visible = false;
					}}
				/>
				<Svg>
					<Tag f={f} t={w('021', 0.2)} x={880} y={200} text="KYOTO · 2024" c="#11142c" fg="#f6b8cc" stroke="#f6b8cc" size={42} rot={-4} />
					<Tag f={f} t={w('021', 0.32)} x={1380} y={560} text="FIRST HUMAN TRIAL" c="#11142c" fg="#ffd34a" size={34} rot={3} />
					<Tag f={f} t={w('021', 0.46)} x={1300} y={660} text="TOOTH-GROWING DRUG" c="#11142c" fg="#9fd8ff" stroke="#9fd8ff" size={32} rot={-2} />
				</Svg>
			</Layer>
		</Stage>
	);
};
/* 021b the timeline: 2024 → ~2030 */
const R021b: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const k = interpolate(f, [w('021', 0.66), w('021', 0.92)], [0, 1], clamp);
	return (
		<Board tint="#1a2a4a">
			<g transform="translate(960,420)">
				<line x1={-620} y1={0} x2={620} y2={0} stroke="#3a4a6a" strokeWidth={22} strokeLinecap="round" />
				<line x1={-620} y1={0} x2={-620 + 1240 * k} y2={0} stroke="#f6b8cc" strokeWidth={22} strokeLinecap="round" />
				{[2024, 2026, 2028, 2030].map((y, i) => (
					<g key={y} transform={`translate(${-620 + (i * 1240) / 3},0)`}>
						<circle r={30} fill={k >= i / 3 ? '#f6b8cc' : '#3a4a6a'} stroke="#11142c" strokeWidth={6} />
						<text y={90} textAnchor="middle" fontSize={46} fontFamily={FONT} fontWeight={900} fill="#fff">
							{y}
						</text>
					</g>
				))}
				<text x={-620} y={-70} textAnchor="middle" fontSize={34} fontFamily={FONT} fontWeight={900} fill="#9fd8ff">
					TRIAL STARTS
				</text>
				<text x={620} y={-70} textAnchor="middle" fontSize={34} fontFamily={FONT} fontWeight={900} fill="#ffd34a" opacity={k}>
					HOPED: PATIENTS
				</text>
				<g transform={`translate(620,-190) scale(${0.25 * pop(f, w('021', 0.9))})`}>
					<BigTooth shine={1} />
				</g>
			</g>
			<ellipse cx={960} cy={1004} rx={100} ry={14} fill="#000" opacity={0.3} />
			<Actor who="hero" x={960} floor={1000} s={0.62} facing={1} faceTurn={0.2} look={[0.3, -0.4]} mouth="smile" pose={gesture('presentF', idle(gf, 2), env(f, 4, 1e9, 8, 1), f)} uid="h-021b" />
		</Board>
	);
};

/* ================================ 022 the dangerous question ================================ */
const R022: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const wk = walkTo(f, 2, w('022', 0.3), 560, 760, 2, 0.28);
	const hp = gesture('rubChin', wk.moving ? wk.pose : idle(gf, 2), env(f, w('022', 0.35), 1e9, 10, 1), f);
	const cam = usePush(camOn(1000, 520, 1.12), camOn(940, 540, 1.35));
	return (
		<Stage cam={cam} bg="#141c34" light={{x: 60, y: 30, o: 0.45, c: '220,240,255'}}>
			<Layer depth={1.4}>
				<XrayOffice f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={wk.x} floor={FL} s={HS} facing={1} faceTurn={0.5} look={[0.8, -0.4]} expr="worried" pose={hp} vx={wk.vx} bob={wk.bob} uid="h-022" />
					<HeroBadge x={wk.x} y={badgeY(FL) - wk.bob} s={0.8} />
					<Bubble x={wk.x - 220} y={300} w={460} h={150} t={f - w('022', 0.55)} thought tail={[180, 160]}>
						<text y={-10} textAnchor="middle" fontSize={36} fontFamily={FONT} fontWeight={900} fill="#13203a">
							What else could
						</text>
						<text y={36} textAnchor="middle" fontSize={36} fontFamily={FONT} fontWeight={900} fill="#d23b3b">
							I give away?
						</text>
					</Bubble>
				</Svg>
			</Layer>
		</Stage>
	);
};

/* ================================ 023–024 the liver ================================ */
const LIVER = 'M-280,-30 C-270,-150 -60,-170 80,-140 C220,-110 300,-60 280,10 C260,80 120,130 0,140 C-140,150 -290,90 -280,-30 Z';
const Liver: React.FC<{keep: number; give: number; regrow: number; id: string}> = ({keep, give, regrow, id}) => {
	const cut = -60; // the donor part is everything right of this line
	const xr = cut + (300 - cut) * regrow;
	return (
		<g>
			<defs>
				<clipPath id={`${id}-l`}>
					<rect x={-320} y={-200} width={cut + 320} height={400} />
				</clipPath>
				<clipPath id={`${id}-g`}>
					<rect x={cut} y={-200} width={400} height={400} />
				</clipPath>
				<clipPath id={`${id}-r`}>
					<rect x={cut - 2} y={-200} width={xr - cut + 2} height={400} />
				</clipPath>
			</defs>
			<path d={LIVER} fill="none" stroke="#ffffff" strokeWidth={5} strokeDasharray="14 12" opacity={0.35} />
			<g clipPath={`url(#${id}-l)`} opacity={keep}>
				<path d={LIVER} fill="#b8504a" stroke="#2a1a14" strokeWidth={9} />
			</g>
			<g clipPath={`url(#${id}-r)`}>
				<path d={LIVER} fill="#d06a5a" stroke="#2a1a14" strokeWidth={9} />
			</g>
			{give > 0 ? (
				<g transform={`translate(${520 * give},${40 * give})`} clipPath={`url(#${id}-g)`}>
					<path d={LIVER} fill="#b8504a" stroke="#2a1a14" strokeWidth={9} />
				</g>
			) : null}
		</g>
	);
};
const R023: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const give = interpolate(f, [w('023', 0.3), w('023', 0.5)], [0, 1], {...clamp, easing: (k) => 1 - (1 - k) * (1 - k)});
	const regrow = interpolate(f, [w('023', 0.62), w('023', 0.95)], [0, 1], clamp);
	const months = interpolate(f, [w('023', 0.62), w('023', 0.95)], [0, 2], clamp);
	return (
		<Board tint="#3a1a2a">
			<Tag f={f} t={4} x={330} y={150} text="REAL FACT" c="#11142c" fg="#7af0a8" stroke="#7af0a8" size={44} rot={-4} />
			<g transform="translate(700,480) scale(1.15)">
				<Liver keep={1} give={give} regrow={regrow} id="lv23" />
			</g>
			<text x={700} y={720} textAnchor="middle" fontSize={44} fontFamily={FONT} fontWeight={900} fill="#ffb0a0" opacity={pop(f, w('023', 0.2))}>
				DONOR'S LIVER
			</text>
			<Tag f={f} t={w('023', 0.42)} x={1450} y={330} text="TO A PATIENT" c="#11142c" fg="#ffd34a" size={36} rot={3} />
			<g transform="translate(960,880)">
				<rect x={-260} y={-60} width={520} height={120} rx={30} fill="#11142c" stroke="#7af0a8" strokeWidth={6} opacity={regrow > 0 ? 1 : 0} />
				<text y={20} textAnchor="middle" fontSize={56} fontFamily={FONT} fontWeight={900} fill="#7af0a8" opacity={regrow > 0 ? 1 : 0}>
					{months < 1.95 ? `${months.toFixed(1)} MONTHS` : '~2 MONTHS'}
				</text>
			</g>
		</Board>
	);
	void gf;
};
const R024: React.FC = () => {
	const {f, gf} = useShot();
	const regrow = interpolate(f, [8, 30], [0, 1], clamp);
	return (
		<Board tint="#1a1a4a">
			<g transform="translate(700,470) scale(1.15)">
				<Liver keep={1} give={0} regrow={regrow} id="lv24" />
			</g>
			<Sparkles x={760} y={470} k={env(f, 26, 1e9, 4, 1)} r={260} n={10} />
			<g transform="translate(1440,300)">
				<circle r={70} fill="#fff4c0" />
				<circle cx={30} cy={-20} r={62} fill="#1a1a4a" />
			</g>
			<Tag f={f} t={4} x={1440} y={480} text="YOURS: 1 NIGHT" c="#11142c" fg="#ffd34a" size={52} rot={-3} />
			<ellipse cx={1440} cy={1004} rx={100} ry={14} fill="#000" opacity={0.3} />
			<Actor who="hero" x={1440} floor={1000} s={0.62} facing={-1} faceTurn={0.3} look={[-0.4, -0.3]} mouth="smile" pose={gesture('point', idle(gf, 2), 1, f)} uid="h-024" />
		</Board>
	);
};

export const SHOTS_R2: ShotDef[] = [
	{at: '015', C: R015, whip: true},
	{at: '015', off: 200, C: R015b},
	{at: '016', C: R016, whip: true},
	{at: '017', C: R017, whip: true},
	{at: '018', C: R018, whip: true},
	{at: '019', C: R019, whip: true},
	{at: '019', off: 123, C: R019b, whip: true},
	{at: '020', C: R020, whip: true},
	{at: '021', C: R021, whip: true},
	{at: '021', off: 209, C: R021b},
	{at: '022', C: R022, whip: true},
	{at: '023', C: R023, whip: true},
	{at: '024', C: R024},
];

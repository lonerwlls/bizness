import React from 'react';
import {AbsoluteFill, Easing, interpolate, random} from 'remotion';
import * as THREE from 'three';
import {Pose} from '../engine/Stickman';
import {SIT, env, gesture, idle, reach, walkTo} from '../kit/actions';
import {Actor, useShot} from '../kit/core';
import type {ShotDef} from '../kit/coverage';
import {Extra, HeroBadge, Layer, Stage, Svg, camOn, clamp, usePush} from '../kit/kit';
import {Board, Bubble, FONT} from '../kit/ui';
import {Onoma} from '../reference/PauseTime';
import {Prop3D, at, propScene} from '../three/Prop3D';
import {makeHose, makeAlarm, makeGlass, makeJar, makeNightstand, makeRings, makeSpoon, makeStethoscope, makeSubButton, makeTeacup, makeTrophy, makeWallClock, makeWaterGlass, openDrawer} from '../three/props';
import {CAST} from './cast';
import {FL, HS, badgeY} from './common';
import {SEAT, SeatChair} from './places';
import {Tag, camPath, jolt, pop, useW} from './lib';
import {QuoteCard} from './partC';
import {OldFilm} from './placesH';
import {DinnerTable} from './placesD';
import {Armchair2, Consult, FarmSunset, OldBed, OldBedroom, OldBlanket, OldKitchen, OldLiving, PhotoCard, TeenRoom} from './placesE';

/* PART E (4:46–6:03): the morning the hiccups stop, the silence, the heartbeat; the real
   Charles Osborne; the question and the next episode. */
const OLD5 = ['glasses', 'scarf', 'mustache'] as ('glasses' | 'scarf' | 'mustache')[];
const YOUNG = {age: 0, hairColor: CAST.hero.hairColor};
const BEDX = 1150;
const NS: [number, number] = [700, 900]; // nightstand (bottom centre)
const inBed = (lean = -20): Pose => ({lean, head: -4, armF: [30, 40], armB: [20, 40], legF: [90, 0], legB: [88, 2]});

/* ---------- 049 one morning at ninety-six: the house is too quiet ---------- */
const E049: React.FC = () => {
	const {f, gf, dur} = useShot();
	const w = useW();
	const awake = f > w('049', 0.25);
	const lookX = awake ? Math.sin(f / 14) * 0.7 : 0.2;
	const cam = camPath(f, [
		[0, camOn(1000, 600, 1.25)],
		[w('049', 0.6), camOn(980, 600, 1.5, {farBlur: 7})],
		[dur, camOn(980, 590, 1.6, {farBlur: 7})],
	]);
	return (
		<Stage cam={cam} bg="#dccab0" light={{x: 85, y: 10, o: 0.5, c: '255,226,170'}}>
			<Layer depth={1.4}>
				<OldBedroom f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<OldBed x={BEDX} />
					<Actor who="hero" x={960} floor={FL} seat={816} s={HS} facing={1} faceTurn={0.2} look={[lookX, 0]} expr={awake ? 'worried' : 'sleepy'} pose={inBed()} acc={OLD5} uid="h-049" />
					<OldBlanket x={BEDX} />
				</Svg>
				<Prop3D
					x={560}
					y={600}
					w={300}
					h={320}
					make={() => {
						const scene = propScene();
						const n = makeNightstand();
						at(n, NS[0], NS[1], 0);
						n.rotation.set(0.12, 0.3, 0);
						const a = makeAlarm();
						at(a, NS[0] - 30, NS[1] - 170, 20);
						a.rotation.y = 0.4;
						const g = makeWaterGlass();
						g.scale.setScalar(0.5);
						at(g, NS[0] + 40, NS[1] - 170, 20);
						scene.add(n, a, g);
						return {scene};
					}}
				/>
				<Svg>
					<HeroBadge x={930} y={560} s={0.75} />
					<Tag f={f} t={6} x={760} y={300} text="AGE 96" c="#11142c" fg="#9fd8ff" stroke="#9fd8ff" size={36} rot={-3} />
					<Tag f={f} t={w('049', 0.7)} x={1260} y={360} text="TOO QUIET" c="#3a1d2a" fg="#ff9a8a" stroke="#ff6a5a" size={36} rot={3} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* ---------- 050 waiting at the kitchen table: a minute, ten, an hour ---------- */
const E050: React.FC = () => {
	const {f, gf, dur} = useShot();
	const w = useW();
	const hours = interpolate(f, [w('050', 0.2), dur - 4], [7.0, 8.2], clamp);
	const marks: [number, string][] = [
		[w('050', 0.22), '1 MINUTE'],
		[w('050', 0.42), '10 MINUTES'],
		[w('050', 0.7), '1 HOUR'],
	];
	const cur = marks.filter(([t]) => f >= t).pop();
	const cam = usePush(camOn(960, 560, 1.25), camOn(960, 540, 1.45));
	return (
		<Stage cam={cam} bg="#c8dcc0" light={{x: 30, y: 0, o: 0.45, c: '255,240,210'}}>
			<Layer depth={1.4}>
				<OldKitchen />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<SeatChair x={790} c="#6a4a2e" />
					<Actor who="hero" x={810} floor={FL} seat={SEAT} s={HS} facing={1} faceTurn={0.4} look={[0.4, -0.5]} expr="worried" pose={reach({...SIT, armB: [40, 60]}, 'F', [150, -110], 1)} acc={OLD5} uid="h-050" />
					<DinnerTable x={1060} w={340} />
				</Svg>
				<Prop3D
					x={820}
					y={160}
					w={420}
					h={560}
					make={() => {
						const scene = propScene();
						const c = makeWallClock();
						at(c, 1060, 280, -40);
						const cup = makeTeacup();
						at(cup, 1000, 700, 20);
						cup.rotation.x = 0.25;
						scene.add(c, cup);
						return {scene, c};
					}}
					update={(wd) => (wd.c.userData.set as (h: number) => void)(hours)}
				/>
				<Svg>
					<HeroBadge x={810} y={SEAT - 164 - 118} s={0.8} />
					{cur ? <Tag f={f} t={cur[0]} x={1360} y={420} text={cur[1]} c="#11142c" fg="#ffd34a" size={40} rot={4} /> : null}
					<Tag f={f} t={w('050', 0.9)} x={1360} y={520} text="NOTHING" c="#3a1d2a" fg="#ff9a8a" stroke="#ff6a5a" size={40} rot={-3} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* ---------- 051 gone; nobody knows why — not even the doctors ---------- */
const E051: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const shrug = env(f, w('051', 0.45), 1e9, 10, 1);
	const cam = usePush(camOn(960, 560, 1.2), camOn(980, 540, 1.4));
	return (
		<Stage cam={cam} bg="#e2eaf2" light={{x: 30, y: 0, o: 0.4, c: '240,248,255'}}>
			<Layer depth={1.4}>
				<Consult />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<SeatChair x={760} c="#3d6fd6" />
					<Actor who="hero" x={780} floor={FL} seat={SEAT} s={HS} facing={1} faceTurn={0.4} look={[0.7, 0]} expr="normal" pose={{...SIT, armF: [40, 60], armB: [30, 60]}} acc={OLD5} uid="h-051" />
					<Actor who="youngdoc" x={1120} floor={FL} s={1} facing={-1} faceTurn={0.4} look={[-0.6, 0]} expr="worried" pose={gesture('shrug', idle(gf, 6), shrug, f)} uid="ydoc-51" />
					<HeroBadge x={780} y={SEAT - 164 - 118} s={0.8} />
					<Tag f={f} t={w('051', 0.05)} x={1300} y={300} text="JUST GONE" c="#1d3a2a" fg="#9ff0b0" stroke="#3fcf7a" size={36} rot={3} />
					<Tag f={f} t={w('051', 0.5)} x={960} y={200} text="NOBODY KNOWS WHY" c="#11142c" fg="#ffd34a" size={36} rot={-3} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* ---------- 052 the silence is terrifying ---------- */
const E052: React.FC = () => {
	const {f, gf} = useShot();
	const cam = usePush(camOn(1000, 560, 1.0), camOn(960, 600, 1.35));
	return (
		<Stage cam={cam} bg="#120e1c" light={{x: 45, y: 40, o: 0.45, c: '255,214,150'}} vig={0.75}>
			<Layer depth={1.4}>
				<OldLiving f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Armchair2 x={930} />
					<Actor who="hero" x={950} floor={FL} seat={808} s={HS} facing={1} faceTurn={0.2} look={[0.1, 0]} expr="worried" pose={{...SIT, lean: -6, armF: [40, 60], armB: [30, 60]}} acc={OLD5} uid="h-052" />
					<Tag f={f} t={10} x={1280} y={330} text="SILENCE" c="#11142c" fg="#ffffff" stroke="#9fd8ff" size={44} rot={3} />
				</Svg>
			</Layer>
		</Stage>
	);
};
const E052b: React.FC = () => <QuoteCard lines={['"I don\'t know what', 'it would be like', 'not to have them."']} who="— CHARLES OSBORNE, 1978" t0={2} />;

/* ---------- 053 the old stethoscope from the drawer, pressed to his own chest ---------- */
const HX53 = 840;
const ChestShot: React.FC<{beat: 'take' | 'listen'}> = ({beat}) => {
	const {f, gf, dur} = useShot();
	const w = useW();
	const T = (x: number, y: number, z = 0) => new THREE.Vector3(x, -y, z);
	const seat = 816;
	const base: Pose = {...SIT, lean: 4, armB: [30, 60], armF: [30, 60]};
	const head = {x: HX53 - Math.sin((4 * Math.PI) / 180) * 164, y: seat - Math.cos((4 * Math.PI) / 180) * 164};
	const knob: [number, number] = [NS[0] + 6, NS[1] - 135];
	const ear: [number, number] = [head.x - 40, head.y + 30];
	const heart: [number, number] = [HX53 + 10, seat - 84];
	// timeline of the hand: knob (pull) → into the drawer (grab) → up to the ears → down to the heart
	const k = (a: number, b: number) => interpolate(f, [a, b], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const open = beat === 'take' ? k(8, 24) : 1;
	let hand: [number, number];
	let stage: 'drawer' | 'hand' | 'ears';
	if (beat === 'listen') {
		hand = heart;
		stage = 'ears';
	} else {
		const p1 = k(0, 8); // to the knob
		const p2 = k(26, 36); // into the drawer
		const p3 = k(42, 62); // up to the ears
		const p4 = k(66, 88); // down to the heart
		const rest: [number, number] = [HX53 - 40, seat - 20];
		const inD: [number, number] = [knob[0] + 4, knob[1] + 6];
		const mix = (a: [number, number], b: [number, number], t: number): [number, number] => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
		hand = mix(rest, knob, p1);
		if (f > 24) hand = mix(knob, inD, p2);
		if (f > 40) hand = mix(inD, ear, p3);
		if (f > 64) hand = mix(ear, heart, p4);
		stage = f < 38 ? 'drawer' : f < 62 ? 'hand' : 'ears';
	}
	const hp = reach(base, 'F', [HX53 - hand[0], hand[1] - seat], 1);
	const beatK = beat === 'listen' ? Math.max(0, Math.sin(((f - 6) / 26) * Math.PI * 2)) ** 6 : 0;
	const warm = beat === 'listen' ? interpolate(f, [0, dur], [0, 1], clamp) : 0;
	const cam =
		beat === 'take'
			? camPath(f, [
					[0, camOn(790, 650, 1.5, {farBlur: 7})],
					[40, camOn(800, 620, 1.55, {farBlur: 7})],
					[dur, camOn(830, 560, 1.8, {farBlur: 8})],
				])
			: usePush(camOn(830, 560, 1.85, {farBlur: 8}), camOn(830, 540, 2.15, {farBlur: 9}));
	return (
		<Stage cam={cam} bg="#dccab0" light={{x: 85, y: 10, o: 0.5 + 0.25 * warm, c: '255,220,160'}}>
			<Layer depth={1.4}>
				<OldBedroom f={gf} warm={warm} />
			</Layer>
			<Layer depth={1}>
				<Prop3D
					x={560}
					y={600}
					w={300}
					h={320}
					make={() => {
						const scene = propScene();
						const n = makeNightstand();
						at(n, NS[0], NS[1], 0);
						n.rotation.set(0.12, 0.3, 0);
						const a = makeAlarm();
						at(a, NS[0] - 30, NS[1] - 170, 20);
						a.rotation.y = 0.4;
						scene.add(n, a);
						return {scene, n};
					}}
					update={(wd) => openDrawer(wd.n, open)}
				/>
				<Svg>
					<OldBed x={BEDX} />
					<Actor who="hero" x={HX53} floor={FL} seat={seat} s={HS} facing={-1} faceTurn={0.3} look={beat === 'listen' ? [0, 0] : [-0.5, 0.5]} expr={beat === 'listen' ? 'sleepy' : 'normal'} mouth={beat === 'listen' && f > 20 ? 'smile' : undefined} pose={hp} acc={OLD5} uid="h-053" />
					{beat === 'listen' ? <circle cx={heart[0]} cy={heart[1]} r={30 + 26 * beatK} fill="#ff6a7a" opacity={0.15 + 0.35 * beatK} /> : null}
				</Svg>
				<Prop3D
					x={560}
					y={460}
					w={460}
					h={460}
					make={() => {
						const scene = propScene();
						const piece = new THREE.Group();
						piece.add(new THREE.Mesh(new THREE.CylinderGeometry(13, 13, 8, 20), new THREE.MeshToonMaterial({color: '#c9d0dc'})));
						piece.children[0].rotation.x = Math.PI / 2;
						scene.add(piece);
						return {scene, piece, tubes: [] as THREE.Object3D[]};
					}}
					update={(wd) => {
						for (const t of wd.tubes) wd.scene.remove(t);
						wd.tubes = [];
						const add = (pts: THREE.Vector3[]) => {
							const h = makeHose(pts);
							wd.scene.add(h);
							wd.tubes.push(h);
						};
						if (stage === 'drawer') {
							wd.piece.visible = open > 0.5;
							const d: [number, number] = f > 24 ? [hand[0], hand[1]] : [knob[0] - 10, knob[1] + 4];
							at(wd.piece, d[0] - 14, d[1] + 2, 70);
							if (open > 0.5) add([T(d[0] - 14, d[1] + 2, 70), T(d[0] + 10, d[1] - 6, 70), T(d[0] + 30, d[1] + 4, 70), T(d[0] + 6, d[1] + 10, 70)]);
						} else if (stage === 'hand') {
							wd.piece.visible = true;
							at(wd.piece, hand[0], hand[1] + 70, 70);
							add([T(hand[0], hand[1] + 62, 70), T(hand[0] + 8, hand[1] + 30, 70), T(hand[0], hand[1], 70)]);
							add([T(hand[0], hand[1], 70), T(hand[0] - 16, hand[1] - 10, 70), T(hand[0] - 26, hand[1] + 6, 70)]);
						} else {
							wd.piece.visible = true;
							at(wd.piece, hand[0], hand[1], 70);
							const J: [number, number] = [head.x + 2, head.y + 74];
							add([T(hand[0], hand[1] - 6, 70), T(hand[0] - 8, hand[1] - 40, 70), T(J[0], J[1], 70)]);
							add([T(J[0], J[1], 70), T(head.x - 40, head.y + 52, 70), T(head.x - 48, head.y + 8, 70)]);
							add([T(J[0], J[1], 70), T(head.x + 40, head.y + 52, 70), T(head.x + 48, head.y + 8, 70)]);
						}
					}}
				/>
				<Svg>
					{beat === 'listen' && f > 30 ? <Onoma x={HX53 - 220} y={560} text="ba-dum" t={(f - 30) % 26} c="#ff8a9a" size={44} rot={-6} /> : null}
					{beat === 'listen' ? <Tag f={f} t={w('054', 0.55)} x={560} y={380} text="JUST A HEARTBEAT" c="#11142c" fg="#ff9ab0" stroke="#ff6a8a" size={36} rot={-3} /> : null}
					{beat === 'take' ? <Tag f={f} t={8} x={1060} y={330} text="THE OLD STETHOSCOPE" c="#11142c" fg="#ffd34a" size={32} rot={3} /> : null}
				</Svg>
			</Layer>
		</Stage>
	);
};

const E053: React.FC = () => <ChestShot beat="take" />;
const E054: React.FC = () => <ChestShot beat="listen" />;

/* ---------- 055 the real Charles Osborne ---------- */
const E055: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const k = interpolate(f, [w('055', 0.2), w('055', 0.6)], [0, 1], clamp);
	return (
		<AbsoluteFill style={{filter: 'sepia(0.8) contrast(1.05)'}}>
			<Board tint="#5a4630">
				<PhotoCard x={520} y={520} caption="Charles Osborne" k={pop(f, 2)} />
				<g transform="translate(1250,420)" opacity={pop(f, w('055', 0.15))}>
					<text textAnchor="middle" fontSize={64} fontFamily={FONT} fontWeight={900} fill="#2a1a0e">
						HICCUPS
					</text>
					<rect x={-330} y={40} width={660} height={36} rx={18} fill="#cbb48a" />
					<rect x={-330} y={40} width={660 * k} height={36} rx={18} fill="#8a3a2a" />
					<text x={-330} y={130} fontSize={46} fontFamily={FONT} fontWeight={900} fill="#2a1a0e">
						1922
					</text>
					<text x={330} y={130} textAnchor="end" fontSize={46} fontFamily={FONT} fontWeight={900} fill="#2a1a0e">
						1990
					</text>
				</g>
				<g transform="translate(1250,700)" opacity={pop(f, w('055', 0.6))}>
					<text textAnchor="middle" fontSize={54} fontFamily={FONT} fontWeight={900} fill="#5a2a1a">
						DIED 1991, AGE 97
					</text>
				</g>
			</Board>
			<OldFilm f={gf} />
		</AbsoluteFill>
	);
};

/* ---------- 056 married twice, eight kids, the world record ---------- */
const E056: React.FC = () => {
	const {f} = useShot();
	const w = useW();
	const t1 = w('056', 0.05);
	const t2 = w('056', 0.25);
	const t3 = w('056', 0.5);
	return (
		<>
		<Board tint="#2a2a40">
			<g opacity={f > t1 ? 1 : 0}>
				<text x={330} y={760} textAnchor="middle" fontSize={44} fontFamily={FONT} fontWeight={900} fill="#ffd34a">
					MARRIED TWICE
				</text>
			</g>
			<g opacity={f > t2 ? 1 : 0}>
				{Array.from({length: 8}).map((_, i) => (
					<g key={i} transform={`translate(${780 + (i % 4) * 90},${(i < 4 ? 520 : 680)}) scale(${pop(f, t2 + i * 3)})`}>
						<Extra i={i + 20} seed="kids8" x={0} floor={0} s={0.42} />
					</g>
				))}
				<text x={915} y={760} textAnchor="middle" fontSize={44} fontFamily={FONT} fontWeight={900} fill="#9fd8ff">
					8 KIDS
				</text>
			</g>
			<g opacity={f > t3 ? 1 : 0}>
				<text x={1530} y={760} textAnchor="middle" fontSize={40} fontFamily={FONT} fontWeight={900} fill="#9ff0b0">
					WORLD RECORD
				</text>
				<text x={1530} y={810} textAnchor="middle" fontSize={30} fontFamily={FONT} fontWeight={700} fill="#cfe9ff">
					longest attack of hiccups
				</text>
			</g>
		</Board>
		<AbsoluteFill>
			<Prop3D
				x={130}
				y={300}
				w={1660}
				h={420}
				make={() => {
					const scene = propScene();
					const r = makeRings();
					at(r, 330, 520, 0);
					const tr = makeTrophy();
					at(tr, 1530, 680, 0);
					tr.rotation.x = 0.15;
					scene.add(r, tr);
					return {scene, r, tr};
				}}
				update={(wd, ff) => {
					wd.r.visible = ff > t1;
					wd.r.scale.setScalar(1.6 * pop(ff, t1));
					wd.r.rotation.y = ff * 0.03;
					wd.tr.visible = ff > t3;
					wd.tr.scale.setScalar(1.5 * pop(ff, t3));
					wd.tr.rotation.y = ff * 0.025;
				}}
			/>
		</AbsoluteFill>
		</>
	);
};

/* ---------- 057 he just kept living (sepia, sunset) ---------- */
const E057: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const wk = walkTo(f, 0, w('057', 1.2), 520, 1060, 7, 0.16);
	const hics = [w('057', 0.3), w('057', 0.75)];
	const fj = jolt(f, hics);
	const cam = usePush(camOn(760, 600, 1.25), camOn(980, 600, 1.35));
	return (
		<AbsoluteFill style={{filter: 'sepia(0.85) saturate(0.9) contrast(1.05)'}}>
			<Stage cam={cam} bg="#e8a060" light={{x: 70, y: 40, o: 0.45, c: '255,214,150'}} grain={0.25} vig={0.7}>
				<Layer depth={1.4}>
					<FarmSunset f={gf} />
				</Layer>
				<Layer depth={1}>
					<Svg>
						<Actor who="farmer" x={wk.x} floor={FL} s={1} facing={1} faceTurn={0.4} look={[0.6, -0.1]} mouth="smile" pose={{...reach(wk.moving ? wk.pose : idle(gf, 7), 'F', [40, 110], 1), lean: 8, head: -10 * fj}} vx={wk.vx} bob={wk.bob + fj * 8} handItem={<rect x={-4} y={-6} width={8} height={130} rx={4} fill="#5a3a22" />} hairColor="#d9d9e0" age={0.9} uid="osb-57" />
						{hics.map((t, i) => (f > t - 1 && f < t + 26 ? <Onoma key={i} x={wk.x + 120} y={520} text="HIC!" t={f - t} c="#fff4d8" size={52} /> : null))}
						<Tag f={f} t={w('057', 0.05)} x={1200} y={300} text="NO CURE" c="#2a1a10" fg="#fff4d8" stroke="#c9a06a" size={36} rot={3} />
					</Svg>
				</Layer>
				<Layer depth={0.9}>
					<OldFilm f={gf} />
				</Layer>
			</Stage>
		</AbsoluteFill>
	);
};

/* ---------- 058 most hiccups stop in minutes — you're only 430 million behind ---------- */
const E058: React.FC = () => {
	const {f} = useShot();
	const w = useW();
	const t2 = w('058', 0.55);
	const big = Math.round(interpolate(f, [t2, t2 + 30], [0, 430_000_000], clamp));
	return (
		<Board tint="#1a2150">
			<g transform={`translate(960,300) scale(${pop(f, 4)})`}>
				<text textAnchor="middle" fontSize={70} fontFamily={FONT} fontWeight={900} fill="#9ff0b0">
					MOST HICCUPS STOP
				</text>
				<text y={80} textAnchor="middle" fontSize={70} fontFamily={FONT} fontWeight={900} fill="#9ff0b0">
					IN A FEW MINUTES
				</text>
			</g>
			<g transform={`translate(960,640) scale(${pop(f, t2)})`} opacity={f > t2 ? 1 : 0}>
				<text textAnchor="middle" fontSize={60} fontFamily={FONT} fontWeight={900} fill="#fff">
					YOU'RE ONLY
				</text>
				<text y={110} textAnchor="middle" fontSize={120} fontFamily={FONT} fontWeight={900} fill="#ffd34a" stroke="#11142c" strokeWidth={10} paintOrder="stroke">
					{big.toLocaleString('en-US')}
				</text>
				<text y={180} textAnchor="middle" fontSize={60} fontFamily={FONT} fontWeight={900} fill="#fff">
					BEHIND
				</text>
			</g>
		</Board>
	);
};

/* ---------- 059 the question: your weirdest cure? (young Doctor ROO at a table of cures) ---------- */
const E059: React.FC = () => {
	const {f, gf} = useShot();
	const cam = usePush(camOn(960, 560, 1.2), camOn(960, 540, 1.35));
	return (
		<Stage cam={cam} bg="#3a1a5a" light={{x: 50, y: 30, o: 0.45}}>
			<Layer depth={1.3}>
				<Svg>
					<rect x={-400} y={-300} width={2800} height={1600} fill="#2f5a8a" />
					{Array.from({length: 22}).map((_, i) => (
						<polygon key={i} points={`960,520 ${960 + Math.cos((i / 22) * Math.PI * 2 + f / 220) * 2000},${520 + Math.sin((i / 22) * Math.PI * 2 + f / 220) * 2000} ${960 + Math.cos(((i + 0.5) / 22) * Math.PI * 2 + f / 220) * 2000},${520 + Math.sin(((i + 0.5) / 22) * Math.PI * 2 + f / 220) * 2000}`} fill="#3a6a9a" />
					))}
					<rect x={-400} y={900} width={2800} height={400} fill="#1d2f4a" />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={720} floor={FL} s={HS} facing={1} faceTurn={0.3} look={[0.5, 0]} mouth="smile" pose={gesture('presentF', idle(gf, 2), env(f, 8, 1e9, 10, 1), f)} {...YOUNG} uid="h-059" />
					<DinnerTable x={1180} w={420} />
				</Svg>
				<Prop3D
					x={960}
					y={520}
					w={440}
					h={200}
					make={() => {
						const scene = propScene();
						const p = makeJar('pickle');
						p.scale.setScalar(0.6);
						at(p, 1060, 700, 0);
						const b = makeJar('pb');
						b.scale.setScalar(0.55);
						at(b, 1180, 700, 0);
						const g = makeWaterGlass();
						g.scale.setScalar(0.55);
						at(g, 1290, 700, 0);
						const s = makeSpoon();
						at(s, 1350, 690, 20);
						s.rotation.z = 1.3;
						for (const o of [p, b, g]) o.rotation.x = 0.2;
						scene.add(p, b, g, s);
						return {scene};
					}}
				/>
				<Svg>
					<Bubble x={1180} y={320} w={560} h={130} t={f - 6} tail={[-200, 100]}>
						<text y={-6} textAnchor="middle" fontSize={40} fontFamily={FONT} fontWeight={900} fill="#13203a">
							Your weirdest cure?
						</text>
						<text y={40} textAnchor="middle" fontSize={32} fontFamily={FONT} fontWeight={900} fill="#d23b3b">
							↓ COMMENTS
						</text>
					</Bubble>
				</Svg>
			</Layer>
		</Stage>
	);
};

/* ---------- 060 subscribe — next: the teenager who stayed awake for eleven days ---------- */
const E060: React.FC = () => {
	const {f, gf, dur} = useShot();
	const out = interpolate(f, [dur - 24, dur - 2], [0, 1], clamp);
	const press = env(f, 14, 30, 6, 8);
	const cam = usePush(camOn(960, 560, 1.15), camOn(960, 540, 1.3));
	return (
		<>
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
					<Actor who="hero" x={720} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.6, -0.1]} mouth="smile" pose={reach(idle(gf, 2), 'F', [150, -120 + 20 * press], env(f, 4, 40, 8, 10))} {...YOUNG} uid="h-060" />
				</Svg>
			</Layer>
		</Stage>
		<AbsoluteFill style={{background: '#000', opacity: out}} />
		</>
	);
};
export const SHOTS_E: ShotDef[] = [
	{at: '049', C: E049, whip: true},
	{at: '050', C: E050, whip: true},
	{at: '051', C: E051, whip: true},
	{at: '052', C: E052, whip: true},
	{at: '052', off: 66, C: E052b, whip: true},
	{at: '053', C: E053, whip: true},
	{at: '054', C: E054},
	{at: '055', C: E055, whip: true},
	{at: '056', C: E056, whip: true},
	{at: '057', C: E057, whip: true},
	{at: '058', C: E058, whip: true},
	{at: '059', C: E059, whip: true},
	{at: '060', C: E060, whip: true},
];
export {HeroBadge, badgeY, random, makeGlass};

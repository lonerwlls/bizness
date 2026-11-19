import React from 'react';
import {AbsoluteFill, Easing, interpolate} from 'remotion';
import * as THREE from 'three';
import {Prop3D, PropWorld, at, propScene} from '../three/Prop3D';
import {flicker, makeBlender, makeCalendar, makeCandle, makeClipboard, makeGlass, makeMetronome, makePage, makeSandwich, makeScalpel, makeTray, spinBlender, tick} from '../three/props';
import {Pose, Stickman} from '../engine/Stickman';
import {SIT, env, gesture, idle, reach, walkTo} from '../kit/actions';
import {Actor, hicK, useShot} from '../kit/core';
import type {ShotDef} from '../kit/coverage';
import {CrowdRow, HeroBadge, Layer, Stage, Svg, camOn, clamp, usePush} from '../kit/kit';
import {Board, Bubble, FONT} from '../kit/ui';
import {Onoma} from '../reference/PauseTime';
import {CAST} from './cast';
import {FL, HS, badgeY} from './common';
import {SEAT, SeatChair} from './places';
import {Tag, camPath, jolt, pop, useW} from './lib';
import {BrainScan, OldFilm, beatK, Heart} from './placesH';
import {
	AutumnPark,
	Bistro,
	BistroChair,
	Blender,
	Calendar,
	CandleTable,
	Chart,
	DeskFront,
	ExamRoom,
	ExamTable,
	Kitchen2,
	MRIRoom,
	Metronome,
	OR,
	ORTable,
	Office,
	OldOffice,
	ParkBench,
	ReadingRoom,
	Rooftop,
	Sandwich,
	Scalpel,
	ScanTable,
	Scanner,
	SurgLamp,
	Wedding,
} from './placesB';

/* PART B (1:47–3:00): the diagnosis, the scan, life as a doctor who hiccups, the blender,
   the first dates, the woman who doesn't mind, the wedding. Every scene has its own place. */

/* ---------- 3D calendar on the office wall, pages torn off fall to the floor and stay ---------- */
const CAL = {x: 1220, y: 320};
type CalW = PropWorld & {cal: THREE.Group; pages: THREE.Mesh[]};
const makeCalWorld = (month: string, last: number, n: number) => (): CalW => {
	const scene = propScene();
	const cal = makeCalendar(month, last);
	at(cal, CAL.x, CAL.y, 0);
	cal.scale.setScalar(0.95);
	cal.rotation.z = -0.03;
	scene.add(cal);
	const pages: THREE.Mesh[] = [];
	for (let i = 0; i < n; i++) {
		const p = makePage(last - n + i) as THREE.Mesh;
		p.scale.setScalar(0.8);
		scene.add(p);
		pages.push(p);
	}
	return {scene, cal, pages};
};
/* a page released at frame t0 flutters down and lies on the floor */
const fallPage = (p: THREE.Mesh, f: number, t0: number, i: number) => {
	const t = f - t0;
	if (t < 0) {
		at(p, CAL.x, CAL.y - 16, 8 + i);
		p.rotation.set(0, 0, -0.03);
		return;
	}
	const vt = 7;
	const tau = 9;
	const fall = vt * t - vt * tau * (1 - Math.exp(-t / tau));
	const floorY = 890 - (i % 3) * 6;
	const y = Math.min(floorY, CAL.y - 16 + fall);
	const landed = y >= floorY;
	const drift = (i % 2 ? 1 : -1) * (40 + i * 12) * (1 - Math.exp(-t / 20)) + Math.sin(t / 6 + i) * 18 * (landed ? 0 : 1);
	at(p, CAL.x + drift, y, 20 + i);
	p.rotation.set(landed ? -1.35 : Math.sin(t / 5 + i) * 0.6, Math.sin(t / 7) * 0.4 * (landed ? 0 : 1), landed ? (i % 2 ? 0.3 : -0.25) : Math.sin(t / 4 + i) * 0.8);
};

/* ---------- 020 two days: persistent hiccups; your own chart ---------- */
const HX = 900;
const B020: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const hp: Pose = gesture('rubChin', {...SIT, armF: [60, 60], armB: [50, 70]}, env(f, w('020', 0.15), 1e9, 10, 1), f);
	const cam = usePush(camOn(1000, 560, 1.2), camOn(1040, 520, 1.45));
	return (
		<Stage cam={cam} bg="#2a2010" light={{x: 20, y: 10, o: 0.5, c: '255,230,180'}}>
			<Layer depth={1.4}>
				<Office f={gf} />
			</Layer>
			<Layer depth={1}>
				<Prop3D x={1060} y={180} w={360} h={740} make={makeCalWorld('MARCH', 3, 2)} update={(wd, ff) => wd.pages.forEach((p, i) => fallPage(p, ff, 8 + i * 12, i))} />
				<Svg>
					<SeatChair x={HX - 30} c="#3a2a22" />
					<Actor who="hero" x={HX} floor={FL} seat={SEAT} s={HS} facing={1} faceTurn={0.4} look={[0.6, 0.3]} expr="worried" pose={hp} uid="h-020" />
					<DeskFront x={HX + 300} />
					<HeroBadge x={HX} y={SEAT - 164 - 118} s={0.8} />
					<Tag f={f} t={w('020', 0.08)} x={760} y={300} text="2 DAYS LATER" c="#11142c" fg="#ffd34a" size={34} rot={-4} />
				</Svg>
			</Layer>
		</Stage>
	);
};
const B020b: React.FC = () => {
	const {f} = useShot();
	const w = useW();
	const write = interpolate(f, [w('020', 0.36), w('020', 0.55)], [0, 1], clamp);
	const cam = usePush(camOn(960, 560, 1.0), camOn(960, 540, 1.12));
	return (
		<Stage cam={cam} bg="#6a4a2e" light={{x: 40, y: 10, o: 0.4}}>
			<Layer depth={1.2}>
				<Svg>
					<rect x={-400} y={-300} width={2800} height={1600} fill="#8a5a3a" />
					{Array.from({length: 14}).map((_, i) => (
						<line key={i} x1={-400} y1={i * 90} x2={2400} y2={i * 90 + 30} stroke="#7a4e30" strokeWidth={6} />
					))}
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Prop3D
					x={700}
					y={250}
					w={520}
					h={620}
					make={() => {
						const scene = propScene();
						const clip = makeClipboard('Dr. YOU', 'Persistent hiccups');
						at(clip, 960, 560, 0);
						clip.rotation.set(-0.18, 0.12, -0.05);
						clip.scale.setScalar(1.15);
						scene.add(clip);
						return {scene, clip};
					}}
					update={(wd) => wd.clip.userData.redraw(write, 0)}
				/>
				<Svg>
					<Tag f={f} t={w('020', 0.4)} x={1400} y={330} text="> 48 HOURS" c="#11142c" fg="#ff9a8a" stroke="#ff6a5a" size={38} rot={6} />
					<Tag f={f} t={w('020', 0.78)} x={520} y={800} text="NOW IT'S YOURS" c="#11142c" fg="#ffd34a" size={36} rot={-5} />
				</Svg>
			</Layer>
		</Stage>
	);
};
/* ---------- 021 a month: intractable ---------- */
const B021: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const stamp = interpolate(f, [w('021', 0.45), w('021', 0.52)], [0, 1], clamp);
	const cam = camPath(f, [
		[0, camOn(1060, 560, 1.15)],
		[w('021', 0.4), camOn(1180, 590, 1.5, {farBlur: 7})],
		[w('021', 1.1), camOn(1190, 590, 1.6, {farBlur: 8})],
	]);
	const hp: Pose = {...SIT, lean: 18, head: 14, armF: [70, 80], armB: [60, 80]};
	return (
		<Stage cam={cam} bg="#141020" light={{x: 70, y: 40, o: 0.45, c: '255,220,150'}}>
			<Layer depth={1.4}>
				<Office f={gf} night />
			</Layer>
			<Layer depth={1}>
				<Prop3D x={1020} y={180} w={460} h={740} make={makeCalWorld('APRIL', 2, 7)} update={(wd, ff) => wd.pages.forEach((p, i) => fallPage(p, ff, 2 + i * 6, i))} />
				<Svg>
					<SeatChair x={HX - 30} c="#2a1a22" />
					<Actor who="hero" x={HX} floor={FL} seat={SEAT} s={HS} facing={1} faceTurn={0.4} look={[0.5, 0.6]} expr="sad" pose={hp} uid="h-021" />
					<DeskFront x={HX + 300} night />
					<HeroBadge x={HX} y={SEAT - 164 - 118} s={0.8} />
				</Svg>
				<Prop3D
					x={1120}
					y={470}
					w={260}
					h={260}
					make={() => {
						const scene = propScene();
						const clip = makeClipboard('Dr. YOU', 'Persistent hiccups', 'INTRACTABLE');
						at(clip, 1250, 600, 0);
						clip.rotation.set(-0.12, 0.2, 0.08);
						clip.scale.setScalar(0.5);
						scene.add(clip);
						return {scene, clip};
					}}
					update={(wd) => wd.clip.userData.redraw(1, stamp)}
				/>
				<Svg>
					<Tag f={f} t={w('021', 0.1)} x={760} y={300} text="1 MONTH" c="#11142c" fg="#ffd34a" size={34} rot={-4} />
					<Tag f={f} t={w('021', 0.7)} x={1250} y={420} text="NOTHING STOPS IT" c="#3a1d2a" fg="#ff9a8a" stroke="#ff6a5a" size={28} rot={-3} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* ---------- 022 the brain scan ---------- */
const B022: React.FC = () => {
	const {f, gf} = useShot();
	const slide = interpolate(f, [8, 60], [0, 1], clamp);
	const cam = usePush(camOn(960, 600, 1.15), camOn(1000, 620, 1.35));
	return (
		<Stage cam={cam} bg="#9ab8c8" light={{x: 50, y: 0, o: 0.4, c: '220,240,255'}}>
			<Layer depth={1.4}>
				<MRIRoom f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<ScanTable x={760 + 200 * slide} />
					<g transform={`translate(${560 + 200 * slide},0)`}>
						<g transform={`translate(240,${700 - 26}) rotate(-90)`}>
							<Stickman id="h-mri" x={0} y={0} scale={0.95} pose={{lean: 0, head: -4, armB: [4, 6], armF: [6, 8], legB: [0, 0], legF: [3, 0]}} {...CAST.hero} look={[0.4, -0.8]} faceTurn={0.2} expr="worried" t={gf} />
						</g>
					</g>
					<Scanner x={1300} f={gf} />
					<Tag f={f} t={20} x={1300} y={260} text="BRAIN SCAN" c="#11142c" fg="#9fd8ff" stroke="#9fd8ff" size={36} rot={-3} />
				</Svg>
			</Layer>
		</Stage>
	);
};
const B022b: React.FC = () => {
	const {f, gf} = useShot();
	const tap = env(f, 14, 1e9, 10, 1);
	const cam = usePush(camOn(980, 470, 1.35, {farBlur: 6}), camOn(980, 400, 1.6, {farBlur: 8}));
	return (
		<Stage cam={cam} bg="#0d1420" light={{x: 50, y: 30, o: 0.5, c: '160,210,255'}}>
			<Layer depth={1.3}>
				<ReadingRoom f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<g transform="translate(980,330) scale(0.62)">
						<BrainScan spot={tap} f={f} />
					</g>
					<Actor who="colleague" x={1300} floor={FL} s={1} facing={-1} faceTurn={0.4} look={[-0.7, -0.3]} expr="worried" pose={reach(idle(gf, 8), 'F', [270, -180], tap)} handF="point" uid="col-22" />
					<Actor who="hero" x={700} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.7, -0.4]} expr="wide" pose={idle(gf, 2)} uid="h-022" />
					<Tag f={f} t={30} x={980} y={130} text="A TINY SPOT" c="#11142c" fg="#ffd34a" size={34} rot={3} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* ---------- 023 a pin-sized vessel bursts where the "stop" signal lives ---------- */
const B023: React.FC = () => {
	const {f} = useShot();
	const w = useW();
	const zoom = interpolate(f, [w('023', 0.05), w('023', 0.3)], [0, 1], clamp);
	const burst = interpolate(f, [w('023', 0.3), w('023', 0.42)], [0, 1], clamp);
	const sw = interpolate(f, [w('023', 0.62), w('023', 0.78)], [0, 1], clamp);
	return (
		<Board tint="#2a1a40">
			<g transform={`translate(${560 - 80 * zoom},560) scale(${0.9 + 0.2 * zoom})`}>
				<BrainScan spot={zoom} f={f} />
			</g>
			{/* magnifier circle on the brainstem */}
			<g opacity={zoom}>
				<line x1={575} y1={720} x2={1080} y2={480} stroke="#ffd34a" strokeWidth={5} strokeDasharray="12 10" />
				<circle cx={1240} cy={430} r={210} fill="#1b1030" stroke="#ffd34a" strokeWidth={8} />
				<path d={`M1060,470 C1150,${430 - 40 * burst} 1250,${470 + 30 * burst} 1420,410`} stroke="#d23b3b" strokeWidth={34} strokeLinecap="round" fill="none" />
				<path d="M1060,470 C1150,430 1250,470 1420,410" stroke="#ff8a8a" strokeWidth={10} strokeLinecap="round" fill="none" opacity={0.6} />
				{burst > 0
					? Array.from({length: 10}).map((_, i) => {
							const a = (i / 10) * Math.PI * 2;
							return <circle key={i} cx={1240 + Math.cos(a) * 70 * burst} cy={445 + Math.sin(a) * 60 * burst} r={10 * (1 - burst * 0.5)} fill="#ff4a4a" />;
						})
					: null}
			</g>
			{f > w('023', 0.3) && f < w('023', 0.3) + 28 ? <Onoma x={1240} y={260} text="pop" t={f - w('023', 0.3)} c="#ffd34a" size={60} /> : null}
			<Tag f={f} t={w('023', 0.2)} x={1240} y={720} text="SIZE OF A PIN" c="#11142c" fg="#ff9a8a" stroke="#ff6a5a" size={34} rot={-3} />
			{/* the "stop hiccups" switch loses its wire */}
			<g transform="translate(560,900)" opacity={pop(f, w('023', 0.6))}>
				<rect x={-200} y={-70} width={400} height={140} rx={20} fill="#11142c" stroke="#9fd8ff" strokeWidth={5} />
				<text x={-170} y={14} fontSize={36} fontFamily={FONT} fontWeight={900} fill="#9fd8ff">
					STOP HICCUPS
				</text>
				<g transform={`translate(150,0) rotate(${-30 + 60 * sw})`}>
					<rect x={-10} y={-50} width={20} height={50} rx={8} fill="#ff6a5a" />
				</g>
				{sw > 0.5 ? <Onoma x={150} y={-90} text="OFF" t={f - w('023', 0.7)} c="#ff6a5a" size={46} /> : null}
			</g>
			<Tag f={f} t={w('023', 0.64)} x={1240} y={880} text="THE STOP SIGNAL" c="#11142c" fg="#ffd34a" size={34} rot={3} />
		</Board>
	);
};

/* ---------- 024 Osborne's doctor guessed the same; nothing to cut out (sepia) ---------- */
const B024: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const shrug = env(f, w('024', 0.55), 1e9, 12, 1);
	const dp = gesture('shrug', reach(idle(gf, 7), 'F', [100, -170], env(f, 4, w('024', 0.5), 10, 10)), shrug, f);
	const fj = jolt(f, [w('024', 0.3), w('024', 0.75)]);
	const cam = usePush(camOn(960, 560, 1.25), camOn(960, 540, 1.45));
	return (
		<AbsoluteFill style={{filter: 'sepia(0.85) saturate(0.9) contrast(1.05)'}}>
			<Stage cam={cam} bg="#b08a5a" light={{x: 60, y: 10, o: 0.4}} grain={0.25} vig={0.7}>
				<Layer depth={1.3}>
					<OldOffice />
				</Layer>
				<Layer depth={1}>
					<Svg>
						<SeatChair x={1110} c="#5a3a1a" />
						<Actor who="farmer" x={1100} floor={FL} seat={SEAT - fj * 10} s={1} facing={-1} faceTurn={0.4} look={[-0.6, 0]} expr="worried" mouth={fj > 0.3 ? 'open' : undefined} pose={{...SIT, head: SIT.head - 10 * fj}} hairColor="#9a8a7a" age={0.5} uid="farmer-24" />
						<Actor who="olddoc" x={830} floor={FL} s={1} facing={1} faceTurn={0.4} look={[0.6, 0]} expr="normal" pose={dp} handF="point" uid="olddoc" />
						{[w('024', 0.3), w('024', 0.75)].map((t, i) => (f > t - 1 && f < t + 26 ? <Onoma key={i} x={1220} y={500} text="HIC!" t={f - t} c="#fff4d8" size={50} /> : null))}
					</Svg>
				</Layer>
				<Layer depth={0.9}>
					<OldFilm f={gf} />
				</Layer>
			</Stage>
			<AbsoluteFill style={{pointerEvents: 'none'}}>
				<div style={{position: 'absolute', left: 70, top: 60, padding: '12px 26px', background: '#1b1208', color: '#fff4d8', fontFamily: FONT, fontWeight: 900, fontSize: 40, transform: `rotate(-2deg) scale(${pop(f, 4)})`}}>OSBORNE'S DOCTOR</div>
				<div style={{position: 'absolute', right: 80, bottom: 90, padding: '12px 26px', background: '#fff4d8', color: '#1b1208', fontFamily: FONT, fontWeight: 900, fontSize: 44, opacity: f > w('024', 0.58) ? 1 : 0, transform: `rotate(2deg) scale(${pop(f, w('024', 0.58))})`}}>NOTHING TO CUT OUT</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

/* ---------- 025 day and night on the hospital roof ---------- */
const B025: React.FC = () => {
	const {f, gf, dur} = useShot();
	const k = interpolate(f, [0, dur], [0, 2], clamp);
	const cam = usePush(camOn(960, 600, 1.2), camOn(960, 560, 1.4));
	return (
		<Stage cam={cam} bg="#5a9ad8" light={{x: 50, y: 0, o: 0.35}}>
			<Layer depth={1.2}>
				<Rooftop f={gf} k={k} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={960} floor={FL} s={HS} facing={1} faceTurn={0.2} look={[0.1, 0]} expr="sleepy" pose={idle(gf, 2)} uid="h-025" />
					<HeroBadge x={960} y={badgeY(FL)} s={0.8} />
					<Tag f={f} t={10} x={1300} y={330} text="20–40 PER MINUTE" c="#11142c" fg="#ffd34a" size={34} rot={4} />
					<Tag f={f} t={50} x={620} y={420} text="DAY & NIGHT" c="#11142c" fg="#9fd8ff" stroke="#9fd8ff" size={34} rot={-4} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* ---------- 026 listening to a heart: every few seconds you both jump ---------- */
const PX = 1170;
const B026: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const lis = env(f, 10, 1e9, 14, 1);
	const hx = PX - 132;
	const pj = jolt(f, [w('026', 0.8) + 1]);
	const seat = 736 - pj * 18;
	// the chest piece goes on the patient's chest (he sits facing left)
	const chest: [number, number] = [PX - 16, seat - 96];
	const hp = reach({...idle(gf, 2), lean: 10 * lis, head: 8 * lis}, 'F', [chest[0] - hx, chest[1] - (FL - 157)], lis);
	const cam = camPath(f, [
		[0, camOn(1100, 580, 1.3)],
		[w('026', 0.5), camOn(1110, 540, 1.6, {farBlur: 7})],
		[w('026', 1.1), camOn(1110, 560, 1.5, {farBlur: 7})],
	]);
	return (
		<Stage cam={cam} bg="#b8dcc8" light={{x: 30, y: 0, o: 0.45, c: '255,245,220'}}>
			<Layer depth={1.4}>
				<ExamRoom />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<ExamTable x={PX + 100} />
					<Actor who="oldman" x={PX} floor={FL} seat={seat} s={1} facing={-1} faceTurn={0.4} look={[-0.6, 0.2]} expr={pj > 0.3 ? 'wide' : 'normal'} mouth={pj > 0.3 ? 'open' : undefined} pose={{...SIT, head: SIT.head - 12 * pj, armF: [30, 40], armB: [20, 40]}} uid="old-26" />
					<Actor who="hero" x={hx} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.6, 0.6]} expr="sleepy" pose={hp} uid="h-026" />
					{lis > 0.5 ? <path d={`M${hx + 6},${FL - 157 - 120} Q${hx + 40},${FL - 157 - 30} ${chest[0]},${chest[1]}`} stroke="#2a2f4a" strokeWidth={5} fill="none" /> : null}
					{lis > 0.5 ? <circle cx={chest[0] + 2} cy={chest[1]} r={9} fill="#c9d0dc" stroke="#5a6278" strokeWidth={2.5} /> : null}
					<HeroBadge x={hx} y={badgeY(FL)} s={0.8} />
					{pj > 0.05 ? <Onoma x={PX + 120} y={420} text="!" t={f - w('026', 0.8)} c="#ff6a5a" size={80} /> : null}
					<Tag f={f} t={w('026', 0.85)} x={1110} y={250} text="BOTH JUMP" c="#11142c" fg="#ffd34a" size={34} rot={3} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* ---------- 027 no more surgery: the scalpel shakes, he puts it down on the tray himself ---------- */
const TRAY: [number, number] = [930, 640];
const B027: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const hx = 790;
	const sh = hicK(gf);
	const hold: [number, number] = [hx + 140, FL - 157 - 70 - 14 * sh];
	const put = interpolate(f, [w('027', 0.6), w('027', 0.76)], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const released = f >= w('027', 0.76);
	const back = released ? interpolate(f, [w('027', 0.76), w('027', 0.86)], [0, 1], clamp) : 0;
	const tgt: [number, number] = [hold[0] + (TRAY[0] - hold[0]) * put, hold[1] + (TRAY[1] - 10 - hold[1]) * put];
	const hp = reach(idle(gf, 2), 'F', [tgt[0] - hx, tgt[1] - (FL - 157)], 1 - back);
	const away = env(f, w('027', 0.42), 1e9, 8, 1);
	const np = gesture('stop', idle(gf, 5), away, f);
	const sc = released ? [TRAY[0], TRAY[1] - 8] : [tgt[0] + 10, tgt[1] - 4];
	const cam = usePush(camOn(990, 560, 1.25), camOn(960, 540, 1.45));
	return (
		<Stage cam={cam} bg="#1d3a36" light={{x: 50, y: 0, o: 0.55, c: '255,250,220'}}>
			<Layer depth={1.4}>
				<OR f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<SurgLamp x={1060} />
					<ORTable x={1100} />
					<Actor who="nurse" x={1380 + 60 * away} floor={FL} s={0.98} facing={-1} faceTurn={0.4} look={[-0.6, 0]} expr={away > 0.3 ? 'wide' : 'normal'} mouth={away > 0.3 ? 'open' : undefined} pose={np} uid="nurse-27" />
				</Svg>
				<Prop3D
					x={780}
					y={440}
					w={300}
					h={480}
					make={() => {
						const scene = propScene();
						const tray = makeTray();
						at(tray, TRAY[0], TRAY[1], 0);
						tray.rotation.x = 0.25;
						const scalpel = makeScalpel();
						scene.add(tray, scalpel);
						return {scene, scalpel};
					}}
					update={(wd) => {
						at(wd.scalpel, sc[0], sc[1], 40);
						wd.scalpel.rotation.set(released ? 1.1 : 0.2, 0, released ? 0.05 : -0.5 + 0.3 * sh);
					}}
				/>
				<Svg>
					<Actor who="hero" x={hx} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.6, 0.6]} expr={released ? 'sad' : 'worried'} pose={hp} uid="h-027" />
					<HeroBadge x={hx} y={badgeY(FL)} s={0.8} />
					<Tag f={f} t={w('027', 0.65)} x={1060} y={300} text="NO MORE SURGERY" c="#3a1d2a" fg="#ff9a8a" stroke="#ff6a5a" size={36} rot={-3} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* ---------- 028 each hiccup throws the sandwich out of his hand; then the blender ---------- */
const B028: React.FC = () => {
	const {f, gf, at: atL} = useShot();
	const w = useW();
	const blendAt = w('028', 0.45);
	const blend = f > blendAt;
	const hx = 880;
	// hiccup moments in this line (they also make the hero jerk)
	const hics = [w('028', 0.1), w('028', 0.28)];
	let jump = 0;
	let spin = 0;
	for (const h of hics) {
		const t = f - h;
		if (t >= 0 && t < 19) {
			jump = 13 * t - 0.7 * t * t;
			spin = (t / 19) * Math.PI * 2;
		}
	}
	const mouth: [number, number] = [hx + 70, FL - 157 - 168];
	const hand = blend ? [hx + 136, FL - 157 - 96] : mouth;
	const hp = reach(idle(gf, 2), 'F', [hand[0] - hx, hand[1] - (FL - 157)], 1);
	const stage = f < w('028', 0.65) ? 0 : f < w('028', 0.82) ? 1 : 2;
	const cols = ['#f2c84a', '#7ab05a', '#8a4a3a'];
	const labels = ['BREAKFAST', 'LUNCH', 'STEAK'];
	const cam = camPath(f, [
		[0, camOn(920, 470, 1.6, {farBlur: 7})],
		[blendAt, camOn(1000, 560, 1.3)],
		[w('028', 1), camOn(1020, 560, 1.45)],
	]);
	void atL;
	return (
		<Stage cam={cam} bg="#e8d0a0" light={{x: 30, y: 0, o: 0.45, c: '255,240,200'}}>
			<Layer depth={1.3}>
				<Kitchen2 f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={hx} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.6, blend ? 0.5 : -0.3]} expr={blend ? 'normal' : jump > 4 ? 'wide' : 'normal'} mouth={blend ? 'smirk' : 'open'} pose={hp} uid="h-028" />
				</Svg>
				<Prop3D
					x={700}
					y={160}
					w={620}
					h={540}
					make={() => {
						const scene = propScene();
						const sand = makeSandwich();
						sand.scale.setScalar(0.8);
						const blender = makeBlender();
						at(blender, 1080, 680, -60);
						scene.add(sand, blender);
						return {scene, sand, blender};
					}}
					update={(wd, ff) => {
						wd.sand.visible = !blend;
						at(wd.sand, mouth[0] + 14, mouth[1] - 6 - jump, 60);
						wd.sand.rotation.set(0.45, -0.5, spin);
						at(wd.blender, 1080, 671, -60);
						wd.blender.rotation.set(0.18, -0.35, 0);
						spinBlender(wd.blender, ff, blend ? 1 : 0, cols[stage]);
					}}
				/>
				<Svg>
					{blend ? <Tag f={f} t={w('028', [0.47, 0.65, 0.82][stage])} x={1080} y={300} text={labels[stage]} c="#11142c" fg="#ffd34a" size={36} rot={stage % 2 ? 4 : -4} /> : null}
					{blend ? <Onoma x={1190} y={380} text="VRRR" t={(f - blendAt) % 26} c="#ffffff" size={44} /> : null}
					<HeroBadge x={hx} y={badgeY(FL)} s={0.8} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* ---------- 029 two burnt-out blenders vs three: garage shelves ---------- */
const B029: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const cam = usePush(camOn(960, 540, 1.05), camOn(960, 520, 1.18));
	return (
		<Stage cam={cam} bg="#5a4a3a" light={{x: 50, y: 0, o: 0.45, c: '255,230,190'}}>
			<Layer depth={1.2}>
				<Svg>
					<rect x={-400} y={-300} width={2800} height={1600} fill="#a8865a" />
					{Array.from({length: 40}).map((_, i) =>
						Array.from({length: 14}).map((_, j) => <circle key={i + '-' + j} cx={-300 + i * 70} cy={-20 + j * 70} r={6} fill="#7a5a3a" />),
					)}
					{[[180, 760], [1000, 1760]].map(([a, b], i) => (
						<g key={i}>
							<rect x={a} y={700} width={b - a} height={24} fill="#5a3a1e" />
							<rect x={a + 20} y={724} width={14} height={60} fill="#3a2a1a" />
							<rect x={b - 34} y={724} width={14} height={60} fill="#3a2a1a" />
						</g>
					))}
					<g transform="translate(470,260)" style={{filter: 'sepia(0.9)'}}>
						<rect x={-150} y={-60} width={300} height={120} fill="#e8d8b0" stroke="#5a3a1a" strokeWidth={10} />
						<text y={18} textAnchor="middle" fontSize={50} fontFamily={FONT} fontWeight={900} fill="#5a3a1a">
							OSBORNE
						</text>
					</g>
					<g transform="translate(1380,260)">
						<rect x={-130} y={-60} width={260} height={120} fill="#1d2552" stroke="#ffd34a" strokeWidth={8} />
						<text y={18} textAnchor="middle" fontSize={56} fontFamily={FONT} fontWeight={900} fill="#ffd34a">
							YOU
						</text>
					</g>
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Prop3D
					x={150}
					y={240}
					w={1650}
					h={480}
					make={() => {
						const scene = propScene();
						const bl = [340, 600, 1160, 1380, 1600].map((x) => {
							const b = makeBlender(true);
							b.scale.setScalar(0.9);
							at(b, x, 700, 0);
							b.rotation.set(0.15, -0.4, 0);
							scene.add(b);
							return b;
						});
						return {scene, bl};
					}}
					update={(wd, ff) => wd.bl.forEach((b, i) => (i < 2 || ff > w('029', 0.45) - i * 4 ? spinBlender(b, ff + i * 20, 0) : null))}
				/>
				<Svg>
					<Tag f={f} t={6} x={470} y={860} text="2" c="#11142c" fg="#fff4d8" size={60} rot={-4} />
					<Tag f={f} t={w('029', 0.5)} x={1380} y={860} text="3" c="#11142c" fg="#ffd34a" size={60} rot={4} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* ---------- 030 the first date: a kiss becomes a headbutt ---------- */
const B030: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const lean = env(f, w('030', 0.45), w('030', 0.78), 14, 10);
	const hit = w('030', 0.72);
	const recoil = env(f, hit, hit + 30, 2, 16);
	const hp: Pose = {...SIT, lean: SIT.lean + 22 * lean + 12 * env(f, hit - 2, hit + 6, 2, 6), armF: [40, 60]};
	const dp: Pose = gesture('touchFace', {...SIT, lean: SIT.lean + 18 * lean - 20 * recoil, armF: [40, 60]}, recoil, f);
	const cam = camPath(f, [
		[0, camOn(960, 560, 1.25)],
		[w('030', 0.45), camOn(960, 520, 1.6, {farBlur: 7})],
		[w('030', 1), camOn(960, 520, 1.7, {farBlur: 8})],
	]);
	return (
		<Stage cam={cam} bg="#2a1410" light={{x: 50, y: 40, o: 0.55, c: '255,200,140'}}>
			<Layer depth={1.4}>
				<Bistro f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<BistroChair x={780} facing={1} />
					<BistroChair x={1140} facing={-1} />
					<Actor who="hero" x={800} floor={FL} seat={SEAT} s={HS} facing={1} faceTurn={0.4} look={[0.7, 0]} expr={f > hit ? 'wide' : 'normal'} mouth={lean > 0.5 && f < hit ? 'smirk' : undefined} pose={hp} uid="h-030" />
					<Actor who="date" x={1120} floor={FL} seat={SEAT} s={0.97} facing={-1} faceTurn={0.4} look={[-0.7, 0]} expr={recoil > 0.2 ? 'angry' : 'normal'} mouth={recoil > 0.2 ? 'open' : 'smile'} pose={dp} uid="date-30" />
					<CandleTable x={960} />
				</Svg>
				<Prop3D
					x={820}
					y={640}
					w={280}
					h={140}
					make={() => {
						const scene = propScene();
						const candle = makeCandle();
						at(candle, 960, 770, 0);
						const g1 = makeGlass();
						at(g1, 868, 772, 20);
						const g2 = makeGlass();
						at(g2, 1052, 772, 20);
						for (const o of [candle, g1, g2]) o.rotation.x = 0.2;
						scene.add(candle, g1, g2);
						return {scene, candle};
					}}
					update={(wd, ff) => flicker(wd.candle, ff)}
				/>
				<Svg>
					<HeroBadge x={800} y={SEAT - 164 - 118} s={0.8} />
					{f > hit && f < hit + 30 ? <Onoma x={960} y={420} text="BONK!" t={f - hit} c="#ffd34a" size={80} /> : null}
					{f > hit
						? [0, 1, 2].map((i) => (
								<text key={i} x={960 + Math.cos(f / 4 + i * 2.1) * 60} y={470 + Math.sin(f / 4 + i * 2.1) * 20} fontSize={30} fill="#ffd34a" textAnchor="middle">
									★
								</text>
							))
						: null}
					<Tag f={f} t={4} x={960} y={250} text="FIRST DATE" c="#11142c" fg="#ff9ab0" stroke="#ff6a8a" size={34} rot={-3} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* ---------- 031 the woman who doesn't mind; the wedding ---------- */
const B031: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const cam = usePush(camOn(1000, 600, 1.25), camOn(1000, 560, 1.4));
	const wp = gesture('touchFace', {...SIT, armF: [40, 60]}, env(f, w('031', 0.3), 1e9, 12, 1), f);
	const shown = pop(f, w('031', 0.25));
	return (
		<Stage cam={cam} bg="#f2c88a" light={{x: 30, y: 0, o: 0.45, c: '255,220,170'}}>
			<Layer depth={1.4}>
				<AutumnPark f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<ParkBench x={960} />
					<Actor who="hero" x={840} floor={FL} seat={SEAT} s={HS} facing={1} faceTurn={0.4} look={[0.7, 0]} mouth="smile" pose={{...SIT, armF: [40, 60]}} uid="h-031" />
					<Actor who="wife" x={1080} floor={FL} seat={SEAT} s={0.97} facing={-1} faceTurn={0.4} look={[-0.7, 0]} mouth="smile" pose={wp} uid="wife-31" />
					<HeroBadge x={840} y={SEAT - 164 - 118} s={0.8} />
					{f > w('031', 0.25) ? (
						<Bubble x={1330} y={380} w={340} h={330} t={f - w('031', 0.25)} tail={[-150, 160]}>
							<text y={140} textAnchor="middle" fontSize={34} fontFamily={FONT} fontWeight={900} fill="#13203a">
								like a metronome ♥
							</text>
						</Bubble>
					) : null}
				</Svg>
				{shown > 0.05 ? (
					<Prop3D
						x={1230}
						y={220}
						w={200}
						h={260}
						make={() => {
							const scene = propScene();
							const m = makeMetronome();
							m.scale.setScalar(0.85);
							at(m, 1330, 460, 0);
							m.rotation.set(0.15, -0.4, 0);
							scene.add(m);
							return {scene, m};
						}}
						update={(wd, ff) => {
							wd.m.scale.setScalar(0.85 * shown);
							tick(wd.m, ff);
						}}
					/>
				) : null}
			</Layer>
		</Stage>
	);
};
const BRIDE = {color: '#fbf8f4', accent: '#f4c8d8', acc: ['veil', 'lashes'] as ('veil' | 'lashes')[]};
const GROOM = {color: '#1d1d24', outfit: 'suit' as const, acc: ['glasses'] as 'glasses'[]};
const B031b: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const hicT = w('031', 0.93);
	const cam = camPath(f, [
		[0, camOn(960, 560, 1.15)],
		[hicT - 20, camOn(960, 520, 1.45)],
		[hicT + 40, camOn(960, 520, 1.55)],
	]);
	const hold = reach(reach(idle(gf, 6), 'F', [46, -88], 1), 'B', [40, -84], 1);
	return (
		<Stage cam={cam} bg="#9fd0f0" light={{x: 40, y: 0, o: 0.4}}>
			<Layer depth={1.3}>
				<Wedding f={gf} />
			</Layer>
			<Layer depth={1.15}>
				<Svg>
					<CrowdRow n={5} x0={120} x1={560} floor={830} s={0.62} mode="stand" seed="wl" />
					<CrowdRow n={5} x0={1360} x1={1800} floor={830} s={0.62} mode="stand" seed="wr" />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={870} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.7, 0]} mouth={f > hicT + 14 ? 'open' : 'smile'} pose={idle(gf, 2)} {...GROOM} uid="h-031b" />
					<Actor who="wife" x={1060} floor={FL} s={0.97} facing={-1} faceTurn={0.4} look={[-0.7, 0]} mouth="smile" pose={hold} {...BRIDE} handItem={<g><circle cx={0} cy={-8} r={14} fill="#ff8ab0" /><circle cx={-12} cy={2} r={11} fill="#fff4c8" /><circle cx={12} cy={2} r={11} fill="#ffb0c8" /><path d="M-8,10 L0,40 L8,10 Z" fill="#5ab04a" /></g>} uid="wife-wed" />
					<HeroBadge x={870} y={badgeY(FL)} s={0.8} />
					<Tag f={f} t={4} x={960} y={200} text="5 YEARS LATER" c="#11142c" fg="#ffd34a" size={34} rot={-3} />
					{f > hicT - 26 ? (
						<Bubble x={600} y={560} w={320} h={110} t={f - hicT + 26} tail={[150, 40]}>
							<text y={18} textAnchor="middle" fontSize={52} fontFamily={FONT} fontWeight={900} fill="#13203a">
								{f < hicT + 10 ? 'I—' : 'I— …DO!'}
							</text>
						</Bubble>
					) : null}
				</Svg>
			</Layer>
		</Stage>
	);
};

export const SHOTS_B: ShotDef[] = [
	{at: '020', C: B020, whip: true},
	{at: '020', off: 80, C: B020b, whip: true},
	{at: '021', C: B021, whip: true},
	{at: '022', C: B022, whip: true},
	{at: '022', off: 70, C: B022b, whip: true},
	{at: '023', C: B023, whip: true},
	{at: '024', C: B024, whip: true},
	{at: '025', C: B025, whip: true},
	{at: '026', C: B026, whip: true},
	{at: '027', C: B027, whip: true},
	{at: '028', C: B028, whip: true},
	{at: '029', C: B029, whip: true},
	{at: '030', C: B030, whip: true},
	{at: '031', C: B031, whip: true},
	{at: '031', off: 125, C: B031b, whip: true},
];
export {Heart};

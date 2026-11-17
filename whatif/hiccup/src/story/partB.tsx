import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {Pose, Stickman} from '../engine/Stickman';
import {SIT, env, gesture, idle, reach, walkTo} from '../kit/actions';
import {Actor, useShot} from '../kit/core';
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

/* ---------- 020 two days: persistent hiccups; your own chart ---------- */
const HX = 900;
const B020: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const day = f < 26 ? 1 : f < 44 ? 2 : 3;
	const hp: Pose = gesture('rubChin', {...SIT, armF: [60, 60], armB: [50, 70]}, env(f, w('020', 0.15), 1e9, 10, 1), f);
	const cam = usePush(camOn(1000, 560, 1.2), camOn(1040, 520, 1.45));
	return (
		<Stage cam={cam} bg="#2a2010" light={{x: 20, y: 10, o: 0.5, c: '255,230,180'}}>
			<Layer depth={1.4}>
				<Office f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Calendar x={620} y={340} day={day} month="MARCH" />
					<SeatChair x={HX - 30} c="#3a2a22" />
					<Actor who="hero" x={HX} floor={FL} seat={SEAT} s={HS} facing={1} faceTurn={0.4} look={[0.6, 0.3]} expr="worried" pose={hp} uid="h-020" />
					<DeskFront x={HX + 300} />
					<HeroBadge x={HX} y={SEAT - 164 - 118} s={0.8} />
					<Tag f={f} t={w('020', 0.08)} x={1300} y={330} text="2 DAYS LATER" c="#11142c" fg="#ffd34a" size={34} rot={4} />
				</Svg>
			</Layer>
		</Stage>
	);
};
const B020b: React.FC = () => {
	const {f, at} = useShot();
	const w = useW();
	const write = interpolate(f, [w('020', 0.36), w('020', 0.55)], [0, 1], clamp);
	const cam = usePush(camOn(960, 560, 1.0), camOn(960, 540, 1.15));
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
				<Svg>
					<Chart x={960} y={560} s={1.4} name="Dr. YOU" dx="Persistent hiccups" write={write} />
					<Tag f={f} t={w('020', 0.4)} x={1460} y={260} text="> 48 HOURS" c="#11142c" fg="#ff9a8a" stroke="#ff6a5a" size={38} rot={6} />
					<Tag f={f} t={w('020', 0.78)} x={480} y={820} text="NOW IT'S YOURS" c="#11142c" fg="#ffd34a" size={36} rot={-5} />
					{at('020') ? null : null}
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
		[0, camOn(900, 560, 1.2)],
		[w('021', 0.4), camOn(1000, 540, 1.3)],
	]);
	const hp: Pose = {...SIT, lean: 18, head: 14, armF: [70, 80], armB: [60, 80]};
	return (
		<Stage cam={cam} bg="#141020" light={{x: 70, y: 40, o: 0.45, c: '255,220,150'}}>
			<Layer depth={1.4}>
				<Office f={gf} night />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Calendar x={620} y={340} day={2} month="APRIL" />
					{f < w('021', 0.3)
						? [0, 1, 2].map((i) => (
								<g key={i} transform={`translate(${620 + (f - i * 6) * 9},${340 + (f - i * 6) * 4}) rotate(${(f - i * 6) * 8})`} opacity={f > i * 6 ? 1 : 0}>
									<rect x={-80} y={-60} width={160} height={150} fill="#fbfaf4" stroke="#2a2f4a" strokeWidth={3} />
								</g>
							))
						: null}
					<SeatChair x={HX - 30} c="#2a1a22" />
					<Actor who="hero" x={HX} floor={FL} seat={SEAT} s={HS} facing={1} faceTurn={0.4} look={[0.5, 0.6]} expr="sad" pose={hp} uid="h-021" />
					<DeskFront x={HX + 300} night />
					<HeroBadge x={HX} y={SEAT - 164 - 118} s={0.8} />
					<g transform="translate(1250,500) scale(0.7)">
						<Chart x={0} y={0} name="Dr. YOU" dx="Persistent hiccups" write={1} stamp={stamp} stampText="INTRACTABLE" />
					</g>
					<Tag f={f} t={w('021', 0.1)} x={1000} y={240} text="1 MONTH" c="#11142c" fg="#ffd34a" size={34} rot={4} />
					<Tag f={f} t={w('021', 0.7)} x={1300} y={810} text="NOTHING STOPS IT" c="#3a1d2a" fg="#ff9a8a" stroke="#ff6a5a" size={32} rot={-3} />
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
	const hx = 990;
	const hp = reach({...idle(gf, 2), lean: 10 * lis, head: 10 * lis}, 'F', [112, -84], lis);
	const pj = jolt(f, [w('026', 0.8) + 1]);
	const hand: [number, number] = [hx + 112, FL - 157 - 84];
	const cam = camPath(f, [
		[0, camOn(1060, 580, 1.3)],
		[w('026', 0.5), camOn(1080, 540, 1.6, {farBlur: 7})],
		[w('026', 1.1), camOn(1080, 560, 1.5, {farBlur: 7})],
	]);
	return (
		<Stage cam={cam} bg="#b8dcc8" light={{x: 30, y: 0, o: 0.45, c: '255,245,220'}}>
			<Layer depth={1.4}>
				<ExamRoom />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<ExamTable x={PX + 100} />
					<Actor who="oldman" x={PX} floor={FL} seat={736 - pj * 18} s={1} facing={-1} faceTurn={0.4} look={[-0.6, 0.2]} expr={pj > 0.3 ? 'wide' : 'normal'} mouth={pj > 0.3 ? 'open' : undefined} pose={{...SIT, head: SIT.head - 12 * pj}} uid="old-26" />
					<Actor who="hero" x={hx} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.6, 0.6]} expr="sleepy" pose={hp} uid="h-026" />
					{lis > 0.5 ? <path d={`M${hx + 6},${FL - 157 - 120} Q${hx + 50},${FL - 157 - 20} ${hand[0]},${hand[1]}`} stroke="#2a2f4a" strokeWidth={5} fill="none" /> : null}
					{lis > 0.5 ? <circle cx={hand[0] + 4} cy={hand[1]} r={9} fill="#c9d0dc" stroke="#5a6278" strokeWidth={2.5} /> : null}
					<HeroBadge x={hx} y={badgeY(FL)} s={0.8} />
					{pj > 0.05 ? <Onoma x={PX + 120} y={420} text="!" t={f - w('026', 0.8)} c="#ff6a5a" size={80} /> : null}
					<Tag f={f} t={w('026', 0.85)} x={1080} y={250} text="BOTH JUMP" c="#11142c" fg="#ffd34a" size={34} rot={3} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* ---------- 027 no more surgery ---------- */
const B027: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const hold = env(f, 4, w('027', 0.62), 10, 12);
	const hx = 760;
	const hp = reach(idle(gf, 2), 'F', [140, -70 + 30 * (1 - hold)], 1);
	const back = env(f, w('027', 0.42), 1e9, 8, 1);
	const np = gesture('stop', idle(gf, 5), back, f);
	const cam = usePush(camOn(960, 560, 1.25), camOn(930, 520, 1.45));
	return (
		<Stage cam={cam} bg="#1d3a36" light={{x: 50, y: 0, o: 0.55, c: '255,250,220'}}>
			<Layer depth={1.4}>
				<OR f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<SurgLamp x={980} />
					<ORTable x={980} />
					<Actor who="nurse" x={1300 + 60 * back} floor={FL} s={0.98} facing={-1} faceTurn={0.4} look={[-0.6, 0]} expr={back > 0.3 ? 'wide' : 'normal'} mouth={back > 0.3 ? 'open' : undefined} pose={np} uid="nurse-27" />
					<Actor who="hero" x={hx} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.6, 0.6]} expr={f > w('027', 0.62) ? 'sad' : 'worried'} pose={hp} handItem={hold > 0.3 ? <Scalpel /> : undefined} uid="h-027" />
					{hold <= 0.3 && f > w('027', 0.62) ? <g transform="translate(560,700)"><rect x={-60} y={-8} width={120} height={16} fill="#9aa0ae" /><g transform="translate(20,-10)"><Scalpel /></g></g> : null}
					<HeroBadge x={hx} y={badgeY(FL)} s={0.8} />
					<Tag f={f} t={w('027', 0.65)} x={980} y={300} text="NO MORE SURGERY" c="#3a1d2a" fg="#ff9a8a" stroke="#ff6a5a" size={36} rot={-3} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* ---------- 028 the sandwich jumps; the blender ---------- */
const B028: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const blend = f > w('028', 0.45);
	const bounce = Math.abs(Math.sin(f / 6)) * 60 * (blend ? 0 : 1);
	const hx = 820;
	const hp = blend ? reach(idle(gf, 2), 'F', [150, -40], 1) : reach(idle(gf, 2), 'F', [70, -150], 1);
	const stage = f < w('028', 0.65) ? 0 : f < w('028', 0.82) ? 1 : 2;
	const cols = ['#f2c84a', '#7ab05a', '#8a4a3a'];
	const labels = ['BREAKFAST', 'LUNCH', 'STEAK'];
	const cam = camPath(f, [
		[0, camOn(860, 520, 1.5, {farBlur: 7})],
		[w('028', 0.45), camOn(980, 560, 1.3)],
		[w('028', 1), camOn(1010, 560, 1.45)],
	]);
	return (
		<Stage cam={cam} bg="#e8d0a0" light={{x: 30, y: 0, o: 0.45, c: '255,240,200'}}>
			<Layer depth={1.3}>
				<Kitchen2 f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={hx} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.6, blend ? 0.5 : -0.4]} expr={blend ? 'normal' : 'wide'} mouth={blend ? 'smirk' : 'open'} pose={hp} uid="h-028" />
					{!blend ? (
						<g transform={`translate(${hx + 70},${FL - 157 - 150 - bounce})`}>
							<Sandwich />
						</g>
					) : null}
					<Blender x={1150} y={680} spin={blend ? 1 : 0} f={f} c={cols[stage]} />
					{blend ? <Tag f={f} t={w('028', [0.47, 0.65, 0.82][stage])} x={1150} y={330} text={labels[stage]} c="#11142c" fg="#ffd34a" size={36} rot={stage % 2 ? 4 : -4} /> : null}
					{!blend ? <Tag f={f} t={8} x={1150} y={330} text="JUMP ROPE…" c="#11142c" fg="#9fd8ff" stroke="#9fd8ff" size={34} rot={4} /> : null}
					<HeroBadge x={hx} y={badgeY(FL)} s={0.8} />
					{blend ? <Onoma x={1260} y={420} text="VRRR" t={(f - w('028', 0.45)) % 26} c="#ffffff" size={44} /> : null}
				</Svg>
			</Layer>
		</Stage>
	);
};

/* ---------- 029 two blenders vs three ---------- */
const B029: React.FC = () => {
	const {f} = useShot();
	const w = useW();
	return (
		<Board tint="#3a2a1a">
			<g transform="translate(560,560)" opacity={pop(f, 2)}>
				<g style={{filter: 'sepia(0.9)'}}>
					<rect x={-300} y={-330} width={600} height={620} rx={10} fill="#e8d8b0" stroke="#7a5a3a" strokeWidth={12} />
					<Blender x={-110} y={170} spin={0} f={f} broken s={1.05} />
					<Blender x={110} y={170} spin={0} f={f + 30} broken s={1.05} />
				</g>
				<text y={-250} textAnchor="middle" fontSize={50} fontFamily={FONT} fontWeight={900} fill="#5a3a1a">
					OSBORNE
				</text>
				<text y={260} textAnchor="middle" fontSize={80} fontFamily={FONT} fontWeight={900} fill="#5a3a1a">
					2
				</text>
			</g>
			<g transform="translate(1360,560)" opacity={pop(f, w('029', 0.5))}>
				<rect x={-360} y={-330} width={720} height={620} rx={10} fill="#1d2552" stroke="#ffd34a" strokeWidth={10} />
				{[-200, 0, 200].map((x, i) => (
					<Blender key={i} x={x} y={170} spin={0} f={f + i * 20} broken s={0.95} />
				))}
				<text y={-250} textAnchor="middle" fontSize={50} fontFamily={FONT} fontWeight={900} fill="#ffd34a">
					YOU
				</text>
				<text y={260} textAnchor="middle" fontSize={80} fontFamily={FONT} fontWeight={900} fill="#ffd34a">
					3
				</text>
			</g>
		</Board>
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
					<CandleTable x={960} f={gf} />
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
	const cam = usePush(camOn(960, 600, 1.25), camOn(960, 560, 1.45));
	const wp = gesture('touchFace', {...SIT, armF: [40, 60]}, env(f, w('031', 0.3), 1e9, 12, 1), f);
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
					<g opacity={pop(f, w('031', 0.25))}>
						<Metronome x={1300} y={300} f={f} s={1.1} />
					</g>
					{f > w('031', 0.25) ? (
						<Bubble x={1300} y={500} w={420} h={100} t={f - w('031', 0.25)} tail={[-140, 80]}>
							<text y={14} textAnchor="middle" fontSize={34} fontFamily={FONT} fontWeight={900} fill="#13203a">
								like a metronome ♥
							</text>
						</Bubble>
					) : null}
				</Svg>
			</Layer>
		</Stage>
	);
};
const B031b: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const hicT = w('031', 0.93);
	const cam = camPath(f, [
		[0, camOn(960, 560, 1.15)],
		[hicT - 20, camOn(960, 520, 1.45)],
		[hicT + 40, camOn(960, 520, 1.55)],
	]);
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
					<Actor who="hero" x={870} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.7, 0]} mouth={f > hicT + 14 ? 'open' : 'smile'} pose={idle(gf, 2)} uid="h-031b" />
					<Actor who="wife" x={1060} floor={FL} s={0.97} facing={-1} faceTurn={0.4} look={[-0.7, 0]} mouth="smile" pose={idle(gf, 6)} acc={[]} color="#f4f1f8" outfit="coat" uid="wife-wed" />
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

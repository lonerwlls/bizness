import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {gesture, idle, reach} from '../kit/actions';
import {Actor, useShot} from '../kit/core';
import type {ShotDef} from '../kit/coverage';
import {Layer, Stage, Svg, camOn, clamp, usePush} from '../kit/kit';
import {FONT} from '../kit/ui';
import {Fish, INK, Label, Over, PAPER, Paper, Stamp, TitleCard, Wobble} from '../kaz/kit';
import {Prop3D, at, propScene} from '../three/Prop3D';
import {makeDryBag} from '../three/under';
import {useW} from './lib';
import {FLOOR, HAB, Habitat, MoonPool, POOL, PORT, SURF, SeaSection, WatchRoom} from './placesU';

/* PART 1 (0:00–1:26): day 30 cold open, the title, Aquarius, day one through the hole in the floor,
   the pressure tie, the air hose from the buoy, ears pop, nitrogen soaking in. */

const kk = (x: number, a: number, b: number) => Math.max(0, Math.min(1, (x - a) / (b - a)));
const HIP = FLOOR - 157;
const loc = (x: number, oy: number, t: [number, number], facing: 1 | -1, s = 1): [number, number] => [((t[0] - x) * facing) / s, (t[1] - oy) / s];
const LIGHT = {x: 70, y: 0, o: 0.25, c: '200,235,240'};

/* ================================ 001 day 30: the sun is right there ================================ */
const U001: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const cam = usePush(camOn(1440, 560, 1.45), camOn(1460, 520, 1.55));
	return (
		<Wobble seed={11}>
			<Stage cam={cam} bg="#5f6d76" light={LIGHT} grain={0.12} vig={0.65}>
				<Layer depth={1}>
					<Habitat gf={gf} sunny />
					<Svg>
						<Actor who="hero" x={1330} floor={FLOOR} facing={1} faceTurn={0.5} look={[0.7, -0.9]} mouth="line" pose={{...idle(gf, 2), head: -14}} uid="h-u001" />
					</Svg>
				</Layer>
			</Stage>
			<Over>
				<Stamp f={f} a="Day 30" b="60 ft under the Florida Keys" />
				<Label f={f} t={w('001', 0.12)} x={470} y={250} text="the sun: right up there" to={[985, 175]} bend={-60} size={62} c="#f2d27a" />
			</Over>
		</Wobble>
	);
};

/* ================================ 002 swim up in a minute — and it could kill you ================================ */
const U002: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const go = kk(f, w('002', 0.05), w('002', 0.45));
	const x = HAB[0] + 120;
	const y0 = HAB[1] - 120;
	const kill = w('002', 0.55);
	const cam = usePush(camOn(960, 520, 1.0), camOn(960, 520, 1.05));
	return (
		<Wobble seed={12}>
			<Stage cam={cam} bg="#21495c" light={false} grain={0.12} vig={0.55}>
				<Layer depth={1}>
					<SeaSection f={gf} sunK={0.9} />
					<Svg>
						{/* dashed route up */}
						<path d={`M${x},${y0} L${x},${SURF + 30}`} stroke={PAPER} strokeWidth={6} strokeDasharray="20 16" pathLength={1} fill="none" opacity={0.9} strokeDashoffset={0} style={{clipPath: `inset(${(1 - go) * 100}% 0 0 0)`}} />
						<path d={`M${x - 20},${SURF + 56} L${x},${SURF + 30} L${x + 20},${SURF + 56}`} stroke={PAPER} strokeWidth={6} fill="none" opacity={go >= 1 ? 1 : 0} />
						{f > kill ? (
							<g stroke="#e8343a" strokeWidth={16} strokeLinecap="round" transform={`translate(${x},${(y0 + SURF) / 2}) scale(${interpolate(f, [kill, kill + 6], [1.6, 1], clamp)})`}>
								<line x1={-70} y1={-70} x2={70} y2={70} />
								<line x1={70} y1={-70} x2={-70} y2={70} />
							</g>
						) : null}
					</Svg>
				</Layer>
			</Stage>
			<Over>
				<Label f={f} t={w('002', 0.08)} x={1450} y={520} text="under a minute" size={60} rot={-3} />
				<Label f={f} t={kill + 4} x={1450} y={640} text="...and it could kill you" size={60} c="#ff9a8a" rot={2} />
			</Over>
		</Wobble>
	);
};

/* ================================ 003 the title ================================ */
const U003: React.FC = () => {
	const {f} = useShot();
	return <TitleCard f={f} lines={['What if you lived underwater', 'for 30 days?']} size={104} hot={1} />;
};

/* ================================ 004 not a submarine — a real home ================================ */
const Sub: React.FC = () => (
	<g stroke={INK} strokeWidth={6} strokeLinejoin="round">
		<path d="M-200,0 Q-200,-70 -100,-70 L160,-70 Q230,-70 230,0 Q230,70 160,70 L-100,70 Q-200,70 -200,0 Z" fill="#8a9a7a" />
		<rect x={-30} y={-130} width={110} height={64} rx={14} fill="#8a9a7a" />
		<line x1={30} y1={-130} x2={30} y2={-180} />
		{[-110, -40, 30, 100].map((x) => (
			<circle key={x} cx={x} cy={0} r={18} fill="#f2d27a" />
		))}
		<path d="M-200,0 L-250,-40 L-250,40 Z" fill="#6a7a5a" />
	</g>
);
const HabSketch: React.FC = () => (
	<g stroke={INK} strokeWidth={6} strokeLinejoin="round">
		{[-150, -50, 50, 150].map((x) => (
			<line key={x} x1={x} y1={60} x2={x + (x > 0 ? 14 : -14)} y2={110} strokeWidth={9} />
		))}
		<rect x={-220} y={-60} width={440} height={120} rx={60} fill="#c9c3b2" />
		{[-120, -40, 40, 120].map((x) => (
			<circle key={x} cx={x} cy={0} r={20} fill="#f2d27a" />
		))}
		<path d="M-320,110 Q0,90 320,110" stroke="#9a8a6a" strokeWidth={10} fill="none" />
	</g>
);
const U004: React.FC = () => {
	const {f} = useShot();
	const w = useW();
	const cross = kk(f, w('004', 0.18), w('004', 0.3));
	const home = w('004', 0.4);
	return (
		<Wobble seed={13}>
			<Paper>
				<g transform="translate(560,520)">
					<Sub />
					{cross > 0 ? (
						<g stroke="#e8343a" strokeWidth={16} strokeLinecap="round">
							<line x1={-260} y1={-170} x2={-260 + 520 * Math.min(1, cross * 2)} y2={-170 + 340 * Math.min(1, cross * 2)} />
							{cross > 0.5 ? <line x1={260} y1={-170} x2={260 - 520 * (cross - 0.5) * 2} y2={-170 + 340 * (cross - 0.5) * 2} /> : null}
						</g>
					) : null}
				</g>
				{f > home ? (
					<g transform={`translate(1360,500) scale(${interpolate(f, [home, home + 8], [0.6, 1], clamp)})`}>
						<HabSketch />
					</g>
				) : null}
				<Label f={f} t={4} x={560} y={800} text="a submarine" c={INK} size={64} rot={-2} />
				<Label f={f} t={home + 4} x={1360} y={800} text="a real home" c="#2d6b80" size={64} rot={2} />
			</Paper>
		</Wobble>
	);
};

/* ================================ 005 Aquarius on the map, size of a school bus ================================ */
const U005: React.FC = () => {
	const {f} = useShot();
	const w = useW();
	const route = kk(f, w('005', 0.2), w('005', 0.45));
	return (
		<Wobble seed={14}>
			<Paper tint="#e8eef0">
				{/* Florida's tip and the chain of keys, hand-drawn */}
				<path d="M110,70 L760,70 Q800,240 760,380 Q700,520 560,560 Q420,580 330,520 Q240,460 200,330 Q160,200 110,160 Z" fill="#d8c8a0" stroke={INK} strokeWidth={5} />
				{[
					[600, 640, 70],
					[720, 700, 60],
					[840, 750, 80],
					[980, 790, 70],
					[1120, 820, 90],
					[1280, 840, 60],
				].map(([x, y, r], i) => (
					<ellipse key={i} cx={x} cy={y} rx={r} ry={16} fill="#d8c8a0" stroke={INK} strokeWidth={4} transform={`rotate(14,${x},${y})`} />
				))}
				<text x={400} y={300} fontFamily="'Caveat', cursive" fontWeight={700} fontSize={64} fill={INK}>
					Florida
				</text>
				<text x={860} y={700} fontFamily="'Caveat', cursive" fontWeight={700} fontSize={44} fill={INK} transform="rotate(14,860,700)">
					the Keys
				</text>
				{/* route from the shore to the pin */}
				<path d="M980,800 Q1020,930 1180,960" stroke="#c8433d" strokeWidth={6} strokeDasharray="16 12" fill="none" pathLength={1} style={{clipPath: `inset(0 ${(1 - route) * 100}% 0 0)`}} />
				{route >= 1 ? (
					<g transform="translate(1192,958)">
						<path d="M0,0 C-24,-30 -24,-60 0,-66 C24,-60 24,-30 0,0 Z" fill="#c8433d" stroke={INK} strokeWidth={4} />
						<circle cy={-44} r={9} fill={PAPER} />
					</g>
				) : null}
				{/* compass */}
				<g transform="translate(1640,220)" stroke={INK} strokeWidth={4}>
					<circle r={60} fill="none" />
					<path d="M0,-56 L14,0 L0,56 L-14,0 Z" fill="#c8433d" />
					<text y={-70} textAnchor="middle" fontFamily="'Caveat', cursive" fontSize={40} fill={INK} stroke="none">
						N
					</text>
				</g>
			</Paper>
			<Over>
				<Label f={f} t={w('005', 0.05)} x={1440} y={560} text="Aquarius" c="#c8433d" size={76} rot={-3} to={[1210, 880]} bend={40} />
				<Label f={f} t={w('005', 0.4)} x={1440} y={660} text="several miles out" c={INK} size={52} rot={2} />
			</Over>
		</Wobble>
	);
};
const Bus: React.FC = () => (
	<g stroke={INK} strokeWidth={6} strokeLinejoin="round">
		<rect x={-330} y={-110} width={660} height={190} rx={22} fill="#e8b830" />
		{[-260, -170, -80, 10, 100, 190].map((x) => (
			<rect key={x} x={x} y={-86} width={70} height={60} rx={6} fill="#cfe4ea" />
		))}
		<rect x={262} y={-86} width={50} height={130} rx={6} fill="#cfe4ea" />
		<line x1={-330} y1={10} x2={330} y2={10} />
		{[-220, 200].map((x) => (
			<circle key={x} cx={x} cy={84} r={40} fill="#2a2f3a" />
		))}
	</g>
);
const U005b: React.FC = () => {
	const {f} = useShot();
	const over = kk(f, 10, 26);
	return (
		<Wobble seed={15}>
			<Paper>
				<g transform="translate(960,560)">
					<Bus />
					<g opacity={0.85} transform={`translate(0,${-260 + 210 * over})`}>
						<rect x={-340} y={-90} width={680} height={170} rx={85} fill="none" stroke="#2d6b80" strokeWidth={9} strokeDasharray="22 14" />
					</g>
				</g>
				<Label f={f} t={4} x={960} y={250} text="Aquarius ≈ a school bus" c={INK} size={70} rot={-2} />
			</Paper>
		</Wobble>
	);
};

/* ================================ 006 day one: dive down, swim under, climb in ================================ */
const DIVERS = [
	{who: 'heroDive', dx: 0, dy: 0},
	{who: 'crewA', dx: -170, dy: -90},
	{who: 'crewB', dx: 160, dy: -150},
];
const swimPose = (gf: number, i: number) => ({lean: 0, head: -18, armB: [10, 14] as [number, number], armF: [14, 10] as [number, number], legB: [8 * Math.sin(gf / 3 + i), 0] as [number, number], legF: [-8 * Math.sin(gf / 3 + i), 0] as [number, number]});
const U006: React.FC = () => {
	const {f, gf, dur} = useShot();
	const w = useW();
	const k = kk(f, 0, dur);
	// the group swims down from the surface toward the habitat's belly
	const cx = 700 + 220 * k;
	const cy = 260 + 420 * k;
	const cam = usePush(camOn(960, 520, 1.0), camOn(980, 560, 1.08));
	return (
		<Wobble seed={16}>
			<Stage cam={cam} bg="#21495c" light={false} grain={0.12} vig={0.55}>
				<Layer depth={1}>
					<SeaSection f={gf} />
					<Prop3D
						x={300}
						y={0}
						w={1300}
						h={1000}
						make={() => {
							const scene = propScene();
							const bags = DIVERS.map(() => makeDryBag());
							bags.forEach((b) => b.scale.setScalar(0.75));
							scene.add(...bags);
							return {scene, bags};
						}}
						update={(wd) => {
							// each bag hangs from the diver's front hand, near the hip
							DIVERS.forEach((d, i) => {
								const a = ((128 + 6 * Math.sin(gf / 12 + i)) * Math.PI) / 180;
								const ox = -30;
								const oy = -70;
								const hx = cx + d.dx + (ox * Math.cos(a) - oy * Math.sin(a)) * 0.7;
								const hy = cy + d.dy + (ox * Math.sin(a) + oy * Math.cos(a)) * 0.7;
								at(wd.bags[i], hx, hy, 60);
								wd.bags[i].rotation.set(0, 0, -a + Math.PI);
							});
						}}
					/>
					<Svg>
						{DIVERS.map((d, i) => (
							<g key={i} transform={`translate(${cx + d.dx},${cy + d.dy}) rotate(${128 + 6 * Math.sin(gf / 12 + i)}) scale(0.7)`}>
								<Actor who={d.who} x={0} floor={0} seat={0} facing={1} faceTurn={0.2} look={[0.4, -0.6]} pose={swimPose(gf, i)} shadow={false} uid={`dv${i}`} />
							</g>
						))}
						{/* bubbles rising from the divers */}
						{DIVERS.map((d, i) =>
							[0, 1, 2].map((b) => {
								const ph = ((gf * 2 + b * 40 + i * 25) % 120) / 120;
								return <circle key={`${i}-${b}`} cx={cx + d.dx + 30 + 10 * Math.sin(ph * 9)} cy={cy + d.dy - 40 - ph * 200} r={5 + b * 2} fill="none" stroke="#cfe8ee" strokeWidth={3} opacity={1 - ph} />;
							}),
						)}
					</Svg>
				</Layer>
			</Stage>
			<Over>
				<Stamp f={f} a="Day 1" b="60 ft under the Florida Keys" />
				<Label f={f} t={w('006', 0.3)} x={1500} y={520} text="your new home" to={[1220, 690]} bend={-40} size={58} />
			</Over>
		</Wobble>
	);
};
const U006b: React.FC = () => {
	const {f, gf, dur} = useShot();
	// ROO climbs up the ladder out of the moon pool: rises from the water
	const up = interpolate(f, [4, dur * 0.7], [0, 1], {...clamp, easing: (t) => t * (2 - t)});
	const off = interpolate(f, [dur * 0.7, dur * 0.7 + 14], [0, 1], clamp);
	const y = FLOOR + 210 - 210 * up - 26 * Math.sin(off * Math.PI);
	const lad = POOL[1] - 45 + 150 * off;
	const hp = reach(reach(idle(gf, 2), 'F', loc(lad - 10, y - 157, [lad + 10, FLOOR - 70 + 10 * Math.sin(f / 5)], -1), 1), 'B', loc(lad - 10, y - 157, [lad - 25, FLOOR - 20 - 10 * Math.sin(f / 5)], -1), 1);
	const cam = usePush(camOn(760, 760, 1.6), camOn(760, 720, 1.7));
	return (
		<Wobble seed={17}>
			<Stage cam={cam} bg="#5f6d76" light={LIGHT} grain={0.12} vig={0.6}>
				<Layer depth={1}>
					<Habitat gf={gf} />
					<Svg>
						<MoonPool gf={gf} />
						<defs>
							<clipPath id="above-floor">
								<rect x={-400} y={-300} width={2800} height={FLOOR + 300 + 34} />
							</clipPath>
						</defs>
						<g clipPath="url(#above-floor)">
							<Actor who="heroDive" x={lad - 10} floor={y} facing={-1} faceTurn={0.3} look={[-0.4, -0.2]} mouth="smile" pose={hp} uid="h-u006b" shadow={false} />
						</g>
						{/* drips */}
						{[0, 1, 2].map((i) => (
							<circle key={i} cx={lad - 30 + i * 22} cy={y - 140 + ((f * 6 + i * 30) % 90)} r={4} fill="#cfe8ee" opacity={0.8} />
						))}
					</Svg>
				</Layer>
			</Stage>
		</Wobble>
	);
};

/* ================================ 007 your front door is a hole in the floor ================================ */
const RX = 1000;
const U007: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const point = kk(f, w('007', 0.2), w('007', 0.2) + 10);
	const pose = gesture('point', idle(gf, 2), point, f);
	const cam = usePush(camOn(820, 690, 1.3), camOn(810, 700, 1.38));
	return (
		<Wobble seed={18}>
			<Stage cam={cam} bg="#5f6d76" light={LIGHT} grain={0.12} vig={0.6}>
				<Layer depth={1}>
					<Habitat gf={gf} />
					<Svg>
						<MoonPool gf={gf} fish={kk(f, w('007', 0.62), w('007', 0.95))} />
						<Actor who="hero" x={RX} floor={FLOOR} facing={-1} faceTurn={0.4} look={[-0.6, 0.5]} expr={f > w('007', 0.6) ? 'wide' : 'normal'} mouth={f > w('007', 0.6) ? 'open' : 'smile'} pose={pose} uid="h-u007" />
						<Label f={f} t={w('007', 0.15)} x={560} y={700} text="your front door" to={[640, 915]} bend={-60} size={64} />
						<Label f={f} t={w('007', 0.6)} x={1240} y={1010} text="the open ocean" to={[880, 960]} bend={40} c="#9fe0e8" rot={2} size={58} />
					</Svg>
				</Layer>
			</Stage>
			<Over>
				<Stamp f={f} a="Day 1" b="60 ft under the Florida Keys" />
			</Over>
		</Wobble>
	);
};

/* ================================ 008–009 the pressure tie (cutaway of the moon pool) ================================ */
const U008: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const air = kk(f, w('008', 0.35), w('008', 0.5));
	const sea = kk(f, w('009', 0.0), w('009', 0.12));
	const tie = w('009', 0.3);
	const WL = 600; // water level in the cutaway
	const wave = (x: number) => 5 * Math.sin(x / 60 + gf / 9);
	const pts = Array.from({length: 30}).map((_, i) => `${560 + i * 28},${WL + wave(560 + i * 28)}`).join(' ');
	return (
		<Wobble seed={19}>
			<AbsoluteFill style={{background: '#2b3540'}}>
				<svg viewBox="0 0 1920 1080" width={1920} height={1080}>
					{/* cutaway: the habitat room above, the sea below, the opening in the middle */}
					<rect x={0} y={0} width={1920} height={WL} fill="#5f6d76" />
					<rect x={0} y={WL - 120} width={560} height={140} fill="#3d434b" stroke={INK} strokeWidth={6} />
					<rect x={1360} y={WL - 120} width={560} height={140} fill="#3d434b" stroke={INK} strokeWidth={6} />
					<polygon points={`560,${WL + 20} ${pts} 1360,${WL + 20} 1360,1080 560,1080`} fill="#2d6b80" />
					<rect x={0} y={WL + 20} width={1920} height={460} fill="#2d6b80" />
					<polyline points={pts} fill="none" stroke="#9fd0d8" strokeWidth={6} />
					{Array.from({length: 5}).map((_, i) => (
						<Fish key={i} x={(gf * 1.5 + i * 400) % 2100 - 100} y={820 + (i % 3) * 60} s={0.8} c="#173544" />
					))}
					{/* air arrows press down, sea arrows press up */}
					<g strokeLinecap="round" fill="none">
						{[720, 960, 1200].map((x, i) => (
							<g key={x} opacity={air} stroke="#e8b46a" strokeWidth={14}>
								<path d={`M${x},${WL - 260 + 8 * Math.sin(f / 5 + i)} L${x},${WL - 30}`} />
								<path d={`M${x - 22},${WL - 56} L${x},${WL - 28} L${x + 22},${WL - 56}`} />
							</g>
						))}
						{[720, 960, 1200].map((x, i) => (
							<g key={'s' + x} opacity={sea} stroke="#9fe0e8" strokeWidth={14}>
								<path d={`M${x},${WL + 280 - 8 * Math.sin(f / 5 + i)} L${x},${WL + 40}`} />
								<path d={`M${x - 22},${WL + 66} L${x},${WL + 38} L${x + 22},${WL + 66}`} />
							</g>
						))}
					</g>
					{f > tie ? (
						<g transform={`translate(1660,${WL}) scale(${interpolate(f, [tie, tie + 6], [1.5, 1], clamp)})`}>
							<circle r={86} fill={PAPER} stroke={INK} strokeWidth={6} />
							<text y={22} textAnchor="middle" fontFamily="'Caveat', cursive" fontWeight={700} fontSize={70} fill={INK}>
								TIE
							</text>
						</g>
					) : null}
				</svg>
			</AbsoluteFill>
			<Over>
				<Label f={f} t={w('008', 0.4)} x={300} y={300} text="the air pushes down" c="#f2c98a" size={58} rot={-3} />
				<Label f={f} t={w('008', 0.62)} x={960} y={160} text="2.5× normal pressure" c={PAPER} size={66} rot={-2} />
				<Label f={f} t={w('009', 0.02)} x={300} y={960} text="the sea pushes up" c="#9fe0e8" size={58} rot={2} />
			</Over>
		</Wobble>
	);
};

/* ================================ 010 air, power and a phone line from the buoy; the watch desk ================================ */
const U010: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const cam = usePush(camOn(1100, 470, 1.05), camOn(1120, 460, 1.12));
	return (
		<Wobble seed={20}>
			<Stage cam={cam} bg="#21495c" light={false} grain={0.12} vig={0.55}>
				<Layer depth={1}>
					<SeaSection f={gf} boat={false} buoy hose />
				</Layer>
			</Stage>
			<Over>
				<Label f={f} t={w('010', 0.1)} x={600} y={210} text="the buoy" to={[1010, 175]} bend={-30} size={60} />
				<Label f={f} t={w('010', 0.3)} x={1560} y={520} text="air" c="#f2d27a" size={60} rot={-4} />
				<Label f={f} t={w('010', 0.38)} x={1600} y={600} text="power" c="#f2d27a" size={60} rot={2} />
				<Label f={f} t={w('010', 0.46)} x={1640} y={680} text="a phone line" c="#f2d27a" size={60} rot={-2} />
			</Over>
		</Wobble>
	);
};
const U010b: React.FC = () => {
	const {f, gf} = useShot();
	const cam = usePush(camOn(1100, 470, 1.2), camOn(1110, 470, 1.28));
	return (
		<Wobble seed={21}>
			<Stage cam={cam} bg="#3a4250" light={{x: 60, y: 30, o: 0.35, c: '160,200,255'}} grain={0.12} vig={0.6}>
				<Layer depth={1}>
					<WatchRoom f={gf} />
					<Svg>
						<Actor who="watch" x={1220} floor={FLOOR} seat={800} facing={-1} faceTurn={0.6} look={[-0.2, -0.3]} mouth="line" pose={reach({lean: 4, head: 0, armB: [25, 70], armF: [35, 65], legB: [88, 85], legF: [92, 90]}, 'F', [70, -60], 1)} uid="watch" />
						<rect x={1150} y={800} width={140} height={14} rx={5} fill="#2a2f3a" />
						<rect x={1210} y={814} width={12} height={86} fill="#2a2f3a" />
					</Svg>
				</Layer>
			</Stage>
			<Over>
				<Stamp f={f} a="Shore base" b="watching 24/7" />
			</Over>
		</Wobble>
	);
};

/* ================================ 011 ears pop; damp; something is happening inside ================================ */
const U011: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const ears = env2(f, w('011', 0.02), w('011', 0.3));
	const hp = gesture('handsOnHead', idle(gf, 2), ears * 0.0, f);
	const pose = reach(reach(hp, 'F', [30, -170], ears), 'B', [-30, -170], ears);
	const cam = usePush(camOn(1000, 560, 1.7), camOn(1000, 540, 1.85));
	return (
		<Wobble seed={22}>
			<Stage cam={cam} bg="#5f6d76" light={LIGHT} grain={0.12} vig={0.65}>
				<Layer depth={1}>
					<Habitat gf={gf} />
					<Svg>
						<Actor who="hero" x={RX} floor={FLOOR} facing={-1} faceTurn={0.2} look={[0, -0.2]} expr={ears > 0.5 ? 'wide' : 'normal'} mouth={ears > 0.5 ? 'open' : 'line'} pose={pose} uid="h-u011" />
					</Svg>
				</Layer>
			</Stage>
			<Over>
				<Label f={f} t={w('011', 0.06)} x={620} y={320} text="pop!" c="#f2d27a" size={80} rot={-8} until={w('011', 0.4)} />
				<Label f={f} t={w('011', 0.3)} x={1380} y={300} text="thick, damp air" c="#9fe0e8" size={58} rot={3} />
			</Over>
		</Wobble>
	);
};
const env2 = (f: number, a: number, b: number) => Math.min(kk(f, a, a + 6), 1 - kk(f, b - 6, b));

/* ================================ 012 nitrogen soaks into blood, muscles, fat ================================ */
const U012: React.FC = () => {
	const {f} = useShot();
	const w = useW();
	const soak = kk(f, w('012', 0.3), w('012', 0.95));
	const dots = Array.from({length: 80}).map((_, i) => {
		const r = ((i * 9301 + 49297) % 233280) / 233280;
		const r2 = ((i * 7907 + 1237) % 233280) / 233280;
		return {x: 760 + r * 400, y: 260 + r2 * 640, t: i / 80};
	});
	return (
		<Wobble seed={23}>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #1f3a4a 0%, #0c1820 90%)'}}>
				<svg viewBox="0 0 1920 1080" width={1920} height={1080}>
					{/* x-ray style body outline */}
					<g stroke="#9fe0e8" strokeWidth={7} fill="#173040" strokeLinejoin="round">
						<circle cx={960} cy={200} r={90} />
						<path d="M860,300 Q960,280 1060,300 L1120,560 L1080,580 L1040,420 L1040,640 L1070,980 L1000,980 L960,700 L920,980 L850,980 L880,640 L880,420 L840,580 L800,560 Z" />
					</g>
					{/* blood vessels */}
					<path d="M960,320 L960,640 M960,400 L870,560 M960,400 L1050,560 M960,640 L900,960 M960,640 L1020,960" stroke="#c8433d" strokeWidth={6} fill="none" opacity={0.8} />
					<clipPath id="body-x">
						<circle cx={960} cy={200} r={90} />
						<path d="M860,300 Q960,280 1060,300 L1120,560 L1080,580 L1040,420 L1040,640 L1070,980 L1000,980 L960,700 L920,980 L850,980 L880,640 L880,420 L840,580 L800,560 Z" />
					</clipPath>
					{/* nitrogen dots drifting in */}
					{dots.map((d, i) => {
						const k = kk(soak, d.t * 0.8, d.t * 0.8 + 0.2);
						if (k <= 0) return null;
						const inside = (y: number) => y;
						return <circle key={i} cx={d.x} cy={inside(d.y)} r={6} fill="#f2d27a" opacity={0.85 * k} clipPath="url(#body-x)" />;
					})}
					<text x={300} y={160} fontFamily={FONT} fontWeight={900} fontSize={48} fill="#f2d27a" opacity={kk(f, 6, 14)}>
						N₂
					</text>
				</svg>
			</AbsoluteFill>
			<Over>
				<Label f={f} t={w('012', 0.05)} x={420} y={260} text="extra nitrogen" c="#f2d27a" size={60} rot={-3} />
				<Label f={f} t={w('012', 0.62)} x={1460} y={420} text="blood" c="#ff9a8a" size={58} rot={2} to={[1000, 470]} bend={30} />
				<Label f={f} t={w('012', 0.72)} x={1500} y={600} text="muscles" c={PAPER} size={58} rot={-2} to={[1080, 640]} bend={20} />
				<Label f={f} t={w('012', 0.82)} x={1500} y={780} text="fat" c="#f2c98a" size={58} rot={3} to={[1050, 820]} bend={20} />
			</Over>
		</Wobble>
	);
};

export const SHOTS_U1: ShotDef[] = [
	{at: '001', C: U001},
	{at: '002', C: U002},
	{at: '003', C: U003},
	{at: '004', C: U004},
	{at: '005', C: U005},
	{at: '005', off: 130, C: U005b},
	{at: '006', C: U006},
	{at: '006', off: 140, C: U006b},
	{at: '007', C: U007},
	{at: '008', C: U008},
	{at: '010', C: U010},
	{at: '010', off: 200, C: U010b},
	{at: '011', C: U011},
	{at: '012', C: U012},
];

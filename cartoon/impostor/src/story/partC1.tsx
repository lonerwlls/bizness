import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {useShot} from '../kit/core';
import type {ShotDef} from '../kit/coverage';
import {Layer, Stage, Svg, camOn, clamp, usePush} from '../kit/kit';
import {HAND} from '../kit/ui';
import {CAST} from '../toon/cast';
import {Bg, BigNumber, Cork, Icon, Light, Paper, Tag, YEL, mixP, snap} from '../toon/kit';
import {INK, Toon} from '../toon/Toon';
import {useW} from './lib';

/* PART 1 (0:00–0:24, the sample): the bullet in the operating room, sixteen out of sixteen,
   "he's not a surgeon", a monk a few months ago, "his name is Fred Demara". */

const OR_SPOTS: [number, number, number][] = [
	[1200, 230, 260],
	[1710, 330, 200],
];

/* ================================ 001 a surgeon pulls a bullet out ================================ */
const C001: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const pull = w('001', 0.62);
	const k = snap(f, pull);
	const FX = 1100;
	const FY = 1000;
	const S = 2.2;
	const chest: [number, number] = [1490, 560];
	const up: [number, number] = [1290, 380];
	const handW = mixP(chest, up, Math.min(k, 1.12));
	const loc = (p: [number, number]): [number, number] => [(p[0] - FX) / S, (p[1] - FY) / S];
	const cam = usePush(camOn(1210, 600, 1.12), camOn(1220, 590, 1.2));
	return (
		<>
			<Stage cam={cam} bg="#2a2a2e" light={false} grain={0} vig={0}>
				<Layer depth={1}>
					<Bg src="bg/or.jpg" />
					<Svg>
						{/* the wounded soldier on the table, under a sheet */}
						<g transform="translate(1330,585) rotate(90)">
							<Toon id="pat1" r={CAST.soldier} x={0} y={0} s={1.0} t={gf} face={{blink: true, mouth: 'closed'}} />
						</g>
						<path d="M1306,676 q10,-8 20,0 q10,8 20,0 q10,-8 20,0 q10,8 20,0 q10,-8 20,0 q10,8 20,0 q10,-8 22,2 L1462,600 Q1466,546 1440,540 L1350,538 Q1312,542 1310,590 Z" fill="#eef0ec" stroke={INK} strokeWidth={5} />
						<Toon id="fred1" r={CAST.fredSurg} x={FX} y={FY} s={S} t={gf} pose={{hand: loc(handW), head: -4 * Math.min(k, 1)}} face={{look: k > 0.5 ? [0.2, -0.6] : [0.6, 0.6], mouth: k > 0.8 ? 'smile' : 'closed', brows: k > 0.8 ? 'up' : 'flat'}} />
						{/* forceps with the bullet */}
						<g transform={`translate(${handW[0]},${handW[1]}) rotate(${-30 + 40 * (1 - Math.min(k, 1))})`}>
							<path d="M0,0 L70,-6 M0,6 L70,4" stroke="#c8ccd6" strokeWidth={6} strokeLinecap="round" />
							<path d="M0,0 L70,-6 M0,6 L70,4" stroke={INK} strokeWidth={2} strokeLinecap="round" />
							{k > 0.2 ? <ellipse cx={80} cy={0} rx={13} ry={8} fill="#c9873a" stroke={INK} strokeWidth={4} /> : null}
						</g>
					</Svg>
					<Light id="l001" spots={OR_SPOTS} />
				</Layer>
			</Stage>
			<Paper />
			<Tag f={f} t={6} x={70} y={850} sub="1951" text="KOREA" size={56} />
			<Tag f={f} t={w('001', 0.4)} x={70} y={70} text="WARSHIP SURGEON" size={44} until={pull + 40} />
		</>
	);
};

/* ================================ 002 sixteen wounded, sixteen operations, nobody dies ================================ */
const C002: React.FC = () => {
	const {f} = useShot();
	const w = useW();
	const a = w('002', 0.02);
	const b = w('002', 0.36);
	const c = w('002', 0.68);
	const cam = usePush(camOn(960, 560, 1.05), camOn(960, 560, 1.12));
	return (
		<>
			<Stage cam={cam} bg="#2a2a2e" light={false} grain={0} vig={0}>
				<Layer depth={1}>
					<Bg src="bg/deck.jpg" dim={0.55} />
				</Layer>
			</Stage>
			<Paper />
			{f < b ? <BigNumber f={f} t={a} text="16" sub="wounded" /> : null}
			{f >= b && f < c ? <BigNumber f={f} t={b} text="16" sub="operations" /> : null}
			{f >= c ? <BigNumber f={f} t={c} text="0" sub="deaths" c="#7ad07a" /> : null}
		</>
	);
};

/* ================================ 003 one problem: he's not a surgeon ================================ */
const C003: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const not = w('003', 0.55);
	const shock = snap(f, not + 2);
	const cam = usePush(camOn(1120, 470, 1.9), camOn(1120, 460, 2.0));
	return (
		<>
			<Stage cam={cam} bg="#2a2a2e" light={false} grain={0} vig={0}>
				<Layer depth={1}>
					<Bg src="bg/or.jpg" />
					<Svg>
						<Toon id="fred3" r={CAST.fredSurg} x={1100} y={1000} s={2.2} t={gf} pose={{hand: f < not ? [40, -150] : [70, -250], handB: f < not ? [-40, -150] : [-80, -250], head: shock > 0 ? 6 : -4}} face={{look: f < not ? [0.1, -0.2] : [0.6, 0], mouth: f < not ? 'smile' : 'o', brows: f < not ? 'flat' : 'worried', sweat: f > not + 6}} />
						<Icon kind="halo" x={1110} y={235} f={f} t={w('003', 0.08)} s={1.4} out={not} />
					</Svg>
					<Light id="l003" spots={OR_SPOTS} />
				</Layer>
			</Stage>
			<Paper />
			<Tag f={f} t={not + 4} x={1220} y={90} text="SURGEON" box="cross" size={54} />
		</>
	);
};

/* ================================ 004 never in medical school; a few months ago, a monk ================================ */
const Polaroid: React.FC<{x: number; y: number; rot: number; k: number; label: string; children: React.ReactNode}> = ({x, y, rot, k, label, children}) => (
	<g transform={`translate(${x},${y}) rotate(${rot}) scale(${0.6 + 0.4 * k})`} opacity={Math.min(1, k * 2)}>
		<rect x={-200} y={-230} width={400} height={470} fill="#f6f3ea" stroke={INK} strokeWidth={4} />
		<rect x={-176} y={-206} width={352} height={340} fill="#3a4a5a" />
		<clipPath id={`pc-${label.replace(/\W/g, "")}`}>
			<rect x={-176} y={-206} width={352} height={340} />
		</clipPath>
		<g clipPath={`url(#pc-${label.replace(/\W/g, "")})`}>{children}</g>
		<circle cy={-246} r={13} fill="#d23b3b" stroke={INK} strokeWidth={3} />
		<text y={200} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={44} fill={INK}>
			{label}
		</text>
	</g>
);
const C004: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const p1 = snap(f, w('004', 0.02));
	const stamp = w('004', 0.3);
	const p2 = snap(f, w('004', 0.55));
	return (
		<>
			<Cork>
				<svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
					<Polaroid x={620} y={520} rot={-5} k={p1} label="medical school">
						<rect x={-176} y={-206} width={352} height={340} fill="#e8dcc0" />
						<rect x={-120} y={-150} width={240} height={180} fill="#fbf6e6" stroke={INK} strokeWidth={4} />
						{[0, 1, 2, 3].map((i) => (
							<line key={i} x1={-90} y1={-110 + i * 32} x2={90 - (i % 2) * 40} y2={-110 + i * 32} stroke="#8a8070" strokeWidth={6} />
						))}
						<circle cx={70} cy={10} r={22} fill="#c83a3a" stroke={INK} strokeWidth={3} />
					</Polaroid>
					{f > stamp ? (
						<g transform={`translate(620,480) rotate(-14) scale(${interpolate(f, [stamp, stamp + 5], [1.6, 1], clamp)})`} opacity={0.92}>
							<rect x={-170} y={-50} width={340} height={100} rx={10} fill="none" stroke="#d23b3b" strokeWidth={9} />
							<text y={24} textAnchor="middle" fontFamily="'Rubik', sans-serif" fontWeight={900} fontSize={72} fill="#d23b3b">
								NEVER
							</text>
						</g>
					) : null}
					<Polaroid x={1300} y={520} rot={4} k={p2} label="a few months ago">
						<rect x={-176} y={-206} width={352} height={340} fill="#7a6a58" />
						<Toon id="monk4" r={CAST.fredMonk} x={0} y={260} s={1.25} t={gf} face={{mouth: 'smile', look: [0, -0.1]}} pose={{hand: [30, -170], handB: [-30, -170]}} />
					</Polaroid>
				</svg>
				<Tag f={f} t={w('004', 0.75)} x={1150} y={880} text="A MONK" size={56} />
			</Cork>
			<Paper />
		</>
	);
};

/* ================================ 005 his name is Fred Demara — he has been a lot of people ================================ */
const LOOKS = ['fredMonk', 'fredProf', 'fredSuit', 'fredSurg', 'fredNavy'];
const C005: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const swap = w('005', 0.5);
	const step = f < swap ? LOOKS.length - 1 : Math.min(LOOKS.length - 1, Math.floor((f - swap) / 6));
	const look = LOOKS[step];
	const pop = f >= swap ? snap((f - swap) % 6, 0, 0.15) : 1;
	const cam = usePush(camOn(960, 640, 1.25), camOn(960, 620, 1.33));
	return (
		<>
			<Stage cam={cam} bg="#2a2a2e" light={false} grain={0} vig={0}>
				<Layer depth={1}>
					<Bg src="bg/deck.jpg" />
					<Svg>
						<g transform={`translate(960,1010) scale(${0.94 + 0.06 * Math.min(pop, 1.1)}) translate(-960,-1010)`}>
							<Toon id="fred5" r={CAST[look]} x={960} y={1010} s={2.0} t={gf} pose={{hand: [60, -150], handB: [-60, -150]}} face={{look: [0.15, -0.1], mouth: 'smirk', brows: 'sly'}} />
						</g>
					</Svg>
					<Light id="l005" spots={[[1500, 120, 420]]} dark={0.12} glow="#fff2c8" />
				</Layer>
			</Stage>
			<Paper />
			<Tag f={f} t={w('005', 0.05)} x={70} y={880} text="FRED DEMARA" size={60} />
		</>
	);
};

export const SHOTS_C1: ShotDef[] = [
	{at: '001', C: C001},
	{at: '002', C: C002},
	{at: '003', C: C003},
	{at: '004', C: C004},
	{at: '005', C: C005},
	{at: '006', C: () => <AbsoluteFill style={{background: '#000'}}>{null}</AbsoluteFill>},
];
void YEL;

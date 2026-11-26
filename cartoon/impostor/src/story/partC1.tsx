import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {talkOf, useShot} from '../kit/core';
import type {ShotDef} from '../kit/coverage';
import {Layer, Stage, Svg, camOn, clamp, usePush} from '../kit/kit';
import {FONT, HAND} from '../kit/ui';
import {CAST} from '../toon/cast';
import {Bg, BigNumber, BlackCard, Cork, Felt, Icon, Light, P, Paper, Sheet, Stamp, Tag, mixP, snap} from '../toon/kit';
import {INK, Mouth, Pose, Toon} from '../toon/Toon';
import TL from './timeline.json';
import {useW} from './lib';

/* PART 1 (0:00–1:33): the cold open on the warship, Fred's childhood, monk, army, Ignolia,
   the navy corpsman, the fake suicide, Dr. Robert Linton French, the forged checks.
   Rules: heroes ~1/3 of the frame, something new every 1.5–2 s, snap poses. */

const T = (id: string, k: number) => Math.round(TL.lines.find((x) => x.id.startsWith(id))!.dur * k);
const kk = (x: number, a: number, b: number) => Math.max(0, Math.min(1, (x - a) / (b - a)));
/* mouth by voice loudness, holding each shape 3 frames */
const mouthOf = (sp: string, gf: number, rest: Mouth = 'closed'): Mouth => {
	const v = talkOf(sp, gf - (gf % 3));
	return v > 0.5 ? 'wide' : v > 0.16 ? 'open' : rest;
};
/* walking: x along a path and a leg swing */
const walk = (f: number, t0: number, t1: number, x0: number, x1: number) => {
	const k = kk(f, t0, t1);
	return {x: x0 + (x1 - x0) * k, step: k > 0 && k < 1 ? Math.sin(f / 3) : 0, bob: k > 0 && k < 1 ? Math.abs(Math.sin(f / 3)) * 6 : 0};
};
const OR_SPOTS: [number, number, number][] = [
	[1233, 190, 280],
	[1811, 304, 200],
];
const S = 1.18; // hero scale (~40 % of the frame height)

/* ================================ 001 a surgeon pulls a bullet ================================ */
const C001: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const pull = w('001', 0.42);
	const k = snap(f, pull);
	const FX = 1130;
	const FY = 1000;
	const SO = 1.4;
	const chest: [number, number] = [1470, 585];
	const up: [number, number] = [1330, 470];
	const hw = mixP(chest, up, Math.min(k, 1.12));
	const loc = (p: [number, number]): [number, number] => [(p[0] - FX) / SO, (p[1] - FY) / SO];
	const cam = usePush(camOn(1260, 640, 1.05), camOn(1300, 620, 1.14));
	return (
		<>
			<Stage cam={cam} bg="#2a2a2e" light={false} grain={0} vig={0}>
				<Layer depth={1}>
					<Bg src="bg/or.jpg" />
					<Svg>
						<g transform="translate(1330,592) rotate(90)">
							<Toon id="pat1" r={CAST.soldier} x={0} y={0} s={0.9} t={gf} face={{blink: true}} />
						</g>
						<path d="M1300,660 q10,-8 20,0 q10,8 20,0 q10,-8 20,0 q10,8 20,0 q10,-8 20,0 q12,8 22,2 L1446,600 Q1450,556 1426,550 L1338,548 Q1302,552 1300,592 Z" fill="#eef0ec" stroke={INK} strokeWidth={4} />
						<Toon id="fred1" r={CAST.fredSurg} x={FX} y={FY} s={SO} t={gf} pose={{hand: loc(hw), handB: [-60, -120]}} face={{look: k > 0.5 ? [0.3, -0.7] : [0.7, 0.5], mouth: k > 0.8 ? 'grin' : 'closed', brows: k > 0.8 ? 'up' : 'down'}} />
						<g transform={`translate(${hw[0]},${hw[1]}) rotate(${-25 + 35 * (1 - Math.min(k, 1))})`}>
							<path d="M0,0 L55,-5 M0,5 L55,3" stroke="#c8ccd6" strokeWidth={5} strokeLinecap="round" />
							{k > 0.2 ? <ellipse cx={63} cy={0} rx={10} ry={6} fill="#c9873a" stroke={INK} strokeWidth={3} /> : null}
						</g>
					</Svg>
					<Light id="l001" spots={OR_SPOTS} />
				</Layer>
			</Stage>
			<Paper />
			<Tag f={f} t={4} x={70} y={860} sub="1951" text="KOREA" size={56} />
			<Tag f={f} t={w('001', 0.2)} x={70} y={70} text="WARSHIP SURGEON" size={44} />
		</>
	);
};
/* insert: the bullet drops into a steel dish */
const C001b: React.FC = () => {
	const {f} = useShot();
	const drop = 10;
	const fall = kk(f, drop, drop + 6);
	const bounce = f > drop + 6 ? Math.abs(Math.sin((f - drop - 6) / 2)) * 12 * Math.exp(-(f - drop - 6) / 5) : 0;
	return (
		<>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 55%, #6a6e74 0%, #3a3d44 70%, #1c1d22 100%)'}}>
				<svg viewBox="0 0 1920 1080" width={1920} height={1080}>
					<ellipse cx={960} cy={760} rx={420} ry={120} fill="#000" opacity={0.25} />
					<path d="M560,640 Q960,860 1360,640 Q1340,720 960,780 Q580,720 560,640 Z" fill="#c8ccd6" stroke={INK} strokeWidth={8} />
					<ellipse cx={960} cy={640} rx={400} ry={70} fill="#dfe3ea" stroke={INK} strokeWidth={8} />
					<ellipse cx={960 + 30 * fall} cy={330 + 330 * fall - bounce} rx={34} ry={20} fill="#c9873a" stroke={INK} strokeWidth={6} transform={`rotate(${20 * fall},${960 + 30 * fall},${330 + 330 * fall})`} />
					{/* forceps open at the top */}
					<g transform={`translate(${820 - 60 * fall},${300 - 80 * fall}) rotate(-20)`}>
						<path d="M-260,-10 L130,-24 M-260,10 L130,${20 + 10 * kk(f, drop - 2, drop)}" stroke="#c8ccd6" strokeWidth={16} strokeLinecap="round" />
						<path d="M-260,-10 L130,-24 M-260,10 L130,${20 + 10 * kk(f, drop - 2, drop)}" stroke={INK} strokeWidth={4} strokeLinecap="round" opacity={0.5} />
					</g>
					{f > drop + 6 ? (
						<text x={1210} y={480} fontFamily={HAND} fontWeight={700} fontSize={90} fill="#f2c94c" transform="rotate(-8,1210,480)" style={{paintOrder: 'stroke'}} stroke="#1d1a1f" strokeWidth={8}>
							clink!
						</text>
					) : null}
				</svg>
			</AbsoluteFill>
			<Paper />
		</>
	);
};

/* ================================ 002 sixteen, sixteen, zero ================================ */
const C002: React.FC = () => {
	const {f} = useShot();
	const w = useW();
	const a = w('002', 0.0);
	const b = w('002', 0.33);
	const c = w('002', 0.66);
	const src = f < b ? 'bg/deck.jpg' : 'bg/or.jpg';
	const cam = usePush(camOn(960, 560, 1.05), camOn(990, 560, 1.15));
	return (
		<>
			<Stage cam={cam} bg="#2a2a2e" light={false} grain={0} vig={0}>
				<Layer depth={1}>
					<Bg src={src} dim={0.6} />
				</Layer>
			</Stage>
			<Paper />
			{f < b ? <BigNumber f={f} t={a} text="16" sub="wounded" /> : null}
			{f >= b && f < c ? (
				<>
					<BigNumber f={f} t={b} text="16" sub="operations" />
					<svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
						{Array.from({length: 16}).map((_, i) =>
							f > b + 3 + i * 1.6 ? <path key={i} d={`M${420 + i * 72},900 l16,18 l30,-38`} stroke="#7ad07a" strokeWidth={9} fill="none" strokeLinecap="round" /> : null,
						)}
					</svg>
				</>
			) : null}
			{f >= c ? <BigNumber f={f} t={c} text="0" sub="deaths" c="#7ad07a" /> : null}
		</>
	);
};

/* ================================ 003 one problem: he's not a surgeon ================================ */
const C003: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const not = w('003', 0.5);
	const cam = usePush(camOn(1080, 640, 1.45), camOn(1080, 630, 1.55));
	const pose: Pose = f < not ? {hand: [72, -86], handB: [-72, -86], head: -4} : {hand: [90, -250], handB: [-90, -250], head: 6};
	return (
		<>
			<Stage cam={cam} bg="#2a2a2e" light={false} grain={0} vig={0}>
				<Layer depth={1}>
					<Bg src="bg/or.jpg" />
					<Svg>
						<Toon id="fred3" r={CAST.fredSurg} x={1080} y={1000} s={1.4} t={gf} pose={pose} face={{look: f < not ? [0.2, -0.2] : [0.7, 0], mouth: f < not ? 'grin' : 'o', brows: f < not ? 'sly' : 'worried', lids: f < not ? 'sly' : undefined, sweat: f > not + 5}} />
						<Icon kind="halo" x={1092} y={545} f={f} t={w('003', 0.05)} s={0.75} out={not} />
					</Svg>
					<Light id="l003" spots={OR_SPOTS} />
				</Layer>
			</Stage>
			<Paper />
			<Tag f={f} t={not + 3} x={1260} y={110} text="SURGEON" box="cross" size={54} />
		</>
	);
};

/* ================================ 004 never medical school; a monk ================================ */
const Polaroid: React.FC<{x: number; y: number; rot: number; k: number; label: string; children: React.ReactNode}> = ({x, y, rot, k, label, children}) => {
	const id = 'pc' + label.replace(/\W/g, '');
	return (
		<g transform={`translate(${x},${y}) rotate(${rot}) scale(${0.6 + 0.4 * Math.min(k, 1.1)})`} opacity={Math.min(1, k * 2)}>
			<rect x={-200} y={-230} width={400} height={470} fill="#f6f3ea" stroke={INK} strokeWidth={4} />
			<clipPath id={id}>
				<rect x={-176} y={-206} width={352} height={340} />
			</clipPath>
			<g clipPath={`url(#${id})`}>{children}</g>
			<circle cy={-246} r={13} fill="#d23b3b" stroke={INK} strokeWidth={3} />
			<text y={200} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={44} fill={INK}>
				{label}
			</text>
		</g>
	);
};
const Diploma: React.FC = () => (
	<g>
		<rect x={-176} y={-206} width={352} height={340} fill="#e8dcc0" />
		<rect x={-120} y={-150} width={240} height={180} fill="#fbf6e6" stroke={INK} strokeWidth={4} />
		{[0, 1, 2, 3].map((i) => (
			<line key={i} x1={-90} y1={-110 + i * 32} x2={90 - (i % 2) * 40} y2={-110 + i * 32} stroke="#8a8070" strokeWidth={6} />
		))}
		<circle cx={70} cy={10} r={22} fill="#c83a3a" stroke={INK} strokeWidth={3} />
	</g>
);
const C004: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	return (
		<>
			<Cork>
				<svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
					<Polaroid x={620} y={520} rot={-5} k={snap(f, w('004', 0.0))} label="medical school">
						<Diploma />
					</Polaroid>
					<Stamp f={f} t={w('004', 0.28)} x={620} y={480} text="NEVER" rot={-14} />
					<Polaroid x={1300} y={520} rot={4} k={snap(f, w('004', 0.52))} label="a few months ago">
						<rect x={-176} y={-206} width={352} height={340} fill="#7a6a58" />
						<Toon id="monk4" r={CAST.fredMonk} x={0} y={250} s={1.15} t={gf} face={{mouth: 'smile', lids: 'sleepy'}} pose={{hand: [18, -135], handB: [-18, -135]}} />
					</Polaroid>
				</svg>
				<Tag f={f} t={w('004', 0.72)} x={1160} y={880} text="A MONK" size={56} />
			</Cork>
			<Paper />
		</>
	);
};

/* ================================ 005 his name; a lot of people (visible outfit changes) ================================ */
const LOOKS = ['fredMonk', 'fredProf', 'fredArmy', 'fredSuit'];
const C005: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const swap = w('005', 0.5);
	const i = f < swap ? -1 : Math.min(LOOKS.length - 1, Math.floor((f - swap) / 12));
	const look = i < 0 ? 'fredNavy' : LOOKS[i];
	const changing = i >= 0 && f - swap < LOOKS.length * 12;
	const pop = changing ? snap((f - swap) % 12, 0, 0.2) : 1;
	const P5: Pose[] = [{hand: [18, -135], handB: [-18, -135]}, {hand: [60, -270], handB: [-55, -120]}, {hand: [40, -300], handB: [-60, -110]}, {hand: [110, -190], handB: [-110, -190]}];
	const F5 = [{mouth: 'smile' as const, lids: 'sleepy' as const}, {mouth: 'grin' as const, brows: 'up' as const}, {mouth: 'closed' as const, brows: 'down' as const}, {mouth: 'grin' as const, lids: 'sly' as const, brows: 'sly' as const}];
	const cam = usePush(camOn(960, 680, 1.1), camOn(960, 660, 1.18));
	return (
		<>
			<Stage cam={cam} bg="#2a2a2e" light={false} grain={0} vig={0}>
				<Layer depth={1}>
					<Bg src="bg/deck.jpg" />
					<Svg>
						<g transform={`translate(960,990) scale(${0.9 + 0.1 * Math.min(pop, 1.15)}) translate(-960,-990)`}>
							<Toon id="fred5" r={CAST[look]} x={960} y={990} s={S} t={gf} pose={i < 0 ? {hand: [72, -86], handB: [-72, -86]} : P5[i]} face={i < 0 ? {look: [0.3, -0.1], mouth: 'smirk', brows: 'sly', lids: 'sly'} : {look: [0.2, -0.1], ...F5[i]}} />
						</g>
						{changing && (f - swap) % 12 < 4 ? <circle cx={960} cy={760} r={190} fill="#fff" opacity={0.25 * (1 - ((f - swap) % 12) / 4)} /> : null}
					</Svg>
				</Layer>
			</Stage>
			<Paper />
			<Tag f={f} t={w('005', 0.05)} x={70} y={880} text="FRED DEMARA" size={60} />
			{i >= 0 ? <Tag f={f} t={swap + i * 12} x={1300} y={110} text={['MONK', 'PSYCHOLOGIST', 'SOLDIER', 'LAW STUDENT'][i]} size={46} /> : null}
		</>
	);
};

/* ================================ 006–007 Lawrence: the projection booth; the Depression ================================ */
const BOOTH_SPOTS: [number, number, number][] = [
	[P(215, 85)[0], P(215, 85)[1] + 60, 220],
	[P(725, 135)[0], P(725, 135)[1] + 60, 220],
	[P(380, 290)[0], P(380, 290)[1], 260],
];
const C006: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const proj = w('006', 0.45);
	const boy = walk(f, 4, 40, 560, 800);
	const cam = usePush(camOn(960, 660, 1.2), camOn(1010, 650, 1.26));
	return (
		<>
			<Stage cam={cam} bg="#2a2a2e" light={false} grain={0} vig={0}>
				<Layer depth={1}>
					<Bg src="bg/booth.jpg" />
					<Svg>
						<Toon id="dad6" r={CAST.father} x={1180} y={1000} s={S} facing={1} t={gf} pose={{hand: [95 + 14 * Math.cos(f / 4), -175 + 14 * Math.sin(f / 4)], handB: [-50, -120], head: -4}} face={{look: [0.7, -0.2], mouth: snap(f, proj) > 0 ? 'grin' : 'smile', brows: 'up'}} />
						<Toon id="boy6" r={CAST.fredBoy} x={boy.x} y={1000 - boy.bob} s={S} facing={1} t={gf} pose={{step: boy.step, hand: boy.step ? [40, -120] : [20, -150], handB: boy.step ? [-40, -120] : [-20, -150]}} face={{look: [0.8, -0.5], mouth: 'grin', brows: 'up'}} />
					</Svg>
					<Light id="l006" spots={BOOTH_SPOTS} dark={0.3} />
				</Layer>
			</Stage>
			<Paper />
			<Tag f={f} t={4} x={70} y={860} sub="1930s" text="LAWRENCE, MASSACHUSETTS" size={50} />
			<Tag f={f} t={proj} x={1250} y={100} text="DAD: PROJECTIONIST" size={42} />
		</>
	);
};
const C007: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const hit = w('007', 0.42);
	const cam = usePush(camOn(1020, 660, 1.22), camOn(1030, 660, 1.3));
	const poor = f > hit;
	return (
		<>
			<Stage cam={cam} bg="#2a2a2e" light={false} grain={0} vig={0}>
				<Layer depth={1}>
					<Bg src="bg/booth.jpg" dim={poor ? 0.45 : 0} />
					<Svg>
						<Toon id="dad7" r={CAST.father} x={1180} y={1000} s={S} t={gf} pose={poor ? {hand: [30, -40], handB: [-30, -40], head: 12} : {hand: [115, -200], handB: [-115, -200]}} face={{look: poor ? [0, 0.6] : [0.2, -0.3], mouth: poor ? 'frown' : 'grin', brows: poor ? 'worried' : 'up', lids: poor ? 'sleepy' : undefined}} />
						<Toon id="boy7" r={CAST.fredBoy} x={880} y={1000 - (poor ? 0 : Math.abs(Math.sin(f / 4)) * 14)} s={S} t={gf} pose={poor ? {head: 8, hand: [20, -70], handB: [-20, -70]} : {hand: [90, -230], handB: [-90, -230]}} face={{look: [0.7, poor ? 0.1 : -0.4], mouth: poor ? 'frown' : 'grin', brows: poor ? 'worried' : 'up'}} />
						{!poor ? <Icon kind="crown" x={1190} y={598} f={f} t={w('007', 0.08)} s={0.9} /> : null}
						{!poor
							? [0, 1, 2].map((j) => (
									<text key={j} x={1060 + j * 120} y={430 - ((f * 3 + j * 40) % 120)} fontFamily={FONT} fontWeight={900} fontSize={56} fill="#7ad07a" stroke={INK} strokeWidth={4} style={{paintOrder: 'stroke'}} opacity={0.9}>
										$
									</text>
								))
							: null}
					</Svg>
					{!poor ? <Light id="l007" spots={BOOTH_SPOTS} dark={0.3} /> : null}
				</Layer>
			</Stage>
			<Paper />
			{poor ? <Tag f={f} t={hit + 2} x={70} y={100} text="THE GREAT DEPRESSION" size={50} /> : null}
		</>
	);
};

/* ================================ 008–009 runs away to the monks; not suited ================================ */
const MON_SPOTS: [number, number, number][] = [
	[P(1345, 330)[0], P(1345, 330)[1], 200],
	[P(1040, 380)[0], P(1040, 380)[1], 160],
	[P(500, 390)[0], P(500, 390)[1], 160],
];
const C008: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const run = walk(f, 2, w('008', 0.7), 260, 1180);
	const robe = f > w('008', 0.72);
	const cam = usePush(camOn(820, 660, 1.08), camOn(1060, 650, 1.12));
	return (
		<>
			<Stage cam={cam} bg="#2a2a2e" light={false} grain={0} vig={0}>
				<Layer depth={1}>
					<Bg src="bg/monastery.jpg" />
					<Svg>
						<Toon id="boy8" r={robe ? CAST.fredMonk : CAST.fredBoy} x={run.x} y={995 - run.bob} s={S * 0.95} t={gf} pose={{step: run.step, hand: [44, -110]}} face={{look: [0.7, -0.1], mouth: robe ? 'smile' : 'grin', brows: 'up', lids: robe ? 'sleepy' : undefined}} />
						{/* a little bundle on a stick */}
						{!robe ? <g transform={`translate(${run.x + 40},${995 - run.bob - 120})`}>
							<line x1={0} y1={0} x2={-60} y2={-70} stroke="#7a5232" strokeWidth={6} />
							<circle cx={-66} cy={-76} r={20} fill="#c8433d" stroke={INK} strokeWidth={4} />
						</g> : null}
					</Svg>
					<Light id="l008" spots={MON_SPOTS} dark={0.35} glow="#ffb860" />
				</Layer>
			</Stage>
			<Paper />
			<Tag f={f} t={4} x={70} y={860} sub="1937" text="AGE 16" size={56} />
			{robe ? <Tag f={f} t={w('008', 0.72)} x={1300} y={100} text="NOVICE MONK" size={48} /> : null}
		</>
	);
};
const C009: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const no = w('009', 0.45);
	const shake = f > no ? Math.sin(f / 2.5) * 10 * Math.exp(-(f - no) / 20) : 0;
	const cam = usePush(camOn(1080, 680, 1.25), camOn(1060, 670, 1.32));
	return (
		<>
			<Stage cam={cam} bg="#2a2a2e" light={false} grain={0} vig={0}>
				<Layer depth={1}>
					<Bg src="bg/monastery.jpg" />
					<Svg>
						<Toon id="fred9" r={CAST.fredMonk} x={920} y={995} s={S} t={gf} facing={1} pose={f > no ? {hand: [70, -240], handB: [-70, -240], head: 8} : {hand: [18, -135], handB: [-18, -135]}} face={{look: [0.7, 0], mouth: f > no ? 'o' : 'smile', brows: f > no ? 'worried' : 'flat', lids: f > no ? undefined : 'sleepy', sweat: f > no + 8}} />
						<Toon id="abbot9" r={CAST.monk} x={1240} y={995} s={S} t={gf} facing={-1} pose={{head: shake, hand: snap(f, no) > 0 ? [70, -200] : [40, -110]}} face={{look: [0.6, 0], mouth: 'frown', brows: 'down', talk: f > w('009', 0.1) && f < no ? Math.abs(Math.sin(f / 3.2)) * 0.7 : 0}} />
					</Svg>
					<Light id="l009" spots={MON_SPOTS} dark={0.35} glow="#ffb860" />
				</Layer>
			</Stage>
			<Paper />
			<Tag f={f} t={w('009', 0.05)} x={70} y={860} text="TWO YEARS LATER" size={50} />
			<Tag f={f} t={no + 4} x={1220} y={100} text="SUITED FOR IT" box="cross" size={50} />
		</>
	);
};

/* ================================ 010 the army doesn't suit him either ================================ */
const C010: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	return (
		<>
			<Cork>
				<svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
					<Polaroid x={760} y={520} rot={-4} k={snap(f, 2)} label="U.S. Army, 1941">
						<rect x={-176} y={-206} width={352} height={340} fill="#8a8a68" />
						<Toon id="army10" r={CAST.fredArmy} x={0} y={250} s={1.15} t={gf} face={{mouth: 'smirk', look: [0.2, 0], brows: 'down'}} pose={{hand: [40, -300]}} />
					</Polaroid>
					<Stamp f={f} t={w('010', 0.55)} x={760} y={470} text="NOPE" rot={-10} />
					<Polaroid x={1300} y={540} rot={6} k={snap(f, 10)} label="the monastery">
						<rect x={-176} y={-206} width={352} height={340} fill="#7a6a58" />
						<Toon id="monk10" r={CAST.fredMonk} x={0} y={250} s={1.15} t={gf} face={{mouth: 'smile', lids: 'sleepy'}} pose={{hand: [18, -135], handB: [-18, -135]}} />
					</Polaroid>
					<Stamp f={f} t={10} x={1300} y={490} text="NOPE" rot={8} size={56} />
				</svg>
			</Cork>
			<Paper />
		</>
	);
};

/* ================================ 011 a buddy's name, and he walks away ================================ */
const IdCard: React.FC<{f: number; strike: number; write: number}> = ({f, strike, write}) => {
	const name = 'ANTHONY IGNOLIA';
	const n = Math.max(0, Math.min(name.length, Math.floor((f - write) * 0.9)));
	return (
		<g>
			<rect x={-300} y={-180} width={600} height={360} rx={14} fill="#e8e0c8" stroke={INK} strokeWidth={5} />
			<rect x={-300} y={-180} width={600} height={70} rx={14} fill="#6a6e44" />
			<text x={-270} y={-132} fontFamily={FONT} fontWeight={900} fontSize={34} fill="#f4efe2">
				U.S. ARMY · SERVICE CARD
			</text>
			<rect x={-270} y={-90} width={160} height={200} fill="#cfc6a8" stroke={INK} strokeWidth={4} />
			<circle cx={-190} cy={-20} r={44} fill="#f1d2b0" stroke={INK} strokeWidth={4} />
			<path d="M-250,110 Q-190,40 -130,110 Z" fill="#6a6e44" stroke={INK} strokeWidth={4} />
			<text x={-80} y={-40} fontFamily={FONT} fontWeight={700} fontSize={30} fill="#5a5048">
				NAME
			</text>
			<text x={-80} y={10} fontFamily={FONT} fontWeight={900} fontSize={40} fill={INK}>
				FRED DEMARA
			</text>
			{f > strike ? <line x1={-86} y1={-2} x2={-86 + 320 * kk(f, strike, strike + 6)} y2={-2} stroke="#d23b3b" strokeWidth={8} /> : null}
			<text x={-80} y={80} fontFamily={HAND} fontWeight={700} fontSize={48} fill="#2a4a8a">
				{name.slice(0, n)}
			</text>
		</g>
	);
};
const C011: React.FC = () => {
	const {f} = useShot();
	const w = useW();
	const strike = w('011', 0.3);
	const write = w('011', 0.42);
	const away = w('011', 0.82);
	const slide = kk(f, away, away + 14);
	return (
		<>
			<Felt>
				<Sheet x={960 + 1300 * slide * slide} y={540} w={10} h={10} k={0} />
				<g transform={`translate(${960 + 1300 * slide * slide},540) rotate(${-3 + 20 * slide}) scale(${1.1 + 0.5 * Math.min(snap(f, 2), 1.1)})`}>
					<IdCard f={f} strike={strike} write={write} />
				</g>
				<text x={160} y={150} fontFamily={HAND} fontWeight={700} fontSize={64} fill="#f2c94c" opacity={kk(f, 2, 8)}>
					1942
				</text>
				{slide > 0.2 ? (
					<text x={760} y={560} fontFamily={HAND} fontWeight={700} fontSize={90} fill="#f4efe2" opacity={kk(slide, 0.2, 0.6)}>
						AWOL
					</text>
				) : null}
			</Felt>
			<Paper />
		</>
	);
};

/* ================================ 012 two more monasteries, then the navy ================================ */
const C012: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const navy = w('012', 0.58);
	if (f >= navy) {
		const salute = snap(f, navy + 6);
		return (
			<>
				<Stage cam={camOn(960, 680, 1.12)} bg="#2a2a2e" light={false} grain={0} vig={0}>
					<Layer depth={1}>
						<Bg src="bg/deck.jpg" />
						<Svg>
							<Toon id="fred12n" r={CAST.fredSailor} x={960} y={990} s={S} t={gf} pose={{hand: salute > 0 ? mixP([50, -120], [40, -300], Math.min(salute, 1.1)) : [50, -120]}} face={{look: [0.2, -0.1], mouth: salute > 0 ? 'grin' : 'smile', brows: 'up'}} />
						</Svg>
					</Layer>
				</Stage>
				<Paper />
				<Tag f={f} t={navy + 2} x={70} y={860} text="U.S. NAVY" size={56} />
			</>
		);
	}
	const half = navy / 2;
	const n = f < half ? 2 : 3;
	const local = f < half ? f : f - half;
	const run = walk(local, 0, half - 4, 220, 1500);
	return (
		<>
			<Stage cam={camOn(900, 660, 1.06)} bg="#2a2a2e" light={false} grain={0} vig={0}>
				<Layer depth={1}>
					<Bg src="bg/monastery.jpg" dim={0.15} />
					<Svg>
						<Toon id="fred12m" r={CAST.fredMonk} x={run.x} y={995 - run.bob} s={S} t={gf} pose={{step: run.step, hand: [18, -135], handB: [-18, -135]}} face={{look: [0.7, 0], mouth: 'smile', lids: 'sleepy'}} />
					</Svg>
					<Light id="l012" spots={MON_SPOTS} dark={0.35} glow="#ffb860" />
				</Layer>
			</Stage>
			<Paper />
			<Tag f={f} t={f < half ? 2 : half} x={70} y={100} text={`MONASTERY #${n}`} size={52} />
		</>
	);
};

/* ================================ 013 hospital corpsman — remember that ================================ */
const C013: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const rem = w('013', 0.7);
	const ring = kk(f, rem, rem + 10);
	const zoom = 1.08 + 0.35 * snap(f, rem, 0.06) / 1.06;
	const run = walk(f, 2, w('013', 0.5), 700, 1050);
	return (
		<>
			<Stage cam={camOn(1060, 700, zoom)} bg="#2a2a2e" light={false} grain={0} vig={0}>
				<Layer depth={1}>
					<Bg src="bg/or.jpg" />
					<Svg>
						<Toon id="fred13" r={CAST.fredSailor} x={run.x} y={985 - run.bob} s={S} t={gf} pose={{step: run.step, hand: [60, -130], handB: [-60, -130]}} face={{look: [0.6, -0.1], mouth: 'grin', brows: 'up'}} />
						{/* red-cross armband and a tray of bandages */}
						<g transform={`translate(${run.x},${985 - run.bob - 130})`}>
							<rect x={-75} y={-12} width={150} height={20} rx={5} fill="#f4f4f0" stroke={INK} strokeWidth={4} />
							<rect x={-60} y={-34} width={30} height={24} rx={4} fill="#f4f4f0" stroke={INK} strokeWidth={3} />
							<rect x={10} y={-30} width={36} height={20} rx={4} fill="#c8ccd6" stroke={INK} strokeWidth={3} />
						</g>
						{ring > 0 ? <ellipse cx={run.x} cy={800} rx={210} ry={250} fill="none" stroke="#d23b3b" strokeWidth={10} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ring} /> : null}
					</Svg>
					<Light id="l013" spots={OR_SPOTS} />
				</Layer>
			</Stage>
			<Paper />
			<Tag f={f} t={w('013', 0.08)} x={70} y={860} text="HOSPITAL CORPSMAN" size={52} />
			<Tag f={f} t={rem + 6} x={1260} y={110} text="REMEMBER THAT" box="check" size={48} />
		</>
	);
};

/* ================================ 014–015 the navy says no; he fakes his death ================================ */
const C014: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	return (
		<>
			<Stage cam={usePush(camOn(960, 680, 1.15), camOn(960, 680, 1.22))} bg="#2a2a2e" light={false} grain={0} vig={0}>
				<Layer depth={1}>
					<Bg src="bg/deck.jpg" />
					<Svg>
						<Toon id="fred14" r={CAST.fredSailor} x={820} y={990} s={S} t={gf} pose={f < w('014', 0.45) ? {hand: [70, -230], handB: [-60, -110]} : {hand: [30, -60], handB: [-30, -60], head: 10}} face={{look: [0.7, -0.1], mouth: f < w('014', 0.45) ? 'grin' : 'frown', brows: f < w('014', 0.45) ? 'up' : 'worried'}} />
						<Toon id="off14" r={CAST.officerUS} x={1120} y={990} s={S} facing={-1} t={gf} pose={{hand: snap(f, w('014', 0.4)) > 0 ? [80, -170] : [40, -110], head: Math.sin(f / 3) * 5 * kk(f, w('014', 0.4), w('014', 0.6))}} face={{look: [0.6, 0], mouth: 'frown', brows: 'down'}} />
					</Svg>
				</Layer>
			</Stage>
			<Paper />
			<Tag f={f} t={w('014', 0.45)} x={1240} y={110} text="PROMOTION" box="cross" size={50} />
		</>
	);
};
const C015: React.FC = () => {
	const {f} = useShot();
	return <BlackCard f={f} text="Gone." />;
};

/* ================================ 016–019 Doctor Robert Linton French ================================ */
const LEC_SPOTS: [number, number, number][] = [
	[P(100, 200)[0], P(100, 200)[1], 300],
	[P(690, 60)[0], P(690, 60)[1], 200],
];
const Board: React.FC<{f: number; t: number; text: string; brain?: number}> = ({f, t, text, brain = -1}) => {
	const n = Math.max(0, Math.min(text.length, Math.floor((f - t) * 1.2)));
	return (
		<g>
			<text x={680} y={300} fontFamily={HAND} fontWeight={700} fontSize={70} fill="#eef2e8" opacity={0.92}>
				{text.slice(0, n)}
			</text>
			{brain >= 0 && f > brain ? (
				<path d="M1060,330 q-40,-50 10,-80 q20,-40 70,-20 q50,-20 70,30 q40,20 10,70 q-10,40 -70,30 q-50,20 -90,-30 M1100,300 q30,-10 40,20 M1150,270 q10,30 -20,40" stroke="#eef2e8" strokeWidth={6} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - kk(f, brain, brain + 18)} opacity={0.9} />
			) : null}
		</g>
	);
};
const C016: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const pop = snap(f, w('016', 0.08), 0.2);
	return (
		<>
			<Stage cam={usePush(camOn(960, 700, 1.25), camOn(960, 690, 1.32))} bg="#2a2a2e" light={false} grain={0} vig={0}>
				<Layer depth={1}>
					<Bg src="bg/lecture.jpg" />
					<Svg>
						{pop > 0 ? (
							<g transform={`translate(960,1000) scale(${Math.min(pop, 1.2)}) translate(-960,-1000)`}>
								<Toon id="fred16" r={CAST.fredProf} x={960} y={1000} s={S} t={gf} pose={{hand: [115, -200], handB: [-115, -200]}} face={{look: [0.2, -0.2], mouth: 'grin', brows: 'sly', lids: 'sly'}} />
							</g>
						) : null}
						{f > w('016', 0.08) && f < w('016', 0.08) + 6 ? <circle cx={960} cy={760} r={200} fill="#fff" opacity={0.4} /> : null}
					</Svg>
					<Light id="l016" spots={LEC_SPOTS} dark={0.22} glow="#ffe2a8" />
				</Layer>
			</Stage>
			<Paper />
			<Tag f={f} t={w('016', 0.2)} x={70} y={850} sub="Dr." text="ROBERT LINTON FRENCH" size={54} />
			<Tag f={f} t={w('016', 0.7)} x={1300} y={110} text="PSYCHOLOGIST" size={50} />
		</>
	);
};
const C017: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const point = snap(f, w('017', 0.45));
	return (
		<>
			<Stage cam={usePush(camOn(1000, 620, 1.22), camOn(1010, 610, 1.3))} bg="#2a2a2e" light={false} grain={0} vig={0}>
				<Layer depth={1}>
					<Bg src="bg/lecture.jpg" />
					<Svg>
						<Board f={f} t={w('017', 0.1)} text="Psychology 101" brain={w('017', 0.55)} />
						<Toon id="fred17" r={CAST.fredProf} x={880} y={1000} s={S} t={gf} pose={{hand: point > 0 ? mixP([60, -150], [150, -330], Math.min(point, 1.1)) : [60, -150], handB: [-50, -120]}} face={{look: [0.5, -0.4], mouth: 'smile', talk: talkOf('FRED', gf - (gf % 3)), brows: 'up'}} />
					</Svg>
					<Light id="l017" spots={LEC_SPOTS} dark={0.22} glow="#ffe2a8" />
				</Layer>
			</Stage>
			<Paper />
		</>
	);
};
const C018: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const deanT = w('019', 0.05);
	const crown = f >= deanT;
	const walkIn = walk(f, 2, 30, 700, 960);
	return (
		<>
			<Stage cam={usePush(camOn(960, 640, 1.2), camOn(960, 630, 1.28))} bg="#2a2a2e" light={false} grain={0} vig={0}>
				<Layer depth={1}>
					<Bg src="bg/lecture.jpg" />
					<Svg>
						<Board f={f} t={0} text="Psychology 101" brain={0} />
						<Toon id="fred18" r={CAST.fredProf} x={walkIn.x} y={1000 - walkIn.bob} s={S} t={gf} pose={{step: walkIn.step, hand: [50, -140], handB: [-50, -140]}} face={{look: [0.3, -0.1], mouth: crown ? 'smirk' : 'grin', brows: crown ? 'sly' : 'up', lids: crown ? 'sly' : undefined}} />
						<Icon kind="crown" x={walkIn.x + 8} y={598} f={f} t={deanT} s={1.0} />
					</Svg>
					<Light id="l018" spots={LEC_SPOTS} dark={0.22} glow="#ffe2a8" />
				</Layer>
			</Stage>
			<Paper />
			<Tag f={f} t={6} x={70} y={860} text="PENNSYLVANIA" size={52} />
			<Tag f={f} t={deanT + 3} x={1200} y={110} sub="School of Philosophy" text="DEAN" size={56} />
		</>
	);
};

/* ================================ 020 the booklet; 021 forged checks — gone ================================ */
const C020: React.FC = () => {
	const {f} = useShot();
	const k = snap(f, 3);
	return (
		<>
			<Felt>
				<g transform={`translate(960,520) rotate(-4) scale(${0.7 + 0.3 * Math.min(k, 1.1)})`}>
					<rect x={-230} y={-300} width={460} height={600} fill="#000" opacity={0.3} transform="translate(12,16)" />
					<rect x={-230} y={-300} width={460} height={600} fill="#e8b84a" stroke={INK} strokeWidth={6} />
					<rect x={-200} y={-270} width={400} height={540} fill="none" stroke={INK} strokeWidth={3} />
					<text y={-170} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={INK}>
						HOW TO
					</text>
					<text y={-115} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={INK}>
						BRING UP
					</text>
					<text y={-60} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={INK}>
						YOUR CHILD
					</text>
					<circle cy={70} r={70} fill="#f1d2b0" stroke={INK} strokeWidth={5} />
					<circle cx={-22} cy={60} r={7} fill={INK} />
					<circle cx={22} cy={60} r={7} fill={INK} />
					<path d="M-20,95 Q0,110 20,95" stroke={INK} strokeWidth={5} fill="none" />
					<text y={230} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={40} fill={INK}>
						by Dr. R. L. French
					</text>
				</g>
				<text x={1380} y={860} fontFamily={HAND} fontWeight={700} fontSize={54} fill="#f2c94c" transform="rotate(-6,1380,860)" opacity={kk(f, 40, 46)}>
					(ran away at 16)
				</text>
			</Felt>
			<Paper />
		</>
	);
};
const C021: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const gone = w('021', 0.55);
	if (f < gone) {
		return (
			<>
				<Felt>
					{[0, 1, 2].map((i) => (
						<g key={i} transform={`translate(${700 + i * 260},${470 + i * 60}) rotate(${-8 + i * 7}) scale(${0.7 + 0.3 * Math.min(snap(f, 2 + i * 5), 1.1)})`} opacity={f > 2 + i * 5 ? 1 : 0}>
							<rect x={-280} y={-120} width={560} height={240} fill="#dcecd8" stroke={INK} strokeWidth={5} />
							<text x={-250} y={-70} fontFamily={FONT} fontWeight={900} fontSize={30} fill="#3a5a4a">
								PAY TO THE ORDER OF
							</text>
							<line x1={-250} y1={-10} x2={250} y2={-10} stroke="#3a5a4a" strokeWidth={3} />
							<text x={60} y={80} fontFamily={HAND} fontWeight={700} fontSize={44} fill="#2a4a8a">
								R. L. French
							</text>
						</g>
					))}
					<Stamp f={f} t={w('021', 0.3)} x={960} y={560} text="FORGED" rot={-10} size={80} />
				</Felt>
				<Paper />
			</>
		);
	}
	const panic = gone + 2;
	const run0 = gone + 12;
	const run = kk(f, run0, run0 + 14);
	const fx = 900 + 1300 * run * run;
	const running = f >= run0 && run < 1;
	const step = running ? Math.sin(f * 1.4) : 0;
	const hand: [number, number] = f < panic ? [72, -86] : [80, -70];
	return (
		<>
			<Stage cam={usePush(camOn(960, 650, 1.18), camOn(960, 650, 1.24))} bg="#2a2a2e" light={false} grain={0} vig={0}>
				<Layer depth={1}>
					<Bg src="bg/lecture.jpg" />
					<Svg>
						<Board f={f} t={0} text="Psychology 101" brain={0} />
						{run < 1 ? (
							<g>
								<Toon id="fred21" r={CAST.fredProf} x={fx} y={1000 - (running ? Math.abs(step) * 10 : 0)} s={S} t={gf} pose={{hand, handB: f < panic ? [-72, -86] : [-90, -200], lean: running ? 14 : 0, step}} face={{look: f < panic ? [0.2, -0.1] : [0.9, -0.1], mouth: f < panic ? 'smirk' : 'o', brows: f < panic ? 'sly' : 'worried', lids: f < panic ? 'sly' : undefined, sweat: f >= panic}} />
								{/* his suitcase */}
								{f >= panic ? <rect x={fx + 70 * S} y={1000 - 70 * S} width={70 * S} height={52 * S} rx={6} fill="#7a4e2a" stroke={INK} strokeWidth={4} /> : null}
								{running
									? [0, 1, 2].map((j) => <line key={j} x1={fx - 120 - j * 30} y1={760 + j * 60} x2={fx - 260 - j * 40} y2={760 + j * 60} stroke="#f4efe2" strokeWidth={6} strokeLinecap="round" opacity={0.7} />)
									: null}
							</g>
						) : null}
						{/* dust settling where he stood */}
						{f > run0
							? [0, 1, 2, 3].map((j) => {
									const k = kk(f, run0 + j * 2, run0 + 26 + j * 2);
									return <circle key={j} cx={900 + j * 70 + 40 * k} cy={980 - 30 * k} r={22 + 30 * k} fill="#d8c8a8" opacity={0.6 * (1 - k)} />;
								})
							: null}
					</Svg>
					<Light id="l021" spots={LEC_SPOTS} dark={0.22} glow="#ffe2a8" />
				</Layer>
			</Stage>
			<Paper />
			<Tag f={f} t={run0 + 16} x={70} y={860} text="DR. FRENCH" box="cross" size={52} />
		</>
	);
};

export const SHOTS_C1: ShotDef[] = [
	{at: '001', C: C001},
	{at: '001', off: T('001', 0.68), C: C001b},
	{at: '002', C: C002},
	{at: '003', C: C003},
	{at: '004', C: C004},
	{at: '005', C: C005},
	{at: '006', C: C006},
	{at: '007', C: C007},
	{at: '008', C: C008},
	{at: '009', C: C009},
	{at: '010', C: C010},
	{at: '011', C: C011},
	{at: '012', C: C012},
	{at: '013', C: C013},
	{at: '014', C: C014},
	{at: '015', C: C015},
	{at: '016', C: C016},
	{at: '017', C: C017},
	{at: '018', C: C018},
	{at: '020', C: C020},
	{at: '021', C: C021},
	{at: '022', C: () => <AbsoluteFill style={{background: '#000'}} />},
];
void interpolate;
void clamp;

import React from 'react';
import {talkOf, useShot} from '../kit/core';
import type {ShotDef} from '../kit/coverage';
import {Layer, Stage, Svg, camOn, usePush} from '../kit/kit';
import {FONT, HAND} from '../kit/ui';
import {CAST} from '../toon/cast';
import {Bg, BigNumber, BlackCard, Felt, Icon, Light, P, Paper, Tag, mixP, snap} from '../toon/kit';
import {INK, Pose, Recipe, Toon} from '../toon/Toon';
import {OR_SPOTS, S, kk, walk} from './partC1';
import {useW} from './lib';

/* PART 3 (3:05–4:27): the naval hospital in Halifax, Esquimalt and HMCS Cayuga, sailing to Korea,
   easy cases and reading up in the cabin, the captain's tooth, the commando raid, sixteen wounded. */

const talk = (sp: string, gf: number) => talkOf(sp, gf - (gf % 3));
const ST = {bg: '#2a2a2e', light: false as const, grain: 0, vig: 0};
const CLINIC_SPOTS: [number, number, number][] = [[P(285, 215)[0], P(285, 215)[1], 280], [P(1200, 170)[0], P(1200, 170)[1], 300]];
const CABIN_SPOTS: [number, number, number][] = [[P(1150, 285)[0], P(1150, 285)[1], 320], [P(930, 175)[0], P(930, 175)[1], 160]];

/* a syringe / a pill bottle / pliers / a tooth — small flat props in the cartoon style */
const Syringe: React.FC<{x: number; y: number; rot: number}> = ({x, y, rot}) => (
	<g transform={`translate(${x},${y}) rotate(${rot})`}>
		<rect x={-10} y={-50} width={20} height={70} rx={4} fill="#dff0fa" stroke={INK} strokeWidth={4} />
		<rect x={-7} y={-10} width={14} height={28} fill="#f2c94c" />
		<line x1={0} y1={20} x2={0} y2={52} stroke="#8a90a0" strokeWidth={3} />
		<rect x={-14} y={-60} width={28} height={10} fill="#8a90a0" stroke={INK} strokeWidth={3} />
	</g>
);
const PillBottle: React.FC<{x: number; y: number}> = ({x, y}) => (
	<g transform={`translate(${x},${y})`}>
		<rect x={-22} y={-60} width={44} height={60} rx={6} fill="#c87a2a" stroke={INK} strokeWidth={4} />
		<rect x={-24} y={-72} width={48} height={14} rx={4} fill="#f4efe2" stroke={INK} strokeWidth={4} />
		<rect x={-16} y={-44} width={32} height={22} fill="#f4efe2" />
	</g>
);

/* ================================ 045–047 the naval hospital near Halifax ================================ */
const C045: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const pen = w('046', 0.12);
	const shot = w('046', 0.32);
	const ask = w('046', 0.6);
	const opin = w('047', 0.0);
	const enter = walk(f, 2, 28, 300, 820);
	let fredPose: Pose = {step: enter.step, hand: [44, -110], handB: [-44, -110]};
	let fredFace: React.ComponentProps<typeof Toon>['face'] = {look: [0.8, -0.1], mouth: 'smile', brows: 'up'};
	if (f > 28) {
		fredPose = {hand: [72, -86], handB: [-72, -86]};
		fredFace = {look: [0.8, -0.1], mouth: 'grin', brows: 'up'};
	}
	if (f > pen) fredPose = {hand: [100, -200], handB: [-72, -86]};
	if (f > shot) fredPose = {hand: [150, -150], handB: [-72, -86]};
	if (f > ask) {
		fredPose = {hand: [40, -230], handB: [-72, -86], head: -8};
		fredFace = {look: [-0.8, -0.1], mouth: 'smile', brows: 'worried', turn: -0.8};
	}
	if (f > opin) {
		fredPose = {hand: [30, -60], handB: [-30, -60]};
		fredFace = {look: [0, 0], mouth: 'smile', brows: 'flat'};
	}
	const sailorShot = f > shot && f < ask;
	return (
		<>
			<Stage cam={usePush(camOn(960, 650, 1.1), camOn(980, 650, 1.2))} {...ST}>
				<Layer depth={1}>
					<Bg src="bg/clinic.jpg" />
					<Svg>
						{f > ask ? <Toon id="doc45" r={CAST.docNavy} x={560} y={1000} s={S} facing={1} t={gf} pose={{hand: [60, -150], handB: [-60, -110]}} face={{look: [0.8, -0.1], mouth: f > opin ? 'smile' : 'closed', brows: 'up', talk: f > opin ? Math.abs(Math.sin(f / 3.4)) * 0.5 : 0}} /> : null}
						<Toon id="fred45" r={CAST.fredBare} x={enter.x} y={1000 - enter.bob} s={S} facing={1} t={gf} pose={fredPose} face={fredFace} />
						<Toon id="sail45" r={CAST.sailor} x={1260} y={1000} s={S} facing={-1} t={gf} pose={sailorShot ? {hand: [80, -240], handB: [-60, -110]} : {hand: [50, -110], handB: [-50, -110]}} face={{look: [0.8, 0], mouth: sailorShot ? 'o' : 'closed', brows: sailorShot ? 'worried' : 'flat'}} />
						{f > pen && f < shot ? <PillBottle x={enter.x + 100 * S} y={1000 - 195 * S} /> : null}
						{sailorShot ? <Syringe x={enter.x + 150 * S} y={1000 - 150 * S} rot={90} /> : null}
					</Svg>
					<Light id="l045" spots={CLINIC_SPOTS} dark={0.22} glow="#ffcf7a" />
				</Layer>
			</Stage>
			<Paper />
			<Tag f={f} t={4} x={70} y={860} sub="first posting" text="NAVAL HOSPITAL, HALIFAX" size={48} until={pen} />
			<Tag f={f} t={pen + 2} x={1250} y={100} text="PENICILLIN" size={50} until={ask} />
			<Tag f={f} t={ask + 2} x={1180} y={100} text="ASK A REAL DOCTOR" size={46} until={opin} />
			<Tag f={f} t={opin + 4} x={1300} y={90} text="PLEASANT" box="check" size={44} />
			<Tag f={f} t={w('047', 0.35)} x={1300} y={170} text="COMPETENT-ISH" box="check" size={44} />
			<Tag f={f} t={w('047', 0.7)} x={1300} y={250} text="PARTY GUY" box="cross" size={44} />
		</>
	);
};

/* ================================ 048 he disapproves of the drinking ================================ */
const Glass: React.FC<{x: number; y: number; a: number}> = ({x, y, a}) => (
	<g transform={`translate(${x},${y}) rotate(${a})`}>
		<path d="M-14,-40 L14,-40 L10,0 L-10,0 Z" fill="#dff0fa" fillOpacity={0.6} stroke={INK} strokeWidth={4} />
		<path d="M-12,-24 L12,-24 L10,0 L-10,0 Z" fill="#c9873a" />
	</g>
);
const C048: React.FC = () => {
	const {f, gf} = useShot();
	const clink = Math.abs(Math.sin(f / 6));
	return (
		<>
			<Stage cam={usePush(camOn(1000, 640, 1.15), camOn(1000, 640, 1.22))} {...ST}>
				<Layer depth={1}>
					<Bg src="bg/cabin.jpg" />
					<Svg>
						<Toon id="off48a" r={CAST.recruiter} x={1300} y={980} s={S} facing={-1} t={gf} pose={{hand: [90, -200 - 20 * clink], handB: [-60, -110], lean: -6}} face={{look: [0.7, -0.3], mouth: 'grin', brows: 'up', lids: 'sleepy'}} />
						<Toon id="off48b" r={CAST.officerUS} x={1080} y={980} s={S} facing={1} t={gf} pose={{hand: [90, -200 - 20 * clink], handB: [-60, -110], lean: 6}} face={{look: [0.7, -0.3], mouth: 'grin', brows: 'up', lids: 'sleepy'}} />
						<Glass x={1300 - 90 * S} y={980 - (200 + 20 * clink) * S} a={-10} />
						<Glass x={1080 + 90 * S} y={980 - (200 + 20 * clink) * S} a={10} />
						<Toon id="fred48" r={CAST.fredBare} x={700} y={980} s={S} facing={1} t={gf} pose={{hand: [40, -150], handB: [-40, -150], head: -6}} face={{look: [0.8, 0], mouth: 'frown', brows: 'down', lids: 'sleepy'}} />
					</Svg>
					<Light id="l048" spots={CABIN_SPOTS} dark={0.4} glow="#ffcf7a" />
				</Layer>
			</Stage>
			<Paper />
			<Tag f={f} t={8} x={70} y={100} text="DISAPPROVES" size={54} />
		</>
	);
};

/* ================================ 049 the real test ================================ */
const C049: React.FC = () => {
	const {f} = useShot();
	return <BlackCard f={f} text="The real test" />;
};

/* ================================ 050–051 Esquimalt: HMCS Cayuga, 200 men, one doctor ================================ */
const CREW: {r: Recipe; x: number; y: number}[] = [
	{r: CAST.sailor, x: 1120, y: 880},
	{r: CAST.sailor2, x: 1290, y: 880},
	{r: CAST.sailor3, x: 1460, y: 880},
	{r: CAST.sailor4, x: 1630, y: 880},
	{r: CAST.sailor3, x: 1205, y: 1010},
	{r: CAST.sailor4, x: 1545, y: 1010},
];
const C050: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const board = walk(f, 4, w('050', 0.9), 200, 700);
	const two = w('051', 0.35);
	const one = w('051', 0.72);
	const salute = snap(f, w('051', 0.1));
	return (
		<>
			<Stage cam={usePush(camOn(960, 650, 1.05), camOn(1000, 650, 1.12))} {...ST}>
				<Layer depth={1}>
					<Bg src="bg/deck.jpg" />
					<Svg>
						{f > w('051', 0.0)
							? CREW.map((c, i) => (
									<Toon key={i} id={`crew50${i}`} r={c.r} x={c.x} y={c.y} s={S * 0.85} facing={-1} t={gf + i * 7} pose={{hand: salute > 0 ? mixP([50, -110], [40, -300], Math.min(salute, 1.1)) : [50, -110]}} face={{look: [0.8, 0], mouth: i % 2 ? 'grin' : 'smile', brows: 'up'}} />
								))
							: null}
						<Toon id="fred50" r={CAST.fredNavy} x={board.x} y={1000 - board.bob} s={S} facing={1} t={gf} pose={board.step ? {step: board.step, hand: [70, -80], handB: [-44, -110]} : {hand: [72, -86], handB: [-72, -86]}} face={{look: [0.8, -0.1], mouth: 'grin', brows: 'sly', lids: 'sly'}} />
						{board.step ? <rect x={board.x + 70 * S} y={1000 - 72 * S - board.bob} width={66 * S} height={50 * S} rx={6} fill="#7a4e2a" stroke={INK} strokeWidth={4} /> : null}
					</Svg>
				</Layer>
			</Stage>
			<Paper />
			<Tag f={f} t={4} x={70} y={860} sub="June 15, 1951" text="ESQUIMALT, BRITISH COLUMBIA" size={48} until={w('051', 0)} />
			<Tag f={f} t={w('051', 0.05)} x={70} y={100} text="HMCS CAYUGA" size={60} />
			{f > two && f < one ? <BigNumber f={f} t={two} text="200" sub="men" y={200} /> : null}
			{f >= one ? <BigNumber f={f} t={one} text="1" sub="doctor" y={200} c="#7ad07a" /> : null}
		</>
	);
};

/* ================================ 052 sailing for Korea (map) ================================ */
const C052: React.FC = () => {
	const {f} = useShot();
	const go = kk(f, 4, 80);
	const route = (k: number): [number, number] => {
		const x = 1600 - 1180 * k;
		return [x, 520 + Math.sin(k * Math.PI) * -140];
	};
	const [sx, sy] = route(go);
	return (
		<>
			<Felt>
				<rect x={160} y={140} width={1600} height={800} fill="#cfe2ea" stroke={INK} strokeWidth={5} />
				{/* Korea and Japan on the left, Canada on the right */}
				<path d="M300,330 Q360,300 380,360 Q400,440 360,520 Q330,600 300,620 Q270,560 280,460 Q270,380 300,330 Z" fill="#d8c8a0" stroke={INK} strokeWidth={4} />
				<path d="M450,420 Q520,380 560,430 Q520,520 470,600 Q440,560 450,420 Z" fill="#d8c8a0" stroke={INK} strokeWidth={4} />
				<path d="M1640,180 L1760,180 L1760,900 L1600,900 Q1560,760 1600,640 Q1580,520 1620,420 Q1600,300 1640,180 Z" fill="#d8c8a0" stroke={INK} strokeWidth={4} />
				<text x={300} y={690} fontFamily={HAND} fontWeight={700} fontSize={50} fill={INK}>
					Korea
				</text>
				<text x={1560} y={160} fontFamily={HAND} fontWeight={700} fontSize={50} fill={INK}>
					Canada
				</text>
				<path d={`M1600,520 Q1010,240 420,520`} stroke="#c8433d" strokeWidth={6} strokeDasharray="16 12" fill="none" pathLength={1} style={{clipPath: `inset(0 0 0 ${(1 - go) * 100}%)`}} />
				<g transform={`translate(${sx},${sy})`}>
					<path d="M-40,0 L40,0 L30,16 L-30,16 Z" fill="#8a90a0" stroke={INK} strokeWidth={4} />
					<rect x={-12} y={-18} width={24} height={18} fill="#8a90a0" stroke={INK} strokeWidth={3} />
				</g>
				<text x={1080} y={300} fontFamily={HAND} fontWeight={700} fontSize={56} fill="#2a4a8a" opacity={kk(f, 10, 16)}>
					Pacific Ocean
				</text>
			</Felt>
			<Paper />
			<Tag f={f} t={6} x={70} y={880} text="TO KOREA" size={56} />
		</>
	);
};

/* ================================ 053–054 easy cases; new case → reads up in his cabin ================================ */
const CASES = [
	{label: 'CUT', mark: (x: number, y: number) => <rect x={x - 12} y={y - 8} width={24} height={16} rx={4} fill="#f4efe2" stroke={INK} strokeWidth={3} />},
	{label: 'SPRAIN', mark: (x: number, y: number) => <rect x={x - 22} y={y + 150} width={44} height={20} rx={6} fill="#f4efe2" stroke={INK} strokeWidth={3} />},
	{label: 'BROKEN BONE', mark: (x: number, y: number) => <path d={`M${x - 40},${y + 20} Q${x},${y + 70} ${x + 40},${y + 20}`} stroke="#f4efe2" strokeWidth={14} fill="none" />},
];
const C053: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const step = Math.min(2, Math.max(0, Math.floor((f - w('053', 0.35)) / ((w('053', 1) - w('053', 0.35)) / 3))));
	const showCase = f > w('053', 0.35);
	const sailors = [CAST.sailor2, CAST.sailor3, CAST.sailor4];
	const pat = sailors[step];
	const fix = snap(f, w('053', 0.35) + step * 16 + 6);
	const c = CASES[step];
	return (
		<>
			<Stage cam={usePush(camOn(1100, 660, 1.12), camOn(1120, 650, 1.2))} {...ST}>
				<Layer depth={1}>
					<Bg src="bg/or.jpg" />
					<Svg>
						<Toon id="fred53" r={CAST.fredBare} x={920} y={1000} s={S} facing={1} t={gf} pose={showCase ? {hand: mixP([72, -86], [150, -150], Math.min(fix, 1.1)), handB: [-72, -86]} : {hand: [72, -86], handB: [-72, -86]}} face={{look: [0.8, 0], mouth: 'grin', brows: 'up'}} />
						{showCase ? <Toon id={`pat53${step}`} r={pat} x={1260} y={1000} s={S} facing={-1} t={gf} pose={{hand: [70, -140], handB: [-50, -110]}} face={{look: [0.8, 0], mouth: fix > 0.8 ? 'smile' : 'frown', brows: fix > 0.8 ? 'up' : 'worried'}} /> : null}
						{showCase && fix > 0.8 ? c.mark(1260 - 70 * S, 1000 - 165 * S) : null}
					</Svg>
					<Light id="l053" spots={OR_SPOTS} />
				</Layer>
			</Stage>
			<Paper />
			<Tag f={f} t={4} x={70} y={100} text="AT SEA: EASY" size={50} until={w('053', 0.35)} />
			{showCase ? <Tag key={step} f={f} t={w('053', 0.35) + step * Math.round((w('053', 1) - w('053', 0.35)) / 3)} x={70} y={860} text={c.label} size={56} /> : null}
		</>
	);
};
const BookPages: React.FC<{x: number; y: number; f: number; speed?: number; title?: string}> = ({x, y, f, speed = 4, title}) => (
	<g transform={`translate(${x},${y})`}>
		<path d="M-90,0 L0,12 L90,0 L90,-90 L0,-78 L-90,-90 Z" fill="#f4efe2" stroke={INK} strokeWidth={4} />
		<line x1={0} y1={-78} x2={0} y2={12} stroke={INK} strokeWidth={3} />
		{[0, 1, 2, 3].map((i) => (
			<line key={i} x1={-76} y1={-68 + i * 16} x2={-14} y2={-64 + i * 16} stroke="#8a8070" strokeWidth={3} />
		))}
		<path d={`M0,-78 Q${45 * Math.cos((f * speed) / 10)},${-110 + 20 * Math.sin((f * speed) / 10)} ${80 * Math.cos((f * speed) / 10)},-88`} stroke={INK} strokeWidth={3} fill="#fbf6e6" />
		{title ? (
			<text y={46} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill="#f4efe2" stroke={INK} strokeWidth={4} style={{paintOrder: 'stroke'}}>
				{title}
			</text>
		) : null}
	</g>
);
const C054: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const excuse = w('054', 0.35);
	const cabin = w('054', 0.6);
	if (f >= cabin) {
		return (
			<>
				<Stage cam={usePush(camOn(1350, 640, 1.25), camOn(1380, 630, 1.35))} {...ST}>
					<Layer depth={1}>
						<Bg src="bg/cabin.jpg" />
						<Svg>
							<Toon id="fred54c" r={CAST.fredBare} x={1300} y={980} s={S} facing={1} t={gf} pose={{hand: [80, -120], handB: [30, -125], head: 10}} face={{look: [0.5, 0.6], mouth: 'o', brows: 'down', sweat: true}} />
							<BookPages x={1300 + 62 * S} y={980 - 112 * S} f={f} speed={9} />
						</Svg>
						<Light id="l054c" spots={CABIN_SPOTS} dark={0.45} glow="#ffcf7a" />
					</Layer>
				</Stage>
				<Paper />
				<Tag f={f} t={cabin + 2} x={1250} y={100} text="READING UP" size={50} />
			</>
		);
	}
	const exit = walk(f, excuse + 8, cabin, 920, 1900);
	return (
		<>
			<Stage cam={usePush(camOn(1100, 660, 1.12), camOn(1100, 650, 1.18))} {...ST}>
				<Layer depth={1}>
					<Bg src="bg/or.jpg" />
					<Svg>
						<Toon id="pat54" r={CAST.sailor} x={1260} y={1000} s={S} facing={-1} t={gf} pose={{hand: [60, -170], handB: [-50, -110]}} face={{look: [0.8, 0], mouth: 'o', brows: 'worried'}} />
						{/* a strange green rash */}
						{[0, 1, 2, 3, 4].map((i) => (
							<circle key={i} cx={1260 - 20 + (i % 3) * 18} cy={1000 - 330 * S + Math.floor(i / 3) * 18} r={6} fill="#7ad07a" />
						))}
						<Toon id="fred54" r={CAST.fredBare} x={exit.x} y={1000 - exit.bob} s={S} facing={1} t={gf} pose={exit.step ? {step: exit.step, hand: [44, -110], lean: 10} : f > excuse ? {hand: [40, -280], handB: [-72, -86]} : {hand: [72, -86], handB: [-72, -86]}} face={{look: [0.8, -0.1], mouth: f > excuse ? 'smirk' : 'o', brows: f > excuse ? 'sly' : 'worried', lids: f > excuse ? 'sly' : undefined}} />
					</Svg>
					<Light id="l054" spots={OR_SPOTS} />
				</Layer>
			</Stage>
			<Paper />
			<Tag f={f} t={4} x={70} y={100} text="NEW CASE" box="cross" size={50} />
			<Tag f={f} t={excuse + 2} x={1180} y={100} text={'"EXCUSE ME"'} size={50} />
		</>
	);
};

/* ================================ 055–061 the captain's tooth ================================ */
const C055: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const capT = talk('CAPT', gf);
	const fredT = talk('FRED', gf);
	const prep = w('057', 0.0);
	return (
		<>
			<Stage cam={usePush(camOn(1080, 650, 1.18), camOn(1080, 640, 1.26))} {...ST}>
				<Layer depth={1}>
					<Bg src="bg/or.jpg" />
					<Svg>
						<Toon id="capt55" r={CAST.captain} x={1240} y={1000} s={S} facing={-1} t={gf} pose={{hand: [30, -250], handB: [-50, -110], head: Math.sin(f / 5) * 4}} face={{look: [0.8, 0], mouth: capT > 0.1 ? 'wide' : 'frown', brows: 'worried', sweat: true, talk: capT}} />
						{/* the swollen cheek */}
						<ellipse cx={1240 - 50 * S} cy={1000 - 205 * S} rx={26} ry={20} fill="#e88a8a" stroke={INK} strokeWidth={3} opacity={0.9} />
						<Toon id="fred55" r={CAST.fredBare} x={900} y={1000} s={S} facing={1} t={gf} pose={f > prep ? {hand: [40, -290], handB: [-72, -86]} : {hand: [72, -86], handB: [-72, -86]}} face={{look: [0.8, -0.1], mouth: 'smile', brows: f > prep ? 'sly' : 'up', lids: f > prep + 40 ? undefined : f > prep ? 'sly' : undefined, sweat: f > prep + 40, talk: fredT}} />
					</Svg>
					<Light id="l055" spots={OR_SPOTS} />
				</Layer>
			</Stage>
			<Paper />
			<Tag f={f} t={4} x={1230} y={100} text="CAPTAIN" size={52} until={prep} />
			<Tag f={f} t={6} x={70} y={860} text="TOOTHACHE" size={54} until={prep} />
		</>
	);
};
const C058: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	return (
		<>
			<Stage cam={usePush(camOn(960, 640, 1.4), camOn(960, 630, 1.5))} {...ST}>
				<Layer depth={1}>
					<Bg src="bg/or.jpg" dim={0.5} />
					<Svg>
						<Toon id="fred58" r={CAST.fredBare} x={960} y={1000} s={S} t={gf} pose={{hand: [90, -250], handB: [-90, -250]}} face={{look: [0, 0], mouth: 'o', brows: 'worried', sweat: true}} />
					</Svg>
				</Layer>
			</Stage>
			<Paper />
			<Tag f={f} t={w('058', 0.2)} x={1200} y={110} text="TEETH PULLED: 0" size={50} />
		</>
	);
};
const C059: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const open = w('059', 0.3);
	const read = w('059', 0.6);
	const go = walk(f, 0, open - 4, 1000, 1300);
	return (
		<>
			<Stage cam={usePush(camOn(1350, 640, 1.2), camOn(1370, 630, 1.32))} {...ST}>
				<Layer depth={1}>
					<Bg src="bg/cabin.jpg" />
					<Svg>
						<Toon id="fred59" r={CAST.fredBare} x={go.x} y={980 - go.bob} s={S} facing={1} t={gf} pose={go.step ? {step: go.step, hand: [44, -110]} : {hand: [80, -120], handB: [30, -125], head: 10}} face={{look: [0.5, 0.6], mouth: f > read ? 'o' : 'closed', brows: 'down'}} />
						{f > open ? <BookPages x={go.x + 62 * S} y={980 - 112 * S} f={f} speed={f > read ? 12 : 2} title="DENTISTRY" /> : null}
					</Svg>
					<Light id="l059" spots={CABIN_SPOTS} dark={0.45} glow="#ffcf7a" />
				</Layer>
			</Stage>
			<Paper />
			<Tag f={f} t={open + 2} x={1250} y={100} text="CRASH COURSE" size={50} />
		</>
	);
};
const C060: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const pull = w('060', 0.45);
	const k = snap(f, pull);
	const fly = kk(f, pull, pull + 16);
	const capT = talk('CAPT', gf);
	const happy = f > w('061', 0.0) - 4;
	const mouthAt: [number, number] = [1240 - 40 * S, 1000 - 190 * S];
	const pliers = mixP([mouthAt[0] + 20, mouthAt[1]], [mouthAt[0] - 120, mouthAt[1] - 60], Math.min(k, 1.1));
	return (
		<>
			<Stage cam={usePush(camOn(1080, 640, 1.22), camOn(1090, 630, 1.3))} {...ST}>
				<Layer depth={1}>
					<Bg src="bg/or.jpg" />
					<Svg>
						<Toon id="capt60" r={CAST.captain} x={1240} y={1000} s={S} facing={-1} t={gf} pose={happy ? {hand: [80, -260], handB: [-50, -110]} : {hand: [50, -110], handB: [-50, -110], head: -10}} face={{look: [0.8, -0.2], mouth: happy ? 'grin' : 'wide', brows: happy ? 'up' : 'worried', talk: capT}} />
						<Toon id="fred60" r={CAST.fredBare} x={960} y={1000} s={S} facing={1} t={gf} pose={{hand: [(pliers[0] - 960) / S, (pliers[1] - 1000) / S], handB: [-72, -86], lean: k > 0 ? -6 : 4}} face={{look: [0.8, -0.1], mouth: k > 0.8 ? 'grin' : 'closed', brows: k > 0.8 ? 'up' : 'down'}} />
						{/* pliers */}
						<g transform={`translate(${pliers[0]},${pliers[1]}) rotate(${-10})`}>
							<path d="M-40,-6 L30,-2 M-40,6 L30,2" stroke="#8a90a0" strokeWidth={8} strokeLinecap="round" />
							<path d="M-40,-6 L30,-2 M-40,6 L30,2" stroke={INK} strokeWidth={2} strokeLinecap="round" />
						</g>
						{f > pull ? (
							<g transform={`translate(${mouthAt[0] - 300 * fly},${mouthAt[1] - 160 * Math.sin(fly * Math.PI) + 40 * fly}) rotate(${600 * fly})`}>
								<path d="M-10,-12 Q0,-18 10,-12 L8,10 L2,4 L-2,4 L-8,10 Z" fill="#fbfaf4" stroke={INK} strokeWidth={3} />
							</g>
						) : null}
						{f > pull && f < pull + 12 ? (
							<text x={mouthAt[0] - 120} y={mouthAt[1] - 110} fontFamily={HAND} fontWeight={700} fontSize={80} fill="#f2c94c" stroke={INK} strokeWidth={8} style={{paintOrder: 'stroke'}}>
								pop!
							</text>
						) : null}
					</Svg>
					<Light id="l060" spots={OR_SPOTS} />
				</Layer>
			</Stage>
			<Paper />
			<Tag f={f} t={pull + 6} x={70} y={860} text="NO FUSS" size={56} />
			{happy ? <Tag f={f} t={w('061', 0.2)} x={1200} y={100} text="BEST EVER" box="check" size={52} /> : null}
		</>
	);
};

/* ================================ 062 the commando raid (map); 063 a boat of wounded; 064 sixteen ================================ */
const C062: React.FC = () => {
	const {f} = useShot();
	const boom = (t0: number, x: number, y: number) => {
		const k = kk(f, t0, t0 + 10);
		if (k <= 0) return null;
		return <circle cx={x} cy={y} r={20 + 50 * k} fill="#f2c94c" opacity={0.8 * (1 - k)} stroke="#c8433d" strokeWidth={6} />;
	};
	return (
		<>
			<Felt>
				<rect x={160} y={140} width={1600} height={800} fill="#cfe2ea" stroke={INK} strokeWidth={5} />
				<path d="M160,140 L900,140 Q860,300 920,420 Q880,560 960,700 Q900,840 940,940 L160,940 Z" fill="#d8c8a0" stroke={INK} strokeWidth={5} />
				<text x={360} y={520} fontFamily={HAND} fontWeight={700} fontSize={70} fill={INK}>
					Korea
				</text>
				<g transform={`translate(${1500 - 140 * kk(f, 0, 40)},560)`}>
					<path d="M-70,0 L70,0 L55,24 L-55,24 Z" fill="#8a90a0" stroke={INK} strokeWidth={4} />
					<rect x={-20} y={-28} width={40} height={28} fill="#8a90a0" stroke={INK} strokeWidth={3} />
					<line x1={20} y1={-14} x2={70} y2={-34} stroke={INK} strokeWidth={6} />
				</g>
				{[0, 1, 2].map((i) => (
					<path key={i} d={`M${1080 - i * 30},${420 + i * 120} Q${1000},${430 + i * 100} ${940 - i * 10},${400 + i * 130}`} stroke="#c8433d" strokeWidth={8} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - kk(f, 14 + i * 6, 28 + i * 6)} />
				))}
				{boom(30, 900, 410)}
				{boom(38, 880, 540)}
				{boom(46, 920, 660)}
			</Felt>
			<Paper />
			<Tag f={f} t={10} x={70} y={880} text="COMMANDO RAID" size={56} />
		</>
	);
};
const Stretcher: React.FC<{x: number; y: number; r: Recipe; id: string; t: number}> = ({x, y, r, id, t}) => (
	<g>
		<rect x={x - 30} y={y - 16} width={360} height={22} rx={6} fill="#c8b890" stroke={INK} strokeWidth={4} />
		<g transform={`translate(${x},${y - 40}) rotate(90)`}>
			<Toon id={id} r={r} x={0} y={0} s={0.85} t={t} face={{blink: true, mouth: 'frown'}} />
		</g>
		<rect x={x + 20} y={y - 70} width={70} height={18} rx={6} fill="#f4efe2" stroke={INK} strokeWidth={3} />
	</g>
);
const C063: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const boatX = 120 + 220 * kk(f, 0, w('063', 0.5));
	const sixteen = w('064', 0.0);
	return (
		<>
			<Stage cam={usePush(camOn(900, 620, 1.05), camOn(940, 640, 1.12))} {...ST}>
				<Layer depth={1}>
					<Bg src="bg/deck.jpg" dim={f > sixteen ? 0.2 : 0} />
					<Svg>
						{/* the boat out on the water beyond the rail */}
						<g transform={`translate(${boatX},${505 + 4 * Math.sin(f / 8)})`}>
							<path d="M-130,0 L130,0 L105,34 L-105,34 Z" fill="#7a5a3a" stroke={INK} strokeWidth={4} />
							{[-80, -30, 20, 70].map((x, i) => (
								<g key={i}>
									<circle cx={x} cy={-18} r={20} fill="#e4c098" stroke={INK} strokeWidth={3} />
									<rect x={x - 20} y={-34} width={40} height={10} fill="#f4efe2" stroke={INK} strokeWidth={2} />
								</g>
							))}
						</g>
						{f > sixteen ? (
							<>
								<Stretcher x={260} y={900} r={CAST.soldier} id="st1" t={gf} />
								<Stretcher x={740} y={960} r={CAST.soldier2} id="st2" t={gf + 9} />
								<Stretcher x={1220} y={900} r={CAST.soldier} id="st3" t={gf + 17} />
							</>
						) : (
							<>
								<Toon id="sail63a" r={CAST.sailor3} x={700} y={1000} s={S} facing={-1} t={gf} pose={{hand: [100, -230], handB: [-60, -110], lean: -6}} face={{look: [0.9, -0.3], mouth: 'o', brows: 'up'}} />
								<Toon id="sail63b" r={CAST.sailor4} x={900} y={1000} s={S} facing={-1} t={gf} pose={{hand: [100, -200], handB: [-60, -110]}} face={{look: [0.9, -0.3], mouth: 'wide', brows: 'worried'}} />
							</>
						)}
					</Svg>
				</Layer>
			</Stage>
			<Paper />
			<Tag f={f} t={w('063', 0.3)} x={70} y={100} text="WOUNDED SOLDIERS" size={52} until={sixteen} />
			{f > sixteen ? <BigNumber f={f} t={sixteen + 2} text="16" sub="wounded" y={150} /> : null}
			<Tag f={f} t={w('064', 0.45)} x={1250} y={880} text="NEED SURGERY" size={50} />
		</>
	);
};

export const SHOTS_C3: ShotDef[] = [
	{at: '045', C: C045},
	{at: '048', C: C048},
	{at: '049', C: C049},
	{at: '050', C: C050},
	{at: '052', C: C052},
	{at: '053', C: C053},
	{at: '054', C: C054},
	{at: '055', C: C055},
	{at: '058', C: C058},
	{at: '059', C: C059},
	{at: '060', C: C060},
	{at: '062', C: C062},
	{at: '063', C: C063},
	{at: '065', C: () => null},
];

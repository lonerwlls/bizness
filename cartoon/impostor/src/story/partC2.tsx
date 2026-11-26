import React from 'react';
import {talkOf, useShot} from '../kit/core';
import type {ShotDef} from '../kit/coverage';
import {Layer, Stage, Svg, camOn, usePush} from '../kit/kit';
import {FONT, HAND} from '../kit/ui';
import {CAST} from '../toon/cast';
import {Bg, BigNumber, Felt, Icon, Light, P, Paper, Stamp, Tag, mixP, snap} from '../toon/kit';
import {INK, Pose, Toon} from '../toon/Toon';
import {MON_SPOTS, S, T, kk, walk} from './partC1';
import {useW} from './lib';

/* PART 2 (1:33–3:05): the FBI, eighteen months in a navy prison, law at night, Brother John Payne
   and his college, the real Dr. Joseph Cyr and his papers, the recruiting office in Saint John,
   three days later: Surgeon-Lieutenant Joseph Cyr. */

const talk = (sp: string, gf: number) => talkOf(sp, gf - (gf % 3));
const ST = {bg: '#2a2a2e', light: false as const, grain: 0, vig: 0};

/* ================================ 022 the FBI catches up ================================ */
const C022: React.FC = () => {
	const {f, gf} = useShot();
	const grab = 14;
	const a = walk(f, 0, grab, 300, 760);
	const b = walk(f, 0, grab, 1620, 1160);
	const caught = snap(f, grab);
	return (
		<>
			<Stage cam={usePush(camOn(960, 660, 1.12), camOn(960, 650, 1.2))} {...ST}>
				<Layer depth={1}>
					<Bg src="bg/prison.jpg" />
					<Svg>
						<Toon id="fred22" r={CAST.fredSuit} x={960} y={1000 - 18 * Math.min(caught, 1)} s={S} t={gf} pose={caught > 0 ? {hand: [90, -240], handB: [-90, -240]} : {hand: [72, -86], handB: [-72, -86]}} face={{look: caught > 0 ? [-0.6, -0.2] : [0.2, 0], mouth: caught > 0 ? 'o' : 'smirk', brows: caught > 0 ? 'worried' : 'sly', lids: caught > 0 ? undefined : 'sly', sweat: f > grab + 4}} />
						<Toon id="agA" r={CAST.agentA} x={a.x} y={1000 - a.bob} s={S} facing={1} t={gf} pose={{step: a.step, hand: caught > 0 ? [100, -170] : [50, -110]}} face={{look: [0.8, 0], mouth: 'frown', brows: 'down'}} />
						<Toon id="agB" r={CAST.agentB} x={b.x} y={1000 - b.bob} s={S} facing={-1} t={gf} pose={{step: b.step, hand: caught > 0 ? [100, -170] : [50, -110]}} face={{look: [0.8, 0], mouth: 'frown', brows: 'down'}} />
					</Svg>
					<Light id="l022" spots={[[P(1150, 120)[0], P(1150, 120)[1] + 300, 380]]} dark={0.25} glow="#ffd88a" />
				</Layer>
			</Stage>
			<Paper />
			<Tag f={f} t={grab + 2} x={70} y={100} text="FBI" size={64} />
		</>
	);
};

/* ================================ 023 eighteen months for desertion; 024 take the hint ================================ */
const Bars: React.FC<{x0: number; x1: number}> = ({x0, x1}) => (
	<g>
		{Array.from({length: Math.floor((x1 - x0) / 90) + 1}).map((_, i) => (
			<g key={i}>
				<rect x={x0 + i * 90} y={-100} width={20} height={1300} fill="#4a4c58" stroke={INK} strokeWidth={4} />
			</g>
		))}
		<rect x={x0 - 40} y={500} width={x1 - x0 + 100} height={22} fill="#4a4c58" stroke={INK} strokeWidth={4} />
	</g>
);
const C023: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const months = Math.min(18, Math.floor(kk(f, w('023', 0.05), w('023', 0.6)) * 18));
	const hint = w('024', 0.2);
	return (
		<>
			<Stage cam={usePush(camOn(960, 640, 1.2), camOn(960, 630, 1.3))} {...ST}>
				<Layer depth={1}>
					<Bg src="bg/prison.jpg" dim={0.25} />
					<Svg>
						{/* tally marks on the cell wall */}
						<rect x={560} y={380} width={300} height={170} rx={10} fill="#00000033" />
						{Array.from({length: months}).map((_, i) => {
							const g = Math.floor(i / 5);
							const j = i % 5;
							return j < 4 ? (
								<line key={i} x1={590 + g * 70 + j * 12} y1={410} x2={590 + g * 70 + j * 12} y2={480} stroke="#f4efe2" strokeWidth={5} />
							) : (
								<line key={i} x1={582 + g * 70} y1={470} x2={640 + g * 70} y2={418} stroke="#f4efe2" strokeWidth={5} />
							);
						})}
						<Toon id="fred23" r={CAST.fredPrison} x={1040} y={1000} s={S} t={gf} pose={f > hint ? {hand: [60, -280], handB: [-72, -86]} : {hand: [30, -70], handB: [-30, -70], head: 8}} face={{look: f > hint ? [0.3, -0.5] : [0.1, 0.4], mouth: f > hint ? 'smirk' : 'frown', brows: f > hint ? 'sly' : 'worried', lids: f > hint ? 'sly' : 'sleepy'}} />
						<Icon kind="bulb" x={1110} y={540} f={f} t={hint + 4} s={1.0} />
						<Bars x0={700} x1={1500} />
					</Svg>
				</Layer>
			</Stage>
			<Paper />
			<Tag f={f} t={w('023', 0.05)} x={70} y={860} sub="desertion" text="NAVY PRISON" size={54} />
			<Tag f={f} t={w('023', 0.1)} x={1300} y={100} text={`${Math.max(1, months)} MONTHS`} size={52} until={hint} />
		</>
	);
};

/* ================================ 025 law at night, under a fake name ================================ */
const C025: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const fake = w('025', 0.55);
	const page = Math.floor(f / 10) % 2;
	return (
		<>
			<Stage cam={usePush(camOn(1300, 640, 1.18), camOn(1340, 630, 1.26))} {...ST}>
				<Layer depth={1}>
					<Bg src="bg/cabin.jpg" />
					<Svg>
						<Toon id="fred25" r={CAST.fredSuit} x={1250} y={980} s={S} facing={1} t={gf} pose={{hand: [75, -115], handB: [35, -120], head: 10}} face={{look: [0.5, 0.5], mouth: f > fake ? 'smirk' : 'closed', brows: f > fake ? 'sly' : 'down', lids: f > fake ? 'sly' : undefined}} />
						{/* the open law book in his hands */}
						<g transform={`translate(${1250 + 62 * S},${980 - 118 * S})`}>
							<path d="M-70,0 L0,10 L70,0 L70,-70 L0,-60 L-70,-70 Z" fill="#f4efe2" stroke={INK} strokeWidth={4} />
							<line x1={0} y1={-60} x2={0} y2={10} stroke={INK} strokeWidth={3} />
							{[0, 1, 2].map((i) => (
								<line key={i} x1={-58} y1={-50 + i * 16} x2={-12} y2={-46 + i * 16} stroke="#8a8070" strokeWidth={3} />
							))}
							<path d={page ? 'M0,-60 Q30,-90 60,-68' : 'M0,-60 Q30,-40 60,-68'} stroke={INK} strokeWidth={3} fill="#f4efe2" />
							<rect x={-70} y={6} width={140} height={14} fill="#8a2a2a" stroke={INK} strokeWidth={3} />
						</g>
					</Svg>
					<Light id="l025" spots={[[P(1150, 285)[0], P(1150, 285)[1], 320]]} dark={0.45} glow="#ffcf7a" />
				</Layer>
			</Stage>
			<Paper />
			<Tag f={f} t={w('025', 0.05)} x={70} y={860} sub="night school" text="LAW" size={56} />
			<Tag f={f} t={fake} x={1200} y={100} text="FAKE NAME" box="check" size={50} />
		</>
	);
};

/* ================================ 026 Brother John Payne in Maine ================================ */
const C026: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const arrive = walk(f, 2, 34, 380, 820);
	const bow = snap(f, w('026', 0.6));
	return (
		<>
			<Stage cam={usePush(camOn(960, 660, 1.1), camOn(1000, 650, 1.18))} {...ST}>
				<Layer depth={1}>
					<Bg src="bg/monastery.jpg" />
					<Svg>
						<Toon id="bA26" r={CAST.brotherA} x={1180} y={995} s={S} facing={-1} t={gf} pose={{hand: [18, -135], handB: [-18, -135], head: bow > 0 ? 8 : 0}} face={{look: [0.6, 0], mouth: 'smile', lids: 'sleepy'}} />
						<Toon id="bB26" r={CAST.brotherB} x={1400} y={995} s={S} facing={-1} t={gf} pose={{hand: [18, -135], handB: [-18, -135], head: bow > 0 ? 8 : 0}} face={{look: [0.6, 0], mouth: 'smile', lids: 'sleepy'}} />
						<Toon id="fred26" r={CAST.fredMonk} x={arrive.x} y={995 - arrive.bob} s={S} facing={1} t={gf} pose={{step: arrive.step, hand: arrive.step ? [44, -110] : [110, -200], handB: arrive.step ? [-44, -110] : [-110, -200]}} face={{look: [0.7, -0.1], mouth: 'grin', brows: 'up'}} />
					</Svg>
					<Light id="l026" spots={MON_SPOTS} dark={0.35} glow="#ffb860" />
				</Layer>
			</Stage>
			<Paper />
			<Tag f={f} t={4} x={70} y={860} text="MAINE" size={56} />
			<Tag f={f} t={w('026', 0.55)} x={1150} y={100} sub="Brother" text="JOHN PAYNE" size={56} />
		</>
	);
};

/* ================================ 027 he founds a college; 028 the state charter ================================ */
const College: React.FC<{k: number}> = ({k}) => (
	<g stroke="#2a4a8a" strokeWidth={6} fill="none" strokeLinejoin="round" pathLength={1}>
		<path d="M-300,120 L300,120 L300,-60 L-300,-60 Z M-340,-60 L0,-200 L340,-60 Z M-60,120 L-60,20 L60,20 L60,120 M-240,-20 L-180,-20 L-180,40 L-240,40 Z M180,-20 L240,-20 L240,40 L180,40 Z M-20,-200 L-20,-260 L60,-250 L-20,-240" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k} />
	</g>
);
const C027: React.FC = () => {
	const {f} = useShot();
	const w = useW();
	const draw = kk(f, w('027', 0.35), w('027', 0.9));
	return (
		<>
			<Felt>
				<g transform={`translate(960,520) rotate(-2) scale(${0.7 + 0.3 * Math.min(snap(f, 2), 1.1)})`}>
					<rect x={-470} y={-330} width={940} height={640} fill="#dfe8f2" stroke={INK} strokeWidth={5} />
					{Array.from({length: 14}).map((_, i) => (
						<line key={i} x1={-470} y1={-330 + i * 46} x2={470} y2={-330 + i * 46} stroke="#b8c8d8" strokeWidth={2} />
					))}
					<College k={draw} />
					<text y={240} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={64} fill="#2a4a8a" opacity={kk(draw, 0.6, 1)}>
						LaMennais College
					</text>
				</g>
				<text x={160} y={150} fontFamily={HAND} fontWeight={700} fontSize={60} fill="#f2c94c" opacity={kk(f, 4, 10)}>
					Brother John's idea
				</text>
			</Felt>
			<Paper />
		</>
	);
};
const C028: React.FC = () => {
	const {f} = useShot();
	const w = useW();
	return (
		<>
			<Felt>
				<g transform={`translate(960,520) rotate(3) scale(${0.7 + 0.3 * Math.min(snap(f, 2), 1.1)})`}>
					<rect x={-330} y={-400} width={660} height={800} fill="#000" opacity={0.3} transform="translate(12,16)" />
					<rect x={-330} y={-400} width={660} height={800} fill="#f4efe2" stroke={INK} strokeWidth={5} />
					<text y={-300} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={INK}>
						STATE OF MAINE
					</text>
					<text y={-240} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={40} fill={INK}>
						CHARTER
					</text>
					{Array.from({length: 6}).map((_, i) => (
						<line key={i} x1={-260} y1={-150 + i * 50} x2={260 - (i % 3) * 60} y2={-150 + i * 50} stroke="#8a8070" strokeWidth={6} />
					))}
					<circle cx={180} cy={250} r={70} fill="#c8433d" stroke={INK} strokeWidth={5} />
					<circle cx={180} cy={250} r={48} fill="none" stroke="#f4efe2" strokeWidth={4} />
				</g>
				<Stamp f={f} t={w('028', 0.45)} x={900} y={640} text="APPROVED" rot={-10} size={76} />
				<text x={200} y={160} fontFamily={HAND} fontWeight={700} fontSize={70} fill="#f2c94c" opacity={kk(f, w('028', 0.05), w('028', 0.05) + 6)}>
					A real college.
				</text>
			</Felt>
			<Paper />
		</>
	);
};

/* ================================ 029 not made head — Brother John quits ================================ */
const C029: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const no = w('029', 0.3);
	const quit = w('029', 0.62);
	const go = walk(f, quit + 6, quit + 30, 820, 1700);
	return (
		<>
			<Stage cam={usePush(camOn(1000, 660, 1.15), camOn(1020, 650, 1.2))} {...ST}>
				<Layer depth={1}>
					<Bg src="bg/monastery.jpg" />
					<Svg>
						<Toon id="abbot29" r={CAST.monk} x={1250} y={995} s={S} facing={-1} t={gf} pose={{hand: f > no ? [100, -180] : [18, -135], handB: [-18, -135], head: f > no ? Math.sin(f / 2.5) * 8 * Math.exp(-(f - no) / 20) : 0}} face={{look: [0.6, 0], mouth: 'frown', brows: 'down', talk: f > no && f < quit ? Math.abs(Math.sin(f / 3)) * 0.6 : 0}} />
						<Toon id="fred29" r={CAST.fredMonk} x={go.x} y={995 - go.bob} s={S} facing={f > quit ? 1 : 1} t={gf} pose={f > quit ? {step: go.step, hand: [70, -80], handB: [-60, -110]} : {hand: [72, -86], handB: [-72, -86]}} face={{look: [0.7, 0], mouth: f > no ? 'frown' : 'grin', brows: f > no ? 'down' : 'up', lids: f > quit ? 'sleepy' : undefined}} />
						{f > quit ? <rect x={go.x + 70 * S} y={995 - 72 * S - go.bob} width={66 * S} height={50 * S} rx={6} fill="#7a4e2a" stroke={INK} strokeWidth={4} /> : null}
						<Icon kind="crown" x={980} y={560} f={f} t={w('029', 0.08)} s={1.0} out={no} />
					</Svg>
					<Light id="l029" spots={MON_SPOTS} dark={0.35} glow="#ffb860" />
				</Layer>
			</Stage>
			<Paper />
			<Tag f={f} t={no + 3} x={1250} y={100} text="HEAD OF THE ORDER" box="cross" size={46} />
			<Tag f={f} t={quit + 4} x={70} y={860} text="QUITS" size={56} />
		</>
	);
};

/* ================================ 030 the college lives on — a university in Ohio ================================ */
const C030: React.FC = () => {
	const {f} = useShot();
	const w = useW();
	const ohio = w('030', 0.5);
	return (
		<>
			<Felt>
				<g transform={`translate(700,520) rotate(-5) scale(${0.7 + 0.3 * Math.min(snap(f, 2), 1.1)})`}>
					<rect x={-300} y={-220} width={600} height={440} fill="#f4efe2" stroke={INK} strokeWidth={5} />
					<g transform="scale(0.72) translate(0,10)">
						<College k={1} />
					</g>
					<text y={190} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={46} fill={INK}>
						Maine, 1951
					</text>
				</g>
				{f > ohio ? (
					<g transform={`translate(1290,560) rotate(4) scale(${0.7 + 0.3 * Math.min(snap(f, ohio), 1.1)})`}>
						<rect x={-300} y={-220} width={600} height={440} fill="#f4efe2" stroke={INK} strokeWidth={5} />
						<g transform="scale(0.9) translate(0,0)">
							<College k={1} />
						</g>
						<rect x={-260} y={-150} width={520} height={18} fill="#c8433d" opacity={0.8} />
						<text y={190} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={46} fill={INK}>
							Ohio, today
						</text>
					</g>
				) : null}
				{f > ohio + 6 ? <path d="M1000,560 Q1060,480 1110,540" stroke="#f2c94c" strokeWidth={8} fill="none" strokeLinecap="round" /> : null}
			</Felt>
			<Paper />
			<Tag f={f} t={ohio + 8} x={1150} y={880} text="A UNIVERSITY" size={54} />
		</>
	);
};

/* ================================ 031–032 a new friend: Dr. Joseph Cyr ================================ */
const C031: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const cyrIn = walk(f, 4, 34, 1700, 1180);
	const shake = f > w('031', 0.7) && f < w('032', 0.9);
	const bob = shake ? Math.sin(f / 2) * 14 : 0;
	return (
		<>
			<Stage cam={usePush(camOn(1000, 660, 1.12), camOn(1020, 650, 1.22))} {...ST}>
				<Layer depth={1}>
					<Bg src="bg/monastery.jpg" />
					<Svg>
						<Toon id="fred31" r={CAST.fredMonk} x={900} y={995} s={S} facing={1} t={gf} pose={{hand: shake ? [150, -140 + bob] : [72, -86], handB: [-72, -86]}} face={{look: [0.8, -0.1], mouth: 'grin', brows: 'up', lids: f > w('032', 0.3) ? 'sly' : undefined}} />
						<Toon id="cyr31" r={CAST.cyr} x={cyrIn.x} y={995 - cyrIn.bob} s={S} facing={-1} t={gf} pose={{step: cyrIn.step, hand: shake ? [110, -140 + bob] : [50, -110], handB: [-60, -110]}} face={{look: [0.8, -0.1], mouth: 'grin', brows: 'up'}} />
						{/* the doctor's black bag */}
						<rect x={cyrIn.x + 46 * S} y={995 - 78 * S - cyrIn.bob} width={60 * S} height={46 * S} rx={8} fill="#2a2630" stroke={INK} strokeWidth={4} />
					</Svg>
					<Light id="l031" spots={MON_SPOTS} dark={0.3} glow="#ffb860" />
				</Layer>
			</Stage>
			<Paper />
			<Tag f={f} t={w('031', 0.5)} x={70} y={100} text="NEW FRIEND" size={50} />
			<Tag f={f} t={w('032', 0.1)} x={1150} y={860} sub="Dr." text="JOSEPH CYR" size={60} />
		</>
	);
};

/* ================================ 033–035 could I borrow your papers? — gone with them ================================ */
const CLINIC_SPOTS: [number, number, number][] = [[P(285, 215)[0], P(285, 215)[1], 280], [P(1200, 170)[0], P(1200, 170)[1], 300]];
const Papers: React.FC<{x: number; y: number; rot?: number}> = ({x, y, rot = 0}) => (
	<g transform={`translate(${x},${y}) rotate(${rot})`}>
		<rect x={-44} y={-30} width={88} height={60} fill="#f4efe2" stroke={INK} strokeWidth={4} />
		<rect x={-38} y={-38} width={88} height={60} fill="#fbf6e6" stroke={INK} strokeWidth={4} />
		<circle cx={30} cy={8} r={10} fill="#c8433d" stroke={INK} strokeWidth={2} />
		{[0, 1].map((i) => (
			<line key={i} x1={-28} y1={-22 + i * 14} x2={22} y2={-22 + i * 14} stroke="#8a8070" strokeWidth={3} />
		))}
	</g>
);
const C033: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const give = w('034', 0.3);
	const read = w('035', 0.0);
	const leave = w('035', 0.55);
	const go = walk(f, leave, leave + 26, 860, 1900);
	const gaveK = snap(f, give);
	const cyrHand: [number, number] = f < give ? [40, -110] : [120, -160];
	const fredHand: [number, number] = f < give ? [70, -200] : [110, -170];
	const holding = f >= give + 5;
	const papersAt: [number, number] = holding ? [go.x + (f < read ? 110 : 60) * S, 995 - (f < read ? 170 : 210) * S - go.bob] : [1200 - cyrHand[0] * S, 995 + cyrHand[1] * S];
	return (
		<>
			<Stage cam={usePush(camOn(1020, 640, 1.15), camOn(1040, 640, 1.22))} {...ST}>
				<Layer depth={1}>
					<Bg src="bg/clinic.jpg" />
					<Svg>
						<Toon id="cyr33" r={CAST.cyr} x={1200} y={995} s={S} facing={-1} t={gf} pose={{hand: f >= give && f < give + 10 ? mixP([40, -110], cyrHand, Math.min(gaveK, 1)) : f >= give + 10 ? [110, -230] : cyrHand, handB: [-50, -110]}} face={{look: [0.8, -0.1], mouth: 'smile', brows: 'up', talk: talk('CYR', gf)}} />
						<Toon id="fred33" r={CAST.fredMonk} x={go.x} y={995 - go.bob} s={S} facing={1} t={gf} pose={go.step ? {step: go.step, hand: [60, -170], handB: [-50, -110], lean: 10} : {hand: f < read ? fredHand : [60, -210], handB: f < read ? [-72, -86] : [30, -210]}} face={{look: f < read ? [0.8, -0.1] : [0.4, 0.5], mouth: f >= leave ? 'smirk' : 'smile', brows: f >= read ? 'sly' : 'up', lids: f >= read || f < give ? 'sly' : undefined, talk: talk('FRED', gf)}} />
						<Papers x={papersAt[0]} y={papersAt[1]} rot={holding ? -8 : 6} />
					</Svg>
					<Light id="l033" spots={CLINIC_SPOTS} dark={0.22} glow="#ffcf7a" />
				</Layer>
			</Stage>
			<Paper />
			{f >= read && f < leave ? <Tag f={f} t={read + 2} x={1250} y={100} text="STUDIES THEM" size={46} /> : null}
			{f >= leave + 14 ? <Tag f={f} t={leave + 14} x={70} y={860} text="PAPERS: GONE" size={52} /> : null}
		</>
	);
};

/* ================================ 036–039 the recruiting office in Saint John ================================ */
const REC_SPOTS: [number, number, number][] = [[P(505, 75)[0], P(505, 75)[1] + 80, 300], [P(730, 360)[0], P(730, 360)[1], 160]];
/* the 1951 Canadian Red Ensign over the flag in the picture */
const Ensign: React.FC = () => {
	const [x0, y0] = P(712, 178);
	const [x1, y1] = P(768, 420);
	return (
		<g>
			<path d={`M${x0},${y0} L${x1},${y0 + 20} Q${x1 + 6},${(y0 + y1) / 2} ${x1 - 10},${y1} L${x0 + 18},${y1 - 10} Q${x0 - 8},${(y0 + y1) / 2} ${x0},${y0} Z`} fill="#c8302a" stroke={INK} strokeWidth={4} />
			<path d={`M${x0 + 6},${y0 + 30} q14,80 6,160 M${x0 + 40},${y0 + 40} q10,90 0,170`} stroke="#9a2420" strokeWidth={5} fill="none" />
			<rect x={x0 + 4} y={y0 + 6} width={(x1 - x0) * 0.55} height={70} fill="#2a3a7a" stroke={INK} strokeWidth={3} />
			<path d={`M${x0 + 4},${y0 + 6} l${(x1 - x0) * 0.55},70 M${x0 + 4 + (x1 - x0) * 0.55},${y0 + 6} l${-(x1 - x0) * 0.55},70`} stroke="#f4efe2" strokeWidth={6} />
			<path d={`M${x0 + 4 + (x1 - x0) * 0.275},${y0 + 6} l0,70 M${x0 + 4},${y0 + 41} l${(x1 - x0) * 0.55},0`} stroke="#c8302a" strokeWidth={6} />
		</g>
	);
};
const Rain: React.FC<{f: number}> = ({f}) => {
	const [wx0, wy0] = P(890, 140);
	const [wx1, wy1] = P(1376, 395);
	return (
		<g opacity={0.5}>
			{Array.from({length: 30}).map((_, i) => {
				const x = wx0 + ((i * 97) % (wx1 - wx0));
				const y = wy0 + ((f * 18 + i * 53) % (wy1 - wy0));
				return <line key={i} x1={x} y1={y} x2={x - 6} y2={y + 26} stroke="#cfe0ee" strokeWidth={2} />;
			})}
		</g>
	);
};
const C036: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const enter = walk(f, w('036', 0.45), w('036', 0.8), -100, 760);
	const fredT = talk('FRED', gf);
	const recT = talk('REC', gf);
	const l39 = w('039', 0);
	const shrug = f > l39 ? snap(f, l39 + 4) : 0;
	const recPose: Pose = f > w('038', 0) ? {hand: [100, -230], handB: [-90, -230]} : {hand: [50, -110], handB: [-50, -110]};
	const fredPose: Pose = enter.step
		? {step: enter.step, hand: [44, -110], handB: [-44, -110]}
		: shrug > 0
			? {hand: [120, -170], handB: [-120, -170]}
			: f > w('037', 0)
				? {hand: [30, -170], handB: [-72, -86]}
				: {hand: [72, -86], handB: [-72, -86]};
	return (
		<>
			<Stage cam={usePush(camOn(960, 640, 1.08), camOn(990, 640, 1.18))} {...ST}>
				<Layer depth={1}>
					<Bg src="bg/recruit.jpg" />
					<Svg>
						<Ensign />
						<Rain f={gf} />
						<Toon id="rec36" r={CAST.recruiter} x={1250} y={1000} s={S} facing={-1} t={gf} pose={recPose} face={{look: [0.8, -0.1], mouth: f > w('038', 0) ? 'grin' : 'smile', brows: 'up', talk: recT}} />
						{f > w('036', 0.45) ? <Toon id="fred36" r={CAST.fredSuit} x={enter.x} y={1000 - enter.bob} s={S} facing={1} t={gf} pose={fredPose} face={{look: [0.8, -0.1], mouth: 'smirk', brows: 'sly', lids: f > w('037', 0) ? 'sly' : undefined, talk: fredT}} /> : null}
					</Svg>
					<Light id="l036" spots={REC_SPOTS} dark={0.22} glow="#ffd88a" />
				</Layer>
			</Stage>
			<Paper />
			<Tag f={f} t={4} x={70} y={860} sub="March 1951" text="SAINT JOHN, NEW BRUNSWICK" size={48} until={w('037', 0)} />
			<Tag f={f} t={w('037', 0.15)} x={70} y={860} sub="Dr." text="JOSEPH CYR" size={56} until={w('039', 0)} />
			<Tag f={f} t={w('038', 0.1)} x={1250} y={100} text="NEEDS DOCTORS" box="check" size={46} until={w('039', 0)} />
			<Tag f={f} t={w('039', 0.35)} x={1300} y={100} text="ARMY? AIR FORCE?" size={46} />
		</>
	);
};

/* ================================ 040 every service is short of doctors ================================ */
const Poster: React.FC<{x: number; rot: number; k: number; c: string; icon: React.ReactNode; title: string}> = ({x, rot, k, c, icon, title}) => (
	<g transform={`translate(${x},540) rotate(${rot}) scale(${0.6 + 0.4 * Math.min(k, 1.1)})`} opacity={Math.min(1, k * 2)}>
		<rect x={-170} y={-250} width={340} height={500} fill="#000" opacity={0.3} transform="translate(10,14)" />
		<rect x={-170} y={-250} width={340} height={500} fill={c} stroke={INK} strokeWidth={5} />
		<g transform="translate(0,-60)">{icon}</g>
		<text y={110} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill="#f4efe2">
			{title}
		</text>
		<text y={180} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={44} fill="#f2c94c">
			doctors wanted
		</text>
	</g>
);
const C040: React.FC = () => {
	const {f} = useShot();
	const w = useW();
	return (
		<>
			<Felt>
				<Poster x={560} rot={-6} k={snap(f, w('040', 0.02))} c="#2a3a6a" title="NAVY" icon={<path d="M0,-70 L0,60 M-50,20 Q0,90 50,20 M-30,-40 L30,-40" stroke="#f4efe2" strokeWidth={14} fill="none" strokeLinecap="round" />} />
				<Poster x={960} rot={3} k={snap(f, w('040', 0.22))} c="#4a5a2a" title="ARMY" icon={<path d="M0,-80 L22,-24 L80,-24 L34,10 L52,66 L0,32 L-52,66 L-34,10 L-80,-24 L-22,-24 Z" fill="#f4efe2" />} />
				<Poster x={1360} rot={-2} k={snap(f, w('040', 0.42))} c="#3a5a8a" title="AIR FORCE" icon={<path d="M-110,0 Q-50,-40 0,-10 Q50,-40 110,0 Q50,-10 0,20 Q-50,-10 -110,0 Z" fill="#f4efe2" />} />
				<text x={160} y={140} fontFamily={HAND} fontWeight={700} fontSize={62} fill="#f2c94c" opacity={kk(f, 4, 10)}>
					Canada is at war in Korea
				</text>
			</Felt>
			<Paper />
		</>
	);
};

/* ================================ 041–043 two months normally; nobody checks; no questions ================================ */
const C041: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const two = w('041', 0.0);
	const stampT = w('042', 0.35);
	const happy = w('043', 0.0);
	const qs = [0, 1, 2, 3];
	return (
		<>
			<Stage cam={usePush(camOn(1000, 640, 1.15), camOn(1000, 630, 1.22))} {...ST}>
				<Layer depth={1}>
					<Bg src="bg/recruit.jpg" dim={f < w('042', 0) ? 0.55 : 0} />
					<Svg>
						<Ensign />
						<Rain f={gf} />
						{f >= w('042', 0) ? (
							<g>
								<Toon id="rec41" r={CAST.recruiter} x={1180} y={1000} s={S} facing={-1} t={gf} pose={f > happy ? {hand: [110, -240], handB: [-110, -240]} : {hand: [100, -150 + (f > stampT ? 0 : -60 * Math.min(snap(f, stampT - 6), 1)) ], handB: [-50, -110]}} face={{look: [0.8, -0.1], mouth: 'grin', brows: 'up', blink: f > stampT - 4 && f < happy}} />
								<Toon id="fred41" r={CAST.fredSuit} x={760} y={1000} s={S} facing={1} t={gf} pose={{hand: [72, -86], handB: [-72, -86]}} face={{look: [0.8, -0.1], mouth: 'smirk', brows: 'sly', lids: 'sly'}} />
								{f > stampT ? <Papers x={1000} y={790} rot={8} /> : null}
								{f > stampT ? (
									<g transform={`translate(1000,790) rotate(-12) scale(${Math.max(1, 1.6 - (f - stampT) * 0.12)})`}>
										<rect x={-60} y={-22} width={120} height={44} rx={6} fill="none" stroke="#d23b3b" strokeWidth={6} />
										<text y={12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={28} fill="#d23b3b">
											OK
										</text>
									</g>
								) : null}
								{f > happy
									? qs.map((q) => {
											const t0 = happy + 6 + q * 8;
											if (f < t0) return null;
											const pop = f > t0 + 6;
											return pop ? null : <Icon key={q} kind="question" x={900 + q * 90} y={560 - q * 20} f={f} t={t0} s={0.8} />;
										})
									: null}
							</g>
						) : null}
					</Svg>
				</Layer>
			</Stage>
			<Paper />
			{f < w('042', 0) ? <BigNumber f={f} t={two} text="2 months" sub="normally" /> : null}
			<Tag f={f} t={w('042', 0.2)} x={70} y={100} text="PAPERS CHECKED" box="cross" size={48} until={happy} />
			<Tag f={f} t={happy + 4} x={70} y={100} text="QUESTIONS ASKED: 0" size={48} />
		</>
	);
};

/* ================================ 044 three days later: Surgeon-Lieutenant Joseph Cyr ================================ */
const C044: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const pop = snap(f, w('044', 0.06), 0.2);
	const salute = snap(f, w('044', 0.4));
	return (
		<>
			<Stage cam={usePush(camOn(960, 680, 1.08), camOn(960, 660, 1.16))} {...ST}>
				<Layer depth={1}>
					<Bg src="bg/deck.jpg" />
					<Svg>
						{pop > 0 ? (
							<g transform={`translate(960,990) scale(${Math.min(pop, 1.2)}) translate(-960,-990)`}>
								<Toon id="fred44" r={CAST.fredNavy} x={960} y={990} s={S} t={gf} pose={{hand: salute > 0 ? mixP([72, -86], [40, -300], Math.min(salute, 1.1)) : [72, -86], handB: [-72, -86]}} face={{look: [0.2, -0.1], mouth: 'grin', brows: 'sly', lids: 'sly'}} />
							</g>
						) : null}
						{f > w('044', 0.06) && f < w('044', 0.06) + 5 ? <circle cx={960} cy={760} r={210} fill="#fff" opacity={0.35} /> : null}
					</Svg>
				</Layer>
			</Stage>
			<Paper />
			<Tag f={f} t={4} x={70} y={100} text="3 DAYS LATER" size={52} />
			<Tag f={f} t={w('044', 0.4)} x={70} y={840} sub="Royal Canadian Navy" text="SURGEON-LT. JOSEPH CYR" size={52} />
		</>
	);
};

export const SHOTS_C2: ShotDef[] = [
	{at: '022', C: C022},
	{at: '023', C: C023},
	{at: '025', C: C025},
	{at: '026', C: C026},
	{at: '027', C: C027},
	{at: '028', C: C028},
	{at: '029', C: C029},
	{at: '030', C: C030},
	{at: '031', C: C031},
	{at: '033', C: C033},
	{at: '036', C: C036},
	{at: '040', C: C040},
	{at: '041', C: C041},
	{at: '044', C: C044},
	{at: '045', C: () => null},
];
void T;

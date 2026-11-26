import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useShot} from '../kit/core';
import type {ShotDef} from '../kit/coverage';
import {camOn} from '../kit/kit';
import {FONT, HAND} from '../kit/ui';
import {CAST} from '../toon/cast';
import {BigNumber, BlackCard, Cork, Felt, Icon, Paper, Sheet, Stamp, Tag, snap} from '../toon/kit';
import {INK, Pose, Recipe, Toon} from '../toon/Toon';
import {OR_SPOTS, Polaroid, S, T, kk, walk} from './partC1';
import {Backdrop, CORR_SPOTS, Mag, Sc, Scalpel, hp} from './c4kit';
import {useW} from './lib';

/* PART 6 (6:48–8:03): a big man, the quiz show, the book and the movie, a terrible actor,
   the rescue mission, a real certificate, hospital chaplain, the end, the list, Steve McQueen. */

/* frame inside a line where the n-th phrase starts (from the voice envelope) */
const ON: Record<string, number[]> = {
	'104': [2, 22, 59, 85],
	'105': [2, 53, 139],
	'107': [2, 32, 56, 108],
	'110': [2, 68, 79, 108],
	'114': [2, 51, 96, 118],
	'116': [2, 23, 59, 82, 110, 149],
	'117': [2, 43, 124],
};
const useOn = () => {
	const w = useW();
	return (id: string, n: number) => w(id, 0) + ON[id][n];
};

/* ================================ 104 a big man; hard to miss; bad news for a master of disguise ================================ */
const C104: React.FC = () => {
	const {f, gf} = useShot();
	const on = useOn();
	const grow = kk(f, on('104', 1), on('104', 1) + 14);
	const miss = on('104', 2);
	const disg = on('104', 3);
	const pole = snap(f, disg + 14);
	const r: Recipe = {...CAST.fredBig, girth: 1.22 + 0.4 * grow, ...(f > disg ? {glasses: true, mustache: '#3a2a20', hat: 'fedora' as const, hatColor: '#4a4038'} : {})};
	return (
		<>
			<Backdrop c="#3a2f44">
				<Toon id="fred104" r={r} x={960} y={990} s={S * 1.4} t={gf} pose={f > disg + 14 ? {hand: [80, -120], handB: [-80, -120], head: -6} : f > miss ? {hand: [120, -170], handB: [-120, -170]} : {hand: [72, -86], handB: [-72, -86]}} face={{look: f > disg + 14 ? [0.8, -0.1] : [0.2, -0.2], mouth: f > disg + 14 ? 'smirk' : f > miss ? 'o' : 'smile', brows: f > disg + 14 ? 'sly' : 'up', lids: f > disg + 14 ? 'sly' : undefined}} />
				{/* a skinny lamp post to hide behind */}
				{f > disg + 14 ? (
					<g transform={`translate(${960 + 600 * (1 - Math.min(pole, 1))},0)`}>
						<rect x={-9} y={300} width={18} height={690} fill="#3a3d44" stroke={INK} strokeWidth={4} />
						<path d="M-40,300 L40,300 L26,260 L-26,260 Z" fill="#f2e6b0" stroke={INK} strokeWidth={4} />
						<ellipse cx={0} cy={990} rx={50} ry={12} fill="#3a3d44" stroke={INK} strokeWidth={4} />
					</g>
				) : null}
				{f > on('104', 1) && f < on('104', 1) + 16 ? (
					<text x={1240} y={560} fontFamily={HAND} fontWeight={700} fontSize={80} fill="#f2c94c" stroke={INK} strokeWidth={8} style={{paintOrder: 'stroke'}}>
						poof!
					</text>
				) : null}
			</Backdrop>
			<Paper />
			<Tag f={f} t={on('104', 1) + 4} x={70} y={100} text="A BIG MAN" size={54} until={miss} />
			<Tag f={f} t={miss + 2} x={70} y={100} text="HARD TO MISS" size={54} until={disg} />
			<Tag f={f} t={disg + 20} x={70} y={100} text="DISGUISE" box="cross" size={54} />
		</>
	);
};

/* ================================ 105–106 the quiz show; $1,000; the Feed and Clothe Fred Demara Fund ================================ */
const TvSet: React.FC<{f: number; applause: boolean; children?: React.ReactNode}> = ({f, applause, children}) => (
	<AbsoluteFill style={{background: '#1a1418'}}>
		<svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
			{/* stage curtains */}
			<rect x={0} y={0} width={1920} height={1080} fill="#6a1e22" />
			{Array.from({length: 16}).map((_, i) => (
				<path key={i} d={`M${i * 124},0 Q${i * 124 + 62},540 ${i * 124 + 10},1080`} stroke="#4a1418" strokeWidth={14} fill="none" opacity={0.7} />
			))}
			<path d="M0,0 L1920,0 L1920,110 Q960,180 0,110 Z" fill="#8a2a2a" stroke={INK} strokeWidth={6} />
			<rect x={0} y={860} width={1920} height={220} fill="#5a3a2a" stroke={INK} strokeWidth={6} />
			<ellipse cx={960} cy={880} rx={700} ry={60} fill="#fff6c0" opacity={0.12} />
			{/* applause sign */}
			<g transform="translate(960,230)">
				<rect x={-200} y={-50} width={400} height={90} rx={12} fill={applause && f % 10 < 6 ? '#f2c94c' : '#4a3a2a'} stroke={INK} strokeWidth={6} />
				<text y={18} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={52} fill={applause && f % 10 < 6 ? '#8a1e22' : '#7a6a5a'}>
					APPLAUSE
				</text>
			</g>
			{children}
		</svg>
		{/* old TV bezel */}
		<div style={{position: 'absolute', inset: 0, border: '46px solid #4a3020', borderRadius: 60, boxShadow: 'inset 0 0 120px rgba(0,0,0,0.85)'}} />
	</AbsoluteFill>
);
const Podium: React.FC<{x: number; label?: string}> = ({x, label}) => (
	<g transform={`translate(${x},980)`}>
		<path d="M-110,-150 L110,-150 L90,0 L-90,0 Z" fill="#d8c8a0" stroke={INK} strokeWidth={6} />
		<rect x={-120} y={-170} width={240} height={26} rx={6} fill="#8a5a32" stroke={INK} strokeWidth={5} />
		{label ? (
			<text y={-70} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill="#8a1e22">
				{label}
			</text>
		) : null}
	</g>
);
const C105: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const on = useOn();
	const win = on('105', 2);
	const fund = w('106', 0);
	const laugh = w('106', 0.55);
	const jump = f > win && f < fund ? Math.abs(Math.sin((f - win) / 4)) * 30 : 0;
	const host = f > laugh ? {hand: [40, -130] as [number, number], handB: [-40, -130] as [number, number], head: -10} : {hand: [100, -200 + Math.sin(f / 5) * 20] as [number, number], handB: [-60, -110] as [number, number]};
	return (
		<>
			<TvSet f={f} applause={f > win || f > laugh}>
				<Toon id="host105" r={CAST.host} x={640} y={980} s={S * 1.05} facing={1} t={gf} pose={host} face={{look: [0.8, -0.1], mouth: f > laugh ? 'wide' : 'smirk', brows: 'up', lids: f > laugh ? 'sleepy' : 'sly'}} />
				{/* the host's cigar */}
				<rect x={640 + 30 * S} y={980 - 195 * S} width={46} height={10} rx={4} fill="#7a4e2a" stroke={INK} strokeWidth={3} />
				<Podium x={640} />
				<Toon id="fred105" r={CAST.fredBig} x={1260} y={980 - jump} s={S * 1.05} facing={-1} t={gf} pose={f > fund ? {hand: [150, -150], handB: [-72, -86]} : f > win ? {hand: [70, -320], handB: [-70, -320]} : {hand: [60, -150], handB: [-60, -150]}} face={{look: [0.8, -0.1], mouth: f > fund ? 'smirk' : 'grin', brows: f > fund ? 'sly' : 'up', lids: f > fund ? 'sly' : undefined, dollar: f > win && f < fund}} />
				<Podium x={1260} label="FRED" />
				{f > fund ? (
					<g transform={`translate(1080,810) scale(${Math.min(1.1, snap(f, fund))})`}>
						<rect x={-70} y={-120} width={140} height={120} rx={16} fill="#dff0fa" fillOpacity={0.75} stroke={INK} strokeWidth={5} />
						<rect x={-60} y={-46} width={120} height={40} fill="#a8d0a0" stroke={INK} strokeWidth={3} />
						<rect x={-56} y={-100} width={112} height={40} fill="#f4efe2" stroke={INK} strokeWidth={3} />
						<text y={-72} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={24} fill="#8a1e22">
							FUND
						</text>
					</g>
				) : null}
				{f > laugh
					? [0, 1, 2].map((i) => (
							<text key={i} x={[300, 960, 1560][i]} y={820 - ((f - laugh + i * 7) % 24) * 3} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={64} fill="#f2c94c" stroke={INK} strokeWidth={6} style={{paintOrder: 'stroke'}} opacity={f - laugh > i * 6 ? 1 : 0}>
								HA HA!
							</text>
						))
					: null}
			</TvSet>
			<Paper />
			<Tag f={f} t={4} x={90} y={1000} sub="1959" text="TV QUIZ SHOW" size={50} until={win} />
			{f > win && f < fund ? <BigNumber f={f} t={win} text="$1,000" sub="he wins" y={300} /> : null}
			<Tag f={f} t={fund + 6} x={90} y={1000} text="FEED & CLOTHE FRED DEMARA FUND" size={44} />
		</>
	);
};

/* ================================ 107–108 the bestseller, the movie, Tony Curtis ================================ */
const C107: React.FC = () => {
	const {f} = useShot();
	const on = useOn();
	const w = useW();
	const movie = on('107', 3);
	const clap = movie + 8;
	const arm = f < clap ? -30 * (1 - kk(f, movie, clap)) - 0 : 0;
	const poster = w('108', 0);
	if (f > poster) {
		const k = snap(f, poster);
		return (
			<>
				<Felt>
					<g transform={`translate(960,540) rotate(${-3 + 8 * (1 - Math.min(k, 1))}) scale(${0.6 + 0.4 * Math.min(k, 1.1)})`}>
						<rect x={-330} y={-460} width={660} height={920} fill="#1d2a44" stroke={INK} strokeWidth={8} />
						<text y={-370} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={38} fill="#f4efe2">
							starring
						</text>
						<text y={-310} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={66} fill="#f2c94c">
							TONY CURTIS
						</text>
						<Toon id="actor108" r={{...CAST.visitor, body: '#1f2a44', shirt: '#f4f1ea', tie: '#1a1a1e', outfit: 'uniform', hat: 'navycap', hair: 'slick', hairColor: '#1a1a1e', girth: 0.95, seed: 231}} x={0} y={300} s={1.5} t={f} pose={{hand: [60, -300], handB: [-72, -86]}} face={{look: [0.3, -0.2], mouth: 'grin', brows: 'up'}} />
						<text y={420} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={72} fill="#f2c94c">
							The Great Impostor
						</text>
					</g>
				</Felt>
				<Paper />
				<Tag f={f} t={poster + 10} x={70} y={980} text="PLAYS FRED" size={52} />
			</>
		);
	}
	return (
		<>
			<Felt>
				<g transform={`translate(${f > movie ? 560 : 960},540) rotate(-4) scale(${(f > movie ? 0.8 : 1) * (0.6 + 0.4 * Math.min(snap(f, 2), 1.1))})`}>
					<rect x={-240} y={-330} width={480} height={660} rx={8} fill="#000" opacity={0.3} transform="translate(14,16)" />
					<rect x={-240} y={-330} width={480} height={660} rx={8} fill="#c8302a" stroke={INK} strokeWidth={6} />
					<rect x={-240} y={-330} width={36} height={660} fill="#9a2420" stroke={INK} strokeWidth={4} />
					<text y={-180} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60} fill="#f4efe2">
						THE GREAT
					</text>
					<text y={-110} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60} fill="#f4efe2">
						IMPOSTOR
					</text>
					<circle cy={60} r={90} fill="#f1d2b0" stroke={INK} strokeWidth={5} />
					<path d="M-84,30 Q-60,-36 0,-30 Q70,-36 86,30 Q60,0 0,0 Q-50,0 -84,30 Z" fill="#3a2a20" />
					<circle cx={-30} cy={56} r={8} fill={INK} />
					<circle cx={32} cy={56} r={8} fill={INK} />
					<path d="M-30,96 Q0,116 32,96" stroke={INK} strokeWidth={6} fill="none" />
					<text y={260} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={36} fill="#f4efe2">
						a true story
					</text>
				</g>
				<Stamp f={f} t={on('107', 1)} x={600} y={380} text="BESTSELLER" rot={-14} size={56} />
				{f > movie ? (
					<g transform={`translate(1330,600) scale(${Math.min(1.1, snap(f, movie))})`}>
						<rect x={-230} y={-60} width={460} height={260} rx={10} fill="#22222a" stroke={INK} strokeWidth={6} />
						<text x={-190} y={60} fontFamily={HAND} fontWeight={700} fontSize={46} fill="#f4efe2">
							HOLLYWOOD
						</text>
						<text x={-190} y={140} fontFamily={HAND} fontWeight={700} fontSize={40} fill="#f4efe2">
							SCENE 1 · TAKE 1
						</text>
						<g transform={`translate(-230,-60) rotate(${arm})`}>
							<rect x={0} y={-60} width={460} height={60} fill="#f4efe2" stroke={INK} strokeWidth={6} />
							{[0, 1, 2, 3, 4].map((i) => (
								<path key={i} d={`M${20 + i * 92},-60 l50,0 l-30,60 l-50,0 Z`} fill="#22222a" />
							))}
						</g>
					</g>
				) : null}
				{f >= clap && f < clap + 10 ? (
					<text x={1500} y={330} fontFamily={HAND} fontWeight={700} fontSize={90} fill="#f2c94c" stroke={INK} strokeWidth={8} style={{paintOrder: 'stroke'}}>
						clack!
					</text>
				) : null}
			</Felt>
			<Paper />
		</>
	);
};

/* ================================ 109–110 a small part as a hospital surgeon; a terrible actor ================================ */
const MovieCam: React.FC<{x: number; y: number}> = ({x, y}) => (
	<g transform={`translate(${x},${y})`}>
		<line x1={0} y1={0} x2={-60} y2={260} stroke={INK} strokeWidth={8} />
		<line x1={0} y1={0} x2={60} y2={260} stroke={INK} strokeWidth={8} />
		<line x1={0} y1={0} x2={0} y2={260} stroke={INK} strokeWidth={8} />
		<rect x={-90} y={-90} width={160} height={100} rx={10} fill="#2a2a30" stroke={INK} strokeWidth={5} />
		<circle cx={-50} cy={-120} r={40} fill="#3a3a40" stroke={INK} strokeWidth={5} />
		<circle cx={30} cy={-120} r={40} fill="#3a3a40" stroke={INK} strokeWidth={5} />
		<rect x={-130} y={-62} width={40} height={44} fill="#5a6a7a" stroke={INK} strokeWidth={4} />
	</g>
);
const C109: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const on = useOn();
	const surgeon = w('109', 0.55);
	const actStart = w('110', 0);
	const cant = on('110', 2);
	const terrible = on('110', 3);
	const acting = f > actStart;
	const takes = acting ? 1 + Math.floor(Math.max(0, f - cant) / 12) : 1;
	const wild = Math.sin(f / 2.5);
	const fredPose: Pose = acting
		? {hand: [140, -260 + 80 * wild], handB: [-140, -200 - 80 * wild], head: 14 * wild, lean: 8 * wild}
		: f > surgeon
			? {hand: [100, -230], handB: [-72, -86]}
			: {hand: [72, -86], handB: [-72, -86]};
	const facepalm = f > cant;
	const sp = hp(1240, 1000, [100, -230], -1);
	return (
		<>
			<Sc bg="bg/or.jpg" a={acting ? camOn(1060, 640, 1.2) : camOn(1000, 650, 1.06)} b={acting ? camOn(1100, 630, 1.3) : camOn(1040, 650, 1.14)} id="l109" spots={OR_SPOTS}>
				<Toon id="fred109" r={CAST.fredActor} x={1240} y={1000} s={S} facing={-1} t={gf} pose={fredPose} face={{look: acting ? [0.2, -0.3] : [0.6, -0.1], mouth: acting ? (Math.floor(f / 6) % 2 ? 'wide' : 'o') : 'grin', brows: acting ? (Math.floor(f / 8) % 2 ? 'up' : 'worried') : 'up'}} />
				{!acting && f > surgeon ? <Scalpel x={sp[0]} y={sp[1]} rot={-120} glint /> : null}
				<MovieCam x={470} y={740} />
				<Toon id="dir109" r={CAST.director} x={720} y={1000} s={S} facing={1} t={gf} pose={facepalm ? {hand: [40, -230], handB: [-72, -86], head: 10} : {hand: [90, -220], handB: [-60, -110]}} face={{look: [0.8, -0.1], mouth: facepalm ? 'frown' : 'smile', brows: facepalm ? 'worried' : 'up', lids: facepalm ? 'sleepy' : undefined}} />
				{/* megaphone */}
				{!facepalm ? (
					<g transform={`translate(${720 + 90 * S},${1000 - 220 * S}) rotate(-10)`}>
						<path d="M0,-12 L70,-34 L70,34 L0,12 Z" fill="#f2c94c" stroke={INK} strokeWidth={4} />
					</g>
				) : null}
			</Sc>
			<Paper />
			<Tag f={f} t={6} x={70} y={100} text="A SMALL PART" size={52} until={surgeon} />
			<Tag f={f} t={surgeon + 2} x={70} y={100} text="HOSPITAL SURGEON" size={52} until={actStart} />
			<Tag f={f} t={actStart + 4} x={70} y={100} text="ACTION!" size={56} until={cant} />
			{f > cant ? <Tag key={takes} f={f} t={cant + (takes - 1) * 12} x={1350} y={100} text={`TAKE ${takes}`} size={52} /> : null}
			<Tag f={f} t={terrible + 2} x={70} y={100} text="TERRIBLE ACTOR" box="cross" size={54} />
		</>
	);
};

/* ================================ 111 counselor at a rescue mission in Los Angeles ================================ */
const C111: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const give = w('111', 0.45);
	const k = kk(f, give, give + 12);
	const bowlFrom = hp(820, 980, [110, -130]);
	const bowlTo = hp(1180, 980, [80, -140], -1);
	const bx = bowlFrom[0] + (bowlTo[0] - bowlFrom[0]) * k;
	const by = bowlFrom[1] + (bowlTo[1] - bowlFrom[1]) * k - 30 * Math.sin(k * Math.PI);
	return (
		<>
			<Backdrop c="#4a3a24">
				<rect x={460} y={150} width={1000} height={160} rx={12} fill="#f4efe2" stroke={INK} strokeWidth={6} />
				<text x={960} y={260} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={84} fill="#8a1e22">
					RESCUE MISSION
				</text>
				<rect x={300} y={330} width={140} height={200} fill="#ffe8a8" stroke={INK} strokeWidth={6} opacity={0.8} />
				<rect x={1480} y={330} width={140} height={200} fill="#ffe8a8" stroke={INK} strokeWidth={6} opacity={0.8} />
				<Toon id="fred111" r={{...CAST.fredBig, hairColor: '#5a4a40'}} x={820} y={980} s={S} facing={1} t={gf} pose={f < give ? {hand: [110, -130], handB: [-72, -86]} : {hand: [150, -200], handB: [-72, -86]}} face={{look: [0.8, -0.1], mouth: 'smile', brows: 'up'}} />
				<Toon id="drift111" r={CAST.drifter} x={1180} y={980} s={S} facing={-1} t={gf} pose={f > give + 12 ? {hand: [80, -140], handB: [-40, -150]} : {hand: [30, -100], handB: [-30, -100], head: 8}} face={{look: [0.8, f > give + 12 ? -0.1 : 0.5], mouth: f > give + 14 ? 'smile' : 'frown', brows: f > give + 12 ? 'up' : 'worried'}} />
				<g transform={`translate(${bx},${by})`}>
					<path d="M-40,-10 Q0,40 40,-10 Z" fill="#f4efe2" stroke={INK} strokeWidth={4} />
					<ellipse cx={0} cy={-10} rx={40} ry={8} fill="#c8873a" stroke={INK} strokeWidth={3} />
					{[0, 1].map((i) => (
						<path key={i} d={`M${-10 + i * 20},-24 q-8,-14 0,-28`} stroke="#f4efe2" strokeWidth={4} fill="none" opacity={0.6 + 0.4 * Math.sin(f / 4 + i)} />
					))}
				</g>
			</Backdrop>
			<Paper />
			<Tag f={f} t={4} x={70} y={1000} text="LOS ANGELES" size={52} />
			<Tag f={f} t={give} x={1300} y={1000} text="COUNSELOR" size={52} />
		</>
	);
};

/* ================================ 112 a certificate in Bible studies — a real one ================================ */
const C112: React.FC = () => {
	const {f} = useShot();
	const w = useW();
	const real = w('112', 0.45);
	const away = kk(f, real - 10, real + 4);
	return (
		<>
			<Felt>
				{[0, 1, 2].map((i) => (
					<g key={i} transform={`translate(${-900 * away * (i % 2 ? -1 : 1)},0)`}>
						<Sheet x={[560, 1360, 960][i]} y={[360, 380, 700][i]} w={420} h={280} rot={[-10, 8, -4][i]} k={snap(f, 2 + i * 6)}>
							<text y={-80} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={INK}>
								{['DIPLOMA · MEDICINE', 'Ph.D. PSYCHOLOGY', 'LAW DEGREE'][i]}
							</text>
							<circle cx={140} cy={80} r={30} fill="#c83a3a" stroke={INK} strokeWidth={3} />
						</Sheet>
						<Stamp f={f} t={8 + i * 6} x={[560, 1360, 960][i]} y={[380, 400, 720][i]} text="FAKE" rot={-12} size={56} />
					</g>
				))}
				{f > real ? (
					<Sheet x={960} y={540} w={900} h={600} rot={-2} k={snap(f, real)}>
						<rect x={-430} y={-280} width={860} height={560} fill="none" stroke="#c8a040" strokeWidth={10} />
						<text y={-170} textAnchor="middle" fontFamily="Georgia, serif" fontWeight={900} fontSize={58} fill={INK}>
							CERTIFICATE
						</text>
						<text y={-100} textAnchor="middle" fontFamily="Georgia, serif" fontSize={40} fill={INK}>
							in Bible Studies
						</text>
						<text y={10} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={70} fill="#2a4a8a">
							Ferdinand W. Demara
						</text>
						<circle cx={300} cy={170} r={58} fill="#f2c94c" stroke={INK} strokeWidth={5} />
						<path d="M280,224 l-20,60 l30,-16 l20,24 l10,-64" fill="#c83a3a" stroke={INK} strokeWidth={4} />
					</Sheet>
				) : null}
			</Felt>
			<Paper />
			<Tag f={f} t={real + 14} x={70} y={980} text="A REAL ONE" box="check" size={58} />
		</>
	);
};

/* ================================ 113–114 hospital chaplain; his past comes out; the chief stands up for him ================================ */
const Bible: React.FC<{x: number; y: number}> = ({x, y}) => (
	<g transform={`translate(${x},${y})`}>
		<rect x={-26} y={-34} width={52} height={68} rx={4} fill="#22222a" stroke={INK} strokeWidth={4} />
		<path d="M0,-20 L0,16 M-12,-8 L12,-8" stroke="#c8a040" strokeWidth={5} />
	</g>
);
const C113: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const on = useOn();
	const inn = walk(f, 0, w('113', 0.45), 1700, 1080);
	const greet = w('113', 0.5);
	const past = w('114', 0);
	const chief = on('114', 1);
	const stays = on('114', 3);
	const cIn = walk(f, chief - 6, chief + 14, -150, 860);
	const vOut = walk(f, chief + 30, chief + 60, 560, -300);
	const fredPose: Pose = inn.step ? {step: inn.step, hand: [70, -150], handB: [-44, -110]} : f > stays ? {hand: [70, -150], handB: [-72, -86]} : f > past + 10 ? {hand: [70, -150], handB: [-40, -200]} : f > greet ? {hand: [70, -150], handB: [-110, -190]} : {hand: [70, -150], handB: [-72, -86]};
	const bp = hp(inn.x, 1000 - inn.bob, [70, -150], -1);
	const visitorIn = f > past - 6;
	const pOut = walk(f, w('113', 0.8), past - 8, 620, -250);
	const mp = hp(560, 1000, [110, -260]);
	return (
		<>
			<Sc bg="bg/corridor.jpg" a={camOn(980, 650, 1.06)} b={camOn(960, 650, 1.14)} id="l113" spots={CORR_SPOTS} dark={0.25} glow="#ffe2a8">
				{pOut.x > -240 ? <Toon id="pat113" r={{...CAST.farmer, outfit: 'gown', body: '#cfe0ea'}} x={pOut.x} y={1000 - pOut.bob} s={S} facing={pOut.step ? -1 : 1} t={gf} pose={pOut.step ? {step: pOut.step, hand: [44, -110], handB: [-44, -110]} : f > greet ? {hand: [100, -180], handB: [-60, -110]} : {hand: [50, -110], handB: [-50, -110]}} face={{look: [0.8, -0.1], mouth: f > greet ? 'grin' : 'smile', brows: 'up'}} /> : null}
				{visitorIn && vOut.x > -250 ? (
					<>
						<Toon id="vis114" r={CAST.visitor} x={vOut.x === 560 ? 560 : vOut.x} y={1000 - vOut.bob} s={S} facing={vOut.step ? -1 : 1} t={gf} pose={vOut.step ? {step: vOut.step, hand: [44, -110], handB: [-44, -110]} : f > chief + 14 ? {hand: [60, -150], handB: [-60, -110], head: 8} : {hand: [110, -260], handB: [-60, -110]}} face={{look: [0.8, -0.1], mouth: f > chief + 14 ? 'frown' : 'smirk', brows: f > chief + 14 ? 'worried' : 'sly'}} />
						{!vOut.step && f < chief + 14 ? <Mag x={mp[0]} y={mp[1]} s={0.3} rot={6} /> : null}
					</>
				) : null}
				{f > chief - 6 ? <Toon id="chief114" r={CAST.chief} x={cIn.x} y={1000 - cIn.bob} s={S} facing={cIn.step || f > stays ? 1 : -1} t={gf} pose={cIn.step ? {step: cIn.step, hand: [44, -110], handB: [-44, -110]} : f > stays ? {hand: [60, -270], handB: [-72, -86]} : {hand: [-150, -200], handB: [150, -200]}} face={{look: [0.8, -0.1], mouth: f > stays ? 'grin' : 'frown', brows: f > stays ? 'up' : 'down'}} /> : null}
				<Toon id="fred113" r={CAST.fredChap} x={inn.x} y={1000 - inn.bob} s={S} facing={-1} t={gf} pose={fredPose} face={{look: [0.8, -0.1], mouth: f > stays ? 'grin' : f > past + 10 ? 'o' : 'smile', brows: f > past + 10 && f < stays ? 'worried' : 'up', sweat: f > past + 10 && f < chief + 20}} />
				<Bible x={bp[0]} y={bp[1]} />
				<Icon kind="halo" x={inn.x - 4} y={1000 - 345 * S} f={f} t={stays + 4} s={0.7} />
			</Sc>
			<Paper />
			<Tag f={f} t={6} x={70} y={100} sub="California" text="HOSPITAL CHAPLAIN" size={50} until={past} />
			<Tag f={f} t={past + 4} x={70} y={100} text="HIS PAST COMES OUT" size={50} until={chief} />
			<Tag f={f} t={chief + 16} x={70} y={100} text="THE CHIEF OF STAFF" size={50} until={stays} />
			<Tag f={f} t={stays + 2} x={70} y={100} text="HE STAYS" box="check" size={56} />
		</>
	);
};

/* ================================ 115 he dies in 1982, sixty ================================ */
const C115: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const flick = 1 + 0.08 * Math.sin(f / 2) + 0.05 * Math.sin(f / 3.3);
	return (
		<>
			<Cork>
				<svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
					<rect width={1920} height={1080} fill="#000" opacity={0.35} />
					<Polaroid x={960} y={500} rot={-2} k={Math.min(1, snap(f, 2))} label="1921 – 1982">
						<rect x={-176} y={-206} width={352} height={340} fill="#6a7a8a" />
						<Toon id="chap115" r={CAST.fredChap} x={0} y={250} s={1.15} t={gf} pose={{hand: [40, -140], handB: [-40, -140]}} face={{look: [0, -0.1], mouth: 'smile', brows: 'flat', lids: 'sleepy'}} />
					</Polaroid>
					{/* a candle */}
					<g transform="translate(1360,860)">
						<ellipse cx={0} cy={-150} rx={80 * flick} ry={90 * flick} fill="#ffd88a" opacity={0.25} />
						<rect x={-26} y={-110} width={52} height={130} rx={6} fill="#f4efe2" stroke={INK} strokeWidth={4} />
						<path d={`M0,-160 Q${14 * flick},-130 0,-112 Q${-14 * flick},-130 0,-160 Z`} fill="#f2c94c" stroke="#c8732a" strokeWidth={3} />
					</g>
				</svg>
			</Cork>
			<Paper />
			<Tag f={f} t={w('115', 0.55)} x={70} y={980} text="SIXTY" size={56} />
		</>
	);
};

/* ================================ 116 Monk. Psychologist. Dean. Surgeon. Prison officer. Chaplain. ================================ */
const ROLES: {r: string; label: string; bg: string; pose: Pose}[] = [
	{r: 'fredMonk', label: 'Monk', bg: '#7a6a58', pose: {hand: [18, -135], handB: [-18, -135]}},
	{r: 'fredProf', label: 'Psychologist', bg: '#6a7a6a', pose: {hand: [60, -270], handB: [-55, -120]}},
	{r: 'fredProf', label: 'Dean', bg: '#7a6a8a', pose: {hand: [110, -190], handB: [-72, -86]}},
	{r: 'fredSurg', label: 'Surgeon', bg: '#7a9a8a', pose: {hand: [60, -300], handB: [-72, -86]}},
	{r: 'fredGuard', label: 'Prison officer', bg: '#8a7a5a', pose: {hand: [72, -86], handB: [-72, -86]}},
	{r: 'fredChap', label: 'Chaplain', bg: '#6a7a8a', pose: {hand: [40, -140], handB: [-40, -140]}},
];
const C116: React.FC = () => {
	const {f, gf} = useShot();
	const on = useOn();
	return (
		<>
			<Cork>
				<svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
					{ROLES.map((ro, i) => {
						const t0 = on('116', i);
						if (f < t0) return null;
						const x = 360 + (i % 3) * 600;
						const y = i < 3 ? 300 : 790;
						return (
							<g key={i} transform={`translate(${x},${y}) scale(0.82) translate(${-x},${-y})`}>
								<Polaroid x={x} y={y} rot={((i * 37) % 11) - 5} k={snap(f, t0)} label={ro.label}>
									<rect x={-176} y={-206} width={352} height={340} fill={ro.bg} />
									<Toon id={`role116${i}`} r={CAST[ro.r]} x={0} y={250} s={1.15} t={gf + i * 7} pose={ro.pose} face={{look: [0.2, -0.1], mouth: i === 5 ? 'smile' : 'grin', brows: 'up', lids: i === 0 || i === 5 ? 'sleepy' : i === 3 ? 'sly' : undefined}} />
								</Polaroid>
							</g>
						);
					})}
				</svg>
			</Cork>
			<Paper />
		</>
	);
};

/* ================================ 117 1980: beside a dying Hollywood star — Steve McQueen ================================ */
const C117: React.FC = () => {
	const {f, gf} = useShot();
	const on = useOn();
	const star = on('117', 2);
	const BX = 1220;
	const BY = 900; // mattress top
	const FX = 700;
	const FLOOR = 1000;
	const talkF = Math.abs(Math.sin(f / 4)) * (f > on('117', 1) && f < star ? 0.4 : 0);
	return (
		<>
			<Sc bg="bg/corridor.jpg" a={camOn(980, 650, 1.12)} b={camOn(1000, 660, 1.24)} id="l117" spots={CORR_SPOTS} dark={0.55} glow="#ffcf8a">
				{/* hospital bed with the head raised (head on the right) */}
				<rect x={BX - 330} y={BY} width={620} height={40} rx={8} fill="#d8dde4" stroke={INK} strokeWidth={5} />
				<line x1={BX - 310} y1={BY + 40} x2={BX - 310} y2={FLOOR} stroke={INK} strokeWidth={8} />
				<line x1={BX + 270} y1={BY + 40} x2={BX + 270} y2={FLOOR} stroke={INK} strokeWidth={8} />
				<path d={`M${BX + 140},${BY} L${BX + 260},${BY - 180} L${BX + 300},${BY - 170} L${BX + 200},${BY} Z`} fill="#d8dde4" stroke={INK} strokeWidth={5} />
				<rect x={BX + 290} y={BY - 220} width={22} height={260} fill="#a8b0bc" stroke={INK} strokeWidth={4} />
				{/* the patient half sitting, facing the chaplain */}
				<Toon id="star117" r={CAST.star} x={BX + 120} y={BY + 34} s={S} facing={-1} t={gf} pose={{sit: 1, lean: -24, hand: [40, -110], handB: [-10, -120]}} face={{look: [0.8, -0.1], mouth: f > star ? 'smile' : 'closed', brows: 'flat'}} />
				<rect x={BX - 330} y={BY - 4} width={500} height={78} rx={10} fill="#8aa0c0" stroke={INK} strokeWidth={5} />
				<path d={`M${BX - 300},${BY + 4} Q${BX - 200},${BY - 70} ${BX + 40},${BY - 60} L${BX + 150},${BY - 50} L${BX + 160},${BY + 4} Z`} fill="#8aa0c0" stroke={INK} strokeWidth={5} />
				{/* chair and the seated chaplain */}
				<rect x={FX - 90} y={FLOOR - 105} width={150} height={20} rx={4} fill="#8a5a32" stroke={INK} strokeWidth={4} />
				<rect x={FX - 90} y={FLOOR - 260} width={20} height={175} fill="#8a5a32" stroke={INK} strokeWidth={4} />
				<line x1={FX - 80} y1={FLOOR - 85} x2={FX - 80} y2={FLOOR} stroke={INK} strokeWidth={7} />
				<line x1={FX + 50} y1={FLOOR - 85} x2={FX + 50} y2={FLOOR} stroke={INK} strokeWidth={7} />
				<Toon id="chap117" r={CAST.fredChap} x={FX - 20} y={FLOOR - 50} s={S} facing={1} t={gf} pose={{sit: 1, hand: [80, -110], handB: [40, -120], lean: 6}} face={{look: [0.8, -0.1], mouth: 'smile', brows: 'flat', talk: talkF}} />
				<Bible x={FX - 20 + 70 * S} y={FLOOR - 50 - 112 * S} />
				{f > star ? (
					<g transform={`translate(${BX + 60},${BY - 380}) scale(${Math.min(1.1, snap(f, star))})`}>
						<path d="M0,-60 L16,-20 L58,-18 L24,8 L36,50 L0,26 L-36,50 L-24,8 L-58,-18 L-16,-20 Z" fill="#f2c94c" stroke={INK} strokeWidth={5} />
					</g>
				) : null}
			</Sc>
			<Paper />
			<Tag f={f} t={4} x={70} y={100} text="1980" size={60} />
			<Tag f={f} t={on('117', 1) + 4} x={1250} y={100} text="A HOLLYWOOD STAR" size={50} until={star} />
			<Tag f={f} t={star + 4} x={1250} y={100} text="STEVE McQUEEN" size={56} />
		</>
	);
};

/* ================================ 118 But that's another story. ================================ */
const C118: React.FC = () => {
	const {f} = useShot();
	return <BlackCard f={f} text="But that's another story." />;
};

const C110: React.FC = () => <C109 />;

export const SHOTS_C6: ShotDef[] = [
	{at: '104', C: C104},
	{at: '105', C: C105},
	{at: '107', C: C107},
	{at: '109', C: C109},
	{at: '110', C: C110},
	{at: '111', C: C111},
	{at: '112', C: C112},
	{at: '113', C: C113},
	{at: '115', C: C115},
	{at: '116', C: C116},
	{at: '117', C: C117},
	{at: '118', C: C118},
];
void T;

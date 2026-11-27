import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {AngleCtx, L, LINES, ShotCtx, TOTAL, talkOf, useShot} from './kit/core';
import {clamp, ease} from './kit/kit';
import {FONT, HAND} from './kit/ui';
import {VoiceTrack} from './Long';
import {CAST} from './toon/cast';
import {BigNumber, Icon, Stamp, Tag, mixP, snap} from './toon/kit';
import {INK, Pose, Recipe, Toon} from './toon/Toon';

/* "Typhoid Mary" — a vertical (1080×1920) daily short in the cartoon-story style.
   Backgrounds are the user's 9:16 pictures (768×1376) in public/bg. */
const W = 1080;
const H = 1920;
const SV = 1.6; // character scale
const FLOOR = 1700;
const LEAD = 6;

/* background picture pixel → world */
const Q = (xi: number, yi: number): [number, number] => [1.40625 * xi, 1.40625 * yi - 7.6];
const kk = (x: number, a: number, b: number) => Math.max(0, Math.min(1, (x - a) / (b - a)));
const talk = (sp: string, gf: number) => talkOf(sp, gf - (gf % 3));
const walk = (f: number, t0: number, t1: number, x0: number, x1: number, speed = 3) => {
	const k = kk(f, t0, t1);
	return {x: x0 + (x1 - x0) * k, step: k > 0 && k < 1 ? Math.sin(f / speed) : 0, bob: k > 0 && k < 1 ? Math.abs(Math.sin(f / speed)) * 8 : 0};
};
const hp = (x: number, y: number, h: [number, number], facing: 1 | -1 = 1, s = SV): [number, number] => [x + facing * h[0] * s, y + h[1] * s];
const useW = () => {
	const {at, end} = useShot();
	return (id: string, frac: number) => at(id) + Math.round((end(id) - at(id)) * frac);
};
const mixHex = (a: string, b: string, k: number) => {
	const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
	const [x, y] = [p(a), p(b)];
	return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * k).toString(16).padStart(2, '0')).join('');
};

/* ------------------------------------------------------------------ vertical kit */
type Cam = {x: number; y: number; z: number};
const VStage: React.FC<{bg?: string; a: Cam; b: Cam; dim?: number; spots?: [number, number, number][]; dark?: number; glow?: string; children?: React.ReactNode; front?: React.ReactNode}> = ({bg, a, b, dim = 0, spots, dark = 0.3, glow = '#ffd88a', children}) => {
	const {f, dur} = useShot();
	const k = interpolate(f, [0, dur], [0, 1], {...clamp, easing: ease});
	const z = a.z + (b.z - a.z) * k;
	const x = Math.min(W - W / 2 / z, Math.max(W / 2 / z, a.x + (b.x - a.x) * k));
	const y = Math.min(1928 - H / 2 / z, Math.max(H / 2 / z, a.y + (b.y - a.y) * k));
	const id = `vl${Math.round(a.x)}${Math.round(a.y)}`;
	return (
		<AbsoluteFill style={{overflow: 'hidden', background: '#1a1418'}}>
			<div style={{position: 'absolute', width: W, height: H, transformOrigin: '0 0', transform: `translate(${W / 2 - x * z}px, ${H / 2 - y * z}px) scale(${z})`}}>
				{bg ? <Img src={staticFile(bg)} style={{position: 'absolute', left: 0, top: -7.6, width: 1080, height: 1935}} /> : null}
				{dim > 0 ? <div style={{position: 'absolute', inset: -100, background: '#000', opacity: dim}} /> : null}
				<svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
					{children}
				</svg>
				{spots ? (
					<svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none'}}>
						<defs>
							<filter id={`${id}-b`} x="-50%" y="-50%" width="200%" height="200%">
								<feGaussianBlur stdDeviation="70" />
							</filter>
							<mask id={`${id}-m`}>
								<rect x={-300} y={-300} width={1700} height={2500} fill="#fff" />
								<g filter={`url(#${id}-b)`}>
									{spots.map(([sx, sy, r], i) => (
										<circle key={i} cx={sx} cy={sy} r={r} fill="#000" />
									))}
								</g>
							</mask>
						</defs>
						<rect x={-300} y={-300} width={1700} height={2500} fill="#0b0a18" opacity={dark} mask={`url(#${id}-m)`} />
						<g filter={`url(#${id}-b)`} style={{mixBlendMode: 'screen'}}>
							{spots.map(([sx, sy, r], i) => (
								<circle key={i} cx={sx} cy={sy} r={r * 0.55} fill={glow} opacity={0.3} />
							))}
						</g>
					</svg>
				) : null}
			</div>
		</AbsoluteFill>
	);
};
const VPaper: React.FC = () => (
	<AbsoluteFill style={{pointerEvents: 'none'}}>
		<svg width={W} height={H} style={{position: 'absolute', inset: 0, mixBlendMode: 'multiply', opacity: 0.35}}>
			<filter id="vpaper-n">
				<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={4} />
				<feColorMatrix values="0 0 0 0 0.85  0 0 0 0 0.8  0 0 0 0 0.72  0 0 0 0.55 0" />
			</filter>
			<rect width={W} height={H} filter="url(#vpaper-n)" />
		</svg>
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(5,4,12,0.55) 100%)'}} />
	</AbsoluteFill>
);
const VFelt: React.FC<{children: React.ReactNode}> = ({children}) => (
	<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #2f6a4a 0%, #1d4a32 70%, #0f2a1c 100%)'}}>
		<svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{position: 'absolute', inset: 0}}>
			{children}
		</svg>
	</AbsoluteFill>
);
const VSheet: React.FC<{x: number; y: number; w: number; h: number; rot?: number; k?: number; children?: React.ReactNode}> = ({x, y, w, h, rot = 0, k = 1, children}) => (
	<g transform={`translate(${x},${y}) rotate(${rot}) scale(${0.7 + 0.3 * Math.min(k, 1.1)})`} opacity={Math.min(1, k * 2)}>
		<rect x={-w / 2 + 10} y={-h / 2 + 14} width={w} height={h} fill="#000" opacity={0.3} />
		<rect x={-w / 2} y={-h / 2} width={w} height={h} fill="#f4efe2" stroke={INK} strokeWidth={4} />
		{children}
	</g>
);

/* ------------------------------------------------------------------ props */
const Germ: React.FC<{x: number; y: number; t: number; s?: number}> = ({x, y, t, s = 1}) => (
	<g transform={`translate(${x},${y}) scale(${s}) rotate(${Math.sin(t / 5) * 15})`}>
		{[0, 1, 2, 3, 4, 5].map((i) => (
			<line key={i} x1={0} y1={0} x2={Math.cos(i + t / 9) * 26} y2={Math.sin(i + t / 9) * 26} stroke="#3a7a2a" strokeWidth={4} strokeLinecap="round" />
		))}
		<ellipse rx={18} ry={14} fill="#8ad04a" stroke={INK} strokeWidth={3.5} />
		<circle cx={-6} cy={-3} r={3.5} fill={INK} />
		<circle cx={6} cy={-3} r={3.5} fill={INK} />
		<path d="M-6,6 Q0,2 6,6" stroke={INK} strokeWidth={2.5} fill="none" />
	</g>
);
const Bowl: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<circle cx={-10} cy={-22} r={18} fill="#f6dca8" stroke={INK} strokeWidth={3.5} />
		<circle cx={12} cy={-20} r={16} fill="#f8c890" stroke={INK} strokeWidth={3.5} />
		<path d="M4,-34 q6,-4 10,0" stroke="#e8805a" strokeWidth={5} fill="none" />
		<path d="M-38,-10 L38,-10 Q32,18 0,20 Q-32,18 -38,-10 Z" fill="#dfe9f0" stroke={INK} strokeWidth={4} />
	</g>
);
const Fork: React.FC<{x: number; y: number; rot: number}> = ({x, y, rot}) => (
	<g transform={`translate(${x},${y}) rotate(${rot})`}>
		<rect x={-6} y={-6} width={46} height={12} rx={4} fill="#6a4a2a" stroke={INK} strokeWidth={3} />
		<path d="M40,-3 L90,-3 M40,3 L90,9 M40,-3 L90,-15" stroke="#c8ccd6" strokeWidth={5} strokeLinecap="round" />
	</g>
);
const Jar: React.FC<{x: number; y: number}> = ({x, y}) => (
	<g transform={`translate(${x},${y})`}>
		<rect x={-16} y={-40} width={32} height={42} rx={6} fill="#dff0fa" fillOpacity={0.8} stroke={INK} strokeWidth={3.5} />
		<rect x={-18} y={-48} width={36} height={10} rx={3} fill="#8a90a0" stroke={INK} strokeWidth={3} />
	</g>
);
const Thermo: React.FC<{x: number; y: number; rot?: number}> = ({x, y, rot = -20}) => (
	<g transform={`translate(${x},${y}) rotate(${rot})`}>
		<rect x={0} y={-4} width={44} height={8} rx={4} fill="#f4f4f0" stroke={INK} strokeWidth={2.5} />
		<rect x={4} y={-1.5} width={30} height={3} fill="#d23b3b" />
	</g>
);
const Suitcase: React.FC<{x: number; y: number}> = ({x, y}) => (
	<g transform={`translate(${x},${y})`}>
		<rect x={-50} y={0} width={100} height={70} rx={8} fill="#7a4e2a" stroke={INK} strokeWidth={4} />
		<path d="M-18,0 L-18,-12 L18,-12 L18,0" stroke={INK} strokeWidth={4} fill="none" />
	</g>
);
const Ladle: React.FC<{x: number; y: number; rot: number}> = ({x, y, rot}) => (
	<g transform={`translate(${x},${y}) rotate(${rot})`}>
		<line x1={0} y1={0} x2={0} y2={110} stroke="#8a90a0" strokeWidth={8} strokeLinecap="round" />
		<path d="M-22,104 Q0,140 22,104 Z" fill="#c8ccd6" stroke={INK} strokeWidth={3.5} />
	</g>
);
const NameBadge: React.FC<{x: number; y: number; text: string; crossed?: number}> = ({x, y, text, crossed = 0}) => (
	<g transform={`translate(${x},${y}) rotate(-4)`}>
		<rect x={-58} y={-18} width={116} height={36} rx={4} fill="#fbf8ef" stroke={INK} strokeWidth={3} />
		<text y={9} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={26} fill={INK}>
			{text}
		</text>
		{crossed > 0 ? <line x1={-52} y1={2} x2={-52 + 104 * crossed} y2={-2} stroke="#d23b3b" strokeWidth={5} /> : null}
	</g>
);

/* ------------------------------------------------------------------ scenes */
const KIT_SPOTS: [number, number, number][] = [[Q(250, 300)[0], Q(250, 300)[1], 330], [Q(620, 640)[0], Q(620, 640)[1], 200]];
const MARY_X = 640;

/* 001 New York, 1906: the best cook in town — with a deadly secret */
const S001: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const secret = w('001', 0.62);
	const bowl = hp(MARY_X, FLOOR, [100, -170], -1);
	return (
		<>
			<VStage bg="bg/kitchen.jpg" a={{x: 540, y: 1100, z: 1.0}} b={{x: 600, y: 1250, z: 1.12}} spots={KIT_SPOTS} dark={0.2} glow="#ffd88a">
				<Toon id="mary1" r={CAST.mary} x={MARY_X} y={FLOOR} s={SV} facing={-1} t={gf} pose={{hand: [100, -170], handB: f > secret ? [-60, -200] : [-72, -86], head: Math.sin(f / 9) * 3}} face={{look: [0.6, -0.2], mouth: f > secret ? 'smile' : 'grin', brows: 'up', lids: f > secret ? 'sly' : undefined}} />
				<Bowl x={bowl[0]} y={bowl[1]} s={1.3} />
				{[0, 1, 2].map((i) => (f > secret + i * 6 ? <Germ key={i} x={bowl[0] + [-70, 20, 90][i] + Math.sin(f / 7 + i) * 10} y={bowl[1] - 90 - i * 30 + Math.cos(f / 8 + i) * 10} t={gf + i * 13} s={Math.min(1.1, snap(f, secret + i * 6))} /> : null))}
			</VStage>
			<VPaper />
			<Tag f={f} t={6} x={60} y={200} sub="1906" text="NEW YORK" size={64} />
			<Tag f={f} t={w('001', 0.3)} x={60} y={330} text="THE BEST COOK" size={56} />
		</>
	);
};

/* 002 wherever she cooks, people get typhoid */
const S002: React.FC = () => {
	const {f} = useShot();
	return (
		<>
			<VFelt>
				{[0, 1, 2].map((i) => {
					const t0 = 2 + i * 16;
					if (f < t0) return null;
					const x = [330, 750, 540][i];
					const y = [560, 900, 1300][i];
					return (
						<g key={i}>
							<VSheet x={x} y={y} w={360} h={300} rot={[-6, 5, -2][i]} k={snap(f, t0)}>
								<path d="M-110,40 L-110,-40 L0,-110 L110,-40 L110,40 Z" fill="#c89a6a" stroke={INK} strokeWidth={4} />
								<rect x={-30} y={-10} width={60} height={50} fill="#6a4a2a" stroke={INK} strokeWidth={3} />
								<rect x={-90} y={-30} width={40} height={36} fill="#ffe8a8" stroke={INK} strokeWidth={3} />
								<rect x={50} y={-30} width={40} height={36} fill="#ffe8a8" stroke={INK} strokeWidth={3} />
								<text y={110} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={40} fill={INK}>
									{['house 1', 'house 2', 'house 3'][i]}
								</text>
							</VSheet>
							<Stamp f={f} t={t0 + 6} x={x} y={y} text="TYPHOID" rot={-14} size={58} />
						</g>
					);
				})}
			</VFelt>
			<VPaper />
		</>
	);
};

/* 003 a banker's summer house: six of eleven fall sick */
const S003: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const sick = w('003', 0.35);
	const fam: {r: Recipe; x: number}[] = [
		{r: CAST.wife, x: 260},
		{r: CAST.banker, x: 560},
		{r: CAST.girl, x: 840},
	];
	return (
		<>
			<VStage bg="bg/dining.jpg" a={{x: 540, y: 1150, z: 1.0}} b={{x: 540, y: 1300, z: 1.1}}>
				{fam.map((p, i) => {
					const on = f > sick + i * 5;
					const sway = on ? Math.sin(f / 6 + i) * 5 : 0;
					const pos = hp(p.x, FLOOR, on ? [40, -200] : [90, -160], i === 2 ? -1 : 1);
					return (
						<g key={i}>
							<Toon id={`fam${i}`} r={on ? {...p.r, skin: mixHex(p.r.skin, '#b8d8a0', 0.55)} : p.r} x={p.x} y={FLOOR} s={SV} facing={i === 2 ? -1 : 1} t={gf + i * 9} pose={on ? {hand: [40, -230], handB: [-40, -140], head: sway, lean: sway} : {hand: [90, -160], handB: [-60, -110]}} face={{look: [0.7, -0.1], mouth: on ? 'frown' : 'grin', brows: on ? 'worried' : 'up', sweat: on, lids: on ? 'sleepy' : undefined}} />
							{!on ? <Bowl x={pos[0]} y={pos[1]} s={0.8} /> : <Thermo x={p.x + (i === 2 ? -1 : 1) * 30} y={FLOOR - 205 * SV * (p.r.height ?? 1)} rot={i === 2 ? 200 : -20} />}
						</g>
					);
				})}
			</VStage>
			<VPaper />
			<Tag f={f} t={4} x={60} y={200} sub="summer 1906" text="LONG ISLAND" size={60} until={sick} />
			<Tag f={f} t={sick + 8} x={60} y={200} text="6 OF 11 SICK" size={64} />
		</>
	);
};

/* 004 an investigator, George Soper, tracks down her old jobs */
const STREET_SPOTS: [number, number, number][] = [[Q(600, 460)[0], Q(600, 460)[1], 220]];
const S004: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const inn = walk(f, 0, 30, -150, 460);
	const read = w('004', 0.55);
	const book = hp(inn.x, FLOOR - inn.bob, [90, -170]);
	return (
		<>
			<VStage bg="bg/street.jpg" a={{x: 540, y: 1150, z: 1.0}} b={{x: 520, y: 1300, z: 1.12}} spots={STREET_SPOTS} dark={0.15} glow="#ffe2a8">
				<Toon id="soper4" r={CAST.soper} x={inn.x} y={FLOOR - inn.bob} s={SV} facing={1} t={gf} pose={inn.step ? {step: inn.step, hand: [90, -170], handB: [-44, -110]} : {hand: [90, -170], handB: f > read ? [60, -150] : [-72, -86], head: 6}} face={{look: [0.5, 0.6], mouth: f > read ? 'o' : 'closed', brows: f > read ? 'up' : 'down', lids: f > read ? undefined : 'sly'}} />
				<g transform={`translate(${book[0]},${book[1]}) rotate(-8)`}>
					<rect x={-10} y={-50} width={80} height={60} fill="#f4efe2" stroke={INK} strokeWidth={3.5} />
					{[0, 1, 2].map((i) => (
						<line key={i} x1={0} y1={-36 + i * 14} x2={60} y2={-36 + i * 14} stroke="#8a8070" strokeWidth={3} />
					))}
				</g>
				<Icon kind="question" x={inn.x + 10} y={FLOOR - 390 * SV} f={f} t={34} s={0.9} out={read} />
				<Icon kind="bulb" x={inn.x + 10} y={FLOOR - 390 * SV} f={f} t={read + 4} s={0.9} />
			</VStage>
			<VPaper />
			<Tag f={f} t={10} x={60} y={200} sub="investigator" text="GEORGE SOPER" size={60} />
		</>
	);
};

/* 005 "Seven families. Twenty-two cases. One cook." */
const S005: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const cases = w('005', 0.4);
	const cook = w('005', 0.72);
	return (
		<>
			<VFelt>
				<VSheet x={540} y={760} w={760} h={900} rot={-3} k={snap(f, 2)}>
					<text x={-330} y={-370} fontFamily={FONT} fontWeight={900} fontSize={40} fill={INK}>
						MARY'S OLD JOBS
					</text>
					{Array.from({length: 7}).map((_, i) => (
						<g key={i}>
							<text x={-330} y={-280 + i * 90} fontFamily={HAND} fontWeight={700} fontSize={46} fill="#2a4a8a">
								{['Mamaroneck', 'Manhattan', 'Dark Harbor', 'Sands Point', 'Oyster Bay', 'Tuxedo Park', 'Park Avenue'][i]}
							</text>
							{f > 6 + i * 3 ? <path d={`M180,${-300 + i * 90} l22,22 l40,-46`} stroke="#d23b3b" strokeWidth={8} fill="none" /> : null}
						</g>
					))}
				</VSheet>
				{f > cook ? (
					<g transform={`translate(780,1480) rotate(6) scale(${Math.min(1.1, snap(f, cook))})`}>
						<rect x={-170} y={-200} width={340} height={400} fill="#f6f3ea" stroke={INK} strokeWidth={4} />
						<rect x={-150} y={-180} width={300} height={290} fill="#8a7a6a" />
						<Toon id="pol5" r={CAST.mary} x={0} y={230} s={1.15} t={gf} pose={{hand: [60, -110], handB: [-60, -110]}} face={{look: [0.2, -0.1], mouth: 'smile', brows: 'up'}} />
						<rect x={-170} y={110} width={340} height={90} fill="#f6f3ea" />
						<text y={170} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={48} fill={INK}>
							one cook
						</text>
					</g>
				) : null}
			</VFelt>
			<VPaper />
			<Tag f={f} t={6} x={60} y={130} text="7 FAMILIES" size={60} />
			{f > cases && f < cook ? <BigNumber f={f} t={cases} text="22" sub="cases" y={1250} /> : null}
		</>
	);
};

/* 006–007 "Miss Mallon, I'll need samples." — "Get out of my kitchen!" */
const S006: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const soT = talk('SOPER', gf);
	const maT = talk('MARY', gf);
	const jar = w('006', 0.5);
	const mad = w('007', 0);
	const fork = snap(f, mad + 4);
	const SX = 340;
	const jp = hp(SX, FLOOR, [100, -200]);
	const fp = hp(MARY_X + 60, FLOOR, [110, -260], -1);
	return (
		<>
			<VStage bg="bg/kitchen.jpg" a={{x: 520, y: 1300, z: 1.12}} b={{x: 540, y: 1330, z: 1.2}} spots={KIT_SPOTS} dark={0.2} glow="#ffd88a">
				<Toon id="soper6" r={CAST.soperBare} x={SX} y={FLOOR} s={SV} facing={1} t={gf} pose={f > jar ? {hand: [100, -200], handB: [-40, -150]} : {hand: [40, -170], handB: [-40, -150], head: -6}} face={{look: [0.8, -0.1], mouth: f > mad ? 'o' : 'smile', brows: f > mad ? 'worried' : 'up', sweat: f > mad, talk: soT}} />
				{/* his bowler held to the chest */}
				<g transform={`translate(${hp(SX, FLOOR, [-40, -150])[0]},${hp(SX, FLOOR, [-40, -150])[1]})`}>
					<ellipse rx={50} ry={10} fill="#3a3030" stroke={INK} strokeWidth={4} />
					<path d="M-34,-4 Q-34,-50 0,-50 Q34,-50 34,-4 Z" fill="#3a3030" stroke={INK} strokeWidth={4} />
				</g>
				{f > jar ? <Jar x={jp[0]} y={jp[1]} /> : null}
				<Toon id="mary6" r={f > mad ? {...CAST.mary, skin: '#f4b8a0'} : CAST.mary} x={MARY_X + 60} y={FLOOR} s={SV} facing={-1} t={gf} pose={f > mad ? {hand: mixP([60, -150], [110, -260], Math.min(fork, 1.1)), handB: [-72, -86], lean: -6} : {hand: [60, -150], handB: [-72, -86]}} face={{look: [0.8, -0.1], mouth: f > mad ? 'wide' : f > jar ? 'o' : 'closed', brows: f > mad ? 'down' : f > jar ? 'up' : 'flat', talk: maT}} />
				{f > mad ? <Fork x={fp[0]} y={fp[1]} rot={-120} /> : null}
			</VStage>
			<VPaper />
			<Tag f={f} t={jar + 4} x={60} y={200} text={'"SAMPLES"'} size={60} until={mad} />
			<Tag f={f} t={mad + 4} x={60} y={200} text="GET OUT!" size={70} c="#ff8a7a" />
		</>
	);
};

/* 008 she chases him out with a carving fork */
const S008: React.FC = () => {
	const {f, gf} = useShot();
	const run = kk(f, 0, 40);
	const sx = 380 - 700 * run;
	const mx = 760 - 620 * kk(f, 6, 52);
	const hatFall = kk(f, 8, 18);
	const st = Math.sin(f * 1.3);
	const fp = hp(mx, FLOOR - Math.abs(st) * 10, [110, -270], -1);
	return (
		<>
			<VStage bg="bg/kitchen.jpg" a={{x: 540, y: 1200, z: 1.02}} b={{x: 480, y: 1240, z: 1.06}} spots={KIT_SPOTS} dark={0.2} glow="#ffd88a">
				{/* Soper's hat falls and stays on the floor */}
				<g transform={`translate(${430 - 40 * hatFall},${FLOOR - 470 + (470 - 18) * hatFall * hatFall}) rotate(${200 * hatFall})`}>
					<ellipse rx={50} ry={10} fill="#3a3030" stroke={INK} strokeWidth={4} />
					<path d="M-34,-4 Q-34,-50 0,-50 Q34,-50 34,-4 Z" fill="#3a3030" stroke={INK} strokeWidth={4} />
				</g>
				{run < 1 ? <Toon id="soper8" r={CAST.soperBare} x={sx} y={FLOOR - Math.abs(st) * 10} s={SV} facing={-1} t={gf} pose={{step: st, hand: [80, -260], handB: [-90, -240], lean: 14}} face={{look: [-0.9, -0.1], turn: -0.6, mouth: 'o', brows: 'worried', sweat: true}} /> : null}
				<Toon id="mary8" r={{...CAST.mary, skin: '#f4b8a0'}} x={mx} y={FLOOR - Math.abs(st) * 10} s={SV} facing={-1} t={gf} pose={{step: -st, hand: [110, -270], handB: [-80, -150], lean: 10}} face={{look: [0.9, -0.1], mouth: 'wide', brows: 'down'}} />
				<Fork x={fp[0]} y={fp[1]} rot={-150 + Math.sin(f / 2) * 20} />
				{[0, 1, 2].map((j) => (
					<line key={j} x1={mx + 140 + j * 30} y1={FLOOR - 300 + j * 80} x2={mx + 260 + j * 40} y2={FLOOR - 300 + j * 80} stroke="#f4efe2" strokeWidth={6} strokeLinecap="round" opacity={0.6} />
				))}
			</VStage>
			<VPaper />
			<Tag f={f} t={10} x={60} y={200} text="A CARVING FORK" size={60} />
		</>
	);
};

/* 009 the police come; Mary hides for five hours */
const Clock: React.FC<{x: number; y: number; f: number; t0: number}> = ({x, y, f, t0}) => {
	const a = Math.max(0, f - t0) * 0.5;
	return (
		<g transform={`translate(${x},${y})`}>
			<circle r={80} fill="#f4efe2" stroke={INK} strokeWidth={6} />
			{Array.from({length: 12}).map((_, i) => (
				<line key={i} x1={Math.cos((i * Math.PI) / 6) * 64} y1={Math.sin((i * Math.PI) / 6) * 64} x2={Math.cos((i * Math.PI) / 6) * 72} y2={Math.sin((i * Math.PI) / 6) * 72} stroke={INK} strokeWidth={4} />
			))}
			<line x1={0} y1={0} x2={52 * Math.sin(a)} y2={-52 * Math.cos(a)} stroke={INK} strokeWidth={5} strokeLinecap="round" />
			<line x1={0} y1={0} x2={34 * Math.sin(a / 12)} y2={-34 * Math.cos(a / 12)} stroke={INK} strokeWidth={8} strokeLinecap="round" />
		</g>
	);
};
const S009: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const hide = w('009', 0.45);
	const c1 = walk(f, 0, 24, 1250, 760);
	const c2 = walk(f, 4, 30, 1400, 420);
	const peek = f > hide ? Math.max(0, Math.sin((f - hide) / 6)) : 0;
	const [tx, ty] = Q(445, 795);
	return (
		<>
			<VStage bg="bg/street.jpg" a={{x: 540, y: 1250, z: 1.04}} b={{x: 560, y: 1150, z: 1.14}} spots={STREET_SPOTS} dark={0.15} glow="#ffe2a8">
				{/* Mary peeks out from behind the trash cans by the fence */}
				<g>
					<Toon id="mary9" r={CAST.mary} x={tx + 20} y={ty + 40 - 50 * peek} s={0.75} facing={1} t={gf} pose={{hand: [60, -150], handB: [-60, -150]}} face={{look: [0.9, 0], mouth: 'o', brows: 'worried', sweat: true}} />
					<g transform={`translate(${tx},${ty})`}>
						<rect x={-60} y={-90} width={120} height={130} rx={6} fill="#8a8a8a" stroke={INK} strokeWidth={4} />
						<ellipse cx={0} cy={-92} rx={66} ry={14} fill="#9a9a9a" stroke={INK} strokeWidth={4} />
						<line x1={-50} y1={-50} x2={50} y2={-50} stroke={INK} strokeWidth={3} />
						<line x1={-50} y1={0} x2={50} y2={0} stroke={INK} strokeWidth={3} />
					</g>
				</g>
				<Toon id="cop9a" r={CAST.cop} x={c1.x} y={FLOOR - c1.bob} s={SV} facing={-1} t={gf} pose={c1.step ? {step: c1.step, hand: [44, -110], handB: [-44, -110]} : {hand: [80, -260], handB: [-72, -86]}} face={{look: [0.6, -0.4], mouth: 'frown', brows: 'down'}} />
				<Toon id="cop9b" r={CAST.cop2} x={c2.x} y={FLOOR + 40 - c2.bob} s={SV} facing={-1} t={gf + 7} pose={c2.step ? {step: c2.step, hand: [44, -110], handB: [-44, -110]} : {hand: [60, -230], handB: [-72, -86]}} face={{look: [-0.8, -0.1], turn: -0.6, mouth: 'o', brows: 'up'}} />
				<Icon kind="question" x={c1.x} y={FLOOR - 420 * SV} f={f} t={28} s={0.9} />
				<Icon kind="question" x={c2.x} y={FLOOR + 40 - 420 * SV} f={f} t={34} s={0.9} />
			</VStage>
			<VPaper />
			<Tag f={f} t={4} x={60} y={200} text="POLICE" size={64} until={hide} />
			{f > hide ? (
				<svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{position: 'absolute', inset: 0}}>
					<g transform={`translate(860,330) scale(${Math.min(1.1, snap(f, hide))})`}>
						<Clock x={0} y={0} f={f} t0={hide} />
					</g>
				</svg>
			) : null}
			<Tag f={f} t={hide + 4} x={60} y={200} text="HIDES: 5 HOURS" size={60} />
		</>
	);
};

/* 010–011 the lab: full of typhoid germs; "I've never been sick a day in my life!" */
const LAB_SPOTS: [number, number, number][] = [[Q(620, 220)[0], Q(620, 220)[1], 320], [Q(40, 250)[0], Q(40, 250)[1], 160]];
const S010: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const lens = w('010', 0.35);
	const mary = w('011', 0);
	const maT = talk('MARY', gf);
	const tube = hp(420, FLOOR, [90, -280]);
	return (
		<>
			<VStage bg="bg/lab.jpg" a={{x: 540, y: 1250, z: 1.04}} b={{x: 560, y: 1300, z: 1.12}} spots={LAB_SPOTS} dark={0.3} glow="#dfefff">
				<Toon id="doc10" r={CAST.labdoc} x={420} y={FLOOR} s={SV} facing={1} t={gf} pose={f > mary ? {hand: [120, -170], handB: [-120, -170]} : {hand: [90, -280], handB: [-72, -86]}} face={{look: f > mary ? [0.8, -0.1] : [0.4, -0.6], mouth: f > mary ? 'smirk' : 'o', brows: 'up'}} />
				{f <= mary ? (
					<g transform={`translate(${tube[0]},${tube[1]}) rotate(10)`}>
						<rect x={-10} y={-70} width={20} height={80} rx={10} fill="#dff0fa" fillOpacity={0.8} stroke={INK} strokeWidth={3.5} />
						<rect x={-8} y={-30} width={16} height={36} rx={8} fill="#c8a870" />
					</g>
				) : null}
				{f > mary ? <Toon id="mary11" r={{...CAST.mary, skin: '#f4b8a0'}} x={800} y={FLOOR} s={SV} facing={-1} t={gf} pose={{hand: [120, -250 + Math.sin(f / 2) * 12], handB: [-72, -86], lean: -6, head: Math.sin(f / 3) * 5}} face={{look: [0.8, -0.1], mouth: 'wide', brows: 'down', talk: maT}} /> : null}
			</VStage>
			<VPaper />
			{f > lens && f < mary ? (
				<svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{position: 'absolute', inset: 0}}>
					<g transform={`translate(560,560) scale(${Math.min(1.1, snap(f, lens))})`}>
						<circle r={300} fill="#eaf4e0" stroke={INK} strokeWidth={14} />
						<clipPath id="lensc">
							<circle r={292} />
						</clipPath>
						<g clipPath="url(#lensc)">
							{Array.from({length: 11}).map((_, i) => (
								<Germ key={i} x={Math.cos(i * 2.4) * (60 + i * 20) + Math.sin(gf / 9 + i) * 14} y={Math.sin(i * 2.4) * (60 + i * 20) + Math.cos(gf / 8 + i) * 14} t={gf + i * 7} s={1.6} />
							))}
						</g>
					</g>
				</svg>
			) : null}
			<Tag f={f} t={6} x={60} y={200} text="THE TESTS" size={64} until={lens} />
			<Tag f={f} t={lens + 6} x={60} y={1000} text="TYPHOID" box="check" size={60} until={mary} />
			<Tag f={f} t={mary + 6} x={60} y={200} text={'"NEVER SICK!"'} size={64} />
		</>
	);
};

/* 012 true: a healthy carrier, the first one found in America */
const S012: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const carrier = w('012', 0.18);
	const first = w('012', 0.58);
	return (
		<>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 62%, #3a4a3a 0%, #121814 75%)'}}>
				<svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{position: 'absolute', inset: 0}}>
					<ellipse cx={540} cy={1640} rx={360} ry={60} fill="#fff" opacity={0.08} />
					<Toon id="mary12" r={CAST.mary} x={540} y={1620} s={SV * 1.15} t={gf} pose={{hand: [80, -330], handB: [-72, -86]}} face={{look: [0.2, -0.2], mouth: 'grin', brows: 'up'}} />
					{f > carrier
						? Array.from({length: 7}).map((_, i) => {
								const a = (gf / 30) * 1.2 + (i / 7) * Math.PI * 2;
								return <Germ key={i} x={540 + Math.cos(a) * 330} y={1180 + Math.sin(a) * 120} t={gf + i * 9} s={Math.min(1.2, snap(f, carrier + i * 2) * 1.2)} />;
							})
						: null}
				</svg>
			</AbsoluteFill>
			<VPaper />
			<Tag f={f} t={4} x={60} y={200} text="HEALTHY" box="check" size={64} />
			<Tag f={f} t={carrier + 4} x={60} y={310} text="CARRIER" box="check" size={64} />
			<Tag f={f} t={first + 2} x={60} y={420} sub="in America" text="THE FIRST ONE" size={56} />
		</>
	);
};

/* 013 the papers call her Typhoid Mary; they lock her on an island */
const S013: React.FC = () => {
	const {f} = useShot();
	const k = Math.min(1, f / 12);
	return (
		<>
			<VFelt>
				<g transform={`translate(540,900) rotate(${(1 - k) * 720 - 4}) scale(${0.2 + 0.8 * k})`}>
					<rect x={-440} y={-560} width={880} height={1120} fill="#000" opacity={0.3} transform="translate(14,16)" />
					<rect x={-440} y={-560} width={880} height={1120} fill="#f1ecdc" stroke={INK} strokeWidth={6} />
					<text y={-470} textAnchor="middle" fontFamily="Georgia, serif" fontWeight={900} fontSize={52} fill={INK}>
						THE NEW YORK AMERICAN
					</text>
					<line x1={-400} y1={-440} x2={400} y2={-440} stroke={INK} strokeWidth={5} />
					<text y={-330} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={110} fill="#8a1e22">
						TYPHOID
					</text>
					<text y={-210} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={110} fill="#8a1e22">
						MARY
					</text>
					<rect x={-400} y={-150} width={380} height={460} fill="#a8a090" stroke={INK} strokeWidth={4} />
					<circle cx={-210} cy={40} r={120} fill="#f1d0ae" stroke={INK} strokeWidth={5} />
					<path d="M-330,60 Q-340,-90 -210,-94 Q-80,-90 -90,60 Q-110,-20 -210,-30 Q-310,-20 -330,60 Z" fill="#6a4030" stroke={INK} strokeWidth={4} />
					<circle cx={-250} cy={40} r={10} fill={INK} />
					<circle cx={-170} cy={40} r={10} fill={INK} />
					<path d="M-250,100 Q-210,80 -170,100" stroke={INK} strokeWidth={6} fill="none" />
					{Array.from({length: 9}).map((_, j) => (
						<line key={j} x1={20} y1={-130 + j * 52} x2={400} y2={-130 + j * 52} stroke="#8a8070" strokeWidth={12} />
					))}
				</g>
			</VFelt>
			<VPaper />
		</>
	);
};
const ISL_SPOTS: [number, number, number][] = [[Q(480, 790)[0], Q(480, 790)[1], 140]];
const S013b: React.FC = () => {
	const {f, gf} = useShot();
	const leave = walk(f, 14, 50, 640, 1300);
	return (
		<>
			<VStage bg="bg/island.jpg" a={{x: 540, y: 1250, z: 1.04}} b={{x: 560, y: 1200, z: 1.12}} spots={ISL_SPOTS} dark={0.12} glow="#ffcf7a">
				<Toon id="mary13" r={CAST.mary} x={360} y={FLOOR} s={SV} facing={1} t={gf} pose={{hand: [40, -150], handB: [-40, -150], head: 6}} face={{look: [0.8, 0], mouth: 'frown', brows: 'worried', lids: f > 30 ? 'sleepy' : undefined}} />
				{leave.x < 1250 ? <Toon id="cop13" r={CAST.cop} x={leave.x} y={FLOOR + 30 - leave.bob} s={SV} facing={1} t={gf} pose={leave.step ? {step: leave.step, hand: [44, -110], handB: [-44, -110]} : {hand: [-60, -160], handB: [-72, -86]}} face={{look: [-0.6, -0.1], turn: -0.6, mouth: 'frown', brows: 'flat'}} /> : null}
			</VStage>
			<VPaper />
			<Tag f={f} t={6} x={60} y={200} sub="East River" text="NORTH BROTHER ISLAND" size={52} />
		</>
	);
};

/* 014 three years later: freed — no more cooking (a signed promise) */
const S014: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const walkT = w('014', 0.45);
	if (f < walkT) {
		const sign = kk(f, 26, 46);
		return (
			<>
				<VFelt>
					<VSheet x={540} y={900} w={800} h={1000} rot={-2} k={snap(f, 2)}>
						<text y={-380} textAnchor="middle" fontFamily="Georgia, serif" fontWeight={900} fontSize={54} fill={INK}>
							RELEASE, 1910
						</text>
						<text y={-240} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={58} fill="#2a4a8a">
							I promise
						</text>
						<text y={-160} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={58} fill="#2a4a8a">
							never to work
						</text>
						<text y={-80} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={58} fill="#2a4a8a">
							as a cook.
						</text>
						<line x1={-300} y1={260} x2={300} y2={260} stroke={INK} strokeWidth={3} />
						<path d="M-260,240 q30,-60 60,-10 t60,-10 t60,10 t70,-20 t60,10" stroke="#2a2a6a" strokeWidth={6} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - sign} />
						<text x={-300} y={310} fontFamily={HAND} fontWeight={700} fontSize={36} fill="#6a6050">
							Mary Mallon
						</text>
					</VSheet>
					<Stamp f={f} t={walkT - 10} x={700} y={1250} text="FREED" rot={-12} size={80} />
				</VFelt>
				<VPaper />
			</>
		);
	}
	const go = walk(f, walkT + 2, w('014', 1) + 8, 260, 860);
	const sp = hp(go.x, FLOOR - go.bob, [70, -80]);
	return (
		<>
			<VStage bg="bg/street.jpg" a={{x: 540, y: 1300, z: 1.06}} b={{x: 600, y: 1300, z: 1.12}} spots={STREET_SPOTS} dark={0.15} glow="#ffe2a8">
				<Toon id="mary14" r={CAST.mary} x={go.x} y={FLOOR - go.bob} s={SV} facing={1} t={gf} pose={{step: go.step, hand: [70, -80], handB: [-44, -110]}} face={{look: [0.8, -0.1], mouth: 'smirk', brows: 'sly', lids: 'sly'}} />
				<Suitcase x={sp[0] + 40} y={sp[1] - 10} />
			</VStage>
			<VPaper />
			<Tag f={f} t={walkT + 6} x={60} y={200} text="NO MORE COOKING" box="cross" size={56} />
		</>
	);
};

/* 015 she becomes Mary Brown, a cook at a maternity hospital */
const HK_SPOTS: [number, number, number][] = [[Q(390, 170)[0], Q(390, 170)[1], 260], [Q(700, 180)[0], Q(700, 180)[1], 220]];
const S015: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const brown = w('015', 0.08);
	const cook = w('015', 0.4);
	const hosp = w('015', 0.7);
	const stir = Math.sin(f / 4);
	const MX = 560;
	const lp = hp(MX, FLOOR, [110 + 20 * stir, -200], -1);
	const badgeAt = hp(MX, FLOOR, [-10, -150], -1);
	const crossed = kk(f, brown + 4, brown + 12);
	return (
		<>
			<VStage bg="bg/hkitchen.jpg" a={{x: 540, y: 1250, z: 1.08}} b={{x: 520, y: 1300, z: 1.16}} spots={HK_SPOTS} dark={0.2} glow="#fff0c8">
				{/* a big pot at her side */}
				<g transform={`translate(${MX - 260},${FLOOR - 20})`}>
					<rect x={-110} y={-200} width={220} height={200} rx={14} fill="#a8b0bc" stroke={INK} strokeWidth={5} />
					<ellipse cx={0} cy={-200} rx={112} ry={22} fill="#d8c090" stroke={INK} strokeWidth={5} />
					{[0, 1, 2].map((i) => (
						<path key={i} d={`M${-40 + i * 40},-230 q-14,-30 0,-60`} stroke="#f4efe2" strokeWidth={6} fill="none" opacity={0.5 + 0.4 * Math.sin(f / 5 + i)} />
					))}
				</g>
				<Toon id="mary15" r={CAST.mary} x={MX} y={FLOOR} s={SV} facing={-1} t={gf} pose={f > cook ? {hand: [110 + 20 * stir, -200], handB: [-72, -86], lean: -4} : {hand: [60, -150], handB: [-72, -86]}} face={{look: [0.6, -0.1], mouth: f > hosp ? 'grin' : 'smirk', brows: 'sly', lids: 'sly'}} />
				{f > cook ? <Ladle x={lp[0]} y={lp[1]} rot={60 + 10 * stir} /> : null}
				<NameBadge x={badgeAt[0]} y={badgeAt[1]} text={f > brown + 14 ? 'Mary Brown' : 'Mary Mallon'} crossed={f > brown + 14 ? 0 : crossed} />
			</VStage>
			<VPaper />
			<Tag f={f} t={brown + 16} x={60} y={200} sub="new name" text="MARY BROWN" size={60} />
			<Tag f={f} t={cook + 4} x={60} y={330} text="A COOK" box="check" size={56} />
			<Tag f={f} t={hosp + 2} x={60} y={440} sub="1915" text="MATERNITY HOSPITAL" size={52} />
		</>
	);
};

/* 016 twenty-five people get sick */
const S016: React.FC = () => {
	const {f, gf} = useShot();
	return (
		<>
			<VStage bg="bg/hkitchen.jpg" a={{x: 540, y: 1300, z: 1.1}} b={{x: 540, y: 1280, z: 1.16}} dim={0.35}>
				{[0, 1].map((i) => (
					<Toon key={i} id={`nur${i}`} r={{...[CAST.nurse, CAST.nurse2][i], skin: mixHex([CAST.nurse, CAST.nurse2][i].skin, '#b8d8a0', 0.5)}} x={[340, 760][i]} y={FLOOR} s={SV} facing={i ? -1 : 1} t={gf + i * 9} pose={{hand: [40, -230], handB: [-40, -140], head: Math.sin(f / 6 + i) * 6, lean: Math.sin(f / 6 + i) * 5}} face={{look: [0.6, -0.1], mouth: 'frown', brows: 'worried', sweat: true, lids: 'sleepy'}} />
				))}
			</VStage>
			<VPaper />
			<BigNumber f={f} t={6} text="25" sub="sick" y={420} c="#ff8a7a" />
		</>
	);
};

/* 017 back to the island — twenty-three years, until she dies */
const S017: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const years = w('017', 0.32);
	const age = kk(f, years, w('017', 0.85));
	const yr = Math.round(1915 + 23 * age);
	const r: Recipe = {...CAST.mary, hairColor: mixHex('#6a4030', '#b8b2b0', age), girth: 1.15 + 0.05 * age};
	return (
		<>
			<VStage bg="bg/island.jpg" a={{x: 540, y: 1150, z: 1.0}} b={{x: 540, y: 1300, z: 1.12}} spots={ISL_SPOTS} dark={0.12 + 0.2 * age} glow="#ffcf7a">
				<Toon id="mary17" r={r} x={540} y={FLOOR} s={SV} facing={f > years && f < w('017', 0.7) ? -1 : 1} t={gf} pose={f < years ? {hand: [72, -86], handB: [-72, -86]} : f < w('017', 0.7) ? {hand: [60, -200], handB: [-40, -150], head: -6} : {hand: [40, -150], handB: [-40, -150], head: 8}} face={{look: f < years ? [0.2, -0.1] : f < w('017', 0.7) ? [0.9, -0.3] : [0.1, 0.4], mouth: f < years ? 'frown' : f < w('017', 0.7) ? 'o' : 'frown', brows: 'worried', lids: f > w('017', 0.7) ? 'sleepy' : undefined}} />
			</VStage>
			<VPaper />
			<Tag f={f} t={4} x={60} y={200} text="BACK TO THE ISLAND" size={56} />
			{f > years ? (
				<div style={{position: 'absolute', top: 330, left: 60, fontFamily: HAND, fontWeight: 700, fontSize: 110, color: '#f2c94c', textShadow: '0 6px 0 rgba(0,0,0,0.5)'}}>{yr}</div>
			) : null}
			<Tag f={f} t={w('017', 0.55)} x={60} y={500} text="23 YEARS" size={60} />
		</>
	);
};

/* ------------------------------------------------------------------ timing */
type SD = {at: string; off?: number; C: React.FC};
const Tk = (id: string, k: number) => Math.round(L(id).dur * k);
const SHOTS_V: SD[] = [
	{at: '001', C: S001},
	{at: '002', C: S002},
	{at: '003', C: S003},
	{at: '004', C: S004},
	{at: '005', C: S005},
	{at: '006', C: S006},
	{at: '008', C: S008},
	{at: '009', C: S009},
	{at: '010', C: S010},
	{at: '012', C: S012},
	{at: '013', C: S013},
	{at: '013', off: Tk('013', 0.42), C: S013b},
	{at: '014', C: S014},
	{at: '015', C: S015},
	{at: '016', C: S016},
	{at: '017', C: S017},
];
const TIMED = SHOTS_V.map((s, i) => ({...s, start: i === 0 ? 0 : L(s.at).from - LEAD + (s.off ?? 0)})).map((s, i, a) => ({...s, end: i + 1 < a.length ? a[i + 1].start : TOTAL}));
export const DAILY_FRAMES = TOTAL;
export const DAILY_SHOTS = TIMED.map((s) => ({at: s.at, start: s.start, end: s.end}));

const Host: React.FC<{s: (typeof TIMED)[number]}> = ({s}) => {
	const f = useCurrentFrame();
	const ctx = {f, gf: s.start + f, dur: s.end - s.start, start: s.start, at: (n: string) => L(n).from - s.start, end: (n: string) => L(n).from + L(n).dur - s.start};
	return (
		<ShotCtx.Provider value={ctx}>
			<AngleCtx.Provider value={{k: 0, t: f, len: ctx.dur}}>
				<s.C />
			</AngleCtx.Provider>
		</ShotCtx.Provider>
	);
};

export const Daily: React.FC<{sound?: boolean}> = ({sound = true}) => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: '#000'}}>
			{TIMED.map((s, i) => (
				<Sequence key={i} from={s.start} durationInFrames={s.end - s.start} name={`${s.at}`}>
					<Host s={s} />
				</Sequence>
			))}
			{sound ? (
				<>
					<VoiceTrack />
					<Audio src={staticFile('sfx/bed.wav')} />
				</>
			) : null}
			<AbsoluteFill style={{background: '#000', opacity: interpolate(f, [0, 5], [1, 0], {extrapolateRight: 'clamp'})}} />
		</AbsoluteFill>
	);
};
void LINES;

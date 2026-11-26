import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useShot} from '../kit/core';
import type {ShotDef} from '../kit/coverage';
import {camOn} from '../kit/kit';
import {FONT, HAND} from '../kit/ui';
import {CAST} from '../toon/cast';
import {BigNumber, Cork, Felt, Icon, P, Paper, Sheet, Stamp, Tag, mixP, snap} from '../toon/kit';
import {INK, Pose, Toon} from '../toon/Toon';
import {OR_SPOTS, Polaroid, S, T, kk, walk} from './partC1';
import {CABIN_SPOTS, CLINIC_SPOTS, CanadaMap, Forceps, Litter, Paperboard, Sc, Scalpel, Stetho, TablePatient, Typewriter, hp, lh, talk} from './c4kit';
import {useW} from './lib';

/* PART 4 (4:27–5:39): the wounded come aboard, the textbook, the chest surgery, sixteen alive,
   the legend, the press officer, the newspapers, the real Dr. Cyr in Grand Falls. */

const CREW_X = [1150, 1280, 1420, 1210, 1350];
const CREW_R = [CAST.sailor2, CAST.sailor3, CAST.sailor4, CAST.sailor3, CAST.sailor2];

/* ================================ 065–066 "Doc! They're bringing them aboard!" every eye on him ================================ */
const C065: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const run = walk(f, 0, w('065', 0.55), 2000, 1080);
	const turn = f > 10;
	const eyes = w('066', 0.05);
	const sailT = talk('SAIL', gf);
	const spot = kk(f, w('066', 0.3), w('066', 0.45));
	return (
		<>
			<Sc bg="bg/deck.jpg" a={camOn(980, 640, 1.06)} b={camOn(900, 660, 1.22)} id="l065" dim={0.45 * spot}>
				{f > eyes
					? CREW_X.slice(1).map((x, i) => (
							<Toon key={i} id={`cr65${i}`} r={CREW_R[i + 1]} x={x + 60} y={i > 1 ? 1010 : 900} s={S * 0.85} facing={-1} t={gf + i * 5} pose={{hand: [40, -120], handB: [-40, -120], lean: -4}} face={{look: [0.9, 0], mouth: i % 2 ? 'o' : 'closed', brows: 'up'}} />
						))
					: null}
				<Toon id="sail65" r={CAST.sailor} x={run.x} y={1000 - run.bob} s={S} facing={-1} t={gf} pose={run.step ? {step: run.step, hand: [90, -260], handB: [-60, -100], lean: -10} : {hand: [110, -170], handB: [-50, -110]}} face={{look: [0.9, -0.1], mouth: 'wide', brows: 'up', talk: sailT}} />
				{spot > 0 ? <ellipse cx={720} cy={1000} rx={170 * spot} ry={36 * spot} fill="#fff6c0" opacity={0.35} /> : null}
				<Toon id="fred65" r={CAST.fredNavy} x={720} y={1000} s={S} facing={turn ? 1 : -1} t={gf} pose={f > eyes ? {hand: [40, -150], handB: [-40, -150], head: -6} : turn ? {hand: [72, -86], handB: [-72, -86]} : {hand: [30, -100], handB: [-30, -100]}} face={{look: [0.8, -0.1], mouth: f > eyes ? 'smile' : turn ? 'o' : 'closed', brows: f > eyes ? 'worried' : 'up', sweat: f > w('066', 0.4)}} />
			</Sc>
			<Paper />
			<Tag f={f} t={w('065', 0.3)} x={1250} y={100} text="WOUNDED COMING" size={48} until={eyes} />
			<Tag f={f} t={w('066', 0.45)} x={70} y={100} sub="on board" text="THE ONLY SURGEON" size={52} />
		</>
	);
};

/* ================================ 067–068 "Doc, are you ready?" "Almost. Just... checking something." ================================ */
const C067: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const fredT = talk('FRED', gf);
	const sailT = talk('SAIL', gf);
	const flip = snap(f, w('068', 0.25));
	const check = w('068', 0.55);
	const FX = 980;
	const hand: [number, number] = f > check ? [70, -250] : [100, -170];
	const sp = hp(FX, 1000, hand);
	return (
		<>
			<Sc bg="bg/or.jpg" a={camOn(1150, 640, 1.12)} b={camOn(1080, 640, 1.24)} id="l067" spots={OR_SPOTS}>
				<TablePatient />
				<Toon id="sail67" r={CAST.sailor3} x={1700} y={1000} s={S} facing={-1} t={gf} pose={{hand: [60, -230], handB: [-50, -110], lean: -6}} face={{look: [0.9, -0.1], mouth: 'smile', brows: 'up', talk: sailT}} />
				<Toon id="fred67" r={CAST.fredBare} x={FX} y={1000} s={S} facing={1} t={gf} pose={{hand, handB: [-72, -86], head: f > check ? -10 : 0}} face={{look: f > check ? [0.6, -0.6] : [0.7, -0.2], mouth: fredT > 0.1 ? 'smile' : f > check ? 'o' : 'smirk', brows: 'worried', sweat: f > w('068', 0), talk: fredT}} />
				<Scalpel x={sp[0]} y={sp[1]} rot={f > check ? -70 : 180 - 180 * Math.min(flip, 1)} glint={f > check} />
				<Icon kind="question" x={FX + 10} y={1000 - 340 * S} f={f} t={w('068', 0.05)} s={0.9} out={check} />
			</Sc>
			<Paper />
			<Tag f={f} t={6} x={70} y={860} text="READY?" size={56} until={w('068', 0)} />
			<Tag f={f} t={w('068', 0.28)} x={70} y={860} text="WRONG WAY UP" box="cross" size={50} until={check} />
			<Tag f={f} t={check + 2} x={70} y={860} text={'"CHECKING SOMETHING"'} size={48} />
		</>
	);
};

/* ================================ 069 "Get them into the operating room. Prep them. I'll be right there." ================================ */
const C069: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const fredT = talk('FRED', gf);
	const prep = w('069', 0.4);
	const leave = w('069', 0.72);
	const out = walk(f, leave + 6, leave + 30, 760, 2150);
	const carry = (t0: number, a: number, b: number) => {
		const k = kk(f, t0, t0 + 70);
		return {x: 2250 - 2700 * k, step: k > 0 && k < 1 ? Math.sin(f / 3 + a) : 0, b};
	};
	const pairs = [carry(0, 0, 0), carry(22, 1, 1)];
	const pose: Pose = out.step
		? {step: out.step, hand: [44, -110], handB: [-44, -110], lean: 10}
		: f > leave
			? {hand: [90, -260], handB: [-72, -86]}
			: f > prep
				? {hand: [30, -170 + 12 * Math.abs(Math.sin(f / 2))], handB: [-10, -170 + 12 * Math.abs(Math.sin(f / 2))]}
				: {hand: [150, -210], handB: [-72, -86]};
	return (
		<>
			<Sc bg="bg/deck.jpg" a={camOn(960, 650, 1.05)} b={camOn(1000, 650, 1.12)} id="l069">
				{pairs.map((p, i) => {
					const yb = 900 + 40 * i;
					const r1 = i ? CAST.sailor4 : CAST.sailor2;
					const r2 = i ? CAST.sailor : CAST.sailor3;
					return (
						<g key={i}>
							<Toon id={`cA${i}`} r={r1} x={p.x - 250} y={yb} s={S * 0.82} facing={-1} t={gf} pose={{step: p.step, hand: [40, -96], handB: [-20, -96]}} face={{look: [0.9, 0], mouth: 'closed', brows: 'down'}} />
							<Litter x={p.x} y={yb - 92 * S * 0.82} skin={i ? '#c99a72' : '#e4c098'} />
							<Toon id={`cB${i}`} r={r2} x={p.x + 250} y={yb} s={S * 0.82} facing={-1} t={gf} pose={{step: -p.step, hand: [20, -96], handB: [-40, -96]}} face={{look: [0.9, 0], mouth: 'closed', brows: 'down'}} />
						</g>
					);
				})}
				<Toon id="fred69" r={CAST.fredNavy} x={out.x} y={1000 - out.bob} s={S} facing={1} t={gf} pose={pose} face={{look: f > leave ? [0.9, -0.1] : [-0.6, -0.1], turn: f > leave ? 0.6 : -0.6, mouth: f > leave ? 'grin' : 'smile', brows: f > leave ? 'sly' : 'up', lids: f > leave ? 'sly' : undefined, talk: fredT}} />
			</Sc>
			<Paper />
			<Tag f={f} t={4} x={70} y={100} text="TO THE OPERATING ROOM" size={48} until={prep} />
			<Tag f={f} t={prep + 2} x={70} y={100} text="PREP THEM" size={52} until={leave} />
			<Tag f={f} t={leave + 4} x={70} y={100} text={'"RIGHT THERE"'} size={52} />
		</>
	);
};

/* ================================ 070–071 to his cabin with a textbook; speed-reading ================================ */
const BookOpen: React.FC<{x: number; y: number; f: number; speed: number; title: string}> = ({x, y, f, speed, title}) => {
	const a = (f * speed) / 10;
	return (
		<g transform={`translate(${x},${y})`}>
			<path d="M-100,0 L0,14 L100,0 L100,-96 L0,-82 L-100,-96 Z" fill="#f4efe2" stroke={INK} strokeWidth={4} />
			<line x1={0} y1={-82} x2={0} y2={14} stroke={INK} strokeWidth={3} />
			{[0, 1, 2, 3].map((i) => (
				<line key={i} x1={-84} y1={-70 + i * 16} x2={-16} y2={-66 + i * 16} stroke="#8a8070" strokeWidth={3} />
			))}
			<path d="M24,-40 q14,-8 24,0 q10,8 22,-2" stroke="#c8433d" strokeWidth={4} fill="none" />
			<path d={`M0,-82 Q${50 * Math.cos(a)},${-120 + 20 * Math.sin(a)} ${90 * Math.cos(a)},-92`} stroke={INK} strokeWidth={3} fill="#fbf6e6" />
			<rect x={-100} y={16} width={200} height={34} rx={4} fill="#8a2a2a" stroke={INK} strokeWidth={4} />
			<text y={42} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={20} fill="#f4efe2">
				{title}
			</text>
		</g>
	);
};
const C070: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const inn = walk(f, 0, 22, 300, 1180);
	const open = w('070', 0.55);
	const fast = w('071', 0);
	const speed = f > fast ? 16 : f > open ? 4 : 0;
	const [cx, cy] = P(723, 93);
	const spin = f > fast ? (f - fast) * 0.6 : 0;
	return (
		<>
			<Sc bg="bg/cabin.jpg" a={camOn(1000, 640, 1.1)} b={camOn(1200, 620, 1.28)} id="l070" spots={CABIN_SPOTS} dark={0.42} glow="#ffcf7a">
				{/* the wall clock races */}
				<g transform={`translate(${cx},${cy})`}>
					<line x1={0} y1={0} x2={22 * Math.sin(spin)} y2={-22 * Math.cos(spin)} stroke={INK} strokeWidth={4} />
					<line x1={0} y1={0} x2={14 * Math.sin(spin / 12)} y2={-14 * Math.cos(spin / 12)} stroke={INK} strokeWidth={5} />
				</g>
				<Toon id="fred70" r={CAST.fredBare} x={inn.x} y={980 - inn.bob} s={S} facing={1} t={gf} pose={inn.step ? {step: inn.step, hand: [70, -150], handB: [-44, -110], lean: 12} : {hand: [80, -120], handB: [30, -125], head: 10}} face={{look: [0.5, 0.6], mouth: f > fast ? 'o' : 'closed', brows: f > fast ? 'up' : 'down', sweat: f > fast}} />
				{inn.step ? (
					<rect x={inn.x + 50 * S} y={980 - 175 * S} width={70} height={50} rx={4} fill="#8a2a2a" stroke={INK} strokeWidth={4} />
				) : f > open ? (
					<BookOpen x={inn.x + 62 * S} y={980 - 112 * S} f={f} speed={speed} title="GENERAL SURGERY" />
				) : (
					<g transform={`translate(${inn.x + 62 * S},${980 - 112 * S})`}>
						<rect x={-80} y={-40} width={160} height={50} rx={4} fill="#8a2a2a" stroke={INK} strokeWidth={4} />
						<text y={-8} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={18} fill="#f4efe2">
							GENERAL SURGERY
						</text>
					</g>
				)}
				{/* loose pages flying off */}
				{f > fast
					? [0, 1, 2, 3, 4].map((i) => {
							const k = ((f - fast) * 0.05 + i * 0.2) % 1;
							return <rect key={i} x={inn.x + 70 + 260 * k + i * 10} y={980 - 160 * S - 200 * k + 30 * Math.sin(i + f / 4)} width={40} height={52} fill="#fbf6e6" stroke={INK} strokeWidth={3} transform={`rotate(${200 * k + i * 30},${inn.x + 90 + 260 * k},${980 - 160 * S - 200 * k})`} opacity={1 - k} />;
						})
					: null}
			</Sc>
			<Paper />
			<Tag f={f} t={6} x={70} y={100} text="HIS CABIN" size={52} until={open} />
			<Tag f={f} t={open + 2} x={70} y={100} text="A TEXTBOOK" size={52} until={fast} />
			<Tag f={f} t={fast + 1} x={70} y={100} text="SPEED-READING" size={56} />
		</>
	);
};

/* ================================ 072 comes out, scrubs in, starts cutting ================================ */
const C072: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const inn = walk(f, 0, w('072', 0.28), 200, 1100);
	const scrub = w('072', 0.36);
	const cut = w('072', 0.68);
	const cutK = snap(f, cut);
	const FX = 1100;
	const hand: [number, number] = f > cut ? (mixP([150, -200], [200, -150], Math.min(cutK, 1.1)) as [number, number]) : f > scrub ? [60, -260] : [72, -86];
	const sp = hp(inn.x, 1000, hand);
	const flash = f > scrub && f < scrub + 5;
	return (
		<>
			<Sc bg="bg/or.jpg" a={camOn(1050, 650, 1.08)} b={camOn(1180, 630, 1.2)} id="l072" spots={OR_SPOTS}>
				<TablePatient />
				<Toon id="fred72" r={f > scrub ? CAST.fredSurg : CAST.fredBare} x={inn.x} y={1000 - inn.bob} s={S} facing={1} t={gf} pose={inn.step ? {step: inn.step, hand: [44, -110], handB: [-44, -110]} : {hand, handB: f > scrub ? [-60, -200] : [-72, -86], lean: f > cut ? 8 : 0}} face={{look: f > cut ? [0.8, 0.5] : [0.8, -0.1], mouth: f > cut ? 'closed' : 'smile', brows: f > cut ? 'down' : 'up'}} />
				{f > scrub ? <Scalpel x={sp[0]} y={sp[1]} rot={f > cut ? 30 : -60} glint={f < cut} /> : null}
				{flash ? <circle cx={FX} cy={1000 - 200 * S} r={200} fill="#fff" opacity={0.3 * (1 - (f - scrub) / 5)} /> : null}
			</Sc>
			<Paper />
			<Tag f={f} t={6} x={70} y={100} text="COMES OUT" size={50} until={scrub} />
			<Tag f={f} t={scrub + 2} x={70} y={100} text="SCRUBS IN" box="check" size={50} until={cut} />
			<Tag f={f} t={cut + 2} x={70} y={100} text="STARTS CUTTING" size={52} />
		</>
	);
};

/* ================================ 073 major chest surgery: the X-ray ================================ */
const C073: React.FC = () => {
	const {f} = useShot();
	const w = useW();
	const ribs = kk(f, 4, 24);
	const bullet = w('073', 0.42);
	const beat = 1 + 0.06 * Math.max(0, Math.sin(f / 3));
	return (
		<>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, #2a3a4a 0%, #10161e 80%)'}}>
				<svg viewBox="0 0 1920 1080" width={1920} height={1080}>
					<rect x={560} y={120} width={800} height={840} rx={12} fill="#dfe9f0" stroke={INK} strokeWidth={8} />
					<rect x={590} y={150} width={740} height={780} fill="#1c2630" />
					<g opacity={ribs} stroke="#d8e4ec" strokeWidth={14} fill="none" strokeLinecap="round">
						<line x1={960} y1={220} x2={960} y2={860} strokeWidth={22} />
						{[0, 1, 2, 3, 4, 5].map((i) => (
							<g key={i}>
								<path d={`M950,${300 + i * 85} Q${780 - i * 6},${280 + i * 85} ${700 - i * 4},${370 + i * 90}`} />
								<path d={`M970,${300 + i * 85} Q${1140 + i * 6},${280 + i * 85} ${1220 + i * 4},${370 + i * 90}`} />
							</g>
						))}
					</g>
					<ellipse cx={1010} cy={560} rx={90 * beat} ry={110 * beat} fill="#d8e4ec" opacity={0.25 * ribs} />
					{f > bullet ? (
						<g>
							<ellipse cx={1060} cy={600} rx={30} ry={18} fill="#ffffff" transform="rotate(30,1060,600)" />
							<circle cx={1060} cy={600} r={70 + 8 * Math.sin(f / 3)} fill="none" stroke="#d23b3b" strokeWidth={8} />
						</g>
					) : null}
				</svg>
			</AbsoluteFill>
			<Paper />
			<Tag f={f} t={6} x={70} y={100} text="MAJOR CHEST SURGERY" size={52} />
			<Tag f={f} t={bullet + 4} x={1300} y={860} text="A BULLET" size={56} />
			<Tag f={f} t={w('073', 0.7)} x={1300} y={960} text="DEEP" size={46} />
		</>
	);
};
/* 073b–074: inside the chest, he takes it out */
const C073b: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const pull = w('074', 0.15);
	const k = snap(f, pull);
	const FX = 1130;
	const SO = 1.4;
	const chest: [number, number] = [1470, 600];
	const up: [number, number] = [1330, 470];
	const probe = 6 * Math.sin(f / 2);
	const hw = mixP([chest[0] + probe, chest[1]], up, Math.min(Math.max(k, 0), 1.12));
	return (
		<>
			<Sc bg="bg/or.jpg" a={camOn(1300, 620, 1.3)} b={camOn(1320, 600, 1.42)} id="l073b" spots={OR_SPOTS}>
				<TablePatient />
				<Toon id="fred73" r={CAST.fredSurg} x={FX} y={1000} s={SO} t={gf} pose={{hand: lh(FX, 1000, hw, 1, SO), handB: [-60, -120], lean: 6}} face={{look: k > 0.5 ? [0.3, -0.7] : [0.7, 0.5], mouth: k > 0.8 ? 'grin' : 'closed', brows: k > 0.8 ? 'up' : 'down', sweat: k < 0.5}} />
				<Forceps x={hw[0]} y={hw[1]} rot={-25 + 35 * (1 - Math.min(Math.max(k, 0), 1))} bullet={k > 0.2} />
				{f > pull && f < pull + 14 ? (
					<text x={1380} y={380} fontFamily={HAND} fontWeight={700} fontSize={90} fill="#f2c94c" stroke={INK} strokeWidth={8} style={{paintOrder: 'stroke'}}>
						got it!
					</text>
				) : null}
			</Sc>
			<Paper />
			<Tag f={f} t={4} x={70} y={860} text="CAREFULLY..." size={52} until={pull} />
		</>
	);
};

/* ================================ 075 the bullet in the dish; none of the sixteen died ================================ */
const C075: React.FC = () => {
	const {f} = useShot();
	const w = useW();
	const cards = 26;
	if (f < cards) {
		const drop = 4;
		const fall = kk(f, drop, drop + 6);
		const bounce = f > drop + 6 ? Math.abs(Math.sin((f - drop - 6) / 2)) * 12 * Math.exp(-(f - drop - 6) / 5) : 0;
		return (
			<>
				<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 55%, #6a6e74 0%, #3a3d44 70%, #1c1d22 100%)'}}>
					<svg viewBox="0 0 1920 1080" width={1920} height={1080}>
						<path d="M560,640 Q960,860 1360,640 Q1340,720 960,780 Q580,720 560,640 Z" fill="#c8ccd6" stroke={INK} strokeWidth={8} />
						<ellipse cx={960} cy={640} rx={400} ry={70} fill="#dfe3ea" stroke={INK} strokeWidth={8} />
						<ellipse cx={960 + 30 * fall} cy={330 + 330 * fall - bounce} rx={34} ry={20} fill="#c9873a" stroke={INK} strokeWidth={6} />
						{f > drop + 6 ? (
							<text x={1210} y={480} fontFamily={HAND} fontWeight={700} fontSize={90} fill="#f2c94c" stroke={INK} strokeWidth={8} style={{paintOrder: 'stroke'}} transform="rotate(-8,1210,480)">
								clink!
							</text>
						) : null}
					</svg>
				</AbsoluteFill>
				<Paper />
			</>
		);
	}
	const zero = w('075', 0.72);
	return (
		<>
			<Felt>
				{Array.from({length: 16}).map((_, i) => {
					const x = 420 + (i % 8) * 155;
					const y = 330 + Math.floor(i / 8) * 260;
					const t0 = cards + i * 2.2;
					return f > t0 ? (
						<g key={i}>
							<Sheet x={x} y={y} w={130} h={180} rot={((i * 37) % 9) - 4} k={snap(f, t0)}>
								<circle cx={0} cy={-40} r={26} fill="#e4c098" stroke={INK} strokeWidth={3} />
								<rect x={-34} y={-10} width={68} height={50} rx={10} fill="#7a8a6a" stroke={INK} strokeWidth={3} />
								{f > t0 + 5 ? <path d="M-30,60 l18,18 l40,-46" stroke="#2f9a4a" strokeWidth={10} fill="none" strokeLinecap="round" /> : null}
							</Sheet>
						</g>
					) : null;
				})}
				{f > zero ? <rect x={0} y={0} width={1920} height={1080} fill="#000" opacity={0.45} /> : null}
			</Felt>
			<Paper />
			{f > zero ? <BigNumber f={f} t={zero} text="0" sub="died on his table" c="#7ad07a" y={300} /> : <Tag f={f} t={cards + 4} x={70} y={100} text="ALL SIXTEEN" size={56} />}
		</>
	);
};

/* ================================ 076 years later: "not quite like that"; the legend sticks ================================ */
const C076: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const doubt = w('076', 0.25);
	const wob = Math.sin(f / 3) * 14;
	return (
		<>
			<Sc bg="bg/deck.jpg" a={camOn(960, 660, 1.12)} b={camOn(960, 650, 1.2)} id="l076" dim={0.15}>
				<Toon id="old76a" r={CAST.oldSailA} x={780} y={1000} s={S} facing={1} t={gf} pose={f > doubt ? {hand: [110, -190 + wob], handB: [-72, -86], head: -6} : {hand: [72, -86], handB: [30, -100]}} face={{look: [0.8, -0.1], mouth: f > doubt ? 'smirk' : 'closed', brows: f > doubt ? 'sly' : 'flat', lids: f > doubt ? 'sly' : 'sleepy'}} />
				<Toon id="old76b" r={CAST.oldSailB} x={1160} y={1000} s={S} facing={-1} t={gf} pose={f > doubt + 20 ? {hand: [120, -170], handB: [-120, -170]} : {hand: [40, -110], handB: [-40, -110]}} face={{look: [0.8, -0.1], mouth: f > doubt + 20 ? 'o' : 'smile', brows: 'up'}} />
				<Icon kind="question" x={1160 - 10} y={1000 - 350 * S} f={f} t={doubt + 24} s={0.9} />
			</Sc>
			<Paper />
			<Tag f={f} t={4} x={70} y={100} text="YEARS LATER" size={54} />
			<Tag f={f} t={doubt + 4} x={1250} y={100} text={'"NOT QUITE"'} size={52} />
		</>
	);
};
const C076b: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const st = w('076', 0.82);
	return (
		<>
			<Cork>
				<svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
					{[
						[420, 330, -10, 6],
						[1500, 330, 8, 10],
						[1520, 760, -6, 14],
					].map(([x, y, r, t], i) => (
						<Sheet key={i} x={x} y={y} w={260} h={170} rot={r} k={snap(f, t)}>
							<text x={-112} y={-50} fontFamily={FONT} fontWeight={900} fontSize={22} fill={INK}>
								{['HERO DOC', 'SAVED 16', 'MIRACLE'][i]}
							</text>
							{[0, 1, 2].map((j) => (
								<line key={j} x1={-112} y1={-10 + j * 26} x2={110} y2={-10 + j * 26} stroke="#8a8070" strokeWidth={5} />
							))}
						</Sheet>
					))}
					<Polaroid x={960} y={520} rot={-3} k={snap(f, 2)} label="the hero surgeon">
						<rect x={-176} y={-206} width={352} height={340} fill="#7a9a8a" />
						<Toon id="leg76" r={CAST.fredSurg} x={0} y={250} s={1.15} t={gf} pose={{hand: [60, -300], handB: [-72, -86]}} face={{look: [0.2, -0.3], mouth: 'grin', brows: 'up'}} />
						<Forceps x={60 * 1.15 - 10} y={250 - 300 * 1.15} rot={-70} bullet />
					</Polaroid>
					<Stamp f={f} t={st} x={960} y={420} text="LEGEND" rot={-12} size={80} />
				</svg>
			</Cork>
			<Paper />
		</>
	);
};

/* ================================ 077 "Our doctor's a hero!" ================================ */
const C077: React.FC = () => {
	const {f, gf} = useShot();
	const sailT = talk('SAIL', gf);
	const jump = (i: number) => Math.abs(Math.sin(f / 4 + i)) * 26;
	return (
		<>
			<Sc bg="bg/deck.jpg" a={camOn(960, 640, 1.08)} b={camOn(960, 620, 1.16)} id="l077">
				{[0, 1, 2, 3].map((i) => {
					const x = [520, 720, 1220, 1420][i];
					return <Toon key={i} id={`ch77${i}`} r={[CAST.sailor2, CAST.sailor3, CAST.sailor4, CAST.sailor][i]} x={x} y={1000 - jump(i)} s={S * 0.92} facing={x < 960 ? 1 : -1} t={gf + i * 4} pose={{hand: [60, -300], handB: [-60, -300]}} face={{look: [0.8, -0.2], mouth: i === 3 ? 'wide' : 'grin', brows: 'up', talk: i === 3 ? sailT : 0}} />;
				})}
				<Toon id="fred77" r={CAST.fredSurg} x={960} y={1000} s={S} t={gf} pose={{hand: [40, -230], handB: [-72, -86], head: -4}} face={{look: [0.2, -0.2], mouth: 'grin', brows: 'up', lids: 'sly'}} />
				<Icon kind="crown" x={964} y={1000 - 330 * S} f={f} t={8} s={0.9} />
			</Sc>
			<Paper />
			<Tag f={f} t={10} x={70} y={100} text="HERO!" size={60} />
		</>
	);
};

/* ================================ 078 the press officer writes it up ================================ */
const C078: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const type = w('078', 0.42);
	const k = kk(f, type, w('078', 1));
	const tap = f > type ? Math.abs(Math.sin(f * 1.2)) * 16 : 0;
	const X = 960;
	return (
		<>
			<Sc bg="bg/cabin.jpg" a={camOn(960, 640, 1.12)} b={camOn(960, 700, 1.28)} id="l078" spots={CABIN_SPOTS} dark={0.35} glow="#ffcf7a">
				<Toon id="press78" r={CAST.press} x={X + 230} y={1000} s={S} facing={-1} t={gf} pose={f > type ? {hand: [165, -128 - tap], handB: [120, -128 - (16 - tap)], lean: -8} : {hand: [30, -190], handB: [-30, -190], head: 6}} face={{look: f > type ? [0.8, 0.6] : [0.2, -0.3], mouth: 'grin', brows: 'up', lids: f > type ? undefined : 'sly'}} />
				{/* a table in front of him */}
				<rect x={X - 300} y={1000 - 96 * S} width={640} height={26} rx={4} fill="#7a5a3a" stroke={INK} strokeWidth={5} />
				<rect x={X - 280} y={1000 - 70 * S} width={30} height={90} fill="#6a4a2a" stroke={INK} strokeWidth={4} />
				<rect x={X + 290} y={1000 - 70 * S} width={30} height={90} fill="#6a4a2a" stroke={INK} strokeWidth={4} />
				<Typewriter x={X - 20} y={1000 - 100 * S - 40} k={k} text="DOCTOR SAVES 16" f={f} />
				<Icon kind="bulb" x={X + 240} y={1000 - 350 * S} f={f} t={w('078', 0.1)} s={0.9} out={type} />
			</Sc>
			<Paper />
			<Tag f={f} t={4} x={70} y={100} text="PRESS OFFICER" size={52} />
			<Tag f={f} t={type + 4} x={1350} y={100} text="WRITES IT UP" size={50} />
		</>
	);
};

/* ================================ 079 newspapers all over Canada ================================ */
const HEADS = ['MIRACLE DOCTOR AT SEA', 'NAVY SURGEON SAVES 16', 'DR. CYR, HERO OF KOREA'];
const C079: React.FC = () => {
	const {f} = useShot();
	const w = useW();
	return (
		<>
			<Felt>
				{HEADS.map((h, i) => {
					const t0 = w('079', i * 0.3);
					if (f < t0) return null;
					const k = Math.min(1, (f - t0) / 10);
					const x = [600, 1300, 960][i];
					const y = [430, 470, 640][i];
					return (
						<g key={i} transform={`translate(${x},${y}) rotate(${(1 - k) * 720 + [-8, 6, -2][i]}) scale(${0.2 + 0.8 * k})`}>
							<rect x={-370} y={-230} width={740} height={460} fill="#000" opacity={0.3} transform="translate(12,14)" />
							<rect x={-370} y={-230} width={740} height={460} fill="#f1ecdc" stroke={INK} strokeWidth={5} />
							<text x={0} y={-180} textAnchor="middle" fontFamily="Georgia, serif" fontWeight={900} fontSize={34} fill={INK}>
								{['THE TORONTO DAILY', 'THE WINNIPEG POST', 'THE HALIFAX HERALD'][i]}
							</text>
							<line x1={-340} y1={-160} x2={340} y2={-160} stroke={INK} strokeWidth={4} />
							<text x={0} y={-100} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={48} fill={INK}>
								{h}
							</text>
							<rect x={-330} y={-60} width={250} height={240} fill="#a8a090" stroke={INK} strokeWidth={3} />
							<circle cx={-205} cy={30} r={60} fill="#f1d2b0" stroke={INK} strokeWidth={4} />
							<path d="M-262,10 Q-240,-40 -205,-36 Q-160,-40 -148,10 Q-170,-14 -205,-14 Q-240,-14 -262,10 Z" fill="#3a2a20" />
							{[0, 1, 2, 3, 4, 5].map((j) => (
								<line key={j} x1={-50} y1={-40 + j * 38} x2={330} y2={-40 + j * 38} stroke="#8a8070" strokeWidth={8} />
							))}
						</g>
					);
				})}
			</Felt>
			<Paper />
			<Tag f={f} t={w('079', 0.75)} x={70} y={980} text="ALL OVER CANADA" size={54} />
		</>
	);
};

/* ================================ 080 a problem: one paper lands in Grand Falls ================================ */
const C080: React.FC = () => {
	const {f} = useShot();
	const w = useW();
	const fly0 = w('080', 0.35);
	const land = w('080', 0.75);
	const k = kk(f, fly0, land);
	const x = 400 + 1180 * k;
	const y = 520 - 200 * Math.sin(k * Math.PI) + 40 * k;
	return (
		<>
			<Felt>
				<CanadaMap>
					<circle cx={1580} cy={560} r={14} fill="#d23b3b" stroke={INK} strokeWidth={4} />
					<text x={1520} y={630} fontFamily={HAND} fontWeight={700} fontSize={42} fill={INK} opacity={kk(f, land - 10, land)}>
						Grand Falls, N.B.
					</text>
					{f > fly0 ? (
						<g transform={`translate(${x},${y}) rotate(${k < 1 ? f * 14 : 8}) scale(${1 - 0.3 * k})`}>
							<rect x={-60} y={-40} width={120} height={80} fill="#f1ecdc" stroke={INK} strokeWidth={4} />
							<line x1={-48} y1={-20} x2={48} y2={-20} stroke={INK} strokeWidth={6} />
							<line x1={-48} y1={0} x2={30} y2={0} stroke="#8a8070" strokeWidth={4} />
							<line x1={-48} y1={16} x2={40} y2={16} stroke="#8a8070" strokeWidth={4} />
						</g>
					) : null}
					{f > land ? <circle cx={1580} cy={560} r={20 + (f - land) * 3} fill="none" stroke="#d23b3b" strokeWidth={6} opacity={Math.max(0, 1 - (f - land) / 20)} /> : null}
				</CanadaMap>
			</Felt>
			<Paper />
			<Tag f={f} t={4} x={70} y={100} text="A PROBLEM" size={60} c="#ff8a7a" />
		</>
	);
};

/* ================================ 081 Dr. Joseph Cyr seeing patients. The real one. ================================ */
const C081: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const real = w('081', 0.6);
	const breath = 1 + 0.06 * Math.max(0, Math.sin(f / 7));
	const CX = 1150;
	return (
		<>
			<Sc bg="bg/clinic.jpg" a={camOn(1000, 650, 1.1)} b={camOn(1100, 630, 1.2)} id="l081" spots={CLINIC_SPOTS} dark={0.22} glow="#ffcf7a">
				<g transform={`translate(760,1000) scale(1,${breath}) translate(-760,-1000)`}>
					<Toon id="pat81" r={CAST.farmer} x={760} y={1000} s={S} facing={1} t={gf} pose={{hand: [60, -110], handB: [-60, -110]}} face={{look: [0.8, -0.3], mouth: f > real - 20 ? 'smile' : 'o', brows: 'up'}} />
				</g>
				<Toon id="cyr81" r={CAST.cyr} x={CX} y={1000} s={S} facing={f > real ? 1 : -1} t={gf} pose={f > real ? {hand: [60, -190], handB: [-72, -86]} : {hand: [210, -150], handB: [-50, -110], lean: -8}} face={{look: f > real ? [0.3, -0.1] : [0.8, 0.2], turn: f > real ? 0.3 : undefined, mouth: f > real ? 'smile' : 'closed', brows: f > real ? 'up' : 'flat', lids: f > real ? undefined : 'sleepy'}} />
				<Stetho x={CX} y={1000} facing={f > real ? 1 : -1} />
				{f <= real ? <circle cx={CX - 210 * S} cy={1000 - 150 * S} r={12} fill="#c8ccd6" stroke={INK} strokeWidth={3} /> : null}
			</Sc>
			<Paper />
			<Tag f={f} t={4} x={1250} y={860} sub="Dr." text="JOSEPH CYR" size={56} />
			<Tag f={f} t={real + 2} x={1250} y={100} text="THE REAL ONE" box="check" size={52} />
		</>
	);
};

/* ================================ 082 Cyr reads about his own adventures ================================ */
const C082: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const shock = w('082', 0.32);
	const shake = f > shock ? Math.sin(f * 2) * 4 : 0;
	const CX = 860;
	const ph = hp(CX, 1000, [100, -150]);
	return (
		<>
			<Sc bg="bg/clinic.jpg" a={camOn(960, 640, 1.15)} b={camOn(920, 600, 1.35)} id="l082" spots={CLINIC_SPOTS} dark={0.22} glow="#ffcf7a">
				<Toon id="cyr82" r={CAST.cyr} x={CX} y={1000} s={S} facing={1} t={gf} pose={{hand: [100, -150 + shake], handB: [60, -150 - shake]}} face={{look: [0.6, 0.6], mouth: f > shock ? 'o' : 'closed', brows: f > shock ? 'up' : 'flat', sweat: f > shock + 10}} />
				<Paperboard x={ph[0] + 30} y={ph[1] - 60 + shake} title="HERO DOC AT SEA" />
			</Sc>
			<Paper />
			<Tag f={f} t={shock + 3} x={1250} y={100} text="HIS OWN ADVENTURES" size={48} />
		</>
	);
};
/* 082b: close-up of the paper, his own name */
const C082b: React.FC = () => {
	const {f} = useShot();
	const ring = kk(f, 12, 30);
	return (
		<>
			<Felt>
				<g transform={`translate(960,540) rotate(-3) scale(${1.05 + 0.04 * kk(f, 0, 60)})`}>
					<rect x={-560} y={-400} width={1120} height={800} fill="#f1ecdc" stroke={INK} strokeWidth={6} />
					<text x={0} y={-310} textAnchor="middle" fontFamily="Georgia, serif" fontWeight={900} fontSize={60} fill={INK}>
						HERO DOCTOR AT SEA
					</text>
					<line x1={-520} y1={-270} x2={520} y2={-270} stroke={INK} strokeWidth={5} />
					<rect x={-500} y={-230} width={380} height={420} fill="#a8a090" stroke={INK} strokeWidth={4} />
					<circle cx={-310} cy={-60} r={110} fill="#f1d2b0" stroke={INK} strokeWidth={5} />
					<path d="M-412,-90 Q-380,-180 -310,-174 Q-230,-180 -206,-90 Q-240,-130 -310,-130 Q-370,-130 -412,-90 Z" fill="#3a2a20" />
					<circle cx={-350} cy={-60} r={9} fill={INK} />
					<circle cx={-270} cy={-60} r={9} fill={INK} />
					<path d="M-350,-10 Q-310,20 -270,-10" stroke={INK} strokeWidth={6} fill="none" />
					<text x={-70} y={-160} fontFamily={FONT} fontWeight={900} fontSize={54} fill={INK}>
						Dr. Joseph Cyr
					</text>
					<ellipse cx={130} cy={-178} rx={230 * ring + 1} ry={60 * ring + 1} fill="none" stroke="#d23b3b" strokeWidth={8} opacity={ring > 0 ? 1 : 0} />
					{[0, 1, 2, 3, 4, 5, 6].map((j) => (
						<line key={j} x1={-70} y1={-90 + j * 46} x2={510} y2={-90 + j * 46} stroke="#8a8070" strokeWidth={10} />
					))}
				</g>
			</Felt>
			<Paper />
		</>
	);
};

/* ================================ 083 "That's my name. But I've never been to Korea." ================================ */
const C083: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const cyrT = talk('CYR', gf);
	const never = w('083', 0.45);
	const CX = 1000;
	const ph = hp(CX, 1000, [100, -150], -1);
	return (
		<>
			<Sc bg="bg/clinic.jpg" a={camOn(1000, 600, 1.35)} b={camOn(1000, 610, 1.45)} id="l083" spots={CLINIC_SPOTS} dark={0.22} glow="#ffcf7a">
				<Toon id="cyr83" r={CAST.cyr} x={CX} y={1000} s={S} facing={-1} t={gf} pose={f > never ? {hand: [100, -150], handB: [-110, -230 + Math.sin(f / 2) * 10], head: Math.sin(f / 3) * 6} : {hand: [100, -150], handB: [-40, -200]}} face={{look: [0.3, -0.1], mouth: f > never ? 'frown' : 'o', brows: f > never ? 'down' : 'up', talk: cyrT}} />
				<Paperboard x={ph[0] - 30} y={ph[1] - 60} title="HERO DOC AT SEA" rot={-4} />
			</Sc>
			<Paper />
			<Tag f={f} t={4} x={70} y={100} text="MY NAME" box="check" size={52} until={never} />
			<Tag f={f} t={never + 2} x={70} y={100} text="KOREA" box="cross" size={56} />
		</>
	);
};

export const SHOTS_C4: ShotDef[] = [
	{at: '065', C: C065},
	{at: '067', C: C067},
	{at: '069', C: C069},
	{at: '070', C: C070},
	{at: '072', C: C072},
	{at: '073', C: C073},
	{at: '073', off: T('073', 0.72), C: C073b},
	{at: '075', C: C075},
	{at: '076', C: C076},
	{at: '076', off: T('076', 0.55), C: C076b},
	{at: '077', C: C077},
	{at: '078', C: C078},
	{at: '079', C: C079},
	{at: '080', C: C080},
	{at: '081', C: C081},
	{at: '082', C: C082},
	{at: '082', off: T('082', 0.62), C: C082b},
	{at: '083', C: C083},
];


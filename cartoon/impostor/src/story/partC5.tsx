import React from 'react';
import {useShot} from '../kit/core';
import type {ShotDef} from '../kit/coverage';
import {camOn} from '../kit/kit';
import {FONT, HAND} from '../kit/ui';
import {CAST} from '../toon/cast';
import {Felt, Icon, P, Paper, Sheet, Stamp, Tag, snap} from '../toon/kit';
import {INK, Pose, Toon} from '../toon/Toon';
import {S, T, kk, walk} from './partC1';
import {Ensign} from './partC2';
import {Backdrop, CABIN_SPOTS, Mag, PRISON_SPOTS, REC_SPOTS, Sc, Telegram, hp, talk} from './c4kit';
import {useW} from './lib';

/* PART 5 (5:34–6:50): the signal, the crew and the captain don't believe it, the second signal,
   home via Japan, the inquiry, back pay, Life magazine, the prison job in Texas, caught again. */

/* ================================ 084 October: a signal reaches the Cayuga ================================ */
const C084: React.FC = () => {
	const {f, gf} = useShot();
	const [mx, my] = P(990, 120);
	const run = walk(f, 14, 50, 2050, 1150);
	return (
		<>
			<Sc bg="bg/deck.jpg" a={camOn(900, 520, 1.05)} b={camOn(1000, 600, 1.14)} id="l084">
				{[0, 1, 2].map((i) => {
					const k = ((f + i * 10) % 30) / 30;
					return <circle key={i} cx={mx} cy={my} r={30 + 200 * k} fill="none" stroke="#ffe070" strokeWidth={14} opacity={1 - k * 0.8} />;
				})}
				<Toon id="radio84" r={CAST.sailor4} x={run.x} y={1000 - run.bob} s={S} facing={-1} t={gf} pose={run.step ? {step: run.step, hand: [90, -250], handB: [-50, -100], lean: -10} : {hand: [100, -230], handB: [-50, -110]}} face={{look: [0.9, -0.1], mouth: 'o', brows: 'up', sweat: true}} />
				{f > 14 ? (() => {
					const p = hp(run.x, 1000 - run.bob, run.step ? [90, -250] : [100, -230], -1);
					return <rect x={p[0] - 40} y={p[1] - 60} width={64} height={80} fill="#efe6c8" stroke={INK} strokeWidth={4} transform={`rotate(-8,${p[0]},${p[1]})`} />;
				})() : null}
			</Sc>
			<Paper />
			<Tag f={f} t={4} x={70} y={860} sub="1951" text="OCTOBER" size={58} />
			<Tag f={f} t={20} x={1250} y={100} text="A SIGNAL" size={54} />
		</>
	);
};
const C084b: React.FC = () => {
	const {f} = useShot();
	const w = useW();
	return (
		<>
			<Felt>
				<Telegram f={f} t={4} lines={['TO: HMCS CAYUGA', 'YOUR DOCTOR', 'IS AN IMPOSTOR']} />
				<Stamp f={f} t={w('084', 0.97)} x={1220} y={700} text="URGENT" rot={-10} size={60} />
			</Felt>
			<Paper />
		</>
	);
};

/* ================================ 085 the captain can't believe it: capable, popular ================================ */
const C085: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const laugh = w('085', 0.12);
	const toss = w('085', 0.35);
	const cap = w('085', 0.45);
	const pop = w('085', 0.72);
	const fall = kk(f, toss, toss + 12);
	const CX = 1300;
	const start = hp(CX, 1000, [90, -200], -1);
	const px = start[0] - 260 * fall;
	const py = start[1] + (1000 - 14 - start[1]) * fall * fall - 120 * Math.sin(fall * Math.PI);
	const bob = Math.abs(Math.sin(f / 3)) * 8;
	return (
		<>
			<Sc bg="bg/deck.jpg" a={camOn(1000, 650, 1.1)} b={camOn(1060, 640, 1.18)} id="l085">
				{/* in the back: Fred, cheerful among the sailors */}
				<Toon id="fred85" r={CAST.fredNavy} x={480} y={900} s={S * 0.85} facing={1} t={gf} pose={f > pop ? {hand: [60, -300], handB: [-72, -86]} : {hand: [72, -86], handB: [-72, -86]}} face={{look: [0.8, -0.1], mouth: 'grin', brows: 'up'}} />
				{f > pop ? <Toon id="s85" r={CAST.sailor2} x={640} y={900 - bob} s={S * 0.85} facing={-1} t={gf} pose={{hand: [80, -260], handB: [-50, -110]}} face={{look: [0.8, -0.1], mouth: 'grin', brows: 'up'}} /> : null}
				<Toon id="capt85" r={CAST.captain} x={CX} y={1000} s={S} facing={-1} t={gf} pose={f > toss ? {hand: [120, -170], handB: [-60, -110], head: f > laugh ? -8 : 0} : {hand: [90, -200], handB: [-60, -110], head: f > laugh ? -10 : 0}} face={{look: [0.8, -0.2], mouth: f > laugh ? 'grin' : 'o', brows: f > laugh ? 'up' : 'worried', lids: f > laugh && f < toss ? 'sleepy' : undefined}} />
				{/* the signal flies off and lies on the deck */}
				<g transform={`translate(${px},${py}) rotate(${-8 + 80 * fall})`}>
					<rect x={-30} y={-38} width={60} height={76} fill="#efe6c8" stroke={INK} strokeWidth={4} />
				</g>
			</Sc>
			<Paper />
			<Tag f={f} t={laugh + 2} x={1300} y={100} text={'"NONSENSE!"'} size={52} until={cap} />
			<Tag f={f} t={cap + 2} x={1300} y={100} text="CAPABLE" box="check" size={50} />
			<Tag f={f} t={pop + 2} x={1300} y={180} text="POPULAR" box="check" size={50} />
		</>
	);
};

/* ================================ 086 the crew goes to his cabin ================================ */
const C086: React.FC = () => {
	const {f, gf} = useShot();
	const rs = [CAST.sailor, CAST.sailor2, CAST.sailor3, CAST.sailor4];
	return (
		<>
			<Sc bg="bg/deck.jpg" a={camOn(960, 650, 1.06)} b={camOn(1060, 650, 1.12)} id="l086">
				{rs.map((r, i) => {
					const m = walk(f, i * 5, 80 + i * 5, -150 - i * 190, 1700 - i * 190);
					return <Toon key={i} id={`cw86${i}`} r={r} x={m.x} y={1000 - m.bob} s={S} facing={1} t={gf + i * 6} pose={{step: m.step, hand: [44, -110], handB: [-44, -110], lean: 6}} face={{look: [0.9, 0], mouth: i % 2 ? 'frown' : 'closed', brows: i === 0 ? 'down' : 'worried'}} />;
				})}
			</Sc>
			<Paper />
			<Tag f={f} t={6} x={70} y={100} text="CREW: DON'T BELIEVE IT" size={46} until={45} />
			<Tag f={f} t={48} x={70} y={100} text="TO HIS CABIN" size={52} />
		</>
	);
};

/* ================================ 087–088 "Doc... tell us it isn't true." "Impossible. The man fixed my tooth." ================================ */
const C087: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const sailT = talk('SAIL', gf);
	const capT = talk('CAPT', gf);
	const capIn = w('088', 0);
	const turn = f > 10;
	const capWalk = walk(f, capIn - 14, capIn + 4, 200, 560);
	return (
		<>
			<Sc bg="bg/cabin.jpg" a={camOn(960, 650, 1.12)} b={camOn(980, 640, 1.2)} id="l087" spots={CABIN_SPOTS} dark={0.38} glow="#ffcf7a">
				<Toon id="s87a" r={CAST.sailor} x={760} y={990} s={S} facing={1} t={gf} pose={{hand: [40, -170], handB: [-40, -170], head: 6}} face={{look: [0.8, 0], mouth: 'frown', brows: 'worried', talk: sailT}} />
				<Toon id="s87b" r={CAST.sailor3} x={940} y={990} s={S} facing={1} t={gf + 5} pose={{hand: [60, -110], handB: [-60, -110]}} face={{look: [0.8, 0], mouth: 'frown', brows: 'worried'}} />
				{f > capIn - 14 ? <Toon id="capt88" r={CAST.captain} x={capWalk.x} y={990 - capWalk.bob} s={S} facing={1} t={gf} pose={capWalk.step ? {step: capWalk.step, hand: [44, -110]} : {hand: [70, -205], handB: [-60, -110], head: Math.sin(f / 4) * 4}} face={{look: [0.8, -0.1], mouth: capWalk.step ? 'closed' : 'grin', brows: 'up', talk: capT}} /> : null}
				<Toon id="fred87" r={CAST.fredBare} x={1320} y={990} s={S} facing={turn ? -1 : 1} t={gf} pose={f > capIn + 20 ? {hand: [40, -200], handB: [-72, -86]} : {hand: [60, -150], handB: [-60, -150]}} face={{look: [0.8, -0.1], mouth: f > capIn + 20 ? 'grin' : 'smile', brows: f > capIn + 20 ? 'up' : 'worried', sweat: f < capIn + 20 && f > 12}} />
				{f > capIn + 10 ? (
					<g transform={`translate(${capWalk.x + 40},${990 - 360 * S}) scale(${Math.min(snap(f, capIn + 10), 1.1)})`}>
						<path d="M-26,-30 Q0,-44 26,-30 L22,26 L8,12 L-8,12 L-22,26 Z" fill="#fbfaf4" stroke={INK} strokeWidth={5} />
						<path d="M30,-44 L34,-34 L44,-30 L34,-26 L30,-16 L26,-26 L16,-30 L26,-34 Z" fill="#f2c94c" stroke={INK} strokeWidth={2} />
					</g>
				) : null}
			</Sc>
			<Paper />
			<Tag f={f} t={6} x={70} y={100} text={'"TELL US IT ISN\'T TRUE"'} size={46} until={capIn} />
			<Tag f={f} t={capIn + 6} x={70} y={100} text="FIXED MY TOOTH" box="check" size={50} />
		</>
	);
};

/* ================================ 089 the next day: a second signal ================================ */
const C089: React.FC = () => {
	const {f} = useShot();
	const w = useW();
	return (
		<>
			<Felt>
				<Sheet x={700} y={470} w={700} h={460} rot={-9} k={1}>
					<text x={-300} y={-150} fontFamily="Courier New, monospace" fontWeight={700} fontSize={40} fill="#6a6050">
						YOUR DOCTOR IS
					</text>
					<text x={-300} y={-90} fontFamily="Courier New, monospace" fontWeight={700} fontSize={40} fill="#6a6050">
						AN IMPOSTOR
					</text>
				</Sheet>
				<g transform={`translate(${-500 * (1 - Math.min(1, kk(f, 0, 10)))},0)`}>
					<Telegram f={f} t={10} head="SECOND SIGNAL" lines={['CONFIRMED.', 'HE IS NOT', 'DR. JOSEPH CYR.']} />
				</g>
				<Stamp f={f} t={w('089', 0.72)} x={1180} y={680} text="NO DOUBT" rot={-12} size={64} />
			</Felt>
			<Paper />
			<Tag f={f} t={4} x={70} y={980} text="THE NEXT DAY" size={52} />
		</>
	);
};

/* ================================ 090 locks himself in; gives up ================================ */
const C090: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const lock = 16;
	const pace0 = 26;
	const give = w('090', 0.55);
	const inn = walk(f, 0, 14, 300, 700);
	const paceK = f > pace0 && f < give ? (f - pace0) / 26 : 0;
	const x = f < 14 ? inn.x : f < give ? 900 + 300 * Math.sin(paceK * Math.PI) : 1000;
	const facing: 1 | -1 = f > pace0 && f < give ? (Math.cos(paceK * Math.PI) > 0 ? 1 : -1) : 1;
	const flag = snap(f, give + 4);
	const pose: Pose = f < 14 ? {step: inn.step, hand: [44, -110], lean: 12} : f < pace0 ? {hand: [-120, -150], handB: [-72, -86]} : f < give ? {step: Math.sin(f / 3), hand: [30, -240], handB: [-30, -240], lean: 6} : {hand: [70, -300 * Math.min(flag, 1.1)], handB: [-70, -300 * Math.min(flag, 1.1)]};
	const hand = hp(x, 990, pose.hand as [number, number], facing);
	return (
		<>
			<Sc bg="bg/cabin.jpg" a={camOn(960, 650, 1.1)} b={camOn(1000, 640, 1.2)} id="l090" spots={CABIN_SPOTS} dark={0.45} glow="#ffcf7a">
				<Toon id="fred90" r={CAST.fredBare} x={x} y={990} s={S} facing={facing} t={gf} pose={pose} face={{look: f > give ? [0, -0.4] : [0.8, 0], mouth: f > give ? 'frown' : 'o', brows: 'worried', sweat: f > pace0, lids: f > give ? 'sleepy' : undefined}} />
				{f >= 14 && f < pace0 ? (
					<g transform={`translate(${hand[0]},${hand[1]}) rotate(${kk(f, 16, 20) * 90})`}>
						<circle r={12} fill="none" stroke="#c8a040" strokeWidth={6} />
						<rect x={10} y={-4} width={30} height={8} fill="#c8a040" />
					</g>
				) : null}
				{f > give ? (
					<g transform={`translate(${hand[0]},${hand[1]})`}>
						<line x1={0} y1={10} x2={0} y2={-70} stroke="#7a5a3a" strokeWidth={6} />
						<path d={`M0,-70 Q30,${-80 + 6 * Math.sin(f / 3)} 60,-70 L60,-30 Q30,${-40 + 6 * Math.sin(f / 3)} 0,-30 Z`} fill="#fbfaf4" stroke={INK} strokeWidth={4} />
					</g>
				) : null}
				{f > lock && f < lock + 12 ? (
					<text x={360} y={600} fontFamily={HAND} fontWeight={700} fontSize={80} fill="#f2c94c" stroke={INK} strokeWidth={8} style={{paintOrder: 'stroke'}}>
						click!
					</text>
				) : null}
			</Sc>
			<Paper />
			<Tag f={f} t={lock + 4} x={1250} y={100} text="LOCKED IN" size={52} until={give} />
			<Tag f={f} t={give + 6} x={1250} y={100} text="GIVES UP" size={56} />
		</>
	);
};

/* ================================ 091 home on a British cruiser, via Japan ================================ */
const C091: React.FC = () => {
	const {f} = useShot();
	const go = kk(f, 6, 90);
	const pts: [number, number][] = [
		[330, 470],
		[520, 520],
		[1000, 330],
		[1600, 480],
	];
	const seg = (k: number): [number, number] => {
		const t = k * 3;
		const i = Math.min(2, Math.floor(t));
		const u = t - i;
		return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * u, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * u];
	};
	const [sx, sy] = seg(go);
	return (
		<>
			<Felt>
				<rect x={160} y={140} width={1600} height={800} fill="#cfe2ea" stroke={INK} strokeWidth={5} />
				<path d="M300,330 Q360,300 380,360 Q400,440 360,520 Q330,600 300,620 Q270,560 280,460 Q270,380 300,330 Z" fill="#d8c8a0" stroke={INK} strokeWidth={4} />
				<path d="M450,420 Q520,380 560,430 Q540,520 500,600 Q460,560 450,420 Z" fill="#d8c8a0" stroke={INK} strokeWidth={4} />
				<path d="M1640,180 L1760,180 L1760,900 L1600,900 Q1560,760 1600,640 Q1580,520 1620,420 Q1600,300 1640,180 Z" fill="#d8c8a0" stroke={INK} strokeWidth={4} />
				<text x={240} y={690} fontFamily={HAND} fontWeight={700} fontSize={46} fill={INK}>
					Korea
				</text>
				<text x={470} y={680} fontFamily={HAND} fontWeight={700} fontSize={46} fill={INK} opacity={kk(f, 14, 20)}>
					Japan
				</text>
				<text x={1560} y={160} fontFamily={HAND} fontWeight={700} fontSize={50} fill={INK}>
					Canada
				</text>
				<path d={`M${pts.map((p) => p.join(',')).join(' L')}`} stroke="#c8433d" strokeWidth={6} strokeDasharray="16 12" fill="none" style={{clipPath: `inset(0 ${(1 - Math.min(1, (sx - 300) / 1320)) * 100}% 0 0)`}} />
				<g transform={`translate(${sx},${sy})`}>
					<path d="M-50,0 L50,0 L38,18 L-38,18 Z" fill="#8a90a0" stroke={INK} strokeWidth={4} />
					<rect x={-16} y={-22} width={32} height={22} fill="#8a90a0" stroke={INK} strokeWidth={3} />
					<line x1={20} y1={-22} x2={20} y2={-60} stroke={INK} strokeWidth={4} />
					<rect x={20} y={-60} width={40} height={26} fill="#2a3a7a" stroke={INK} strokeWidth={3} />
					<path d="M20,-60 l40,26 M60,-60 l-40,26" stroke="#f4efe2" strokeWidth={5} />
					<path d="M40,-60 l0,26 M20,-47 l40,0" stroke="#c8302a" strokeWidth={6} />
				</g>
			</Felt>
			<Paper />
			<Tag f={f} t={4} x={70} y={100} text="BRITISH CRUISER" size={52} />
			<Tag f={f} t={22} x={70} y={980} text="VIA JAPAN" size={50} />
		</>
	);
};

/* ================================ 092–095 the inquiry in Canada: no charges, back pay, fired and paid ================================ */
const Gavel: React.FC<{x: number; y: number; a: number}> = ({x, y, a}) => (
	<g transform={`translate(${x},${y}) rotate(${a})`}>
		<rect x={-6} y={-10} width={12} height={70} rx={4} fill="#7a4e2a" stroke={INK} strokeWidth={4} />
		<rect x={-30} y={-30} width={60} height={26} rx={6} fill="#8a5a32" stroke={INK} strokeWidth={4} />
	</g>
);
const C092: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const bang = w('092', 0.6);
	const verdict = w('093', 0);
	const hon = w('093', 0.5);
	const g = Math.min(1, snap(f, bang));
	const relief = f > hon;
	const AX = 780;
	const gp = hp(AX, 1000, [100, -200 + 60 * g]);
	return (
		<>
			<Sc bg="bg/recruit.jpg" a={camOn(960, 640, 1.08)} b={camOn(1000, 640, 1.18)} id="l092" spots={REC_SPOTS} dark={0.25} glow="#ffd88a">
				<Ensign />
				<Toon id="off92a" r={CAST.docNavy} x={520} y={1000} s={S} facing={1} t={gf + 9} pose={{hand: [40, -150], handB: [-40, -150]}} face={{look: [0.8, 0], mouth: f > verdict ? 'smile' : 'frown', brows: f > verdict ? 'flat' : 'down'}} />
				<Toon id="adm92" r={CAST.admiral} x={AX} y={1000} s={S} facing={1} t={gf} pose={f > verdict ? {hand: [110, -200], handB: [-60, -110]} : {hand: [100, -200 + 60 * g], handB: [-72, -86]}} face={{look: [0.8, 0], mouth: f > verdict ? 'smile' : 'closed', brows: f > verdict ? 'flat' : 'down'}} />
				{f <= verdict ? <Gavel x={gp[0]} y={gp[1]} a={-60 + 60 * g} /> : <rect x={hp(AX, 1000, [110, -200])[0] - 10} y={hp(AX, 1000, [110, -200])[1] - 70} width={80} height={100} fill="#f4efe2" stroke={INK} strokeWidth={4} />}
				<Toon id="fred92" r={CAST.fredNavy} x={1360} y={1000} s={S} facing={-1} t={gf} pose={relief ? {hand: [40, -280], handB: [-72, -86]} : {hand: [40, -150], handB: [-40, -150]}} face={{look: [0.8, 0], mouth: relief ? 'grin' : 'o', brows: relief ? 'up' : 'worried', sweat: !relief}} />
				{f > bang && f < bang + 12 ? (
					<text x={gp[0] + 30} y={gp[1] - 80} fontFamily={HAND} fontWeight={700} fontSize={80} fill="#f2c94c" stroke={INK} strokeWidth={8} style={{paintOrder: 'stroke'}}>
						bang!
					</text>
				) : null}
			</Sc>
			<Paper />
			<Tag f={f} t={4} x={70} y={100} sub="back in Canada" text="NAVY INQUIRY" size={54} until={verdict} />
			<Tag f={f} t={verdict + 4} x={70} y={100} text="NO CHARGES" box="check" size={52} />
			<Tag f={f} t={hon + 2} x={70} y={190} text="HONORABLE RELEASE" box="check" size={48} />
		</>
	);
};
const Bill: React.FC<{x: number; y: number; rot: number}> = ({x, y, rot}) => (
	<g transform={`translate(${x},${y}) rotate(${rot})`}>
		<rect x={-110} y={-50} width={220} height={100} rx={6} fill="#a8d0a0" stroke={INK} strokeWidth={4} />
		<ellipse cx={0} cy={0} rx={34} ry={34} fill="#d8ecd0" stroke="#3a6a4a" strokeWidth={3} />
		<text y={16} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill="#3a6a4a">
			$
		</text>
	</g>
);
const C094: React.FC = () => {
	const {f} = useShot();
	return (
		<>
			<Felt>
				{Array.from({length: 9}).map((_, i) => {
					const t0 = 3 + i * 5;
					if (f < t0) return null;
					const k = Math.min(1, (f - t0) / 6);
					return <Bill key={i} x={960 + ((i * 53) % 90) - 45} y={660 - i * 14 - 400 * (1 - k)} rot={((i * 41) % 30) - 15} />;
				})}
			</Felt>
			<Paper />
			<Tag f={f} t={6} x={70} y={100} text="BACK PAY" size={60} />
			<Tag f={f} t={30} x={1300} y={980} text="SEVERAL HUNDRED $" size={48} />
		</>
	);
};
const C095: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const pay = w('095', 0.42);
	const take = w('095', 0.62);
	const AX = 760;
	const env = f > take ? hp(1300, 1000, [110, -170], -1) : hp(AX, 1000, [130, -160]);
	return (
		<>
			<Sc bg="bg/recruit.jpg" a={camOn(1000, 640, 1.12)} b={camOn(1000, 630, 1.2)} id="l095" spots={REC_SPOTS} dark={0.25} glow="#ffd88a">
				<Ensign />
				<Toon id="adm95" r={CAST.admiral} x={AX} y={1000} s={S} facing={1} t={gf} pose={{hand: f > pay ? [130, -160] : [-60, -110], handB: [-150, -230]}} face={{look: [0.8, 0], mouth: 'frown', brows: 'down', turn: 0.5}} />
				<Toon id="fred95" r={CAST.fredNavy} x={1300} y={1000} s={S} facing={-1} t={gf} pose={f > take ? {hand: [110, -170], handB: [-72, -86]} : {hand: [40, -150], handB: [-40, -150]}} face={{look: [0.8, 0], mouth: f > take ? 'grin' : f > pay ? 'o' : 'frown', brows: f > take ? 'up' : 'worried', dollar: f > take + 4}} />
				{f > pay ? (
					<g transform={`translate(${env[0]},${env[1]})`}>
						<rect x={-44} y={-30} width={88} height={56} rx={4} fill="#e8dcc0" stroke={INK} strokeWidth={4} />
						<path d="M-44,-30 L0,4 L44,-30" stroke={INK} strokeWidth={3} fill="none" />
						<text x={0} y={18} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={22} fill="#3a6a4a">
							$
						</text>
					</g>
				) : null}
			</Sc>
			<Paper />
			<Tag f={f} t={4} x={70} y={100} text="FIRED" box="cross" size={56} />
			<Tag f={f} t={pay + 4} x={70} y={190} text="AND PAID" box="check" size={52} />
		</>
	);
};

/* ================================ 096 back to the States: richer and very famous ================================ */
const Flash: React.FC<{f: number; t: number; x: number; y: number}> = ({f, t, x, y}) => {
	const k = (f - t) % 24;
	if (f < t || k > 6) return null;
	return (
		<g opacity={1 - k / 6}>
			<circle cx={x} cy={y} r={40 + k * 18} fill="#fff" opacity={0.6} />
			<path d={`M${x - 80},${y} L${x + 80},${y} M${x},${y - 80} L${x},${y + 80}`} stroke="#fff" strokeWidth={6} />
		</g>
	);
};
const Camera: React.FC<{x: number; y: number; flip?: boolean}> = ({x, y, flip}) => (
	<g transform={`translate(${x},${y}) scale(${flip ? -1 : 1},1)`}>
		<line x1={0} y1={0} x2={-40} y2={180} stroke={INK} strokeWidth={6} />
		<line x1={0} y1={0} x2={40} y2={180} stroke={INK} strokeWidth={6} />
		<rect x={-50} y={-60} width={100} height={70} rx={8} fill="#2a2a30" stroke={INK} strokeWidth={4} />
		<circle cx={50} cy={-26} r={22} fill="#5a6a7a" stroke={INK} strokeWidth={4} />
		<path d="M-30,-60 L-30,-90 L10,-90 L10,-60" fill="#c8ccd6" stroke={INK} strokeWidth={4} />
	</g>
);
const C096: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const inn = walk(f, 0, w('096', 0.3), -100, 960);
	const rich = w('096', 0.38);
	const fame = w('096', 0.66);
	return (
		<>
			<Backdrop c="#2a3a5a">
				<Toon id="fred96" r={CAST.fredSuit} x={inn.x} y={980 - inn.bob} s={S * 1.1} t={gf} pose={inn.step ? {step: inn.step, hand: [70, -80], handB: [-44, -110]} : f > fame ? {hand: [40, -330], handB: [70, -80]} : {hand: [70, -80], handB: [-72, -86]}} face={{look: [0.3, -0.1], mouth: 'grin', brows: 'up', lids: f > fame ? 'sly' : undefined, dollar: f > rich && f < fame}} />
				<rect x={inn.x + (inn.step ? 70 : 70) * S * 1.1} y={980 - 70 * S * 1.1 - inn.bob} width={70 * S} height={52 * S} rx={6} fill="#7a4e2a" stroke={INK} strokeWidth={4} />
				{f > fame ? (
					<>
						<Camera x={420} y={800} />
						<Camera x={1500} y={800} flip />
						<Flash f={f} t={fame + 2} x={470} y={770} />
						<Flash f={f} t={fame + 12} x={1450} y={770} />
					</>
				) : null}
			</Backdrop>
			<Paper />
			<Tag f={f} t={4} x={70} y={100} text="BACK TO THE U.S." size={52} />
			<Tag f={f} t={rich + 2} x={1300} y={100} text="RICHER" box="check" size={50} />
			<Tag f={f} t={fame + 2} x={1300} y={190} text="FAMOUS" box="check" size={50} />
		</>
	);
};

/* ================================ 097–098 Life magazine, January 1952 ================================ */
const C097: React.FC = () => {
	const {f} = useShot();
	const w = useW();
	const k = snap(f, 4);
	const date = w('098', 0.1);
	const pile = w('098', 0.45);
	return (
		<>
			<Felt>
				{f > pile
					? Array.from({length: 6}).map((_, i) => (f > pile + i * 3 ? <Mag key={i} x={[380, 1540, 300, 1620, 520, 1400][i]} y={[300, 300, 760, 760, 560, 560][i]} s={0.6} rot={((i * 47) % 24) - 12} /> : null))
					: null}
				<Mag x={960} y={540} s={0.6 + 0.6 * Math.min(k, 1.1)} rot={-4 + 10 * (1 - Math.min(k, 1))} date="JAN. 1952" />
				<Stamp f={f} t={date} x={1150} y={300} text="JANUARY 1952" rot={10} size={52} />
			</Felt>
			<Paper />
			<Tag f={f} t={10} x={70} y={100} text="SELLS HIS STORY" size={52} />
		</>
	);
};

/* ================================ 099 great for money, terrible for a man who changes names ================================ */
const C099: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const bad = w('099', 0.42);
	return (
		<>
			<Backdrop c="#3a3a2a">
				{/* bills fall and stay on the floor */}
				{Array.from({length: 7}).map((_, i) => {
					const t0 = 4 + i * 4;
					if (f < t0) return null;
					const k = Math.min(1, (f - t0) / 14);
					const x = 640 + i * 110;
					return (
						<g key={i} transform={`translate(${x + 30 * Math.sin(k * 6 + i)},${-40 + 1040 * k}) rotate(${k < 1 ? 40 * Math.sin(k * 8 + i) : ((i * 23) % 20) - 10}) scale(0.5,${k < 1 ? 0.5 : 0.25})`}>
							<rect x={-110} y={-50} width={220} height={100} rx={6} fill="#a8d0a0" stroke={INK} strokeWidth={6} />
						</g>
					);
				})}
				{f > bad
					? [
							[300, 300, -8],
							[1620, 300, 7],
							[420, 700, 6],
							[1500, 700, -6],
							[960, 220, 0],
						].map(([x, y, r], i) => (f > bad + i * 4 ? <Mag key={i} x={x} y={y} s={0.48 * Math.min(1.1, snap(f, bad + i * 4))} rot={r} /> : null))
					: null}
				<Toon id="fred99" r={CAST.fredSuit} x={960} y={980} s={S * 1.1} t={gf} pose={f > bad ? {hand: [90, -260], handB: [-90, -260]} : {hand: [100, -220], handB: [-100, -220]}} face={{look: f > bad ? [Math.sin(f / 5), -0.3] : [0.2, -0.3], mouth: f > bad ? 'o' : 'grin', brows: f > bad ? 'worried' : 'up', dollar: f < bad, sweat: f > bad + 10}} />
			</Backdrop>
			<Paper />
			<Tag f={f} t={6} x={70} y={980} text="MONEY" box="check" size={52} until={bad} />
			<Tag f={f} t={bad + 22} x={70} y={980} text="EVERYONE KNOWS HIS FACE" size={46} />
		</>
	);
};

/* ================================ 100 fake papers; a prison job in Huntsville, Texas ================================ */
const C100: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const prison = w('100', 0.4);
	if (f < prison) {
		return (
			<>
				<Felt>
					<Sheet x={960} y={540} w={760} h={460} rot={-4} k={snap(f, 2)}>
						<rect x={-380} y={-230} width={760} height={70} fill="#c8b890" />
						<text x={0} y={-182} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} fill={INK}>
							CERTIFICATE · PENOLOGY
						</text>
						<rect x={-340} y={-130} width={220} height={260} fill="#a8a090" stroke={INK} strokeWidth={4} />
						<circle cx={-230} cy={-30} r={70} fill="#f1d2b0" stroke={INK} strokeWidth={4} />
						<path d="M-298,-50 Q-280,-110 -230,-104 Q-176,-110 -160,-50 Q-190,-76 -230,-76 Q-270,-76 -298,-50 Z" fill="#3a2a20" />
						<text x={-80} y={-60} fontFamily={HAND} fontWeight={700} fontSize={56} fill="#2a4a8a">
							Ben W. Jones
						</text>
						{[0, 1, 2].map((j) => (
							<line key={j} x1={-80} y1={10 + j * 44} x2={330} y2={10 + j * 44} stroke="#8a8070" strokeWidth={8} />
						))}
					</Sheet>
					<Stamp f={f} t={Math.round(prison * 0.55)} x={1200} y={700} text="FAKE" rot={-14} size={80} />
				</Felt>
				<Paper />
			</>
		);
	}
	const inn = walk(f, prison, prison + 34, 2050, 1150);
	const jingle = Math.sin(f / 2) * 10;
	const kp = hp(inn.x, 1000 - inn.bob, [-60, -110], -1);
	return (
		<>
			<Sc bg="bg/prison.jpg" a={camOn(1000, 640, 1.06)} b={camOn(1060, 640, 1.14)} id="l100" spots={PRISON_SPOTS} dark={0.25} glow="#ffcf7a">
				<Toon id="fred100" r={CAST.fredGuard} x={inn.x} y={1000 - inn.bob} s={S} facing={-1} t={gf} pose={inn.step ? {step: inn.step, hand: [44, -110], handB: [-60, -110]} : {hand: [72, -86], handB: [-60, -110]}} face={{look: [0.7, -0.2], mouth: 'grin', brows: 'sly', lids: 'sly'}} />
				<g transform={`translate(${kp[0]},${kp[1]}) rotate(${jingle})`}>
					<circle r={16} fill="none" stroke="#c8a040" strokeWidth={5} />
					<rect x={-4} y={14} width={8} height={30} fill="#c8a040" stroke={INK} strokeWidth={2} />
					<rect x={8} y={10} width={8} height={26} fill="#c8a040" stroke={INK} strokeWidth={2} transform="rotate(-25)" />
				</g>
			</Sc>
			<Paper />
			<Tag f={f} t={prison + 4} x={70} y={860} sub="Texas" text="HUNTSVILLE PRISON" size={52} />
			<Tag f={f} t={prison + 30} x={1250} y={100} text="PRISON OFFICER" size={50} />
		</>
	);
};

/* ================================ 101–103 an inmate finds an old Life; "Ain't this you?"; caught again ================================ */
const C101: React.FC<{close?: boolean}> = ({close}) => {
	const {f, gf} = useShot();
	const w = useW();
	const until = w('101', 0.42);
	const look = w('101', 0.7);
	const ask = w('102', 0);
	const caught = w('103', 0);
	const again = w('103', 0.5);
	const conT = talk('CON', gf);
	const stroll = f < until ? walk(f, w('101', 0) - 6, until, 420, 900) : {x: 900, step: 0, bob: 0};
	const run = kk(f, again + 2, again + 16);
	const fx = stroll.x - 1500 * run * run;
	const running = run > 0 && run < 1;
	const CX = 1350;
	const magAt = f > ask ? hp(CX, 1000, [110, -260], -1) : f > until ? hp(CX, 1000, [90, -200], -1) : hp(CX, 1000, [90, -170], -1);
	return (
		<>
			<Sc bg="bg/prison.jpg" a={close ? camOn(1120, 600, 1.4) : camOn(1050, 640, 1.1)} b={close ? camOn(1050, 620, 1.3) : camOn(1100, 620, 1.24)} id="l101" spots={PRISON_SPOTS} dark={0.25} glow="#ffcf7a">
				<Toon id="con101" r={CAST.con} x={CX} y={1000} s={S} facing={-1} t={gf} pose={f > ask ? {hand: [110, -260], handB: [60, -230]} : {hand: [90, f > until ? -200 : -170], handB: [60, -170]}} face={{look: f > look ? [0.8, -0.1] : [0.6, 0.5], mouth: f > ask ? 'grin' : f > look ? 'o' : 'closed', brows: f > look ? 'up' : 'flat', lids: f > ask + 30 ? 'sly' : undefined, talk: conT}} />
				<Mag x={magAt[0]} y={magAt[1]} s={0.3} rot={f > ask ? -6 : 8} />
				{run < 1 ? (
					<Toon id="fred101" r={CAST.fredGuard} x={fx} y={1000 - stroll.bob - (running ? Math.abs(Math.sin(f * 1.4)) * 10 : 0)} s={S} facing={running ? -1 : 1} t={gf} pose={running ? {step: Math.sin(f * 1.4), hand: [80, -70], handB: [-90, -200], lean: 14} : f > caught ? {hand: [60, -240], handB: [-60, -240]} : f < until ? {step: stroll.step, hand: [72, -86], handB: [-72, -86]} : {hand: [72, -86], handB: [-72, -86]}} face={{look: f > ask ? [0.8, -0.1] : [0.4, -0.3], mouth: f > ask ? 'o' : f < until ? 'o' : 'smile', brows: f > ask ? 'worried' : 'up', sweat: f > ask + 10}} />
				) : null}
				{f < until && f % 20 < 14 ? (
					<text x={stroll.x - 140} y={1000 - 330 * S - (f % 20) * 2} fontFamily={FONT} fontWeight={900} fontSize={60} fill="#f2c94c" stroke={INK} strokeWidth={5} style={{paintOrder: 'stroke'}}>
						♪
					</text>
				) : null}
				{f > again + 2
					? [0, 1, 2, 3].map((j) => {
							const k = kk(f, again + 4 + j * 2, again + 28 + j * 2);
							return <circle key={j} cx={900 - j * 70 - 40 * k} cy={980 - 30 * k} r={22 + 30 * k} fill="#d8c8a8" opacity={0.6 * (1 - k)} />;
						})
					: null}
			</Sc>
			<Paper />
			<Tag f={f} t={6} x={70} y={100} text="ALL FINE" box="check" size={52} until={until} />
			<Tag f={f} t={until + 4} x={70} y={100} text="AN OLD COPY" size={52} until={ask} />
			<Tag f={f} t={caught + 2} x={70} y={100} text="CAUGHT BY HIS OWN STORY" size={46} />
			<Tag f={f} t={again + 4} x={70} y={190} text="AGAIN" size={60} c="#ff8a7a" />
		</>
	);
};

const C102: React.FC = () => <C101 close />;

export const SHOTS_C5: ShotDef[] = [
	{at: '084', C: C084},
	{at: '084', off: T('084', 0.42), C: C084b},
	{at: '085', C: C085},
	{at: '086', C: C086},
	{at: '087', C: C087},
	{at: '089', C: C089},
	{at: '090', C: C090},
	{at: '091', C: C091},
	{at: '092', C: C092},
	{at: '094', C: C094},
	{at: '095', C: C095},
	{at: '096', C: C096},
	{at: '097', C: C097},
	{at: '099', C: C099},
	{at: '100', C: C100},
	{at: '101', C: C101},
	{at: '102', C: C102},
];
void Icon;

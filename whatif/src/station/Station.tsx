// «Метеостанция»: что если ты один на краю света. Герой — Фонарик (бирюзовый дождевик, налобный фонарь).
// Вертикаль 9:16, 1 минута, без субтитров. Сцены — в мире 1920×1080 шаблона, вырезаются окном 9:16 (V).
// Голос — файл пользователя (public/station/voice.mp3), тайминги слов — words.json (распознано по аудио).
import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {Layer, Svg} from '../engine/camera';
import {Stage, camOn, mixCam, clamp, ease, flash} from '../kit/kit';
import {Actor, AngleCtx, ShotCtx, TalkOverride} from '../kit/core';
import {SIT, blend, env, gesture, idle, reach, walkTo} from '../kit/actions';
import {Callout} from '../kit/graphics';
import {Onoma} from '../reference/PauseTime';
import {FONT, HAND} from '../kit/ui';
import WORDS from './words.json';

const FPS = 30;
type Wd = {w: string; t: number; e: number};
const WD = WORDS as Wd[];
const clean = (s: string) => s.toLowerCase().replace(/[.,?!«»—\-]/g, '');
const at = (p: string, n = 1) => {
	let c = 0;
	for (const x of WD) if (clean(x.w).startsWith(clean(p)) && ++c === n) return x.t;
	throw new Error('нет слова ' + p);
};
const VO_DUR = 49.16;
export const AD1 = 29.8; // тишина после «никому»
export const AD_LEN = 5.97, AD_HOLD = 0.6 + AD_LEN + 0.25, END_CARD = 2.6;
const END = VO_DUR + 0.2;
export const ST_FRAMES = Math.ceil((END + END_CARD + AD_HOLD) * FPS);
const storyT = (s: number) => (s < AD1 ? s : s < AD1 + AD_HOLD ? AD1 : s - AD_HOLD);
const inAd = (s: number) => s >= AD1 + 0.6 && s < AD1 + AD_HOLD;

// кто говорит (рот шевелится): герой, «Михалыч» по рации, двойник за дверью
const RANGES: Record<string, [number, number][]> = {FON: [[23.4, 24.95]], MIH: [[21.2, 23.05], [25.3, 29.5]], FAKE: [[40.7, 43.05]]};
const talkAt = (sp: string, T: number) => ((RANGES[sp] ?? []).some(([a, b]) => T >= a && T <= b) ? 0.35 + 0.45 * Math.abs(Math.sin(T * 17)) * (0.6 + 0.4 * Math.sin(T * 5.3)) : 0);

const TEAL = '#1f9a96', SNOW = '#dfe8f4', NIGHT = '#0a1024';
const K = 1920 / 1080; // мир 1080 по высоте → экран 1920
// окно 9:16 из сцены 16:9: fx — центр окна по экрану сцены
const V: React.FC<{fx?: number; h?: number; children: React.ReactNode}> = ({fx = 960, h = 1920, children}) => {
	const k = h / 1080;
	return (
		<div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: h, overflow: 'hidden'}}>
			<div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: `translate(${540 - fx * k}px,0px) scale(${k})`, transformOrigin: '0 0'}}>{children}</div>
		</div>
	);
};
type SP = {t: number; T: number; f: number};

// ---------- места ----------
const NightSky: React.FC<{T: number}> = ({T}) => (
	<Svg>
		<defs>
			<linearGradient id="st-sky" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor="#050818" />
				<stop offset="0.6" stopColor="#0f1838" />
				<stop offset="1" stopColor="#1d2a54" />
			</linearGradient>
		</defs>
		<rect x={-600} y={-400} width={3100} height={1700} fill="url(#st-sky)" />
		{Array.from({length: 120}).map((_, i) => (
			<circle key={i} cx={-500 + random('sx' + i) * 2900} cy={-300 + random('sy' + i) * 900} r={0.8 + random('sr' + i) * 1.8} fill="#fff" opacity={0.35 + 0.5 * Math.abs(Math.sin(T * (0.5 + random('st' + i)) + i))} />
		))}
		{/* северное сияние */}
		{[0, 1, 2].map((k) => (
			<path key={k} d={`M -500 ${120 + k * 50} C 200 ${0 + k * 40 + Math.sin(T * 0.4 + k) * 40}, 900 ${260 + k * 30}, 2400 ${80 + k * 60}`} stroke={k === 1 ? '#3fe0a8' : '#2fb39a'} strokeWidth={70 - k * 15} fill="none" opacity={0.1 + 0.05 * Math.sin(T * 0.7 + k)} style={{filter: 'blur(18px)'}} />
		))}
	</Svg>
);
const Forest: React.FC<{y?: number; c?: string}> = ({y = 790, c = '#0b1226'}) => (
	<Svg>
		{Array.from({length: 46}).map((_, i) => {
			const x = -500 + i * 66 + random('fx' + i) * 30, h = 120 + random('fh' + i) * 140;
			return <polygon key={i} points={`${x},${y} ${x + 34},${y - h} ${x + 68},${y}`} fill={c} />;
		})}
		<rect x={-600} y={y - 2} width={3100} height={40} fill={c} />
	</Svg>
);
const Ground: React.FC = () => (
	<Svg>
		<rect x={-600} y={800} width={3100} height={600} fill="#c9d6e8" />
		<path d="M -600 800 Q 0 770 600 800 T 1800 795 T 2500 805 L 2500 1400 L -600 1400 Z" fill={SNOW} />
		{Array.from({length: 18}).map((_, i) => (
			<ellipse key={i} cx={-400 + i * 170} cy={880 + (i % 3) * 70} rx={120} ry={10} fill="#b8c6dc" opacity={0.6} />
		))}
	</Svg>
);
// станция: домик, мачта с анемометром и красным огнём, окно горит
const Station: React.FC<{T: number; win?: number}> = ({T, win = 1}) => (
	<Svg>
		<rect x={1250} y={420} width={10} height={480} fill="#3a4256" />
		<g transform={`translate(1255,420) rotate(${T * 400})`}>
			{[0, 120, 240].map((a) => <g key={a} transform={`rotate(${a})`}><line x1={0} y1={0} x2={0} y2={-34} stroke="#3a4256" strokeWidth={4} /><circle cx={0} cy={-36} r={8} fill="#5a6476" /></g>)}
		</g>
		<circle cx={1255} cy={404} r={7} fill="#ff4a4a" opacity={Math.floor(T * 1.5) % 2 ? 1 : 0.2} />
		<circle cx={1255} cy={404} r={20} fill="#ff4a4a" opacity={Math.floor(T * 1.5) % 2 ? 0.25 : 0} />
		<rect x={760} y={640} width={420} height={260} fill="#5f6b80" stroke="#1a2032" strokeWidth={6} />
		<polygon points="740,650 970,540 1200,650" fill="#47526a" stroke="#1a2032" strokeWidth={6} />
		<polygon points="760,640 970,545 1180,640 1170,652 970,562 770,652" fill="#eef4fb" />
		<rect x={820} y={700} width={140} height={100} fill={win ? '#ffd27a' : '#1a2032'} stroke="#1a2032" strokeWidth={6} />
		<path d="M 890 700 L 890 800 M 820 750 L 960 750" stroke="#1a2032" strokeWidth={5} />
		{win ? <polygon points="820,800 960,800 1010,900 780,900" fill="#ffd27a" opacity={0.12} /> : null}
		<rect x={1040} y={730} width={90} height={170} fill="#3a4256" stroke="#1a2032" strokeWidth={6} />
		<circle cx={1118} cy={820} r={6} fill="#c8c0a0" />
		<rect x={1040} y={712} width={90} height={18} fill="#eef4fb" />
		<text x={970} y={630} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={22} fill="#1a2032">СЕВЕР-7</text>
	</Svg>
);
// следы босых ног: k — сколько видно (0..1), от леса (x0) к двери
const footAt = (i: number, n: number) => {
	const u = i / (n - 1);
	return {x: 260 + u * 800 + (i % 2 ? 14 : -14), y: 990 - u * 82, s: 1.25 - u * 0.45, rot: -10 + u * 6};
};
const Foot: React.FC<{x: number; y: number; s: number; rot: number; o?: number}> = ({x, y, s, rot, o = 1}) => (
	<g transform={`translate(${x},${y}) rotate(${rot - 90}) scale(${s})`} opacity={o}>
		<ellipse cx={0} cy={0} rx={20} ry={9} fill="#7f8fa8" />
		{[0, 1, 2, 3, 4].map((k) => <circle key={k} cx={24 + (k === 0 ? 2 : 0)} cy={-9 + k * 4.5} r={k === 0 ? 4 : 3} fill="#7f8fa8" />)}
	</g>
);
const Prints: React.FC<{k: number; n?: number}> = ({k, n = 16}) => (
	<Svg>
		{Array.from({length: n}).map((_, i) => {
			const p = footAt(i, n);
			return i / n <= k ? <Foot key={i} {...p} /> : null;
		})}
	</Svg>
);
const Snowfall: React.FC<{T: number; n?: number}> = ({T, n = 90}) => (
	<Svg>
		{Array.from({length: n}).map((_, i) => {
			const x = ((random('nx' + i) * 2600 + T * (20 + random('nv' + i) * 40)) % 2600) - 340;
			const y = ((random('ny' + i) * 1300 + T * (60 + random('nw' + i) * 80)) % 1300) - 120;
			return <circle key={i} cx={x} cy={y} r={2 + random('nr' + i) * 3} fill="#fff" opacity={0.75} />;
		})}
	</Svg>
);
// комната станции: окно, стол с рацией, часы, вешалка с курткой, дверь
const Room: React.FC<{T: number; coat?: number; doorShake?: number}> = ({T, coat = 1, doorShake = 0}) => (
	<Svg>
		<rect x={-600} y={-300} width={3100} height={1700} fill="#3a2e28" />
		{Array.from({length: 34}).map((_, i) => <rect key={i} x={-600 + i * 92} y={-300} width={4} height={1200} fill="#2e2420" />)}
		<rect x={-600} y={900} width={3100} height={500} fill="#2a201c" />
		{Array.from({length: 8}).map((_, i) => <path key={i} d={`M -600 ${920 + i * 50} L 2500 ${920 + i * 50}`} stroke="#211915" strokeWidth={4} />)}
		{/* окно */}
		<rect x={500} y={380} width={260} height={280} fill="#0f1838" stroke="#1a1410" strokeWidth={14} />
		<path d="M 630 380 L 630 660 M 500 520 L 760 520" stroke="#1a1410" strokeWidth={10} />
		<rect x={500} y={640} width={260} height={20} fill="#eef4fb" opacity={0.8} />
		{/* термометр за окном */}
		<rect x={735} y={420} width={12} height={150} rx={6} fill="#e8e8e8" /><rect x={738} y={520} width={6} height={46} fill="#3a7af0" />
		{/* часы */}
		<g transform="translate(1400,330)">
			<circle r={52} fill="#efe6cc" stroke="#1a1410" strokeWidth={8} />
			<line x1={0} y1={0} x2={0} y2={-34} stroke="#1a1410" strokeWidth={6} strokeLinecap="round" />
			<line x1={0} y1={0} x2={30} y2={0} stroke="#1a1410" strokeWidth={6} strokeLinecap="round" />
		</g>
		{/* стол и рация */}
		<rect x={860} y={700} width={460} height={26} fill="#5a4030" stroke="#1a1410" strokeWidth={5} />
		<rect x={880} y={726} width={20} height={174} fill="#4a3424" /><rect x={1280} y={726} width={20} height={174} fill="#4a3424" />
		<rect x={1060} y={600} width={200} height={100} rx={8} fill="#3a4030" stroke="#1a1410" strokeWidth={5} />
		<circle cx={1110} cy={650} r={22} fill="#1a1e16" />{[0, 1, 2, 3].map((k) => <circle key={k} cx={1110} cy={650} r={6 + k * 5} fill="none" stroke="#2a3024" strokeWidth={2} />)}
		<rect x={1150} y={624} width={86} height={26} rx={4} fill="#9fe8a0" opacity={0.85} />
		<line x1={1240} y1={600} x2={1270} y2={470} stroke="#1a1410" strokeWidth={5} />
		<rect x={960} y={660} width={60} height={40} rx={10} fill="#2a2e34" />
		{/* вешалка и куртка */}
		<rect x={210} y={360} width={180} height={14} fill="#5a4030" stroke="#1a1410" strokeWidth={4} />
		{coat ? (
			<g>
				<path d="M 260 374 Q 230 420 236 640 L 360 640 Q 366 420 336 374 Z" fill={TEAL} stroke="#0e3e3c" strokeWidth={5} />
				<path d="M 270 374 Q 298 350 326 374 Q 298 400 270 374 Z" fill="#167a77" />
				{Array.from({length: 14}).map((_, i) => <circle key={i} cx={246 + random('cs' + i) * 104} cy={390 + random('cy' + i) * 240} r={4 + random('cr' + i) * 6} fill="#fff" opacity={0.85} />)}
				{[0, 1, 2].map((i) => <ellipse key={'d' + i} cx={260 + i * 40} cy={650 + ((T * 90 + i * 37) % 240)} rx={3} ry={6} fill="#9fd8ff" opacity={0.8} />)}
				<ellipse cx={298} cy={898} rx={70} ry={10} fill="#5a7a9a" opacity={0.6} />
			</g>
		) : null}
		{/* дверь */}
		<g transform={`translate(${doorShake ? Math.sin(T * 80) * 6 * doorShake : 0},0)`}>
			<rect x={1500} y={420} width={190} height={480} fill="#5a4636" stroke="#1a1410" strokeWidth={8} />
			<rect x={1530} y={450} width={130} height={180} fill="none" stroke="#3a2c22" strokeWidth={6} />
			<circle cx={1666} cy={680} r={10} fill="#c8a040" />
			<rect x={1650} y={600} width={30} height={14} fill="#2a2a2a" />
			{Array.from({length: 18}).map((_, i) => <circle key={i} cx={1500 + random('fr' + i) * 190} cy={430 + random('fy' + i) * 460} r={2 + random('fs' + i) * 4} fill="#dfe8f4" opacity={0.5} />)}
		</g>
	</Svg>
);
// темнота с лучом фонаря (мировые координаты): из (lx,ly) на цель (tx,ty)
const Beam: React.FC<{lx: number; ly: number; tx: number; ty: number; on?: number; dark?: number; spread?: number}> = ({lx, ly, tx, ty, on = 1, dark = 0.9, spread = 0.32}) => {
	const dx = tx - lx, dy = ty - ly, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, w = L * spread;
	const id = 'bm' + Math.round(lx) + Math.round(ty);
	return (
		<Layer depth={1}><Svg>
			<defs>
				<filter id={id + 'f'} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={26} /></filter>
				<mask id={id}>
					<rect x={-800} y={-600} width={3600} height={2400} fill="#fff" />
					<g filter={`url(#${id}f)`} opacity={on}>
						<polygon points={`${lx},${ly} ${tx + nx * w},${ty + ny * w} ${tx - nx * w},${ty - ny * w}`} fill="#000" />
						<circle cx={tx} cy={ty} r={w * 1.05} fill="#000" />
						<circle cx={lx} cy={ly} r={60} fill="#000" />
					</g>
				</mask>
			</defs>
			<rect x={-800} y={-600} width={3600} height={2400} fill="#03050c" opacity={dark} mask={`url(#${id})`} />
			{on > 0 ? <polygon points={`${lx},${ly} ${tx + nx * w},${ty + ny * w} ${tx - nx * w},${ty - ny * w}`} fill="#fff3c0" opacity={0.07 * on} /> : null}
		</Svg></Layer>
	);
};
// точка фонаря у стоящего героя масштаба s на полу floor
const lampXY = (x: number, floor: number, s: number, facing = 1): [number, number] => [x + facing * 6 * s, floor - 157 * s - 164 * s - 31 * s];
// руки героя «от первого лица» (бирюзовые рукава снизу кадра)
const PovHands: React.FC<{cx?: number; y?: number; spread?: number; lift?: number}> = ({cx = 960, y = 1000, spread = 230, lift = 0}) => (
	<Svg>
		{[-1, 1].map((k) => (
			<g key={k} transform={`translate(${cx + k * spread},${y - lift}) rotate(${k * -14})`}>
				<path d="M -46 200 L -34 10 Q 0 -10 34 10 L 46 200 Z" fill={TEAL} stroke="#0e3e3c" strokeWidth={5} />
				<ellipse cx={0} cy={0} rx={30} ry={24} fill="#0b0b0d" />
				{[-16, -5, 6, 17].map((fx) => <rect key={fx} x={fx - 5} y={-40} width={10} height={34} rx={5} fill="#0b0b0d" />)}
			</g>
		))}
	</Svg>
);

// ---------- сцены ----------
const S01: React.FC<SP> = ({t, T}) => {
	const cam = mixCam(camOn(970, 690, 1.05), camOn(890, 750, 1.6), interpolate(t, [0, 3], [0, 1], {...clamp, easing: ease}));
	return (
		<Stage cam={cam} bg={NIGHT} light={{night: true, x: 50, y: 20, o: 0.3}}>
			<Layer depth={2.4}><NightSky T={T} /></Layer>
			<Layer depth={1.6}><Forest /></Layer>
			<Layer depth={1}><Ground /><Station T={T} /><Svg>
				<g transform="translate(890,745)"><circle r={18} fill="#0b0b0d" /><rect x={-18} y={16} width={36} height={40} rx={10} fill={TEAL} /></g>
				<g opacity={interpolate(t, [0.4, 0.8], [0, 1], clamp)} transform="translate(890,670)"><rect x={-110} y={-30} width={220} height={52} rx={26} fill="#11142c" stroke="#ffc94a" strokeWidth={4} /><text y={8} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={28} fill="#fff">ЛЮДЕЙ: 1</text></g>
			</Svg></Layer>
			<Layer depth={0.85}><Snowfall T={T} /></Layer>
		</Stage>
	);
};
const S02: React.FC<SP> = ({t, T, f}) => {
	const cam = mixCam(camOn(960, 640, 1.2), camOn(960, 560, 0.62), interpolate(t, [0, 3.2], [0, 1], {...clamp, easing: ease}));
	const t0 = Math.round((at('ближайших') - (T - t)) * FPS);
	return (
		<Stage cam={cam} bg={NIGHT} light={{night: true, x: 50, y: 20, o: 0.3}}>
			<Layer depth={2.4}><NightSky T={T} /></Layer>
			<Layer depth={1}><Ground /><Station T={T} /><Svg>
				<Callout f={f} t0={t0} t1={t0 + 200} from={[970, 640]} to={[970, 240]} text="400 КМ ДО ЛЮДЕЙ" size={46} align="center" />
				{[1, 2, 3].map((k) => <circle key={k} cx={970} cy={760} r={200 * k + ((T * 120) % 200)} fill="none" stroke="#9fd8ff" strokeWidth={3} opacity={0.25 - k * 0.06} />)}
			</Svg></Layer>
			<Layer depth={0.85}><Snowfall T={T} /></Layer>
		</Stage>
	);
};
const S03: React.FC<SP> = ({t, T, f}) => {
	const cam = mixCam(camOn(1110, 560, 1.35), camOn(1150, 520, 1.55), interpolate(t, [0, 2.7], [0, 1], {...clamp, easing: ease}));
	const tc = at('минус') - (T - t);
	return (
		<Stage cam={cam} bg="#1a1410" light={{x: 60, y: 30, o: 0.3}}>
			<Layer depth={1}><Room T={T} /><Svg>
				<Actor who="fon" x={1080} seat={790} s={1} facing={1} pose={blend(SIT, gesture('rubChin', SIT, 1, f), 0.6)} expr="sleepy" mouth="flat" look={[0.4, -0.2]} />
				<g transform="translate(1110,330)" opacity={interpolate(t, [0.2, 0.5], [0, 1], clamp)}><rect x={-90} y={-26} width={180} height={50} rx={10} fill="#11142c" stroke="#ffc94a" strokeWidth={4} /><text y={11} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={32} fill="#fff">03:00</text></g>
				{t > tc ? <g transform={`translate(${1250},${420}) scale(${interpolate(t, [tc, tc + 0.25], [0.3, 1], clamp)})`}><rect x={-80} y={-34} width={160} height={66} rx={12} fill="#11142c" stroke="#5fb4ff" strokeWidth={4} /><text y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={42} fill="#9fd8ff">−40°</text></g> : null}
			</Svg></Layer>
			<Beam lx={0} ly={0} tx={0} ty={0} on={0} dark={0.35} />
		</Stage>
	);
};
const S04: React.FC<SP> = ({t, T, f}) => {
	const tOn = at('включаешь') - (T - t) + 0.25;
	const up = interpolate(t, [0, 0.5], [0, 1], clamp);
	const w = walkTo(f, Math.round((tOn + 0.6) * FPS), Math.round((tOn + 1.9) * FPS), 1080, 820, 3, 0.3);
	const handUp = env(f, Math.round((tOn - 0.4) * FPS), Math.round((tOn + 0.4) * FPS), 6, 6);
	const pose = reach(blend(blend(SIT, idle(f), up), w.pose, w.moving ? 1 : 0), 'F', [20, -200], handUp);
	const on = t > tOn ? 1 : 0;
	const [lx, ly] = lampXY(w.x, 900, 1, -1);
	const cam = mixCam(camOn(1060, 560, 1.5), camOn(880, 560, 1.3), interpolate(t, [tOn + 0.4, tOn + 2], [0, 1], {...clamp, easing: ease}));
	return (
		<Stage cam={cam} bg="#1a1410" light={false}>
			<Layer depth={1}><Room T={T} /><Svg>
				<Actor who="fon" x={w.x} floor={900} s={1} facing={-1} pose={pose} vx={w.vx} bob={w.bob} expr="worried" look={[0.6, 0]} acc={[on ? 'lamp' : 'lampoff']} />
			</Svg></Layer>
			<Beam lx={lx} ly={ly} tx={600} ty={540} on={on} dark={0.6 + 0.3 * on} />
			<Svg>{on && t < tOn + 0.15 ? <rect x={-800} y={-600} width={3600} height={2400} fill="#fff" opacity={0.25} /> : null}</Svg>
		</Stage>
	);
};
const S05: React.FC<SP> = ({t, T}) => {
	const tb = at('басы') - (T - t);
	const kz = interpolate(t, [tb - 0.1, tb + 0.4], [0, 1], {...clamp, easing: ease});
	const cam = mixCam(camOn(960, 640, 1.0), camOn(1000, 760, 2.0), kz);
	return (
		<Stage cam={cam} bg="#05070f" light={false}>
			<Layer depth={1.8}><NightSky T={T} /></Layer>
			<Layer depth={1}><Ground /><Svg>
				{Array.from({length: 7}).map((_, i) => <Foot key={i} x={760 + i * 70 + (i % 2 ? 16 : -16)} y={1010 - i * 34} s={1.3 - i * 0.07} rot={-30} o={interpolate(t, [0.3 + i * 0.1, 0.6 + i * 0.1], [0, 1], clamp)} />)}
			</Svg></Layer>
			<Beam lx={960} ly={1180} tx={980} ty={800} on={1} dark={0.92} spread={0.55} />
			{/* рама окна вблизи */}
			<Layer depth={0.75}><Svg>
				<rect x={-800} y={-600} width={3600} height={2400} fill="none" stroke="#1a1410" strokeWidth={0} />
				<path d="M -800 -600 L 2800 -600 L 2800 1700 L -800 1700 Z M 330 170 L 1590 170 L 1590 1010 L 330 1010 Z" fill="#1a1410" fillRule="evenodd" />
				<rect x={330} y={985} width={1260} height={30} fill="#eef4fb" opacity={0.7} />
			</Svg></Layer>
			<Layer depth={0.7}><PovHands cx={960} y={1080} spread={150} /></Layer>
			<Svg>{t > tb ? <g opacity={interpolate(t, [tb, tb + 0.2], [0, 1], clamp)}><Callout f={Math.round(t * FPS)} t0={Math.round(tb * FPS)} t1={Math.round(tb * FPS) + 200} from={[1000, 770]} to={[1000, 560]} text="БОСЫЕ" size={44} c="#ff6a5a" align="center" /></g> : null}</Svg>
		</Stage>
	);
};
const S06: React.FC<SP> = ({t, T, f}) => {
	const k = interpolate(t, [0, 2.4], [0, 1], clamp);
	const cam = mixCam(camOn(420, 820, 1.3), camOn(1000, 800, 1.25), interpolate(t, [0, 2.4], [0, 1], {...clamp, easing: ease}));
	const tb = Math.round((at('обратно') - (T - t)) * FPS);
	return (
		<Stage cam={cam} bg={NIGHT} light={{night: true, x: 50, y: 20, o: 0.3}}>
			<Layer depth={2.4}><NightSky T={T} /></Layer>
			<Layer depth={1.5}><Forest y={800} /></Layer>
			<Layer depth={1}><Ground /><Station T={T} /><Prints k={k} /><Svg>
				<Callout f={f} t0={tb} t1={tb + 200} from={[1085, 905]} to={[1000, 560]} text="ОБРАТНО — НЕТ" size={42} c="#ff6a5a" align="center" />
			</Svg></Layer>
			<Layer depth={0.85}><Snowfall T={T} /></Layer>
		</Stage>
	);
};
const Waves: React.FC<{x: number; y: number; T: number; on: number; c?: string}> = ({x, y, T, on, c = '#9fe8a0'}) => on <= 0 ? null : (
	<g opacity={on}>{[1, 2, 3].map((r) => <path key={r} d={`M ${x + 30 * r} ${y - 40 * r} Q ${x + 50 * r} ${y} ${x + 30 * r} ${y + 40 * r}`} stroke={c} strokeWidth={6} fill="none" opacity={0.3 + 0.6 * Math.abs(Math.sin(T * 9 + r))} />)}</g>
);
const S07: React.FC<SP> = ({t, T}) => {
	const hiss = T > at('шипит') - 0.1;
	const mih = talkAt('MIH', T) > 0;
	const grab = interpolate(t, [2.2, 3.2], [0, 1], {...clamp, easing: ease});
	const cam = mixCam(camOn(1140, 640, 2.2), camOn(1150, 625, 2.45), interpolate(t, [0, 3.6], [0, 1], clamp));
	return (
		<Stage cam={cam} bg="#1a1410" light={false}>
			<Layer depth={1}><Room T={T} /><Svg>
				<Waves x={1236} y={636} T={T} on={hiss || mih ? 1 : 0} />
				{hiss ? Array.from({length: 10}).map((_, i) => <circle key={i} cx={1110 + (random('h' + i + Math.floor(T * 12)) - 0.5) * 60} cy={650 + (random('k' + i + Math.floor(T * 12)) - 0.5) * 60} r={2} fill="#9fe8a0" opacity={0.7} />) : null}
				<g transform={`translate(${1320 - 300 * grab},${780 - 80 * grab}) rotate(-20)`}><path d="M 0 -20 L 260 -30 L 260 30 L 0 20 Z" fill={TEAL} stroke="#0e3e3c" strokeWidth={5} /><ellipse cx={-6} cy={0} rx={26} ry={22} fill="#0b0b0d" /></g>
			</Svg></Layer>
			<Beam lx={1500} ly={300} tx={1140} ty={650} on={1} dark={0.85} spread={0.35} />
			<Layer depth={1}><Svg><g opacity={interpolate(t, [1.2, 1.5], [0, 1], clamp)} transform="translate(1140,575)"><rect x={-95} y={-22} width={190} height={40} rx={20} fill="#11142c" stroke="#9fe8a0" strokeWidth={3} /><text y={7} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={20} fill="#fff">БАЗА · МИХАЛЫЧ</text></g></Svg></Layer>
		</Stage>
	);
};
const S08: React.FC<SP> = ({t, T, f}) => {
	const [lx, ly] = lampXY(960, 900, 1, 1);
	const cam = mixCam(camOn(960, 560, 2.3), camOn(950, 570, 2.55), interpolate(t, [0, 1.9], [0, 1], clamp));
	const pose = reach(idle(f), 'F', [34, -128], 1);
	return (
		<Stage cam={cam} bg="#1a1410" light={false}>
			<Layer depth={1}><Room T={T} /><Svg>
				<TalkOverride.Provider value={(sp) => talkAt(sp, T)}>
					<Actor who="fon" x={960} floor={900} s={1} facing={1} pose={pose} expr="wide" look={[0.7, -0.1]} faceTurn={0.4} />
				</TalkOverride.Provider>
				<rect x={985} y={655} width={34} height={22} rx={8} fill="#2a2e34" transform="rotate(-25 1000 666)" />
			</Svg></Layer>
			<Beam lx={lx} ly={ly} tx={1500} ty={600} on={1} dark={0.8} spread={0.3} />
		</Stage>
	);
};
// правило мелом на доске — вертикальный экран целиком
const RuleV: React.FC<SP> = ({t}) => {
	const lines = ['ночью', 'дверь', 'не открывать.', 'НИКОМУ.'];
	const starts = [at('ночью'), at('дверь', 1), at('открывать'), at('никому')].map((a) => a - at('тогда'));
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #2f4a3d 0%, #1b2b24 70%, #101a15 100%)'}}>
			<svg width={1080} height={1920} style={{transform: `perspective(2000px) rotateY(${Math.sin(t * 0.8) * 5}deg) scale(${1 + t * 0.01})`}}>
				<rect x={60} y={380} width={960} height={1160} rx={18} fill="none" stroke="#6b4a2a" strokeWidth={26} />
				<text x={540} y={560} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={92} fill="#f6e7a1" opacity={interpolate(t, [0, 0.3], [0, 1], clamp)}>Правило станции</text>
				<line x1={260} y1={600} x2={820} y2={600} stroke="#f6e7a1" strokeWidth={4} opacity={0.6} />
				{lines.map((l, i) => {
					const k = interpolate(t, [starts[i], starts[i] + 0.45], [0, 1], clamp);
					return (
						<g key={i}>
							<clipPath id={'rv' + i}><rect x={0} y={680 + i * 170} width={1080 * k} height={170} /></clipPath>
							<text x={540} y={800 + i * 170} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={i === 3 ? 140 : 110} fill={i === 3 ? '#ff7a6a' : '#f4f1e6'} clipPath={`url(#rv${i})`}>{l}</text>
						</g>
					);
				})}
			</svg>
		</AbsoluteFill>
	);
};
const S10: React.FC<SP> = ({t, T, f}) => {
	const turn = interpolate(T, [at('спиной') - 0.2, at('спиной') + 0.3], [0, 1], clamp);
	const facing = turn > 0.5 ? -1 : 1;
	const [lx, ly] = lampXY(1000, 900, 1, facing);
	const tx = interpolate(turn, [0, 1], [1500, 420]);
	const sk = Math.round((at('скрипит') - (T - t)) * FPS);
	const cam = mixCam(camOn(1000, 600, 1.4), camOn(900, 640, 1.25), turn);
	return (
		<Stage cam={cam} bg="#1a1410" light={false}>
			<Layer depth={1}><Room T={T} /><Svg>
				<Actor who="fon" x={1000} floor={900} s={1} facing={facing as 1 | -1} pose={gesture('handsOnHead', idle(f), 0.25 * turn, f)} expr="wide" look={[facing * 0.8, 0.2]} />
			</Svg></Layer>
			<Beam lx={lx} ly={ly} tx={tx} ty={720} on={1} dark={0.9} spread={0.3} />
			<Layer depth={1}><Svg><Onoma x={860} y={860} text="СКРИП" t={f - sk} c="#ffc94a" size={56} /></Svg></Layer>
		</Stage>
	);
};
const S11: React.FC<SP> = ({t, T, f}) => {
	const sweep = interpolate(t, [0, 1.2], [0, 1], {...clamp, easing: ease});
	const tx = interpolate(sweep, [0, 1], [700, 300]);
	const tm = Math.round((at('мокрая') - (T - t)) * FPS);
	const cam = mixCam(camOn(520, 560, 1.25), camOn(320, 520, 1.6), sweep);
	return (
		<Stage cam={cam} bg="#1a1410" light={false}>
			<Layer depth={1}><Room T={T} /></Layer>
			<Beam lx={540} ly={1200} tx={tx} ty={520} on={1} dark={0.93} spread={0.42} />
			<Layer depth={1}><Svg><Callout f={f} t0={tm} t1={tm + 200} from={[300, 470]} to={[300, 250]} text="МОКРАЯ" size={42} c="#5fb4ff" align="center" /></Svg></Layer>
			<Layer depth={0.7}><PovHands cx={560} y={1110} spread={200} lift={20} /></Layer>
		</Stage>
	);
};
const S12: React.FC<SP> = ({t, T, f}) => {
	const [lx, ly] = lampXY(960, 900, 1, -1);
	const cam = mixCam(camOn(960, 560, 2.0), camOn(960, 560, 2.3), interpolate(t, [0, 1.7], [0, 1], clamp));
	return (
		<Stage cam={cam} bg="#1a1410" light={false}>
			<Layer depth={1}><Room T={T} /><Svg>
				<Actor who="fon" x={960} floor={900} s={1} facing={-1} pose={gesture('scratch', idle(f), 1, f)} expr="worried" look={[-0.4, -0.3]} />
			</Svg></Layer>
			<Beam lx={lx} ly={ly} tx={500} ty={600} on={1} dark={0.75} spread={0.3} />
			<Layer depth={1}><Svg><g transform={`translate(960,450) scale(${interpolate(t, [0.3, 0.55], [0.3, 1], clamp)})`} opacity={interpolate(t, [0.3, 0.5], [0, 1], clamp)}><rect x={-120} y={-26} width={240} height={46} rx={23} fill="#11142c" stroke="#ff6a5a" strokeWidth={4} /><text y={8} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={22} fill="#fff">ВЫХОДИЛ: 0 РАЗ</text></g></Svg></Layer>
		</Stage>
	);
};
const KNOCKS = () => [at('стучат'), at('стучат') + 0.42, at('три') + 0.3];
const S13: React.FC<SP> = ({t, T, f}) => {
	const kn = KNOCKS();
	const shake = kn.some((k) => T > k && T < k + 0.15) ? 1 : 0;
	const cam = mixCam(camOn(1595, 640, 1.7), camOn(1595, 620, 1.9), interpolate(t, [0, 2.2], [0, 1], clamp));
	return (
		<Stage cam={{...cam, x: cam.x + (shake ? Math.sin(f * 3) * 10 : 0)}} bg="#1a1410" light={false}>
			<Layer depth={1}><Room T={T} doorShake={shake} /></Layer>
			<Beam lx={1000} ly={560} tx={1595} ty={640} on={1} dark={0.88} spread={0.3} />
			<Layer depth={1}><Svg>{kn.map((k, i) => <Onoma key={i} x={1560 + i * 30} y={560 + i * 70} text="ТУК" t={f - Math.round((k - (T - t)) * FPS)} c="#ff6a5a" size={56} rot={-8 + i * 8} />)}</Svg></Layer>
		</Stage>
	);
};
// сплит сверху/снизу: снаружи у двери стоит «ты», внутри — ты
const S14: React.FC<SP> = ({t, T, f}) => {
	const sp = (s: string) => talkAt(s, T);
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 955, overflow: 'hidden'}}>
				<V h={955} fx={960}>
					<ShotWrap f={f} k={0} len={120}>
						<Stage cam={camOn(1000, 650, 1.9)} bg={NIGHT} light={{night: true, x: 50, y: 20, o: 0.3}}>
							<Layer depth={2.2}><NightSky T={T} /></Layer>
							<Layer depth={1}><Ground /><Station T={T} win={1} /><Svg>
								<TalkOverride.Provider value={(s) => (s === 'FAKE' ? sp('FAKE') : 0)}>
									<Actor who="fake" x={980} floor={900} s={1} facing={1} pose={gesture('fist', idle(f, 4), 0.5 + 0.5 * Math.abs(Math.sin(t * 2)), f)} expr="normal" mouth="flat" look={[0.5, 0]} faceTurn={0.3} sp="FAKE" />
								</TalkOverride.Provider>
								<g transform="translate(980,480)"><rect x={-90} y={-26} width={180} height={46} rx={23} fill="#11142c" stroke="#ff6a5a" strokeWidth={3} /><text y={8} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={24} fill="#fff">СНАРУЖИ</text></g>
							</Svg></Layer>
							<Layer depth={0.85}><Snowfall T={T} /></Layer>
						</Stage>
					</ShotWrap>
				</V>
			</div>
			<div style={{position: 'absolute', left: 0, top: 965, width: 1080, height: 955, overflow: 'hidden'}}>
				<V h={955} fx={960}>
					<ShotWrap f={f} k={1} len={120}>
						<Stage cam={camOn(1380, 620, 1.7)} bg="#1a1410" light={false}>
							<Layer depth={1}><Room T={T} /><Svg>
								<Actor who="fon" x={1340} floor={900} s={1} facing={1} pose={gesture('handsOnHead', idle(f), 0.6, f)} expr="wide" look={[1, 0]} />
								<g transform="translate(1340,420)"><rect x={-90} y={-26} width={180} height={46} rx={23} fill="#11142c" stroke="#ffc94a" strokeWidth={3} /><text y={8} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={24} fill="#fff">ВНУТРИ</text></g>
							</Svg></Layer>
							<Beam lx={lampXY(1340, 900, 1, 1)[0]} ly={lampXY(1340, 900, 1, 1)[1]} tx={1600} ty={620} on={1} dark={0.85} spread={0.3} />
						</Stage>
					</ShotWrap>
				</V>
			</div>
			<div style={{position: 'absolute', left: 0, top: 955, width: 1080, height: 10, background: '#ff6a5a'}} />
		</AbsoluteFill>
	);
};
const S15: React.FC<SP> = ({t, T, f}) => {
	const [lx, ly] = lampXY(1100, 900, 1, 1);
	const kz = interpolate(T, [at('внутри'), at('дыхание') + 0.3], [0, 1], {...clamp, easing: ease});
	const cam = mixCam(camOn(1000, 600, 1.35), camOn(860, 560, 1.9), kz);
	const puff = (T - at('дыхание')) % 1.2;
	return (
		<Stage cam={cam} bg="#1a1410" light={false}>
			<Layer depth={1}><Room T={T} /><Svg>
				<Actor who="fon" x={1100} floor={900} s={1} facing={1} pose={idle(f)} expr="wide" look={[-0.9, 0]} faceTurn={0.2} />
			</Svg></Layer>
			<Beam lx={lx} ly={ly} tx={1600} ty={640} on={1} dark={0.94} spread={0.28} />
			<Layer depth={1}><Svg>
				{/* в темноте за спиной: глаза и пар дыхания */}
				<g opacity={interpolate(T, [at('внутри'), at('внутри') + 0.6], [0, 1], clamp)}>
					{[-1, 1].map((k) => <ellipse key={k} cx={800 + k * 16} cy={540} rx={6} ry={4 + (Math.floor(T * 2) % 5 === 0 ? -3 : 0)} fill="#e8f0ff" opacity={0.8} />)}
					{T > at('дыхание') - 0.2 ? <ellipse cx={830 + puff * 40} cy={575 - puff * 30} rx={14 + puff * 30} ry={8 + puff * 14} fill="#dfe8f4" opacity={0.35 * (1 - puff / 1.2)} /> : null}
				</g>
			</Svg></Layer>
		</Stage>
	);
};
const S16: React.FC<SP> = ({t, T, f}) => {
	const tOff = at('фонарь', 2) + 0.1;
	const off = T > tOff ? 1 : 0;
	const hand = env(f, Math.round((at('выключаешь') - (T - t)) * FPS), Math.round((tOff - (T - t) + 0.4) * FPS), 6, 8);
	const [lx, ly] = lampXY(960, 900, 1, 1);
	const cam = mixCam(camOn(960, 560, 2.2), camOn(960, 545, 2.6), interpolate(t, [0, 1.5], [0, 1], clamp));
	const black = interpolate(T, [tOff, tOff + 0.25], [0, 1], clamp);
	return (
		<Stage cam={cam} bg="#1a1410" light={false}>
			<Layer depth={1}><Room T={T} /><Svg>
				<Actor who="fon" x={960} floor={900} s={1} facing={1} pose={reach(idle(f), 'F', [16, -196], hand)} expr="sleepy" look={[0, -0.3]} acc={[off ? 'lampoff' : 'lamp']} />
			</Svg></Layer>
			<Beam lx={lx} ly={ly} tx={1500} ty={600} on={1 - off} dark={0.9} spread={0.3} />
			<AbsoluteFill style={{background: '#000', opacity: black}} />
		</Stage>
	);
};
const EndCard: React.FC<{t: number}> = ({t}) => (
	<AbsoluteFill style={{background: '#000', alignItems: 'center', justifyContent: 'center', fontFamily: FONT}}>
		<div style={{opacity: interpolate(t, [0.2, 0.6], [0, 1], clamp), textAlign: 'center', color: '#fff'}}>
			<div style={{fontSize: 92, fontWeight: 900, lineHeight: 1.05}}>А ЧТО БЫ<br />СДЕЛАЛ ТЫ?</div>
			<div style={{fontSize: 40, fontWeight: 700, color: '#9fe8e4', marginTop: 30, opacity: interpolate(t, [0.8, 1.2], [0, 1], clamp)}}>пиши в комментариях</div>
		</div>
	</AbsoluteFill>
);

// контекст сцены для Stage (покачивание камеры, авторакурс)
const ShotWrap: React.FC<{f: number; k: number; len: number; children: React.ReactNode}> = ({f, k, len, children}) => (
	<ShotCtx.Provider value={{f, gf: f, dur: len, start: 0, at: () => 0, end: () => 0}}>
		<AngleCtx.Provider value={{k: 0, t: f, len}}>{children}</AngleCtx.Provider>
	</ShotCtx.Provider>
);

type Cut = {C: React.FC<SP>; at: number; fx?: number; full?: boolean; whip?: boolean};
const CUTS: Cut[] = [
	{C: S01, at: 0},
	{C: S02, at: at('до') - 0.1},
	{C: S03, at: at('3') - 0.15, whip: true},
	{C: S04, at: at('ты', 2) - 0.1},
	{C: S05, at: at('на', 3) - 0.1},
	{C: S06, at: at('они') - 0.1, whip: true},
	{C: S07, at: at('рация') - 0.1, whip: true},
	{C: S08, at: at('вижу') - 0.1},
	{C: RuleV, at: at('тогда') - 0.1, full: true},
	{C: S10, at: AD1 + 0.05},
	{C: S11, at: at('лучь') - 0.1},
	{C: S12, at: at('ты', 3) - 0.1},
	{C: S13, at: at('стучат') - 0.45},
	{C: S14, at: at('открой') - 0.1, full: true},
	{C: S15, at: at('снаружи') - 0.1},
	{C: S16, at: at('ты', 4) - 0.1},
];

const Hud: React.FC<{T: number}> = ({T}) => {
	const sec = Math.floor(T);
	const clock = `03:00:${String(Math.min(59, sec)).padStart(2, '0')}`;
	return (
		<div style={{position: 'absolute', top: 54, left: 40, right: 40, display: 'flex', justifyContent: 'space-between', fontFamily: FONT, fontWeight: 800, fontSize: 30, color: '#fff', textShadow: '0 2px 6px #000'}}>
			<div style={{background: 'rgba(0,0,0,0.45)', padding: '8px 16px', borderRadius: 8}}>
				НОЧЬ 1 · <span style={{color: '#5ee0da'}}>СЕВЕР-7</span>
			</div>
			<div style={{background: 'rgba(0,0,0,0.45)', padding: '8px 16px', borderRadius: 8, fontVariantNumeric: 'tabular-nums'}}>
				{clock} · <span style={{color: '#9fd8ff'}}>−40°</span>
			</div>
		</div>
	);
};

export const StationShort: React.FC = () => {
	const fr = useCurrentFrame();
	const s = fr / FPS;
	const T = storyT(s);
	const ci = CUTS.reduce((a, c, i) => (T >= c.at ? i : a), 0);
	const cut = CUTS[ci];
	const next = ci + 1 < CUTS.length ? CUTS[ci + 1].at : END;
	const t = T - cut.at;
	const f = Math.round(t * FPS);
	const len = Math.max(1, Math.round((next - cut.at) * FPS));
	// вжух: въезд при смене локации, уезд перед следующей сменой
	const nextWhip = ci + 1 < CUTS.length && CUTS[ci + 1].whip;
	const kin = cut.whip ? interpolate(t, [0, 0.25], [1, 0], {...clamp, easing: ease}) : 0;
	const kout = nextWhip ? interpolate(T, [next - 0.2, next], [0, 1], {...clamp, easing: ease}) : 0;
	const dx = kin * 700 - kout * 700;
	const blur = (kin + kout) * 28;
	const ad1F = Math.round(AD1 * FPS), holdF = Math.round(AD_HOLD * FPS);
	const C = cut.C;
	const ended = T >= END;
	return (
		<AbsoluteFill style={{background: '#000'}}>
			{!ended ? (
				<AbsoluteFill style={{transform: `translateX(${dx}px)`, filter: blur > 0.5 ? `blur(${blur}px)` : undefined}}>
					{cut.full ? (
						<C t={t} T={T} f={f} />
					) : (
						<V fx={cut.fx ?? 960}>
							<ShotWrap f={f} k={ci} len={len}>
								<C t={t} T={T} f={f} />
							</ShotWrap>
						</V>
					)}
				</AbsoluteFill>
			) : (
				<EndCard t={T - END} />
			)}
			{!ended ? <Hud T={T} /> : null}
			{inAd(s) ? <AbsoluteFill style={{background: 'rgba(0,0,0,0.62)'}} /> : null}
			<Sequence from={0} durationInFrames={ad1F}>
				<Audio src={staticFile('station/voice.mp3')} />
				<Audio src={staticFile('station/bed.wav')} volume={0.85} />
			</Sequence>
			<Sequence from={ad1F + holdF}>
				<Audio src={staticFile('station/voice.mp3')} startFrom={ad1F} />
				<Audio src={staticFile('station/bed.wav')} volume={0.85} startFrom={ad1F} />
			</Sequence>
		</AbsoluteFill>
	);
};
void flash;

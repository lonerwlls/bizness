// «Метеостанция», часть 3 (финал): угол, рация, «Здесь» из-под кровати, фонарь — пусто, мокрая куртка;
// рассвет, вторые следы в ботинках твоего размера, вертолёт, «по списку вас двое», фонарь гаснет.
import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {Layer, Svg} from '../engine/camera';
import {Stage, camOn, mixCam, clamp, ease} from '../kit/kit';
import {Actor, TalkOverride} from '../kit/core';
import {idle, gesture, env, reach, blend} from '../kit/actions';
import {Callout} from '../kit/graphics';
import {FONT} from '../kit/ui';
import {Beam, Ground, HOUSE, PovHands, Room, ShotWrap, Station, V, Waves, lampXY, type SP} from '../station/Station';
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
const VO_DUR = 38.84;
export const AD1_3 = 20.95; // тишина после «твоя»
const AD_LEN = 5.97, AD_HOLD = 0.6 + AD_LEN + 0.25, END_CARD = 3.0;
const END = VO_DUR + 0.3;
export const ST3_FRAMES = Math.ceil((END + END_CARD + AD_HOLD) * FPS);
const storyT = (s: number) => (s < AD1_3 ? s : s < AD1_3 + AD_HOLD ? AD1_3 : s - AD_HOLD);
const inAd = (s: number) => s >= AD1_3 + 0.6 && s < AD1_3 + AD_HOLD;
const RANGES: Record<string, [number, number][]> = {FON: [[9.9, 11.1]], PILOT: [[34.3, 36.9]]};
const talkAt = (sp: string, T: number) => ((RANGES[sp] ?? []).some(([a, b]) => T >= a && T <= b) ? 0.35 + 0.45 * Math.abs(Math.sin(T * 17)) : 0);
const MOON = '#9fb8ff';
const pk = (T: number, w: string, n = 1, d = 0.45) => interpolate(T, [at(w, n) - 0.12, at(w, n) - 0.12 + d], [0, 1], {...clamp, easing: ease});
const Moon: React.FC<{o?: number; tx?: number; ty?: number}> = ({o = 0.8, tx = 960, ty = 640}) => <Beam lx={630} ly={430} tx={tx} ty={ty} on={1} dark={o} spread={0.75} c={MOON} />;
const Talk: React.FC<{T: number; children: React.ReactNode}> = ({T, children}) => <TalkOverride.Provider value={(sp) => talkAt(sp, T)}>{children}</TalkOverride.Provider>;

// кровать под окном
const Bed: React.FC<{jacket?: number}> = ({jacket = 0}) => (
	<Svg>
		<rect x={440} y={760} width={400} height={70} rx={10} fill="#5a4a6a" stroke="#1a1410" strokeWidth={5} />
		<rect x={450} y={740} width={120} height={40} rx={14} fill="#d8d4e0" stroke="#1a1410" strokeWidth={4} />
		<rect x={440} y={830} width={400} height={20} fill="#2a201c" />
		<rect x={450} y={850} width={14} height={50} fill="#2a201c" /><rect x={816} y={850} width={14} height={50} fill="#2a201c" />
		<rect x={464} y={850} width={352} height={50} fill="#06070c" />
		{jacket ? <g opacity={jacket}>
			<path d="M 560 898 Q 600 868 660 872 Q 720 866 760 896 Z" fill="#1f9a96" stroke="#0e3e3c" strokeWidth={4} />
			<path d="M 600 880 Q 620 870 640 880" stroke="#167a77" strokeWidth={5} fill="none" />
			{Array.from({length: 8}).map((_, i) => <circle key={i} cx={580 + random('jw' + i) * 170} cy={878 + random('jy' + i) * 18} r={3 + random('jr' + i) * 3} fill="#fff" opacity={0.85} />)}
			<ellipse cx={660} cy={900} rx={110} ry={6} fill="#7fa6d8" opacity={0.5} />
		</g> : null}
	</Svg>
);
// небо и свет рассвета
const DawnSky: React.FC<{T: number; k?: number}> = ({k = 1}) => (
	<Svg>
		<defs>
			<linearGradient id="dawn" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor={k > 0.5 ? '#5f7fc0' : '#1d2a54'} />
				<stop offset="0.55" stopColor={k > 0.5 ? '#f2a6a0' : '#3a3a6a'} />
				<stop offset="1" stopColor={k > 0.5 ? '#ffd9a0' : '#6a5a7a'} />
			</linearGradient>
		</defs>
		<rect x={-600} y={-400} width={3100} height={1700} fill="url(#dawn)" />
		<circle cx={300} cy={790} r={90} fill="#ffe6b0" opacity={0.9 * k} />
		<circle cx={300} cy={790} r={200} fill="#ffe6b0" opacity={0.18 * k} />
	</Svg>
);
const DayForest: React.FC = () => (
	<Svg>
		{Array.from({length: 46}).map((_, i) => {
			const x = -500 + i * 66 + random('dfx' + i) * 30, h = 120 + random('dfh' + i) * 140;
			return <polygon key={i} points={`${x},800 ${x + 34},${800 - h} ${x + 68},800`} fill="#3a4a5a" />;
		})}
	</Svg>
);
// следы ботинок: от крыльца в лес (налево)
const BOOT_PATH: [number, number][] = [[1110, 936], [900, 960], [620, 990], [320, 1020], [0, 1060]];
const bootAt = (i: number, n: number) => {
	const u = i / (n - 1), seg = Math.min(BOOT_PATH.length - 2, Math.floor(u * (BOOT_PATH.length - 1))), lu = u * (BOOT_PATH.length - 1) - seg;
	const [a, b] = [BOOT_PATH[seg], BOOT_PATH[seg + 1]];
	return {x: a[0] + (b[0] - a[0]) * lu, y: a[1] + (b[1] - a[1]) * lu + (i % 2 ? 9 : -9), s: 0.7 + u * 0.5, rot: (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI};
};
const Boot: React.FC<{x: number; y: number; s: number; rot: number; o?: number}> = ({x, y, s, rot, o = 1}) => (
	<g transform={`translate(${x},${y}) scale(1,0.5) rotate(${rot}) scale(${s})`} opacity={o}>
		<rect x={-24} y={-11} width={48} height={22} rx={11} fill="#8a98b0" />
		{[-14, -6, 2, 10].map((k) => <line key={k} x1={k} y1={-8} x2={k} y2={8} stroke="#6a7890" strokeWidth={3} />)}
	</g>
);
const Boots: React.FC<{k: number; n?: number}> = ({k, n = 16}) => (
	<Svg>{Array.from({length: n}).map((_, i) => (i / n <= k ? <Boot key={i} {...bootAt(i, n)} /> : null))}</Svg>
);
// вертолёт
const Heli: React.FC<{x: number; y: number; T: number; s?: number}> = ({x, y, T, s = 1}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<ellipse cx={0} cy={0} rx={150} ry={70} fill="#d84a3a" stroke="#1a1410" strokeWidth={6} />
		<path d="M 120 -10 L 330 -30 L 330 0 L 120 20 Z" fill="#d84a3a" stroke="#1a1410" strokeWidth={5} />
		<rect x={318} y={-80} width={16} height={70} fill="#2a2e38" />
		<ellipse cx={-70} cy={-10} rx={60} ry={40} fill="#9fd8ff" stroke="#1a1410" strokeWidth={5} />
		<line x1={-90} y1={70} x2={-90} y2={100} stroke="#1a1410" strokeWidth={6} /><line x1={70} y1={70} x2={70} y2={100} stroke="#1a1410" strokeWidth={6} />
		<line x1={-150} y1={100} x2={130} y2={100} stroke="#1a1410" strokeWidth={8} />
		<rect x={-8} y={-96} width={16} height={28} fill="#2a2e38" />
		<ellipse cx={0} cy={-98} rx={300} ry={10} fill="#2a2e38" opacity={0.45 + 0.3 * Math.abs(Math.sin(T * 40))} />
		<text x={20} y={30} fontFamily={FONT} fontWeight={900} fontSize={30} fill="#fff">МЧС</text>
	</g>
);

// ---------- сцены ----------
const Q01: React.FC<SP> = ({t, T}) => {
	const cam = mixCam(camOn(1595, 640, 2.0), camOn(1500, 640, 1.5), interpolate(t, [0, 1.4], [0, 1], {...clamp, easing: ease}));
	const pull = interpolate(t, [0.2, 1.1], [0, 1], {...clamp, easing: ease});
	return (
		<Stage cam={cam} bg="#000" light={false}>
			<Layer depth={1}><Room T={T} /></Layer>
			<Moon tx={1595} ty={640} o={0.82} />
			<Layer depth={0.7}><PovHands cx={1560 - 160 * pull} y={980 + 120 * pull} spread={90} /></Layer>
		</Stage>
	);
};
const Q02: React.FC<SP> = ({t, T, f}) => {
	const beat = Math.max(0, Math.sin(T * 7.5)) ** 8;
	const cam = mixCam(camOn(1380, 760, 1.6), camOn(1380, 740, 2.1), interpolate(t, [0, 3], [0, 1], clamp));
	const sit = {lean: 18, head: 8, armB: [20, 40] as [number, number], armF: [55, 40] as [number, number], legB: [70, 150] as [number, number], legF: [95, 150] as [number, number]};
	return (
		<Stage cam={{...cam, zoom: cam.zoom * (1 + 0.02 * beat)}} bg="#000" light={false}>
			<Layer depth={1}><Room T={T} /><Svg><Actor who="fon" x={1380} seat={828} s={1} facing={-1} pose={sit} expr="worried" look={[-0.4, 0]} acc={['lampoff']} /></Svg></Layer>
			<Moon tx={1380} ty={740} o={0.8} />
			<AbsoluteFill style={{boxShadow: `inset 0 0 ${200 + 120 * beat}px rgba(120,0,0,${0.35 * beat})`}} />
		</Stage>
	);
};
const Q03: React.FC<SP> = ({t, T}) => {
	const cam = mixCam(camOn(1595, 640, 1.7), camOn(1595, 640, 1.85), interpolate(t, [0, 1.6], [0, 1], clamp));
	return (<Stage cam={cam} bg="#000" light={false}><Layer depth={1}><Room T={T} /></Layer><Moon tx={1595} ty={650} o={0.84} /></Stage>);
};
const Q04: React.FC<SP> = ({t, T}) => {
	const cam = mixCam(camOn(900, 600, 0.95), camOn(980, 640, 1.1), interpolate(t, [0, 1.4], [0, 1], clamp));
	return (<Stage cam={cam} bg="#000" light={false}><Layer depth={1}><Room T={T} /><Bed /></Layer><Moon tx={900} ty={700} o={0.84} /></Stage>);
};
const Radio: React.FC<{T: number}> = ({T}) => (
	<g>
		<rect x={-70} y={-120} width={140} height={240} rx={18} fill="#2a2e34" stroke="#111" strokeWidth={6} />
		<rect x={-50} y={-90} width={100} height={50} rx={6} fill="#9fe8a0" opacity={0.85} />
		{Array.from({length: 12}).map((_, i) => <circle key={i} cx={-36 + (i % 4) * 24} cy={-10 + Math.floor(i / 4) * 24} r={6} fill="#111" />)}
		<rect x={30} y={-200} width={14} height={90} fill="#111" />
		<circle cx={37} cy={-204} r={6} fill={Math.floor(T * 3) % 2 ? '#ff4a4a' : '#5a2a2a'} />
	</g>
);
const Q05: React.FC<SP> = ({t, T}) => {
	const grab = interpolate(T, [at('нащупываешь'), at('рацию') + 0.4], [0, 1], {...clamp, easing: ease});
	const cam = mixCam(camOn(960, 760, 1.4), camOn(960, 700, 1.6), grab);
	return (
		<Stage cam={cam} bg="#000" light={false}>
			<Layer depth={1}><Room T={T} /><Svg><g transform={`translate(${960},${900 - 180 * grab}) rotate(${-10 + 10 * grab})`}><Radio T={T} /></g></Svg></Layer>
			<Moon tx={960} ty={820} o={0.84} />
			<Layer depth={0.7}><PovHands cx={960} y={1150 - 220 * grab} spread={110} /></Layer>
		</Stage>
	);
};
const Q06: React.FC<SP> = ({t, T, f}) => {
	const [lx, ly] = lampXY(960, 900, 1, 1);
	const cam = mixCam(camOn(960, 560, 2.3), camOn(960, 570, 2.6), interpolate(t, [0, 1.6], [0, 1], clamp));
	return (
		<Stage cam={cam} bg="#000" light={false}>
			<Layer depth={1}><Room T={T} /><Svg>
				<Talk T={T}><Actor who="fon" x={960} floor={900} s={1} facing={1} pose={reach(idle(f), 'F', [30, -130], 1)} expr="worried" look={[0.5, 0]} faceTurn={0.3} acc={['lampoff']} /></Talk>
				<g transform="translate(1000,668) scale(0.25)"><Radio T={T} /></g>
			</Svg></Layer>
			<Moon tx={960} ty={600} o={0.8} />
			<Layer depth={1}><Svg><Waves x={1020} y={630} T={T} on={talkAt('FON', T) > 0 ? 0.7 : 0} c="#9fe8a0" /></Svg></Layer>
			{void lx}{void ly}
		</Stage>
	);
};
const Q07: React.FC<SP> = ({t, T}) => {
	const k = pk(T, 'из', 2, 0.9);
	const here = T > at('здесь') - 0.05;
	const cam = mixCam(camOn(900, 700, 1.1), camOn(640, 870, 2.6), k);
	const sh = here && T < at('здесь') + 0.35 ? Math.sin(T * 90) * 14 : 0;
	return (
		<Stage cam={{...cam, x: cam.x + sh}} bg="#000" light={false}>
			<Layer depth={1}><Room T={T} /><Bed /><Svg>{here ? [-1, 1].map((q) => <ellipse key={q} cx={660 + q * 14} cy={876} rx={7} ry={5} fill="#ff5a4a" />) : null}</Svg></Layer>
			<Moon tx={700} ty={860} o={0.88} />
			{here && T < at('здесь') + 0.12 ? <AbsoluteFill style={{background: '#ff3b3b', opacity: 0.25}} /> : null}
		</Stage>
	);
};
const Q08: React.FC<SP> = ({t, T, f}) => {
	const tOn = at('включаешь') + 0.35;
	const on = T > tOn ? 1 : 0;
	const [lx, ly] = lampXY(980, 900, 1, -1);
	const hand = env(f, Math.round((at('включаешь') - (T - t)) * FPS), Math.round((tOn - (T - t) + 0.4) * FPS), 6, 8);
	const cam = mixCam(camOn(960, 600, 1.5), camOn(830, 700, 1.25), interpolate(T, [tOn, tOn + 1.2], [0, 1], {...clamp, easing: ease}));
	return (
		<Stage cam={cam} bg="#000" light={false}>
			<Layer depth={1}><Room T={T} /><Bed /><Svg><Actor who="fon" x={980} floor={900} s={1} facing={-1} pose={reach(idle(f), 'F', [16, -196], hand)} expr="wide" look={[-0.6, 0.4]} acc={[on ? 'lamp' : 'lampoff']} /></Svg></Layer>
			{on ? <Beam lx={lx} ly={ly} tx={640} ty={880} on={1} dark={0.86} spread={0.35} /> : <Moon tx={980} ty={620} o={0.84} />}
			{on && T < tOn + 0.12 ? <AbsoluteFill style={{background: '#fff', opacity: 0.25}} /> : null}
			<Layer depth={1}><Svg><Callout f={Math.round(T * FPS)} t0={Math.round(at('пусто') * FPS)} t1={Math.round(at('пусто') * FPS) + 60} from={[640, 880]} to={[640, 660]} text="ПУСТО" size={40} align="center" /></Svg></Layer>
		</Stage>
	);
};
const Q09: React.FC<SP> = ({t, T}) => {
	const [lx, ly] = lampXY(980, 900, 1, -1);
	const cam = mixCam(camOn(680, 860, 2.0), camOn(660, 880, 2.5), interpolate(t, [0, 2], [0, 1], clamp));
	const tm = Math.round(at('твоя') * FPS);
	return (
		<Stage cam={cam} bg="#000" light={false}>
			<Layer depth={1}><Room T={T} /><Bed jacket={1} /></Layer>
			<Beam lx={lx} ly={ly} tx={660} ty={880} on={1} dark={0.88} spread={0.35} />
			<Layer depth={1}><Svg><Callout f={Math.round(T * FPS)} t0={tm} t1={tm + 200} from={[660, 880]} to={[660, 780]} text="ТВОЯ" size={30} c="#5fb4ff" align="center" /></Svg></Layer>
		</Stage>
	);
};
// после рекламы: рассвет
const Q10: React.FC<SP> = ({t, T}) => {
	const day = interpolate(t, [0, 2.2], [0.15, 1], clamp);
	const cam = mixCam(camOn(630, 520, 1.6), camOn(700, 560, 1.25), interpolate(t, [0, 2.6], [0, 1], {...clamp, easing: ease}));
	return (
		<Stage cam={cam} bg="#000" light={false}>
			<Layer depth={1}><Room T={T} /><Bed jacket={1} /><Svg>
				<g opacity={day}><rect x={500} y={380} width={260} height={280} fill="#f2a6a0" /><rect x={500} y={560} width={260} height={100} fill="#ffd9a0" /><circle cx={560} cy={600} r={30} fill="#fff0c8" /></g>
				<path d="M 630 380 L 630 660 M 500 520 L 760 520" stroke="#1a1410" strokeWidth={10} />
				<g opacity={interpolate(T, [at('шесть'), at('шесть') + 0.3], [0, 1], clamp)} transform="translate(1400,330)"><circle r={52} fill="#efe6cc" stroke="#1a1410" strokeWidth={8} /><line x1={0} y1={0} x2={0} y2={-34} stroke="#1a1410" strokeWidth={6} /><line x1={0} y1={0} x2={0} y2={30} stroke="#1a1410" strokeWidth={6} /></g>
			</Svg></Layer>
			<Beam lx={630} ly={520} tx={1000} ty={760} on={1} dark={0.75 * (1 - day)} spread={0.9} c="#ffd9a0" />
			<AbsoluteFill style={{background: 'linear-gradient(120deg, rgba(255,200,150,0.25), rgba(0,0,0,0))', opacity: day}} />
		</Stage>
	);
};
const Q11: React.FC<SP> = ({t, T}) => {
	const k = interpolate(t, [0.3, 3.4], [0, 1], clamp);
	const cam = mixCam(camOn(1110, 820, 1.4), camOn(420, 930, 1.3), interpolate(t, [0.6, 4.4], [0, 1], {...clamp, easing: ease}));
	return (
		<Stage cam={cam} bg="#ffd9a0" light={{x: 30, y: 40, o: 0.35}}>
			<Layer depth={2.2}><DawnSky T={T} /></Layer>
			<Layer depth={1.5}><DayForest /></Layer>
			<Layer depth={1}><Ground /><Station T={T} win={0} /><Boots k={k} /></Layer>
		</Stage>
	);
};
const Q12: React.FC<SP> = ({t, T, f}) => {
	const cam = mixCam(camOn(650, 800, 1.5), camOn(640, 830, 1.8), interpolate(t, [0, 1.6], [0, 1], clamp));
	const tr = Math.round(at('размер') * FPS);
	return (
		<Stage cam={cam} bg="#ffd9a0" light={{x: 30, y: 40, o: 0.35}}>
			<Layer depth={2.2}><DawnSky T={T} /></Layer>
			<Layer depth={1}><Ground /><Svg>
				<Boot x={600} y={990} s={1.3} rot={180} />
				<g transform={`translate(${690},${935})`}><Actor who="fon" x={0} floor={0} s={0.9} facing={-1} pose={idle(f)} expr="wide" look={[-0.4, 0.8]} acc={['lampoff']} /></g>
				<Callout f={Math.round(T * FPS)} t0={tr} t1={tr + 200} from={[600, 990]} to={[600, 760]} text="ТВОЙ РАЗМЕР" size={34} c="#ff6a5a" align="center" />
			</Svg></Layer>
		</Stage>
	);
};
const Q13: React.FC<SP> = ({t, T}) => {
	const land = interpolate(t, [0, 1.6], [0, 1], {...clamp, easing: ease});
	const cam = mixCam(camOn(1000, 640, 0.9), camOn(1050, 700, 1.05), land);
	return (
		<Stage cam={{...cam, x: cam.x + Math.sin(T * 30) * 3}} bg="#9ab8e0" light={{x: 30, y: 30, o: 0.3}}>
			<Layer depth={2.2}><DawnSky T={T} /></Layer>
			<Layer depth={1.5}><DayForest /></Layer>
			<Layer depth={1}><Ground /><Station T={T} win={0} /><Svg>
				<Heli x={1560} y={300 + 520 * land} T={T} s={0.9} />
				{Array.from({length: 30}).map((_, i) => <circle key={i} cx={1560 + (random('sw' + i) - 0.5) * 600 * land} cy={900 - random('sh' + i) * 200 * land} r={4 + random('sr' + i) * 6} fill="#fff" opacity={0.7 * land} />)}
			</Svg></Layer>
		</Stage>
	);
};
const Q14: React.FC<SP> = ({t, T, f}) => {
	const kd = pk(T, 'двое', 1, 0.5);
	const cam = mixCam(camOn(1250, 640, 1.6), camOn(870, 640, 1.9), kd);
	return (
		<Stage cam={cam} bg="#9ab8e0" light={{x: 30, y: 30, o: 0.3}}>
			<Layer depth={2.2}><DawnSky T={T} /></Layer>
			<Layer depth={1}><Ground /><Station T={T} win={0} /><Svg>
				{/* в окне станции — силуэт */}
				<g opacity={kd}><circle cx={850} cy={620} r={34} fill="#0b0d14" /><rect x={818} y={650} width={64} height={70} rx={20} fill="#0b0d14" />{[-1, 1].map((q) => <ellipse key={q} cx={850 + q * 12} cy={618} rx={5} ry={4} fill="#ff5a4a" />)}</g>
				<Talk T={T}>
					<Actor who="pilot" x={1340} floor={930} s={0.72} facing={-1} pose={reach(idle(f), 'F', [40, -110], 1)} expr="normal" look={[-0.3, 0.6]} sp="PILOT" />
					<Actor who="fon" x={1160} floor={935} s={0.68} facing={1} pose={idle(f)} expr={kd > 0.3 ? 'wide' : 'normal'} look={[kd > 0.3 ? -1 : 1, 0]} acc={['lampoff']} />
				</Talk>
				<g transform="translate(1310,830) rotate(-10)"><rect x={-34} y={-24} width={68} height={48} rx={4} fill="#efe6cc" stroke="#1a1410" strokeWidth={4} /><line x1={-22} y1={-8} x2={22} y2={-8} stroke="#666" strokeWidth={3} /><line x1={-22} y1={4} x2={14} y2={4} stroke="#666" strokeWidth={3} /></g>
				<Callout f={Math.round(T * FPS)} t0={Math.round(at('списку') * FPS)} t1={Math.round(at('списку') * FPS) + 200} from={[1310, 820]} to={[1310, 560]} text="ПО СПИСКУ: 2" size={32} c="#ffc94a" align="center" />
			</Svg></Layer>
		</Stage>
	);
};
const Q15: React.FC<SP> = ({t, T, f}) => {
	const tOff = at('фонарь', 2) + 0.15;
	const off = T > tOff ? 1 : 0;
	const hand = env(f, Math.round((at('выключаешь') - (T - t)) * FPS), Math.round((tOff - (T - t) + 0.4) * FPS), 6, 8);
	const cam = mixCam(camOn(960, 560, 2.2), camOn(960, 545, 2.6), interpolate(t, [0, 1.4], [0, 1], clamp));
	const black = interpolate(T, [tOff, tOff + 0.25], [0, 1], clamp);
	return (
		<Stage cam={cam} bg="#9ab8e0" light={{x: 30, y: 30, o: 0.3}}>
			<Layer depth={2.2}><DawnSky T={T} /></Layer>
			<Layer depth={1}><Ground /><Svg><Actor who="fon" x={960} floor={900} s={1} facing={1} pose={reach(idle(f), 'F', [16, -196], hand)} expr="sleepy" look={[0, -0.2]} acc={[off ? 'lampoff' : 'lamp']} /></Svg></Layer>
			<AbsoluteFill style={{background: '#000', opacity: black}} />
		</Stage>
	);
};
const EndCard: React.FC<{t: number}> = ({t}) => (
	<AbsoluteFill style={{background: '#000', alignItems: 'center', justifyContent: 'center', fontFamily: FONT}}>
		<div style={{opacity: interpolate(t, [0.2, 0.6], [0, 1], clamp), textAlign: 'center', color: '#fff'}}>
			<div style={{fontSize: 96, fontWeight: 900, lineHeight: 1.05}}>А КТО<br />ВТОРОЙ?</div>
			<div style={{fontSize: 40, fontWeight: 800, color: '#9fe8e4', marginTop: 34, opacity: interpolate(t, [0.8, 1.2], [0, 1], clamp)}}>пиши в комментариях</div>
		</div>
	</AbsoluteFill>
);

type Cut = {C: React.FC<SP>; at: number; full?: boolean; whip?: boolean; noTrans?: boolean};
const CUTS: Cut[] = [
	{C: Q01, at: 0},
	{C: Q02, at: at('ты', 2) - 0.1},
	{C: Q03, at: at('за', 1) - 0.1},
	{C: Q04, at: at('в', 2) - 0.1},
	{C: Q05, at: at('ты', 3) - 0.1},
	{C: Q06, at: at('михалыч') - 0.1},
	{C: Q07, at: at('ответ') - 0.1},
	{C: Q08, at: at('ты', 5) - 0.1},
	{C: Q09, at: at('только') - 0.1},
	{C: Q10, at: AD1_3 + 0.05, noTrans: true},
	{C: Q11, at: at('двери') - 0.2, whip: true},
	{C: Q12, at: at('твой') - 0.1},
	{C: Q13, at: at('днем') - 0.1, whip: true},
	{C: Q14, at: at('пилот') - 0.1},
	{C: Q15, at: at('ты', 6) - 0.1},
];
const Hud: React.FC<{T: number}> = ({T}) => {
	const morning = T >= at('за', 2) - 0.1, day = T >= at('днем') - 0.1;
	const clock = day ? 'ДЕНЬ · 12:40' : morning ? '06:00' : `03:02:${String(Math.min(59, Math.floor(T))).padStart(2, '0')}`;
	return (
		<div style={{position: 'absolute', top: 54, left: 40, right: 40, display: 'flex', justifyContent: 'space-between', fontFamily: FONT, fontWeight: 800, fontSize: 30, color: '#fff', textShadow: '0 2px 6px #000'}}>
			<div style={{background: 'rgba(0,0,0,0.45)', padding: '8px 16px', borderRadius: 8}}>{day ? 'ДЕНЬ 2' : 'НОЧЬ 1'} · <span style={{color: '#5ee0da'}}>СЕВЕР-7</span></div>
			<div style={{background: 'rgba(0,0,0,0.45)', padding: '8px 16px', borderRadius: 8, fontVariantNumeric: 'tabular-nums'}}>{clock}</div>
		</div>
	);
};

export const Station3Short: React.FC = () => {
	const fr = useCurrentFrame();
	const s = fr / FPS;
	const T = storyT(s);
	const ci = CUTS.reduce((a, c, i) => (T >= c.at ? i : a), 0);
	const cut = CUTS[ci];
	const next = ci + 1 < CUTS.length ? CUTS[ci + 1].at : END;
	const t = T - cut.at;
	const f = Math.round(t * FPS);
	const len = Math.max(1, Math.round((next - cut.at) * FPS));
	const nextCut = ci + 1 < CUTS.length ? CUTS[ci + 1] : null;
	const kin = cut.whip ? interpolate(t, [0, 0.25], [1, 0], {...clamp, easing: ease}) : 0;
	const kout = nextCut?.whip ? interpolate(T, [next - 0.2, next], [0, 1], {...clamp, easing: ease}) : 0;
	const zin = !cut.whip && !cut.noTrans && ci > 0 ? interpolate(t, [0, 0.28], [1, 0], {...clamp, easing: ease}) : 0;
	const zout = nextCut && !nextCut.whip && !nextCut.noTrans ? interpolate(T, [next - 0.16, next], [0, 1], {...clamp, easing: ease}) : 0;
	const zs = 1 + 0.3 * zin + 0.25 * zout;
	const dx = kin * 700 - kout * 700;
	const blur = (kin + kout) * 28 + (zin + zout) * 10;
	const ad1F = Math.round(AD1_3 * FPS), holdF = Math.round(AD_HOLD * FPS);
	const C = cut.C;
	const ended = T >= END;
	return (
		<AbsoluteFill style={{background: '#000'}}>
			{!ended ? (
				<AbsoluteFill style={{transform: `translateX(${dx}px) scale(${zs})`, filter: blur > 0.5 ? `blur(${blur}px)` : undefined}}>
					{cut.full ? <C t={t} T={T} f={f} /> : <V fx={960}><ShotWrap f={f} k={ci} len={len}><C t={t} T={T} f={f} /></ShotWrap></V>}
				</AbsoluteFill>
			) : <EndCard t={T - END} />}
			{!ended ? <Hud T={T} /> : null}
			{inAd(s) ? <AbsoluteFill style={{background: 'rgba(0,0,0,0.62)'}} /> : null}
			<Sequence from={0} durationInFrames={ad1F}>
				<Audio src={staticFile('station3/voice.mp3')} />
				<Audio src={staticFile('station3/bed.wav')} volume={0.85} />
			</Sequence>
			<Sequence from={ad1F + holdF}>
				<Audio src={staticFile('station3/voice.mp3')} startFrom={ad1F} />
				<Audio src={staticFile('station3/bed.wav')} volume={0.85} startFrom={ad1F} />
			</Sequence>
		</AbsoluteFill>
	);
};
void gesture; void blend; void HOUSE;

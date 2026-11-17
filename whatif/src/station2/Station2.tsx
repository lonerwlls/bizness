// «Метеостанция», часть 2: темнота, чужое дыхание рядом, голос за дверью, «не включай свет», мокрые следы к кровати,
// Михалыч «у двери» за 400 км. Герой Фонарик, вертикаль, без субтитров. Голос — файл пользователя.
import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {Layer, Svg} from '../engine/camera';
import {Stage, camOn, mixCam, clamp, ease} from '../kit/kit';
import {Actor, TalkOverride} from '../kit/core';
import {idle, gesture, env, reach, blend} from '../kit/actions';
import {Callout} from '../kit/graphics';
import {FONT} from '../kit/ui';
import {Beam, Foot, Ground, HOUSE, NightSky, PovHands, Room, RuleV, ShotWrap, Snowfall, Station, V, Waves, lampXY, type SP} from '../station/Station';
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
const VO_DUR = 41.48;
export const AD1_2 = 20.3; // тишина после «идёт на свет»
const AD_LEN = 5.97, AD_HOLD = 0.6 + AD_LEN + 0.25, END_CARD = 2.8;
const END = VO_DUR + 0.25;
export const ST2_FRAMES = Math.ceil((END + END_CARD + AD_HOLD) * FPS);
const storyT = (s: number) => (s < AD1_2 ? s : s < AD1_2 + AD_HOLD ? AD1_2 : s - AD_HOLD);
const inAd = (s: number) => s >= AD1_2 + 0.6 && s < AD1_2 + AD_HOLD;
const RANGES: Record<string, [number, number][]> = {FAKE: [[10.2, 12.8]], MIH: [[16.3, 20.2], [34.5, 38.0]]};
const talkAt = (sp: string, T: number) => ((RANGES[sp] ?? []).some(([a, b]) => T >= a && T <= b) ? 0.35 + 0.45 * Math.abs(Math.sin(T * 17)) : 0);
const NIGHT = '#0a1024', MOON = '#9fb8ff';
const pk = (T: number, w: string, n = 1, d = 0.45) => interpolate(T, [at(w, n) - 0.12, at(w, n) - 0.12 + d], [0, 1], {...clamp, easing: ease});

// кровать под окном (в комнате станции)
const Bed: React.FC = () => (
	<Svg>
		<rect x={440} y={760} width={400} height={70} rx={10} fill="#5a4a6a" stroke="#1a1410" strokeWidth={5} />
		<rect x={450} y={740} width={120} height={40} rx={14} fill="#d8d4e0" stroke="#1a1410" strokeWidth={4} />
		<rect x={440} y={830} width={400} height={20} fill="#2a201c" />
		<rect x={450} y={850} width={14} height={50} fill="#2a201c" /><rect x={816} y={850} width={14} height={50} fill="#2a201c" />
		<rect x={464} y={850} width={352} height={50} fill="#06070c" />
	</Svg>
);
// мокрые блестящие следы на полу: от двери к кровати
const WetPrints: React.FC<{k: number; n?: number}> = ({k, n = 12}) => (
	<Svg>
		{Array.from({length: n}).map((_, i) => {
			const u = i / (n - 1), x = 1560 - u * 860, y = 960 + Math.sin(u * 3) * 16 + (i % 2 ? 12 : -12);
			return u <= k ? <g key={i}><Foot x={x} y={y} s={1.6} rot={180} flat={0.5} /><ellipse cx={x + 4} cy={y - 2} rx={16} ry={4} fill="#e6f0ff" opacity={0.85} /></g> : null;
		})}
	</Svg>
);
// лунный луч из окна
const Moon: React.FC<{o?: number}> = ({o = 0.9}) => <Beam lx={630} ly={520} tx={900} ty={950} on={1} dark={o} spread={0.55} c={MOON} />;

// ---------- сцены ----------
const P01: React.FC<SP> = ({t, T, f}) => {
	const cam = mixCam(camOn(960, 560, 2.6), camOn(960, 560, 2.2), interpolate(t, [0, 2.2], [0, 1], {...clamp, easing: ease}));
	return (
		<Stage cam={cam} bg="#000" light={false}>
			<Layer depth={1}><Room T={T} /><Svg><Actor who="fon" x={960} floor={900} s={1} facing={1} pose={idle(f)} expr="wide" look={[0.3, 0]} acc={['lampoff']} /></Svg></Layer>
			<Moon o={0.93} />
		</Stage>
	);
};
const P02: React.FC<SP> = ({t, T, f}) => {
	const k = pk(T, 'дыхание', 1, 0.6);
	const puff = Math.max(0, (T - at('дыхание')) % 1.3);
	const cam = mixCam(camOn(960, 570, 2.2), camOn(1060, 560, 2.0), k);
	return (
		<Stage cam={cam} bg="#000" light={false}>
			<Layer depth={1}><Room T={T} /><Svg><Actor who="fon" x={960} floor={900} s={1} facing={1} pose={idle(f)} expr="wide" mouth="flat" look={[0.8, 0]} acc={['lampoff']} /></Svg></Layer>
			<Moon o={0.92} />
			<Layer depth={1}><Svg>{T > at('дыхание') - 0.2 ? <ellipse cx={1120 + puff * 40} cy={560 - puff * 25} rx={14 + puff * 30} ry={8 + puff * 14} fill="#dfe8f4" opacity={0.4 * (1 - puff / 1.3)} /> : null}</Svg></Layer>
		</Stage>
	);
};
const P03: React.FC<SP> = ({t, T, f}) => {
	const k = pk(T, 'справа', 1, 0.4);
	const cam = mixCam(camOn(1000, 560, 1.9), camOn(1090, 560, 2.4), interpolate(t, [0, 1.9], [0, 1], {...clamp, easing: ease}));
	const blink = Math.floor(T * 3) % 7 === 0 ? 0.2 : 1;
	return (
		<Stage cam={cam} bg="#000" light={false}>
			<Layer depth={1}><Room T={T} /><Svg><Actor who="fon" x={960} floor={900} s={1} facing={1} pose={idle(f)} expr="wide" look={[1, 0]} acc={['lampoff']} /></Svg></Layer>
			<Moon o={0.95} />
			<Layer depth={1}><Svg><g opacity={k}>{[-1, 1].map((q) => <ellipse key={q} cx={1130 + q * 14} cy={552} rx={7} ry={5 * blink} fill="#f2f6ff" />)}</g></Svg></Layer>
		</Stage>
	);
};
const KN = () => [at('стучат'), at('стучат') + 0.4, at('стучат') + 0.8];
const P04: React.FC<SP> = ({t, T, f}) => {
	const kn = KN(), punch = kn.reduce((a, k) => a + (T >= k ? Math.max(0, 1 - (T - k) / 0.35) : 0), 0);
	const shake = kn.some((k) => T > k && T < k + 0.15) ? 1 : 0;
	const cam = mixCam(camOn(1595, 640, 1.6 + 0.12 * punch), camOn(1595, 600, 2.0 + 0.12 * punch), interpolate(t, [0, 2.4], [0, 1], clamp));
	return (
		<Stage cam={{...cam, x: cam.x + (shake ? Math.sin(f * 3) * 10 : 0)}} bg="#000" light={false}>
			<Layer depth={1}><Room T={T} doorShake={shake} /></Layer>
			<Beam lx={1595} ly={1100} tx={1595} ty={890} on={1} dark={0.9} spread={0.9} c="#ffd27a" />
		</Stage>
	);
};
const P05: React.FC<SP> = ({t, T, f}) => (
	<AbsoluteFill style={{background: '#000'}}>
		<div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 955, overflow: 'hidden'}}>
			<V h={955} fx={960}>
				<ShotWrap f={f} k={0} len={120}>
					<Stage cam={camOn(1110, 740, 1.6 + 0.1 * Math.min(1, t / 3))} bg={NIGHT} light={{night: true, x: 50, y: 20, o: 0.3}}>
						<Layer depth={2.2}><NightSky T={T} /></Layer>
						<Layer depth={1}><Ground /><Station T={T} win={0} /><Svg>
							<TalkOverride.Provider value={(s) => (s === 'FAKE' ? talkAt('FAKE', T) : 0)}>
								<Actor who="fake" x={1120} floor={918} s={0.68} facing={-1} pose={gesture('fist', idle(f, 4), 0.5 + 0.5 * Math.abs(Math.sin(t * 7)), f)} expr="angry" look={[-0.4, 0]} faceTurn={0.3} sp="FAKE" />
							</TalkOverride.Provider>
						</Svg></Layer>
						<Layer depth={0.85}><Snowfall T={T} /></Layer>
					</Stage>
				</ShotWrap>
			</V>
		</div>
		<div style={{position: 'absolute', left: 0, top: 965, width: 1080, height: 955, overflow: 'hidden'}}>
			<V h={955} fx={960}>
				<ShotWrap f={f} k={1} len={120}>
					<Stage cam={camOn(1100, 600, 1.9)} bg="#000" light={false}>
						<Layer depth={1}><Room T={T} /><Svg><Actor who="fon" x={1100} floor={900} s={1} facing={1} pose={gesture('handsOnHead', idle(f), 0.6, f)} expr="wide" look={[1, 0]} acc={['lampoff']} /></Svg></Layer>
						<Moon o={0.88} />
					</Stage>
				</ShotWrap>
			</V>
		</div>
		<div style={{position: 'absolute', left: 0, top: 955, width: 1080, height: 10, background: '#ff6a5a'}} />
	</AbsoluteFill>
);
const P06: React.FC<SP> = ({t, T}) => {
	const click = T > at('рация') + 0.4;
	const cam = mixCam(camOn(1140, 650, 2.0), camOn(1150, 640, 2.6), interpolate(t, [0, 3.2], [0, 1], {...clamp, easing: ease}));
	return (
		<Stage cam={cam} bg="#000" light={false}>
			<Layer depth={1}><Room T={T} /><Svg><Waves x={1236} y={636} T={T} on={click ? 0.6 : 0} /></Svg></Layer>
			<Beam lx={1190} ly={640} tx={1190} ty={640} on={1} dark={0.92} spread={0.01} c="#9fe8a0" />
			<Layer depth={1}><Svg><rect x={1150} y={624} width={86} height={26} rx={4} fill="#9fe8a0" opacity={0.9} /><g opacity={interpolate(t, [0.8, 1.1], [0, 1], clamp)} transform="translate(1140,575)"><rect x={-95} y={-22} width={190} height={40} rx={20} fill="#11142c" stroke="#9fe8a0" strokeWidth={3} /><text y={7} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={20} fill="#fff">БАЗА · МИХАЛЫЧ</text></g></Svg></Layer>
		</Stage>
	);
};
const P07: React.FC<SP> = (p) => (
	<RuleV {...p} title="Правило станции №2" lines={['не включай', 'свет.', 'ОНО ИДЁТ', 'НА СВЕТ.']} starts={[at('не', 2), at('свет', 1), at('идёт'), at('свет', 2)].map((a) => a - at('седьмой'))} />
);
// после рекламы: опускаешься на пол
const P08: React.FC<SP> = ({t, T, f}) => {
	const k = interpolate(T, [at('медленно'), at('пол') + 0.3], [0, 1], {...clamp, easing: ease});
	const crouch = {lean: 18, head: 6, armB: [20, 40] as [number, number], armF: [55, 40] as [number, number], legB: [70, 150] as [number, number], legF: [95, 150] as [number, number]};
	const cam = mixCam(camOn(980, 560, 1.8), camOn(1000, 700, 1.9), k);
	return (
		<Stage cam={cam} bg="#000" light={false}>
			<Layer depth={1}><Room T={T} /><Svg><Actor who="fon" x={980} seat={743 + 85 * k} s={1} facing={-1} pose={blend(idle(f), crouch, k)} expr="worried" look={[-0.6, 0.6]} acc={['lampoff']} /></Svg></Layer>
			<Moon o={0.9} />
		</Stage>
	);
};
const P09: React.FC<SP> = ({t, T}) => {
	const tb = at('басы');
	const cam = mixCam(camOn(980, 880, 1.25), camOn(990, 930, 1.7), pk(T, 'басы', 1, 0.5));
	return (
		<Stage cam={cam} bg="#000" light={false}>
			<Layer depth={1}><Room T={T} /><Svg>{Array.from({length: 5}).map((_, i) => <g key={i} opacity={interpolate(T, [at('следы') - 0.2 + i * 0.12, at('следы') + i * 0.12], [0, 1], clamp)}><Foot x={760 + i * 120} y={960 + (i % 2 ? 14 : -14)} s={1.3} rot={180} flat={0.45} /><ellipse cx={764 + i * 120} cy={958 + (i % 2 ? 14 : -14)} rx={12} ry={3} fill="#cfe2ff" opacity={0.7} /></g>)}</Svg></Layer>
			<Beam lx={630} ly={520} tx={960} ty={960} on={1} dark={0.9} spread={0.6} c={MOON} />
			<Layer depth={0.7}><PovHands cx={980} y={1130} spread={160} /></Layer>
			<Layer depth={1}><Svg><Callout f={Math.round(T * FPS)} t0={Math.round(tb * FPS)} t1={Math.round(tb * FPS) + 200} from={[1000, 955]} to={[1000, 760]} text="БОСЫЕ" size={40} c="#ff6a5a" align="center" /></Svg></Layer>
		</Stage>
	);
};
const P10: React.FC<SP> = ({t, T, f}) => {
	const k = interpolate(t, [0, 2.4], [0, 1], clamp);
	const cam = mixCam(camOn(1450, 820, 1.5), camOn(720, 820, 1.5), interpolate(t, [0, 2.4], [0, 1], {...clamp, easing: ease}));
	const tb = Math.round(at('обратно') * FPS);
	return (
		<Stage cam={cam} bg="#000" light={false}>
			<Layer depth={1}><Room T={T} /><Bed /><WetPrints k={k} /></Layer>
			<Beam lx={630} ly={520} tx={1000} ty={950} on={1} dark={0.86} spread={0.9} c={MOON} />
			<Layer depth={1}><Svg><Callout f={Math.round(T * FPS)} t0={tb} t1={tb + 200} from={[700, 880]} to={[700, 600]} text="ОБРАТНО — НЕТ" size={40} c="#ff6a5a" align="center" /></Svg></Layer>
		</Stage>
	);
};
const P11: React.FC<SP> = ({t, T}) => {
	const fade = interpolate(T, [at('дыхание', 2), at('затихает') + 0.6], [1, 0], clamp);
	const cam = mixCam(camOn(640, 860, 2.2), camOn(640, 870, 2.6), interpolate(t, [0, 1.6], [0, 1], clamp));
	return (
		<Stage cam={cam} bg="#000" light={false}>
			<Layer depth={1}><Room T={T} /><Bed /><Svg>
				<ellipse cx={600 + (T % 1.2) * 30} cy={872} rx={20 + (T % 1.2) * 20} ry={8} fill="#dfe8f4" opacity={0.35 * fade} />
				{[-1, 1].map((q) => <ellipse key={q} cx={680 + q * 12} cy={876} rx={5} ry={3.5} fill="#f2f6ff" opacity={0.9 * fade} />)}
			</Svg></Layer>
			<Moon o={0.92} />
		</Stage>
	);
};
const P12: React.FC<SP> = (p) => <P06 {...p} />;
// Михалыч «у двери»: снаружи у крыльца тёмный силуэт с рацией, без лица
const P13: React.FC<SP> = ({t, T, f}) => {
	const cam = mixCam(camOn(1120, 760, 1.5), camOn(1120, 700, 1.9), interpolate(t, [0, 3.6], [0, 1], {...clamp, easing: ease}));
	return (
		<Stage cam={cam} bg={NIGHT} light={{night: true, x: 50, y: 20, o: 0.3}}>
			<Layer depth={2.2}><NightSky T={T} /></Layer>
			<Layer depth={1}><Ground /><Station T={T} win={0} /><Svg>
				<g opacity={0.92}>
					<rect x={1088} y={700} width={64} height={190} rx={20} fill="#0b0d14" />
					<circle cx={1120} cy={672} r={36} fill="#0b0d14" />
					<rect x={1150} y={720} width={18} height={40} rx={4} fill="#0b0d14" />
					<circle cx={1159} cy={716} r={4} fill="#9fe8a0" opacity={Math.floor(T * 4) % 2 ? 1 : 0.3} />
					<line x1={1100} y1={888} x2={1095} y2={920} stroke="#0b0d14" strokeWidth={10} /><line x1={1140} y1={888} x2={1145} y2={920} stroke="#0b0d14" strokeWidth={10} />
				</g>
				<g opacity={interpolate(t, [0.6, 0.9], [0, 1], clamp)} transform="translate(1120,560)"><rect x={-115} y={-24} width={230} height={44} rx={22} fill="#11142c" stroke="#ff6a5a" strokeWidth={3} /><text y={8} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={22} fill="#fff">«МИХАЛЫЧ»?</text></g>
			</Svg></Layer>
			<Layer depth={0.85}><Snowfall T={T} /></Layer>
		</Stage>
	);
};
const P14: React.FC<SP> = ({t, T, f}) => {
	const cam = mixCam(camOn(1000, 600, 0.9), camOn(1000, 520, 0.42), interpolate(t, [0, 2], [0, 1], {...clamp, easing: ease}));
	const t0 = Math.round((at('400') - (T - t)) * FPS);
	return (
		<Stage cam={cam} bg={NIGHT} light={{night: true, x: 50, y: 20, o: 0.3}}>
			<Layer depth={2.2}><NightSky T={T} /></Layer>
			<Layer depth={1}><Ground /><Station T={T} win={0} /><Svg>
				<Callout f={f} t0={t0} t1={t0 + 200} from={[1000, 300]} to={[1000, -260]} text="БАЗА — 400 КМ" size={70} align="center" />
			</Svg></Layer>
			<Layer depth={0.85}><Snowfall T={T} /></Layer>
		</Stage>
	);
};
const P15: React.FC<SP> = ({t, T, f}) => {
	const cam = mixCam(camOn(960, 560, 2.2), camOn(960, 545, 2.7), interpolate(t, [0, 1.4], [0, 1], clamp));
	return (
		<Stage cam={cam} bg="#000" light={false}>
			<Layer depth={1}><Room T={T} /><Svg><Actor who="fon" x={960} floor={900} s={1} facing={1} pose={idle(f)} expr="worried" look={[0, 0]} faceTurn={0} acc={['lampoff']} /></Svg></Layer>
			<Moon o={0.9} />
		</Stage>
	);
};
const EndCard: React.FC<{t: number}> = ({t}) => (
	<AbsoluteFill style={{background: '#000', alignItems: 'center', justifyContent: 'center', fontFamily: FONT}}>
		<div style={{opacity: interpolate(t, [0.2, 0.6], [0, 1], clamp), textAlign: 'center', color: '#fff'}}>
			<div style={{fontSize: 96, fontWeight: 900, lineHeight: 1.05}}>ТЫ БЫ<br />ОТКРЫЛ?</div>
			<div style={{fontSize: 40, fontWeight: 800, color: '#9fe8e4', marginTop: 34, opacity: interpolate(t, [0.8, 1.2], [0, 1], clamp)}}>ЧАСТЬ 3 — ФИНАЛ</div>
		</div>
	</AbsoluteFill>
);

type Cut = {C: React.FC<SP>; at: number; full?: boolean; whip?: boolean; noTrans?: boolean};
const CUTS: Cut[] = [
	{C: P01, at: 0},
	{C: P02, at: at('ты', 1) - 0.1},
	{C: P03, at: at('совсем') - 0.1},
	{C: P04, at: at('дверь') - 0.22},
	{C: P05, at: at('быстрее') - 0.1, full: true},
	{C: P06, at: at('рация', 1) - 0.1, whip: true},
	{C: P07, at: at('седьмой', 1) - 0.1, full: true},
	{C: P08, at: AD1_2 + 0.05, noTrans: true},
	{C: P09, at: at('под') - 0.1},
	{C: P10, at: at('они') - 0.1},
	{C: P11, at: at('дыхание', 2) - 0.1},
	{C: P12, at: at('рация', 2) - 0.1},
	{C: P13, at: at('седьмой', 2) - 0.1, whip: true},
	{C: P14, at: at('до') - 0.1},
	{C: P15, at: at('ты', 3) - 0.1, whip: true},
];
const Hud: React.FC<{T: number}> = ({T}) => (
	<div style={{position: 'absolute', top: 54, left: 40, right: 40, display: 'flex', justifyContent: 'space-between', fontFamily: FONT, fontWeight: 800, fontSize: 30, color: '#fff', textShadow: '0 2px 6px #000'}}>
		<div style={{background: 'rgba(0,0,0,0.45)', padding: '8px 16px', borderRadius: 8}}>НОЧЬ 1 · <span style={{color: '#5ee0da'}}>СЕВЕР-7</span></div>
		<div style={{background: 'rgba(0,0,0,0.45)', padding: '8px 16px', borderRadius: 8, fontVariantNumeric: 'tabular-nums'}}>
			03:01:{String(Math.min(59, Math.floor(T))).padStart(2, '0')} · <span style={{color: '#ff6a5a'}}>СВЕТ ВЫКЛ</span>
		</div>
	</div>
);

export const Station2Short: React.FC = () => {
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
	const ad1F = Math.round(AD1_2 * FPS), holdF = Math.round(AD_HOLD * FPS);
	const C = cut.C;
	const ended = T >= END;
	return (
		<AbsoluteFill style={{background: '#000'}}>
			{!ended ? (
				<AbsoluteFill style={{transform: `translateX(${dx}px) scale(${zs})`, filter: blur > 0.5 ? `blur(${blur}px)` : undefined}}>
					{cut.full ? <C t={t} T={T} f={f} /> : (
						<V fx={960}><ShotWrap f={f} k={ci} len={len}><C t={t} T={T} f={f} /></ShotWrap></V>
					)}
				</AbsoluteFill>
			) : <EndCard t={T - END} />}
			{!ended ? <Hud T={T} /> : null}
			{inAd(s) ? <AbsoluteFill style={{background: 'rgba(0,0,0,0.62)'}} /> : null}
			<Sequence from={0} durationInFrames={ad1F}>
				<Audio src={staticFile('station2/voice.mp3')} />
				<Audio src={staticFile('station2/bed.wav')} volume={0.85} />
			</Sequence>
			<Sequence from={ad1F + holdF}>
				<Audio src={staticFile('station2/voice.mp3')} startFrom={ad1F} />
				<Audio src={staticFile('station2/bed.wav')} volume={0.85} startFrom={ad1F} />
			</Sequence>
		</AbsoluteFill>
	);
};
void env; void reach; void lampXY; void random;

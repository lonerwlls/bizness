// «Лишний на турникете», часть 3 (финал): лестница, силуэты повернули головы, −12, сменщик «ты же вышел час назад»,
// пропуск — отказ, «внутри: 1», фонарь гаснет.
import React from 'react';
import WORDS from './words3.json';
import {Actor, Beam, Board, Callout, Cctv, Dark, Guard, HudBar, Layer, Lobby, QCard, Radio, Reader, Silhouettes, Stage, Stairs, Svg, TalkWith, camOn, clamp, ease, env, idle, interpolate, lampXY, makeShort, mixCam, mkAt, reach, walkTo, type Cut, type SP, FPS} from './Turnstile';

const at = mkAt(WORDS as {w: string; t: number; e: number}[]);
const F = 780;
const ease1 = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], {...clamp, easing: ease});
const GUARD_TALK: [number, number][] = [[25.5, 30.1]];
const talk = (sp: string, T: number) => (sp === 'GUARD' && GUARD_TALK.some(([a, b]) => T >= a && T <= b) ? 0.35 + 0.45 * Math.abs(Math.sin(T * 17)) : 0);

// бежит по лестнице: камера скользит вниз вдоль марша, фонарь мигает
const C01: React.FC<SP> = ({t, T, f}) => {
	const run = (t * 1.6) % 1;
	const x = 1300 - run * 700, y = 600 + run * 340;
	const blink = Math.floor(T * 5) % 4 === 0 ? 0.2 : 1;
	const [lx, ly] = lampXY(x, y, 0.8, -1);
	return (
		<Stage cam={{...camOn(x, y - 160, 1.6), x: camOn(x, y - 160, 1.6).x}} bg="#2a2e38" light={false}>
			<Layer depth={1}><Stairs T={T} n={String(31 - Math.floor(t * 1.6))} /><Svg><Guard who="fon" x={x} floor={y} s={0.8} facing={-1} pose={walkTo(f, 0, 9999, 0, 1, 1, 0.9).pose} expr="wide" look={[-1, 0.3]} acc={['lamp']} /></Svg></Layer>
			<Beam lx={lx} ly={ly} tx={x - 400} ty={y + 100} on={blink} dark={0.85} spread={0.35} />
		</Stage>
	);
};
const C02: React.FC<SP> = ({t, T}) => {
	const turn = ease1(T, at('повернули') - 0.1, at('повернули') + 0.3);
	return (
		<Stage cam={mixCam(camOn(960, 560, 1.0), camOn(960, 560, 1.4), ease1(t, 0, 8))} bg="#1a1d26" light={false}>
			<Layer depth={1}><Silhouettes T={T} turn={turn} /></Layer>
			<Beam lx={960} ly={1200} tx={960} ty={560} on={1} dark={0.78} spread={0.6} />
		</Stage>
	);
};
const C03: React.FC<SP> = ({t, T}) => {
	const n = T < at('10') ? '20' : T < at('3', 2) ? '10' : '3';
	const k = n === '20' ? 0 : n === '10' ? 1 : 2;
	return (
		<Stage cam={mixCam(camOn(1510, 430, 2.4), camOn(1510, 430, 2.0), ease1(t, 0, 1.2))} bg="#2a2e38" light={false}>
			<Layer depth={1}><Stairs T={T} n={n} key={k} /></Layer>
			<Beam lx={1300} ly={700} tx={1510} ty={430} on={1} dark={0.8} spread={0.4} />
		</Stage>
	);
};
const C04: React.FC<SP> = ({t, T}) => (
	<Stage cam={mixCam(camOn(960, 560, 1.2), camOn(960, 460, 1.7), ease1(t, 0, 1.6))} bg="#0b0d14" light={false}>
		<Layer depth={1}><Radio T={T} text={T > at('минус') ? '−12' : '...'} /></Layer>
	</Stage>
);
const C05: React.FC<SP> = ({t, T, f}) => {
	const w = walkTo(f, 0, 40, 1700, 1250, 2, 0.9);
	return (
		<Stage cam={{...mixCam(camOn(1400, 560, 1.6), camOn(1200, 560, 1.3), ease1(t, 0, 1.2)), x: mixCam(camOn(1400, 560, 1.6), camOn(1200, 560, 1.3), ease1(t, 0, 1.2)).x + (t < 0.25 ? Math.sin(f * 3) * 12 : 0)}} bg="#141822" light={false}>
			<Layer depth={1}><Lobby T={T} inN={412} outN={424} /><Svg><Guard who="fon" x={w.x} floor={F} s={0.9} facing={-1} pose={w.pose} vx={w.vx} bob={w.bob} expr="wide" look={[-1, 0]} acc={['lamp']} /></Svg></Layer>
			<Dark o={0.35} />
		</Stage>
	);
};
// после рекламы: сменщик у турникета бледнеет
const Shift: React.FC<{T: number; f: number; pale?: number}> = ({T, f, pale = 0}) => (
	<TalkWith fn={(sp) => talk(sp, T)}>
		<Actor who="guard" x={1020} floor={F} s={0.92} facing={1} pose={idle(f, 3)} expr={pale > 0.5 ? 'wide' : 'normal'} look={[1, 0]} sp="GUARD" chestText="ОХРАНА" />
		{pale > 0 ? <g opacity={pale * 0.35}><circle cx={1024} cy={F - 157 * 0.92 - 164 * 0.92} r={44} fill="#e8f0ff" /></g> : null}
	</TalkWith>
);
const C06: React.FC<SP> = ({t, T, f}) => {
	const pale = ease1(T, at('бледнеет') - 0.3, at('бледнеет') + 0.4);
	return (
		<Stage cam={mixCam(camOn(1150, 520, 1.3), camOn(1060, 470, 2.2), ease1(T, at('смотрит') - 0.3, at('бледнеет') + 0.3))} bg="#141822" light={{x: 50, y: 10, o: 0.25}}>
			<Layer depth={1}><Lobby T={T} inN={412} outN={424} /><Svg><Shift T={T} f={f} pale={pale} /><Guard who="fon" x={1280} floor={F} s={0.9} facing={-1} pose={idle(f)} expr="worried" look={[-1, 0]} acc={['lamp']} /></Svg></Layer>
			<Dark o={0.15} />
		</Stage>
	);
};
// он говорит; на мониторе — запись: «ты» выходишь в 05:00 и машешь
const C07: React.FC<SP> = ({t, T, f}) => {
	const cctv = T > at('я') - 0.1;
	return cctv ? (
		<Stage cam={mixCam(camOn(960, 560, 1.0), camOn(960, 560, 1.25), ease1(t, 0, 4))} bg="#0b0d14" light={false}>
			<Layer depth={1}><Cctv T={T} stamp="05:00:12" leaver={ease1(T, at('я'), at('домой'))} ghostArrow={T > at('попрощался') ? 1 : 0} /></Layer>
			<Layer depth={1}><Svg><Callout f={Math.round(T * FPS)} t0={Math.round(at('попрощался') * FPS)} t1={Math.round(at('попрощался') * FPS) + 200} from={[980, 610]} to={[980, 400]} text="ЭТО ТЫ?" size={34} c="#ffc94a" align="center" /></Svg></Layer>
		</Stage>
	) : (
		<Stage cam={camOn(1030, 560, 2.4)} bg="#141822" light={false}>
			<Layer depth={1}><Lobby T={T} inN={412} outN={424} /><Svg><Shift T={T} f={f} pale={1} /></Svg></Layer>
		</Stage>
	);
};
const C08: React.FC<SP> = ({t, T}) => {
	const put = ease1(T, at('прикладываешь'), at('пропуск') + 0.3);
	const red1 = T > at('курникет') - 0.05;
	return (
		<Stage cam={mixCam(camOn(960, 560, 1.2), camOn(960, 520, 1.45), ease1(t, 0, 3))} bg="#1c2130" light={false}>
			<Layer depth={1}><Reader state={red1 ? 'red' : 'idle'} badge={put} /></Layer>
		</Stage>
	);
};
const C09: React.FC<SP> = ({t, T, f}) => {
	const red = Math.floor((T - at('еще')) * 3) % 2 === 0;
	return (
		<Stage cam={{...camOn(960, 520, 1.6), x: camOn(960, 520, 1.6).x + (red ? Math.sin(f * 3) * 8 : 0)}} bg="#1c2130" light={false}>
			<Layer depth={1}><Reader state={red ? 'red' : 'idle'} badge={1} /></Layer>
		</Stage>
	);
};
const C10: React.FC<SP> = ({t, T}) => (
	<Stage cam={mixCam(camOn(960, 540, 1.0), camOn(960, 560, 1.3), ease1(t, 0, 2))} bg="#0b0d14" light={false}>
		<Layer depth={1}><Svg>
			<rect x={-700} y={-400} width={3300} height={1800} fill="#0b0d14" />
			<g transform="translate(960,540)">
				<rect x={-270} y={-250} width={540} height={500} rx={24} fill="#05060a" stroke="#2a3040" strokeWidth={14} />
				<text x={0} y={-90} textAnchor="middle" fontFamily="Rubik" fontWeight={900} fontSize={70} fill="#7a8098">ВНУТРИ</text>
				<text x={0} y={140} textAnchor="middle" fontFamily="monospace" fontWeight={700} fontSize={230} fill="#ff4a4a" opacity={T > at('один') ? 1 : 0}>1</text>
			</g>
		</Svg></Layer>
	</Stage>
);
const C11: React.FC<SP> = ({t, T, f}) => {
	const tOff = at('фонарь', 2) + 0.12;
	const off = T > tOff ? 1 : 0;
	const hand = env(f, 0, Math.round((tOff - (T - t) + 0.4) * FPS), 4, 6);
	const black = interpolate(T, [tOff, tOff + 0.25], [0, 1], clamp);
	return (
		<Stage cam={mixCam(camOn(1280, 470, 2.4), camOn(1280, 460, 2.7), ease1(t, 0, 1))} bg="#141822" light={false}>
			<Layer depth={1}><Lobby T={T} inN={412} outN={424} /><Svg><Guard who="fon" x={1280} floor={F} s={0.9} facing={-1} pose={reach(idle(f), 'F', [16, -196], hand)} expr="sleepy" look={[0, -0.2]} acc={[off ? 'lampoff' : 'lamp']} /></Svg></Layer>
			<Dark o={0.25} />
			<Svg><rect x={-800} y={-600} width={3600} height={2400} fill="#000" opacity={black} /></Svg>
		</Stage>
	);
};
const AD1 = 20.88;
const CUTS: Cut[] = [
	{C: C01, at: 0},
	{C: C02, at: at('на', 1) - 0.1, whip: true},
	{C: C03, at: at('20') - 0.1},
	{C: C04, at: at('рация') - 0.1},
	{C: C05, at: at('ты', 2) - 0.1, whip: true},
	{C: C06, at: AD1 + 0.05, noTrans: true},
	{C: C07, at: at('ты', 3) - 0.1},
	{C: C08, at: at('6') - 0.1, whip: true},
	{C: C09, at: at('еще') - 0.1},
	{C: C10, at: at('табло') - 0.1},
	{C: C11, at: at('ты', 6) - 0.1},
];
const Hud: React.FC<{T: number}> = ({T}) => {
	const diff = T >= at('минус') ? -12 : -9;
	const clock = T >= at('6') ? '06:00' : T >= at('5') ? '05:00' : '04:4' + (Math.floor(T) % 10);
	return <HudBar left={<>БЦ «ГОРИЗОНТ» · <span style={{color: '#5ee0da'}}>ПОСТ 1</span></>} right={<>{clock}<span style={{color: '#ff4a4a'}}> · РАЗНИЦА {diff}</span></>} />;
};
const P = makeShort({voDur: 40.7, ad1: AD1, cuts: CUTS, dir: 'turn3', hud: Hud, card: ({t}) => <QCard t={t} big={'А КТО ВЫШЕЛ\nВМЕСТО ТЕБЯ?'} small="пиши в комментариях" />});
export const Turn3 = P.Comp, TURN3_FRAMES = P.frames;
void Board; void Beam;

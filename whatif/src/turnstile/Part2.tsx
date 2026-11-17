// «Лишний на турникете», часть 2: −5, лифт сам едет на 31-й, коридор, пропуска без лиц, твой пропуск «выдан завтра», лифт уезжает без тебя.
import React from 'react';
import WORDS from './words2.json';
import {Badge, Beam, Board, Callout, Dark, Elevator, Floor31, Guard, HudBar, Layer, Lobby, PovHands, QCard, Radio, Stage, Svg, camOn, clamp, ease, idle, interpolate, lampXY, makeShort, mixCam, mkAt, random, type Cut, type SP, FPS} from './Turnstile';

const at = mkAt(WORDS as {w: string; t: number; e: number}[]);
const F = 780;
const ease1 = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], {...clamp, easing: ease});

const B01: React.FC<SP> = ({t}) => (
	<Stage cam={mixCam(camOn(960, 540, 1.0), camOn(960, 690, 1.5), ease1(t, 1.6, 2.6))} bg="#0b0d14" light={false}>
		<Layer depth={1}><Board inN={412} outN={417} flash={Math.floor(t * 8) % 2} diff="РАЗНИЦА: −5" /></Layer>
	</Stage>
);
const B02: React.FC<SP> = ({t, T}) => {
	const blink = Math.floor(t * 2.2) % 2;
	return (
		<Stage cam={mixCam(camOn(990, 600, 1.7), camOn(990, 560, 2.1), ease1(t, 0, 2.8))} bg="#141822" light={false}>
			<Layer depth={1}><Lobby T={T} inN={412} outN={417} arrow={blink} /></Layer>
			<Dark o={0.5 - 0.2 * blink} />
		</Stage>
	);
};
const floorAt = (T: number) => {
	if (T < at('жмёшь')) return '1';
	if (T < at('29')) return String(Math.min(28, 1 + Math.floor((T - at('жмёшь')) * 30)));
	if (T < at('табло')) return '29';
	return '31';
};
const B03: React.FC<SP> = ({t, T}) => {
	const press = ease1(T, at('жмёшь') - 0.2, at('жмёшь'));
	return (
		<Stage cam={mixCam(camOn(1150, 480, 1.5), camOn(1210, 420, 2.2), ease1(T, at('30') - 0.2, at('30') + 0.6))} bg="#3a4050" light={false}>
			<Layer depth={1}><Elevator T={T} floor={floorAt(T)} flicker={T > at('29') ? 1 : 0} pressed={press > 0.5 ? 30 : 0} /></Layer>
			<Layer depth={0.75}><PovHands cx={1180} y={760 - 60 * press} spread={0} /></Layer>
		</Stage>
	);
};
const B04: React.FC<SP> = ({t, T, f}) => {
	const stop = T > at('сам') - 0.05 && T < at('сам') + 0.3;
	return (
		<Stage cam={{...mixCam(camOn(1210, 300, 2.4), camOn(1210, 280, 3.0), ease1(T, at('31') - 0.1, at('31') + 0.3)), y: (stop ? Math.sin(f * 3) * 12 : 0) + mixCam(camOn(1210, 300, 2.4), camOn(1210, 280, 3.0), ease1(T, at('31') - 0.1, at('31') + 0.3)).y}} bg="#3a4050" light={false}>
			<Layer depth={1}><Elevator T={T} floor={floorAt(T)} flicker={1} pressed={30} /></Layer>
			<Layer depth={1}><Svg>{T > at('31') ? <circle cx={1210} cy={276} r={60} fill="#ff6a3a" opacity={0.15 + 0.1 * Math.sin(T * 12)} /> : null}</Svg></Layer>
		</Stage>
	);
};
const B05: React.FC<SP> = ({t, T}) => (
	<Stage cam={mixCam(camOn(1210, 360, 1.8), camOn(1210, 360, 2.0), ease1(t, 0, 3))} bg="#3a4050" light={false}>
		<Layer depth={1}><Elevator T={T} floor="31" pressed={30} /></Layer>
		<Layer depth={1}><Svg><Callout f={Math.round(T * FPS)} t0={Math.round(at('нет') * FPS)} t1={Math.round(at('нет') * FPS) + 200} from={[1150, 320]} to={[1210, 150]} text="31 — НЕТ" size={34} c="#ff4a4a" align="center" /></Svg></Layer>
	</Stage>
);
const B06: React.FC<SP> = ({t, T}) => {
	const open = ease1(t, 0.2, 1.2);
	const go = ease1(t, 1.6, 5);
	return (
		<Stage cam={mixCam(camOn(960, 560, 1.1), camOn(960, 560, 1.6), go)} bg="#151821" light={false}>
			<Layer depth={1}><Floor31 T={T} paint={T > at('пахнет')} /></Layer>
			<Beam lx={960} ly={1180} tx={960} ty={560} on={1} dark={0.86} spread={0.45} />
			{/* двери лифта раскрываются перед кадром */}
			<Layer depth={0.8}><Svg><rect x={-700} y={-400} width={1660 - 1000 * open} height={1800} fill="#5a6274" /><rect x={960 + 1000 * open} y={-400} width={2000} height={1800} fill="#5a6274" /></Svg></Layer>
		</Stage>
	);
};
// после рекламы: столы с пропусками
const desks = [600, 860, 1120, 1380];
const B07: React.FC<SP> = ({t, T}) => {
	const tx = interpolate(t, [0, 4.8], [600, 1380], {...clamp, easing: ease});
	return (
		<Stage cam={mixCam(camOn(600, 640, 1.6), camOn(1380, 640, 1.6), ease1(t, 0, 5))} bg="#151821" light={false}>
			<Layer depth={1}><Svg>
				<rect x={-700} y={-400} width={3300} height={1800} fill="#1d212c" />
				<rect x={-700} y={760} width={3300} height={700} fill="#262a36" />
				{desks.map((x, i) => <g key={i}><rect x={x - 110} y={700} width={220} height={24} fill="#4a4e5a" stroke="#1a1d24" strokeWidth={4} /><rect x={x - 100} y={724} width={14} height={120} fill="#3a3e4a" /><rect x={x + 86} y={724} width={14} height={120} fill="#3a3e4a" /><Badge x={x} y={640} s={0.62} rot={-6 + i * 4} /></g>)}
			</Svg></Layer>
			<Beam lx={tx - 80} ly={1150} tx={tx} ty={650} on={1} dark={0.9} spread={0.38} />
			<Layer depth={1}><Svg><Callout f={Math.round(T * FPS)} t0={Math.round(at('серые') * FPS)} t1={Math.round(at('серые') * FPS) + 200} from={[tx, 640]} to={[tx, 460]} text="БЕЗ ЛИЦ" size={32} c="#ff4a4a" align="center" /></Svg></Layer>
		</Stage>
	);
};
const B08: React.FC<SP> = ({t, T}) => {
	const z = ease1(T, at('твой') - 0.2, at('твой') + 0.5);
	const stamp = T > at('завтра') - 0.05;
	return (
		<Stage cam={mixCam(camOn(960, 620, 1.3), camOn(960, 620, 2.6), z)} bg="#151821" light={false}>
			<Layer depth={1}><Svg>
				<rect x={-700} y={-400} width={3300} height={1800} fill="#1d212c" />
				<rect x={760} y={700} width={400} height={24} fill="#4a4e5a" stroke="#1a1d24" strokeWidth={4} />
				<Badge x={960} y={620} s={0.9} me={T > at('кроме') + 0.4} rot={-4} />
				{stamp ? <g transform={`translate(1000,640) rotate(-14) scale(${1 + 0.8 * Math.max(0, 1 - (T - at('завтра')) / 0.15)})`}><rect x={-80} y={-26} width={160} height={52} rx={6} fill="none" stroke="#ff3b3b" strokeWidth={6} /><text y={14} textAnchor="middle" fontFamily="Rubik" fontWeight={900} fontSize={34} fill="#ff3b3b">ЗАВТРА</text></g> : null}
			</Svg></Layer>
			<Beam lx={900} ly={1150} tx={960} ty={630} on={1} dark={0.9} spread={0.35} />
		</Stage>
	);
};
const B09: React.FC<SP> = ({t, T}) => {
	const beep = T > at('пищит') - 0.05 && T < at('пищит') + 0.6 ? 1 : 0;
	return (
		<Stage cam={mixCam(camOn(990, 560, 1.2), camOn(990, 600, 2.2), ease1(t, 0, 3))} bg="#141822" light={false}>
			<Layer depth={1}><Lobby T={T} inN={412} outN={beep || T > at('пищит') ? 418 : 417} arrow={beep} /></Layer>
			<Dark o={0.5 - 0.25 * beep} />
		</Stage>
	);
};
const B10: React.FC<SP> = ({t, T}) => (
	<Stage cam={mixCam(camOn(960, 560, 1.2), camOn(960, 460, 1.7), ease1(t, 0, 2))} bg="#0b0d14" light={false}>
		<Layer depth={1}><Radio T={T} text={T > at('минус', 2) ? '−6' : '...'} /></Layer>
	</Stage>
);
const B11: React.FC<SP> = ({t, T, f}) => {
	const close = ease1(T, at('закрываются') - 0.2, at('без') + 0.2);
	const [lx, ly] = lampXY(700, 900, 1, 1);
	return (
		<Stage cam={mixCam(camOn(860, 560, 1.3), camOn(1150, 560, 1.6), ease1(t, 0.3, 2.2))} bg="#151821" light={false}>
			<Layer depth={1}><Svg>
				<rect x={-700} y={-400} width={3300} height={1800} fill="#1d212c" />
				<rect x={-700} y={900} width={3300} height={600} fill="#262a36" />
				<rect x={1020} y={360} width={300} height={540} fill="#fff6dc" />
				<rect x={1020} y={360} width={150 * close} height={540} fill="#5a6274" stroke="#1a1f30" strokeWidth={4} />
				<rect x={1320 - 150 * close} y={360} width={150 * close} height={540} fill="#5a6274" stroke="#1a1f30" strokeWidth={4} />
				<rect x={1000} y={340} width={340} height={580} fill="none" stroke="#3a4050" strokeWidth={14} />
				<polygon points={`1020,900 1320,900 ${1420 - 100 * close},1100 ${920 + 100 * close},1100`} fill="#fff6dc" opacity={0.15 * (1 - close)} />
				<Guard who="fon" x={700} floor={900} s={1} facing={1} pose={idle(f)} expr="wide" look={[1, 0]} acc={['lamp']} />
			</Svg></Layer>
			<Beam lx={lx} ly={ly} tx={1170} ty={600} on={1} dark={0.75} spread={0.3} />
		</Stage>
	);
};
const AD1 = 23.92;
const CUTS: Cut[] = [
	{C: B01, at: 0},
	{C: B02, at: at('здание') - 0.1},
	{C: B03, at: at('ты', 1) - 0.1, whip: true},
	{C: B04, at: at('лифт', 2) - 0.1},
	{C: B05, at: at('такого') - 0.1},
	{C: B06, at: at('двери') - 0.1},
	{C: B07, at: AD1 + 0.05, noTrans: true},
	{C: B08, at: at('кроме') - 0.1},
	{C: B09, at: at('где') - 0.1, whip: true},
	{C: B10, at: at('рация') - 0.1},
	{C: B11, at: at('ты', 3) - 0.1, whip: true},
];
const Hud: React.FC<{T: number}> = ({T}) => {
	const diff = T >= at('минус', 2) ? -6 : -5;
	const fl = T >= at('лифт') ? floorAt(T) : '1';
	return <HudBar left={<>БЦ «ГОРИЗОНТ» · <span style={{color: '#ffc94a'}}>ЭТАЖ {T >= at('двери') ? '31' : fl}</span></>} right={<>01:{String(Math.floor(T / 2)).padStart(2, '0')}:{String(Math.floor(T * 7) % 60).padStart(2, '0')}<span style={{color: '#ff4a4a'}}> · РАЗНИЦА {diff}</span></>} />;
};
const P = makeShort({voDur: 47.6, ad1: AD1, cuts: CUTS, dir: 'turn2', hud: Hud, card: ({t}) => <QCard t={t} big={'КТО ТОЛЬКО\nЧТО ВЫШЕЛ?'} small="ЧАСТЬ 3 — ФИНАЛ" />, cardAt: at('кто') - 0.15});
export const Turn2 = P.Comp, TURN2_FRAMES = P.frames;
void random;

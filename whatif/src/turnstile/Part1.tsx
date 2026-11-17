// «Лишний на турникете», часть 1: табло «вошло 412 / вышло 413», камеры пусты, турникет щёлкает сам, правило — обойти этажи.
import React from 'react';
import WORDS from './words1.json';
import {Actor, Beam, Board, Callout, Cctv, Dark, Guard, HudBar, Layer, Lobby, QCard, RuleV, Stage, Svg, camOn, clamp, ease, env, gesture, idle, interpolate, lampXY, makeShort, mixCam, mkAt, reach, walkTo, type Cut, type SP, FPS} from './Turnstile';

const at = mkAt(WORDS as {w: string; t: number; e: number}[]);
const F = 780; // пол холла
const ease1 = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], {...clamp, easing: ease});

const A01: React.FC<SP> = ({t, T, f}) => (
	<Stage cam={mixCam(camOn(1100, 470, 0.95), camOn(1260, 560, 1.45), ease1(t, 0, 4.4))} bg="#141822" light={{night: true, x: 60, y: 20, o: 0.25}}>
		<Layer depth={1}><Lobby T={T} inN={412} outN={412} /><Svg><Guard who="fon" x={1260} floor={F} s={0.9} facing={-1} pose={idle(f)} expr="sleepy" look={[-0.5, 0]} acc={['lampoff']} /></Svg></Layer>
		<Dark o={0.35} />
	</Stage>
);
const A02: React.FC<SP> = ({t, T, f}) => {
	const w = walkTo(f, 4, 60, 1260, 360, 2, 0.35);
	const lock = env(f, 66, 200, 8, 8);
	const pose = reach(w.pose, 'F', [70, -150], w.moving ? 0 : lock);
	const tag = interpolate(T, [at('сигнализацию'), at('сигнализацию') + 0.3], [0, 1], clamp);
	return (
		<Stage cam={mixCam(camOn(1100, 560, 1.15), camOn(400, 560, 1.5), ease1(t, 0, 2.2))} bg="#141822" light={{night: true, x: 30, y: 20, o: 0.25}}>
			<Layer depth={1}><Lobby T={T} inN={412} outN={412} doors={tag > 0 ? 1 : 0} /><Svg>
				<Guard who="fon" x={w.x} floor={F} s={0.9} facing={w.facing} pose={pose} vx={w.vx} bob={w.bob} expr="normal" look={[-0.4, 0]} acc={['lampoff']} />
				<g opacity={tag} transform="translate(280,300)"><rect x={-150} y={-30} width={300} height={54} rx={27} fill="#11142c" stroke="#3ae07a" strokeWidth={4} /><text y={9} textAnchor="middle" fontFamily="Rubik" fontWeight={900} fontSize={28} fill="#fff">ПОД ОХРАНОЙ</text></g>
			</Svg></Layer>
			<Dark o={0.35} />
		</Stage>
	);
};
const A03: React.FC<SP> = ({t, T}) => {
	const outN = T > at('413') - 0.05 ? 413 : 412;
	const fl = T > at('413') - 0.05 && T < at('413') + 0.6 ? Math.floor(T * 10) % 2 : 0;
	return (
		<Stage cam={mixCam(camOn(960, 540, 0.95), camOn(960, 560, 1.15), ease1(t, 0, 6))} bg="#0b0d14" light={false}>
			<Layer depth={1}><Board inN={T > at('вошло') ? 412 : 0} outN={T > at('вышло') ? outN : 0} flash={fl} /></Layer>
			<Layer depth={1}><Svg><Callout f={Math.round(T * FPS)} t0={Math.round(at('413') * FPS)} t1={Math.round(at('413') * FPS) + 200} from={[1130, 690]} to={[1130, 880]} text="+1" size={60} c="#ff4a4a" align="center" /></Svg></Layer>
		</Stage>
	);
};
const A05: React.FC<SP> = ({t, T, f}) => (
	<Stage cam={mixCam(camOn(1500, 450, 2.1), camOn(1500, 440, 2.5), ease1(t, 0, 2))} bg="#141822" light={false}>
		<Layer depth={1}><Lobby T={T} inN={412} outN={413} /><Svg><Guard who="fon" x={1500} floor={F} s={0.9} facing={-1} pose={gesture('scratch', idle(f), 1, f)} expr="worried" look={[-0.6, -0.4]} acc={['lampoff']} /></Svg></Layer>
		<Dark o={0.3} />
	</Stage>
);
const A06: React.FC<SP> = ({t, T}) => {
	const rew = T < at('никого') - 0.3 ? 1 : 0;
	return (
		<Stage cam={mixCam(camOn(960, 540, 1.0), camOn(960, 560, 1.35), ease1(t, 0, 3.2))} bg="#0b0d14" light={false}>
			<Layer depth={1}><Cctv T={T} rew={rew} stamp={rew ? `23:${String(59 - Math.floor(t * 9) % 50).padStart(2, '0')}:4${Math.floor(t * 7) % 10}` : '23:59:58'} /></Layer>
			<Layer depth={1}><Svg>{!rew ? <Callout f={Math.round(T * FPS)} t0={Math.round(at('никого') * FPS)} t1={Math.round(at('никого') * FPS) + 200} from={[960, 700]} to={[960, 430]} text="НИКОГО" size={44} c="#ffc94a" align="center" /> : null}</Svg></Layer>
		</Stage>
	);
};
const A07: React.FC<SP> = ({t, T}) => {
	const arrow = T > at('щелкнул') - 0.05 && T < at('погасла') + 0.1 ? 1 : 0;
	const k = ease1(T, at('щелкнул') - 0.1, at('щелкнул') + 0.3);
	return (
		<Stage cam={mixCam(camOn(990, 640, 1.8), camOn(990, 600, 2.6), k)} bg="#141822" light={false}>
			<Layer depth={1}><Lobby T={T} inN={412} outN={413} arrow={arrow} /></Layer>
			<Dark o={0.45 - 0.2 * arrow} />
		</Stage>
	);
};
const A08: React.FC<SP> = (p) => {
	const c0 = AD1 + 0.05;
	return <RuleV {...p} title="Инструкция охраны" lines={['цифры не сходятся —', 'обойди', 'все этажи.', 'СВЕРХУ ВНИЗ.']} starts={[at('цифры'), at('обойди'), at('все'), at('сверху')].map((a) => a - c0)} />;
};
const A09: React.FC<SP> = ({t, T, f}) => {
	const tOn = at('включаешь') + 0.3;
	const on = T > tOn ? 1 : 0;
	const hand = env(f, 0, Math.round((tOn - (T - t) + 0.3) * FPS), 4, 6);
	const w = walkTo(f, Math.round((tOn - (T - t) + 0.5) * FPS), Math.round((tOn - (T - t) + 2.6) * FPS), 1300, 1600, 4, 0.3);
	const [lx, ly] = lampXY(w.x, F, 0.9, 1);
	return (
		<Stage cam={mixCam(camOn(1300, 500, 2.0), camOn(1500, 520, 1.5), ease1(T, tOn, tOn + 1.5))} bg="#141822" light={false}>
			<Layer depth={1}><Lobby T={T} inN={412} outN={413} /><Svg><Guard who="fon" x={w.x} floor={F} s={0.9} facing={1} pose={reach(w.pose, 'F', [16, -196], hand)} vx={w.vx} bob={w.bob} expr="worried" look={[0.6, 0]} acc={[on ? 'lamp' : 'lampoff']} /></Svg></Layer>
			{on ? <Beam lx={lx} ly={ly} tx={1690} ty={560} on={1} dark={0.62} spread={0.35} /> : <Dark o={0.4} />}
		</Stage>
	);
};
const A10: React.FC<SP> = ({t, T}) => {
	const beep = T > at('пищить') - 0.05 && T < at('пищить') + 0.5 ? 1 : 0;
	return (
		<Stage cam={mixCam(camOn(990, 600, 2.4), camOn(990, 600, 2.9), ease1(T, at('пищить') - 0.1, at('пищить') + 0.2))} bg="#141822" light={false}>
			<Layer depth={1}><Lobby T={T} inN={412} outN={413} arrow={beep} /></Layer>
			<Dark o={0.5 - 0.25 * beep} />
		</Stage>
	);
};
const A11: React.FC<SP> = ({t, T, f}) => {
	const turn = ease1(t, 0.1, 0.6);
	const tx = interpolate(t, [0.4, 3.2], [1690, 280], {...clamp, easing: ease});
	const [lx, ly] = lampXY(1600, F, 0.9, turn > 0.5 ? -1 : 1);
	return (
		<Stage cam={mixCam(camOn(1450, 520, 1.5), camOn(900, 520, 1.0), ease1(t, 0.3, 3.2))} bg="#141822" light={false}>
			<Layer depth={1}><Lobby T={T} inN={412} outN={413} doors={1} /><Svg><Guard who="fon" x={1600} floor={F} s={0.9} facing={turn > 0.5 ? -1 : 1} pose={gesture('handsOnHead', idle(f), 0.2, f)} expr="wide" look={[-1, 0]} acc={['lamp']} /></Svg></Layer>
			<Beam lx={lx} ly={ly} tx={tx} ty={600} on={1} dark={0.72} spread={0.35} />
		</Stage>
	);
};
const A12: React.FC<SP> = ({t, T}) => {
	const out = T > at('414') - 0.05 ? 414 : 413;
	return (
		<Stage cam={mixCam(camOn(960, 560, 1.0), camOn(960, 690, 1.5), ease1(T, at('414') - 0.1, at('414') + 0.4))} bg="#0b0d14" light={false}>
			<Layer depth={1}><Board inN={412} outN={out} flash={out === 414 && Math.floor(T * 10) % 2 ? 1 : 0} diff={out === 414 ? 'ЛИШНИХ: 2' : undefined} /></Layer>
		</Stage>
	);
};

const AD1 = 28.1;
const CUTS: Cut[] = [
	{C: A01, at: 0},
	{C: A02, at: at('последний') - 0.1},
	{C: A03, at: at('полночь') - 0.3, whip: true},
	{C: A05, at: at('кто') - 0.1},
	{C: A06, at: at('отматываешь') - 0.3},
	{C: A07, at: at('турникет', 2) - 0.1},
	{C: A08, at: AD1 + 0.05, full: true, noTrans: true},
	{C: A09, at: at('включаешь') - 0.2, whip: true},
	{C: A10, at: at('спиной') - 0.25},
	{C: A11, at: at('оборачиваешься') - 0.3},
	{C: A12, at: at('табло', 2) - 0.4},
];
const Hud: React.FC<{T: number}> = ({T}) => {
	const mid = T >= at('полночь');
	const diff = T >= at('414') ? -2 : T >= at('413') ? -1 : 0;
	const clock = mid ? `00:${String(Math.floor((T - at('полночь')) / 2)).padStart(2, '0')}:${String(Math.floor(T * 7) % 60).padStart(2, '0')}` : `23:59:${String(40 + Math.floor(T * 1.5)).padStart(2, '0')}`;
	return <HudBar left={<>БЦ «ГОРИЗОНТ» · <span style={{color: '#5ee0da'}}>ПОСТ 1</span></>} right={<>{clock}{diff ? <span style={{color: '#ff4a4a'}}> · РАЗНИЦА {diff}</span> : null}</>} />;
};
const P = makeShort({voDur: 47.93, ad1: AD1, cuts: CUTS, dir: 'turn1', hud: Hud, card: ({t}) => <QCard t={t} big={'ТЫ БЫ ПОШЁЛ\nПО ЭТАЖАМ?'} small="ЧАСТЬ 2 — СКОРО" />, cardAt: at('бы') - 0.25});
export const Turn1 = P.Comp, TURN1_FRAMES = P.frames;
void Actor;

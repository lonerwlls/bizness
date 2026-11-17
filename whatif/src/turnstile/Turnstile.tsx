// «Лишний на турникете» — 3 части. Герой Фонарик — ночной охранник бизнес-центра «Горизонт».
// Общие места (холл с турникетами и табло, монитор камер, лифт, 31-й этаж, лестница) и общий «плеер» частей.
import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {Layer, Svg} from '../engine/camera';
import {Stage, camOn, mixCam, clamp, ease} from '../kit/kit';
import {Actor, TalkOverride} from '../kit/core';
import {idle, env, reach, walkTo, gesture} from '../kit/actions';
import {Callout} from '../kit/graphics';
import {FONT, HAND} from '../kit/ui';
import {Beam, PovHands, RuleV, ShotWrap, V, lampXY, type SP} from '../station/Station';

export const FPS = 30;
type Wd = {w: string; t: number; e: number};
const clean = (s: string) => s.toLowerCase().replace(/[.,?!«»—–\-]/g, '');
export const mkAt = (W: Wd[]) => (p: string, n = 1) => {
	let c = 0;
	for (const x of W) if (clean(x.w).startsWith(clean(p)) && ++c === n) return x.t;
	throw new Error('нет слова ' + p);
};
export {type SP};
const RED = '#ff4a4a', GRN = '#3ae07a', LED = '#ff6a3a';

// ---------- холл: стеклянная стена с ночным городом, турникеты, табло, пост охраны, лифт ----------
export const Lobby: React.FC<{T: number; inN?: number; outN?: number; arrow?: number; doors?: number; label?: string}> = ({T, inN = 412, outN = 413, arrow = 0, doors = 0, label}) => (
	<Svg>
		<rect x={-700} y={-400} width={3300} height={1800} fill="#141822" />
		{/* стеклянная стена и город */}
		<rect x={-700} y={120} width={1500} height={600} fill="#0a1024" />
		{Array.from({length: 22}).map((_, i) => {
			const x = -680 + i * 68, h = 140 + random('bh' + i) * 340;
			return <g key={i}><rect x={x} y={720 - h} width={60} height={h} fill="#141a34" />{Array.from({length: Math.floor(h / 40)}).map((_, k) => random('w' + i + k) > 0.6 ? <rect key={k} x={x + 10 + (k % 2) * 24} y={735 - h + k * 40} width={14} height={18} fill="#ffd27a" opacity={0.7} /> : null)}</g>;
		})}
		{Array.from({length: 8}).map((_, i) => <rect key={i} x={-700 + i * 190} y={120} width={10} height={600} fill="#2a3040" />)}
		<rect x={-700} y={110} width={1500} height={14} fill="#2a3040" />
		{/* стеклянные двери (входные) */}
		<rect x={130} y={340} width={300} height={380} fill="none" stroke="#5a6478" strokeWidth={10} />
		<path d="M 280 340 L 280 720" stroke="#5a6478" strokeWidth={8} />
		{doors ? <g><rect x={262} y={500} width={36} height={60} rx={6} fill="#3a4256" /><circle cx={280} cy={520} r={6} fill={GRN} /></g> : null}
		{/* стена холла справа: логотип, пост, лифт */}
		<rect x={800} y={-400} width={1800} height={1120} fill="#20263a" />
		{Array.from({length: 12}).map((_, i) => <rect key={i} x={800 + i * 150} y={-400} width={4} height={1120} fill="#1a1f30" />)}
		<text x={1120} y={230} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54} fill="#3a4466">БЦ «ГОРИЗОНТ»</text>
		{/* лифт */}
		<rect x={1580} y={380} width={220} height={340} fill="#5a6274" stroke="#1a1f30" strokeWidth={8} />
		<path d="M 1690 380 L 1690 720" stroke="#1a1f30" strokeWidth={6} />
		<rect x={1650} y={330} width={80} height={36} rx={6} fill="#0a0c12" /><text x={1690} y={358} textAnchor="middle" fontFamily="monospace" fontWeight={700} fontSize={26} fill={LED}>1</text>
		{/* пол — тёмный мрамор с отражениями */}
		<rect x={-700} y={720} width={3300} height={700} fill="#1c2130" />
		<polygon points="-700,720 2600,720 2600,760 -700,760" fill="#262c3e" />
		{Array.from({length: 9}).map((_, i) => <line key={i} x1={-700 + i * 420} y1={720} x2={-900 + i * 520} y2={1400} stroke="#232838" strokeWidth={4} />)}
		{/* табло-счётчик над турникетами */}
		<g transform="translate(960,300)">
			<rect x={-250} y={-90} width={500} height={180} rx={10} fill="#07080c" stroke="#2a3040" strokeWidth={8} />
			<text x={-220} y={-30} fontFamily={FONT} fontWeight={800} fontSize={30} fill="#7a8098">ВОШЛО</text>
			<text x={220} y={-30} textAnchor="end" fontFamily="monospace" fontWeight={700} fontSize={50} fill={GRN}>{inN}</text>
			<text x={-220} y={50} fontFamily={FONT} fontWeight={800} fontSize={30} fill="#7a8098">ВЫШЛО</text>
			<text x={220} y={56} textAnchor="end" fontFamily="monospace" fontWeight={700} fontSize={50} fill={outN > inN ? RED : GRN}>{outN}</text>
			{label ? <text x={0} y={140} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={RED}>{label}</text> : null}
		</g>
		{/* турникеты */}
		{[0, 1, 2].map((k) => {
			const x = 760 + k * 200;
			return <g key={k}>
				<rect x={x} y={560} width={60} height={200} rx={10} fill="#8a92a4" stroke="#1a1f30" strokeWidth={6} />
				<rect x={x + 8} y={580} width={44} height={22} rx={4} fill="#0a0c12" />
				<path d={`M ${x + 18} 591 L ${x + 30} 584 L ${x + 30} 598 Z`} fill={k === 1 && arrow > 0 ? GRN : '#2a2f3a'} />
				{k === 1 && arrow > 0 ? <circle cx={x + 30} cy={591} r={26} fill={GRN} opacity={0.25 * arrow} /> : null}
				<rect x={x + 60} y={620} width={110 * (k === 1 && arrow > 0 ? 0.3 : 1)} height={60} rx={8} fill="#a8d8f0" opacity={0.35} stroke="#5a6478" strokeWidth={3} />
			</g>;
		})}
		<rect x={1360} y={560} width={60} height={200} rx={10} fill="#8a92a4" stroke="#1a1f30" strokeWidth={6} />
		{/* пост охраны */}
		<rect x={1880} y={560} width={420} height={200} fill="#3a3028" stroke="#1a1410" strokeWidth={6} />
		{[0, 1, 2].map((k) => <g key={k}><rect x={1900 + k * 130} y={460} width={120} height={90} rx={6} fill="#0a0c12" stroke="#2a3040" strokeWidth={5} /><rect x={1908 + k * 130} y={468} width={104} height={74} fill="#2a4a5a" opacity={0.4 + 0.2 * Math.sin(T * 3 + k)} /></g>)}
	</Svg>
);
// табло крупно — вертикальное, помещается в кадр 9:16
export const Board: React.FC<{inN: number; outN: number; flash?: number; diff?: string}> = ({inN, outN, flash = 0, diff}) => (
	<Svg>
		<rect x={-700} y={-400} width={3300} height={1800} fill="#0b0d14" />
		<g transform="translate(960,540)">
			<rect x={-270} y={-330} width={540} height={660} rx={24} fill="#05060a" stroke="#2a3040" strokeWidth={14} />
			<text x={0} y={-235} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54} fill="#7a8098">ВОШЛО</text>
			<text x={0} y={-110} textAnchor="middle" fontFamily="monospace" fontWeight={700} fontSize={130} fill={GRN}>{inN || ''}</text>
			<line x1={-220} y1={-55} x2={220} y2={-55} stroke="#2a3040" strokeWidth={6} />
			<text x={0} y={30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54} fill="#7a8098">ВЫШЛО</text>
			<text x={0} y={160} textAnchor="middle" fontFamily="monospace" fontWeight={700} fontSize={130} fill={outN > inN ? RED : GRN} opacity={1 - 0.5 * flash}>{outN || ''}</text>
			{diff ? <text x={0} y={270} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={50} fill={RED}>{diff}</text> : null}
		</g>
	</Svg>
);
// монитор камер наблюдения (вертикальный, помещается в кадр): проход у турникетов, «перемотка»
export const Cctv: React.FC<{T: number; rew?: number; stamp: string; ghostArrow?: number; leaver?: number}> = ({T, rew = 0, stamp, ghostArrow = 0, leaver = 0}) => (
	<Svg>
		<rect x={-700} y={-400} width={3300} height={1800} fill="#0b0d14" />
		<rect x={690} y={220} width={540} height={680} rx={20} fill="#14161c" stroke="#2a2e38" strokeWidth={16} />
		<rect x={712} y={242} width={496} height={636} fill="#3a4a40" />
		<polygon points="712,878 1208,878 1080,560 840,560" fill="#4a5a50" />
		{[0, 1, 2].map((k) => <rect key={k} x={850 + k * 100} y={600} width={24} height={110} fill="#2a3a30" />)}
		<circle cx={962} cy={615} r={8} fill={ghostArrow ? '#8aff9a' : '#1a2a20'} />
		{leaver > 0 ? <g opacity={leaver} transform={`translate(${900 + 60 * leaver},700)`}><circle cx={0} cy={-80} r={18} fill="#0b0b0d" /><rect x={-16} y={-62} width={32} height={60} rx={10} fill="#1f9a96" /><line x1={-26} y1={-58} x2={-40} y2={-90} stroke="#0b0b0d" strokeWidth={6} /></g> : null}
		{Array.from({length: 90}).map((_, i) => <rect key={i} x={712 + random('cn' + i + Math.floor(T * 15)) * 496} y={242 + random('cm' + i + Math.floor(T * 15)) * 636} width={3} height={2} fill="#fff" opacity={0.15} />)}
		{rew ? Array.from({length: 6}).map((_, i) => <rect key={'r' + i} x={712} y={242 + ((T * 900 + i * 90) % 636)} width={496} height={6} fill="#fff" opacity={0.12} />) : null}
		<text x={730} y={282} fontFamily="monospace" fontWeight={700} fontSize={26} fill="#e8ffe8">CAM 01 · ВХОД</text>
		<text x={1190} y={860} textAnchor="end" fontFamily="monospace" fontWeight={700} fontSize={26} fill="#e8ffe8">{stamp}</text>
		{rew ? <text x={1190} y={320} textAnchor="end" fontFamily="monospace" fontWeight={900} fontSize={36} fill="#ffe86a">◀◀ ×8</text> : null}
	</Svg>
);
// лифт изнутри: стены, панель кнопок, табло
export const Elevator: React.FC<{T: number; floor: string; flicker?: number; pressed?: number}> = ({T, floor, flicker = 0, pressed = 30}) => {
	const fl = flicker && Math.floor(T * 14) % 3 === 0 ? 0.35 : 1;
	return (
		<Svg>
			<rect x={-700} y={-400} width={3300} height={1800} fill="#3a4050" />
			<rect x={560} y={160} width={800} height={760} fill="#5a6274" stroke="#2a3040" strokeWidth={10} />
			{[0, 1, 2, 3].map((k) => <rect key={k} x={580 + k * 195} y={180} width={180} height={720} fill="#646c80" />)}
			<rect x={560} y={100} width={800} height={50} fill="#fff6dc" opacity={0.85 * fl} />
			{/* панель */}
			<g transform="translate(1210,380)">
				<rect x={-90} y={-170} width={180} height={460} rx={12} fill="#c8ccd4" stroke="#2a3040" strokeWidth={6} />
				<rect x={-70} y={-150} width={140} height={60} rx={6} fill="#0a0c12" />
				<text x={0} y={-104} textAnchor="middle" fontFamily="monospace" fontWeight={700} fontSize={44} fill={LED}>{floor}</text>
				{Array.from({length: 30}).map((_, i) => {
					const n = 30 - i, x = -55 + (i % 3) * 55, y = -60 + Math.floor(i / 3) * 34;
					return <g key={i}><circle cx={x} cy={y} r={13} fill={n === pressed ? '#ffd27a' : '#e8eaf0'} stroke="#2a3040" strokeWidth={2} /><text x={x} y={y + 5} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={12} fill="#2a3040">{n}</text></g>;
				})}
			</g>
			<rect x={-700} y={920} width={3300} height={500} fill="#2a2e38" />
			<rect x={-700} y={-400} width={3300} height={1800} fill="#000" opacity={1 - fl} />
		</Svg>
	);
};
// коридор 31-го этажа: перспектива, стеклянные офисы, столы с пропусками
export const Floor31: React.FC<{T: number; paint?: boolean}> = ({paint}) => {
	const vp = [960, 540];
	return (
		<Svg>
			<rect x={-700} y={-400} width={3300} height={1800} fill="#151821" />
			<polygon points={`-700,-400 2600,-400 ${vp[0] + 140},${vp[1] - 110} ${vp[0] - 140},${vp[1] - 110}`} fill="#1d212c" />
			<polygon points={`-700,1400 2600,1400 ${vp[0] + 140},${vp[1] + 110} ${vp[0] - 140},${vp[1] + 110}`} fill="#262a36" />
			<polygon points={`-700,-400 ${vp[0] - 140},${vp[1] - 110} ${vp[0] - 140},${vp[1] + 110} -700,1400`} fill="#20242f" />
			<polygon points={`2600,-400 ${vp[0] + 140},${vp[1] - 110} ${vp[0] + 140},${vp[1] + 110} 2600,1400`} fill="#20242f" />
			{[0, 1, 2, 3].map((k) => {
				const z = 1 / (1 + k * 0.85), xl = vp[0] - (vp[0] + 700) * z * 0.9, w = 260 * z, top = vp[1] - 300 * z, h = 520 * z;
				return [-1, 1].map((sd) => <rect key={k + '' + sd} x={sd < 0 ? xl : 1920 - xl - w} y={top} width={w} height={h} fill="#2a3a50" opacity={0.45} stroke="#3a4a60" strokeWidth={4 * z} />);
			})}
			{[0, 1, 2, 3, 4].map((k) => <rect key={k} x={vp[0] - 30} y={vp[1] - 140 - k * 2} width={60} height={4} fill="#3a3e4a" />)}
			{paint ? <g transform="translate(560,640) rotate(-4)"><rect x={-90} y={-36} width={180} height={64} rx={6} fill="#f2d24a" stroke="#1a1410" strokeWidth={4} /><text y={10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={28} fill="#1a1410">ОКРАШЕНО</text></g> : null}
		</Svg>
	);
};
// пропуск сотрудника: me — с лицом героя и датой «завтра»
export const Badge: React.FC<{x: number; y: number; s?: number; me?: boolean; rot?: number}> = ({x, y, s = 1, me, rot = 0}) => (
	<g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
		<rect x={-110} y={-70} width={220} height={140} rx={12} fill="#eef0f4" stroke="#1a1f30" strokeWidth={4} />
		<rect x={-110} y={-70} width={220} height={28} rx={12} fill="#2a5ab8" />
		<text x={0} y={-50} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={16} fill="#fff">БЦ «ГОРИЗОНТ» · ПРОПУСК</text>
		<rect x={-95} y={-32} width={70} height={90} rx={6} fill={me ? '#1f9a96' : '#9a9ea8'} />
		{me ? <g><circle cx={-60} cy={2} r={22} fill="#0b0b0d" /><ellipse cx={-67} cy={0} rx={4} ry={5} fill="#fff" /><ellipse cx={-53} cy={0} rx={4} ry={5} fill="#fff" /><rect x={-70} y={-24} width={20} height={9} rx={3} fill="#3a404c" /></g> : <ellipse cx={-60} cy={6} rx={22} ry={26} fill="#7a7e88" opacity={0.8} style={{filter: 'blur(3px)'}} />}
		<rect x={-14} y={-26} width={110} height={10} rx={4} fill="#9aa0ac" />
		<rect x={-14} y={-6} width={80} height={10} rx={4} fill="#b8bcc6" />
		{me ? <text x={-14} y={40} fontFamily={FONT} fontWeight={900} fontSize={18} fill="#c83a3a">ВЫДАН: ЗАВТРА</text> : <rect x={-14} y={30} width={90} height={10} rx={4} fill="#c8ccd4" />}
	</g>
);
// лестничная клетка: марши зигзагом, табличка этажа
export const Stairs: React.FC<{T: number; n: string}> = ({n}) => (
	<Svg>
		<rect x={-700} y={-400} width={3300} height={1800} fill="#2a2e38" />
		{Array.from({length: 6}).map((_, k) => <rect key={k} x={-700} y={-400 + k * 300} width={3300} height={8} fill="#22262e" />)}
		{[0, 1].map((k) => <polygon key={k} points={k ? '520,980 1400,560 1400,620 520,1040' : '520,560 1400,140 1400,200 520,620'} fill="#4a505e" stroke="#1a1d24" strokeWidth={5} />)}
		{Array.from({length: 12}).map((_, i) => <line key={i} x1={520 + i * 73} y1={1040 - i * 35} x2={520 + i * 73} y2={980 - i * 35} stroke="#1a1d24" strokeWidth={3} />)}
		<path d="M 520 960 L 1400 540" stroke="#c84a3a" strokeWidth={8} />
		<rect x={1440} y={380} width={140} height={110} rx={8} fill="#e8eaf0" stroke="#1a1d24" strokeWidth={5} />
		<text x={1510} y={466} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={80} fill="#1a1d24">{n}</text>
	</Svg>
);
// офисный этаж за стеклом: силуэты за столами; turn — повернули головы
export const Silhouettes: React.FC<{T: number; turn: number}> = ({T, turn}) => (
	<Svg>
		<rect x={-700} y={-400} width={3300} height={1800} fill="#1a1d26" />
		<rect x={300} y={240} width={1320} height={620} fill="#0e1018" stroke="#3a4050" strokeWidth={12} />
		{[1, 2, 3].map((k) => <rect key={k} x={300 + k * 330} y={240} width={8} height={620} fill="#3a4050" />)}
		{Array.from({length: 6}).map((_, i) => {
			const x = 420 + i * 220, y = 640;
			return <g key={i}>
				<rect x={x - 70} y={y + 60} width={140} height={20} fill="#2a2e38" />
				<rect x={x - 26} y={y - 10} width={52} height={74} rx={18} fill="#05060a" />
				<circle cx={x} cy={y - 40} r={28} fill="#05060a" />
				{turn > 0 ? [-1, 1].map((q) => <ellipse key={q} cx={x + q * 9} cy={y - 42} rx={4} ry={3} fill="#f2f6ff" opacity={turn * (Math.floor(T * 3 + i) % 9 === 0 ? 0.2 : 1)} />) : null}
			</g>;
		})}
		<rect x={300} y={240} width={1320} height={620} fill="#a8d8f0" opacity={0.06} />
		<path d="M 340 280 L 520 260" stroke="#fff" strokeWidth={6} opacity={0.15} />
	</Svg>
);
// считыватель пропусков у турникета крупно: зелёный/красный
export const Reader: React.FC<{state: 'idle' | 'red' | 'green'; badge?: number}> = ({state, badge = 0}) => (
	<Svg>
		<rect x={-700} y={-400} width={3300} height={1800} fill="#1c2130" />
		<rect x={760} y={300} width={400} height={700} rx={30} fill="#8a92a4" stroke="#1a1f30" strokeWidth={10} />
		<rect x={820} y={360} width={280} height={180} rx={14} fill="#0a0c12" />
		<circle cx={960} cy={450} r={60} fill={state === 'red' ? RED : state === 'green' ? GRN : '#2a2f3a'} />
		{state !== 'idle' ? <circle cx={960} cy={450} r={140} fill={state === 'red' ? RED : GRN} opacity={0.25} /> : null}
		{state === 'red' ? <text x={960} y={640} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={64} fill={RED} stroke="#1c2130" strokeWidth={6} paintOrder="stroke">ОТКАЗ</text> : null}
		{badge > 0 ? <g transform={`translate(960,${960 - 160 * badge})`}><Badge x={0} y={0} s={1.2} me /><g transform="translate(120,40) rotate(-20)"><rect x={0} y={-20} width={200} height={50} fill="#1f9a96" stroke="#0e3e3c" strokeWidth={4} /><ellipse cx={-6} cy={4} rx={26} ry={22} fill="#0b0b0d" /></g></g> : null}
	</Svg>
);
export const Radio: React.FC<{T: number; text?: string}> = ({T, text}) => (
	<Svg>
		<rect x={-700} y={-400} width={3300} height={1800} fill="#0b0d14" />
		<g transform="translate(960,600)">
			<rect x={-120} y={-260} width={240} height={480} rx={30} fill="#2a2e34" stroke="#111" strokeWidth={8} />
			<rect x={-90} y={-220} width={180} height={110} rx={10} fill="#9fe8a0" opacity={0.85} />
			{text ? <text x={0} y={-150} textAnchor="middle" fontFamily="monospace" fontWeight={900} fontSize={56} fill="#103010">{text}</text> : null}
			{Array.from({length: 16}).map((_, i) => <circle key={i} cx={-60 + (i % 4) * 40} cy={-40 + Math.floor(i / 4) * 40} r={10} fill="#111" />)}
			<rect x={60} y={-380} width={24} height={130} fill="#111" />
			<circle cx={72} cy={-386} r={10} fill={Math.floor(T * 3) % 2 ? RED : '#5a2a2a'} />
			{[1, 2, 3].map((r) => <path key={r} d={`M ${150 + r * 40} ${-80 - r * 40} Q ${190 + r * 50} -20 ${150 + r * 40} ${40 + r * 40}`} stroke="#9fe8a0" strokeWidth={8} fill="none" opacity={0.3 + 0.6 * Math.abs(Math.sin(T * 9 + r))} />)}
		</g>
	</Svg>
);

// герой-охранник: Фонарик с бейджем «ОХРАНА»
export const Guard: React.FC<React.ComponentProps<typeof Actor>> = (p) => <Actor {...p} chestText="ОХРАНА" />;
export {Beam, PovHands, RuleV, lampXY, Callout, Actor, TalkOverride, idle, env, reach, walkTo, gesture, camOn, mixCam, Stage, Layer, Svg, clamp, ease, interpolate, random, FONT, HAND};

// ---------- общий плеер части ----------
export type Cut = {C: React.FC<SP>; at: number; full?: boolean; whip?: boolean; noTrans?: boolean};
export const makeShort = (o: {voDur: number; ad1: number; cuts: Cut[]; dir: string; hud: React.FC<{T: number}>; card: React.FC<{t: number}>; cardAt?: number; endCard?: number}) => {
	const AD_LEN = 5.97, AD_HOLD = 0.6 + AD_LEN + 0.25, END = o.voDur + 0.25, CARD = o.cardAt ?? END;
	const frames = Math.ceil((END + (o.endCard ?? 3) + AD_HOLD) * FPS);
	const storyT = (s: number) => (s < o.ad1 ? s : s < o.ad1 + AD_HOLD ? o.ad1 : s - AD_HOLD);
	const inAd = (s: number) => s >= o.ad1 + 0.6 && s < o.ad1 + AD_HOLD;
	const Comp: React.FC = () => {
		const fr = useCurrentFrame();
		const s = fr / FPS, T = storyT(s);
		const CUTS = o.cuts;
		const ci = CUTS.reduce((a, c, i) => (T >= c.at ? i : a), 0);
		const cut = CUTS[ci];
		const next = ci + 1 < CUTS.length ? CUTS[ci + 1].at : END;
		const t = T - cut.at, f = Math.round(t * FPS), len = Math.max(1, Math.round((next - cut.at) * FPS));
		const nextCut = ci + 1 < CUTS.length ? CUTS[ci + 1] : null;
		const kin = cut.whip ? interpolate(t, [0, 0.25], [1, 0], {...clamp, easing: ease}) : 0;
		const kout = nextCut?.whip ? interpolate(T, [next - 0.2, next], [0, 1], {...clamp, easing: ease}) : 0;
		const zin = !cut.whip && !cut.noTrans && ci > 0 ? interpolate(t, [0, 0.28], [1, 0], {...clamp, easing: ease}) : 0;
		const zout = nextCut && !nextCut.whip && !nextCut.noTrans ? interpolate(T, [next - 0.16, next], [0, 1], {...clamp, easing: ease}) : 0;
		const zs = 1 + 0.3 * zin + 0.25 * zout, dx = kin * 700 - kout * 700, blur = (kin + kout) * 28 + (zin + zout) * 10;
		const ad1F = Math.round(o.ad1 * FPS), holdF = Math.round(AD_HOLD * FPS);
		const C = cut.C, ended = T >= CARD;
		const Hud = o.hud, Card = o.card;
		return (
			<AbsoluteFill style={{background: '#000'}}>
				{!ended ? (
					<AbsoluteFill style={{transform: `translateX(${dx}px) scale(${zs})`, filter: blur > 0.5 ? `blur(${blur}px)` : undefined}}>
						{cut.full ? <C t={t} T={T} f={f} /> : <V fx={960}><ShotWrap f={f} k={ci} len={len}><C t={t} T={T} f={f} /></ShotWrap></V>}
					</AbsoluteFill>
				) : <Card t={T - CARD + 0.2} />}
				{!ended ? <Hud T={T} /> : null}
				{inAd(s) ? <AbsoluteFill style={{background: 'rgba(0,0,0,0.62)'}} /> : null}
				<Sequence from={0} durationInFrames={ad1F}>
					<Audio src={staticFile(`${o.dir}/voice.mp3`)} />
					<Audio src={staticFile(`${o.dir}/bed.wav`)} volume={0.85} />
				</Sequence>
				<Sequence from={ad1F + holdF}>
					<Audio src={staticFile(`${o.dir}/voice.mp3`)} startFrom={ad1F} />
					<Audio src={staticFile(`${o.dir}/bed.wav`)} volume={0.85} startFrom={ad1F} />
				</Sequence>
			</AbsoluteFill>
		);
	};
	return {Comp, frames};
};
export const TalkWith: React.FC<{fn: (sp: string) => number; children: React.ReactNode}> = ({fn, children}) => <TalkOverride.Provider value={fn}>{children}</TalkOverride.Provider>;
export const HudBar: React.FC<{left: React.ReactNode; right: React.ReactNode}> = ({left, right}) => (
	<div style={{position: 'absolute', top: 54, left: 40, right: 40, display: 'flex', justifyContent: 'space-between', fontFamily: FONT, fontWeight: 800, fontSize: 30, color: '#fff', textShadow: '0 2px 6px #000'}}>
		<div style={{background: 'rgba(0,0,0,0.5)', padding: '8px 16px', borderRadius: 8}}>{left}</div>
		<div style={{background: 'rgba(0,0,0,0.5)', padding: '8px 16px', borderRadius: 8, fontVariantNumeric: 'tabular-nums'}}>{right}</div>
	</div>
);
export const QCard: React.FC<{t: number; big: string; small: string}> = ({t, big, small}) => (
	<AbsoluteFill style={{background: '#000', alignItems: 'center', justifyContent: 'center', fontFamily: FONT}}>
		<div style={{opacity: interpolate(t, [0.2, 0.6], [0, 1], clamp), textAlign: 'center', color: '#fff', padding: '0 60px'}}>
			<div style={{fontSize: 92, fontWeight: 900, lineHeight: 1.05, whiteSpace: 'pre-line'}}>{big}</div>
			<div style={{fontSize: 40, fontWeight: 800, color: '#9fe8e4', marginTop: 34, opacity: interpolate(t, [0.8, 1.2], [0, 1], clamp)}}>{small}</div>
		</div>
	</AbsoluteFill>
);
export const Dark: React.FC<{o?: number}> = ({o = 0.5}) => <Svg><rect x={-800} y={-600} width={3600} height={2400} fill="#03050c" opacity={o} /></Svg>;
void HAND;

import React from 'react';
import {AbsoluteFill} from 'remotion';
import {talkOf, useShot} from '../kit/core';
import {Layer, Stage, Svg, usePush} from '../kit/kit';
import type {Cam} from '../engine/camera';
import {FONT, HAND} from '../kit/ui';
import {Bg, Light, P} from '../toon/kit';
import {INK} from '../toon/Toon';
import {S} from './partC1';

/* shared props and helpers for parts 4–6 of "The Great Impostor" */
export const talk = (sp: string, gf: number) => talkOf(sp, gf - (gf % 3));
export const ST = {bg: '#2a2a2e', light: false as const, grain: 0, vig: 0};
export const CLINIC_SPOTS: [number, number, number][] = [[P(285, 215)[0], P(285, 215)[1], 280], [P(1200, 170)[0], P(1200, 170)[1], 300]];
export const CABIN_SPOTS: [number, number, number][] = [[P(1150, 285)[0], P(1150, 285)[1], 320], [P(930, 175)[0], P(930, 175)[1], 160]];
export const REC_SPOTS: [number, number, number][] = [[P(505, 75)[0], P(505, 75)[1] + 80, 300], [P(730, 360)[0], P(730, 360)[1], 160]];
export const PRISON_SPOTS: [number, number, number][] = [[P(820, 260)[0], P(820, 260)[1], 360], [P(1170, 390)[0], P(1170, 390)[1], 200]];
export const CORR_SPOTS: [number, number, number][] = [[P(560, 60)[0], P(560, 60)[1] + 120, 300], [P(800, 120)[0], P(800, 120)[1] + 100, 260], [P(1250, 300)[0], P(1250, 300)[1], 220]];

/* world point of a hand given a toon's feet position (x, y), scale and facing */
export const hp = (x: number, y: number, h: [number, number], facing: 1 | -1 = 1, s = S): [number, number] => [x + facing * h[0] * s, y + h[1] * s];
/* local hand coordinates that reach a world point */
export const lh = (x: number, y: number, p: [number, number], facing: 1 | -1 = 1, s = S): [number, number] => [((p[0] - x) / s) * facing, (p[1] - y) / s];

/* one background shot with a slow camera push and lamp light */
export const Sc: React.FC<{bg: string; a: Cam; b: Cam; id: string; spots?: [number, number, number][]; dark?: number; glow?: string; dim?: number; children?: React.ReactNode}> = ({bg, a, b, id, spots, dark, glow, dim, children}) => (
	<Stage cam={usePush(a, b)} {...ST}>
		<Layer depth={1}>
			<Bg src={bg} dim={dim} />
			<Svg>{children}</Svg>
			{spots ? <Light id={id} spots={spots} dark={dark} glow={glow} /> : null}
		</Layer>
	</Stage>
);

/* a plain dark studio backdrop (for gags with no real place) with a spotlight */
export const Backdrop: React.FC<{c?: string; children?: React.ReactNode}> = ({c = '#3a2a2a', children}) => (
	<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 60%, ${c} 0%, #15121a 75%)`}}>
		<svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
			<ellipse cx={960} cy={1000} rx={520} ry={70} fill="#fff" opacity={0.08} />
			{children}
		</svg>
	</AbsoluteFill>
);

/* a stretcher carried between two hands: blanket hump + head on a pillow */
export const Litter: React.FC<{x: number; y: number; skin?: string; hair?: string}> = ({x, y, skin = '#e4c098', hair = '#2a2420'}) => (
	<g transform={`translate(${x},${y})`}>
		<line x1={-210} y1={0} x2={210} y2={0} stroke="#7a5a3a" strokeWidth={10} strokeLinecap="round" />
		<rect x={-170} y={-14} width={340} height={16} rx={4} fill="#c8b890" stroke={INK} strokeWidth={4} />
		<path d="M-120,-14 Q-60,-62 40,-50 Q110,-44 150,-14 Z" fill="#7a8a6a" stroke={INK} strokeWidth={4} />
		<ellipse cx={-140} cy={-24} rx={30} ry={12} fill="#f4efe2" stroke={INK} strokeWidth={3} />
		<circle cx={-142} cy={-48} r={28} fill={skin} stroke={INK} strokeWidth={4} />
		<path d="M-170,-52 Q-150,-80 -116,-62" stroke={hair} strokeWidth={12} fill="none" strokeLinecap="round" />
		<rect x={-150} y={-74} width={30} height={10} rx={3} fill="#f4efe2" stroke={INK} strokeWidth={2} />
	</g>
);

/* a patient on the operating table of or.jpg under a sheet */
export const TablePatient: React.FC = () => (
	<g>
		<circle cx={1330} cy={560} r={34} fill="#e4c098" stroke={INK} strokeWidth={4} />
		<path d="M1300,548 Q1320,520 1360,536" stroke="#1a1a1e" strokeWidth={12} fill="none" strokeLinecap="round" />
		<path d="M1352,592 Q1460,560 1600,590 L1690,600 L1690,640 L1352,640 Z" fill="#eef0ec" stroke={INK} strokeWidth={4} />
	</g>
);

export const Scalpel: React.FC<{x: number; y: number; rot: number; glint?: boolean}> = ({x, y, rot, glint}) => (
	<g transform={`translate(${x},${y}) rotate(${rot})`}>
		<rect x={-34} y={-5} width={40} height={10} rx={3} fill="#8a90a0" stroke={INK} strokeWidth={3} />
		<path d="M6,-5 L40,-2 Q46,2 40,6 L6,5 Z" fill="#e8ecf2" stroke={INK} strokeWidth={3} />
		{glint ? <path d="M44,-24 L48,-8 L62,-4 L48,0 L44,16 L40,0 L26,-4 L40,-8 Z" fill="#fff6c0" stroke={INK} strokeWidth={2} /> : null}
	</g>
);
export const Forceps: React.FC<{x: number; y: number; rot: number; bullet?: boolean}> = ({x, y, rot, bullet}) => (
	<g transform={`translate(${x},${y}) rotate(${rot})`}>
		<path d="M0,0 L55,-5 M0,5 L55,3" stroke="#c8ccd6" strokeWidth={6} strokeLinecap="round" />
		<path d="M0,0 L55,-5 M0,5 L55,3" stroke={INK} strokeWidth={2} strokeLinecap="round" />
		{bullet ? <ellipse cx={63} cy={0} rx={11} ry={7} fill="#c9873a" stroke={INK} strokeWidth={3} /> : null}
	</g>
);

/* a stethoscope drawn over a toon's chest (same transform as the toon) */
export const Stetho: React.FC<{x: number; y: number; facing?: 1 | -1; ear?: boolean}> = ({x, y, facing = 1}) => (
	<g transform={`translate(${x},${y}) scale(${S * facing},${S})`}>
		<path d="M-26,-168 Q-30,-120 0,-112 Q30,-120 26,-168" stroke="#2a2a30" strokeWidth={6} fill="none" />
		<path d="M0,-112 L0,-96" stroke="#2a2a30" strokeWidth={6} />
		<circle cx={0} cy={-90} r={9} fill="#c8ccd6" stroke={INK} strokeWidth={3} />
	</g>
);

/* a newspaper held open (centre x, top y), headline + photo */
export const Paperboard: React.FC<{x: number; y: number; w?: number; h?: number; title: string; rot?: number; photo?: React.ReactNode}> = ({x, y, w = 200, h = 130, title, rot = 0, photo}) => (
	<g transform={`translate(${x},${y}) rotate(${rot})`}>
		<rect x={-w / 2} y={0} width={w} height={h} fill="#f1ecdc" stroke={INK} strokeWidth={4} />
		<line x1={0} y1={4} x2={0} y2={h - 4} stroke="#b8b0a0" strokeWidth={2} />
		<text x={-w / 2 + 8} y={22} fontFamily={FONT} fontWeight={900} fontSize={18} fill={INK}>
			{title}
		</text>
		{photo ?? <rect x={-w / 2 + 10} y={32} width={w * 0.4} height={h * 0.45} fill="#a8a090" />}
		{[0, 1, 2, 3].map((i) => (
			<line key={i} x1={8} y1={40 + i * 18} x2={w / 2 - 10} y2={40 + i * 18} stroke="#8a8070" strokeWidth={4} />
		))}
	</g>
);

/* a typewriter on a table edge, paper rising by k (0..1) */
export const Typewriter: React.FC<{x: number; y: number; k: number; text: string; f: number}> = ({x, y, k, text, f}) => (
	<g transform={`translate(${x},${y})`}>
		<rect x={-80} y={-110 - 70 * k} width={160} height={90 + 70 * k} fill="#fbf8ee" stroke={INK} strokeWidth={4} />
		<text x={-68} y={-80 - 70 * k} fontFamily={FONT} fontWeight={900} fontSize={20} fill={INK}>
			{text.slice(0, Math.floor(k * text.length * 1.4))}
		</text>
		<path d="M-120,-30 L120,-30 L140,40 L-140,40 Z" fill="#3a4a3a" stroke={INK} strokeWidth={5} />
		<rect x={-130} y={-44} width={260} height={18} rx={8} fill="#2a2a2e" stroke={INK} strokeWidth={4} />
		{Array.from({length: 10}).map((_, i) => (
			<circle key={i} cx={-100 + i * 22} cy={18 + ((i + Math.floor(f / 2)) % 3 === 0 ? 3 : 0)} r={8} fill="#e8e4d8" stroke={INK} strokeWidth={2} />
		))}
	</g>
);

/* LIFE-style magazine cover with Fred's face (no real logo, just a red box) */
export const Mag: React.FC<{x: number; y: number; s?: number; rot?: number; date?: string}> = ({x, y, s = 1, rot = 0, date = 'JAN. 28, 1952'}) => (
	<g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
		<rect x={-160} y={-210} width={320} height={420} fill="#e8e2d2" stroke={INK} strokeWidth={5} />
		<rect x={-150} y={-200} width={300} height={400} fill="#6a7a8a" />
		{/* Fred's portrait */}
		<rect x={-150} y={40} width={300} height={160} fill="#3d4250" />
		<circle cx={0} cy={-10} r={92} fill="#f1d2b0" stroke={INK} strokeWidth={5} />
		<path d="M-86,-40 Q-60,-110 0,-104 Q70,-110 88,-40 Q60,-70 0,-70 Q-50,-72 -86,-40 Z" fill="#3a2a20" stroke={INK} strokeWidth={4} />
		<circle cx={-30} cy={-14} r={8} fill={INK} />
		<circle cx={34} cy={-14} r={8} fill={INK} />
		<path d="M-30,30 Q0,52 34,30" stroke={INK} strokeWidth={6} fill="none" />
		<rect x={-150} y={-200} width={120} height={70} fill="#c8302a" />
		<text x={-90} y={-150} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill="#fff">
			LIFE
		</text>
		<text x={140} y={-170} textAnchor="end" fontFamily={FONT} fontWeight={900} fontSize={18} fill="#fff">
			{date}
		</text>
		<text x={0} y={180} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={40} fill="#f2c94c">
			The Great Impostor
		</text>
	</g>
);

/* a telegram sheet with typed text appearing */
export const Telegram: React.FC<{f: number; t: number; lines: string[]; head?: string}> = ({f, t, lines, head = 'NAVAL SIGNAL'}) => {
	let left = Math.max(0, (f - t) * 1.3);
	return (
		<g>
			<rect x={520} y={210} width={880} height={560} fill="#000" opacity={0.3} transform="translate(12,14)" />
			<rect x={520} y={210} width={880} height={560} fill="#efe6c8" stroke={INK} strokeWidth={5} />
			<rect x={520} y={210} width={880} height={90} fill="#d8c890" stroke={INK} strokeWidth={5} />
			<text x={960} y={272} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={INK}>
				{head}
			</text>
			{lines.map((l, i) => {
				const n = Math.min(l.length, Math.floor(left));
				left -= l.length;
				return (
					<text key={i} x={580} y={390 + i * 80} fontFamily="Courier New, monospace" fontWeight={700} fontSize={62} fill={INK}>
						{l.slice(0, Math.max(0, n))}
					</text>
				);
			})}
		</g>
	);
};

/* simple map of Canada on felt (screen space) */
export const CanadaMap: React.FC<{children?: React.ReactNode}> = ({children}) => (
	<g>
		<rect x={160} y={140} width={1600} height={800} fill="#cfe2ea" stroke={INK} strokeWidth={5} />
		<path d="M200,420 Q300,300 520,330 Q700,250 900,300 Q1100,240 1300,320 Q1450,300 1560,420 Q1700,470 1690,600 Q1600,660 1480,640 Q1300,700 1100,660 L300,660 Q220,560 200,420 Z" fill="#d8c8a0" stroke={INK} strokeWidth={5} />
		<path d="M300,660 L1100,660 Q1300,700 1420,760 L1440,900 L300,900 Z" fill="#c8d0a0" stroke={INK} strokeWidth={4} opacity={0.8} />
		<text x={700} y={520} fontFamily={HAND} fontWeight={700} fontSize={70} fill={INK}>
			Canada
		</text>
		<text x={620} y={820} fontFamily={HAND} fontWeight={700} fontSize={50} fill="#5a6a4a">
			U.S.A.
		</text>
		<text x={180} y={230} fontFamily={HAND} fontWeight={700} fontSize={42} fill="#2a4a8a">
			Pacific
		</text>
		<text x={1560} y={230} fontFamily={HAND} fontWeight={700} fontSize={42} fill="#2a4a8a">
			Atlantic
		</text>
		{children}
	</g>
);

import React from 'react';
import {AbsoluteFill, interpolate, random} from 'remotion';
import {env, gesture, idle} from '../kit/actions';
import {Actor} from '../kit/core';
import {clamp} from '../kit/kit';
import {FONT, HAND} from '../kit/ui';
import {Prop3D, at, propScene} from '../three/Prop3D';
import {makeJar, makeSpoon, makeWaterGlass} from '../three/props';
import {CAST} from './cast';
import {pop} from './lib';
import {DinnerTable} from './placesD';
import SEGS from './short-segs.json';

/* The vertical short (≤ 60 s) cut from the long "What if you hiccuped for 68 years?":
   the long's own voice clips (short-lines.json reuses them), its shots cropped to 9:16
   (short-segs.json), labels that the crop cuts off re-drawn as vertical chips (overlays),
   and the wide cards (quote, "430 million behind", the question) redrawn natively. */
export type Seg = {
	line: string;
	at?: number;
	ep?: string;
	off?: number;
	cont?: boolean;
	hold?: boolean;
	a?: {cx?: number; cy?: number; z?: number};
	b?: {cx?: number; cy?: number; z?: number};
	C?: React.FC<{f: number; dur: number}>;
	O?: React.FC<{f: number; dur: number}>;
};

const YOUNG = {age: 0, hairColor: CAST.hero.hairColor};

/* ------------------------------ label chips ------------------------------ */
const Chip: React.FC<{f: number; t: number; top: number; side: 'l' | 'r' | 'c'; text: string; bg?: string; fg?: string; size?: number; rot?: number}> = ({f, t, top, side, text, bg = '#11142c', fg = '#fff', size = 54, rot = -2}) => {
	const k = pop(f, t);
	if (f < t) return null;
	const pos: React.CSSProperties = side === 'l' ? {left: 60} : side === 'r' ? {right: 60} : {left: 0, right: 0, display: 'flex', justifyContent: 'center'};
	return (
		<div style={{position: 'absolute', top, ...pos}}>
			<div style={{display: 'inline-block', padding: '12px 30px', background: bg, color: fg, fontFamily: FONT, fontWeight: 900, fontSize: size, borderRadius: 14, transform: `rotate(${rot}deg) scale(${k})`, boxShadow: '0 8px 0 rgba(0,0,0,0.35)', whiteSpace: 'nowrap'}}>{text}</div>
		</div>
	);
};
const SEPIA = {bg: '#fff4d8', fg: '#1b1208'};
const Nebraska: React.FC<{f: number; dur: number; held?: boolean}> = ({f, held}) => (
	<AbsoluteFill>
		<Chip f={f} t={held ? -99 : 10} top={230} side="l" text="1922 · NEBRASKA" {...SEPIA} rot={-3} />
		<Chip f={f} t={held ? -99 : 26} top={340} side="r" text="CHARLES OSBORNE" {...SEPIA} size={46} rot={2} />
	</AbsoluteFill>
);
const Nebraska2: React.FC<{f: number; dur: number}> = ({f, dur}) => <Nebraska f={f} dur={dur} held />;
const Years: React.FC<{f: number; dur: number}> = ({f}) => {
	const year = Math.round(interpolate(f, [10, 70], [1922, 1990], clamp));
	return (
		<AbsoluteFill>
			<div style={{position: 'absolute', top: 210, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 150, color: '#fff4d8', WebkitTextStroke: '5px #1b1208', paintOrder: 'stroke', transform: `scale(${pop(f, 6)})`}}>{year}</div>
			<Chip f={f} t={64} top={420} side="c" text="STILL HICCUPING" {...SEPIA} size={50} />
		</AbsoluteFill>
	);
};
const Doctor: React.FC<{f: number; dur: number}> = ({f}) => (
	<AbsoluteFill>
		<Chip f={f} t={4} top={260} side="l" text="THAT'S YOU" bg="#ffd34a" fg="#11142c" rot={-4} />
		<Chip f={f} t={24} top={380} side="r" text="A DOCTOR" bg="#d23b3b" rot={3} />
	</AbsoluteFill>
);
const Rate: React.FC<{f: number; dur: number}> = ({f}) => (
	<AbsoluteFill>
		{f < 66 ? <Chip f={f} t={30} top={100} side="c" text="20–40 PER MINUTE" bg="#ffd34a" fg="#11142c" rot={-2} /> : <Chip f={f} t={66} top={100} side="c" text="DAY & NIGHT" rot={2} />}
	</AbsoluteFill>
);

/* ------------------------------ native cards ------------------------------ */
const Rays: React.FC<{f: number; c1: string; c2: string; cy?: number}> = ({f, c1, c2, cy = 1000}) => (
	<svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
		<rect width={1080} height={1920} fill={c1} />
		{Array.from({length: 22}).map((_, i) => {
			const a0 = (i / 22) * Math.PI * 2 + f / 240;
			const a1 = ((i + 0.5) / 22) * Math.PI * 2 + f / 240;
			return <polygon key={i} points={`540,${cy} ${540 + Math.cos(a0) * 2400},${cy + Math.sin(a0) * 2400} ${540 + Math.cos(a1) * 2400},${cy + Math.sin(a1) * 2400}`} fill={c2} />;
		})}
	</svg>
);
const Big: React.FC<{k: number; c?: string; size?: number; children: React.ReactNode}> = ({k, c = '#fff', size = 100, children}) => (
	<div style={{fontFamily: FONT, fontWeight: 900, fontSize: size, color: c, textAlign: 'center', lineHeight: 1.08, transform: `scale(${k})`, opacity: Math.min(1, k * 1.5), WebkitTextStroke: '4px #11142c', paintOrder: 'stroke', textShadow: '0 8px 0 #11142c'}}>{children}</div>
);

/* s01 the hook: young Doctor ROO alone in a spotlight, hiccuping */
const HookV: React.FC<{f: number; dur: number}> = ({f}) => (
	<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 60%, #2a2f5a 0%, #0b0d1e 75%)'}}>
		<svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
			<defs>
				<linearGradient id="hookBeam" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#fff6d8" stopOpacity={0.05} />
					<stop offset="1" stopColor="#fff6d8" stopOpacity={0.3} />
				</linearGradient>
			</defs>
			<polygon points="470,0 610,0 860,1690 220,1690" fill="url(#hookBeam)" />
			<ellipse cx={540} cy={1690} rx={330} ry={60} fill="#fff6d8" opacity={0.22} />
			<ellipse cx={540} cy={1690} rx={190} ry={24} fill="#000" opacity={0.35} />
			<Actor who="hero" x={540} floor={1690} s={1.9} facing={1} faceTurn={0.05} look={[0, -0.1]} expr="worried" mouth="line" pose={gesture('touchFace', idle(f, 2), env(f, 20, 1e9, 12, 1), f)} {...YOUNG} uid="s-hook" />
		</svg>
	</AbsoluteFill>
);

/* s07b Osborne's own words, as a tall sepia note */
const QuoteV: React.FC<{f: number; dur: number}> = ({f}) => {
	const lines = ['"It scared me some,', "but it didn't", 'scare the hiccups', 'out of me."'];
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #7a6244 0%, #3a2a18 85%)', filter: 'sepia(0.5)'}}>
			<div style={{position: 'absolute', left: 90, top: 330, width: 900, height: 1180, background: '#efe4c8', border: '10px solid #8a6a44', transform: `rotate(-2deg) scale(${pop(f, 2)})`, boxShadow: '0 30px 60px rgba(0,0,0,0.5)'}}>
				<svg viewBox="-160 -170 320 340" width={300} height={320} style={{position: 'absolute', left: 300, top: 60, background: '#cbb48a'}}>
					<circle cy={-40} r={70} fill="#e8c8a0" stroke="#3a2a1a" strokeWidth={6} />
					<path d="M-62,-92 Q0,-132 62,-92 L72,-72 L-72,-72 Z" fill="#5a4a3a" />
					<path d="M-26,-22 q12,-6 26,-2 q14,-4 26,2 q-12,6 -26,3 q-14,3 -26,-3 z" fill="#9a8a7a" />
					<circle cx={-24} cy={-48} r={6} fill="#2a1a0e" />
					<circle cx={24} cy={-48} r={6} fill="#2a1a0e" />
					<path d="M-110,170 Q-110,50 0,40 Q110,50 110,170 Z" fill="#8a6a4a" />
				</svg>
				{lines.map((l, i) => (
					<div key={i} style={{position: 'absolute', left: 0, right: 0, top: 440 + i * 120, textAlign: 'center', fontFamily: HAND, fontWeight: 700, fontSize: 92, color: '#2a1a0e', opacity: interpolate(f, [8 + i * 10, 16 + i * 10], [0, 1], clamp)}}>
						{l}
					</div>
				))}
				<div style={{position: 'absolute', left: 0, right: 0, top: 960, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 46, color: '#5a3a1a'}}>— CHARLES OSBORNE</div>
			</div>
			{/* old film: flicker, a scratch, dust */}
			<AbsoluteFill style={{background: '#000', opacity: 0.05 + 0.06 * random('fl' + f)}} />
			<svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
				{random('scr' + Math.floor(f / 3)) > 0.4 ? <line x1={random('sx' + Math.floor(f / 3)) * 1080} y1={0} x2={random('sx' + Math.floor(f / 3)) * 1080 + 6} y2={1920} stroke="#fff6dc" strokeWidth={3} opacity={0.4} /> : null}
				{Array.from({length: 10}).map((_, i) => (
					<circle key={i} cx={random('dx' + i + f) * 1080} cy={random('dy' + i + f) * 1920} r={1.5 + random('dr' + i + f) * 3} fill={i % 2 ? '#1b1208' : '#fff6dc'} opacity={0.6} />
				))}
			</svg>
		</AbsoluteFill>
	);
};

/* s08 most hiccups stop in minutes — you're only 430 million behind */
const PanicV: React.FC<{f: number; dur: number}> = ({f, dur}) => {
	const t2 = Math.round(6 + 0.55 * (dur - 18));
	const big = Math.round(interpolate(f, [t2, t2 + 30], [0, 430_000_000], clamp));
	return (
		<AbsoluteFill>
			<Rays f={f} c1="#1a2150" c2="#222b62" cy={1500} />
			<AbsoluteFill style={{alignItems: 'center', paddingTop: 230, flexDirection: 'column', gap: 10}}>
				<Big k={pop(f, 4)} c="#9ff0b0" size={88}>
					MOST HICCUPS STOP
				</Big>
				<Big k={pop(f, 10)} c="#9ff0b0" size={88}>
					IN A FEW MINUTES
				</Big>
				<div style={{height: 70}} />
				{f >= t2 ? (
					<>
						<Big k={pop(f, t2)} size={76}>
							YOU'RE ONLY
						</Big>
						<Big k={pop(f, t2 + 2)} c="#ffd34a" size={136}>
							{big.toLocaleString('en-US')}
						</Big>
						<Big k={pop(f, t2 + 4)} size={76}>
							BEHIND
						</Big>
					</>
				) : null}
			</AbsoluteFill>
			<svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
				<ellipse cx={540} cy={1770} rx={230} ry={26} fill="#000" opacity={0.3} />
				<Actor who="hero" x={540} floor={1770} s={1.75} facing={1} faceTurn={0.1} look={[0, -0.2]} mouth={f >= t2 ? 'smile' : 'line'} pose={gesture('shrug', idle(f, 2), env(f, t2, 1e9, 10, 1), f)} {...YOUNG} uid="s-panic" />
			</svg>
		</AbsoluteFill>
	);
};

/* s09 the question: your weirdest cure? (young Doctor ROO at a table of 3D cures) */
const EndV: React.FC<{f: number; dur: number}> = ({f, dur}) => {
	const out = interpolate(f, [dur - 16, dur - 2], [0, 1], clamp);
	const FLR = 1720;
	const TS = 1.8; // table scale: its top sits at FLR - 200 * TS
	const top = FLR - 200 * TS;
	return (
		<AbsoluteFill>
			<Rays f={f} c1="#2f5a8a" c2="#3a6a9a" cy={1200} />
			<svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
				<rect x={0} y={FLR} width={1080} height={1920 - FLR} fill="#1d2f4a" />
				<ellipse cx={300} cy={FLR} rx={200} ry={24} fill="#000" opacity={0.3} />
				<Actor who="hero" x={300} floor={FLR} s={1.75} facing={1} faceTurn={0.3} look={[0.5, 0]} mouth="smile" pose={gesture('presentF', idle(f, 2), env(f, 8, 1e9, 10, 1), f)} {...YOUNG} uid="s-end" />
				<g transform={`translate(790,${FLR}) scale(${TS}) translate(0,-900)`}>
					<DinnerTable x={0} w={290} />
				</g>
			</svg>
			<Prop3D
				x={560}
				y={top - 300}
				w={500}
				h={320}
				make={() => {
					const scene = propScene();
					const p = makeJar('pickle');
					p.scale.setScalar(1.05);
					at(p, 660, top, 0);
					const b = makeJar('pb');
					b.scale.setScalar(0.95);
					at(b, 790, top, 0);
					const g = makeWaterGlass();
					g.scale.setScalar(0.95);
					at(g, 910, top, 0);
					const s = makeSpoon();
					s.scale.setScalar(1.6);
					at(s, 990, top - 10, 30);
					s.rotation.z = 1.3;
					for (const o of [p, b, g]) o.rotation.x = 0.2;
					scene.add(p, b, g, s);
					return {scene};
				}}
			/>
			<AbsoluteFill style={{alignItems: 'center', paddingTop: 220, flexDirection: 'column', gap: 6}}>
				<Big k={pop(f, 4)} size={96}>
					WHAT'S YOUR
				</Big>
				<Big k={pop(f, 8)} size={96}>
					WEIRDEST
				</Big>
				<Big k={pop(f, 12)} c="#ffd34a" size={110}>
					HICCUP CURE?
				</Big>
				<div style={{fontFamily: FONT, fontWeight: 800, fontSize: 52, color: '#11142c', background: '#ffd34a', borderRadius: 22, padding: '14px 34px', marginTop: 30, transform: `scale(${pop(f, 40)})`}}>TELL ME IN THE COMMENTS ↓</div>
				<div style={{fontFamily: FONT, fontWeight: 800, fontSize: 46, color: '#e8f1ff', marginTop: 26, textAlign: 'center', transform: `scale(${pop(f, 100)})`, WebkitTextStroke: '3px #11142c', paintOrder: 'stroke'}}>FULL STORY ON THE CHANNEL</div>
			</AbsoluteFill>
			<AbsoluteFill style={{background: '#000', opacity: out}} />
		</AbsoluteFill>
	);
};

const CARDS: Record<string, React.FC<{f: number; dur: number}>> = {hook: HookV, quote: QuoteV, panic: PanicV, end: EndV};
const OVERS: Record<string, React.FC<{f: number; dur: number}>> = {nebraska: Nebraska, nebraska2: Nebraska2, years: Years, doctor: Doctor, rate: Rate};

type RawSeg = Omit<Seg, 'C' | 'O'> & {card?: string; over?: string; hic?: boolean; sfx?: boolean};
export const SHORT: {mode: 'crop'; hook?: string[]; bed?: string} | {mode: 'recut'; segs: Seg[]; hook?: string[]; bed?: string} = {
	mode: 'recut',
	hook: ['HE HICCUPED', 'FOR 68 YEARS'],
	bed: 'sfx/short_bed.wav',
	segs: (SEGS as RawSeg[]).map(({card, over, hic, sfx, ...s}) => ({...s, C: card ? CARDS[card] : undefined, O: over ? OVERS[over] : undefined})),
};

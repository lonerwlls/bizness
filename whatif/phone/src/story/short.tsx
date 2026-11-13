import React from 'react';
import {AbsoluteFill, interpolate, spring} from 'remotion';
import {Stickman} from '../engine/Stickman';
import {idle, gesture} from '../kit/actions';
import {CAST} from './cast';

/* The vertical short (≤ 60 s) cut from the long: same voice clips (short-lines.json reuses
   long lines). Character footage = long shots cropped to 9:16; wide infographics are
   redrawn as native vertical cards so nothing is cut off. */
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
};

const FONT = "'Rubik', sans-serif";
const BG = 'radial-gradient(ellipse at 50% 35%, #2a2f6a 0%, #0b1030 80%)';
const pop = (f: number, t: number) => spring({frame: f - t, fps: 30, config: {damping: 12, stiffness: 150}});
const drift = (f: number, dur: number) => 1 + 0.06 * interpolate(f, [0, dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
const Big: React.FC<{k: number; c?: string; size?: number; children: React.ReactNode}> = ({k, c = '#fff', size = 110, children}) => (
	<div style={{fontFamily: FONT, fontWeight: 900, fontSize: size, color: c, textAlign: 'center', lineHeight: 1.05, transform: `scale(${k})`, opacity: Math.min(1, k * 1.5), WebkitTextStroke: '4px #11142c', textShadow: '0 8px 0 #11142c'}}>{children}</div>
);
const Wrap: React.FC<{f: number; dur: number; children: React.ReactNode}> = ({f, dur, children}) => (
	<AbsoluteFill style={{background: BG}}>
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 36, transform: `scale(${drift(f, dur)})`}}>{children}</AbsoluteFill>
	</AbsoluteFill>
);

/* s03 the guard says the line */
const GuardCard: React.FC<{f: number; dur: number}> = ({f, dur}) => (
	<AbsoluteFill style={{background: 'linear-gradient(#3a4380, #141c44)'}}>
		<svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{position: 'absolute', transform: `scale(${drift(f, dur)})`}}>
			<rect x={0} y={1300} width={1080} height={620} fill="#3a3f5a" />
			<Stickman id="g-v" x={600} y={1300} scale={3.4} facing={-1} pose={gesture('stop', idle(f, 5), 1, f)} {...CAST.guard} look={[-0.6, 0]} mouth="flat" faceTurn={0.4} />
		</svg>
		<div style={{position: 'absolute', top: 220, left: 60, right: 60, background: '#fbf8ef', borderRadius: 40, padding: '36px 40px', fontFamily: FONT, fontWeight: 900, fontSize: 76, color: '#13203a', textAlign: 'center', transform: `scale(${pop(f, 2)})`, boxShadow: '0 12px 0 #1b1e2a'}}>"Teachers use the back entrance, sir."</div>
	</AbsoluteFill>
);
/* s05 rule */
const RuleV: React.FC<{f: number; dur: number}> = ({f, dur}) => (
	<Wrap f={f} dur={dur}>
		<Big k={pop(f, 2)} c="#9fd8ff" size={80}>
			NOT YOUR BATTERY.
		</Big>
		<Big k={pop(f, 28)} c="#9fd8ff" size={80}>
			NOT YOUR EYES.
		</Big>
		<Big k={pop(f, 54)} c="#ffb547" size={96}>
			YOUR WHOLE BODY.
		</Big>
		<div style={{height: 40}} />
		<Big k={pop(f, 95)} size={120}>
			1 HOUR =
		</Big>
		<Big k={pop(f, 105)} c="#ff6a5a" size={120}>
			1 DAY OLDER
		</Big>
	</Wrap>
);
/* s06 the teen average */
const HoursV: React.FC<{f: number; dur: number}> = ({f, dur}) => {
	const k = interpolate(f, [40, 120], [0, 8.5], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const a = (k / 24) * Math.PI * 2;
	const R = 300;
	return (
		<Wrap f={f} dur={dur}>
			<Big k={pop(f, 2)} c="#9fd8ff" size={70}>
				A TEEN'S DAY
			</Big>
			<svg width={700} height={700} viewBox="-350 -350 700 700">
				<circle r={R} fill="#1d2552" stroke="#3a4680" strokeWidth={8} />
				<path d={`M0,0 L0,${-R} A${R},${R} 0 ${a > Math.PI ? 1 : 0} 1 ${Math.sin(a) * R},${-Math.cos(a) * R} Z`} fill="#e4473c" />
				<circle r={90} fill="#101634" />
			</svg>
			<Big k={pop(f, 30)} c="#ff6a5a" size={150}>
				{k.toFixed(1)} HOURS
			</Big>
			<Big k={pop(f, 60)} size={60}>
				OF SCREENS, EVERY DAY
			</Big>
			<div style={{fontFamily: FONT, fontSize: 30, color: '#aab3d6'}}>Common Sense Media, 2021</div>
		</Wrap>
	);
};
/* s07 nine years a year */
const YearsV: React.FC<{f: number; dur: number}> = ({f, dur}) => (
	<Wrap f={f} dur={dur}>
		<Big k={pop(f, 2)} size={90}>
			EVERY DAY
		</Big>
		<Big k={pop(f, 14)} c="#ff6a5a" size={150}>
			+8.5 DAYS
		</Big>
		<div style={{height: 60}} />
		<Big k={pop(f, 90)} size={90}>
			EVERY YEAR
		</Big>
		<Big k={pop(f, 100)} c="#ff6a5a" size={150}>
			+9 YEARS
		</Big>
	</Wrap>
);
/* s08 graduation and the senior discount */
const GradV: React.FC<{f: number; dur: number}> = ({f, dur}) => (
	<Wrap f={f} dur={dur}>
		<svg width={300} height={220} viewBox="-150 -110 300 220" style={{transform: `scale(${pop(f, 0)})`}}>
			<path d="M-140,-20 L0,-90 L140,-20 L0,50 Z" fill="#1b1a26" stroke="#ffd34a" strokeWidth={6} />
			<path d="M-80,10 L-80,70 Q0,110 80,70 L80,10" fill="#1b1a26" />
			<line x1={120} y1={-14} x2={130} y2={70} stroke="#ffd34a" strokeWidth={8} />
		</svg>
		<Big k={pop(f, 8)} c="#ffb547" size={110}>
			GRADUATE AT 36
		</Big>
		<div style={{height: 80}} />
		<Big k={pop(f, 85)} size={80}>
			AT 21:
		</Big>
		<Big k={pop(f, 92)} c="#9ff0b0" size={96}>
			SENIOR DISCOUNT
		</Big>
	</Wrap>
);
/* s10 thirteen years */
const LifeV: React.FC<{f: number; dur: number}> = ({f, dur}) => {
	const k = interpolate(f, [10, 90], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<Wrap f={f} dur={dur}>
			<Big k={pop(f, 2)} c="#9fd8ff" size={72}>
				AGE 10 → 80
			</Big>
			<div style={{display: 'grid', gridTemplateColumns: 'repeat(10, 64px)', gap: 10}}>
				{Array.from({length: 70}).map((_, i) => (
					<div key={i} style={{width: 64, height: 64, borderRadius: 10, background: i / 70 < k ? ((i * 7) % 37 < 7 ? '#e4473c' : '#3a5a8a') : '#1d2552'}} />
				))}
			</div>
			<Big k={pop(f, 90)} c="#ff6a5a" size={110}>
				≈ 13 YEARS
			</Big>
			<Big k={pop(f, 100)} size={70}>
				LOOKING DOWN
			</Big>
		</Wrap>
	);
};
/* s11 the question + where to see the full story */
const EndCard: React.FC<{f: number; dur: number}> = ({f, dur}) => {
	const out = interpolate(f, [dur - 16, dur - 2], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<Wrap f={f} dur={dur}>
			<Big k={pop(f, 4)} size={110}>
				WHAT DID YOUR
			</Big>
			<Big k={pop(f, 10)} c="#ffb547" size={120}>
				SCREEN TIME SAY?
			</Big>
			<div style={{fontFamily: FONT, fontWeight: 800, fontSize: 60, color: '#11142c', background: '#ffd34a', borderRadius: 24, padding: '14px 36px', transform: `scale(${pop(f, 40)})`}}>BE HONEST · COMMENTS</div>
			<div style={{fontFamily: FONT, fontWeight: 800, fontSize: 52, color: '#9fd8ff', marginTop: 60, textAlign: 'center', transform: `scale(${pop(f, 90)})`}}>FULL STORY ON THE CHANNEL</div>
			<AbsoluteFill style={{background: '#000', opacity: out}} />
		</Wrap>
	);
};

export const SHORT: {mode: 'crop'; hook?: string[]; bed?: string} | {mode: 'recut'; segs: Seg[]; hook?: string[]; bed?: string} = {
	mode: 'recut',
	hook: ['WHAT IF EVERY HOUR', 'ON YOUR PHONE', 'AGED YOU ONE DAY?'],
	bed: 'sfx/short_bed.wav',
	segs: [
		{line: 's01', ep: '008', off: 20, a: {cx: 820, cy: 400, z: 1.05}, b: {cx: 790, cy: 380, z: 1.12}},
		{line: 's02', ep: '001', a: {cx: 760, z: 1}, b: {cx: 900, z: 1.05}},
		{line: 's03', C: GuardCard},
		{line: 's04', ep: '003', a: {cx: 900, z: 1}, b: {cx: 980, z: 1.05}},
		{line: 's05', C: RuleV},
		{line: 's06', C: HoursV},
		{line: 's07', C: YearsV},
		{line: 's08', C: GradV},
		{line: 's09', ep: '062', a: {cx: 1000, z: 1}, b: {cx: 1000, z: 1.08}},
		{line: 's10', C: LifeV},
		{line: 's11', C: EndCard},
	],
};

import React from 'react';
import {AbsoluteFill, interpolate, spring} from 'remotion';
import {Stickman} from '../engine/Stickman';
import {gesture, idle} from '../kit/actions';
import {AgeBadge} from '../kit/ui';
import {CAST} from './cast';

/* The vertical short (≤ 60 s) cut from the long "every dollar = one minute":
   the same voice clips (short-lines.json reuses long lines); character footage = long shots
   cropped to 9:16, wide infographics redrawn as native vertical cards with the same hero. */
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
/* a vertical card with the hero standing at the bottom (his badge shows the minutes left) */
const Card: React.FC<{f: number; dur: number; expr?: 'normal' | 'wide' | 'worried' | 'sad'; mouth?: 'smile' | 'open' | 'frown' | 'line'; minutes?: number; children: React.ReactNode}> = ({f, dur, expr = 'normal', mouth = 'line', minutes, children}) => (
	<AbsoluteFill style={{background: BG}}>
		<svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
			<ellipse cx={540} cy={1880} rx={300} ry={30} fill="#000" opacity={0.3} />
			<Stickman id={'card-hero'} x={540} y={1880 - 157 * 2.1} scale={2.1} pose={gesture('shrug', idle(f, 2), expr === 'wide' ? 0.6 : 0, f)} {...CAST.hero} expr={expr} mouth={mouth} look={[0, -0.3]} faceTurn={0.1} />
			{minutes !== undefined ? <AgeBadge x={540} y={1880 - 157 * 2.1 - 164 * 2.1 - 150} value={minutes} s={1.2} label="MINUTES LEFT" c="#ffb547" /> : null}
		</svg>
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-start', paddingTop: 200, flexDirection: 'column', gap: 30, transform: `scale(${drift(f, dur)})`}}>{children}</AbsoluteFill>
	</AbsoluteFill>
);
const START = 27860412;

/* s05 the car */
const CarV: React.FC<{f: number; dur: number}> = ({f, dur}) => {
	const flip = interpolate(f, [100, 112], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<Card f={f} dur={dur} expr={flip > 0.5 ? 'wide' : 'normal'} mouth={flip > 0.5 ? 'open' : 'line'} minutes={START - 1576}>
			<Big k={pop(f, 2)} c="#9fd8ff" size={70}>
				AVERAGE NEW CAR
			</Big>
			<svg width={760} height={300} viewBox="-380 -200 760 300" style={{transform: `scale(${pop(f, 8)})`}}>
				<path d="M-330,0 L-330,-70 Q-318,-90 -280,-92 L-190,-98 L-120,-170 Q-104,-182 -76,-182 L80,-182 Q112,-182 134,-160 L200,-98 L300,-90 Q332,-84 334,-54 L334,0 Q326,24 298,24 L-306,24 Q-330,20 -330,0 Z" fill="#d23b3b" />
				<path d="M-168,-98 L-112,-162 Q-100,-170 -82,-170 L-14,-170 L-14,-98 Z M4,-170 L80,-170 Q104,-170 122,-154 L178,-98 L4,-98 Z" fill="#1d2a52" />
				<circle cx={-200} cy={20} r={46} fill="#0d0f1c" />
				<circle cx={200} cy={20} r={46} fill="#0d0f1c" />
			</svg>
			<Big k={pop(f, 20)} size={130} c={flip > 0.5 ? '#ff6a5a' : '#fff'}>
				{flip > 0.5 ? '33 DAYS' : '$48,000'}
			</Big>
			<div style={{fontFamily: FONT, fontSize: 30, color: '#aab3d6'}}>Kelley Blue Book, 2024</div>
		</Card>
	);
};
/* s06 the envelope */
const EnvelopeV: React.FC<{f: number; dur: number}> = ({f, dur}) => (
	<Card f={f} dur={dur} expr="wide" mouth="open" minutes={START - 1576}>
		<div style={{width: 820, height: 480, background: '#f2ecdc', borderRadius: 16, transform: `rotate(-4deg) scale(${pop(f, 0)})`, position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', fontFamily: FONT}}>
			<div style={{position: 'absolute', left: 40, top: 40, fontSize: 34, fontWeight: 700, color: '#5a6078'}}>ST. MERCY HOSPITAL</div>
			<div style={{position: 'absolute', left: 40, top: 100, fontSize: 56, fontWeight: 900, color: '#d23b3b'}}>PATIENT: MOM</div>
			<div style={{position: 'absolute', right: 40, top: 200, fontSize: 52, fontWeight: 900, color: '#d23b3b', border: '8px solid #d23b3b', borderRadius: 12, padding: '6px 20px', transform: 'rotate(-10deg)'}}>FINAL NOTICE</div>
		</div>
	</Card>
);
/* s07 the bill */
const BillV: React.FC<{f: number; dur: number}> = ({f, dur}) => (
	<Card f={f} dur={dur} expr="worried" mouth="frown" minutes={START - 1576}>
		<Big k={pop(f, 2)} c="#9fd8ff" size={72}>
			MOM'S SURGERY
		</Big>
		<Big k={pop(f, 12)} size={170}>
			$90,000
		</Big>
		<Big k={pop(f, 50)} c="#ff6a5a" size={64}>
			NOT COVERED
		</Big>
		<div style={{fontFamily: FONT, fontWeight: 900, fontSize: 56, color: '#fff', background: '#d23b3b', borderRadius: 16, padding: '10px 30px', transform: `rotate(4deg) scale(${pop(f, 95)})`}}>DUE FRIDAY</div>
	</Card>
);
/* s08 sixty-two days */
const DaysV: React.FC<{f: number; dur: number}> = ({f, dur}) => (
	<Card f={f} dur={dur} expr="wide" mouth="open" minutes={START - 1576}>
		<Big k={pop(f, 2)} c="#ffd34a" size={120}>
			90,000 MIN
		</Big>
		<Big k={pop(f, 50)} c="#ff6a5a" size={160}>
			= 62 DAYS
		</Big>
		<Big k={pop(f, 60)} size={60}>
			OF YOUR LIFE
		</Big>
	</Card>
);
/* s12 minimum wage */
const WageV: React.FC<{f: number; dur: number}> = ({f, dur}) => (
	<Card f={f} dur={dur} mouth="open" minutes={START - 91576}>
		<Big k={pop(f, 2)} c="#9fd8ff" size={64}>
			FEDERAL MINIMUM WAGE
		</Big>
		<Big k={pop(f, 10)} size={150}>
			$7.25/h
		</Big>
		<Big k={pop(f, 60)} c="#ff6a5a" size={100}>
			$1 ≈ 8 MIN
		</Big>
		<Big k={pop(f, 70)} size={60}>
			OF WORK
		</Big>
	</Card>
);
/* s13 the curse was a discount */
const DiscountV: React.FC<{f: number; dur: number}> = ({f, dur}) => {
	const strike = interpolate(f, [20, 30], [0, 100], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<Card f={f} dur={dur} expr="wide" mouth="smile" minutes={START - 91576}>
			<div style={{position: 'relative', transform: `scale(${pop(f, 0)})`}}>
				<Big k={1} c="#8a90a6" size={130}>
					CURSE
				</Big>
				<div style={{position: 'absolute', left: -10, top: '50%', width: `${strike}%`, height: 16, background: '#d23b3b', borderRadius: 8}} />
			</div>
			<div style={{fontFamily: FONT, fontWeight: 900, fontSize: 120, color: '#0e3a22', background: '#3fcf7a', borderRadius: 24, padding: '10px 40px', transform: `rotate(-4deg) scale(${pop(f, 40)})`}}>DISCOUNT</div>
			<Big k={pop(f, 50)} size={64}>
				≈ 87% OFF
			</Big>
		</Card>
	);
};
/* s14 the question */
const EndCard: React.FC<{f: number; dur: number}> = ({f, dur}) => {
	const out = interpolate(f, [dur - 16, dur - 2], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<Card f={f} dur={dur} mouth="smile" minutes={START - 91581}>
			<Big k={pop(f, 4)} size={100}>
				WHAT WOULD YOU
			</Big>
			<Big k={pop(f, 10)} c="#ffb547" size={110}>
				STOP BUYING FIRST?
			</Big>
			<div style={{fontFamily: FONT, fontWeight: 800, fontSize: 56, color: '#11142c', background: '#ffd34a', borderRadius: 24, padding: '14px 36px', transform: `scale(${pop(f, 40)})`}}>TELL ME IN THE COMMENTS</div>
			<div style={{fontFamily: FONT, fontWeight: 800, fontSize: 50, color: '#9fd8ff', marginTop: 30, textAlign: 'center', transform: `scale(${pop(f, 90)})`}}>FULL STORY ON THE CHANNEL</div>
			<AbsoluteFill style={{background: '#000', opacity: out}} />
		</Card>
	);
};

export const SHORT: {mode: 'crop'; hook?: string[]; bed?: string} | {mode: 'recut'; segs: Seg[]; hook?: string[]; bed?: string} = {
	mode: 'recut',
	hook: ['WHAT IF EVERY $1', 'COST YOU 1 MINUTE', 'OF YOUR LIFE?'],
	bed: 'sfx/short_bed.wav',
	segs: [
		{line: 's01', ep: '005', a: {cx: 760, cy: 420, z: 1.05}, b: {cx: 860, cy: 400, z: 1.12}},
		{line: 's02', ep: '001', a: {cx: 780, z: 1}, b: {cx: 860, z: 1.05}},
		{line: 's03', ep: '002', a: {cx: 900, z: 1}, b: {cx: 900, z: 1.05}},
		{line: 's04', ep: '003', a: {cx: 960, z: 1}, b: {cx: 980, z: 1.05}},
		{line: 's05', C: CarV},
		{line: 's06', C: EnvelopeV},
		{line: 's07', C: BillV},
		{line: 's08', C: DaysV},
		{line: 's09', ep: '067', a: {cx: 860, z: 1}, b: {cx: 900, z: 1.05}},
		{line: 's10', ep: '068', a: {cx: 1020, z: 1}, b: {cx: 1020, z: 1.03}},
		{line: 's11', ep: '069', a: {cx: 820, z: 1}, b: {cx: 800, z: 1.05}},
		{line: 's12', C: WageV},
		{line: 's13', C: DiscountV},
		{line: 's14', C: EndCard},
	],
};

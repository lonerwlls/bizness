import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {env, gesture, idle} from '../kit/actions';
import {Actor} from '../kit/core';
import {clamp} from '../kit/kit';
import {FONT} from '../kit/ui';
import {pop} from './lib';
import {BigHand} from './placesR';
import SEGS from './short-segs.json';

/* The vertical short (≤ 60 s) cut from the long "What if you could regrow any body part?":
   the long's own voice clips (short-lines.json reuses them), its shots cropped to 9:16
   (short-segs.json), and the wide cards redrawn natively for 9:16. */
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

const Chip: React.FC<{f: number; t: number; top: number; text: string; bg?: string; fg?: string; size?: number; rot?: number}> = ({f, t, top, text, bg = '#11142c', fg = '#fff', size = 56, rot = -2}) =>
	f < t ? null : (
		<div style={{position: 'absolute', top, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
			<div style={{padding: '12px 30px', background: bg, color: fg, fontFamily: FONT, fontWeight: 900, fontSize: size, borderRadius: 16, transform: `rotate(${rot}deg) scale(${pop(f, t)})`, boxShadow: '0 8px 0 rgba(0,0,0,0.35)', whiteSpace: 'nowrap'}}>{text}</div>
		</div>
	);
const Big: React.FC<{k: number; c?: string; size?: number; children: React.ReactNode}> = ({k, c = '#fff', size = 100, children}) => (
	<div style={{fontFamily: FONT, fontWeight: 900, fontSize: size, color: c, textAlign: 'center', lineHeight: 1.08, transform: `scale(${k})`, opacity: Math.min(1, k * 1.5), WebkitTextStroke: '4px #11142c', paintOrder: 'stroke', textShadow: '0 8px 0 #11142c'}}>{children}</div>
);
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
const kk = (x: number, a: number, b: number) => Math.max(0, Math.min(1, (x - a) / (b - a)));

/* s02 "Half an inch of your finger is just… gone." */
const GoneV: React.FC<{f: number; dur: number}> = ({f}) => (
	<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #1f4560 0%, #0b1a2a 80%)'}}>
		<svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
			<g transform={`translate(540,1130) scale(${2.1 * (0.9 + 0.1 * pop(f, 0))})`}>
				<BigHand tip={0} />
			</g>
		</svg>
		<Chip f={f} t={20} top={330} text="GONE" bg="#3a1d2a" fg="#ff9a8a" size={96} rot={-4} />
	</AbsoluteFill>
);
/* s03 the fingertip grows back: bone, skin, nail — 40 s, no scar */
const GrowV: React.FC<{f: number; dur: number}> = ({f, dur}) => {
	const W = (k: number) => 6 + k * (dur - 16);
	const bone = interpolate(f, [W(0.08), W(0.3)], [0, 1], clamp);
	const skin = interpolate(f, [W(0.3), W(0.5)], [0, 0.85], clamp);
	const nail = interpolate(f, [W(0.5), W(0.6)], [0, 0.15], clamp);
	const tip = skin + nail;
	const secs = Math.round(interpolate(f, [W(0.08), W(0.6)], [0, 40], clamp));
	const glow = env(f, W(0.6), W(0.9), 4, 14);
	const lost = 70;
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #1f4560 0%, #0b1a2a 80%)'}}>
			<svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
				<g transform="translate(540,1180) scale(2.1)">
					{bone > 0 && tip < 0.84 ? <rect x={-26 - 13} y={-(196 - lost) - lost * bone} width={26} height={lost * bone + 8} rx={13} fill="#fbf6ea" stroke="#2a1a14" strokeWidth={6} /> : null}
					<BigHand tip={tip} glow={glow} />
				</g>
			</svg>
			<div style={{position: 'absolute', top: 230, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
				<div style={{padding: '10px 50px', background: '#0b0d14', border: '8px solid #7af0a8', borderRadius: 36, fontFamily: FONT, fontWeight: 900, fontSize: 150, color: '#7af0a8'}}>0:{String(secs).padStart(2, '0')}</div>
			</div>
			<Chip f={f} t={W(0.12)} top={500} text="BONE" fg="#fbf6ea" size={50} rot={-3} />
			<Chip f={f} t={W(0.34)} top={590} text="SKIN" fg="#f2c9a5" size={50} rot={2} />
			<Chip f={f} t={W(0.52)} top={680} text="NAIL" fg="#ffd0dc" size={50} rot={-2} />
			<Chip f={f} t={W(0.82)} top={1620} text="NO SCAR" bg="#0e3a22" fg="#7af0a8" size={80} rot={-4} />
		</AbsoluteFill>
	);
};
/* s04 the question, Doctor ROO in a spotlight */
const QuestionV: React.FC<{f: number; dur: number}> = ({f}) => {
	const words = ['WHAT IF', 'YOU COULD', 'REGROW', 'ANY BODY PART?'];
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 60%, #2a2f5a 0%, #0b0d1e 75%)'}}>
			<svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
				<polygon points="470,0 610,0 860,1690 220,1690" fill="#fff6d8" opacity={0.12} />
				<ellipse cx={540} cy={1690} rx={300} ry={50} fill="#fff6d8" opacity={0.18} />
				<Actor who="hero" x={540} floor={1690} s={1.8} facing={1} faceTurn={0.15} look={[0.4, -0.5]} expr="wide" mouth="smile" pose={gesture('presentF', idle(f, 2), env(f, 6, 1e9, 10, 1), f)} uid="s-q" />
			</svg>
			<AbsoluteFill style={{alignItems: 'center', paddingTop: 210, flexDirection: 'column', gap: 4}}>
				{words.map((t, i) => (
					<Big key={t} k={pop(f, 2 + i * 10)} c={t === 'REGROW' ? '#7af0a8' : '#fff'} size={t === 'REGROW' ? 130 : 96}>
						{t}
					</Big>
				))}
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
/* s10 which one would you pick? */
const EndV: React.FC<{f: number; dur: number}> = ({f, dur}) => {
	const out = interpolate(f, [dur - 16, dur - 2], [0, 1], clamp);
	return (
		<AbsoluteFill>
			<Rays f={f} c1="#2f5a8a" c2="#3a6a9a" cy={1250} />
			<svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
				<ellipse cx={540} cy={1720} rx={220} ry={26} fill="#000" opacity={0.3} />
				<Actor who="hero" x={540} floor={1720} s={1.8} facing={1} faceTurn={0.2} look={[0.2, -0.4]} mouth="smile" pose={gesture('presentF', idle(f, 2), env(f, 8, 1e9, 10, 1), f)} uid="s-end" />
			</svg>
			<AbsoluteFill style={{alignItems: 'center', paddingTop: 200, flexDirection: 'column', gap: 6}}>
				<Big k={pop(f, 4)} size={92}>
					WHICH BODY PART
				</Big>
				<Big k={pop(f, 10)} size={92}>
					WOULD YOU
				</Big>
				<Big k={pop(f, 16)} c="#7af0a8" size={120}>
					REGROW?
				</Big>
				<div style={{fontFamily: FONT, fontWeight: 800, fontSize: 50, color: '#11142c', background: '#ffd34a', borderRadius: 22, padding: '14px 34px', marginTop: 30, transform: `scale(${pop(f, 50)})`}}>TELL ME IN THE COMMENTS ↓</div>
				<div style={{fontFamily: FONT, fontWeight: 800, fontSize: 46, color: '#e8f1ff', marginTop: 26, textAlign: 'center', transform: `scale(${pop(f, 90)})`, WebkitTextStroke: '3px #11142c', paintOrder: 'stroke'}}>FULL STORY ON THE CHANNEL</div>
			</AbsoluteFill>
			<AbsoluteFill style={{background: '#000', opacity: out}} />
		</AbsoluteFill>
	);
};
/* s07 the waiting list gets shorter (vertical) */
const NAMES = ['M. Alvarez', 'J. Okafor', 'S. Kim', 'D. Novak', 'A. Rossi', 'P. Singh', 'L. Brown', 'T. Haddad'];
const ListV: React.FC<{f: number; dur: number}> = ({f}) => {
	const struck = interpolate(f, [6, 70], [0, 6], clamp);
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #f4ece0 0%, #d8c8b0 90%)'}}>
			<div style={{position: 'absolute', left: 90, right: 90, top: 300, bottom: 360, background: '#fbfaf4', borderRadius: 20, border: '14px solid #2a3a4a', overflow: 'hidden'}}>
				<div style={{background: '#3d6fd6', color: '#fff', fontFamily: FONT, fontWeight: 900, fontSize: 64, textAlign: 'center', padding: '24px 0'}}>WAITING LIST</div>
				{NAMES.map((n, i) => {
					const k = Math.max(0, Math.min(1, struck - i));
					return (
						<div key={n} style={{position: 'relative', display: 'flex', justifyContent: 'space-between', padding: '22px 40px', fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: 58, color: '#2a2f4a', opacity: 1 - 0.5 * k}}>
							<span>{i + 1}. {n}</span>
							<span style={{fontFamily: FONT, fontWeight: 900, fontSize: 34, color: k > 0.5 ? '#2a9a5a' : '#8a90a0', alignSelf: 'center'}}>{k > 0.5 ? 'MATCHED' : 'WAITING'}</span>
							<div style={{position: 'absolute', left: 36, top: '52%', height: 6, width: `${520 * k}px`, background: '#2a9a5a', borderRadius: 3}} />
						</div>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};
/* s06 the kidney: a normal one can't regrow, yours is back in four days */
const KIDNEY = 'M0,-150 C90,-160 150,-80 140,10 C130,100 60,160 -10,150 C-80,140 -110,80 -60,40 C-20,10 -30,-30 -70,-60 C-110,-100 -70,-150 0,-150 Z';
const KidneyV: React.FC<{f: number; dur: number}> = ({f, dur}) => {
	const grow = interpolate(f, [0.45 * dur, 0.8 * dur], [0, 1], clamp);
	const day = Math.min(4, 1 + Math.floor(grow * 3.99));
	const g = 0.15 + 0.85 * grow;
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #3a2a5a 0%, #140a24 85%)'}}>
			<svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
				<g transform={`translate(540,560) scale(${pop(f, 2)})`}>
					<rect x={-420} y={-300} width={840} height={600} rx={44} fill="#11142c" stroke="#8a90a0" strokeWidth={8} />
					<text y={-220} textAnchor="middle" fontSize={56} fontFamily={FONT} fontWeight={900} fill="#c8ccd8">NORMAL KIDNEY</text>
					<g transform="translate(0,20) scale(0.9)"><path d={KIDNEY} fill="#8a6a6a" stroke="#2a1a14" strokeWidth={10} /></g>
					<text y={250} textAnchor="middle" fontSize={54} fontFamily={FONT} fontWeight={900} fill="#ff9a8a">CAN'T REGROW</text>
				</g>
				<g transform={`translate(540,1300) scale(${pop(f, 0.35 * dur)})`}>
					<rect x={-420} y={-300} width={840} height={600} rx={44} fill="#11142c" stroke="#7af0a8" strokeWidth={8} />
					<text y={-220} textAnchor="middle" fontSize={56} fontFamily={FONT} fontWeight={900} fill="#7af0a8">YOURS</text>
					<g transform={`translate(0,20) scale(${0.9 * g})`}><path d={KIDNEY} fill="#c06a6a" stroke="#2a1a14" strokeWidth={10 / g} /></g>
					<text y={250} textAnchor="middle" fontSize={64} fontFamily={FONT} fontWeight={900} fill="#ffd34a">DAY {day}</text>
				</g>
			</svg>
		</AbsoluteFill>
	);
};
/* overlays over cropped shots (labels the crop cuts off) */
const Spare: React.FC<{f: number; dur: number}> = ({f}) => <Chip f={f} t={20} top={260} text={'"THE SPARE PARTS DOCTOR"'} fg="#ffd34a" size={48} rot={-3} />;
const Dice: React.FC<{f: number; dur: number}> = ({f}) => <Chip f={f} t={kk(f, 0, 1) >= 0 ? 10 : 10} top={260} text="YOU ROLL THE DICE" bg="#fbfaf4" fg="#13203a" size={58} rot={-2} />;

const CARDS: Record<string, React.FC<{f: number; dur: number}>> = {gone: GoneV, grow: GrowV, question: QuestionV, end: EndV, list: ListV, kidney: KidneyV};
const Antler: React.FC<{f: number; dur: number}> = ({f}) => <Chip f={f} t={30} top={240} text="FASTER THAN A DEER ANTLER" fg="#ffd34a" size={46} rot={-2} />;
const OVERS: Record<string, React.FC<{f: number; dur: number}>> = {spare: Spare, dice: Dice, antler: Antler};
type RawSeg = Omit<Seg, 'C' | 'O'> & {card?: string; over?: string; hic?: boolean; sfx?: boolean};
export const SHORT: {mode: 'crop'; hook?: string[]; bed?: string; hookTop?: number} | {mode: 'recut'; segs: Seg[]; hook?: string[]; bed?: string; hookTop?: number} = {
	mode: 'recut',
	hook: ['HIS FINGER', 'GREW BACK'],
	hookTop: 1380,
	bed: 'sfx/short_bed.wav',
	segs: (SEGS as RawSeg[]).map(({card, over, hic, sfx, ...s}) => ({...s, C: card ? CARDS[card] : undefined, O: over ? OVERS[over] : undefined})),
};

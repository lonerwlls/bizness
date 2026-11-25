import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile} from 'remotion';
import {clamp} from '../kit/kit';
import {FONT, HAND} from '../kit/ui';

/* The cartoon-story kit: picture backgrounds, light (darken + lit spots + glow), snap poses,
   handwritten tags on dark plates, a location stamp, big numbers, check tags, icons over heads,
   a cork board with polaroids, black cards. */

export const YEL = '#f2c94c';

/* "snap" (щелчок): a pose change in 4 frames that overshoots ~12 % and settles in 3 more */
export const snap = (f: number, t0: number, over = 0.12) => {
	const d = f - t0;
	if (d <= 0) return 0;
	if (d < 4) return (d / 4) * (1 + over);
	if (d < 7) return 1 + over * (1 - (d - 4) / 3);
	return 1;
};
export const mixP = (a: [number, number], b: [number, number], k: number): [number, number] => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];

/* the background picture, stretched to cover the world (1920×1080) */
export const Bg: React.FC<{src: string; dim?: number}> = ({src, dim = 0}) => (
	<>
		<Img src={staticFile(src)} style={{position: 'absolute', left: -120, top: -68, width: 2160, height: 1216, objectFit: 'cover'}} />
		{dim > 0 ? <div style={{position: 'absolute', left: -200, top: -200, width: 2320, height: 1480, background: '#000', opacity: dim}} /> : null}
	</>
);

/* light: the whole scene darkens, lit spots are cut out around the lamps/windows, then a glow */
export const Light: React.FC<{spots: [number, number, number][]; dark?: number; glow?: string; id: string}> = ({spots, dark = 0.38, glow = '#ffd88a', id}) => (
	<svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none'}}>
		<defs>
			<filter id={`${id}-b`} x="-50%" y="-50%" width="200%" height="200%">
				<feGaussianBlur stdDeviation="60" />
			</filter>
			<mask id={`${id}-m`}>
				<rect x={-400} y={-300} width={2800} height={1700} fill="#fff" />
				<g filter={`url(#${id}-b)`}>
					{spots.map(([x, y, r], i) => (
						<circle key={i} cx={x} cy={y} r={r} fill="#000" />
					))}
				</g>
			</mask>
		</defs>
		<rect x={-400} y={-300} width={2800} height={1700} fill="#0b0a18" opacity={dark} mask={`url(#${id}-m)`} />
		<g filter={`url(#${id}-b)`} style={{mixBlendMode: 'screen'}}>
			{spots.map(([x, y, r], i) => (
				<circle key={i} cx={x} cy={y} r={r * 0.55} fill={glow} opacity={0.35} />
			))}
		</g>
	</svg>
);

/* paper grain + a soft vignette over the whole frame */
export const Paper: React.FC = () => (
	<AbsoluteFill style={{pointerEvents: 'none'}}>
		<svg width={1920} height={1080} style={{position: 'absolute', inset: 0, mixBlendMode: 'multiply', opacity: 0.35}}>
			<filter id="paper-n">
				<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={4} />
				<feColorMatrix values="0 0 0 0 0.85  0 0 0 0 0.8  0 0 0 0 0.72  0 0 0 0.55 0" />
			</filter>
			<rect width={1920} height={1080} filter="url(#paper-n)" />
		</svg>
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(5,4,12,0.55) 100%)'}} />
	</AbsoluteFill>
);

/* handwritten tag on a dark plate with a yellow bar: "| FRED DEMARA" (screen space) */
export const Tag: React.FC<{f: number; t: number; x: number; y: number; text: string; size?: number; c?: string; bar?: string; box?: 'check' | 'cross'; until?: number; sub?: string}> = ({f, t, x, y, text, size = 52, c = YEL, bar = YEL, box, until, sub}) => {
	if (f < t) return null;
	if (until !== undefined && f > until) return null;
	const n = Math.min(text.length, Math.floor((f - t) * 1.8));
	const k = interpolate(f, [t, t + 5], [0.85, 1], clamp);
	const w = text.length * size * 0.5 + 70 + (box ? size : 0);
	return (
		<div style={{position: 'absolute', left: x, top: y, transform: `scale(${k})`, transformOrigin: 'left center', opacity: interpolate(f, [t, t + 3], [0, 1], clamp)}}>
			{sub ? <div style={{fontFamily: HAND, fontWeight: 700, fontSize: size * 0.6, color: YEL, marginLeft: 22, marginBottom: 2}}>{sub}</div> : null}
			<div style={{display: 'flex', alignItems: 'center', gap: 14, height: size * 1.35, padding: '0 22px 0 14px', minWidth: w, background: 'rgba(18,16,22,0.82)', borderRadius: 10, boxShadow: '0 6px 0 rgba(0,0,0,0.3)'}}>
				<div style={{width: 6, height: size * 0.95, background: bar, borderRadius: 3}} />
				{box ? (
					<svg width={size * 0.8} height={size * 0.8} viewBox="0 0 40 40">
						<rect x={3} y={3} width={34} height={34} rx={5} fill="none" stroke={box === 'check' ? '#7ad07a' : '#e8505a'} strokeWidth={4} />
						{box === 'check' ? <path d="M9,21 L17,29 L32,11" stroke="#7ad07a" strokeWidth={5} fill="none" strokeLinecap="round" /> : <path d="M11,11 L29,29 M29,11 L11,29" stroke="#e8505a" strokeWidth={5} strokeLinecap="round" />}
					</svg>
				) : null}
				<div style={{fontFamily: HAND, fontWeight: 700, fontSize: size, color: c, letterSpacing: 1, whiteSpace: 'pre', textTransform: 'uppercase'}}>{text.slice(0, n)}</div>
			</div>
		</div>
	);
};

/* big number (yellow, handwritten) with a small tag under it, over a dimmed shot */
export const BigNumber: React.FC<{f: number; t: number; text: string; sub?: string; y?: number; c?: string}> = ({f, t, text, sub, y = 420, c = YEL}) => {
	if (f < t) return null;
	const k = snap(f, t, 0.18);
	return (
		<div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center'}}>
			<div style={{display: 'inline-block', transform: `scale(${0.4 + 0.6 * k})`, fontFamily: HAND, fontWeight: 700, fontSize: 300, color: c, textShadow: '0 8px 0 rgba(0,0,0,0.45)', lineHeight: 1}}>{text}</div>
			{sub ? <div style={{fontFamily: HAND, fontWeight: 700, fontSize: 50, color: '#f4efe2', marginTop: 10, textTransform: 'uppercase', opacity: interpolate(f, [t + 6, t + 10], [0, 1], clamp)}}>| {sub}</div> : null}
		</div>
	);
};

/* icons that pop over a head (world coordinates) */
export const Icon: React.FC<{kind: 'halo' | 'crown' | 'question' | 'bulb' | 'sweat' | 'dollar'; x: number; y: number; f: number; t: number; s?: number; out?: number}> = ({kind, x, y, f, t, s = 1, out}) => {
	if (f < t) return null;
	const k = snap(f, t, 0.2);
	const drop = out !== undefined && f > out ? Math.min(1, (f - out) / 8) : 0;
	return (
		<g transform={`translate(${x},${y + drop * 120}) scale(${s * k}) rotate(${drop * 40})`} opacity={1 - drop} strokeLinejoin="round">
			{kind === 'halo' ? <ellipse rx={58} ry={14} fill="none" stroke="#f6d860" strokeWidth={12} /> : null}
			{kind === 'halo' ? <ellipse rx={58} ry={14} fill="none" stroke="#fff6c0" strokeWidth={4} /> : null}
			{kind === 'crown' ? <path d="M-50,20 L-50,-20 L-25,4 L0,-30 L25,4 L50,-20 L50,20 Z" fill="#f2c94c" stroke="#1d1a1f" strokeWidth={5} /> : null}
			{kind === 'question' ? (
				<text textAnchor="middle" y={20} fontFamily={FONT} fontWeight={900} fontSize={80} fill="#f2c94c" stroke="#1d1a1f" strokeWidth={4} style={{paintOrder: 'stroke'}}>
					?
				</text>
			) : null}
			{kind === 'bulb' ? (
				<g>
					<circle r={40} fill="#ffe58a" opacity={0.35} />
					<circle cy={-6} r={24} fill="#ffe58a" stroke="#1d1a1f" strokeWidth={5} />
					<rect x={-12} y={14} width={24} height={16} rx={3} fill="#a8a8b0" stroke="#1d1a1f" strokeWidth={4} />
				</g>
			) : null}
		</g>
	);
};

/* cork board with a polaroid; `label` written under it */
export const Cork: React.FC<{children?: React.ReactNode}> = ({children}) => (
	<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #b08a5a 0%, #8a6a42 70%, #5a4228 100%)'}}>
		<svg width={1920} height={1080} style={{position: 'absolute', inset: 0, mixBlendMode: 'multiply', opacity: 0.45}}>
			<filter id="cork-n">
				<feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves={3} seed={9} />
				<feColorMatrix values="0 0 0 0 0.55  0 0 0 0 0.4  0 0 0 0 0.25  0 0 0 0.9 0" />
			</filter>
			<rect width={1920} height={1080} filter="url(#cork-n)" />
		</svg>
		{children}
	</AbsoluteFill>
);

export const BlackCard: React.FC<{f: number; text: string}> = ({f, text}) => (
	<AbsoluteFill style={{background: '#000', alignItems: 'center', justifyContent: 'center'}}>
		<div style={{fontFamily: HAND, fontWeight: 700, fontSize: 96, color: '#f4efe2', textTransform: 'uppercase', letterSpacing: 3}}>{text.slice(0, Math.floor(f * 1.5))}</div>
	</AbsoluteFill>
);

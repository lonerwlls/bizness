import React from 'react';
import {random} from 'remotion';

/* Characters of the "cartoon story" format, drawn by code from a recipe — never by a picture
   generator — so a hero looks exactly the same in every shot.
   Look: a big round head with a hard shadow on one side and a small gloss, black oval eyes with
   a glint, simple brows, a mouth that opens by voice loudness; a capsule body in clothes; thin
   stick arms with small round hands; short stick legs with dark shoes; thick dark outline.
   Origin = between the feet on the floor, y down; facing 1 = looking to the right. */

export const INK = '#1d1a1f';
export type Recipe = {
	skin: string;
	hair: 'slick' | 'crew' | 'side' | 'bald' | 'tonsure' | 'curly' | 'none';
	hairColor: string;
	body: string; // jacket / uniform / robe colour
	shirt?: string;
	tie?: string;
	hat?: 'fedora' | 'navycap' | 'sailor' | 'none';
	hatColor?: string;
	outfit?: 'suit' | 'uniform' | 'robe' | 'coat' | 'shirt' | 'scrubs' | 'prison' | 'gown';
	stripes?: number; // gold rings on the sleeves (navy officer)
	glasses?: boolean;
	mustache?: string;
	beard?: string;
	girth?: number; // 1 = normal, 1.25 = big
	height?: number;
	seed: number;
};

export type Mouth = 'closed' | 'smile' | 'smirk' | 'frown' | 'open' | 'wide' | 'o';
export type Face = {look?: [number, number]; brows?: 'flat' | 'up' | 'down' | 'worried' | 'sly'; mouth?: Mouth; blink?: boolean; sweat?: boolean};
export type Pose = {
	hand?: [number, number]; // front hand (local, before facing); undefined = hanging
	handB?: [number, number];
	head?: number; // tilt degrees
	lean?: number;
	sit?: number; // 0 standing, 1 sitting (legs forward)
	step?: number;
};

const darker = (c: string, k = 0.18) => {
	const n = parseInt(c.slice(1), 16);
	const r = Math.round(((n >> 16) & 255) * (1 - k));
	const g = Math.round(((n >> 8) & 255) * (1 - k));
	const b = Math.round((n & 255) * (1 - k));
	return `rgb(${r},${g},${b})`;
};

const HEAD_R = 74;

export const Toon: React.FC<{r: Recipe; x: number; y: number; s?: number; facing?: 1 | -1; t: number; pose?: Pose; face?: Face; id: string}> = ({r, x, y, s = 1, facing = 1, t, pose = {}, face = {}, id}) => {
	const g = r.girth ?? 1;
	const H = r.height ?? 1;
	const lean = pose.lean ?? 0;
	const sit = pose.sit ?? 0;
	const breathe = Math.sin(t / 26 + r.seed) * 1.6;
	const bw = 54 * g; // half width of the body capsule
	const legH = 62 * H * (1 - 0.55 * sit);
	const bodyH = 118 * H;
	const hip = -legH; // body bottom
	const shoulderY = hip - bodyH + 26 + breathe;
	const HC: [number, number] = [4, hip - bodyH - HEAD_R + 24 + breathe];
	const look = face.look ?? [0.35, 0];
	const blink = face.blink ?? (t + Math.floor(random('b' + r.seed) * 80)) % 110 < 4;
	const mouth = face.mouth ?? 'closed';
	const brows = face.brows ?? 'flat';
	const shF: [number, number] = [bw * 0.62, shoulderY + 6];
	const shB: [number, number] = [-bw * 0.62, shoulderY + 6];
	const handF = pose.hand ?? [bw + 10, hip - 10];
	const handB = pose.handB ?? [-bw - 10, hip - 10];
	const arm = (sh: [number, number], h: [number, number], side: number) => {
		const mx = (sh[0] + h[0]) / 2;
		const my = (sh[1] + h[1]) / 2;
		const dx = h[0] - sh[0];
		const dy = h[1] - sh[1];
		const len = Math.hypot(dx, dy) || 1;
		const k = Math.max(0, 110 - len) * 0.5 + 6;
		return `M${sh[0]},${sh[1]} Q${mx + (-dy / len) * k * side},${my + (dx / len) * k * side} ${h[0]},${h[1]}`;
	};
	const ex = look[0] * 9;
	const ey = look[1] * 7;
	const bt = {flat: [0, 0], up: [-8, 0], down: [3, 10], worried: [-4, -10], sly: [0, 8]}[brows];
	const clip = `${id}-head`;
	const step = pose.step ?? 0;
	const legs =
		sit > 0.5 ? (
			<g stroke={INK} strokeWidth={6} fill="none">
				<path d={`M-16,${hip} L30,${hip + 4} L30,${hip + 60}`} />
				<path d={`M16,${hip} L56,${hip + 4} L56,${hip + 60}`} />
				<ellipse cx={42} cy={hip + 62} rx={18} ry={8} fill={INK} />
				<ellipse cx={68} cy={hip + 62} rx={18} ry={8} fill={INK} />
			</g>
		) : (
			<g stroke={INK} strokeWidth={6} fill="none">
				<path d={`M-16,${hip} L${-18 - step * 14},-6`} />
				<path d={`M16,${hip} L${18 + step * 14},-6`} />
				<ellipse cx={-14 - step * 14} cy={-5} rx={17} ry={8} fill={INK} />
				<ellipse cx={24 + step * 14} cy={-5} rx={17} ry={8} fill={INK} />
			</g>
		);
	const outfit = r.outfit ?? 'suit';
	return (
		<g transform={`translate(${x},${y}) scale(${s * facing},${s})`} strokeLinejoin="round" strokeLinecap="round">
			<ellipse cx={0} cy={2} rx={70 * g} ry={11} fill="#000" opacity={0.25} />
			{legs}
			<g transform={`rotate(${lean},0,${hip})`}>
				{/* back arm behind the body */}
				<path d={arm(shB, handB, -1)} stroke={INK} strokeWidth={6} fill="none" />
				<circle cx={handB[0]} cy={handB[1]} r={9} fill={r.skin} stroke={INK} strokeWidth={3.5} />
				{/* body capsule */}
				<rect x={-bw} y={hip - bodyH + breathe} width={bw * 2} height={bodyH - breathe + 6} rx={bw * 0.9} fill={r.body} stroke={INK} strokeWidth={5} />
				<path d={`M${bw * 0.35},${hip - bodyH + 30} Q${bw * 0.95},${hip - bodyH / 2} ${bw * 0.6},${hip}`} stroke={darker(r.body, 0.25)} strokeWidth={14} fill="none" opacity={0.5} />
				{outfit === 'suit' || outfit === 'uniform' || outfit === 'coat' ? (
					<g>
						<path d={`M-16,${hip - bodyH + 8 + breathe} L0,${hip - bodyH + 52} L16,${hip - bodyH + 8 + breathe} Z`} fill={r.shirt ?? '#f4f1ea'} stroke={INK} strokeWidth={3.5} />
						{r.tie ? <path d={`M-5,${hip - bodyH + 18} L5,${hip - bodyH + 18} L8,${hip - bodyH + 58} L0,${hip - bodyH + 66} L-8,${hip - bodyH + 58} Z`} fill={r.tie} stroke={INK} strokeWidth={3} /> : null}
						<path d={`M-20,${hip - bodyH + 10 + breathe} L-2,${hip - bodyH + 58} M20,${hip - bodyH + 10 + breathe} L2,${hip - bodyH + 58}`} stroke={INK} strokeWidth={3.5} fill="none" />
						{outfit === 'uniform'
							? [0, 1, 2].map((i) => <circle key={i} cx={-12} cy={hip - bodyH + 72 + i * 18} r={4} fill="#e8c24a" stroke={INK} strokeWidth={2} />)
							: null}
					</g>
				) : null}
				{outfit === 'robe' ? <path d={`M-8,${hip - bodyH + 14} L-8,${hip} M8,${hip - bodyH + 14} L8,${hip}`} stroke={darker(r.body, 0.3)} strokeWidth={4} /> : null}
				{outfit === 'robe' ? <rect x={-bw} y={hip - 52} width={bw * 2} height={9} fill={darker(r.body, 0.45)} /> : null}
				{outfit === 'scrubs' ? <path d={`M-18,${hip - bodyH + 10} L0,${hip - bodyH + 40} L18,${hip - bodyH + 10}`} stroke={INK} strokeWidth={3.5} fill="none" /> : null}
				{outfit === 'prison' ? [0, 1, 2, 3].map((i) => <line key={i} x1={-bw + 4} y1={hip - bodyH + 30 + i * 22} x2={bw - 4} y2={hip - bodyH + 30 + i * 22} stroke={darker(r.body, 0.35)} strokeWidth={8} />) : null}
				{/* head */}
				<g transform={`rotate(${pose.head ?? 0},${HC[0]},${HC[1] + HEAD_R})`}>
					<defs>
						<clipPath id={clip}>
							<circle cx={HC[0]} cy={HC[1]} r={HEAD_R} />
						</clipPath>
					</defs>
					<circle cx={HC[0]} cy={HC[1]} r={HEAD_R} fill={r.skin} />
					{/* hard shadow on the far side of the face */}
					<g clipPath={`url(#${clip})`}>
						<circle cx={HC[0] - HEAD_R * 0.55} cy={HC[1] + 6} r={HEAD_R * 1.05} fill={darker(r.skin, 0.13)} />
						<circle cx={HC[0] + 8} cy={HC[1] - 4} r={HEAD_R * 0.98} fill={r.skin} />
					</g>
					<ellipse cx={HC[0] + 30} cy={HC[1] - 40} rx={14} ry={8} fill="#fff" opacity={0.55} transform={`rotate(-30,${HC[0] + 30},${HC[1] - 40})`} />
					{/* hair */}
					{r.hair === 'slick' ? (
						<path d={`M${HC[0] - 74},${HC[1] + 4} Q${HC[0] - 80},${HC[1] - 70} ${HC[0] - 10},${HC[1] - 76} Q${HC[0] + 56},${HC[1] - 76} ${HC[0] + 70},${HC[1] - 30} Q${HC[0] + 30},${HC[1] - 56} ${HC[0] - 30},${HC[1] - 42} Q${HC[0] - 56},${HC[1] - 30} ${HC[0] - 60},${HC[1] + 14} Z`} fill={r.hairColor} stroke={INK} strokeWidth={4} />
					) : null}
					{r.hair === 'crew' ? <path d={`M${HC[0] - 70},${HC[1] - 16} Q${HC[0] - 64},${HC[1] - 78} ${HC[0]},${HC[1] - 78} Q${HC[0] + 64},${HC[1] - 78} ${HC[0] + 70},${HC[1] - 16} Q${HC[0]},${HC[1] - 50} ${HC[0] - 70},${HC[1] - 16} Z`} fill={r.hairColor} stroke={INK} strokeWidth={4} /> : null}
					{r.hair === 'side' || r.hair === 'tonsure' ? (
						<g fill={r.hairColor} stroke={INK} strokeWidth={4}>
							<path d={`M${HC[0] - 74},${HC[1] + 10} Q${HC[0] - 78},${HC[1] - 40} ${HC[0] - 50},${HC[1] - 56} Q${HC[0] - 54},${HC[1] - 20} ${HC[0] - 58},${HC[1] + 16} Z`} />
							<path d={`M${HC[0] + 74},${HC[1] + 10} Q${HC[0] + 78},${HC[1] - 40} ${HC[0] + 50},${HC[1] - 56} Q${HC[0] + 54},${HC[1] - 20} ${HC[0] + 58},${HC[1] + 16} Z`} />
							{r.hair === 'tonsure' ? <path d={`M${HC[0] - 50},${HC[1] - 56} Q${HC[0]},${HC[1] - 86} ${HC[0] + 50},${HC[1] - 56} Q${HC[0]},${HC[1] - 70} ${HC[0] - 50},${HC[1] - 56} Z`} /> : null}
						</g>
					) : null}
					{r.hair === 'curly'
						? Array.from({length: 9}).map((_, i) => {
								const a = Math.PI * (1.05 + (i / 8) * 0.9);
								return <circle key={i} cx={HC[0] + Math.cos(a) * 64} cy={HC[1] + Math.sin(a) * 64} r={20} fill={r.hairColor} stroke={INK} strokeWidth={4} />;
							})
						: null}
					<circle cx={HC[0]} cy={HC[1]} r={HEAD_R} fill="none" stroke={INK} strokeWidth={5} />
					{/* face */}
					{[-22, 26].map((exx, i) => (
						<g key={i}>
							{blink ? (
								<path d={`M${HC[0] + exx - 9 + ex},${HC[1] - 2 + ey} q9,6 18,0`} stroke={INK} strokeWidth={4} fill="none" />
							) : (
								<g>
									<ellipse cx={HC[0] + exx + ex} cy={HC[1] - 4 + ey} rx={8.5} ry={11.5} fill={INK} />
									<circle cx={HC[0] + exx + ex + 3} cy={HC[1] - 8 + ey} r={3.2} fill="#fff" />
								</g>
							)}
							<line
								x1={HC[0] + exx - 11}
								y1={HC[1] - 26 + bt[0] + (i ? -1 : 1) * bt[1] * 0.4}
								x2={HC[0] + exx + 11}
								y2={HC[1] - 26 + bt[0] + (i ? 1 : -1) * bt[1] * 0.4}
								stroke={INK}
								strokeWidth={4}
							/>
							{r.glasses ? <circle cx={HC[0] + exx} cy={HC[1] - 4} r={18} fill="none" stroke={INK} strokeWidth={3.5} /> : null}
						</g>
					))}
					{r.glasses ? <line x1={HC[0] - 4} y1={HC[1] - 4} x2={HC[0] + 8} y2={HC[1] - 4} stroke={INK} strokeWidth={3.5} /> : null}
					{r.mustache ? <path d={`M${HC[0] - 18},${HC[1] + 26} Q${HC[0] + 2},${HC[1] + 14} ${HC[0] + 22},${HC[1] + 26} Q${HC[0] + 2},${HC[1] + 22} ${HC[0] - 18},${HC[1] + 26} Z`} fill={r.mustache} stroke={INK} strokeWidth={3} /> : null}
					{r.beard ? <path d={`M${HC[0] - 56},${HC[1] + 20} Q${HC[0]},${HC[1] + 100} ${HC[0] + 60},${HC[1] + 20} Q${HC[0] + 2},${HC[1] + 60} ${HC[0] - 56},${HC[1] + 20} Z`} fill={r.beard} stroke={INK} strokeWidth={3.5} /> : null}
					<MouthShape m={mouth} cx={HC[0] + 4} cy={HC[1] + 36} />
					{face.sweat ? <path d={`M${HC[0] - 60},${HC[1] - 20} q-8,14 0,18 q8,-4 0,-18 Z`} fill="#9fd8ff" stroke={INK} strokeWidth={2.5} /> : null}
					{/* hats */}
					{r.hat === 'fedora' ? (
						<g fill={r.hatColor ?? '#2a2a30'} stroke={INK} strokeWidth={4.5}>
							<ellipse cx={HC[0]} cy={HC[1] - 52} rx={102} ry={18} />
							<path d={`M${HC[0] - 62},${HC[1] - 56} Q${HC[0] - 60},${HC[1] - 120} ${HC[0]},${HC[1] - 118} Q${HC[0] + 60},${HC[1] - 120} ${HC[0] + 62},${HC[1] - 56} Z`} />
							<rect x={HC[0] - 62} y={HC[1] - 74} width={124} height={14} fill={darker(r.hatColor ?? '#2a2a30', -0.6)} />
						</g>
					) : null}
					{r.hat === 'navycap' ? (
						<g stroke={INK} strokeWidth={4.5}>
							<path d={`M${HC[0] - 76},${HC[1] - 58} Q${HC[0]},${HC[1] - 120} ${HC[0] + 80},${HC[1] - 62} L${HC[0] + 70},${HC[1] - 44} L${HC[0] - 66},${HC[1] - 42} Z`} fill={r.hatColor ?? '#f4f4f0'} />
							<rect x={HC[0] - 66} y={HC[1] - 50} width={136} height={14} fill="#1d2236" />
							<path d={`M${HC[0] - 10},${HC[1] - 38} Q${HC[0] + 40},${HC[1] - 30} ${HC[0] + 82},${HC[1] - 42}`} fill="none" stroke={INK} strokeWidth={8} />
							<circle cx={HC[0] + 2} cy={HC[1] - 66} r={9} fill="#e8c24a" />
						</g>
					) : null}
					{r.hat === 'sailor' ? (
						<g stroke={INK} strokeWidth={4.5} fill="#f8f8f4">
							<path d={`M${HC[0] - 60},${HC[1] - 50} Q${HC[0]},${HC[1] - 100} ${HC[0] + 60},${HC[1] - 50} Z`} />
							<rect x={HC[0] - 66} y={HC[1] - 56} width={132} height={12} rx={5} />
						</g>
					) : null}
				</g>
				{/* front arm over the body */}
				<path d={arm(shF, handF, 1)} stroke={INK} strokeWidth={6} fill="none" />
				<circle cx={handF[0]} cy={handF[1]} r={9} fill={r.skin} stroke={INK} strokeWidth={3.5} />
				{r.stripes
					? Array.from({length: r.stripes}).map((_, i) => {
							const k = 0.82 - i * 0.07;
							return <circle key={i} cx={shF[0] + (handF[0] - shF[0]) * k} cy={shF[1] + (handF[1] - shF[1]) * k} r={5} fill="#e8c24a" stroke={INK} strokeWidth={1.5} />;
						})
					: null}
			</g>
		</g>
	);
};

const MouthShape: React.FC<{m: Mouth; cx: number; cy: number}> = ({m, cx, cy}) => {
	if (m === 'closed') return <path d={`M${cx - 12},${cy} Q${cx},${cy + 4} ${cx + 12},${cy}`} stroke={INK} strokeWidth={4.5} fill="none" />;
	if (m === 'smile') return <path d={`M${cx - 18},${cy - 4} Q${cx},${cy + 14} ${cx + 18},${cy - 4}`} stroke={INK} strokeWidth={4.5} fill="none" />;
	if (m === 'smirk') return <path d={`M${cx - 14},${cy + 2} Q${cx + 4},${cy + 6} ${cx + 18},${cy - 8}`} stroke={INK} strokeWidth={4.5} fill="none" />;
	if (m === 'frown') return <path d={`M${cx - 14},${cy + 6} Q${cx},${cy - 6} ${cx + 14},${cy + 6}`} stroke={INK} strokeWidth={4.5} fill="none" />;
	if (m === 'o') return <ellipse cx={cx} cy={cy + 2} rx={8} ry={10} fill="#5a1a1e" stroke={INK} strokeWidth={4} />;
	const h = m === 'wide' ? 24 : 14;
	return (
		<g>
			<path d={`M${cx - 20},${cy - 4} Q${cx},${cy - 2} ${cx + 20},${cy - 4} Q${cx + 16},${cy + h} ${cx},${cy + h + 2} Q${cx - 16},${cy + h} ${cx - 20},${cy - 4} Z`} fill="#6a1e24" stroke={INK} strokeWidth={4} />
			<path d={`M${cx - 14},${cy - 2} L${cx + 14},${cy - 2} L${cx + 12},${cy + 3} L${cx - 12},${cy + 3} Z`} fill="#fff" />
			<ellipse cx={cx} cy={cy + h - 3} rx={9} ry={4} fill="#e0606a" />
		</g>
	);
};

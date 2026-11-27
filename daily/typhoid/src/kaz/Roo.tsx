import React from 'react';

/* Doctor ROO in the hand-drawn explainer look (reference: round cream-skin heads, tiny dot eyes,
   a short line for a mouth, thin uniform ink, a big rounded clothing shape with a soft shade,
   arms as thin black lines with no hands, hair drawn with strand lines).
   Identity: messy ginger hair, thin round glasses, freckles, red scarf, white lab coat,
   stethoscope, brown shoes. Origin = between the feet on the floor, y down, facing 1 = right. */

const INK = '#26222a';
const SKIN = '#efd8bb';
const SKIN_SH = '#dcc09e';
export type RooFace = {look?: [number, number]; mouth?: 'smile' | 'open' | 'flat' | 'frown' | 'grin'; brows?: 'up' | 'down' | 'worried' | 'flat'; blink?: boolean};
export type RooPose = {
	hand?: [number, number]; // front hand end (local, before facing)
	handB?: [number, number]; // back hand end
	head?: number; // head tilt, degrees (negative = looks up when facing right)
	lean?: number; // body lean, degrees
	step?: number; // -1..1 leg swing
};

/* a thin arm line from the side of the coat, gently bent at the elbow */
const arm = (sh: [number, number], h: [number, number], bend: number) => {
	const mx = (sh[0] + h[0]) / 2;
	const my = (sh[1] + h[1]) / 2;
	const dx = h[0] - sh[0];
	const dy = h[1] - sh[1];
	const len = Math.hypot(dx, dy) || 1;
	const k = Math.max(0, 130 - len) * 0.4 + 10;
	return `M${sh[0]},${sh[1]} Q${mx + (-dy / len) * k * bend},${my + (dx / len) * k * bend} ${h[0]},${h[1]}`;
};

export const KazRoo: React.FC<{x: number; y: number; s?: number; facing?: 1 | -1; t: number; pose?: RooPose; face?: RooFace; id?: string}> = ({x, y, s = 1, facing = 1, t, pose = {}, face = {}, id = 'roo'}) => {
	const {hand = [70, -178], handB = [-66, -180], head = 0, lean = 0, step = 0} = pose;
	const {look = [0.3, 0], mouth = 'flat', brows = 'flat'} = face;
	const blink = face.blink ?? t % 101 < 4;
	const br = Math.sin(t / 24) * 1.6;
	const HC: [number, number] = [8, -432 + br]; // head centre
	const ex = look[0] * 4;
	const ey = look[1] * 4;
	const browY = {up: -8, down: 3, worried: -3, flat: 0}[brows];
	const browTilt = {up: 0, down: -9, worried: 9, flat: 0}[brows];
	const wave = Math.sin(t / 7) * 5;
	const E = (dx: number) => HC[0] + dx; // face x helper
	return (
		<g transform={`translate(${x},${y}) scale(${s * facing},${s})`} strokeLinejoin="round" strokeLinecap="round">
			<defs>
				<linearGradient id={`${id}-coat`} x1="0" y1="0" x2="1" y2="0">
					<stop offset="0" stopColor="#c9d0d8" />
					<stop offset="0.45" stopColor="#e9ecef" />
					<stop offset="1" stopColor="#dfe3e8" />
				</linearGradient>
			</defs>
			<ellipse cx={0} cy={4} rx={78} ry={11} fill="#000" opacity={0.2} />
			{/* thin legs, small shoes */}
			<g stroke={INK} strokeWidth={5} fill="none">
				<path d={`M-20,-160 L${-22 - step * 16},-10`} />
				<path d={`M20,-160 L${24 + step * 16},-10`} />
			</g>
			<path d={`M${-40 - step * 16},-2 Q${-38 - step * 16},-18 ${-18 - step * 16},-16 Q${-6 - step * 16},-12 ${-8 - step * 16},-2 Z`} fill="#6e4a33" stroke={INK} strokeWidth={3} />
			<path d={`M${12 + step * 16},-2 Q${12 + step * 16},-16 ${30 + step * 16},-16 Q${48 + step * 16},-14 ${46 + step * 16},-2 Z`} fill="#6e4a33" stroke={INK} strokeWidth={3} />
			<g transform={`rotate(${lean},0,-160)`}>
				{/* back arm */}
				<path d={arm([-62, -300 + br], handB, -1)} stroke={INK} strokeWidth={4.5} fill="none" />
				{/* scarf tail behind */}
				<path d={`M-26,${-350 + br} q-46,${8 + wave} -88,${-2 + wave * 1.6} l4,22 q42,${6 - wave} 84,-4 z`} fill="#c8433d" stroke={INK} strokeWidth={3} />
				{/* the coat: one big rounded shape with a soft shade and a few folds */}
				<path d={`M-50,${-352 + br} Q-82,${-340 + br} -86,-280 Q-92,-210 -84,-156 Q0,-142 86,-156 Q92,-210 86,-280 Q82,${-340 + br} 50,${-352 + br} Q0,${-366 + br} -50,${-352 + br} Z`} fill={`url(#${id}-coat)`} stroke={INK} strokeWidth={3.5} />
				<path d="M-60,-240 q4,30 0,70 M58,-232 q-4,28 2,62" stroke="#b8c0c9" strokeWidth={3} fill="none" />
				{/* shirt V and lapels */}
				<path d={`M-18,${-356 + br} L0,-292 L18,${-356 + br} Z`} fill="#5b8c99" stroke={INK} strokeWidth={3} />
				<path d={`M-20,${-354 + br} L-6,-288 L-6,-152 M20,${-354 + br} L6,-288`} stroke={INK} strokeWidth={3} fill="none" />
				{/* pocket with two pens */}
				<path d="M24,-286 h28 v22 q-14,5 -28,0 z" fill="#e3e7eb" stroke={INK} strokeWidth={2.6} />
				<line x1={31} y1={-292} x2={31} y2={-282} stroke="#3d6fd6" strokeWidth={3.5} />
				<line x1={42} y1={-294} x2={42} y2={-282} stroke="#c8433d" strokeWidth={3.5} />
				{/* stethoscope */}
				<path d={`M-28,${-352 + br} Q-44,-292 -18,-254 M28,${-352 + br} Q38,-306 -6,-254`} stroke="#3a3f55" strokeWidth={4} fill="none" />
				<circle cx={-12} cy={-249} r={7.5} fill="#c8ccd6" stroke={INK} strokeWidth={2.6} />
				{/* scarf around the neck */}
				<path d={`M-36,${-366 + br} Q0,${-350 + br} 36,${-366 + br} L38,${-348 + br} Q0,${-332 + br} -38,${-348 + br} Z`} fill="#c8433d" stroke={INK} strokeWidth={3} />
				{/* head */}
				<g transform={`rotate(${head},${HC[0]},${HC[1] + 70})`}>
					<ellipse cx={HC[0]} cy={HC[1]} rx={84} ry={88} fill={SKIN} stroke={INK} strokeWidth={3.5} />
					<path d={`M${E(-60)},${HC[1] + 52} Q${E(-20)},${HC[1] + 92} ${E(40)},${HC[1] + 74} Q${E(0)},${HC[1] + 80} ${E(-60)},${HC[1] + 52} Z`} fill={SKIN_SH} opacity={0.7} />
					{/* ears */}
					<ellipse cx={E(-82)} cy={HC[1] + 10} rx={10} ry={15} fill={SKIN} stroke={INK} strokeWidth={3} />
					{/* messy ginger hair with strand lines */}
					<path
						d={`M${E(-86)},${HC[1] - 2} Q${E(-102)},${HC[1] - 60} ${E(-74)},${HC[1] - 78} Q${E(-86)},${HC[1] - 104} ${E(-50)},${HC[1] - 98} Q${E(-40)},${HC[1] - 128} ${E(-6)},${HC[1] - 108} Q${E(14)},${HC[1] - 132} ${E(40)},${HC[1] - 104} Q${E(74)},${HC[1] - 112} ${E(72)},${HC[1] - 80} Q${E(104)},${HC[1] - 70} ${E(88)},${HC[1] - 30} Q${E(80)},${HC[1] - 50} ${E(58)},${HC[1] - 52} Q${E(40)},${HC[1] - 40} ${E(18)},${HC[1] - 56} Q${E(-6)},${HC[1] - 40} ${E(-28)},${HC[1] - 54} Q${E(-52)},${HC[1] - 40} ${E(-66)},${HC[1] - 40} Q${E(-76)},${HC[1] - 22} ${E(-86)},${HC[1] - 2} Z`}
						fill="#d8662f"
						stroke={INK}
						strokeWidth={3.5}
					/>
					<path d={`M${E(-60)},${HC[1] - 50} q-6,-24 8,-40 M${E(-26)},${HC[1] - 58} q-2,-26 14,-38 M${E(14)},${HC[1] - 62} q4,-22 20,-30 M${E(50)},${HC[1] - 58} q10,-14 18,-24 M${E(-78)},${HC[1] - 30} q-4,-16 2,-30`} stroke="#a8441e" strokeWidth={3} fill="none" />
					{/* tiny features: dot eyes behind thin round glasses, short brows, a line mouth */}
					{[-22, 30].map((gx, i) => (
						<g key={i}>
							<circle cx={E(gx)} cy={HC[1] + 8} r={20} fill="#ffffff" fillOpacity={0.25} stroke={INK} strokeWidth={2.8} />
							{blink ? (
								<line x1={E(gx) - 6} y1={HC[1] + 9} x2={E(gx) + 6} y2={HC[1] + 9} stroke={INK} strokeWidth={3} />
							) : (
								<ellipse cx={E(gx) + ex} cy={HC[1] + 8 + ey} rx={4.2} ry={5.6} fill={INK} />
							)}
							<line
								x1={E(gx) - 10}
								y1={HC[1] - 22 + browY + (i ? -1 : 1) * browTilt * 0.4}
								x2={E(gx) + 10}
								y2={HC[1] - 22 + browY + (i ? 1 : -1) * browTilt * 0.4}
								stroke={INK}
								strokeWidth={3}
							/>
						</g>
					))}
					<line x1={E(-2)} y1={HC[1] + 7} x2={E(10)} y2={HC[1] + 7} stroke={INK} strokeWidth={2.8} />
					<line x1={E(-42)} y1={HC[1] + 6} x2={E(-80)} y2={HC[1] + 2} stroke={INK} strokeWidth={2.6} />
					{[[-36, 32], [-28, 36], [-42, 38], [34, 32], [42, 36], [28, 38]].map(([fx, fy], i) => (
						<circle key={i} cx={E(fx)} cy={HC[1] + fy} r={1.8} fill="#b0703c" />
					))}
					<ellipse cx={E(-38)} cy={HC[1] + 34} rx={11} ry={6} fill="#ee9f92" opacity={0.45} />
					<ellipse cx={E(40)} cy={HC[1] + 34} rx={11} ry={6} fill="#ee9f92" opacity={0.45} />
					{mouth === 'flat' ? <line x1={E(-4)} y1={HC[1] + 50} x2={E(12)} y2={HC[1] + 50} stroke={INK} strokeWidth={3} /> : null}
					{mouth === 'smile' ? <path d={`M${E(-8)},${HC[1] + 48} Q${E(4)},${HC[1] + 56} ${E(16)},${HC[1] + 48}`} stroke={INK} strokeWidth={3} fill="none" /> : null}
					{mouth === 'grin' ? <path d={`M${E(-10)},${HC[1] + 46} Q${E(4)},${HC[1] + 62} ${E(18)},${HC[1] + 46} Z`} fill={INK} /> : null}
					{mouth === 'open' ? <ellipse cx={E(4)} cy={HC[1] + 52} rx={5.5} ry={7.5} fill={INK} /> : null}
					{mouth === 'frown' ? <path d={`M${E(-8)},${HC[1] + 54} Q${E(4)},${HC[1] + 46} ${E(16)},${HC[1] + 54}`} stroke={INK} strokeWidth={3} fill="none" /> : null}
				</g>
				{/* front arm: a thin line, no hand */}
				<path d={arm([62, -300 + br], hand, 1)} stroke={INK} strokeWidth={4.5} fill="none" />
			</g>
		</g>
	);
};

import React from 'react';
import {interpolate, spring, useVideoConfig} from 'remotion';
import {Layer} from '../kit/kit';
import {clamp, ease} from '../kit/kit';
import {FONT} from '../kit/ui';
import {LampCone, LampPost, Sky, Skyline, Street} from '../reference/PauseTime';

/* Pieces shared by all parts of the video. */
export const FL = 900;
export const HS = 1; // hero scale
export const headY = (floor: number, s = HS) => floor - 157 * s - 164 * s;
export const badgeY = (floor: number, s = HS) => headY(floor, s) - 118 * s;

/* a bank card held in the front hand */
export const Card = () => (
	<g transform="rotate(-20)">
		<rect x={-6} y={-30} width={46} height={30} rx={4} fill="#3d6fd6" stroke="#e9f3ff" strokeWidth={2} />
		<rect x={0} y={-24} width={10} height={8} rx={2} fill="#ffd34a" />
	</g>
);
export const SmallPhone = () => (
	<g transform="rotate(-12)">
		<rect x={-10} y={-44} width={30} height={52} rx={6} fill="#15161d" />
		<rect x={-7} y={-40} width={24} height={42} rx={4} fill="#bfe3ff" />
	</g>
);

/* comic sound word that pops with a spring */
export const Bang: React.FC<{f: number; t: number; x: number; y: number; text: string; c?: string}> = ({f, t, x, y, text, c = '#3fcf7a'}) => {
	const {fps} = useVideoConfig();
	const k = spring({frame: f - t, fps, config: {damping: 9, stiffness: 200}});
	const o = interpolate(f, [t, t + 2, t + 40, t + 52], [0, 1, 1, 0], clamp);
	return (
		<g transform={`translate(${x},${y}) rotate(-10) scale(${k})`} opacity={o}>
			<text textAnchor="middle" fontSize={64} fontFamily={FONT} fontWeight={900} fill={c} stroke="#11142c" strokeWidth={10} paintOrder="stroke">
				{text}
			</text>
		</g>
	);
};
/* a word that appears and gets crossed out */
export const Struck: React.FC<{f: number; t: number; x: number; y: number; text: string; strikeAt: number}> = ({f, t, x, y, text, strikeAt}) => {
	const {fps} = useVideoConfig();
	const k = spring({frame: f - t, fps, config: {damping: 11, stiffness: 160}});
	const s = interpolate(f, [strikeAt, strikeAt + 8], [0, 1], {...clamp, easing: ease});
	return (
		<g transform={`translate(${x},${y}) rotate(-6) scale(${k})`} opacity={1 - 0.5 * s}>
			<text textAnchor="middle" fontSize={96} fontFamily={FONT} fontWeight={900} fill="#ffd34a" stroke="#11142c" strokeWidth={10} paintOrder="stroke">
				{text}
			</text>
			<line x1={-70} y1={-30} x2={-70 + 140 * s} y2={-30 + 0 * s} stroke="#ff4a4a" strokeWidth={12} strokeLinecap="round" transform="rotate(-12)" />
		</g>
	);
};

export const SFL = 905;
export const StreetBG: React.FC<{gf: number}> = ({gf}) => (
	<>
		<Layer depth={2.4}>
			<Sky wt={gf} />
		</Layer>
		<Layer depth={1.8}>
			<Skyline wt={gf} />
		</Layer>
		<Layer depth={1.25}>
			<LampPost wt={gf} />
		</Layer>
		<Layer depth={1}>
			<Street wt={gf} />
		</Layer>
		<Layer depth={1.25} blend="screen">
			<LampCone />
		</Layer>
	</>
);

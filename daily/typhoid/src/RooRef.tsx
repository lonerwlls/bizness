import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Stickman} from './engine/Stickman';
import {gesture, idle} from './kit/actions';
import {CAST} from './story/cast';

/* style reference of the channel hero ROO for image generators: three poses, plain background */
const RAINCOAT = {...CAST.hero, color: '#f2b21c', outfit: 'raincoat' as const, acc: ['glasses', 'scarf'] as ('glasses' | 'scarf')[]};
export const RooRef: React.FC<{doctor?: boolean}> = ({doctor}) => {
	const look = doctor ? CAST.hero : RAINCOAT;
	const s = 2.0;
	const y = 1010 - 157 * s;
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #2a2f6a 0%, #0b1030 85%)'}}>
			<svg width={1920} height={1080}>
				{[420, 960, 1500].map((x, i) => (
					<ellipse key={'s' + i} cx={x} cy={1012} rx={170} ry={22} fill="#000" opacity={0.35} />
				))}
				<Stickman id="r1" x={420} y={y} scale={s} pose={idle(3, 2)} {...look} faceTurn={0.1} look={[0.1, 0]} mouth="smile" t={4} />
				<Stickman id="r2" x={960} y={y} scale={s} pose={gesture('wave', idle(9, 4), 1, 12)} {...look} faceTurn={0.45} look={[0.5, -0.1]} mouth="open" t={9} />
				<Stickman id="r3" x={1500} y={y} scale={s} facing={-1} pose={gesture('handsOnHead', idle(5, 1), 1, 6)} {...look} faceTurn={0.3} look={[-0.2, -0.2]} expr="wide" mouth="open" t={14} />
			</svg>
		</AbsoluteFill>
	);
};

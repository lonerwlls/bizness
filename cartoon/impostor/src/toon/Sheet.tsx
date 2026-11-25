import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {HAND} from '../kit/ui';
import {CAST} from './cast';
import {Toon} from './Toon';

/* character sheet: every recipe of the film side by side */
export const ToonSheet: React.FC = () => {
	const t = useCurrentFrame() + 30;
	const keys = Object.keys(CAST);
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #3a3f55 0%, #15161f 90%)'}}>
			<svg viewBox="0 0 1920 1080" width={1920} height={1080}>
				{keys.map((k, i) => {
					const col = i % 9;
					const row = Math.floor(i / 9);
					const x = 120 + col * 210;
					const y = 470 + row * 500;
					return (
						<g key={k}>
							<Toon id={'sh' + k} r={CAST[k]} x={x} y={y} s={0.8} t={t} face={{mouth: i % 3 === 0 ? 'smile' : i % 3 === 1 ? 'closed' : 'open'}} />
							<text x={x} y={y + 50} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={34} fill="#f2d27a">
								{k}
							</text>
						</g>
					);
				})}
			</svg>
		</AbsoluteFill>
	);
};

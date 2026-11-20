import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Stickman} from './engine/Stickman';
import {idle} from './kit/actions';
import {CAST} from './story/cast';

/* everyone in the cast side by side, plus the hero at 28 / 60 / 96 */
export const CastSheet: React.FC = () => {
	const names = Object.keys(CAST);
	return (
		<AbsoluteFill style={{background: 'radial-gradient(#2a2f6a, #0b1030)'}}>
			<svg width={1920} height={1080}>
				{[0, 0.5, 1].map((a, i) => (
					<Stickman key={'h' + i} id={'h' + i} x={160 + i * 200} y={420} scale={1} pose={idle(i * 7, i)} {...CAST.hero} age={a} hairColor={i === 0 ? '#e4602c' : i === 1 ? '#c69a88' : '#dcdce4'} acc={i === 2 ? ['glasses', 'scarf', 'stethoscope', 'mustache'] : CAST.hero.acc} t={i * 9} />
				))}
				{names.slice(1).map((n, i) => (
					<g key={n}>
						<Stickman id={n} x={140 + (i % 9) * 200} y={i < 9 ? 900 : 420} scale={n.startsWith('kid') ? 0.7 : n === 'patient' ? 1.25 : 1} pose={idle(i * 5, i)} {...CAST[n]} t={i * 3} />
						<text x={140 + (i % 9) * 200} y={i < 9 ? 1060 : 590} fill="#fff" fontSize={26} textAnchor="middle">{n}</text>
					</g>
				))}
			</svg>
		</AbsoluteFill>
	);
};

import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CAST} from './toon/cast';
import {Toon} from './toon/Toon';

/* reference picture of Fred for the thumbnail generator: navy uniform and surgical scrubs, plain background */
export const FredRef: React.FC = () => (
	<AbsoluteFill style={{background: '#e8e6e0'}}>
		<svg viewBox="0 0 1920 1080" width={1920} height={1080}>
			<Toon id="refA" r={CAST.fredNavy} x={620} y={1010} s={2.75} t={30} pose={{hand: [72, -86], handB: [-72, -86]}} face={{look: [0.15, -0.05], mouth: 'smirk', brows: 'sly', lids: 'sly', blink: false}} />
			<Toon id="refB" r={CAST.fredSurg} x={1300} y={1010} s={2.75} t={30} pose={{hand: [72, -86], handB: [-72, -86]}} face={{look: [0.15, -0.05], mouth: 'grin', brows: 'up', blink: false}} />
		</svg>
	</AbsoluteFill>
);

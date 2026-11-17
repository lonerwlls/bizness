import React from 'react';
import {AbsoluteFill, Freeze, getInputProps} from 'remotion';
import {StationShort} from './Station';
import {Station2Short} from '../station2/Station2';
import {Station3Short} from '../station3/Station3';
// лист кадров для проверки: --props='{"frames":[...]}'
export const StationSheet: React.FC = () => {
	const {frames = [0], comp = 'Station'} = getInputProps() as {frames?: number[]; comp?: string};
	const C = comp === 'Station3' ? Station3Short : comp === 'Station2' ? Station2Short : StationShort;
	const cols = 4, w = 1080 / cols * 2, h = w * 16 / 9;
	return (
		<AbsoluteFill style={{background: '#111'}}>
			{frames.map((fr, i) => (
				<div key={i} style={{position: 'absolute', left: (i % cols) * w, top: Math.floor(i / cols) * h, width: w, height: h, overflow: 'hidden', outline: '2px solid #000'}}>
					<div style={{width: 1080, height: 1920, transform: `scale(${w / 1080})`, transformOrigin: '0 0', position: 'relative'}}>
						<Freeze frame={fr}><C /></Freeze>
					</div>
					<div style={{position: 'absolute', left: 6, top: 4, color: '#ffe04a', fontSize: 28, fontWeight: 800, textShadow: '0 1px 3px #000'}}>{(fr / 30).toFixed(1)}s</div>
				</div>
			))}
		</AbsoluteFill>
	);
};

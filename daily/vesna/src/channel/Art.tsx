import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {Stickman} from '../engine/Stickman';
import {gesture, idle} from '../kit/actions';
import {FONT} from '../kit/ui';
import {CAST} from '../story/cast';
import {Heart} from '../story/placesH';
import {Jet} from '../story/placesV';

/* Channel art for "vlous": avatar (800x800) and banner (2560x1440, safe area 1546x423 in the middle). Hero = Doctor ROO. */
const ROO = CAST.doc;

export const Avatar: React.FC = () => (
	<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 42%, #ffe27a 0%, #f2b21c 62%, #d9901a 100%)'}}>
		<svg viewBox="0 0 800 800" width={800} height={800}>
			{Array.from({length: 16}).map((_, i) => (
				<polygon key={i} points={`400,380 ${400 + Math.cos((i / 16) * Math.PI * 2) * 700},${380 + Math.sin((i / 16) * Math.PI * 2) * 700} ${400 + Math.cos(((i + 0.5) / 16) * Math.PI * 2) * 700},${380 + Math.sin(((i + 0.5) / 16) * Math.PI * 2) * 700}`} fill="#fff4c0" opacity={0.25} />
			))}
			<Stickman id="ava" x={410} y={900} scale={3.05} facing={1} pose={{...idle(10, 2), head: -4}} {...ROO} look={[0.1, -0.05]} faceTurn={0.15} mouth="smile" expr="normal" t={12} />
		</svg>
	</AbsoluteFill>
);

const Icon: React.FC<{x: number; y: number; r?: number; s?: number; children: React.ReactNode}> = ({x, y, r = 0, s = 1, children}) => (
	<g transform={`translate(${x},${y}) rotate(${r}) scale(${s})`}>
		<circle r={86} fill="#1d2560" stroke="#3a4a9a" strokeWidth={6} />
		{children}
	</g>
);

export const Banner: React.FC = () => (
	<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #2e3a8a 0%, #18205a 55%, #0b1030 100%)'}}>
		<svg viewBox="0 0 2560 1440" width={2560} height={1440}>
			{/* stars */}
			{Array.from({length: 140}).map((_, i) => (
				<circle key={i} cx={random('sx' + i) * 2560} cy={random('sy' + i) * 900} r={1 + random('sr' + i) * 3} fill="#fff" opacity={0.3 + random('so' + i) * 0.6} />
			))}
			{/* skyline */}
			{Array.from({length: 32}).map((_, i) => {
				const w = 70 + random('bw' + i) * 90;
				const h = 120 + random('bh' + i) * 260;
				const x = -40 + i * 84;
				return (
					<g key={i}>
						<rect x={x} y={1440 - h - 260} width={w} height={h + 260} fill={i % 2 ? '#141a44' : '#1b2154'} />
						{Array.from({length: Math.floor(h / 46)}).map((_, j) => (random('bl' + i + j) > 0.5 ? <rect key={j} x={x + 14 + (j % 2) * (w / 2 - 12)} y={1440 - h - 230 + j * 42} width={14} height={18} fill="#ffd27a" opacity={0.7} /> : null))}
					</g>
				);
			})}
			<rect x={0} y={1180} width={2560} height={260} fill="#0d1236" />
			{/* topic icons around the safe area */}
			<Icon x={420} y={420} r={-8}>
				<g transform="scale(1.1)">
					<Heart k={0.2} />
				</g>
			</Icon>
			<Icon x={2150} y={380} r={6}>
				<g transform="scale(0.2) rotate(-12)">
					<Jet x={0} y={0} />
				</g>
			</Icon>
			<Icon x={2260} y={760} r={-6}>
				<text y={22} textAnchor="middle" fontSize={64} fontFamily={FONT} fontWeight={900} fill="#ffd34a">
					HIC!
				</text>
			</Icon>
			<Icon x={300} y={860} r={8}>
				<circle r={52} fill="#f4f1e6" />
				<line x1={0} y1={0} x2={0} y2={-34} stroke="#11142c" strokeWidth={8} strokeLinecap="round" />
				<line x1={0} y1={0} x2={26} y2={10} stroke="#11142c" strokeWidth={8} strokeLinecap="round" />
			</Icon>
			<Icon x={1950} y={1080} r={-4} s={0.8}>
				<circle r={50} fill="#f2b21c" stroke="#b8801a" strokeWidth={8} />
				<text y={20} textAnchor="middle" fontSize={56} fontFamily={FONT} fontWeight={900} fill="#7a4e1a">
					$
				</text>
			</Icon>
			{/* spotlight + hero (head inside the safe area) */}
			<ellipse cx={820} cy={1235} rx={260} ry={34} fill="#000" opacity={0.35} />
			<polygon points="760,-40 880,-40 1120,1195 520,1195" fill="#fff6d8" opacity={0.07} />
			<Stickman id="ban" x={820} y={1235 - 157 * 1.75} scale={1.75} facing={1} pose={gesture('presentF', idle(8, 3), 1, 8)} {...ROO} look={[0.5, -0.1]} faceTurn={0.35} mouth="smile" expr="normal" t={20} />
			{/* name + tagline */}
			<g transform="translate(1520,700)">
				<text textAnchor="middle" fontSize={260} fontFamily={FONT} fontWeight={900} fill="#ffd34a" stroke="#11142c" strokeWidth={22} paintOrder="stroke" letterSpacing={6}>
					vlous
				</text>
				<g transform="translate(0,120)">
					<rect x={-470} y={-62} width={940} height={96} rx={48} fill="#11142c" stroke="#9fd8ff" strokeWidth={5} />
					<text y={6} textAnchor="middle" fontSize={50} fontFamily={FONT} fontWeight={900} fill="#ffffff" letterSpacing={2}>
						WHAT IF…? · REAL STORIES
					</text>
				</g>
			</g>
			<text x={1945} y={610} fontSize={170} fontFamily={FONT} fontWeight={900} fill="#9fd8ff" stroke="#11142c" strokeWidth={14} paintOrder="stroke" transform="rotate(12 1945 610)">
				?
			</text>
		</svg>
	</AbsoluteFill>
);

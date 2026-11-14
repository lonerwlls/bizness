import React from 'react';
import {AbsoluteFill} from 'remotion';
import {POSES, Stickman} from './engine/Stickman';

const C: {name: string; sub: string; color: string; outfit: 'hoodie' | 'coat' | 'tee'; hair: 'short' | 'spiky' | 'none' | 'cap'; hairColor?: string; acc: ('lamp' | 'plaster' | 'scarf' | 'vest' | 'headphones')[]; pose: keyof typeof POSES; hood?: boolean; shoe: string; bg: string}[] = [
	{name: '1 · ФОНАРИК', sub: 'бирюзовый дождевик, налобный фонарь', color: '#1f9a96', outfit: 'coat', hair: 'none', acc: ['lamp'], pose: 'stand', hood: true, shoe: '#f2f2f2', bg: '#0e1a2c'},
	{name: '2 · СИГНАЛ', sub: 'серая толстовка, оранжевый жилет, пластырь', color: '#5b6270', outfit: 'hoodie', hair: 'spiky', hairColor: '#000', acc: ['vest', 'plaster'], pose: 'stand', shoe: '#ff7a1a', bg: '#1c1424'},
	{name: '3 · ШАРФ', sub: 'фиолетовая толстовка, длинный красный шарф', color: '#6a4fd0', outfit: 'hoodie', hair: 'short', acc: ['scarf', 'headphones'], pose: 'stand', shoe: '#e8e8e8', bg: '#14202a'},
];
export const Heroes: React.FC = () => (
	<AbsoluteFill style={{background: '#0a0c14', fontFamily: 'Rubik, sans-serif'}}>
		<svg width={1920} height={1080}>
			{C.map((c, i) => (
				<g key={i} transform={`translate(${i * 640} 0)`}>
					<rect width={640} height={1080} fill={c.bg} />
					<ellipse cx={320} cy={835} rx={200} ry={30} fill="#000" opacity={0.4} />
					<radialGradient id={`g${i}`}><stop offset="0" stopColor="#ffffff" stopOpacity={0.12} /><stop offset="1" stopColor="#fff" stopOpacity={0} /></radialGradient>
					<circle cx={320} cy={560} r={360} fill={`url(#g${i})`} />
					{c.acc.includes('lamp') ? <polygon points="335,400 640,300 640,540" fill="#fff3b0" opacity={0.12} /> : null}
					<Stickman id={`h${i}`} x={320} y={640} scale={1.25} facing={1} pose={POSES[c.pose]} color={c.color} outfit={c.outfit} hair={c.hair} hairColor={c.hairColor} acc={c.acc as never} hood={c.hood} shoe={c.shoe} rim="#ffffff" rimW={2.4} faceTurn={0.25} mouth="smirk" />
					<text x={320} y={930} textAnchor="middle" fontSize={52} fontWeight={900} fill="#fff">{c.name}</text>
					<text x={320} y={985} textAnchor="middle" fontSize={26} fill="#b8c0d0">{c.sub}</text>
				</g>
			))}
		</svg>
	</AbsoluteFill>
);

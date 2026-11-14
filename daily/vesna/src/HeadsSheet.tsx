import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Stickman} from './engine/Stickman';
import type {CastMember} from './story/cast';
import {gesture, idle, walk} from './kit/actions';
import {FONT} from './kit/ui';

/* Four brand-new hero concepts for the channel (whole look, not just the head). */
const C: {name: string; t: string; d: string; look: CastMember}[] = [
	{
		name: 'PENNY',
		t: 'Голова-монета',
		d: 'козырёк, жилет, бабочка',
		look: {color: '#f4f6fb', outfit: 'vest', accent: '#2f7a4f', head: 'coin', hair: 'visor', hairColor: '#3fae6f', acc: ['bowtie'], legColor: '#3a2a22', shoe: '#7a4e34', rim: '#fff0cc', rimW: 2.4},
	},
	{
		name: 'PIX',
		t: 'Квадратная голова',
		d: 'бомбер, наушники на шее',
		look: {color: '#7a5cc4', outfit: 'bomber', accent: '#ffd34a', head: 'white', skin: '#bff0dc', shape: 'square', acc: ['neckphones'], legColor: '#3a5a8a', shoe: '#f4f6fb', rim: '#e8ddff', rimW: 2.4},
	},
	{
		name: 'ROO',
		t: 'Рыжий исследователь',
		d: 'плащ, шарф, очки',
		look: {color: '#f2b21c', outfit: 'raincoat', accent: '#d23b3b', head: 'peach', hair: 'messy', hairColor: '#e4602c', acc: ['glasses', 'scarf'], legColor: '#2a2f4a', shoe: '#7a4e34', rim: '#fff0cc', rimW: 2.4},
	},
	{
		name: 'SPROUT',
		t: 'Антенна-лампочка',
		d: 'халат учёного, лампочка горит от идей',
		look: {color: '#f4f6fb', outfit: 'labcoat', accent: '#ffd34a', head: 'white', skin: '#cfe6ff', acc: ['antenna'], legColor: '#1d2a52', shoe: '#e47a3c', rim: '#e0f0ff', rimW: 2.4},
	},
];
export const HeadsSheet: React.FC = () => (
	<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #2a2f63 0%, #0b1030 80%)'}}>
		<svg viewBox="0 0 1920 1080" width={1920} height={1080}>
			{C.map((o, i) => {
				const x = 240 + i * 480;
				return (
					<g key={o.name}>
						<rect x={x - 225} y={30} width={450} height={1020} rx={30} fill="#11142c" opacity={0.55} />
						<text x={x} y={100} textAnchor="middle" fontSize={52} fontFamily={FONT} fontWeight={900} fill="#ffd34a">
							{i + 1}. {o.name}
						</text>
						<text x={x} y={146} textAnchor="middle" fontSize={30} fontFamily={FONT} fontWeight={800} fill="#fff">
							{o.t}
						</text>
						<text x={x} y={184} textAnchor="middle" fontSize={23} fontFamily={FONT} fontWeight={600} fill="#9fd8ff">
							{o.d}
						</text>
						<Stickman id={'big' + i} x={x} y={640} scale={1.5} pose={{...idle(0, i), head: -4}} {...o.look} expr="normal" mouth="smile" look={[0.2, 0]} faceTurn={0.3} t={20} />
						<Stickman id={'s1' + i} x={x - 110} y={930} scale={0.55} pose={gesture('handsOnHead', idle(0, 2), 1, 0)} {...o.look} expr="wide" mouth="open" look={[0, -0.5]} faceTurn={0.2} t={40} />
						<Stickman id={'s2' + i} x={x + 110} y={930} scale={0.55} pose={walk(1.2)} {...o.look} expr="normal" mouth="smirk" look={[0.6, 0]} faceTurn={0.5} t={60} />
					</g>
				);
			})}
		</svg>
	</AbsoluteFill>
);

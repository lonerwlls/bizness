/* Story-level settings for "What if every dollar you spent cost you one minute of your life?" */
export type CounterKeyDef = {line: string; off?: number; v: number; roll?: number};

export const START_MIN = 27860412; // ≈ 53 years of life left, in minutes

export const STORY: {
	title: string;
	hero: string;
	counter?: {label: string; color?: string; keys: CounterKeyDef[]; down?: boolean; unit?: string};
	heroAge?: (counter: number) => number;
	heroGrow?: number;
	bed: string;
	musicVolume?: number;
	endCaption?: string[];
} = {
	title: 'What if every dollar you spent cost you one minute of your life?',
	hero: 'hero',
	counter: {
		label: 'MINUTES LEFT',
		color: '#ffb547',
		down: true,
		unit: 'min',
		keys: [
			{line: '001', v: START_MIN},
			{line: '002', off: 2, v: START_MIN - 5, roll: 8},
			{line: '007', off: 4, v: START_MIN - 5 - 1500, roll: 26},
		],
	},
	bed: 'sfx/bed.wav',
};

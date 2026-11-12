/* Story-level settings for "What if every dollar you spent cost you one minute of your life?" */
export type CounterKeyDef = {line: string; off?: number; v: number; roll?: number; quiet?: boolean};

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
			// part 2: rewind, rules
			{line: '009', off: 8, v: START_MIN, roll: 40, quiet: true},
			{line: '014', off: 2, v: START_MIN - 1},
			{line: '024', off: 30, v: START_MIN - 6, roll: 6},
			{line: '024', off: 70, v: START_MIN - 1506, roll: 20},
			// part 3: groceries after putting the cheese back
			{line: '028', off: 222, v: START_MIN - 1572, roll: 10},
			// part 5: the bus ticket, then Mom's surgery
			{line: '065', off: 50, v: START_MIN - 1576, roll: 6},
			{line: '068', off: 4, v: START_MIN - 91576, roll: 70},
			// part 6: Marco's coffee
			{line: '080', off: 30, v: START_MIN - 91581, roll: 6},
		],
	},
	bed: 'sfx/bed.wav',
};

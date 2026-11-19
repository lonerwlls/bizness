/* "What if you could regrow any body part?" — the counter is how many times something regrew. */
export type CounterKeyDef = {line: string; off?: number; v: number; roll?: number; quiet?: boolean};

const num = (v: number) => Math.round(v).toLocaleString('en-US');

export const STORY: {
	title: string;
	hero: string;
	counter?: {label: string; color?: string; keys: CounterKeyDef[]; down?: boolean; unit?: string; fmt?: (v: number) => string; fmtDelta?: (d: number) => string};
	heroAge?: (counter: number) => number;
	heroGrow?: number;
	bed: string;
	musicVolume?: number;
	endCaption?: string[];
} = {
	title: 'What if you could regrow any body part?',
	hero: 'hero',
	counter: {
		label: 'REGROWN',
		color: '#7af0a8',
		fmt: num,
		fmtDelta: (d) => `${d > 0 ? '+' : '−'}${num(Math.abs(d))}`,
		keys: [
			{line: '001', v: 0},
			{line: '004', off: 96, v: 1, roll: 1},
			{line: '013', off: 172, v: 2, roll: 1},
			{line: '019', off: 178, v: 3, roll: 1},
			{line: '025', off: 58, v: 4, roll: 1},
			{line: '025', off: 96, v: 5, roll: 1},
			{line: '025', off: 170, v: 13, roll: 30},
			{line: '026', off: 120, v: 14, roll: 1},
			{line: '027', off: 40, v: 25, roll: 40},
			{line: '031', off: 60, v: 34, roll: 30},
			{line: '038', off: 30, v: 41, roll: 30},
		],
	},
	bed: 'sfx/bed.wav',
};

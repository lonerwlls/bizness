/* "What if every hour on your phone aged you one day?" — the counter is the hero's BODY AGE in days. */
export type CounterKeyDef = {line: string; off?: number; v: number; roll?: number; quiet?: boolean};

const Y = 365;
export const COLD = 31 * Y + 40; // body age in the cold open: 31 y 40 d
export const B16 = 16 * Y; // sixteenth birthday

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
	title: 'What if every hour on your phone aged you one day?',
	hero: 'hero',
	counter: {
		label: 'BODY AGE',
		color: '#ffb547',
		fmt: (v) => `${Math.floor(v / Y)}y ${Math.floor(v % Y)}d`,
		fmtDelta: (d) => (Math.abs(d) >= Y ? `${d > 0 ? '+' : '−'}${(Math.abs(d) / Y).toFixed(1)} years` : `${d > 0 ? '+' : '−'}${Math.abs(d)} day${Math.abs(d) === 1 ? '' : 's'}`),
		keys: [
			{line: '001', v: COLD},
			// rewind to the sixteenth birthday
			{line: '009', off: 8, v: B16, roll: 40, quiet: true},
			{line: '011', off: 30, v: B16 + 5, roll: 8},
			{line: '013', off: 4, v: B16 + 25, roll: 8},
			// the first months: ten hours a day
			{line: '020', off: 20, v: B16 + 1225, roll: 60},
			{line: '023', off: 4, v: 26 * Y + 10, roll: 30},
			{line: '028', off: 70, v: 26 * Y + 14, roll: 8},
			{line: '035', off: 30, v: COLD, roll: 30},
			// two days for the night on the mountain
			{line: '060', off: 40, v: COLD + 2, roll: 8},
		],
	},
	heroAge: (v) => Math.max(0, Math.min(1, (v / Y - 16) / 20)),
	heroGrow: 0.04,
	bed: 'sfx/bed.wav',
};

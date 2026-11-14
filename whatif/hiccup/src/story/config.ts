/* "What if you hiccuped for 68 years?" — the counter is the hero's lifetime HICCUPS. */
export type CounterKeyDef = {line: string; off?: number; v: number; roll?: number; quiet?: boolean};

export const COLD = 423_906_512; // at ninety-five, on the TV show
export const FINAL = 430_118_204; // the morning they stop
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
	title: 'What if you hiccuped for 68 years?',
	hero: 'hero',
	counter: {
		label: 'HICCUPS',
		color: '#ffd34a',
		fmt: num,
		fmtDelta: (d) => `${d > 0 ? '+' : '−'}${num(Math.abs(d))}`,
		keys: [
			{line: '001', v: COLD},
			{line: '003', off: 70, v: COLD + 1, roll: 4},
			{line: '005', off: 4, v: COLD + 3, roll: 20},
			// rewind: the night shift, before the first one
			{line: '009', off: 8, v: 0, roll: 1, quiet: true},
			{line: '012', off: 108, v: 1, roll: 2},
			{line: '017', off: 10, v: 1_960, roll: 40},
			{line: '019', off: 60, v: 38_400, roll: 40},
			{line: '020', off: 20, v: 112_000, roll: 40},
			{line: '021', off: 10, v: 1_710_000, roll: 50},
			{line: '025', off: 10, v: 3_400_000, roll: 50},
			{line: '031', off: 60, v: 52_000_000, roll: 60},
			{line: '036', off: 40, v: 61_000_000, roll: 40},
			{line: '040', off: 10, v: 98_000_000, roll: 50},
			{line: '042', off: 10, v: 190_000_000, roll: 80},
			{line: '043', off: 10, v: 262_000_000, roll: 60},
			{line: '044', off: 10, v: 330_000_000, roll: 60},
			{line: '048', off: 10, v: COLD + 3, roll: 60},
			{line: '049', off: 20, v: FINAL, roll: 40},
		],
	},
	heroAge: (v) => Math.max(0, Math.min(1, v / FINAL)),
	heroGrow: 0.02,
	bed: 'sfx/bed.wav',
};

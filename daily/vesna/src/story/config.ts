/* Daily short: the stewardess who fell 10,160 m. The counter is the ALTITUDE of the wreck. */
export type CounterKeyDef = {line: string; off?: number; v: number; roll?: number; quiet?: boolean};
const m = (v: number) => `${Math.round(v).toLocaleString('en-US')} m`;

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
	title: 'She fell 10 km without a parachute',
	hero: 'vesna',
	counter: {
		label: 'ALTITUDE',
		color: '#9fd8ff',
		down: true,
		fmt: m,
		fmtDelta: (d) => m(d),
		keys: [
			{line: '001', v: 10160},
			{line: '001', off: 6, v: 7200, roll: 100, quiet: true},
			{line: '002', off: 0, v: 10160, roll: 1, quiet: true},
			{line: '004', off: 40, v: 3100, roll: 120, quiet: true},
			{line: '005', off: 4, v: 0, roll: 30, quiet: true},
		],
	},
	bed: 'sfx/bed.wav',
};

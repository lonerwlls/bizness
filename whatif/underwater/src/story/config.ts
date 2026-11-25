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
	title: 'What if you lived underwater for 30 days?',
	hero: 'hero',
	bed: 'sfx/bed.wav',
};

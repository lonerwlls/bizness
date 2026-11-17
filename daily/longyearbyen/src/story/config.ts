/* Daily short: Longyearbyen — the town where you "can't die". No counter. */
export type CounterKeyDef = {line: string; off?: number; v: number; roll?: number; quiet?: boolean};

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
	title: "The town where you can't die",
	hero: 'hero',
	bed: 'sfx/bed.wav',
};

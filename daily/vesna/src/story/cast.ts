import type {Base} from '../kit/actions';

/* Cast of the Vesna Vulović short. Doctor ROO (channel hero) is her doctor. */
export type CastMember = Base & {sp?: string};

export const CAST: Record<string, CastMember> = {
	vesna: {color: '#2a3f7a', outfit: 'suit', head: 'peach', skin: '#f2d0b5', hair: 'bun', hairColor: '#4a2a18', rim: '#e0ecff', rimW: 2.4, shoe: '#1b1a26', legColor: '#e8c0a0'},
	doc: {color: '#eef2f8', outfit: 'labcoat', accent: '#d23b3b', head: 'peach', hair: 'messy', hairColor: '#e4602c', acc: ['glasses', 'scarf', 'stethoscope'], legColor: '#2a2f4a', shoe: '#7a4e34', rim: '#fff0cc', rimW: 2.4},
	bruno: {color: '#6a5a3a', outfit: 'coat', head: 'peach', skin: '#e8c8a0', hair: 'cap', hairColor: '#3a3a44', acc: ['mustache'], rim: '#fff4e0', rimW: 2.4, shoe: '#2a1a12', legColor: '#3a3a44'},
};

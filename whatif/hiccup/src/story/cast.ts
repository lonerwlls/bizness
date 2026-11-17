import type {Base} from '../kit/actions';

/* Cast of "What if you hiccuped for 68 years?".
   Hero = Doctor ROO: messy ginger hair, round glasses, red scarf — now in a white lab coat
   with a stethoscope. Nobody else wears a white coat or has ginger hair. */
export type CastMember = Base & {sp?: string};

export const CAST: Record<string, CastMember> = {
	hero: {color: '#eef2f8', outfit: 'labcoat', accent: '#d23b3b', head: 'peach', hair: 'messy', hairColor: '#e4602c', acc: ['glasses', 'scarf', 'stethoscope'], legColor: '#2a2f4a', shoe: '#7a4e34', rim: '#fff0cc', rimW: 2.4},
	host: {color: '#2d3a6a', outfit: 'suit', head: 'peach', skin: '#c98a5a', hair: 'short', hairColor: '#1d1d24', rim: '#e0ecff', rimW: 2.4, shoe: '#111', legColor: '#1d2236'},
	patient: {color: '#8fc1e3', outfit: 'gown', head: 'peach', skin: '#e8b48a', hair: 'none', rim: '#e0f2ff', rimW: 2.4, shoe: '#e8e8f0', legColor: '#e8b48a'},
	nurse: {color: '#2fa39a', outfit: 'tee', head: 'peach', skin: '#a86b45', hair: 'bun', hairColor: '#2a1a12', rim: '#dafff8', rimW: 2.4, shoe: '#f4f6fb', legColor: '#2fa39a'},
	colleague: {color: '#5c9a5a', outfit: 'tee', head: 'peach', skin: '#f2d0b5', hair: 'cap', hairColor: '#5c9a5a', acc: ['mustache'], rim: '#e6ffe6', rimW: 2.4, shoe: '#f4f6fb', legColor: '#5c9a5a'},
	wife: {color: '#7a5cc4', outfit: 'dress', accent: '#f2b8d0', head: 'peach', skin: '#f2d0b5', hair: 'bob', hairColor: '#3a2418', acc: ['lashes'], rim: '#efe2ff', rimW: 2.4, shoe: '#3a2a22', legColor: '#f2d0b5'},
	date: {color: '#e0607a', outfit: 'dress', accent: '#ffd0dc', head: 'peach', skin: '#e8b48a', hair: 'ponytail', hairColor: '#3a2418', acc: ['lashes'], rim: '#ffe0ea', rimW: 2.4, shoe: '#f4f6fb', legColor: '#e8b48a'},
	clinic: {color: '#3d6fd6', outfit: 'tee', head: 'peach', skin: '#c98a5a', hair: 'grey', hairColor: '#d9d9e0', acc: ['mustache'], rim: '#e0ecff', rimW: 2.4, shoe: '#111', legColor: '#3d6fd6'},
	farmer: {color: '#8a6a4a', outfit: 'vest', accent: '#5a3a22', head: 'peach', skin: '#e8c8a0', hair: 'cap', hairColor: '#5a4a3a', acc: ['mustache'], rim: '#f6e6c8', rimW: 2.4, shoe: '#3a2a1a', legColor: '#4a3a2a'},
	olddoc: {color: '#2a2a34', outfit: 'suit', head: 'peach', skin: '#f2d0b5', hair: 'grey', hairColor: '#e0e0e8', acc: ['mustache'], rim: '#f6e6c8', rimW: 2.4, shoe: '#1b1208', legColor: '#2a2a34'},
	oldman: {color: '#8fc1e3', outfit: 'gown', head: 'peach', skin: '#e8c0a0', hair: 'grey', hairColor: '#d9d9e0', acc: ['mustache'], rim: '#e0f2ff', rimW: 2.4, shoe: '#e8e8f0', legColor: '#e8c0a0'},
	researcher: {color: '#4a6ad8', outfit: 'dress', accent: '#9fd8ff', head: 'peach', skin: '#c98a5a', hair: 'ponytail', hairColor: '#1d1d24', acc: ['lashes'], rim: '#e0ecff', rimW: 2.4, shoe: '#2a2a34', legColor: '#c98a5a'},
	friend40: {color: '#6a7a8a', outfit: 'vest', accent: '#3a4a5a', head: 'peach', skin: '#e8c0a0', hair: 'cap', hairColor: '#4a3a2a', rim: '#f6e6c8', rimW: 2.4, shoe: '#2a1a12', legColor: '#4a4a58'},
	kid1: {color: '#3aa37a', head: 'peach', skin: '#f2d0b5', hair: 'short', hairColor: '#3a2418', rim: '#e8fff2', rimW: 2.4, shoe: '#f4f6fb'},
	kid2: {color: '#e47a3c', head: 'peach', skin: '#f2d0b5', hair: 'ponytail', hairColor: '#3a2418', rim: '#fff0e0', rimW: 2.4, shoe: '#f4f6fb'},
};

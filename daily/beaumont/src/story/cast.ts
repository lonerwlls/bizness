import type {Base} from '../kit/actions';

/* Cast of "What if you could regrow any body part?".
   Hero = Doctor ROO: messy ginger hair, round glasses, red scarf, white lab coat, stethoscope.
   Nobody else wears a white coat or has ginger hair. Dr. Reyes = navy scrubs, black ponytail;
   the night nurse = teal scrubs, bun; Morgan (1898) = brown suit, moustache. */
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
	youngdoc: {color: '#5a6ad8', outfit: 'tee', head: 'peach', skin: '#a86b45', hair: 'short', hairColor: '#1d1d24', rim: '#e0ecff', rimW: 2.4, shoe: '#f4f6fb', legColor: '#5a6ad8'},
	teen: {color: '#6a6a7a', outfit: 'hoodie', head: 'peach', skin: '#f2d0b5', hair: 'spiky', hairColor: '#2a1a12', rim: '#e0ecff', rimW: 2.4, shoe: '#f4f6fb', legColor: '#2a2f4a'},
	reyes: {color: '#3d5fb0', outfit: 'tee', head: 'peach', skin: '#b97a52', hair: 'ponytail', hairColor: '#1d1d24', acc: ['lashes'], rim: '#e0ecff', rimW: 2.4, shoe: '#f4f6fb', legColor: '#3d5fb0'},
	morgan: {color: '#5a4030', outfit: 'suit', head: 'peach', skin: '#f2d0b5', hair: 'short', hairColor: '#3a2418', acc: ['mustache'], rim: '#f6e6c8', rimW: 2.4, shoe: '#1b1208', legColor: '#4a3428'},
	illingworth: {color: '#4a7a5a', outfit: 'dress', accent: '#e8d8b0', head: 'peach', skin: '#f2d0b5', hair: 'bob', hairColor: '#c8c8d0', acc: ['glasses', 'lashes'], rim: '#f6e6c8', rimW: 2.4, shoe: '#3a2a22', legColor: '#f2d0b5'},
	boy74: {color: '#d86a2a', outfit: 'tee', head: 'peach', skin: '#f2d0b5', hair: 'short', hairColor: '#8a5a2a', rim: '#fff0e0', rimW: 2.4, shoe: '#3a2a22', legColor: '#3a5a8a'},
	kyodoc: {color: '#2d3a6a', outfit: 'vest', accent: '#e8ecf2', head: 'peach', skin: '#f0d4b4', hair: 'short', hairColor: '#15151c', acc: ['glasses'], rim: '#e0ecff', rimW: 2.4, shoe: '#1d1d24', legColor: '#2d3a6a'},
	kyopat: {color: '#7a8aa8', outfit: 'tee', head: 'peach', skin: '#e8c4a0', hair: 'grey', hairColor: '#d0d0d8', rim: '#e0ecff', rimW: 2.4, shoe: '#3a2a22', legColor: '#3a3a4a'},
	suitman: {color: '#1d1d24', outfit: 'suit', accent: '#d4a83a', head: 'peach', skin: '#e8c4a0', hair: 'short', hairColor: '#d8d8e0', acc: ['bowtie'], rim: '#f6e6c8', rimW: 2.4, shoe: '#111', legColor: '#1d1d24'},
	lily: {color: '#9a6ad0', outfit: 'tee', head: 'peach', skin: '#f2d0b5', hair: 'ponytail', hairColor: '#6a3a1a', acc: ['lashes'], rim: '#f0e0ff', rimW: 2.4, shoe: '#f4f6fb', legColor: '#9a6ad0'},
	medic: {color: '#2a5a4a', outfit: 'vest', accent: '#d8e830', head: 'peach', skin: '#a86b45', hair: 'short', hairColor: '#1d1d24', rim: '#e0fff0', rimW: 2.4, shoe: '#1d1d24', legColor: '#1d2a2a'},
	warren: {color: '#8a6a4a', outfit: 'vest', accent: '#d8c8a8', head: 'peach', skin: '#f2d0b5', hair: 'grey', hairColor: '#d8d8e0', acc: ['glasses', 'mustache'], rim: '#f6e6c8', rimW: 2.4, shoe: '#3a2a1a', legColor: '#4a4a58'},
	mom84: {color: '#b88ad0', outfit: 'dress', accent: '#f4e0f4', head: 'peach', skin: '#f2d0b5', hair: 'bun', hairColor: '#c8c8d0', acc: ['glasses', 'lashes'], rim: '#f6e6f6', rimW: 2.4, shoe: '#3a2a22', legColor: '#f2d0b5'},
	expertA: {color: '#3a3a4a', outfit: 'suit', head: 'peach', skin: '#e8c4a0', hair: 'grey', hairColor: '#b8b8c0', acc: ['mustache'], rim: '#e0e0ec', rimW: 2.4, shoe: '#111', legColor: '#3a3a4a'},
	expertB: {color: '#4a3a2a', outfit: 'suit', head: 'peach', skin: '#c98a5a', hair: 'short', hairColor: '#1d1d24', acc: ['glasses'], rim: '#f6e6c8', rimW: 2.4, shoe: '#111', legColor: '#4a3a2a'},
	stmartin: {color: '#3a6ab0', outfit: 'tee', accent: '#c83a3a', head: 'peach', skin: '#e8c4a0', hair: 'beanie', hairColor: '#c83a3a', rim: '#e0ecff', rimW: 2.4, shoe: '#5a3a22', legColor: '#5a4a3a'},
	trader: {color: '#7a5a3a', outfit: 'vest', accent: '#e8d8a8', head: 'peach', skin: '#d8a880', hair: 'cap', hairColor: '#4a3a2a', acc: ['mustache'], rim: '#f6e6c8', rimW: 2.4, shoe: '#3a2a1a', legColor: '#3a3a4a'},
	son: {color: '#5a7a4a', outfit: 'vest', accent: '#3a4a2a', head: 'peach', skin: '#e8c4a0', hair: 'short', hairColor: '#3a2418', rim: '#e6ffe6', rimW: 2.4, shoe: '#2a1a12', legColor: '#3a3a4a'},
	kid1: {color: '#3aa37a', head: 'peach', skin: '#f2d0b5', hair: 'short', hairColor: '#3a2418', rim: '#e8fff2', rimW: 2.4, shoe: '#f4f6fb'},
	kid2: {color: '#e47a3c', head: 'peach', skin: '#f2d0b5', hair: 'ponytail', hairColor: '#3a2418', rim: '#fff0e0', rimW: 2.4, shoe: '#f4f6fb'},
};

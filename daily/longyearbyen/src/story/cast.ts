import type {Base} from '../kit/actions';

/* Cast of the Longyearbyen short. Hero = ROO (yellow raincoat, red scarf, ginger hair, glasses). */
export type CastMember = Base & {sp?: string};

export const CAST: Record<string, CastMember> = {
	hero: {color: '#f2b21c', outfit: 'raincoat', accent: '#d23b3b', head: 'peach', hair: 'messy', hairColor: '#e4602c', acc: ['glasses', 'scarf'], legColor: '#2a2f4a', shoe: '#7a4e34', rim: '#fff0cc', rimW: 2.4},
	mom: {color: '#3aa37a', outfit: 'dress', accent: '#f2b8d0', head: 'peach', skin: '#e8b48a', hair: 'bob', hairColor: '#3a2418', acc: ['lashes', 'belly'], rim: '#e8fff2', rimW: 2.4, shoe: '#3a2a22', legColor: '#2a2f4a'},
	sci: {color: '#e8eef4', outfit: 'raincoat', accent: '#3d6fd6', head: 'peach', skin: '#f2d0b5', hair: 'cap', hairColor: '#3d6fd6', rim: '#e0ecff', rimW: 2.4, shoe: '#2a2a34', legColor: '#d8e0ea'},
};

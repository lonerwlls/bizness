import type {Base} from '../kit/actions';

/* Cast of "What if every hour on your phone aged you one day?".
   Hero = ROO, the channel hero: messy ginger hair, round glasses, yellow raincoat, red scarf.
   Nobody else wears yellow or has ginger hair, so ROO is found in any crowd. */
export type CastMember = Base & {sp?: string};

export const CAST: Record<string, CastMember> = {
	hero: {color: '#f2b21c', outfit: 'raincoat', accent: '#d23b3b', head: 'peach', hair: 'messy', hairColor: '#e4602c', acc: ['glasses', 'scarf'], legColor: '#2a2f4a', shoe: '#7a4e34', rim: '#fff0cc', rimW: 2.4},
	kai: {color: '#4f7dd8', head: 'peach', skin: '#a86b45', hair: 'short', rim: '#e0ecff', rimW: 2.4, shoe: '#f2f2f2', legColor: '#1d2236'},
	guard: {color: '#3a4256', outfit: 'suit', head: 'peach', skin: '#c98a5a', hair: 'cap', hairColor: '#28304a', acc: ['mustache'], rim: '#e6ecff', rimW: 2.4, shoe: '#111'},
	grandma: {color: '#7a5cc4', outfit: 'coat', head: 'peach', skin: '#f2d0b5', hair: 'grey', hairColor: '#e6e6ee', acc: ['glasses'], rim: '#efe2ff', rimW: 2.4, shoe: '#3a2a22', legColor: '#2a2440'},
	nora: {color: '#e0607a', head: 'peach', skin: '#e8b48a', hair: 'ponytail', hairColor: '#3a2418', rim: '#ffe0ea', rimW: 2.4, shoe: '#f4f6fb'},
	waiter: {color: '#2a2f3a', outfit: 'apron', head: 'peach', skin: '#f6d7bd', hair: 'short', rim: '#e8e8f0', rimW: 2.4, shoe: '#111'},
	mom: {color: '#3aa37a', head: 'peach', skin: '#f2c9a5', hair: 'bob', rim: '#e8fff2', rimW: 2.4, shoe: '#2c2540'},
	rescuer: {color: '#d23b3b', outfit: 'coat', head: 'peach', skin: '#c98a5a', hair: 'cap', hairColor: '#1d2236', rim: '#ffe0e0', rimW: 2.4, shoe: '#111'},
};

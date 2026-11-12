import type {Base} from '../kit/actions';

/* Characters of "What if every dollar cost you a minute of your life?".
   The hero is our channel hero: orange jacket, dark beanie with a white pom-pom, white sneakers. */
export type CastMember = Base & {sp?: string};

export const CAST: Record<string, CastMember> = {
	hero: {color: '#e47a3c', hair: 'beanie', hairColor: '#2f3d63', rim: '#ffe2c8', rimW: 2.4, shoe: '#eef1f6', legColor: '#1d2236'},
	barista: {color: '#3aa37a', outfit: 'apron', hair: 'bun', rim: '#e8fff2', rimW: 2.4, shoe: '#1d2b24'},
	friend: {color: '#4f7dd8', hair: 'cap', hairColor: '#d94a3a', rim: '#e0ecff', rimW: 2.4, shoe: '#f2f2f2'},
	clerk: {color: '#c95ab0', outfit: 'apron', hair: 'short', rim: '#ffe0f2', rimW: 2.4, shoe: '#2b1d24'},
	date: {color: '#e0607a', hair: 'ponytail', hairColor: '#6a3a22', rim: '#ffe0ea', rimW: 2.4, shoe: '#f2c84c'},
	cleaner: {color: '#3aa37a', outfit: 'apron', hair: 'cap', hairColor: '#2f6fd8', rim: '#e8fff2', rimW: 2.4, shoe: '#1d2b24'},
	mom: {color: '#7a5cc4', hair: 'bob', rim: '#ffe6c8', rimW: 2.4, shoe: '#2c2540'},
};

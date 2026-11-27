import type {Recipe} from './Toon';

/* Recipes of "The Great Impostor". One recipe = one look in every shot; an outfit change keeps
   skin, hair, face, girth and seed and swaps only the clothes. */
const FRED_BASE = {skin: '#f1d2b0', hair: 'slick' as const, hairColor: '#3a2a20', girth: 1.22, seed: 11};
export const CAST: Record<string, Recipe> = {
	mary: {skin: '#f1d0ae', hair: 'bun', hairColor: '#6a4030', body: '#4a5a7a', outfit: 'dress', skirt: '#3a4a68', apron: '#f6f3ea', hat: 'mob', lashes: true, girth: 1.15, seed: 301},
	maryOld: {skin: '#f1d0ae', hair: 'bun', hairColor: '#a8a2a0', body: '#4a5a7a', outfit: 'dress', skirt: '#3a4a68', apron: '#f6f3ea', hat: 'mob', lashes: true, girth: 1.2, seed: 301},
	soper: {skin: '#efcfae', hair: 'side', hairColor: '#5a4a3a', body: '#6a5440', shirt: '#f4f1ea', tie: '#2a3a5a', outfit: 'suit', mustache: '#5a4a3a', hat: 'bowler', hatColor: '#3a3030', seed: 311},
	soperBare: {skin: '#efcfae', hair: 'side', hairColor: '#5a4a3a', body: '#6a5440', shirt: '#f4f1ea', tie: '#2a3a5a', outfit: 'suit', mustache: '#5a4a3a', seed: 311},
	banker: {skin: '#f0d2b4', hair: 'side', hairColor: '#8a8a90', body: '#2a2a34', shirt: '#f4f1ea', tie: '#7a2a2a', outfit: 'suit', mustache: '#8a8a90', girth: 1.3, seed: 321},
	wife: {skin: '#f4dcc4', hair: 'bun', hairColor: '#c89a5a', body: '#b86a7a', outfit: 'dress', skirt: '#a85a6a', lashes: true, seed: 322},
	girl: {skin: '#f4dcc4', hair: 'bun', hairColor: '#c89a5a', body: '#7aa0c8', outfit: 'dress', skirt: '#6a90b8', lashes: true, height: 0.82, girth: 0.9, seed: 323},
	cop: {skin: '#ecc9a4', hair: 'crew', hairColor: '#4a3a2a', body: '#1f2a4a', shirt: '#1f2a4a', outfit: 'uniform', hat: 'helmet', hatColor: '#1f2a4a', mustache: '#4a3a2a', girth: 1.2, seed: 331},
	cop2: {skin: '#d9a87e', hair: 'crew', hairColor: '#1a1a1e', body: '#1f2a4a', shirt: '#1f2a4a', outfit: 'uniform', hat: 'helmet', hatColor: '#1f2a4a', seed: 332},
	labdoc: {skin: '#efcfae', hair: 'side', hairColor: '#3a3a40', body: '#f2f2ee', shirt: '#cfe0f0', tie: '#3a3a6a', outfit: 'coat', glasses: true, beard: '#3a3a40', seed: 341},
	nurse: {skin: '#f4dcc4', hair: 'bun', hairColor: '#4a3020', body: '#f4f4f0', outfit: 'dress', skirt: '#e8e8e4', hat: 'mob', lashes: true, seed: 351},
	nurse2: {skin: '#d9a87e', hair: 'bun', hairColor: '#1a1a1e', body: '#f4f4f0', outfit: 'dress', skirt: '#e8e8e4', hat: 'mob', lashes: true, seed: 352},
};

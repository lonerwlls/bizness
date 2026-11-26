import type {Recipe} from './Toon';

/* Recipes of "The Great Impostor". One recipe = one look in every shot; an outfit change keeps
   skin, hair, face, girth and seed and swaps only the clothes. */
const FRED_BASE = {skin: '#f1d2b0', hair: 'slick' as const, hairColor: '#3a2a20', girth: 1.22, seed: 11};
export const CAST: Record<string, Recipe> = {
	fredNavy: {...FRED_BASE, body: '#1f2a44', shirt: '#f4f1ea', tie: '#1a1a1e', outfit: 'uniform', hat: 'navycap', stripes: 2},
	fredBare: {...FRED_BASE, body: '#1f2a44', shirt: '#f4f1ea', tie: '#1a1a1e', outfit: 'uniform', stripes: 2},
	fredSurg: {...FRED_BASE, body: '#5f9a86', outfit: 'scrubs'},
	fredMonk: {...FRED_BASE, body: '#6b4a32', outfit: 'robe'},
	fredProf: {...FRED_BASE, body: '#7a5f44', shirt: '#f4f1ea', tie: '#8a2a2a', outfit: 'suit', glasses: true},
	fredSuit: {...FRED_BASE, body: '#3d4250', shirt: '#f4f1ea', tie: '#2f5a8a', outfit: 'suit', hat: 'fedora', hatColor: '#4a4038'},
	fredBoy: {skin: '#f1d2b0', hair: 'slick', hairColor: '#3a2a20', body: '#7a8a5a', outfit: 'shirt', girth: 0.95, height: 0.85, seed: 11},
	fredChap: {...FRED_BASE, body: '#22222a', shirt: '#f4f1ea', outfit: 'suit', girth: 1.4, hairColor: '#9a9aa4'},
	fredArmy: {...FRED_BASE, body: '#6a6e44', shirt: '#cfc8a0', tie: '#4a4a30', outfit: 'uniform'},
	fredSailor: {...FRED_BASE, body: '#24346a', outfit: 'shirt', hat: 'sailor'},
	officerUS: {skin: '#ecc9a4', hair: 'crew', hairColor: '#6a5a4a', body: '#1d2236', shirt: '#f4f1ea', tie: '#1a1a1e', outfit: 'uniform', hat: 'navycap', stripes: 3, seed: 101},
	fredPrison: {...FRED_BASE, body: '#c8c8c0', outfit: 'prison'},
	agentA: {skin: '#ecc9a4', hair: 'crew', hairColor: '#2a2420', body: '#2a2d36', shirt: '#f4f1ea', tie: '#1a1a1e', outfit: 'suit', hat: 'fedora', hatColor: '#2a2d36', seed: 111},
	agentB: {skin: '#d9a87e', hair: 'crew', hairColor: '#1a1a1e', body: '#3a3d46', shirt: '#f4f1ea', tie: '#5a1a1e', outfit: 'suit', hat: 'fedora', hatColor: '#3a3d46', mustache: '#1a1a1e', seed: 112},
	brotherA: {skin: '#f0d0ae', hair: 'tonsure', hairColor: '#c89a5a', body: '#2a2630', outfit: 'robe', seed: 121},
	brotherB: {skin: '#d9a87e', hair: 'tonsure', hairColor: '#1a1a1e', body: '#2a2630', outfit: 'robe', seed: 122},
	docNavy: {skin: '#efcfae', hair: 'side', hairColor: '#8a7a6a', body: '#f2f2ee', shirt: '#cfe0f0', tie: '#2a3a6a', outfit: 'coat', glasses: true, mustache: '#8a7a6a', seed: 131},
	sailor3: {skin: '#f0d0ae', hair: 'crew', hairColor: '#d8b060', body: '#24346a', outfit: 'shirt', hat: 'sailor', seed: 53},
	sailor4: {skin: '#b98a64', hair: 'crew', hairColor: '#2a2420', body: '#24346a', outfit: 'shirt', hat: 'sailor', seed: 54},
	soldier2: {skin: '#e4c098', hair: 'crew', hairColor: '#1a1a1e', body: '#5a5a3e', outfit: 'shirt', seed: 62},
	captain: {skin: '#efcfae', hair: 'side', hairColor: '#b8b8c0', body: '#1f2a44', shirt: '#f4f1ea', tie: '#1a1a1e', outfit: 'uniform', hat: 'navycap', stripes: 3, mustache: '#c8c8d0', seed: 21},
	cyr: {skin: '#f4d8bc', hair: 'crew', hairColor: '#2a2420', body: '#f2f2ee', shirt: '#cfe0f0', tie: '#3a5a8a', outfit: 'coat', glasses: true, girth: 0.92, seed: 31},
	recruiter: {skin: '#f0d0ae', hair: 'crew', hairColor: '#d8b060', body: '#1f2a44', shirt: '#f4f1ea', tie: '#1a1a1e', outfit: 'uniform', stripes: 1, seed: 41},
	sailor: {skin: '#e8c29a', hair: 'crew', hairColor: '#4a3020', body: '#24346a', outfit: 'shirt', hat: 'sailor', seed: 51},
	sailor2: {skin: '#c99a72', hair: 'crew', hairColor: '#1a1a1e', body: '#24346a', outfit: 'shirt', hat: 'sailor', seed: 52},
	soldier: {skin: '#e4c098', hair: 'crew', hairColor: '#1a1a1e', body: '#6a6a48', outfit: 'shirt', seed: 61},
	con: {skin: '#e8c4a0', hair: 'bald', hairColor: '#000', body: '#c8c8c0', outfit: 'prison', beard: '#5a4a3a', seed: 71},
	father: {skin: '#efcfae', hair: 'side', hairColor: '#4a3a2a', body: '#5a4a3a', shirt: '#f4f1ea', tie: '#6a2a2a', outfit: 'suit', mustache: '#4a3a2a', seed: 81},
	monk: {skin: '#efcfae', hair: 'tonsure', hairColor: '#8a8a90', body: '#6b4a32', outfit: 'robe', glasses: true, seed: 91},
};

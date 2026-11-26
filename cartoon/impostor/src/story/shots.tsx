import type {ShotDef} from '../kit/coverage';
import {SHOTS_C1} from './partC1';
import {SHOTS_C2} from './partC2';
import {SHOTS_C3} from './partC3';
import {SHOTS_C4} from './partC4';
import {SHOTS_C5} from './partC5';
import {SHOTS_C6} from './partC6';

/* "The Great Impostor" — all shots, part by part. */
export const SHOTS: ShotDef[] = [...SHOTS_C1, ...SHOTS_C2, ...SHOTS_C3, ...SHOTS_C4, ...SHOTS_C5, ...SHOTS_C6];

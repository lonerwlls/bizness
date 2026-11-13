import type {ShotDef} from '../kit/coverage';
import {SHOTS_A} from './partA';
import {SHOTS_B} from './partB';
import {SHOTS_C} from './partC';

/* "What if every hour on your phone aged you one day?" — all shots, part by part. */
export const SHOTS: ShotDef[] = [...SHOTS_A, ...SHOTS_B, ...SHOTS_C];

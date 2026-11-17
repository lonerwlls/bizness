import type {ShotDef} from '../kit/coverage';
import {SHOTS_A} from './partA';
import {SHOTS_B} from './partB';
import {SHOTS_C} from './partC';
import {SHOTS_D} from './partD';

/* "What if you hiccuped for 68 years?" — all shots, part by part. */
export const SHOTS: ShotDef[] = [...SHOTS_A, ...SHOTS_B, ...SHOTS_C, ...SHOTS_D];

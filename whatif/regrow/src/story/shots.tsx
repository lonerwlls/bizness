import type {ShotDef} from '../kit/coverage';
import {SHOTS_R1} from './partR1';
import {SHOTS_R2} from './partR2';
import {SHOTS_R3} from './partR3';

/* "What if you could regrow any body part?" — all shots, part by part. */
export const SHOTS: ShotDef[] = [...SHOTS_R1, ...SHOTS_R2, ...SHOTS_R3];

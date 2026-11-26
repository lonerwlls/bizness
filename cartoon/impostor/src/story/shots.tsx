import type {ShotDef} from '../kit/coverage';
import {SHOTS_C1} from './partC1';
import {SHOTS_C2} from './partC2';

/* "The Great Impostor" — all shots, part by part. */
export const SHOTS: ShotDef[] = [...SHOTS_C1, ...SHOTS_C2];

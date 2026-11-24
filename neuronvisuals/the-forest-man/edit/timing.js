// «The Forest Man» — тайминги (кадры, 30 fps). ≈31,5 с, петля.
export const FPS = 30;
export const N = 945;
export const DUR = N / FPS;
export const RMAX = 12.5;                       // радиус леса в конце (м)
export const YEARK = [[0, 1], [150, 1], [300, 8], [450, 20], [600, 36], [615, 38], [645, 39], [675, 40]];
export const FIRST = [110, 150];                // первое дерево в центре
export const TURN = 675;
export const PULL = [735, 785];
export const FACT = [785, 885];
export const REW = [885, 925];
export const PUSH = [925, 945];
export const CAPS = [[0, "A BARE SANDBAR. NOTHING GROWS."], [100, "HE PLANTS ONE TREE."], [190, "“POINTLESS,” THEY SAID."], [300, "HE PLANTED ANOTHER. AND ANOTHER."], [440, "EVERY DAY. FOR YEARS."]];
export const CAP_END = 608;
export const AFTER_CAP = [700, 735, "THEY CAME BACK TO SEE IT."];
export const BIG = [[615, "YEAR 38"], [645, "YEAR 39"], [675, "YEAR 40"]];
// сомневающиеся: угол на острове, радиус; уходят в 200, возвращаются в 690
export const DOUBT = [{ phi: 0.6, r: 5.7 }, { phi: 0.75, r: 6.0 }];
export const DLEAVE = 200, DBACK = 688;
export const SHOTS = [[0, 0, "hero"], [62, 22, "low"], [122, 22, "wide"], [180, 22, "doubt"], [262, 24, "hero"], [330, 24, "wide"], [400, 24, "low"], [470, 24, "hero"], [540, 26, "wide"], [600, 22, "hero"], [652, 24, "wide"], [690, 24, "doubt"], [722, 26, "top2"]];
const io = (t) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t));
export function sceneTime(F) {
  if (F <= REW[0]) return F;
  if (F < REW[1]) { const t = (F - REW[0]) / (REW[1] - REW[0]); return Math.round(REW[0] + (-(PUSH[1] - PUSH[0]) - REW[0]) * io(t)); }
  return F - N;
}
export const S0 = -(PUSH[1] - PUSH[0]) - 40, S1 = N + 40;
export function yearF(s) { if (s <= YEARK[0][0]) return 1; for (let i = 0; i + 1 < YEARK.length; i++) { const [a, ya] = YEARK[i], [b, yb] = YEARK[i + 1]; if (s <= b) return ya + (yb - ya) * (s - a) / (b - a); } return 40; }
export const yearAt = (s) => Math.max(1, Math.min(40, Math.floor(yearF(s) + 1e-6)));
const sst = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
// радиус леса: первое дерево, потом площадь растёт с годами
export function forestR(s) { const r0 = 0.9 * sst(FIRST[0], FIRST[1], s); const y = yearF(s); return Math.max(r0, RMAX * Math.sqrt(Math.max(0, (y - 1) / 39)) * sst(150, 200, s) + r0 * (1 - sst(150, 200, s))); }
export const acresAt = (s) => (s < FIRST[0] ? 0 : Math.round(1360 * Math.pow(forestR(s) / RMAX, 2) / 10) * 10);

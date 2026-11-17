// «66 Days» — тайминги (кадры, 30 fps). ≈31,5 с, петля.
export const FPS = 30;
export const N = 945;
export const DUR = N / FPS;
// идущие: дорожка z, сдвиг по маршруту (м), базовая скорость (м/кадр), цвет. 0 — наш герой.
export const W = [
  { id: "H", z: 0.0, u0: 0.7, v: 0.045, color: "#FF7A2E" },
  { id: "B", z: -1.7, u0: 4.0, v: 0.05, color: "#FFFFFF" },
  { id: "A", z: -3.4, u0: 8.0, v: 0.047, color: "#FFFFFF" },
];
export const X0 = -6, LEN = 12;                     // дорожка от −6 до +6, ходят туда и обратно
export const QUIT = [null, 420, 138];               // B бросает на 21-й день, A — на 3-й
export const AFTER = { stop: 10, turn: [12, 28], walk: 28, fade: [34, 62], light: [24, 54] };
export const DAYK = [[0, 1], [70, 2], [135, 3], [165, 4], [420, 21], [600, 63], [615, 64], [645, 65], [675, 66]];
export const TURN = 675;
export const PULL = [735, 785];
export const FACT = [785, 885];
export const REW = [885, 925];
export const PUSH = [925, 945];
export const CAPS = [[0, "DAY 1. EVERY STEP IS HEAVY."], [128, "ONE QUITS ON DAY 3."], [250, "“21 DAYS IS ENOUGH,” THEY SAY."], [412, "DAY 21. STILL HARD. HE QUITS."], [492, "HE KEEPS SHOWING UP."], [552, "AND SLOWLY, IT GETS EASIER."]];
export const CAP_END = 608;
export const BIG = [[615, "64"], [645, "65"], [675, "66"]];
// планы камеры: [время сцены, переход, план, за кем следит]
export const SHOTS = [[0, 0, "side", 0], [60, 24, "low", 0], [112, 24, "wide", 2], [172, 24, "top", 0], [250, 24, "side", 0], [330, 24, "wide", 0], [396, 22, "sideB", 1], [466, 24, "top", 0], [536, 24, "low", 0], [598, 22, "side", 0], [652, 20, "low", 0], [690, 34, "top", 0]];
const io = (t) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t));
export function sceneTime(F) {
  if (F <= REW[0]) return F;
  if (F < REW[1]) { const t = (F - REW[0]) / (REW[1] - REW[0]); return Math.round(REW[0] + (-(PUSH[1] - PUSH[0]) - REW[0]) * io(t)); }
  return F - N;
}
export const S0 = -(PUSH[1] - PUSH[0]) - 40, S1 = N + 40;
export function dayF(s) { if (s <= DAYK[0][0]) return 1; for (let i = 0; i + 1 < DAYK.length; i++) { const [a, da] = DAYK[i], [b, db] = DAYK[i + 1]; if (s <= b) return da + (db - da) * (s - a) / (b - a); } return 66; }
export const dayAt = (s) => Math.max(1, Math.min(66, Math.floor(dayF(s) + 1e-6)));

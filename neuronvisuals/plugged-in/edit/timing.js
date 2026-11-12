// «Plugged In» — тайминги (кадры, 30 fps), 30 с, петля (кадр 900 = кадр 0).
export const FPS = 30;
export const N = 900;
export const DUR = N / FPS;
export const LINE1 = "IT'S ONLY $9.99.";
export const LINE2 = "IT NEVER STOPS AT ONE.";
export const FACT_A = "YOU THINK: $86/MONTH";
export const FACT_B = "REALITY: $219/MONTH";
export const FACT_SRC = "C+R Research survey of 1,000 U.S. consumers";
export const TURN = 675;
export const STAND = [372, 440];        // пытается встать — провода не пускают
export const REVEAL = 700, LOCK = 806, UNLOCK = 852;
// иконки на экране-полу: сетка 4×4 сверху и док снизу (x, z)
export const ICON_X = [-2.7, -0.9, 0.9, 2.7], ICON_Z = [-9.0, -7.0, -5.0, -3.0], DOCK_Z = 3.4;
// подписки: [кадр щелчка, цена, название, иконка [кол, ряд(0-3) или 'd'], сустав, сдвиг]
export const SUBS = [
  [45, 9.99, "STREAM", [3, 3], "shR", [0.03, 0.04, -0.06]],
  [135, 14.99, "MUSIC", [0, 3], "shL", [-0.03, 0.04, -0.06]],
  [225, 12.99, "NEWS", [3, 2], "eR", [0.04, 0.0, -0.04]],
  [320, 29.99, "GYM", [1, 3], "pel", [0.0, 0.05, -0.1]],
  [500, 15.99, "TV+", [0, 2], "eL", [-0.04, 0.0, -0.04]],
  [675, 0.99, "EXTRA", [2, "d"], "top", [0.0, 0.02, 0.06]],
];
export const FLY = 9;
// камера: [старт перехода, длительность, план]
export const SHOTS = [[0, 0, "front"], [30, 12, "cab0"], [72, 14, "sideL"], [120, 12, "cab1"], [162, 14, "side"], [210, 12, "cab2"], [252, 14, "front2"], [306, 12, "cab3"],
  [352, 16, "standWatch"], [446, 14, "top"], [486, 12, "cab4"], [528, 14, "side"], [596, 16, "sideL"], [646, 12, "cab5"], [678, 6, "darkClose"], [REVEAL, 44, "reveal"], [UNLOCK, 48, "front"]];

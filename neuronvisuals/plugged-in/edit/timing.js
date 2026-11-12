// «Plugged In» — тайминги (кадры, 30 fps), 30 с, петля (кадр 900 = кадр 0).
export const FPS = 30;
export const N = 900;
export const DUR = N / FPS;
export const LINE1 = "IT'S ONLY $9.99.";
export const LINE2 = "IT NEVER STOPS AT ONE.";
export const FACT = "People guess they spend $86 a month on subscriptions. The real average: $219.";
export const FACT_SRC = "C+R Research survey of 1,000 U.S. consumers";
export const TURN = 675;
export const STAND = [372, 440];        // пытается встать — провода не пускают
export const REVEAL = 700, LOCK = 788, UNLOCK = 846;
// иконки на экране-полу: сетка 4×4 сверху и док снизу (x, z)
export const ICON_X = [-2.7, -0.9, 0.9, 2.7], ICON_Z = [-9.0, -7.0, -5.0, -3.0], DOCK_Z = 3.4;
// подписки: [кадр щелчка, цена, название, иконка [кол, ряд(0-3) или 'd'], сустав, сдвиг]
export const SUBS = [
  [45, 9.99, "STREAM", [3, 3], "shR", [0.03, 0.04, -0.06]],
  [118, 14.99, "MUSIC", [0, 3], "shL", [-0.03, 0.04, -0.06]],
  [186, 4.99, "CLOUD", [2, 2], "top", [0.0, 0.0, -0.09]],
  [250, 12.99, "NEWS", [3, 2], "eR", [0.04, 0.0, -0.04]],
  [330, 29.99, "GYM", [1, 3], "pel", [0.0, 0.05, -0.1]],
  [462, 7.99, "APP", [0, 2], "eL", [-0.04, 0.0, -0.04]],
  [506, 10.99, "DELIVERY", [2, 3], "top", [0.05, -0.08, -0.08]],
  [548, 15.99, "TV+", [1, 2], "shL", [0.0, -0.06, -0.08]],
  [590, 6.99, "GAMES", [3, "d"], "kR", [0.03, 0.02, 0.03]],
  [632, 11.99, "PREMIUM", [0, "d"], "kL", [-0.03, 0.02, 0.03]],
  [675, 0.99, "EXTRA", [2, "d"], "top", [0.0, 0.02, 0.06]],
];
export const FLY = 9;
// камера: [старт перехода, длительность, план]
export const SHOTS = [[0, 0, "front"], [30, 12, "cab0"], [72, 14, "sideL"], [104, 12, "cab1"], [146, 14, "side"], [172, 12, "cab2"], [212, 14, "front2"], [236, 12, "cab3"], [272, 14, "sideL"],
  [316, 12, "cab4"], [352, 16, "standWatch"], [446, 12, "cab5"], [480, 14, "top"], [492, 12, "cab6"], [530, 12, "cab7"], [570, 14, "side"], [578, 10, "cab8"], [618, 12, "cab9"],
  [652, 12, "close"], [672, 6, "darkClose"], [REVEAL, 44, "reveal"], [UNLOCK, 54, "front"]];

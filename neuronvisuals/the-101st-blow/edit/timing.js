// «The 101st Blow» — тайминги (кадры, 30 fps). ≈31,5 с, петля.
export const FPS = 30;
export const N = 945;
export const DUR = N / FPS;
// станции: камень в (x, z), рабочий стоит слева (x − 2.2) лицом к +x. 0 — наш герой.
export const ST = [
  { id: "H", x: 0.0, z: 0.0, color: "#FF7A2E" },
  { id: "C", x: 1.8, z: -4.2, color: "#FFFFFF" },
  { id: "B", x: -1.6, z: -8.5, color: "#FFFFFF" },
  { id: "A", x: 1.2, z: -12.8, color: "#FFFFFF" },
];
// удары: [кадр, номер удара]
function real(off, n) { const r = []; for (let k = 0; k < n; k++) r.push([off + 18 * k, k + 1]); return r; }
function montage(from, step, k, c0, slope, stopAt) { const r = []; for (let j = 0; j < k; j++) { let c = Math.round(c0 + slope * j); if (stopAt && c >= stopAt) { r.push([from + step * j, stopAt]); break; } r.push([from + step * j, c]); } return r; }
export const HITS = [
  [...real(14, 10), ...montage(184, 8, 43, 11, 2.0), [548, 96], [574, 97], [600, 98], [626, 99], [656, 100], [690, 101]],
  [...real(8, 10), ...montage(178, 8, 41, 11, 2.2, 99)],
  [...real(5, 10), ...montage(173, 8, 30, 11, 2.0, 40)],
  real(9, 12),
];
export const LAST = HITS.map((h) => h[h.length - 1][0]);
export const QUIT = [null, LAST[1], LAST[2], LAST[3]];   // кадр последнего удара тех, кто сдался
// после последнего удара: опустить молот, отпустить, развернуться, уйти
export const AFTER = { slump: 12, release: 12, turn: [30, 46], walk: 46, fade: [56, 84], lightOff: 72 };
export const TURN = 690;               // 101-й удар: три ноты и тишина
export const SPLIT = [700, 732];       // камень раскалывается
export const PULL = [735, 785];        // отъезд: весь мир внутри камня
export const FACT = [785, 885];        // цитата Джейкоба Рииса
export const REW = [885, 925];         // перемотка
export const PUSH = [925, 945];        // въезд обратно → кадр 0
export const CAPS = [[0, "EVERYONE STARTS."], [QUIT[3] - 2, "NO CRACK. HE QUITS."], [QUIT[2] - 2, "STILL NO CRACK."], [QUIT[1] - 2, "HE QUIT AT 99."], [546, "ONE KEEPS GOING."]];
export const BIG = [[626, "99"], [656, "100"], [690, "101"]];
// планы камеры: [время сцены, длительность перехода, план, станция]
export const SHOTS = [[0, 0, "wide", 0], [70, 22, "side", 0], [150, 24, "side", 3], [262, 20, "low", 0], [270, 18, "side", 2], [345, 24, "wide2", 0], [420, 24, "side", 1], [512, 24, "ots", 1], [560, 22, "side", 0], [608, 20, "ots", 0], [698, 26, "top", 0]];
const io = (t) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t));
export function sceneTime(F) {
  if (F <= REW[0]) return F;
  if (F < REW[1]) { const t = (F - REW[0]) / (REW[1] - REW[0]); return Math.round(REW[0] + (-(PUSH[1] - PUSH[0]) - REW[0]) * io(t)); }
  return F - N;
}
export const S0 = -(PUSH[1] - PUSH[0]) - 30;

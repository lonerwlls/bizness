// «The Ride» — тайминги (кадры, 30 fps). Полная версия ≈31,5 с, петля.
export const FPS = 30;
export const N = 945;
export const DUR = N / FPS;
// подписи этапов: [кадр, текст, год]
export const STAGES = [[0, "EVERYONE BUYS.", "YEAR 1"], [150, "FEAR SELLS.", "YEAR 2"], [270, "GREED CHASES.", "YEAR 5"], [400, "HYPE GETS BORED.", "YEAR 9"], [520, "FOMO BUYS THE TOP.", "YEAR 14"], [640, "PATIENCE STAYS.", "YEAR 20"]];
// бегуны: имя, дорожка z, старт x, цвет
export const RUNNERS = [
  ["HYPE", -0.95, 3.3, "#FFFFFF"],
  ["FEAR", -0.32, 1.1, "#FFFFFF"],
  ["FOMO", -0.32, 79.3, "#FFFFFF"],
  ["GREED", 0.32, 2.2, "#FFFFFF"],
  ["PATIENCE", 0.95, 0.0, "#FF7A2E"],
];
export const SPEED = 0.125;            // м за кадр
export const FEAR = { stop: [140, 152], turn: [152, 166], fade: [204, 230] };
export const GREED = { sprint: [280, 300], peakX: 53.9 };
export const HYPE = { stop: [430, 445], turn: [450, 466], fade: [470, 488] };
export const FOMO = { show: 583, land: 600, stop: [632, 642], sold: 652, fade: [655, 682] };
export const TURN = 645;               // поворот: три ноты и тишина
export const FINAL = 735;              // итог PATIENCE = $71,750
export const PULL = [735, 785];        // отъезд: мир внутри телефона
export const FACT = [785, 885];
export const REW = [885, 925];         // перемотка на экране телефона
export const PUSH = [925, 945];        // въезд обратно → кадр 0
export const SHOTS = [[0, 0, "side"], [92, 18, "lowFront"], [150, 16, "sideHigh"], [238, 16, "side"], [290, 16, "lowFront"], [338, 14, "sideHigh"], [392, 16, "side"], [440, 16, "lowFront"], [492, 16, "sideHigh"], [545, 16, "side"], [598, 14, "lowFront"], [648, 20, "sideHigh"], [700, 22, "side"]];
const io = (t) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t));
// время сцены s для кадра ролика F (перемотка в конце и петля)
export function sceneTime(F) {
  if (F <= REW[0]) return F;
  if (F < REW[1]) { const t = (F - REW[0]) / (REW[1] - REW[0]); return Math.round(REW[0] + (-(PUSH[1] - PUSH[0]) - REW[0]) * io(t)); }
  return F - N;
}
export const S0 = -(PUSH[1] - PUSH[0]) - 25;   // самое раннее время сцены, нужное камере

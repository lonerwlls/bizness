// Сцена-подиум, луч прожектора, пятно света, пол зала (тёмный и при включённом свете)
import { ellipse, poly, origin, kf } from "./lib.js";
import { TURN, ROW_OFF, NARROW, N, FPS } from "./timing.js";
export const ST = { cx: 540, cy: 1192, rx: 340, ry: 78, h: 72 };
export function stageMask() { origin(0, 0); return ellipse(ST.cx, ST.cy, ST.rx - 6, ST.ry - 4); }
const T = (f) => f / FPS;
// яркость «зала» при включённом свете: 0 → 1 на щелчке, гаснет ступенями по рядам
export const LIT = [[0, 0, "hold"], [TURN, 1, "hold"], [ROW_OFF.C, 1, "linear"], [ROW_OFF.C + 2, 0.62, "hold"], [ROW_OFF.B, 0.62, "linear"], [ROW_OFF.B + 2, 0.3, "hold"], [ROW_OFF.A, 0.3, "linear"], [ROW_OFF.A + 2, 0, "hold"], [N, 0]];
export function floorNodes() {
  return [
    <rect x={-140} y={1150} width={1360} height={980} fill="#050406" />,
    <rect x={-140} y={1150} width={1360} height={980} fill={{ kind: "linear", angle: 180, stops: [{ offset: 0, color: "#2C292D" }, { offset: 1, color: "#1E1B1F" }] }} animate={[{ property: "opacity", keyframes: kf(LIT) }]} />,
    // свет со сцены на полу перед ней
    <rect x={60} y={1200} width={960} height={520} fill={{ kind: "radial", stops: [{ offset: 0, color: "#3A3531", opacity: 0.9 }, { offset: 0.7, color: "#3A3531", opacity: 0 }] }} animate={[{ property: "opacity", keyframes: kf([[0, 1, "hold"], [NARROW[0], 1, "ease-in-out"], [NARROW[1], 0.75, "hold"], [N, 0.75]]) }]} />,
  ];
}
export function stageNodes() {
  const { cx, cy, rx, ry, h } = ST, k = 0.5523;
  // боковина подиума: нижняя дуга верхнего эллипса + такая же дуга ниже на h
  origin(cx - rx, cy - 2);
  const side = `M${0} ${2} C${0} ${2 + ry * k} ${rx - rx * k} ${2 + ry} ${rx} ${2 + ry} C${rx + rx * k} ${2 + ry} ${2 * rx} ${2 + ry * k} ${2 * rx} ${2} L${2 * rx} ${2 + h} C${2 * rx} ${2 + h + ry * k} ${rx + rx * k} ${2 + h + ry} ${rx} ${2 + h + ry} C${rx - rx * k} ${2 + h + ry} ${0} ${2 + h + ry * k} ${0} ${2 + h} Z`;
  origin(0, 0);
  const top = ellipse(cx, cy, rx, ry);
  return [
    <path x={cx - rx} y={cy - 2} width={2 * rx} height={h + ry + 4} d={side} fill={{ kind: "linear", angle: 180, stops: [{ offset: 0, color: "#1C191D" }, { offset: 1, color: "#060507" }] }} />,
    <path x={0} y={0} width={1080} height={1920} d={top} fill="#141115" />,
    // подиум при включённом свете
    <path x={cx - rx} y={cy - 2} width={2 * rx} height={h + ry + 4} d={side} fill={{ kind: "linear", angle: 180, stops: [{ offset: 0, color: "#3A3539" }, { offset: 1, color: "#1A171B" }] }} animate={[{ property: "opacity", keyframes: kf(LIT) }]} />,
    <path x={0} y={0} width={1080} height={1920} d={top} fill="#2A262B" animate={[{ property: "opacity", keyframes: kf(LIT) }]} />,
    <path x={0} y={0} width={1080} height={1920} d={top} stroke={{ width: 2.5, color: "#8F8C90" }} />,
  ];
}
// пятно света на подиуме (под героем) — сужается вместе с лучом
export function poolNodes() {
  return [
    <rect x={ST.cx - 330} y={ST.cy - 92} width={660} height={184} fill={{ kind: "radial", stops: [{ offset: 0, color: "#E2DCD0", opacity: 0.5 }, { offset: 0.35, color: "#E2DCD0", opacity: 0.22 }, { offset: 0.7, color: "#E2DCD0", opacity: 0 }] }} blendMode="screen"
      animate={[{ property: "scale", keyframes: kf([[0, 1, "hold"], [NARROW[0], 1, "ease-in-out"], [NARROW[1], 0.8, "hold"], [N, 0.8]]) }]} />,
  ];
}
// луч прожектора: конус сверху, прозрачный в полосе подписи
export function coneNodes() {
  const bx = 250, by = 420, bw = 580, bh = ST.cy + 6 - by;
  origin(bx, by);
  const wide = poly([[500, 420], [580, 420], [820, ST.cy + 6], [260, ST.cy + 6]], true);
  const narrow = poly([[506, 420], [574, 420], [770, ST.cy + 6], [310, ST.cy + 6]], true);
  origin(0, 0);
  const fill = { kind: "linear", angle: 180, stops: [{ offset: 0, color: "#E8E2D6", opacity: 0 }, { offset: 0.2, color: "#E8E2D6", opacity: 0.02 }, { offset: 1, color: "#E8E2D6", opacity: 0.12 }] };
  const box = { x: bx, y: by, width: bw, height: bh, fill, blendMode: "screen" };
  const [a, b] = NARROW;
  return [
    <path {...box} at={0} duration={T(a)} d={wide} />,
    <path {...box} at={T(a)} duration={T(b - a)} d={wide} morphTo={narrow} animate={[{ property: "morphProgress", from: 0, to: 1, at: 0, duration: T(b - a), easing: "ease-in-out" }]} />,
    <path {...box} at={T(b)} duration={T(N - b)} d={narrow} />,
  ];
}

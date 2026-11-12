export const D = 84;            // диаметр головы героя, px
let OX = 0, OY = 0;
export function origin(x, y) { OX = x; OY = y; }
const q = (v) => (Math.round(v * 10) / 10).toString();
const P = (x, y) => `${q(x - OX)} ${q(y - OY)}`;
// круг четырьмя кубическими кривыми; обход: право → верх → лево → низ (тот же, что у капсулы)
export function ellipse(cx, cy, rx, ry) {
  const kx = 0.5523 * rx, ky = 0.5523 * ry;
  return `M${P(cx + rx, cy)} C${P(cx + rx, cy - ky)} ${P(cx + kx, cy - ry)} ${P(cx, cy - ry)} C${P(cx - kx, cy - ry)} ${P(cx - rx, cy - ky)} ${P(cx - rx, cy)} C${P(cx - rx, cy + ky)} ${P(cx - kx, cy + ry)} ${P(cx, cy + ry)} C${P(cx + kx, cy + ry)} ${P(cx + rx, cy + ky)} ${P(cx + rx, cy)} Z`;
}
export const circle = (cx, cy, r) => ellipse(cx, cy, r, r);
export function capsule(ax, ay, bx, by, r) {
  let ux = bx - ax, uy = by - ay; const L = Math.hypot(ux, uy);
  if (L < 1e-4) { ux = 0; uy = 1; } else { ux /= L; uy /= L; }
  const nx = -uy, ny = ux, k = 0.5523 * r;
  const a0 = [ax + nx * r, ay + ny * r], b0 = [bx + nx * r, by + ny * r], b1 = [bx + ux * r, by + uy * r], b2 = [bx - nx * r, by - ny * r];
  const a2 = [ax - nx * r, ay - ny * r], a1 = [ax - ux * r, ay - uy * r];
  return `M${P(...a0)} L${P(...b0)} C${P(b0[0] + ux * k, b0[1] + uy * k)} ${P(b1[0] + nx * k, b1[1] + ny * k)} ${P(...b1)} C${P(b1[0] - nx * k, b1[1] - ny * k)} ${P(b2[0] + ux * k, b2[1] + uy * k)} ${P(...b2)} L${P(...a2)} C${P(a2[0] - ux * k, a2[1] - uy * k)} ${P(a1[0] - nx * k, a1[1] - ny * k)} ${P(...a1)} C${P(a1[0] + nx * k, a1[1] + ny * k)} ${P(a0[0] - ux * k, a0[1] - uy * k)} ${P(...a0)} Z`;
}
export function poly(pts, close = false) { return "M" + pts.map((p) => P(p[0], p[1])).join(" L") + (close ? " Z" : ""); }
export const EASE = {
  lin: (t) => t,
  io: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  in: (t) => t * t * t,
  out: (t) => 1 - Math.pow(1 - t, 3),
  contact: (t) => 0.35 * (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2) + 0.65 * t,
};
// ключи анимации: [[кадр, значение, easing уходящего сегмента], ...] → keyframes Higgsedit
export function kf(list, fps = 30) { return list.map(([f, v, e]) => (e ? { at: f / fps, value: v, easing: e } : { at: f / fps, value: v })); }

// Линия графика: опорные точки (x, y) и гладкая кривая (кубический Эрмит). Та же формула уходит в шейдер.
export const PTS = [[-14, -0.2], [-6, 0.0], [0, 0.2], [3.5, 0.9], [6.5, 0.65], [10, 1.5], [13, 1.3], [16.5, 1.9], [19.6, -0.25], [22.5, 0.5], [26, 1.7], [29, 1.9], [33, 2.9], [37, 2.6], [41, 3.1], [45, 2.9], [48, 3.3], [51, 4.4], [53, 5.6], [54.2, 5.9], [57.2, 2.4], [59.5, 2.1], [62, 2.35], [64.5, 2.15], [67, 2.4], [71, 3.4], [75, 4.3], [78.5, 5.4], [79.6, 5.6], [82.3, 3.4], [85.5, 4.6], [89, 6.2], [93, 7.3], [98, 8.0], [106, 8.6], [118, 9.0], [140, 9.2]];
function slopes() { const m = []; for (let i = 0; i < PTS.length; i++) { const a = PTS[Math.max(0, i - 1)], b = PTS[Math.min(PTS.length - 1, i + 1)]; m.push((b[1] - a[1]) / (b[0] - a[0])); } return m; }
const M = slopes();
export function chartY(x) {
  if (x <= PTS[0][0]) return PTS[0][1];
  for (let i = 0; i + 1 < PTS.length; i++) { const [x0, y0] = PTS[i], [x1, y1] = PTS[i + 1]; if (x <= x1) { const h = x1 - x0, t = (x - x0) / h, t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * y0 + (t3 - 2 * t2 + t) * h * M[i] + (-2 * t3 + 3 * t2) * y1 + (t3 - t2) * h * M[i + 1]; } }
  return PTS[PTS.length - 1][1];
}
export const slopeAt = (x) => (chartY(x + 0.05) - chartY(x - 0.05)) / 0.1;
export function glslChart() {
  const f = (v) => { const s = String(+v.toFixed(5)); return /[.e]/.test(s) ? s : s + ".0"; };
  let s = "float chartY(float x){\n";
  s += `  if (x <= ${f(PTS[0][0])}) return ${f(PTS[0][1])};\n`;
  for (let i = 0; i + 1 < PTS.length; i++) { const [x0, y0] = PTS[i], [x1, y1] = PTS[i + 1], h = x1 - x0;
    s += `  if (x <= ${f(x1)}) { float t = (x - ${f(x0)}) / ${f(h)}; float t2 = t*t, t3 = t2*t; return (2.0*t3 - 3.0*t2 + 1.0)*${f(y0)} + (t3 - 2.0*t2 + t)*${f(h * M[i])} + (-2.0*t3 + 3.0*t2)*${f(y1)} + (t3 - t2)*${f(h * M[i + 1])}; }\n`; }
  s += `  return ${f(PTS[PTS.length - 1][1])};\n}\n`;
  return s;
}

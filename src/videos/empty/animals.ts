// Flat cartoon animals in the cast's ink style (thick plum outline, two-tone fills), drawn with real proportions:
// a smooth body silhouette (chest, withers, belly tuck, rump), jointed tapering legs (front: elbow-wrist,
// hind: stifle-hock bending back), proper heads per species. Side views walk; the dog also sits facing the camera.
// Side canvas 1000 x 600 (ground y = 585, facing right); sitting dog 600 x 700 (ground y = 690).
import { Pen, INK } from "../bridge/toon";

type P2 = [number, number];
export type Kind = "dog" | "wolf" | "bear" | "horse";
type Spec = {
  body: string; light: string; dark: string; leg: string; hoof?: string;
  L: number; H: number; cy: number;          // body length, depth, centre height (canvas units)
  legF: number; legH: number; legW: number;  // leg lengths and thickness
  hump: number; tuck: number;                 // withers hump (bear), belly tuck
};
const SP: Record<Kind, Spec> = {
  dog: { body: "#b8763c", light: "#f2e6d2", dark: "#6a4120", leg: "#b8763c", L: 430, H: 150, cy: 360, legF: 170, legH: 175, legW: 26, hump: 0, tuck: 0.16 },
  wolf: { body: "#8e8f98", light: "#e2e0d8", dark: "#5a5b66", leg: "#9a9ba4", L: 500, H: 160, cy: 330, legF: 205, legH: 210, legW: 26, hump: 0.04, tuck: 0.2 },
  bear: { body: "#6e4a2c", light: "#9a6c44", dark: "#4a301a", leg: "#5e3e24", L: 600, H: 270, cy: 330, legF: 150, legH: 150, legW: 62, hump: 0.16, tuck: 0.02 },
  horse: { body: "#c99f68", light: "#f0e2c4", dark: "#3a2a1c", leg: "#3a2a1c", hoof: "#241a12", L: 520, H: 190, cy: 255, legF: 300, legH: 300, legW: 30, hump: 0, tuck: 0.12 },
};
const rad = (d: number) => (d * Math.PI) / 180;
/** closed Catmull-Rom spline through the points */
const smooth = (pts: P2[], n = 8): P2[] => {
  const out: P2[] = [], m = pts.length;
  for (let i = 0; i < m; i++) {
    const p0 = pts[(i - 1 + m) % m], p1 = pts[i], p2 = pts[(i + 1) % m], p3 = pts[(i + 2) % m];
    for (let k = 0; k < n; k++) {
      const t = k / n, t2 = t * t, t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  return out;
};
/** tapering limb along a polyline, width w0 at the top to w1 at the bottom */
const limbPoly = (pts: P2[], w0: number, w1: number): P2[] => {
  const left: P2[] = [], right: P2[] = [], n = pts.length;
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
    const w = (w0 + (w1 - w0) * (i / (n - 1))) / 2;
    left.push([pts[i][0] - dy * w, pts[i][1] + dx * w]); right.push([pts[i][0] + dy * w, pts[i][1] - dx * w]);
  }
  return [...left, ...right.reverse()];
};
const ell = (cx: number, cy: number, a: number, b: number, rot = 0, n = 40): P2[] => {
  const out: P2[] = [];
  for (let i = 0; i < n; i++) { const t = (i / n) * Math.PI * 2, x = a * Math.cos(t), y = b * Math.sin(t); out.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]); }
  return out;
};
const OL = 8;

/** side view facing right; phase 0..1 = one stride cycle (walk: diagonal pairs); headDown 0..1 = grazing */
export const quadSide = (p: Pen, kind: Kind, phase = 0, trot = 1, headDown = 0) => {
  const S = SP[kind], g = p.g, two = Math.PI * 2, ground = 585;
  const bob = 5 * trot * Math.cos(2 * two * phase);
  const cx = 470, cy = S.cy + bob, L = S.L, H = S.H;
  const X = (u: number) => cx + u * L, Y = (v: number) => cy + v * H;
  // ---- legs (far pair first, darker) ----
  const leg = (front: boolean, ph: number, far: boolean) => {
    const sw = Math.sin(two * (phase + ph)), lift = Math.max(0, Math.cos(two * (phase + ph))) * trot;
    const hip: P2 = front ? [X(0.33), Y(0.15)] : [X(-0.36), Y(0.05)];
    const len = front ? S.legF : S.legH;
    const foot: P2 = [hip[0] + sw * 0.28 * len * trot, ground - 6 - lift * 0.16 * len];
    let mid: P2;
    if (front) mid = [(hip[0] + foot[0]) / 2 + 6 + lift * 18, hip[1] + (foot[1] - hip[1]) * 0.55 - lift * 10]; // wrist bends forward when lifted
    else mid = [hip[0] - 0.16 * len + sw * 0.1 * len, hip[1] + (foot[1] - hip[1]) * 0.62];                // hock points back
    const upper: P2 = front ? [hip[0] + 4, hip[1] + (mid[1] - hip[1]) * 0.45] : [hip[0] + 0.1 * len, hip[1] + (mid[1] - hip[1]) * 0.4];
    const col = far ? S.dark : S.leg;
    const poly = limbPoly([hip, upper, mid, foot], S.legW * (front ? 1.5 : 2.2), S.legW * 0.8);
    p.poly(poly, col, OL);
    if (S.hoof) p.poly([[foot[0] - S.legW * 0.55, foot[1] - 8], [foot[0] + S.legW * 0.6, foot[1] - 8], [foot[0] + S.legW * 0.75, foot[1] + 6], [foot[0] - S.legW * 0.55, foot[1] + 6]], S.hoof, 6);
    else p.ell(foot[0] + S.legW * 0.35, foot[1] + 1, S.legW * 0.85, S.legW * 0.45, col, 6);
  };
  leg(true, 0.5, true); leg(false, 0, true);
  // ---- tail ----
  const tb: P2 = [X(-0.5), Y(-0.32)], sway = 10 * Math.sin(two * phase);
  if (kind === "horse") p.poly(limbPoly([tb, [tb[0] - 40, tb[1] + 60], [tb[0] - 46 + sway, tb[1] + 160], [tb[0] - 30 + sway, tb[1] + 250]], 46, 22), S.dark, OL);
  else if (kind === "bear") p.ell(tb[0] + 6, tb[1] + 10, 26, 20, S.body, OL);
  else {
    const tp = smooth([tb, [tb[0] - 50, tb[1] + 20], [tb[0] - 95 + sway, tb[1] + (kind === "dog" ? -40 : 120)], [tb[0] - 70 + sway, tb[1] + (kind === "dog" ? -60 : 150)], [tb[0] - 20, tb[1] + 40]], 6);
    p.poly(tp, S.body, OL);
    if (kind === "wolf") p.ell(tb[0] - 85 + sway, tb[1] + 140, 18, 22, S.dark, 0);
  }
  // ---- body silhouette ----
  const bodyPts = smooth([
    [X(0.3), Y(-0.48 - S.hump)], [X(0.12), Y(-0.5 - S.hump * 0.8)], [X(-0.15), Y(-0.44)], [X(-0.4), Y(-0.48)], [X(-0.53), Y(-0.2)],
    [X(-0.5), Y(0.2)], [X(-0.36), Y(0.46)], [X(-0.12), Y(0.5 - S.tuck * 2)], [X(0.12), Y(0.5)], [X(0.34), Y(0.56)], [X(0.5), Y(0.2)], [X(0.48), Y(-0.24)],
  ]);
  p.poly(bodyPts, S.body, 0);
  g.save(); p.path(bodyPts, true); g.clip();
  p.ell(X(0.02), Y(0.62), L * 0.42, H * 0.3, S.light, 0);                              // pale belly
  if (kind === "wolf") p.ell(X(-0.05), Y(-0.55), L * 0.4, H * 0.28, S.dark, 0);        // dark saddle
  if (kind === "bear") p.ell(X(0.15), Y(-0.6), L * 0.25, H * 0.25, S.light, 0);        // sunlit hump
  g.restore();
  p.poly(bodyPts, null, OL);
  // near legs over the body
  leg(true, 0, false); leg(false, 0.5, false);
  // ---- neck + head ----
  const sh: P2 = [X(0.42), Y(-0.2)];
  if (kind === "horse") {
    const hd = headDown;
    const poll: P2 = [sh[0] + 120 + 60 * hd, sh[1] - 170 + 260 * hd];
    const neck = smooth([[sh[0] - 60, sh[1] - 40], [poll[0] - 25, poll[1] - 10], [poll[0] + 30, poll[1] + 40], [sh[0] + 50, sh[1] + 70]], 6);
    p.poly(neck, S.body, OL);
    for (let i = 0; i < 7; i++) { const k = i / 6, x = sh[0] - 55 + (poll[0] - 20 - (sh[0] - 55)) * k, y = sh[1] - 45 + (poll[1] - 15 - (sh[1] - 45)) * k; p.poly(ell(x - 8, y - 6, 14, 26, rad(-40 + 30 * hd)), S.dark, 4); }
    const ang = rad(55 + 60 * hd);
    const headPts = smooth([[poll[0] - 30, poll[1] - 10], [poll[0] + 30, poll[1] - 25], [poll[0] + 30 + 150 * Math.cos(ang), poll[1] + 150 * Math.sin(ang) - 10], [poll[0] + 10 + 165 * Math.cos(ang), poll[1] + 165 * Math.sin(ang) + 20], [poll[0] - 20, poll[1] + 60]], 6);
    p.poly(headPts, S.body, OL);
    p.ell(poll[0] + 12 + 150 * Math.cos(ang), poll[1] + 150 * Math.sin(ang) + 10, 34, 26, S.light, 6); // pale muzzle
    p.dot(poll[0] + 18 + 160 * Math.cos(ang), poll[1] + 160 * Math.sin(ang) + 4, 7);
    p.poly([[poll[0] - 18, poll[1] - 14], [poll[0] - 8, poll[1] - 70], [poll[0] + 12, poll[1] - 18]], S.body, 6);  // ear
    p.ell(poll[0] + 22, poll[1] + 22, 10, 8, INK, 0);
    return;
  }
  const hs = kind === "bear" ? 1.25 : kind === "dog" ? 0.9 : 1;
  const hc: P2 = [sh[0] + 85 * hs, sh[1] - (kind === "bear" ? 30 : 95) * (1 - headDown) + 120 * headDown];
  const neck = smooth([[sh[0] - 70, sh[1] - 50], [hc[0] - 30, hc[1] - 35], [hc[0] + 10, hc[1] + 45], [sh[0] + 30, sh[1] + 80]], 6);
  p.poly(neck, S.body, OL);
  if (kind !== "bear") p.poly(smooth([[sh[0] + 10, sh[1] + 10], [hc[0] + 5, hc[1] + 30], [sh[0] + 45, sh[1] + 75]], 5), S.light, 0); // pale throat
  // ears behind the skull
  if (kind === "bear") { p.ell(hc[0] - 40 * hs, hc[1] - 55 * hs, 24, 24, S.body, OL); }
  else if (kind === "wolf") { p.poly([[hc[0] - 45, hc[1] - 30], [hc[0] - 40, hc[1] - 115], [hc[0] - 5, hc[1] - 45]], S.body, OL); p.poly([[hc[0] - 36, hc[1] - 44], [hc[0] - 36, hc[1] - 92], [hc[0] - 18, hc[1] - 50]], S.light, 0); }
  // skull + muzzle
  p.poly(ell(hc[0], hc[1], 70 * hs, 58 * hs, rad(-8)), S.body, OL);
  const mz = smooth(kind === "bear"
    ? [[hc[0] + 30, hc[1] - 20], [hc[0] + 110, hc[1] - 4], [hc[0] + 118, hc[1] + 28], [hc[0] + 40, hc[1] + 45]]
    : [[hc[0] + 25, hc[1] - 22], [hc[0] + 125 * hs, hc[1] + 2], [hc[0] + 128 * hs, hc[1] + 26], [hc[0] + 30, hc[1] + 42]], 6);
  p.poly(mz, kind === "bear" ? S.light : S.body, OL);
  if (kind !== "bear") p.poly(smooth([[hc[0] + 30, hc[1] + 18], [hc[0] + 118 * hs, hc[1] + 24], [hc[0] + 40, hc[1] + 40]], 5), S.light, 0);
  p.ell(hc[0] + (kind === "bear" ? 116 : 126 * hs), hc[1] + (kind === "bear" ? 6 : 6), 14, 11, INK, 0);       // nose
  p.ell(hc[0] + 18 * hs, hc[1] - 16 * hs, 9, 7, INK, 0); p.dot(hc[0] + 20 * hs, hc[1] - 17 * hs, 2, "#ffffff"); // eye
  if (kind === "dog") p.poly(ell(hc[0] - 35, hc[1] + 10, 24, 52, rad(18)), S.dark, OL);                    // floppy ear
};

/** front view, sitting by a door; look -1..1, sad 0..1, asleep */
export const dogSit = (p: Pen, look = 0, sad = 0, asleep = false, wag = 0) => {
  const S = SP.dog, cx = 300, ground = 690;
  p.poly(ell(cx + 125 + 25 * wag, ground - 40, 70, 20, -0.3 + 0.5 * wag), S.body, OL);                       // tail
  const body = smooth([[cx - 70, ground - 300], [cx + 70, ground - 300], [cx + 130, ground - 120], [cx + 120, ground - 20], [cx - 120, ground - 20], [cx - 130, ground - 120]], 8);
  p.poly(body, S.body, 0);
  p.g.save(); p.path(body, true); p.g.clip(); p.poly(smooth([[cx - 45, ground - 300], [cx + 45, ground - 300], [cx + 55, ground - 120], [cx, ground - 60], [cx - 55, ground - 120]], 6), S.light, 0); p.g.restore();
  p.poly(body, null, OL);
  for (const s of [-1, 1]) {
    p.ell(cx + s * 115, ground - 60, 55, 60, S.body, OL);                                                          // haunches
    p.poly(limbPoly([[cx + s * 42, ground - 220], [cx + s * 46, ground - 110], [cx + s * 48, ground - 25]], 46, 34), S.light, OL);
    p.ell(cx + s * 50, ground - 16, 34, 18, S.light, 6);
  }
  const hy = ground - 390, hx = cx + 14 * look;
  for (const s of [-1, 1]) p.poly(ell(hx + s * 98, hy + 34 + 18 * sad, 32, 78, s * (0.3 + 0.3 * sad)), S.dark, OL); // ears
  p.poly(smooth([[hx - 100, hy - 40], [hx, hy - 95], [hx + 100, hy - 40], [hx + 95, hy + 40], [hx, hy + 70], [hx - 95, hy + 40]], 6), S.body, OL);
  p.poly(smooth([[hx - 55, hy + 20], [hx + 55, hy + 20], [hx + 48, hy + 95], [hx, hy + 112], [hx - 48, hy + 95]], 6), S.light, OL); // muzzle
  p.ell(hx, hy + 38, 24, 17, INK, 0);
  if (asleep) for (const s of [-1, 1]) p.arc(hx + s * 44 + 6 * look, hy - 14, 18, 9, 20, 160, 7);
  else for (const s of [-1, 1]) {
    p.ell(hx + s * 44 + 10 * look, hy - 16, 13, 15, INK, 0); p.dot(hx + s * 44 + 13 * look, hy - 21, 4, "#ffffff");
    p.stroke([[hx + s * 26, hy - 50 + 10 * sad], [hx + s * 62, hy - 44 - 10 * sad]], 7);
  }
  p.stroke(sad > 0.3 ? [[hx - 22, hy + 86], [hx, hy + 76], [hx + 22, hy + 86]] : [[hx - 22, hy + 76], [hx, hy + 86], [hx + 22, hy + 76]], 6);
};

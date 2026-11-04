// Flat cartoon animals in the same ink style as the cast (toon.ts): side-view quadrupeds that walk (dog, wolf,
// bear, wild horse) and a front-view sitting dog. Canvas 1000 x 600 for the side view (ground at y = 585),
// 600 x 700 for the sitting dog (ground at y = 690).
import { Pen, INK } from "../bridge/toon";

type P2 = [number, number];
export type Kind = "dog" | "wolf" | "bear" | "horse";
const SPEC: Record<Kind, { body: string; belly: string; dark: string; bx: number; by: number; ba: number; bb: number; leg: number; legW: number }> = {
  dog: { body: "#b9773d", belly: "#f4ead8", dark: "#5a3418", bx: 470, by: 360, ba: 210, bb: 90, leg: 200, legW: 26 },
  wolf: { body: "#8d8f99", belly: "#e3e2dc", dark: "#4b4c56", bx: 460, by: 330, ba: 240, bb: 95, leg: 230, legW: 26 },
  bear: { body: "#6b4426", belly: "#8a5c38", dark: "#3a2414", bx: 470, by: 330, ba: 280, bb: 160, leg: 140, legW: 54 },
  horse: { body: "#c99a5a", belly: "#ecd9b4", dark: "#3a2a1c", bx: 450, by: 270, ba: 250, bb: 105, leg: 300, legW: 22 },
};
const ell = (cx: number, cy: number, a: number, b: number, rot = 0, n = 48): P2[] => {
  const out: P2[] = [];
  for (let i = 0; i < n; i++) { const t = (i / n) * Math.PI * 2, x = a * Math.cos(t), y = b * Math.sin(t); out.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]); }
  return out;
};

/** side view facing right; phase 0..1 = one full stride; trot = how much the legs swing */
export const quadSide = (p: Pen, kind: Kind, phase = 0, trot = 1, headDown = 0) => {
  const S = SPEC[kind], g = p.g, two = Math.PI * 2, ground = 585;
  const bob = 6 * trot * Math.cos(2 * two * phase);
  const cx = S.bx, cy = S.by + bob;
  // legs: far pair darker and behind, near pair in front; diagonal pairs move together
  const hips: [number, number, boolean][] = [[cx - S.ba * 0.62, 0, true], [cx + S.ba * 0.6, 0.5, true], [cx - S.ba * 0.55, 0.5, false], [cx + S.ba * 0.67, 0, false]];
  const leg = (hx: number, ph: number, far: boolean) => {
    const sw = Math.sin(two * (phase + ph)) * 46 * trot, up = Math.max(0, Math.cos(two * (phase + ph))) * 26 * trot;
    const top: P2 = [hx, cy + S.bb * 0.4], foot: P2 = [hx + sw, ground - up], knee: P2 = [(top[0] + foot[0]) / 2 + (kind === "horse" ? -10 : 8), (top[1] + foot[1]) / 2];
    const col = far ? S.dark : kind === "bear" ? S.body : S.dark;
    p.stroke([top, knee, foot], S.legW + 6, INK);
    p.stroke([top, knee, foot], S.legW, col);
    p.ell(foot[0] + 6, foot[1] - 4, S.legW * 0.75, S.legW * 0.45, kind === "horse" ? "#2a2018" : col, 5);
  };
  for (const [hx, ph, far] of hips) if (far) leg(hx, ph, far);
  // tail
  if (kind === "horse") p.line([[cx - S.ba * 0.95, cy - 40], [cx - S.ba * 1.15, cy + 40], [cx - S.ba * 1.12, cy + 150 + 10 * Math.sin(two * phase)]], S.dark, 26);
  else if (kind === "bear") p.ell(cx - S.ba * 0.98, cy - 40, 26, 22, S.body, 7);
  else p.poly(ell(cx - S.ba * 1.12, cy - 20 + 8 * Math.sin(two * phase), 95, 30, kind === "dog" ? -0.6 : 0.35), S.body, 7);
  // body
  const body = ell(cx, cy, S.ba, S.bb);
  p.poly(body, S.body, 9);
  g.save(); p.path(body, true); g.clip(); p.ell(cx + 10, cy + S.bb * 0.95, S.ba * 0.8, S.bb * 0.45, S.belly, 0); g.restore();
  p.poly(body, null, 9);
  // neck + head
  const nx = cx + S.ba * 0.85;
  if (kind === "horse") {
    const hx = nx + 120, hy = cy - 170 + headDown * 120;
    p.line([[nx - 40, cy - 30], [hx - 20, hy + 30]], S.body, 120);
    for (let i = 0; i < 6; i++) { const k = i / 5; p.stroke([[nx - 60 + k * 150, cy - 90 - k * 120 + headDown * 100 * k], [nx - 90 + k * 150, cy - 70 - k * 120 + headDown * 100 * k]], 22, S.dark); }
    p.poly(ell(hx + 40, hy + 20, 105, 48, 0.55 + headDown * 0.5), S.body, 8);
    p.ell(hx + 105, hy + 70 + headDown * 50, 14, 12, INK, 0);
    p.dot(hx + 10, hy - 5, 11);
    p.poly([[hx - 25, hy - 40], [hx - 10, hy - 95], [hx + 8, hy - 40]], S.body, 7);
    return;
  }
  const hs = kind === "bear" ? 1.15 : 1, hx = nx + 70 * hs, hy = cy - (kind === "bear" ? 70 : 120) + headDown * 110;
  p.line([[nx - 40, cy - 20], [hx - 10, hy + 20]], S.body, 90 * hs);
  // ears
  if (kind === "bear") { p.ell(hx - 40, hy - 70, 30, 30, S.body, 7); p.ell(hx + 30, hy - 75, 30, 30, S.body, 7); }
  else if (kind === "wolf") { p.poly([[hx - 50, hy - 40], [hx - 35, hy - 125], [hx - 5, hy - 50]], S.body, 7); p.poly([[hx - 5, hy - 50], [hx + 15, hy - 130], [hx + 35, hy - 45]], S.body, 7); }
  else p.poly(ell(hx - 45, hy - 5, 26, 62, 0.25), S.dark, 7);
  p.poly(ell(hx, hy, 82 * hs, 70 * hs), S.body, 8);
  p.poly(ell(hx + 78 * hs, hy + 22 * hs, 58 * hs, 34 * hs, 0.1), kind === "bear" ? S.belly : S.body, 7);
  p.ell(hx + 130 * hs, hy + 12 * hs, 16, 13, INK, 0);
  p.dot(hx + 22 * hs, hy - 18 * hs, 11);
  if (kind === "dog") p.ell(hx + 100, hy + 60, 18, 26, "#e86e78", 5);
};

/** front view, sitting by a door; look -1..1, sad 0..1, asleep */
export const dogSit = (p: Pen, look = 0, sad = 0, asleep = false, wag = 0) => {
  const S = SPEC.dog, cx = 300, ground = 690;
  // tail wag behind
  p.poly(ell(cx + 120 + 30 * wag, ground - 70, 70, 22, -0.4 + 0.5 * wag), S.body, 7);
  // body (sitting bean) + chest
  const body = ell(cx, ground - 170, 135, 165);
  p.poly(body, S.body, 9);
  p.g.save(); p.path(body, true); p.g.clip(); p.ell(cx, ground - 200, 70, 120, S.belly, 0); p.g.restore();
  p.poly(body, null, 9);
  // front legs + paws
  for (const s of [-1, 1]) { p.stroke([[cx + s * 45, ground - 180], [cx + s * 50, ground - 20]], 34, INK); p.stroke([[cx + s * 45, ground - 180], [cx + s * 50, ground - 20]], 26, S.belly); p.ell(cx + s * 52, ground - 14, 32, 18, S.belly, 7); }
  // head
  const hy = ground - 390, hx = cx + 10 * look;
  for (const s of [-1, 1]) p.poly(ell(hx + s * 105, hy + 30 + 20 * sad, 34, 82, s * (0.35 + 0.3 * sad)), S.dark, 8);
  p.poly(ell(hx, hy, 118, 108), S.body, 9);
  p.poly(ell(hx, hy + 52, 62, 44), S.belly, 7);
  p.ell(hx, hy + 30, 20, 15, INK, 0);
  if (asleep) for (const s of [-1, 1]) p.arc(hx + s * 42 + 6 * look, hy - 18, 18, 10, 20, 160, 7);
  else for (const s of [-1, 1]) {
    p.dot(hx + s * 42 + 12 * look, hy - 20, 13);
    if (sad > 0.3) p.stroke([[hx + s * 20, hy - 58 + 6 * sad], [hx + s * 62, hy - 48 - 8 * sad]], 7);
  }
  p.stroke(sad > 0.3 ? [[hx - 20, hy + 70], [hx, hy + 62], [hx + 20, hy + 70]] : [[hx - 20, hy + 62], [hx, hy + 70], [hx + 20, hy + 62]], 6);
};

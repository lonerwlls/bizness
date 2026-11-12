import { add, sub, mul, lerp, mix, io, sstep, norm, cross, dot } from "./vec.js";
import { LAD_DIR } from "./world.js";
import { SHOTS, N } from "./timing.js";
// планы камеры: кадр + состояние героя → {ro, ta, lens}
const TBL = [2.3, 0.6, 2.1];
const PLANS = {
  wideLow: (f, H) => ({ ro: [3.7 + 0.004 * f, 1.1, 8.7], ta: [1.45, 2.3 + 0.004 * f, 0.9], lens: 1.0 }),
  hands: (f, H) => { const ta = add(H.chest, mul(LAD_DIR, 0.3)); return { ro: add(ta, [1.8, -0.7, 3.5]), ta, lens: 1.2 }; },
  table: (f, H) => ({ ro: [3.25 - 0.003 * (f - 170), 1.5, 6.4], ta: [2.28, 0.95, 2.0], lens: 1.1 }),
  heroLook: (f, H) => ({ ro: add(H.head, [1.7, -0.25, 2.2]), ta: add(H.head, [0.15, -0.35, 0]), lens: 1.05 }),
  topDown: (f, H) => ({ ro: add(H.head, [1.0, 2.9, 2.3]), ta: lerp(H.chest, [1.9, 0.3, 2.0], 0.1), lens: 0.9 }),
  sideWide: (f, H) => ({ ro: [6.3 - 0.004 * (f - 300), 2.4, 8.6], ta: [0.9, 3.0, 1.3], lens: 0.85 }),
  handsHigh: (f, H) => { const ta = add(H.chest, mul(LAD_DIR, 0.25)); return { ro: add(ta, [-1.9, -0.4, 3.2]), ta, lens: 1.15 }; },
  shoulderDown: (f, H) => ({ ro: add(H.head, [-0.3, 1.2, 0.9]), ta: lerp(H.head, TBL, 0.75), lens: 0.9 }),
  wifeScene: (f, H) => ({ ro: [4.7 - 0.004 * (f - 522), 1.3, 6.0], ta: [2.55, 0.95, 2.0], lens: 1.15 }),
  topApproach: (f, H) => ({ ro: [2.4, 14.7, 3.4], ta: [0, 12.9 + 0.006 * (f - 612), 0.3], lens: 1.1 }),
  topReveal: (f, H) => { const s = sstep(734, 754, f); return { ro: [3.2 + 0.006 * (f - 678) - 1.6 * s, 16.8, 5.5], ta: [-0.9 * s, 13.4, -7.0], lens: 0.8 }; },
  povDown: (f, H) => { const z = sstep(768, 796, f); return { ro: [-0.75, 14.75, 0.4], ta: lerp([0.3, 4.0, 1.5], [2.15, 0.45, 2.15], z), lens: mix(1.0, 3.2, z) }; },
  frontSit: (f, H) => { const t = (f - 806) / 94; return { ro: lerp([0.6, 12.4, 4.6], [0.2, 12.75, 3.7], t), ta: [-0.95, 13.45, 0], lens: mix(1.2, 1.4, t) }; },
};
export function cameraTrack(hero) {
  const out = [];
  for (let f = 0; f <= N; f++) {
    const H = hero[Math.min(f, N - 1)];
    let k = 0; while (k + 1 < SHOTS.length && f >= SHOTS[k + 1][0]) k++;
    let c = PLANS[SHOTS[k][2]](f, H);
    const [s0, Tt] = SHOTS[k];
    if (k > 0 && Tt > 0 && f < s0 + Tt) {
      const p = PLANS[SHOTS[k - 1][2]](f, H), e = io((f - s0) / Tt);
      c = { ro: lerp(p.ro, c.ro, e), ta: lerp(p.ta, c.ta, e), lens: mix(p.lens, c.lens, e) };
    }
    out.push(c);
  }
  return out;
}
export function projector(c) {
  const ww = norm(sub(c.ta, c.ro)), uu = norm(cross(ww, [0, 1, 0])), vv = cross(uu, ww);
  return (X) => { const v = sub(X, c.ro), zc = dot(v, ww); const z = Math.max(zc, 0.05); const s = (c.lens * 1920) / z;
    return { x: 540 + dot(v, uu) * s, y: 960 - dot(v, vv) * s, k: s, z: zc }; };
}

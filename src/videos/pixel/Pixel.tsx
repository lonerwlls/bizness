// «What if you found a magic coin?» — 10-секундная проба настоящего пиксель-арта.
// Всё рисуется в одну сетку 90×160 (палитра 16 цветов, без сглаживания), анимация покадровая 10 к/с,
// всё двигается только на целые пиксели. На экран сетка увеличивается ×12 с резкими пикселями.
// Темп музыки 150 уд/мин: 1 кадр анимации = 1/16 такта, события стоят на долях. Звук: scripts/pixel_sound.py
import React, { useLayoutEffect, useRef } from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";

export const PIXEL_FRAMES = 300;
const W = 90, H = 160, SCALE = 12, STEP = 3; // 30 к/с видео / 3 = 10 к/с анимации

// палитра: 16 цветов на весь ролик
const PAL = [
  "#0e0b1f", "#1c1a3d", "#2e2b5f", "#4a438f", "#7d6fd0", "#b9aef0", "#f4f0e6", "#ffd23f",
  "#ff8c1a", "#c4561c", "#6e2f3a", "#2f6f5a", "#5fc08a", "#3a3348", "#6f6682", "#fff3b0",
];
const K = 0, N1 = 1, N2 = 2, N3 = 3, LAV = 4, PALE = 5, WH = 6, YE = 7, OR = 8, DOR = 9, BR = 10, GR = 11, LG = 12, DG = 13, MG = 14, GL = 15;
const RGB = PAL.map((h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]);

const GY = 128; // верх тротуара (мировая y)
const hash = (n: number) => {
  let x = Math.imul(n | 0, 374761393) + 668265263;
  x = Math.imul(x ^ (x >>> 13), 1274126177);
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
};
const r = Math.round;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const ease = (t: number) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };

class Buf {
  d = new Uint8Array(W * H);
  px(x: number, y: number, c: number) { x = r(x); y = r(y); if (x >= 0 && y >= 0 && x < W && y < H) this.d[y * W + x] = c; }
  get(x: number, y: number) { x = r(x); y = r(y); return x >= 0 && y >= 0 && x < W && y < H ? this.d[y * W + x] : -1; }
  rect(x: number, y: number, w: number, h: number, c: number) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.px(x + i, y + j, c); }
  box(x: number, y: number, w: number, h: number, c: number, o = K) { this.rect(x, y, w, h, o); this.rect(x + 1, y + 1, w - 2, h - 2, c); }
  line(x0: number, y0: number, x1: number, y1: number, c: number) {
    x0 = r(x0); y0 = r(y0); x1 = r(x1); y1 = r(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let e = dx + dy;
    for (;;) { this.px(x0, y0, c); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
  }
  disc(cx: number, cy: number, rad: number, c: number) { for (let j = -rad; j <= rad; j++) for (let i = -rad; i <= rad; i++) if (i * i + j * j <= rad * rad + rad * 0.8) this.px(cx + i, cy + j, c); }
}

// ---------- шрифт 5×7 ----------
const FONT: Record<string, string> = {
  A: ".###.#...##...#######...##...##...#", B: "####.#...##...#####.#...##...#####.", C: ".###.#...##....#....#....#...#.###.",
  D: "####.#...##...##...##...##...#####.", E: "######....#....####.#....#....#####", F: "######....#....####.#....#....#....",
  G: ".###.#...##....#.####...##...#.####", H: "#...##...##...#######...##...##...#", I: ".###...#....#....#....#....#...###.",
  L: "#....#....#....#....#....#....#####", M: "#...###.###.#.##.#.##...##...##...#", N: "#...###..##.#.##..###...##...##...#",
  O: ".###.#...##...##...##...##...#.###.", R: "####.#...##...#####.#.#..#..#.#...#", S: ".#####....#.....###.....#....#####.",
  T: "#####..#....#....#....#....#....#..", U: "#...##...##...##...##...##...#.###.", V: "#...##...##...##...##...#.#.#...#..",
  W: "#...##...##...##.#.##.#.##.#.#.#.#.", Y: "#...##...#.#.#...#....#....#....#..", "?": ".###.#...#....#...#...#.........#..",
  "!": "..#....#....#....#....#.........#..", ".": "..............................##...", " ": "",
};
const textW = (s: string) => s.length * 6 - 1;
const glyph = (b: Buf, ch: string, x: number, y: number, c: number) => {
  const g = FONT[ch] || "";
  for (let i = 0; i < g.length; i++) if (g[i] === "#") b.px(x + (i % 5), y + Math.floor(i / 5), c);
};
const glyphOutline = (b: Buf, ch: string, x: number, y: number) => {
  const g = FONT[ch] || "";
  for (let i = 0; i < g.length; i++) if (g[i] === "#") for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) b.px(x + (i % 5) + dx, y + Math.floor(i / 5) + dy, K);
};
// подпись печатается по букве на кадр (1/16 такта); новая буква падает на 2 пикселя и вспыхивает жёлтым
const Caption = (b: Buf, text: string, start: number, af: number, y: number, gold: string = "") => {
  if (af < start) return;
  let n = 0;
  text.split("\n").forEach((s, line) => {
    const x0 = Math.floor((W - textW(s)) / 2), ly = y + line * 10;
    const goldFrom = gold ? s.indexOf(gold) : -1;
    const ch = [...s].map((c, i) => ({ c, i, age: af - start - (n + i) })).filter((o) => o.age >= 0);
    n += s.length;
    const dy = (age: number) => (age === 0 ? -2 : age === 1 ? -1 : 0);
    for (const o of ch) glyphOutline(b, o.c, x0 + o.i * 6, ly + dy(o.age));
    for (const o of ch) {
      const isGold = goldFrom >= 0 && o.i >= goldFrom && o.i < goldFrom + gold.length;
      glyph(b, o.c, x0 + o.i * 6, ly + dy(o.age), o.age === 0 ? GL : isGold ? YE : WH);
    }
  });
};

// ---------- мир ----------
const sky = (b: Buf, camY: number, af: number) => {
  const oy = r(camY * 0.6);
  for (let y = 0; y < H; y++) {
    const wy = y + oy;
    for (let x = 0; x < W; x++) {
      const ch = (x + y) & 1;
      let c = N1;
      if (wy > 14 || (wy > 8 && ch)) c = N2;
      if (wy > 56 || (wy > 50 && ch)) c = N3;
      if (wy > 86 || (wy > 80 && ch)) c = LAV;
      b.px(x, y, c);
    }
  }
  for (let i = 0; i < 45; i++) {
    const sx = r(hash(i) * W), sy = r(-90 + hash(i + 99) * 170) - oy;
    if (sy > 82 - oy) continue;
    const tw = hash(i * 7 + Math.floor(af / 3));
    b.px(sx, sy, tw > 0.85 ? WH : tw > 0.3 ? PALE : LAV);
    if (i % 11 === 0 && tw > 0.5) { b.px(sx - 1, sy, LAV); b.px(sx + 1, sy, LAV); b.px(sx, sy - 1, LAV); b.px(sx, sy + 1, LAV); }
  }
  // луна с ореолом (точечный дизеринг)
  const mx = 70, my = 36 - oy;
  for (let j = -15; j <= 15; j++) for (let i = -15; i <= 15; i++) {
    const d = i * i + j * j;
    if (d <= 15 * 15 && d > 11 * 11 && ((mx + i + my + j) & 1) === 0 && b.get(mx + i, my + j) !== K) b.px(mx + i, my + j, b.get(mx + i, my + j) === N1 ? N2 : N3);
  }
  b.disc(mx, my, 10, GL);
  for (const [i, j] of [[-4, -3], [-3, -3], [3, 2], [4, 2], [3, 3], [-2, 5], [5, -5]]) b.px(mx + i, my + j, YE);
  for (let j = -10; j <= 10; j++) for (let i = 4; i <= 10; i++) if (i * i + j * j <= 110 && (i - 3) * (i - 3) + j * j > 60) b.px(mx + i, my + j, YE);
};

const skyline = (b: Buf, camX: number, camY: number, af: number) => {
  // дальний ряд (параллакс 0.3): светлые силуэты в дымке
  const ox = r(camX * 0.3), oy = r(camY * 0.85);
  for (let i = Math.floor((ox - 20) / 13); i < (ox + W) / 13 + 1; i++) {
    const w = 10 + r(hash(i * 3) * 8), h = 26 + r(hash(i * 5 + 1) * 30), x = i * 13 - ox, top = GY - 8 - h - oy;
    b.rect(x, top, w, h + 30, N3);
    if (hash(i * 9) > 0.6) b.rect(x + (w >> 1), top - 6, 1, 6, N3);
    for (let k = 0; k < 6; k++) if (hash(i * 31 + k) > 0.5) b.px(x + 2 + r(hash(i * 13 + k) * (w - 4)), top + 4 + r(hash(i * 17 + k) * (h - 8)), LAV);
  }
  // средний ряд (параллакс 0.6): тёмные дома с горящими окнами
  const ox2 = r(camX * 0.6), oy2 = r(camY * 0.92);
  for (let i = Math.floor((ox2 - 30) / 21); i < (ox2 + W) / 21 + 1; i++) {
    const w = 17 + r(hash(i * 7 + 2) * 7), h = 46 + r(hash(i * 11 + 3) * 34), x = i * 21 - ox2, top = GY - 4 - h - oy2;
    b.rect(x, top, w, h + 30, N2);
    b.rect(x, top, w, 1, N3);
    for (let wy = top + 4; wy < GY - 10 - oy2; wy += 6) for (let wx = x + 3; wx < x + w - 3; wx += 4) {
      const lit = hash(i * 101 + wx * 7 + wy * 13);
      const flick = hash(i * 7 + wx + wy * 3 + Math.floor(af / 9) * 977) > 0.985;
      b.rect(wx, wy, 2, 3, lit > 0.62 && !flick ? (lit > 0.9 ? GL : YE) : N1);
    }
  }
};

const street = (b: Buf, camX: number, camY: number, af: number) => {
  const ox = r(camX), oy = r(camY), gy = GY - oy;
  // фасады у тротуара (параллакс 1)
  for (let i = Math.floor((ox - 40) / 38); i < (ox + W) / 38 + 1; i++) {
    const x = i * 38 - ox, h = 46 + r(hash(i * 3 + 7) * 16), top = gy - h, kind = ((i % 3) + 3) % 3;
    const wall = kind === 0 ? BR : kind === 1 ? DG : GR;
    b.box(x, top, 38, h + 1, wall);
    b.rect(x + 1, top + 1, 36, 2, kind === 1 ? MG : kind === 0 ? DOR : LG); // карниз
    b.rect(x, top + 3, 38, 1, K);
    for (let k = 0; k < 14; k++) b.px(x + 2 + r(hash(i * 41 + k) * 33), top + 6 + r(hash(i * 43 + k) * (h - 12)), K); // кирпичики
    // окна второго этажа
    for (let w = 0; w < 3; w++) {
      const wx = x + 4 + w * 11, wy = top + 8, lit = hash(i * 13 + w) > 0.35;
      b.box(wx, wy, 8, 10, lit ? YE : N2);
      if (lit) { b.rect(wx + 1, wy + 1, 6, 3, GL); b.rect(wx + 1, wy + 5, 6, 1, K); }
      b.rect(wx + 4, wy + 1, 1, 8, K);
    }
    // первый этаж: витрина, дверь, маркиза
    const sy = gy - 22;
    if (kind === 0) {
      for (let s = 0; s < 10; s++) b.rect(x + 3 + s * 3, sy - 4, 3, 4, s % 2 ? WH : OR);
      b.rect(x + 3, sy, 30, 1, K);
      for (let s = 0; s < 10; s++) b.px(x + 4 + s * 3, sy + 1, s % 2 ? WH : OR);
    }
    b.box(x + 4, sy + 3, 18, 19, kind === 2 ? LG : GL);
    b.rect(x + 5, sy + 4, 16, 1, WH);
    for (let k = 0; k < 3; k++) b.rect(x + 7 + k * 5, sy + 14, 3, 7, kind === 2 ? GR : YE);
    b.box(x + 25, sy + 5, 9, 18, kind === 1 ? BR : DG);
    b.px(x + 27, sy + 14, YE);
  }
  // тротуар и бордюр
  b.rect(0, gy, W, 10, MG);
  b.rect(0, gy, W, 1, PALE);
  for (let x = -((ox % 12) + 12) % 12; x < W; x += 12) b.rect(x, gy + 1, 1, 9, DG);
  b.rect(0, gy + 10, W, 1, PALE);
  b.rect(0, gy + 11, W, 2, K);
  b.rect(0, gy + 13, W, H, N1);
  for (let x = -((ox % 24) + 24) % 24; x < W; x += 24) b.rect(x, gy + 21, 10, 2, MG);
  // фонари
  for (let i = Math.floor((ox - 20) / 96); i < (ox + W) / 96 + 1; i++) {
    const lx = i * 96 + 30 - ox;
    for (let j = 0; j < 7; j++) for (let k = -14; k <= 14; k++) { // пятно света на тротуаре
      if ((k * k) / 196 + (j * j) / 49 > 1 || ((lx + k + j) & 1)) continue;
      const c = b.get(lx + k, gy + 2 + j);
      if (c === MG) b.px(lx + k, gy + 2 + j, PALE);
    }
    for (let j = 0; j < 12; j++) for (let k = -12; k <= 12; k++) { // ореол лампы
      if (k * k + j * j * 2 > 140 || ((lx + k + j) & 1)) continue;
      const y = gy - 50 + j - 4, c = b.get(lx + k, y);
      if (c === N1 || c === N2 || c === N3 || c === DG || c === BR || c === GR) b.px(lx + k, y, c === N3 || c === DG ? LAV : N3);
    }
    b.rect(lx - 1, gy - 48, 2, 49, K);
    b.rect(lx - 2, gy - 3, 4, 3, K);
    b.rect(lx - 1, gy - 50, 6, 2, K);
    b.box(lx + 2, gy - 50, 5, 4, GL);
  }
};

// ---------- монета ----------
const coin = (b: Buf, x: number, y: number, ph: number) => {
  const a = [3, 2, 1, 0, 1, 2][((ph % 6) + 6) % 6];
  for (let j = -3; j <= 3; j++) for (let i = -a - 1; i <= a + 1; i++) {
    const e = (i * i) / ((a + 0.6) * (a + 0.6)) + (j * j) / 12.5;
    if (e <= 1) b.px(x + i, y + j, K);
  }
  for (let j = -2; j <= 2; j++) for (let i = -a; i <= a; i++) {
    const e = (i * i) / ((a + 0.1) * (a + 0.1) + 0.01) + (j * j) / 7;
    if (e <= 1.05) b.px(x + i, y + j, i < 0 || a === 0 ? GL : i > 0 && j > 0 ? OR : YE);
  }
  if (a >= 2) { b.px(x, y - 1, OR); b.px(x, y, OR); b.px(x, y + 1, OR); }
};
const flatCoin = (b: Buf, x: number, y: number) => { b.rect(x - 2, y, 5, 2, K); b.rect(x - 1, y, 3, 1, YE); b.px(x - 1, y, GL); b.rect(x - 3, y + 1, 7, 1, K); };
const sparkle = (b: Buf, x: number, y: number, age: number) => {
  const s = [1, 2, 3, 2, 1][age];
  if (s === undefined) return;
  for (let k = 1; k <= s; k++) { b.px(x + k, y, k === s ? PALE : GL); b.px(x - k, y, k === s ? PALE : GL); b.px(x, y + k, k === s ? PALE : GL); b.px(x, y - k, k === s ? PALE : GL); }
  b.px(x, y, WH);
};

// ---------- герой: белая голова, шапка с помпоном, оранжевая куртка, жёлтый рюкзак ----------
const HEAD = [
  "....kkk......",
  "...kpppk.....",
  "...kpppkkk...",
  "..kkbbbbbbk..",
  ".kbbbbbbbbbk.",
  ".kBBBBBBBBBk.",
  ".kwwwwwwwwwk.",
  ".kwwwwwwwwwk.",
  ".kwwwwwwwwwk.",
  ".kswwwwwwwwk.",
  ".ksswwwwwwwk.",
  "..ksssswwwk..",
  "...kkkkkkk...",
];
const HC: Record<string, number> = { k: K, p: MG, b: DG, B: MG, w: WH, s: PALE };
type Pose = { feet: [number, number][]; hand: [number, number]; hand2: [number, number]; dy: number; eye: "fwd" | "up" | "joy" | "wow" };

const hero = (b: Buf, x: number, gy: number, p: Pose) => {
  const top = gy - 25 + p.dy;
  const leg = (hx: number, hy: number, fx: number, fy: number) => {
    const len = fy - hy;
    if (len >= 4) b.line(hx, hy, fx, fy, K);
    else { const kx = Math.max(hx, fx) + (5 - len), ky = r((hy + fy) / 2) - 1; b.line(hx, hy, kx, ky, K); b.line(kx, ky, fx, fy, K); }
    b.rect(fx - 1, fy, 1, 2, K); b.rect(fx, fy, 3, 1, WH); b.px(fx + 3, fy, K); b.rect(fx, fy + 1, 4, 1, K);
  };
  // задняя рука за телом
  b.line(x + 6, top + 15, x + p.hand2[0], top + p.hand2[1], K);
  // ноги
  leg(x + 6, top + 19, x + p.feet[0][0], gy - 2 + p.feet[0][1]);
  leg(x + 8, top + 19, x + p.feet[1][0], gy - 2 + p.feet[1][1]);
  // рюкзак и куртка
  b.box(x, top + 13, 5, 6, YE); b.rect(x + 1, top + 17, 3, 1, OR); b.px(x + 1, top + 14, GL);
  b.box(x + 4, top + 12, 7, 8, OR); b.rect(x + 5, top + 18, 5, 1, DOR); b.rect(x + 5, top + 13, 1, 5, DOR);
  b.rect(x + 8, top + 13, 1, 5, DOR); b.px(x + 6, top + 13, BR);
  // голова
  HEAD.forEach((row, j) => { for (let i = 0; i < row.length; i++) if (row[i] !== ".") b.px(x + i - 1, top + j, HC[row[i]]); });
  const ex = x + 8, ey = top + (p.eye === "up" ? 6 : 7);
  if (p.eye === "joy") { b.px(ex, ey, K); b.px(ex - 1, ey + 1, K); b.px(ex + 1, ey + 1, K); }
  else if (p.eye === "wow") { b.rect(ex, ey - 1, 1, 3, K); b.rect(ex - 3, ey - 1, 1, 3, K); }
  else { b.rect(ex, ey, 1, 2, K); b.rect(ex - 3, ey, 1, 2, K); }
  if (p.eye === "joy" || p.eye === "wow") b.rect(ex - 2, top + 10, 2, 1 + (p.eye === "wow" ? 1 : 0), K);
  else b.rect(ex - 2, top + 10, 2, 1, PALE);
  // передняя рука и кисть
  const sx = x + 8, sy = top + 14, hx = x + p.hand[0], hy = top + p.hand[1];
  b.line(sx, sy, hx, hy, K);
  b.px(hx, hy, WH); b.px(hx + (hx >= sx ? 1 : -1), hy, K);
};

// ---------- сюжет (af = кадр анимации, 10 в секунду) ----------
const WALK_END = 36;
const heroX = (af: number) => 20 + Math.floor(Math.min(af, WALK_END) * 1.5);
const COIN_X = heroX(WALK_END) + 16;
const camXAt = (af: number) => heroX(af) - 34 + r(ease((af - 36) / 60) * 8);
const camYAt = (af: number) => (af < 64 ? -r(ease((af - 48) / 8) * 50) : -r((1 - ease((af - 64) / 8)) * 50));

const coinFlight = (af: number) => { // монета после броска: x, y (мировые)
  const hx = heroX(af) + 12, y0 = GY - 25 + 9;
  if (af < 56) { const t = (af - 48) / 8; return [hx + r(t * 3), r(y0 - (1 - (1 - t) * (1 - t)) * 92)]; }
  return [hx + 3, y0 - 92 + (Math.floor((af - 56) / 2) % 2)];
};
// 16 монет после удвоения + дождь: каждая падает на своё место у ног героя, кучка растёт
const RAIN = Array.from({ length: 34 }, (_, i) => {
  const side = i % 2 ? 1 : -1, slot = Math.floor(i / 2);
  const lx = heroX(WALK_END) + 6 + side * (12 + (slot % 4) * 5 + (Math.floor(slot / 4) % 2) * 2) + (side < 0 ? 0 : 2);
  const level = Math.floor(slot / 4);
  return { lx, ly: GY - 2 - level * 2, t0: 68 + Math.floor(i * 0.75) + (i < 16 ? 0 : 2), h0: GY - 130 - r(hash(i + 5) * 30), ph: i };
});

const poseAt = (af: number): Pose => {
  if (af < WALK_END) {
    const ph = af % 4;
    const feet: [number, number][][] = [[[3, 0], [10, 0]], [[6, -1], [8, 0]], [[10, 0], [3, 0]], [[8, 0], [6, -1]]];
    const sw = [[13, 19], [10, 19], [6, 19], [10, 19]];
    const bob = ph % 2 ? -1 : 0;
    return { feet: feet[ph], hand: [sw[ph][0], sw[ph][1] + bob], hand2: [sw[(ph + 2) % 4][0] - 3, 19], dy: bob, eye: "fwd" };
  }
  const st: [number, number][] = [[4, 0], [9, 0]];
  if (af < 40) return { feet: st, hand: [10, 19], hand2: [4, 19], dy: 0, eye: "wow" };
  if (af < 45) { const d = [1, 3, 4, 4, 3][af - 40]; return { feet: st, hand: [12 + (d > 2 ? 4 : 2), 23 - d - (d > 2 ? 0 : 3)], hand2: [4, 19], dy: d, eye: "fwd" }; }
  if (af < 48) return { feet: st, hand: [12, 15], hand2: [4, 19], dy: af === 45 ? 1 : 0, eye: "fwd" };
  if (af < 50) return { feet: st, hand: [12, 7], hand2: [4, 19], dy: af === 48 ? -1 : 0, eye: "up" };
  if (af < 68) return { feet: st, hand: [11, 12], hand2: [3, 19], dy: 0, eye: af < 58 ? "up" : "wow" };
  const jumps = [72, 80];
  for (const j of jumps) if (af >= j && af < j + 6) {
    const k = af - j, y = [-2, -5, -7, -6, -4, -1][k];
    return { feet: [[4, -1 + y], [9, 0 + y]], hand: [12, 3], hand2: [1, 4], dy: y, eye: "joy" };
  }
  return { feet: st, hand: [12, af < 72 ? 12 : 6], hand2: [2, af < 72 ? 19 : 7], dy: (af >= 86 && af % 4 === 1) ? -1 : 0, eye: af < 72 ? "wow" : "joy" };
};

const draw = (b: Buf, af: number) => {
  const camX = camXAt(af), camY = camYAt(af);
  sky(b, camY, af);
  skyline(b, camX, camY, af);
  street(b, camX, camY, af);
  const sx = (wx: number) => r(wx - camX), sy = (wy: number) => r(wy - camY);
  const hx = heroX(af);
  // монета на тротуаре и её блеск
  if (af < 44) { flatCoin(b, sx(COIN_X), sy(GY - 3)); for (const g of [10, 22, 32]) if (af >= g && af < g + 5) sparkle(b, sx(COIN_X), sy(GY - 4), af - g); }
  // монеты, уже лежащие кучкой (рисуем до героя: они у его ног)
  for (const c of [...RAIN].sort((a, b2) => b2.ly - a.ly)) if (af >= c.t0 + 8) flatCoin(b, sx(c.lx), sy(c.ly - 1));
  hero(b, sx(hx), sy(GY), poseAt(af));
  // монета в руке
  if (af >= 44 && af < 48) { const p = poseAt(af); coin(b, sx(hx + p.hand[0] + 1), sy(GY - 25 + p.dy + p.hand[1] - 3), af); }
  // полёт, зависание, удвоение
  if (af >= 48 && af < 68) {
    const [cx, cy] = coinFlight(af);
    const n = af < 60 ? 1 : af < 62 ? 2 : af < 64 ? 4 : af < 66 ? 8 : 16;
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * Math.PI * 2 + af * 0.15, rad = n === 1 ? 0 : 6 + n;
      coin(b, sx(cx + r(Math.cos(ang) * rad)), sy(cy + r(Math.sin(ang) * rad * 0.8)), af + i);
    }
    if (af >= 56 && af < 61) sparkle(b, sx(cx + 6), sy(cy - 5), af - 56);
    for (const g of [60, 62, 64, 66]) if (af >= g && af < g + 3) sparkle(b, sx(cx - 8 + (g - 60) * 3), sy(cy + 7 - (g - 60)), af - g + 1);
    if (af >= 52 && af < 56) for (let k = 1; k < 4; k++) b.px(sx(cx), sy(cy + k * 4 + (56 - af)), k === 1 ? GL : YE); // след
  }
  // монетный дождь
  for (const c of RAIN) {
    if (af < c.t0 || af >= c.t0 + 8) continue;
    const t = (af - c.t0) / 8, y = r(c.h0 + (c.ly - 3 - c.h0) * t * t);
    coin(b, sx(c.lx), sy(y), c.ph + af);
    if (af === c.t0 + 7) sparkle(b, sx(c.lx + 2), sy(c.ly - 6), 1);
  }
  // «!» над головой
  if (af >= 36 && af < 41) { const lift = af === 36 ? 2 : af === 37 ? 1 : 0; glyphOutline(b, "!", sx(hx + 4), sy(GY - 36) - lift); glyph(b, "!", sx(hx + 4), sy(GY - 36) - lift, YE); }
  // подписи
  if (af < 36) Caption(b, "WHAT IF YOU", 2, af, 6);
  else if (af < 60) Caption(b, "FOUND A\nMAGIC COIN?", 36, af, 6, "COIN");
  else if (af < 72) Caption(b, "IT DOUBLES", 60, af, 6, "DOUBLES");
  else Caption(b, "EVERY NIGHT!", 72, af, 6, "NIGHT");
};

export const PixelTest: React.FC = () => {
  const frame = useCurrentFrame();
  const af = Math.floor(frame / STEP);
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    const b = new Buf(); draw(b, af);
    const img = ctx.createImageData(W, H);
    for (let i = 0; i < W * H; i++) { const c = RGB[b.d[i]]; img.data[i * 4] = c[0]; img.data[i * 4 + 1] = c[1]; img.data[i * 4 + 2] = c[2]; img.data[i * 4 + 3] = 255; }
    ctx.putImageData(img, 0, 0);
  }, [af]);
  return (
    <AbsoluteFill style={{ backgroundColor: PAL[K] }}>
      <canvas ref={ref} width={W} height={H} style={{ width: W * SCALE, height: H * SCALE, imageRendering: "pixelated" }} />
      <Audio src={staticFile("pixel/sound.wav")} />
    </AbsoluteFill>
  );
};

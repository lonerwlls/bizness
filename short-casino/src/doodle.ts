// Персонаж-дудл на Canvas 2D — порт kit/chars.py: тот же дизайн и та же мимика.
// Локальные координаты в метрах: x вправо, z вверх, 0 = пол. Плоскость PLANE_W × PLANE_H.
export type Look = { body: string; hair: "bowl" | "spiky" | "long" | "slick" | "quiff"; tie?: string; lanyard?: boolean; hero?: boolean };
// Главный герой канала «Тим» (hero): тёмно-серое худи с капюшоном, свободные брюки, кроссовки-«дутыши»
// с мятным носком и оранжевой подошвой, причёска-«волна» и визитная карточка — оранжевые наушники на голове.
export const HERO: Look = { body: "#4b4f58", hair: "quiff", hero: true };
const PANTS = "#6f7d8c", SLEEVE = "#4b4f58", ORANGE = "#ff7a1a", MINT = "#5fe0c0";
export type Pose = {
  expr: string; blink: boolean; bonk: number; breathe: number; lookX?: number; talk?: number;
  lean?: number; tilt?: number; squash?: number; hip?: number;
  handF?: [number, number]; handB?: [number, number]; bendF?: number; bendB?: number;
};

const INK = "#2a1d1a";
export const PLANE_W = 1.4, PLANE_H = 2.1;
export const CW = 560, CH = Math.round((CW * PLANE_H) / PLANE_W);
const K = CW / PLANE_W;
const X = (x: number) => CW / 2 + x * K;
const Y = (z: number) => CH - z * K;
const R0 = 0.27, W = 0.27, H = 0.36, HIP = 0.4;

type Ex = { eyes: string; brow: [number, number]; brow2?: [number, number]; mouth: [string, number]; sweat?: boolean; cheeks?: boolean; shake?: boolean;
  look?: number; px?: number; py?: number; mark?: string; tears?: boolean };
const EXPR: Record<string, Ex> = {
  // ---- новые эмоции героя (каждая — под свой момент рассказа)
  suspicious: { eyes: "half", brow: [-0.3, -0.01], brow2: [0.5, 0.05], mouth: ["side", 0], px: 0.7 },          // подозрительно косится
  skeptic: { eyes: "lid", brow: [-0.2, 0], brow2: [0.55, 0.06], mouth: ["smirk", 0.6], mark: "?" },             // бровь домиком, ухмылка
  dreamy: { eyes: "happy", brow: [0.35, 0.03], mouth: ["smile", 0], py: -0.6, cheeks: true },                   // «всего на 10 минут»
  wink: { eyes: "wink", brow: [0.1, 0.02], mouth: ["grin", 0.9] },                                              // уверенно подмигивает
  awe: { eyes: "sparkle", brow: [0.5, 0.06], mouth: ["o", 0.9] },                                               // восхищение залом
  money: { eyes: "dollar", brow: [0.4, 0.05], mouth: ["grin", 1.1], mark: "$" },                                // глаза-доллары
  grimace: { eyes: "wide", brow: [0.5, 0.04], mouth: ["teeth", 0], px: -0.2, sweat: true },                     // проигрыш: «и-и-и»
  ecstatic: { eyes: "star", brow: [0.5, 0.06], mouth: ["open", 1], shake: true, mark: "!!" },                   // снова выиграл
  panic: { eyes: "tiny", brow: [0.6, 0.07], mouth: ["wobble", 0], sweat: true, shake: true, mark: "!" },        // телефон сел
  squint: { eyes: "squeeze", brow: [-0.3, -0.02], mouth: ["teeth", 0] },                                        // слепит рассвет
  dizzy: { eyes: "spiral", brow: [0.3, 0.03], mouth: ["wobble", 0], mark: "?" },                                // «как такое возможно?»
  sleepy: { eyes: "half", brow: [0.1, -0.01], mouth: ["yawn", 0], mark: "z" },                                  // зевает перед сном
  thinking: { eyes: "oval", brow: [-0.2, 0], brow2: [0.4, 0.04], mouth: ["side", 0], px: 0.5, py: -0.7 },       // вспоминает
  aha: { eyes: "wide", brow: [0.5, 0.07], mouth: ["grin", 0.7], mark: "!" },                                    // догадался
  angry: { eyes: "lid", brow: [-0.7, -0.03], mouth: ["teeth", 0], cheeks: false },                              // «нарочно!»
  sad: { eyes: "oval", brow: [0.7, 0.03], mouth: ["frown", 0], py: 0.5 },                                       // деньги уходят
  smart: { eyes: "lid", brow: [0.15, 0.02], mouth: ["smile", 0], mark: "" },                                    // лектор у плаката
  deadpan: { eyes: "half", brow: [0, -0.02], mouth: ["pressed", 0] },                                           // «It left.»
  crying: { eyes: "teary", brow: [0.8, 0.04], mouth: ["wobble", 0], tears: true, shake: true },                 // «Yesterday.»
  neutral: { eyes: "oval", brow: [0, 0], mouth: ["flat", 0] },
  smug: { eyes: "lid", brow: [0.25, 0.015], mouth: ["smirk", 0.6] },
  proud: { eyes: "happy", brow: [0.2, 0.02], mouth: ["grin", 0.8] },
  grin: { eyes: "oval", brow: [-0.15, 0], mouth: ["grin", 1] },
  laugh: { eyes: "happy", brow: [0.25, 0.03], mouth: ["open", 0.85], shake: true },
  nervous: { eyes: "wide", brow: [0.4, 0.03], mouth: ["squiggle", 0], sweat: true, look: -0.35 },
  shock: { eyes: "wide", brow: [0.55, 0.06], mouth: ["open", 0.95], sweat: true, shake: true },
  realize: { eyes: "wide", brow: [0.45, 0.05], mouth: ["o", 0.7] },
  blank: { eyes: "lid", brow: [0, -0.01], mouth: ["o", 0.3] },
  holdlaugh: { eyes: "squeeze", brow: [0.3, 0], mouth: ["pressed", 0], cheeks: true, shake: true },
  stern: { eyes: "lid", brow: [-0.45, -0.02], mouth: ["flat", -0.2] },
};

const shade = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${[(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v * k)).join(",")})`;
};

export function drawDoodle(ctx: CanvasRenderingContext2D, look: Look, p: Pose, rnd: () => number) {
  ctx.clearRect(0, 0, CW, CH);
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  const E = EXPR[p.expr] ?? EXPR.neutral;
  const sq = (p.squash ?? 1) * (1 + p.breathe) * (1 - 0.07 * p.bonk);
  const hip = (p.hip ?? HIP);
  const lean = p.lean ?? 0;
  const bh = H * sq * (look.hero ? 1.04 : 1), bw = W / Math.sqrt(sq) * (look.hero ? 1.22 : 1);
  // точка на теле (x,z от таза) → локальные координаты с наклоном
  const B = (x: number, z: number): [number, number] => {
    const c = Math.cos(lean), s = Math.sin(lean);
    return [x * c + z * s, hip - x * s + z * c];
  };
  const stroke = (w: number, col = INK) => { ctx.strokeStyle = col; ctx.lineWidth = w * K; };
  // тень
  ctx.fillStyle = "rgba(0,0,0,0.22)"; ctx.beginPath(); ctx.ellipse(X(0), Y(0.01), W * 0.85 * K, 0.03 * K, 0, 0, Math.PI * 2); ctx.fill();
  const limb = (a: [number, number], b: [number, number], bend: number) => {
    const dx = b[0] - a[0], dz = b[1] - a[1];
    const cx = (a[0] + b[0]) / 2 - dz * bend, cz = (a[1] + b[1]) / 2 + dx * bend;
    stroke(0.032); ctx.beginPath(); ctx.moveTo(X(a[0]), Y(a[1])); ctx.quadraticCurveTo(X(cx), Y(cz), X(b[0]), Y(b[1])); ctx.stroke();
  };
  const arm = (a: [number, number], b: [number, number], bend: number) => {
    if (!look.hero) return limb(a, b, bend);
    const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz) || 1;
    const e: [number, number] = [b[0] - (dx / L) * 0.05, b[1] - (dz / L) * 0.05];
    const cx = (a[0] + e[0]) / 2 - (e[1] - a[1]) * bend, cz = (a[1] + e[1]) / 2 + (e[0] - a[0]) * bend;
    for (const [w, col] of [[0.1, INK], [0.072, SLEEVE]] as [number, string][]) { stroke(w, col); ctx.beginPath(); ctx.moveTo(X(a[0]), Y(a[1])); ctx.quadraticCurveTo(X(cx), Y(cz), X(e[0]), Y(e[1])); ctx.stroke(); }
    stroke(0.03, "#3a3d44"); ctx.beginPath(); ctx.moveTo(X(e[0]), Y(e[1])); ctx.lineTo(X(e[0] - (dx / L) * 0.004), Y(e[1] - (dz / L) * 0.004)); ctx.stroke();
  };
  const hand = (h: [number, number]) => {
    ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(X(h[0]), Y(h[1]), 0.05 * K, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.ellipse(X(h[0] - 0.017), Y(h[1] + 0.017), 0.009 * K, 0.006 * K, 0.6, 0, Math.PI * 2); ctx.fill();
  };
  // ноги
  if (look.hero) for (const s of [1, -1]) {
    const a = B(s * W * 0.24, 0.06);
    ctx.fillStyle = PANTS; ctx.beginPath(); ctx.moveTo(X(a[0] - 0.055), Y(a[1])); ctx.lineTo(X(a[0] + 0.055), Y(a[1]));
    ctx.lineTo(X(s * 0.11 + 0.07), Y(0.08)); ctx.quadraticCurveTo(X(s * 0.11), Y(0.06), X(s * 0.11 - 0.07), Y(0.08)); ctx.closePath(); ctx.fill(); stroke(0.018); ctx.stroke();
    stroke(0.008, "#55606d"); ctx.beginPath(); ctx.moveTo(X(a[0] + 0.01 * s), Y(a[1] - 0.05)); ctx.lineTo(X(s * 0.12), Y(0.12)); ctx.stroke();
    // кроссовок: белый верх, мятный нос, толстая оранжевая подошва
    const fx = s * 0.11 + 0.01;
    ctx.fillStyle = "#f7f5ef"; ctx.beginPath(); ctx.ellipse(X(fx), Y(0.045), 0.11 * K, 0.07 * K, 0, Math.PI, Math.PI * 2); ctx.closePath(); ctx.fill(); stroke(0.016); ctx.stroke();
    ctx.fillStyle = MINT; ctx.beginPath(); ctx.ellipse(X(fx - 0.06), Y(0.045), 0.05 * K, 0.04 * K, 0, Math.PI, Math.PI * 2); ctx.closePath(); ctx.fill(); stroke(0.012); ctx.stroke();
    stroke(0.008); for (const k of [0.01, 0.04]) { ctx.beginPath(); ctx.moveTo(X(fx + k - 0.02), Y(0.085)); ctx.lineTo(X(fx + k + 0.015), Y(0.075)); ctx.stroke(); }
    ctx.fillStyle = ORANGE; ctx.beginPath(); ctx.roundRect(X(fx - 0.12), Y(0.05), 0.24 * K, 0.05 * K, 0.022 * K); ctx.fill(); stroke(0.016); ctx.stroke();
  }
  else for (const s of [1, -1]) {
    limb(B(s * W * 0.2, 0.05), [s * 0.08, 0.03], s * 0.04);
    ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(X(s * 0.08 + 0.015), Y(0.022), 0.05 * K, 0.026 * K, 0, 0, Math.PI * 2); ctx.fill();
  }
  const shB = B(W * 0.44, bh * 0.7), shF = B(-W * 0.44, bh * 0.7);
  const hB = p.handB ?? [W * 0.75, HIP + 0.06], hF = p.handF ?? [-W * 0.75, HIP + 0.06];
  arm(shB, hB, p.bendB ?? -0.12); hand(hB);
  // тело
  ctx.save();
  const o = B(0, 0); ctx.translate(X(o[0]), Y(o[1])); ctx.rotate(lean);
  const body = () => { ctx.beginPath(); ctx.roundRect(-bw / 2 * K, -bh * K, bw * K, bh * K, bw * 0.45 * K); };
  ctx.fillStyle = look.body; body(); ctx.fill();
  ctx.save(); body(); ctx.clip(); ctx.fillStyle = shade(look.body, 0.62); ctx.fillRect(bw * 0.2 * K, -bh * K, bw * K, bh * K); ctx.restore();
  stroke(0.028); body(); ctx.stroke();
  if (look.hero) {
    // капюшон, лежащий на плечах
    ctx.fillStyle = shade(look.body, 0.8); ctx.beginPath(); ctx.ellipse(0, -bh * 0.96 * K, bw * 0.42 * K, 0.06 * K, 0, 0, Math.PI * 2); ctx.fill(); stroke(0.02); ctx.stroke();
    // карман-«кенгуру»
    stroke(0.012); ctx.beginPath(); ctx.moveTo(-bw * 0.3 * K, -bh * 0.12 * K); ctx.lineTo(-bw * 0.22 * K, -bh * 0.42 * K); ctx.lineTo(bw * 0.22 * K, -bh * 0.42 * K); ctx.lineTo(bw * 0.3 * K, -bh * 0.12 * K); ctx.stroke();
    // шнурки с оранжевыми наконечниками
    for (const sx of [-1, 1]) { stroke(0.01, "#e8e4da"); ctx.beginPath(); ctx.moveTo(sx * bw * 0.1 * K, -bh * 0.92 * K); ctx.lineTo(sx * bw * 0.12 * K, -bh * 0.68 * K); ctx.stroke();
      ctx.fillStyle = ORANGE; ctx.beginPath(); ctx.arc(sx * bw * 0.12 * K, -bh * 0.66 * K, 0.012 * K, 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.fillStyle = "#f7f7f2"; stroke(0.01);
  if (!look.hero) { ctx.beginPath(); ctx.moveTo(-W * 0.2 * K, -bh * K); ctx.lineTo(0, -bh * 0.62 * K); ctx.lineTo(W * 0.2 * K, -bh * K); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  if (look.tie) {
    ctx.fillStyle = look.tie; ctx.beginPath(); ctx.moveTo(-W * 0.035 * K, -bh * 0.95 * K); ctx.lineTo(W * 0.035 * K, -bh * 0.95 * K);
    ctx.lineTo(W * 0.05 * K, -bh * 0.55 * K); ctx.lineTo(0, -bh * 0.48 * K); ctx.lineTo(-W * 0.05 * K, -bh * 0.55 * K); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  if (look.lanyard) {
    stroke(0.018, "#2f6fd6"); ctx.beginPath(); ctx.moveTo(-W * 0.16 * K, -bh * 0.98 * K); ctx.lineTo(-W * 0.2 * K, -bh * 0.44 * K); ctx.stroke();
    ctx.fillStyle = "#fff"; stroke(0.008); ctx.fillRect(-W * 0.3 * K, -bh * 0.44 * K, W * 0.2 * K, bh * 0.22 * K); ctx.strokeRect(-W * 0.3 * K, -bh * 0.44 * K, W * 0.2 * K, bh * 0.22 * K);
  }
  if (!look.hero) { stroke(0.008); ctx.beginPath(); ctx.moveTo(W * 0.12 * K, -bh * 0.5 * K); ctx.lineTo(W * 0.36 * K, -bh * 0.5 * K); ctx.stroke(); }
  ctx.restore();
  // голова
  const top = B(0, bh + R0 * 0.78);
  const hr = R0 * (1 + 0.14 * p.bonk);
  const shk = E.shake ? (rnd() - 0.5) * 0.012 : 0;
  ctx.save();
  ctx.translate(X(top[0] + shk), Y(top[1] + shk)); ctx.rotate(lean * 0.7 + (p.tilt ?? 0) + 0.06 * p.bonk);
  const r = hr * K;
  ctx.fillStyle = "#f5f1ea"; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = "#d8d2c8"; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.arc(-r * 0.1, -r * 0.08, r * 0.82, 0, Math.PI * 2, true); ctx.fill("evenodd");
  ctx.restore();
  stroke(0.028); ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
  // волосы (чёлка выше бровей)
  ctx.fillStyle = "#1b1615"; ctx.beginPath(); ctx.arc(0, 0, r * 1.05, Math.PI, Math.PI * 2);
  const fr = look.hair === "slick" ? 0.55 : 0.46;
  ctx.lineTo(r * 0.85, -r * (fr - 0.04)); ctx.lineTo(r * 0.45, -r * (fr + 0.02)); ctx.lineTo(-r * 0.2, -r * (fr + 0.06)); ctx.lineTo(-r * 0.8, -r * fr);
  ctx.closePath(); ctx.fill(); stroke(0.022); ctx.stroke();
  ctx.fillStyle = "#1b1615";
  if (look.hair === "spiky") for (let i = 0; i < 6; i++) { const a = Math.PI * (1.08 + i * 0.17);
    ctx.beginPath(); ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r * 0.9); ctx.lineTo(Math.cos(a + 0.08) * r * 1.28, Math.sin(a + 0.08) * r * 1.22); ctx.lineTo(Math.cos(a + 0.17) * r, Math.sin(a + 0.17) * r * 0.9); ctx.fill(); }
  if (look.hair === "quiff") {
    // большая «волна» надо лбом, закрученная вперёд, и два хохолка на макушке сзади — силуэт узнаётся издалека
    ctx.beginPath(); ctx.moveTo(-r * 0.9, -r * 0.5); ctx.bezierCurveTo(-r * 1.0, -r * 1.75, r * 0.2, -r * 2.15, r * 1.15, -r * 1.55);
    ctx.bezierCurveTo(r * 1.25, -r * 1.25, r * 0.95, -r * 1.1, r * 0.75, -r * 1.3); ctx.bezierCurveTo(r * 0.75, -r * 1.05, r * 0.4, -r * 0.95, -r * 0.1, -r * 0.6); ctx.closePath();
    ctx.fill(); stroke(0.022); ctx.stroke();
    stroke(0.01, "#6b5a55"); ctx.beginPath(); ctx.moveTo(-r * 0.6, -r * 1.05); ctx.bezierCurveTo(-r * 0.45, -r * 1.6, r * 0.3, -r * 1.8, r * 0.9, -r * 1.5); ctx.stroke();
    ctx.fillStyle = "#1b1615";
    for (const [ax, ay] of [[-r * 0.95, -r * 0.35], [-r * 1.0, -r * 0.05]]) { ctx.beginPath(); ctx.moveTo(ax + r * 0.12, ay - r * 0.12); ctx.lineTo(ax - r * 0.2, ay - r * 0.05); ctx.lineTo(ax + r * 0.08, ay + r * 0.1); ctx.fill(); }
  }
  if (look.hero) {
    // наушники: оранжевое оголовье над волнами и большие чашки по бокам
    stroke(0.075); ctx.beginPath(); ctx.arc(0, -r * 0.05, r * 1.12, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
    stroke(0.045, ORANGE); ctx.beginPath(); ctx.arc(0, -r * 0.05, r * 1.12, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
    for (const sx of [-1, 1]) {
      ctx.fillStyle = ORANGE; ctx.beginPath(); ctx.roundRect(sx * r * 1.0 - r * 0.17, r * 0.0 - r * 0.28, r * 0.34, r * 0.56, r * 0.16); ctx.fill(); stroke(0.024); ctx.stroke();
      ctx.fillStyle = "#2a2d33"; ctx.beginPath(); ctx.roundRect(sx * r * 1.0 - r * 0.07, -r * 0.18, r * 0.14, r * 0.36, r * 0.07); ctx.fill();
    }
  }
  if (look.hair === "long") { ctx.fillRect(-r * 1.06, -r * 0.1, r * 0.22, r * 1.15); ctx.fillRect(r * 0.84, -r * 0.1, r * 0.22, r * 1.15); }
  stroke(0.012, "#ffffff"); ctx.beginPath(); ctx.arc(-r * 0.15, -r * 0.2, r * 0.75, Math.PI * 1.25, Math.PI * 1.5); ctx.stroke();
  // глаза
  let eyes = E.eyes;
  if (p.blink && ["oval", "wide", "lid"].includes(eyes)) eyes = "closed";
  const lx = ((p.lookX ?? 0) + (E.look ? 0 : 0)) * r;
  const [bt, bhh] = E.brow;
  const pxo = (E.px ?? 0) * r * 0.06, pyo = (E.py ?? 0) * r * 0.06;
  const halfClip = (ex: number, ey: number, top: number, draw: () => void) => {
    ctx.save(); ctx.beginPath(); ctx.rect(ex - r * 0.25, ey + top, r * 0.5, r * 0.4); ctx.clip(); draw(); ctx.restore();
  };
  for (const s of [-1, 1]) {
    const ex = s * r * 0.34, ey = -r * 0.02;
    let ee = eyes;
    if (ee === "wink") ee = s < 0 ? "oval" : "happy";
    ctx.fillStyle = INK;
    if (ee === "oval") {
      ctx.beginPath(); ctx.ellipse(ex + lx * 0.06 + pxo, ey + pyo, r * 0.095, r * 0.13, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.ellipse(ex + lx * 0.06 + pxo - r * 0.03, ey + pyo - r * 0.05, r * 0.03, r * 0.035, 0, 0, Math.PI * 2); ctx.fill();
    } else if (ee === "wide" || ee === "tiny") {
      const pr = ee === "tiny" ? 0.022 : 0.045;
      ctx.fillStyle = "#fff"; stroke(0.016); ctx.beginPath(); ctx.ellipse(ex, ey, r * 0.19, r * (ee === "tiny" ? 0.18 : 0.15), 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(ex + lx * 0.09 + pxo * 1.5, ey + (E.look ?? 0) * -r * 0.1 + pyo, r * pr, r * (pr + 0.005), 0, 0, Math.PI * 2); ctx.fill();
    } else if (ee === "lid") {
      ctx.beginPath(); ctx.ellipse(ex + lx * 0.05 + pxo, ey + r * 0.02, r * 0.09, r * 0.08, 0, 0, Math.PI * 2); ctx.fill();
      stroke(0.018); ctx.beginPath(); ctx.moveTo(ex - r * 0.14, ey - r * 0.045); ctx.lineTo(ex + r * 0.14, ey - r * 0.045); ctx.stroke();
    } else if (ee === "half") {
      // тяжёлые веки: видна только нижняя половина зрачка
      halfClip(ex, ey, r * 0.0, () => { ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(ex + pxo * 1.4, ey + r * 0.02, r * 0.1, r * 0.11, 0, 0, Math.PI * 2); ctx.fill(); });
      stroke(0.022); ctx.beginPath(); ctx.moveTo(ex - r * 0.15, ey + r * 0.005 - s * r * 0.01); ctx.lineTo(ex + r * 0.15, ey + r * 0.005 + s * r * 0.01); ctx.stroke();
    } else if (ee === "happy") {
      stroke(0.022); ctx.beginPath(); ctx.arc(ex, ey + r * 0.07 + pyo * 0.5, r * 0.12, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
    } else if (ee === "closed") {
      stroke(0.018); ctx.beginPath(); ctx.arc(ex, ey - r * 0.08, r * 0.11, Math.PI * 0.2, Math.PI * 0.8); ctx.stroke();
    } else if (ee === "squeeze") {
      stroke(0.022); ctx.beginPath(); ctx.moveTo(ex - s * r * 0.13, ey - r * 0.08); ctx.lineTo(ex + s * r * 0.09, ey); ctx.lineTo(ex - s * r * 0.13, ey + r * 0.08); ctx.stroke();
    } else if (ee === "sparkle") {
      // большие блестящие глаза с двумя бликами
      ctx.beginPath(); ctx.ellipse(ex, ey, r * 0.13, r * 0.16, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.ellipse(ex - r * 0.04, ey - r * 0.06, r * 0.05, r * 0.055, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(ex + r * 0.05, ey + r * 0.06, r * 0.022, 0, Math.PI * 2); ctx.fill();
    } else if (ee === "dollar" || ee === "star") {
      ctx.save(); ctx.translate(ex, ey);
      if (ee === "dollar") { ctx.fillStyle = "#2f9e4a"; ctx.font = `900 ${r * 0.42}px Arial Black, Arial`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        stroke(0.012); ctx.strokeText("$", 0, r * 0.01); ctx.fillText("$", 0, r * 0.01); }
      else { ctx.fillStyle = "#ffc93a"; ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = (i % 2 ? 0.075 : 0.18) * r; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
        ctx.closePath(); ctx.fill(); stroke(0.012); ctx.stroke(); }
      ctx.restore();
    } else if (ee === "spiral") {
      stroke(0.015); ctx.beginPath(); for (let i = 0; i <= 40; i++) { const a = i * 0.33 * s, rr = (i / 40) * r * 0.19; i ? ctx.lineTo(ex + Math.cos(a) * rr, ey + Math.sin(a) * rr) : ctx.moveTo(ex, ey); } ctx.stroke();
    } else if (ee === "teary") {
      ctx.beginPath(); ctx.ellipse(ex, ey, r * 0.12, r * 0.15, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#7cc4ff"; ctx.beginPath(); ctx.ellipse(ex, ey + r * 0.08, r * 0.11, r * 0.06, 0, 0, Math.PI); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.ellipse(ex - r * 0.04, ey - r * 0.06, r * 0.045, r * 0.05, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(ex + r * 0.05, ey + r * 0.02, r * 0.025, 0, Math.PI * 2); ctx.fill();
    }
    const [bt2, bh2] = s > 0 && E.brow2 ? E.brow2 : [bt, bhh];
    const by = ey - r * 0.27 - bh2 * r * 2 - (["wide", "tiny", "sparkle", "teary"].includes(ee) ? 0.04 * r : 0);
    const inner = ex - s * r * 0.13, outer = ex + s * r * 0.15;
    stroke(0.028); ctx.beginPath(); ctx.moveTo(outer, by + bt2 * r * 0.07); ctx.lineTo((inner + outer) / 2, by - r * 0.02); ctx.lineTo(inner, by - bt2 * r * 0.14); ctx.stroke();
    if (E.tears) { ctx.fillStyle = "#7cc4ff"; stroke(0.008, "#3d7fd0"); ctx.beginPath(); ctx.moveTo(ex + s * r * 0.06, ey + r * 0.14);
      ctx.quadraticCurveTo(ex + s * r * 0.12, ey + r * 0.4, ex + s * r * 0.06, ey + r * 0.48); ctx.quadraticCurveTo(ex, ey + r * 0.4, ex + s * r * 0.06, ey + r * 0.14); ctx.fill(); ctx.stroke(); }
  }
  if (E.cheeks) { ctx.fillStyle = "#f0b3a4"; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * r * 0.55, r * 0.3, r * 0.2, r * 0.14, 0, 0, Math.PI * 2); ctx.fill(); } }
  // рот
  let [mt, mp] = E.mouth;
  const tk = p.talk ?? 0;
  if (tk > 0.15 && ["flat", "smirk", "squiggle", "pressed"].includes(mt)) { mt = "open"; mp = 0.4 + 0.6 * tk; }
  const my = r * 0.45, mx = lx * 0.04;
  stroke(0.018);
  if (mt === "flat") { ctx.beginPath(); ctx.moveTo(mx - r * 0.17, my); ctx.quadraticCurveTo(mx, my - mp * r * 0.12, mx + r * 0.17, my); ctx.stroke(); }
  else if (mt === "smirk") { ctx.beginPath(); ctx.moveTo(mx - r * 0.14, my); ctx.quadraticCurveTo(mx + r * 0.05, my + r * 0.12, mx + r * 0.22, my - r * 0.08); ctx.stroke(); }
  else if (mt === "squiggle") { ctx.beginPath(); for (let i = 0; i <= 16; i++) { const x = -r * 0.22 + (i / 16) * r * 0.44; const yy = my + Math.sin((x / r) * 20) * r * 0.045; i ? ctx.lineTo(mx + x, yy) : ctx.moveTo(mx + x, yy); } ctx.stroke(); }
  else if (mt === "pressed") { stroke(0.022); ctx.beginPath(); ctx.moveTo(mx - r * 0.13, my); ctx.lineTo(mx + r * 0.13, my); ctx.stroke(); }
  else if (mt === "o") { ctx.fillStyle = "#5e1f22"; ctx.beginPath(); ctx.ellipse(mx, my, r * 0.07 * (0.7 + mp), r * 0.09 * (0.7 + mp), 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
  else if (mt === "grin") {
    const mw = r * 0.36;
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.moveTo(mx - mw, my - r * 0.05); ctx.quadraticCurveTo(mx, my + r * 0.36 * mp, mx + mw, my - r * 0.05); ctx.closePath(); ctx.fill(); ctx.stroke();
    stroke(0.008); for (const k of [-0.5, -0.17, 0.17, 0.5]) { ctx.beginPath(); ctx.moveTo(mx + k * mw, my - r * 0.04); ctx.lineTo(mx + k * mw * 0.95, my + r * 0.13 * mp); ctx.stroke(); }
  } else if (mt === "smile") { stroke(0.02); ctx.beginPath(); ctx.arc(mx, my - r * 0.12, r * 0.16, Math.PI * 0.2, Math.PI * 0.8); ctx.stroke(); }
  else if (mt === "side") { stroke(0.02); ctx.beginPath(); ctx.moveTo(mx + r * 0.02, my + r * 0.02); ctx.quadraticCurveTo(mx + r * 0.12, my + r * 0.03, mx + r * 0.22, my - r * 0.04); ctx.stroke(); }
  else if (mt === "frown") { stroke(0.02); ctx.beginPath(); ctx.moveTo(mx - r * 0.16, my + r * 0.08); ctx.quadraticCurveTo(mx, my - r * 0.1, mx + r * 0.16, my + r * 0.08); ctx.stroke(); }
  else if (mt === "teeth") {
    const mw = r * 0.26, mh = r * 0.14;
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.roundRect(mx - mw, my - mh / 2, mw * 2, mh, mh * 0.4); ctx.fill(); ctx.stroke();
    stroke(0.008); ctx.beginPath(); ctx.moveTo(mx - mw, my); ctx.lineTo(mx + mw, my); for (const k of [-0.5, 0, 0.5]) { ctx.moveTo(mx + k * mw, my - mh / 2); ctx.lineTo(mx + k * mw, my + mh / 2); } ctx.stroke();
  } else if (mt === "wobble") {
    ctx.fillStyle = "#5e1f22"; ctx.beginPath(); for (let i = 0; i <= 16; i++) { const x = -r * 0.2 + (i / 16) * r * 0.4; const yy = my + Math.sin((x / r) * 24) * r * 0.035; i ? ctx.lineTo(mx + x, yy) : ctx.moveTo(mx + x, yy); }
    ctx.quadraticCurveTo(mx, my + r * 0.2, mx - r * 0.2, my); ctx.closePath(); ctx.fill(); ctx.stroke();
  } else if (mt === "yawn") {
    ctx.fillStyle = "#5e1f22"; ctx.beginPath(); ctx.ellipse(mx, my + r * 0.04, r * 0.13, r * 0.2, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#d66a6c"; ctx.beginPath(); ctx.ellipse(mx, my + r * 0.16, r * 0.08, r * 0.05, 0, 0, Math.PI * 2); ctx.fill();
  } else if (mt === "open") {
    const mw = r * 0.24, mh = r * 0.08 + r * 0.24 * mp;
    ctx.fillStyle = "#5e1f22"; ctx.beginPath(); ctx.moveTo(mx - mw, my - r * 0.05); ctx.quadraticCurveTo(mx, my - r * 0.05 + mh * 1.9, mx + mw, my - r * 0.05); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#d66a6c"; ctx.beginPath(); ctx.ellipse(mx, my + mh * 0.6, mw * 0.5, mh * 0.25, 0, 0, Math.PI * 2); ctx.fill();
    stroke(0.024, "#fff"); ctx.beginPath(); ctx.moveTo(mx - mw * 0.75, my - r * 0.025); ctx.lineTo(mx + mw * 0.75, my - r * 0.025); ctx.stroke();
  }
  if (E.mark) {
    ctx.save(); ctx.translate(r * 1.3, -r * 1.05); ctx.rotate(0.2); ctx.font = `900 ${r * (E.mark === "z" ? 0.4 : 0.55)}px Arial Black, Arial`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.lineWidth = 0.02 * K; ctx.strokeStyle = INK;
    ctx.fillStyle = E.mark === "$" ? "#2f9e4a" : E.mark === "z" ? "#7c9cff" : E.mark === "?" ? "#ffc93a" : "#ff4a3a";
    const txt = E.mark === "z" ? "Zz" : E.mark; ctx.strokeText(txt, 0, 0); ctx.fillText(txt, 0, 0); ctx.restore();
  }
  if (E.sweat) { ctx.fillStyle = "#c9e6ff"; stroke(0.01, "#3d7fd0"); ctx.beginPath(); ctx.moveTo(r * 0.98, -r * 0.5); ctx.quadraticCurveTo(r * 1.1, -r * 0.25, r * 0.98, -r * 0.18); ctx.quadraticCurveTo(r * 0.86, -r * 0.25, r * 0.98, -r * 0.5); ctx.fill(); ctx.stroke(); }
  ctx.restore();
  // передняя рука поверх
  arm(shF, hF, p.bendF ?? 0.12); hand(hF);
}

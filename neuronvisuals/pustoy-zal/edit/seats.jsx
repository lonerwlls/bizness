// Кресла зрительного зала (вид сзади). В темноте — силуэты «голова + плечи» с контровым светом от сцены,
// при свете — пустые красные кресла: обивка, подголовник со швом, подлокотники, номерки.
import { ellipse, poly, origin, kf } from "./lib.js";
import { TURN, ROW_OFF, N, FPS } from "./timing.js";
const ROWS = [
  { id: "A", n: 7, pitch: 168, x0: 540 - 3 * 168, d: 74, w: 140, h: 150, top: 1290, rim: "#A4A1A5", rw: 2.5, litK: 0.86, num0: 9 },
  { id: "B", n: 6, pitch: 208, x0: 540 - 2.5 * 208, d: 92, w: 176, h: 210, top: 1455, rim: "#7E7B7F", rw: 3, litK: 0.93, num0: 10 },
  { id: "C", n: 5, pitch: 262, x0: 540 - 2 * 262, d: 116, w: 222, h: 340, top: 1650, rim: "#5C595D", rw: 3.5, litK: 1, num0: 11 },
];
const MOVES = [
  ["A", 2, [[0, 0, 0, "hold"], [66, 0, 0, "ease-out"], [72, 14, 4, "hold"], [104, 14, 4, "ease-in-out"], [116, 0, 0, "hold"]]],
  ["B", 2, [[0, 0, 0, "hold"], [150, 0, 0, "ease-out"], [158, 16, 5, "hold"], [190, 16, 5, "ease-in-out"], [200, 0, 0, "hold"]]],
  ["B", 3, [[0, 0, 0, "hold"], [150, 0, 0, "ease-out"], [158, -16, 5, "hold"], [190, -16, 5, "ease-in-out"], [200, 0, 0, "hold"]]],
  ["C", 1, [[0, 0, 0, "hold"], [400, 0, 0, "ease-in-out"], [410, 14, 4, "hold"]]],
];
// на кадре 222 весь зал «подаётся вперёд» к герою, на щелчке света — на месте
const ALL = (cx) => { const dx = Math.max(-9, Math.min(9, (540 - cx) * 0.03)); return [[0, 0, 0, "hold"], [218, 0, 0, "ease-out"], [224, dx, -6, "hold"], [TURN, 0, 0, "hold"]]; };
function rrect(w, h, r) { const k = 0.5523 * r; return `M0 ${h} L0 ${r} C0 ${r - k} ${r - k} 0 ${r} 0 L${w - r} 0 C${w - r + k} 0 ${w} ${r - k} ${w} ${r} L${w} ${h} Z`; }
function rrectFull(w, h, r) { const k = 0.5523 * r; return `M${r} 0 L${w - r} 0 C${w - r + k} 0 ${w} ${r - k} ${w} ${r} L${w} ${h - r} C${w} ${h - r + k} ${w - r + k} ${h} ${w - r} ${h} L${r} ${h} C${r - k} ${h} 0 ${h - r + k} 0 ${h - r} L0 ${r} C0 ${r - k} ${r - k} 0 ${r} 0 Z`; }
function backRim(w, h) {
  const r = 0.32 * w, pts = [[0, 0.3 * h]];
  for (let i = 0; i <= 6; i++) { const a = Math.PI + (i / 6) * (Math.PI / 2); pts.push([r + r * Math.cos(a), r + r * Math.sin(a)]); }
  for (let i = 0; i <= 6; i++) { const a = 1.5 * Math.PI + (i / 6) * (Math.PI / 2); pts.push([w - r + r * Math.cos(a), r + r * Math.sin(a)]); }
  pts.push([w, 0.3 * h]);
  return poly(pts);
}
function arc(cx, cy, r, a0, a1, n = 14) { const pts = []; for (let i = 0; i <= n; i++) { const a = (a0 + ((a1 - a0) * i) / n) * Math.PI / 180; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } return poly(pts); }
const shade = (hex, k) => "#" + [1, 3, 5].map((i) => Math.round(parseInt(hex.slice(i, i + 2), 16) * k).toString(16).padStart(2, "0")).join("");
const offAnim = (list) => [{ property: "offsetX", keyframes: kf(list.map(([f, dx, , e]) => [f, dx, e])) }, { property: "offsetY", keyframes: kf(list.map(([f, , dy, e]) => [f, dy, e])) }];
export function seatNodes(numFont) {
  const out = [];
  for (const R of ROWS) {
    const off = ROW_OFF[R.id];
    const litOp = [{ property: "opacity", keyframes: kf([[0, 0, "hold"], [TURN, 1, "hold"], [off, 1, "linear"], [off + 2, 0, "hold"], [N, 0]]) }];
    const k = R.litK, r = R.d / 2, hcy = R.top - 0.36 * R.d;
    origin(0, 0);
    const back = rrect(R.w, R.h, 0.32 * R.w), headD = ellipse(r, r, r, r), brim = backRim(R.w, R.h);
    const hrim = arc(r + 4, r + 4, r, -160, -20);
    const pw = R.w * 0.7, ph = R.h * 0.62, panel = rrectFull(pw, ph, pw * 0.22);
    // подлокотники между креслами (видны только при свете)
    const armW = R.w * 0.13, armH = R.h * 0.55, armTop = R.top + R.h * 0.38, arm = rrectFull(armW, armH, armW * 0.45);
    for (let i = 0; i < R.n; i++) {
      const cx = R.x0 + i * R.pitch, bx = cx - R.w / 2;
      const mv = MOVES.find((m) => m[0] === R.id && m[1] === i);
      const anim = [...offAnim(mv ? mv[2] : ALL(cx)), { property: "opacity", keyframes: kf([[0, 1, "hold"], [TURN, 0, "hold"], [off, 0, "linear"], [off + 2, 1, "hold"], [N, 1]]) }];
      out.push(<path x={bx} y={R.top} width={R.w} height={R.h} d={back} fill="#030204" />);
      out.push(<path x={bx} y={R.top} width={R.w} height={R.h} d={brim} stroke={{ width: R.rw, color: shade(R.rim, 0.8), cap: "round" }} />);
      out.push(<path x={cx - r} y={hcy - r} width={R.d} height={R.d} d={headD} fill="#030204" animate={anim} />);
      out.push(<path x={cx - r - 4} y={hcy - r - 4} width={R.d + 8} height={R.d + 8} d={hrim} stroke={{ width: R.rw, color: R.rim, cap: "round" }} animate={anim} />);
    }
    // при свете: пустые кресла
    for (let i = 0; i <= R.n; i++) {
      const ax = R.x0 + (i - 0.5) * R.pitch - armW / 2;
      out.push(<path x={ax} y={armTop} width={armW} height={armH} d={arm} fill={{ kind: "linear", angle: 180, stops: [{ offset: 0, color: shade("#4A4246", k) }, { offset: 0.18, color: shade("#2A2427", k) }, { offset: 1, color: shade("#141113", k) }] }} animate={litOp} />);
    }
    for (let i = 0; i < R.n; i++) {
      const cx = R.x0 + i * R.pitch, bx = cx - R.w / 2;
      out.push(<path x={bx} y={R.top} width={R.w} height={R.h} d={back} fill={{ kind: "linear", angle: 180, stops: [{ offset: 0, color: shade("#E8203A", k) }, { offset: 0.5, color: shade("#B3142A", k) }, { offset: 1, color: shade("#5E0912", k) }] }} animate={litOp} />);
      out.push(<path x={cx - pw / 2} y={R.top + R.h * 0.2} width={pw} height={ph} d={panel} fill={{ kind: "linear", angle: 180, stops: [{ offset: 0, color: shade("#C4182F", k) }, { offset: 1, color: shade("#6A0A16", k) }] }} stroke={{ width: Math.max(2, R.w * 0.014), color: shade("#7A0C1A", k) }} animate={litOp} />);
      const cw = R.d * 1.12, ch = R.d * 0.78, cy0 = hcy - R.d * 0.3;
      out.push(<path x={cx - cw / 2} y={cy0} width={cw} height={ch} d={rrectFull(cw, ch, ch * 0.42)} fill={{ kind: "linear", angle: 180, stops: [{ offset: 0, color: shade("#F04A58", k) }, { offset: 1, color: shade("#A8122A", k) }] }} stroke={{ width: Math.max(2, R.d * 0.025), color: shade("#7A0C1A", k) }} animate={litOp} />);
      // номерок
      const nw = R.w * 0.2, nh = nw * 0.62, ny = R.top + R.h * 0.08;
      out.push(<rect x={cx - nw / 2} y={ny} width={nw} height={nh} radius={3} fill={shade("#D8D3CC", k)} animate={litOp} />);
      if (numFont) out.push(<text x={cx - nw / 2} y={ny + nh * 0.12} width={nw} align="center" typography={numFont} fontFamily="Tektur" fontSize={nh * 0.72} color="#2B2B2B" animate={litOp}>{String(R.num0 + i)}</text>);
    }
  }
  return out;
}

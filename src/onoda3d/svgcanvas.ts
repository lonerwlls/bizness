// Синхронная отрисовка SVG (из renderToStaticMarkup) на Canvas2D: path/ellipse/circle/rect/polygon/line, группы с
// transform/opacity/clip-path, и «filter» = светящаяся обводка (rim) через тень canvas. Нужна, чтобы нашего
// аниме-персонажа (AnimeChar, SVG) можно было положить текстурой на карточку внутри three.js-сцены в тот же кадр.
type Sty = { fill: string; stroke: string; sw: number; cap: CanvasLineCap; join: CanvasLineJoin; alpha: number };

const num = (v: string | null, d = 0) => (v == null || v === "" ? d : parseFloat(v));
const shapePath = (el: Element): Path2D | null => {
  const t = el.tagName.toLowerCase();
  if (t === "path") return new Path2D(el.getAttribute("d") || "");
  const p = new Path2D();
  if (t === "ellipse" || t === "circle") {
    const cx = num(el.getAttribute("cx")), cy = num(el.getAttribute("cy"));
    const rx = t === "circle" ? num(el.getAttribute("r")) : num(el.getAttribute("rx")), ry = t === "circle" ? rx : num(el.getAttribute("ry"));
    if (rx <= 0 || ry <= 0) return null;
    p.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    return p;
  }
  if (t === "rect") {
    const x = num(el.getAttribute("x")), y = num(el.getAttribute("y")), w = num(el.getAttribute("width")), h = num(el.getAttribute("height"));
    const rx = Math.min(num(el.getAttribute("rx")), w / 2, h / 2);
    if (rx > 0) p.roundRect(x, y, w, h, rx); else p.rect(x, y, w, h);
    return p;
  }
  if (t === "polygon" || t === "polyline") {
    const v = (el.getAttribute("points") || "").trim().split(/[\s,]+/).map(Number);
    for (let i = 0; i + 1 < v.length; i += 2) (i ? p.lineTo(v[i], v[i + 1]) : p.moveTo(v[i], v[i + 1]));
    if (t === "polygon") p.closePath();
    return p;
  }
  if (t === "line") {
    p.moveTo(num(el.getAttribute("x1")), num(el.getAttribute("y1")));
    p.lineTo(num(el.getAttribute("x2")), num(el.getAttribute("y2")));
    return p;
  }
  return null;
};
const applyTransform = (g: CanvasRenderingContext2D, tr: string | null) => {
  if (!tr) return;
  const re = /(translate|scale|rotate|matrix)\(([^)]*)\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(tr))) {
    const a = m[2].trim().split(/[\s,]+/).map(Number);
    if (m[1] === "translate") g.translate(a[0] || 0, a[1] || 0);
    else if (m[1] === "scale") g.scale(a[0], a.length > 1 ? a[1] : a[0]);
    else if (m[1] === "rotate") {
      const r = (a[0] * Math.PI) / 180;
      if (a.length >= 3) { g.translate(a[1], a[2]); g.rotate(r); g.translate(-a[1], -a[2]); } else g.rotate(r);
    } else if (m[1] === "matrix") g.transform(a[0], a[1], a[2], a[3], a[4], a[5]);
  }
};
const urlId = (v: string | null) => (v ? (/url\(#([^)]+)\)/.exec(v) || [])[1] : undefined);

export class SvgDraw {
  private clips = new Map<string, Element>();
  private filters = new Map<string, { color: string; r: number }>();
  constructor(private g: CanvasRenderingContext2D) {}
  draw(svg: string) {
    const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
    const root = doc.documentElement;
    root.querySelectorAll("clipPath").forEach((c) => this.clips.set(c.getAttribute("id") || "", c));
    root.querySelectorAll("filter").forEach((f) => {
      const fl = f.querySelector("feFlood"), mo = f.querySelector("feMorphology");
      this.filters.set(f.getAttribute("id") || "", { color: fl?.getAttribute("flood-color") || "#fff", r: num(mo?.getAttribute("radius") ?? null, 6) });
    });
    this.node(root, { fill: "#000", stroke: "none", sw: 1, cap: "butt", join: "miter", alpha: 1 }, true);
  }
  private sty(el: Element, s: Sty): Sty {
    const o = { ...s };
    const f = el.getAttribute("fill"), st = el.getAttribute("stroke"), w = el.getAttribute("stroke-width");
    if (f) o.fill = f; if (st) o.stroke = st; if (w) o.sw = parseFloat(w);
    const lc = el.getAttribute("stroke-linecap"), lj = el.getAttribute("stroke-linejoin");
    if (lc) o.cap = lc as CanvasLineCap; if (lj) o.join = lj as CanvasLineJoin;
    return o;
  }
  private node(el: Element, s: Sty, root = false) {
    const t = el.tagName.toLowerCase();
    if (t === "defs" || t === "clippath" || t === "filter" || t === "title") return;
    const g = this.g;
    g.save();
    if (!root) applyTransform(g, el.getAttribute("transform"));
    const op = el.getAttribute("opacity");
    if (op != null) g.globalAlpha *= parseFloat(op);
    const cid = urlId(el.getAttribute("clip-path"));
    if (cid && this.clips.has(cid)) {
      const cp = new Path2D();
      this.clips.get(cid)!.querySelectorAll("path,ellipse,circle,rect,polygon").forEach((c) => { const p = shapePath(c); if (p) cp.addPath(p); });
      g.clip(cp);
    }
    const st = this.sty(el, s);
    const fid = urlId(el.getAttribute("filter"));
    if (fid && this.filters.has(fid)) this.glow(el, st, this.filters.get(fid)!);
    else this.body(el, st);
    g.restore();
  }
  private body(el: Element, st: Sty) {
    const p = shapePath(el);
    if (p) this.paint(p, st);
    else for (const c of Array.from(el.children)) this.node(c, st);
  }
  private paint(p: Path2D, st: Sty) {
    const g = this.g;
    if (st.fill && st.fill !== "none") { g.fillStyle = st.fill; g.fill(p); }
    if (st.stroke && st.stroke !== "none" && st.sw > 0) {
      g.strokeStyle = st.stroke; g.lineWidth = st.sw; g.lineCap = st.cap; g.lineJoin = st.join; g.stroke(p);
    }
  }
  /** светящаяся обводка: рисуем группу в отдельный холст, затем его же с тенью цвета rim, затем поверх — чисто */
  private glow(el: Element, st: Sty, f: { color: string; r: number }) {
    const g = this.g, cv = g.canvas as HTMLCanvasElement;
    const off = document.createElement("canvas");
    off.width = cv.width; off.height = cv.height;
    const o = off.getContext("2d")!;
    o.setTransform(g.getTransform());
    const sub = new SvgDraw(o);
    sub.clips = this.clips; sub.filters = this.filters;
    sub.body(el, st);
    const k = Math.hypot(g.getTransform().a, g.getTransform().b);
    g.save();
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.shadowColor = f.color;
    g.shadowBlur = Math.max(2, f.r * 2.2 * k);
    for (let i = 0; i < 3; i++) g.drawImage(off, 0, 0);
    g.shadowBlur = 0; g.shadowColor = "transparent";
    g.drawImage(off, 0, 0);
    g.restore();
  }
}

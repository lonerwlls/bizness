// Пересчитать WARP_RU в src/foodshort/FoodShort.tsx по новой русской озвучке: node scripts/foodshort_warp.mjs
// Пары: [время в английском монтаже, номер русского слова, сдвиг]. Монтаж и звук идут по этим опорам.
import fs from "fs";
const s = fs.readFileSync("src/foodshort/voice_ru.ts", "utf8");
const V = JSON.parse(s.slice(s.indexOf("{"), s.lastIndexOf("}") + 1));
const A = [[3.889, 11], [5.45, 17, -0.05], [7.012, 20], [7.964, 23], [10.15, 30, -0.05], [13.514, 35], [14.826, 37], [16.35, 39, -0.05], [18.634, 44],
  [21.42, 50], [21.95, 52, -0.05], [22.755, 54], [23.127, 55], [23.789, 56], [24.45, 57], [25.7, 60, -0.05], [27.6, 65, -0.05], [29.408, 68],
  [31.033, 71], [32.531, 74], [33.355, 75], [34.45, 76, -0.05], [36.826, 81], [37.7, 83, -0.05], [40.0, 88, -0.05], [44.222, 98], [45.5, 101, -0.05],
  [48.042, 105], [49.818, 109], [51.5, 112, -0.05], [51.943, 113, 0.17], [53.023, 115], [53.88, 116, -0.05], [56.982, 122], [57.82, 123, -0.23], [58.05, 123],
  [58.909, 124], [61.4, 132, -0.05]];
const pairs = [[0, 0], ...A.map(([e, i, o = 0]) => [e, +(V.words[i].t + o).toFixed(3)]), [66.3, +(V.dur + 1.6).toFixed(3)]];
for (let i = 1; i < pairs.length; i++) if (!(pairs[i][1] > pairs[i - 1][1])) throw new Error("не по порядку: " + JSON.stringify(pairs[i]));
const lit = "export const WARP_RU: [number, number][] = [\n  " + pairs.map((p) => `[${p[0]}, ${p[1]}]`).join(", ") + ",\n];";
const p = "src/foodshort/FoodShort.tsx", src = fs.readFileSync(p, "utf8");
fs.writeFileSync(p, src.replace(/export const WARP_RU: \[number, number\]\[\] = \[[\s\S]*?\];/, lit));
console.log("ok", pairs.length);

// Мир «Лестницы» в метрах: стена, лестница, стол с лампой, стулья. Те же числа уходят в GLSL.
import { norm, sub, add, mul, cross } from "./vec.js";
export const WALL = { hx: 40.0, h: 13.2, d: 40.0 };          // фасад z=0; наверху — пустое плато вглубь (-z)
export const LAD_B = [0, 0, 1.6], LAD_TOPWALL = [0, 13.2, 0.05];
export const LAD_DIR = norm(sub(LAD_TOPWALL, LAD_B));
export const LAD_LEN = 13.62, LAD_HW = 0.24, RUNG = 0.3;
export const LAD_N = norm(cross([1, 0, 0], LAD_DIR));     // наружу от лестницы (к камере)
export const ladderAt = (s) => add(LAD_B, mul(LAD_DIR, s));
export const TABLE = [2.3, 0, 1.9], TABLE_R = 0.5, TABLE_H = 0.74;
export const LAMP = [2.3, 1.08, 1.9];
export const CHAIR_KID = [1.55, 0, 2.2], CHAIR_WIFE = [3.05, 0, 2.2];
export const PLAQUES = [["$40K", 2.7], ["$80K", 4.8], ["$150K", 7.5], ["$500K", 10.4], ["$1M", 12.75]];
export function glslDefines() {
  const f = (v) => (Number.isInteger(v) ? v.toFixed(1) : String(+v.toFixed(5)));
  const v3 = (a) => `vec3(${a.map(f).join(",")})`;
  return [
    `#define WALL_HX ${f(WALL.hx)}`, `#define WALL_H ${f(WALL.h)}`, `#define WALL_D ${f(WALL.d)}`,
    `#define LAD_B ${v3(LAD_B)}`, `#define LAD_DIR ${v3(LAD_DIR)}`, `#define LAD_LEN ${f(LAD_LEN)}`, `#define LAD_HW ${f(LAD_HW)}`, `#define RUNG ${f(RUNG)}`,
    `#define TABLE ${v3(TABLE)}`, `#define TABLE_R ${f(TABLE_R)}`, `#define TABLE_H ${f(TABLE_H)}`, `#define LAMP ${v3(LAMP)}`,
    `#define CHAIR_KID ${v3(CHAIR_KID)}`, `#define CHAIR_WIFE ${v3(CHAIR_WIFE)}`,
  ].join("\n") + "\n";
}

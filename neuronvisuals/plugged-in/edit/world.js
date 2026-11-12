// Мир — экран телефона (лежит): x ∈ ±4, z ∈ [-11.2, 6.2]; иконки на стекле; герой в кресле в центре.
import { ICON_X, ICON_Z, DOCK_Z, SUBS } from "./timing.js";
export const PHONE = { hx: 4.0, z0: -11.2, z1: 6.2 };
export const iconPos = ([c, r]) => [ICON_X[c], 0.02, r === "d" ? DOCK_Z : ICON_Z[r]];
export function glslDefines() {
  // какая подписка «сидит» в какой иконке: функция индекса для шейдера
  const lines = SUBS.map(([, , , [c, r]], i) => `  if (c == ${c} && r == ${r === "d" ? 4 : r}) return ${i}.0;`).join("\n");
  return `#define PH_HX ${PHONE.hx.toFixed(1)}\n#define PH_Z0 ${PHONE.z0.toFixed(1)}\n#define PH_Z1 ${PHONE.z1.toFixed(1)}\n#define DOCK_Z ${DOCK_Z.toFixed(1)}\nfloat subIndex(int c, int r){\n${lines}\n  return -1.0;\n}\n`;
}

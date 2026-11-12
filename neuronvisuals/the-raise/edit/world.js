// Мир «The Raise» — обратная сторона банковской карты: лента = магнитная полоса.
export const BELT_Y = 0.6, BELT_HW = 0.8;
export const CARD = { hx: 7.2, hz: 4.55, cz: 3.75, hy: 0.065, r: 0.55 };   // полоса у верхнего края карты
export const HERO_Z = 0;
export function glslDefines() {
  const f = (v) => (Number.isInteger(v) ? v.toFixed(1) : String(v));
  return [`#define BELT_Y ${f(BELT_Y)}`, `#define BELT_HW ${f(BELT_HW)}`, `#define CARD_HX ${f(CARD.hx)}`, `#define CARD_HZ ${f(CARD.hz)}`, `#define CARD_CZ ${f(CARD.cz)}`, `#define CARD_HY ${f(CARD.hy)}`, `#define CARD_R ${f(CARD.r)}`].join("\n") + "\n";
}

import type { Look } from "../esport/anime";

// Хиро Онода, молодой (1944)
export const ONODA: Look = {
  skin: "#f0c6a0", skinSh: "#d39a78", hair: "#1e1a1a", hairSh: "#0c0a0a", hairStyle: "short",
  top: "#9a9258", topSh: "#6e6a3c", iris: "#3a2a20", uniform: true,
  pants: "#8c8550", pantsSh: "#4a4628", shoe: "#3a2a1a",
};
// Онода через годы: выцветшая форма, щетина
export const ONODA_OLD: Look = {
  ...ONODA, top: "#857b4c", topSh: "#5c5532", pants: "#766d44", skin: "#d9a985", skinSh: "#b8835f",
  hair: "#3a3634", hairSh: "#1a1716", beard: true, adult: true,
};
// командир (майор)
export const CMDR: Look = {
  skin: "#e9bd98", skinSh: "#c99472", hair: "#1a1616", hairSh: "#0a0808", hairStyle: "short",
  top: "#5f5a3a", topSh: "#403c26", iris: "#2a1d16", uniform: true, adult: true, mustache: true, glasses: true,
  pants: "#5f5e3e", pantsSh: "#33321f", shoe: "#2a1e12",
};
export const SOLDIERS: Look[] = [
  { ...ONODA, skin: "#e8b892", skinSh: "#c58d6a", top: "#8f8a52", topSh: "#646036" },
  { ...ONODA, skin: "#f2cba8", skinSh: "#d4a27e", top: "#a09a60", topSh: "#706c40" },
  { ...ONODA, skin: "#dcae88", skinSh: "#b9855f", top: "#8a8350", topSh: "#5e5a34" },
];

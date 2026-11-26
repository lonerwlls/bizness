import type { Look } from "./anime";

export const LEO: Look = {
  skin: "#f3c9a4", skinSh: "#d99c7a", hair: "#4a2c1c", hairSh: "#2b170e", hairStyle: "spiky",
  top: "#2e3a72", topSh: "#1e2552", hood: true, iris: "#8a4b22",
};
export const DAD: Look = {
  skin: "#e9b892", skinSh: "#c98d6a", hair: "#25201f", hairSh: "#141011", hairStyle: "short",
  top: "#55624d", topSh: "#3a4535", iris: "#3b2a20", adult: true, stubble: true,
};
export const MOM: Look = {
  skin: "#f1c6a6", skinSh: "#d49a7f", hair: "#7a3424", hairSh: "#4f1e14", hairStyle: "long",
  top: "#8b4a68", topSh: "#5f2f47", iris: "#4d3020", adult: true,
};
export const KIDS: Look[] = [
  { skin: "#e8b48d", skinSh: "#c58866", hair: "#d8a43a", hairSh: "#9b6f1e", hairStyle: "messy", top: "#b8352f", topSh: "#82221f", iris: "#2f5f8a" },
  { skin: "#c98f68", skinSh: "#a26a4a", hair: "#1c1414", hairSh: "#0b0707", hairStyle: "short", top: "#2f7a5a", topSh: "#1f5540", iris: "#2b1d14" },
  { skin: "#f2cfb0", skinSh: "#d7a586", hair: "#3b2a24", hairSh: "#21150f", hairStyle: "long", top: "#d1873a", topSh: "#9a5f24", iris: "#5a3a20" },
  { skin: "#8f5e44", skinSh: "#6e4430", hair: "#141010", hairSh: "#050303", hairStyle: "spiky", top: "#6a4aa0", topSh: "#47317a", iris: "#2b1d14" },
];

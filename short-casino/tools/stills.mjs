// Быстрые стоп-кадры одним бандлом: node tools/stills.mjs 1.5 7 12 ...  (секунды) → checks/t<сек>.png
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
const secs = process.argv.slice(2).map(Number);
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id: "Video", chromiumOptions: { gl: "swangle" } });
for (const s of secs) {
  await renderStill({ serveUrl, composition, frame: Math.round(s * 30), output: `checks/t${s}.png`, scale: 0.5, chromiumOptions: { gl: "swangle" } });
  console.log("ok", s);
}

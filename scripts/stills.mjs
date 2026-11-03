// Быстрые стоп-кадры: один бандл, много кадров. node scripts/stills.mjs <entry> <compId> <outPrefix> <f1,f2,...> [scale]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
const [entry, id, prefix, frames, scale = "0.5"] = process.argv.slice(2);
const chromiumOptions = { gl: "swangle" };
const serveUrl = await bundle({ entryPoint: path.resolve(entry), publicDir: path.resolve("public") });
const composition = await selectComposition({ serveUrl, id, chromiumOptions });
for (const f of frames.split(",").map(Number)) {
  const t0 = Date.now();
  await renderStill({ composition, serveUrl, frame: f, output: `${prefix}${f}.jpg`, imageFormat: "jpeg", jpegQuality: 88, scale: Number(scale), chromiumOptions, timeoutInMilliseconds: 240000,
    onBrowserLog: (l) => { if (l.type === "error" && !l.text.includes("404")) console.log("[err]", l.text.slice(0, 300)); } });
  console.log("still", f, ((Date.now() - t0) / 1000).toFixed(1) + "s");
}

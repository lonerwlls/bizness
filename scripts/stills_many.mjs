// node scripts/stills_many.mjs <entry> <outDir> id1,id2,...  (каждая композиция — один кадр, swangle)
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
const [entry, outDir, ids] = process.argv.slice(2);
const chromiumOptions = { gl: "swangle" };
const serveUrl = await bundle({ entryPoint: path.resolve(entry), publicDir: path.resolve("public") });
for (const id of ids.split(",")) {
  const composition = await selectComposition({ serveUrl, id, chromiumOptions });
  await renderStill({ composition, serveUrl, frame: 0, output: `${outDir}/${id}.png`, imageFormat: "png", chromiumOptions, timeoutInMilliseconds: 240000 });
  console.log("ok", id);
}

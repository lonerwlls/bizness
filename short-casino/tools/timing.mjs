import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id: "Video", chromiumOptions: { gl: "swangle" } });
for (const f of process.argv.slice(2).map(Number)) {
  const t = Date.now();
  await renderStill({ serveUrl, composition, frame: f, output: `checks/f${f}.png`, scale: 0.5, chromiumOptions: { gl: "swangle" }, timeoutInMilliseconds: 300000 });
  console.log("frame", f, ((Date.now() - t) / 1000).toFixed(1), "s");
}

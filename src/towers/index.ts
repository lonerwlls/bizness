// Отдельная точка входа только для ролика towers (без шрифтов из интернета).
// Рендер: npx remotion render src/towers/index.ts Fin-towers out/towers.mp4
import { registerRoot } from "remotion";
import { TowersRoot } from "./Root";

registerRoot(TowersRoot);

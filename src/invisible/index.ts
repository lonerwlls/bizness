// Отдельная точка входа для ролика invisible. Рендер: bash scripts/make.sh invisible
import { registerRoot } from "remotion";
import { InvisibleRoot } from "./Root";

registerRoot(InvisibleRoot);

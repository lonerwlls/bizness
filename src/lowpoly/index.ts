// Пробник low-poly 3D. Рендер: bash scripts/make.sh lowpoly (нужен --gl=swangle, make.sh добавит сам)
import { registerRoot } from "remotion";
import { LowPolyRoot } from "./Root";

registerRoot(LowPolyRoot);

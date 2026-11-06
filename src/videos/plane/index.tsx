// «Как самолёт весом 400 тонн держится в воздухе?» — 11-секундная проба (стиль cartoon-3d-short). Рендер: bash scripts/make.sh plane
import React from "react";
import { Composition, registerRoot } from "remotion";
import { PlaneTest, PLANE_FRAMES } from "./Plane";

const Root: React.FC = () => <Composition id="Fin-plane" component={PlaneTest} durationInFrames={PLANE_FRAMES} fps={30} width={1080} height={1920} />;
registerRoot(Root);

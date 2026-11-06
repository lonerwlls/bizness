// «What If Everyone Had a Health Bar?», стиль cartoon-3d-short. Рендер: bash scripts/make.sh health
import React from "react";
import { Composition, registerRoot } from "remotion";
import { HealthShort, HEALTH_FRAMES } from "./Health";

const Root: React.FC = () => <Composition id="Fin-health" component={HealthShort} durationInFrames={HEALTH_FRAMES} fps={30} width={1080} height={1920} />;
registerRoot(Root);

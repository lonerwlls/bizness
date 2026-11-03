// «Представь, что ты капитан» — 10-секундная проба стиля cartoon-3d-short. Рендер: bash scripts/make.sh captain
import React from "react";
import { Composition, registerRoot } from "remotion";
import { CaptainTest, CAPTAIN_FRAMES } from "./Captain";

const Root: React.FC = () => <Composition id="Fin-captain" component={CaptainTest} durationInFrames={CAPTAIN_FRAMES} fps={30} width={1080} height={1920} />;
registerRoot(Root);

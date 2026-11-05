// «What If You Became the Most Popular Kid Overnight?», стиль cartoon-3d-short. Рендер: bash scripts/make.sh popular
import React from "react";
import { Composition, registerRoot } from "remotion";
import { PopularShort, POPULAR_FRAMES } from "./Popular";

const Root: React.FC = () => <Composition id="Fin-popular" component={PopularShort} durationInFrames={POPULAR_FRAMES} fps={30} width={1080} height={1920} />;
registerRoot(Root);

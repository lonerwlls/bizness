// «What If Your Dreams Were Memories?», стиль cartoon-3d-short. Рендер: bash scripts/make.sh dreams
import React from "react";
import { Composition, registerRoot } from "remotion";
import { DreamsShort, DREAMS_FRAMES } from "./Dreams";

const Root: React.FC = () => <Composition id="Fin-dreams" component={DreamsShort} durationInFrames={DREAMS_FRAMES} fps={30} width={1080} height={1920} />;
registerRoot(Root);

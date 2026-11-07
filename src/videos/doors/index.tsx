// «What If Every Door Led to Another Universe?», стиль cartoon-3d-short. Рендер: bash scripts/make.sh doors
import React from "react";
import { Composition, registerRoot } from "remotion";
import { DoorsShort, DOORS_FRAMES } from "./Doors";

const Root: React.FC = () => <Composition id="Fin-doors" component={DoorsShort} durationInFrames={DOORS_FRAMES} fps={30} width={1080} height={1920} />;
registerRoot(Root);

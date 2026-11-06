// «What If You Met Your Exact Copy?», стиль cartoon-3d-short. Рендер: bash scripts/make.sh copy
import React from "react";
import { Composition, registerRoot } from "remotion";
import { CopyShort, COPY_FRAMES } from "./Copy";

const Root: React.FC = () => <Composition id="Fin-copy" component={CopyShort} durationInFrames={COPY_FRAMES} fps={30} width={1080} height={1920} />;
registerRoot(Root);

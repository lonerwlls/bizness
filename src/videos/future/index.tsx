// «What If Your Phone Predicted Your Future?», стиль cartoon-3d-short. Рендер: bash scripts/make.sh future
import React from "react";
import { Composition, registerRoot } from "remotion";
import { FutureShort, FUTURE_FRAMES } from "./Future";

const Root: React.FC = () => <Composition id="Fin-future" component={FutureShort} durationInFrames={FUTURE_FRAMES} fps={30} width={1080} height={1920} />;
registerRoot(Root);

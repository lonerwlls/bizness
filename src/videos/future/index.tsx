// «What if you could see 10 seconds into the future?» — 20-секундная проба стиля A. Рендер: bash scripts/make.sh future
import React from "react";
import { Composition, registerRoot } from "remotion";
import { FutureTest, FUTURE_FRAMES } from "./Future";

const Root: React.FC = () => <Composition id="Fin-future" component={FutureTest} durationInFrames={FUTURE_FRAMES} fps={30} width={1920} height={1080} />;
registerRoot(Root);

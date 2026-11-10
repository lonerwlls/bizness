// «What if you found a magic coin?» — 10-секундная проба пиксель-арта. Рендер: bash scripts/make.sh pixel
import React from "react";
import { Composition, registerRoot } from "remotion";
import { PixelTest, PIXEL_FRAMES } from "./Pixel";

const Root: React.FC = () => <Composition id="Fin-pixel" component={PixelTest} durationInFrames={PIXEL_FRAMES} fps={30} width={1080} height={1920} />;
registerRoot(Root);

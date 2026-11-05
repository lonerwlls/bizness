// «What If the Moon Started Getting Closer to Earth?», стиль cartoon-3d-short. Рендер: bash scripts/make.sh moon
import React from "react";
import { Composition, registerRoot } from "remotion";
import { MoonShort, MOON_FRAMES } from "./Moon";

const Root: React.FC = () => <Composition id="Fin-moon" component={MoonShort} durationInFrames={MOON_FRAMES} fps={30} width={1080} height={1920} />;
registerRoot(Root);

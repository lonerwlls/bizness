// «Don't wave» — мост в тумане и город-двойник, стиль cartoon-3d-short. Рендер: bash scripts/make.sh wave
import React from "react";
import { Composition, registerRoot } from "remotion";
import { WaveShort, WAVE_FRAMES } from "./Wave";

const Root: React.FC = () => <Composition id="Fin-wave" component={WaveShort} durationInFrames={WAVE_FRAMES} fps={30} width={1080} height={1920} />;
registerRoot(Root);

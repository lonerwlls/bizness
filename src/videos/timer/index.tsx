// «What if everyone could see a timer of their life» — ролик в стиле cartoon-3d-short. Рендер: bash scripts/make.sh timer
import React from "react";
import { Composition, registerRoot } from "remotion";
import { TimerShort, TIMER_FRAMES } from "./Timer";

const Root: React.FC = () => <Composition id="Fin-timer" component={TimerShort} durationInFrames={TIMER_FRAMES} fps={30} width={1080} height={1920} />;
registerRoot(Root);

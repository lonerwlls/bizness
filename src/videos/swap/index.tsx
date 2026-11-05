// «What If You Swapped Bodies Every Day?», стиль cartoon-3d-short. Рендер: bash scripts/make.sh swap
import React from "react";
import { Composition, registerRoot } from "remotion";
import { SwapShort, SWAP_FRAMES } from "./Swap";

const Root: React.FC = () => <Composition id="Fin-swap" component={SwapShort} durationInFrames={SWAP_FRAMES} fps={30} width={1080} height={1920} />;
registerRoot(Root);

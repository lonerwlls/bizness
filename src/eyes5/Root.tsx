import React from "react";
import { Composition } from "remotion";
import { EYES5_FRAMES, Eyes5 } from "./eyes5";

export const Eyes5Root: React.FC = () => (
  <>
    <Composition id="Fin-eyes5" component={Eyes5} durationInFrames={EYES5_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Fin-eyes5-wide" component={Eyes5} durationInFrames={EYES5_FRAMES} fps={30} width={1920} height={1080} />
  </>
);

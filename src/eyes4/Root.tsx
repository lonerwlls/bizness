import React from "react";
import { Composition } from "remotion";
import { EYES4_FRAMES, Eyes4 } from "./eyes4";

export const Eyes4Root: React.FC = () => (
  <>
    <Composition id="Fin-eyes4" component={Eyes4} durationInFrames={EYES4_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Fin-eyes4-wide" component={Eyes4} durationInFrames={EYES4_FRAMES} fps={30} width={1920} height={1080} />
  </>
);

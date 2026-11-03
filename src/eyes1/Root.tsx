import React from "react";
import { Composition } from "remotion";
import { EYES1_FRAMES, Eyes1 } from "./eyes1";

export const Eyes1Root: React.FC = () => (
  <>
    <Composition id="Fin-eyes1" component={Eyes1} durationInFrames={EYES1_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Fin-eyes1-wide" component={Eyes1} durationInFrames={EYES1_FRAMES} fps={30} width={1920} height={1080} />
  </>
);

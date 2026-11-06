import React from "react";
import { Composition } from "remotion";
import { BLIND_FRAMES, BlindFilm, ThumbBlind } from "./blind";

export const BlindRoot: React.FC = () => (
  <>
    <Composition id="Fin-blind" component={BlindFilm} durationInFrames={BLIND_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Thumb-blind" component={ThumbBlind} durationInFrames={1} fps={30} width={1280} height={720} />
  </>
);

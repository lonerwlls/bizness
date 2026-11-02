import React from "react";
import { Composition } from "remotion";
import { INVISIBLE_FRAMES, InvisibleFilm } from "./invisible";

export const InvisibleRoot: React.FC = () => (
  <Composition id="Fin-invisible" component={InvisibleFilm} durationInFrames={INVISIBLE_FRAMES} fps={30} width={1080} height={1920} />
);

import React from "react";
import { Composition } from "remotion";
import { TOWERS_FRAMES, TowersFilm } from "./towers";

export const TowersRoot: React.FC = () => (
  <Composition id="Fin-towers" component={TowersFilm} durationInFrames={TOWERS_FRAMES} fps={30} width={1080} height={1920} />
);

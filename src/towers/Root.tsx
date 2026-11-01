import React from "react";
import { Composition } from "remotion";
import { TOWERS_FRAMES, TowersFilm } from "./towers";
import { CharSheet } from "../characters/Sheet";

export const TowersRoot: React.FC = () => (
  <>
    <Composition id="Fin-towers" component={TowersFilm} durationInFrames={TOWERS_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Char-sheet" component={CharSheet} durationInFrames={60} fps={30} width={1080} height={1920} />
  </>
);

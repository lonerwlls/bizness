import React from "react";
import { Composition } from "remotion";
import { HeroSheet, HeroEmotions } from "./Hero";
export const Root: React.FC = () => (<>
  <Composition id="Hero" component={HeroSheet} durationInFrames={30} fps={30} width={1080} height={1920} />
  <Composition id="HeroEmo" component={HeroEmotions} durationInFrames={30} fps={30} width={1080} height={1920} />
</>);

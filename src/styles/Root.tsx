import React from "react";
import { Composition } from "remotion";
import { EAT_FRAMES, EatStyle, STYLES } from "./eat";

export const StylesRoot: React.FC = () => (
  <>
    {STYLES.map((st) => (
      <Composition key={st} id={`Style-${st}`} component={EatStyle} durationInFrames={EAT_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ style: st }} />
    ))}
  </>
);

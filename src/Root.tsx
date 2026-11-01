import React from "react";
import { Composition } from "remotion";
import { buildTopic, FinanceShort } from "./finance/engine";
import { EditorialShort } from "./finance/editorial";
import { TOPICS } from "./finance/topics";
import { ED_TOPICS } from "./finance/topics/editorial";
import { TOWERS_FRAMES, TowersFilm } from "./towers/towers";

// Каждая тема = композиция Fin-<id> (1080×1920, 30 fps). Рендер: bash scripts/make.sh <id>
export const RemotionRoot: React.FC = () => (
  <>
    {TOPICS.map((t) => (
      <Composition key={t.id} id={`Fin-${t.id}`} component={FinanceShort} durationInFrames={buildTopic(t).FRAMES} fps={30} width={1080} height={1920} defaultProps={{ topic: t }} />
    ))}
    {ED_TOPICS.map((t) => (
      <Composition key={t.id} id={`Fin-${t.id}`} component={EditorialShort} durationInFrames={buildTopic(t).FRAMES} fps={30} width={1080} height={1920} defaultProps={{ topic: t }} />
    ))}
    <Composition id="Fin-towers" component={TowersFilm} durationInFrames={TOWERS_FRAMES} fps={30} width={1080} height={1920} />
  </>
);

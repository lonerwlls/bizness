// «What If Humans Disappeared for 100 Years», стиль cartoon-3d-short. Рендер: bash scripts/make.sh empty
import React from "react";
import { Composition, registerRoot } from "remotion";
import { EmptyShort, EMPTY_FRAMES } from "./Empty";

const Root: React.FC = () => <Composition id="Fin-empty" component={EmptyShort} durationInFrames={EMPTY_FRAMES} fps={30} width={1080} height={1920} />;
registerRoot(Root);

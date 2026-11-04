// «Letters from next year», стиль cartoon-3d-short. Рендер: bash scripts/make.sh letters
import React from "react";
import { Composition, registerRoot } from "remotion";
import { LettersShort, LETTERS_FRAMES } from "./Letters";

const Root: React.FC = () => <Composition id="Fin-letters" component={LettersShort} durationInFrames={LETTERS_FRAMES} fps={30} width={1080} height={1920} />;
registerRoot(Root);

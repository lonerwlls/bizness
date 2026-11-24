// Пробный ролик «Eiszeit» (немецкий, фото-коллаж). Рендер: npx remotion render src/iceage/index.tsx Fin-iceage videos/iceage/iceage_test.mp4
import { Composition, registerRoot } from "remotion";
import { ICE_FRAMES, IceFilm } from "./iceage";

registerRoot(() => <Composition id="Fin-iceage" component={IceFilm} durationInFrames={ICE_FRAMES} fps={30} width={1920} height={1080} />);

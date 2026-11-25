// Ролик «Wie lange würdest DU in der Eiszeit überleben?» (немецкий, фото-коллаж). Части: Eis-p1 …
// Рендер: npx remotion render src/eiszeit/index.tsx Eis-p1 out/eis/p1.mp4
import { Composition, registerRoot } from "remotion";
import { P1_FRAMES, Part1 } from "./part1";

registerRoot(() => <Composition id="Eis-p1" component={Part1} durationInFrames={P1_FRAMES} fps={30} width={1920} height={1080} />);

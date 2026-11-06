// «Защищает ли VPN от хакеров?» — шортс 9:16, стиль примера про слепоту.
import { Composition, registerRoot } from "remotion";
import { HackShort, FRAMES } from "./hack";

registerRoot(() => <Composition id="Fin-hack" component={HackShort} durationInFrames={FRAMES} fps={30} width={1080} height={1920} />);

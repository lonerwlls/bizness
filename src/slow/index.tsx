// «Почему VPN тормозит интернет?» — шортс 9:16, стиль примера про слепоту.
import { Composition, registerRoot } from "remotion";
import { SlowShort, FRAMES } from "./slow";

registerRoot(() => <Composition id="Fin-slow" component={SlowShort} durationInFrames={FRAMES} fps={30} width={1080} height={1920} />);

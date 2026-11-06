// «Что НА САМОМ ДЕЛЕ происходит, когда ты включаешь VPN?» — шортс 9:16, стиль примера про слепоту.
import { Composition, registerRoot } from "remotion";
import { VpnShort, FRAMES } from "./vpn";

registerRoot(() => <Composition id="Fin-vpn" component={VpnShort} durationInFrames={FRAMES} fps={30} width={1080} height={1920} />);

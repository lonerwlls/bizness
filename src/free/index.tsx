// «Почему один VPN стоит денег, а другой бесплатный?» — шортс 9:16 (не город: комната, серверная, цифровое пространство).
import { Composition, registerRoot } from "remotion";
import { FreeShort, FRAMES } from "./free";

registerRoot(() => <Composition id="Fin-free" component={FreeShort} durationInFrames={FRAMES} fps={30} width={1080} height={1920} />);

// Шрифты лежат локально: браузер рендера в облаке не скачивает Google Fonts.
import { staticFile, delayRender, continueRender } from "remotion";

if (typeof document !== "undefined") {
  const h = delayRender("crypto fonts");
  const F: [string, string, string?][] = [
    ["KMont", "Montserrat-latin", "U+0000-00FF, U+2000-206F"],
    ["KMont", "Montserrat-cyrillic", "U+0400-045F"],
    ["KAnton", "Anton"],
  ];
  Promise.all(
    F.map(([fam, file, r]) =>
      new FontFace(fam, `url(${staticFile(`towers/fonts/${file}.woff2`)})`, { weight: "100 900", ...(r ? { unicodeRange: r } : {}) })
        .load()
        .then((x) => document.fonts.add(x)),
    ),
  ).then(() => continueRender(h), () => continueRender(h));
}
export {};

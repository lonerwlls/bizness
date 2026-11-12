// «The Raise» — тайминги (кадры, 30 fps), 30 с, ролик-петля (кадр 900 = кадр 0).
export const FPS = 30;
export const N = 900;
export const DUR = N / FPS;
export const LINE1 = "I'LL SAVE WHEN I EARN MORE.";
export const LINE2 = "MORE MONEY. SAME ZERO.";
export const FACT = "Nearly 2 in 5 Americans earning $100K+ live paycheck to paycheck.";
export const FACT_SRC = "NerdWallet / Harris Poll, 2025";
export const TURN = 675;                         // встал — лента утаскивает назад; три ноты и тишина
export const SLIDE = [675, 702];                 // уезжает назад к старту
export const RESET = 846;                        // всё сначала: $40K, снова бежит
// прибавки: [кадр, доход]
export const RAISES = [[0, 40000], [90, 60000], [230, 90000], [380, 150000], [RESET, 40000]];
// темп: [кадр, период цикла, длина шага]; период 999 = стоит
export const PACE = [[0, 22, 0.85], [110, 17, 0.95], [250, 14, 1.0], [400, 12, 1.05], [TURN, 999, 0.0], [RESET - 20, 22, 0.85]];
// предметы: появление на ленте и момент «поймал»
export const ITEMS = { tv: [96, 150], sofa: [236, 290], car: [300, 352], house: [386, 440] };
export const STRUGGLE = [470, 660];              // неон мигает от усталости
export const TERM = [752, 806];                  // терминал проезжает по карте («свайп»)
export const APPROVED = 806;
export const SHOTS = [[0, 0, "sideLow"], [84, 14, "front"], [132, 14, "itemCome"], [176, 16, "top"], [226, 14, "close"],
  [262, 14, "itemCome2"], [356, 14, "sideHigh"], [430, 14, "front2"], [470, 16, "closeStruggle"], [560, 14, "top2"],
  [620, 14, "sideLow2"], [675, 10, "slideWatch"], [704, 34, "reveal"], [832, 68, "sideLow"]];

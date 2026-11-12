// «The Ladder» — все тайминги (кадры, 30 fps), 30 с.
export const FPS = 30;
export const N = 900;
export const DUR = N / FPS;
export const LINE1 = "I'LL SLOW DOWN AT THE TOP.";
export const LINE2 = "NO ONE WAITED THAT LONG.";
export const TURN = 690;                       // встал наверху: пусто
export const FADE0 = 885;
export const CLIMB = [[0, 170, 6], [250, 640, 7.5]];   // [начало, конец, кадров на одно движение конечности]
export const LOOK = [176, 250], SHAKE = [228, 246];
export const MANTLE = [640, 690];               // перелезает через край
export const LOOK_AROUND = [700, 736];
export const TURN_BACK = [740, 754];            // разворачивается и подходит к краю (левее лестницы)
export const SIT = [810, 836];                  // садится на край, ноги свисают
// ребёнок
export const KID_PICK = [184, 194], KID_UP = [194, 204], KID_WAVE = [204, 238], KID_DOWN = [244, 262];
export const KID_OUT = [333, 338], TEEN_IN = [342, 347];
export const TEEN_STAND = [352, 370], TEEN_DROP = [374, 380], TEEN_WALK = [384, 436], TEEN_FADE = [430, 436];
// жена
export const WIFE_LOOK_KID = [192, 202], WIFE_LOOK_UP = [212, 224];
export const WIFE_STAND = [512, 532], WIFE_REACH = [536, 550], LAMP_DIM = 552, WIFE_WALK = [558, 612], WIFE_FADE = [606, 612];
export const LAMP_DIE = [784, 800];
// камера: [кадр старта перехода, длительность перехода, план]
export const SHOTS = [[0, 0, "wideLow"], [78, 16, "hands"], [170, 14, "table"], [222, 12, "heroLook"], [252, 14, "topDown"],
  [300, 16, "sideWide"], [438, 14, "handsHigh"], [500, 14, "shoulderDown"], [522, 14, "wifeScene"], [612, 16, "topApproach"], [678, 14, "topReveal"],
  [756, 12, "povDown"], [806, 16, "frontSit"]];

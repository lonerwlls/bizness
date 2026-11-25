// Общая шкала всего ролика: длительности частей, сдвиги, батарея (фишка канала) и «сюжетное» время таймера.
import { interpolate } from "remotion";
import { FPS, makeAt } from "./kit";
import { VOICE as V1 } from "./voice1";
import { VOICE as V2 } from "./voice2";
import { VOICE as V3 } from "./voice3";
import { VOICE as V4 } from "./voice4";
import { VOICE as V5 } from "./voice5";
import { VOICE as V6 } from "./voice6";
import { VOICE as V7 } from "./voice7";

export const LEAD = 6;
export const VOICES = [V1, V2, V3, V4, V5, V6, V7];
export const FRAMES = VOICES.map((v) => Math.ceil((v.dur + 1.6) * FPS) + LEAD);
export const OFF = FRAMES.map((_, i) => FRAMES.slice(0, i).reduce((a, b) => a + b, 0));
export const TOTAL = FRAMES.reduce((a, b) => a + b, 0);
export const ATS = VOICES.map((v) => makeAt(v, LEAD));

const anchors: [number, number][] = [
  [OFF[0] + ATS[0]("läuft"), 100],
  [OFF[3] + ATS[3]("Akku"), 50],
  [OFF[4] + ATS[4]("Akku"), 30],
  [OFF[6] + ATS[6]("Akku"), 1],
  [TOTAL, 1],
];
export const batteryAt = (g: number) => interpolate(g, anchors.map((a) => a[0]), anchors.map((a) => a[1]), { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

// сюжетное время (секунды) на начало/конец части: прибыл на рассвете, закат ≈ 8,5 ч, рассвет дня 2 ≈ 24 ч
export const STORY: ([number, number] | null)[] = [null, [2, 9000], [9000, 30600], [30600, 72000], [86400, 108000], null, null];

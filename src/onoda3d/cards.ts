// Наш аниме-персонаж (AnimeChar, SVG) как плоская карточка в 3D-мире: SVG → Canvas2D → CanvasTexture на плоскости,
// которая всегда смотрит в камеру (поворот только вокруг вертикали). Слой NOINK: у персонажа свой контур и свечение.
import React from "react";
import { renderToStaticMarkup } from "react-dom/server.browser";
import * as THREE from "three";
import { AnimeChar } from "../esport/anime";
import { NOINK } from "../videos/bridge/ink";
import { SvgDraw } from "./svgcanvas";

type CharProps = React.ComponentProps<typeof AnimeChar>;
export const DW = 1100, DH = 2150;          // холст в единицах рисунка
const CX = 550, CY = 340;                   // где центр лица на холсте
const SOLE = CY + 1764;                     // подошвы
export const SU = 1.72 / 2054;              // метров на единицу рисунка (рост ~1,72 м)

export class AnimeCard {
  mesh: THREE.Mesh;
  mat: THREE.MeshBasicMaterial;
  private cv = document.createElement("canvas");
  private tex: THREE.CanvasTexture;
  private last = "";
  constructor(parent: THREE.Object3D) {
    this.cv.width = 2; this.cv.height = 2;
    this.tex = new THREE.CanvasTexture(this.cv);
    this.tex.colorSpace = THREE.SRGBColorSpace; this.tex.anisotropy = 8;
    this.mat = new THREE.MeshBasicMaterial({ map: this.tex, transparent: true, alphaTest: 0.04, side: THREE.DoubleSide, depthWrite: true, fog: false });
    const geo = new THREE.PlaneGeometry(DW * SU, DH * SU);
    geo.translate(0, (SOLE - DH / 2) * SU, 0); // подошвы в начале координат меша
    this.mesh = new THREE.Mesh(geo, this.mat);
    this.mesh.layers.set(NOINK);
    this.mesh.renderOrder = 1;
    this.mesh.visible = false;
    parent.add(this.mesh);
  }
  /** нарисовать персонажа с этими свойствами; px — ширина холста в пикселях (качество) */
  draw(props: Omit<CharProps, "x" | "y">, px = 700, tint: [number, number, number] = [1, 1, 1]) {
    const svg = renderToStaticMarkup(
      React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: DW, height: DH, viewBox: `0 0 ${DW} ${DH}` },
        React.createElement(AnimeChar, { ...(props as CharProps), x: CX, y: CY })),
    );
    const key = svg + "|" + px;
    if (key !== this.last) {
      const k = px / DW;
      const w = Math.round(DW * k), h = Math.round(DH * k);
      if (this.cv.width !== w || this.cv.height !== h) {
        this.cv.width = w; this.cv.height = h;
        this.tex.dispose();
        this.tex = new THREE.CanvasTexture(this.cv);
        this.tex.colorSpace = THREE.SRGBColorSpace; this.tex.anisotropy = 8;
        this.mat.map = this.tex;
      }
      const g = this.cv.getContext("2d")!;
      g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, h); g.setTransform(k, 0, 0, k, 0, 0);
      new SvgDraw(g).draw(svg);
      this.tex.needsUpdate = true;
      this.last = key;
    }
    this.mat.color.setRGB(...tint);
    this.mesh.visible = true;
  }
  place(at: THREE.Vector3, cam: THREE.Camera, scale = 1) {
    this.mesh.position.copy(at);
    this.mesh.rotation.set(0, Math.atan2(cam.position.x - at.x, cam.position.z - at.z), 0);
    this.mesh.scale.setScalar(scale);
  }
}

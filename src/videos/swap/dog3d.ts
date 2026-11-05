// The hero's dog as a 3D model in our prop style (two-tone lit lam() materials, ink outlines, real size), shaped
// after a fluffy collie: sable back, white ruff and chest, white socks, a big plumed tail with a white tip, folded
// ears, a white blaze, glossy eyes. Fur is built from clusters of low-poly "puffs". Faces +x, stands on y = 0,
// ~0.95 m long, shoulders at ~0.55 m. update() walks the legs, wags the tail and opens the jaw to bark.
import * as THREE from "three";
import { lam } from "../bridge/build";

const SABLE = () => lam("dogSable", () => ({ color: "#b8743a" }));
const SABLE_D = () => lam("dogSableD", () => ({ color: "#7a4622" }));
const WHITE = () => lam("dogWhite", () => ({ color: "#f6f0e4" }));
const NOSE = () => lam("dogNose", () => ({ color: "#1e1a22" }));
const MOUTH = () => lam("dogMouth", () => ({ color: "#6a1e28" }));
const TONGUE = () => lam("dogTongue", () => ({ color: "#e8707a" }));
const puffGeo = new THREE.IcosahedronGeometry(1, 1);
const mesh = (parent: THREE.Object3D, geo: THREE.BufferGeometry, m: THREE.Material, p: [number, number, number], s: [number, number, number] = [1, 1, 1], r: [number, number, number] = [0, 0, 0]) => {
  const x = new THREE.Mesh(geo, m); x.position.set(...p); x.scale.set(...s); x.rotation.set(...r); x.castShadow = true; x.receiveShadow = true; parent.add(x); return x;
};
/** a soft clump of fur: a few overlapping puffs around a centre */
const puffs = (parent: THREE.Object3D, m: THREE.Material, c: [number, number, number], r: number, n: number, seed: number, squash: [number, number, number] = [1, 1, 1]) => {
  let s = seed;
  const rr = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  for (let i = 0; i < n; i++) {
    const d = r * 0.55, q = r * (0.55 + 0.35 * rr());
    mesh(parent, puffGeo, m, [c[0] + (rr() - 0.5) * d * 2 * squash[0], c[1] + (rr() - 0.5) * d * 2 * squash[1], c[2] + (rr() - 0.5) * d * 2 * squash[2]], [q, q * 0.9, q]);
  }
};

export class Dog3D {
  root = new THREE.Group();
  private legs: { pivot: THREE.Group; ph: number }[] = [];
  private tail = new THREE.Group();
  private head = new THREE.Group();
  private jaw = new THREE.Group();

  constructor() {
    const R = this.root, sable = SABLE(), dark = SABLE_D(), white = WHITE();
    // ---- body: a long rounded barrel of sable fur, darker along the back ----
    mesh(R, new THREE.CapsuleGeometry(0.16, 0.42, 6, 14), sable, [0, 0.5, 0], [1, 1, 0.95], [0, 0, Math.PI / 2]);
    puffs(R, dark, [-0.02, 0.63, 0], 0.13, 7, 3, [1.8, 0.4, 0.7]);
    puffs(R, sable, [-0.24, 0.52, 0], 0.15, 6, 5, [0.6, 0.8, 0.9]);                 // haunch fluff
    puffs(R, white, [0.02, 0.37, 0], 0.11, 5, 7, [1.6, 0.4, 0.8]);                 // pale belly fringe
    // ---- the ruff: a big white mane over the chest and throat ----
    puffs(R, white, [0.27, 0.55, 0], 0.17, 9, 11, [0.7, 1.1, 1.0]);
    puffs(R, white, [0.33, 0.7, 0], 0.13, 6, 13, [0.6, 0.8, 1.0]);
    puffs(R, sable, [0.2, 0.74, 0], 0.12, 5, 17, [0.6, 0.6, 1.1]);                 // sable mane at the back of the neck
    // ---- legs (pivot at the hip / shoulder): sable thigh, white sock, white paw ----
    for (const [x, z, ph, front] of [[0.26, 0.09, 0, true], [0.26, -0.09, 0.5, true], [-0.26, 0.09, 0.5, false], [-0.26, -0.09, 0, false]] as [number, number, number, boolean][]) {
      const pivot = new THREE.Group(); pivot.position.set(x, 0.46, z); R.add(pivot);
      mesh(pivot, new THREE.CapsuleGeometry(front ? 0.055 : 0.07, 0.12, 4, 10), front ? white : sable, [0, -0.1, 0]);
      mesh(pivot, new THREE.CapsuleGeometry(0.042, 0.2, 4, 10), white, [front ? 0 : -0.03, -0.27, 0]);
      mesh(pivot, new THREE.SphereGeometry(0.055, 12, 8), white, [0.03, -0.42, 0], [1.3, 0.6, 1]);
      this.legs.push({ pivot, ph });
    }
    // ---- tail: a plume of puffs curving down and back, white tip ----
    this.tail.position.set(-0.4, 0.58, 0); R.add(this.tail);
    const tailPts: [number, number, number][] = [[-0.06, -0.02, 0], [-0.14, -0.1, 0], [-0.2, -0.2, 0], [-0.22, -0.31, 0]];
    tailPts.forEach((p, i) => puffs(this.tail, i === 3 ? white : sable, p, 0.07 + i * 0.012, 4, 21 + i, [1, 1, 0.8]));
    // ---- head: skull, snout with a white blaze, nose, eyes, folded ears, a jaw that opens ----
    this.head.position.set(0.36, 0.84, 0); R.add(this.head);
    const H = this.head;
    mesh(H, new THREE.SphereGeometry(0.12, 18, 12), sable, [0, 0, 0], [1.05, 0.95, 0.95]);
    puffs(H, sable, [-0.05, -0.04, 0], 0.08, 4, 31, [0.6, 0.8, 1.4]);                // cheek fluff
    mesh(H, new THREE.SphereGeometry(0.1, 18, 12), sable, [0.14, -0.035, 0], [1.15, 0.55, 0.62], [0, 0, -0.12]);   // long tapered snout
    mesh(H, new THREE.SphereGeometry(0.1, 16, 10), white, [0.1, 0.035, 0], [1.25, 0.28, 0.24], [0, 0, -0.3]);     // white blaze up the face
    mesh(H, new THREE.SphereGeometry(0.068, 14, 10), white, [0.17, -0.07, 0], [1.1, 0.6, 0.9]);  // white muzzle underside
    mesh(H, new THREE.SphereGeometry(0.03, 12, 8), NOSE(), [0.245, -0.025, 0], [1, 0.8, 1.1]);
    for (const s of [-1, 1]) {
      mesh(H, new THREE.SphereGeometry(0.024, 12, 8), NOSE(), [0.08, 0.035, s * 0.085]);
      const hl = new THREE.Mesh(new THREE.SphereGeometry(0.007, 6, 4), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.6, 1.6) }));
      hl.position.set(0.095, 0.045, s * 0.098); H.add(hl);
      // semi-erect ears with folded tips
      const ear = new THREE.Group(); ear.position.set(-0.04, 0.1, s * 0.07); ear.rotation.set(s * 0.35, 0, -0.15); H.add(ear);
      mesh(ear, new THREE.ConeGeometry(0.045, 0.1, 10), dark, [0, 0.04, 0], [1, 1, 0.45]);
      mesh(ear, new THREE.ConeGeometry(0.03, 0.05, 8), dark, [0.03, 0.085, 0], [1, 1, 0.45], [0, 0, -1.6]);
    }
    // jaw (pivot at the back of the mouth): mouth lining + tongue + white lower lip
    this.jaw.position.set(0.08, -0.07, 0); H.add(this.jaw);
    mesh(this.jaw, new THREE.BoxGeometry(0.15, 0.025, 0.08), MOUTH(), [0.08, 0.005, 0]);
    mesh(this.jaw, new THREE.BoxGeometry(0.1, 0.012, 0.05), TONGUE(), [0.08, 0.02, 0]);
    mesh(this.jaw, new THREE.CapsuleGeometry(0.03, 0.1, 4, 8), white, [0.08, -0.02, 0], [1, 0.8, 1.3], [0, 0, Math.PI / 2]);
  }

  /** t seconds; walk 0..1 (leg swing); bark = mouth opening and closing; sniff = head lowered */
  update(t: number, walk: number, bark: boolean, sniff = false) {
    for (const l of this.legs) l.pivot.rotation.z = walk * 0.45 * Math.sin(t * 9 + l.ph * Math.PI * 2);
    this.tail.rotation.set(0.5 * Math.sin(t * (bark ? 14 : 8)), 0, 0.15 * Math.sin(t * 4));
    const open = bark ? Math.max(0, Math.sin(t * 16)) : 0;
    this.jaw.rotation.z = -0.55 * open;
    this.head.rotation.z = sniff ? -0.45 : bark ? 0.12 * open : 0.04 * Math.sin(t * 2);
    this.head.position.y = sniff ? 0.74 : 0.84;
    this.root.position.y = walk * 0.012 * Math.abs(Math.sin(t * 9));
  }
}

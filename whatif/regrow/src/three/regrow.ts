import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {inkPx, mesh, paint, toon} from './toon';

/* 3D props of "What if you could regrow any body part?" (units = world px, y up).
   Same look as props.ts: two-tone toon shading, constant dark outline. */
const rbox = (w: number, h: number, d: number, r = 4) => new RoundedBoxGeometry(w, h, d, 3, r);

/* bagel lying flat, centred, bottom on y = 0 */
export const makeBagel = () => {
	const g = new THREE.Group();
	const ring = mesh(new THREE.TorusGeometry(30, 15, 16, 36), toon('#d99a52'), [0, 14, 0], [Math.PI / 2, 0, 0], [1, 1, 0.92]);
	g.add(ring);
	// a lighter top crust and sesame seeds
	const top = mesh(new THREE.TorusGeometry(30, 12, 12, 36, Math.PI * 2), toon('#e8b46a'), [0, 19, 0], [Math.PI / 2, 0, 0], [1, 1, 0.5]);
	top.userData.noInk = true;
	g.add(top);
	for (let i = 0; i < 16; i++) {
		const a = (i / 16) * Math.PI * 2 + (i % 3) * 0.2;
		const r = 26 + (i % 3) * 5;
		const s = mesh(new THREE.SphereGeometry(2.2, 8, 6), toon('#fbf0d0'), [Math.cos(a) * r, 26, Math.sin(a) * r], [0, a, 0], [1.6, 0.6, 0.9]);
		s.userData.noInk = true;
		g.add(s);
	}
	return inkPx(g, 2.4);
};

/* kitchen knife along +x: handle centred on the origin, blade to the right */
export const makeKnife = () => {
	const g = new THREE.Group();
	g.add(mesh(rbox(54, 14, 12, 5), toon('#2a2a34'), [-6, 0, 0]));
	for (const x of [-20, 6]) g.add(mesh(new THREE.CylinderGeometry(2.5, 2.5, 13, 8), toon('#c8ccd8'), [x, 0, 0], [Math.PI / 2, 0, 0]));
	const sh = new THREE.Shape();
	sh.moveTo(0, -6);
	sh.lineTo(100, -6);
	sh.quadraticCurveTo(96, 8, 0, 12);
	sh.lineTo(0, -6);
	g.add(mesh(new THREE.ExtrudeGeometry(sh, {depth: 2.5, bevelEnabled: false}), toon('#dfe4ee'), [21, -2, -1.2]));
	return inkPx(g, 2.2);
};

/* wooden cutting board, top on y = 0 */
export const makeBoard = () => {
	const g = new THREE.Group();
	g.add(mesh(rbox(190, 12, 110, 5), toon('#c98a4a'), [0, -6, 0]));
	g.add(mesh(new THREE.CylinderGeometry(8, 8, 13, 16), toon('#7a4e2a'), [80, -6, 0]));
	return inkPx(g, 2.4);
};

/* coffee mug, bottom on y = 0, handle to +x */
export const makeMug = (c = '#e4473c') => {
	const g = new THREE.Group();
	g.add(mesh(new THREE.CylinderGeometry(22, 20, 52, 24), toon(c), [0, 26, 0]));
	const coffee = mesh(new THREE.CylinderGeometry(19, 19, 2, 20), toon('#5a3420'), [0, 50, 0]);
	coffee.userData.noInk = true;
	g.add(coffee);
	g.add(mesh(new THREE.TorusGeometry(12, 4, 8, 16, Math.PI), toon(c), [22, 26, 0], [0, 0, -Math.PI / 2]));
	g.userData.coffee = coffee;
	return inkPx(g, 2.2);
};

/* a coffee puddle on the floor (flat ellipse), grows with k */
export const makePuddle = () => {
	const p = mesh(new THREE.CircleGeometry(1, 28), toon('#6a3c22'), [0, 1, 0], [-Math.PI / 2, 0, 0]);
	p.userData.noInk = true;
	return p;
};

/* wall-mounted first-aid box, centred, front facing the camera */
export const makeFirstAid = () => {
	const g = new THREE.Group();
	g.add(mesh(rbox(150, 120, 46, 8), toon('#f4f6fa'), [0, 0, 0]));
	g.add(mesh(new THREE.BoxGeometry(70, 20, 4), toon('#e4473c'), [0, 0, 24]));
	g.add(mesh(new THREE.BoxGeometry(20, 70, 4), toon('#e4473c'), [0, 0, 24]));
	g.add(mesh(new THREE.BoxGeometry(14, 30, 8), toon('#8a90a0'), [66, 0, 22]));
	return inkPx(g, 2.6);
};

/* gauze roll, lying on its side, bottom on y = 0 */
export const makeGauze = () => {
	const g = new THREE.Group();
	g.add(mesh(new THREE.CylinderGeometry(18, 18, 30, 20), toon('#fbfaf4'), [0, 18, 0], [Math.PI / 2, 0, 0]));
	g.add(mesh(new THREE.CylinderGeometry(7, 7, 31, 12), toon('#d8dce6'), [0, 18, 0], [Math.PI / 2, 0, 0]));
	return inkPx(g, 2);
};

/* ------------------------------ the axolotl ------------------------------ */
/* faces +x, belly on y = 0; userData.legs = the four legs (scale one to 0 to "lose" it),
   userData.gills / tail for idle motion */
export type Axo = THREE.Group & {userData: {legs: THREE.Group[]; gills: THREE.Group[]; tail: THREE.Group; body: THREE.Group}};
export const makeAxolotl = (): Axo => {
	const g = new THREE.Group() as Axo;
	const body = new THREE.Group();
	g.add(body);
	const pink = toon('#f4a6b8');
	const deep = toon('#e0708e');
	// body + tail
	body.add(mesh(new THREE.CapsuleGeometry(26, 110, 8, 20), pink, [0, 30, 0], [0, 0, Math.PI / 2], [1, 1, 0.9]));
	const tail = new THREE.Group();
	tail.position.set(-80, 32, 0);
	const fin = new THREE.Shape();
	fin.moveTo(0, -18);
	fin.quadraticCurveTo(-60, -10, -120, 4);
	fin.quadraticCurveTo(-60, 24, 0, 22);
	fin.lineTo(0, -18);
	tail.add(mesh(new THREE.ExtrudeGeometry(fin, {depth: 10, bevelEnabled: true, bevelSize: 3, bevelThickness: 3, bevelSegments: 2}), pink, [0, 0, -5]));
	body.add(tail);
	// head: wide and flat
	const head = new THREE.Group();
	head.position.set(84, 38, 0);
	head.add(mesh(new THREE.SphereGeometry(40, 24, 16), pink, [0, 0, 0], undefined, [1, 0.72, 1.12]));
	// smile
	const smile = mesh(new THREE.TorusGeometry(16, 2.2, 6, 16, Math.PI * 0.8), toon('#7a2a3a'), [26, -10, 14], [0, 0.5, Math.PI * 1.1]);
	smile.userData.noInk = true;
	head.add(smile);
	for (const z of [-26, 26]) {
		head.add(mesh(new THREE.SphereGeometry(6, 12, 10), toon('#1b1420'), [24, 8, z * 0.95]));
		const hl = mesh(new THREE.SphereGeometry(1.8, 8, 6), toon('#ffffff'), [27, 11, z * 0.95 + (z > 0 ? 3 : -3)]);
		hl.userData.noInk = true;
		head.add(hl);
	}
	// three pairs of feathery gills
	const gills: THREE.Group[] = [];
	for (const side of [-1, 1])
		for (let i = 0; i < 3; i++) {
			const gl = new THREE.Group();
			gl.position.set(-14 + i * 4, 6 + i * 8, side * 38);
			gl.rotation.set(side * 0.5, 0, 0.9 - i * 0.45);
			gl.add(mesh(new THREE.CylinderGeometry(3.5, 2, 42, 8), deep, [0, 21, 0]));
			for (let k = 0; k < 5; k++) {
				const fr = mesh(new THREE.CylinderGeometry(1.4, 1.4, 12, 6), deep, [4, 10 + k * 7, 0], [0, 0, -1.0]);
				fr.userData.noInk = true;
				gl.add(fr);
			}
			head.add(gl);
			gills.push(gl);
		}
	body.add(head);
	// legs with little four-toed hands
	const legs: THREE.Group[] = [];
	for (const [x, z] of [
		[50, 22],
		[50, -22],
		[-40, 22],
		[-40, -22],
	] as const) {
		const leg = new THREE.Group();
		leg.position.set(x, 18, z);
		leg.add(mesh(new THREE.CylinderGeometry(7, 6, 30, 10), pink, [0, -12, z > 0 ? 6 : -6], [z > 0 ? 0.5 : -0.5, 0, 0]));
		for (let k = 0; k < 4; k++) {
			const toe = mesh(new THREE.CapsuleGeometry(2.4, 8, 4, 8), pink, [-6 + k * 4, -26, (z > 0 ? 14 : -14) + (k - 1.5) * 2], [Math.PI / 2, 0, (k - 1.5) * 0.3]);
			toe.userData.noInk = true;
			leg.add(toe);
		}
		body.add(leg);
		legs.push(leg);
	}
	inkPx(g, 2.6);
	g.userData = {legs, gills, tail, body};
	return g;
};
export const swimAxo = (a: Axo, f: number) => {
	a.userData.tail.rotation.y = Math.sin(f / 9) * 0.25;
	a.userData.gills.forEach((gl, i) => (gl.rotation.y = Math.sin(f / 11 + i) * 0.15));
	a.userData.body.position.y = Math.sin(f / 23) * 3;
};

/* ------------------------------ 1898 lab ------------------------------ */
/* brass microscope, base on y = 0, eyepiece up-left */
export const makeMicroscope = () => {
	const g = new THREE.Group();
	const brass = toon('#c99a3a');
	const dark = toon('#3a2a1a');
	g.add(mesh(new THREE.CylinderGeometry(52, 58, 16, 28), dark, [0, 8, 0]));
	g.add(mesh(rbox(22, 120, 24, 4), brass, [-26, 74, 0], [0, 0, 0.12]));
	g.add(mesh(rbox(86, 8, 70, 3), dark, [10, 70, 0]));
	g.add(mesh(new THREE.CylinderGeometry(15, 15, 120, 20), brass, [8, 150, 0], [0, 0, 0.32]));
	g.add(mesh(new THREE.CylinderGeometry(10, 12, 26, 16), brass, [26, 92, 0], [0, 0, 0.32]));
	g.add(mesh(new THREE.CylinderGeometry(11, 11, 22, 16), dark, [-14, 214, 0], [0, 0, 0.32]));
	g.add(mesh(new THREE.CylinderGeometry(16, 16, 8, 20), brass, [-12, 140, 18], [Math.PI / 2, 0, 0]));
	return inkPx(g, 2.6);
};
/* glass petri dish with a little water, bottom on y = 0 */
export const makeDish = () => {
	const g = new THREE.Group();
	g.add(mesh(new THREE.CylinderGeometry(48, 48, 14, 32, 1, true), toon('#d8eef0', {transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false}), [0, 7, 0]));
	g.add(mesh(new THREE.CylinderGeometry(48, 48, 2, 32), toon('#cfe6e8', {transparent: true, opacity: 0.6, depthWrite: false}), [0, 1, 0]));
	const w = mesh(new THREE.CylinderGeometry(46, 46, 6, 32), toon('#9fc8d0', {transparent: true, opacity: 0.55, depthWrite: false}), [0, 5, 0]);
	w.userData.noInk = true;
	g.add(w);
	return inkPx(g, 2);
};

/* ------------------------------ experiments ------------------------------ */
/* open notebook lying on a desk (top on y = 0); write(k) fills the right page with lines */
export type Notebook = THREE.Group & {userData: {write: (k: number) => void}};
export const makeNotebook = (title: string): Notebook => {
	const g = new THREE.Group() as Notebook;
	g.add(mesh(rbox(240, 6, 160, 2), toon('#2a4a7a'), [0, -3, 0]));
	const cv = document.createElement('canvas');
	cv.width = 512;
	cv.height = 320;
	const tex = new THREE.CanvasTexture(cv);
	tex.colorSpace = THREE.SRGBColorSpace;
	const draw = (k: number) => {
		const c = cv.getContext('2d')!;
		c.fillStyle = '#fbfaf2';
		c.fillRect(0, 0, 512, 320);
		c.strokeStyle = '#c9d6ea';
		c.lineWidth = 2;
		for (let y = 40; y < 320; y += 26) {
			c.beginPath();
			c.moveTo(0, y);
			c.lineTo(512, y);
			c.stroke();
		}
		c.strokeStyle = '#8a90a0';
		c.beginPath();
		c.moveTo(256, 0);
		c.lineTo(256, 320);
		c.stroke();
		c.fillStyle = '#2a2f4a';
		c.font = '700 30px Caveat, cursive';
		c.fillText(title, 20, 32);
		const n = Math.floor(k * 9);
		for (let i = 0; i < n; i++) {
			c.fillRect(276, 52 + i * 26, 150 + ((i * 53) % 70), 3);
		}
		tex.needsUpdate = true;
	};
	draw(0);
	const page = mesh(new THREE.PlaneGeometry(232, 150), new THREE.MeshBasicMaterial({map: tex}), [0, 0.6, 0], [-Math.PI / 2, 0, 0]);
	page.userData.noInk = true;
	g.add(page);
	inkPx(g, 2.2);
	g.userData = {write: draw};
	return g;
};
/* pen along +x, tip at +x */
export const makePen = () => {
	const g = new THREE.Group();
	g.add(mesh(new THREE.CylinderGeometry(4, 4, 70, 12), toon('#2a4a9a'), [0, 0, 0], [0, 0, Math.PI / 2]));
	g.add(mesh(new THREE.ConeGeometry(4, 12, 12), toon('#c8ccd8'), [41, 0, 0], [0, 0, -Math.PI / 2]));
	return inkPx(g, 1.8);
};
/* curved surgical needle along +x (handle = needle holder), tip at +x */
export const makeNeedleHolder = () => {
	const g = new THREE.Group();
	g.add(mesh(new THREE.BoxGeometry(70, 6, 5), toon('#9aa0ae'), [0, 0, 0]));
	for (const s of [-1, 1]) g.add(mesh(new THREE.TorusGeometry(9, 2.6, 8, 16), toon('#9aa0ae'), [-40, s * 8, 0]));
	g.add(mesh(new THREE.TorusGeometry(10, 1.4, 6, 16, Math.PI), toon('#e8ecf2'), [40, -6, 0], [0, 0, Math.PI]));
	return inkPx(g, 1.8);
};
/* roll of bandage tape standing on y = 0 */
export const makeTape = () => {
	const g = new THREE.Group();
	g.add(mesh(new THREE.CylinderGeometry(22, 22, 18, 24), toon('#fbfaf4'), [0, 9, 0]));
	g.add(mesh(new THREE.CylinderGeometry(12, 12, 19, 16), toon('#c8ccd8'), [0, 9, 0]));
	return inkPx(g, 2);
};

/* small label texture helper for jars and bottles */
export const labelTex = (text: string, bg: string, fg = '#11142c') =>
	paint(256, 128, (c) => {
		c.fillStyle = bg;
		c.fillRect(0, 0, 256, 128);
		c.fillStyle = fg;
		c.font = '900 52px Rubik, sans-serif';
		c.textAlign = 'center';
		c.fillText(text, 128, 84);
	});
/* lab bottle with a label, bottom on y = 0 */
export const makeBottle = (c: string, text: string) => {
	const g = new THREE.Group();
	g.add(mesh(new THREE.CylinderGeometry(20, 20, 60, 20), toon(c, {transparent: true, opacity: 0.85}), [0, 30, 0]));
	g.add(mesh(new THREE.CylinderGeometry(8, 12, 16, 14), toon(c), [0, 68, 0]));
	g.add(mesh(new THREE.CylinderGeometry(9, 9, 10, 14), toon('#2a2a34'), [0, 80, 0]));
	const lab = mesh(new THREE.CylinderGeometry(20.6, 20.6, 26, 20, 1, true, -0.9, 1.8), new THREE.MeshBasicMaterial({map: labelTex(text, '#fbfaf2')}), [0, 28, 0]);
	lab.userData.noInk = true;
	g.add(lab);
	return inkPx(g, 2);
};

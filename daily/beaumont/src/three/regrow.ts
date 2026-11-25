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
/* open notebook lying on a desk (top on y = 0). write(k) writes the lines letter by letter
   and returns where the pen tip is, in canvas px (512×320; the page plane is 232×150 units) */
export type Notebook = THREE.Group & {userData: {write: (k: number) => [number, number]}};
export const NOTE_LINES = ['Day 1', 'Test subject: ME', 'Skin sample, arm'];
export const makeNotebook = (lines: string[] = NOTE_LINES): Notebook => {
	const g = new THREE.Group() as Notebook;
	g.add(mesh(rbox(240, 6, 160, 2), toon('#2a4a7a'), [0, -3, 0]));
	const cv = document.createElement('canvas');
	cv.width = 512;
	cv.height = 320;
	const tex = new THREE.CanvasTexture(cv);
	tex.colorSpace = THREE.SRGBColorSpace;
	const total = lines.reduce((a, l) => a + l.length, 0);
	let last = -1;
	let tip: [number, number] = [24, 70];
	const draw = (k: number): [number, number] => {
		const n = Math.floor(k * total + 1e-6);
		const key = n * 2 + (document.fonts.check("700 40px 'Caveat'") ? 1 : 0);
		if (key === last) return tip;
		last = key;
		const c = cv.getContext('2d')!;
		c.fillStyle = '#fbfaf2';
		c.fillRect(0, 0, 512, 320);
		c.strokeStyle = '#c9d6ea';
		c.lineWidth = 2;
		for (let y = 70; y < 320; y += 50) {
			c.beginPath();
			c.moveTo(0, y + 6);
			c.lineTo(512, y + 6);
			c.stroke();
		}
		c.strokeStyle = '#d8a0a8';
		c.beginPath();
		c.moveTo(16, 0);
		c.lineTo(16, 320);
		c.stroke();
		c.fillStyle = '#1d2a5a';
		c.font = "700 40px 'Caveat', cursive";
		let left = n;
		tip = [24, 70];
		lines.forEach((l, i) => {
			if (left <= 0) return;
			const part = l.slice(0, left);
			left -= l.length;
			c.fillText(part, 24, 70 + i * 50);
			tip = [24 + c.measureText(part).width, 70 + i * 50];
		});
		tex.needsUpdate = true;
		return tip;
	};
	draw(0);
	const page = mesh(new THREE.PlaneGeometry(232, 150), new THREE.MeshBasicMaterial({map: tex}), [0, 0.6, 0], [-Math.PI / 2, 0, 0]);
	page.userData.noInk = true;
	g.add(page);
	inkPx(g, 2.2);
	g.userData = {write: draw};
	return g;
};
/* where the pen tip is after k of the notebook text (same layout as makeNotebook), canvas px */
let measureCtx: CanvasRenderingContext2D | null = null;
export const noteTipAt = (k: number, lines: string[] = NOTE_LINES): [number, number] => {
	if (!measureCtx) measureCtx = document.createElement('canvas').getContext('2d');
	const c = measureCtx!;
	c.font = "700 40px 'Caveat', cursive";
	const total = lines.reduce((a, l) => a + l.length, 0);
	let left = Math.floor(k * total + 1e-6);
	let tip: [number, number] = [24, 70];
	lines.forEach((l, i) => {
		if (left <= 0) return;
		const part = l.slice(0, left);
		left -= l.length;
		tip = [24 + c.measureText(part).width, 70 + i * 50];
	});
	return tip;
};
/* adhesive bandage, lying flat (top on y = 0), long side along x */
export const makeBandage = () => {
	const g = new THREE.Group();
	g.add(mesh(rbox(130, 4, 56, 2), toon('#e8c8a0'), [0, -2, 0]));
	g.add(mesh(rbox(54, 5, 40, 2), toon('#fbfaf2'), [0, -1, 0]));
	return inkPx(g, 2);
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

/* ------------------------------ part 2 ------------------------------ */
/* burger, bottom on y = 0; bite(k) takes a bite out of the front (scales it down) */
export const makeBurger = () => {
	const g = new THREE.Group();
	const bun = toon('#e0a050');
	g.add(mesh(new THREE.CylinderGeometry(40, 38, 14, 24), bun, [0, 7, 0]));
	g.add(mesh(new THREE.CylinderGeometry(42, 42, 12, 24), toon('#6a3a22'), [0, 19, 0]));
	g.add(mesh(new THREE.CylinderGeometry(45, 45, 3, 24), toon('#f2c84a'), [0, 26, 0], [0, 0, 0.05]));
	g.add(mesh(new THREE.CylinderGeometry(46, 46, 4, 24), toon('#5ab04a'), [0, 29, 0], [0.05, 0, 0]));
	const dome = new THREE.SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2);
	g.add(mesh(dome, bun, [0, 31, 0], undefined, [41, 26, 41]));
	for (let i = 0; i < 9; i++) {
		const a = (i / 9) * Math.PI * 2;
		const sd = mesh(new THREE.SphereGeometry(2, 6, 4), toon('#fbf0d0'), [Math.cos(a) * 24, 50, Math.sin(a) * 24], undefined, [1.4, 0.6, 0.8]);
		sd.userData.noInk = true;
		g.add(sd);
	}
	return inkPx(g, 2.2);
};
/* open pizza box with a pizza (n slices left), bottom on y = 0 */
export const makePizzaBox = () => {
	const g = new THREE.Group();
	g.add(mesh(rbox(180, 10, 180, 3), toon('#e8d4a8'), [0, 5, 0]));
	const lid = new THREE.Group();
	lid.position.set(0, 10, -90);
	lid.rotation.x = -1.9;
	lid.add(mesh(rbox(180, 6, 180, 3), toon('#e8d4a8'), [0, 0, 90]));
	lid.visible = false;
	g.add(lid);
	const slices: THREE.Mesh[] = [];
	for (let i = 0; i < 8; i++) {
		const sl = mesh(new THREE.CylinderGeometry(76, 76, 8, 12, 1, false, (i / 8) * Math.PI * 2, Math.PI / 4), toon('#f2b84a'), [0, 14, 0]);
		const top = mesh(new THREE.CylinderGeometry(68, 68, 2, 12, 1, false, (i / 8) * Math.PI * 2 + 0.03, Math.PI / 4 - 0.06), toon('#e4503c'), [0, 4.5, 0]);
		top.userData.noInk = true;
		sl.add(top);
		const pep = mesh(new THREE.CylinderGeometry(8, 8, 2, 10), toon('#b8302a'), [Math.sin((i / 8) * Math.PI * 2 + 0.4) * 42, 5.6, Math.cos((i / 8) * Math.PI * 2 + 0.4) * 42]);
		pep.userData.noInk = true;
		sl.add(pep);
		g.add(sl);
		slices.push(sl);
	}
	g.userData.slices = slices;
	return inkPx(g, 2.2);
};
/* a crumpled wrapper (paper ball), centred */
export const makeWrapper = (c = '#f4efe2') => {
	const geo = new THREE.IcosahedronGeometry(14, 0);
	return inkPx(mesh(geo, toon(c), [0, 0, 0], [0.4, 0.7, 0.2], [1, 0.8, 1]), 1.8);
};
/* softball, centred */
export const makeSoftball = () => {
	const g = new THREE.Group();
	g.add(mesh(new THREE.SphereGeometry(24, 24, 16), toon('#e8f060')));
	const seam = mesh(new THREE.TorusGeometry(24.3, 1.4, 6, 40), toon('#d23b3b'), [0, 0, 0], [0.6, 0.3, 0]);
	seam.userData.noInk = true;
	g.add(seam);
	return inkPx(g, 2.2);
};
/* a front tooth (incisor), centred, crown up */
export const makeTooth = () => {
	const g = new THREE.Group();
	g.add(mesh(rbox(14, 18, 8, 4), toon('#fbfaf2'), [0, 4, 0]));
	g.add(mesh(new THREE.ConeGeometry(5, 14, 10), toon('#f0e8d8'), [0, -11, 0], [Math.PI, 0, 0]));
	return inkPx(g, 1.6);
};
/* medicine vial with a label, bottom on y = 0 */
export const makeVial = (text: string) => {
	const g = new THREE.Group();
	g.add(mesh(new THREE.CylinderGeometry(16, 16, 46, 20), toon('#dff0fa', {transparent: true, opacity: 0.85}), [0, 23, 0]));
	const liq = mesh(new THREE.CylinderGeometry(14, 14, 30, 20), toon('#7ad8f0'), [0, 16, 0]);
	liq.userData.noInk = true;
	g.add(liq);
	g.add(mesh(new THREE.CylinderGeometry(9, 9, 8, 14), toon('#c8ccd8'), [0, 50, 0]));
	g.add(mesh(new THREE.CylinderGeometry(11, 11, 8, 14), toon('#d23b3b'), [0, 57, 0]));
	const lab = mesh(new THREE.CylinderGeometry(16.6, 16.6, 22, 20, 1, true, -0.9, 1.8), new THREE.MeshBasicMaterial({map: labelTex(text, '#fbfaf2')}), [0, 24, 0]);
	lab.userData.noInk = true;
	g.add(lab);
	return inkPx(g, 2);
};
/* syringe along +x, needle tip at +x */
export const makeSyringe = () => {
	const g = new THREE.Group();
	g.add(mesh(new THREE.CylinderGeometry(9, 9, 70, 16), toon('#e8f4fa', {transparent: true, opacity: 0.8}), [0, 0, 0], [0, 0, Math.PI / 2]));
	const liq = mesh(new THREE.CylinderGeometry(7, 7, 40, 14), toon('#7ad8f0'), [12, 0, 0], [0, 0, Math.PI / 2]);
	liq.userData.noInk = true;
	g.add(liq);
	g.add(mesh(new THREE.CylinderGeometry(3, 3, 30, 8), toon('#c8ccd8'), [-48, 0, 0], [0, 0, Math.PI / 2]));
	g.add(mesh(new THREE.CylinderGeometry(12, 12, 4, 14), toon('#c8ccd8'), [-64, 0, 0], [0, 0, Math.PI / 2]));
	g.add(mesh(new THREE.CylinderGeometry(1.2, 1.2, 30, 6), toon('#9aa0ae'), [50, 0, 0], [0, 0, Math.PI / 2]));
	return inkPx(g, 1.8);
};
/* clinic chair-side tray table with legs is 2D; plate for the dinner table */
export const makeDinnerPlate = () => {
	const g = new THREE.Group();
	g.add(mesh(new THREE.CylinderGeometry(60, 48, 8, 28), toon('#f4f6fa'), [0, 4, 0]));
	g.add(mesh(new THREE.CylinderGeometry(26, 26, 10, 18), toon('#e8b46a'), [-14, 12, 0], undefined, [1, 0.6, 0.7]));
	g.add(mesh(new THREE.SphereGeometry(12, 12, 8), toon('#5ab04a'), [20, 12, 6]));
	g.add(mesh(new THREE.SphereGeometry(10, 12, 8), toon('#5ab04a'), [28, 12, -8]));
	return inkPx(g, 2);
};
/* a pizza slice lying flat: crust at x = 0, tip at +x (held by the crust) */
export const makePizzaSlice = () => {
	const g = new THREE.Group();
	const sh = new THREE.Shape();
	sh.moveTo(0, -30);
	sh.lineTo(84, 0);
	sh.lineTo(0, 30);
	sh.lineTo(0, -30);
	g.add(mesh(new THREE.ExtrudeGeometry(sh, {depth: 6, bevelEnabled: false}), toon('#f2b84a'), [0, 0, 0], [-Math.PI / 2, 0, 0]));
	const top = mesh(new THREE.ExtrudeGeometry(sh, {depth: 1.5, bevelEnabled: false}), toon('#e4503c'), [4, 6.5, 0], [-Math.PI / 2, 0, 0], [0.88, 0.85, 1]);
	top.userData.noInk = true;
	g.add(top);
	g.add(mesh(new THREE.CylinderGeometry(6, 6, 62, 10), toon('#d89a4a'), [0, 4, 0], [Math.PI / 2, 0, 0]));
	for (const [x, z] of [[24, -8], [40, 8], [56, -2]]) {
		const p = mesh(new THREE.CylinderGeometry(6, 6, 2, 10), toon('#b8302a'), [x, 8.5, z]);
		p.userData.noInk = true;
		g.add(p);
	}
	return inkPx(g, 2);
};

/* ------------------------------ part 3 ------------------------------ */
/* organ transport cooler (red body, white lid, label), bottom on y = 0, 120 wide */
export const makeCooler = () => {
	const g = new THREE.Group();
	g.add(mesh(rbox(120, 70, 80, 8), toon('#d23b3b'), [0, 35, 0]));
	g.add(mesh(rbox(126, 16, 86, 6), toon('#f4f6fa'), [0, 76, 0]));
	g.add(mesh(rbox(54, 8, 14, 4), toon('#f4f6fa'), [0, 88, 0]));
	const lab = mesh(new THREE.PlaneGeometry(96, 36), new THREE.MeshBasicMaterial({map: paint(256, 96, (c) => {
		c.fillStyle = '#fbfaf4';
		c.fillRect(0, 0, 256, 96);
		c.fillStyle = '#d23b3b';
		c.font = '900 26px Rubik, sans-serif';
		c.textAlign = 'center';
		c.fillText('HUMAN ORGAN', 128, 38);
		c.fillText('FOR TRANSPLANT', 128, 74);
	})}), [0, 36, 40.6]);
	lab.userData.noInk = true;
	g.add(lab);
	return inkPx(g, 2.4);
};
/* a cheque lying flat (faces the camera when rotation.x = π/2), centred */
export const makeCheque = () => {
	const g = new THREE.Group();
	const tex = paint(512, 224, (c) => {
		c.fillStyle = '#e8f4e0';
		c.fillRect(0, 0, 512, 224);
		c.strokeStyle = '#7ab07a';
		c.lineWidth = 6;
		c.strokeRect(8, 8, 496, 208);
		c.fillStyle = '#2a4a2a';
		c.font = '700 26px Rubik, sans-serif';
		c.fillText('PAY TO: DR. ROO', 30, 60);
		c.font = '900 52px Rubik, sans-serif';
		c.fillText('$1,000,000,000', 30, 140);
		c.font = '700 30px Caveat, cursive';
		c.fillText('for one vial of cells', 30, 196);
	});
	const p = mesh(new THREE.BoxGeometry(200, 2, 88), [toon('#e8f4e0'), toon('#e8f4e0'), new THREE.MeshBasicMaterial({map: tex}), toon('#e8f4e0'), toon('#e8f4e0'), toon('#e8f4e0')], [0, 0, 0]);
	g.add(p);
	return inkPx(g, 1.8);
};
/* desktop 3D printer: frame, bed, moving nozzle; ear(k) = printed height 0..1 */
export type Printer = THREE.Group & {userData: {set: (k: number, f: number) => void}};
export const makePrinter = (): Printer => {
	const g = new THREE.Group() as Printer;
	const frame = toon('#2a2f3a');
	for (const x of [-120, 120]) g.add(mesh(rbox(16, 300, 16, 3), frame, [x, 150, -60]));
	g.add(mesh(rbox(256, 16, 16, 3), frame, [0, 300, -60]));
	g.add(mesh(rbox(280, 30, 160, 6), frame, [0, 15, 0]));
	g.add(mesh(rbox(200, 8, 130, 3), toon('#c8ccd8'), [0, 34, 0]));
	const head = new THREE.Group();
	head.add(mesh(rbox(50, 40, 40, 6), toon('#3d6fd6'), [0, 0, 0]));
	head.add(mesh(new THREE.ConeGeometry(8, 20, 10), toon('#c8ccd8'), [0, -30, 0], [Math.PI, 0, 0]));
	g.add(head);
	const rail = mesh(rbox(256, 10, 10, 2), toon('#8a90a0'), [0, 240, -20]);
	g.add(rail);
	// the ear: a flat outline, extruded thick, standing on the bed; printed bottom-up (scale.y)
	const sh = new THREE.Shape();
	sh.moveTo(0, 0);
	sh.bezierCurveTo(-30, 0, -40, 50, -34, 90);
	sh.bezierCurveTo(-28, 140, 20, 160, 46, 130);
	sh.bezierCurveTo(70, 100, 50, 60, 30, 50);
	sh.bezierCurveTo(14, 40, 26, 10, 0, 0);
	const hole = new THREE.Path();
	hole.moveTo(0, 60);
	hole.bezierCurveTo(-12, 70, -10, 110, 12, 118);
	hole.bezierCurveTo(30, 120, 34, 96, 20, 86);
	hole.bezierCurveTo(8, 78, 10, 64, 0, 60);
	sh.holes.push(hole);
	const ear = new THREE.Group();
	ear.add(mesh(new THREE.ExtrudeGeometry(sh, {depth: 22, bevelEnabled: true, bevelSize: 4, bevelThickness: 4, bevelSegments: 3}), toon('#f2d6c4'), [-6, 0, -11]));
	ear.position.set(0, 38, 0);
	g.add(ear);
	const set = (k: number, f: number) => {
		ear.scale.set(1, Math.max(0.001, k), 1);
		const done = k >= 1;
		head.position.set(done ? 0 : Math.sin(f / 3) * 40, 38 + 160 * k + 30, done ? 0 : Math.cos(f / 4) * 10);
		rail.position.y = 38 + 160 * k + 50;
	};
	set(0, 0);
	inkPx(g, 2.4);
	g.userData = {set};
	return g;
};
/* bioreactor jar with a grown bladder on a scaffold, bottom on y = 0 */
export const makeBioJar = () => {
	const g = new THREE.Group();
	g.add(mesh(new THREE.CylinderGeometry(70, 70, 16, 28), toon('#5a6078'), [0, 8, 0]));
	g.add(mesh(new THREE.CylinderGeometry(64, 64, 200, 28, 1, true), toon('#dff0fa', {transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false}), [0, 116, 0]));
	const liquid = mesh(new THREE.CylinderGeometry(62, 62, 150, 28), toon('#f6c8a0', {transparent: true, opacity: 0.35, depthWrite: false}), [0, 92, 0]);
	liquid.userData.noInk = true;
	g.add(liquid);
	g.add(mesh(new THREE.SphereGeometry(40, 24, 16), toon('#f0a0a8'), [0, 100, 0], undefined, [1, 0.9, 1]));
	g.add(mesh(new THREE.CylinderGeometry(8, 10, 30, 12), toon('#f0a0a8'), [0, 54, 0]));
	g.add(mesh(new THREE.CylinderGeometry(70, 70, 14, 28), toon('#5a6078'), [0, 223, 0]));
	for (const x of [-20, 20]) g.add(mesh(new THREE.CylinderGeometry(4, 4, 60, 8), toon('#c8ccd8'), [x, 250, 0]));
	return inkPx(g, 2.2);
};
/* a big coin standing up: face A / face B textures; flip with rotation.y */
export const makeCoin = (a: string, b: string) => {
	const face = (t: string, bg: string) =>
		new THREE.MeshBasicMaterial({
			map: paint(256, 256, (c) => {
				c.fillStyle = bg;
				c.beginPath();
				c.arc(128, 128, 126, 0, Math.PI * 2);
				c.fill();
				c.strokeStyle = '#8a6a1a';
				c.lineWidth = 10;
				c.beginPath();
				c.arc(128, 128, 110, 0, Math.PI * 2);
				c.stroke();
				c.fillStyle = '#3a2a0a';
				c.font = "900 34px 'Rubik', sans-serif";
				c.textAlign = 'center';
				c.translate(128, 128);
				c.rotate(-Math.PI / 2);
				t.split(' ').forEach((w, i, arr) => c.fillText(w, 0, 12 + (i - (arr.length - 1) / 2) * 40));
			}),
		});
	const g = new THREE.Group();
	const rim = toon('#c99a3a');
	const coin = mesh(new THREE.CylinderGeometry(120, 120, 18, 48), [rim, face(a, '#f2c84a'), face(b, '#e8a83a')], [0, 0, 0], [Math.PI / 2, 0, 0]);
	g.add(coin);
	return inkPx(g, 2.6);
};
/* ------------------------------ the deer (3D) ------------------------------ */
/* side-on deer facing +x, hooves on y = 0, ~420 long. setAntler(k) grows the velvet antlers
   from little buds (k = 0) to full branched antlers (k = 1); idle(f) breathes and flicks the ears/tail */
export type DeerObj = THREE.Group & {userData: {setAntler: (k: number) => void; idle: (f: number) => void}};
export const makeDeer = (): DeerObj => {
	const g = new THREE.Group() as DeerObj;
	const coat = toon('#b8743e');
	const light = toon('#e8c8a0');
	const dark = toon('#2a1a10');
	const body = new THREE.Group();
	body.position.set(0, 250, 0);
	g.add(body);
	body.add(mesh(new THREE.CapsuleGeometry(62, 190, 10, 24), coat, [0, 0, 0], [0, 0, Math.PI / 2], [1, 1, 0.8]));
	const belly = mesh(new THREE.CapsuleGeometry(46, 150, 8, 20), light, [-4, -24, 0], [0, 0, Math.PI / 2], [1, 0.7, 0.72]);
	belly.userData.noInk = true;
	body.add(belly);
	// rump + white tail
	const tail = new THREE.Group();
	tail.position.set(-150, 26, 0);
	tail.add(mesh(new THREE.ConeGeometry(18, 46, 12), toon('#fbf6ea'), [-10, 6, 0], [0, 0, 0.9]));
	body.add(tail);
	// neck + head
	const neck = new THREE.Group();
	neck.position.set(110, 30, 0);
	neck.rotation.z = -0.65;
	neck.add(mesh(new THREE.CylinderGeometry(30, 44, 170, 16), coat, [0, 80, 0]));
	const throat = mesh(new THREE.CylinderGeometry(18, 26, 120, 12), toon('#fbf6ea'), [16, 70, 0]);
	throat.userData.noInk = true;
	neck.add(throat);
	body.add(neck);
	const head = new THREE.Group();
	head.position.set(0, 175, 0);
	head.rotation.z = 0.95;
	neck.add(head);
	head.add(mesh(new THREE.SphereGeometry(40, 20, 14), coat, [0, 0, 0], undefined, [1, 0.9, 0.85]));
	head.add(mesh(new THREE.CapsuleGeometry(24, 46, 8, 14), coat, [48, -14, 0], [0, 0, Math.PI / 2 - 0.25]));
	head.add(mesh(new THREE.SphereGeometry(13, 12, 10), dark, [86, -24, 0]));
	for (const z of [-24, 24]) {
		head.add(mesh(new THREE.SphereGeometry(8, 12, 10), dark, [22, 10, z]));
		const hl = mesh(new THREE.SphereGeometry(2.5, 8, 6), toon('#ffffff'), [27, 13, z + (z > 0 ? 3 : -3)]);
		hl.userData.noInk = true;
		head.add(hl);
	}
	const ears: THREE.Mesh[] = [];
	for (const z of [-26, 26]) {
		const e = mesh(new THREE.SphereGeometry(1, 14, 10), coat, [-24, 26, z], [z > 0 ? -0.5 : 0.5, 0, 0.5], [30, 12, 9]);
		head.add(e);
		ears.push(e);
	}
	// antlers: two sides, each a beam with tines; grown by scaling every segment
	const antler = new THREE.Group();
	antler.position.set(-8, 30, 0);
	head.add(antler);
	const velvet = toon('#8a5a3a');
	const segs: {m: THREE.Object3D; len: number}[] = [];
	const branch = (parent: THREE.Object3D, len: number, r: number, rotZ: number, rotX: number, depth: number) => {
		const pivot = new THREE.Group();
		pivot.rotation.set(rotX, 0, rotZ);
		parent.add(pivot);
		const m = mesh(new THREE.CylinderGeometry(r * 0.7, r, len, 10), velvet, [0, len / 2, 0]);
		pivot.add(m);
		const tip = mesh(new THREE.SphereGeometry(r * 0.7, 10, 8), velvet, [0, len, 0]);
		tip.userData.noInk = true;
		pivot.add(tip);
		segs.push({m: pivot, len});
		if (depth > 0) {
			const end = new THREE.Group();
			end.position.y = len;
			pivot.add(end);
			branch(end, len * 0.78, r * 0.8, -0.55, 0, depth - 1);
			const mid = new THREE.Group();
			mid.position.y = len * 0.45;
			pivot.add(mid);
			branch(mid, len * 0.6, r * 0.75, 0.85, 0, 0);
		}
	};
	for (const z of [-18, 18]) {
		const side = new THREE.Group();
		side.position.z = z;
		antler.add(side);
		branch(side, 96, 11, -0.3, z > 0 ? -0.55 : 0.55, 2);
	}
	body.add(mesh(new THREE.SphereGeometry(1, 16, 12), coat, [-120, 10, 0], undefined, [70, 66, 52]));
	// legs: upper + lower with a joint, dark hooves
	const legs: THREE.Group[] = [];
	for (const [x, z, back] of [
		[110, 30, 0],
		[110, -30, 0],
		[-120, 30, 1],
		[-120, -30, 1],
	] as const) {
		const leg = new THREE.Group();
		leg.position.set(x, 210, z);
		leg.add(mesh(new THREE.CylinderGeometry(back ? 26 : 18, 12, 110, 12), coat, [back ? -6 : 0, -50, 0], [0, 0, back ? -0.15 : 0.05]));
		leg.add(mesh(new THREE.CylinderGeometry(10, 8, 100, 10), coat, [back ? 4 : 2, -150, 0], [0, 0, back ? 0.12 : 0]));
		leg.add(mesh(new THREE.CylinderGeometry(9, 11, 16, 10), dark, [back ? 8 : 2, -204, 0]));
		g.add(leg);
		legs.push(leg);
	}
	inkPx(g, 2.6);
	const setAntler = (k: number) => {
		const s = Math.max(0.12, k);
		segs.forEach(({m}) => m.scale.set(0.6 + 0.4 * s, s, 0.6 + 0.4 * s));
	};
	const idle = (f: number) => {
		body.position.y = 250 + Math.sin(f / 18) * 2.5;
		head.rotation.z = 0.95 + Math.sin(f / 40) * 0.05;
		ears.forEach((e, i) => (e.rotation.z = 0.5 + Math.max(0, Math.sin(f / 7 + i * 2) - 0.85) * 2));
		tail.rotation.z = Math.max(0, Math.sin(f / 9) - 0.6) * 1.2;
	};
	setAntler(0);
	g.userData = {setAntler, idle};
	return g;
};

/* ------------------------------ part 4 ------------------------------ */
/* a die (rounded cube with pips), centred, 40 wide */
export const makeDie = () => {
	const pips = (n: number) =>
		new THREE.MeshToonMaterial({
			map: paint(128, 128, (c) => {
				c.fillStyle = '#fbfaf4';
				c.fillRect(0, 0, 128, 128);
				c.fillStyle = n === 1 ? '#d23b3b' : '#1b1a26';
				const P: Record<number, [number, number][]> = {
					1: [[64, 64]],
					2: [[34, 34], [94, 94]],
					3: [[30, 30], [64, 64], [98, 98]],
					4: [[34, 34], [94, 34], [34, 94], [94, 94]],
					5: [[30, 30], [98, 30], [64, 64], [30, 98], [98, 98]],
					6: [[34, 28], [94, 28], [34, 64], [94, 64], [34, 100], [94, 100]],
				};
				for (const [x, y] of P[n]) {
					c.beginPath();
					c.arc(x, y, n === 1 ? 18 : 12, 0, Math.PI * 2);
					c.fill();
				}
			}),
		});
	const g = new THREE.Group();
	g.add(mesh(new THREE.BoxGeometry(40, 40, 40), [pips(1), pips(6), pips(2), pips(5), pips(3), pips(4)]));
	return inkPx(g, 2);
};
/* blood bag with a label, hanging from its top (top at y = 0) */
export const makeBloodBag = (type: string) => {
	const g = new THREE.Group();
	g.add(mesh(rbox(110, 150, 26, 18), toon('#c0303a', {transparent: true, opacity: 0.92}), [0, -90, 0]));
	g.add(mesh(rbox(124, 18, 30, 6), toon('#e8ecf2'), [0, -10, 0]));
	g.add(mesh(new THREE.CylinderGeometry(5, 5, 50, 8), toon('#e8ecf2'), [0, -190, 0]));
	const lab = mesh(new THREE.PlaneGeometry(80, 60), new THREE.MeshBasicMaterial({map: labelTex(type, '#fbfaf4', '#c0303a')}), [0, -86, 13.5]);
	lab.userData.noInk = true;
	g.add(lab);
	return inkPx(g, 2.2);
};
/* consent form on a clipboard, faces the camera; sign(k) draws the signature (0..1).
   tipAt(k) is where the pen is, in canvas px (512×680, the paper is 270×357 units) */
export type Form = THREE.Group & {userData: {sign: (k: number) => void}};
const SIG = (k: number): [number, number] => [150 + 260 * k, 560 - 26 * Math.sin(k * 14) - 10 * Math.sin(k * 31)];
export const formTipAt = (k: number) => SIG(k);
export const makeForm = (): Form => {
	const g = new THREE.Group() as Form;
	g.add(mesh(rbox(300, 400, 10, 6), toon('#8a5a3a'), [0, 0, 0]));
	g.add(mesh(rbox(110, 26, 16, 4), toon('#c8ccd8'), [0, 196, 6]));
	const cv = document.createElement('canvas');
	cv.width = 512;
	cv.height = 680;
	const tex = new THREE.CanvasTexture(cv);
	tex.colorSpace = THREE.SRGBColorSpace;
	const draw = (k: number) => {
		const c = cv.getContext('2d')!;
		c.fillStyle = '#fbfaf4';
		c.fillRect(0, 0, 512, 680);
		c.fillStyle = '#1d2a5a';
		c.font = "900 40px 'Rubik', sans-serif";
		c.textAlign = 'center';
		c.fillText('CONSENT', 256, 80);
		c.font = "700 28px 'Rubik', sans-serif";
		c.fillText('LIVING LIVER DONOR', 256, 124);
		c.fillStyle = '#c8ccd8';
		for (let i = 0; i < 9; i++) c.fillRect(50, 170 + i * 34, 412 - (i % 3) * 60, 10);
		c.fillStyle = '#2a2f4a';
		c.textAlign = 'left';
		c.font = "700 24px 'Rubik', sans-serif";
		c.fillText('Donor signature:', 50, 520);
		c.fillRect(50, 580, 412, 3);
		if (k > 0) {
			c.strokeStyle = '#1d2a8a';
			c.lineWidth = 6;
			c.lineCap = 'round';
			c.beginPath();
			const n = Math.floor(80 * k);
			for (let i = 0; i <= n; i++) {
				const [x, y] = SIG(i / 80);
				if (i === 0) c.moveTo(x, y);
				else c.lineTo(x, y);
			}
			c.stroke();
		}
		tex.needsUpdate = true;
	};
	draw(0);
	const paper = mesh(new THREE.PlaneGeometry(270, 357), new THREE.MeshBasicMaterial({map: tex}), [0, -16, 6]);
	paper.userData.noInk = true;
	g.add(paper);
	inkPx(g, 2.4);
	g.userData = {sign: draw};
	return g;
};
/* whiteboard marker along +x, tip at +x */
export const makeMarker = () => {
	const g = new THREE.Group();
	g.add(mesh(new THREE.CylinderGeometry(7, 7, 70, 12), toon('#f4f6fa'), [0, 0, 0], [0, 0, Math.PI / 2]));
	g.add(mesh(new THREE.CylinderGeometry(7.5, 7.5, 18, 12), toon('#2a4a9a'), [-30, 0, 0], [0, 0, Math.PI / 2]));
	g.add(mesh(new THREE.ConeGeometry(5, 10, 10), toon('#1d2a5a'), [40, 0, 0], [0, 0, -Math.PI / 2]));
	return inkPx(g, 1.8);
};
/* a cafeteria tray (top on y = 0) */
export const makeTray2 = () => inkPx(mesh(rbox(220, 8, 150, 4), toon('#e4762a'), [0, -4, 0]), 2.2);

/* ------------------------------ part 5 ------------------------------ */
/* African clawed frog, side-on facing +x, belly on y = 0. setLeg(k): the right hind leg regrows (0..1) */
export type Frog = THREE.Group & {userData: {setLeg: (k: number) => void; idle: (f: number) => void}};
export const makeFrog = (): Frog => {
	const g = new THREE.Group() as Frog;
	const skin = toon('#7a9a4a');
	const belly = toon('#d8d0a0');
	const body = new THREE.Group();
	body.position.y = 34;
	g.add(body);
	body.add(mesh(new THREE.SphereGeometry(60, 24, 18), skin, [0, 0, 0], undefined, [1.3, 0.62, 0.95]));
	const bl = mesh(new THREE.SphereGeometry(56, 20, 14), belly, [4, -10, 0], undefined, [1.2, 0.45, 0.88]);
	bl.userData.noInk = true;
	body.add(bl);
	// spots
	for (const [x, z] of [[-30, 30], [10, 40], [30, -30], [-10, -42], [-40, -10]]) {
		const sp = mesh(new THREE.SphereGeometry(9, 10, 8), toon('#4a6a2a'), [x, 26, z], undefined, [1, 0.3, 1]);
		sp.userData.noInk = true;
		body.add(sp);
	}
	// head + eyes on top (Xenopus: small eyes on top of a flat head)
	body.add(mesh(new THREE.SphereGeometry(40, 20, 14), skin, [64, 4, 0], undefined, [1.1, 0.6, 1]));
	for (const z of [-20, 20]) {
		body.add(mesh(new THREE.SphereGeometry(10, 12, 10), toon('#e8e0b0'), [80, 26, z]));
		body.add(mesh(new THREE.SphereGeometry(6, 10, 8), toon('#1b1420'), [86, 28, z]));
	}
	const smile = mesh(new THREE.TorusGeometry(26, 1.8, 6, 16, Math.PI * 0.6), toon('#3a4a1a'), [80, -6, 0], [0, 0, Math.PI * 1.15]);
	smile.userData.noInk = true;
	body.add(smile);
	// front legs
	for (const z of [-34, 34]) body.add(mesh(new THREE.CapsuleGeometry(7, 26, 4, 8), skin, [48, -24, z], [z > 0 ? 0.4 : -0.4, 0, 0.3]));
	// hind legs: thigh + shin + big webbed foot
	const hind = (z: number) => {
		const leg = new THREE.Group();
		leg.position.set(-60, -6, z);
		leg.add(mesh(new THREE.CapsuleGeometry(14, 44, 6, 10), skin, [10, -10, 0], [0, 0, 1.2]));
		leg.add(mesh(new THREE.CapsuleGeometry(10, 46, 6, 10), skin, [-24, -18, z > 0 ? 6 : -6], [0, 0, -1.3]));
		const foot = new THREE.Shape();
		foot.moveTo(0, 0);
		foot.lineTo(-40, 14);
		foot.lineTo(-50, 0);
		foot.lineTo(-40, -14);
		foot.lineTo(0, 0);
		leg.add(mesh(new THREE.ExtrudeGeometry(foot, {depth: 4, bevelEnabled: false}), toon('#6a8a3a'), [-50, -24, 0], [-Math.PI / 2, 0, 0]));
		return leg;
	};
	const legL = hind(-30);
	const legR = hind(30);
	body.add(legL, legR);
	inkPx(g, 2.4);
	g.userData = {
		setLeg: (k: number) => {
			const s = Math.max(0.05, k);
			legR.scale.set(s, s, s);
			legR.visible = k > 0.02;
		},
		idle: (f: number) => {
			body.position.y = 34 + Math.sin(f / 16) * 2;
		},
	};
	return g;
};
/* the BioDome: a small clear silicone cap, bottom open, sits on y = 0 */
export const makeDome = () => {
	const g = new THREE.Group();
	const dome = new THREE.SphereGeometry(30, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2);
	g.add(mesh(dome, toon('#bfe8f8', {transparent: true, opacity: 0.55, depthWrite: false}), [0, 0, 0], undefined, [1, 1.3, 1]));
	const liq = mesh(new THREE.SphereGeometry(26, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon('#ffd08a', {transparent: true, opacity: 0.45, depthWrite: false}), [0, 0, 0], undefined, [1, 0.8, 1]);
	liq.userData.noInk = true;
	g.add(liq);
	return inkPx(g, 2);
};
/* a big wall switch, OFF (k = 0) / ON (k = 1) */
export type Switch = THREE.Group & {userData: {set: (k: number) => void}};
export const makeSwitch = (): Switch => {
	const g = new THREE.Group() as Switch;
	g.add(mesh(rbox(200, 300, 20, 18), toon('#f4f6fa'), [0, 0, 0]));
	g.add(mesh(rbox(90, 170, 16, 10), toon('#c8ccd8'), [0, 0, 12]));
	const lever = new THREE.Group();
	lever.position.z = 20;
	lever.add(mesh(rbox(60, 110, 40, 12), toon('#d23b3b'), [0, 0, 20]));
	g.add(lever);
	inkPx(g, 2.6);
	g.userData = {set: (k: number) => (lever.rotation.x = 0.45 - 0.9 * k)};
	g.userData.set(0);
	return g;
};

/* ------------------------------ Marshall short ------------------------------ */
/* lab beaker with murky broth, bottom on y = 0; level(k) empties it (1 full → 0 empty) */
export type Beaker = THREE.Group & {userData: {level: (k: number) => void}};
export const makeBeaker = (): Beaker => {
	const g = new THREE.Group() as Beaker;
	g.add(mesh(new THREE.CylinderGeometry(30, 28, 90, 24, 1, true), toon('#dff0fa', {transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false}), [0, 45, 0]));
	g.add(mesh(new THREE.CylinderGeometry(28, 28, 3, 24), toon('#dff0fa', {transparent: true, opacity: 0.5}), [0, 1.5, 0]));
	const liq = mesh(new THREE.CylinderGeometry(26, 26, 1, 24), toon('#a8925a'), [0, 0, 0]);
	liq.userData.noInk = true;
	g.add(liq);
	// lip and measuring marks
	g.add(mesh(new THREE.TorusGeometry(30, 2, 6, 24), toon('#dff0fa'), [0, 90, 0], [Math.PI / 2, 0, 0]));
	for (let i = 1; i < 4; i++) {
		const m = mesh(new THREE.BoxGeometry(12, 1.6, 1), toon('#5a6078'), [-14, 20 * i, 28]);
		m.userData.noInk = true;
		g.add(m);
	}
	inkPx(g, 2);
	const level = (k: number) => {
		const h = Math.max(0.5, 70 * k);
		liq.scale.y = h;
		liq.position.y = 3 + h / 2;
		liq.visible = k > 0.01;
	};
	level(1);
	g.userData = {level};
	return g;
};
/* pill bottle (orange, white cap), bottom on y = 0 */
export const makePillBottle = () => {
	const g = new THREE.Group();
	g.add(mesh(new THREE.CylinderGeometry(20, 20, 56, 20), toon('#f08a2a', {transparent: true, opacity: 0.9}), [0, 28, 0]));
	g.add(mesh(new THREE.CylinderGeometry(22, 22, 14, 20), toon('#fbfaf4'), [0, 63, 0]));
	const lab = mesh(new THREE.CylinderGeometry(20.6, 20.6, 26, 20, 1, true, -0.9, 1.8), new THREE.MeshBasicMaterial({map: labelTex('Rx', '#fbfaf2')}), [0, 26, 0]);
	lab.userData.noInk = true;
	g.add(lab);
	return inkPx(g, 2);
};
/* a capsule pill, centred, along x */
export const makePill = () => {
	const g = new THREE.Group();
	g.add(mesh(new THREE.CapsuleGeometry(6, 12, 6, 10), toon('#d23b3b'), [-5, 0, 0], [0, 0, Math.PI / 2]));
	g.add(mesh(new THREE.CapsuleGeometry(6.05, 6, 6, 10), toon('#fbfaf4'), [6, 0, 0], [0, 0, Math.PI / 2]));
	return inkPx(g, 1.6);
};
/* red chili pepper, centred, along x */
export const makeChili = () => {
	const g = new THREE.Group();
	const pts: THREE.Vector3[] = [];
	for (let i = 0; i <= 10; i++) pts.push(new THREE.Vector3(i * 9 - 45, Math.sin((i / 10) * Math.PI) * 10 - (i / 10) * 8, 0));
	g.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 9, 10, false), toon('#d8302a')));
	g.add(mesh(new THREE.ConeGeometry(9, 12, 10), toon('#d8302a'), [48, -10, 0], [0, 0, -Math.PI / 2 - 0.4]));
	g.add(mesh(new THREE.CylinderGeometry(4, 6, 16, 8), toon('#4a9a3a'), [-52, 2, 0], [0, 0, Math.PI / 2 + 0.3]));
	return inkPx(g, 2);
};
/* gold medal on a ribbon, faces the camera, centred on the disc */
export const makeMedal = () => {
	const g = new THREE.Group();
	g.add(mesh(new THREE.CylinderGeometry(40, 40, 8, 32), toon('#e8b830'), [0, 0, 0], [Math.PI / 2, 0, 0]));
	g.add(mesh(new THREE.CylinderGeometry(30, 30, 9, 32), toon('#f6d060'), [0, 0, 0.5], [Math.PI / 2, 0, 0]));
	for (const s of [-1, 1]) g.add(mesh(new THREE.BoxGeometry(22, 90, 3), toon('#3d6fd6'), [s * 14, 70, -4], [0, 0, s * 0.25]));
	return inkPx(g, 2);
};

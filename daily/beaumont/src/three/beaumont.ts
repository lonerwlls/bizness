import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {flat, inkPx, mesh, paint, toon} from './toon';

/* 3D props of the daily short "The man with a window in his stomach" (1822):
   musket, food on silk strings, a jar of stomach juice, a birch-bark canoe, a shovel,
   a gravestone, a doctor's bag, a magnifier. Units = world px, y up. Same toon look. */
const rbox = (w: number, h: number, d: number, r = 4) => new RoundedBoxGeometry(w, h, d, 3, r);

/* flintlock musket along +x: grip (trigger) on the origin, muzzle at +MUSKET_TIP */
export const MUSKET_TIP = 230;
export const makeMusket = () => {
	const g = new THREE.Group();
	// stock: butt to the left, fore-stock under the barrel
	const sh = new THREE.Shape();
	sh.moveTo(-120, -22);
	sh.lineTo(-30, -6);
	sh.lineTo(150, -2);
	sh.lineTo(150, 8);
	sh.lineTo(-20, 8);
	sh.lineTo(-118, 12);
	sh.lineTo(-124, -4);
	sh.closePath();
	g.add(mesh(new THREE.ExtrudeGeometry(sh, {depth: 12, bevelEnabled: true, bevelSize: 2, bevelThickness: 2, bevelSegments: 2}), toon('#8a4e26'), [0, 0, -6]));
	// barrel
	g.add(mesh(new THREE.CylinderGeometry(4.5, 5, 250, 12), toon('#4a4c58'), [105, 12, 0], [0, 0, Math.PI / 2]));
	// lock plate + hammer, trigger guard, bands
	g.add(mesh(rbox(30, 12, 14, 3), toon('#7a7c88'), [-14, 6, 0]));
	g.add(mesh(new THREE.BoxGeometry(5, 14, 4), toon('#5a5c68'), [-24, 16, 0], [0, 0, 0.5]));
	g.add(mesh(new THREE.TorusGeometry(7, 1.6, 6, 14, Math.PI), toon('#c9a04a'), [-6, -8, 0], [0, 0, Math.PI]));
	for (const x of [60, 130]) g.add(mesh(new THREE.CylinderGeometry(7, 7, 5, 12), toon('#c9a04a'), [x, 8, 0], [0, 0, Math.PI / 2]));
	return inkPx(g, 2.2);
};

/* a chunk of raw meat tied to a silk string (the knot on top at the origin, meat below).
   digest(k): 0 fresh → 1 mostly dissolved (smaller, greyer, frayed) */
export type Bait = THREE.Group & {userData: {digest: (k: number) => void}};
export const makeMeat = (): Bait => {
	const g = new THREE.Group() as Bait;
	const body = new THREE.Group();
	const red = toon('#d24a52');
	const m = mesh(new THREE.SphereGeometry(20, 18, 14), red, [0, -26, 0], undefined, [1.15, 0.85, 0.8]);
	body.add(m);
	const fat = mesh(new THREE.TorusGeometry(15, 3.2, 6, 18, Math.PI * 1.3), toon('#fbe8e0'), [0, -24, 10], [0, 0, 0.6]);
	fat.userData.noInk = true;
	body.add(fat);
	g.add(body);
	g.add(mesh(new THREE.TorusGeometry(5, 1.5, 6, 12), toon('#f4f1e6'), [0, -6, 0], [Math.PI / 2, 0, 0]));
	inkPx(g, 2);
	g.userData = {
		digest: (k: number) => {
			const s = 1 - 0.55 * k;
			body.scale.set(s, s * (1 - 0.1 * k), s);
			body.position.y = (1 - s) * 18;
			red.color.set('#d24a52').lerp(new THREE.Color('#b89a8a'), k);
			fat.visible = k < 0.6;
		},
	};
	return g;
};
/* a slice of bread on a string, knot at the origin */
export const makeBread = () => {
	const g = new THREE.Group();
	g.add(mesh(rbox(46, 50, 10, 8), toon('#a8642a'), [0, -32, 0]));
	const crumb = mesh(rbox(38, 42, 11, 6), toon('#f2d9a0'), [0, -33, 0]);
	g.add(crumb);
	g.add(mesh(new THREE.TorusGeometry(5, 1.5, 6, 12), toon('#f4f1e6'), [0, -5, 0], [Math.PI / 2, 0, 0]));
	return inkPx(g, 2);
};
/* a cabbage leaf on a string, knot at the origin */
export const makeLeaf = () => {
	const g = new THREE.Group();
	const sh = new THREE.Shape();
	sh.moveTo(0, 0);
	sh.bezierCurveTo(30, -8, 34, -46, 0, -66);
	sh.bezierCurveTo(-34, -46, -30, -8, 0, 0);
	g.add(mesh(new THREE.ExtrudeGeometry(sh, {depth: 4, bevelEnabled: true, bevelSize: 2, bevelThickness: 2, bevelSegments: 2}), toon('#8ccf6a'), [0, -6, -2]));
	const vein = mesh(new THREE.BoxGeometry(3, 54, 2), toon('#e4f6c8'), [0, -38, 5]);
	vein.userData.noInk = true;
	g.add(vein);
	g.add(mesh(new THREE.TorusGeometry(5, 1.5, 6, 12), toon('#f4f1e6'), [0, -5, 0], [Math.PI / 2, 0, 0]));
	return inkPx(g, 2);
};

/* glass jar of yellowish stomach juice with a piece of meat in it, bottom on y = 0.
   digest(k) shrinks the meat and clouds the juice */
export type Jar = THREE.Group & {userData: {digest: (k: number) => void}};
export const makeJar = (): Jar => {
	const g = new THREE.Group() as Jar;
	const glass = toon('#e6f4fa', {transparent: true, opacity: 0.4, side: THREE.DoubleSide, depthWrite: false});
	const juiceM = toon('#e8d27a', {transparent: true, opacity: 0.55, depthWrite: false});
	const juice = mesh(new THREE.CylinderGeometry(40, 40, 92, 28), juiceM, [0, 50, 0]);
	juice.userData.noInk = true;
	const meatM = toon('#d24a52');
	const meat = mesh(new THREE.SphereGeometry(22, 16, 12), meatM, [0, 30, 0], undefined, [1.2, 0.8, 0.9]);
	g.add(meat, juice);
	g.add(mesh(new THREE.CylinderGeometry(44, 44, 110, 28, 1, true), glass, [0, 55, 0]));
	g.add(mesh(new THREE.CylinderGeometry(44, 44, 4, 28), glass, [0, 2, 0]));
	g.add(mesh(new THREE.TorusGeometry(44, 3, 8, 28), toon('#e6f4fa'), [0, 110, 0], [Math.PI / 2, 0, 0]));
	// a few acid bubbles
	const bubbles: THREE.Mesh[] = [];
	for (let i = 0; i < 5; i++) {
		const b = mesh(new THREE.SphereGeometry(3, 8, 6), flat('#fffbe0', {transparent: true, opacity: 0.8}), [-20 + i * 10, 40, 20]);
		b.userData.noInk = true;
		bubbles.push(b);
		g.add(b);
	}
	inkPx(g, 2.2);
	g.userData = {
		digest: (k: number) => {
			const s = 1 - 0.7 * k;
			meat.scale.set(1.2 * s, 0.8 * s, 0.9 * s);
			meat.position.y = 8 + 22 * 0.8 * s;
			meatM.color.set('#d24a52').lerp(new THREE.Color('#c0a090'), k);
			juiceM.color.set('#e8d27a').lerp(new THREE.Color('#d8b890'), k);
			bubbles.forEach((b, i) => {
				const ph = (k * 6 + i * 0.37) % 1;
				b.position.set(-22 + i * 11, 30 + ph * 60, 24);
				b.visible = k > 0.02 && k < 0.98;
			});
		},
	};
	g.userData.digest(0);
	return g;
};

/* birch-bark canoe along x, keel on y = 0 (its rim at about y = 34), length ~360 */
export const makeCanoe = () => {
	const g = new THREE.Group();
	const hull = new THREE.SphereGeometry(1, 32, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
	g.add(mesh(hull, toon('#e8dcc0', {side: THREE.DoubleSide}), [0, 36, 0], undefined, [180, 36, 34]));
	// dark bark seams and a rim (gunwale)
	for (const x of [-110, -40, 40, 110]) {
		const s = mesh(new THREE.BoxGeometry(5, 30, 2), toon('#5a3a22'), [x, 18, 30 - Math.abs(x) * 0.08]);
		s.userData.noInk = true;
		g.add(s);
	}
	g.add(mesh(new THREE.TorusGeometry(1, 0.05, 6, 40), toon('#8a5a2a'), [0, 36, 0], [Math.PI / 2, 0, 0], [180, 34, 34]));
	// upturned ends
	for (const s of [-1, 1]) g.add(mesh(new THREE.ConeGeometry(14, 40, 10), toon('#e8dcc0'), [s * 172, 46, 0], [0, 0, -s * 0.5]));
	return inkPx(g, 2.4);
};
/* canoe paddle along -y from the grip (origin), blade at the bottom (~ -150) */
export const makePaddle = () => {
	const g = new THREE.Group();
	g.add(mesh(new THREE.CylinderGeometry(3.5, 3.5, 120, 10), toon('#a8743a'), [0, -60, 0]));
	g.add(mesh(new THREE.SphereGeometry(16, 14, 10), toon('#a8743a'), [0, -135, 0], undefined, [0.9, 2, 0.25]));
	return inkPx(g, 2);
};

/* shovel along -y from the top grip (origin), blade at the bottom (~ -170) */
export const makeShovel = () => {
	const g = new THREE.Group();
	g.add(mesh(new THREE.CylinderGeometry(3.5, 3.5, 130, 10), toon('#a8743a'), [0, -70, 0]));
	g.add(mesh(new THREE.BoxGeometry(26, 6, 6), toon('#a8743a'), [0, -2, 0]));
	const sh = new THREE.Shape();
	sh.moveTo(-22, 0);
	sh.lineTo(22, 0);
	sh.lineTo(20, -36);
	sh.quadraticCurveTo(0, -56, -20, -36);
	sh.closePath();
	g.add(mesh(new THREE.ExtrudeGeometry(sh, {depth: 3, bevelEnabled: false}), toon('#7a7c88'), [0, -132, -1.5]));
	return inkPx(g, 2);
};

/* gravestone with carved text, bottom on y = 0, face toward the camera */
export const makeGravestone = (l1: string, l2: string) => {
	const g = new THREE.Group();
	const sh = new THREE.Shape();
	sh.moveTo(-70, 0);
	sh.lineTo(70, 0);
	sh.lineTo(70, 130);
	sh.absarc(0, 130, 70, 0, Math.PI, false);
	sh.closePath();
	g.add(mesh(new THREE.ExtrudeGeometry(sh, {depth: 26, bevelEnabled: true, bevelSize: 3, bevelThickness: 3, bevelSegments: 2}), toon('#9aa0ac'), [0, 0, -13]));
	const tex = paint(512, 384, (c) => {
		c.clearRect(0, 0, 512, 384);
		c.fillStyle = '#3a3e4a';
		c.textAlign = 'center';
		c.font = '900 64px Rubik, sans-serif';
		c.fillText('✝', 256, 92);
		c.font = '900 58px Rubik, sans-serif';
		c.fillText(l1, 256, 200);
		c.font = '900 64px Rubik, sans-serif';
		c.fillText(l2, 256, 300);
	});
	const face = mesh(new THREE.PlaneGeometry(132, 99), new THREE.MeshBasicMaterial({map: tex, transparent: true}), [0, 110, 16.5]);
	face.userData.noInk = true;
	g.add(face);
	return inkPx(g, 2.4);
};

/* black doctor's bag, bottom on y = 0, handle on top */
export const makeDocBag = () => {
	const g = new THREE.Group();
	g.add(mesh(rbox(90, 56, 44, 14), toon('#2a2630'), [0, 28, 0]));
	g.add(mesh(new THREE.BoxGeometry(94, 6, 46), toon('#c9a04a'), [0, 52, 0]));
	g.add(mesh(new THREE.TorusGeometry(16, 3.5, 8, 16, Math.PI), toon('#2a2630'), [0, 58, 0]));
	return inkPx(g, 2.2);
};

/* magnifying glass: handle grip on the origin going down-left, lens centre at LENS */
export const LENS: [number, number] = [0, 70];
export const makeMagnifier = () => {
	const g = new THREE.Group();
	g.add(mesh(new THREE.CylinderGeometry(5, 6, 60, 12), toon('#5a3a22'), [0, 0, 0]));
	g.add(mesh(new THREE.TorusGeometry(32, 4.5, 10, 32), toon('#c9a04a'), [0, 66, 0]));
	const lens = mesh(new THREE.CircleGeometry(30, 32), toon('#cfeeff', {transparent: true, opacity: 0.35, depthWrite: false}), [0, 66, 0]);
	lens.userData.noInk = true;
	g.add(lens);
	return inkPx(g, 2);
};

/* plain pine coffin lying along x, bottom on y = 0 */
export const makeCoffin = () => {
	const g = new THREE.Group();
	const sh = new THREE.Shape();
	sh.moveTo(-110, -22);
	sh.lineTo(70, -30);
	sh.lineTo(110, -18);
	sh.lineTo(110, 18);
	sh.lineTo(70, 30);
	sh.lineTo(-110, 22);
	sh.closePath();
	g.add(mesh(new THREE.ExtrudeGeometry(sh, {depth: 40, bevelEnabled: true, bevelSize: 3, bevelThickness: 3, bevelSegments: 2}), toon('#a8743a'), [0, 0, 30], [Math.PI / 2, 0, 0]));
	g.add(mesh(new THREE.BoxGeometry(200, 3, 2), toon('#7a4e2a'), [0, 24, 33]));
	return inkPx(g, 2.2);
};

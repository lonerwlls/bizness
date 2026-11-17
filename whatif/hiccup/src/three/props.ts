import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {flat, inkPx, mesh, noInk, paint, toon} from './toon';

/* 3D props for the 2D scenes (units = world px, y up). Two-tone shading + dark outline. */
const rbox = (w: number, h: number, d: number, r = 4) => new RoundedBoxGeometry(w, h, d, 3, r);

/* sandwich centred on its middle */
export const makeSandwich = () => {
	const g = new THREE.Group();
	g.add(mesh(rbox(92, 16, 62, 6), toon('#e8b46a'), [0, -16, 0]));
	g.add(mesh(new THREE.BoxGeometry(98, 4, 66), toon('#f2c84a'), [2, -6, 2], [0, 0.2, 0]));
	g.add(mesh(rbox(102, 6, 70, 3), toon('#5ab04a'), [0, -1, 0], [0, -0.15, 0.04]));
	for (const x of [-22, 22]) g.add(mesh(new THREE.CylinderGeometry(17, 17, 7, 20), toon('#d84a3a'), [x, 5, 6]));
	g.add(mesh(rbox(92, 16, 62, 6), toon('#e8b46a'), [0, 15, 0]));
	const dome = new THREE.SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2);
	g.add(mesh(dome, toon('#e0a456'), [0, 22, 0], undefined, [44, 12, 29]));
	return inkPx(g, 2.6);
};

/* blender standing on y = 0 */
export type BlenderObj = THREE.Group & {userData: {contents: THREE.Mesh; mat: THREE.MeshToonMaterial; smoke: THREE.Group}};
export const makeBlender = (broken = false): BlenderObj => {
	const g = new THREE.Group() as BlenderObj;
	g.add(mesh(rbox(112, 66, 92, 10), toon(broken ? '#6a6a78' : '#d23b3b'), [0, 33, 0]));
	g.add(mesh(new THREE.CylinderGeometry(9, 9, 8, 16), toon('#2a2a34'), [0, 34, 47], [Math.PI / 2, 0, 0]));
	for (const x of [-30, 30]) g.add(mesh(new THREE.CylinderGeometry(5, 5, 6, 12), toon('#f2f2f2'), [x, 26, 46], [Math.PI / 2, 0, 0]));
	const jar = mesh(new THREE.CylinderGeometry(46, 34, 168, 32), toon('#e4f4fb', {transparent: true, opacity: 0.45, depthWrite: false}), [0, 66 + 84, 0]);
	g.add(jar);
	const mat = toon('#f2c84a');
	const contents = mesh(new THREE.CylinderGeometry(40, 31, 80, 28), mat, [0, 66 + 40, 0]);
	contents.userData.noInk = true;
	g.add(contents);
	g.add(mesh(new THREE.CylinderGeometry(49, 49, 14, 28), toon('#2a2a34'), [0, 66 + 168 + 7, 0]));
	g.add(mesh(new THREE.BoxGeometry(14, 90, 18), toon('#2a2a34'), [56, 66 + 90, 0]));
	const smoke = new THREE.Group();
	for (let i = 0; i < 4; i++) {
		const s = mesh(new THREE.SphereGeometry(1, 14, 10), toon('#8a8a98', {transparent: true, opacity: 0.6}), [0, 0, 0]);
		s.userData.noInk = true;
		smoke.add(s);
	}
	smoke.visible = broken;
	g.add(smoke);
	if (broken) {
		jar.rotation.z = 0.18;
		jar.position.x = 10;
		contents.visible = false;
	}
	inkPx(g, 2.6);
	g.userData = {contents, mat, smoke};
	return g;
};
export const spinBlender = (b: BlenderObj, f: number, on: number, color?: string) => {
	if (color) b.userData.mat.color.set(color);
	const c = b.userData.contents;
	c.rotation.y = f * 0.8 * on;
	c.scale.set(1 + 0.04 * on * Math.sin(f * 2.3), 1 + 0.12 * on * Math.abs(Math.sin(f * 1.7)), 1 + 0.04 * on * Math.cos(f * 2.1));
	b.position.x += on * Math.sin(f * 3) * 1.2;
	b.userData.smoke.children.forEach((s, i) => {
		const t = ((f * 1.5 + i * 18) % 72) / 72;
		s.position.set(-8 + i * 6 + Math.sin(f / 9 + i) * 8, 250 + t * 110, 0);
		s.scale.setScalar(10 + t * 22);
		((s as THREE.Mesh).material as THREE.MeshToonMaterial).opacity = 0.6 * (1 - t);
	});
};

/* scalpel lying along x, centred */
export const makeScalpel = () => {
	const g = new THREE.Group();
	g.add(mesh(new THREE.BoxGeometry(50, 8, 6), toon('#9aa0ae'), [-10, 0, 0]));
	const sh = new THREE.Shape();
	sh.moveTo(0, -4);
	sh.lineTo(30, -4);
	sh.quadraticCurveTo(26, 6, 0, 4);
	sh.lineTo(0, -4);
	g.add(mesh(new THREE.ExtrudeGeometry(sh, {depth: 2, bevelEnabled: false}), toon('#eef2f8'), [15, 0, -1]));
	return inkPx(g, 2);
};
export const makeTray = () => {
	const g = new THREE.Group();
	g.add(mesh(rbox(160, 8, 80, 3), toon('#b8c0cc'), [0, 0, 0]));
	g.add(mesh(new THREE.CylinderGeometry(4, 4, 150, 10), toon('#8a9aa8'), [0, -79, 0]));
	g.add(mesh(new THREE.CylinderGeometry(40, 46, 8, 20), toon('#6a7a88'), [0, -154, 0]));
	return inkPx(g, 2.4);
};

/* wall calendar (centre of the board), month header + day page; pages can be torn off */
const pageTex = (day: number, month: string) =>
	paint(256, 256, (c) => {
		c.fillStyle = '#fbfaf4';
		c.fillRect(0, 0, 256, 256);
		c.fillStyle = '#2a2f4a';
		c.font = '900 150px Rubik, sans-serif';
		c.textAlign = 'center';
		c.fillText(String(day), 128, 190);
		c.strokeStyle = '#d8dce6';
		c.lineWidth = 4;
		c.strokeRect(6, 6, 244, 244);
		void month;
	});
const headTex = (month: string) =>
	paint(256, 72, (c) => {
		c.fillStyle = '#d23b3b';
		c.fillRect(0, 0, 256, 72);
		c.fillStyle = '#fff';
		c.font = '900 44px Rubik, sans-serif';
		c.textAlign = 'center';
		c.fillText(month, 128, 52);
	});
export const makeCalendar = (month: string, day: number) => {
	const g = new THREE.Group();
	g.add(mesh(new THREE.CylinderGeometry(4, 4, 14, 10), toon('#6a6a78'), [0, 112, 6], [Math.PI / 2, 0, 0]));
	g.add(mesh(rbox(150, 200, 6, 2), toon('#e8e4d8'), [0, 0, 0]));
	const head = mesh(new THREE.BoxGeometry(150, 44, 8), [toon('#d23b3b'), toon('#d23b3b'), toon('#d23b3b'), toon('#d23b3b'), new THREE.MeshBasicMaterial({map: headTex(month)}), toon('#d23b3b')], [0, 76, 2]);
	g.add(head);
	const page = mesh(new THREE.PlaneGeometry(140, 140), new THREE.MeshBasicMaterial({map: pageTex(day, month)}), [0, -20, 4]);
	page.userData.noInk = true;
	g.add(page);
	inkPx(g, 2.6);
	return g;
};
/* a torn calendar page (texture with a day number) */
export const makePage = (day: number) => {
	const p = mesh(new THREE.PlaneGeometry(140, 140), new THREE.MeshToonMaterial({map: pageTex(day, ''), side: THREE.DoubleSide}));
	return inkPx(p, 2);
};

/* clipboard with a patient chart; redraw(write, stamp) updates the paper */
export type Clip = THREE.Group & {userData: {redraw: (write: number, stamp: number) => void}};
export const makeClipboard = (name: string, dx: string, stampText?: string): Clip => {
	const g = new THREE.Group() as Clip;
	g.add(mesh(rbox(300, 400, 10, 6), toon('#8a5a3a'), [0, 0, 0]));
	const cv = document.createElement('canvas');
	cv.width = 540;
	cv.height = 700;
	const ctx = cv.getContext('2d')!;
	const tex = new THREE.CanvasTexture(cv);
	tex.colorSpace = THREE.SRGBColorSpace;
	const paper = mesh(new THREE.PlaneGeometry(270, 350), new THREE.MeshBasicMaterial({map: tex}), [0, -16, 6]);
	paper.userData.noInk = true;
	g.add(paper);
	g.add(mesh(rbox(110, 34, 16, 4), toon('#9aa0ae'), [0, 196, 8]));
	let last = '';
	const redraw = (write: number, stamp: number) => {
		const key = write.toFixed(2) + stamp.toFixed(2);
		if (key === last) return;
		last = key;
		const c = ctx;
		c.fillStyle = '#fbfaf4';
		c.fillRect(0, 0, 540, 700);
		c.fillStyle = '#2a2f4a';
		c.font = '900 36px Rubik, sans-serif';
		c.fillText('PATIENT:', 36, 80);
		c.fillText('DIAGNOSIS:', 36, 180);
		c.font = '700 46px Caveat, cursive';
		c.fillStyle = '#1d3a8a';
		c.fillText(name, 230, 82);
		c.save();
		c.beginPath();
		c.rect(30, 200, 480 * write, 80);
		c.clip();
		c.fillStyle = '#d23b3b';
		c.font = '700 54px Caveat, cursive';
		c.fillText(dx, 40, 258);
		c.restore();
		c.strokeStyle = '#c8ccd8';
		c.lineWidth = 3;
		for (const y of [330, 390, 450, 510, 570, 630]) {
			c.beginPath();
			c.moveTo(36, y);
			c.lineTo(504, y);
			c.stroke();
		}
		if (stamp > 0 && stampText) {
			c.save();
			c.globalAlpha = stamp;
			c.translate(270, 470);
			c.rotate(-0.22);
			const k = 1.5 - 0.5 * stamp;
			c.scale(k, k);
			c.strokeStyle = '#d23b3b';
			c.lineWidth = 9;
			c.strokeRect(-200, -52, 400, 104);
			c.fillStyle = '#d23b3b';
			c.font = '900 60px Rubik, sans-serif';
			c.textAlign = 'center';
			c.fillText(stampText, 0, 22);
			c.restore();
		}
		tex.needsUpdate = true;
	};
	redraw(0, 0);
	inkPx(g, 2.6);
	g.userData = {redraw};
	return g;
};

/* candle on y = 0 with a flickering flame */
export const makeCandle = () => {
	const g = new THREE.Group();
	g.add(mesh(new THREE.CylinderGeometry(10, 11, 56, 18), toon('#f4f1e6'), [0, 28, 0]));
	g.add(mesh(new THREE.CylinderGeometry(16, 16, 5, 18), toon('#c9a04a'), [0, 2, 0]));
	inkPx(g, 2.2);
	const flame = mesh(new THREE.SphereGeometry(1, 14, 10), flat('#ffb33a'), [0, 70, 0], undefined, [6, 13, 6]);
	flame.userData.noInk = true;
	const glow = mesh(new THREE.SphereGeometry(1, 14, 10), flat('#ffe08a', {transparent: true, opacity: 0.35}), [0, 70, -4], undefined, [22, 26, 4]);
	glow.userData.noInk = true;
	g.add(glow, flame);
	g.userData.flame = flame;
	return g;
};
export const flicker = (c: THREE.Group, f: number) => {
	const fl = c.userData.flame as THREE.Mesh;
	fl.scale.set(6 + Math.sin(f / 2.3) * 0.8, 13 + Math.sin(f / 1.7) * 2, 6);
	fl.position.x = Math.sin(f / 3.1) * 1.2;
};
/* wine glass on y = 0 */
export const makeGlass = () => {
	const pts = [
		[0, 0],
		[24, 0],
		[24, 3],
		[4, 8],
		[4, 44],
		[18, 54],
		[25, 74],
		[23, 94],
	].map(([x, y]) => new THREE.Vector2(x, y));
	const g = new THREE.Group();
	g.add(mesh(new THREE.LatheGeometry(pts, 24), toon('#eaf4fa', {transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false})));
	const wine = mesh(new THREE.CylinderGeometry(22, 14, 22, 20), toon('#7a1f2b'), [0, 64, 0]);
	g.add(wine);
	return inkPx(g, 2);
};
/* metronome on y = 0; tick(f) swings the arm */
export const makeMetronome = () => {
	const g = new THREE.Group();
	const body = mesh(new THREE.CylinderGeometry(22, 66, 180, 4), toon('#8a5a3a'), [0, 90, 0], [0, Math.PI / 4, 0]);
	g.add(body);
	g.add(mesh(new THREE.BoxGeometry(70, 24, 60), toon('#5a3a1e'), [0, 12, 0]));
	const arm = new THREE.Group();
	arm.position.set(0, 30, 34);
	arm.add(mesh(new THREE.BoxGeometry(6, 170, 4), toon('#f4e6c0'), [0, 85, 0]));
	arm.add(mesh(new THREE.BoxGeometry(22, 18, 8), toon('#ffd34a'), [0, 120, 0]));
	g.add(arm);
	inkPx(g, 2.4);
	g.userData.arm = arm;
	return g;
};
export const tick = (m: THREE.Group, f: number) => {
	(m.userData.arm as THREE.Group).rotation.z = Math.sin(f / 7) * 0.5;
};
export {noInk};

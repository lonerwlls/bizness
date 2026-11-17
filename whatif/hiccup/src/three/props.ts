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

/* ======================= part C props ======================= */
export const makeDumbbell = (c = '#2a2a34') => {
	const g = new THREE.Group();
	const bar = new THREE.CylinderGeometry(5, 5, 90, 12);
	bar.rotateZ(Math.PI / 2);
	g.add(mesh(bar, toon('#9aa0ae')));
	for (const x of [-38, 38]) {
		const p = new THREE.CylinderGeometry(22, 22, 18, 20);
		p.rotateZ(Math.PI / 2);
		g.add(mesh(p, toon(c), [x, 0, 0]));
	}
	return inkPx(g, 2.2);
};
/* green gas cylinder standing on y = 0 with a hose to a mask (mask at local (mx,my)) */
export const makeGasTank = () => {
	const g = new THREE.Group();
	g.add(mesh(new THREE.CylinderGeometry(34, 34, 240, 24), toon('#3a8a5a'), [0, 120, 0]));
	g.add(mesh(new THREE.SphereGeometry(34, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), toon('#3a8a5a'), [0, 240, 0]));
	g.add(mesh(new THREE.CylinderGeometry(10, 12, 26, 14), toon('#9aa0ae'), [0, 282, 0]));
	g.add(mesh(new THREE.CylinderGeometry(16, 16, 10, 16), toon('#d23b3b'), [0, 300, 0]));
	const tex = paint(128, 64, (c) => {
		c.fillStyle = '#f4f1e6';
		c.fillRect(0, 0, 128, 64);
		c.fillStyle = '#2a2f4a';
		c.font = '900 30px Rubik, sans-serif';
		c.textAlign = 'center';
		c.fillText('GAS', 64, 44);
	});
	const lab = mesh(new THREE.PlaneGeometry(52, 26), new THREE.MeshBasicMaterial({map: tex}), [0, 150, 35]);
	lab.userData.noInk = true;
	g.add(lab);
	return inkPx(g, 2.4);
};
export const makeMask = () => {
	const g = new THREE.Group();
	const cup = mesh(new THREE.SphereGeometry(1, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2), toon('#dff2fa', {transparent: true, opacity: 0.75, depthWrite: false}), [0, 0, 0], [-Math.PI / 2, 0, 0], [26, 22, 22]);
	cup.userData.noInk = true;
	g.add(cup);
	g.add(mesh(new THREE.CylinderGeometry(6, 6, 10, 12), toon('#9aa0ae'), [0, -24, 8]));
	g.add(mesh(new THREE.TorusGeometry(26, 3, 8, 24), toon('#9aa0ae'), [0, 0, 0], undefined, [1, 22 / 26, 1]));
	return inkPx(g, 2);
};
/* a flexible hose as a tube along points (world px, y down handled by caller) */
export const makeHose = (pts: THREE.Vector3[]) => {
	const curve = new THREE.CatmullRomCurve3(pts);
	return inkPx(mesh(new THREE.TubeGeometry(curve, 40, 5, 8), toon('#2a2f4a')), 1.6);
};
export const makeSuitcase = () => {
	const g = new THREE.Group();
	g.add(mesh(rbox(110, 150, 56, 10), toon('#c0503a'), [0, 85, 0]));
	g.add(mesh(new THREE.BoxGeometry(60, 30, 4), toon('#f4f1e6'), [-10, 100, 30], [0, 0, 0.12]));
	for (const x of [-34, 34]) g.add(mesh(new THREE.CylinderGeometry(4, 4, 104, 10), toon('#6a6a78'), [x * 0.5, 210, -20]));
	g.add(mesh(rbox(50, 12, 12, 4), toon('#2a2a34'), [0, 262, -20]));
	for (const x of [-40, 40]) g.add(mesh(new THREE.CylinderGeometry(9, 9, 12, 14), toon('#1b1a26'), [x, 9, 0], [Math.PI / 2, 0, 0]));
	return inkPx(g, 2.4);
};
/* a thin drinking straw between two world points (call setStraw each frame) */
export const makeThinStraw = () => {
	const g = new THREE.Group();
	const t = mesh(new THREE.CylinderGeometry(3.2, 3.2, 1, 10), toon('#f4f6fa'));
	const ring = mesh(new THREE.CylinderGeometry(6, 6, 8, 12), toon('#3d6fd6'), [0, -0.3, 0]);
	g.add(t, ring);
	g.userData = {t, ring};
	return inkPx(g, 1.6);
};
export const setStraw = (g: THREE.Group, a: [number, number], b: [number, number], z = 30) => {
	const ax = a[0], ay = -a[1], bx = b[0], by = -b[1];
	const L = Math.hypot(bx - ax, by - ay);
	g.position.set((ax + bx) / 2, (ay + by) / 2, z);
	g.rotation.set(0, 0, Math.atan2(-(bx - ax), by - ay));
	(g.userData.t as THREE.Mesh).scale.set(1, L, 1);
	(g.userData.ring as THREE.Mesh).position.set(0, -L * 0.3, 0);
};
/* wall timer with a digital screen; set(text) redraws */
export type Timer = THREE.Group & {userData: {set: (t: string, c?: string) => void}};
export const makeTimer = (): Timer => {
	const g = new THREE.Group() as Timer;
	g.add(mesh(rbox(300, 110, 30, 10), toon('#2a2f3a'), [0, 0, 0]));
	const cv = document.createElement('canvas');
	cv.width = 512;
	cv.height = 160;
	const ctx = cv.getContext('2d')!;
	const tex = new THREE.CanvasTexture(cv);
	tex.colorSpace = THREE.SRGBColorSpace;
	const scr = mesh(new THREE.PlaneGeometry(270, 84), new THREE.MeshBasicMaterial({map: tex}), [0, 0, 16]);
	scr.userData.noInk = true;
	g.add(scr);
	let last = '';
	const set = (t: string, c = '#ff4a4a') => {
		if (t + c === last) return;
		last = t + c;
		ctx.fillStyle = '#0b0d14';
		ctx.fillRect(0, 0, 512, 160);
		ctx.fillStyle = c;
		ctx.font = '900 118px Rubik, sans-serif';
		ctx.textAlign = 'center';
		ctx.fillText(t, 256, 122);
		tex.needsUpdate = true;
	};
	set('00:00');
	inkPx(g, 2.6);
	g.userData = {set};
	return g;
};
/* newspaper (front page) */
export const makeNewspaper = (headline: string[], sub: string) => {
	const tex = paint(512, 680, (c) => {
		c.fillStyle = '#f2ecdc';
		c.fillRect(0, 0, 512, 680);
		c.fillStyle = '#1b1a26';
		c.font = '900 44px Georgia, serif';
		c.textAlign = 'center';
		c.fillText('THE DAILY NEWS', 256, 60);
		c.fillRect(20, 76, 472, 6);
		c.font = '900 64px Rubik, sans-serif';
		headline.forEach((h, i) => c.fillText(h, 256, 160 + i * 70));
		c.font = '700 30px Rubik, sans-serif';
		c.fillText(sub, 256, 160 + headline.length * 70 + 10);
		c.fillStyle = '#c8c0ac';
		c.fillRect(30, 420, 200, 220);
		for (let i = 0; i < 9; i++) c.fillRect(260, 430 + i * 24, 220, 10);
	});
	const g = new THREE.Group();
	g.add(mesh(new THREE.BoxGeometry(300, 400, 3), [toon('#e8e0cc'), toon('#e8e0cc'), toon('#e8e0cc'), toon('#e8e0cc'), new THREE.MeshBasicMaterial({map: tex}), toon('#e8e0cc')]));
	return inkPx(g, 2.4);
};
let envTexC: THREE.Texture | null = null;
const envTex = () => (envTexC ??= paint(128, 80, (c) => {
	c.fillStyle = '#fbf8ee';
	c.fillRect(0, 0, 128, 80);
	c.strokeStyle = '#b8b0a0';
	c.lineWidth = 4;
	c.beginPath();
	c.moveTo(0, 0);
	c.lineTo(64, 44);
	c.lineTo(128, 0);
	c.stroke();
	c.fillStyle = '#d23b3b';
	c.fillRect(100, 8, 18, 22);
}));
export const makeEnvelope = () => {
	const m = mesh(new THREE.BoxGeometry(64, 40, 2), [toon('#e8e0cc'), toon('#e8e0cc'), toon('#e8e0cc'), toon('#e8e0cc'), new THREE.MeshBasicMaterial({map: envTex()}), toon('#fbf8ee')]);
	return inkPx(m, 1.6);
};
/* jar on y = 0: pickles or peanut butter */
export const makeJar = (kind: 'pickle' | 'pb') => {
	const g = new THREE.Group();
	if (kind === 'pickle') {
		g.add(mesh(new THREE.CylinderGeometry(40, 40, 120, 24), toon('#d8f0c8', {transparent: true, opacity: 0.55, depthWrite: false}), [0, 60, 0]));
		g.add(mesh(new THREE.CylinderGeometry(36, 36, 92, 24), toon('#c8d86a', {transparent: true, opacity: 0.7}), [0, 48, 0]));
		for (let i = 0; i < 5; i++) {
			const p = mesh(new THREE.CapsuleGeometry(9, 50, 6, 10), toon('#4a8a3a'), [-20 + i * 10, 52, (i % 2) * 10 - 5], [0, 0, (i - 2) * 0.15]);
			p.userData.noInk = true;
			g.add(p);
		}
		g.add(mesh(new THREE.CylinderGeometry(42, 42, 18, 24), toon('#d23b3b'), [0, 128, 0]));
	} else {
		g.add(mesh(new THREE.CylinderGeometry(42, 42, 110, 24), toon('#a8642e'), [0, 55, 0]));
		const tex = paint(256, 96, (c) => {
			c.fillStyle = '#f2c84a';
			c.fillRect(0, 0, 256, 96);
			c.fillStyle = '#7a3a1a';
			c.font = '900 40px Rubik, sans-serif';
			c.textAlign = 'center';
			c.fillText('PEANUT', 128, 46);
			c.fillText('BUTTER', 128, 88);
		});
		const lab = mesh(new THREE.CylinderGeometry(43, 43, 56, 24, 1, true, -0.9, 1.8), new THREE.MeshBasicMaterial({map: tex}), [0, 56, 0]);
		lab.userData.noInk = true;
		g.add(lab);
		g.add(mesh(new THREE.CylinderGeometry(44, 44, 20, 24), toon('#d23b3b'), [0, 120, 0]));
	}
	return inkPx(g, 2.4);
};
export const makeSpoon = () => {
	const g = new THREE.Group();
	g.add(mesh(new THREE.BoxGeometry(6, 60, 3), toon('#c9d0dc'), [0, -30, 0]));
	g.add(mesh(new THREE.SphereGeometry(1, 14, 10), toon('#c9d0dc'), [0, 6, 0], undefined, [12, 16, 5]));
	g.add(mesh(new THREE.SphereGeometry(1, 12, 8), toon('#a8642e'), [0, 8, 3], undefined, [9, 11, 4]));
	return inkPx(g, 1.8);
};
/* double-barrel shotgun along +x, origin at the grip */
export const makeShotgun = () => {
	const g = new THREE.Group();
	for (const z of [-4, 4]) {
		const b = new THREE.CylinderGeometry(5, 5, 170, 12);
		b.rotateZ(Math.PI / 2);
		g.add(mesh(b, toon('#3a3a44'), [110, 6, z]));
	}
	g.add(mesh(new THREE.BoxGeometry(70, 16, 12), toon('#6a4a2a'), [40, 0, 0]));
	const stock = mesh(new THREE.BoxGeometry(90, 26, 12), toon('#7a5230'), [-30, -10, 0], [0, 0, 0.25]);
	g.add(stock);
	return inkPx(g, 2.2);
};
/* the hiccup straw: a stiff L-shaped tube with a valve cap, on its own */
export const makeStraw = () => {
	const g = new THREE.Group();
	const tube = new THREE.CylinderGeometry(7, 7, 170, 14);
	g.add(mesh(tube, toon('#f4f6fa'), [0, 85, 0]));
	g.add(mesh(new THREE.CylinderGeometry(16, 16, 22, 18), toon('#3d6fd6'), [0, 10, 0]));
	g.add(mesh(new THREE.CylinderGeometry(10, 10, 6, 14), toon('#d23b3b'), [0, -4, 0]));
	g.add(mesh(new THREE.TorusGeometry(14, 3, 8, 20, Math.PI), toon('#f4f6fa'), [14, 170, 0]));
	return inkPx(g, 2);
};
export const makeWaterGlass = () => {
	const g = new THREE.Group();
	g.add(mesh(new THREE.CylinderGeometry(34, 28, 110, 22, 1, true), toon('#e4f4fb', {transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false}), [0, 55, 0]));
	g.add(mesh(new THREE.CylinderGeometry(31, 28, 70, 22), toon('#7ac6f0', {transparent: true, opacity: 0.75}), [0, 36, 0]));
	return inkPx(g, 2);
};
/* a big red subscribe button (no logo) */
export const makeSubButton = () => {
	const g = new THREE.Group();
	g.add(mesh(rbox(520, 150, 60, 40), toon('#e42b2b'), [0, 0, 0]));
	const tex = paint(512, 140, (c) => {
		c.fillStyle = '#e42b2b';
		c.fillRect(0, 0, 512, 140);
		c.fillStyle = '#ffffff';
		c.font = '900 80px Rubik, sans-serif';
		c.textAlign = 'center';
		c.fillText('SUBSCRIBE', 256, 100);
	});
	const face = mesh(new THREE.PlaneGeometry(480, 130), new THREE.MeshBasicMaterial({map: tex}), [0, 0, 31]);
	face.userData.noInk = true;
	g.add(face);
	return inkPx(g, 3);
};

/* ======================= part D props ======================= */
export const makePlate = (food: 'pasta' | 'peas' | 'soup' = 'pasta') => {
	const g = new THREE.Group();
	g.add(mesh(new THREE.CylinderGeometry(46, 38, 8, 28), toon('#fbfaf4'), [0, 4, 0]));
	if (food === 'pasta') g.add(mesh(new THREE.SphereGeometry(1, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon('#f2c84a'), [0, 8, 0], undefined, [28, 14, 22]));
	if (food === 'peas') for (let i = 0; i < 6; i++) g.add(mesh(new THREE.SphereGeometry(7, 10, 8), toon('#5ab04a'), [-16 + i * 7, 12, (i % 2) * 8 - 4]));
	if (food === 'soup') g.add(mesh(new THREE.CylinderGeometry(30, 24, 22, 24), toon('#d86a3a'), [0, 16, 0]));
	return inkPx(g, 2);
};
/* IV pole on y = 0 with a bag and a line hanging down */
export const makeIV = () => {
	const g = new THREE.Group();
	g.add(mesh(new THREE.CylinderGeometry(4, 4, 420, 10), toon('#c8d0dc'), [0, 210, 0]));
	g.add(mesh(new THREE.CylinderGeometry(40, 46, 10, 5), toon('#8a9aa8'), [0, 5, 0]));
	g.add(mesh(new THREE.BoxGeometry(70, 4, 4), toon('#c8d0dc'), [0, 414, 0]));
	g.add(mesh(rbox(48, 70, 16, 8), toon('#dff2fa', {transparent: true, opacity: 0.8}), [-24, 370, 0]));
	g.add(mesh(new THREE.CylinderGeometry(2, 2, 160, 6), toon('#e4f4fb'), [-24, 255, 0]));
	return inkPx(g, 2);
};
/* bedside heart monitor on a short stand; beat(f) scrolls the trace */
export type Monitor = THREE.Group & {userData: {beat: (f: number) => void}};
export const makeMonitor = (): Monitor => {
	const g = new THREE.Group() as Monitor;
	g.add(mesh(rbox(170, 120, 40, 10), toon('#2a2f3a'), [0, 340, 0]));
	g.add(mesh(new THREE.CylinderGeometry(5, 5, 280, 10), toon('#8a9aa8'), [0, 140, 0]));
	g.add(mesh(new THREE.CylinderGeometry(36, 40, 10, 5), toon('#6a7a88'), [0, 5, 0]));
	const cv = document.createElement('canvas');
	cv.width = 300;
	cv.height = 200;
	const ctx = cv.getContext('2d')!;
	const tex = new THREE.CanvasTexture(cv);
	tex.colorSpace = THREE.SRGBColorSpace;
	const scr = mesh(new THREE.PlaneGeometry(146, 96), new THREE.MeshBasicMaterial({map: tex}), [0, 340, 21]);
	scr.userData.noInk = true;
	g.add(scr);
	const beat = (f: number) => {
		ctx.fillStyle = '#06130e';
		ctx.fillRect(0, 0, 300, 200);
		ctx.strokeStyle = '#4cff9a';
		ctx.lineWidth = 5;
		ctx.beginPath();
		for (let i = 0; i <= 60; i++) {
			const p = (i + Math.floor(f / 1.5)) % 30;
			const y = 110 + (p === 0 ? -70 : p === 1 ? 40 : p === 2 ? -10 : 0);
			if (i === 0) ctx.moveTo(i * 5, y);
			else ctx.lineTo(i * 5, y);
		}
		ctx.stroke();
		ctx.fillStyle = '#4cff9a';
		ctx.font = '900 40px Rubik, sans-serif';
		ctx.fillText('72', 220, 50);
		tex.needsUpdate = true;
	};
	beat(0);
	inkPx(g, 2.4);
	g.userData = {beat};
	return g;
};
/* round wall clock; set(hours) moves the hands */
export const makeWallClock = () => {
	const g = new THREE.Group();
	g.add(mesh(new THREE.CylinderGeometry(70, 70, 16, 40), toon('#e8e4d8'), [0, 0, 0], [Math.PI / 2, 0, 0]));
	g.add(mesh(new THREE.CylinderGeometry(62, 62, 18, 40), toon('#fbfaf4'), [0, 0, 1], [Math.PI / 2, 0, 0]));
	const hh = new THREE.Group();
	hh.add(mesh(new THREE.BoxGeometry(8, 36, 4), toon('#1b1a26'), [0, 18, 0]));
	const mh = new THREE.Group();
	mh.add(mesh(new THREE.BoxGeometry(5, 52, 4), toon('#1b1a26'), [0, 26, 0]));
	hh.position.z = 12;
	mh.position.z = 14;
	g.add(hh, mh);
	for (let i = 0; i < 12; i++) {
		const a = (i / 12) * Math.PI * 2;
		g.add(mesh(new THREE.BoxGeometry(4, 10, 2), toon('#3a3a44'), [Math.sin(a) * 52, Math.cos(a) * 52, 11], [0, 0, -a]));
	}
	inkPx(g, 2.4);
	g.userData.set = (h: number) => {
		hh.rotation.z = -(h / 12) * Math.PI * 2;
		mh.rotation.z = -(h % 1) * Math.PI * 2;
	};
	return g;
};

/* ======================= part E props ======================= */
/* bedside table on y = 0 with a drawer that slides out (open 0..1) */
export const makeNightstand = () => {
	const g = new THREE.Group();
	g.add(mesh(rbox(150, 170, 110, 6), toon('#7a5a3a'), [0, 85, 0]));
	const drawer = new THREE.Group();
	drawer.add(mesh(new THREE.BoxGeometry(130, 50, 100), toon('#8a6a44'), [0, 0, 0]));
	drawer.add(mesh(new THREE.BoxGeometry(110, 6, 90), toon('#5a3a22'), [0, 22, 0]));
	drawer.add(mesh(new THREE.CylinderGeometry(6, 6, 10, 12), toon('#c9a04a'), [0, 0, 55], [Math.PI / 2, 0, 0]));
	drawer.position.set(0, 135, 8);
	g.add(drawer);
	g.add(mesh(new THREE.BoxGeometry(130, 50, 4), toon('#6a4a2e'), [0, 60, 56]));
	g.userData.drawer = drawer;
	return inkPx(g, 2.4);
};
export const openDrawer = (n: THREE.Group, k: number) => {
	(n.userData.drawer as THREE.Group).position.z = 8 + 70 * k;
};
export const makeAlarm = () => {
	const g = new THREE.Group();
	g.add(mesh(new THREE.CylinderGeometry(34, 34, 22, 28), toon('#d23b3b'), [0, 36, 0], [Math.PI / 2, 0, 0]));
	g.add(mesh(new THREE.CylinderGeometry(28, 28, 4, 28), toon('#fbfaf4'), [0, 36, 12], [Math.PI / 2, 0, 0]));
	for (const x of [-22, 22]) g.add(mesh(new THREE.SphereGeometry(12, 14, 10), toon('#c9ced8'), [x, 70, 0]));
	for (const x of [-20, 20]) g.add(mesh(new THREE.CylinderGeometry(3, 3, 12, 8), toon('#2a2a34'), [x, 6, 0]));
	g.add(mesh(new THREE.BoxGeometry(3, 18, 2), toon('#1b1a26'), [0, 44, 15]));
	g.add(mesh(new THREE.BoxGeometry(14, 3, 2), toon('#1b1a26'), [6, 36, 15]));
	return inkPx(g, 2);
};
export const makeTeacup = () => {
	const g = new THREE.Group();
	g.add(mesh(new THREE.CylinderGeometry(22, 16, 30, 20), toon('#f4f1e6'), [0, 17, 0]));
	g.add(mesh(new THREE.CylinderGeometry(19, 19, 2, 20), toon('#a8642e'), [0, 31, 0]));
	g.add(mesh(new THREE.TorusGeometry(9, 3, 8, 16), toon('#f4f1e6'), [24, 18, 0]));
	g.add(mesh(new THREE.CylinderGeometry(32, 30, 4, 22), toon('#f4f1e6'), [0, 2, 0]));
	return inkPx(g, 2);
};
/* an old stethoscope; in ears (k=1) the tubes go up to the head (handled by the scene) */
export const makeStethoscope = () => {
	const g = new THREE.Group();
	const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(-10, 40, 0), new THREE.Vector3(0, 80, 0), new THREE.Vector3(20, 100, 0)]);
	g.add(mesh(new THREE.TubeGeometry(curve, 24, 4, 8), toon('#2a2f4a')));
	g.add(mesh(new THREE.CylinderGeometry(14, 14, 8, 20), toon('#c9d0dc'), [0, -4, 0], [Math.PI / 2, 0, 0]));
	return inkPx(g, 2);
};
export const makeRings = () => {
	const g = new THREE.Group();
	g.add(mesh(new THREE.TorusGeometry(40, 9, 12, 32), toon('#f2c84a'), [-24, 0, 0], [0.3, 0.4, 0]));
	g.add(mesh(new THREE.TorusGeometry(40, 9, 12, 32), toon('#f2c84a'), [24, 0, 0], [-0.3, 0.6, 0]));
	return inkPx(g, 2.4);
};
export const makeTrophy = () => {
	const g = new THREE.Group();
	g.add(mesh(new THREE.CylinderGeometry(50, 50, 30, 24), toon('#5a3a22'), [0, 15, 0]));
	g.add(mesh(new THREE.CylinderGeometry(10, 16, 60, 16), toon('#e4b84a'), [0, 60, 0]));
	g.add(mesh(new THREE.CylinderGeometry(56, 22, 90, 24), toon('#f2c84a'), [0, 135, 0]));
	for (const x of [-60, 60]) g.add(mesh(new THREE.TorusGeometry(20, 6, 8, 16, Math.PI), toon('#f2c84a'), [x, 140, 0], [0, 0, x > 0 ? -Math.PI / 2 : Math.PI / 2]));
	return inkPx(g, 2.6);
};

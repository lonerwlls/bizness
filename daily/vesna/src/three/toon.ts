import * as THREE from 'three';
import {mergeVertices} from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/* The 3D look that sits with our flat stickmen: two-tone (toon) shading, thick dark ink
   outlines (inverted hull, constant width on screen), painted canvas textures. */

export const INK = '#15131f';

const gradient = (() => {
	const t = new THREE.DataTexture(new Uint8Array([88, 88, 88, 255, 175, 175, 175, 255, 255, 255, 255, 255]), 3, 1, THREE.RGBAFormat);
	t.minFilter = THREE.NearestFilter;
	t.magFilter = THREE.NearestFilter;
	t.generateMipmaps = false;
	t.needsUpdate = true;
	return t;
})();

export const toon = (color: string, extra: Partial<THREE.MeshToonMaterialParameters> = {}) => new THREE.MeshToonMaterial({color, gradientMap: gradient, ...extra});
export const flat = (color: string, extra: Partial<THREE.MeshBasicMaterialParameters> = {}) => new THREE.MeshBasicMaterial({color, ...extra});

/* ink hull: a back-face copy pushed out along smooth normals, width ∝ distance → constant px */
const inkMat = (k: number) =>
	new THREE.ShaderMaterial({
		uniforms: {k: {value: k}, c: {value: new THREE.Color(INK)}},
		vertexShader: `uniform float k; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); float d = max(0.5, -mv.z); vec3 n = normalize(normalMatrix * normal); mv.xyz += n * k * d; gl_Position = projectionMatrix * mv; }`,
		fragmentShader: `uniform vec3 c; void main(){ gl_FragColor = vec4(c,1.0); }`,
		side: THREE.BackSide,
	});
const hullCache = new WeakMap<THREE.BufferGeometry, THREE.BufferGeometry>();
const hullGeo = (g: THREE.BufferGeometry) => {
	let h = hullCache.get(g);
	if (h) return h;
	const c = new THREE.BufferGeometry();
	c.setAttribute('position', g.getAttribute('position').clone());
	if (g.index) c.setIndex(g.index.clone());
	h = mergeVertices(c, 1e-3);
	h.computeVertexNormals();
	hullCache.set(g, h);
	return h;
};
/* outline every mesh under obj (skip ones with userData.noInk) */
export const ink = <T extends THREE.Object3D>(obj: T, k = 0.0032): T => {
	const mat = inkMat(k);
	const meshes: THREE.Mesh[] = [];
	obj.traverse((o) => {
		if ((o as THREE.Mesh).isMesh && !o.userData.noInk && !o.userData.hull) meshes.push(o as THREE.Mesh);
	});
	for (const m of meshes) {
		const h = new THREE.Mesh(hullGeo(m.geometry), mat);
		h.userData.hull = true;
		h.layers.mask = m.layers.mask;
		m.add(h);
	}
	return obj;
};
export const noInk = <T extends THREE.Object3D>(o: T) => {
	o.traverse((x) => (x.userData.noInk = true));
	return o;
};

/* canvas texture painter */
export const paint = (w: number, h: number, draw: (c: CanvasRenderingContext2D) => void, repeat?: [number, number]) => {
	const cv = document.createElement('canvas');
	cv.width = w;
	cv.height = h;
	const c = cv.getContext('2d')!;
	draw(c);
	const t = new THREE.CanvasTexture(cv);
	t.colorSpace = THREE.SRGBColorSpace;
	t.anisotropy = 4;
	if (repeat) {
		t.wrapS = t.wrapT = THREE.RepeatWrapping;
		t.repeat.set(repeat[0], repeat[1]);
	}
	return t;
};
export const skyTexture = (stops: [number, string][]) =>
	paint(4, 512, (c) => {
		const g = c.createLinearGradient(0, 0, 0, 512);
		for (const [o, col] of stops) g.addColorStop(o, col);
		c.fillStyle = g;
		c.fillRect(0, 0, 4, 512);
	});

export const mesh = (g: THREE.BufferGeometry, m: THREE.Material, p?: [number, number, number], r?: [number, number, number], s?: [number, number, number]) => {
	const o = new THREE.Mesh(g, m);
	if (p) o.position.set(...p);
	if (r) o.rotation.set(...r);
	if (s) o.scale.set(...s);
	return o;
};
/* deterministic random */
export const rnd = (seed: number) => {
	let s = seed >>> 0 || 1;
	return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
};

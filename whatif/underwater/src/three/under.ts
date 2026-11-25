import * as THREE from 'three';
import {inkPx, mesh, toon} from './toon';

/* 3D props of "What if you lived underwater for 30 days?" (units = world px, y up). */

/* yellow roll-top dry bag with a strap, centred on its handle (top) */
export const makeDryBag = (c = '#e8b830') => {
	const g = new THREE.Group();
	g.add(mesh(new THREE.CylinderGeometry(26, 28, 80, 18), toon(c), [0, -56, 0]));
	g.add(mesh(new THREE.BoxGeometry(60, 12, 18), toon('#2a2f3a'), [0, -12, 0]));
	g.add(mesh(new THREE.TorusGeometry(10, 3, 6, 14, Math.PI), toon('#2a2f3a'), [0, -4, 0]));
	g.add(mesh(new THREE.BoxGeometry(6, 70, 30), toon('#2a2f3a'), [0, -58, 0], undefined, [1, 1, 1.9]));
	return inkPx(g, 2.2);
};

import * as THREE from 'three';

export function createAxesHelper(mesh: THREE.Mesh | THREE.Group, length: number = 2): THREE.AxesHelper {
    const axesHelper = new THREE.AxesHelper(length);
    axesHelper.position.copy(mesh.position);
    axesHelper.rotation.copy(mesh.rotation);
    return axesHelper;
}

export function markerRing(radius: number = 0.5, color: number = 0xff0000): THREE.Mesh {
    const geometry = new THREE.RingGeometry(radius * 0.8, radius, 32);
    const material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(geometry, material);
    ring.rotation.x = Math.PI / 2; // Rotate to lie flat on the ground
    return ring;
}

import * as THREE from 'three';

export function createAxisHelper(mesh: THREE.Mesh | THREE.Group, length: number = 2): THREE.AxesHelper {
    const axisHelper = new THREE.AxesHelper(length);
    axisHelper.position.copy(mesh.position);
    axisHelper.rotation.copy(mesh.rotation);
    return axisHelper;
}

export function markerRing(radius: number = 0.5, color: number = 0xff0000): THREE.Mesh {
    const geometry = new THREE.RingGeometry(radius * 0.8, radius, 32);
    const material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(geometry, material);
    ring.rotation.x = Math.PI / 2; // Rotate to lie flat on the ground
    return ring;
}

export function calcCenterOfGeometries(object: THREE.Object3D | THREE.Object3D[]): THREE.Vector3 {
    const center = new THREE.Vector3();
    let count = 0;

    (Array.isArray(object) ? object : [object]).forEach((obj) => {
        obj.traverse((child) => {
            if (child instanceof THREE.Mesh && child.geometry) {
            const geometry = child.geometry;
            geometry.computeBoundingBox();
            if (geometry.boundingBox) {
                const childCenter = new THREE.Vector3();
                geometry.boundingBox.getCenter(childCenter);
                child.localToWorld(childCenter);
                center.add(childCenter);
                count++;
            }
            }
        });
    });

    if (count > 0) {
        center.divideScalar(count);
    }

    return center;
}

import * as THREE from 'three';
import { ADDITION, Brush, Evaluator, SUBTRACTION } from 'three-bvh-csg';

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

export function calcUVS(geometry: THREE.BufferGeometry){
    geometry.computeBoundingBox();
    geometry.computeVertexNormals();
    
    const bbox = geometry.boundingBox;
    if (bbox) {
        const uvAttribute = new THREE.BufferAttribute(new Float32Array(geometry.attributes.position.count * 2), 2);
        const positions = geometry.attributes.position;
        const normals = geometry.attributes.normal;
        
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            const z = positions.getZ(i);
            
            let u: number, v: number;
            
            if (normals) {
                const nx = Math.abs(normals.getX(i));
                const ny = Math.abs(normals.getY(i));
                const nz = Math.abs(normals.getZ(i));
                
                // Reine Welt-/Lokalkoordinaten ohne Division = Kein Verzerren
                if (nx >= ny && nx >= nz) {
                    u = z; v = y; // Seitenwände
                } else if (nz >= nx && nz >= ny) {
                    u = x; v = y; // Vorder-/Rückseite
                } else {
                    u = x; v = z; // Decke/Boden
                }
            } else {
                u = x; v = y;
            }
            
            uvAttribute.setXY(i, u, v);
        }
        
        geometry.setAttribute('uv', uvAttribute);
    }
}

export function subtractGeometry(subtractFromGeometry: THREE.Mesh | THREE.Group, subtractGeometry: THREE.Mesh | THREE.Group): Brush {
    const evaluator = new Evaluator();
    evaluator.attributes = ['position', 'normal'];
    
    let subtractionBrush: Brush | null = null;
    let subtractFromBrush: Brush | null = null;

    subtractGeometry.traverse((child) => {
        if (child instanceof THREE.Mesh && child.geometry) {
            const childBrush = new Brush(child.geometry);
            subtractionBrush = subtractionBrush ? evaluator.evaluate(subtractionBrush, childBrush, ADDITION) : childBrush;
        }
    });

    subtractFromGeometry.traverse((child) => {
        if (child instanceof THREE.Mesh && child.geometry) {
            const childBrush = new Brush(child.geometry);
            subtractFromBrush = subtractFromBrush ? evaluator.evaluate(subtractFromBrush, childBrush, ADDITION) : childBrush;
        }
    });

    if(subtractFromBrush  && subtractionBrush) {
        return evaluator.evaluate(subtractFromBrush, subtractionBrush, SUBTRACTION);
    } else {
        if(subtractFromBrush) {
            return subtractFromBrush;
        } else {
            throw new Error("No valid geometry found for subtraction.");
        }
    }
}

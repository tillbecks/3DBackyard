import * as THREE from 'three';
import { ADDITION, Brush, Evaluator, SUBTRACTION } from 'three-bvh-csg';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { SimplexNoise } from 'three/addons/math/SimplexNoise.js';

export function createAxisHelper(mesh: THREE.Mesh | THREE.Group | THREE.Vector3, length: number = 2): THREE.AxesHelper {
    const axisHelper = new THREE.AxesHelper(length);
    if (mesh instanceof THREE.Vector3) {
        axisHelper.position.copy(mesh);
    } else {
        axisHelper.position.copy(mesh.position);
        axisHelper.rotation.copy(mesh.rotation);
    }
    return axisHelper;
}

export function markerRing(radius: number = 0.5, color: number = 0xff0000): THREE.Mesh {
    const geometry = new THREE.RingGeometry(radius * 0.8, radius, 32);
    const material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(geometry, material);
    ring.rotation.x = Math.PI / 2; // Rotate to lie flat on the ground
    return ring;
}

export function markerSphere(radius: number = 0.5, color: number = 0xff0000): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: color });
    return new THREE.Mesh(geometry, material);
}

export function markerRect(center: {x: number, z: number, y: number}, width: number, depth: number, color: number = 0xff0000): THREE.Mesh {
    const geometry = new THREE.PlaneGeometry(width, depth);
    const material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide });
    const rect = new THREE.Mesh(geometry, material);
    rect.rotation.x = Math.PI / 2; // Rotate to lie flat on the ground
    rect.position.set(center.x, center.y, center.z);
    return rect;
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

export function calcUVS(geometry: THREE.BufferGeometry | THREE.Group){
    (geometry instanceof THREE.Group ? geometry : new THREE.Group().add(new THREE.Mesh(geometry))).traverse((child) => {
        if(child instanceof THREE.Mesh && child.geometry?.attributes?.position){
            child.geometry.computeBoundingBox();
            child.geometry.computeVertexNormals();
        
            const bbox = child.geometry.boundingBox;
            if (bbox) {
                const uvAttribute = new THREE.BufferAttribute(new Float32Array(child.geometry.attributes.position.count * 2), 2);
                const positions = child.geometry.attributes.position;
                const normals = child.geometry.attributes.normal;
                
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
                
                child.geometry.setAttribute('uv', uvAttribute);
            }
        }
    });
}

export function subtractGeometry(subtractFromGeometry: THREE.Mesh | THREE.Group, subtractGeometry: THREE.Mesh | THREE.Group | null): Brush {
    const evaluator = new Evaluator();
    evaluator.attributes = ['position', 'normal'];
    
    let subtractionBrush: Brush | null = null;
    let subtractFromBrush: Brush | null = null;

    if (subtractGeometry) {
        subtractGeometry.traverse((child) => {
            if (child instanceof THREE.Mesh && child.geometry) {
                const childBrush = new Brush(child.geometry);
                subtractionBrush = subtractionBrush ? evaluator.evaluate(subtractionBrush, childBrush, ADDITION) : childBrush;
            }
        });
    }

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



export function mapHeightMapToPlane(geometry: THREE.PlaneGeometry, heightMap: Float32Array, width: number, depth: number): THREE.BufferGeometry {

    const positionAttribute = geometry.attributes.position;
    const vertex = new THREE.Vector3();
    
    let vertexIndex = 0;
    for (let z = 0; z < depth; z++) {
        for (let x = 0; x < width; x++) {
            if (vertexIndex >= positionAttribute.count) break;
            
            vertex.fromBufferAttribute(positionAttribute, vertexIndex);
            const heightValue = heightMap[z * width + x];
            vertex.z += heightValue;
            positionAttribute.setXYZ(vertexIndex, vertex.x, vertex.y, vertex.z);
            vertexIndex++;
        }
    }
    geometry.computeVertexNormals();
    return geometry;
}

export function createRandomHeightMap(minHeight: number, maxHeight: number, width: number, depth: number): Float32Array {

    const heightMap = new Float32Array(width * depth);
    const steps = [{scale: 100, weight: 1.0, noise: new SimplexNoise({random:  Math.random})}, {scale: 30, weight: 0.3, noise: new SimplexNoise({random:  Math.random})}, {scale: 1, weight: 0.05, noise: new SimplexNoise({random: Math.random})}];
    
    for(const s of steps){
        for (let z = 0; z < depth; z++) {
            for (let x = 0; x < width; x++) {
                const noiseValue = s.noise.noise((x) / s.scale, (z) / s.scale);
                heightMap[z * width + x] += ((noiseValue + 1) / 2) * (maxHeight - minHeight) * s.weight;
            }
        }
    }
    return heightMap;
}

export function createSinusHeightMap(amplitude: number, Xfrequency: number, Zfrequency: number, width: number, depth: number): Float32Array {
    width = Math.round(width);
    depth = Math.round(depth);

    const heightMap = new Float32Array(width * depth);
    for (let z = 0; z < depth; z++) {
        for (let x = 0; x < width; x++) {
            const heightValue = Math.sin(x * Xfrequency) * Math.cos(z * Zfrequency) * amplitude;
            heightMap[z * width + x] = heightValue;
        }
     }
     return heightMap;
}

export function rotateVectorAroundAxisPosition(vector: THREE.Vector3, axis: THREE.Vector3, angle: number, axisPosition: THREE.Vector3): THREE.Vector3 {
    const normalizedAxis = axis.clone().normalize();
    const q = new THREE.Quaternion().setFromAxisAngle(normalizedAxis, angle);
    return vector.clone().sub(axisPosition).applyQuaternion(q).add(axisPosition);
}

export function calcNormalizedDirectionVector(from: THREE.Vector3, to: THREE.Vector3): THREE.Vector3 {
    return to.clone().sub(from).normalize();
}

export function cameraFollowObject(camera: THREE.Camera, object: THREE.Object3D, delta: number, lookAtTargetBuffer: THREE.Vector3) {
    // Berechne Blickrichtung des Vogels (wo schaut der Vogel hin)
    const birdForward = new THREE.Vector3(0, 0, 1).applyQuaternion(object.quaternion).normalize();
    
    // Offset ist immer HINTER dem Vogel, relativ zu seiner Blickrichtung
    const offset = birdForward.multiplyScalar(5);
    const targetPosition = new THREE.Vector3().copy(object.position).add(offset);
    
    const posLerpFactor = 1 - Math.exp(-3 * delta); 
    const lookLerpFactor = 1 - Math.exp(-4 * delta); 

    lookAtTargetBuffer.lerp(targetPosition, lookLerpFactor);
    const targetQuat = new THREE.Quaternion();
    targetQuat.copy(camera.quaternion);
    
    camera.lookAt(lookAtTargetBuffer);
    camera.quaternion.slerp(targetQuat, lookLerpFactor );
    camera.position.lerp(object.position, posLerpFactor);
}

export function instancedMeshToMergedMesh(instancedMesh: THREE.InstancedMesh): THREE.Mesh {
    const matrix = new THREE.Matrix4();
    const geometries: THREE.BufferGeometry[] = [];

    for (let i = 0; i < instancedMesh.count; i++) {
        instancedMesh.getMatrixAt(i, matrix);
        const geo = instancedMesh.geometry.clone();
        geo.applyMatrix4(matrix);

        // Farbe als Vertex-Color einbacken
        if (instancedMesh.instanceColor) {
            const color = new THREE.Color();
            instancedMesh.getColorAt(i, color);
            const colors = new Float32Array(geo.attributes.position.count * 3);
            colors.fill(0);
            for (let j = 0; j < geo.attributes.position.count; j++) {
                colors[j * 3]     = color.r;
                colors[j * 3 + 1] = color.g;
                colors[j * 3 + 2] = color.b;
            }
            geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        }
        geometries.push(geo);
    }

    const merged = mergeGeometries(geometries, false)!;
    return new THREE.Mesh(merged, instancedMesh.material);
}
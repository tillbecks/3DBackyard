import { add, max } from "three/tsl";
import { LAWN_MIX_MATERIAL } from "../textures/materials";
import * as THREE from 'three';
import { LAWN_FIELDS_PER_SIZE, HOUSE_DEPTH } from "../config/houseConfig";
import { SimplexNoise } from 'three/addons/math/SimplexNoise.js';

export class Lawn {
    width: number;
    depth: number;

    constructor(width: number, depth: number){
        this.width = width;
        this.depth = depth;
    }

    get3DObject(): THREE.Mesh {
        const geometry: THREE.PlaneGeometry = new THREE.PlaneGeometry(this.width, this.depth, LAWN_FIELDS_PER_SIZE * this.width, LAWN_FIELDS_PER_SIZE * this.depth);
        //geometry = this.addHeightVariation(geometry);

        const BufferGeometry = mapHeightMapToPlane(geometry, createHeightMap(0, 2, this.width * LAWN_FIELDS_PER_SIZE + 1, this.depth * LAWN_FIELDS_PER_SIZE + 1));

        const materialMix = LAWN_MIX_MATERIAL;
        const lawnMesh = new THREE.Mesh(BufferGeometry, materialMix.standardMaterial);
        lawnMesh.userData.shader = materialMix.shaderMaterial;
        lawnMesh.rotation.x = -Math.PI / 2; // Rotate to lie flat on the ground
        lawnMesh.receiveShadow = true;
        lawnMesh.translateY(-HOUSE_DEPTH);
        return lawnMesh;
    }
}

function mapHeightMapToPlane(geometry: THREE.PlaneGeometry, heightMap: Float32Array): THREE.BufferGeometry {
    const positionAttribute = geometry.attributes.position;
    const vertex = new THREE.Vector3();
    for (let i = 0; i < positionAttribute.count; i++) {
        vertex.fromBufferAttribute(positionAttribute, i);
        const heightValue = heightMap[i];
        vertex.z += heightValue;
        positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    geometry.computeVertexNormals();
    return geometry;
}

function createHeightMap(minHeight: number, maxHeight: number, width: number, depth: number): Float32Array {
    const heightMap = new Float32Array(width * depth);
    const noise = new SimplexNoise({random: () => Math.random()});
    const steps = [{scaleX: 2, scaleZ: 2, weight: 0.25}, {scaleX: 20, scaleZ: 20, weight: 0.5}, {scaleX: 100, scaleZ: 100, weight: 1}];
    for(const s of steps){
        for (let z = 0; z < depth; z++) {
            for (let x = 0; x < width; x++) {
                const noiseValue = noise.noise(x / s.scaleX, z / s.scaleZ) * s.weight; // Adjust the scale as needed
                heightMap[z * width + x] += ((noiseValue + 1) / 2) * (maxHeight - minHeight) + minHeight; // Normalize to [minHeight, maxHeight]
            }
        }
    }
    return heightMap;
}

export function createLawn(width: number, depth: number): THREE.Mesh {
    return new Lawn(width, depth).get3DObject();
}
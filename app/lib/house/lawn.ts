import { add, max } from "three/tsl";
import { LAWN_MIX_MATERIAL } from "../textures/materials";
import * as THREE from 'three';
import { LAWN_FIELDS_PER_SIZE, HOUSE_DEPTH } from "../config/houseConfig";
import { createRandomHeightMap, mapHeightMapToPlane } from "../config/3dUtils";

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

        const BufferGeometry = mapHeightMapToPlane(geometry, createRandomHeightMap(0, 2, this.width * LAWN_FIELDS_PER_SIZE + 1, this.depth * LAWN_FIELDS_PER_SIZE + 1));
        geometry.dispose();
        const materialMix = LAWN_MIX_MATERIAL;
        const lawnMesh = new THREE.Mesh(BufferGeometry, materialMix.standardMaterial);
        lawnMesh.userData.shader = materialMix.shaderMaterial;
        lawnMesh.rotation.x = -Math.PI / 2; // Rotate to lie flat on the ground
        lawnMesh.receiveShadow = true;
        lawnMesh.translateY(-HOUSE_DEPTH);
        return lawnMesh;
    }
}

export function createLawn(width: number, depth: number): THREE.Mesh {
    return new Lawn(width, depth).get3DObject();
}
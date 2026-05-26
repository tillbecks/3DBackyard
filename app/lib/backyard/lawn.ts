import * as THREE from 'three';

import { LAWN_MIX_MATERIAL } from "@/app/lib/materials/materials";

import { LAWN_FIELDS_PER_SIZE, HOUSE_DEPTH } from "@/app/lib/config/houseConfig";
import { createRandomHeightMap, mapHeightMapToPlane } from "@/app/lib/config/3dUtils";

export class Lawn {
    width: number;
    depth: number;

    constructor(width: number, depth: number){
        this.width = width;
        this.depth = depth;
    }

    get3DObject(): THREE.Mesh {
        const widthSegments = Math.round(LAWN_FIELDS_PER_SIZE * this.width);
        const depthSegments = Math.round(LAWN_FIELDS_PER_SIZE * this.depth);
        const geometry: THREE.PlaneGeometry = new THREE.PlaneGeometry(this.width, this.depth, widthSegments, depthSegments);
        //geometry = this.addHeightVariation(geometry);

        const BufferGeometry = mapHeightMapToPlane(geometry, createRandomHeightMap(0, 4, widthSegments + 1, depthSegments + 1), widthSegments + 1, depthSegments + 1);
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
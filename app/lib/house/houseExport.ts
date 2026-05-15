import { houseGroupGenerator } from "./houseBody";
import {createCameraConfig} from "../config/importExportUtils";
import * as THREE from "three";
import { createLawn } from "./lawn";
import { HOUSE_DEPTH } from "../config/houseConfig";

/*export async function createHouseExport() {
    const houses = generateHouses();

    try {
        const glb = await IEUTILS.objectToGLB(houses);
        return glb;
    } catch (error) {
        console.error('GLB export error:', error);
        throw new Error('Failed to export scene to GLB');
    }
}*/

export function generateHousesWithLawn(): THREE.Group{
    const houses = generateHouses();
    const houseBounds = new THREE.Box3().setFromObject(houses);
    const houseSize = new THREE.Vector3();
    houseBounds.getSize(houseSize);
    const lawn = createLawn(houseSize.x, 200);
    lawn.translateY(-HOUSE_DEPTH);
    const group = new THREE.Group();
    group.add(lawn);
    group.add(houses);
    return group;
}

export function generateHouses(): THREE.Group{
    const houseGroup = houseGroupGenerator(12, [0,0,0]);
    return houseGroup;
}

export function createHouseCameraConfig(){
    return createCameraConfig(new THREE.Vector3(0, 110, 180), new THREE.Vector3(0, 60, 0));
}
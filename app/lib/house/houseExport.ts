import { houseGroupGenerator } from "./houseBody";
import {createCameraConfig} from "../config/importExportUtils";
import * as THREE from "three";

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

export function generateHouses(): THREE.Group{
    const house_group = houseGroupGenerator(12, [0,-30,0]);
    return house_group;
}

export function createHouseCameraConfig(){
    return createCameraConfig(new THREE.Vector3(0, 80, 180), new THREE.Vector3(0, 30, 0));
}
import { houseGroupGenerator } from "./houseBody";
import {createCameraConfig} from "../config/importExportUtils";
import * as THREE from "three";
import { createLawn } from "./lawn";
import { HOUSE_DEPTH } from "../config/houseConfig";
import { createAxisHelper } from "../config/3dUtils";


export function generateHousesWithLawn(): THREE.Group{
    const houses = generateHouses();
    const houseBounds = new THREE.Box3().setFromObject(houses);
    const houseSize = new THREE.Vector3();
    houseBounds.getSize(houseSize);
    const lawn = createLawn(houseSize.x, houseSize.z);
    lawn.translateY(-houseSize.z/2 + HOUSE_DEPTH/2);
    const group = new THREE.Group();
    group.add(lawn);
    group.add(houses);
    return group;
}

export function generateHouses(): THREE.Group{
    const housesGroup = new THREE.Group();

    const houseGroup = houseGroupGenerator(6, [0,0,0]);
    const groupSize = new THREE.Box3().setFromObject(houseGroup).getSize(new THREE.Vector3());
    const houseGroup2 = houseGroupGenerator(3, [0,0,0]);
    const groupSize2 = new THREE.Box3().setFromObject(houseGroup2).getSize(new THREE.Vector3());
    const houseGroup3 = houseGroupGenerator(3, [0,0,0]);
    const groupSize3 = new THREE.Box3().setFromObject(houseGroup3).getSize(new THREE.Vector3());
    houseGroup2.rotateY(Math.PI / 2);
    houseGroup2.translateZ(-groupSize.x/2 - groupSize2.z/2);
    houseGroup2.translateX(-groupSize2.x/2 - groupSize.z/2);

    houseGroup3.rotateY(-Math.PI / 2);
    houseGroup3.translateZ(-groupSize.x/2 - groupSize3.z/2);
    houseGroup3.translateX(groupSize3.x/2 + groupSize.z/2);

    housesGroup.add(houseGroup);
    housesGroup.add(houseGroup2);
    housesGroup.add(houseGroup3);
    return housesGroup;
}

export function createHouseCameraConfig(){
    return createCameraConfig(new THREE.Vector3(0, 110, 300), new THREE.Vector3(0, 60, 0));
}
import { houseGroupGenerator } from "./houseBody";
import {createCameraConfig} from "../config/importExportUtils";
import * as THREE from "three";
import { createLawn } from "./lawn";
import { HOUSE_DEPTH } from "../config/houseConfig";
import * as TYPES from "../../types/typeIndex";
import { rotateVectorAroundAxisPosition } from "../config/3dUtils";
import { translateLightConfigs } from "./lights";


export function generateHousesWithLawn(): TYPES.ObjectLightReturn{
    const houses = generateHouses();
    const houseBounds = new THREE.Box3().setFromObject(houses.object);
    const houseSize = new THREE.Vector3();
    houseBounds.getSize(houseSize);
    const lawn = createLawn(houseSize.x, houseSize.z);
    lawn.translateY(-houseSize.z/2 + HOUSE_DEPTH/2);
    const group = new THREE.Group();
    group.add(lawn);
    group.add(houses.object);
    return {object: group, lights: houses.lights};
}

export function generateHouses(): TYPES.ObjectLightReturn{
    const housesGroup = new THREE.Group();
    const lights = [];
    
    const houseGroup = houseGroupGenerator(6, [0,0,0]);
    const groupSize = new THREE.Box3().setFromObject(houseGroup.object).getSize(new THREE.Vector3());
    lights.push(...houseGroup.lights);

    const houseGroup2 = houseGroupGenerator(3, [0,0,0]);
    const groupSize2 = new THREE.Box3().setFromObject(houseGroup2.object).getSize(new THREE.Vector3());
    const lights2 = houseGroup2.lights;

    const houseGroup3 = houseGroupGenerator(3, [0,0,0]);
    const groupSize3 = new THREE.Box3().setFromObject(houseGroup3.object).getSize(new THREE.Vector3());
    const lights3 = houseGroup3.lights;
    
    const zTranslation2 =  groupSize.x/2 + groupSize2.z/2;
    const xTranslation2 = groupSize.z/2 + groupSize2.x/2;
    const zTranslation3 = groupSize.x/2 + groupSize3.z/2;
    const xTranslation3 = groupSize.z/2 + groupSize3.x/2;

    lights2.forEach(light => light.position = rotateVectorAroundAxisPosition(light.position, new THREE.Vector3(0,1,0), Math.PI / 2, new THREE.Vector3(0,0,0)));
    translateLightConfigs(lights2, new THREE.Vector3(- zTranslation2, 0, xTranslation2));
    lights3.forEach(light => light.position = rotateVectorAroundAxisPosition(light.position, new THREE.Vector3(0,1,0), -Math.PI / 2, new THREE.Vector3(0,0,0)));
    translateLightConfigs(lights3, new THREE.Vector3( zTranslation3, 0, xTranslation3));
    lights.push(...lights2);
    lights.push(...lights3);
    houseGroup2.object.rotateY(Math.PI / 2);
    houseGroup2.object.translateX(- xTranslation2);
    houseGroup2.object.translateZ(- zTranslation2);

    houseGroup3.object.rotateY(-Math.PI / 2);
    houseGroup3.object.translateX( xTranslation3);
    houseGroup3.object.translateZ(- zTranslation3);

    housesGroup.add(houseGroup.object);
    housesGroup.add(houseGroup2.object);
    housesGroup.add(houseGroup3.object);
    return {object: housesGroup, lights: lights};
}

export function createHouseCameraConfig(){
    return createCameraConfig(new THREE.Vector3(0, 110, 300), new THREE.Vector3(0, 60, 0));
}
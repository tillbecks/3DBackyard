import * as THREE from "three";

import { houseGroupGenerator } from "./houseBody";

import * as TYPES from "@/app/types/typeIndex";
import * as BYCONFIG from "@/app/lib/config/backyardConfig";
import * as TCONFIG from "@/app/lib/config/treeConfig";

import {createCameraConfig} from "@/app/lib/config/importExportUtils";
import { createLawn } from "@/app/lib/backyard/lawn";
import { HOUSE_DEPTH } from "@/app/lib/config/houseConfig";
import {DecorationsPlacer} from "@/app/lib/config/decorations";
import { Tree } from "@/app/lib/backyard/trees";
import { YardWalls } from "@/app/lib/backyard/walls";

export function generateHousesWithLawn(): TYPES.ObjectLightReturn{
    const houses = generateHouses();
    const housesBounds = new THREE.Box3().setFromObject(houses.object);
    const housesSize = new THREE.Vector3();
    housesBounds.getSize(housesSize);
    
    const lawn = createLawn(housesSize.x, housesSize.z);
    lawn.position.set(0, 0, 0);

    const group = new THREE.Group();
    group.add(lawn);
    group.add(houses.object);
    return {object: group, lightConfigs: houses.lightConfigs};
}

export function generateHouses(): TYPES.ObjectLightReturn{
    const housesGroup = new THREE.Group();
    const lightConfigs = [];
    
    const houseGroupN = houseGroupGenerator(6, [0,0,0]);
    const groupSizeN = new THREE.Box3().setFromObject(houseGroupN.object).getSize(new THREE.Vector3());
    lightConfigs.push(...houseGroupN.lightConfigs);

    const houseGroupE = houseGroupGenerator(4, [0,0,0]);
    const groupSizeE = new THREE.Box3().setFromObject(houseGroupE.object).getSize(new THREE.Vector3());
    lightConfigs.push(...houseGroupE.lightConfigs);

    const houseGroupS = houseGroupGenerator(6, [0,0,0]);
    const groupSizeS = new THREE.Box3().setFromObject(houseGroupS.object).getSize(new THREE.Vector3());
    lightConfigs.push(...houseGroupS.lightConfigs);

    const houseGroupW = houseGroupGenerator(4, [0,0,0]);
    const groupSizeW = new THREE.Box3().setFromObject(houseGroupW.object).getSize(new THREE.Vector3());
    lightConfigs.push(...houseGroupW.lightConfigs);

    const yardWidth = Math.max(groupSizeN.x, groupSizeS.x);
    const yardDepth = Math.max(groupSizeE.x, groupSizeW.x);

    const zTranslationN = yardDepth/2 + groupSizeN.z/2;
    houseGroupN.object.translateZ(- zTranslationN);
    
    const zTranslationE = yardWidth/2 + groupSizeE.z/2;
    houseGroupE.object.rotateY(-Math.PI / 2);
    houseGroupE.object.translateZ(- zTranslationE);
    
    const zTranslationS = yardDepth/2 + groupSizeS.z/2;
    houseGroupS.object.rotateY(Math.PI);
    houseGroupS.object.translateZ(- zTranslationS);

    const zTranslationW = yardWidth/2 + groupSizeW.z/2;
    houseGroupW.object.rotateY(Math.PI / 2);
    houseGroupW.object.translateZ(- zTranslationW);

    housesGroup.add(houseGroupN.object);
    housesGroup.add(houseGroupE.object);
    housesGroup.add(houseGroupS.object);
    housesGroup.add(houseGroupW.object);

    const walls = new YardWalls(houseGroupN.housesWidths, houseGroupE.housesWidths, houseGroupS.housesWidths, houseGroupW.housesWidths, yardWidth, yardDepth);
    housesGroup.add(walls.get3DObject());

    return {object: housesGroup, lightConfigs: lightConfigs};
}

export function createHouseCameraConfig(){
    return createCameraConfig(new THREE.Vector3(0, 110, 130), new THREE.Vector3(0, 80, 0));
}
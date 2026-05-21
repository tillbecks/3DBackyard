import { houseGroupGenerator } from "./houseBody";
import {createCameraConfig} from "../config/importExportUtils";
import * as THREE from "three";
import { createLawn } from "../backyard/lawn";
import { HOUSE_DEPTH } from "../config/houseConfig";
import * as TYPES from "../../types/typeIndex";
import { rotateVectorAroundAxisPosition } from "../config/3dUtils";
import { translateLightConfigs } from "./lights";
import {DecorationsPlacer} from "../config/decorations";
import * as BYCONFIG from "../config/backyardConfig";
import * as TCONFIG from "../config/treeConfig";
import { Tree } from "../backyard/lsystems";

export function generateHousesWithLawn(): TYPES.ObjectLightReturn{
    const houses = generateHouses();
    const housesBounds = new THREE.Box3().setFromObject(houses.object);
    const housesSize = new THREE.Vector3();
    housesBounds.getSize(housesSize);
    houses.object.translateZ(-housesSize.z/2 + HOUSE_DEPTH * 1.5);

    const decorationsPlacer = new DecorationsPlacer(housesSize.x - 2 * HOUSE_DEPTH, housesSize.z - 2 * HOUSE_DEPTH);
    const allowedMinX = BYCONFIG.TREE_DISTANCE_EDGES / housesSize.x;
    const allowedMaxX = (housesSize.x - BYCONFIG.TREE_DISTANCE_EDGES) / housesSize.x;
    const allowedMinZ = BYCONFIG.TREE_DISTANCE_EDGES / housesSize.z;
    const allowedMaxZ = (housesSize.z - BYCONFIG.TREE_DISTANCE_EDGES) / housesSize.z;

    for(let i = 0; i < BYCONFIG.TREES_PLACED; i++){
        const tree = new Tree(TCONFIG.LSystem, TCONFIG.LSystemGeometryConfig);
        decorationsPlacer.addDecorationPosition(tree, allowedMinX, allowedMaxX, allowedMinZ, allowedMaxZ);
    }

    const trees = decorationsPlacer.positionDecorations(new THREE.Vector3(0, 0, 0));

    const lawn = createLawn(housesSize.x, housesSize.z);

    const group = new THREE.Group();
    group.add(lawn);
    group.add(houses.object);
    group.add(trees);
    return {object: group, lights: houses.lights};
}

export function generateHouses(): TYPES.ObjectLightReturn{
    const housesGroup = new THREE.Group();
    const lights = [];
    
    const houseGroup = houseGroupGenerator(6, [0,0,0]);
    const groupSize = new THREE.Box3().setFromObject(houseGroup.object).getSize(new THREE.Vector3());
    lights.push(...houseGroup.lights);

    const houseGroup2 = houseGroupGenerator(6, [0,0,0]);
    const groupSize2 = new THREE.Box3().setFromObject(houseGroup2.object).getSize(new THREE.Vector3());
    const lights2 = houseGroup2.lights;

    const houseGroup3 = houseGroupGenerator(6, [0,0,0]);
    const groupSize3 = new THREE.Box3().setFromObject(houseGroup3.object).getSize(new THREE.Vector3());
    const lights3 = houseGroup3.lights;

    const houseGroup4 = houseGroupGenerator(6, [0,0,0]);
    const groupSize4 = new THREE.Box3().setFromObject(houseGroup4.object).getSize(new THREE.Vector3());
    const lights4 = houseGroup4.lights;

    //yardPartitioning(houseGroup.housesWidths, houseGroup2.housesWidths, houseGroup3.housesWidths, houseGroup4.housesWidths);
    const zTranslation2 =  groupSize.x/2 + groupSize2.z/2;
    const xTranslation2 = groupSize.z/2 + groupSize2.x/2;
    const zTranslation3 = groupSize.x/2 + groupSize3.z/2;
    const xTranslation3 = groupSize.z/2 + groupSize3.x/2;
    const zTranslation4 = (groupSize2.x + groupSize3.x)/2 + groupSize4.z/2 + groupSize.z/2;

    lights2.forEach(light => light.position = rotateVectorAroundAxisPosition(light.position, new THREE.Vector3(0,1,0), Math.PI / 2, new THREE.Vector3(0,0,0)));
    translateLightConfigs(lights2, new THREE.Vector3(- zTranslation2, 0, xTranslation2));
    lights3.forEach(light => light.position = rotateVectorAroundAxisPosition(light.position, new THREE.Vector3(0,1,0), -Math.PI / 2, new THREE.Vector3(0,0,0)));
    translateLightConfigs(lights3, new THREE.Vector3( zTranslation3, 0, xTranslation3));
    lights4.forEach(light => light.position = rotateVectorAroundAxisPosition(light.position, new THREE.Vector3(0,1,0), Math.PI, new THREE.Vector3(0,0,0)));
    translateLightConfigs(lights4, new THREE.Vector3(0, 0, zTranslation4));
    lights.push(...lights2);
    lights.push(...lights3);
    lights.push(...lights4);

    houseGroup2.object.rotateY(Math.PI / 2);
    houseGroup2.object.translateX(- xTranslation2);
    houseGroup2.object.translateZ(- zTranslation2);

    houseGroup3.object.rotateY(-Math.PI / 2);
    houseGroup3.object.translateX( xTranslation3);
    houseGroup3.object.translateZ(- zTranslation3);

    houseGroup4.object.rotateY(Math.PI);
    houseGroup4.object.translateZ(- zTranslation4);

    housesGroup.add(houseGroup.object);
    housesGroup.add(houseGroup2.object);
    housesGroup.add(houseGroup3.object);
    housesGroup.add(houseGroup4.object);
    return {object: housesGroup, lights: lights};
}

export function createHouseCameraConfig(){
    return createCameraConfig(new THREE.Vector3(0, 110, 100), new THREE.Vector3(0, 60, 0));
}
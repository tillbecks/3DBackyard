import * as THREE from 'three';
import { terrestrialAntennaGenerator } from '../house/antennas/terrestrialAntenna';
import { houseGroupGenerator } from '../house/houseBody';
import { createCameraConfig } from '../config/importExportUtils';
import * as TDUTILS from '../config/3dUtils';
import BirdModel from '../birds/birdModel';

export function generateShowcaseContent(){
    const returnGroup = new THREE.Group();

    /*const antenna = terrestrialAntenna_generator();
    returnGroup.add(TDUTILS.createAxesHelper(antenna));
    returnGroup.add(antenna);*/

    const house = createHouse();
    returnGroup.add(house);

    return returnGroup;
}

export function generateBirdShowcaseContent(){
    const returnGroup = new THREE.Group();

    const birdModel = new BirdModel();
    returnGroup.add(createPresentationPlatform());

    returnGroup.add(birdModel.get3DObject()); 

    return returnGroup;
}

export function createPresentationPlatform(){
    const geometry = new THREE.CylinderGeometry( 20, 20, 0.5, 32 );
    const material = new THREE.MeshStandardMaterial( {color: 0x808080} );
    const cylinder = new THREE.Mesh( geometry, material );
    cylinder.position.set(0, -30, 0);
    cylinder.receiveShadow = true;
    return cylinder;
}

export function createHouse(){
    return houseGroupGenerator(1, [0,0,0]);
}

export function createShowcaseCameraConfig(){
    return createCameraConfig(new THREE.Vector3(0, 150, 80), new THREE.Vector3(0, 120, 0));
}

export function createBirdShowcaseCameraConfig(){
    return createCameraConfig(new THREE.Vector3(0, 5, 10), new THREE.Vector3(0, 0, 0));
}


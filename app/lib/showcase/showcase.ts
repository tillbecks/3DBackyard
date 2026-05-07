import * as THREE from 'three';
import { terrestrialAntenna_generator } from '../house/antennas/terrestrial_antenna';
import { houseGroupGenerator } from '../house/houseBody';
import { createCameraConfig } from '../config/importExportUtils';
import * as TDUTILS from '../config/3dUtils';

export function generateShowcaseContent(){
    const returnGroup = new THREE.Group();

    /*const antenna = terrestrialAntenna_generator();
    returnGroup.add(TDUTILS.createAxesHelper(antenna));
    returnGroup.add(antenna);*/

    const house = createHouse();
    returnGroup.add(house);

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


import * as THREE from 'three';
import { SUN_CONFIG } from '../config/sceneConfig';

export function initSunlight(){
    const sunLight = new THREE.DirectionalLight(0xffffff, SUN_CONFIG.sun_intensity);

    const sunPosition = calcSunPosition(SUN_CONFIG.azimuth, SUN_CONFIG.elevation);

    sunLight.position.copy(sunPosition);
    sunLight.target.position.set(0,0,0);
    sunLight.castShadow = true;
    sunLight.shadow.camera.left   = -300;
    sunLight.shadow.camera.right  =  300;
    sunLight.shadow.camera.top    =  250;
    sunLight.shadow.camera.bottom = -250;
    sunLight.shadow.mapSize.width  = 4096;
    sunLight.shadow.mapSize.height = 4096;
    
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far  = 500;

    return sunLight;
}

function calcSunPosition(azimuthDegr: number, elevationDegr: number){
    const pos = new THREE.Vector3();

    const phi = THREE.MathUtils.degToRad(90 - azimuthDegr);
    const theta = THREE.MathUtils.degToRad(90 -elevationDegr);

    pos.setFromSphericalCoords(SUN_CONFIG.sun_distance, theta, phi);

    return pos;
}

export function initAmbientLight(){
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);

    return ambientLight;
}
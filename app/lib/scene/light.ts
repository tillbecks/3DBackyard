'use client';

import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';

import * as TYPES from '@/app/types/typeIndex';
import { AMBIENT_LIGHT_CONFIG, SUN_CONFIG, getLightIntensityFromElevation, getSunPosition, LIGHT_UPDATE_INTERVAL } from '@/app/lib/config/sceneConfig';

export function initLightSky(scene: THREE.Scene): TYPES.LightSkyController{
    let sunPosition = getSunPosition(Date.now()); // Start at midday
    
    const sunlight = initSunlight(sunPosition);
    const ambientLight = initAmbientLight(sunPosition);
    const sky = initSky(sunPosition);

    let timePassed = 0;

    scene.add(sunlight);
    scene.add(ambientLight);
    scene.add(sky);

    return {
        sunlight,
        ambientLight,
        sky,

        update: (deltaSeconds: number) => {
            if(timePassed >= LIGHT_UPDATE_INTERVAL){
                timePassed -= LIGHT_UPDATE_INTERVAL;

                sunPosition = getSunPosition(Date.now());
                refreshSunlight(sunlight, sunPosition);
                refreshAmbientLight(ambientLight, sunPosition);
                refreshSkySunPosition(sky, sunPosition);
            }else{
                timePassed += deltaSeconds;
            }
        }
    };
}

export function initSunlight(sunPosition: TYPES.SunPosition){
    const sunIntensity = getLightIntensityFromElevation(sunPosition.altitude, SUN_CONFIG.MAX_SUN_INTENSITY);

    const sunLight = new THREE.DirectionalLight(SUN_CONFIG.SUN_COLOR, sunIntensity);

    sunLight.position.setFromSphericalCoords(SUN_CONFIG.SUN_DISTANCE, sunPosition.phi, sunPosition.theta);

    sunLight.target.position.set(0,50,0);
    sunLight.castShadow = true;
    sunLight.shadow.camera.left   = -400;
    sunLight.shadow.camera.right  =  400;
    sunLight.shadow.camera.top    =  250;
    sunLight.shadow.camera.bottom = -250;
    sunLight.shadow.mapSize.width  = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.bias = -0.001;
    sunLight.shadow.normalBias = 0.2;
    
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far  = 500;

    return sunLight;
}

export const refreshSunlight = (light: THREE.DirectionalLight, sunPosition: TYPES.SunPosition) => {
    const sunIntensity = getLightIntensityFromElevation(sunPosition.altitude, SUN_CONFIG.MAX_SUN_INTENSITY);

    light.intensity = sunIntensity;
    light.position.setFromSphericalCoords(SUN_CONFIG.SUN_DISTANCE, sunPosition.phi, sunPosition.theta);
}

export function initAmbientLight(sunPosition: TYPES.SunPosition){
    const lightIntensity = getLightIntensityFromElevation(sunPosition.altitude, AMBIENT_LIGHT_CONFIG.INTENSITY_MAX, AMBIENT_LIGHT_CONFIG.INTENSITY_MIN);

    const ambientLight = new THREE.AmbientLight(AMBIENT_LIGHT_CONFIG.COLOR, lightIntensity);

    return ambientLight;
}

export const refreshAmbientLight = (light: THREE.AmbientLight, sunPosition: TYPES.SunPosition) => {
    const lightIntensity = getLightIntensityFromElevation(sunPosition.altitude, AMBIENT_LIGHT_CONFIG.INTENSITY_MAX, AMBIENT_LIGHT_CONFIG.INTENSITY_MIN);

    light.intensity = lightIntensity;
}

export function initSky(sunPosition: TYPES.SunPosition): Sky{
    const sky = new Sky();
    const position = new THREE.Vector3(0,0,0).setFromSphericalCoords(SUN_CONFIG.SUN_DISTANCE, sunPosition.phi, sunPosition.theta);

    sky.scale.setScalar( 450000 );

    const uniforms = sky.material.uniforms;
    uniforms['turbidity'].value = 10;
    uniforms['rayleigh'].value = 1;
    uniforms['mieCoefficient'].value = 0.005;
    uniforms['mieDirectionalG'].value = 0.7;

    uniforms['sunPosition'].value.copy(position);

    return sky;
}

export const refreshSkySunPosition = (sky: Sky, sunPosition: TYPES.SunPosition) => {
    sky.material.uniforms['sunPosition'].value.setFromSphericalCoords(SUN_CONFIG.SUN_DISTANCE, sunPosition.phi, sunPosition.theta);
}
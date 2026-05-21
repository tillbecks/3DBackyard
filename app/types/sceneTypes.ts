import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';

export interface SunPosition{
    phi: number;
    theta: number;
    altitude: number;
    azimuth: number;
}

export interface LightSkyController {
    sunlight: THREE.DirectionalLight;
    ambientLight: THREE.AmbientLight;
    sky: Sky;
    update: (deltaSeconds: number) => void;
}
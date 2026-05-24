import * as THREE from 'three';

export interface WindowPositions{
    type: string;
    windowsX: number[];
    windowsRightX: number[];
    stairX: number;
    windowWidth: number;
    balconyPositionX: number;
}

export interface WallPositions{
    type: string,
    wallsX: number[],
    wallsRightX: number[],
}

export type SubtractGeometry = THREE.BoxGeometry[][];

export interface WindowReturn{
    windowHoles: THREE.Mesh, 
    windowPanes:  THREE.Group, 
    stairWindowHoles: THREE.Mesh | null, 
    stairWindowPanes: THREE.Group, 
    windowPositions: WindowPositions,
}

export interface WindowBalconiesReturn{
    windows: WindowReturn, 
    balconies?: THREE.Group
}

export interface LightConfig{
    color: number;
    intensity: number;
    position: THREE.Vector3;
    initTurnedOn: boolean;
    timer: number;
}

export interface ObjectLightReturn{
    object: THREE.Group;
    lights: LightConfig[];
}

export interface HouseReturn{
    object: THREE.Group;
    lights: LightConfig[];
    housesWidths: number[];
}

export interface APIObjectLightReturn{
    object: string;
    lights: LightConfig[];
}

export interface LightObject{
    light: THREE.SpotLight;
    turnedOn: boolean;
    timer: number;
}

export interface LightTimer{
    light: LightObject;
    timeElapsed: number;
    lightIndex: number;
}
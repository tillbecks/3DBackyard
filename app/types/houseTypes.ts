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

export interface WallLightReturn{
    wallLight: THREE.Mesh;
    lightConfig: LightConfig;
}

export interface LightConfig{
    name: string;
    initTurnedOn: boolean;
    timer: number;
}

export interface RoomLightReturn{
    object: THREE.Group;
    lightConfigs: LightConfig[];
    wallLights: THREE.Mesh[];
}

export interface ObjectLightReturn{
    object: THREE.Group;
    lightConfigs: LightConfig[];
}

export interface HouseReturn{
    object: THREE.Group;
    lightConfigs: LightConfig[];
    housesWidths: number[];
}

export interface APIObjectLightReturn{
    object: string;
    lightConfigs: LightConfig[];
}

export interface LightObject{
    name: string;
    turnedOn: boolean;
    timer: number;
}

export interface LightTimer{
    light: LightObject;
    timeElapsed: number;
    lightIndex: number;
}
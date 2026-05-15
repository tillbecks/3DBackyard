import * as THREE from 'three';

export interface WindowPositions{
    type: string;
    windowsX: number[];
    windowsRightX: number[];
    stairX: number;
    windowWidth: number;
}

export interface WallPositions{
    type: string,
    wallsX: number[],
    wallsRightX: number[],
}

export type SubtractGeometry = THREE.BoxGeometry[][];

export interface WindowReturn{
    "windowHoles": THREE.Group, 
    "windowPanes":  THREE.Group, 
    "stairWindowHoles": THREE.Group, 
    "stairWindowPanes": THREE.Group, 
    "balconyPosition": number, 
    "windowPositions": WindowPositions,
    "balconySpace": {left: number, right: number}
}

export interface WindowBalconiesReturn{
    "windows": WindowReturn, 
    "balconies"?: THREE.Group
}
import * as THREE from 'three';

export interface cameraTripTarget{
    object: THREE.Object3D;
    followGoal: THREE.Vector3; //Can be set to object-position, to zoom in onto a specific object, or to the target to which the camera should follow the object
    objectViewDirection?: THREE.Vector3; 
    enforceEndView: boolean ;
    objectDistance: number; //Has to be smaller then tolerance
    tolerance: number;
    lerpSpeed?: number;
}
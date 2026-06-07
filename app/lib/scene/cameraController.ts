'use client';

import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';

import * as TYPES from '@/app/types/typeIndex';
import { calcDistance } from '../config/utils';
import { calcNormalizedDirectionVector } from '@/app/lib/config/3dUtils';

export class CameraController {
    private targets: TYPES.cameraTripTarget[] | [];
    private camera: THREE.PerspectiveCamera;
    private target: THREE.Vector3;
    private lookAtTargetBuffer: THREE.Vector3 = new THREE.Vector3();
    private orbitControls: OrbitControls | undefined;
    
    constructor(camera: THREE.PerspectiveCamera, target: THREE.Vector3, orbitControls?: OrbitControls) {
        this.camera = camera;
        this.target = target;
        this.orbitControls = orbitControls;
        this.targets = [];
    }

    setPosition(position: THREE.Vector3) {
        this.camera.position.copy(position);
        this.lookAtTarget();
    }

    setTarget(target: THREE.Vector3) {
        this.target.copy(target);
        this.lookAtTarget();
    }

    setCameraTrip(targets: TYPES.cameraTripTarget[]){
        this.targets = targets;
    }

    private lookAtTarget(){
        this.camera.lookAt(this.target);
        this.orbitControls?.target.copy(this.target);
        this.orbitControls?.update();
    }

    followTargets(delta: number){

        if(this.targets.length > 0){
            if(this.followObject(this.targets[0], delta)) this.targets.shift();
        }
    }

    followObject(cameraTripTarget: TYPES.cameraTripTarget, delta: number): boolean {
        const object = cameraTripTarget.object;
        const offsetDistance = cameraTripTarget.objectDistance;
        const lerpSpeed = cameraTripTarget.lerpSpeed ?? 1;
        
        const objectPosition =  object.position;
    
        let dynamicCameraGoal = new THREE.Vector3();
    
        const objectForward = new THREE.Vector3(0, 0, 1).applyQuaternion(object.quaternion).normalize();
        
        dynamicCameraGoal.copy(objectPosition).add(objectForward.multiplyScalar(offsetDistance));
        
        const distanceToFinalGoal = calcDistance(this.camera.position, cameraTripTarget.followGoal);
        const hasReachedTarget = distanceToFinalGoal < Math.abs(cameraTripTarget.tolerance);
    
        const posLerpFactor = 1 - Math.exp(-3 * delta * lerpSpeed);
        const lookLerpFactor = 1 - Math.exp(-4 * delta * lerpSpeed); 
    
        if (!hasReachedTarget) {
            this.camera.position.lerp(dynamicCameraGoal, posLerpFactor);
        } else {
            this.camera.position.lerp(cameraTripTarget.followGoal, posLerpFactor * 0.5);
        }
    
        this.lookAtTargetBuffer.lerp(objectPosition, lookLerpFactor);
        
        const currentQuat = this.camera.quaternion.clone();
        this.camera.lookAt(this.lookAtTargetBuffer);
        const targetQuat = this.camera.quaternion.clone();
        
        this.camera.quaternion.copy(currentQuat);
        this.camera.quaternion.slerp(targetQuat, lookLerpFactor);
    
        let hasCorrectView = true;
    
        if (cameraTripTarget.enforceEndView) {
            const realDirectionToObject = new THREE.Vector3().subVectors(objectPosition, this.camera.position).normalize();
            const currentCameraDirection = new THREE.Vector3();
            this.camera.getWorldDirection(currentCameraDirection);
            
            const angleError = currentCameraDirection.angleTo(realDirectionToObject);
            hasCorrectView = angleError < Math.PI * Math.pow(0.5, 5); // ca 3 degree 
        }
    
        return hasReachedTarget && hasCorrectView;
    }
    
    
}
'use client';

import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';

import { calcNormalizedDirectionVector } from '@/app/lib/config/3dUtils';

export class CameraController {
    private camera: THREE.PerspectiveCamera;
    private target: THREE.Vector3;
    private lookAtTargetBuffer: THREE.Vector3 = new THREE.Vector3();
    private orbitControls: OrbitControls | undefined;
    
    constructor(camera: THREE.PerspectiveCamera, target: THREE.Vector3, orbitControls?: OrbitControls) {
        this.camera = camera;
        this.target = target;
        this.orbitControls = orbitControls;
    }

    setPosition(position: THREE.Vector3) {
        this.camera.position.copy(position);
        this.lookAtTarget();
    }

    setTarget(target: THREE.Vector3) {
        this.target.copy(target);
        this.lookAtTarget();
    }

    private lookAtTarget(){
        this.camera.lookAt(this.target);
        this.orbitControls?.target.copy(this.target);
        this.orbitControls?.update();
    }

    followObject(object: THREE.Object3D | THREE.Vector3, delta: number, lookIntoDirectionofTarget: boolean = false, offsetDistance: number = 5, lerpSpeed: number = 1) {
        // Berechne Blickrichtung des Vogels (wo schaut der Vogel hin)
        let objectForward;
        let position = object instanceof THREE.Object3D ? object.position : object;
        if(object instanceof THREE.Object3D && lookIntoDirectionofTarget){
            //Assuming the forward direction of the object is along the positive Z-axis in its local space
            //Possible variable
            objectForward = new THREE.Vector3(0, 0, 1).applyQuaternion(object.quaternion).normalize();
        }else {
            const directionToTarget = calcNormalizedDirectionVector(this.camera.position, position);
            objectForward = directionToTarget;
        }

        // Offset ist immer HINTER dem Vogel, relativ zu seiner Blickrichtung
        const offset = objectForward.multiplyScalar(offsetDistance);
        const targetPosition = new THREE.Vector3().copy(position).add(offset);
        
        const posLerpFactor = 1 - Math.exp(-3 * delta * lerpSpeed);
        const lookLerpFactor = 1 - Math.exp(-4 * delta * lerpSpeed); 
    
        this.lookAtTargetBuffer.lerp(targetPosition, lookLerpFactor);
        const targetQuat = new THREE.Quaternion();
        targetQuat.copy(this.camera.quaternion);
        
        this.camera.lookAt(this.lookAtTargetBuffer);
        this.camera.quaternion.slerp(targetQuat, lookLerpFactor );
        this.camera.position.lerp(targetPosition, posLerpFactor);
    }
}
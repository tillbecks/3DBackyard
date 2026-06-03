
import * as THREE from 'three';

import * as HC from '@/app/lib/config/houseConfig';
import * as UTILS from '@/app/lib/config/utils';
import {RoofDecorations} from '@/app/lib/house/roofDecorations';
import { materialShaderConfigs } from '../../materials/materials';

class SatelliteBowlReceiver extends RoofDecorations{
    height: number;
    bowlAngleDeviation: number;

    constructor(diameter: number, height: number, bowlAngleDeviation: number = 0){
        super(diameter);
        this.height = height;
        this.bowlAngleDeviation = bowlAngleDeviation;
    }

    get3DObject(){
        const bowlGroup = new THREE.Group();

        const bowlPoleConfig = {
            radius: HC.SATELLITE_RECEIVER_POLE_RADIUS,
        }

        const bowlConfig = {
            radius: this.diameter/2,
            angle: Math.PI*0.1 + this.bowlAngleDeviation
        }

        const bowlGeometry = new THREE.SphereGeometry(bowlConfig.radius, 8, 8, 0, Math.PI * 2, 0, Math.PI * 0.25);
        bowlGeometry.translate(0, -bowlConfig.radius, 0);
        const bowlMaterial = materialShaderConfigs.FLAT_METAL_MATERIAL();
        const bowlMesh = new THREE.Mesh(bowlGeometry);
        bowlMesh.userData.materialConfig = bowlMaterial;
        bowlMesh.castShadow = true;
        bowlMesh.receiveShadow = true;
        bowlMesh.rotateX(Math.PI/2);


        const antenna = new ReceiverAntenna(this.diameter, bowlConfig.angle).get3DObject();
        antenna.translateY(- this.diameter/4);
        antenna.translateZ(- this.diameter/2 - (bowlConfig.radius - UTILS.calcCirclePosX(bowlConfig.radius, this.diameter/4).positive));

        bowlGroup.add(bowlMesh);
        bowlGroup.add(antenna);

        bowlGroup.rotateX(bowlConfig.angle);

        const allGroup = new THREE.Group();

        const poleGeometry = new THREE.CylinderGeometry(bowlPoleConfig.radius, bowlPoleConfig.radius, this.height, 8);
        const poleMaterial = materialShaderConfigs.FLAT_METAL_MATERIAL();
        const poleMesh = new THREE.Mesh(poleGeometry);
        poleMesh.userData.materialConfig = poleMaterial;
        poleMesh.position.y = -this.height/2;
        poleMesh.castShadow = true;
        poleMesh.receiveShadow = true;

        poleMesh.position.z += bowlPoleConfig.radius;
        
        poleMesh.position.y += this.height;
        bowlGroup.position.y += this.height;

        allGroup.add(poleMesh);
        allGroup.add(bowlGroup);
        allGroup.position.z += bowlPoleConfig.radius;

        allGroup.rotation.y = HC.SATELLITE_RECEIVER_Y_DIRECTION;

        allGroup.position.add(new THREE.Vector3(this.x, this.y, this.z));
        return allGroup;
    }
}

export function antennaGenerator(){
    const diameter = UTILS.randomInRangeInt(HC.SATELLITE_RECEIVER_BOWL_DIAMETER_MIN, HC.SATELLITE_RECEIVER_BOWL_DIAMETER_MAX);
    const height = UTILS.randomInRangeInt(HC.SATELLITE_RECEIVER_BOWL_HEIGHT_MIN, HC.SATELLITE_RECEIVER_BOWL_HEIGHT_MAX);

    const bowl = new SatelliteBowlReceiver(diameter, height);
    return bowl;
}

class ReceiverAntenna{

    bowlSize: number;
    bowlAngle: number;

    constructor(bowlSize: number, bowlAngle: number){
        this.bowlSize = bowlSize;
        this.bowlAngle = bowlAngle;
    }

    get3DObject(){
        const antennaGroup = new THREE.Group();

        const receiverBlockGroup = new THREE.Group();

        const receiverBlockParams = {
                width: 0.2,
                height: 0.3,
                depth: 0.1
        }
        const receiverBlockGeometry = new THREE.BoxGeometry(receiverBlockParams.width, receiverBlockParams.height, receiverBlockParams.depth);
        const receiverBlockMaterial = materialShaderConfigs.PLASTIC_MATERIAL();
        const receiverBlockMesh = new THREE.Mesh(receiverBlockGeometry);
        receiverBlockMesh.userData.materialConfig = receiverBlockMaterial;
        
        const receiverCylinderParams = {
            radius: receiverBlockParams.width/3,
            height: receiverBlockParams.depth,
        }

        const receiverCylinderGeometry = new THREE.CylinderGeometry(receiverCylinderParams.radius, receiverCylinderParams.radius, receiverCylinderParams.height, 8);
        const receiverCylinderMesh = new THREE.Mesh(receiverCylinderGeometry);
        receiverCylinderMesh.userData.materialConfig = receiverBlockMaterial;
        receiverCylinderMesh.position.y += receiverBlockParams.height/4;
        receiverCylinderMesh.rotateX(Math.PI/2);
        receiverCylinderMesh.position.z += receiverBlockParams.depth/2;
        
        const receiverPoleParams = {
            radius: 0.02,
            height: this.bowlSize/2
        }
        const receiverPoleGeometry = new THREE.CylinderGeometry(receiverPoleParams.radius, receiverPoleParams.radius, receiverPoleParams.height, 8);
        const receiverPoleMaterial = materialShaderConfigs.FLAT_METAL_MATERIAL();
        const receiverPoleMesh = new THREE.Mesh(receiverPoleGeometry); 
        receiverPoleMesh.userData.materialConfig = receiverPoleMaterial;
        receiverPoleMesh.rotateX(Math.PI/2);


        receiverBlockGroup.position.y += receiverBlockParams.height/6 ;
        receiverBlockGroup.position.z -= this.bowlSize/4 + receiverPoleParams.radius;

        receiverBlockGroup.add(receiverCylinderMesh);
        receiverBlockGroup.add(receiverBlockMesh);

        receiverBlockGroup.rotateX(-this.bowlAngle);


        antennaGroup.add(receiverPoleMesh);
        antennaGroup.add(receiverBlockGroup);

        antennaGroup.position.z += receiverPoleParams.height/2;

        return antennaGroup;
    }
}
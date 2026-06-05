import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

import { roofGutterGenerator } from './roofGutter';
import { terrestrialAntennaGenerator } from './antennas/terrestrialAntenna';
import { antennaGenerator } from './antennas/satelliteAntenna';
import { SceneElement } from './houseElement';
import { roofDecorationsPlacer } from './roofDecorations';
import { chimneyGenerator } from './chimneys/topChimneys';

import * as HC from '@/app/lib/config/houseConfig';
import * as TYPES from '@/app/types/typeIndex';
import { randomInRangeInt, angleToRad, randomBoolean, randomFromObject } from '@/app/lib/config/utils';
import { calcUVS } from '@/app/lib/config/3dUtils';
import { materialShaderConfigs } from '@/app/lib/materials/materials';



class Roof extends SceneElement{
    roofHeight: number;
    overhang: number;

    constructor(roofHeight: number, overhang: number){
        super();
        this.roofHeight = roofHeight;
        this.overhang = overhang;
    }

    get3DObject(houseDepth: number, houseWidth: number, houseMaterialConfig: TYPES.MaterialShaderConfig, leftHouse: number, rightHouse: number, houseHeight: number): THREE.Group{
        const roofMaterialMix: TYPES.MaterialShaderConfig = materialShaderConfigs.ROOF_MATERIAL();
        const roofPitchLength: number = Math.sqrt(Math.pow(this.roofHeight, 2) + Math.pow(houseDepth/2, 2));
        //const roofAngle = Math.asin(this.roofHeight/roofPitchLength);
        const roofAngle: number = angleToRad(90)-Math.atan(this.roofHeight/(houseDepth/2));

        const pitchFrontHeight: number = roofPitchLength + HC.ROOF_WALL_THICKNESS + this.overhang;
        const roofHouseMaterial = houseMaterialConfig;
        const roofGroup: THREE.Group = new THREE.Group();
        
        const roofSideAGeometry: THREE.BufferGeometry = new THREE.BufferGeometry();
        roofSideAGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
            -houseWidth / 2, this.roofHeight, 0,       // Top point
            -houseWidth / 2, 0, -houseDepth / 2,      // Bottom back
            -houseWidth / 2, 0, houseDepth / 2        // Bottom front
        ]), 3));
        roofSideAGeometry.setIndex([0, 1, 2]);
        roofSideAGeometry.computeVertexNormals();    

        const roofSideBGeometry: THREE.BufferGeometry = new THREE.BufferGeometry();
        roofSideBGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
            houseWidth / 2, this.roofHeight, 0,       // Top point
            houseWidth / 2, 0, -houseDepth / 2,      // Bottom back
            houseWidth / 2, 0, houseDepth / 2        // Bottom front
        ]), 3));
        roofSideBGeometry.setIndex([0, 1, 2]);
        roofSideBGeometry.computeVertexNormals();  
        const mergedRoofSideGeometry = BufferGeometryUtils.mergeGeometries([roofSideAGeometry, roofSideBGeometry]);
        calcUVS(mergedRoofSideGeometry);
        const mergedRoofMesh = new THREE.Mesh(mergedRoofSideGeometry);
        mergedRoofMesh.userData.materialConfig = houseMaterialConfig;

        roofGroup.add(mergedRoofMesh);

        const roofWidth: number = houseWidth + (leftHouse+rightHouse)*HC.ROOF_OVERHANG_SIDES;

        const moveYFront: number = (pitchFrontHeight / 2) - this.overhang;
        const roofPitchFront: THREE.BoxGeometry = new THREE.BoxGeometry(roofWidth, pitchFrontHeight, HC.ROOF_WALL_THICKNESS);
        
        const pitchFrontMatrix = new THREE.Matrix4();
        if(leftHouse + rightHouse == 1){
            pitchFrontMatrix.multiply(new THREE.Matrix4().makeTranslation((rightHouse - leftHouse)*(HC.ROOF_OVERHANG_SIDES/2), 0, 0));
        }
        pitchFrontMatrix.multiply(new THREE.Matrix4().makeTranslation(0,0,houseDepth/2));
        pitchFrontMatrix.multiply(new THREE.Matrix4().makeRotationX(-roofAngle));
        pitchFrontMatrix.multiply(new THREE.Matrix4().makeTranslation(0,moveYFront,0));
        pitchFrontMatrix.multiply(new THREE.Matrix4().makeTranslation(0,0,HC.ROOF_WALL_THICKNESS/2));
        roofPitchFront.applyMatrix4(pitchFrontMatrix);

        const pitchBackHeight: number = roofPitchLength + this.overhang;
        const moveYBack: number = (pitchBackHeight / 2) - this.overhang;
        const roofPitchBack: THREE.BoxGeometry = new THREE.BoxGeometry(roofWidth, pitchFrontHeight, HC.ROOF_WALL_THICKNESS);
        
        const pitchBackMatrix = new THREE.Matrix4();
        if(leftHouse + rightHouse == 1){
            pitchBackMatrix.multiply(new THREE.Matrix4().makeTranslation((rightHouse - leftHouse)*(HC.ROOF_OVERHANG_SIDES/2), 0, 0));
        }
        pitchBackMatrix.multiply(new THREE.Matrix4().makeTranslation(0,0,-houseDepth/2));
        pitchBackMatrix.multiply(new THREE.Matrix4().makeRotationX(roofAngle));
        pitchBackMatrix.multiply(new THREE.Matrix4().makeTranslation(0,moveYBack,0));
        pitchBackMatrix.multiply(new THREE.Matrix4().makeTranslation(0,0,-HC.ROOF_WALL_THICKNESS/2));
        roofPitchBack.applyMatrix4(pitchBackMatrix);

        const roofPitchGeometry = BufferGeometryUtils.mergeGeometries([roofPitchFront, roofPitchBack]);
        calcUVS(roofPitchGeometry);
        const roofPitchMesh = new THREE.Mesh(roofPitchGeometry);
        roofPitchMesh.userData.materialConfig = roofMaterialMix;
        roofGroup.add(roofPitchMesh);

        const roofGutter: THREE.Group = roofGutterGenerator(roofWidth, houseWidth, houseHeight, leftHouse, rightHouse);
        
        roofGutter.translateZ(houseDepth/2);
        roofGutter.rotateX(-roofAngle);
        roofGutter.translateY(-this.overhang);
        roofGutter.translateZ(HC.ROOF_WALL_THICKNESS);
        roofGutter.rotateX(roofAngle);
        if(leftHouse + rightHouse == 1){
            roofGutter.translateX((rightHouse - leftHouse)*(HC.ROOF_OVERHANG_SIDES));
        }
        roofGroup.add(roofGutter);

        const decorationsPlacer = new roofDecorationsPlacer(roofWidth, houseDepth, Math.PI/2-roofAngle);

        if(randomBoolean(HC.ANTENNA_PROBABILITY)){
            const antenna = terrestrialAntennaGenerator();
            decorationsPlacer.addDecorationPosition(antenna, HC.ANTENNA_MIN_X, HC.ANTENNA_MAX_X, HC.ANTENNA_MIN_Z, HC.ANTENNA_MAX_Z);
        }

        if(randomBoolean(HC.SATELLITE_RECEIVER_PROBABILITY)){
            const amnt = randomInRangeInt(1, HC.MAX_SATELLITE_RECEIVERS);

            for(let i = 0; i < amnt; i++){
                const bowl = antennaGenerator();
                //houseDepth/4 makes the antennas only spawn on the upper half of the front roof pitch
                decorationsPlacer.addDecorationPosition(bowl, HC.SATELLITE_RECEIVER_MIN_X, HC.SATELLITE_RECEIVER_MAX_X, HC.SATELLITE_RECEIVER_MIN_Z, HC.SATELLITE_RECEIVER_MAX_Z);
            }
        }

        if(randomBoolean(HC.CHIMNEY_PROBABILITY)){
            const chimney = chimneyGenerator(Math.PI/2 - roofAngle, houseMaterialConfig);
            decorationsPlacer.addDecorationPosition(chimney, HC.CHIMNEY_MIN_X, HC.CHIMNEY_MAX_X, HC.CHIMNEY_MIN_Z, HC.CHIMNEY_MAX_Z);
        }

        const roofDecorationsGroup = decorationsPlacer.positionDecorations(new THREE.Vector3(0, this.roofHeight, 0));
        
        roofGroup.add(roofDecorationsGroup);
        return roofGroup;
    }
}

export function roofGenerator(houseDepth: number, houseWidth: number, houseMaterial: TYPES.MaterialShaderConfig, leftHouse: number, rightHouse: number, houseHeight: number): THREE.Group {
    const roofHeight: number =  randomInRangeInt(HC.MIN_ROOF_HEIGHT, HC.MAX_ROOF_HEIGHT);
    const roofOverhang: number = randomInRangeInt(HC.MIN_ROOF_OVERHANG, HC.MAX_ROOF_OVERHANG);
    //const roofColor: string =  adjustColor("#8e8e8e", 20);

    const roof = new Roof(roofHeight, roofOverhang);
    
    return roof.get3DObject(houseDepth, houseWidth, houseMaterial, leftHouse, rightHouse, houseHeight);
}
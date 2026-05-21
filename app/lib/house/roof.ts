import * as THREE from 'three';
import * as HC from '../config/houseConfig';
import { randomInRangeInt, angleToRad, randomBoolean, randomFromObject } from '../config/utils';
import { roofGutterGenerator } from './roofGutter';
import { terrestrialAntennaGenerator } from './antennas/terrestrialAntenna';
import { antennaGenerator } from './antennas/satelliteAntenna';
import { SceneElement } from './houseElement';
import { RoofDecorations, roofDecorationsPlacer } from './roofDecorations';
import * as TYPES from '../../types/typeIndex';
import { calcUVS } from '../config/3dUtils';
import { getRoofMaterials } from '../textures/materials';
import { chimneyGenerator } from './chimneys/topChimneys';



class Roof extends SceneElement{
    roofHeight: number;
    overhang: number;

    constructor(roofHeight: number, overhang: number){
        super();
        this.roofHeight = roofHeight;
        this.overhang = overhang;
    }

    get3DObject(houseDepth: number, houseWidth: number, houseMaterial: TYPES.MaterialMix, leftHouse: number, rightHouse: number, houseHeight: number): THREE.Group{
        const roofMaterialMix: TYPES.MaterialMix = randomFromObject(getRoofMaterials());
        const roofMaterial = roofMaterialMix.standardMaterial;
        const roofPitchLength: number = Math.sqrt(Math.pow(this.roofHeight, 2) + Math.pow(houseDepth/2, 2));
        //const roofAngle = Math.asin(this.roofHeight/roofPitchLength);
        const roofAngle: number = angleToRad(90)-Math.atan(this.roofHeight/(houseDepth/2));

        const pitchFrontHeight: number = roofPitchLength + HC.ROOF_WALL_THICKNESS + this.overhang;
        const roofHouseMaterial = houseMaterial.standardMaterial;
        roofHouseMaterial.side = THREE.DoubleSide;
        const roofGroup: THREE.Group = new THREE.Group();
        
        const roofSideAGeometry: THREE.BufferGeometry = new THREE.BufferGeometry();
        roofSideAGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
            -houseWidth / 2, this.roofHeight, 0,       // Top point
            -houseWidth / 2, 0, -houseDepth / 2,      // Bottom back
            -houseWidth / 2, 0, houseDepth / 2        // Bottom front
        ]), 3));
        roofSideAGeometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([
            0.5, 1,
            0, 0,
            1, 0
        ]), 2));
        roofSideAGeometry.setIndex([0, 1, 2]);
        roofSideAGeometry.computeVertexNormals();    
        const roofSideA: THREE.Mesh = new THREE.Mesh(roofSideAGeometry, roofHouseMaterial);
        roofSideA.castShadow = true;
        roofSideA.receiveShadow = true;
        roofSideA.userData.shader = houseMaterial.shaderMaterial;
        calcUVS(roofSideA.geometry);
        roofGroup.add(roofSideA);

        const roofSideBGeometry: THREE.BufferGeometry = new THREE.BufferGeometry();
        roofSideBGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
            houseWidth / 2, this.roofHeight, 0,       // Top point
            houseWidth / 2, 0, -houseDepth / 2,      // Bottom back
            houseWidth / 2, 0, houseDepth / 2        // Bottom front
        ]), 3));
        roofSideBGeometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([
            0.5, 1,
            0, 0,
            1, 0
        ]), 2));
        roofSideBGeometry.setIndex([0, 1, 2]);
        roofSideBGeometry.computeVertexNormals();  
        const roofSideB: THREE.Mesh = new THREE.Mesh(roofSideBGeometry, roofHouseMaterial);
        roofSideB.castShadow = true;
        roofSideB.receiveShadow = true;
        roofSideB.userData.shader = houseMaterial.shaderMaterial;
        calcUVS(roofSideB.geometry);
        roofGroup.add(roofSideB);

        const roofWidth: number = houseWidth + (leftHouse+rightHouse)*HC.ROOF_OVERHANG_SIDES;

        const moveYFront: number = (pitchFrontHeight / 2) - this.overhang;
        const roofPitchFront: THREE.BoxGeometry = new THREE.BoxGeometry(roofWidth, pitchFrontHeight, HC.ROOF_WALL_THICKNESS);
        const roofPitchFrontMesh: THREE.Mesh = new THREE.Mesh(roofPitchFront, roofMaterial);
        roofPitchFrontMesh.castShadow = true;
        roofPitchFrontMesh.receiveShadow = true; 
        roofPitchFrontMesh.userData.shader = roofMaterialMix.shaderMaterial;
        if(leftHouse + rightHouse == 1){
            roofPitchFrontMesh.translateX((rightHouse - leftHouse)*(HC.ROOF_OVERHANG_SIDES/2));
        }
        roofPitchFrontMesh.translateZ(houseDepth/2);
        roofPitchFrontMesh.rotateX(-roofAngle);
        roofPitchFrontMesh.translateY(moveYFront);
        roofPitchFrontMesh.translateZ(HC.ROOF_WALL_THICKNESS/2);

        const pitchBackHeight: number = roofPitchLength + this.overhang;
        const moveYBack: number = (pitchBackHeight / 2) - this.overhang;
        const roofPitchBack: THREE.BoxGeometry = new THREE.BoxGeometry(roofWidth, pitchFrontHeight, HC.ROOF_WALL_THICKNESS);
        const roofPitchBackMesh: THREE.Mesh = new THREE.Mesh(roofPitchBack, roofMaterial);
        roofPitchBackMesh.castShadow = true;
        roofPitchBackMesh.receiveShadow = true;
        roofPitchBackMesh.userData.shader = roofMaterialMix.shaderMaterial;
        if(leftHouse + rightHouse == 1){
            roofPitchBackMesh.translateX((rightHouse - leftHouse)*(HC.ROOF_OVERHANG_SIDES/2));
        }
        roofPitchBackMesh.translateZ(-houseDepth/2);
        roofPitchBackMesh.rotateX(roofAngle);
        roofPitchBackMesh.translateY(moveYBack);
        roofPitchBackMesh.translateZ(-HC.ROOF_WALL_THICKNESS/2);

        calcUVS(roofPitchFrontMesh.geometry);
        calcUVS(roofPitchBackMesh.geometry);
        roofGroup.add(roofPitchFrontMesh);
        roofGroup.add(roofPitchBackMesh);

        const roofGutter: THREE.Group = roofGutterGenerator(roofWidth, houseWidth, houseHeight, leftHouse, rightHouse);
        
        roofGutter.translateZ(houseDepth/2);
        roofGutter.rotateY(-roofAngle);
        roofGutter.translateX(this.overhang);
        roofGutter.translateZ(HC.ROOF_WALL_THICKNESS);
        roofGutter.rotateY(roofAngle);
        roofGutter.translateZ(1);
        if(leftHouse + rightHouse == 1){
            roofGutter.translateY((rightHouse - leftHouse)*(HC.ROOF_OVERHANG_SIDES/2));
        }
        roofGroup.add(roofGutter);

        const decorationsPlacer = new roofDecorationsPlacer(roofWidth, houseDepth, Math.PI/2-roofAngle);

        if(randomBoolean(HC.ANTENNA_PROBABILITY)){
            const antenna = terrestrialAntennaGenerator();
            decorationsPlacer.addDecorationPosition(antenna, HC.ANTENNA_MIN_X, HC.ANTENNA_MAX_X, HC.ANTENNA_MIN_Z, HC.ANTENNA_MAX_Z);
        }

        let roofDecoration: RoofDecorations[] = [];

        if(randomBoolean(HC.SATELLITE_RECEIVER_PROBABILITY)){
            const amnt = randomInRangeInt(1, HC.MAX_SATELLITE_RECEIVERS);

            for(let i = 0; i < 2; i++){
                const bowl = antennaGenerator();
                //houseDepth/4 makes the antennas only spawn on the upper half of the front roof pitch
                decorationsPlacer.addDecorationPosition(bowl, HC.SATELLITE_RECEIVER_MIN_X, HC.SATELLITE_RECEIVER_MAX_X, HC.SATELLITE_RECEIVER_MIN_Z, HC.SATELLITE_RECEIVER_MAX_Z);
            }
        }

        if(randomBoolean(HC.CHIMNEY_PROBABILITY)){
            const chimney = chimneyGenerator(Math.PI/2 - roofAngle, houseMaterial);
            decorationsPlacer.addDecorationPosition(chimney, HC.CHIMNEY_MIN_X, HC.CHIMNEY_MAX_X, HC.CHIMNEY_MIN_Z, HC.CHIMNEY_MAX_Z);
        }

        const roofDecorationsGroup = decorationsPlacer.positionDecorations(new THREE.Vector3(0, this.roofHeight, 0));
        
        roofGroup.add(roofDecorationsGroup);
        return roofGroup;
    }
}

export function roofGenerator(houseDepth: number, houseWidth: number, houseMaterial: TYPES.MaterialMix, leftHouse: number, rightHouse: number, houseHeight: number): THREE.Group {
    const roofHeight: number =  randomInRangeInt(HC.MIN_ROOF_HEIGHT, HC.MAX_ROOF_HEIGHT);
    const roofOverhang: number = randomInRangeInt(HC.MIN_ROOF_OVERHANG, HC.MAX_ROOF_OVERHANG);
    //const roofColor: string =  adjustColor("#8e8e8e", 20);

    const roof = new Roof(roofHeight, roofOverhang);
    
    return roof.get3DObject(houseDepth, houseWidth, houseMaterial, leftHouse, rightHouse, houseHeight);
}
import * as THREE from 'three';
import { MAX_ROOF_HEIGHT, MAX_ROOF_OVERHANG, MIN_ROOF_HEIGHT, MIN_ROOF_OVERHANG, ROOF_WALL_THICKNESS , ROOF_OVERHANG_SIDES, ANTENNA_PROBABILITY, SATELLITE_RECEIVER_PROBABILITY, MAX_SATELLITE_RECEIVERS, ANTENNA_ROOF_POSITION_FROM_TOP} from '../config/houseConfig';
import { adjustColor, randomInRangeInt, angleToRad, randomBoolean, randomPointOnPlane, collision, randomFromObject } from '../config/utils';
/*import { brickFragmentShader } from '../../procedural_textures/brick_texture';
import { vertexShader } from '../../procedural_textures/general_texture';
import { roofTileShader } from '../../procedural_textures/roof_texture';*/
import { roofGutterGenerator } from './roofGutter';
import { terrestrialAntennaGenerator } from './antennas/terrestrialAntenna';
import * as TDUTILS from '../config/3dUtils';
import { antennaGenerator } from './antennas/satelliteAntenna';
import { HouseElement } from './houseElement';
import { positionRoofDecorations, randomRoofDecorationPosition, RoofDecorations, testDot } from './roofDecorations';
import * as TYPES from '../../types/typeIndex';
import { calcUVS } from '../config/3dUtils';
import { getRoofMaterials } from '../textures/materials';



class Roof extends HouseElement{
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

        const pitchFrontHeight: number = roofPitchLength + ROOF_WALL_THICKNESS + this.overhang;
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

        const roofWidth: number = houseWidth + (leftHouse+rightHouse)*ROOF_OVERHANG_SIDES;

        const moveYFront: number = (pitchFrontHeight / 2) - this.overhang;
        const roofPitchFront: THREE.BoxGeometry = new THREE.BoxGeometry(roofWidth, pitchFrontHeight, ROOF_WALL_THICKNESS);
        const roofPitchFrontMesh: THREE.Mesh = new THREE.Mesh(roofPitchFront, roofMaterial);
        roofPitchFrontMesh.castShadow = true;
        roofPitchFrontMesh.receiveShadow = true; 
        roofPitchFrontMesh.userData.shader = roofMaterialMix.shaderMaterial;
        if(leftHouse + rightHouse == 1){
            roofPitchFrontMesh.translateX((rightHouse - leftHouse)*(ROOF_OVERHANG_SIDES/2));
        }
        roofPitchFrontMesh.translateZ(houseDepth/2);
        roofPitchFrontMesh.rotateX(-roofAngle);
        roofPitchFrontMesh.translateY(moveYFront);
        roofPitchFrontMesh.translateZ(ROOF_WALL_THICKNESS/2);

        const pitchBackHeight: number = roofPitchLength + this.overhang;
        const moveYBack: number = (pitchBackHeight / 2) - this.overhang;
        const roofPitchBack: THREE.BoxGeometry = new THREE.BoxGeometry(roofWidth, pitchFrontHeight, ROOF_WALL_THICKNESS);
        const roofPitchBackMesh: THREE.Mesh = new THREE.Mesh(roofPitchBack, roofMaterial);
        roofPitchBackMesh.castShadow = true;
        roofPitchBackMesh.receiveShadow = true;
        roofPitchBackMesh.userData.shader = roofMaterialMix.shaderMaterial;
        if(leftHouse + rightHouse == 1){
            roofPitchBackMesh.translateX((rightHouse - leftHouse)*(ROOF_OVERHANG_SIDES/2));
        }
        roofPitchBackMesh.translateZ(-houseDepth/2);
        roofPitchBackMesh.rotateX(roofAngle);
        roofPitchBackMesh.translateY(moveYBack);
        roofPitchBackMesh.translateZ(-ROOF_WALL_THICKNESS/2);

        calcUVS(roofPitchFrontMesh.geometry);
        calcUVS(roofPitchBackMesh.geometry);
        roofGroup.add(roofPitchFrontMesh);
        roofGroup.add(roofPitchBackMesh);

        const roofGutter: THREE.Group = roofGutterGenerator(roofWidth, houseWidth, houseHeight, leftHouse, rightHouse);
        
        roofGutter.translateZ(houseDepth/2);
        roofGutter.rotateY(-roofAngle);
        roofGutter.translateX(this.overhang);
        roofGutter.translateZ(ROOF_WALL_THICKNESS);
        roofGutter.rotateY(roofAngle);
        roofGutter.translateZ(1);
        if(leftHouse + rightHouse == 1){
            roofGutter.translateY((rightHouse - leftHouse)*(ROOF_OVERHANG_SIDES/2));
        }
        roofGroup.add(roofGutter);

        if(randomBoolean(ANTENNA_PROBABILITY)){
            const antenna = terrestrialAntennaGenerator();
            const antennaObject = antenna.get3DObject();
            antennaObject.position.y += this.roofHeight;

            const maxAntennaOffset = roofWidth - antenna.radius * 2;
            const antennaOffset = maxAntennaOffset / 2 - randomInRangeInt(0, maxAntennaOffset);
            antennaObject.position.x = antennaOffset;
            roofGroup.add(antennaObject);
        }

        let roofDecoration: RoofDecorations[] = [];

        if(randomBoolean(SATELLITE_RECEIVER_PROBABILITY)){
            const amnt = randomInRangeInt(1, MAX_SATELLITE_RECEIVERS);

            for(let i = 0; i < amnt; i++){
                const bowl = antennaGenerator();
                //houseDepth/4 makes the antennas only spawn on the upper half of the front roof pitch
                roofDecoration = randomRoofDecorationPosition(roofWidth, houseDepth/2 * ANTENNA_ROOF_POSITION_FROM_TOP, angleToRad(90) - roofAngle, roofDecoration, bowl);
            }
        }

        const roofDecorationsGroup = positionRoofDecorations(roofDecoration, new THREE.Vector3(0, this.roofHeight + ROOF_WALL_THICKNESS, 0));
        
        roofGroup.add(roofDecorationsGroup);
        return roofGroup;
    }
}

export function roofGenerator(houseDepth: number, houseWidth: number, houseMaterial: TYPES.MaterialMix, leftHouse: number, rightHouse: number, houseHeight: number): THREE.Group {
    const roofHeight: number =  randomInRangeInt(MIN_ROOF_HEIGHT, MAX_ROOF_HEIGHT);
    const roofOverhang: number = randomInRangeInt(MIN_ROOF_OVERHANG, MAX_ROOF_OVERHANG);
    //const roofColor: string =  adjustColor("#8e8e8e", 20);

    const roof = new Roof(roofHeight, roofOverhang);
    
    return roof.get3DObject(houseDepth, houseWidth, houseMaterial, leftHouse, rightHouse, houseHeight);
}
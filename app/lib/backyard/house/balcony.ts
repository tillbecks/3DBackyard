import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

import * as TYPES from '@/app/types/typeIndex';
import * as HC from '@/app/lib/config/houseConfig';
import { BALCONY_DEPTH, BALCONY_PLATFORM_THICKNESS, BALCONY_START_BOTTOM, BALCONY_RAILING_DIAMETER_MAIN, BALCONY_RAILING_DIAMETER_SECONDARY, BALCONY_RAILING_HEIGHT, BALCONY_RAILING_DIST_EDGE, BALCONY_RAILING_LOWER_HORIZONTAL_DISTANCE, BALCONY_RAILING_SECONDARY_DISTANCE, BALCONY_RAILING_TYPES } from '@/app/lib/config/houseConfig';
import { randomFromObject, randomInRangeFloat } from '@/app/lib/config/utils';
import { materialShaderConfigs } from '@/app/lib/materials/materials';

class Balcony{
    balconyPositionX: number;
    balconySpace: {left: number, right: number};
    balconyWidth: number;

    constructor(balconyPositionX: number, balconySpace: {left: number, right: number}){
        this.balconyWidth = balconySpace.left + balconySpace.right;
        this.balconyPositionX = balconyPositionX + (balconySpace.right - balconySpace.left)/2;
        this.balconySpace = balconySpace;

    }

    get3DObject(storyCount: number, storyHeight: number, houseDepth: number){
        const balconies: THREE.Group = new THREE.Group();
        const railingGeometries: THREE.BufferGeometry[] = [];
        const balconyGeometries: THREE.BufferGeometry[] = [];

        const railingType: string = randomFromObject(BALCONY_RAILING_TYPES);

        for (let story=0; story<storyCount; story++){

            const balconyTranslation = new THREE.Vector3(this.balconyPositionX, story*storyHeight + storyHeight * BALCONY_START_BOTTOM - (storyCount*storyHeight)/2, houseDepth/2 + BALCONY_DEPTH/2);

            const balconyGeometry: THREE.BoxGeometry = new THREE.BoxGeometry(this.balconyWidth, BALCONY_PLATFORM_THICKNESS, BALCONY_DEPTH);

            const railing: THREE.BufferGeometry = balconyRailingGenerator(this.balconyWidth, storyHeight, story == storyCount - 1, railingType);
            railing.translate(balconyTranslation.x, BALCONY_PLATFORM_THICKNESS/2 + BALCONY_RAILING_HEIGHT/2 + balconyTranslation.y, balconyTranslation.z);
            railingGeometries.push(railing);

            balconyGeometry.translate(balconyTranslation.x, balconyTranslation.y, balconyTranslation.z);
            balconyGeometries.push(balconyGeometry);
        }

        const mergedRailingGeometry = BufferGeometryUtils.mergeGeometries(railingGeometries);
        const railingMaterialMix = materialShaderConfigs.BALCONY_RAILING_MATERIAL();
        const mergedRailingMesh = new THREE.Mesh(mergedRailingGeometry);
        mergedRailingMesh.userData.materialConfig = railingMaterialMix;

        const mergedBalconyGeometry = BufferGeometryUtils.mergeGeometries(balconyGeometries);
        const balconyMaterialMix = materialShaderConfigs.BALCONY_FLOOR_MATERIAL();
        const mergedBalconyMesh = new THREE.Mesh(mergedBalconyGeometry);
        mergedBalconyMesh.userData.materialConfig = balconyMaterialMix;

        balconies.add(mergedRailingMesh);
        balconies.add(mergedBalconyMesh);

        return balconies;
    }

}

export function balconyGenerator(windowPositions: TYPES.WindowPositions, storyCount: number, storyHeight: number, houseDepth: number, houseWidth: number): THREE.Group {
    const balconySpace = calcBalconyPosition(windowPositions, houseWidth);
    const minSpace = windowPositions.windowWidth/2 + HC.BALCONY_MIN_EXTRA_WIDTH
    const leftMax = Math.max(balconySpace.left, minSpace);
    const left = randomInRangeFloat(minSpace, leftMax);
    
    const rightMax = Math.max(balconySpace.right, minSpace);
    const right = randomInRangeFloat(minSpace, rightMax);

    const balconies: Balcony = new Balcony(windowPositions.balconyPositionX, {left: left, right: right});
    return balconies.get3DObject( storyCount, storyHeight, houseDepth);
}

function calcBalconyPosition(windowPositions: TYPES.WindowPositions, houseWidth: number){
    let spaceLeft = 0;
    let spaceRight = 0;
    let balconyIndex = windowPositions.windowsX.indexOf(windowPositions.balconyPositionX);
    const halfWindowSize = windowPositions.windowWidth/2;
    if(balconyIndex != -1){
        if(balconyIndex == 0){
            spaceLeft =   - houseWidth / 2 - windowPositions.balconyPositionX - HC.BALCONY_DIST_OTHER_WINDOWS;
        } 
        else{
            spaceLeft = windowPositions.windowsX[balconyIndex-1] - windowPositions.balconyPositionX - windowPositions.windowWidth/2 - HC.BALCONY_DIST_OTHER_WINDOWS;
        }

        if(balconyIndex == windowPositions.windowsX.length - 1){
            if(windowPositions.type === HC.WINDOW_SPACING_SCHEME.EQUALLY_SPACED){
                spaceRight = houseWidth / 2 - windowPositions.balconyPositionX - HC.BALCONY_DIST_OTHER_WINDOWS;
            }
            else{
                spaceRight = windowPositions.stairX - windowPositions.balconyPositionX  - halfWindowSize - HC.BALCONY_DIST_OTHER_WINDOWS;
            }
        }
        else{
            spaceRight = windowPositions.windowsX[balconyIndex+1] - windowPositions.balconyPositionX - halfWindowSize - HC.BALCONY_DIST_OTHER_WINDOWS;
        }
    }

    balconyIndex = windowPositions.windowsRightX.indexOf(windowPositions.balconyPositionX);
    if(balconyIndex != -1){
        if(balconyIndex == 0){
            spaceLeft =  windowPositions.balconyPositionX - windowPositions.stairX - halfWindowSize - HC.BALCONY_DIST_OTHER_WINDOWS;
        }else{
            spaceLeft = windowPositions.balconyPositionX - windowPositions.windowsRightX[balconyIndex-1] - halfWindowSize - HC.BALCONY_DIST_OTHER_WINDOWS;
        }

        if(balconyIndex == windowPositions.windowsRightX.length - 1){
            spaceRight = houseWidth / 2 - windowPositions.balconyPositionX - HC.BALCONY_DIST_OTHER_WINDOWS;
        }
        else{
            spaceRight = windowPositions.windowsRightX[balconyIndex+1] - windowPositions.balconyPositionX - halfWindowSize - HC.BALCONY_DIST_OTHER_WINDOWS;
        }
    }

    return {left: spaceLeft, right: spaceRight};
}

class BalconyRailings{
    railingType: string;

    constructor(railingType: string){
        this.railingType = railingType;
    }

    get3DObject(balconyWidth: number, storyHeight: number, topStory: boolean): THREE.BufferGeometry{
        const railingBufferGeometries: THREE.BufferGeometry[] = [];

        const mainPillarLength = this.railingType == BALCONY_RAILING_TYPES.CONNECTED && !topStory ? storyHeight-BALCONY_PLATFORM_THICKNESS : BALCONY_RAILING_HEIGHT;
        const mainPillarY = this.railingType == BALCONY_RAILING_TYPES.CONNECTED && !topStory ? storyHeight/2 - BALCONY_RAILING_HEIGHT/2 - BALCONY_PLATFORM_THICKNESS/2 : 0;
        //Railing main pillars
        const pillarGeometry: THREE.CylinderGeometry = new THREE.CylinderGeometry(BALCONY_RAILING_DIAMETER_MAIN/2, BALCONY_RAILING_DIAMETER_MAIN/2, mainPillarLength, 8, 1, false);
        pillarGeometry.translate(-balconyWidth/2+BALCONY_RAILING_DIST_EDGE, mainPillarY, BALCONY_DEPTH/2 - BALCONY_RAILING_DIST_EDGE);
        railingBufferGeometries.push(pillarGeometry);

        const pillar2Geometry: THREE.CylinderGeometry = new THREE.CylinderGeometry(BALCONY_RAILING_DIAMETER_MAIN/2, BALCONY_RAILING_DIAMETER_MAIN/2, mainPillarLength, 8, 1, false);
        pillar2Geometry.translate(balconyWidth/2-BALCONY_RAILING_DIST_EDGE, mainPillarY, BALCONY_DEPTH/2 - BALCONY_RAILING_DIST_EDGE);
        railingBufferGeometries.push(pillar2Geometry);


        const lowerHorizontalHeightShift: number = BALCONY_RAILING_HEIGHT/2 - BALCONY_RAILING_LOWER_HORIZONTAL_DISTANCE - BALCONY_RAILING_DIAMETER_MAIN;
        const mainHorizontalLength: number = balconyWidth - 2*BALCONY_RAILING_DIST_EDGE;
        const wallHorizontalLength: number = BALCONY_DEPTH - BALCONY_RAILING_DIST_EDGE;
        
        //Railing main horizontals
        const railingHorizontalGeometry: THREE.CylinderGeometry = new THREE.CylinderGeometry(BALCONY_RAILING_DIAMETER_MAIN/2, BALCONY_RAILING_DIAMETER_MAIN/2, mainHorizontalLength, 8, 1, false);
        railingHorizontalGeometry.rotateZ(Math.PI/2);
        railingHorizontalGeometry.translate(0, 0, BALCONY_DEPTH/2 - BALCONY_RAILING_DIST_EDGE);
        //const railingHorizontal: THREE.Mesh = new THREE.Mesh(railingHorizontalGeometry, balconyMaterial);
        const railingUpperHorizontalGeometry: THREE.CylinderGeometry = railingHorizontalGeometry.clone();
        railingUpperHorizontalGeometry.translate(0, BALCONY_RAILING_HEIGHT/2 - BALCONY_RAILING_DIAMETER_MAIN/2, 0);
        railingBufferGeometries.push(railingUpperHorizontalGeometry);

        const railingLowerHorizontalGeometry: THREE.CylinderGeometry = railingHorizontalGeometry.clone(); //Maybe problematisch, da Position und Rotation übernommen werden
        railingLowerHorizontalGeometry.translate(0, -lowerHorizontalHeightShift, 0);
        railingBufferGeometries.push(railingLowerHorizontalGeometry);

        const railingHorizontalGeometryWall: THREE.CylinderGeometry = new THREE.CylinderGeometry(BALCONY_RAILING_DIAMETER_MAIN/2, BALCONY_RAILING_DIAMETER_MAIN/2, wallHorizontalLength, 8, 1, false);
        railingHorizontalGeometryWall.rotateX(Math.PI/2);
        railingHorizontalGeometryWall.translate(-balconyWidth/2 + BALCONY_RAILING_DIST_EDGE, 0, - BALCONY_RAILING_DIST_EDGE/2);
        const railingUpperHorizontalWall1Geometry: THREE.CylinderGeometry = railingHorizontalGeometryWall.clone();
        railingUpperHorizontalWall1Geometry.translate(0, BALCONY_RAILING_HEIGHT/2 - BALCONY_RAILING_DIAMETER_MAIN/2, 0);
        railingBufferGeometries.push(railingUpperHorizontalWall1Geometry);

        const railingLowerHorizontalWall1Geometry: THREE.CylinderGeometry = railingHorizontalGeometryWall.clone();
        railingLowerHorizontalWall1Geometry.translate(0, -lowerHorizontalHeightShift, 0);
        railingBufferGeometries.push(railingLowerHorizontalWall1Geometry);

        const railingHorizontalWall2Geometry: THREE.CylinderGeometry = railingHorizontalGeometryWall.clone();
        railingHorizontalWall2Geometry.translate(balconyWidth - 2* BALCONY_RAILING_DIST_EDGE, 0, - BALCONY_RAILING_DIST_EDGE/2);
        const railingUpperHorizontalWall2Geometry: THREE.CylinderGeometry = railingHorizontalWall2Geometry.clone();
        railingUpperHorizontalWall2Geometry.translate(0, BALCONY_RAILING_HEIGHT/2 - BALCONY_RAILING_DIAMETER_MAIN/2, 0);
        railingBufferGeometries.push(railingUpperHorizontalWall2Geometry);

        const railingLowerHorizontalWall2Geometry: THREE.CylinderGeometry = railingHorizontalWall2Geometry.clone();
        railingLowerHorizontalWall2Geometry.translate(0, -lowerHorizontalHeightShift, 0);
        railingBufferGeometries.push(railingLowerHorizontalWall2Geometry);

        const secondaryPillarGeometry: THREE.CylinderGeometry = new THREE.CylinderGeometry(BALCONY_RAILING_DIAMETER_SECONDARY/2, BALCONY_RAILING_DIAMETER_SECONDARY/2, BALCONY_RAILING_HEIGHT - BALCONY_RAILING_LOWER_HORIZONTAL_DISTANCE - BALCONY_RAILING_DIAMETER_MAIN, 8, 1, false);
        secondaryPillarGeometry.translate(0, BALCONY_RAILING_LOWER_HORIZONTAL_DISTANCE - BALCONY_RAILING_DIAMETER_MAIN/2, 0);

        const mainVerticalSecondaryPillars: number = Math.floor(mainHorizontalLength / BALCONY_RAILING_SECONDARY_DISTANCE);
        const wallVerticalSecondaryPillars: number = Math.floor(wallHorizontalLength / BALCONY_RAILING_SECONDARY_DISTANCE);

        const mainXRealDistance: number = mainHorizontalLength / (mainVerticalSecondaryPillars + 1);
        const wallXRealDistance: number = wallHorizontalLength / (wallVerticalSecondaryPillars + 1);
        const mainXStart: number = -balconyWidth/2 + BALCONY_RAILING_DIST_EDGE + mainXRealDistance + BALCONY_RAILING_DIAMETER_MAIN;
        const wallXStart: number = -BALCONY_DEPTH/2 + wallXRealDistance;

        for(let i=0; i<mainVerticalSecondaryPillars; i++){
            const secondaryPillar: THREE.CylinderGeometry = secondaryPillarGeometry.clone();
            secondaryPillar.translate(mainXStart + i*mainXRealDistance, 0, BALCONY_DEPTH/2 - BALCONY_RAILING_DIST_EDGE);
            railingBufferGeometries.push(secondaryPillar);
        }

        for(let i=0; i<wallVerticalSecondaryPillars; i++){
            const secondaryPillarWall1: THREE.CylinderGeometry = secondaryPillarGeometry.clone();
            secondaryPillarWall1.translate(-balconyWidth/2 + BALCONY_RAILING_DIST_EDGE, 0, wallXStart + i*wallXRealDistance);
            railingBufferGeometries.push(secondaryPillarWall1);

            const secondaryPillarWall2: THREE.CylinderGeometry = secondaryPillarGeometry.clone();
            secondaryPillarWall2.translate(balconyWidth/2 - BALCONY_RAILING_DIST_EDGE, 0, wallXStart + i*wallXRealDistance);
            railingBufferGeometries.push(secondaryPillarWall2);
        }

        const railingGeometry = BufferGeometryUtils.mergeGeometries(railingBufferGeometries);

        return railingGeometry;
    }
}

export function balconyRailingGenerator(balconyWidth: number, storyHeight: number, topStory: boolean, balconyType: string): THREE.BufferGeometry {
    const balconyRailings = new BalconyRailings(balconyType);
    return balconyRailings.get3DObject(balconyWidth, storyHeight, topStory);
}
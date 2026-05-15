import * as THREE from 'three';
import { BALCONY_DEPTH, BALCONY_PLATFORM_THICKNESS, BALCONY_START_BOTTOM, BALCONY_WIDTH_MAX, BALCONY_WIDTH_MIN, BALCONY_MIN_OFFSET_FROM_CENTER, METAL_COLOR_HEX, BALCONY_RAILING_DIAMETER_MAIN, BALCONY_RAILING_DIAMETER_SECONDARY, BALCONY_RAILING_HEIGHT, BALCONY_RAILING_DIST_EDGE, BALCONY_RAILING_LOWER_HORIZONTAL_DISTANCE, BALCONY_RAILING_SECONDARY_DISTANCE, BALCONY_RAILING_TYPES } from '../config/houseConfig';
import { randomInRangeInt, randomFromObject } from '../config/utils';

class Balcony{
    balconyWidth: number;

    constructor(balconyWidth: number){
        this.balconyWidth = balconyWidth;
    }

    get3DObject(balconyPosition: number, storyCount: number, storyHeight: number, houseDepth: number, balconySpace: {left: number, right: number}){
        const balconies: THREE.Group = new THREE.Group();

        const totalSpace = balconySpace.left + balconySpace.right;
        const positionX = ((balconySpace.right - balconySpace.left) / totalSpace) * this.balconyWidth / 2;
        

        const railingType: string = randomFromObject(BALCONY_RAILING_TYPES);

        for (let story=0; story<storyCount; story++){
            const singleBalconyGroup: THREE.Group = new THREE.Group();

            const balconyGeometry: THREE.BoxGeometry = new THREE.BoxGeometry(this.balconyWidth, BALCONY_PLATFORM_THICKNESS, BALCONY_DEPTH);
            const balconyMaterial: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({color: 0x606060});
            const balconyMesh: THREE.Mesh = new THREE.Mesh(balconyGeometry, balconyMaterial);
            balconyMesh.castShadow = true;
            balconyMesh.receiveShadow = true;

            singleBalconyGroup.add(balconyMesh);
            const railing: THREE.Group = balconyRailingGenerator(this.balconyWidth, storyHeight, story == storyCount - 1, railingType);
            railing.position.y = BALCONY_PLATFORM_THICKNESS/2 + BALCONY_RAILING_HEIGHT/2;
            singleBalconyGroup.add(railing);

            singleBalconyGroup.position.set(positionX, story*storyHeight + storyHeight * BALCONY_START_BOTTOM + BALCONY_PLATFORM_THICKNESS/2 - (storyCount*storyHeight)/2, houseDepth/2 + BALCONY_DEPTH/2)

            balconies.add(singleBalconyGroup);
        }

        balconies.position.x = balconyPosition;
        return balconies;
    }

}

export function balconyGenerator(balconyPosition: number, storyCount: number, storyHeight: number, houseDepth: number, balconySpace: {left: number, right: number}): THREE.Group {
    const maxWidth = Math.min(BALCONY_WIDTH_MAX, balconySpace.left+balconySpace.right);
    const minWidth = Math.min(BALCONY_WIDTH_MIN, maxWidth);
    const balconyWidth: number = randomInRangeInt(minWidth, maxWidth);
    const balconies: Balcony = new Balcony(balconyWidth);
    return balconies.get3DObject(balconyPosition, storyCount, storyHeight, houseDepth, balconySpace);
}

class BalconyRailings{
    railingType: string;

    constructor(railingType: string){
        this.railingType = railingType;
    }

    get3DObject(balconyWidth: number, storyHeight: number, topStory: boolean): THREE.Group{
        const balconyMaterial: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({color: METAL_COLOR_HEX});
        const railingGroup: THREE.Group = new THREE.Group();

        const mainPillarLength = this.railingType == BALCONY_RAILING_TYPES.CONNECTED && !topStory ? storyHeight-BALCONY_PLATFORM_THICKNESS : BALCONY_RAILING_HEIGHT;
        const mainPillarY = this.railingType == BALCONY_RAILING_TYPES.CONNECTED && !topStory ? storyHeight/2 - BALCONY_RAILING_HEIGHT/2 - BALCONY_PLATFORM_THICKNESS/2 : 0;
        //Railing main pillars
        const pillarGeometry: THREE.CylinderGeometry = new THREE.CylinderGeometry(BALCONY_RAILING_DIAMETER_MAIN/2, BALCONY_RAILING_DIAMETER_MAIN/2, mainPillarLength, 16, 1, false);
        const pillar1: THREE.Mesh = new THREE.Mesh(pillarGeometry, balconyMaterial);
        pillar1.position.set(-balconyWidth/2+BALCONY_RAILING_DIST_EDGE, mainPillarY, BALCONY_DEPTH/2 - BALCONY_RAILING_DIST_EDGE);
        pillar1.castShadow = true;
        pillar1.receiveShadow = true;
        railingGroup.add(pillar1);

        const pillar2: THREE.Mesh = new THREE.Mesh(pillarGeometry, balconyMaterial);
        pillar2.position.set(balconyWidth/2-BALCONY_RAILING_DIST_EDGE, mainPillarY, BALCONY_DEPTH/2 - BALCONY_RAILING_DIST_EDGE);
        pillar2.castShadow = true;
        pillar2.receiveShadow = true;
        railingGroup.add(pillar2);

        const lowerHorizontalHeightShift: number = BALCONY_RAILING_HEIGHT/2 - BALCONY_RAILING_LOWER_HORIZONTAL_DISTANCE - BALCONY_RAILING_DIAMETER_MAIN;
        const mainHorizontalLength: number = balconyWidth - 2*BALCONY_RAILING_DIST_EDGE;
        const wallHorizontalLength: number = BALCONY_DEPTH - BALCONY_RAILING_DIST_EDGE;
        
        //Railing main horizontals
        const railingHorizontalGeometry: THREE.CylinderGeometry = new THREE.CylinderGeometry(BALCONY_RAILING_DIAMETER_MAIN/2, BALCONY_RAILING_DIAMETER_MAIN/2, mainHorizontalLength, 16, 1, false);
        const railingHorizontal: THREE.Mesh = new THREE.Mesh(railingHorizontalGeometry, balconyMaterial);
        railingHorizontal.position.set(0, BALCONY_RAILING_HEIGHT/2 - BALCONY_RAILING_DIAMETER_MAIN/2, BALCONY_DEPTH/2 - BALCONY_RAILING_DIST_EDGE);
        railingHorizontal.rotateZ(Math.PI/2);
        railingHorizontal.castShadow = true;
        railingHorizontal.receiveShadow = true;
        railingGroup.add(railingHorizontal);
        const railingLowerHorizontal: THREE.Mesh = railingHorizontal.clone();
        railingLowerHorizontal.position.setY(-lowerHorizontalHeightShift);
        railingLowerHorizontal.castShadow = true;
        railingLowerHorizontal.receiveShadow = true;
        railingGroup.add(railingLowerHorizontal);

        const railingHorizontalGeometryWall: THREE.CylinderGeometry = new THREE.CylinderGeometry(BALCONY_RAILING_DIAMETER_MAIN/2, BALCONY_RAILING_DIAMETER_MAIN/2, wallHorizontalLength, 16, 1, false);
        const railingHorizontalWall1: THREE.Mesh = new THREE.Mesh(railingHorizontalGeometryWall, balconyMaterial);
        railingHorizontalWall1.position.set(-balconyWidth/2 + BALCONY_RAILING_DIST_EDGE, BALCONY_RAILING_HEIGHT/2 - BALCONY_RAILING_DIAMETER_MAIN/2, - BALCONY_RAILING_DIST_EDGE/2);
        railingHorizontalWall1.rotateZ(Math.PI/2);
        railingHorizontalWall1.rotateX(Math.PI/2);
        railingHorizontalWall1.castShadow = true;
        railingHorizontalWall1.receiveShadow = true;
        railingGroup.add(railingHorizontalWall1);
        const railingLowerHorizontalWall1: THREE.Mesh = railingHorizontalWall1.clone();
        railingLowerHorizontalWall1.position.setY(-lowerHorizontalHeightShift);
        railingLowerHorizontalWall1.castShadow = true;
        railingLowerHorizontalWall1.receiveShadow = true;
        railingGroup.add(railingLowerHorizontalWall1);

        const railingHorizontalWall2: THREE.Mesh = new THREE.Mesh(railingHorizontalGeometryWall, balconyMaterial);
        railingHorizontalWall2.position.set(balconyWidth/2 - BALCONY_RAILING_DIST_EDGE, BALCONY_RAILING_HEIGHT/2 - BALCONY_RAILING_DIAMETER_MAIN/2, - BALCONY_RAILING_DIST_EDGE/2);
        railingHorizontalWall2.rotateZ(Math.PI/2);
        railingHorizontalWall2.rotateX(Math.PI/2);
        railingHorizontalWall2.castShadow = true;
        railingHorizontalWall2.receiveShadow = true;
        railingGroup.add(railingHorizontalWall2);
        const railingLowerHorizontalWall2: THREE.Mesh = railingHorizontalWall2.clone();
        railingLowerHorizontalWall2.position.setY(-lowerHorizontalHeightShift);
        railingLowerHorizontalWall2.castShadow = true;
        railingLowerHorizontalWall2.receiveShadow = true;
        railingGroup.add(railingLowerHorizontalWall2);

        const secondaryPillarGeometry: THREE.CylinderGeometry = new THREE.CylinderGeometry(BALCONY_RAILING_DIAMETER_SECONDARY/2, BALCONY_RAILING_DIAMETER_SECONDARY/2, BALCONY_RAILING_HEIGHT - BALCONY_RAILING_LOWER_HORIZONTAL_DISTANCE - BALCONY_RAILING_DIAMETER_MAIN, 16, 1, false);
        const standardSecondaryPillar: THREE.Mesh = new THREE.Mesh(secondaryPillarGeometry, balconyMaterial);
        standardSecondaryPillar.castShadow = true;
        standardSecondaryPillar.receiveShadow = true;
        standardSecondaryPillar.position.setY(BALCONY_RAILING_LOWER_HORIZONTAL_DISTANCE - BALCONY_RAILING_DIAMETER_MAIN/2);

        const mainVerticalSecondaryPillars: number = Math.floor(mainHorizontalLength / BALCONY_RAILING_SECONDARY_DISTANCE);
        const wallVerticalSecondaryPillars: number = Math.floor(wallHorizontalLength / BALCONY_RAILING_SECONDARY_DISTANCE);

        const mainXRealDistance: number = mainHorizontalLength / (mainVerticalSecondaryPillars + 1);
        const wallXRealDistance: number = wallHorizontalLength / (wallVerticalSecondaryPillars + 1);
        const mainXStart: number = -balconyWidth/2 + BALCONY_RAILING_DIST_EDGE + mainXRealDistance + BALCONY_RAILING_DIAMETER_MAIN;
        const wallXStart: number = -BALCONY_DEPTH/2 + wallXRealDistance;

        for(let i=0; i<mainVerticalSecondaryPillars; i++){
            const secondaryPillar: THREE.Mesh = standardSecondaryPillar.clone();
            secondaryPillar.position.setX(mainXStart + i*mainXRealDistance);
            secondaryPillar.position.setZ(BALCONY_DEPTH/2 - BALCONY_RAILING_DIST_EDGE);
            railingGroup.add(secondaryPillar);
        }

        for(let i=0; i<wallVerticalSecondaryPillars; i++){
            const secondaryPillarWall1: THREE.Mesh = standardSecondaryPillar.clone();
            secondaryPillarWall1.position.setX(-balconyWidth/2 + BALCONY_RAILING_DIST_EDGE);
            secondaryPillarWall1.position.setZ(wallXStart + i*wallXRealDistance);
            railingGroup.add(secondaryPillarWall1);

            const secondaryPillarWall2: THREE.Mesh = standardSecondaryPillar.clone();
            secondaryPillarWall2.position.setX(balconyWidth/2 - BALCONY_RAILING_DIST_EDGE);
            secondaryPillarWall2.position.setZ(wallXStart + i*wallXRealDistance);
            railingGroup.add(secondaryPillarWall2);
        }

        return railingGroup;
    }
}

export function balconyRailingGenerator(balconyWidth: number, storyHeight: number, topStory: boolean, balconyType: string): THREE.Group {
    const balconyRailings = new BalconyRailings(balconyType);
    return balconyRailings.get3DObject(balconyWidth, storyHeight, topStory);
}
import * as THREE from 'three';

import * as TYPES from '@/app/types/typeIndex';

import * as BYCONFIG from "@/app/lib/config/backyardConfig";
import { randomBoolean, randomFromArray, randomInRangeInt } from "@/app/lib/config/utils";
import { calcUVS } from '../config/3dUtils';
import { getWallMaterial } from '../materials/materials';
import {Tree} from './trees';
import {DecorationsPlacer} from '../config/decorations';

//Following Structure:

//      hn0     hn1     hn2     hn3 
// hw2  gn0w2   gn1     gn2     gn3e0   he0
// hw1  gw1     gn1s1w1 gn2s1e1 ge1     he1
// hw0  gs3w0   gs1     gs1     gs0e2   he2
//      hs3     hs2     hs1     hs0
export class YardWalls{
    partitionId: number;
    widthN: number[];
    widthE: number[];
    widthS: number[];
    widthW: number[];
    yardPartitioning: (number | null)[][];
    wallPositioning: TYPES.YardWallDescription[];
    treePositioner: {placer: DecorationsPlacer, center: THREE.Vector3}[];
    yards: TYPES.YardDescription[];
    yardWidth: number;
    yardDepth: number;

    constructor(widthN: number[], widthE: number[], widthS: number[], widthW: number[], width: number, depth: number){
        this.partitionId = 0;
        this.widthN = widthN;
        this.widthE = widthE;
        this.widthS = widthS;
        this.widthW = widthW;
        this.yardWidth = width;
        this.yardDepth = depth;
        this.yardPartitioning = yardPartitioning(widthN, widthE, widthS, widthW, this.getId.bind(this)) as (number | null)[][];
        [this.wallPositioning, this.yards] = callPlotWallGenerationForPartitioning(this.yardPartitioning, this.widthN, this.widthE, this.widthS, this.widthW, this.yardWidth, this.yardDepth);
        this.treePositioner = [];

        const centerXIndices = this.yardPartitioning[0].length % 2 === 0 ? [this.yardPartitioning[0].length / 2 - 1, this.yardPartitioning[0].length / 2] : [Math.floor(this.yardPartitioning[0].length / 2)];
        const centerIds: (number|null)[] = [];

        for(let i = 0; i < this.yardPartitioning.length; i++){
            for(const centerXIndex of centerXIndices){
                centerIds.push(this.yardPartitioning[i][centerXIndex]);
            }
        }

        for(const yard of this.yards){
            this.treePositioner.push({placer: positionTreesOnYard(centerIds.indexOf(yard.plotId) !== -1 ? BYCONFIG.CENTER_TREE_CONFIGS : BYCONFIG.SIDE_YARD_TREE_CONFIGS, yard), center: new THREE.Vector3(yard.xCenter, 0, yard.zCenter)});
        }
    }

    get3DObject(): THREE.Group {
        const allGroup = new THREE.Group();

        const wallsGroup = new THREE.Group();  
        const materialMix = getWallMaterial();

        for(let i= 0; i < this.wallPositioning.length; i++){
            const wall = this.wallPositioning[i];
            const geometry = new THREE.BoxGeometry(wall.orientation === 0 ? BYCONFIG.WALL_DEPTH : Math.abs(wall.x2 - wall.x1), BYCONFIG.WALL_HEIGHT_MAX, wall.orientation === 1 ? BYCONFIG.WALL_DEPTH : Math.abs(wall.z2 - wall.z1));
            calcUVS(geometry);
            const standardMaterial = materialMix.standardMaterial.clone();
            const wallMesh = new THREE.Mesh(geometry, standardMaterial);
            wallMesh.userData.shader = materialMix.shaderMaterial;
            wallMesh.position.set(wall.x1 + (wall.x2 - wall.x1) / 2, BYCONFIG.WALL_HEIGHT_MAX / 2, wall.z1 + (wall.z2 - wall.z1) / 2);
            wallsGroup.add(wallMesh);
        
        }
        calcUVS(wallsGroup);
        allGroup.add(wallsGroup);

        const treeGroup = new THREE.Group();
        for(const treePositioner of this.treePositioner){
            const trees = treePositioner.placer.positionDecorations(treePositioner.center);
            treeGroup.add(trees);
        }
        allGroup.add(treeGroup);

        return allGroup;
    }

    getId(): number{
        return this.partitionId++;
    }
}

function positionTreesOnYard(treeConfigs: TYPES.YardTreeConfig[], yard: TYPES.YardDescription): DecorationsPlacer{
    const decorationsPlacer = new DecorationsPlacer(yard.width, yard.depth);
    if(yard.width < 0 || yard.depth < 0) return decorationsPlacer;

    for(const treeConfig of treeConfigs){
        const rotatedMinMaxCoords = rotateMinMaxCoordsToDirection(yard.direction, yard.corner ? treeConfig.cornerPositionBounds : treeConfig.positionBounds);
        const count = randomInRangeInt(treeConfig.countMin, treeConfig.countMax);
        if(!randomBoolean(treeConfig.probability)) continue;
        for(let i = 0; i < count; i++){
            const tree = new Tree(treeConfig.treeType, treeConfig.treeConfig, treeConfig.leafConfig);
            decorationsPlacer.addDecorationPosition(tree, rotatedMinMaxCoords.minX, rotatedMinMaxCoords.maxX, rotatedMinMaxCoords.minZ, rotatedMinMaxCoords.maxZ);
        }
    }

    return decorationsPlacer;
}

function rotateMinMaxCoordsToDirection(direction: 0 | 1 | 2 | 3, minMaxCoords: {minX: number, maxX: number, minZ: number, maxZ: number}): {minX: number, maxX: number, minZ: number, maxZ: number}{
    switch(direction){
        case BYCONFIG.PLOT_DIRECTIONS.FROM_EAST: return {minX: 1-minMaxCoords.maxZ, maxX: 1-minMaxCoords.minZ, minZ: minMaxCoords.minX, maxZ: minMaxCoords.maxX};
        case BYCONFIG.PLOT_DIRECTIONS.FROM_SOUTH: return {minX: 1-minMaxCoords.maxX, maxX: 1-minMaxCoords.minX, minZ: 1-minMaxCoords.maxZ, maxZ: 1-minMaxCoords.minZ};
        case BYCONFIG.PLOT_DIRECTIONS.FROM_WEST: return {minX: minMaxCoords.minZ, maxX: minMaxCoords.maxZ, minZ: 1-minMaxCoords.maxX, maxZ: 1-minMaxCoords.minX};        
        default: return minMaxCoords;
    }
}

function callPlotWallGenerationForPartitioning(partitioning: (number | null)[][], widthN: number[], widthE: number[], widthS: number[], widthW: number[], yardWidth: number, yardDepth: number): [TYPES.YardWallDescription[], TYPES.YardDescription[]]{
    const wallDescriptions: TYPES.YardWallDescription[] = [];
    const yardDescription: TYPES.YardDescription[] = [];

    let criticalIndicesI = partitioning.length % 2 === 0 ? [partitioning.length / 2 - 1, partitioning.length / 2] : [Math.floor(partitioning.length / 2)];
    let criticalIndicesJ = partitioning[0].length % 2 === 0 ? [partitioning[0].length / 2 - 1, partitioning[0].length / 2] : [Math.floor(partitioning[0].length / 2)];

    if(criticalIndicesI.length === 2 && criticalIndicesJ.length === 2){
        if(randomBoolean()) criticalIndicesI = [randomFromArray(criticalIndicesI)];
        else criticalIndicesJ = [randomFromArray(criticalIndicesJ)];
    }else{
        if(criticalIndicesI.length === 2) criticalIndicesI = [randomFromArray(criticalIndicesI)];
        else if(criticalIndicesJ.length === 2) criticalIndicesJ = [randomFromArray(criticalIndicesJ)];
    }
    
    const criticalIds: number[] = [];
    for(const i of criticalIndicesI){
        for(const j of criticalIndicesJ){
            const id = partitioning[i][j];
            if(id !== null && id !== undefined && !criticalIds.includes(id)){
                criticalIds.push(id);
            }
        }
    }
    
    for(let j = 0; j < partitioning[0].length; j++){
        //NorthPart
        let i = 0;
        let houseArrayIndex = j;
        let partition = partitioning[i][j];
        if(partition !== null){
            let lastPlotIndex = i;
            while(partitioning[lastPlotIndex+1][j] === partition){
                lastPlotIndex++;
            };
            const [thisWallDescriptions, thisYardDescription] = generatePlotWalls(widthN, widthE, widthS, widthW, yardWidth, yardDepth, houseArrayIndex, lastPlotIndex, BYCONFIG.PLOT_DIRECTIONS.FROM_NORTH, criticalIds.indexOf(partition) !== -1);
            wallDescriptions.push(...thisWallDescriptions);
            if(thisYardDescription !== null){
                thisYardDescription.plotId = partition;
                yardDescription.push(thisYardDescription);
            }
        }

        //SouthPart
        i = partitioning.length - 1;
        partition = partitioning[i][j];
        if(partition !== null){
            let lastPlotIndex = i;
            while(partitioning[lastPlotIndex-1][j] === partition){
                lastPlotIndex--;
            };
            const [thisWallDescriptions, thisYardDescription] = generatePlotWalls(widthN, widthE, widthS, widthW, yardWidth, yardDepth, houseArrayIndex, lastPlotIndex, BYCONFIG.PLOT_DIRECTIONS.FROM_SOUTH, criticalIds.indexOf(partition) !== -1);
            wallDescriptions.push(...thisWallDescriptions);
            if(thisYardDescription !== null){
                thisYardDescription.plotId = partition;
                yardDescription.push(thisYardDescription);
            }
        }
    }
    
    for(let i = 0; i < partitioning.length; i++){
        //EastPart
        let j = partitioning[0].length - 1;
        let houseArrayIndex = i;
        let partition = partitioning[i][j];
        if(partition !== null){
            let lastPlotIndex = j;
            while(partitioning[i][lastPlotIndex-1] === partition){
                lastPlotIndex--;
            }   
            const [thisWallDescriptions, thisYardDescription] = generatePlotWalls(widthN, widthE, widthS, widthW, yardWidth, yardDepth, houseArrayIndex, lastPlotIndex, BYCONFIG.PLOT_DIRECTIONS.FROM_EAST, criticalIds.indexOf(partition) !== -1);
            wallDescriptions.push(...thisWallDescriptions);
            if(thisYardDescription !== null) {
                thisYardDescription.plotId = partition;
                yardDescription.push(thisYardDescription);
            }
        }

        //WestPart
        j = 0;
        partition = partitioning[i][j];
        if(partition !== null){
            let lastPlotIndex = j;
            while(partitioning[i][lastPlotIndex+1] === partition){
                lastPlotIndex++;
            }
            const [thisWallDescriptions, thisYardDescription] = generatePlotWalls(widthN, widthE, widthS, widthW, yardWidth, yardDepth, houseArrayIndex, lastPlotIndex, BYCONFIG.PLOT_DIRECTIONS.FROM_WEST, criticalIds.indexOf(partition) !== -1);
            wallDescriptions.push(...thisWallDescriptions);
            if(thisYardDescription !== null){
                thisYardDescription.plotId = partition;
                yardDescription.push(thisYardDescription);
            }
        }

    }
    
    return [wallDescriptions, yardDescription];
}

//orientation: 0 = north to south, 1 = east to west
function generatePlotWalls(widthN: number[], widthE: number[], widthS: number[], widthW: number[], yardWidth: number, yardDepth: number, houseArrayIndex: number, lastPlotIndex: number, direction: 0 | 1 | 2 | 3, passiveBehavior: boolean = false): [TYPES.YardWallDescription[], TYPES.YardDescription | null]{
    const wallDescriptions: TYPES.YardWallDescription[] = [];
    let yardDescription: TYPES.YardDescription | null = {plotId: -1, width: 0, depth: 0, xCenter: 0, zCenter: 0, direction: direction, corner: false};
    if(direction == BYCONFIG.PLOT_DIRECTIONS.FROM_NORTH){
        if(widthN.length % 2 > 0 && houseArrayIndex === Math.floor(widthN.length / 2)){
            return [wallDescriptions, null];
        }

        const xCenter = calcCenterPosition(houseArrayIndex, widthN, yardWidth) ;
        const width = widthN[houseArrayIndex];
        const zStart = -yardDepth / 2 - BYCONFIG.WALL_EXTRA_TO_HOUSE;

        const westIndex = widthW.length - 1 - lastPlotIndex;
        const zEndW = - calcCenterPosition(westIndex, widthW, yardDepth) + widthW[westIndex] / 2;
        const zEndE = calcCenterPosition(lastPlotIndex, widthE, yardDepth) + widthE[lastPlotIndex] / 2;
        let passiveZEnd;
        let zEnd;
        let reallyCritical;
        if(houseArrayIndex >= widthN.length / 2){
            zEnd = zEndE;
            passiveZEnd = zEndW;

            reallyCritical = passiveBehavior && zEnd > passiveZEnd;
            wallDescriptions.push({x1: xCenter - width / 2, z1: zStart, x2: xCenter - width / 2, z2: (reallyCritical ? passiveZEnd : zEnd) + BYCONFIG.WALL_DEPTH/2, orientation: 0});
            if(houseArrayIndex !== widthN.length - 1 && !reallyCritical) wallDescriptions.push({x1: xCenter - width / 2, z1: zEnd, x2: xCenter + width / 2, z2: zEnd, orientation: 1});

        }else{
            zEnd = zEndW;
            passiveZEnd = zEndE;

            reallyCritical = passiveBehavior && zEnd > passiveZEnd;
            wallDescriptions.push({x1: xCenter + width / 2, z1: zStart, x2: xCenter + width / 2, z2: (reallyCritical ? passiveZEnd : zEnd) + BYCONFIG.WALL_DEPTH/2, orientation: 0});
            if(houseArrayIndex !== 0 && !reallyCritical) wallDescriptions.push({x1: xCenter - width / 2, z1: zEnd, x2: xCenter + width / 2, z2: zEnd, orientation: 1});
        }
        if(houseArrayIndex !== widthN.length - 1){
            const depth = (reallyCritical ? passiveZEnd : zEnd) - zStart - BYCONFIG.WALL_DEPTH * 2;
            yardDescription.xCenter = xCenter;
            yardDescription.depth = depth;
            yardDescription.zCenter = zStart + depth / 2 + BYCONFIG.WALL_DEPTH;
            yardDescription.width = width - BYCONFIG.WALL_DEPTH * 2;
            if(houseArrayIndex === 0) yardDescription.corner = true;
        }else{
            yardDescription = null;
        }
    }
    else if(direction == BYCONFIG.PLOT_DIRECTIONS.FROM_EAST){
        if(widthE.length % 2 > 0 && houseArrayIndex === Math.floor(widthE.length / 2)){
            return [wallDescriptions, null];
        }

        const zCenter = calcCenterPosition(houseArrayIndex, widthE, yardDepth);
        const depth = widthE[houseArrayIndex];
        const xStart = yardWidth / 2 + BYCONFIG.WALL_EXTRA_TO_HOUSE;

        let xEnd;
        let passiveXEnd;
        let reallyCritical;
        if(houseArrayIndex >= widthE.length / 2){
            const southIndex = widthS.length - 1 - lastPlotIndex;
            xEnd = - calcCenterPosition(southIndex, widthS, yardWidth) - widthS[southIndex] / 2;
            passiveXEnd = calcCenterPosition(lastPlotIndex, widthN, yardWidth) - widthN[lastPlotIndex] / 2;

            reallyCritical = passiveBehavior && xEnd < passiveXEnd;
            wallDescriptions.push({x1: xStart, z1: zCenter - depth / 2, x2: (reallyCritical ? passiveXEnd : xEnd) - BYCONFIG.WALL_DEPTH/2, z2: zCenter - depth / 2, orientation: 1});
            if(houseArrayIndex !== widthE.length - 1 && !reallyCritical) wallDescriptions.push({x1: xEnd, z1: zCenter - depth / 2, x2: xEnd, z2: zCenter + depth / 2, orientation: 0});
        }else{
            xEnd = calcCenterPosition(lastPlotIndex, widthN, yardWidth) - widthN[lastPlotIndex] / 2;
            passiveXEnd = - calcCenterPosition(widthS.length - 1 - lastPlotIndex, widthS, yardWidth) - widthS[widthS.length - 1 - lastPlotIndex] / 2;
            reallyCritical = passiveBehavior && xEnd < passiveXEnd;
            wallDescriptions.push({x1: xStart, z1: zCenter + depth / 2, x2: (reallyCritical ? passiveXEnd : xEnd) - BYCONFIG.WALL_DEPTH/2, z2: zCenter + depth / 2, orientation: 1});
            if(houseArrayIndex !== 0 && !reallyCritical) wallDescriptions.push({x1: xEnd, z1: zCenter - depth / 2, x2: xEnd, z2: zCenter + depth / 2, orientation: 0});
        }
        if(houseArrayIndex !== widthE.length - 1){
            const width = xStart - (reallyCritical ? passiveXEnd : xEnd) - BYCONFIG.WALL_DEPTH * 2;
            yardDescription.width = width ;
            yardDescription.depth = depth - BYCONFIG.WALL_DEPTH * 2;
            yardDescription.zCenter = zCenter;
            yardDescription.xCenter = xStart - width / 2 - BYCONFIG.WALL_DEPTH;
            if(houseArrayIndex === 0) yardDescription.corner = true;
        }else{
            yardDescription = null;
        }
    }
    else if(direction == BYCONFIG.PLOT_DIRECTIONS.FROM_SOUTH){
        if(widthS.length % 2 > 0 && houseArrayIndex === Math.floor(widthS.length / 2)){
            return [wallDescriptions, null];
        }

        const zIndex = widthS.length - 1 - houseArrayIndex;
        const xCenter = - calcCenterPosition(zIndex, widthS, yardWidth);
        const width = widthS[zIndex];
        const zStart = yardDepth / 2 + BYCONFIG.WALL_EXTRA_TO_HOUSE;

        let zEnd;
        let passiveZEnd;
        let reallyCritical;
        if(zIndex >= widthS.length / 2){
            const westIndex = widthW.length - 1 - lastPlotIndex;
            zEnd = - calcCenterPosition(westIndex, widthW, yardDepth) - widthW[westIndex] / 2;
            passiveZEnd = calcCenterPosition(lastPlotIndex, widthE, yardDepth) - widthE[lastPlotIndex] / 2;
            reallyCritical = passiveBehavior && zEnd < passiveZEnd;
            wallDescriptions.push({x1: xCenter + width / 2, z1: zStart, x2: xCenter + width / 2, z2: (reallyCritical ? passiveZEnd : zEnd) - BYCONFIG.WALL_DEPTH/2, orientation: 0});
            if(zIndex !== widthS.length - 1 && !reallyCritical) wallDescriptions.push({x1: xCenter - width / 2, z1: zEnd, x2: xCenter + width / 2, z2: zEnd, orientation: 1});
        }else{
            zEnd = calcCenterPosition(lastPlotIndex, widthE, yardDepth) - widthE[lastPlotIndex] / 2;
            passiveZEnd = - calcCenterPosition(widthW.length - 1 - lastPlotIndex, widthW, yardDepth) - widthW[widthW.length - 1 - lastPlotIndex] / 2;
            reallyCritical = passiveBehavior && zEnd < passiveZEnd;
            wallDescriptions.push({x1: xCenter - width / 2, z1: zStart, x2: xCenter - width / 2, z2: (reallyCritical ? passiveZEnd : zEnd) - BYCONFIG.WALL_DEPTH/2, orientation: 0});
            if(zIndex !== 0 && !reallyCritical) wallDescriptions.push({x1: xCenter - width / 2, z1: zEnd, x2: xCenter + width / 2, z2: zEnd, orientation: 1});
        }
        if(zIndex !== widthS.length - 1){
            const depth = zStart - (reallyCritical ? passiveZEnd : zEnd) - BYCONFIG.WALL_DEPTH * 2;
            yardDescription.depth = depth;
            yardDescription.width = width - BYCONFIG.WALL_DEPTH * 2;
            yardDescription.zCenter = zStart - depth / 2 - BYCONFIG.WALL_DEPTH;
            yardDescription.xCenter = xCenter;
            if(zIndex === 0) yardDescription.corner = true;
        }else{
            yardDescription = null;
        }
    }
    else if(direction == BYCONFIG.PLOT_DIRECTIONS.FROM_WEST){
        if(widthW.length % 2 > 0 && houseArrayIndex === Math.floor(widthW.length / 2)){
            return [wallDescriptions, null];
        }
        const westIndex = widthW.length - 1 - houseArrayIndex;
        const zCenter = - calcCenterPosition(westIndex, widthW, yardDepth);
        const depth = widthW[westIndex];
        const xStart = -yardWidth / 2 - BYCONFIG.WALL_EXTRA_TO_HOUSE;

        let xEnd;
        let passiveXEnd;
        let reallyCritical;
        if(westIndex >= widthW.length / 2){
            xEnd = calcCenterPosition(lastPlotIndex, widthN, yardWidth) + widthN[lastPlotIndex] / 2;
            passiveXEnd = - calcCenterPosition(widthS.length - 1 - lastPlotIndex, widthS, yardWidth) + widthS[widthS.length - 1 - lastPlotIndex] / 2;
            reallyCritical = passiveBehavior && xEnd > passiveXEnd;
            wallDescriptions.push({x1: xStart, z1: zCenter + depth / 2, x2: (reallyCritical ? passiveXEnd : xEnd) + BYCONFIG.WALL_DEPTH/2, z2: zCenter + depth / 2, orientation: 1});
            if(westIndex !== widthW.length - 1 && !reallyCritical) wallDescriptions.push({x1: xEnd, z1: zCenter - depth / 2, x2: xEnd, z2: zCenter + depth / 2, orientation: 0});
        }else{
            const southIndex = widthS.length - 1 - lastPlotIndex;
            xEnd = - calcCenterPosition(southIndex, widthS, yardWidth) + widthS[southIndex] / 2;
            passiveXEnd = calcCenterPosition(lastPlotIndex, widthN, yardWidth) + widthN[lastPlotIndex] / 2;
            reallyCritical = passiveBehavior && xEnd > passiveXEnd;
            wallDescriptions.push({x1: xStart, z1: zCenter - depth / 2 , x2: (reallyCritical ? passiveXEnd : xEnd) + BYCONFIG.WALL_DEPTH/2, z2: zCenter - depth / 2, orientation: 1});
            if(westIndex !== 0 && !reallyCritical) wallDescriptions.push({x1: xEnd, z1: zCenter - depth / 2, x2: xEnd, z2: zCenter + depth / 2, orientation: 0});
        }
        if(westIndex !== widthW.length - 1){
            const width = (reallyCritical ? passiveXEnd : xEnd) - xStart - BYCONFIG.WALL_DEPTH * 2;
            yardDescription.width = width;
            yardDescription.depth = depth - BYCONFIG.WALL_DEPTH * 2;
            yardDescription.xCenter = xStart + width / 2 + BYCONFIG.WALL_DEPTH;
            yardDescription.zCenter = zCenter;
            if(westIndex === 0) yardDescription.corner = true;
        }else{
            yardDescription = null;
        }
    }

    return [wallDescriptions, yardDescription];
}

function calcCenterPosition(houseIndex: number, widthArray: number[], _yardSize: number): number{
    const totalWidth = widthArray.reduce((sum, width) => sum + width, 0);
    const centeredStart = totalWidth / 2;
    const houseOffset = widthArray.slice(0, houseIndex).reduce((sum, width) => sum + width, 0);

    return houseOffset + widthArray[houseIndex] / 2 - centeredStart;
}

function yardPartitioning(houseWidthsN: number[], houseWidthsE: number[], houseWidthsS: number[], houseWidthsW: number[], getId: () => number): (number | null)[][]{
    if(houseWidthsN.length !== houseWidthsS.length || houseWidthsE.length !== houseWidthsW.length){
        console.error('yardPartitioning: houseWidths arrays must have the same length');
    }

    const widthNWithIDs: TYPES.houseWidthsWithIDs[] = addIdToHouseWidths(houseWidthsN, null, getId);
    const widthEWithIDs: TYPES.houseWidthsWithIDs[] = addIdToHouseWidths(houseWidthsE, null, getId);
    const widthSWithIDs: TYPES.houseWidthsWithIDs[] = addIdToHouseWidths(houseWidthsS, null, getId);
    const widthWWithIDs: TYPES.houseWidthsWithIDs[] = addIdToHouseWidths(houseWidthsW, widthNWithIDs[0].id, getId);

    const partitioning: (number | null)[][] = Array(widthEWithIDs.length).fill(null).map(() => Array(widthNWithIDs.length).fill(null));

    partitioningBorderInit(widthNWithIDs, widthEWithIDs, widthSWithIDs, widthWWithIDs, partitioning);

    partitioningInner(partitioning);

    return partitioning;
}


const addIdToHouseWidths = (houseWidths: number[], lastId: number | null = null, getId: () => number): TYPES.houseWidthsWithIDs[] => {
    return houseWidths.map((width, index) => {
        if(index == 0) return {id: getId(), width: width}; 
        else if (lastId !== null && index === houseWidths.length - 1) 
        return {id: lastId, width: width}; else return {id: getId(), width: width};
    });
}

function partitioningBorderInit(houseWIDN: TYPES.houseWidthsWithIDs[], houseWIDE: TYPES.houseWidthsWithIDs[], houseWIDS: TYPES.houseWidthsWithIDs[], houseWIDW: TYPES.houseWidthsWithIDs[], partitioning: (number | null)[][]){
    for(let i = 0; i < partitioning.length; i++){
        for(let j = 0; j < partitioning[0].length; j++){
            if(i === 0 || i === partitioning.length - 1 || j === 0 || j === partitioning[0].length - 1){
                let id = null;
                if(i === 0){
                    id = houseWIDN[j].id;
                } else if(i === partitioning.length - 1){
                    id = houseWIDS[partitioning[0].length - 1 - j].id;
                } else if(j === 0){
                    id = houseWIDW[partitioning.length - 1 - i].id;
                } else if(j === partitioning[0].length - 1){
                    id = houseWIDE[i].id;
                }
                if(id !== null){
                    partitioning[i][j] = id;
                }
            }
        }
    }
}

function partitioningInner(partitioning: (number | null)[][]){
    let maxDepth = Math.min(Math.ceil(partitioning.length/2), Math.ceil(partitioning[0].length/2));
    let newPartitioning: (number | null)[][] = partitioning.map(row => row.map(cell => cell));

    for(let depth = 1; depth < maxDepth; depth++){
        const partitioningOrder = getRandomPartitionIndexOrder(partitioning, depth);
        const innerPartitioning = newPartitioning.map(row => row.map(cell => cell));
        for(const [i, j] of partitioningOrder){
            const neighborhoodId = getRandomNeighborhoodId(newPartitioning, i, j);
            innerPartitioning[i][j] = neighborhoodId;
        }
        newPartitioning = innerPartitioning;
    }

    partitioning.forEach((row, i) => row.forEach((cell, j) => {partitioning[i][j] = newPartitioning[i][j]}));
}

function getRandomPartitionIndexOrder(partitioning: (number | null)[][], depth: number): [number, number][] {
    const unusedIndices: [number, number][] = [];
    for(let i = depth; i < partitioning.length - depth; i++){
        for(let j = depth; j < partitioning[0].length - depth; j++){
            if(i === depth || i === partitioning.length - depth - 1 || j === depth || j === partitioning[0].length - depth - 1){
                unusedIndices.push([i, j]);
            }
        }
    }
    unusedIndices.sort(() => Math.random() - 0.5);
    return unusedIndices;
}

function getRandomNeighborhoodId(partitioning: (number | null)[][], i: number, j: number): number {
    const ids = [];
    try{const id = partitioning[i-1][j]; if(id !== null && id !== undefined && id !== -1) ids.push(id);}catch{}
    try{const id = partitioning[i+1][j]; if(id !== null && id !== undefined && id !== -1) ids.push(id);}catch{}
    try{const id = partitioning[i][j-1]; if(id !== null && id !== undefined && id !== -1) ids.push(id);}catch{}
    try{const id = partitioning[i][j+1]; if(id !== null && id !== undefined && id !== -1) ids.push(id);}catch{}

    if(ids.length === 0) return -1;

    const randomId = randomFromArray(ids);
    return randomId as number;
}
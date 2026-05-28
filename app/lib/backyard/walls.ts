import * as THREE from 'three';

import * as BYCONFIG from "@/app/lib/config/backyardConfig";
import { randomBoolean, randomFromArray } from "@/app/lib/config/utils";
import { calcUVS } from '../config/3dUtils';
import { getHouseMaterials, getWallMaterial } from '../materials/materials';

//Following Structure:

//      hn0     hn1     hn2     hn3 
// hw2  gn0w2   gn1     gn2     gn3e0   he0
// hw1  gw1     gn1s1w1 gn2s1e1 ge1     he1
// hw0  gs3w0   gs1     gs1     gs0e2   he2
//      hs3     hs2     hs1     hs0

let globalPartitionId = 0;
interface partition{
    id: number,
}

interface houseWidthsWithIDs{
    id: number;
    width: number;
}

export class YardWalls{
    widthN: number[];
    widthE: number[];
    widthS: number[];
    widthW: number[];
    yardPartitioning: (partition | null)[][];
    wallPositioning: { x1: number, z1: number, x2: number, z2: number, orientation: number}[];
    yardWidth: number;
    yardDepth: number;

    constructor(widthN: number[], widthE: number[], widthS: number[], widthW: number[], width: number, depth: number){
        this.widthN = widthN;
        this.widthE = widthE;
        this.widthS = widthS;
        this.widthW = widthW;
        this.yardWidth = width;
        this.yardDepth = depth;
        this.yardPartitioning = yardPartitioning(widthN, widthE, widthS, widthW) as (partition | null)[][];
        this.wallPositioning = callPlotWallGenerationForPartitioning(this.yardPartitioning, this.widthN, this.widthE, this.widthS, this.widthW, this.yardWidth, this.yardDepth);
    }

    get3DObject(): THREE.Group {
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

        return wallsGroup;
    }


}

function callPlotWallGenerationForPartitioning(partitioning: (partition | null)[][], widthN: number[], widthE: number[], widthS: number[], widthW: number[], yardWidth: number, yardDepth: number): {x1: number, z1: number, x2: number, z2: number, orientation: number}[]{
    const wallDescriptions: {x1: number, z1: number, x2: number, z2: number, orientation: number}[] = [];
    //Find the partitionIds that appear intoMiddlePartitionCount times in partitioning

    let criticalIndicesI = partitioning.length % 2 === 0 ? [partitioning.length / 2 - 1, partitioning.length / 2] : [Math.floor(partitioning.length / 2)];
    let criticalIndicesJ = partitioning[0].length % 2 === 0 ? [partitioning[0].length / 2 - 1, partitioning[0].length / 2] : [Math.floor(partitioning[0].length / 2)];
    if(criticalIndicesI.length === 2 && criticalIndicesJ.length === 2){
        if(randomBoolean()){
            //Random first or second index for i and j
            criticalIndicesI = [randomFromArray(criticalIndicesI)];
        }else{
            criticalIndicesJ = [randomFromArray(criticalIndicesJ)];
        }
    }else{
        if(criticalIndicesI.length === 2){
            criticalIndicesI = [randomFromArray(criticalIndicesI)];
        }else if(criticalIndicesJ.length === 2){
            criticalIndicesJ = [randomFromArray(criticalIndicesJ)];
        }
    }
    const criticalIds: number[] = [];
    for(const i of criticalIndicesI){
        for(const j of criticalIndicesJ){
            const id = partitioning[i][j]?.id;
            if(id !== null && id !== undefined && !criticalIds.includes(id)){
                criticalIds.push(id);
            }
        }
    }
    
    for(let j = 0; j < partitioning[0].length; j++){
        //NorthPart
        let i = 0;
        let houseArrayIndex = j;
        let partition = partitioning[i][j]?.id;
        if(partition !== undefined){
            let lastPlotIndex = i;
            while(partitioning[lastPlotIndex+1][j]?.id === partition){
                lastPlotIndex++;
            };
            wallDescriptions.push(...generatePlotWalls(widthN, widthE, widthS, widthW, yardWidth, yardDepth, houseArrayIndex, lastPlotIndex, BYCONFIG.PLOT_DIRECTIONS.FROM_NORTH, criticalIds.indexOf(partition) !== -1));
        }

        //SouthPart
        i = partitioning.length - 1;
        partition = partitioning[i][j]?.id;
        if(partition !== undefined){
            let lastPlotIndex = i;
            while(partitioning[lastPlotIndex-1][j]?.id === partition){
                lastPlotIndex--;
            };
            wallDescriptions.push(...generatePlotWalls(widthN, widthE, widthS, widthW, yardWidth, yardDepth, houseArrayIndex, lastPlotIndex, BYCONFIG.PLOT_DIRECTIONS.FROM_SOUTH, criticalIds.indexOf(partition) !== -1));
        }
    }
    
    for(let i = 0; i < partitioning.length; i++){
        //EastPart
        let j = partitioning[0].length - 1;
        let houseArrayIndex = i;
        let partition = partitioning[i][j]?.id;
        if(partition !== undefined){
            let lastPlotIndex = j;
            while(partitioning[i][lastPlotIndex-1]?.id === partition){
                lastPlotIndex--;
            }
            wallDescriptions.push(...generatePlotWalls(widthN, widthE, widthS, widthW, yardWidth, yardDepth, houseArrayIndex, lastPlotIndex, BYCONFIG.PLOT_DIRECTIONS.FROM_EAST, criticalIds.indexOf(partition) !== -1));
        }

        //WestPart
        j = 0;
        partition = partitioning[i][j]?.id;
        if(partition !== undefined){
            let lastPlotIndex = j;
            while(partitioning[i][lastPlotIndex+1]?.id === partition){
                lastPlotIndex++;
            }
            wallDescriptions.push(...generatePlotWalls(widthN, widthE, widthS, widthW, yardWidth, yardDepth, houseArrayIndex, lastPlotIndex, BYCONFIG.PLOT_DIRECTIONS.FROM_WEST, criticalIds.indexOf(partition) !== -1));
        }

    }
    
    return wallDescriptions;
}

//orientation: 0 = north to south, 1 = east to west
function generatePlotWalls(widthN: number[], widthE: number[], widthS: number[], widthW: number[], yardWidth: number, yardDepth: number, houseArrayIndex: number, lastPlotIndex: number, direction: number, passiveBehavior: boolean = false): {x1: number, z1: number, x2: number, z2: number, orientation: number}[]{
    const wallDescriptions: {x1: number, z1: number, x2: number, z2: number, orientation: number}[] = [];
    if(direction == BYCONFIG.PLOT_DIRECTIONS.FROM_NORTH){
        if(widthN.length % 2 > 0 && houseArrayIndex === Math.floor(widthN.length / 2)){
            return wallDescriptions;
        }

        const xCenter = calcCenterPosition(houseArrayIndex, widthN, yardWidth) ;
        const width = widthN[houseArrayIndex];
        const zCenter = -yardDepth / 2 - BYCONFIG.WALL_EXTRA_TO_HOUSE;

        const westIndex = widthW.length - 1 - lastPlotIndex;
        const zEndW = - calcCenterPosition(westIndex, widthW, yardDepth) + widthW[westIndex] / 2;
        const zEndE = calcCenterPosition(lastPlotIndex, widthE, yardDepth) + widthE[lastPlotIndex] / 2;
        let passiveZEnd;
        let zEnd;
        if(houseArrayIndex >= widthN.length / 2){
            zEnd = zEndE;
            passiveZEnd = zEndW;

            const reallyCritical = passiveBehavior && zEnd > passiveZEnd;
            wallDescriptions.push({x1: xCenter - width / 2, z1: zCenter, x2: xCenter - width / 2, z2: (reallyCritical ? passiveZEnd : zEnd) + BYCONFIG.WALL_DEPTH/2, orientation: 0});
            if(houseArrayIndex !== widthN.length - 1){
                //wallDescriptions.push({x1: xCenter + width / 2, z1: zCenter, x2: xCenter + width / 2, z2: reallyCritical ? passiveZEnd : zEnd, orientation: 0});
                if(!reallyCritical)
                    wallDescriptions.push({x1: xCenter - width / 2, z1: zEnd, x2: xCenter + width / 2, z2: zEnd, orientation: 1});
            }

        }else{
            zEnd = zEndW;
            passiveZEnd = zEndE;

            const reallyCritical = passiveBehavior && zEnd > passiveZEnd;
            wallDescriptions.push({x1: xCenter + width / 2, z1: zCenter, x2: xCenter + width / 2, z2: (reallyCritical ? passiveZEnd : zEnd) + BYCONFIG.WALL_DEPTH/2, orientation: 0});
            if(houseArrayIndex !== 0){
                //wallDescriptions.push({x1: xCenter - width / 2, z1: zCenter, x2: xCenter - width / 2, z2: reallyCritical ? passiveZEnd : zEnd, orientation: 0});
                if(!reallyCritical)
                    wallDescriptions.push({x1: xCenter - width / 2, z1: zEnd, x2: xCenter + width / 2, z2: zEnd, orientation: 1});
            }
        }
    }
    else if(direction == BYCONFIG.PLOT_DIRECTIONS.FROM_EAST){
        if(widthE.length % 2 > 0 && houseArrayIndex === Math.floor(widthE.length / 2)){
            return wallDescriptions;
        }

        const zCenter = calcCenterPosition(houseArrayIndex, widthE, yardDepth);
        const depth = widthE[houseArrayIndex];
        const xCenter = yardWidth / 2 + BYCONFIG.WALL_EXTRA_TO_HOUSE;

        let xEnd;
        let passiveXEnd;
        // decide whether to connect towards south or north side
        if(houseArrayIndex >= widthE.length / 2){
            const southIndex = widthS.length - 1 - lastPlotIndex;
            xEnd = - calcCenterPosition(southIndex, widthS, yardWidth) - widthS[southIndex] / 2;
            passiveXEnd = calcCenterPosition(lastPlotIndex, widthN, yardWidth) - widthN[lastPlotIndex] / 2;
            const reallyCritical = passiveBehavior && Math.abs(xEnd - xCenter) > Math.abs(passiveXEnd - xCenter);
            wallDescriptions.push({x1: xCenter, z1: zCenter - depth / 2, x2: (reallyCritical ? passiveXEnd : xEnd) - BYCONFIG.WALL_DEPTH/2, z2: zCenter - depth / 2, orientation: 1});
            if(houseArrayIndex !== widthE.length - 1){
                //wallDescriptions.push({x1: xCenter, z1: zCenter + depth / 2, x2: xEnd, z2: zCenter + depth / 2, orientation: 1});
                if(!reallyCritical)
                    wallDescriptions.push({x1: xEnd, z1: zCenter - depth / 2, x2: xEnd, z2: zCenter + depth / 2, orientation: 0});
            }
        }else{
            xEnd = calcCenterPosition(lastPlotIndex, widthN, yardWidth) - widthN[lastPlotIndex] / 2;
            passiveXEnd = - calcCenterPosition(widthS.length - 1 - lastPlotIndex, widthS, yardWidth) - widthS[widthS.length - 1 - lastPlotIndex] / 2;
            const reallyCritical = passiveBehavior && Math.abs(xEnd - xCenter) > Math.abs(passiveXEnd - xCenter);
            wallDescriptions.push({x1: xCenter, z1: zCenter + depth / 2, x2: (reallyCritical ? passiveXEnd : xEnd) - BYCONFIG.WALL_DEPTH/2, z2: zCenter + depth / 2, orientation: 1});
            if(houseArrayIndex !== 0){
                //wallDescriptions.push({x1: xCenter, z1: zCenter - depth / 2, x2: xEnd, z2: zCenter - depth / 2, orientation: 1});
                if(!reallyCritical)
                    wallDescriptions.push({x1: xEnd, z1: zCenter - depth / 2, x2: xEnd, z2: zCenter + depth / 2, orientation: 0});
            }
        }
    }
    else if(direction == BYCONFIG.PLOT_DIRECTIONS.FROM_SOUTH){
        if(widthS.length % 2 > 0 && houseArrayIndex === Math.floor(widthS.length / 2)){
            return wallDescriptions;
        }

        const zIndex = widthS.length - 1 - houseArrayIndex;
        const xCenter = - calcCenterPosition(zIndex, widthS, yardWidth);
        const width = widthS[zIndex];
        const zCenter = yardDepth / 2 + BYCONFIG.WALL_EXTRA_TO_HOUSE;

        let zEnd;
        let passiveZEnd;
        if(zIndex >= widthS.length / 2){
            const westIndex = widthW.length - 1 - lastPlotIndex;
            zEnd = - calcCenterPosition(westIndex, widthW, yardDepth) - widthW[westIndex] / 2;
            passiveZEnd = calcCenterPosition(lastPlotIndex, widthE, yardDepth) - widthE[lastPlotIndex] / 2;
            const reallyCritical = passiveBehavior && Math.abs(zEnd - zCenter) > Math.abs(passiveZEnd - zCenter);
            wallDescriptions.push({x1: xCenter + width / 2, z1: zCenter, x2: xCenter + width / 2, z2: (reallyCritical ? passiveZEnd : zEnd) - BYCONFIG.WALL_DEPTH/2, orientation: 0});
            if(zIndex !== widthS.length - 1){
                //wallDescriptions.push({x1: xCenter - width / 2, z1: zCenter, x2: xCenter - width / 2, z2: reallyCritical ? passiveZEnd : zEnd, orientation: 0});
                if(!reallyCritical)
                    wallDescriptions.push({x1: xCenter - width / 2, z1: zEnd, x2: xCenter + width / 2, z2: zEnd, orientation: 1});
            }
        }else{
            zEnd = calcCenterPosition(lastPlotIndex, widthE, yardDepth) - widthE[lastPlotIndex] / 2;
            passiveZEnd = - calcCenterPosition(widthW.length - 1 - lastPlotIndex, widthW, yardDepth) - widthW[widthW.length - 1 - lastPlotIndex] / 2;
            const reallyCritical = passiveBehavior && Math.abs(zEnd - zCenter) > Math.abs(passiveZEnd - zCenter);
            wallDescriptions.push({x1: xCenter - width / 2, z1: zCenter, x2: xCenter - width / 2, z2: (reallyCritical ? passiveZEnd : zEnd) - BYCONFIG.WALL_DEPTH/2, orientation: 0});
            if(zIndex !== 0){
                //wallDescriptions.push({x1: xCenter + width / 2, z1: zCenter, x2: xCenter + width / 2, z2: reallyCritical ? passiveZEnd : zEnd, orientation: 0});
                if(!reallyCritical)
                    wallDescriptions.push({x1: xCenter - width / 2, z1: zEnd, x2: xCenter + width / 2, z2: zEnd, orientation: 1});
            }
        }
    }
    else if(direction == BYCONFIG.PLOT_DIRECTIONS.FROM_WEST){
        if(widthW.length % 2 > 0 && houseArrayIndex === Math.floor(widthW.length / 2)){
            return wallDescriptions;
        }
        const westIndex = widthW.length - 1 - houseArrayIndex;
        const zCenter = - calcCenterPosition(westIndex, widthW, yardDepth);
        const depth = widthW[westIndex];
        const xCenter = -yardWidth / 2 - BYCONFIG.WALL_EXTRA_TO_HOUSE;

        let xEnd;
        let passiveXEnd;
        if(westIndex >= widthW.length / 2){
            xEnd = calcCenterPosition(lastPlotIndex, widthN, yardWidth) + widthN[lastPlotIndex] / 2;
            passiveXEnd = - calcCenterPosition(widthS.length - 1 - lastPlotIndex, widthS, yardWidth) + widthS[widthS.length - 1 - lastPlotIndex] / 2;
            const reallyCritical = passiveBehavior && Math.abs(xEnd - xCenter) > Math.abs(passiveXEnd - xCenter);
            wallDescriptions.push({x1: xCenter, z1: zCenter + depth / 2, x2: (reallyCritical ? passiveXEnd : xEnd) + BYCONFIG.WALL_DEPTH/2, z2: zCenter + depth / 2, orientation: 1});
            if(westIndex !== widthW.length - 1){
                //wallDescriptions.push({x1: xCenter, z1: zCenter - depth / 2, x2: xEnd, z2: zCenter - depth / 2, orientation: 1});
                if(!reallyCritical)
                    wallDescriptions.push({x1: xEnd, z1: zCenter - depth / 2, x2: xEnd, z2: zCenter + depth / 2, orientation: 0});
            }
        }else{
            const southIndex = widthS.length - 1 - lastPlotIndex;
            xEnd = - calcCenterPosition(southIndex, widthS, yardWidth) + widthS[southIndex] / 2;
            passiveXEnd = calcCenterPosition(lastPlotIndex, widthN, yardWidth) + widthN[lastPlotIndex] / 2;
            const reallyCritical = passiveBehavior && Math.abs(xEnd - xCenter) > Math.abs(passiveXEnd - xCenter);
            wallDescriptions.push({x1: xCenter, z1: zCenter - depth / 2 , x2: (reallyCritical ? passiveXEnd : xEnd) + BYCONFIG.WALL_DEPTH/2, z2: zCenter - depth / 2, orientation: 1});
            if(westIndex !== 0){
                //wallDescriptions.push({x1: xCenter, z1: zCenter + depth / 2, x2: xEnd, z2: zCenter + depth / 2, orientation: 1});
                if(!reallyCritical)
                    wallDescriptions.push({x1: xEnd, z1: zCenter - depth / 2, x2: xEnd, z2: zCenter + depth / 2, orientation: 0});
            }
        }
    }

    return wallDescriptions;
}

function calcCenterPosition(houseIndex: number, widthArray: number[], _yardSize: number): number{
    const totalWidth = widthArray.reduce((sum, width) => sum + width, 0);
    const centeredStart = totalWidth / 2;
    const houseOffset = widthArray.slice(0, houseIndex).reduce((sum, width) => sum + width, 0);

    return houseOffset + widthArray[houseIndex] / 2 - centeredStart;
}

function yardPartitioning(houseWidthsN: number[], houseWidthsE: number[], houseWidthsS: number[], houseWidthsW: number[]){
    if(houseWidthsN.length !== houseWidthsS.length || houseWidthsE.length !== houseWidthsW.length){
        console.error('yardPartitioning: houseWidths arrays must have the same length');
        return;
    }

    const widthNWithIDs: houseWidthsWithIDs[] = addIdToHouseWidths(houseWidthsN);
    const widthEWithIDs: houseWidthsWithIDs[] = addIdToHouseWidths(houseWidthsE);
    const widthSWithIDs: houseWidthsWithIDs[] = addIdToHouseWidths(houseWidthsS);
    const widthWWithIDs: houseWidthsWithIDs[] = addIdToHouseWidths(houseWidthsW, widthNWithIDs[0].id);

    const partitioning: (partition | null)[][] = Array(widthEWithIDs.length).fill(null).map(() => Array(widthNWithIDs.length).fill(null));

    partitioningBorderInit(widthNWithIDs, widthEWithIDs, widthSWithIDs, widthWWithIDs, partitioning);

    partitioningInner(partitioning);

    return partitioning;
}


const addIdToHouseWidths = (houseWidths: number[], lastId: number | null = null): houseWidthsWithIDs[] => {
    return houseWidths.map((width, index) => {
        if(index == 0) return {id: globalPartitionId, width: width}; 
        else if (lastId !== null && index === houseWidths.length - 1) 
        return {id: lastId, width: width}; else return {id: ++globalPartitionId, width: width};
    });
}

function partitioningBorderInit(houseWIDN: houseWidthsWithIDs[], houseWIDE: houseWidthsWithIDs[], houseWIDS: houseWidthsWithIDs[], houseWIDW: houseWidthsWithIDs[], partitioning: (partition | null)[][]){
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
                    partitioning[i][j] = {id: id};
                }
            }
        }
    }
}

function partitioningInner(partitioning: (partition | null)[][]){
    let maxDepth = Math.min(Math.ceil(partitioning.length/2), Math.ceil(partitioning[0].length/2));
    let newPartitioning: (partition | null)[][] = partitioning.map(row => row.map(cell => cell ? { ...cell } : null));

    for(let depth = 1; depth < maxDepth; depth++){
        const partitioningOrder = getRandomPartitionIndexOrder(partitioning, depth);
        const innerPartitioning = newPartitioning.map(row => row.map(cell => cell ? { ...cell } : null));
        for(const [i, j] of partitioningOrder){
            const neighborhoodId = getRandomNeighborhoodId(newPartitioning, i, j);
            innerPartitioning[i][j] = {id: neighborhoodId};
        }
        newPartitioning = innerPartitioning;
    }

    partitioning.forEach((row, i) => row.forEach((cell, j) => {partitioning[i][j] = newPartitioning[i][j]}));
}

function getRandomPartitionIndexOrder(partitioning: (partition | null)[][], depth: number): [number, number][] {
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

function getRandomNeighborhoodId(partitioning: (partition | null)[][], i: number, j: number): number {
    const ids = [];
    try{const id = partitioning[i-1][j]?.id; if(id !== null && id !== undefined && id !== -1) ids.push(id);}catch{}
    try{const id = partitioning[i+1][j]?.id; if(id !== null && id !== undefined && id !== -1) ids.push(id);}catch{}
    try{const id = partitioning[i][j-1]?.id; if(id !== null && id !== undefined && id !== -1) ids.push(id);}catch{}
    try{const id = partitioning[i][j+1]?.id; if(id !== null && id !== undefined && id !== -1) ids.push(id);}catch{}

    if(ids.length === 0) return -1;

    const randomId = randomFromArray(ids);
    return randomId as number;
}
import { fromEdgesInward, randomFromArray } from "@/app/lib/config/utils";

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

export function yardPartitioning(houseWidthsN: number[], houseWidthsE: number[], houseWidthsS: number[], houseWidthsW: number[]){
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
                if(partitioning[i][j] === null){
                    unusedIndices.push([i, j]);
                }
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
import { fromEdgesInward } from "@/app/lib/config/utils";

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


const widhtSubDivisionFactor = 0.10;

export function yardPartitioning(houseWidthsN: number[], houseWidthsE: number[], houseWidthsS: number[], houseWidthsW: number[]){
    const widhtNAll = houseWidthsN.reduce((a, b) => a + b, 0);
    const widhtEAll = houseWidthsE.reduce((a, b) => a + b, 0);
    const widhtSAll = houseWidthsS.reduce((a, b) => a + b, 0);
    const widhtWAll = houseWidthsW.reduce((a, b) => a + b, 0);

    const widthNWithIDs: houseWidthsWithIDs[] = addIdToHouseWidths(houseWidthsN);
    const widthEWithIDs: houseWidthsWithIDs[] = addIdToHouseWidths(houseWidthsE);
    const widthSWithIDs: houseWidthsWithIDs[] = addIdToHouseWidths(houseWidthsS);
    const widthWWithIDs: houseWidthsWithIDs[] = addIdToHouseWidths(houseWidthsW, widthNWithIDs[0].id);
    console.log(widthNWithIDs);
    console.log(widthEWithIDs);
    console.log(widthSWithIDs);
    console.log(widthWWithIDs);

    const widht = Math.floor(Math.max(widhtNAll, widhtSAll) * widhtSubDivisionFactor);
    const length = Math.floor(Math.max(widhtEAll, widhtWAll) * widhtSubDivisionFactor);

    const partitioning: partition[][] = Array(widht+2).fill(null).map(() => Array(length+2).fill(null));

    partitioningBorderInit(widthNWithIDs, widthEWithIDs, widthSWithIDs, widthWWithIDs, partitioning);

    fromEdgesInward(partitioning, getNeighborhoodId);

    console.log(transformArrayIdtoArraynumber(partitioning));

    return partitioning;
}

function transformArrayIdtoArraynumber(partitioning: partition[][]): number[][] {
    return partitioning.map(row => row.map(p => p?.id ?? -1));
}

function printPartitioning(partitioning: partition[][]){
    for(let i=0; i < partitioning.length; i++){
        let rowPrint = "";
        for(let j=0; j < partitioning[0].length; j++){
            if(partitioning[i][j] && partitioning[i][j]!.id != undefined){
                rowPrint += "|" + partitioning[i][j].id;
            }else{
                rowPrint += "| X";
            }
        }
        console.log(rowPrint);
    }
}

const addIdToHouseWidths = (houseWidths: number[], lastId: number | null = null): houseWidthsWithIDs[] => {
    return houseWidths.map((width, index) => {
        if(index == 0) return {id: globalPartitionId, width: width}; 
        else if (lastId !== null && index === houseWidths.length - 1) 
        return {id: lastId, width: width}; else return {id: ++globalPartitionId, width: width};
    });
}

function partitioningBorderInit(houseWIDN: houseWidthsWithIDs[], houseWIDE: houseWidthsWithIDs[], houseWIDS: houseWidthsWithIDs[], houseWIDW: houseWidthsWithIDs[], partitioning: partition[][]){
    for(let i = 0; i < partitioning.length; i++){
        for(let j = 0; j < partitioning[0].length; j++){
            if(i === 0 || i === partitioning.length - 1 || j === 0 || j === partitioning[0].length - 1){
                if(i === 0){
                    const width = j / widhtSubDivisionFactor;  // ← j statt i!
                    const id = getHouseIdAtWidth(width, houseWIDN);
                    partitioning[i][j] = {id: id};
                } else if(i === partitioning.length - 1){
                    const width = (partitioning[0].length - 1 - j) / widhtSubDivisionFactor;  // ← j statt i!
                    const id = getHouseIdAtWidth(width, houseWIDS);
                    partitioning[i][j] = {id: id};
                } else if(j === 0){
                    const width = (partitioning.length - 1 - i) / widhtSubDivisionFactor;
                    const id = getHouseIdAtWidth(width, houseWIDW);
                    partitioning[i][j] = {id: id};
                } else if(j === partitioning[0].length - 1){
                    const width = i / widhtSubDivisionFactor;
                    const id = getHouseIdAtWidth(width, houseWIDE);
                    partitioning[i][j] = {id: id};
                }
            }
        }
    }
}

function getNeighborhoodId(partitioning: partition[][], i: number, j: number): void {
    const neighborIds: number[] = [];
    
    // Collect neighbord IDs
    for(let di = -1; di <= 1; di++) {
        for(let dj = -1; dj <= 1; dj++) {
            if(di === 0 && dj === 0) continue; // Skip self
            const ni = i + di;
            const nj = j + dj;
            if(ni >= 0 && ni < partitioning.length && nj >= 0 && nj < partitioning[0].length) {
                if(partitioning[ni][nj]?.id !== undefined) {
                    neighborIds.push(partitioning[ni][nj].id);
                }
            }
        }
    }
    
    // Count frequency
    const frequency = new Map<number, number>();
    neighborIds.forEach(id => {
        frequency.set(id, (frequency.get(id) || 0) + 1);
    });
    
    // Find highest frequency
    const maxFreq = Math.max(...Array.from(frequency.values()));
    
    // Alle IDs mit höchster Häufigkeit → random eine wählen
    const mostCommonIds = Array.from(frequency.entries())
        .filter(([_, freq]) => freq === maxFreq)
        .map(([id]) => id);
    
    partitioning[i][j] = {id: mostCommonIds[Math.floor(Math.random() * mostCommonIds.length)]};
}

function getHouseIdAtWidth(width: number, houseWidths: houseWidthsWithIDs[]): number {
    if(width <= 0) return houseWidths[0].id;  // Untergrenze
    
    let cumulatedSum = 0;
    const result = houseWidths.findIndex(w => cumulatedSum < width && (cumulatedSum += w.width) >= width);
    
    if(result === -1) return houseWidths[houseWidths.length - 1].id;  // Obergrenze
    return houseWidths[result].id;
}


/*function yardPartitioning(houseWidthsN: number[], houseWidthsE: number[], houseWidthsS: number[], houseWidthsW: number[]){
    if(houseWidthsN.length !== houseWidthsS.length || houseWidthsE.length !== houseWidthsW.length) {
        throw new Error("The lengths of the house widths arrays must be equal for opposite sides.");
    }

    const Plots: Plot[][] = Array(houseWidthsN.length).fill(null).map(() => Array(houseWidthsE.length).fill(null)); //length housesN.length x housesE.length
    const xCountAll = houseWidthsN.length;
    const yCountAll = houseWidthsE.length;
    const maxDepth = Math.ceil(Math.max(xCountAll, yCountAll)/2);
    
    for(let depth=0; depth<maxDepth; depth++){
        const xCountThis = xCountAll - 2*depth;
        const yCountThis = yCountAll - 2*depth;
        for(let i=0; i < xCountThis; i++){
            for(let j=0; j < yCountThis; j++){
                if(isEdgePlot(i, j, xCountThis, yCountThis)){
                    if(depth === 0){
                        plots[i][j] = generateEdgePlot(houseWidthsN[i], houseWidthsE[j]);
                    }
                } else if(isNextToEdgePlot(i, j, xCountThis, yCountThis)){
                    // Handle next-to-edge plot
                } else{

                }
            }
        }
    }

    return;
}

function generateEdgePlot(nWidth: number[], eWidth: number[], sWidth: number[], wWidth: number[], edgePlotType: number): Plot | undefined {
    if(edgePlotType === BYCONFIG.EDGE_PLOT_TYPES.NO_EDGE || nWidth.length <= 0 || eWidth.length <= 0 || sWidth.length <= 0 || wWidth.length <= 0) {
        return undefined;
    }
    if(edgePlotType === BYCONFIG.EDGE_PLOT_TYPES.UPPER_LEFT_EDGE) {

        return new Plot(nWidth.at(0)!, wWidth.at(-1)!, {x: 0, y: 0});
    } else if(edgePlotType === BYCONFIG.EDGE_PLOT_TYPES.UPPER_RIGHT_EDGE) {
        return new Plot(nWidth.at(-1)!, eWidth.at(0)!, {x: 0, y: 0});
    } else if(edgePlotType === BYCONFIG.EDGE_PLOT_TYPES.LOWER_RIGHT_EDGE) {
        return new Plot(sWidth.at(0)!, eWidth.at(-1)!, {x: 0, y: 0});
    } else if(edgePlotType === BYCONFIG.EDGE_PLOT_TYPES.LOWER_LEFT_EDGE) {
        return new Plot(sWidth.at(-1)!, wWidth.at(0)!, {x: 0, y: 0});
    }
}

function generateNextToEdgePlot(nWidth: number[], eWidth: number[], sWidth: number[], wWidth: number[], edgePlotType: number): Plot | undefined {
    if(edgePlotType === BYCONFIG.EDGE_PLOT_TYPES.NO_EDGE || nWidth.length <= 2 || eWidth.length <= 2 || sWidth.length <= 2 || wWidth.length <= 2) {
        return undefined;
    }
    if(edgePlotType === BYCONFIG.EDGE_PLOT_TYPES.UPPER_LEFT_EDGE) {
        return new Plot(nWidth.at(1)!, wWidth.at(-2)!, {x: 0, y: 0});
    } else if(edgePlotType === BYCONFIG.EDGE_PLOT_TYPES.UPPER_RIGHT_EDGE) {
        return new Plot(nWidth.at(-2)!, eWidth.at(1)!, {x: 0, y: 0});
    } else if(edgePlotType === BYCONFIG.EDGE_PLOT_TYPES.LOWER_RIGHT_EDGE) {
        return new Plot(sWidth.at(-2)!, eWidth.at(-2)!, {x: 0, y: 0});
    } else if(edgePlotType === BYCONFIG.EDGE_PLOT_TYPES.LOWER_LEFT_EDGE) {
        return new Plot(sWidth.at(1)!, wWidth.at(1)!, {x: 0, y: 0});
    }
}

// 0 upper edge 1 right edge 2 lower edge 3 left edge
function isEdgePlot(i: number, j: number, xCount: number, yCount: number): number {
    if(i === 0 && j === 0) {
        return BYCONFIG.EDGE_PLOT_TYPES.UPPER_LEFT_EDGE;
    } else if(i === xCount - 1 && j === 0) {
        return BYCONFIG.EDGE_PLOT_TYPES.UPPER_RIGHT_EDGE;
    } else if(i === xCount - 1 && j === yCount - 1) {
        return BYCONFIG.EDGE_PLOT_TYPES.LOWER_RIGHT_EDGE;
    } else if(i === 0 && j === yCount - 1) {
        return BYCONFIG.EDGE_PLOT_TYPES.LOWER_LEFT_EDGE;
    }else {
        return BYCONFIG.EDGE_PLOT_TYPES.NO_EDGE;
    }
}

function isNextToEdgePlot(i: number, j: number, xCount: number, yCount: number): number {
    if(i === 1 && j === 1) {
        return BYCONFIG.EDGE_PLOT_TYPES.UPPER_LEFT_EDGE;
    } else if(i === xCount - 2 && j === 1) {
        return BYCONFIG.EDGE_PLOT_TYPES.UPPER_RIGHT_EDGE;
    } else if(i === xCount - 2 && j === yCount - 2) {
        return BYCONFIG.EDGE_PLOT_TYPES.LOWER_RIGHT_EDGE;
    } else if(i === 1 && j === yCount - 2) {
        return BYCONFIG.EDGE_PLOT_TYPES.LOWER_LEFT_EDGE;
    } else {
        return BYCONFIG.EDGE_PLOT_TYPES.NO_EDGE;
    }
}

class Plot {
    static globalPlotId: number;
    id: number;
    width: number;
    length: number;
    position: {
        x: number;
        y: number;
    };

    constructor(width: number, length: number, position: {x: number, y: number}){
        this.id = Plot.globalPlotId++;
        this.width = width;
        this.length = length;
        this.position = position;
    }
}*/


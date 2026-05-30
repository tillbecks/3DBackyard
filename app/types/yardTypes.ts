import * as TTYPES from './treeTypes';

export interface houseWidthsWithIDs{
    id: number;
    width: number;
}

export type YardWallDescription = {
    x1: number;
    z1: number;
    x2: number;
    z2: number;
    orientation: 0 | 1; // 0 for vertical, 1 for horizontal
}

export type YardDescription = {
    plotId: number;
    width: number;
    depth: number;
    xCenter: number;
    zCenter: number;
    direction: 0 | 1 | 2 | 3; // 0 for north, 1 for east, 2 for south, 3 for west
    corner: boolean;
}

export type YardTreeConfig = {
    treeType: TTYPES.LSystemType;
    treeConfig: TTYPES.LSystemConfig;
    leafConfig: TTYPES.LeafConfig;
    positionBounds: {minX: number, maxX: number, minZ: number, maxZ: number};
    cornerPositionBounds: {minX: number, maxX: number, minZ: number, maxZ: number};
    probability: number;
    countMin: number;
    countMax: number;
}
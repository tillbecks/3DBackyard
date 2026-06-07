import * as TYPES from "@/app/types/typeIndex";
import * as TCONFIG from "@/app/lib/config/treeConfig";

export const EDGE_PLOT_TYPES = {
    NO_EDGE : -1,
    UPPER_LEFT_EDGE : 0,
    UPPER_RIGHT_EDGE : 1,
    LOWER_RIGHT_EDGE : 2,
    LOWER_LEFT_EDGE : 3
}

export const TREE_DISTANCE_EDGES = 40;

export const TREES_PLACED = 4;

export const WALL_HEIGHT_MIN = 15;
export const WALL_HEIGHT_MAX = 23;
export const WALL_DEPTH = 4;
export const WALL_EXTRA_TO_HOUSE = 5;

export const PLOT_DIRECTIONS: { FROM_NORTH: 0; FROM_EAST: 1; FROM_SOUTH: 2; FROM_WEST: 3 } = {
    FROM_NORTH: 0,
    FROM_EAST: 1,
    FROM_SOUTH: 2,
    FROM_WEST: 3
}

export const STD_YARD_TREE_CONFIG: TYPES.YardTreeConfig = {
    treeType: TCONFIG.lSystemTree,
    treeConfig: TCONFIG.lSystemGeometryConfigTree,
    leafConfig: TCONFIG.leafConfigTree,
    positionBounds: {minX: 0, maxX: 1, minZ: 0.5, maxZ: 0.8},
    cornerPositionBounds: {minX: 0.5, maxX: 1, minZ: 0.5, maxZ: 1},
    probability: 0.4,
    countMin: 1,
    countMax: 3
}

export const SIDE_YARD_TREE_CONFIGS: TYPES.YardTreeConfig[] = [
    TCONFIG.smallTreeConfig,
    TCONFIG.bigTreeConfig,
    TCONFIG.bushesConfig
]

export const CENTER_TREE_CONFIGS: TYPES.YardTreeConfig[] = [
    TCONFIG.smallTreeConfig,
    TCONFIG.bushesConfig
]
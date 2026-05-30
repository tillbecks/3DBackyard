import * as TYPES from '@/app/types/typeIndex';

export const lSystemTree: TYPES.LSystemType = {
    axiom: "F",
    rules: {
        "F": ["SAB", "FAB"],
        "A": ["[+F]", "[-F]", "[>F]", "[<F]", ""],
        "B": ["[&F]", "[^F]"],
        "S": ["S"],
        "L": ["L"],
    }
};

export const lSystemBush: TYPES.LSystemType = {
    axiom: "F",
    rules: {
        "F": ["FAB"],
        "A": ["[+F-F]", "[>F<F]", "[>F-F]", "[<F-F]", "[>F+F]", "[<F+F]"],
        "B": ["[&F]", "[^F]"],
        "L": ["L"],
    }
};


export const lSystemGeometryConfigTree: TYPES.LSystemConfig = {
    pitchAngle: 30,
    pitchAngleVariance: 5,
    rollAngle: 20,
    rollAngleVariance: 5,
    initialLength: 15,
    lengthFactor: 0.95,
    initialThickness: 2,
    thicknessFactor: 0.7,
    iterations: 5,
}

export const lSystemGeometryConfigBigTree: TYPES.LSystemConfig = {
    pitchAngle: 40,
    pitchAngleVariance: 5,
    rollAngle: 30,
    rollAngleVariance: 5,
    initialLength: 25,
    lengthFactor: 0.95,
    initialThickness: 5,
    thicknessFactor: 0.7,
    iterations: 8,
}

export const lSystemGeometryConfigBushes: TYPES.LSystemConfig = {
    pitchAngle: 55,
    pitchAngleVariance: 20,
    rollAngle: 30,
    rollAngleVariance: 5,
    initialLength: 5,
    lengthFactor: 0.99,
    initialThickness: 0.5,
    thicknessFactor: 0.7,
    iterations: 4,
}

export const leafConfigTree: TYPES.LeafConfig = {
    widthMin : 0.4,
    widthMax : 0.8,
    depthMin : 0.4,
    depthMax : 0.8,
    heightMin : 0.4,
    heightMax : 0.8,
    //Low segment-count for Low-Poly look
    heightSegments: 4,
    widthSegments: 4,
    leafColorLightnessMin: 0.1,
    leafColorLightnessMax: 0.2,
    scale: 20
}

export const leafConfigBush: TYPES.LeafConfig = {
    widthMin : 0.7,
    widthMax : 0.8,
    depthMin : 0.7,
    depthMax : 0.8,
    heightMin : 0.7,
    heightMax : 0.8,
    //Low segment-count for Low-Poly look
    heightSegments: 4,
    widthSegments: 4,
    leafColorLightnessMin: 0.1,
    leafColorLightnessMax: 0.2,
    scale: 7
}

export const smallTreeConfig: TYPES.YardTreeConfig = {
    treeType: lSystemTree,
    treeConfig: lSystemGeometryConfigTree,
    leafConfig: leafConfigTree,
    probability: 0.5,
    countMin: 1,
    countMax: 3,

    positionBounds:{
        minX: 0,
        maxX: 1,
        minZ: 0.3,
        maxZ: 1,
    },
    cornerPositionBounds:{
        minX: 0.5,
        maxX: 1,
        minZ: 0.5,
        maxZ: 1,
    }
}

export const bigTreeConfig: TYPES.YardTreeConfig = {
    treeType: lSystemTree,
    treeConfig: lSystemGeometryConfigBigTree,
    leafConfig: leafConfigTree,
    probability: 0.2,
    countMin: 1,
    countMax: 1,

    positionBounds:{
        minX: 0,
        maxX: 1,
        minZ: 0.5,
        maxZ: 1,
    },
    cornerPositionBounds:{
        minX: 0.5,
        maxX: 1,
        minZ: 0.5,
        maxZ: 1,
    }
}

export const bushesConfig: TYPES.YardTreeConfig = {
    treeType: lSystemBush,
    treeConfig: lSystemGeometryConfigBushes,
    leafConfig: leafConfigBush,
    probability: 0.8,
    countMin: 3,
    countMax: 14,

    positionBounds:{
        minX: 0.8,
        maxX: 0.2,
        minZ: 0.2,
        maxZ: 1,
    },
    cornerPositionBounds:{
        minX: 0.5,
        maxX: 1,
        minZ: 0.5,
        maxZ: 1,
    }
}


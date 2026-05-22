import * as TYPES from '@/app/types/typeIndex';

export const LSystem: TYPES.LSystemType = {
    axiom: "F",
    rules: {
        "F": ["SAB", "FAB"],
        "A": ["[+F]", "[-F]", "[>F]", "[<F]", ""],
        "B": ["[&F]", "[^F]"],
        "S": ["S"],
        "L": ["L"],
    }
};

export const LSystemGeometryConfig: TYPES.LSystemConfig = {
    pitchAngle: 30,
    pitchAngleVariance: 5,
    rollAngle: 20,
    rollAngleVariance: 5,
    initialLength: 25,
    lengthFactor: 0.90,
    initialThickness: 4,
    thicknessFactor: 0.7,
    iterations: 11,
}

export const LSystemGeometryConfig2: TYPES.LSystemConfig = {
    pitchAngle: 30,
    pitchAngleVariance: 5,
    rollAngle: 20,
    rollAngleVariance: 5,
    initialLength: 13,
    lengthFactor: 0.99,
    initialThickness: 4,
    thicknessFactor: 0.7,
    iterations: 11,
}


export const LeafConfig = {
    widthMin : 0.4,
    widthMax : 0.8,
    depthMin : 0.4,
    depthMax : 0.8,
    heightMin : 0.4,
    heightMax : 0.8,
}

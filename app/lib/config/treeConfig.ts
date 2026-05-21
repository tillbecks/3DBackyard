import * as TYPES from '../../types/typeIndex';

export const LSystem: TYPES.LSystemType = {
    axiom: "F",
    rules: {
        "F": ["SAB", "FAB"],
        "A": ["[+F]", "[-F]", "[>F]", "[<F]", "", ""],
        "B": ["[&F]", "[^F]"],
        "S": ["S"],
        "L": ["L"],
    }
};

export const LSystemGeometryConfig: TYPES.LSystemConfig = {
    pitchAngle: 25,
    pitchAngleVariance: 5,
    rollAngle: 15,
    rollAngleVariance: 5,
    initialLength: 30,
    lengthFactor: 0.90,
    initialThickness: 3,
    thicknessFactor: 0.8,
    iterations: 10,
}

export const LeafConfig = {
    widthMin : 0.4,
    widthMax : 0.8,
    depthMin : 0.4,
    depthMax : 0.8,
    heightMin : 0.2,
    heightMax : 0.8,
}

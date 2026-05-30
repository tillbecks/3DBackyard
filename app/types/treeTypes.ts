export interface LSystemType{
    axiom: string;
    rules: Record<string, string[]>;
};

export interface LSystemConfig{
    pitchAngle: number;
    pitchAngleVariance: number;
    rollAngle: number;
    rollAngleVariance: number;
    initialLength: number;
    lengthFactor: number;
    initialThickness: number;
    thicknessFactor: number;
    iterations: number;
}

export interface LeafConfig {
    widthMin : number;
    widthMax : number;
    depthMin : number;
    depthMax : number;
    heightMin : number;
    heightMax : number;
    heightSegments: number;
    widthSegments: number;
    leafColorLightnessMin: number;
    leafColorLightnessMax: number;
    scale: number;
}
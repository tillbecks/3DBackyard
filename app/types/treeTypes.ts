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
import * as TYPES from "../../../types/typeIndex";
import {generalFunctions} from "./shaderUtils";

export const grassShader: TYPES.fragmentShaderType = {
    functions: `
        uniform vec3 grassColor;
        uniform float randomNr;
    ` + generalFunctions,
main:
    `
    vec2 uv = vUv * 10.0; 
    vec2 uv1 = vUv * 100.0;
    vec2 uv2 = vUv * 1500.0;
    vec2 uv3 = vUv * 20000.0;
    float variance = noise(uv) * 0.15 + noise(uv1) * 0.1 + noise(uv2) * 0.1 + noise(uv3) * 0.1;

    diffuseColor.rgb = colorVariancer(grassColor, variance, 1.0);
    `
};

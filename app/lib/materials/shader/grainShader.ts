import * as TYPES from "@/app/types/typeIndex";

import {generalFunctions} from "./shaderUtils";

export const grainShader: TYPES.FragmentShaderType = {
    functions: `
    uniform vec3 color;
    uniform float randomNr;

    float grain_amount = 0.8;
    float grain_size = 1.0;` + generalFunctions,
main:
    `
    #if defined( USE_UV )
        vec2 walvUv = vUv ;
    #else
        vec2 walvUv = vec2(0.0); // Fallback, falls keine UV-Daten da sind
    #endif

    vec2 uvDx = dFdx(walvUv);
    vec2 uvDy = dFdy(walvUv);
    float uvChange = max(length(uvDx), length(uvDy));
    float grainMask = 1.0 - smoothstep(0.005, 0.02, uvChange);

    float n = noise(walvUv * grain_size);   // range ca. -0.5 bis +0.5
    float n2 = noise(walvUv * grain_size * 2.3 + 17.4); // zweite Oktave für mehr Charakter

    float combinedNoise = (n + n2 * 0.5) * grain_amount * grainMask;

    diffuseColor.rgb = colorVariancer(color, combinedNoise + 0.5, 0.3);
    `
};

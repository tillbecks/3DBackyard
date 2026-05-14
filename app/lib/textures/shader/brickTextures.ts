import * as TYPES from "../../../types/typeIndex";
import {generalFunctions} from "./shaderUtils";

export const brickFragmentShader: TYPES.fragmentShaderType = {
    functions: `
    uniform vec2 brickSize;
    uniform float mortarThickness;
    uniform float randomNr;
    uniform vec3 brickColor;` + generalFunctions,
main:
    `
    #if defined( USE_UV )
        vec2 walvUv = vUv ;
    #else
        vec2 walvUv = vec2(0.0); // Fallback, falls keine UV-Daten da sind
    #endif

    //vec3 brickColor = vec3(0.7, 0.3, 0.2);
    vec3 mortarColor = vec3(0.6, 0.6, 0.6);

    float offsetRows = brickSize.x / 2.0;

    float brickMortarWidth = brickSize.x + mortarThickness;
    float brickMortarHeight = brickSize.y + mortarThickness;

    float isMortarY = step(brickSize.y, mod(walvUv.y, brickMortarHeight));
    float isOdd = step(brickMortarHeight, mod(walvUv.y, brickMortarHeight * 2.0));
    float isMortarXOdd = isOdd * step(brickSize.x, mod((walvUv.x + offsetRows), brickMortarWidth));
    float isMortarXEven = (1.0 - isOdd) * step(brickSize.x, mod(walvUv.x, brickMortarWidth));

    float isMortar = max(isMortarY, max(isMortarXOdd, isMortarXEven));

    float brickXId = floor((walvUv.x - isOdd * offsetRows) / brickMortarWidth);
    float brickYId = floor(walvUv.y / brickMortarHeight);

    float variance = randCust(vec2(brickXId, brickYId));
    float varianceMortar = noise(walvUv);

    diffuseColor.rgb = mix(colorVariancer(brickColor, variance, 0.4), colorVariancer(mortarColor, varianceMortar, 0.1), isMortar);
    `
};

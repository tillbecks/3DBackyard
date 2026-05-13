import * as TYPES from "../../../types/typeIndex";

export const brickFragmentShader: TYPES.fragmentShaderType = {
    functions: `
    uniform vec2 brickSize;
    uniform float mortarThickness;
    uniform float randomNr;
    uniform vec3 brickColor;

    vec3 colorVariancer(vec3 color, float rnd, float influence){
        //to also get negative values:
        float middle_rnd = rnd - 0.5;
        return vec3(color.x+color.x*middle_rnd*influence, color.y+color.y*middle_rnd*influence, color.z+color.z*middle_rnd*influence);
    }

    float randCust(vec2 co){
        return fract(sin(dot(co, vec2(12.9898, 78.233))) * (43758.5453 + randomNr));
    }

    vec2 random2(vec2 st){
        st = vec2( dot(st,vec2(127.1,311.7)),
                dot(st,vec2(269.5,183.3)) );
        return -1.0 + 2.0*fract(sin(st)*43758.5453123 + randomNr );
    }

    // Gradient Noise by Inigo Quilez - iq/2013
    // https://www.shadertoy.com/view/XdXGW8
    // modified with 0.25
    float noise(vec2 st) {
        vec2 i = floor(st*0.25);
        vec2 f = fract(st*0.25);

        vec2 u = f*f*(3.0-2.0*f);

        return mix( mix( dot( random2(i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ),
                        dot( random2(i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
                    mix( dot( random2(i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ),
                        dot( random2(i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);
    }
`,
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
